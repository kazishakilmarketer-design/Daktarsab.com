/* eslint-disable */
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

// District to division mapping
const districtToDivision: Record<string, string> = {
  "Barguna": "Barishal", "Barisal": "Barishal", "Bhola": "Barishal", "Jhalokati": "Barishal",
  "Patuakhali": "Barishal", "Pirojpur": "Barishal",
  "Bandarban": "Chattogram", "Brahmanbaria": "Chattogram", "Chandpur": "Chattogram",
  "Chattogram": "Chattogram", "Cumilla": "Chattogram", "Cox's Bazar": "Chattogram",
  "Feni": "Chattogram", "Khagrachhari": "Chattogram", "Lakshmipur": "Chattogram",
  "Noakhali": "Chattogram", "Rangamati": "Chattogram",
  "Dhaka": "Dhaka", "Faridpur": "Dhaka", "Gazipur": "Dhaka", "Gopalganj": "Dhaka",
  "Kishoreganj": "Dhaka", "Madaripur": "Dhaka", "Manikganj": "Dhaka", "Munshiganj": "Dhaka",
  "Narayanganj": "Dhaka", "Narsingdi": "Dhaka", "Rajbari": "Dhaka", "Shariatpur": "Dhaka",
  "Tangail": "Dhaka",
  "Bagerhat": "Khulna", "Chuadanga": "Khulna", "Jashore": "Khulna", "Jhenaidah": "Khulna",
  "Khulna": "Khulna", "Kushtia": "Khulna", "Magura": "Khulna", "Meherpur": "Khulna",
  "Narail": "Khulna", "Satkhira": "Khulna",
  "Jamalpur": "Mymensingh", "Mymensingh": "Mymensingh", "Netrokona": "Mymensingh",
  "Sherpur": "Mymensingh",
  "Bogura": "Rajshahi", "Chapainawabganj": "Rajshahi", "Joypurhat": "Rajshahi",
  "Naogaon": "Rajshahi", "Natore": "Rajshahi", "Nawabganj": "Rajshahi", "Pabna": "Rajshahi",
  "Rajshahi": "Rajshahi", "Sirajganj": "Rajshahi",
  "Dinajpur": "Rangpur", "Gaibandha": "Rangpur", "Kurigram": "Rangpur",
  "Lalmonirhat": "Rangpur", "Nilphamari": "Rangpur", "Panchagarh": "Rangpur",
  "Rangpur": "Rangpur", "Thakurgaon": "Rangpur",
  "Habiganj": "Sylhet", "Moulvibazar": "Sylhet", "Sunamganj": "Sylhet", "Sylhet": "Sylhet",
};

