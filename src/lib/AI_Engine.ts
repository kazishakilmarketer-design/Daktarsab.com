import { PatientContext } from "./aiChat";
import { SYMPTOM_DB, type SymptomMapping, type SeverityLevel } from "./symptomDb";
import { resolveSpecialty, CANONICAL_SPECIALTY } from "./specialtyMap";
import { supabase } from "@/integrations/supabase/client";

export interface EngineResult {
  isEmergency: boolean;
  severity: SeverityLevel;
  primarySymptom: string | null;
  recommendedSpecialty: string | null;
  routingAdvice: string;
  patientSummary: string;
  bookingTrigger: "ambulance" | "hospital" | "clinic" | "diagnostic" | null;
}

/**
 * AI Brain v2 Core Engine - DaktarSab
 * 1. Analyzes the input text against the expanded symptom database
 * 2. Determines severity (Mild, Moderate, Emergency)
 * 3. Incorporates duration rules
 * 4. Generates empathetic advice and patient summary
 */
export function analyzeSymptom(inputText: string, context: PatientContext): EngineResult {
  const text = inputText.toLowerCase();

  function normalizeForMatching(str: string) {
    return str
      .toLowerCase()
      // Remove punctuation and symbols
      .replace(/[\u2000-\u206F\u2E00-\u2E7F\p{P}]/gu, " ")
      // Remove Bangla vowel signs and diacritics for more robust matching (e.g., বুকে vs বুক)
      .replace(/[\u09BE-\u09CC\u0981-\u0983\u09CD]/g, "")
      .replace(/\s+/g, " ")
      .trim();
  }

  const normalizedText = normalizeForMatching(text);

  let detectedSeverity: SeverityLevel = "unknown";
  let primaryCategory: string | null = null;
  let specialty: string | null = null;
  let matchedSymptomBN: string | null = null;
  let bestScore = 0;

  // 1. Keyword Matching & Triage Classification (500+ symptom list)
  for (const [category, data] of Object.entries(SYMPTOM_DB)) {
    const keywords = [...data.bengali, ...data.english];
    let score = 0;
    let bestMatchedBn: string | null = null;

    for (const keyword of keywords) {
      const kw = normalizeForMatching(keyword);
      if (!kw) continue;
      if (normalizedText === kw) {
        score += 100;
        if (data.bengali.includes(keyword)) bestMatchedBn = keyword;
        continue;
      }
      if (normalizedText.includes(kw)) {
        // Longer keywords are more specific
        const lengthScore = Math.min(20, kw.length);
        score += lengthScore;
        if (data.bengali.includes(keyword)) bestMatchedBn = keyword;
      }
    }

    if (score === 0) continue;

    // Promote emergency matches strongly
    if (data.severity === "emergency") score += 50;

    if (score > bestScore) {
      bestScore = score;
      detectedSeverity = data.severity;
      primaryCategory = category;
      // AI-1 FIX: Resolve to canonical specialty name (single source of truth)
      specialty = resolveSpecialty(data.specialty).bn;
      matchedSymptomBN = bestMatchedBn || data.bengali[0] || null;
    }
  }

  // AI-5 FIX: Emergency keyword heuristics with INTENSITY qualifier.
  // Mild breathlessness alone must NOT trigger emergency.
  // Emergency fires only if ≥ 2 pattern matches OR bestScore already qualifies.
  if (detectedSeverity !== "emergency") {
    const emergencyPatterns = [
      /\b(জরুরি|জরূরী|জরুরী)\b/u,
      // Chest pain MUST be described as severe/intense, not just any chest sensation
      /\b(বুকে|বুকের)\s*(তীব্র|তীক্ষ্ণ|তীর্যক|জ্বলন্ত|চাপ|অসহ্য)\s*ব্যথা\b/u,
      // Breathing MUST be severely compromised ("cannot breathe" not just "slight difficulty")
      /\b(শ্বাস বন্ধ|শ্বাস নিতে পারছি না|শ্বাস নেওয়া অসম্ভব|শ্বাস আটকে)\b/u,
      /\b(অজ্ঞান|বেহুঁশ|জ্ঞান হারানো)\b/u,
      /\b(রক্তক্ষরণ|রক্তপাত|সন্ত্রাসজনক রক্তপাত)\b/u,
      /\b(হার্ট অ্যাটাক|স্ট্রোক|হঠাৎ অজ্ঞান)\b/u,
    ];
    const matchCount = emergencyPatterns.filter((re) => re.test(text)).length;
    // Threshold: ≥ 2 signals, OR score is already very high from DB match
    if (matchCount >= 2 || (matchCount === 1 && bestScore >= 70)) {
      detectedSeverity = "emergency";
      if (!primaryCategory) {
        primaryCategory = "emergency_symptoms";
        // AI-1 FIX: Use canonical specialty for emergency
        specialty = CANONICAL_SPECIALTY.emergency.bn;
        matchedSymptomBN = "জরুরি লক্ষণ";
      }
    }
  }

  // 2. Duration / Chronic Overrides
  const durationMatch = text.match(/([0-9০-৯]+)\s*(দিন|মাস|বছর|days|months|years)/);
  if (durationMatch && detectedSeverity === "mild") {
    const amount = parseInt(durationMatch[1].replace(/[০-৯]/g, d => String.fromCharCode(d.charCodeAt(0) - 2534)));
    const unit = durationMatch[2];
    
    if ((unit.includes("দিন") || unit.includes("day")) && amount >= 4) {
      detectedSeverity = "moderate";
    } else if (unit.includes("মাস") || unit.includes("month") || unit.includes("বছর") || unit.includes("year")) {
      detectedSeverity = "moderate";
    }
  }

  // Fallback defaults — AI-1 FIX: use canonical specialty
  if (detectedSeverity === "unknown") {
    if (bestScore === 0) {
      // Conversational fallback (e.g. "hello", "hi")
      const result: EngineResult = {
        isEmergency: false,
        severity: "unknown",
        primarySymptom: null,
        recommendedSpecialty: "", // Empty prevents orchestrator from showing CostCard
        routingAdvice: "আসসালামু আলাইকুম! আমি ডাক্তার সাব এআই। আপনার কী সমস্যা হচ্ছে, দয়া করে বিস্তারিতভাবে বলুন।",
        patientSummary: "",
        bookingTrigger: null
      };
      logSymptomTriage(inputText, result, bestScore);
      return result;
    }
    detectedSeverity = "mild";
    specialty = CANONICAL_SPECIALTY.general_medicine.bn;
    matchedSymptomBN = "সাধারণ শারীরিক সমস্যা";
  }

  // 3. Patient Summary (রোগীর সমস্যা)
  const patientSummary = matchedSymptomBN ? matchedSymptomBN : "আপনার বর্ণিত লক্ষণসমূহ";

  // 4. Routing Logic (Cost & Location Aware) with DaktarSab Persona
  const isLowIncome = context.monthlyIncome < 15000 || context.treatmentTier === "low";
  let routingAdvice = "";
  let trigger: EngineResult["bookingTrigger"] = null;

  if (detectedSeverity === "emergency") {
    routingAdvice = `🚨 আসসালামু আলাইকুম, আমি ডাক্তার সাব বলছি। আপনার লক্ষণগুলো (যেমন: ${patientSummary}) খুবই জরুরি এবং জীবন সংশয় হতে পারে। দয়া করে একটুও দেরি না করে দ্রুত নিকটস্থ হাসপাতালের ইমার্জেন্সি বিভাগে অথবা সরকারি মেডিকেল কলেজ হাসপাতালে যোগাযোগ করুন। আমরা আপনার জন্য অ্যাম্বুলেন্স ডাকতে পারি।`;
    trigger = "ambulance";
  } else if (detectedSeverity === "moderate") {
    if (isLowIncome) {
      routingAdvice = `আসসালামু আলাইকুম, আমি ডাক্তার সাব। আপনার সমস্যাটি (${patientSummary}) অবহেলা করবেন না। আমি পরামর্শ দিব আপনি আপনার জেলা বা উপজেলার সরকারি হাসপাতালে গিয়ে একজন ${specialty} বিশেষজ্ঞ দেখান। সরকারি হাসপাতালে আপনি স্বল্প খরচে ভালো চিকিৎসা পাবেন।`;
    } else {
      routingAdvice = `আসসালামু আলাইকুম, আমি ডাক্তার সাব। আপনার সমস্যাটি (${patientSummary}) বিশদভাবে পরীক্ষা করা প্রয়োজন। আমি আপনাকে একজন দক্ষ ${specialty} বিশেষজ্ঞের সাথে দ্রুত পরামর্শ করার অনুরোধ করছি। আপনার এলাকার ভালো কোনো প্রাইভেট চেম্বার বা ক্লিনিকে সিরিয়াল নিতে পারেন।`;
    }
    trigger = "clinic";
  } else {
    // Mild
    routingAdvice = `আসসালামু আলাইকুম, আমি ডাক্তার সাব। আপনার ভয়ের কিছু নেই, আপনার লক্ষণগুলো (${patientSummary}) প্রাথমিক পর্যায়ের মনে হচ্ছে। আপনি পর্যাপ্ত বিশ্রাম নিন এবং প্রয়োজনে একজন সাধারণ মেডিসিন বিশেষজ্ঞের পরামর্শ নিতে পারেন। আপনার দ্রুত সুস্থতা কামনা করছি।`;
    trigger = null;
  }

  const result: EngineResult = {
    isEmergency: detectedSeverity === "emergency",
    severity: detectedSeverity,
    primarySymptom: primaryCategory,
    recommendedSpecialty: specialty,
    routingAdvice,
    patientSummary,
    bookingTrigger: trigger
  };

  // Fire-and-forget: log triage decision to symptom_logs for analytics
  logSymptomTriage(inputText, result, bestScore);

  return result;
}

/**
 * Logs each AI triage decision to the symptom_logs table.
 * Fire-and-forget — never blocks the main triage flow.
 */
async function logSymptomTriage(rawMessage: string, result: EngineResult, score: number) {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    await (supabase as any).from("symptom_logs").insert({
      user_id: user?.id || null,
      raw_message: rawMessage.slice(0, 500),
      detected_severity: result.severity,
      detected_specialty: result.recommendedSpecialty,
      engine_score: score,
      gemini_used: false,
      session_id: null,
    });
  } catch (e) {
    // Silent — logging must never break the user experience
    console.debug("[AI_Engine] symptom_logs insert failed:", e);
  }
}
