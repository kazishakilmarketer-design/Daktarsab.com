import { useState, useEffect } from "react";
import { toast } from "sonner";

export interface FamilyMember {
    id: string;
    name: string;
    age: string;
    gender: string;
    relation: string;
}

export interface ProfileData {
    name: string;
    phone: string;
    bloodGroup: string;
    district: string;
    upazila: string;
    familyMembers: FamilyMember[];
}

const STORAGE_KEY = "doctorSaab_profile";

const defaultProfile: ProfileData = {
    name: "",
    phone: "",
    bloodGroup: "",
    district: "",
    upazila: "",
    familyMembers: [],
};

export function useProfile() {
    const [profile, setProfile] = useState<ProfileData>(defaultProfile);
    const [isLoaded, setIsLoaded] = useState(false);

    // Initial load from local storage
    useEffect(() => {
        try {
            const saved = localStorage.getItem(STORAGE_KEY);
            if (saved) {
                setProfile(JSON.parse(saved));
            }
        } catch (error) {
            console.error("Failed to load profile from storage", error);
        } finally {
            setIsLoaded(true);
        }
    }, []);

    // Save helper: merges partial updates and commits to local storage
    const updateProfile = (updates: Partial<ProfileData>) => {
        const updatedProfile = { ...profile, ...updates };
        setProfile(updatedProfile);
        try {
            localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedProfile));
            toast.success("প্রোফাইল আপডেট করা হয়েছে (Profile Updated)");
        } catch (error) {
            toast.error("প্রোফাইল আপডেট করতে সমস্যা হয়েছে (Failed to update)");
        }
    };

    // Family Member Helpers
    const addFamilyMember = (member: Omit<FamilyMember, "id">) => {
        const newMember: FamilyMember = {
            ...member,
            id: crypto.randomUUID(), // Modern built-in UUID generator
        };
        updateProfile({
            familyMembers: [...profile.familyMembers, newMember],
        });
        toast.success("সদস্য যোগ করা হয়েছে (Member Added)");
    };

    const deleteFamilyMember = (id: string) => {
        updateProfile({
            familyMembers: profile.familyMembers.filter((m) => m.id !== id),
        });
        toast.success("সদস্য ডিলিট করা হয়েছে (Member Deleted)");
    };

    return {
        profile,
        isLoaded,
        updateProfile,
        addFamilyMember,
        deleteFamilyMember,
    };
}