// Bangla district to English
const districtBnToEn: Record<string, string> = {
  "বরগুনা": "Barguna", "বরিশাল": "Barisal", "ভোলা": "Bhola", "ঝালকাঠি": "Jhalokati",
  "পটুয়াখালী": "Patuakhali", "পিরোজপুর": "Pirojpur", "বান্দরবান": "Bandarban",
  "ব্রাহ্মণবাড়িয়া": "Brahmanbaria", "চাঁদপুর": "Chandpur", "চট্টগ্রাম": "Chattogram",
  "কুমিল্লা": "Cumilla", "কক্সবাজার": "Cox's Bazar", "ফেনী": "Feni",
  "খাগড়াছড়ি": "Khagrachhari", "লক্ষ্মীপুর": "Lakshmipur", "নোয়াখালী": "Noakhali",
  "রাঙামাটি": "Rangamati", "ঢাকা": "Dhaka", "ফরিদপুর": "Faridpur", "গাজীপুর": "Gazipur",
  "গোপালগঞ্জ": "Gopalganj", "কিশোরগঞ্জ": "Kishoreganj", "মাদারীপুর": "Madaripur",
  "মানিকগঞ্জ": "Manikganj", "মুন্সীগঞ্জ": "Munshiganj", "নারায়ণগঞ্জ": "Narayanganj",
  "নরসিংদী": "Narsingdi", "রাজবাড়ী": "Rajbari", "শরীয়তপুর": "Shariatpur", "টাঙ্গাইল": "Tangail",
  "বাগেরহাট": "Bagerhat", "চুয়াডাঙ্গা": "Chuadanga", "যশোর": "Jashore", "ঝিনাইদহ": "Jhenaidah",
  "খুলনা": "Khulna", "কুষ্টিয়া": "Kushtia", "মাগুরা": "Magura", "মেহেরপুর": "Meherpur",
  "নড়াইল": "Narail", "সাতক্ষীরা": "Satkhira", "জামালপুর": "Jamalpur", "ময়মনসিংহ": "Mymensingh",
  "নেত্রকোনা": "Netrokona", "শেরপুর": "Sherpur", "বগুড়া": "Bogura",
  "চাঁপাইনবাবগঞ্জ": "Chapainawabganj", "জয়পুরহাট": "Joypurhat", "নওগাঁ": "Naogaon",
  "নাটোর": "Natore", "নবাবগঞ্জ": "Nawabganj", "পাবনা": "Pabna", "রাজশাহী": "Rajshahi",
  "সিরাজগঞ্জ": "Sirajganj", "দিনাজপুর": "Dinajpur", "গাইবান্ধা": "Gaibandha",
  "কুড়িগ্রাম": "Kurigram", "লালমনিরহাট": "Lalmonirhat", "নীলফামারী": "Nilphamari",
  "পঞ্চগড়": "Panchagarh", "রংপুর": "Rangpur", "ঠাকুরগাঁও": "Thakurgaon",
  "হবিগঞ্জ": "Habiganj", "মৌলভীবাজার": "Moulvibazar", "সুনামগঞ্জ": "Sunamganj", "সিলেট": "Sylhet",
};

