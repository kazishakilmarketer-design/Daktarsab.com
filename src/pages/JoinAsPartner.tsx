/**
 * DaktarSab — Join as Partner (Doctor Registration)
 * Route: /join-as-partner
 * Fully responsive 4-step multi-step form.
 * Mobile: single-column stacked. Tablet+: form + sidebar side-by-side.
 */
import { useState, useEffect, useRef } from "react";
import { ChevronLeft, ChevronRight, Check, User, Stethoscope, MapPin, Zap, Camera, Eye, EyeOff } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { notifyNewPartnerRegistration } from "@/lib/notificationService";

/* ─── Responsive hook ───────────────────────────────────────────────── */
function useIsMobile(breakpoint = 768) {
  const [isMobile, setIsMobile] = useState(() => window.innerWidth < breakpoint);
  useEffect(() => {
    const handler = () => setIsMobile(window.innerWidth < breakpoint);
    window.addEventListener("resize", handler);
    return () => window.removeEventListener("resize", handler);
  }, [breakpoint]);
  return isMobile;
}

/* ─── Static options ────────────────────────────────────────────────── */
const SPECIALTIES = [
  "মেডিসিন স্পেশালিস্ট", "কার্ডিওলজিস্ট", "নিউরোলজিস্ট", "গাইনী ও ধাত্রীবিদ্যা",
  "শিশু বিশেষজ্ঞ", "অর্থোপেডিক্স সার্জন", "চর্মরোগ বিশেষজ্ঞ", "চক্ষু বিশেষজ্ঞ",
  "ইএনটি বিশেষজ্ঞ", "ডায়াবেটিস বিশেষজ্ঞ", "কিডনি বিশেষজ্ঞ", "ক্যান্সার বিশেষজ্ঞ",
  "মানসিক স্বাস্থ্য বিশেষজ্ঞ", "ডেন্টিস্ট", "ফিজিওথেরাপিস্ট", "অন্যান্য",
];

const DEGREES = ["MBBS", "BDS", "MD", "MS", "FCPS", "MRCP", "FRCS", "PhD", "MPH", "DLO", "DO", "ডিপ্লোমা"];

const DIVISIONS = ["ঢাকা", "চট্টগ্রাম", "রাজশাহী", "খুলনা", "বরিশাল", "সিলেট", "রংপুর", "ময়মনসিংহ"];

const DISTRICTS: Record<string, string[]> = {
  "ঢাকা": ["ঢাকা", "গাজীপুর", "নারায়ণগঞ্জ", "মানিকগঞ্জ", "নরসিংদী", "মুন্সীগঞ্জ", "কিশোরগঞ্জ"],
  "চট্টগ্রাম": ["চট্টগ্রাম", "কক্সবাজার", "রাঙামাটি", "খাগড়াছড়ি", "বান্দরবান", "ফেনী", "নোয়াখালী"],
  "রাজশাহী": ["রাজশাহী", "নওগাঁ", "নাটোর", "পাবনা", "সিরাজগঞ্জ", "বগুড়া", "জয়পুরহাট"],
  "খুলনা": ["খুলনা", "বাগেরহাট", "সাতক্ষীরা", "যশোর", "নড়াইল", "কুষ্টিয়া", "মেহেরপুর"],
  "বরিশাল": ["বরিশাল", "পটুয়াখালী", "ভোলা", "পিরোজপুর", "ঝালকাঠি", "বরগুনা"],
  "সিলেট": ["সিলেট", "মৌলভীবাজার", "হবিগঞ্জ", "সুনামগঞ্জ"],
  "রংপুর": ["রংপুর", "দিনাজপুর", "কুড়িগ্রাম", "গাইবান্ধা", "লালমনিরহাট", "নীলফামারী", "পঞ্চগড়", "ঠাকুরগাঁও"],
  "ময়মনসিংহ": ["ময়মনসিংহ", "জামালপুর", "শেরপুর", "নেত্রকোণা"],
};

const DAYS = ["সোম", "মঙ্গল", "বুধ", "বৃহঃ", "শুক্র", "শনি", "রবি"];
const DAY_KEYS = ["mon", "tue", "wed", "thu", "fri", "sat", "sun"];
const SLOT_DURATIONS = ["১৫ মিনিট", "২০ মিনিট", "৩০ মিনিট", "৪৫ মিনিট", "৬০ মিনিট"];
const EMOJI_OPTIONS = ["👨‍⚕️", "👩‍⚕️", "❤️", "🧠", "🦴", "👶", "🌸", "💊", "✨", "👁️", "🦷", "💪"];
const SERVICES = [
  "ডিজিটাল প্রেসক্রিপশন", "ECG রেফারেল", "Lab রেফারেল", "ইনজেকশন সেবা",
  "ড্রেসিং ও ছোট অস্ত্রোপচার", "ভ্যাকসিনেশন", "হোম ভিজিট", "এমার্জেন্সি সেবা",
];

/* ─── Types ─────────────────────────────────────────────────────────── */
type Step = 1 | 2 | 3 | 4;
interface FormData {
  full_name: string; bmdc_no: string; email: string; phone: string;
  photo_url: string; // base64 preview
  password: string; confirm_password: string;
  degrees: string[]; specialty: string; other_specialty: string; experience_years: string;
  hospital_name: string; fee_in_person: string;
  division: string; district: string; area: string; address_detail: string;
  working_days: string[]; slot_start: string; slot_end: string; slot_duration: string;
  telehealth: boolean; telehealth_medium: string; fee_online: string;
  services: string[]; accepts_emergency: boolean; digital_prescription: boolean; terms: boolean;
}

