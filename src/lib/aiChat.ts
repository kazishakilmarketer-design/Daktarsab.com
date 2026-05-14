/**
 * aiChat.ts — streaming chat via Supabase edge function (Gemini).
 * Falls back to local DoctorSaab multi-agent system when API is unavailable.
 */

import { enhanceMessageForAI } from "./bilingualTranslator";
import { analyzeSymptom } from "./AI_Engine";

export interface RecommendedDoctor {
  doctorName: string;
  qualification: string;
  specialization: string;
  designation: string;
  chamber: string;
  rating?: number;
  reviewCount?: number;
  fee?: number;
  experience?: string;
  tags?: string[];
  availability?: string;
  image_url?: string;
}

export interface AiMedicalResponse {
  isEmergency: boolean;
  emergencyWarning: string | null;
  condition: string;
  immediateAdvice: string;
  specialistNeeded: string;
  specialistReason: string;
  patientSummary?: string;
  severity?: "emergency" | "moderate" | "mild" | "unknown";
  hospitals: { name: string; type: string; location: string; phone?: string | null }[];
  tests: { name: string; estimatedCost: string }[];
  followUp: string;
  recommendedDoctors?: RecommendedDoctor[];
  lead_id?: string;
  bookingTrigger?: "hospital" | "clinic" | "diagnostic" | "ambulance" | null;
}

export interface PatientContext {
  age: string;
  gender: string;
  location: string;
  upazila?: string;
  monthlyIncome: number;
  treatmentTier: string;
}

const CHAT_URL = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/chat`;

export async function streamChat({
  message,
  patientContext,
  imageBase64,
  onDelta,
  onDone,
  localDoctors = [],
  conversationHistory = [],
}: {
  message: string;
  patientContext: PatientContext;
  imageBase64?: string;
  onDelta: (text: string) => void;
  onDone: (fullText: string) => void;
  localDoctors?: RecommendedDoctor[];
  conversationHistory?: { role: string; text: string }[];
}) {
  // ── Bilingual: enhance English input with Bengali context clues ──────────
  const enhancedMessage = enhanceMessageForAI(message);

  // ── AI Engine V2 Interception ───────────────────────────────────────────
  const engineResult = analyzeSymptom(message, patientContext);

  if (engineResult.isEmergency) {
    console.warn("🚨 AI Engine V2 intercepted an Emergency. Bypassing Gemini.");
    const emergencyJson: AiMedicalResponse = {
      isEmergency: true,
      emergencyWarning: "আপনার লক্ষণগুলো গুরুতর। দয়া করে নিকটস্থ হাসপাতালে যান বা অ্যাম্বুলেন্স কল করুন।",
      condition: engineResult.primarySymptom || "Emergency Condition",
      immediateAdvice: engineResult.routingAdvice,
      specialistNeeded: engineResult.recommendedSpecialty || "Emergency Physician",
      specialistReason: "জরুরি চিকিৎসা নিতে হবে।",
      hospitals: [],
      tests: [],
      followUp: "অবিলম্বে হাসপাতালে যোগাযোগ করুন।",
      bookingTrigger: "ambulance"
    };
    
    const emergencyStr = JSON.stringify(emergencyJson);
    onDelta("");
    onDone(emergencyStr);
    return emergencyStr;
  }

  // AI-6 FIX: Sanitize translator/engine output before injecting into Gemini prompt.
  // Strip markdown characters, emoji, and truncate to prevent prompt injection.
  const sanitizeForPrompt = (raw: string): string =>
    raw
      .replace(/[*_`#\[\]()>!\\]/g, "")     // strip markdown
      .replace(/[\u{1F300}-\u{1FFFF}]/gu, "") // strip emoji
      .replace(/\s+/g, " ")
      .trim()
      .slice(0, 200);

  const safeSeverity = sanitizeForPrompt(engineResult.severity);
  const safeAdvice = sanitizeForPrompt(engineResult.routingAdvice);
  const enrichedMessage = `${enhancedMessage}\n[Engine: severity=${safeSeverity}, advice=${safeAdvice}]`;

  // ── Try Supabase/Gemini first ──────────────────────────────────────────────
  try {
    const resp = await fetch(CHAT_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
      },
      body: JSON.stringify({ message: enrichedMessage, patientContext, imageBase64, conversationHistory }),
      // Short timeout so offline/broken API fails fast
      signal: AbortSignal.timeout?.(8000) ?? undefined,
    });

    if (!resp.ok) {
      const err = await resp.json().catch(() => ({ error: "সার্ভারে সমস্যা হয়েছে।" }));
      if (resp.status === 429) {
        throw new Error("429: অনুরোধ সীমা অতিক্রম হয়েছে। ১ মিনিট পরে আবার চেষ্টা করুন।");
      }
      throw new Error(err.error || `HTTP ${resp.status}`);
    }

    if (!resp.body) throw new Error("No response body");

    const reader = resp.body.getReader();
    const decoder = new TextDecoder();
    let textBuffer = "";
    let fullText = "";

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      textBuffer += decoder.decode(value, { stream: true });

      let newlineIndex: number;
      while ((newlineIndex = textBuffer.indexOf("\n")) !== -1) {
        let line = textBuffer.slice(0, newlineIndex);
        textBuffer = textBuffer.slice(newlineIndex + 1);
        if (line.endsWith("\r")) line = line.slice(0, -1);
        if (line.startsWith(":") || line.trim() === "") continue;
        if (!line.startsWith("data: ")) continue;
        const jsonStr = line.slice(6).trim();
        if (jsonStr === "[DONE]") break;
        try {
          const parsed = JSON.parse(jsonStr);
          const content = parsed.choices?.[0]?.delta?.content as string | undefined;
          if (content) {
            fullText += content;
            onDelta(content);
          }
        } catch {
          textBuffer = line + "\n" + textBuffer;
          break;
        }
      }
    }

    onDone(fullText);
    return fullText;

  } catch (err: any) {
    const isRateLimit = err?.message?.includes("429") || err?.message?.includes("সীমা অতিক্রম");
    if (isRateLimit) throw err;

    // Handle 401 Unauthorized (Auth Fallback) or other API failures
    const isAuthError = err?.message?.includes("401") || err?.message?.includes("Unauthorized");
    
    if (isAuthError) {
      console.warn("Auth Fallback — running local agents (401 Unauthorized)");
    } else {
      console.info("[DoctorSaab] API unavailable — running local agents", err);
    }

    // Dynamically import to avoid bundling overhead when not needed
    const { runDoctorSaabAgents } = await import("./doctorSaabAgents");
    const result = await runDoctorSaabAgents(enhancedMessage, patientContext, localDoctors);
    const jsonStr = JSON.stringify(result);

    // Simulate streaming: emit the JSON as a single delta
    onDelta("");
    onDone(jsonStr);
    return jsonStr;
  }
}

export function parseAiResponse(raw: string): AiMedicalResponse | null {
  try {
    let jsonStr = raw.trim();
    const jsonMatch = jsonStr.match(/```(?:json)?\s*([\s\S]*?)```/);
    if (jsonMatch) jsonStr = jsonMatch[1].trim();
    const objMatch = jsonStr.match(/\{[\s\S]*\}/);
    if (objMatch) jsonStr = objMatch[0];
    return JSON.parse(jsonStr) as AiMedicalResponse;
  } catch {
    return null;
  }
}
