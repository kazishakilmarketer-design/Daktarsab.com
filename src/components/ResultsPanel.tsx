import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { usePatient } from "@/contexts/PatientContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { HeartPulse, CheckCircle2, AlertTriangle, Building2, Stethoscope, ChevronRight, Activity, Syringe, Pill, GraduationCap, Clock, Volume2, VolumeX, MapPin, Search as SearchIcon, Heart, CalendarCheck, FileText, Share2, Download, ExternalLink, RefreshCw, Plus, Minus, FileQuestion, ArrowRight, ShieldCheck, Tag, Star, UserRound, HelpCircle, Megaphone, Info, Zap, TestTubes, X } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import ProfileGate from "@/components/ProfileGate";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import type { AiMedicalResponse } from "@/lib/aiChat";
import { trackLead } from "@/lib/leadTracking";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import CapacityWidget from "@/components/CapacityWidget";

function ListenButton({ text }: { text: string }) {
  const [speaking, setSpeaking] = useState(false);
  const [voicesReady, setVoicesReady] = useState(false);

  // Re-scan voices on mount and on interaction for desktop browsers
  useEffect(() => {
    function loadVoices() {
      const voices = window.speechSynthesis.getVoices();
      if (voices.length > 0) setVoicesReady(true);
    }
    loadVoices();
    window.speechSynthesis.addEventListener("voiceschanged", loadVoices);

    // Desktop Chrome workaround: trigger voice loading on first user interaction
    const triggerLoad = () => {
      window.speechSynthesis.getVoices();
      document.removeEventListener("click", triggerLoad);
    };
    document.addEventListener("click", triggerLoad, { once: true });

    return () => {
      window.speechSynthesis.removeEventListener("voiceschanged", loadVoices);
      document.removeEventListener("click", triggerLoad);
    };
  }, []);

  function getBengaliVoice() {
    // Refresh voices on-demand (critical for desktop Chrome/Edge)
    const voices = window.speechSynthesis.getVoices();

    // Priority list: best quality Bengali voices first
    const priority = [
      (v: SpeechSynthesisVoice) => /google\s*বাংলা/i.test(v.name),
      (v: SpeechSynthesisVoice) => /google.*bengali/i.test(v.name),
      (v: SpeechSynthesisVoice) => /microsoft\s*hemant/i.test(v.name),
      (v: SpeechSynthesisVoice) => /microsoft.*bangla/i.test(v.name),
      (v: SpeechSynthesisVoice) => v.lang.startsWith("bn") && /male|পুরুষ/i.test(v.name) && !/female|মহিলা/i.test(v.name),
      (v: SpeechSynthesisVoice) => v.lang.startsWith("bn"),
    ];

    for (const matcher of priority) {
      const found = voices.find(matcher);
      if (found) return found;
    }
    return null;
  }

  function handleSpeak() {
    if (speaking) {
      window.speechSynthesis.cancel();
      setSpeaking(false);
      return;
    }

    // Desktop browsers: force voice list refresh on interaction
    window.speechSynthesis.getVoices();

    // Clean: remove emojis, JSON artifacts, English keys — read only Bengali
    const clean = text
      .replace(/[\u{1F600}-\u{1F9FF}\u{2600}-\u{26FF}\u{2700}-\u{27BF}\u{1F300}-\u{1F5FF}\u{1F680}-\u{1F6FF}\u{1FA00}-\u{1FA6F}\u{1FA70}-\u{1FAFF}]/gu, "")
      .replace(/```[\s\S]*?```/g, "")
      .replace(/\{[\s\S]*?\}/g, "")
      .replace(/\b(isEmergency|immediateAdvice|specialistNeeded|specialistReason|followUp|hospitals|tests|name|type|location|estimatedCost|phone|address|emergencyWarning)\b/gi, "")
      .replace(/[{}"[\]:,]/g, "")
      .replace(/true|false|null/g, "")
      .replace(/https?:\/\/\S+/g, "")
      .replace(/[a-zA-Z]{4,}/g, "")
      .replace(/\n{3,}/g, "\n")
      .trim();

    // Cancel any pending speech first
    window.speechSynthesis.cancel();

    const utterance = new SpeechSynthesisUtterance(clean);
    utterance.lang = "bn-BD";
    utterance.rate = 0.95;
    utterance.pitch = 1.1;
    const voice = getBengaliVoice();
    if (voice) utterance.voice = voice;
    utterance.onend = () => setSpeaking(false);
    utterance.onerror = () => setSpeaking(false);
    window.speechSynthesis.speak(utterance);
    setSpeaking(true);
  }

  return (
    <Button
      onClick={handleSpeak}
      variant={speaking ? "secondary" : "default"}
      size="sm"
      className="w-full gap-2 text-sm font-medium"
    >
      {speaking ? <VolumeX className="h-4 w-4" /> : <Volume2 className="h-4 w-4" />}
      {speaking ? "শোনা হচ্ছে..." : "রেজাল্ট শুনুন"}
    </Button>
  );
}

interface ResultsPanelProps {
  onClose?: () => void;
  variant?: string;
  aiData?: AiMedicalResponse | null;
}

export default function ResultsPanel({ onClose, variant, aiData }: ResultsPanelProps) {
  const { profile, treatmentTier } = usePatient();
  const { user, hasCompletedProfile } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  const [appointmentModalOpen, setAppointmentModalOpen] = useState(false);
  const [profileGateOpen, setProfileGateOpen] = useState(false);
  const [appointmentTarget, setAppointmentTarget] = useState<{ doctor?: string, hospital?: string, specialty?: string } | null>(null);
  const [patientName, setPatientName] = useState("");
  const [patientPhone, setPatientPhone] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleIntentToBook = (target: { doctor?: string, hospital?: string, specialty?: string }) => {
    if (!user) {
      toast({ title: "লগইন প্রয়োজন", description: "অ্যাপয়েন্টমেন্ট নিতে অনুগ্রহ করে লগইন করুন।" });
      navigate("/auth");
      return;
    }
    setAppointmentTarget(target);
    if (!hasCompletedProfile) {
      setProfileGateOpen(true);
    } else {
      setAppointmentModalOpen(true);
    }
  };

  async function handleAppointmentSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!patientName.trim() || !patientPhone.trim()) return;

    setIsSubmitting(true);
    try {
      if (aiData?.lead_id) {
        const { error } = await (supabase as any).from('leads')
          .update({
            patient_name: patientName,
            phone: patientPhone,
            status: 'Converted',
            doctor_name: appointmentTarget?.doctor || null,
            hospital_name: appointmentTarget?.hospital || null,
            specialty: appointmentTarget?.specialty || null,
            symptom: aiData?.condition || null,
            source: 'ai_recommendation',
            inquiry_details: `Appointment Request: ${appointmentTarget?.doctor || appointmentTarget?.hospital || 'Unknown'} - ${appointmentTarget?.specialty || ''}`
          })
          .eq('id', aiData.lead_id);
        if (error) throw error;
      } else {
        const { error } = await (supabase as any).from('leads').insert({
          patient_name: patientName,
          phone: patientPhone,
          status: 'Converted',
          doctor_name: appointmentTarget?.doctor || null,
          hospital_name: appointmentTarget?.hospital || null,
          specialty: appointmentTarget?.specialty || null,
          symptom: aiData?.condition || null,
          source: 'ai_recommendation',
          inquiry_details: `Appointment Request: ${appointmentTarget?.doctor || appointmentTarget?.hospital || 'Unknown'} - ${appointmentTarget?.specialty || ''}`
        });
        if (error) throw error;
      }

      toast({
        title: "অ্যাপয়েন্টমেন্ট রিকোয়েস্ট সফল!",
        description: "শিগগিরই আমাদের প্রতিনিধি আপনার সাথে স্ক্যান/বুকিং নিশ্চিত করতে কল করবেন।",
      });
      setAppointmentModalOpen(false);
      setPatientName("");
      setPatientPhone("");

      if (appointmentTarget?.doctor) {
        trackLead({ type: "appointment", doctor_name: appointmentTarget.doctor, specialty: appointmentTarget.specialty, symptom: aiData?.condition, source: 'ai_recommendation' });
      } else if (appointmentTarget?.hospital) {
        trackLead({ type: "appointment", hospital_name: appointmentTarget.hospital, specialty: appointmentTarget.specialty, symptom: aiData?.condition, source: 'ai_recommendation' });
      }
    } catch (err) {
      toast({ title: "সমস্যা হয়েছে", description: "আবার চেষ্টা করুন।", variant: "destructive" });
    } finally {
      setIsSubmitting(false);
    }
  }

  // Use AI doctors if available, otherwise we use some mock logic or just empty
  const displayDoctors = aiData?.recommendedDoctors?.length 
    ? aiData.recommendedDoctors 
    : [
        { doctorName: "ডা. রহিম উদ্দিন আহমেদ", specialization: "হৃদরোগ বিশেষজ্ঞ · ঢাকা মেডিকেল কলেজ", qualification: "MBBS, MD Cardiology", designation: "১৫ বছর অভিজ্ঞতা", chamber: "ঢাকা" },
        { doctorName: "ডা. সারা বেগম", specialization: "নিউরোলজিস্ট · বিএসএমএমইউ", qualification: "MBBS, FCPS (Neurology)", designation: "১০ বছর অভিজ্ঞতা", chamber: "ঢাকা" },
        { doctorName: "ডা. করিম হোসেন", specialization: "শিশু বিশেষজ্ঞ · শিশু হাসপাতাল", qualification: "MBBS, DCH", designation: "৮ বছর অভিজ্ঞতা", chamber: "ঢাকা" },
        { doctorName: "ডা. তাহমিনা সুলতানা", specialization: "গাইনোকোলজিস্ট · ইডেন মাল্টিকেয়ার", qualification: "MBBS, FCPS (Obs & Gynae)", designation: "১২ বছর অভিজ্ঞতা", chamber: "ঢাকা" }
      ];

  const totalDoctors = displayDoctors.length > 0 ? (aiData?.recommendedDoctors?.length ? displayDoctors.length : "২,২৩২") : "০";

  return (
    <div className="patient-screen active bg-white" id="sc-search">
      {/* Top Header */}
      <div className="search-screen-top">
        <div className="flex items-center gap-2 mb-3">
          <button className="tb-back light h-8 w-8 flex items-center justify-center text-[var(--ink2)]" onClick={onClose} aria-label="Back">‹</button>
          <span className="text-base font-bold flex-1 text-center pr-8">ডাক্তার খুঁজুন</span>
        </div>
        <div className="search-bar-full">
          <span className="sb-icon">
             <SearchIcon className="h-4 w-4" />
          </span>
          <Input className="sb-inp h-6" placeholder="নাম, বিশেষজ্ঞতা বা হাসপাতাল..." />
          <span className="sb-filter text-[var(--g5)] text-lg">⚙️</span>
        </div>
        <div className="filter-chips pt-1">
          <div className="fchip on">সব ডাক্তার</div>
          <div className="fchip">হৃদরোগ</div>
          <div className="fchip">নিউরোলজি</div>
          <div className="fchip">শিশু</div>
          <div className="fchip">গাইনো</div>
          <div className="fchip">চক্ষু</div>
          <div className="fchip">অর্থো</div>
          <div className="fchip">মেডিসিন</div>
        </div>
      </div>

      <div className="result-count bg-[var(--bg)] border-b border-border">
        {aiData?.hospitals?.length ? (
          <><strong>{aiData.hospitals.length} টি</strong> হাসপাতাল পাওয়া গেছে</>
        ) : (
          <><strong>{totalDoctors} জন</strong> যাচাইকৃত ডাক্তার পাওয়া গেছে</>
        )}
      </div>

      <div className="flex-1 overflow-y-auto pt-3 pb-8 bg-[var(--bg)] space-y-3 px-0">
        {aiData?.hospitals?.length ? (
          aiData.hospitals.map((h, i) => (
            <div key={`h-${i}`} className="doc-result-card" onClick={() => handleIntentToBook({ hospital: h.name, specialty: h.type })}>
              <div className="drc-row1">
                <div className="dr-av" style={{ background: "var(--g0)", color: "var(--g7)" }}>
                  <Building2 size={20} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="dr-name">{h.name}</div>
                  <div className="dr-spec">{h.type}</div>
                  <div className="text-[11px] text-slate-500 mt-1 truncate">📍 {h.location}</div>
                  <CapacityWidget hospitalName={h.name} compact={true} />
                </div>
              </div>
              <div className="drc-divider"></div>
              <div className="drc-row2">
                <div className="drc-metas">
                  {h.estimatedCost && <div className="drc-mv"><span className="drc-mv-val text-[var(--g5)]">{h.estimatedCost}</span><span className="drc-mv-lbl">খরচ</span></div>}
                </div>
                <button 
                  className="drc-book-btn" 
                  onClick={(e) => {
                    e.stopPropagation();
                    handleIntentToBook({ hospital: h.name, specialty: h.type });
                  }}
                >
                  যোগাযোগ করুন
                </button>
              </div>
            </div>
          ))
        ) : (
          displayDoctors.map((doc, i) => {
          const firstChar = doc.doctorName.replace("ডা. ", "").charAt(0) || "ড";
          const rating = (4.5 + Math.random() * 0.5).toFixed(1);
          const fee = 600 + Math.floor(Math.random() * 6) * 100;

          return (
            <div key={i} className="doc-result-card" onClick={() => handleIntentToBook({ doctor: doc.doctorName, specialty: doc.specialization })}>
              <div className="drc-row1">
                <div className="dr-av" style={{ background: i % 2 === 0 ? "var(--g0)" : "#EFF6FF", color: i % 2 === 0 ? "var(--g7)" : "#1D4ED8" }}>
                  {firstChar}
                  <div className="dr-v">✓</div>
                </div>
                <div className="flex-1">
                  <div className="dr-name">{doc.doctorName}</div>
                  <div className="dr-spec">{doc.specialization}</div>
                  <div className="dr-tags">
                    <span className="dr-tag">{doc.qualification?.split(",")[0] || "MBBS"}</span>
                    <span className="dr-tag">{doc.designation}</span>
                  </div>
                </div>
              </div>
              <div className="drc-divider"></div>
              <div className="drc-row2">
                <div className="drc-metas">
                  <div className="drc-mv"><span className="drc-mv-val text-[var(--amber)]">★ {rating}</span><span className="drc-mv-lbl">রেটিং</span></div>
                  <div className="drc-mv"><span className="drc-mv-val">৩১২</span><span className="drc-mv-lbl">রিভিউ</span></div>
                  <div className="drc-mv"><span className="drc-mv-val text-[var(--g5)]">৳{fee}</span><span className="drc-mv-lbl">ফি</span></div>
                </div>
                <button 
                  className="drc-book-btn" 
                  onClick={(e) => {
                    e.stopPropagation();
                    handleIntentToBook({ doctor: doc.doctorName, specialty: doc.specialization });
                  }}
                >
                  বুক করুন
                </button>
              </div>
            </div>
          );
        }))}
      </div>

      <Dialog open={appointmentModalOpen} onOpenChange={setAppointmentModalOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <form onSubmit={handleAppointmentSubmit}>
            <DialogHeader>
              <DialogTitle>অ্যাপয়েন্টমেন্ট রিকোয়েস্ট</DialogTitle>
              <DialogDescription>
                আপনার তথ্য দিন, আমাদের টিম দ্রুত আপনার সাথে যোগাযোগ করবে।
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="name">রোগীর নাম</Label>
                <Input id="name" value={patientName} onChange={(e) => setPatientName(e.target.value)} required />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="phone">মোবাইল নাম্বার</Label>
                <Input id="phone" type="tel" value={patientPhone} onChange={(e) => setPatientPhone(e.target.value)} required />
              </div>
            </div>
            <DialogFooter>
              <Button type="submit" disabled={isSubmitting} className="w-full">
                {isSubmitting ? "পাঠানো হচ্ছে..." : "কনফার্ম করুন"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <ProfileGate
        open={profileGateOpen}
        onOpenChange={setProfileGateOpen}
        onSuccess={() => {
          setProfileGateOpen(false);
          setAppointmentModalOpen(true);
        }}
      />
    </div>
  );
}