const INITIAL: FormData = {
  full_name: "", bmdc_no: "", email: "", phone: "",
  photo_url: "", password: "", confirm_password: "",
  degrees: [], specialty: "", other_specialty: "", experience_years: "", hospital_name: "", fee_in_person: "",
  division: "", district: "", area: "", address_detail: "",
  working_days: [], slot_start: "09:00", slot_end: "13:00", slot_duration: "২০ মিনিট",
  telehealth: false, telehealth_medium: "video", fee_online: "",
  services: [], accepts_emergency: false, digital_prescription: false, terms: false,
};

/* ─── Tiny shared UI atoms ──────────────────────────────────────────── */
function Label({ children, required }: { children: React.ReactNode; required?: boolean }) {
  return (
    <label style={{ fontSize: 13, fontWeight: 700, color: "#0F172A", display: "block", marginBottom: 5 }}>
      {children}{required && <span style={{ color: "#EF4444" }}> *</span>}
    </label>
  );
}

function Input({ ...props }: React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input {...props} style={{ width: "100%", padding: "11px 14px", border: "1.5px solid #E2E8F0", borderRadius: 10, fontSize: 14, fontFamily: "inherit", outline: "none", background: "#F8FAF9", boxSizing: "border-box", ...(props.style ?? {}) }} />
  );
}

function Select({ children, ...props }: React.SelectHTMLAttributes<HTMLSelectElement>) {
  return (
    <select {...props} style={{ width: "100%", padding: "11px 14px", border: "1.5px solid #E2E8F0", borderRadius: 10, fontSize: 14, fontFamily: "inherit", outline: "none", background: "#F8FAF9", appearance: "none", boxSizing: "border-box" }}>
      {children}
    </select>
  );
}

function Chip({ active, onClick, children }: { active: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <div onClick={onClick} style={{ display: "inline-flex", alignItems: "center", gap: 4, padding: "6px 11px", borderRadius: 20, fontSize: 12, fontWeight: 700, cursor: "pointer", userSelect: "none", border: `1.5px solid ${active ? "#0F6E56" : "#E2E8F0"}`, background: active ? "#EAF9F3" : "#fff", color: active ? "#0F6E56" : "#64748B", transition: "all .15s" }}>
      {active && <Check size={11} />}{children}
    </div>
  );
}

function Toggle({ on, onToggle, label, sub }: { on: boolean; onToggle: () => void; label: string; sub: string }) {
  return (
    <div onClick={onToggle} style={{ background: on ? "#EAF9F3" : "#F8FAF9", border: `1.5px solid ${on ? "#D1F5EA" : "#E2E8F0"}`, borderRadius: 12, padding: "14px 16px", display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12, cursor: "pointer" }}>
      <div>
        <div style={{ fontSize: 14, fontWeight: 700, color: "#0F172A" }}>{label}</div>
        <div style={{ fontSize: 11, color: "#64748B", marginTop: 2 }}>{sub}</div>
      </div>
      <div style={{ width: 44, height: 24, background: on ? "#0F6E56" : "#CBD5E1", borderRadius: 12, position: "relative", flexShrink: 0, transition: "background .2s" }}>
        <div style={{ position: "absolute", top: 3, left: on ? 22 : 3, width: 18, height: 18, borderRadius: "50%", background: "#fff", transition: "left .2s", boxShadow: "0 1px 3px rgba(0,0,0,.2)" }} />
      </div>
    </div>
  );
}

/* ─── Step metadata ─────────────────────────────────────────────────── */
const STEPS = [
  { num: 1 as Step, icon: User, label: "পরিচয়" },
  { num: 2 as Step, icon: Stethoscope, label: "পেশাগত" },
  { num: 3 as Step, icon: MapPin, label: "লোকেশন" },
  { num: 4 as Step, icon: Zap, label: "সেবা" },
];

const VALUE_PROPS: Record<Step, { emoji: string; text: string }[]> = {
  1: [{ emoji: "✅", text: "BMDC নম্বর দিলে Verified ব্যাজ — রোগীদের আস্থা ৩× বাড়ে" }, { emoji: "📸", text: "ইমোজি বেছে নিলে তালিকায় আলাদাভাবে চোখে পড়বেন" }],
  2: [{ emoji: "💰", text: "সঠিক ফি দিলে রোগীরা সিদ্ধান্ত নিতে পারেন সহজে" }, { emoji: "🎓", text: "ডিগ্রি যোগ করলে প্রোফাইলের বিশ্বাসযোগ্যতা বাড়ে" }],
  3: [{ emoji: "📍", text: "এলাকা দিলে কাছের রোগীরা আপনাকে খুঁজে পাবেন" }, { emoji: "⏰", text: "সময়সূচি → 'আজ ৫টায় সময় আছে' তালিকায় দেখাবে" }],
  4: [{ emoji: "📲", text: "টেলিহেলথ → সারাদেশের রোগী পাবেন" }, { emoji: "📋", text: "ডিজিটাল প্রেসক্রিপশন = প্রিমিয়াম ইমেজ" }],
};

