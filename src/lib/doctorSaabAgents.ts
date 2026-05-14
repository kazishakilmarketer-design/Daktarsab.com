/**
 * DOCTOR SAAB CORE CONTROLLER
 * Local multi-agent triage system — runs without Gemini/Supabase.
 * Agents: Triage → Hospital → Insurance → DoctorDirectory
 */

import type { AiMedicalResponse, PatientContext, RecommendedDoctor } from "./aiChat";
import { analyzeSymptom } from "./AI_Engine";
import { queryDoctors } from "@/hooks/useDoctors";
import type { Database } from "@/integrations/supabase/types";
import { CANONICAL_SPECIALTY, resolveSpecialty } from "./specialtyMap";
import { normalizeLocationName } from "./locations";

import { SYMPTOM_DB } from "./symptomDb";

// ─────────────────────────────────────────────
// 1. EMERGENCY DETECTION
// ─────────────────────────────────────────────

const EMERGENCY_KEYWORDS_BN = new Set<string>();
const EMERGENCY_KEYWORDS_EN = new Set<string>();

// Build emergencies list from the symptom database (always in sync with the main triage dataset)
for (const symptom of Object.values(SYMPTOM_DB)) {
    if (symptom.severity === "emergency") {
        symptom.bengali.forEach((kw) => EMERGENCY_KEYWORDS_BN.add(kw.toLowerCase()));
        symptom.english.forEach((kw) => EMERGENCY_KEYWORDS_EN.add(kw.toLowerCase()));
    }
}

export function isEmergencyMessage(text: string): boolean {
    const lower = text.toLowerCase();
    for (const kw of EMERGENCY_KEYWORDS_EN) {
        if (kw && lower.includes(kw)) return true;
    }
    for (const kw of EMERGENCY_KEYWORDS_BN) {
        if (kw && lower.includes(kw)) return true;
    }

    // Add some positional regex as safety net
    if (/বুক(ে|ের)?\s*(তীব্র|তীক্ষ্ণ|তীক্ষ)?\s*ব্যথ/u.test(text)) return true;
    if (/সাস.*(কষ্ট|নিতে|বন্ধ)/u.test(text)) return true;
    if (/(অজ্ঞান|বেহুঁশ|জ্ঞান\s*হারা)/u.test(text)) return true;
    return false;
}

// ─────────────────────────────────────────────
// 2. SYMPTOM → SPECIALIST MAPPING (Triage Agent)
// ─────────────────────────────────────────────
interface TriageRule {
    keywords: string[];
    specialist: string;
    advice: string;
    urgency: "low" | "medium" | "high";
}

