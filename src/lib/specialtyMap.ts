/**
 * specialtyMap.ts — CANONICAL SPECIALTY REGISTRY
 * Single source of truth for all specialist names used across DaktarSab AI system.
 *
 * FIXES: AI-1 — Dual specialist mapping where SYMPTOM_DB.specialty strings differ
 * from TRIAGE_RULES[].specialist strings, causing the same symptom to route to
 * different specialists depending on which path (AI_Engine vs doctorSaabAgents) is taken.
 *
 * USAGE:
 *   import { CANONICAL_SPECIALTY, specialtyKey } from "./specialtyMap";
 *   CANONICAL_SPECIALTY.cardiology.bn   // "কার্ডিওলজিস্ট (হৃদরোগ বিশেষজ্ঞ)"
 *   CANONICAL_SPECIALTY.cardiology.en   // "Cardiologist"
 *   CANONICAL_SPECIALTY.cardiology.db   // "Cardiology" — for Supabase doctor query
 */

export interface SpecialtyEntry {
  /** Bangla display name shown to patients */
  bn: string;
  /** English display name */
  en: string;
  /** Keyword used in SYMPTOM_DB.specialty field (legacy compat) */
  legacy: string;
  /** Short key for Supabase doctors.specialization ILIKE query */
  db: string;
}

export const CANONICAL_SPECIALTY: Record<string, SpecialtyEntry> = {
  cardiology: {
    bn: "কার্ডিওলজিস্ট (হৃদরোগ বিশেষজ্ঞ)",
    en: "Cardiologist",
    legacy: "Cardiology (কার্ডিওলজি)",
    db: "Cardiology",
  },
  neurology: {
    bn: "নিউরোলজিস্ট (স্নায়ু বিশেষজ্ঞ)",
    en: "Neurologist",
    legacy: "Neurology (নিউরোলজি)",
    db: "Neurology",
  },
  pulmonology: {
    bn: "পালমোনোলজিস্ট (ফুসফুস বিশেষজ্ঞ)",
    en: "Pulmonologist",
    legacy: "Pulmonology (পালমোনোলজি)",
    db: "Pulmonology",
  },
  gastroenterology: {
    bn: "গ্যাস্ট্রোএন্টারোলজিস্ট (পেটের রোগ বিশেষজ্ঞ)",
    en: "Gastroenterologist",
    legacy: "Gastroenterology (গ্যাস্ট্রোএন্টারোলজি)",
    db: "Gastroenterology",
  },
  orthopedics: {
    bn: "অর্থোপেডিক্স বিশেষজ্ঞ",
    en: "Orthopedic Surgeon",
    legacy: "Orthopedics (অর্থোপেডিক্স)",
    db: "Orthopedics",
  },
  dermatology: {
    bn: "ডার্মাটোলজিস্ট (চর্মরোগ বিশেষজ্ঞ)",
    en: "Dermatologist",
    legacy: "Dermatology (চর্মরোগ বিশেষজ্ঞ)",
    db: "Dermatology",
  },
  pediatrics: {
    bn: "শিশু বিশেষজ্ঞ (পেডিয়াট্রিশিয়ান)",
    en: "Pediatrician",
    legacy: "Pediatrics (শিশুরোগ বিশেষজ্ঞ)",
    db: "Pediatrics",
  },
  gynecology: {
    bn: "স্ত্রী রোগ ও প্রসূতি বিশেষজ্ঞ (গাইনোকোলজিস্ট)",
    en: "Gynecologist",
    legacy: "Gynecology (গাইনিকোলজি)",
    db: "Gynecology",
  },
  ent: {
    bn: "নাক-কান-গলা বিশেষজ্ঞ (ইএনটি)",
    en: "ENT Specialist",
    legacy: "ENT (নাক-কান-গলা)",
    db: "ENT",
  },
  ophthalmology: {
    bn: "চক্ষু বিশেষজ্ঞ (অফথালমোলজিস্ট)",
    en: "Ophthalmologist",
    legacy: "Ophthalmology (চক্ষু বিশেষজ্ঞ)",
    db: "Ophthalmology",
  },
  dentistry: {
    bn: "ডেন্টিস্ট (দন্তরোগ বিশেষজ্ঞ)",
    en: "Dentist",
    legacy: "Dentistry (ডেন্টিস্ট)",
    db: "Dentistry",
  },
  nephrology: {
    bn: "নেফ্রোলজিস্ট (কিডনি বিশেষজ্ঞ)",
    en: "Nephrologist",
    legacy: "Nephrology (কিডনি বিশেষজ্ঞ)",
    db: "Nephrology",
  },
  endocrinology: {
    bn: "এন্ডোক্রাইনোলজিস্ট (ডায়াবেটিস বিশেষজ্ঞ)",
    en: "Endocrinologist",
    legacy: "Endocrinology (এন্ডোক্রাইনোলজি)",
    db: "Endocrinology",
  },
  psychiatry: {
    bn: "মনোরোগ বিশেষজ্ঞ (সাইকিয়াট্রিস্ট)",
    en: "Psychiatrist",
    legacy: "Psychiatry (মনোরোগ বিশেষজ্ঞ)",
    db: "Psychiatry",
  },
  urology: {
    bn: "ইউরোলজিস্ট (মূত্ররোগ বিশেষজ্ঞ)",
    en: "Urologist",
    legacy: "Urology (ইউরোলজি)",
    db: "Urology",
  },
  oncology: {
    bn: "ক্যান্সার বিশেষজ্ঞ (অনকোলজিস্ট)",
    en: "Oncologist",
    legacy: "Oncology (অনকোলজি)",
    db: "Oncology",
  },
  general_medicine: {
    bn: "মেডিসিন বিশেষজ্ঞ (জেনারেল ফিজিশিয়ান)",
    en: "General Physician",
    legacy: "General Medicine (সাধারণ মেডিসিন)",
    db: "General Medicine",
  },
  emergency: {
    bn: "জরুরি বিভাগ চিকিৎসক",
    en: "Emergency Physician",
    legacy: "Emergency Physician (জরুরি চিকিৎসক)",
    db: "Emergency",
  },
  rheumatology: {
    bn: "রিউমাটোলজিস্ট (বাত বিশেষজ্ঞ)",
    en: "Rheumatologist",
    legacy: "Rheumatology (রিউমাটোলজি)",
    db: "Rheumatology",
  },
  hepatology: {
    bn: "হেপাটোলজিস্ট (লিভার বিশেষজ্ঞ)",
    en: "Hepatologist",
    legacy: "Hepatology (লিভার বিশেষজ্ঞ)",
    db: "Hepatology",
  },
  hematology: {
    bn: "হেমাটোলজিস্ট (রক্ত বিশেষজ্ঞ)",
    en: "Hematologist",
    legacy: "Hematology (হেমাটোলজি)",
    db: "Hematology",
  },
  allergy: {
    bn: "অ্যালার্জি ও ইমিউনোলজি বিশেষজ্ঞ",
    en: "Allergist / Immunologist",
    legacy: "Allergy (অ্যালার্জি বিশেষজ্ঞ)",
    db: "Allergy",
  },
  vascular: {
    bn: "ভাস্কুলার সার্জন",
    en: "Vascular Surgeon",
    legacy: "Vascular Surgery",
    db: "Vascular Surgery",
  },
  physiotherapy: {
    bn: "ফিজিওথেরাপিস্ট",
    en: "Physiotherapist",
    legacy: "Physiotherapy",
    db: "Physiotherapy",
  },
  surgery: {
    bn: "সার্জন (শল্য চিকিৎসক)",
    en: "General Surgeon",
    legacy: "Surgery (সার্জারি)",
    db: "Surgery",
  },
};

