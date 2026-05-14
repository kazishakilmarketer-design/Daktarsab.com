/**
 * bilingualTranslator.ts
 * English → Bengali keyword translation layer for DoctarSaab.
 * Maps common English medical terms /症symptoms to Bengali so the
 * AI and local agent system can match them properly.
 */

const EN_BN_MAP: Record<string, string> = {
    // ── Symptoms ─────────────────────────────────────────────────────
    "fever": "জ্বর",
    "cold": "ঠান্ডা",
    "cough": "কাশি",
    "headache": "মাথাব্যথা",
    "head ache": "মাথাব্যথা",
    "head pain": "মাথাব্যথা",
    "chest pain": "বুকে ব্যথা",
    "chest ache": "বুকে ব্যথা",
    "stomach pain": "পেটে ব্যথা",
    "abdominal pain": "পেটে ব্যথা",
    "back pain": "পিঠে ব্যথা",
    "joint pain": "গাঁটে ব্যথা",
    "leg pain": "পায়ে ব্যথা",
    "arm pain": "হাতে ব্যথা",
    "throat pain": "গলা ব্যথা",
    "sore throat": "গলা ব্যথা",
    "vomiting": "বমি",
    "nausea": "বমি বমি ভাব",
    "diarrhea": "ডায়ারিয়া",
    "loose motion": "পাতলা পায়খানা",
    "constipation": "কোষ্ঠকাঠিন্য",
    "dizziness": "মাথা ঘোরা",
    "vertigo": "মাথা ঘোরা",
    "weakness": "দুর্বলতা",
    "fatigue": "ক্লান্তি",
    "tired": "ক্লান্ত",
    "insomnia": "ঘুম না হওয়া",
    "sleep problem": "ঘুমের সমস্যা",
    "rash": "ফুসকুড়ি",
    "skin rash": "চর্মরোগ",
    "itching": "চুলকানি",
    "swelling": "ফোলা",
    "bleeding": "রক্তক্ষরণ",
    "blood in urine": "প্রস্রাবে রক্ত",
    "blood in stool": "মলে রক্ত",
    "shortness of breath": "শ্বাসকষ্ট",
    "breathing problem": "শ্বাসকষ্ট",
    "difficulty breathing": "শ্বাসকষ্ট",
    "high blood pressure": "উচ্চ রক্তচাপ",
    "low blood pressure": "নিম্ন রক্তচাপ",
    "hypertension": "উচ্চ রক্তচাপ",
    "diabetes": "ডায়াবেটিস",
    "sugar": "ডায়াবেটিস",
    "heart attack": "হার্ট অ্যাটাক",
    "heart problem": "হৃদরোগ",
    "heart disease": "হৃদরোগ",
    "stroke": "স্ট্রোক",
    "paralysis": "পক্ষাঘাত",
    "seizure": "খিঁচুনি",
    "epilepsy": "মৃগীরোগ",
    "kidney problem": "কিডনির সমস্যা",
    "kidney stone": "কিডনিতে পাথর",
    "liver problem": "লিভারের সমস্যা",
    "jaundice": "জন্ডিস",
    "dengue": "ডেঙ্গু",
    "typhoid": "টাইফয়েড",
    "malaria": "ম্যালেরিয়া",
    "tuberculosis": "যক্ষ্মা",
    "tb": "যক্ষ্মা",
    "asthma": "হাঁপানি",
    "allergy": "অ্যালার্জি",
    "depression": "বিষণ্নতা",
    "anxiety": "উদ্বেগ",
    "stress": "মানসিক চাপ",
    "pregnancy": "গর্ভাবস্থা",
    "pregnant": "গর্ভবতী",
    "period pain": "মাসিকের ব্যথা",
    "menstrual pain": "মাসিকের ব্যথা",
    "irregular period": "অনিয়মিত মাসিক",
    "eye problem": "চোখের সমস্যা",
    "eye pain": "চোখে ব্যথা",
    "ear pain": "কানে ব্যথা",
    "ear problem": "কানের সমস্যা",
    "tooth pain": "দাঁতে ব্যথা",
    "toothache": "দাঁতে ব্যথা",
    "hair loss": "চুল পড়া",
    "urine problem": "প্রস্রাবের সমস্যা",
    "burning urine": "প্রস্রাবে জ্বালা",
    "weight loss": "ওজন কমা",
    "weight gain": "ওজন বৃদ্ধি",
    "obesity": "স্থূলতা",
    "infection": "সংক্রমণ",
    "inflammation": "প্রদাহ",
    "pain": "ব্যথা",
    "injury": "আঘাত",
    "accident": "দুর্ঘটনা",
    "burn": "পোড়া",
    "cut": "কাটা",
    "wound": "ক্ষত",
    "fracture": "ভাঙা",
    "broken bone": "হাড় ভাঙা",
    "cancer": "ক্যান্সার",
    "tumor": "টিউমার",
    "thyroid": "থাইরয়েড",
    "anemia": "রক্তস্বল্পতা",
    "low blood": "রক্তস্বল্পতা",

    // ── Specialties ────────────────────────────────────────────────
    "medicine": "মেডিসিন",
    "general medicine": "সাধারণ চিকিৎসা",
    "internal medicine": "মেডিসিন বিশেষজ্ঞ",
    "cardiology": "কার্ডিওলজি",
    "cardiologist": "হৃদরোগ বিশেষজ্ঞ",
    "heart specialist": "হৃদরোগ বিশেষজ্ঞ",
    "neurology": "নিউরোলজি",
    "neurologist": "নিউরোলজিস্ট",
    "orthopedic": "অর্থোপেডিক",
    "bone doctor": "হাড়ের ডাক্তার",
    "dermatology": "চর্মরোগ",
    "skin specialist": "চর্মরোগ বিশেষজ্ঞ",
    "gynecology": "স্ত্রীরোগ",
    "gynecologist": "স্ত্রীরোগ বিশেষজ্ঞ",
    "pediatrics": "শিশুরোগ",
    "pediatrician": "শিশুরোগ বিশেষজ্ঞ",
    "child specialist": "শিশুরোগ বিশেষজ্ঞ",
    "psychiatry": "মানসিক স্বাস্থ্য",
    "psychiatrist": "মনোরোগ বিশেষজ্ঞ",
    "ophthalmology": "চক্ষুরোগ",
    "eye specialist": "চক্ষু বিশেষজ্ঞ",
    "ent": "নাক কান গলা বিশেষজ্ঞ",
    "dentist": "দাঁতের ডাক্তার",
    "dental": "দন্তচিকিৎসা",
    "urology": "ইউরোলজি",
    "urologist": "মূত্ররোগ বিশেষজ্ঞ",
    "gastroenterology": "গ্যাস্ট্রোএন্টারোলজি",
    "gastroenterologist": "পরিপাকতন্ত্র বিশেষজ্ঞ",
    "endocrinology": "এন্ডোক্রিনোলজি",
    "diabetes specialist": "ডায়াবেটিস বিশেষজ্ঞ",
    "oncology": "ক্যান্সার বিশেষজ্ঞ",
    "oncologist": "ক্যান্সার বিশেষজ্ঞ",
    "nephrology": "নেফ্রোলজি",
    "kidney specialist": "কিডনি বিশেষজ্ঞ",
    "pulmonology": "পালমোনোলজি",
    "lung specialist": "ফুসফুস বিশেষজ্ঞ",
    "rheumatology": "রিউমাটোলজি",
    "physiotherapy": "ফিজিওথেরাপি",
    "surgery": "সার্জারি",
    "surgeon": "সার্জন",
};