/* ─── Main Component ────────────────────────────────────────────────── */
export default function JoinAsPartner() {
  const isMobile = useIsMobile(768);
  const [step, setStep] = useState<Step>(1);
  const [form, setForm] = useState<FormData>(INITIAL);
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [showPass, setShowPass] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  function set(field: keyof FormData, val: unknown) {
    setForm(prev => ({ ...prev, [field]: val }));
  }

  function toggleArr(field: "degrees" | "working_days" | "services", val: string) {
    setForm(prev => {
      const arr = prev[field] as string[];
      return { ...prev, [field]: arr.includes(val) ? arr.filter(x => x !== val) : [...arr, val] };
    });
  }

  function handlePhotoChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => set("photo_url", ev.target?.result as string);
    reader.readAsDataURL(file);
  }

  async function handleSubmit() {
    if (!form.terms) { setError("শর্তাবলীতে সম্মতি দিন।"); return; }
    if (form.password.length < 6) { setError("পাসওয়ার্ড কমপক্ষে ৬ অক্ষরের হতে হবে।"); return; }
    if (form.password !== form.confirm_password) { setError("পাসওয়ার্ড দুটি মিলছে না।"); return; }
    setLoading(true); setError("");
    try {
      const payload = {
        type: "specialist_doctor",
        name: form.full_name.trim(), bmdc_no: form.bmdc_no.trim(),
        email: form.email.trim(), phone: form.phone.trim(),
        photo_url: form.photo_url ? "[uploaded]" : null,
        degrees: form.degrees.join(", "),
        specialty: form.specialty === "অন্যান্য" ? form.other_specialty : form.specialty,
        experience_years: parseInt(form.experience_years) || 0,
        hospital_name: form.hospital_name.trim(),
        fee_in_person: parseInt(form.fee_in_person) || 0,
        fee_online: form.telehealth ? (parseInt(form.fee_online) || 0) : null,
        division: form.division, district: form.district, area: form.area.trim(),
        address: form.address_detail.trim(),
        working_days: form.working_days.join(","),
        slot_start: form.slot_start, slot_end: form.slot_end, slot_duration: form.slot_duration,
        telehealth: form.telehealth, telehealth_medium: form.telehealth ? form.telehealth_medium : null,
        services: form.services.join(","),
        accepts_emergency: form.accepts_emergency, digital_prescription: form.digital_prescription, status: "pending",
      };
      const { error: dbErr } = await (supabase as any).from("partner_registrations").insert(payload);
      if (dbErr) throw dbErr;
      // Fire-and-forget: notify admin of new partner registration
      notifyNewPartnerRegistration({
        name: payload.name,
        email: payload.email,
        phone: payload.phone,
        specialty: payload.specialty,
        bmdc_no: payload.bmdc_no,
        district: payload.district,
      });
      setSubmitted(true);
    } catch (e: any) {
      setError(e?.message ?? "ত্রুটি হয়েছে। আবার চেষ্টা করুন।");
    } finally { setLoading(false); }
  }

  const pct = (step / 4) * 100;

  /* ── Success ──────────────────────────────────────── */
  if (submitted) return (
    <div style={{ minHeight: "100vh", background: "#F1F5F4", display: "flex", alignItems: "center", justifyContent: "center", padding: "20px" }}>
      <div style={{ background: "#fff", borderRadius: 20, boxShadow: "0 8px 40px rgba(0,0,0,.1)", padding: isMobile ? "32px 20px" : "48px 36px", maxWidth: 420, width: "100%", textAlign: "center" }}>
        <div style={{ width: 72, height: 72, borderRadius: 20, background: "#EAF9F3", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 36, margin: "0 auto 20px" }}>✅</div>
        <h2 style={{ fontSize: 22, fontWeight: 800, color: "#0F172A", marginBottom: 10 }}>আবেদন সম্পন্ন!</h2>
        <p style={{ fontSize: 13, color: "#64748B", lineHeight: 1.6 }}>
          ডা. <strong>{form.full_name}</strong>, আপনার আবেদন পাওয়া গেছে।<br />
          আমাদের টিম <strong>২৪ ঘণ্টার মধ্যে</strong> যোগাযোগ করবে।
        </p>
        <div style={{ background: "#EAF9F3", borderRadius: 12, padding: 16, margin: "20px 0", display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, textAlign: "left" }}>
          {[["BMDC", form.bmdc_no], ["বিশেষজ্ঞতা", form.specialty], ["ফি", `৳${form.fee_in_person}`], ["জেলা", form.district]].map(([l, v]) => (
            <div key={l} style={{ fontSize: 12 }}><span style={{ color: "#64748B" }}>{l}</span><div style={{ fontWeight: 700 }}>{v}</div></div>
          ))}
        </div>
        <a href="/doctor-dashboard" style={{ display: "block", background: "#0F6E56", color: "#fff", padding: 12, borderRadius: 10, fontSize: 14, fontWeight: 700, textDecoration: "none" }}>ড্যাশবোর্ডে যান →</a>
      </div>
    </div>
  );

  /* col helper — collapses to 1 on mobile */
  const cols2 = (n: number) => isMobile ? "1fr" : `repeat(${n}, 1fr)`;
  const cols3 = () => isMobile ? "1fr" : "1fr 1fr 1fr";

  /* ── Main ─────────────────────────────────────────── */
  return (
    <div style={{ minHeight: "100vh", background: "#F1F5F4", padding: isMobile ? "0" : "24px 20px" }}>
      <div style={{
        maxWidth: 960,
        margin: "0 auto",
        display: "flex",
        flexDirection: isMobile ? "column" : "row",
        gap: 20,
        alignItems: "flex-start",
      }}>

        {/* ── Form card ── */}
        <div style={{ flex: 1, background: "#fff", borderRadius: isMobile ? 0 : 20, boxShadow: isMobile ? "none" : "0 8px 40px rgba(0,0,0,.08)", overflow: "hidden", minWidth: 0 }}>

          {/* Header banner */}
          <div style={{ background: "linear-gradient(135deg,#0F6E56,#1D9E75)", padding: isMobile ? "20px 18px" : "24px 28px" }}>
            {/* DaktarSab branding */}
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 12 }}>
              <div style={{ width: 32, height: 32, background: "rgba(255,255,255,.2)", borderRadius: 9, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18, fontWeight: 800, color: "#fff" }}>✚</div>
              <span style={{ fontSize: 18, fontWeight: 900, color: "#fff", letterSpacing: "-.3px" }}>Daktar<span style={{ color: "#A7F3D0" }}>Sab</span></span>
            </div>
            <h1 style={{ fontSize: isMobile ? 16 : 18, fontWeight: 800, color: "#fff", margin: 0 }}>ডাক্তার হিসেবে যোগ দিন</h1>
            <p style={{ fontSize: 12, color: "rgba(255,255,255,.7)", marginTop: 4 }}>আপনার সম্পূর্ণ প্রোফাইল তৈরি করুন</p>
          </div>

          {/* Progress */}
          <div style={{ padding: isMobile ? "14px 18px 0" : "16px 28px 0" }}>
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8 }}>
              <span style={{ fontSize: 12, fontWeight: 700, color: "#0F6E56" }}>ধাপ {step} / 4</span>
              <span style={{ fontSize: 12, color: "#64748B" }}>{Math.round(pct)}% সম্পন্ন</span>
            </div>
            <div style={{ height: 6, background: "#E2E8F0", borderRadius: 3, overflow: "hidden" }}>
              <div style={{ height: "100%", width: `${pct}%`, background: "linear-gradient(90deg,#0F6E56,#5DCAA5)", borderRadius: 3, transition: "width .4s ease" }} />
            </div>
            {/* Step indicator tabs */}
            <div style={{ display: "flex", gap: isMobile ? 4 : 6, marginTop: 14, marginBottom: 4 }}>
              {STEPS.map(s => (
                <div key={s.num} onClick={() => step > s.num && setStep(s.num)}
                  style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: 3, cursor: step > s.num ? "pointer" : "default" }}>
                  <div style={{ width: isMobile ? 24 : 28, height: isMobile ? 24 : 28, borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 12, fontWeight: 700, flexShrink: 0,
                    background: step > s.num ? "#0F6E56" : step === s.num ? "#EAF9F3" : "#F1F5F4",
                    color: step > s.num ? "#fff" : step === s.num ? "#0F6E56" : "#94A3B8",
                    border: step === s.num ? "2px solid #0F6E56" : "2px solid transparent" }}>
                    {step > s.num ? <Check size={12} /> : s.num}
                  </div>
                  <span style={{ fontSize: isMobile ? 9 : 10, fontWeight: 600, color: step === s.num ? "#0F6E56" : "#94A3B8", textAlign: "center" }}>{s.label}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Mobile: value prop inline (compact) */}
          {isMobile && (
            <div style={{ margin: "10px 18px 0", background: "#EAF9F3", borderRadius: 10, padding: "10px 14px" }}>
              {VALUE_PROPS[step].map((v, i) => (
                <div key={i} style={{ display: "flex", gap: 8, alignItems: "flex-start", marginBottom: i < VALUE_PROPS[step].length - 1 ? 6 : 0 }}>
                  <span style={{ fontSize: 14, flexShrink: 0 }}>{v.emoji}</span>
                  <p style={{ fontSize: 11, color: "#085041", lineHeight: 1.4, margin: 0 }}>{v.text}</p>
                </div>
              ))}
            </div>
          )}

          {/* Form body */}
          <div style={{ padding: isMobile ? "16px 18px 24px" : "20px 28px 28px" }}>

            {/* ── STEP 1 ── */}
            {step === 1 && (
              <div>
                <h2 style={{ fontSize: 15, fontWeight: 800, color: "#0F172A", marginBottom: 18 }}>🪪 পরিচয় ও যোগাযোগ</h2>

                {/* Photo upload */}
                <div style={{ marginBottom: 18 }}>
                  <Label>প্রোফাইল ছবি <span style={{ fontWeight: 400, color: "#64748B", fontSize: 11 }}>— ডাক্তার তালিকায় দেখাবে</span></Label>
                  <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
                    <div style={{ width: 72, height: 72, borderRadius: 16, background: "#EAF9F3", border: "2px dashed #A7F3D0", display: "flex", alignItems: "center", justifyContent: "center", overflow: "hidden", flexShrink: 0, cursor: "pointer" }}
                      onClick={() => fileInputRef.current?.click()}>
                      {form.photo_url
                        ? <img src={form.photo_url} alt="preview" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                        : <div style={{ textAlign: "center" }}><Camera size={22} color="#5DCAA5" /><div style={{ fontSize: 9, color: "#5DCAA5", marginTop: 3, fontWeight: 600 }}>ছবি যোগ করুন</div></div>
                      }
                    </div>
                    <div>
                      <button type="button" onClick={() => fileInputRef.current?.click()}
                        style={{ display: "flex", alignItems: "center", gap: 6, padding: "8px 14px", border: "1.5px solid #0F6E56", borderRadius: 8, background: "#EAF9F3", color: "#0F6E56", fontSize: 12, fontWeight: 700, cursor: "pointer", fontFamily: "inherit" }}>
                        <Camera size={14} /> ছবি আপলোড করুন
                      </button>
                      {form.photo_url && (
                        <button type="button" onClick={() => set("photo_url", "")}
                          style={{ display: "flex", alignItems: "center", gap: 4, marginTop: 6, padding: "5px 10px", border: "1px solid #E2E8F0", borderRadius: 7, background: "#fff", color: "#EF4444", fontSize: 11, fontWeight: 600, cursor: "pointer", fontFamily: "inherit" }}>
                          ✕ সরিয়ে ফেলুন
                        </button>
                      )}
                      <p style={{ fontSize: 11, color: "#94A3B8", marginTop: 5 }}>JPG, PNG — সর্বোচ্চ 5MB</p>
                    </div>
                  </div>
                  <input ref={fileInputRef} type="file" accept="image/*" style={{ display: "none" }} onChange={handlePhotoChange} />
                </div>

                <div style={{ display: "grid", gridTemplateColumns: cols2(2), gap: 14 }}>
                  <div style={{ gridColumn: "1/-1" }}>
                    <Label required>ডাক্তারের পূর্ণ নাম</Label>
                    <Input placeholder="ডা. মোহাম্মদ রহিমুল ইসলাম" value={form.full_name} onChange={e => set("full_name", e.target.value)} />
                    <p style={{ fontSize: 11, color: "#94A3B8", marginTop: 3 }}>ডাক্তার তালিকায় এভাবে দেখাবে</p>
                  </div>
                  <div>
                    <Label required>BMDC নম্বর</Label>
                    <Input placeholder="A-123456" value={form.bmdc_no} onChange={e => set("bmdc_no", e.target.value)} />
                    <p style={{ fontSize: 11, color: "#0F6E56", marginTop: 3, fontWeight: 600 }}>✅ Verified ব্যাজ পাবেন</p>
                  </div>
                  <div>
                    <Label required>মোবাইল নম্বর</Label>
                    <Input placeholder="01700-000000" value={form.phone} onChange={e => set("phone", e.target.value)} />
                  </div>
                  <div style={{ gridColumn: "1/-1" }}>
                    <Label required>ইমেইল ঠিকানা</Label>
                    <Input type="email" placeholder="doctor@gmail.com" value={form.email} onChange={e => set("email", e.target.value)} />
                    <p style={{ fontSize: 11, color: "#94A3B8", marginTop: 3 }}>লগইন ও নোটিফিকেশনের জন্য ব্যবহার হবে</p>
                  </div>
                  <div>
                    <Label required>পাসওয়ার্ড তৈরি করুন</Label>
                    <div style={{ position: "relative" }}>
                      <Input type={showPass ? "text" : "password"} placeholder="কমপক্ষে ৬ অক্ষর" value={form.password} onChange={e => set("password", e.target.value)} style={{ paddingRight: 40 }} />
                      <button type="button" onClick={() => setShowPass(v => !v)}
                        style={{ position: "absolute", right: 12, top: "50%", transform: "translateY(-50%)", background: "none", border: "none", cursor: "pointer", color: "#94A3B8" }}>
                        {showPass ? <EyeOff size={16} /> : <Eye size={16} />}
                      </button>
                    </div>
                  </div>
                  <div>
                    <Label required>পাসওয়ার্ড নিশ্চিত করুন</Label>
                    <div style={{ position: "relative" }}>
                      <Input type={showConfirm ? "text" : "password"} placeholder="পুনরায় লিখুন" value={form.confirm_password} onChange={e => set("confirm_password", e.target.value)} style={{ paddingRight: 40, borderColor: form.confirm_password && form.confirm_password !== form.password ? "#EF4444" : undefined }} />
                      <button type="button" onClick={() => setShowConfirm(v => !v)}
                        style={{ position: "absolute", right: 12, top: "50%", transform: "translateY(-50%)", background: "none", border: "none", cursor: "pointer", color: "#94A3B8" }}>
                        {showConfirm ? <EyeOff size={16} /> : <Eye size={16} />}
                      </button>
                    </div>
                    {form.confirm_password && form.confirm_password !== form.password && (
                      <p style={{ fontSize: 11, color: "#EF4444", marginTop: 3 }}>পাসওয়ার্ড দুটি মিলছে না</p>
                    )}
                    {form.confirm_password && form.confirm_password === form.password && (
                      <p style={{ fontSize: 11, color: "#0F6E56", marginTop: 3, fontWeight: 600 }}>✓ পাসওয়ার্ড মিলেছে</p>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* ── STEP 2 ── */}
            {step === 2 && (
              <div>
                <h2 style={{ fontSize: 15, fontWeight: 800, color: "#0F172A", marginBottom: 18 }}>🩺 পেশাগত তথ্য</h2>

                <div style={{ marginBottom: 18 }}>
                  <Label required>ডিগ্রি <span style={{ fontWeight: 400, color: "#64748B" }}>— একাধিক বেছে নিন</span></Label>
                  <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                    {DEGREES.map(d => <Chip key={d} active={form.degrees.includes(d)} onClick={() => toggleArr("degrees", d)}>{d}</Chip>)}
                  </div>
                  {form.degrees.length > 0 && <p style={{ fontSize: 11, color: "#0F6E56", marginTop: 6, fontWeight: 600 }}>নির্বাচিত: {form.degrees.join(", ")}</p>}
                </div>

                <div style={{ marginBottom: 14 }}>
                  <Label required>বিশেষজ্ঞতা</Label>
                  <Select value={form.specialty} onChange={e => set("specialty", e.target.value)}>
                    <option value="">বিশেষজ্ঞতা নির্বাচন করুন</option>
                    {SPECIALTIES.map(s => <option key={s} value={s}>{s}</option>)}
                  </Select>
                </div>

                {form.specialty === "অন্যান্য" && (
                  <div style={{ marginBottom: 14 }}>
                    <Label required>বিশেষজ্ঞতা লিখুন</Label>
                    <Input placeholder="আপনার বিশেষজ্ঞতা" value={form.other_specialty} onChange={e => set("other_specialty", e.target.value)} />
                  </div>
                )}

                <div style={{ display: "grid", gridTemplateColumns: cols2(2), gap: 14 }}>
                  <div>
                    <Label required>অভিজ্ঞতার বছর</Label>
                    <Input type="number" min="0" max="50" placeholder="যেমন: 15" value={form.experience_years} onChange={e => set("experience_years", e.target.value)} />
                    <p style={{ fontSize: 11, color: "#94A3B8", marginTop: 3 }}>ডাক্তার তালিকায় দেখাবে</p>
                  </div>
                  <div>
                    <Label required>কনসালটেশন ফি (৳)</Label>
                    <Input type="number" min="0" placeholder="যেমন: 800" value={form.fee_in_person} onChange={e => set("fee_in_person", e.target.value)} />
                    <p style={{ fontSize: 11, color: "#94A3B8", marginTop: 3 }}>অ্যাপয়েন্টমেন্টে দেখাবে</p>
                  </div>
                  <div style={{ gridColumn: "1/-1" }}>
                    <Label>হাসপাতাল / ক্লিনিক</Label>
                    <Input placeholder="ঢাকা মেডিকেল কলেজ হাসপাতাল" value={form.hospital_name} onChange={e => set("hospital_name", e.target.value)} />
                  </div>
                </div>
              </div>
            )}

            {/* ── STEP 3 ── */}
            {step === 3 && (
              <div>
                <h2 style={{ fontSize: 15, fontWeight: 800, color: "#0F172A", marginBottom: 18 }}>📍 লোকেশন ও সময়সূচি</h2>

                <div style={{ display: "grid", gridTemplateColumns: cols2(2), gap: 14, marginBottom: 14 }}>
                  <div>
                    <Label required>বিভাগ</Label>
                    <Select value={form.division} onChange={e => { set("division", e.target.value); set("district", ""); }}>
                      <option value="">বিভাগ নির্বাচন</option>
                      {DIVISIONS.map(d => <option key={d} value={d}>{d}</option>)}
                    </Select>
                  </div>
                  <div>
                    <Label required>জেলা</Label>
                    <Select value={form.district} onChange={e => set("district", e.target.value)} disabled={!form.division}>
                      <option value="">জেলা নির্বাচন</option>
                      {(DISTRICTS[form.division] ?? []).map(d => <option key={d} value={d}>{d}</option>)}
                    </Select>
                  </div>
                  <div>
                    <Label required>এলাকা / থানা</Label>
                    <Input placeholder="মহাখালী, গুলশান, মিরপুর…" value={form.area} onChange={e => set("area", e.target.value)} />
                    <p style={{ fontSize: 11, color: "#94A3B8", marginTop: 3 }}>অ্যাপয়েন্টমেন্টে "📍 মহাখালী, ঢাকা" দেখাবে</p>
                  </div>
                  <div>
                    <Label>বিস্তারিত ঠিকানা</Label>
                    <Input placeholder="রোড নম্বর, ব্লক, ঢাকা" value={form.address_detail} onChange={e => set("address_detail", e.target.value)} />
                  </div>
                </div>

                <div style={{ marginBottom: 16 }}>
                  <Label required>সাপ্তাহিক কার্যদিবস</Label>
                  <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                    {DAYS.map((d, i) => (
                      <Chip key={d} active={form.working_days.includes(DAY_KEYS[i])} onClick={() => toggleArr("working_days", DAY_KEYS[i])}>{d}</Chip>
                    ))}
                  </div>
                  {form.working_days.length > 0 && <p style={{ fontSize: 11, color: "#0F6E56", marginTop: 6, fontWeight: 600 }}>{form.working_days.length} দিন নির্বাচিত</p>}
                </div>

                <div style={{ display: "grid", gridTemplateColumns: cols3(), gap: 12 }}>
                  <div>
                    <Label required>শুরুর সময়</Label>
                    <Input type="time" value={form.slot_start} onChange={e => set("slot_start", e.target.value)} />
                  </div>
                  <div>
                    <Label required>শেষের সময়</Label>
                    <Input type="time" value={form.slot_end} onChange={e => set("slot_end", e.target.value)} />
                  </div>
                  <div>
                    <Label required>প্রতি স্লট</Label>
                    <Select value={form.slot_duration} onChange={e => set("slot_duration", e.target.value)}>
                      {SLOT_DURATIONS.map(s => <option key={s} value={s}>{s}</option>)}
                    </Select>
                  </div>
                </div>
                <p style={{ fontSize: 11, color: "#94A3B8", marginTop: 6 }}>এই সময়সূচি থেকে স্বয়ংক্রিয়ভাবে উপলব্ধ স্লট তৈরি হবে।</p>
              </div>
            )}

            {/* ── STEP 4 ── */}
            {step === 4 && (
              <div>
                <h2 style={{ fontSize: 15, fontWeight: 800, color: "#0F172A", marginBottom: 18 }}>⚡ অতিরিক্ত সেবা ও চূড়ান্ত</h2>

                <div style={{ display: "flex", flexDirection: "column", gap: 10, marginBottom: 14 }}>
                  <Toggle on={form.telehealth} onToggle={() => set("telehealth", !form.telehealth)}
                    label="📲 Telehealth (অনলাইন পরামর্শ)"
                    sub="ভিডিও / অডিও কলে দেশের যেকোনো রোগী পাবেন" />
                  <Toggle on={form.digital_prescription} onToggle={() => set("digital_prescription", !form.digital_prescription)}
                    label="📋 ডিজিটাল প্রেসক্রিপশন"
                    sub="রোগী অ্যাপে সরাসরি প্রেসক্রিপশন পাবেন" />
                  <Toggle on={form.accepts_emergency} onToggle={() => set("accepts_emergency", !form.accepts_emergency)}
                    label="🚨 এমার্জেন্সি রোগী গ্রহণ করবেন"
                    sub="AI থেকে জরুরি রোগীর Lead পাবেন" />
                </div>

                {form.telehealth && (
                  <div style={{ display: "grid", gridTemplateColumns: cols2(2), gap: 12, marginBottom: 14, padding: 14, background: "#EAF9F3", borderRadius: 12, border: "1.5px solid #D1F5EA" }}>
                    <div>
                      <Label>মাধ্যম</Label>
                      <Select value={form.telehealth_medium} onChange={e => set("telehealth_medium", e.target.value)}>
                        <option value="video">ভিডিও কল</option>
                        <option value="audio">অডিও কল</option>
                        <option value="both">উভয়</option>
                      </Select>
                    </div>
                    <div>
                      <Label required>অনলাইন ফি (৳)</Label>
                      <Input type="number" placeholder="যেমন: 500" value={form.fee_online} onChange={e => set("fee_online", e.target.value)} />
                    </div>
                  </div>
                )}

                <div style={{ marginBottom: 18 }}>
                  <Label>প্রদানকৃত সেবা</Label>
                  <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                    {SERVICES.map(s => <Chip key={s} active={form.services.includes(s)} onClick={() => toggleArr("services", s)}>{s}</Chip>)}
                  </div>
                </div>

                {/* Terms */}
                <div onClick={() => set("terms", !form.terms)}
                  style={{ display: "flex", alignItems: "flex-start", gap: 10, padding: "14px 16px", background: "#F8FAF9", border: "1.5px solid #E2E8F0", borderRadius: 10, cursor: "pointer", marginBottom: 4 }}>
                  <div style={{ width: 20, height: 20, borderRadius: 5, border: `2px solid ${form.terms ? "#0F6E56" : "#CBD5E1"}`, background: form.terms ? "#0F6E56" : "#fff", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, marginTop: 1 }}>
                    {form.terms && <Check size={12} color="white" />}
                  </div>
                  <p style={{ fontSize: 12, color: "#334155", lineHeight: 1.5, margin: 0 }}>
                    আমি ডাক্তারসব প্ল্যাটফর্মের <a href="/about" style={{ color: "#0F6E56", fontWeight: 700 }}>শর্তাবলী ও গোপনীয়তা নীতিতে</a> সম্মত এবং প্রদানকৃত তথ্য সঠিক।
                  </p>
                </div>

                {error && <p style={{ color: "#EF4444", fontSize: 12, marginTop: 10, background: "#FEF2F2", padding: "8px 12px", borderRadius: 8 }}>{error}</p>}
              </div>
            )}

            {/* Nav buttons */}
            <div style={{ display: "flex", gap: 10, marginTop: 24 }}>
              {step > 1 && (
                <button onClick={() => setStep(s => (s - 1) as Step)}
                  style={{ flex: 1, padding: "12px", border: "1.5px solid #E2E8F0", borderRadius: 10, background: "#fff", color: "#64748B", fontSize: 14, fontWeight: 700, cursor: "pointer", fontFamily: "inherit", display: "flex", alignItems: "center", justifyContent: "center", gap: 6 }}>
                  <ChevronLeft size={16} /> পেছনে
                </button>
              )}
              {step < 4 ? (
                <button onClick={() => setStep(s => (s + 1) as Step)}
                  style={{ flex: 2, padding: "12px", border: "none", borderRadius: 10, background: "#0F6E56", color: "#fff", fontSize: 14, fontWeight: 700, cursor: "pointer", fontFamily: "inherit", display: "flex", alignItems: "center", justifyContent: "center", gap: 6 }}>
                  পরবর্তী <ChevronRight size={16} />
                </button>
              ) : (
                <button onClick={handleSubmit} disabled={loading}
                  style={{ flex: 2, padding: "12px", border: "none", borderRadius: 10, background: loading ? "#94A3B8" : "#0F6E56", color: "#fff", fontSize: 14, fontWeight: 700, cursor: loading ? "not-allowed" : "pointer", fontFamily: "inherit" }}>
                  {loading ? "পাঠানো হচ্ছে..." : "✅ আবেদন জমা দিন"}
                </button>
              )}
            </div>
          </div>
        </div>

        {/* ── Sidebar (desktop only) ── */}
        {!isMobile && (
          <div style={{ width: 260, flexShrink: 0, display: "flex", flexDirection: "column", gap: 12, position: "sticky", top: 24 }}>
            {/* Value prop */}
            <div style={{ background: "#fff", borderRadius: 16, border: "1px solid #E2E8F0", padding: 16, boxShadow: "0 2px 8px rgba(0,0,0,.06)" }}>
              <div style={{ fontSize: 12, fontWeight: 800, color: "#0F6E56", marginBottom: 10, textTransform: "uppercase", letterSpacing: ".5px" }}>💡 সুবিধা</div>
              {VALUE_PROPS[step].map((v, i) => (
                <div key={i} style={{ display: "flex", gap: 8, marginBottom: 12, alignItems: "flex-start" }}>
                  <span style={{ fontSize: 18, flexShrink: 0 }}>{v.emoji}</span>
                  <p style={{ fontSize: 12, color: "#334155", lineHeight: 1.5, margin: 0 }}>{v.text}</p>
                </div>
              ))}
            </div>

            {/* Live preview */}
            <div style={{ background: "#fff", borderRadius: 16, border: "1px solid #E2E8F0", padding: 16, boxShadow: "0 2px 8px rgba(0,0,0,.06)" }}>
              <div style={{ fontSize: 12, fontWeight: 800, color: "#64748B", marginBottom: 10, textTransform: "uppercase", letterSpacing: ".5px" }}>প্রোফাইল প্রিভিউ</div>
              <div style={{ display: "flex", gap: 10, alignItems: "flex-start" }}>
                <div style={{ width: 44, height: 44, borderRadius: 12, background: "#EAF9F3", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 22, flexShrink: 0, position: "relative" }}>
                  {form.photo_emoji}
                  <span style={{ position: "absolute", bottom: -2, right: -2, background: "#0F6E56", color: "#fff", fontSize: 8, fontWeight: 700, borderRadius: "50%", padding: "2px 3px", border: "1.5px solid #fff" }}>✓</span>
                </div>
                <div>
                  <div style={{ fontSize: 13, fontWeight: 800, color: "#0F172A" }}>{form.full_name || "ডা. আপনার নাম"}</div>
                  <div style={{ fontSize: 11, color: "#0F6E56", fontWeight: 600, marginTop: 1 }}>{form.specialty || "বিশেষজ্ঞতা"}</div>
                  <div style={{ fontSize: 10, color: "#94A3B8", marginTop: 1 }}>{form.hospital_name || "হাসপাতাল / ক্লিনিক"}</div>
                  <div style={{ display: "flex", gap: 8, marginTop: 5, flexWrap: "wrap" }}>
                    {form.experience_years && <span style={{ fontSize: 10, color: "#64748B" }}>{form.experience_years} বছর</span>}
                    {form.fee_in_person && <span style={{ fontSize: 10, fontWeight: 700 }}>৳{form.fee_in_person}</span>}
                    {form.working_days.length > 0 && <span style={{ fontSize: 10, color: "#10b981", fontWeight: 600 }}>⬤ আজ সময় আছে</span>}
                  </div>
                </div>
              </div>
            </div>

            <div style={{ background: "#F8FAF9", borderRadius: 12, border: "1px solid #E2E8F0", padding: 14, textAlign: "center" }}>
              <p style={{ fontSize: 12, color: "#64748B", margin: "0 0 8px" }}>আগে থেকে নিবন্ধিত?</p>
              <a href="/doctor-dashboard" style={{ fontSize: 13, fontWeight: 700, color: "#0F6E56", textDecoration: "none" }}>ড্যাশবোর্ডে লগইন →</a>
            </div>
          </div>
        )}

        {/* Mobile: already registered link at bottom */}
        {isMobile && (
          <div style={{ padding: "12px 18px 32px", textAlign: "center", background: "#fff" }}>
            <p style={{ fontSize: 12, color: "#64748B", margin: "0 0 6px" }}>আগে থেকে নিবন্ধিত?</p>
            <a href="/doctor-dashboard" style={{ fontSize: 13, fontWeight: 700, color: "#0F6E56", textDecoration: "none" }}>ড্যাশবোর্ডে লগইন →</a>
          </div>
        )}
      </div>
    </div>
  );
}
