import symptomCsv from "../../new 500+ Symptom List.csv?raw";

export type SeverityLevel = "emergency" | "moderate" | "mild" | "unknown";

export interface SymptomMapping {
  bengali: string[];
  english: string[];
  specialty: string;
  severity: SeverityLevel;
}

export const SYMPTOM_DB: Record<string, SymptomMapping> = {
  chest_pain: {
    bengali: ["বুক ব্যথা"],
    english: ["Chest Pain"],
    specialty: "Cardiology (কার্ডিওলজি)",
    severity: "emergency"
  },
  chest_tightness: {
    bengali: ["বুক চাপ অনুভব"],
    english: ["Chest Tightness"],
    specialty: "Cardiology (কার্ডিওলজি)",
    severity: "emergency"
  },
  heart_palpitations: {
    bengali: ["হৃদস্পন্দন বেড়ে যাওয়া"],
    english: ["Heart Palpitations"],
    specialty: "Cardiology (কার্ডিওলজি)",
    severity: "moderate"
  },
  irregular_heartbeat: {
    bengali: ["অনিয়মিত হার্টবিট"],
    english: ["Irregular Heartbeat"],
    specialty: "Cardiology (কার্ডিওলজি)",
    severity: "moderate"
  },
  shortness_of_breath: {
    // AI-5 FIX: Downgraded from "emergency" to "moderate".
    // Severe breathing emergency is now caught by AI_Engine multi-signal threshold.
    // Mild breathlessness (e.g., after exertion) should not trigger ambulance.
    bengali: ["শ্বাস নিতে কষ্ট", "শ্বাস নিতে কষ্ট হচ্ছে"],
    english: ["Shortness of Breath", "Breathing Difficulty"],
    specialty: "Pulmonology (পালমোনোলজি)",
    severity: "moderate"
  },
  arm_numbness: {
    bengali: ["হাত অবশ হয়ে যাওয়া", "হাত অবশ লাগা"],
    english: ["Arm Numbness"],
    specialty: "Neurology (নিউরোলজি)",
    severity: "moderate"
  },
  fainting: {
    bengali: ["হঠাৎ অজ্ঞান হয়ে যাওয়া"],
    english: ["Fainting"],
    specialty: "Cardiology (কার্ডিওলজি)",
    severity: "emergency"
  },
  cold_sweating: {
    bengali: ["ঠান্ডা ঘাম হওয়া"],
    english: ["Cold Sweating"],
    specialty: "Cardiology (কার্ডিওলজি)",
    severity: "emergency"
  },
  dizziness: {
    bengali: ["মাথা ঘোরা"],
    english: ["Dizziness"],
    specialty: "Neurology (নিউরোলজি)",
    severity: "moderate"
  },
  loss_of_balance: {
    bengali: ["ভারসাম্য হারানো"],
    english: ["Loss of Balance"],
    specialty: "Neurology (নিউরোলজি)",
    severity: "moderate"
  },
  severe_headache: {
    bengali: ["তীব্র মাথা ব্যথা"],
    english: ["Severe Headache"],
    specialty: "Neurology (নিউরোলজি)",
    severity: "moderate"
  },
  migraine: {
    bengali: ["মাইগ্রেন"],
    english: ["Migraine"],
    specialty: "Neurology (নিউরোলজি)",
    severity: "mild"
  },
  seizures: {
    bengali: ["খিঁচুনি"],
    english: ["Seizures"],
    specialty: "Neurology (নিউরোলজি)",
    severity: "emergency"
  },
  memory_loss: {
    bengali: ["স্মৃতিভ্রংশ"],
    english: ["Memory Loss"],
    specialty: "Neurology (নিউরোলজি)",
    severity: "moderate"
  },
  difficulty_speaking: {
    bengali: ["কথা বলতে সমস্যা"],
    english: ["Difficulty Speaking"],
    specialty: "Neurology (নিউরোলজি)",
    severity: "emergency"
  },
  blurred_vision: {
    bengali: ["চোখে ঝাপসা দেখা"],
    english: ["Blurred Vision"],
    specialty: "Ophthalmology (চক্ষু বিশেষজ্ঞ)",
    severity: "moderate"
  },
  red_eyes: {
    bengali: ["চোখ লাল হওয়া"],
    english: ["Red Eyes"],
    specialty: "Ophthalmology (চক্ষু বিশেষজ্ঞ)",
    severity: "mild"
  },
  eye_pain: {
    bengali: ["চোখ ব্যথা"],
    english: ["Eye Pain"],
    specialty: "Ophthalmology (চক্ষু বিশেষজ্ঞ)",
    severity: "moderate"
  },
  watery_eyes: {
    bengali: ["চোখে পানি পড়া"],
    english: ["Watery Eyes"],
    specialty: "Ophthalmology (চক্ষু বিশেষজ্ঞ)",
    severity: "mild"
  },
  eye_itching: {
    bengali: ["চোখে চুলকানি"],
    english: ["Eye Itching"],
    specialty: "Ophthalmology (চক্ষু বিশেষজ্ঞ)",
    severity: "mild"
  },
  cough: {
    bengali: ["কাশি"],
    english: ["Cough"],
    specialty: "Pulmonology (পালমোনোলজি)",
    severity: "mild"
  },
  chronic_cough: {
    bengali: ["দীর্ঘদিন কাশি"],
    english: ["Chronic Cough"],
    specialty: "Pulmonology (পালমোনোলজি)",
    severity: "moderate"
  },
  dry_cough: {
    bengali: ["শুকনা কাশি"],
    english: ["Dry Cough"],
    specialty: "Pulmonology (পালমোনোলজি)",
    severity: "mild"
  },
  wet_cough: {
    bengali: ["কফ সহ কাশি"],
    english: ["Wet Cough"],
    specialty: "Pulmonology (পালমোনোলজি)",
    severity: "mild"
  },
  coughing_blood: {
    bengali: ["রক্ত সহ কাশি"],
    english: ["Coughing Blood"],
    specialty: "Pulmonology (পালমোনোলজি)",
    severity: "emergency"
  },
  runny_nose: {
    bengali: ["নাক দিয়ে পানি পড়া"],
    english: ["Runny Nose"],
    specialty: "ENT (নাক-কান-গলা)",
    severity: "mild"
  },
  nasal_congestion: {
    bengali: ["নাক বন্ধ"],
    english: ["Nasal Congestion"],
    specialty: "ENT (নাক-কান-গলা)",
    severity: "mild"
  },
  sore_throat: {
    bengali: ["গলা ব্যথা"],
    english: ["Sore Throat"],
    specialty: "ENT (নাক-কান-গলা)",
    severity: "mild"
  },
  hoarse_voice: {
    bengali: ["গলা বসে যাওয়া", "কণ্ঠস্বর বসে যাওয়া"],
    english: ["Hoarse Voice"],
    specialty: "ENT (নাক-কান-গলা)",
    severity: "mild"
  },
  frequent_sneezing: {
    bengali: ["ঘন ঘন হাঁচি"],
    english: ["Frequent Sneezing"],
    specialty: "ENT (নাক-কান-গলা)",
    severity: "mild"
  },
  abdominal_pain: {
    bengali: ["পেটে ব্যথা"],
    english: ["Abdominal Pain"],
    specialty: "Gastroenterology (গ্যাস্ট্রোএন্টারোলজি)",
    severity: "moderate"
  },
  upper_abdominal_pain: {
    bengali: ["উপরের পেটে ব্যথা"],
    english: ["Upper Abdominal Pain"],
    specialty: "Gastroenterology (গ্যাস্ট্রোএন্টারোলজি)",
    severity: "moderate"
  },
  lower_abdominal_pain: {
    bengali: ["নিচের পেটে ব্যথা"],
    english: ["Lower Abdominal Pain"],
    specialty: "Gastroenterology (গ্যাস্ট্রোএন্টারোলজি)",
    severity: "moderate"
  },
  nausea: {
    bengali: ["বমি ভাব"],
    english: ["Nausea"],
    specialty: "Gastroenterology (গ্যাস্ট্রোএন্টারোলজি)",
    severity: "mild"
  },
  vomiting: {
    bengali: ["বমি", "বমি হওয়া"],
    english: ["Vomiting"],
    specialty: "Gastroenterology (গ্যাস্ট্রোএন্টারোলজি)",
    severity: "moderate"
  },
  acid_reflux: {
    bengali: ["অ্যাসিডিটি"],
    english: ["Acid Reflux"],
    specialty: "Gastroenterology (গ্যাস্ট্রোএন্টারোলজি)",
    severity: "mild"
  },
  heartburn: {
    bengali: ["বুক জ্বালা"],
    english: ["Heartburn"],
    specialty: "Gastroenterology (গ্যাস্ট্রোএন্টারোলজি)",
    severity: "mild"
  },
  gas: {
    bengali: ["গ্যাস সমস্যা"],
    english: ["Gas"],
    specialty: "Gastroenterology (গ্যাস্ট্রোএন্টারোলজি)",
    severity: "mild"
  },
  bloating: {
    bengali: ["পেট ফাঁপা"],
    english: ["Bloating"],
    specialty: "Gastroenterology (গ্যাস্ট্রোএন্টারোলজি)",
    severity: "mild"
  },
  constipation: {
    bengali: ["কোষ্ঠকাঠিন্য"],
    english: ["Constipation"],
    specialty: "Gastroenterology (গ্যাস্ট্রোএন্টারোলজি)",
    severity: "mild"
  },
  diarrhea: {
    bengali: ["ডায়রিয়া"],
    english: ["Diarrhea"],
    specialty: "Gastroenterology (গ্যাস্ট্রোএন্টারোলজি)",
    severity: "moderate"
  },
  blood_in_stool: {
    bengali: ["মলে রক্ত"],
    english: ["Blood in Stool"],
    specialty: "Gastroenterology (গ্যাস্ট্রোএন্টারোলজি)",
    severity: "emergency"
  },
  loss_of_appetite: {
    bengali: ["ক্ষুধামন্দা"],
    english: ["Loss of Appetite"],
    specialty: "Gastroenterology (গ্যাস্ট্রোএন্টারোলজি)",
    severity: "mild"
  },
  weight_loss: {
    bengali: ["ওজন কমে যাওয়া"],
    english: ["Weight Loss"],
    specialty: "Gastroenterology (গ্যাস্ট্রোএন্টারোলজি)",
    severity: "moderate"
  },
  yellowing_skin: {
    bengali: ["জন্ডিস"],
    english: ["Yellowing Skin"],
    specialty: "Gastroenterology (গ্যাস্ট্রোএন্টারোলজি)",
    severity: "moderate"
  },
  knee_pain: {
    bengali: ["হাঁটু ব্যথা"],
    english: ["Knee Pain"],
    specialty: "Orthopedics (অর্থোপেডিক্স)",
    severity: "mild"
  },
  back_pain: {
    bengali: ["পিঠে ব্যথা"],
    english: ["Back Pain"],
    specialty: "Orthopedics (অর্থোপেডিক্স)",
    severity: "mild"
  },
  neck_pain: {
    bengali: ["ঘাড় ব্যথা"],
    english: ["Neck Pain"],
    specialty: "Orthopedics (অর্থোপেডিক্স)",
    severity: "mild"
  },
  joint_swelling: {
    bengali: ["জয়েন্ট ফুলে যাওয়া"],
    english: ["Joint Swelling"],
    specialty: "Orthopedics (অর্থোপেডিক্স)",
    severity: "moderate"
  },
  bone_pain: {
    bengali: ["হাড়ে ব্যথা"],
    english: ["Bone Pain"],
    specialty: "Orthopedics (অর্থোপেডিক্স)",
    severity: "moderate"
  },
  difficulty_walking: {
    bengali: ["হাঁটতে কষ্ট"],
    english: ["Difficulty Walking"],
    specialty: "Orthopedics (অর্থোপেডিক্স)",
    severity: "moderate"
  },
  muscle_pain: {
    bengali: ["মাংসপেশি ব্যথা"],
    english: ["Muscle Pain"],
    specialty: "Orthopedics (অর্থোপেডিক্স)",
    severity: "mild"
  },
  muscle_stiffness: {
    bengali: ["মাংসপেশি শক্ত হয়ে যাওয়া"],
    english: ["Muscle Stiffness"],
    specialty: "Orthopedics (অর্থোপেডিক্স)",
    severity: "mild"
  },
  skin_rash: {
    bengali: ["ত্বকে ফুসকুড়ি"],
    english: ["Skin Rash"],
    specialty: "Dermatology (চর্মরোগ বিশেষজ্ঞ)",
    severity: "mild"
  },
  itching: {
    bengali: ["চুলকানি"],
    english: ["Itching"],
    specialty: "Dermatology (চর্মরোগ বিশেষজ্ঞ)",
    severity: "mild"
  },
  acne: {
    bengali: ["ব্রণ"],
    english: ["Acne"],
    specialty: "Dermatology (চর্মরোগ বিশেষজ্ঞ)",
    severity: "mild"
  },
  hair_loss: {
    bengali: ["চুল পড়া"],
    english: ["Hair Loss"],
    specialty: "Dermatology (চর্মরোগ বিশেষজ্ঞ)",
    severity: "mild"
  },
  skin_redness: {
    bengali: ["ত্বক লাল হওয়া"],
    english: ["Skin Redness"],
    specialty: "Dermatology (চর্মরোগ বিশেষজ্ঞ)",
    severity: "mild"
  },
  skin_burning: {
    bengali: ["ত্বক জ্বালা"],
    english: ["Skin Burning"],
    specialty: "Dermatology (চর্মরোগ বিশেষজ্ঞ)",
    severity: "moderate"
  },
  white_patches: {
    bengali: ["সাদা দাগ"],
    english: ["White Patches"],
    specialty: "Dermatology (চর্মরোগ বিশেষজ্ঞ)",
    severity: "moderate"
  },
  child_fever: {
    bengali: ["শিশুর জ্বর"],
    english: ["Child Fever"],
    specialty: "Pediatrics (শিশুরোগ বিশেষজ্ঞ)",
    severity: "moderate"
  },
  child_cough: {
    bengali: ["শিশুর কাশি"],
    english: ["Child Cough"],
    specialty: "Pediatrics (শিশুরোগ বিশেষজ্ঞ)",
    severity: "mild"
  },
  child_diarrhea: {
    bengali: ["শিশুর ডায়রিয়া"],
    english: ["Child Diarrhea"],
    specialty: "Pediatrics (শিশুরোগ বিশেষজ্ঞ)",
    severity: "moderate"
  },
  child_seizure: {
    bengali: ["শিশুর খিঁচুনি"],
    english: ["Child Seizure"],
    specialty: "Pediatrics (শিশুরোগ বিশেষজ্ঞ)",
    severity: "emergency"
  },
  child_breathing_difficulty: {
    bengali: ["শিশুর শ্বাসকষ্ট"],
    english: ["Child Breathing Difficulty"],
    specialty: "Pediatrics (শিশুরোগ বিশেষজ্ঞ)",
    severity: "emergency"
  },
  irregular_periods: {
    bengali: ["মাসিক অনিয়মিত"],
    english: ["Irregular Periods"],
    specialty: "Gynecology (গাইনিকোলজি)",
    severity: "moderate"
  },
  heavy_bleeding: {
    bengali: ["অতিরিক্ত রক্তপাত"],
    english: ["Heavy Bleeding"],
    specialty: "Gynecology (গাইনিকোলজি)",
    severity: "moderate"
  },
  pelvic_pain: {
    bengali: ["তলপেটে ব্যথা"],
    english: ["Pelvic Pain"],
    specialty: "Gynecology (গাইনিকোলজি)",
    severity: "moderate"
  },
  vaginal_itching: {
    bengali: ["যোনি চুলকানি"],
    english: ["Vaginal Itching"],
    specialty: "Gynecology (গাইনিকোলজি)",
    severity: "mild"
  },
  pregnancy_nausea: {
    bengali: ["গর্ভাবস্থায় বমি"],
    english: ["Pregnancy Nausea"],
    specialty: "Gynecology (গাইনিকোলজি)",
    severity: "mild"
  },
  tooth_pain: {
    bengali: ["দাঁত ব্যথা"],
    english: ["Tooth Pain"],
    specialty: "Dentistry (ডেন্টিস্ট)",
    severity: "moderate"
  },
  tooth_sensitivity: {
    bengali: ["দাঁতের সংবেদনশীলতা"],
    english: ["Tooth Sensitivity"],
    specialty: "Dentistry (ডেন্টিস্ট)",
    severity: "mild"
  },
  bleeding_gums: {
    bengali: ["মাড়ি থেকে রক্ত"],
    english: ["Bleeding Gums"],
    specialty: "Dentistry (ডেন্টিস্ট)",
    severity: "moderate"
  },
  mouth_ulcer: {
    bengali: ["মুখে ঘা"],
    english: ["Mouth Ulcer"],
    specialty: "Dentistry (ডেন্টিস্ট)",
    severity: "mild"
  },
  bad_breath: {
    bengali: ["মুখে দুর্গন্ধ"],
    english: ["Bad Breath"],
    specialty: "Dentistry (ডেন্টিস্ট)",
    severity: "mild"
  },
  fever: {
    bengali: ["জ্বর"],
    english: ["Fever"],
    specialty: "General Medicine (সাধারণ মেডিসিন)",
    severity: "moderate"
  },
  high_fever: {
    bengali: ["উচ্চ জ্বর"],
    english: ["High Fever"],
    specialty: "General Medicine (সাধারণ মেডিসিন)",
    severity: "moderate"
  },
  body_ache: {
    bengali: ["শরীর ব্যথা"],
    english: ["Body Ache"],
    specialty: "General Medicine (সাধারণ মেডিসিন)",
    severity: "mild"
  },
  fatigue: {
    bengali: ["অত্যধিক ক্লান্তি"],
    english: ["Fatigue"],
    specialty: "General Medicine (সাধারণ মেডিসিন)",
    severity: "mild"
  },
  chills: {
    bengali: ["ঠান্ডা লাগা"],
    english: ["Chills"],
    specialty: "General Medicine (সাধারণ মেডিসিন)",
    severity: "mild"
  },
  excessive_sweating: {
    bengali: ["ঘাম বেশি হওয়া"],
    english: ["Excessive Sweating"],
    specialty: "General Medicine (সাধারণ মেডিসিন)",
    severity: "mild"
  },
  indigestion: {
    bengali: ["খাবার হজম না হওয়া"],
    english: ["Indigestion"],
    specialty: "Gastroenterology (গ্যাস্ট্রোএন্টারোলজি)",
    severity: "mild"
  },
  burping: {
    bengali: ["ঢেকুর"],
    english: ["Burping"],
    specialty: "Gastroenterology (গ্যাস্ট্রোএন্টারোলজি)",
    severity: "mild"
  },
  globus_sensation: {
    bengali: ["গলায় কিছু আটকে থাকা অনুভূতি"],
    english: ["Globus Sensation"],
    specialty: "ENT (নাক-কান-গলা)",
    severity: "mild"
  },
  ear_pain: {
    bengali: ["কানে ব্যথা"],
    english: ["Ear Pain"],
    specialty: "ENT (নাক-কান-গলা)",
    severity: "moderate"
  },
  tinnitus: {
    bengali: ["কানে শব্দ শোনা", "কানে গুঞ্জন"],
    english: ["Tinnitus"],
    specialty: "ENT (নাক-কান-গলা)",
    severity: "mild"
  },
  hearing_loss: {
    bengali: ["কানে কম শোনা", "কানে শোনা কমে যাওয়া"],
    english: ["Hearing Loss"],
    specialty: "ENT (নাক-কান-গলা)",
    severity: "moderate"
  },
  ear_discharge: {
    bengali: ["কানে পানি পড়া", "কানে পুঁজ পড়া"],
    english: ["Ear Discharge"],
    specialty: "ENT (নাক-কান-গলা)",
    severity: "moderate"
  },
  sinus_pain: {
    bengali: ["সাইনাস ব্যথা"],
    english: ["Sinus Pain"],
    specialty: "ENT (নাক-কান-গলা)",
    severity: "mild"
  },
  facial_swelling: {
    bengali: ["মুখ ফুলে যাওয়া"],
    english: ["Facial Swelling"],
    specialty: "Dermatology (চর্মরোগ বিশেষজ্ঞ)",
    severity: "moderate"
  },
  lip_swelling: {
    bengali: ["ঠোঁট ফুলে যাওয়া"],
    english: ["Lip Swelling"],
    specialty: "Allergy (অ্যালার্জি বিশেষজ্ঞ)",
    severity: "moderate"
  },
  hand_swelling: {
    bengali: ["হাত ফুলে যাওয়া"],
    english: ["Hand Swelling"],
    specialty: "General Medicine (সাধারণ মেডিসিন)",
    severity: "moderate"
  },
  leg_swelling: {
    bengali: ["পা ফুলে যাওয়া"],
    english: ["Leg Swelling"],
    specialty: "Cardiology (কার্ডিওলজি)",
    severity: "moderate"
  },
  lightheadedness: {
    bengali: ["মাথা ঝিমঝিম করা"],
    english: ["Lightheadedness"],
    specialty: "Neurology (নিউরোলজি)",
    severity: "mild"
  },
  insomnia: {
    bengali: ["ঘুম না হওয়া"],
    english: ["Insomnia"],
    specialty: "Neurology (নিউরোলজি)",
    severity: "mild"
  },
  sleepiness: {
    bengali: ["অতিরিক্ত ঘুম"],
    english: ["Sleepiness"],
    specialty: "Neurology (নিউরোলজি)",
    severity: "mild"
  },
  vivid_dreams: {
    bengali: ["স্বপ্ন বেশি দেখা"],
    english: ["Vivid Dreams"],
    specialty: "Neurology (নিউরোলজি)",
    severity: "mild"
  },
  tremor: {
    bengali: ["হাত কাঁপা"],
    english: ["Tremor"],
    specialty: "Neurology (নিউরোলজি)",
    severity: "moderate"
  },
  numb_legs: {
    bengali: ["পা অবশ"],
    english: ["Numb Legs"],
    specialty: "Neurology (নিউরোলজি)",
    severity: "moderate"
  },
  numb_arms: {
    bengali: ["হাত অবশ"],
    english: ["Numb Arms"],
    specialty: "Neurology (নিউরোলজি)",
    severity: "moderate"
  },
  facial_droop: {
    bengali: ["মুখ বেঁকে যাওয়া"],
    english: ["Facial Droop"],
    specialty: "Neurology (নিউরোলজি)",
    severity: "emergency"
  },
  one_sided_weakness: {
    bengali: ["এক পাশ অবশ হওয়া"],
    english: ["One-sided Weakness"],
    specialty: "Neurology (নিউরোলজি)",
    severity: "emergency"
  },
  athma_attack: {
    bengali: ["হাঁপানি"],
    english: ["Athma Attack"],
    specialty: "Pulmonology (পালমোনোলজি)",
    severity: "emergency"
  },
  wheezing: {
    bengali: ["বুকে সাঁই সাঁই শব্দ"],
    english: ["Wheezing"],
    specialty: "Pulmonology (পালমোনোলজি)",
    severity: "moderate"
  },
  whistling_breath: {
    bengali: ["শ্বাসে বাঁশির শব্দ"],
    english: ["Whistling Breath"],
    specialty: "Pulmonology (পালমোনোলজি)",
    severity: "moderate"
  },
  painful_breathing: {
    bengali: ["শ্বাস নিতে ব্যথা"],
    english: ["Painful Breathing"],
    specialty: "Pulmonology (পালমোনোলজি)",
    severity: "moderate"
  },
  chest_congestion: {
    bengali: ["বুকে কফ জমা"],
    english: ["Chest Congestion"],
    specialty: "Pulmonology (পালমোনোলজি)",
    severity: "mild"
  },
  low_fever: {
    bengali: ["হালকা জ্বর"],
    english: ["Low Fever"],
    specialty: "General Medicine (সাধারণ মেডিসিন)",
    severity: "mild"
  },
  common_cold: {
    bengali: ["ঠান্ডা লেগেছে"],
    english: ["Common Cold"],
    specialty: "General Medicine (সাধারণ মেডিসিন)",
    severity: "mild"
  },
  dry_throat: {
    bengali: ["গলা শুকিয়ে যাওয়া"],
    english: ["Dry Throat"],
    specialty: "ENT (নাক-কান-গলা)",
    severity: "mild"
  },
  difficulty_swallowing: {
    bengali: ["খেতে কষ্ট", "খাবার গিলতে কষ্ট"],
    english: ["Difficulty Swallowing"],
    specialty: "ENT (নাক-কান-গলা)",
    severity: "moderate"
  },
  throat_pain: {
    bengali: ["গলায় ব্যথা"],
    english: ["Throat Pain"],
    specialty: "ENT (নাক-কান-গলা)",
    severity: "mild"
  },
  tongue_pain: {
    bengali: ["জিহ্বা ব্যথা"],
    english: ["Tongue Pain"],
    specialty: "Dentistry (ডেন্টিস্ট)",
    severity: "mild"
  },
  white_tongue: {
    bengali: ["জিহ্বা সাদা হওয়া"],
    english: ["White Tongue"],
    specialty: "Dentistry (ডেন্টিস্ট)",
    severity: "mild"
  },
  dry_mouth: {
    bengali: ["মুখ শুকিয়ে যাওয়া"],
    english: ["Dry Mouth"],
    specialty: "Dentistry (ডেন্টিস্ট)",
    severity: "mild"
  },
  swollen_gums: {
    bengali: ["মাড়ি ফুলে যাওয়া"],
    english: ["Swollen Gums"],
    specialty: "Dentistry (ডেন্টিস্ট)",
    severity: "moderate"
  },
  loose_teeth: {
    bengali: ["দাঁত নড়ে যাওয়া"],
    english: ["Loose Teeth"],
    specialty: "Dentistry (ডেন্টিস্ট)",
    severity: "moderate"
  },
  swollen_eyes: {
    bengali: ["চোখ ফুলে যাওয়া"],
    english: ["Swollen Eyes"],
    specialty: "Ophthalmology (চক্ষু বিশেষজ্ঞ)",
    severity: "moderate"
  },
  burning_eyes: {
    bengali: ["চোখে জ্বালা"],
    english: ["Burning Eyes"],
    specialty: "Ophthalmology (চক্ষু বিশেষজ্ঞ)",
    severity: "mild"
  },
  light_sensitivity: {
    bengali: ["চোখে আলো সহ্য না হওয়া", "চোখে আলোতে সমস্যা"],
    english: ["Light Sensitivity"],
    specialty: "Ophthalmology (চক্ষু বিশেষজ্ঞ)",
    severity: "moderate"
  },
  night_blindness: {
    bengali: ["রাতে দেখতে সমস্যা"],
    english: ["Night Blindness"],
    specialty: "Ophthalmology (চক্ষু বিশেষজ্ঞ)",
    severity: "moderate"
  },
  double_vision: {
    bengali: ["ডাবল দেখা", "চোখে ডাবল দেখা"],
    english: ["Double Vision"],
    specialty: "Ophthalmology (চক্ষু বিশেষজ্ঞ)",
    severity: "emergency"
  },
  floaters: {
    bengali: ["চোখের সামনে দাগ দেখা", "চোখে কালো দাগ ভাসা"],
    english: ["Floaters"],
    specialty: "Ophthalmology (চক্ষু বিশেষজ্ঞ)",
    severity: "mild"
  },
  arm_pain: {
    bengali: ["হাত ব্যথা"],
    english: ["Arm Pain"],
    specialty: "Orthopedics (অর্থোপেডিক্স)",
    severity: "mild"
  },
  leg_pain: {
    bengali: ["পা ব্যথা", "পায়ে ব্যথা"],
    english: ["Leg Pain"],
    specialty: "Orthopedics (অর্থোপেডিক্স)",
    severity: "mild"
  },
  heel_pain: {
    bengali: ["গোড়ালি ব্যথা", "গোড়ালিতে ব্যথা"],
    english: ["Heel Pain"],
    specialty: "Orthopedics (অর্থোপেডিক্স)",
    severity: "mild"
  },
  bone_fracture: {
    bengali: ["হাড় ভেঙে যাওয়া"],
    english: ["Bone Fracture"],
    specialty: "Orthopedics (অর্থোপেডিক্স)",
    severity: "emergency"
  },
  sprain: {
    bengali: ["মচকানো"],
    english: ["Sprain"],
    specialty: "Orthopedics (অর্থোপেডিক্স)",
    severity: "moderate"
  },
  muscle_strain: {
    bengali: ["পেশী টান"],
    english: ["Muscle Strain"],
    specialty: "Orthopedics (অর্থোপেডিক্স)",
    severity: "moderate"
  },
  swollen_fingers: {
    bengali: ["আঙুল ফুলে যাওয়া"],
    english: ["Swollen Fingers"],
    specialty: "Orthopedics (অর্থোপেডিক্স)",
    severity: "mild"
  },
  toe_pain: {
    bengali: ["পায়ের আঙুল ব্যথা"],
    english: ["Toe Pain"],
    specialty: "Orthopedics (অর্থোপেডিক্স)",
    severity: "mild"
  },
  skin_peeling: {
    bengali: ["ত্বক খোসা ওঠা"],
    english: ["Skin Peeling"],
    specialty: "Dermatology (চর্মরোগ বিশেষজ্ঞ)",
    severity: "mild"
  },
  blisters: {
    bengali: ["ত্বকে ফোস্কা"],
    english: ["Blisters"],
    specialty: "Dermatology (চর্মরোগ বিশেষজ্ঞ)",
    severity: "moderate"
  },
  dark_spots: {
    bengali: ["ত্বক কালো দাগ"],
    english: ["Dark Spots"],
    specialty: "Dermatology (চর্মরোগ বিশেষজ্ঞ)",
    severity: "mild"
  },
  cracked_skin: {
    bengali: ["ত্বকে ফাটা", "ত্বক ফেটে যাওয়া"],
    english: ["Cracked Skin"],
    specialty: "Dermatology (চর্মরোগ বিশেষজ্ঞ)",
    severity: "mild"
  },
  brittle_nails: {
    bengali: ["নখ ভেঙে যাওয়া"],
    english: ["Brittle Nails"],
    specialty: "Dermatology (চর্মরোগ বিশেষজ্ঞ)",
    severity: "mild"
  },
  nail_discoloration: {
    bengali: ["নখ কালো হওয়া"],
    english: ["Nail Discoloration"],
    specialty: "Dermatology (চর্মরোগ বিশেষজ্ঞ)",
    severity: "mild"
  },
  nail_infection: {
    bengali: ["নখের সংক্রমণ"],
    english: ["Nail Infection"],
    specialty: "Dermatology (চর্মরোগ বিশেষজ্ঞ)",
    severity: "moderate"
  },
  allergy: {
    bengali: ["অ্যালার্জি"],
    english: ["Allergy"],
    specialty: "Allergy (অ্যালার্জি বিশেষজ্ঞ)",
    severity: "mild"
  },
  allergic_rash: {
    bengali: ["অ্যালার্জি র‍্যাশ"],
    english: ["Allergic Rash"],
    specialty: "Dermatology (চর্মরোগ বিশেষজ্ঞ)",
    severity: "mild"
  },
  allergic_breathing: {
    bengali: ["শ্বাসকষ্ট অ্যালার্জি"],
    english: ["Allergic Breathing"],
    specialty: "Pulmonology (পালমোনোলজি)",
    severity: "moderate"
  },
  allergic_itch: {
    bengali: ["চুলকানি অ্যালার্জি"],
    english: ["Allergic Itch"],
    specialty: "Dermatology (চর্মরোগ বিশেষজ্ঞ)",
    severity: "mild"
  },
  eye_allergy: {
    bengali: ["চোখে অ্যালার্জি"],
    english: ["Eye Allergy"],
    specialty: "Ophthalmology (চক্ষু বিশেষজ্ঞ)",
    severity: "mild"
  },
  nasal_allergy: {
    bengali: ["নাকে অ্যালার্জি"],
    english: ["Nasal Allergy"],
    specialty: "ENT (নাক-কান-গলা)",
    severity: "mild"
  },
  tingling_limbs: {
    bengali: ["হাত পা ঝিনঝিন"],
    english: ["Tingling Limbs"],
    specialty: "Neurology (নিউরোলজি)",
    severity: "moderate"
  },
  trembling_hands: {
    bengali: ["হাত কাঁপা"],
    english: ["Trembling Hands"],
    specialty: "Neurology (নিউরোলজি)",
    severity: "moderate"
  },
  trembling_legs: {
    bengali: ["পা কাঁপা"],
    english: ["Trembling Legs"],
    specialty: "Neurology (নিউরোলজি)",
    severity: "moderate"
  },
  pregnancy_dizziness: {
    bengali: ["গর্ভাবস্থায় মাথা ঘোরা"],
    english: ["Pregnancy Dizziness"],
    specialty: "Gynecology (গাইনিকোলজি)",
    severity: "moderate"
  },
  pregnancy_bleeding: {
    bengali: ["গর্ভাবস্থায় রক্তপাত"],
    english: ["Pregnancy Bleeding"],
    specialty: "Gynecology (গাইনিকোলজি)",
    severity: "emergency"
  },
  breast_pain: {
    bengali: ["স্তনে ব্যথা"],
    english: ["Breast Pain"],
    specialty: "Gynecology (গাইনিকোলজি)",
    severity: "moderate"
  },
  breast_lump: {
    bengali: ["স্তনে গাঁট"],
    english: ["Breast Lump"],
    specialty: "Gynecology (গাইনিকোলজি)",
    severity: "moderate"
  },
  menopause_symptoms: {
    bengali: ["মেনোপজ সমস্যা"],
    english: ["Menopause Symptoms"],
    specialty: "Gynecology (গাইনিকোলজি)",
    severity: "mild"
  },
  hot_flashes: {
    bengali: ["হট ফ্ল্যাশ"],
    english: ["Hot Flashes"],
    specialty: "Gynecology (গাইনিকোলজি)",
    severity: "mild"
  },
  labour_pain: {
    bengali: ["প্রসব ব্যথা"],
    english: ["Labour Pain"],
    specialty: "Gynecology (গাইনিকোলজি)",
    severity: "emergency"
  },
  postpartum_bleeding: {
    bengali: ["প্রসব পর রক্তপাত"],
    english: ["Postpartum Bleeding"],
    specialty: "Gynecology (গাইনিকোলজি)",
    severity: "emergency"
  },
  poor_feeding_child: {
    bengali: ["শিশুর খাওয়া কমে যাওয়া"],
    english: ["Poor Feeding Child"],
    specialty: "Pediatrics (শিশুরোগ বিশেষজ্ঞ)",
    severity: "moderate"
  },
  excessive_crying_child: {
    bengali: ["শিশু কাঁদছে বেশি"],
    english: ["Excessive Crying Child"],
    specialty: "Pediatrics (শিশুরোগ বিশেষজ্ঞ)",
    severity: "moderate"
  },
  prolonged_child_fever: {
    bengali: ["শিশুর জ্বর ৩ দিনের বেশি"],
    english: ["Prolonged Child Fever"],
    specialty: "Pediatrics (শিশুরোগ বিশেষজ্ঞ)",
    severity: "moderate"
  },
  child_dehydration: {
    bengali: ["শিশুর পানিশূন্যতা"],
    english: ["Child Dehydration"],
    specialty: "Pediatrics (শিশুরোগ বিশেষজ্ঞ)",
    severity: "moderate"
  },
  child_skin_rash: {
    bengali: ["শিশুর ত্বক র‍্যাশ"],
    english: ["Child Skin Rash"],
    specialty: "Pediatrics (শিশুরোগ বিশেষজ্ঞ)",
    severity: "mild"
  },
  child_runny_nose: {
    bengali: ["শিশুর নাক দিয়ে পানি"],
    english: ["Child Runny Nose"],
    specialty: "Pediatrics (শিশুরোগ বিশেষজ্ঞ)",
    severity: "mild"
  },
  child_ear_pain: {
    bengali: ["শিশুর কানে ব্যথা", "শিশুর কান ব্যথা"],
    english: ["Child Ear Pain"],
    specialty: "Pediatrics (শিশুরোগ বিশেষজ্ঞ)",
    severity: "moderate"
  },
  child_stomach_pain: {
    bengali: ["শিশুর পেট ব্যথা"],
    english: ["Child Stomach Pain"],
    specialty: "Pediatrics (শিশুরোগ বিশেষজ্ঞ)",
    severity: "moderate"
  },
  child_vomiting: {
    bengali: ["শিশুর বমি"],
    english: ["Child Vomiting"],
    specialty: "Pediatrics (শিশুরোগ বিশেষজ্ঞ)",
    severity: "moderate"
  },
  child_breathing_issue: {
    bengali: ["শিশুর শ্বাসকষ্ট"],
    english: ["Child Breathing Issue"],
    specialty: "Pediatrics (শিশুরোগ বিশেষজ্ঞ)",
    severity: "emergency"
  },
  child_convulsion: {
    bengali: ["শিশুর খিঁচুনি"],
    english: ["Child Convulsion"],
    specialty: "Pediatrics (শিশুরোগ বিশেষজ্ঞ)",
    severity: "emergency"
  },
  sudden_heart_racing: {
    bengali: ["হঠাৎ বুক ধড়ফড়"],
    english: ["Sudden Heart Racing"],
    specialty: "Cardiology (কার্ডিওলজি)",
    severity: "moderate"
  },
  cardiac_pressure: {
    bengali: ["হৃদপিণ্ডে চাপ"],
    english: ["Cardiac Pressure"],
    specialty: "Cardiology (কার্ডিওলজি)",
    severity: "moderate"
  },
  breathlessness_on_exertion: {
    bengali: ["ব্যায়ামে শ্বাসকষ্ট"],
    english: ["Breathlessness on Exertion"],
    specialty: "Cardiology (কার্ডিওলজি)",
    severity: "moderate"
  },
  night_breathlessness: {
    bengali: ["রাতে শ্বাসকষ্ট"],
    english: ["Night Breathlessness"],
    specialty: "Cardiology (কার্ডিওলজি)",
    severity: "moderate"
  },
  audible_heartbeat: {
    bengali: ["হৃদকম্পন শোনা যাচ্ছে"],
    english: ["Audible Heartbeat"],
    specialty: "Cardiology (কার্ডিওলজি)",
    severity: "mild"
  },
  slow_heart_rate: {
    bengali: ["হৃদস্পন্দন ধীর"],
    english: ["Slow Heart Rate"],
    specialty: "Cardiology (কার্ডিওলজি)",
    severity: "moderate"
  },
  fast_heart_rate: {
    bengali: ["হৃদস্পন্দন দ্রুত"],
    english: ["Fast Heart Rate"],
    specialty: "Cardiology (কার্ডিওলজি)",
    severity: "moderate"
  },
  burning_chest_pain: {
    bengali: ["বুকে জ্বালা ব্যথা"],
    english: ["Burning Chest Pain"],
    specialty: "Cardiology (কার্ডিওলজি)",
    severity: "moderate"
  },
  orthopnea: {
    bengali: ["শুয়ে থাকলে শ্বাসকষ্ট"],
    english: ["Orthopnea"],
    specialty: "Cardiology (কার্ডিওলজি)",
    severity: "moderate"
  },
  sudden_weakness: {
    bengali: ["হঠাৎ দুর্বলতা"],
    english: ["Sudden Weakness"],
    specialty: "Neurology (নিউরোলজি)",
    severity: "moderate"
  },
  arm_weakness: {
    bengali: ["হাতের শক্তি কমে যাওয়া"],
    english: ["Arm Weakness"],
    specialty: "Neurology (নিউরোলজি)",
    severity: "moderate"
  },
  leg_weakness: {
    bengali: ["পায়ের শক্তি কমে যাওয়া"],
    english: ["Leg Weakness"],
    specialty: "Neurology (নিউরোলজি)",
    severity: "moderate"
  },
  slurred_speech: {
    bengali: ["হঠাৎ কথা জড়িয়ে যাওয়া"],
    english: ["Slurred Speech"],
    specialty: "Neurology (নিউরোলজি)",
    severity: "emergency"
  },
  head_pressure: {
    bengali: ["মাথায় চাপ অনুভব"],
    english: ["Head Pressure"],
    specialty: "Neurology (নিউরোলজি)",
    severity: "mild"
  },
  limb_numbness: {
    bengali: ["হাত পা অবশ হয়ে যাওয়া"],
    english: ["Limb Numbness"],
    specialty: "Neurology (নিউরোলজি)",
    severity: "moderate"
  },
  leg_tingling: {
    bengali: ["পায়ে ঝিনঝিনি"],
    english: ["Leg Tingling"],
    specialty: "Neurology (নিউরোলজি)",
    severity: "mild"
  },
  hand_tingling: {
    bengali: ["হাত ঝিনঝিনি"],
    english: ["Hand Tingling"],
    specialty: "Neurology (নিউরোলজি)",
    severity: "mild"
  },
  neck_rigidity: {
    bengali: ["ঘাড় শক্ত হয়ে যাওয়া"],
    english: ["Neck Rigidity"],
    specialty: "Neurology (নিউরোলজি)",
    severity: "moderate"
  },
  heavy_head_feeling: {
    bengali: ["মাথা ভার লাগা"],
    english: ["Heavy Head Feeling"],
    specialty: "Neurology (নিউরোলজি)",
    severity: "mild"
  },
  unsteady_walking: {
    bengali: ["হাঁটার সময় টালমাটাল"],
    english: ["Unsteady Walking"],
    specialty: "Neurology (নিউরোলজি)",
    severity: "moderate"
  },
  nose_bleed: {
    bengali: ["নাক দিয়ে রক্ত", "নাকে রক্ত পড়া"],
    english: ["Nose Bleed"],
    specialty: "ENT (নাক-কান-গলা)",
    severity: "moderate"
  },
  nasal_burning: {
    bengali: ["নাকে জ্বালা"],
    english: ["Nasal Burning"],
    specialty: "ENT (নাক-কান-গলা)",
    severity: "mild"
  },
  nasal_pain: {
    bengali: ["নাকের ভেতর ব্যথা", "নাকে ব্যথা"],
    english: ["Nasal Pain"],
    specialty: "ENT (নাক-কান-গলা)",
    severity: "mild"
  },
  throat_phlegm: {
    bengali: ["গলায় কফ জমা"],
    english: ["Throat Phlegm"],
    specialty: "ENT (নাক-কান-গলা)",
    severity: "mild"
  },
  throat_burning: {
    bengali: ["গলায় জ্বালা"],
    english: ["Throat Burning"],
    specialty: "ENT (নাক-কান-গলা)",
    severity: "mild"
  },
  painful_swallowing: {
    bengali: ["গিলতে গেলে ব্যথা"],
    english: ["Painful Swallowing"],
    specialty: "ENT (নাক-কান-গলা)",
    severity: "moderate"
  },
  ear_buzzing: {
    bengali: ["কানে বাজা"],
    english: ["Ear Buzzing"],
    specialty: "ENT (নাক-কান-গলা)",
    severity: "mild"
  },
  ear_pressure: {
    bengali: ["কানে চাপ অনুভব"],
    english: ["Ear Pressure"],
    specialty: "ENT (নাক-কান-গলা)",
    severity: "mild"
  },
  ear_itching: {
    bengali: ["কানে চুলকানি"],
    english: ["Ear Itching"],
    specialty: "ENT (নাক-কান-গলা)",
    severity: "mild"
  },
  ear_fullness: {
    bengali: ["কানে ভারী লাগা"],
    english: ["Ear Fullness"],
    specialty: "ENT (নাক-কান-গলা)",
    severity: "mild"
  },
  labored_breathing: {
    bengali: ["শ্বাসে কষ্টের শব্দ"],
    english: ["Labored Breathing"],
    specialty: "Pulmonology (পালমোনোলজি)",
    severity: "emergency"
  },
  difficulty_deep_breathing: {
    bengali: ["গভীর শ্বাস নিতে কষ্ট"],
    english: ["Difficulty Deep Breathing"],
    specialty: "Pulmonology (পালমোনোলজি)",
    severity: "moderate"
  },
  chest_pulling_sensation: {
    bengali: ["বুকে টান"],
    english: ["Chest Pulling Sensation"],
    specialty: "Pulmonology (পালমোনোলজি)",
    severity: "moderate"
  },
  rapid_breathing: {
    bengali: ["শ্বাসের গতি বেড়ে যাওয়া"],
    english: ["Rapid Breathing"],
    specialty: "Pulmonology (পালমোনোলজি)",
    severity: "moderate"
  },
  shallow_breathing: {
    bengali: ["শ্বাস ছোট হয়ে যাওয়া"],
    english: ["Shallow Breathing"],
    specialty: "Pulmonology (পালমোনোলজি)",
    severity: "moderate"
  },
  breathing_blockage: {
    bengali: ["শ্বাস আটকে যাওয়া"],
    english: ["Breathing Blockage"],
    specialty: "Pulmonology (পালমোনোলজি)",
    severity: "emergency"
  },
  hard_abdomen: {
    bengali: ["পেট শক্ত লাগা"],
    english: ["Hard Abdomen"],
    specialty: "Gastroenterology (গ্যাস্ট্রোএন্টারোলজি)",
    severity: "moderate"
  },
  abdominal_cramping: {
    bengali: ["পেট মোচড়ানো"],
    english: ["Abdominal Cramping"],
    specialty: "Gastroenterology (গ্যাস্ট্রোএন্টারোলজি)",
    severity: "moderate"
  },
  stomach_rumbling: {
    bengali: ["পেট গুড়গুড় শব্দ"],
    english: ["Stomach Rumbling"],
    specialty: "Gastroenterology (গ্যাস্ট্রোএন্টারোলজি)",
    severity: "mild"
  },
  excessive_burping: {
    bengali: ["অতিরিক্ত ঢেকুর"],
    english: ["Excessive Burping"],
    specialty: "Gastroenterology (গ্যাস্ট্রোএন্টারোলজি)",
    severity: "mild"
  },
  vomiting_blood: {
    bengali: ["বমির সাথে রক্ত"],
    english: ["Vomiting Blood"],
    specialty: "Gastroenterology (গ্যাস্ট্রোএন্টারোলজি)",
    severity: "emergency"
  },
  bitter_taste_mouth: {
    bengali: ["মুখে তিক্ত স্বাদ"],
    english: ["Bitter Taste Mouth"],
    specialty: "Gastroenterology (গ্যাস্ট্রোএন্টারোলজি)",
    severity: "mild"
  },
  food_stuck_throat: {
    bengali: ["খাবার গলায় আটকে যাওয়া"],
    english: ["Food Stuck Throat"],
    specialty: "Gastroenterology (গ্যাস্ট্রোএন্টারোলজি)",
    severity: "moderate"
  },
  esophageal_burning: {
    bengali: ["গলায় জ্বালাপোড়া"],
    english: ["Esophageal Burning"],
    specialty: "Gastroenterology (গ্যাস্ট্রোএন্টারোলজি)",
    severity: "mild"
  },
  right_abdomen_pain: {
    bengali: ["পেটের ডান পাশে ব্যথা"],
    english: ["Right Abdomen Pain"],
    specialty: "Gastroenterology (গ্যাস্ট্রোএন্টারোলজি)",
    severity: "moderate"
  },
  left_abdomen_pain: {
    bengali: ["পেটের বাম পাশে ব্যথা"],
    english: ["Left Abdomen Pain"],
    specialty: "Gastroenterology (গ্যাস্ট্রোএন্টারোলজি)",
    severity: "moderate"
  },
  arm_stiffness: {
    bengali: ["হাত শক্ত হয়ে যাওয়া"],
    english: ["Arm Stiffness"],
    specialty: "Orthopedics (অর্থোপেডিক্স)",
    severity: "mild"
  },
  leg_stiffness: {
    bengali: ["পা শক্ত হয়ে যাওয়া"],
    english: ["Leg Stiffness"],
    specialty: "Orthopedics (অর্থোপেডিক্স)",
    severity: "mild"
  },
  knee_locking: {
    bengali: ["হাঁটু লক হয়ে যাওয়া"],
    english: ["Knee Locking"],
    specialty: "Orthopedics (অর্থোপেডিক্স)",
    severity: "moderate"
  },
  difficulty_moving_arm: {
    bengali: ["হাত নাড়াতে কষ্ট"],
    english: ["Difficulty Moving Arm"],
    specialty: "Orthopedics (অর্থোপেডিক্স)",
    severity: "moderate"
  },
  difficulty_moving_leg: {
    bengali: ["পা নাড়াতে কষ্ট"],
    english: ["Difficulty Moving Leg"],
    specialty: "Orthopedics (অর্থোপেডিক্স)",
    severity: "moderate"
  },
  bone_tenderness: {
    bengali: ["হাড়ে চাপ দিলে ব্যথা"],
    english: ["Bone Tenderness"],
    specialty: "Orthopedics (অর্থোপেডিক্স)",
    severity: "moderate"
  },
  warm_joint: {
    bengali: ["জয়েন্টে গরম লাগা"],
    english: ["Warm Joint"],
    specialty: "Orthopedics (অর্থোপেডিক্স)",
    severity: "moderate"
  },
  shoulder_movement_pain: {
    bengali: ["কাঁধ নাড়াতে কষ্ট"],
    english: ["Shoulder Movement Pain"],
    specialty: "Orthopedics (অর্থোপেডিক্স)",
    severity: "moderate"
  },
  spine_pain: {
    bengali: ["মেরুদণ্ড ব্যথা"],
    english: ["Spine Pain"],
    specialty: "Orthopedics (অর্থোপেডিক্স)",
    severity: "moderate"
  },
  ankle_swelling: {
    bengali: ["গোড়ালি ফুলে যাওয়া"],
    english: ["Ankle Swelling"],
    specialty: "Orthopedics (অর্থোপেডিক্স)",
    severity: "moderate"
  },
  red_skin_swelling: {
    bengali: ["ত্বকে লাল ফোলা"],
    english: ["Red Skin Swelling"],
    specialty: "Dermatology (চর্মরোগ বিশেষজ্ঞ)",
    severity: "mild"
  },
  skin_irritation: {
    bengali: ["ত্বকে জ্বালাপোড়া"],
    english: ["Skin Irritation"],
    specialty: "Dermatology (চর্মরোগ বিশেষজ্ঞ)",
    severity: "mild"
  },
  fluid_blisters: {
    bengali: ["ত্বকে পানি ভর্তি ফুসকুড়ি"],
    english: ["Fluid Blisters"],
    specialty: "Dermatology (চর্মরোগ বিশেষজ্ঞ)",
    severity: "moderate"
  },
  skin_nodules: {
    bengali: ["ত্বকে শক্ত গাঁট"],
    english: ["Skin Nodules"],
    specialty: "Dermatology (চর্মরোগ বিশেষজ্ঞ)",
    severity: "moderate"
  },
  peeling_itch_skin: {
    bengali: ["ত্বকে খোসা ওঠা চুলকানি"],
    english: ["Peeling Itch Skin"],
    specialty: "Dermatology (চর্মরোগ বিশেষজ্ঞ)",
    severity: "mild"
  },
  scalp_dandruff: {
    bengali: ["মাথার ত্বকে খুশকি"],
    english: ["Scalp Dandruff"],
    specialty: "Dermatology (চর্মরোগ বিশেষজ্ঞ)",
    severity: "mild"
  },
  scalp_itch: {
    bengali: ["মাথার ত্বক চুলকানি"],
    english: ["Scalp Itch"],
    specialty: "Dermatology (চর্মরোগ বিশেষজ্ঞ)",
    severity: "mild"
  },
  thin_skin: {
    bengali: ["ত্বক পাতলা হওয়া"],
    english: ["Thin Skin"],
    specialty: "Dermatology (চর্মরোগ বিশেষজ্ঞ)",
    severity: "mild"
  },
  spreading_dark_spots: {
    bengali: ["ত্বকে কালো দাগ ছড়ানো"],
    english: ["Spreading Dark Spots"],
    specialty: "Dermatology (চর্মরোগ বিশেষজ্ঞ)",
    severity: "moderate"
  },
  burning_red_rash: {
    bengali: ["ত্বকে জ্বালা সহ লাল দাগ"],
    english: ["Burning Red Rash"],
    specialty: "Dermatology (চর্মরোগ বিশেষজ্ঞ)",
    severity: "moderate"
  },
  child_bloating: {
    bengali: ["শিশুর পেট ফাঁপা"],
    english: ["Child Bloating"],
    specialty: "Pediatrics (শিশুরোগ বিশেষজ্ঞ)",
    severity: "mild"
  },
  child_post_meal_vomit: {
    bengali: ["শিশুর খাওয়ার পর বমি"],
    english: ["Child Post Meal Vomit"],
    specialty: "Pediatrics (শিশুরোগ বিশেষজ্ঞ)",
    severity: "moderate"
  },
  child_excess_sweat: {
    bengali: ["শিশুর অতিরিক্ত ঘাম"],
    english: ["Child Excess Sweat"],
    specialty: "Pediatrics (শিশুরোগ বিশেষজ্ঞ)",
    severity: "mild"
  },
  child_poor_sleep: {
    bengali: ["শিশুর ঘুম কম"],
    english: ["Child Poor Sleep"],
    specialty: "Pediatrics (শিশুরোগ বিশেষজ্ঞ)",
    severity: "mild"
  },
  child_dry_skin: {
    bengali: ["শিশুর ত্বক শুষ্ক"],
    english: ["Child Dry Skin"],
    specialty: "Pediatrics (শিশুরোগ বিশেষজ্ঞ)",
    severity: "mild"
  },
  child_night_cough: {
    bengali: ["শিশুর কাশি রাতে বাড়ে"],
    english: ["Child Night Cough"],
    specialty: "Pediatrics (শিশুরোগ বিশেষজ্ঞ)",
    severity: "moderate"
  },
  child_throat_phlegm: {
    bengali: ["শিশুর গলায় কফ"],
    english: ["Child Throat Phlegm"],
    specialty: "Pediatrics (শিশুরোগ বিশেষজ্ঞ)",
    severity: "mild"
  },
  child_rapid_breathing: {
    bengali: ["শিশুর শ্বাস দ্রুত"],
    english: ["Child Rapid Breathing"],
    specialty: "Pediatrics (শিশুরোগ বিশেষজ্ঞ)",
    severity: "moderate"
  },
  child_blue_lips: {
    bengali: ["শিশুর ঠোঁট নীল"],
    english: ["Child Blue Lips"],
    specialty: "Pediatrics (শিশুরোগ বিশেষজ্ঞ)",
    severity: "emergency"
  },
  child_eye_swelling: {
    bengali: ["শিশুর চোখ ফুলে যাওয়া"],
    english: ["Child Eye Swelling"],
    specialty: "Pediatrics (শিশুরোগ বিশেষজ্ঞ)",
    severity: "moderate"
  },
  period_dizziness: {
    bengali: ["মাসিকের সময় মাথা ঘোরা"],
    english: ["Period Dizziness"],
    specialty: "Gynecology (গাইনিকোলজি)",
    severity: "mild"
  },
  period_vomiting: {
    bengali: ["মাসিকের সময় বমি"],
    english: ["Period Vomiting"],
    specialty: "Gynecology (গাইনিকোলজি)",
    severity: "mild"
  },
  delayed_period: {
    bengali: ["মাসিক দেরি হওয়া"],
    english: ["Delayed Period"],
    specialty: "Gynecology (গাইনিকোলজি)",
    severity: "mild"
  },
  severe_menstrual_pain: {
    bengali: ["মাসিকের সময় তীব্র ব্যথা"],
    english: ["Severe Menstrual Pain"],
    specialty: "Gynecology (গাইনিকোলজি)",
    severity: "moderate"
  },
  vaginal_burning: {
    bengali: ["যোনিতে জ্বালা"],
    english: ["Vaginal Burning"],
    specialty: "Gynecology (গাইনিকোলজি)",
    severity: "moderate"
  },
  vaginal_odor: {
    bengali: ["যোনিতে দুর্গন্ধ"],
    english: ["Vaginal Odor"],
    specialty: "Gynecology (গাইনিকোলজি)",
    severity: "moderate"
  },
  vaginal_white_discharge: {
    bengali: ["যোনিতে সাদা স্রাব"],
    english: ["Vaginal White Discharge"],
    specialty: "Gynecology (গাইনিকোলজি)",
    severity: "mild"
  },
  breast_itching: {
    bengali: ["স্তনে চুলকানি"],
    english: ["Breast Itching"],
    specialty: "Gynecology (গাইনিকোলজি)",
    severity: "mild"
  },
  breast_swelling: {
    bengali: ["স্তনে ফোলা"],
    english: ["Breast Swelling"],
    specialty: "Gynecology (গাইনিকোলজি)",
    severity: "moderate"
  },
  breast_red_patch: {
    bengali: ["স্তনে লালচে দাগ"],
    english: ["Breast Red Patch"],
    specialty: "Gynecology (গাইনিকোলজি)",
    severity: "moderate"
  },
  gum_swelling: {
    bengali: ["দাঁতের মাড়ি ফুলে যাওয়া"],
    english: ["Gum Swelling"],
    specialty: "Dentistry (ডেন্টিস্ট)",
    severity: "moderate"
  },
  dental_abscess: {
    bengali: ["দাঁতের ফোঁড়া"],
    english: ["Dental Abscess"],
    specialty: "Dentistry (ডেন্টিস্ট)",
    severity: "emergency"
  },
  gum_pain: {
    bengali: ["মাড়িতে ব্যথা"],
    english: ["Gum Pain"],
    specialty: "Dentistry (ডেন্টিস্ট)",
    severity: "moderate"
  },
  jaw_stiffness: {
    bengali: ["চোয়াল শক্ত হয়ে যাওয়া"],
    english: ["Jaw Stiffness"],
    specialty: "Dentistry (ডেন্টিস্ট)",
    severity: "moderate"
  },
  difficulty_opening_jaw: {
    bengali: ["চোয়াল খুলতে কষ্ট"],
    english: ["Difficulty Opening Jaw"],
    specialty: "Dentistry (ডেন্টিস্ট)",
    severity: "moderate"
  },
  tooth_cavity: {
    bengali: ["দাঁতের গর্ত"],
    english: ["Tooth Cavity"],
    specialty: "Dentistry (ডেন্টিস্ট)",
    severity: "mild"
  },
  mouth_burning: {
    bengali: ["মুখে জ্বালা"],
    english: ["Mouth Burning"],
    specialty: "Dentistry (ডেন্টিস্ট)",
    severity: "mild"
  },
  swollen_tongue: {
    bengali: ["জিহ্বা ফুলে যাওয়া"],
    english: ["Swollen Tongue"],
    specialty: "Dentistry (ডেন্টিস্ট)",
    severity: "moderate"
  },
  mouth_corner_ulcer: {
    bengali: ["মুখের কোণে ঘা"],
    english: ["Mouth Corner Ulcer"],
    specialty: "Dentistry (ডেন্টিস্ট)",
    severity: "mild"
  },
  oral_white_patch: {
    bengali: ["মুখের ভেতর সাদা দাগ"],
    english: ["Oral White Patch"],
    specialty: "Dentistry (ডেন্টিস্ট)",
    severity: "moderate"
  },
  sudden_body_cold: {
    bengali: ["হঠাৎ শরীর ঠান্ডা হয়ে যাওয়া"],
    english: ["Sudden Body Cold"],
    specialty: "General Medicine (সাধারণ মেডিসিন)",
    severity: "moderate"
  },
  body_shivering: {
    bengali: ["শরীর কাঁপা"],
    english: ["Body Shivering"],
    specialty: "General Medicine (সাধারণ মেডিসিন)",
    severity: "mild"
  },
  body_heat_sensation: {
    bengali: ["শরীর গরম লাগা"],
    english: ["Body Heat Sensation"],
    specialty: "General Medicine (সাধারণ মেডিসিন)",
    severity: "mild"
  },
  sudden_sweating: {
    bengali: ["হঠাৎ অতিরিক্ত ঘাম"],
    english: ["Sudden Sweating"],
    specialty: "General Medicine (সাধারণ মেডিসিন)",
    severity: "moderate"
  },
  body_weakness: {
    bengali: ["শরীরে দুর্বলতা"],
    english: ["Body Weakness"],
    specialty: "General Medicine (সাধারণ মেডিসিন)",
    severity: "mild"
  },
  body_heaviness: {
    bengali: ["শরীরে ভার লাগা"],
    english: ["Body Heaviness"],
    specialty: "General Medicine (সাধারণ মেডিসিন)",
    severity: "mild"
  },
  body_discomfort: {
    bengali: ["শরীরে অস্বস্তি"],
    english: ["Body Discomfort"],
    specialty: "General Medicine (সাধারণ মেডিসিন)",
    severity: "mild"
  },
  body_numbness: {
    bengali: ["শরীর অবশ লাগা"],
    english: ["Body Numbness"],
    specialty: "Neurology (নিউরোলজি)",
    severity: "moderate"
  },
  sudden_balance_loss: {
    bengali: ["হঠাৎ ভারসাম্য হারানো"],
    english: ["Sudden Balance Loss"],
    specialty: "Neurology (নিউরোলজি)",
    severity: "emergency"
  },
  sudden_vision_blackout: {
    bengali: ["হঠাৎ অন্ধকার দেখা"],
    english: ["Sudden Vision Blackout"],
    specialty: "Neurology (নিউরোলজি)",
    severity: "emergency"
  },
  eye_pressure: {
    bengali: ["চোখে চাপ অনুভব"],
    english: ["Eye Pressure"],
    specialty: "Ophthalmology (চক্ষু বিশেষজ্ঞ)",
    severity: "moderate"
  },
  eye_twitching: {
    bengali: ["চোখে কাঁপুনি"],
    english: ["Eye Twitching"],
    specialty: "Ophthalmology (চক্ষু বিশেষজ্ঞ)",
    severity: "mild"
  },
  hazy_vision: {
    bengali: ["চোখে ধোঁয়াটে দেখা"],
    english: ["Hazy Vision"],
    specialty: "Ophthalmology (চক্ষু বিশেষজ্ঞ)",
    severity: "moderate"
  },
  eyelid_twitch: {
    bengali: ["চোখের পাতা কাঁপা"],
    english: ["Eyelid Twitch"],
    specialty: "Ophthalmology (চক্ষু বিশেষজ্ঞ)",
    severity: "mild"
  },
  eye_pain_with_tears: {
    bengali: ["চোখে ব্যথা সহ পানি"],
    english: ["Eye Pain With Tears"],
    specialty: "Ophthalmology (চক্ষু বিশেষজ্ঞ)",
    severity: "moderate"
  },
  eye_pus: {
    bengali: ["চোখে পুঁজ পড়া"],
    english: ["Eye Pus"],
    specialty: "Ophthalmology (চক্ষু বিশেষজ্ঞ)",
    severity: "moderate"
  },
  dry_eyes: {
    bengali: ["চোখ শুকিয়ে যাওয়া"],
    english: ["Dry Eyes"],
    specialty: "Ophthalmology (চক্ষু বিশেষজ্ঞ)",
    severity: "mild"
  },
  eye_pressure_pain: {
    bengali: ["চোখে চাপ ব্যথা"],
    english: ["Eye Pressure Pain"],
    specialty: "Ophthalmology (চক্ষু বিশেষজ্ঞ)",
    severity: "moderate"
  },
  eye_socket_pain: {
    bengali: ["চোখের চারপাশে ব্যথা"],
    english: ["Eye Socket Pain"],
    specialty: "Ophthalmology (চক্ষু বিশেষজ্ঞ)",
    severity: "moderate"
  },
  eyelid_swelling: {
    bengali: ["চোখের পাতা ফুলে যাওয়া"],
    english: ["Eyelid Swelling"],
    specialty: "Ophthalmology (চক্ষু বিশেষজ্ঞ)",
    severity: "moderate"
  },
  choking_sensation: {
    bengali: ["গলায় আটকে যাওয়া অনুভূতি"],
    english: ["Choking Sensation"],
    specialty: "ENT (নাক-কান-গলা)",
    severity: "moderate"
  },
  dry_throat_feeling: {
    bengali: ["গলায় শুকনো ভাব"],
    english: ["Dry Throat Feeling"],
    specialty: "ENT (নাক-কান-গলা)",
    severity: "mild"
  },
  throat_itching: {
    bengali: ["গলায় চুলকানি"],
    english: ["Throat Itching"],
    specialty: "ENT (নাক-কান-গলা)",
    severity: "mild"
  },
  throat_swelling: {
    bengali: ["গলায় ফোলা"],
    english: ["Throat Swelling"],
    specialty: "ENT (নাক-কান-গলা)",
    severity: "moderate"
  },
  voice_break: {
    bengali: ["কণ্ঠস্বর ভেঙে যাওয়া"],
    english: ["Voice Break"],
    specialty: "ENT (নাক-কান-গলা)",
    severity: "mild"
  },
  difficulty_talking: {
    bengali: ["কথা বলতে কষ্ট"],
    english: ["Difficulty Talking"],
    specialty: "ENT (নাক-কান-গলা)",
    severity: "moderate"
  },
  ear_popping: {
    bengali: ["কানে পপ শব্দ"],
    english: ["Ear Popping"],
    specialty: "ENT (নাক-কান-গলা)",
    severity: "mild"
  },
  ear_pain_with_fever: {
    bengali: ["কানে ব্যথা সহ জ্বর"],
    english: ["Ear Pain With Fever"],
    specialty: "ENT (নাক-কান-গলা)",
    severity: "moderate"
  },
  ear_fluid: {
    bengali: ["কানে পানি জমা"],
    english: ["Ear Fluid"],
    specialty: "ENT (নাক-কান-গলা)",
    severity: "moderate"
  },
  loud_ear_noise: {
    bengali: ["কানে ভারী আওয়াজ"],
    english: ["Loud Ear Noise"],
    specialty: "ENT (নাক-কান-গলা)",
    severity: "mild"
  },
  painful_inhalation: {
    bengali: ["শ্বাস নিতে গিয়ে ব্যথা"],
    english: ["Painful Inhalation"],
    specialty: "Pulmonology (পালমোনোলজি)",
    severity: "moderate"
  },
  hot_breath_feeling: {
    bengali: ["শ্বাসে গরম অনুভূতি"],
    english: ["Hot Breath Feeling"],
    specialty: "Pulmonology (পালমোনোলজি)",
    severity: "mild"
  },
  fast_breathing: {
    bengali: ["দ্রুত শ্বাস"],
    english: ["Fast Breathing"],
    specialty: "Pulmonology (পালমোনোলজি)",
    severity: "moderate"
  },
  deep_breath_pain: {
    bengali: ["গভীর শ্বাস নিতে ব্যথা"],
    english: ["Deep Breath Pain"],
    specialty: "Pulmonology (পালমোনোলজি)",
    severity: "moderate"
  },
  breath_block_feeling: {
    bengali: ["শ্বাস আটকে যাওয়ার অনুভূতি"],
    english: ["Breath Block Feeling"],
    specialty: "Pulmonology (পালমোনোলজি)",
    severity: "emergency"
  },
  cold_chest_feeling: {
    bengali: ["বুকে ঠান্ডা অনুভূতি"],
    english: ["Cold Chest Feeling"],
    specialty: "Pulmonology (পালমোনোলজি)",
    severity: "mild"
  },
  heavy_chest: {
    bengali: ["বুকে ভারী অনুভূতি"],
    english: ["Heavy Chest"],
    specialty: "Pulmonology (পালমোনোলজি)",
    severity: "moderate"
  },
  squeezing_chest_pain: {
    bengali: ["বুকে চেপে ধরা ব্যথা"],
    english: ["Squeezing Chest Pain"],
    specialty: "Cardiology (কার্ডিওলজি)",
    severity: "emergency"
  },
  heart_thump: {
    bengali: ["হৃদপিণ্ডে ধাক্কা লাগা অনুভূতি"],
    english: ["Heart Thump"],
    specialty: "Cardiology (কার্ডিওলজি)",
    severity: "moderate"
  },
  abnormal_heart_beat: {
    bengali: ["হৃদকম্পন অস্বাভাবিক"],
    english: ["Abnormal Heart Beat"],
    specialty: "Cardiology (কার্ডিওলজি)",
    severity: "moderate"
  },
  hard_stomach: {
    bengali: ["পেট শক্ত হয়ে যাওয়া"],
    english: ["Hard Stomach"],
    specialty: "Gastroenterology (গ্যাস্ট্রোএন্টারোলজি)",
    severity: "moderate"
  },
  stomach_pulling: {
    bengali: ["পেটে টান ধরা"],
    english: ["Stomach Pulling"],
    specialty: "Gastroenterology (গ্যাস্ট্রোএন্টারোলজি)",
    severity: "moderate"
  },
  stomach_flutter: {
    bengali: ["পেট কাঁপা"],
    english: ["Stomach Flutter"],
    specialty: "Gastroenterology (গ্যাস্ট্রোএন্টারোলজি)",
    severity: "mild"
  },
  internal_stomach_burning: {
    bengali: ["পেটের ভেতর জ্বালা"],
    english: ["Internal Stomach Burning"],
    specialty: "Gastroenterology (গ্যাস্ট্রোএন্টারোলজি)",
    severity: "mild"
  },
  pain_after_eating: {
    bengali: ["খাবার খেলেই ব্যথা"],
    english: ["Pain After Eating"],
    specialty: "Gastroenterology (গ্যাস্ট্রোএন্টারোলজি)",
    severity: "moderate"
  },
  vomit_after_food: {
    bengali: ["খাবার খেলে বমি"],
    english: ["Vomit After Food"],
    specialty: "Gastroenterology (গ্যাস্ট্রোএন্টারোলজি)",
    severity: "moderate"
  },
  excess_hunger: {
    bengali: ["অতিরিক্ত ক্ষুধা"],
    english: ["Excess Hunger"],
    specialty: "Gastroenterology (গ্যাস্ট্রোএন্টারোলজি)",
    severity: "mild"
  },
  food_aversion: {
    bengali: ["খাবারে অরুচি"],
    english: ["Food Aversion"],
    specialty: "Gastroenterology (গ্যাস্ট্রোএন্টারোলজি)",
    severity: "mild"
  },
  pressure_abdomen: {
    bengali: ["পেটে চাপ ব্যথা"],
    english: ["Pressure Abdomen"],
    specialty: "Gastroenterology (গ্যাস্ট্রোএন্টারোলজি)",
    severity: "moderate"
  },
  bloated_hard_abdomen: {
    bengali: ["পেট ফুলে শক্ত"],
    english: ["Bloated Hard Abdomen"],
    specialty: "Gastroenterology (গ্যাস্ট্রোএন্টারোলজি)",
    severity: "moderate"
  },
  mid_back_pain: {
    bengali: ["পিঠের মাঝখানে ব্যথা"],
    english: ["Mid Back Pain"],
    specialty: "Orthopedics (অর্থোপেডিক্স)",
    severity: "mild"
  },
  spine_burning: {
    bengali: ["মেরুদণ্ডে জ্বালা"],
    english: ["Spine Burning"],
    specialty: "Orthopedics (অর্থোপেডিক্স)",
    severity: "mild"
  },
  warm_knee: {
    bengali: ["হাঁটু গরম লাগা"],
    english: ["Warm Knee"],
    specialty: "Orthopedics (অর্থোপেডিক্স)",
    severity: "moderate"
  },
  knee_strain: {
    bengali: ["হাঁটুতে টান"],
    english: ["Knee Strain"],
    specialty: "Orthopedics (অর্থোপেডিক্স)",
    severity: "moderate"
  },
  arm_rotation_pain: {
    bengali: ["হাত ঘোরাতে কষ্ট"],
    english: ["Arm Rotation Pain"],
    specialty: "Orthopedics (অর্থোপেডিক্স)",
    severity: "moderate"
  },
  leg_bending_pain: {
    bengali: ["পা ভাঁজ করতে কষ্ট"],
    english: ["Leg Bending Pain"],
    specialty: "Orthopedics (অর্থোপেডিক্স)",
    severity: "moderate"
  },
  heel_pressure_pain: {
    bengali: ["গোড়ালিতে চাপ ব্যথা"],
    english: ["Heel Pressure Pain"],
    specialty: "Orthopedics (অর্থোপেডিক্স)",
    severity: "mild"
  },
  foot_burning: {
    bengali: ["পায়ের পাতা জ্বালা"],
    english: ["Foot Burning"],
    specialty: "Orthopedics (অর্থোপেডিক্স)",
    severity: "mild"
  },
  foot_numbness: {
    bengali: ["পায়ের পাতা অবশ"],
    english: ["Foot Numbness"],
    specialty: "Neurology (নিউরোলজি)",
    severity: "moderate"
  },
  foot_tingling: {
    bengali: ["পায়ের পাতা ঝিনঝিনি"],
    english: ["Foot Tingling"],
    specialty: "Neurology (নিউরোলজি)",
    severity: "mild"
  },
  tight_skin: {
    bengali: ["ত্বক টান টান লাগা"],
    english: ["Tight Skin"],
    specialty: "Dermatology (চর্মরোগ বিশেষজ্ঞ)",
    severity: "mild"
  },
  cut_skin: {
    bengali: ["ত্বকে ফেটে যাওয়া"],
    english: ["Cut Skin"],
    specialty: "Dermatology (চর্মরোগ বিশেষজ্ঞ)",
    severity: "mild"
  },
  rough_skin: {
    bengali: ["ত্বকে রুক্ষতা"],
    english: ["Rough Skin"],
    specialty: "Dermatology (চর্মরোগ বিশেষজ্ঞ)",
    severity: "mild"
  },
  increasing_spots: {
    bengali: ["ত্বকে দাগ বেড়ে যাওয়া"],
    english: ["Increasing Spots"],
    specialty: "Dermatology (চর্মরোগ বিশেষজ্ঞ)",
    severity: "moderate"
  },
  warm_skin: {
    bengali: ["ত্বকে গরম ভাব"],
    english: ["Warm Skin"],
    specialty: "Dermatology (চর্মরোগ বিশেষজ্ঞ)",
    severity: "mild"
  },
  red_skin_lines: {
    bengali: ["ত্বকে লাল রেখা"],
    english: ["Red Skin Lines"],
    specialty: "Dermatology (চর্মরোগ বিশেষজ্ঞ)",
    severity: "moderate"
  },
  skin_hives: {
    bengali: ["ত্বকে ফোলা চাকা"],
    english: ["Skin Hives"],
    specialty: "Dermatology (চর্মরোগ বিশেষজ্ঞ)",
    severity: "moderate"
  },
  skin_lesion: {
    bengali: ["ত্বকে ক্ষত"],
    english: ["Skin Lesion"],
    specialty: "Dermatology (চর্মরোগ বিশেষজ্ঞ)",
    severity: "moderate"
  },
  dark_skin_lump: {
    bengali: ["ত্বকে কালো ফোলা"],
    english: ["Dark Skin Lump"],
    specialty: "Dermatology (চর্মরোগ বিশেষজ্ঞ)",
    severity: "moderate"
  },
  skin_infection: {
    bengali: ["ত্বকে সংক্রমণ"],
    english: ["Skin Infection"],
    specialty: "Dermatology (চর্মরোগ বিশেষজ্ঞ)",
    severity: "moderate"
  },
  child_night_fever: {
    bengali: ["শিশুর জ্বর রাতে বাড়ে"],
    english: ["Child Night Fever"],
    specialty: "Pediatrics (শিশুরোগ বিশেষজ্ঞ)",
    severity: "moderate"
  },
  child_day_cough: {
    bengali: ["শিশুর কাশি দিনে বাড়ে"],
    english: ["Child Day Cough"],
    specialty: "Pediatrics (শিশুরোগ বিশেষজ্ঞ)",
    severity: "mild"
  },
  child_sleep_cough: {
    bengali: ["শিশুর ঘুমে কাশি"],
    english: ["Child Sleep Cough"],
    specialty: "Pediatrics (শিশুরোগ বিশেষজ্ঞ)",
    severity: "moderate"
  },
  child_red_eye: {
    bengali: ["শিশুর চোখ লাল"],
    english: ["Child Red Eye"],
    specialty: "Pediatrics (শিশুরোগ বিশেষজ্ঞ)",
    severity: "moderate"
  },
  child_nasal_block: {
    bengali: ["শিশুর নাক বন্ধ"],
    english: ["Child Nasal Block"],
    specialty: "Pediatrics (শিশুরোগ বিশেষজ্ঞ)",
    severity: "mild"
  },
  child_slow_breathing: {
    bengali: ["শিশুর শ্বাস ধীর"],
    english: ["Child Slow Breathing"],
    specialty: "Pediatrics (শিশুরোগ বিশেষজ্ঞ)",
    severity: "moderate"
  },
  child_hard_abdomen: {
    bengali: ["শিশুর পেট শক্ত"],
    english: ["Child Hard Abdomen"],
    specialty: "Pediatrics (শিশুরোগ বিশেষজ্ঞ)",
    severity: "moderate"
  },
  child_skin_bumps: {
    bengali: ["শিশুর গায়ে দানা"],
    english: ["Child Skin Bumps"],
    specialty: "Pediatrics (শিশুরোগ বিশেষজ্ঞ)",
    severity: "mild"
  },
  child_red_spots: {
    bengali: ["শিশুর গায়ে লাল দাগ"],
    english: ["Child Red Spots"],
    specialty: "Pediatrics (শিশুরোগ বিশেষজ্ঞ)",
    severity: "mild"
  },
  child_refusing_food: {
    bengali: ["শিশুর খাওয়া বন্ধ"],
    english: ["Child Refusing Food"],
    specialty: "Pediatrics (শিশুরোগ বিশেষজ্ঞ)",
    severity: "moderate"
  },
  pregnancy_back_pain: {
    bengali: ["গর্ভাবস্থায় কোমর ব্যথা"],
    english: ["Pregnancy Back Pain"],
    specialty: "Gynecology (গাইনিকোলজি)",
    severity: "mild"
  },
  pregnancy_leg_swelling: {
    bengali: ["গর্ভাবস্থায় পা ফুলে যাওয়া"],
    english: ["Pregnancy Leg Swelling"],
    specialty: "Gynecology (গাইনিকোলজি)",
    severity: "moderate"
  },
  pregnancy_headache: {
    bengali: ["গর্ভাবস্থায় মাথা ব্যথা"],
    english: ["Pregnancy Headache"],
    specialty: "Gynecology (গাইনিকোলজি)",
    severity: "moderate"
  },
  pregnancy_blurred_vision: {
    bengali: ["গর্ভাবস্থায় দৃষ্টি ঝাপসা", "গর্ভাবস্থায় চোখ ঝাপসা"],
    english: ["Pregnancy Blurred Vision"],
    specialty: "Gynecology (গাইনিকোলজি)",
    severity: "emergency"
  },
  pregnancy_abdominal_pain: {
    bengali: ["গর্ভাবস্থায় পেট ব্যথা"],
    english: ["Pregnancy Abdominal Pain"],
    specialty: "Gynecology (গাইনিকোলজি)",
    severity: "moderate"
  },
  pregnancy_breathlessness: {
    bengali: ["গর্ভাবস্থায় শ্বাসকষ্ট"],
    english: ["Pregnancy Breathlessness"],
    specialty: "Gynecology (গাইনিকোলজি)",
    severity: "moderate"
  },
  pregnancy_fever: {
    bengali: ["গর্ভাবস্থায় জ্বর"],
    english: ["Pregnancy Fever"],
    specialty: "Gynecology (গাইনিকোলজি)",
    severity: "moderate"
  },
  pregnancy_severe_vomiting: {
    bengali: ["গর্ভাবস্থায় বমি বেশি"],
    english: ["Pregnancy Severe Vomiting"],
    specialty: "Gynecology (গাইনিকোলজি)",
    severity: "moderate"
  },
  pregnancy_weakness: {
    bengali: ["গর্ভাবস্থায় দুর্বলতা"],
    english: ["Pregnancy Weakness"],
    specialty: "Gynecology (গাইনিকোলজি)",
    severity: "mild"
  },
  pregnancy_heartburn: {
    bengali: ["গর্ভাবস্থায় বুক জ্বালা"],
    english: ["Pregnancy Heartburn"],
    specialty: "Gynecology (গাইনিকোলজি)",
    severity: "mild"
  },
  tooth_pressure_pain: {
    bengali: ["দাঁতে চাপ ব্যথা"],
    english: ["Tooth Pressure Pain"],
    specialty: "Dentistry (ডেন্টিস্ট)",
    severity: "moderate"
  },
  cold_tooth_sensitivity: {
    bengali: ["দাঁতে ঠান্ডা লাগা"],
    english: ["Cold Tooth Sensitivity"],
    specialty: "Dentistry (ডেন্টিস্ট)",
    severity: "mild"
  },
  hot_tooth_sensitivity: {
    bengali: ["দাঁতে গরম লাগা"],
    english: ["Hot Tooth Sensitivity"],
    specialty: "Dentistry (ডেন্টিস্ট)",
    severity: "mild"
  },
  gum_pus: {
    bengali: ["মাড়িতে পুঁজ"],
    english: ["Gum Pus"],
    specialty: "Dentistry (ডেন্টিস্ট)",
    severity: "moderate"
  },
  gum_red_spot: {
    bengali: ["মাড়িতে লাল দাগ"],
    english: ["Gum Red Spot"],
    specialty: "Dentistry (ডেন্টিস্ট)",
    severity: "mild"
  },
  jaw_strain: {
    bengali: ["চোয়ালে টান"],
    english: ["Jaw Strain"],
    specialty: "Dentistry (ডেন্টিস্ট)",
    severity: "moderate"
  },
  jaw_clicking: {
    bengali: ["চোয়াল ক্লিক শব্দ"],
    english: ["Jaw Clicking"],
    specialty: "Dentistry (ডেন্টিস্ট)",
    severity: "mild"
  },
  jaw_opening_pain: {
    bengali: ["চোয়ালে ব্যথা খুলতে"],
    english: ["Jaw Opening Pain"],
    specialty: "Dentistry (ডেন্টিস্ট)",
    severity: "moderate"
  },
  oral_dark_spot: {
    bengali: ["মুখের ভেতর কালো দাগ"],
    english: ["Oral Dark Spot"],
    specialty: "Dentistry (ডেন্টিস্ট)",
    severity: "moderate"
  },
  oral_red_spot: {
    bengali: ["মুখের ভেতর লাল দাগ"],
    english: ["Oral Red Spot"],
    specialty: "Dentistry (ডেন্টিস্ট)",
    severity: "moderate"
  },
  sudden_collapse: {
    bengali: ["হঠাৎ মাথা ঘুরে পড়ে যাওয়া"],
    english: ["Sudden Collapse"],
    specialty: "Neurology (নিউরোলজি)",
    severity: "emergency"
  },
  one_side_body_numb: {
    bengali: ["হঠাৎ শরীরের এক পাশ অবশ"],
    english: ["One Side Body Numb"],
    specialty: "Neurology (নিউরোলজি)",
    severity: "emergency"
  },
  sudden_memory_loss: {
    bengali: ["হঠাৎ স্মৃতি হারানো"],
    english: ["Sudden Memory Loss"],
    specialty: "Neurology (নিউরোলজি)",
    severity: "moderate"
  },
  frequent_dizziness: {
    bengali: ["ঘন ঘন মাথা ঘোরা"],
    english: ["Frequent Dizziness"],
    specialty: "Neurology (নিউরোলজি)",
    severity: "moderate"
  },
  hand_tremor: {
    bengali: ["হাত কাঁপা"],
    english: ["Hand Tremor"],
    specialty: "Neurology (নিউরোলজি)",
    severity: "moderate"
  },
  leg_tremor: {
    bengali: ["পা কাঁপা"],
    english: ["Leg Tremor"],
    specialty: "Neurology (নিউরোলজি)",
    severity: "moderate"
  },
  seizure_during_sleep: {
    bengali: ["ঘুমের মধ্যে খিঁচুনি"],
    english: ["Seizure During Sleep"],
    specialty: "Neurology (নিউরোলজি)",
    severity: "emergency"
  },
  leg_numbness: {
    bengali: ["পা অবশ লাগা"],
    english: ["Leg Numbness"],
    specialty: "Neurology (নিউরোলজি)",
    severity: "moderate"
  },
  flashing_lights_vision: {
    bengali: ["হঠাৎ চোখে আলো ঝলকানি"],
    english: ["Flashing Lights Vision"],
    specialty: "Ophthalmology (চক্ষু বিশেষজ্ঞ)",
    severity: "moderate"
  },
  vision_loss: {
    bengali: ["চোখে অন্ধকার নেমে আসা"],
    english: ["Vision Loss"],
    specialty: "Ophthalmology (চক্ষু বিশেষজ্ঞ)",
    severity: "emergency"
  },
  red_painful_eye: {
    bengali: ["চোখ লাল হয়ে ব্যথা"],
    english: ["Red Painful Eye"],
    specialty: "Ophthalmology (চক্ষু বিশেষজ্ঞ)",
    severity: "moderate"
  },
  eye_swelling: {
    bengali: ["চোখ ফুলে যাওয়া"],
    english: ["Eye Swelling"],
    specialty: "Ophthalmology (চক্ষু বিশেষজ্ঞ)",
    severity: "moderate"
  },
  dark_circles: {
    bengali: ["চোখের নিচে কালো দাগ"],
    english: ["Dark Circles"],
    specialty: "Ophthalmology (চক্ষু বিশেষজ্ঞ)",
    severity: "mild"
  },
  droopy_eyelid: {
    bengali: ["চোখের পাতা পড়ে যাওয়া"],
    english: ["Droopy Eyelid"],
    specialty: "Ophthalmology (চক্ষু বিশেষজ্ঞ)",
    severity: "moderate"
  },
  burning_watery_eyes: {
    bengali: ["চোখে জ্বালা ও পানি"],
    english: ["Burning Watery Eyes"],
    specialty: "Ophthalmology (চক্ষু বিশেষজ্ঞ)",
    severity: "mild"
  },
  thick_nasal_discharge: {
    bengali: ["নাকে ঘন সর্দি"],
    english: ["Thick Nasal Discharge"],
    specialty: "ENT (নাক-কান-গলা)",
    severity: "mild"
  },
  nasal_foul_smell: {
    bengali: ["নাক দিয়ে দুর্গন্ধ"],
    english: ["Nasal Foul Smell"],
    specialty: "ENT (নাক-কান-গলা)",
    severity: "moderate"
  },
  nasal_breathing_difficulty: {
    bengali: ["নাক বন্ধ হয়ে শ্বাসকষ্ট"],
    english: ["Nasal Breathing Difficulty"],
    specialty: "ENT (নাক-কান-গলা)",
    severity: "moderate"
  },
  ear_pressure_pain: {
    bengali: ["কানে চাপ ব্যথা"],
    english: ["Ear Pressure Pain"],
    specialty: "ENT (নাক-কান-গলা)",
    severity: "moderate"
  },
  swollen_throat: {
    bengali: ["গলা ফুলে যাওয়া"],
    english: ["Swollen Throat"],
    specialty: "ENT (নাক-কান-গলা)",
    severity: "moderate"
  },
  throat_infection: {
    bengali: ["গলায় সংক্রমণ"],
    english: ["Throat Infection"],
    specialty: "ENT (নাক-কান-গলা)",
    severity: "moderate"
  },
  foreign_body_sensation: {
    bengali: ["গলায় কিছু আটকে থাকা অনুভূতি"],
    english: ["Foreign Body Sensation"],
    specialty: "ENT (নাক-কান-গলা)",
    severity: "moderate"
  },
  red_throat: {
    bengali: ["গলা লাল হয়ে যাওয়া"],
    english: ["Red Throat"],
    specialty: "ENT (নাক-কান-গলা)",
    severity: "mild"
  },
  throat_irritation: {
    bengali: ["গলা চুলকানো"],
    english: ["Throat Irritation"],
    specialty: "ENT (নাক-কান-গলা)",
    severity: "mild"
  },
  throat_pain_fever: {
    bengali: ["গলা ব্যথা সহ জ্বর"],
    english: ["Throat Pain Fever"],
    specialty: "ENT (নাক-কান-গলা)",
    severity: "moderate"
  },
  burning_chest: {
    bengali: ["বুকে জ্বালা"],
    english: ["Burning Chest"],
    specialty: "Gastroenterology (গ্যাস্ট্রোএন্টারোলজি)",
    severity: "mild"
  },
  chest_pressure_pain: {
    bengali: ["বুকে চাপ ব্যথা"],
    english: ["Chest Pressure Pain"],
    specialty: "Cardiology (কার্ডিওলজি)",
    severity: "emergency"
  },
  radiating_chest_pain: {
    bengali: ["বুকে ব্যথা ছড়িয়ে পড়া"],
    english: ["Radiating Chest Pain"],
    specialty: "Cardiology (কার্ডিওলজি)",
    severity: "emergency"
  },
  fast_heartbeat: {
    bengali: ["হৃদকম্পন বেড়ে যাওয়া"],
    english: ["Fast Heartbeat"],
    specialty: "Cardiology (কার্ডিওলজি)",
    severity: "moderate"
  },
  slow_heartbeat: {
    bengali: ["হৃদকম্পন ধীর হয়ে যাওয়া"],
    english: ["Slow Heartbeat"],
    specialty: "Cardiology (কার্ডিওলজি)",
    severity: "moderate"
  },
  breathing_difficulty: {
    bengali: ["শ্বাস নিতে কষ্ট"],
    english: ["Breathing Difficulty"],
    specialty: "Pulmonology (পালমোনোলজি)",
    severity: "moderate"
  },
  stopped_breathing: {
    bengali: ["হঠাৎ শ্বাস বন্ধ হওয়া"],
    english: ["Stopped Breathing"],
    specialty: "Pulmonology (পালমোনোলজি)",
    severity: "emergency"
  },
  blood_in_cough: {
    bengali: ["কাশিতে রক্ত"],
    english: ["Blood In Cough"],
    specialty: "Pulmonology (পালমোনোলজি)",
    severity: "emergency"
  },
  cough_with_breathlessness: {
    bengali: ["কাশির সাথে শ্বাসকষ্ট"],
    english: ["Cough With Breathlessness"],
    specialty: "Pulmonology (পালমোনোলজি)",
    severity: "moderate"
  },
  severe_abdominal_pain: {
    bengali: ["পেটে তীব্র ব্যথা"],
    english: ["Severe Abdominal Pain"],
    specialty: "Gastroenterology (গ্যাস্ট্রোএন্টারোলজি)",
    severity: "moderate"
  },
  abdominal_bloating: {
    bengali: ["পেট ফুলে যাওয়া"],
    english: ["Abdominal Bloating"],
    specialty: "Gastroenterology (গ্যাস্ট্রোএন্টারোলজি)",
    severity: "mild"
  },
  stomach_burning: {
    bengali: ["পেটে জ্বালা"],
    english: ["Stomach Burning"],
    specialty: "Gastroenterology (গ্যাস্ট্রোএন্টারোলজি)",
    severity: "mild"
  },
  gas_problem: {
    bengali: ["পেটে গ্যাস"],
    english: ["Gas Problem"],
    specialty: "Gastroenterology (গ্যাস্ট্রোএন্টারোলজি)",
    severity: "mild"
  },
  stomach_cramp: {
    bengali: ["পেটে মোচড় ব্যথা"],
    english: ["Stomach Cramp"],
    specialty: "Gastroenterology (গ্যাস্ট্রোএন্টারোলজি)",
    severity: "moderate"
  },
  blood_vomit: {
    bengali: ["রক্ত বমি"],
    english: ["Blood Vomit"],
    specialty: "Gastroenterology (গ্যাস্ট্রোএন্টারোলজি)",
    severity: "emergency"
  },
  bloody_stool: {
    bengali: ["রক্তসহ পায়খানা"],
    english: ["Bloody Stool"],
    specialty: "Gastroenterology (গ্যাস্ট্রোএন্টারোলজি)",
    severity: "emergency"
  },
  severe_back_pain: {
    bengali: ["পিঠে তীব্র ব্যথা"],
    english: ["Severe Back Pain"],
    specialty: "Orthopedics (অর্থোপেডিক্স)",
    severity: "moderate"
  },
  lower_back_pain: {
    bengali: ["কোমরে ব্যথা"],
    english: ["Lower Back Pain"],
    specialty: "Orthopedics (অর্থোপেডিক্স)",
    severity: "mild"
  },
  spine_stiffness: {
    bengali: ["মেরুদণ্ড শক্ত হয়ে যাওয়া"],
    english: ["Spine Stiffness"],
    specialty: "Orthopedics (অর্থোপেডিক্স)",
    severity: "mild"
  },
  knee_swelling: {
    bengali: ["হাঁটু ফুলে যাওয়া"],
    english: ["Knee Swelling"],
    specialty: "Orthopedics (অর্থোপেডিক্স)",
    severity: "moderate"
  },
  hand_joint_pain: {
    bengali: ["হাতের জয়েন্ট ব্যথা"],
    english: ["Hand Joint Pain"],
    specialty: "Orthopedics (অর্থোপেডিক্স)",
    severity: "mild"
  },
  finger_swelling: {
    bengali: ["আঙুল ফুলে যাওয়া"],
    english: ["Finger Swelling"],
    specialty: "Orthopedics (অর্থোপেডিক্স)",
    severity: "mild"
  },
  red_skin_rash: {
    bengali: ["ত্বকে লাল দাগ"],
    english: ["Red Skin Rash"],
    specialty: "Dermatology (চর্মরোগ বিশেষজ্ঞ)",
    severity: "mild"
  },
  skin_itching: {
    bengali: ["ত্বকে চুলকানি"],
    english: ["Skin Itching"],
    specialty: "Dermatology (চর্মরোগ বিশেষজ্ঞ)",
    severity: "mild"
  },
  skin_blister: {
    bengali: ["ত্বকে ফোস্কা"],
    english: ["Skin Blister"],
    specialty: "Dermatology (চর্মরোগ বিশেষজ্ঞ)",
    severity: "moderate"
  },
  skin_pus: {
    bengali: ["ত্বকে পুঁজ"],
    english: ["Skin Pus"],
    specialty: "Dermatology (চর্মরোগ বিশেষজ্ঞ)",
    severity: "moderate"
  },
  fungal_infection: {
    bengali: ["ত্বকে ফাঙ্গাল সংক্রমণ"],
    english: ["Fungal Infection"],
    specialty: "Dermatology (চর্মরোগ বিশেষজ্ঞ)",
    severity: "moderate"
  },
  dark_skin_patch: {
    bengali: ["ত্বকে কালো দাগ"],
    english: ["Dark Skin Patch"],
    specialty: "Dermatology (চর্মরোগ বিশেষজ্ঞ)",
    severity: "mild"
  },
  white_skin_patch: {
    bengali: ["ত্বকে সাদা দাগ"],
    english: ["White Skin Patch"],
    specialty: "Dermatology (চর্মরোগ বিশেষজ্ঞ)",
    severity: "moderate"
  },
  skin_ulcer: {
    bengali: ["ত্বকে ঘা"],
    english: ["Skin Ulcer"],
    specialty: "Dermatology (চর্মরোগ বিশেষজ্ঞ)",
    severity: "moderate"
  },
  child_rash: {
    bengali: ["শিশুর গায়ে ফুসকুড়ি"],
    english: ["Child Rash"],
    specialty: "Pediatrics (শিশুরোগ বিশেষজ্ঞ)",
    severity: "mild"
  },
  child_poor_feeding: {
    bengali: ["শিশুর খাওয়া কমে যাওয়া"],
    english: ["Child Poor Feeding"],
    specialty: "Pediatrics (শিশুরোগ বিশেষজ্ঞ)",
    severity: "moderate"
  },
  child_weight_loss: {
    bengali: ["শিশুর ওজন কমে যাওয়া"],
    english: ["Child Weight Loss"],
    specialty: "Pediatrics (শিশুরোগ বিশেষজ্ঞ)",
    severity: "moderate"
  },
  pregnancy_swelling: {
    bengali: ["গর্ভাবস্থায় ফোলা"],
    english: ["Pregnancy Swelling"],
    specialty: "Gynecology (গাইনিকোলজি)",
    severity: "moderate"
  },
  pregnancy_vomiting: {
    bengali: ["গর্ভাবস্থায় বমি"],
    english: ["Pregnancy Vomiting"],
    specialty: "Gynecology (গাইনিকোলজি)",
    severity: "mild"
  },
};

