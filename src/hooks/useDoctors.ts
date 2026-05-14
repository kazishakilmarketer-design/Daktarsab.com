/**
 * useDoctors — Loads and queries the doctors directory from Supabase.
 * Usage: const { queryDoctors } = useDoctors();
 */
import { useState, useEffect, useRef } from "react";
import type { RecommendedDoctor } from "@/lib/aiChat";
import { supabase } from "@/integrations/supabase/client";

interface RawDoctor {
    name: string;
    qualification: string;
    specialization: string;
    designation: string;
    chamber: string;
    division: string;
    imageUrl: string;
    profileUrl: string;
}

// Module-level cache so we only fetch once across all hook instances
let _cache: RawDoctor[] | null = null;
let _loading = false;
const _listeners: Array<(docs: RawDoctor[]) => void> = [];

async function fetchDoctors(): Promise<RawDoctor[]> {
    if (_cache) return _cache;

    if (_loading) {
        // Wait for the in-flight request
        return new Promise((resolve) => {
            _listeners.push(resolve);
        });
    }

    _loading = true;
    try {
        const { data, error } = await supabase
            .from('doctors')
            .select('*')
            .limit(3000);

        if (error) {
            throw error;
        }

        const docs: RawDoctor[] = (data || []).map((row) => ({
            name: row.doctor_name || "",
            qualification: row.qualification || "",
            specialization: row.specialization || "",
            designation: row.designation || "",
            chamber: row.chamber || "",
            division: row.division || "",
            imageUrl: row.image_url || "",
            profileUrl: row.profile_url || "",
        })).filter((d) => d.name && d.specialization);

        _cache = docs;
        _loading = false;
        _listeners.forEach((cb) => cb(docs));
        _listeners.length = 0;
        return docs;
    } catch (e) {
        console.warn("useDoctors: failed to load from Supabase", e);
        _loading = false;
        _cache = [];
        return [];
    }
}

// ─── Matching logic ────────────────────────────────────────────────────────

const SPECIALIZATION_ALIASES: Record<string, string[]> = {
    "কার্ডিওলজিস্ট": ["cardio", "heart", "হৃদ", "cardiolog"],
    "গাইনোকোলজিস্ট": ["gynec", "gynaec", "obstet", "গাইনো", "প্রসূতি"],
    "মেডিসিন": ["medicine", "physician", "internal", "জেনারেল", "general"],
    "ডার্মাটোলজিস্ট": ["derma", "skin", "চর্ম"],
    "নিউরোলজিস্ট": ["neurol", "স্নায়ু", "brain", "মস্তিষ্ক"],
    "পেডিয়াট্রিশিয়ান": ["pediatr", "paediatr", "শিশু", "child"],
    "অর্থোপেডিক": ["orthop", "bone", "হাড়", "joint"],
    "গ্যাস্ট্রো": ["gastro", "liver", "পেট", "abdomen", "hepat", "digest"],
    "নেফ্রোলজিস্ট": ["nephro", "kidney", "কিডনি"],
    "পালমোনোলজিস্ট": ["pulmo", "lung", "chest", "ফুসফুস", "respiratory"],
    "মনোরোগ": ["psychiat", "mental", "মানসিক"],
    "চক্ষু": ["ophtha", "eye", "চোখ", "vision"],
    "ডেন্টিস্ট": ["dental", "dent", "দাঁত", "tooth"],
    "এন্ডোক্রাইন": ["endocri", "diabetes", "thyroid", "ডায়াবেটিস"],
    "রহমাতোলজি": ["rheuma", "arthrit", "autoimmune"],
    "ইউরোলজি": ["urology", "urol", "মূত্র", "prostate"],
    "ওনকোলজি": ["oncol", "cancer", "ক্যানসার"],
};

// Forbidden specialist families for each symptom category.
// Prevents stomach pain from ever returning ENT/Neuro/Eye doctors.
const SPECIALTY_EXCLUSIONS: Record<string, string[]> = {
    "গ্যাস্ট্রো": ["neuro", "neurol", "ophtha", "eye", "dent", "psychiat", "chest",
        "cardio", "pulmo", "lung", "orthop", "bone", "ear", "ent", "nose"],
    "কার্ডিও": ["gastro", "ophtha", "eye", "dent", "psychiat", "orthop", "bone"],
    "নিউরো": ["gastro", "ophtha", "cardio", "dent", "orthop", "bone", "pulmo"],
    "চক্ষু": ["gastro", "cardio", "neuro", "dent", "orthop", "bone", "pulmo"],
    "ডেন্ট": ["gastro", "cardio", "neuro", "ophtha", "orthop", "pulmo"],
    "পালমোনো": ["gastro", "ophtha", "dent", "orthop", "neuro"],
    "অর্থো": ["gastro", "ophtha", "cardio", "neuro", "dent", "pulmo"],
};