/**
 * Translates English medical terms in a message to Bengali,
 * leaving Bengali text and unknown words unchanged.
 */
export function translateToBengali(text: string): string {
    if (!text) return text;
    // If the text is already mostly Bengali (more than 30% Bengali chars), skip
    const bengaliCharCount = (text.match(/[\u0980-\u09FF]/g) || []).length;
    if (bengaliCharCount / text.length > 0.3) return text;

    let result = text.toLowerCase();
    // Sort by length descending so longer phrases match before shorter ones
    const sorted = Object.entries(EN_BN_MAP).sort((a, b) => b[0].length - a[0].length);
    for (const [en, bn] of sorted) {
        // Word boundary matching
        const regex = new RegExp(`\\b${en}\\b`, "gi");
        result = result.replace(regex, bn);
    }
    return result;
}

/**
 * Enhances a message for the AI system prompt with context clues.
 * Appends a Bengali translation note so the Gemini model understands the intent.
 */
export function enhanceMessageForAI(message: string): string {
    const bengaliCharCount = (message.match(/[\u0980-\u09FF]/g) || []).length;
    const isEnglish = bengaliCharCount / (message.length || 1) < 0.3;

    if (!isEnglish) return message; // already Bengali, no change needed

    const translated = translateToBengali(message);
    // If translation produced Bengali keywords, append them as context
    if (translated !== message.toLowerCase()) {
        return `${message}\n\n[User's message translated for medical context: ${translated}]`;
    }
    return message;
}