// -----------------------------------------------------------------------------
// Augment SYMPTOM_DB from the authoritative CSV symptom list (500+ symptoms)
// -----------------------------------------------------------------------------

const severityMap: Record<string, SeverityLevel> = {
  emergency: "emergency",
  urgent: "moderate",
  moderate: "moderate",
  mild: "mild",
};

function normalizeKey(text: string): string {
  return text
    .toLowerCase()
    .trim()
    // Allow latin, digits, and Bengali script (U+0980–U+09FF)
    .replace(/[^a-z0-9\u0980-\u09FF]/gu, "_")
    .replace(/_+/g, "_")
    .replace(/^_+|_+$/g, "");
}

function parseSymptomCsv(csv: string): Record<string, SymptomMapping> {
  const lines = csv
    .trim()
    .split(/\r?\n/)
    .map((l) => l.trim())
    .filter((l) => l.length > 0);

  const [header, ...rows] = lines;
  if (!header) return {};

  // Expected columns: symptom_bn,symptom_en,specialty,urgency
  const headerCols = header.toLowerCase().split(",").map((h) => h.trim());
  const bnIdx = headerCols.indexOf("symptom_bn");
  const enIdx = headerCols.indexOf("symptom_en");
  const specialtyIdx = headerCols.indexOf("specialty");
  const urgencyIdx = headerCols.indexOf("urgency");
  if (bnIdx === -1 || enIdx === -1 || specialtyIdx === -1 || urgencyIdx === -1) return {};

  const db: Record<string, SymptomMapping> = {};
  for (const row of rows) {
    const cols = row.split(",");
    const bn = cols[bnIdx]?.trim();
    const en = cols[enIdx]?.trim();
    const specialty = cols[specialtyIdx]?.trim();
    const urgency = cols[urgencyIdx]?.trim().toLowerCase();

    if (!bn || !en) continue;

    const severity = severityMap[urgency] ?? "unknown";
    const key = normalizeKey(en || bn);
    if (!key) continue;

    const existing = db[key] || {
      bengali: [],
      english: [],
      specialty: specialty || "General Medicine (সাধারণ মেডিসিন)",
      severity,
    };

    if (bn && !existing.bengali.includes(bn)) existing.bengali.push(bn);
    if (en && !existing.english.includes(en)) existing.english.push(en);

    // Upgrade severity if the CSV indicates higher urgency
    const severityPriority = { emergency: 3, moderate: 2, mild: 1, unknown: 0 } as const;
    if (severityPriority[severity] > severityPriority[existing.severity]) {
      existing.severity = severity;
    }

    // Keep the most specific specialty (prefer non-general)
    if (existing.specialty === "General Medicine (সাধারণ মেডিসিন)" && specialty) {
      existing.specialty = specialty;
    }

    db[key] = existing;
  }

  return db;
}

// Merge CSV-derived entries into the existing database.
const csvBasedDb = parseSymptomCsv(symptomCsv);
for (const [key, mapping] of Object.entries(csvBasedDb)) {
  if (!SYMPTOM_DB[key]) {
    SYMPTOM_DB[key] = mapping;
  } else {
    const existing = SYMPTOM_DB[key];

    // Merge keyword lists
    existing.bengali = Array.from(new Set([...existing.bengali, ...mapping.bengali]));
    existing.english = Array.from(new Set([...existing.english, ...mapping.english]));

    // Upgrade severity if needed
    const severityPriority = { emergency: 3, moderate: 2, mild: 1, unknown: 0 } as const;
    if (severityPriority[mapping.severity] > severityPriority[existing.severity]) {
      existing.severity = mapping.severity;
    }

    // Prefer a more descriptive specialty (avoid overwriting with empty or generic)
    if (
      existing.specialty === "General Medicine (সাধারণ মেডিসিন)" &&
      mapping.specialty &&
      mapping.specialty !== "General Medicine (সাধারণ মেডিসিন)"
    ) {
      existing.specialty = mapping.specialty;
    }
  }
}
