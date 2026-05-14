import { streamChat, parseAiResponse, type AiMedicalResponse, type PatientContext, type RecommendedDoctor } from "./aiChat";
import { findHospitalsByLocation, suggestTests, estimateCost } from "./doctorSaabAgents";
import { queryDoctors } from "@/hooks/useDoctors";
import { saveConsultationToHistory } from "./healthMemory";

/**
 * ORCHESTRATOR (Layer 2)
 * Coordinates between the AI Brain and the Service Engine.
 */
export async function handleMedicalConsultation({
  message,
  patientContext,
  userId,
  conversationHistory = [],
  onDelta,
}: {
  message: string;
  patientContext: PatientContext;
  userId?: string;
  conversationHistory?: { role: string; text: string }[];
  onDelta: (text: string) => void;
}): Promise<AiMedicalResponse | string> {
  
  // 1. AI STEP: Call the Brain Layer
  let fullResponse = "";
  const aiResult = await streamChat({
    message,
    patientContext,
    conversationHistory,
    onDelta: (delta) => {
      fullResponse += delta;
      onDelta(delta);
    },
    onDone: (done) => {
      fullResponse = done;
    }
  });

  // 2. PARSE STEP: Try to see if it's a structured diagnosis
  const parsed = parseAiResponse(fullResponse);

  // 3. EXECUTION STEP (If it's a Phase 2 diagnosis, enrich it with service data)
  if (parsed && parsed.specialistNeeded && parsed.specialistNeeded !== "") {
    console.log("[Orchestrator] Enriching AI response with Layer 2 Service data...");
    
    // Fetch local hospitals strictly by district/upazila
    const localHospitals = await findHospitalsByLocation(
      patientContext.location,
      patientContext.upazila
    );

    // Fetch doctors based on triaged specialty
    const localDoctors = await queryDoctors(
      parsed.specialistNeeded,
      patientContext.location
    );

    // Fix tests if none provided or if they need local cost estimation
    const testNames = parsed.tests?.length > 0 
      ? parsed.tests.map(t => t.name) 
      : suggestTests(parsed.specialistNeeded);
    
    const localTests = estimateCost(testNames, patientContext.monthlyIncome);

    // Merge back into the response
    const finalResponse: AiMedicalResponse = {
      ...parsed,
      hospitals: localHospitals.length > 0 ? localHospitals : parsed.hospitals,
      recommendedDoctors: localDoctors.length > 0 ? localDoctors : parsed.recommendedDoctors,
      tests: localTests.length > 0 ? localTests : parsed.tests
    };

    // 4. MEMORY STEP: Save to History (Layer 3)
    if (userId) {
      saveConsultationToHistory(userId, finalResponse, message);
    }

    return finalResponse;
  }

  // If it's Phase 1 (questions) or unstructured text, just return the raw string
  return fullResponse;
}