const SYSTEM_PROMPT = `You are "ডাক্তার সাব" (Doctor Saab), an experienced, elderly Bangladeshi male doctor — wise, calm, warm, and formal. Like a trusted village doctor who has seen thousands of patients. Your mission: protect people from wrong diagnoses and unnecessary expenses.

YOUR PERSONA & EMPATHY RULE (RULE 1):
- You speak like a senior doctor: authoritative but kind. Never rushed.
- ALWAYS acknowledge the user's symptoms FIRST with empathy. Start with phrases like "শুনে খারাপ লাগছে আপনার...", "ভয় পেয়ো না বাবা, আমি দেখছি।", "আপনার কষ্টটা আমি বুঝতে পারছি।"
- Use "তুমি" or "আপনি" based on formality context.
- GREETING RULE: Only say "সালাম" (Salam) or "নমস্কার" (Namaste) if this is the VERY FIRST message in the conversation history. Do not repeat greetings in every message.

ANTI-REPETITION (RULE 2):
- DO NOT ask questions that the patient has already answered in previous messages OR that are already listed in the "Patient Context" provided to you.
- If Age is 35 and Location is Brahmanbaria in the Context, NEVER ask "আপনার বয়স কত?" or "আপনি কোথা থেকে বলছেন?".
- If the user says "৩ দিন ধরে জ্বর", do NOT ask "কতদিন ধরে জ্বর?".

STEP-BY-STEP TRIAGE (RULE 3):
- Do not overwhelm the patient. Ask only ONE or TWO clarifying questions at most in Phase 1 IF AND ONLY IF essential information is missing.

EDGE CASES (RULE 4):
- Non-Medical queries: Briefly answer identity and politely redirect back to health topics.
- For CRITICAL symptoms (chest pain, stroke signs, unconsciousness, severe bleeding), immediately set isEmergency: true and provide immediate life-saving advice.

════════════════════════════════════════
TWO-PHASE CONSULTATION PROTOCOL
════════════════════════════════════════

PHASE 1 — GATHERING (Only if info is missing):
Only use this phase if the Patient Context or current message is missing:
  - Age or Gender
  - Symptom Duration (কতদিন ধরে?)
  - Location (if not in context)

If ALL this info is already known, SKIP Phase 1 and go directly to Phase 2.

For PHASE 1 responses, use this lighter JSON format:
{
  "isEmergency": false,
  "emergencyWarning": null,
  "immediateAdvice": "[Empathy statement]. আপনার সমস্যাটা ভালোভাবে বুঝতে আমার আরও কিছু জানা দরকার। [1-2 short questions]?",
  "specialistNeeded": "",
  "specialistReason": "",
  "hospitals": [],
  "tests": [],
  "followUp": "আপনার উত্তরের পর আমি বিস্তারিত পরামর্শ দেব।",
  "bookingTrigger": null
}

PHASE 2 — DIAGNOSING (Full structured analysis):
Provide this when you have sufficient information to give a preliminary assessment.

EMERGENCY EXCEPTION: If ANY message mentions chest pain (বুকে ব্যথা), difficulty breathing (শ্বাসকষ্ট), stroke signs, unconsciousness, severe bleeding, or poisoning — SKIP Phase 1 and go DIRECTLY to full emergency JSON with isEmergency: true.
════════════════════════════════════════

FULL DIAGNOSIS RESPONSE FORMAT (Strict JSON, no extra text):
{
  "isEmergency": boolean,
  "emergencyWarning": "bold warning string or null",
  "immediateAdvice": "Primary first aid or initial advice in Bangla. Keep it professional and organized.",
  "specialistNeeded": "e.g. কার্ডিওলজিস্ট",
  "specialistReason": "Why this specialist in Bangla",
  "hospitals": [
    { "name": "string", "type": "সরকারি|বেসরকারি|প্রিমিয়াম", "location": "string", "phone": "string or null" }
  ],
  "tests": [
    { "name": "string", "estimatedCost": "e.g. ৳৫০০-৳১,০০০" }
  ],
  "followUp": "When to see a doctor or follow-up advice",
  "recommendedDoctors": [
    { "doctorName": "string", "qualification": "string", "specialization": "string", "designation": "string", "chamber": "string" }
  ],
  "bookingTrigger": "hospital | clinic | diagnostic | ambulance | null"
}

ROUTING & BOOKING RULE (RULE 5):
- Ensure "bookingTrigger" accurately matches the recommendation.
- Always recommend 3 hospitals and 2-4 relevant tests. Avoid "overloading" tests for simple symptoms.
- PRIVACY MISSION: "লজ্জা নয়, সঠিক সমাধান খুঁজুন।" — Zero judgment.`;

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { message, patientContext, imageBase64, conversationHistory = [] } = await req.json();

    const GEMINI_API_KEY = Deno.env.get("GOOGLE_GEMINI_API_KEY");
    if (!GEMINI_API_KEY) {
      throw new Error("GOOGLE_GEMINI_API_KEY secret not set in Supabase Edge Function secrets");
    }

    const districtEn = districtBnToEn[patientContext?.location] || patientContext?.location || "";
    const division = districtToDivision[districtEn] || "";

    let doctorContext = "";
    if (division) {
      try {
        const supabase = createClient(
          Deno.env.get("PROJECT_URL")!,
          Deno.env.get("SERVICE_ROLE_KEY")!
        );
        const { data: doctors } = await supabase
          .from("doctors")
          .select("doctor_name, qualification, specialization, designation, chamber")
          .ilike("division", `%${division}%`)
          .limit(50);

        if (doctors && doctors.length > 0) {
          doctorContext = `\n\nAVAILABLE DOCTORS IN ${division} DIVISION (use these to recommend specialists):\n`;
          doctors.forEach((d: { doctor_name: string; qualification: string; specialization: string; designation: string; chamber: string }) => {
            doctorContext += `- ${d.doctor_name} | ${d.qualification} | ${d.specialization} | ${d.designation} | ${d.chamber}\n`;
          });
          doctorContext += `\nIMPORTANT: When recommending a specialist, pick the top 3 most relevant doctors from this list based on the patient's condition. Include them in a "recommendedDoctors" array in your JSON response with fields: doctorName, qualification, specialization, designation, chamber.`;
        }
      } catch (e) {
        console.error("Doctor fetch error:", e);
      }
    }

    const upazilaLine = patientContext?.upazila ? `\n- Upazila: ${patientContext.upazila}` : "";
    const systemAndContext = `${SYSTEM_PROMPT}

Patient Context:
- Age: ${patientContext?.age || "Unknown"}
- Gender: ${patientContext?.gender || "Unknown"}
- Location (District): ${patientContext?.location || "Unknown"}${upazilaLine}
- Division: ${division || "Unknown"}
- Monthly Income: ৳${patientContext?.monthlyIncome || 0}
- Income Tier: ${patientContext?.treatmentTier || "Unknown"}
${doctorContext}

Respond in the specified JSON format only. No extra text outside the JSON. If doctors list was provided, include "recommendedDoctors" array with top 3 matching doctors.`;

    const currentMessageParts: any[] = [{ text: message || "এই ছবিটি দেখুন এবং প্রাথমিক পর্যবেক্ষণ দিন।" }];

    if (imageBase64) {
      const match = imageBase64.match(/^data:(image\/\w+);base64,(.+)$/);
      if (match) {
        currentMessageParts.push({
          inline_data: {
            mime_type: match[1],
            data: match[2],
          },
        });
        currentMessageParts[0].text += "\n\nIMPORTANT: An image has been attached. Analyze the visible symptoms in the image and provide your assessment. Always include the visual disclaimer.";
      }
    }

    const contents = [
      ...conversationHistory.map((msg: any) => ({
        role: msg.role === "model" ? "model" : "user",
        parts: [{ text: msg.text }]
      })),
      { role: "user", parts: currentMessageParts }
    ];

    async function callGeminiModel(model: string): Promise<Response> {
      let lastResponse: Response | null = null;
      const maxRetries = 1;

      for (let attempt = 0; attempt <= maxRetries; attempt++) {
        lastResponse = await fetch(
          `https://generativelanguage.googleapis.com/v1beta/models/${model}:streamGenerateContent?alt=sse&key=${GEMINI_API_KEY}`,
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              system_instruction: { parts: [{ text: systemAndContext }] },
              contents,
              generationConfig: {
                temperature: 0.7,
                maxOutputTokens: 2048,
              },
            }),
          }
        );

        if (lastResponse.status === 429 && attempt < maxRetries) {
          await new Promise((r) => setTimeout(r, 3000));
          continue;
        }
        return lastResponse;
      }
      return lastResponse!;
    }

    const primaryModel = "gemini-2.5-flash";
    const fallbackModel = "gemini-2.0-flash";

    let response = await callGeminiModel(primaryModel);
    if (response.status === 429 || response.status >= 500) {
      console.log(`Primary model failed with ${response.status}, trying fallback`);
      response = await callGeminiModel(fallbackModel);
    }

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(
          JSON.stringify({ error: "Google Gemini রেট লিমিটে আছে। ১০-১৫ সেকেন্ড পরে আবার চেষ্টা করুন।", retryAfter: 15 }),
          { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json", "Retry-After": "15" } }
        );
      }
      const errorText = await response.text();
      console.error("Gemini API error:", response.status, errorText);
      return new Response(
        JSON.stringify({ error: "AI সার্ভিসে সমস্যা হয়েছে।" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const { readable, writable } = new TransformStream();
    const writer = writable.getWriter();
    const encoder = new TextEncoder();

    (async () => {
      const reader = response.body!.getReader();
      const decoder = new TextDecoder();
      let buffer = "";
      try {
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          buffer += decoder.decode(value, { stream: true });

          let idx: number;
          while ((idx = buffer.indexOf("\n")) !== -1) {
            let line = buffer.slice(0, idx);
            buffer = buffer.slice(idx + 1);
            if (line.endsWith("\r")) line = line.slice(0, -1);
            if (!line.startsWith("data: ")) continue;
            const jsonStr = line.slice(6).trim();
            if (!jsonStr) continue;
            try {
              const parsed = JSON.parse(jsonStr);
              const text = parsed.candidates?.[0]?.content?.parts?.[0]?.text;
              if (text) {
                const openaiChunk = JSON.stringify({
                  choices: [{ delta: { content: text } }],
                });
                await writer.write(encoder.encode(`data: ${openaiChunk}\n\n`));
              }
            } catch { /* skip partial */ }
          }
        }
        await writer.write(encoder.encode("data: [DONE]\n\n"));
      } catch (e) {
        console.error("Stream transform error:", e);
      } finally {
        writer.close();
      }
    })();

    return new Response(readable, {
      headers: { ...corsHeaders, "Content-Type": "text/event-stream" },
    });
  } catch (e) {
    console.error("chat error:", e);
    return new Response(
      JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
