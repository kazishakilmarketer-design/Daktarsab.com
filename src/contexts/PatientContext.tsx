import React, { createContext, useContext, useState, ReactNode, useCallback, useEffect } from "react";

export interface FamilyMember {
  id: string;
  name: string;
  relation: string;
  age: string;
  gender: "পুরুষ" | "মহিলা" | "অন্যান্য" | "";
  location: string;
  monthlyIncome: number;
}

export interface PatientProfile {
  age: string;
  gender: "পুরুষ" | "মহিলা" | "অন্যান্য" | "";
  location: string;
  upazila?: string;
  monthlyIncome: number;
}

export type TreatmentTier = "সরকারি" | "বেসরকারি" | "প্রিমিয়াম";

export function getTreatmentTier(income: number): TreatmentTier {
  if (income <= 15000) return "সরকারি";
  if (income <= 40000) return "বেসরকারি";
  return "প্রিমিয়াম";
}

interface PatientContextType {
  profile: PatientProfile;
  setProfile: React.Dispatch<React.SetStateAction<PatientProfile>>;
  treatmentTier: TreatmentTier;
  rewardPoints: number;
  addRewardPoints: (pts: number) => void;
  isGuest: boolean;
  setIsGuest: React.Dispatch<React.SetStateAction<boolean>>;
  // Family members
  familyMembers: FamilyMember[];
  setFamilyMembers: React.Dispatch<React.SetStateAction<FamilyMember[]>>;
  activeMemberId: string | null;
  setActiveMemberId: (id: string | null) => void;
  activeMember: FamilyMember | null;
  addFamilyMember: (member: Omit<FamilyMember, "id">) => void;
}

const PatientContext = createContext<PatientContextType | null>(null);

export function PatientProvider({ children }: { children: ReactNode }) {
  const [profile, setProfile] = useState<PatientProfile>(() => {
    try {
      const saved = localStorage.getItem("daktarsab_patient_profile");
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.warn("Failed to load profile from local storage");
    }
    return {
      age: "",
      gender: "",
      location: "",
      monthlyIncome: 20000,
    };
  });

  useEffect(() => {
    localStorage.setItem("daktarsab_patient_profile", JSON.stringify(profile));
  }, [profile]);
  const [rewardPoints, setRewardPoints] = useState(0);
  const [isGuest, setIsGuest] = useState(true);
  const [familyMembers, setFamilyMembers] = useState<FamilyMember[]>([]);
  const [activeMemberId, setActiveMemberId] = useState<string | null>(null);

  const treatmentTier = getTreatmentTier(profile.monthlyIncome);
  const addRewardPoints = (pts: number) => setRewardPoints((p) => p + pts);

  const activeMember = familyMembers.find((m) => m.id === activeMemberId) || null;

  const addFamilyMember = useCallback((member: Omit<FamilyMember, "id">) => {
    const newMember: FamilyMember = { ...member, id: crypto.randomUUID() };
    setFamilyMembers((prev) => [...prev, newMember]);
  }, []);

  return (
    <PatientContext.Provider
      value={{
        profile, setProfile, treatmentTier, rewardPoints, addRewardPoints,
        isGuest, setIsGuest,
        familyMembers, setFamilyMembers, activeMemberId, setActiveMemberId,
        activeMember, addFamilyMember,
      }}
    >
      {children}
    </PatientContext.Provider>
  );
}

export function usePatient() {
  const ctx = useContext(PatientContext);
  if (!ctx) throw new Error("usePatient must be used within PatientProvider");
  return ctx;
}
