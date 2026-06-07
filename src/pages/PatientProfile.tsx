import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { usePatient } from "@/contexts/PatientContext";
import { LogOut, Calendar, FileText, FlaskConical, Bell, Shield, Globe, ChevronRight, Edit2, IdCard } from "lucide-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { useToast } from "@/hooks/use-toast";

export default function PatientProfile() {
  const navigate = useNavigate();
  const { user, userProfile, signOut } = useAuth();
  const { profile } = usePatient();
  const { toast } = useToast();

  const handleSignOut = async () => {
    await signOut();
    navigate("/auth");
  };

  const getInitials = (name: string) => {
    if (!name) return "U";
    return name.charAt(0).toUpperCase();
  };

  // Prioritize the actual profile data over the generic auth metadata
  const displayName = userProfile?.full_name || user?.user_metadata?.full_name || "সম্মানিত ব্যবহারকারী";
  const displayPhone = userProfile?.phone || user?.phone || "ফোন নম্বর যোগ করুন";

  return (
    <div className="patient-screen active bg-[var(--bg)]" id="sc-myprofile">
      <div className="scroll-body flex-1 overflow-y-auto pb-24">
        {/* User Hero */}
        <div className="user-prof-hero">
          <Avatar className="up-av">
            <AvatarFallback className="bg-[var(--g0)] text-[var(--g7)]">
              {getInitials(displayName)}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1 min-w-0">
            <div className="up-name truncate">{displayName}</div>
            <div className="up-phone">{displayPhone}</div>
            <div 
              className="up-edit flex items-center gap-1 cursor-pointer" 
              onClick={() => navigate("/complete-profile")}
            >
              <Edit2 className="h-3 w-3" /> প্রোফাইল এডিট
            </div>
          </div>
        </div>

        {/* Health Card */}
        <div className="mx-4 my-3">
          <div 
            className="flex items-center gap-3.5 p-4 cursor-pointer"
            style={{
              background: "linear-gradient(135deg, var(--g8), var(--g5))",
              borderRadius: "var(--r-lg)",
            }}
            onClick={() => navigate("/health-card")}
          >
            <div className="text-3xl text-white opacity-90"><IdCard className="h-8 w-8" /></div>
            <div className="flex-1 min-w-0">
              <div className="text-[13px] font-bold text-white mb-0.5">স্বাস্থ্য কার্ড</div>
              <div className="text-[11px] text-white/70">
                ব্লাড গ্রুপ: {userProfile?.blood_group || "N/A"} · বয়স: {userProfile?.age || profile?.age || "N/A"} · {userProfile?.gender || profile?.gender || "লিঙ্গ"}
              </div>
            </div>
            <div className="text-white/40"><ChevronRight className="h-5 w-5" /></div>
          </div>
        </div>

        {/* Menu Items */}
        <div className="prof-menu-section mt-2">স্বাস্থ্যসেবা</div>
        <div className="prof-menu-item" onClick={() => navigate("/appointments")}>
          <div className="pmi-icon green"><Calendar className="h-4 w-4" /></div>
          <span className="pmi-label">আমার অ্যাপয়েন্টমেন্ট</span>
          {/* <span className="pmi-badge">৩</span> */}
          <span className="pmi-arrow"><ChevronRight className="h-4 w-4" /></span>
        </div>
        <div className="prof-menu-item" onClick={() => navigate("/prescription")}>
          <div className="pmi-icon blue"><FileText className="h-4 w-4" /></div>
          <span className="pmi-label">প্রেসক্রিপশন</span>
          <span className="pmi-arrow"><ChevronRight className="h-4 w-4" /></span>
        </div>
        <div className="prof-menu-item" onClick={() => navigate("/reports")}>
          <div className="pmi-icon amber"><FlaskConical className="h-4 w-4" /></div>
          <span className="pmi-label">টেস্টের রিপোর্ট</span>
          <span className="pmi-arrow"><ChevronRight className="h-4 w-4" /></span>
        </div>

        <div className="prof-menu-section mt-3">অ্যাকাউন্ট</div>
        <div className="prof-menu-item" onClick={() => toast({ title: "শীঘ্রই আসছে", description: "নোটিফিকেশন সেটিংস খুব শীঘ্রই চালু হবে।" })}>
          <div className="pmi-icon green"><Bell className="h-4 w-4" /></div>
          <span className="pmi-label">নোটিফিকেশন সেটিংস</span>
          <span className="pmi-arrow"><ChevronRight className="h-4 w-4" /></span>
        </div>
        <div className="prof-menu-item" onClick={() => toast({ title: "শীঘ্রই আসছে", description: "নিরাপত্তা সেটিংস খুব শীঘ্রই চালু হবে।" })}>
          <div className="pmi-icon blue"><Shield className="h-4 w-4" /></div>
          <span className="pmi-label">নিরাপত্তা ও গোপনীয়তা</span>
          <span className="pmi-arrow"><ChevronRight className="h-4 w-4" /></span>
        </div>
        <div className="prof-menu-item" onClick={() => navigate("/about")}>
          <div className="pmi-icon green"><Globe className="h-4 w-4" /></div>
          <span className="pmi-label">আমাদের সম্পর্কে</span>
          <span className="pmi-arrow"><ChevronRight className="h-4 w-4" /></span>
        </div>
        <div className="prof-menu-item" onClick={handleSignOut}>
          <div className="pmi-icon red"><LogOut className="h-4 w-4" /></div>
          <span className="pmi-label text-[var(--red)]">লগ আউট</span>
          <span className="pmi-arrow"><ChevronRight className="h-4 w-4" /></span>
        </div>

        <div className="h-4"></div>
      </div>
    </div>
  );
}