const TRIAGE_RULES: TriageRule[] = [
    {
        keywords: ["বুকে ব্যথা", "বুকের ব্যথা", "হৃদয়", "হার্ট", "heart", "buk betha", "buke betha", "buk e betha", "chest pain", "hriday"],
        // AI-1 FIX: Use CANONICAL_SPECIALTY for consistent routing
        specialist: CANONICAL_SPECIALTY.cardiology.bn,
        advice: "দ্রুত একজন কার্ডিওলজিস্ট দেখান। বিশ্রামে থাকুন এবং পানি পান করুন।",
        urgency: "high",
    },
    {
        keywords: ["জ্বর", "তাপমাত্রা", "fever", "কাশি", "সর্দি", "ঠান্ডা", "jor", "jor ache", "tapp", "tap", "kaashi", "kashi", "sordi"],
        specialist: CANONICAL_SPECIALTY.general_medicine.bn,
        advice: "প্রচুর পানি পান করুন, বিশ্রামে থাকুন। প্যারাসিটামল নিতে পারেন।",
        urgency: "low",
    },
    {
        keywords: ["পেটে ব্যথা", "পেটের সমস্যা", "বমি", "ডায়রিয়া", "পাতলা পায়খানা", "গ্যাসের সমস্যা", "acidity", "gas",
            "pet betha", "pet e betha", "pet korche", "bomi", "bomi bomi", "bomi vab", "bomi bomi vab", "bomi korche",
            "stomach pain", "stomach ache", "nausea", "vomiting", "diarrhea", "loose motion",
            "pet er shomossha", "pett", "pet"],
        specialist: CANONICAL_SPECIALTY.gastroenterology.bn,
        advice: "স্যালাইন পান করুন, তৈলাক্ত খাবার এড়িয়ে চলুন।",
        urgency: "medium",
    },
    {
        keywords: ["মাথাব্যথা", "মাথা ঘুরা", "মাথা ঘোরা", "মাথায় ব্যথা", "matha betha", "matha bytha", "mathay betha",
            "matha gyora", "matha ghura", "headache", "head pain", "head ache", "dizzy", "dizziness"],
        specialist: CANONICAL_SPECIALTY.neurology.bn,
        advice: "অন্ধকার ও শান্ত ঘরে বিশ্রাম নিন। স্ক্রিন থেকে দূরে থাকুন।",
        urgency: "medium",
    },
    {
        keywords: ["ডায়াবেটিস", "সুগার", "রক্তে শর্করা", "insulin", "ইনসুলিন", "sugar", "blood sugar", "diabetes"],
        specialist: CANONICAL_SPECIALTY.endocrinology.bn,
        advice: "নিয়মিত ওষুধ খান, মিষ্টি জাতীয় খাবার সীমিত করুন।",
        urgency: "medium",
    },
    {
        keywords: ["শ্বাসকষ্ট", "শ্বাস নিতে", "হাঁপানি", "asthma", "ফুসফুস", "shash", "shash kosto", "shwas koshto",
            "breathing problem", "shortness of breath", "breath", "hasha"],
        specialist: CANONICAL_SPECIALTY.pulmonology.bn,
        advice: "সরাসরি বায়ু চলাচল করুন, শ্বাসের ওষুধ থাকলে ব্যবহার করুন।",
        urgency: "high",
    },
    {
        keywords: ["চোখে", "চোখের", "দৃষ্টি", "eye", "vision", "chokkhe", "chokh", "chokhe betha"],
        specialist: CANONICAL_SPECIALTY.ophthalmology.bn,
        advice: "চোখ ঘষবেন না, পরিষ্কার পানি দিয়ে ধুয়ে নিন।",
        urgency: "medium",
    },
    {
        keywords: ["দাঁতে", "দাঁতের", "দাঁত ব্যথা", "মাড়ি", "tooth", "dental", "dat betha", "daant betha", "toothache"],
        specialist: CANONICAL_SPECIALTY.dentistry.bn,
        advice: "লবণ পানি দিয়ে কুলকুচি করুন। ব্যথা তীব্র হলে ডাক্তার দেখান।",
        urgency: "low",
    },
    {
        keywords: ["গর্ভাবস্থা", "গর্ভবতী", "প্রসব", "শিশু", "সন্তান", "pregnant", "pregnancy", "gorbha", "gorboboti", "পিরিয়ড", "মাসিক", "পিরিয়ড", "mens", "period", "menstrual"],
        specialist: CANONICAL_SPECIALTY.gynecology.bn,
        advice: "নিয়মিত চেকআপ করুন। বিশ্রামে থাকুন এবং পুষ্টিকর খাবার খান।",
        urgency: "medium",
    },
    {
        keywords: ["চর্মরোগ", "ত্বক", "চুলকানি", "র‌্যাশ", "skin", "rash", "cholkani", "chulkani", "ghaa", "gha"],
        specialist: CANONICAL_SPECIALTY.dermatology.bn,
        advice: "আক্রান্ত স্থান পরিষ্কার রাখুন। সুগন্ধি সাবান এড়িয়ে চলুন।",
        urgency: "low",
    },
    {
        keywords: ["হাড়", "জয়েন্ট", "হাঁটু", "কোমর", "মেরুদণ্ড", "bone", "joint", "had", "gonta", "ghuta", "komor",
            "back pain", "joint pain", "knee pain", "hip pain"],
        specialist: CANONICAL_SPECIALTY.orthopedics.bn,
        advice: "আক্রান্ত অঙ্গ বিশ্রামে রাখুন। ভারী জিনিস তুলবেন না।",
        urgency: "medium",
    },
    {
        keywords: ["কিডনি", "মূত্র", "প্রস্রাব", "পেশাব", "kidney", "urine", "proshrab", "peshab", "pros rab"],
        specialist: CANONICAL_SPECIALTY.nephrology.bn,
        advice: "প্রচুর পানি পান করুন। লবণ কম খান।",
        urgency: "medium",
    },
    {
        keywords: ["মানসিক", "দুশ্চিন্তা", "ঘুম", "বিষণ্নতা", "উদ্বেগ", "depression", "anxiety", "stress",
            "tension", "chinta", "dushchinta", "ghum nai", "ghum hocche na"],
        specialist: CANONICAL_SPECIALTY.psychiatry.bn,
        advice: "গভীর শ্বাস নিন। নিকটজনের সাথে কথা বলুন। একাই থাকবেন না।",
        urgency: "medium",
    },
    {
        keywords: ["শিশু", "বাচ্চা", "নবজাতক", "child", "baby", "পেডিয়াট্রিক", "bacha", "bachha", "chhele", "meye"],
        specialist: CANONICAL_SPECIALTY.pediatrics.bn,
        advice: "শিশুকে আরামদায়ক পরিবেশে রাখুন। শিশু চিকিৎসক দেখান।",
        urgency: "medium",
    },
];