// Determine which exclusion group applies to the queried specialist
function getExclusionList(specialistKeyword: string): string[] {
    const lower = specialistKeyword.toLowerCase();
    for (const [group, excluded] of Object.entries(SPECIALTY_EXCLUSIONS)) {
        if (lower.includes(group)) return excluded;
    }
    return [];
}

function scoreDoctor(doc: RawDoctor, specialistKeyword: string, district: string): number {
    let score = 0;
    const specLower = specialistKeyword.toLowerCase();
    const docSpec = doc.specialization.toLowerCase();
    const docDiv = (doc.division || "").toLowerCase();
    const docChamber = (doc.chamber || "").toLowerCase();

    // ─ Hard exclusion: never score a doctor whose specialty is forbidden for this query
    const excluded = getExclusionList(specLower);
    if (excluded.some((ex) => docSpec.includes(ex))) return -1;

    // ─ Find which alias group the queried specialist belongs to
    let matchingAliases: string[] = [];
    for (const [, aliases] of Object.entries(SPECIALIZATION_ALIASES)) {
        if (aliases.some((a) => specLower.includes(a)) || specLower.includes(Object.keys(SPECIALIZATION_ALIASES).find(k => SPECIALIZATION_ALIASES[k] === aliases) ?? "")) {
            matchingAliases = aliases;
            break;
        }
    }
    // Also search by Bengali key name
    for (const [key, aliases] of Object.entries(SPECIALIZATION_ALIASES)) {
        if (specLower.includes(key.toLowerCase())) {
            matchingAliases = [...aliases, key.toLowerCase()];
            break;
        }
    }

    // Direct specialization label match
    if (docSpec.includes(specLower)) score += 10;

    // Alias match — ONLY if the alias group is correct for the queried specialist
    if (matchingAliases.length > 0 && matchingAliases.some((a) => docSpec.includes(a))) score += 8;

    // If still zero, no relevant specialty match — skip
    if (score === 0) return 0;

    // ─ Geo-location scoring: local district first, then division, then Dhaka fallback
    const distLower = district.toLowerCase();
    // Transliteration aliases for common districts
    const distAliases: string[] = [distLower];
    if (distLower.includes("cumilla") || distLower.includes("কুমিল্লা")) distAliases.push("comilla", "cumilla", "কুমিল্লা", "কোমিল্লা");
    if (distLower.includes("dhaka") || distLower.includes("ঢাকা")) distAliases.push("dhaka", "ঢাকা");
    if (distLower.includes("chittagong") || distLower.includes("চট্টগ্রাম") || distLower.includes("চাটগাঁও")) distAliases.push("chittagong", "chattogram", "চট্টগ্রাম");
    if (distLower.includes("sylhet") || distLower.includes("সিলেট")) distAliases.push("sylhet", "সিলেট");
    if (distLower.includes("rajshahi") || distLower.includes("রাজশাহী")) distAliases.push("rajshahi", "রাজশাহী");
    if (distLower.includes("khulna") || distLower.includes("খুলনা")) distAliases.push("khulna", "খুলনা");

    const inDistrict = distAliases.some((a) => docDiv.includes(a) || docChamber.includes(a));
    if (inDistrict) score += 6; // Strong local boost
    else if (docDiv.includes("dhaka") || docChamber.includes("dhaka")) score += 1; // Dhaka as last resort only

    // Prefer complete profiles
    if (doc.chamber && doc.chamber.length > 5) score += 2;
    if (doc.qualification) score += 1;

    return score;
}

export async function queryDoctors(specialistKeyword: string, district = "Dhaka", limit = 3): Promise<RecommendedDoctor[]> {
    const docs = await fetchDoctors();
    if (!docs || docs.length === 0) return [];

    const scored = docs
        .map((doc) => ({ doc, score: scoreDoctor(doc, specialistKeyword, district) }))
        .filter(({ score }) => score > 0) // score -1 = excluded, 0 = no match
        .sort((a, b) => b.score - a.score)
        .slice(0, limit);

    return scored.map(({ doc }) => ({
        doctorName: doc.name,
        qualification: doc.qualification,
        specialization: doc.specialization,
        designation: doc.designation,
        chamber: doc.chamber || doc.division,
    }));
}

// ─── React Hook ────────────────────────────────────────────────────────────

export function useDoctors() {
    const [loaded, setLoaded] = useState(!!_cache);
    const loadedRef = useRef(loaded);
    loadedRef.current = loaded;

    useEffect(() => {
        if (_cache !== null) {
            if (!loadedRef.current) setLoaded(true);
            return;
        }
        fetchDoctors().then(() => setLoaded(true));
    }, []);

    return {
        loaded,
        totalDoctors: _cache?.length ?? 0,
        queryDoctors,
    };
}

// Eagerly start loading as soon as this module is imported
fetchDoctors();
