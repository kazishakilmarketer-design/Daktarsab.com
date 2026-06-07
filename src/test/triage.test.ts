import { describe, it, expect, vi, beforeEach } from "vitest";
import { analyzeSymptom } from "@/lib/AI_Engine";
import { SYMPTOM_DB } from "@/lib/symptomDb";
import type { PatientContext } from "@/lib/aiChat";

// Mock Supabase client for hospital lookup
vi.mock("@/integrations/supabase/client", () => {
  const insertMock = vi.fn().mockResolvedValue({ data: null, error: null });
  const from = vi.fn().mockReturnValue({
    insert: insertMock,
  });
  return {
    supabase: {
      from,
      auth: {
        getUser: vi.fn().mockResolvedValue({ data: { user: { id: "test-user-id" } }, error: null }),
      }
    },
  };
});

describe("AI Engine symptom triage", () => {
  const baseContext: PatientContext = {
    age: "30",
    gender: "পুরুষ",
    location: "ঢাকা",
    upazila: "মিরपुर",
    monthlyIncome: 10000,
    treatmentTier: "low",
  };

  it("should classify বুকের ব্যথা as emergency and suggest ambulance", () => {
    expect(SYMPTOM_DB.chest_pain).toBeDefined();
    expect(SYMPTOM_DB.chest_pain.severity).toBe("emergency");

    const raw = "আমার বুকে ব্যথা";
    const result = analyzeSymptom(raw, baseContext);
    expect(result.severity).toBe("emergency");
    expect(result.bookingTrigger).toBe("ambulance");
    expect(result.patientSummary).toContain("বুক ব্যথা");
  });

  it("should classify পেটে ব্যথা as moderate and suggest clinic", () => {
    const result = analyzeSymptom("পেটে ব্যথা হচ্ছে, কিছু খাবার খাইনি", baseContext);
    expect(result.severity).toBe("moderate");
    expect(result.bookingTrigger).toBe("clinic");
    expect(result.recommendedSpecialty).toContain("গ্যাস্ট্রোএন্টারোলজি");
  });
});

describe("Hospital locator filters by district and upazila", () => {
  let supabase: { from: ReturnType<typeof vi.fn>; auth?: { getUser: ReturnType<typeof vi.fn> } };

  beforeEach(async () => {
    const supabaseModule = await import("@/integrations/supabase/client");
    supabase = supabaseModule.supabase;
    supabase.from.mockReset();
  });

  it("should query supabase with exact district and upazila and return formatted hospitals", async () => {
    const fakeHospital = {
      name: "বগুড়া সদর হাসপাতাল",
      type: "সরকারি",
      district: "বগুড়া",
      upazila: "শাজাহানপুর",
      phone: "০১৭১২৩৪৫৬৭৮",
    };

    const response = { data: [fakeHospital], error: null };

    const query = {
      select: vi.fn().mockReturnThis(),
      limit: vi.fn().mockReturnThis(),
      ilike: vi.fn().mockReturnThis(),
      then: (onFulfilled: (value: unknown) => unknown) => Promise.resolve(response).then(onFulfilled),
      catch: (onRejected: (reason: unknown) => unknown) => Promise.resolve(response).catch(onRejected),
    };

    supabase.from.mockReturnValue(query);

    const { findHospitalsByLocation } = await import("@/lib/doctorSaabAgents");
    const hospitals = await findHospitalsByLocation("বগুড়া", "শাজাহানপুর", 2);

    expect(supabase.from).toHaveBeenCalledWith("facilities");
    expect(query.ilike).toHaveBeenCalledWith("district", "%বগুড়া%");
    expect(query.ilike).toHaveBeenCalledWith("upazila", "%শাজাহানপুর%");

    expect(hospitals).toHaveLength(1);
    expect(hospitals[0].name).toBe(fakeHospital.name);
    expect(hospitals[0].location).toContain(fakeHospital.upazila);
    expect(hospitals[0].location).toContain(fakeHospital.district);
  });
});