// ─────────────────────────────────────────────
// SYMPTOM SCORING — avoids wrong-specialist matches
// Score every rule by keyword hits; return highest-scoring rule.
// ─────────────────────────────────────────────
function triageSymptoms(message: string): TriageRule {
    const lower = message.toLowerCase();
    let bestRule: TriageRule | null = null;
    let bestScore = 0;

    for (const rule of TRIAGE_RULES) {
        const score = rule.keywords.reduce((acc, kw) => {
            const kwLower = kw.toLowerCase();
            // Exact phrase match scores higher than partial
            if (lower.includes(kwLower)) return acc + (kwLower.length > 4 ? 3 : 1);
            return acc;
        }, 0);
        if (score > bestScore) {
            bestScore = score;
            bestRule = rule;
        }
    }

    // If no keyword matched, build a smart fallback from clues in the message
    if (!bestRule || bestScore === 0) {
        // Attempt to guess from partial words
        if (/বেদন|ache|pain|betha|bytha|korche/.test(lower)) {
            return {
                keywords: [],
                specialist: "মেডিসিন বিশেষজ্ঞ (জেনারেল ফিজিশিয়ান)",
                advice: "আপনার বর্ণিত ব্যথার জন্য প্রাথমিকভাবে একজন মেডিসিন বিশেষজ্ঞকে দেখান। প্রয়োজনে তিনি সংশ্লিষ্ট বিশেষজ্ঞের কাছে পাঠাবেন। বিশ্রামে থাকুন এবং ব্যথানাশক অতিরিক্ত সেবন এড়িয়ে চলুন।",
                urgency: "medium",
            };
        }
        return {
            keywords: [],
            specialist: "মেডিসিন বিশেষজ্ঞ (জেনারেল ফিজিশিয়ান)",
            advice: "আপনার সমস্যার বিবরণ শুনে মনে হচ্ছে একজন জেনারেল ফিজিশিয়ানের পরামর্শ নেওয়া উচিত। প্রচুর বিশ্রাম নিন ও পানি পান করুন। দ্রুত অবস্থার অবনতি হলে অবিলম্বে হাসপাতালে যান।",
            urgency: "low",
        };
    }

    return bestRule;
}

