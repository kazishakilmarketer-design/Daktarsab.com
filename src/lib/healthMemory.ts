import { supabase } from "@/integrations/supabase/client";
import type { AiMedicalResponse } from "./aiChat";

/**
 * HEALTH MEMORY (Layer 3)
 * Handles persistence of medical interactions into the Universal Health Record (UHR).
 */

export async function saveConsultationToHistory(
  userId: string,
  analysis: AiMedicalResponse,
  userMessage: string
) {
  try {
    const { error } = await (supabase.from("medical_records") as any).insert({
      user_id: userId,
      record_type: "summary",
      title: `AI পরামর্শ: ${analysis.condition || "সাধারণ সমস্যা"}`,
      content_data: {
        symptom: userMessage,
        condition: analysis.condition,
        specialist: analysis.specialistNeeded,
        urgency: analysis.isEmergency ? "high" : "normal",
        advice: analysis.immediateAdvice,
        timestamp: new Date().toISOString()
      }
    });

    if (error) {
      console.error("[HealthMemory] Failed to save record:", error);
      return false;
    }

    console.log("[HealthMemory] Successfully saved consultation to history.");
    return true;
  } catch (err) {
    console.error("[HealthMemory] Exception during save:", err);
    return false;
  }
}

export async function getMedicalHistory(userId: string) {
  const { data, error } = await supabase
    .from("medical_records")
    .select("*")
    .eq("user_id", userId)
    .eq("record_type", "summary")
    .order("created_at", { ascending: false });

  if (error) {
    console.error("[HealthMemory] Failed to fetch history:", error);
    return [];
  }

  return data;
}