/**
 * Resolves a legacy specialty string (from SYMPTOM_DB or TRIAGE_RULES)
 * to the canonical SpecialtyEntry, so both paths return the same object.
 *
 * Returns `CANONICAL_SPECIALTY.general_medicine` as safe default.
 */
export function resolveSpecialty(legacyOrKey: string): SpecialtyEntry {
  if (!legacyOrKey) return CANONICAL_SPECIALTY.general_medicine;

  // 1. Direct key lookup (e.g., "cardiology")
  const direct = CANONICAL_SPECIALTY[legacyOrKey.toLowerCase().replace(/[\s()]/g, "_")];
  if (direct) return direct;

  // 2. Match against legacy field (substring, case-insensitive)
  const lower = legacyOrKey.toLowerCase();
  for (const entry of Object.values(CANONICAL_SPECIALTY)) {
    if (entry.legacy.toLowerCase().includes(lower) || lower.includes(entry.db.toLowerCase())) {
      return entry;
    }
  }

  // 3. Match by Bangla/English display name keywords
  for (const entry of Object.values(CANONICAL_SPECIALTY)) {
    if (entry.bn.includes(legacyOrKey) || entry.en.toLowerCase().includes(lower)) {
      return entry;
    }
  }

  return CANONICAL_SPECIALTY.general_medicine;
}

/**
 * Returns the canonical Bangla specialist display name for a given legacy string.
 * Safe to use directly in UI.
 */
export function getSpecialtyBn(legacyOrKey: string): string {
  return resolveSpecialty(legacyOrKey).bn;
}

/**
 * Returns the DB search key for Supabase ILIKE query on doctors.specialization
 */
export function getSpecialtyDbKey(legacyOrKey: string): string {
  return resolveSpecialty(legacyOrKey).db;
}