// ─────────────────────────────────────────────
// 3. INSURANCE / COST AGENT
// ─────────────────────────────────────────────
export function estimateCost(tests: string[], monthlyIncome: number): { name: string; estimatedCost: string }[] {
    const tier = monthlyIncome < 15000 ? "বাজেট" : monthlyIncome < 40000 ? "মধ্যম" : "প্রিমিয়াম";

    const costMap: Record<string, Record<string, string>> = {
        "Complete Blood Count (CBC)": { "বাজেট": "৳৩০০-৫০০", "মধ্যম": "৳৫০০-৮০০", "প্রিমিয়াম": "৳৮০০-১২০০" },
        "ECG": { "বাজেট": "৳৩০০-৫০০", "মধ্যম": "৳৫০০-৮০০", "প্রিমিয়াম": "৳৮০০-১৫০০" },
        "Chest X-Ray": { "বাজেট": "৳৪০০-৭০০", "মধ্যম": "৳৭০০-১২০০", "প্রিমিয়াম": "৳১২০০-২০০০" },
        "Blood Sugar Test": { "বাজেট": "৳১৫০-৩০০", "মধ্যম": "৳৩০০-৫০০", "প্রিমিয়াম": "৳৫০০-৮০০" },
        "Urine Routine Exam": { "বাজেট": "৳১৫০-২৫০", "মধ্যম": "৳২৫০-৪০০", "প্রিমিয়াম": "৳৪০০-৭০০" },
        "Ultrasound Abdomen (USG)": { "বাজেট": "৳৬০০-৯০০", "মধ্যম": "৳৯০০-১৫০০", "প্রিমিয়াম": "৳১৫০০-৩০০০" },
        "Stool Routine Exam (R/E)": { "বাজেট": "৳১৫০-২৫০", "মধ্যম": "৳২৫০-৪০০", "প্রিমিয়াম": "৳৪০০-৭০০" },
        "Upper Endoscopy (OGD)": { "বাজেট": "৳২০০০-৩০০০", "মধ্যম": "৳০০০-৫০০০", "প্রিমিয়াম": "৳৫০০০-১০০০০" },
        "Liver Function Test (LFT)": { "বাজেট": "৳৪০০-৭০০", "মধ্যম": "৳৭০০-১২০০", "প্রিমিয়াম": "৳১২০০-২০০০" },
        "Thyroid Test (TSH)": { "বাজেট": "৳৩০০-৫০০", "মধ্যম": "৳৫০০-৮০০", "প্রিমিয়াম": "৳৮০০-১৫০০" },
        "Echocardiogram": { "বাজেট": "৳২০০০-৩০০০", "মধ্যম": "৳৩০০০-৫০০০", "প্রিমিয়াম": "৳৫০০০-১০০০০" },
        "Serum Creatinine": { "বাজেট": "৳২০০-৩৫০", "মধ্যম": "৳৩৫০-৬০০", "প্রিমিয়াম": "৳৬০০-১০০০" },
        "Uric Acid Test": { "বাজেট": "৳২০০-৩৫০", "মধ্যম": "৳৩৫০-৫০০", "প্রিমিয়াম": "৳৫০০-৮০০" },
        "MRI Brain": { "বাজেট": "৳৪০০০-৬০০০", "মধ্যম": "৳৬০০০-১০০০০", "প্রিমিয়াম": "৳১০০০০-২০০০০" },
        "Blood Pressure Monitoring": { "বাজেট": "৳৫০-১০০", "মধ্যম": "৳১০০-২০০", "প্রিমিয়াম": "৳২০০-৪০০" },
        "Skin Patch Test / Allergy": { "বাজেট": "৳৫০০-৮০০", "মধ্যম": "৳৮০০-১৫০০", "প্রিমিয়াম": "৳১৫০০-৩০০০" },
        "Dengue NS1 Antigen": { "বাজেট": "৳৪০০-৭০০", "মধ্যম": "৳৭০০-১২০০", "প্রিমিয়াম": "৳১২০০-২০০০" },
        "Typhoid Test (Widal)": { "বাজেট": "৳২০০-৩০০", "মধ্যম": "৳৩০০-৫০০", "প্রিমিয়াম": "৳৫০০-৮০০" },
        "Eye Examination": { "বাজেট": "৳৩০০-৫০০", "মধ্যম": "৳৫০০-১০০০", "প্রিমিয়াম": "৳১০০০-২০০০" },
        "X-Ray Joint / Bone": { "বাজেট": "৳৪০০-৭০০", "মধ্যম": "৳৭০০-১২০০", "প্রিমিয়াম": "৳১২০০-২০০০" },
        "Dental X-Ray / OPG": { "বাজেট": "৳৫০০-৮০০", "মধ্যম": "৳৮০০-১৫০০", "প্রিমিয়াম": "৳১৫০০-৩০০০" },
    };

    return tests.map((test) => ({
        name: test,
        estimatedCost: (costMap[test]?.[tier]) ?? "৳৩০০-৮০০ (আনুমানিক)",
    }));
}

export function suggestTests(specialist: string): string[] {
    if (specialist.includes("কার্ডিও") || specialist.includes("হৃদ")) {
        return ["ECG", "Echocardiogram", "Blood Pressure Monitoring", "Complete Blood Count (CBC)"];
    }
    if (specialist.includes("ডায়াবেটিস") || specialist.includes("এন্ডোক্রাইন")) {
        return ["Blood Sugar Test", "Thyroid Test (TSH)", "Complete Blood Count (CBC)"];
    }
    if (specialist.includes("গ্যাস্ট্রো") || specialist.includes("পেট")) {
        return ["Ultrasound Abdomen (USG)", "Upper Endoscopy (OGD)", "Stool Routine Exam (R/E)", "Liver Function Test (LFT)"];
    }
    if (specialist.includes("পালমো") || specialist.includes("ফুসফুস")) {
        return ["Chest X-Ray", "Complete Blood Count (CBC)", "Typhoid Test (Widal)"];
    }
    if (specialist.includes("কিডনি") || specialist.includes("নেফ")) {
        return ["Serum Creatinine", "Uric Acid Test", "Urine Routine Exam", "Ultrasound Abdomen (USG)"];
    }
    if (specialist.includes("নিউরো") || specialist.includes("স্নায়ু")) {
        return ["MRI Brain", "Blood Pressure Monitoring", "Complete Blood Count (CBC)"];
    }
    if (specialist.includes("চর্ম") || specialist.includes("ডার্ম")) {
        return ["Skin Patch Test / Allergy", "Complete Blood Count (CBC)"];
    }
    if (specialist.includes("চক্ষু") || specialist.includes("অফথাল")) {
        return ["Eye Examination"];
    }
    if (specialist.includes("দন্ত") || specialist.includes("ডেন্ট")) {
        return ["Dental X-Ray / OPG"];
    }
    if (specialist.includes("অর্থোপেড") || specialist.includes("হাড়")) {
        return ["X-Ray Joint / Bone", "Complete Blood Count (CBC)"];
    }
    if (specialist.includes("মেডিসিন") || specialist.includes("ফিজিশিয়ান")) {
        return ["Complete Blood Count (CBC)", "Blood Sugar Test", "Dengue NS1 Antigen", "Typhoid Test (Widal)"];
    }
    return ["Complete Blood Count (CBC)", "Blood Sugar Test"];
}


// ─────────────────────────────────────────────
import { supabase } from "@/integrations/supabase/client";

// ─────────────────────────────────────────────
// 4. SUPABASE HOSPITAL LOADER (for agent responses)
// ─────────────────────────────────────────────
export async function findHospitalsByLocation(
    district: string,
    upazila?: string,
    limit = 3
): Promise<{ name: string; type: string; location: string; phone?: string }[]> {
    // LOC-2 FIX: Normalize names to handle spelling variations
    const districtNorm = normalizeLocationName(district);
    const upazilaNorm = normalizeLocationName(upazila);

    try {
        // Strict Local Match: Only return hospitals that match the exact district and (optional) upazila.
        let query = supabase.from('hospitals').select('*').limit(limit);

        if (districtNorm) {
            query = query.ilike('district', `%${districtNorm}%`);
        }
        if (upazilaNorm) {
            query = query.ilike('upazila', `%${upazilaNorm}%`);
        }

        const { data, error } = (await query) as {
            data: Database["public"]["Tables"]["hospitals"]["Row"][] | null;
            error: any;
        };

        if (!error && data && data.length > 0) {
            return data.map((h) => ({
                name: h.name,
                type: h.type || "বেসরকারি",
                location: `${h.upazila || ""}${h.upazila && h.district ? ", " : ""}${h.district || ""}`,
                phone: h.phone || undefined,
            }));
        }

        // LOC-5 FIX: District-only fallback.
        // If they asked for a specific upazila but we found 0 hospitals there, 
        // try searching just the district instead of failing completely.
        if (upazilaNorm && districtNorm && (!data || data.length === 0)) {
            console.log(`[LocationAgent] No hospitals in upazila ${upazilaNorm}, falling back to district ${districtNorm}`);
            const fallbackQuery = supabase.from('hospitals')
                .select('*')
                .ilike('district', `%${districtNorm}%`)
                .limit(limit);

            const { data: fallbackData, error: fallbackError } = (await fallbackQuery) as {
                data: Database["public"]["Tables"]["hospitals"]["Row"][] | null;
                error: any;
            };

            if (!fallbackError && fallbackData && fallbackData.length > 0) {
                return fallbackData.map((h) => ({
                    name: h.name,
                    type: h.type || "বেসরকারি",
                    location: `${h.upazila || ""}${h.upazila && h.district ? ", " : ""}${h.district || ""}`,
                    phone: h.phone || undefined,
                }));
            }
        }
    } catch (e) {
        console.warn("Failed to fetch hospitals from Supabase:", e);
    }

    // No fallback to Dhaka to ensure strict location routing.
    return [];
}

// ─────────────────────────────────────────────
// 5. MAIN ORCHESTRATOR — builds AiMedicalResponse
// ─────────────────────────────────────────────
export async function runDoctorSaabAgents(
    message: string,
    context: PatientContext,
    doctors: RecommendedDoctor[] = []
): Promise<AiMedicalResponse> {
    const emergency = isEmergencyMessage(message);

    if (emergency) {
        // AI-2 FIX: Fetch real hospitals by patient location instead of hardcoding Dhaka.
        const emergencyHospitals = await findHospitalsByLocation(context.location || "", context.upazila, 2);
        return {
            isEmergency: true,
            emergencyWarning:
                "🚨 এটি একটি জরুরি স্বাস্থ্য পরিস্থিতি! অবিলম্বে ৯৯৯ নম্বরে কল করুন অথবা নিকটস্থ হাসপাতালের জরুরি বিভাগে যান।",
            condition: "জরুরি অবস্থা",
            immediateAdvice: "রোগীকে শুইয়ে দিন, শান্ত রাখুন। যতক্ষণ সম্ভব নাড়াচাড়া করাবেন না।",
            specialistNeeded: CANONICAL_SPECIALTY.emergency.bn,
            specialistReason: "জরুরি অবস্থায় তাৎক্ষণিক চিকিৎসা প্রয়োজন।",
            hospitals: emergencyHospitals,
            tests: [{ name: "ECG", estimatedCost: "৳৩০০-৫০০ (জরুরি)" }],
            followUp: "জরুরি চিকিৎসার পরে কার্ডিওলজিস্টের সাথে ফলো-আপ করুন।",
            recommendedDoctors: doctors,
            bookingTrigger: "ambulance",
        };
    }

    const analysis = analyzeSymptom(message, context);
    const testNames = suggestTests(analysis.recommendedSpecialty || "General Medicine (সাধারণ মেডিসিন)");
    const tests = estimateCost(testNames, context.monthlyIncome);
    const hospitals = await findHospitalsByLocation(context.location || "", context.upazila);

    // Fetch doctors directly from Supabase cache using the triaged specialist
    const rawDoctors = await queryDoctors(analysis.recommendedSpecialty || "General Medicine (সাধারণ মেডিসিন)", context.location || "");
    
    // AI-3 FIX: No Math.random() — use only real DB data. Omit fields if not in DB.
    const recommendedDoctors: RecommendedDoctor[] = rawDoctors.map(doc => ({
      ...doc,
      rating: doc.rating ?? undefined,
      reviewCount: doc.reviewCount ?? undefined,
      fee: doc.fee ?? undefined,
      experience: doc.experience ?? undefined,
      availability: doc.availability || "সময়সূচী জানতে কল করুন",
      tags: doc.tags || ["MBBS"],
    }));

    const urgencyLabel =
        analysis.severity === "emergency" ? "⚠️ উচ্চ — দ্রুত ডাক্তার দেখান" :
            analysis.severity === "moderate" ? "⚠️ মধ্যম — ২-৩ দিনের মধ্যে দেখান" :
                "✅ সাধারণ — সুবিধামত দেখান";

    return {
        isEmergency: false,
        emergencyWarning: null,
        condition: analysis.primarySymptom ? `সম্ভাব্য সমস্যা: ${analysis.primarySymptom}` : "সাধারণ পরামর্শ",
        immediateAdvice: `আপনার লক্ষণগুলো বিশ্লেষণ করে মনে হচ্ছে এটি ${analysis.recommendedSpecialty || "সাধারণ মেডিসিন"} সংক্রান্ত সমস্যা হতে পারে। ${analysis.routingAdvice}\n\nজরুরী মাত্রা: ${urgencyLabel}`,
        specialistNeeded: analysis.recommendedSpecialty || "সাধারণ মেডিসিন",
        specialistReason: `আপনার উল্লেখিত লক্ষণগুলো (যেমন: ${analysis.patientSummary}) অনুযায়ী ${analysis.recommendedSpecialty || "সাধারণ মেডিসিন"} এর পরামর্শ নেওয়া সবচেয়ে নিরাপদ।`,
        patientSummary: analysis.patientSummary,
        severity: analysis.severity,
        hospitals,
        tests,
        followUp: "পরীক্ষার রিপোর্টগুলো সংগ্রহ করে ডাক্তারের কাছে নিয়ে যান। আপাতত পর্যাপ্ত বিশ্রাম নিন।",
        recommendedDoctors: recommendedDoctors.length > 0 ? recommendedDoctors : undefined,
        bookingTrigger: analysis.bookingTrigger || (tests.length > 0 ? "diagnostic" : "clinic"),
    };
}
