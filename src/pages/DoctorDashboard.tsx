/**
 * DaktarSab — Doctor Dashboard
 * Route: /doctor-dashboard
 * ✅ Responsive: hamburger menu on mobile, collapsible sidebar
 * ✅ Functional nav: Dashboard / Leads / Appointments / Reviews + placeholders
 * ✅ DaktarSab branding in sidebar
 * ✅ [P0] Real booking_requests data from Supabase
 */
import { useState, useEffect, useCallback } from "react";
import { Eye, EyeOff, LogOut, Mail, Lock, Menu, X, Loader2, RefreshCw, Phone, FileText, Video } from "lucide-react";
import Logo from "@/components/Logo";
import { supabase } from "@/integrations/supabase/client";
import PrescriptionWriter from "@/components/dashboard/PrescriptionWriter";
import VideoChamber from "@/components/dashboard/VideoChamber";

/* ── Booking type from Supabase ─────────────────────────────────── */
interface Booking {
  id: string;
  created_at: string;
  service_type: string;
  provider_name: string;
  user_name: string;
  user_phone: string;
  user_id?: string;
  preferred_date: string | null;
  preferred_time: string | null;
  notes: string | null;
  status: string; // 'new' | 'accepted' | 'completed' | 'cancelled'
  payment_status?: string;
  meet_link?: string;
}

function relativeTime(iso: string) {
  const s = (Date.now() - new Date(iso).getTime()) / 1000;
  if (s < 60) return "এইমাত্র";
  if (s < 3600) return `${Math.floor(s/60)} মিনিট আগে`;
  if (s < 86400) return `${Math.floor(s/3600)} ঘণ্টা আগে`;
  return `${Math.floor(s/86400)} দিন আগে`;
}
function fmtDate(d: string|null) {
  if (!d) return "—";
  try { return new Date(d).toLocaleDateString("bn-BD", { day:"numeric", month:"short", year:"numeric" }); } catch { return d; }
}
function initials(name: string) { return name.split(" ").map(w=>w[0]).join("").toUpperCase().slice(0,2); }
const INIT_COLORS = ["#EAF9F3:#0d6b58","#EFF6FF:#3B82F6","#FFFBEB:#D97706","#FDF4FF:#9333EA","#FEF2F2:#DC2626"];
function initColor(name: string) { const [bg,color] = INIT_COLORS[name.charCodeAt(0)%INIT_COLORS.length].split(":"); return {bg,color}; }

/* ─── Responsive hook ─────────────────────────────────────────────────── */
function useIsMobile(bp = 1024) {
  const [m, setM] = useState(() => window.innerWidth < bp);
  useEffect(() => {
    const h = () => setM(window.innerWidth < bp);
    window.addEventListener("resize", h);
    return () => window.removeEventListener("resize", h);
  }, [bp]);
  return m;
}

/* ─── Role guard ──────────────────────────────────────────────────────── */
// Only users with profiles.role = 'doctor' can access this dashboard

/* ─── Static profile items (will be dynamic after P2 auth) ─── */
const PROFILE_ITEMS = [
  { done: true,  label: "MBBS & Specialty Verified" },
  { done: true,  label: "Profile Photo Added" },
  { done: true,  label: "Consultation Fee Set" },
  { done: false, label: "Add 5+ Patient Reviews" },
  { done: false, label: "Enable Telemedicine" },
  { done: false, label: "Add Hospital Affiliation" },
];

const REVIEWS_DATA = [
  { name: "Rafiq Hasan", init: "R", bg: "#EAF9F3", color: "#0d6b58", date: "2 days ago", stars: 5, text: "Excellent and very patient doctor. Answered all my questions clearly." },
  { name: "Nazmun Nahar", init: "N", bg: "#EFF6FF", color: "#3B82F6", date: "4 days ago", stars: 4, text: "Good experience overall, but had to wait a bit longer than expected." },
  { name: "Sajid Islam", init: "S", bg: "#FFFBEB", color: "#D97706", date: "1 week ago", stars: 5, text: "Very professional consultation. The diagnosis was spot on." },
  { name: "Tania Akter", init: "T", bg: "#F5F3FF", color: "#8B5CF6", date: "2 weeks ago", stars: 5, text: "Highly recommend! Dr. Rahim is very caring and knowledgeable." },
];

const EARNINGS_BARS = [
  { label: "W1", pct: 55 }, { label: "W2", pct: 72 },
  { label: "W3", pct: 100, peak: true }, { label: "W4", pct: 40 },
];

const BADGE_STYLES: Record<string, { bg: string; color: string }> = {
  red:   { bg: "#FEF2F2", color: "#EF4444" },
  amber: { bg: "#FFFBEB", color: "#92400E" },
  blue:  { bg: "#EFF6FF", color: "#3B82F6" },
  green: { bg: "#EAF9F3", color: "#0d6b58" },
  gray:  { bg: "#F1F5F4", color: "#64748B" },
};

function Badge({ variant, children }: { variant: string; children: React.ReactNode }) {
  const s = BADGE_STYLES[variant] ?? BADGE_STYLES.gray;
  return (
    <span style={{ display: "inline-flex", alignItems: "center", gap: 4, padding: "4px 9px", borderRadius: 8, fontSize: 11, fontWeight: 700, background: s.bg, color: s.color }}>
      <span style={{ width: 5, height: 5, borderRadius: "50%", background: "currentColor", flexShrink: 0, display: "inline-block" }} />
      {children}
    </span>
  );
}

type NavItem = "dashboard" | "leads" | "appointments" | "reviews" | "prescriptions" | "telemedicine" | "analytics" | "earnings" | "profile" | "settings";

/* ─── Placeholder for non-implemented sections ────────────────────────── */
function ComingSoon({ label }: { label: string }) {
  return (
    <div style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: 40, gap: 12, textAlign: "center" }}>
      <div style={{ fontSize: 48 }}>🚧</div>
      <h2 style={{ fontSize: 20, fontWeight: 800, color: "#0F172A" }}>{label}</h2>
      <p style={{ fontSize: 13, color: "#64748B" }}>এই সেকশনটি শীঘ্রই চালু হবে।</p>
    </div>
  );
}function ReportsModal({ booking, onClose }: { booking: Booking, onClose: () => void }) {
  const [reports, setReports] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!booking.user_id) { setLoading(false); return; }
    (supabase as any).from("medical_records").select("*").eq("user_id", booking.user_id).eq("record_type", "report").order("created_at", { ascending: false })
      .then(({ data }: any) => { setReports(data || []); setLoading(false); });
  }, [booking.user_id]);

  async function openDoc(url: string) {
    const { data } = await supabase.storage.from("patient_documents").createSignedUrl(url, 60);
    if (data?.signedUrl) window.open(data.signedUrl, '_blank');
  }

  return (
    <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.5)", zIndex: 9999, display: "flex", alignItems: "center", justifyContent: "center", padding: 20 }}>
      <div style={{ background: "#fff", width: "100%", maxWidth: 500, borderRadius: 16, overflow: "hidden", display: "flex", flexDirection: "column", maxHeight: "80vh" }}>
        <div style={{ padding: "16px 20px", borderBottom: "1px solid #E2E8F0", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <h3 style={{ margin: 0, fontSize: 16, fontWeight: 800 }}>{booking.user_name} এর ল্যাব রিপোর্ট</h3>
          <button onClick={onClose} style={{ background: "none", border: "none", cursor: "pointer", color: "#64748B" }}><X size={20}/></button>
        </div>
        <div style={{ padding: 20, overflowY: "auto", flex: 1 }}>
          {!booking.user_id ? <div style={{textAlign:"center", color:"#94A3B8"}}>রোগীর আইডি পাওয়া যায়নি।</div> :
           loading ? <div style={{textAlign:"center", padding:20}}><Loader2 size={24} style={{ animation:"spin 1s linear infinite", color:"#0d6b58", margin:"0 auto" }} /></div> :
           reports.length === 0 ? <div style={{textAlign:"center", color:"#64748B", padding:20}}>কোনো রিপোর্ট আপলোড করা হয়নি।</div> :
           <div style={{display:"flex", flexDirection:"column", gap:10}}>
             {reports.map(r => (
               <div key={r.id} style={{ display:"flex", alignItems:"center", gap:12, padding:12, border:"1px solid #E2E8F0", borderRadius:8, background: "#F8FAF9" }}>
                 <div style={{ width: 40, height: 40, borderRadius: 8, background: "#EAF9F3", display: "flex", alignItems: "center", justifyContent: "center" }}>
                   <FileText size={20} color="#0F6E56" />
                 </div>
                 <div style={{ flex: 1, minWidth:0 }}>
                   <div style={{ fontSize: 13, fontWeight: 700, color: "#0F172A", textOverflow: "ellipsis", overflow: "hidden", whiteSpace: "nowrap" }}>{r.title}</div>
                   <div style={{ fontSize: 11, color: "#64748B", marginTop: 2 }}>{new Date(r.created_at).toLocaleDateString('bn-BD')}</div>
                 </div>
                 <button onClick={() => openDoc(r.file_url)} style={{ background:"#EAF9F3", color:"#0F6E56", padding:"6px 12px", border:"none", borderRadius:6, cursor:"pointer", fontSize:12, fontWeight:800, fontFamily: "inherit" }}>দেখুন</button>
               </div>
             ))}
           </div>
          }
        </div>
      </div>
    </div>
  );
}

export default function DoctorDashboard() {
  const isMobile = useIsMobile(1024);

  /* Auth state */
  const [email, setEmail] = useState("");
  const [pass, setPass]   = useState("");
  const [showPass, setShowPass] = useState(false);
  const [auth, setAuth]   = useState(false);
  const [isDoctor, setIsDoctor] = useState(false);
  const [checkingRole, setCheckingRole] = useState(true);
  const [authErr, setAuthErr] = useState("");
  const [authLoading, setAuthLoading] = useState(false);
  const [doctorProfile, setDoctorProfile] = useState<{ name: string; specialty: string; photo_url?: string } | null>(null);
  const [reviews, setReviews] = useState<{ id: string; reviewer_id: string; rating: number; comment: string | null; created_at: string }[]>([]);

  /* Check existing auth session on mount */
  useEffect(() => {
    const checkSession = async () => {
      setCheckingRole(true);
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user) {
        setAuth(true);
        await verifyDoctorRole(session.user.id, session.user.email ?? "");
      } else {
        setCheckingRole(false);
      }
    };
    checkSession();
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (!session) { setAuth(false); setIsDoctor(false); setDoctorProfile(null); }
    });
    return () => subscription.unsubscribe();
  }, []);

  async function verifyDoctorRole(userId: string, emailStr: string) {
    try {
      const { data } = await (supabase as any)
        .from("profiles")
        .select("role")
        .eq("user_id", userId)
        .maybeSingle();
      // RBAC: only 'doctor' role — admins use /kazi
      if (data?.role === "doctor") {
        setIsDoctor(true);
        await loadDoctorProfile(userId, emailStr);
        await loadReviews(userId);
      } else {
        setIsDoctor(false);
      }
    } catch {
      setIsDoctor(false);
    } finally {
      setCheckingRole(false);
    }
  }

  async function loadReviews(userId: string) {
    try {
      const { data } = await (supabase as any)
        .from("reviews")
        .select("id, reviewer_id, rating, comment, created_at")
        .eq("provider_id", userId)
        .order("created_at", { ascending: false })
        .limit(20);
      setReviews(data || []);
    } catch { /* silent — keep empty array */ }
  }

  async function loadDoctorProfile(userId: string, email: string) {
    try {
      const { data } = await (supabase as any)
        .from("doctors")
        .select("doctor_name, specialization, image_url")
        .eq("partner_id", userId)
        .maybeSingle();
      if (data) setDoctorProfile({ name: data.doctor_name || email, specialty: data.specialization || "", photo_url: data.image_url });
      else setDoctorProfile({ name: email.split("@")[0], specialty: "ডাক্তার" });
    } catch { setDoctorProfile({ name: email.split("@")[0], specialty: "ডাক্তার" }); }
  }

  /* UI state */
  const [nav, setNav]         = useState<NavItem>("dashboard");
  const [sideOpen, setSideOpen] = useState(false);
  const [isOnline, setIsOnline] = useState(true);
  const [viewingReportsFor, setViewingReportsFor] = useState<Booking | null>(null);
  const [activeCall, setActiveCall] = useState<Booking | null>(null);

  /* ── Real booking data from Supabase ── */
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loadingBookings, setLoadingBookings] = useState(false);

  const fetchBookings = useCallback(async () => {
    setLoadingBookings(true);
    try {
      const { data } = await (supabase as any)
        .from("booking_requests")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(200);
      setBookings(data || []);
    } catch (e) {
      console.warn("DoctorDashboard: failed to fetch bookings", e);
    } finally {
      setLoadingBookings(false);
    }
  }, []);

  useEffect(() => { if (auth) fetchBookings(); }, [auth, fetchBookings]);

  /* ── Supabase Realtime — auto-refresh on new bookings ── */
  useEffect(() => {
    if (!auth) return;
    const channel = (supabase as any)
      .channel("booking_requests_doctor")
      .on("postgres_changes", { event: "INSERT", schema: "public", table: "booking_requests" },
        () => fetchBookings()
      )
      .subscribe();
    return () => (supabase as any).removeChannel(channel);
  }, [auth, fetchBookings]);

  async function updateBookingStatus(id: string, status: string) {
    const updateData: any = { status };
    if (status === "accepted") {
      updateData.meet_link = `https://meet.jit.si/DaktarSab_${id.replace(/-/g,'')}`;
    }
    await (supabase as any).from("booking_requests").update(updateData).eq("id", id);
    setBookings(prev => prev.map(b => b.id === id ? { ...b, ...updateData } : b));
  }

  // Derived counts
  const newBookings       = bookings.filter(b => b.status === "new");
  const acceptedBookings  = bookings.filter(b => b.status === "accepted");
  const completedBookings = bookings.filter(b => b.status === "completed");
  const activeLead        = newBookings.length;

  /* close sidebar when nav changes on mobile */
  function goNav(item: NavItem) {
    setNav(item);
    if (isMobile) setSideOpen(false);
  }

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    setAuthLoading(true);
    setAuthErr("");
    try {
      const { data, error } = await supabase.auth.signInWithPassword({ email: email.trim(), password: pass });
      if (error) throw error;
      setAuth(true);
      setAuthErr("");
      await verifyDoctorRole(data.user.id, data.user.email ?? "");
    } catch (err: any) {
      setAuthErr(err?.message || "লগইন ব্যর্থ হয়েছে। ইমেইল বা পাসওয়ার্ড যাচাই করুন।");
    } finally {
      setAuthLoading(false);
    }
  }

  /* ── Role check loading ─────────────────────────────────────────── */
  if (checkingRole) return (
    <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", background: "#F1F5F4" }}>
      <div style={{ textAlign: "center" }}>
        <div style={{ fontSize: 36, marginBottom: 12 }}>🩺</div>
        <p style={{ color: "#64748B", fontSize: 14 }}>অনুমতি যাচাই করা হচ্ছে...</p>
      </div>
    </div>
  );

  /* ── Access denied ───────────────────────────────────────────────── */
  if (auth && !isDoctor) return (
    <div style={{ minHeight: "100vh", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 16, background: "#F1F5F4", padding: 20 }}>
      <div style={{ fontSize: 48 }}>🚫</div>
      <h2 style={{ fontSize: 20, fontWeight: 800, color: "#0F172A", margin: 0 }}>অ্যাক্সেস অনুমোদিত নয়</h2>
      <p style={{ fontSize: 14, color: "#64748B", textAlign: "center", maxWidth: 320 }}>
        এই ড্যাশবোর্ডটি শুধুমাত্র অনুমোদিত ডাক্তারদের জন্য।<br />
        আপনার একাউন্টে <code style={{ background: "#EAF9F3", padding: "2px 6px", borderRadius: 4 }}>role = 'doctor'</code> সেট নেই।
      </p>
      <button onClick={() => { supabase.auth.signOut(); setAuth(false); setIsDoctor(false); }}
        style={{ padding: "10px 20px", borderRadius: 10, background: "#0F6E56", color: "#fff", border: "none", fontWeight: 700, cursor: "pointer", fontFamily: "inherit" }}>
        অন্য একাউন্ট দিয়ে লগইন করুন
      </button>
    </div>
  );

  /* ── Login screen ─────────────────────────────────────────────────────── */
  if (!auth) return (
    <div style={{ minHeight: "100vh", background: "linear-gradient(135deg,#EAF9F3,#F0F9F6)", display: "flex", alignItems: "center", justifyContent: "center", padding: 20, fontFamily: "'Outfit',sans-serif" }}>
      <div style={{ background: "#fff", borderRadius: 20, boxShadow: "0 8px 40px rgba(0,0,0,.12)", width: "100%", maxWidth: 420, overflow: "hidden" }}>
        {/* White logo card header (logo has blue+green colors — needs white bg) */}
        <div style={{ background: "#fff", borderBottom: "1px solid #E2E8F0", padding: "28px 32px", textAlign: "center" }}>
          <div style={{ display: "flex", justifyContent: "center", marginBottom: 16 }}>
            <img src="/daktarsab-logo-2.png" alt="DaktarSab Logo" style={{ height: 56, objectFit: "contain" }} />
          </div>
          <div style={{ width: 48, height: 48, borderRadius: 14, background: "#EAF9F3", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 24, margin: "0 auto 10px" }}>🩺</div>
          <h1 style={{ fontSize: 18, fontWeight: 800, color: "#0F172A", margin: 0 }}>ডাক্তার ড্যাশবোর্ড</h1>
          <p style={{ fontSize: 12, color: "#64748B", marginTop: 4 }}>DaktarSab Doctor Portal</p>
        </div>
        <div style={{ padding: "28px 32px" }}>
          <form onSubmit={handleLogin}>
            <div style={{ marginBottom: 12 }}>
              <label style={{ fontSize: 12, fontWeight: 700, color: "#0F172A", display: "block", marginBottom: 5 }}>ইমেইল ঠিকানা</label>
              <div style={{ position: "relative" }}>
                <Mail size={15} style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)", color: "#94A3B8" }} />
                <input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="doctor@gmail.com"
                  style={{ width: "100%", padding: "11px 14px 11px 36px", border: "1.5px solid #E2E8F0", borderRadius: 10, fontSize: 14, fontFamily: "inherit", outline: "none", background: "#F8FAF9", boxSizing: "border-box" }} />
              </div>
            </div>
            <div style={{ marginBottom: 16 }}>
              <label style={{ fontSize: 12, fontWeight: 700, color: "#0F172A", display: "block", marginBottom: 5 }}>পাসওয়ার্ড</label>
              <div style={{ position: "relative" }}>
                <Lock size={15} style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)", color: "#94A3B8" }} />
                <input type={showPass ? "text" : "password"} value={pass} onChange={e => setPass(e.target.value)} placeholder="আপনার পাসওয়ার্ড দিন"
                  style={{ width: "100%", padding: "11px 42px 11px 36px", border: "1.5px solid #E2E8F0", borderRadius: 10, fontSize: 14, fontFamily: "inherit", outline: "none", background: "#F8FAF9", boxSizing: "border-box" }} />
                <button type="button" onClick={() => setShowPass(v => !v)}
                  style={{ position: "absolute", right: 12, top: "50%", transform: "translateY(-50%)", background: "none", border: "none", cursor: "pointer", color: "#94A3B8" }}>
                  {showPass ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>
            {authErr && <p style={{ color: "#EF4444", fontSize: 12, marginBottom: 12, background: "#FEF2F2", padding: "8px 12px", borderRadius: 8 }}>{authErr}</p>}
            <button type="submit" style={{ width: "100%", padding: 12, background: "#0F6E56", color: "#fff", border: "none", borderRadius: 10, fontSize: 14, fontWeight: 700, cursor: "pointer", fontFamily: "inherit" }}>
              লগইন করুন →
            </button>
          </form>
          <p style={{ textAlign: "center", fontSize: 12, color: "#94A3B8", marginTop: 20 }}>
            নিবন্ধিত নন? <a href="/join-as-partner" style={{ color: "#0F6E56", fontWeight: 700 }}>এখানে আবেদন করুন</a>
          </p>
        </div>
      </div>
    </div>
  );

  /* ── Sidebar nav groups ─────────────────────────────────────────────── */
  const NAV_GROUPS = [
    { section: "Overview", items: [
      { id: "dashboard",    ico: "📊", label: "My Dashboard" },
      { id: "leads",        ico: "👥", label: "Patient Leads", badge: activeLead > 0 ? activeLead : null },
      { id: "appointments", ico: "📅", label: "Appointments" },
      { id: "reviews",      ico: "⭐", label: "Reviews & Ratings" },
    ]},
    { section: "Clinical", items: [
      { id: "prescriptions",ico: "📋", label: "Prescriptions" },
      { id: "telemedicine", ico: "📞", label: "Telemedicine" },
    ]},
    { section: "Growth", items: [
      { id: "analytics",    ico: "📈", label: "Analytics" },
      { id: "earnings",     ico: "💰", label: "Earnings" },
    ]},
    { section: "Account", items: [
      { id: "profile",      ico: "👤", label: "My Profile" },
      { id: "settings",     ico: "⚙️", label: "Settings" },
    ]},
  ];

  const SIDEBAR_W = 234;

  /* ── Sidebar JSX ───────────────────────────────────────────────────── */
  const SidebarEl = (
    <aside style={{
      width: SIDEBAR_W, background: "#fff", borderRight: "1px solid #E2E8F0",
      flexShrink: 0, height: "100vh", display: "flex", flexDirection: "column", zIndex: 60,
      position: isMobile ? "fixed" : "fixed", top: 0, left: 0,
      transform: isMobile && !sideOpen ? `translateX(-${SIDEBAR_W}px)` : "translateX(0)",
      transition: "transform .25s ease", boxShadow: isMobile && sideOpen ? "4px 0 20px rgba(0,0,0,.12)" : "none",
    }}>
      {/* Branding */}
      <div style={{ padding: "16px 16px 14px", borderBottom: "1px solid #E2E8F0", display: "flex", alignItems: "center", gap: 8 }}>
        <img src="/daktarsab-logo-2.png" alt="DaktarSab" style={{ height: 36, objectFit: "contain", flex: 1, minWidth: 0 }} />
        {isMobile && (
          <button onClick={() => setSideOpen(false)} style={{ background: "none", border: "none", cursor: "pointer", color: "#64748B", padding: 4, flexShrink: 0 }}>
            <X size={18} />
          </button>
        )}
      </div>

      {/* ── Doctor card (real profile) ── */}
      <div style={{ padding: "14px 14px 10px", borderBottom: "1px solid #E2E8F0" }}>
        <div style={{ width: 48, height: 48, borderRadius: 13, background: "#EAF9F3", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 20, fontWeight: 800, color: "#085041", marginBottom: 8, position: "relative" }}>
          {initials(doctorProfile?.name || "Dr")}
          <div style={{ position: "absolute", inset: -2, borderRadius: 15, border: "2px solid #1D9E75" }} />
        </div>
        <div style={{ fontSize: 14, fontWeight: 700, color: "#0F172A", marginBottom: 2 }}>{doctorProfile?.name || "ডাক্তার লোড হচ্ছে..."}</div>
        <div style={{ fontSize: 11, color: "#64748B", marginBottom: 6 }}>{doctorProfile?.specialty || "বিশেষজ্ঞ"}</div>
        {reviews.length > 0 && (
          <div style={{ display: "inline-flex", alignItems: "center", gap: 4, background: "#FFFBEB", border: "1px solid #FDE68A", color: "#D97706", fontSize: 10, fontWeight: 700, padding: "3px 9px", borderRadius: 8 }}>
            ⭐ {(reviews.reduce((s, r) => s + r.rating, 0) / reviews.length).toFixed(1)} · {reviews.length} Reviews
          </div>
        )}
      </div>

      {/* ── Nav ── */}
      <nav style={{ flex: 1, padding: "8px 10px", overflowY: "auto" }}>
        {NAV_GROUPS.map(g => (
          <div key={g.section}>
            <div style={{ fontSize: 9, fontWeight: 700, color: "#94A3B8", letterSpacing: ".7px", textTransform: "uppercase", padding: "10px 8px 4px" }}>{g.section}</div>
            {g.items.map(it => (
              <div key={it.id} onClick={() => goNav(it.id as NavItem)}
                style={{ display: "flex", alignItems: "center", gap: 9, padding: "9px 10px", borderRadius: 10, cursor: "pointer",
                  color: nav === it.id ? "#0d6b58" : "#64748B",
                  fontSize: 13, fontWeight: nav === it.id ? 700 : 500,
                  background: nav === it.id ? "#EAF9F3" : "transparent",
                  marginBottom: 1, transition: "all .15s" }}>
                <span style={{ fontSize: 15, width: 20, textAlign: "center" }}>{it.ico}</span>
                {it.label}
                {it.badge && <span style={{ marginLeft: "auto", background: "#EF4444", color: "#fff", fontSize: 9, fontWeight: 700, padding: "2px 7px", borderRadius: 10 }}>{it.badge}</span>}
              </div>
            ))}
          </div>
        ))}
      </nav>

      {/* ── Bottom ── */}
      <div style={{ padding: 12, borderTop: "1px solid #E2E8F0" }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", background: "#EAF9F3", border: "1px solid #D1F5EA", borderRadius: 10, padding: "10px 12px", marginBottom: 8 }}>
          <div>
            <div style={{ fontSize: 12, fontWeight: 600, color: "#0d6b58" }}>Online Status</div>
            <div style={{ fontSize: 10, color: "#1D9E75" }}>{isOnline ? "Accepting patients" : "Not available"}</div>
          </div>
          <div onClick={() => setIsOnline(v => !v)} style={{ width: 38, height: 22, background: isOnline ? "#1D9E75" : "#CBD5E1", borderRadius: 11, position: "relative", cursor: "pointer", transition: "background .2s", flexShrink: 0 }}>
            <div style={{ position: "absolute", top: 3, left: isOnline ? 19 : 3, width: 16, height: 16, borderRadius: "50%", background: "#fff", transition: "left .2s" }} />
          </div>
        </div>
        <button onClick={async () => { 
            const { error } = await supabase.auth.signOut();
            if (error) console.error("Sign out error:", error);
            setAuth(false); 
            window.location.href = '/auth'; 
          }}
          style={{ width: "100%", padding: 8, display: "flex", alignItems: "center", justifyContent: "center", gap: 6, fontSize: 12, fontWeight: 600, color: "#64748B", background: "none", border: "1px solid #E2E8F0", cursor: "pointer", borderRadius: 8, fontFamily: "inherit" }}>
          <LogOut size={13} /> Logout
        </button>
      </div>
    </aside>
  );

  /* ── Content sections ────────────────────────────────────────────────── */

  /* Shared card wrapper */
  const Card = ({ children, style }: { children: React.ReactNode; style?: React.CSSProperties }) => (
    <div style={{ background: "#fff", borderRadius: 16, border: "1px solid #E2E8F0", boxShadow: "0 1px 3px rgba(0,0,0,.07)", ...style }}>{children}</div>
  );
  const CardHead = ({ children }: { children: React.ReactNode }) => (
    <div style={{ padding: "16px 20px", borderBottom: "1px solid #E2E8F0", display: "flex", alignItems: "center", justifyContent: "space-between" }}>{children}</div>
  );
  const CardTitle = ({ children }: { children: React.ReactNode }) => (
    <div style={{ fontSize: 14, fontWeight: 700, color: "#0F172A" }}>{children}</div>
  );

  /* ── Dynamic Earnings Calculation ── */
  const paidBookings = bookings.filter(b => b.payment_status === "paid");
  const totalRevenue = paidBookings.length * 500;
  const avgPerSession = paidBookings.length > 0 ? Math.round(totalRevenue / paidBookings.length) : 0;

  /* ── DASHBOARD OVERVIEW ── */
  const DashboardView = () => (
    <div style={{ padding: isMobile ? 14 : 28, flex: 1 }}>
      {/* Metrics — live counts from Supabase */}
      <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr 1fr" : "repeat(4,1fr)", gap: 14, marginBottom: 20 }}>
        {[
          { label: "নতুন বুকিং",           ico: "👥", bg: "#EAF9F3", val: activeLead,           trendText: activeLead > 0 ? "এখনই দেখুন" : "কোনো নতুন বুকিং নেই",    trend: activeLead > 0 ? "up" : "flat" },
          { label: "নিশ্চিত অ্যাপয়েন্টমেন্ট", ico: "📅", bg: "#EFF6FF", val: acceptedBookings.length, trendText: "সম্পন্নের জন্য প্রস্তুত",  trend: "flat" },
          { label: "সম্পন্ন পরামর্শ",       ico: "✅", bg: "#FFFBEB", val: completedBookings.length, trendText: "মোট সম্পন্ন",              trend: "up" },
          { label: "মোট বুকিং",             ico: "📊", bg: "#F5F3FF", val: bookings.length,         trendText: "সকল বুকিং",               trend: "up" },
        ].map(m => (
          <Card key={m.label} style={{ padding: 18 }}>
            <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: 12 }}>
              <div style={{ fontSize: 10, fontWeight: 600, color: "#64748B", textTransform: "uppercase", letterSpacing: ".4px" }}>{m.label}</div>
              <div style={{ width: 34, height: 34, borderRadius: 10, background: m.bg, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 16, flexShrink: 0 }}>{m.ico}</div>
            </div>
            <div style={{ fontSize: 26, fontWeight: 800, color: "#0F172A", marginBottom: 4 }}>{m.val}</div>
            <div style={{ fontSize: 11, fontWeight: 600, color: m.trend === "up" ? "#0F6E56" : "#64748B" }}>{m.trendText}</div>
          </Card>
        ))}
      </div>

      {/* Leads + Right panel */}
      <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr" : "2fr 1fr", gap: 18, marginBottom: 18 }}>
        {/* Leads preview */}
        <Card>
          <CardHead>
            <div>
              <CardTitle>নতুন বুকিং রিকোয়েস্ট</CardTitle>
              <div style={{ fontSize: 11, color: "#64748B", marginTop: 2 }}>DaktarSab AI থেকে রোগীদের বুকিং রিকোয়েস্ট</div>
            </div>
            <button onClick={fetchBookings} style={{ background: "#EAF9F3", border: "none", borderRadius: 8, padding: "5px 8px", cursor: "pointer", color: "#0d6b58" }}>
              <RefreshCw size={13} />
            </button>
          </CardHead>
          <div style={{ padding: "12px 16px" }}>
            {loadingBookings ? (
              <div style={{ textAlign:"center", padding:10 }}><Loader2 size={16} style={{ animation:"spin 1s linear infinite", color:"#0d6b58" }}/></div>
            ) : newBookings.length === 0 ? (
              <div style={{ textAlign:"center", padding:10, color:"#94A3B8", fontSize:12 }}>কোনো নতুন বুকিং নেই</div>
            ) : newBookings.slice(0, 3).map(b => {
              const {bg, color} = initColor(b.user_name);
              return (
                <div key={b.id} style={{ display: "flex", alignItems: "flex-start", gap: 12, paddingBottom: 12, marginBottom: 12, borderBottom: "1px solid #E2E8F0" }}>
                  <div style={{ width: 34, height: 34, borderRadius: 10, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 12, fontWeight: 700, background: bg, color, flexShrink: 0 }}>{initials(b.user_name)}</div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: 13, fontWeight: 700, color: "#0F172A", marginBottom: 2 }}>{b.user_name}</div>
                    <div style={{ fontSize: 11, color: "#64748B", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{b.user_phone} • {b.service_type || "No service"}</div>
                    <div style={{ fontSize: 10, color: "#94A3B8", marginTop: 3 }}>{relativeTime(b.created_at)}</div>
                  </div>
                  <div style={{ display: "flex", flexDirection: "column", gap: 4, flexShrink: 0 }}>
                    <button onClick={() => updateBookingStatus(b.id, "accepted")} style={{ padding: "4px 9px", borderRadius: 6, fontSize: 11, fontWeight: 700, fontFamily: "inherit", cursor: "pointer", border: "none", background: "#EAF9F3", color: "#0d6b58" }}>✓ গ্রহণ</button>
                    <button onClick={() => updateBookingStatus(b.id, "cancelled")} style={{ padding: "4px 9px", borderRadius: 6, fontSize: 11, fontWeight: 700, fontFamily: "inherit", cursor: "pointer", border: "none", background: "#FEF2F2", color: "#EF4444" }}>✕ বাতিল</button>
                  </div>
                </div>
              );
            })}
          </div>
        </Card>

        {/* Right panel (Profile + Earnings) */}
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          <Card>
            <CardHead><CardTitle>Profile Strength</CardTitle><span style={{ fontSize: 12, fontWeight: 700, color: "#0F6E56" }}>78%</span></CardHead>
            <div style={{ padding: 18 }}>
              <div style={{ height: 6, background: "#E2E8F0", borderRadius: 3, overflow: "hidden", marginBottom: 10 }}>
                <div style={{ height: "100%", width: "78%", borderRadius: 3, background: "linear-gradient(90deg,#0F6E56,#5DCAA5)" }} />
              </div>
              {PROFILE_ITEMS.map(item => (
                <div key={item.label} style={{ fontSize: 12, color: "#334155", display: "flex", alignItems: "center", gap: 6, marginBottom: 5 }}>
                  <span style={{ color: item.done ? "#0F6E56" : "#94A3B8", fontWeight: 700 }}>{item.done ? "✓" : "○"}</span>
                  {item.label}
                </div>
              ))}
            </div>
          </Card>
          <Card>
            <CardHead><CardTitle>Total Revenue</CardTitle><span style={{ fontSize: 12, color: "#0F6E56", fontWeight: 600 }}>৳ {totalRevenue.toLocaleString()}</span></CardHead>
            <div style={{ padding: 18 }}>
              <div style={{ display: "flex", alignItems: "flex-end", gap: 5, height: 70 }}>
                {EARNINGS_BARS.map(b => (
                  <div key={b.label} style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: 2 }}>
                    <div style={{ width: "100%", height: `${b.pct}%`, borderRadius: "3px 3px 0 0", background: b.peak ? "#1D9E75" : "#D1F5EA" }} />
                    <div style={{ fontSize: 9, color: "#64748B" }}>{b.label}</div>
                  </div>
                ))}
              </div>
              <div style={{ marginTop: 12, paddingTop: 12, borderTop: "1px solid #E2E8F0", display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
                <div style={{ textAlign: "center" }}>
                  <div style={{ fontSize: 16, fontWeight: 800, color: "#0F172A" }}>{paidBookings.length}</div>
                  <div style={{ fontSize: 10, color: "#64748B" }}>Paid Consultations</div>
                </div>
                <div style={{ textAlign: "center" }}>
                  <div style={{ fontSize: 16, fontWeight: 800, color: "#0F172A" }}>৳{avgPerSession}</div>
                  <div style={{ fontSize: 10, color: "#64748B" }}>Avg/session</div>
                </div>
              </div>
            </div>
          </Card>
        </div>
      </div>

      {/* Appointments + Reviews */}
      <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr" : "1fr 1fr", gap: 18 }}>
        <Card style={{ overflow: "hidden" }}>
          <CardHead>
            <CardTitle>নিশ্চিত অ্যাপয়েন্টমেন্ট</CardTitle>
            <button onClick={() => goNav("appointments")} style={{ fontSize: 11, fontWeight: 700, color: "#3B82F6", background: "#EFF6FF", border: "none", borderRadius: 7, padding: "4px 10px", cursor: "pointer", fontFamily: "inherit" }}>সব দেখুন</button>
          </CardHead>
          <div style={{ overflowX: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse", minWidth: 380 }}>
              <thead>
                <tr>{["রোগী","তারিখ","ফোন","স্ট্যাটাস",""].map(h => (
                  <th key={h} style={{ fontSize: 10, fontWeight: 700, color: "#64748B", textTransform: "uppercase", letterSpacing: ".5px", padding: "8px 12px", background: "#F8FAF9", textAlign: "left" }}>{h}</th>
                ))}</tr>
              </thead>
              <tbody>
                {(acceptedBookings.length === 0 && completedBookings.length === 0) ? (
                  <tr><td colSpan={5} style={{ textAlign:"center", padding: 20, color:"#94A3B8", fontSize:12 }}>কোনো অ্যাপয়েন্টমেন্ট নেই</td></tr>
                ) : [...acceptedBookings, ...completedBookings].slice(0,5).map(b => {
                  const {bg, color} = initColor(b.user_name);
                  return (
                    <tr key={b.id} style={{ borderBottom: "1px solid #E2E8F0" }}>
                      <td style={{ padding: "10px 12px" }}>
                        <div style={{ display: "flex", alignItems: "center", gap: 7 }}>
                          <div style={{ width: 28, height: 28, borderRadius: 8, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 11, fontWeight: 700, flexShrink: 0, background: bg, color }}>{initials(b.user_name)}</div>
                          <div style={{ fontSize: 12, fontWeight: 600, color: "#0F172A", whiteSpace: "nowrap" }}>{b.user_name}</div>
                        </div>
                      </td>
                      <td style={{ padding: "10px 12px", fontSize: 11, whiteSpace: "nowrap", color:"#334155" }}>{fmtDate(b.preferred_date)}</td>
                      <td style={{ padding: "10px 12px", fontSize: 11, color:"#64748B" }}>{b.user_phone}</td>
                      <td style={{ padding: "10px 12px" }}><Badge variant={b.status === "accepted" ? "green" : "gray"}>{b.status === "accepted" ? "আসন্ন" : "সম্পন্ন"}</Badge></td>
                      <td style={{ padding: "10px 12px" }}>
                        {b.status === "accepted" && <button onClick={() => updateBookingStatus(b.id, "completed")} style={{ padding: "4px 9px", borderRadius: 7, fontSize: 11, fontWeight: 700, fontFamily: "inherit", cursor: "pointer", border: "none", background: "#EFF6FF", color: "#3B82F6" }}>সম্পন্ন</button>}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </Card>

        <Card>
          <CardHead>
            <CardTitle>Recent Patient Reviews</CardTitle>
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              {reviews.length > 0 && <span style={{ fontSize: 16, fontWeight: 800, color: "#F59E0B" }}>★ {(reviews.reduce((s, r) => s + r.rating, 0) / reviews.length).toFixed(1)}</span>}
              <button onClick={() => goNav("reviews")} style={{ fontSize: 11, fontWeight: 700, color: "#0F6E56", background: "#EAF9F3", border: "none", borderRadius: 7, padding: "4px 10px", cursor: "pointer", fontFamily: "inherit" }}>সব দেখুন</button>
            </div>
          </CardHead>
          <div style={{ padding: 18 }}>
            {reviews.length === 0 ? (
              <div style={{ textAlign: "center", padding: "20px 0", color: "#94A3B8", fontSize: 12 }}>
                <div style={{ fontSize: 28, marginBottom: 6 }}>💬</div>
                এখনো কোনো রিভিউ নেই। রোগীদের রিভিউ এখানে দেখা যাবে।
              </div>
            ) : reviews.slice(0, 3).map((r, i) => {
              const reviewInitial = "P";
              const colors = ["#EAF9F3:#0d6b58","#EFF6FF:#3B82F6","#FFFBEB:#D97706"];
              const [bg, color] = colors[i % colors.length].split(":");
              return (
                <div key={r.id} style={{ paddingBottom: 12, marginBottom: 12, borderBottom: i < Math.min(reviews.length, 3) - 1 ? "1px solid #E2E8F0" : "none" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 5 }}>
                    <div style={{ width: 26, height: 26, borderRadius: 7, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 10, fontWeight: 700, background: bg, color }}>{reviewInitial}</div>
                    <div>
                      <div style={{ fontSize: 12, fontWeight: 600 }}>Patient</div>
                      <div style={{ fontSize: 10, color: "#94A3B8" }}>{new Date(r.created_at).toLocaleDateString("bn-BD")}</div>
                    </div>
                    <div style={{ marginLeft: "auto", color: "#F59E0B", fontSize: 11 }}>{"★".repeat(r.rating)}{"☆".repeat(5 - r.rating)}</div>
                  </div>
                  <div style={{ fontSize: 12, color: "#334155", lineHeight: 1.5 }}>{r.comment || "—"}</div>
                </div>
              );
            })}
          </div>
        </Card>
      </div>
    </div>
  );

  /* ── LEADS FULL PAGE (real Supabase data) ── */
  const LeadsView = () => (
    <div style={{ padding: isMobile ? 14 : 28, flex: 1 }}>
      <div style={{ marginBottom: 20, display:"flex", alignItems:"center", justifyContent:"space-between", flexWrap:"wrap", gap:10 }}>
        <div>
          <h2 style={{ fontSize: 20, fontWeight: 800, color: "#0F172A", margin: 0 }}>বুকিং রিকোয়েস্ট</h2>
          <p style={{ fontSize: 13, color: "#64748B", marginTop: 4 }}>DaktarSab AI থেকে রোগীদের বুকিং — {activeLead} নতুন</p>
        </div>
        <button onClick={fetchBookings} style={{ display:"flex", alignItems:"center", gap:6, padding:"8px 14px", borderRadius:9, background:"#EAF9F3", border:"none", color:"#0d6b58", fontWeight:700, fontSize:12, cursor:"pointer", fontFamily:"inherit" }}>
          <RefreshCw size={13}/> রিফ্রেশ
        </button>
      </div>
      <Card>
        <CardHead><CardTitle>সকল বুকিং</CardTitle><Badge variant="amber">{activeLead} নতুন</Badge></CardHead>
        <div style={{ padding: "14px 18px" }}>
          {loadingBookings ? (
            <div style={{ textAlign:"center", padding:30 }}><Loader2 size={24} style={{ animation:"spin 1s linear infinite", color:"#0d6b58" }}/></div>
          ) : bookings.length === 0 ? (
            <div style={{ textAlign:"center", padding:30, color:"#94A3B8" }}>কোনো বুকিং নেই</div>
          ) : bookings.map(b => {
            const {bg, color} = initColor(b.user_name);
            const isNew = b.status === "new";
            return (
              <div key={b.id} style={{ background: "#F8FAF9", borderRadius: 10, border: "1px solid #E2E8F0", padding: "14px 16px", marginBottom: 10, display: "flex", gap: 14, alignItems: "flex-start", opacity: isNew ? 1 : 0.6, transition: "opacity .2s" }}>
                <div style={{ width: 42, height: 42, borderRadius: 12, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 14, fontWeight: 700, flexShrink: 0, background: bg, color }}>{initials(b.user_name)}</div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 13, fontWeight: 700, color: "#0F172A", marginBottom: 2 }}>
                    {b.user_name}
                    {!isNew && <span style={{ color: b.status === "accepted" ? "#0F6E56" : b.status === "completed" ? "#3B82F6" : "#EF4444", fontSize: 11, marginLeft: 8 }}>• {b.status === "accepted" ? "নিশ্চিত" : b.status === "completed" ? "সম্পন্ন" : "বাতিল"}</span>}
                    {b.payment_status === 'paid' && <span style={{ color: "#16A34A", fontSize: 11, marginLeft: 8, fontWeight: 800 }}>• ৳ Paid</span>}
                  </div>
                  <div style={{ fontSize: 11, color: "#64748B", marginBottom: 4, display:"flex", alignItems:"center", gap:4 }}><Phone size={10}/> {b.user_phone}</div>
                  {b.notes && <div style={{ fontSize: 11, color: "#64748B", marginBottom: 4, lineHeight: 1.4, overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>📝 {b.notes}</div>}
                  <div style={{ display: "flex", gap: 6, flexWrap: "wrap", alignItems: "center" }}>
                    {b.preferred_date && <span style={{ fontSize: 10, padding: "3px 7px", borderRadius: 6, background: "#EFF6FF", color: "#3B82F6" }}>📅 {fmtDate(b.preferred_date)}</span>}
                    <span style={{ fontSize: 10, color: "#94A3B8" }}>{relativeTime(b.created_at)}</span>
                  </div>
                </div>
                {isNew && (
                  <div style={{ display: "flex", flexDirection: "column", gap: 5, flexShrink: 0 }}>
                    <button onClick={() => updateBookingStatus(b.id, "accepted")} style={{ padding: "6px 12px", borderRadius: 8, fontSize: 12, fontWeight: 700, fontFamily: "inherit", cursor: "pointer", border: "none", background: "#EAF9F3", color: "#0d6b58" }}>✓ গ্রহণ</button>
                    <button onClick={() => updateBookingStatus(b.id, "cancelled")} style={{ padding: "6px 12px", borderRadius: 8, fontSize: 12, fontWeight: 700, fontFamily: "inherit", cursor: "pointer", border: "none", background: "#FEF2F2", color: "#EF4444" }}>✕ বাতিল</button>
                  </div>
                )}
                {b.status === "accepted" && (
                  <button onClick={() => updateBookingStatus(b.id, "completed")} style={{ padding: "6px 10px", borderRadius: 8, fontSize: 11, fontWeight: 700, fontFamily: "inherit", cursor: "pointer", border: "none", background: "#EFF6FF", color: "#3B82F6", flexShrink:0 }}>সম্পন্ন</button>
                )}
              </div>
            );
          })}
        </div>
      </Card>
    </div>
  );

  /* ── APPOINTMENTS FULL PAGE (real data) ── */
  const AppointmentsView = () => (
    <div style={{ padding: isMobile ? 14 : 28, flex: 1 }}>
      <div style={{ marginBottom: 20 }}>
        <h2 style={{ fontSize: 20, fontWeight: 800, color: "#0F172A", margin: 0 }}>অ্যাপয়েন্টমেন্ট</h2>
        <p style={{ fontSize: 13, color: "#64748B", marginTop: 4 }}>নিশ্চিত বুকিং — {acceptedBookings.length + completedBookings.length}টি</p>
      </div>
      <Card style={{ overflow: "hidden" }}>
        <CardHead>
          <CardTitle>সকল অ্যাপয়েন্টমেন্ট</CardTitle>
          <Badge variant="green">{acceptedBookings.length} আসন্ন</Badge>
        </CardHead>
        <div style={{ overflowX: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse", minWidth: 500 }}>
            <thead>
              <tr>{["রোগী","ফোন","তারিখ","স্ট্যাটাস","অ্যাকশন"].map(h => (
                <th key={h} style={{ fontSize: 10, fontWeight: 700, color: "#64748B", textTransform: "uppercase", letterSpacing: ".5px", padding: "10px 16px", background: "#F8FAF9", textAlign: "left" }}>{h}</th>
              ))}</tr>
            </thead>
            <tbody>
              {[...acceptedBookings, ...completedBookings].length === 0 ? (
                <tr><td colSpan={5} style={{ textAlign:"center", padding:24, color:"#94A3B8", fontSize:13 }}>কোনো অ্যাপয়েন্টমেন্ট নেই</td></tr>
              ) : [...acceptedBookings, ...completedBookings].map(b => {
                const {bg, color} = initColor(b.user_name);
                return (
                  <tr key={b.id} style={{ borderBottom: "1px solid #E2E8F0" }}>
                    <td style={{ padding: "14px 16px" }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 9 }}>
                        <div style={{ width: 32, height: 32, borderRadius: 9, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 11, fontWeight: 700, flexShrink: 0, background: bg, color }}>{initials(b.user_name)}</div>
                        <div style={{ fontSize: 13, fontWeight: 600, color: "#0F172A" }}>{b.user_name}</div>
                      </div>
                    </td>
                    <td style={{ padding: "14px 16px", fontSize: 12, color:"#64748B" }}>{b.user_phone}</td>
                    <td style={{ padding: "14px 16px", fontSize: 12, fontWeight:600 }}>{fmtDate(b.preferred_date)}</td>
                    <td style={{ padding: "14px 16px" }}>
                      <Badge variant={b.status === "accepted" ? "green" : "gray"}>{b.status === "accepted" ? "আসন্ন" : "সম্পন্ন"}</Badge>
                      {b.payment_status === "paid" && <div style={{marginTop: 5}}><Badge variant="green">৳ Paid</Badge></div>}
                    </td>
                    <td style={{ padding: "14px 16px" }}>
                      <div style={{ display: "flex", gap: 8 }}>
                        {b.status === "accepted" && (
                          <button onClick={() => updateBookingStatus(b.id, "completed")} style={{ padding: "6px 12px", borderRadius: 8, fontSize: 12, fontWeight: 700, fontFamily: "inherit", cursor: "pointer", border: "none", background: "#EFF6FF", color: "#3B82F6" }}>সম্পন্ন করুন</button>
                        )}
                        {b.status === "accepted" && (
                          <button onClick={() => setActiveCall(b)} title="Join Virtual Chamber" style={{ padding: "6px 12px", borderRadius: 8, fontSize: 12, fontWeight: 700, fontFamily: "inherit", cursor: "pointer", border: "none", background: "#EAF9F3", color: "#0F6E56", display: "flex", alignItems: "center", gap: 5 }}>
                            <Video size={14} /> কল
                          </button>
                        )}
                        <button onClick={() => setViewingReportsFor(b)} style={{ padding: "6px 12px", borderRadius: 8, fontSize: 12, fontWeight: 700, fontFamily: "inherit", cursor: "pointer", border: "none", background: "#F1F5F4", color: "#0F172A" }}>রিপোর্ট</button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );

  /* ── REVIEWS FULL PAGE ── */
  const ReviewsView = () => (
    <div style={{ padding: isMobile ? 14 : 28, flex: 1 }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 20, flexWrap: "wrap", gap: 10 }}>
        <div>
          <h2 style={{ fontSize: 20, fontWeight: 800, color: "#0F172A", margin: 0 }}>Reviews & Ratings</h2>
          <p style={{ fontSize: 13, color: "#64748B", marginTop: 4 }}>{reviews.length} reviews{reviews.length > 0 ? ` · Avg ★ ${(reviews.reduce((s,r)=>s+r.rating,0)/reviews.length).toFixed(1)}` : ""}</p>
        </div>
        {reviews.length > 0 && (
          <div style={{ display: "flex", alignItems: "center", gap: 10, background: "#FFFBEB", border: "1px solid #FDE68A", borderRadius: 12, padding: "10px 16px" }}>
            <span style={{ fontSize: 28, fontWeight: 800, color: "#F59E0B" }}>{(reviews.reduce((s,r)=>s+r.rating,0)/reviews.length).toFixed(1)}</span>
            <div>
              <div style={{ color: "#F59E0B", fontSize: 14 }}>★★★★★</div>
              <div style={{ fontSize: 11, color: "#92400E" }}>{reviews.length} reviews</div>
            </div>
          </div>
        )}
      </div>
      <Card>
        <div style={{ padding: 20 }}>
          {reviews.length === 0 && (
            <div style={{ textAlign: "center", padding: "32px 0", color: "#94A3B8" }}>
              <div style={{ fontSize: 36, marginBottom: 8 }}>💬</div>
              <div style={{ fontSize: 14, fontWeight: 600 }}>No reviews yet</div>
              <div style={{ fontSize: 12, marginTop: 4 }}>Patient reviews will appear here after consultations.</div>
            </div>
          )}
          {reviews.map((r, i) => (
            <div key={r.id} style={{ paddingBottom: 16, marginBottom: 16, borderBottom: i < reviews.length - 1 ? "1px solid #E2E8F0" : "none" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 8 }}>
                <div style={{ width: 34, height: 34, borderRadius: 9, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 13, fontWeight: 700, background: "#EAF9F3", color: "#0d6b58", flexShrink: 0 }}>P</div>
                <div>
                  <div style={{ fontSize: 13, fontWeight: 700 }}>Patient</div>
                  <div style={{ fontSize: 11, color: "#94A3B8" }}>{new Date(r.created_at).toLocaleDateString("bn-BD")}</div>
                </div>
                <div style={{ marginLeft: "auto", color: "#F59E0B", fontSize: 13 }}>{"★".repeat(r.rating)}{"☆".repeat(5-r.rating)}</div>
              </div>
              <div style={{ fontSize: 13, color: "#334155", lineHeight: 1.6 }}>{r.comment || "—"}</div>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );

  /* ── Render nav content ────────────────────────────────────────────── */
  function renderContent() {
    switch (nav) {
      case "dashboard":     return <DashboardView />;
      case "leads":         return <LeadsView />;
      case "appointments":  return <AppointmentsView />;
      case "reviews":       return <ReviewsView />;
      case "prescriptions": return <PrescriptionWriter />;
      default:              return <ComingSoon label={NAV_GROUPS.flatMap(g => g.items).find(i => i.id === nav)?.label ?? nav} />;
    }
  }

  /* ── Main layout ─────────────────────────────────────────────────────── */
  return (
    <div style={{ display: "flex", minHeight: "100vh", fontFamily: "'Outfit',sans-serif", background: "#F1F5F4" }}>
      {/* Overlay for mobile */}
      {isMobile && sideOpen && (
        <div onClick={() => setSideOpen(false)}
          style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,.35)", zIndex: 55, backdropFilter: "blur(2px)" }} />
      )}

      {SidebarEl}

      {/* Main area */}
      <div style={{ marginLeft: isMobile ? 0 : SIDEBAR_W, flex: 1, display: "flex", flexDirection: "column", minWidth: 0 }}>
        {/* Topbar */}
        <div style={{ height: 54, background: "#fff", borderBottom: "1px solid #E2E8F0", display: "flex", alignItems: "center", padding: "0 18px", gap: 12, position: "sticky", top: 0, zIndex: 40 }}>
          {isMobile && (
            <button onClick={() => setSideOpen(true)} style={{ background: "none", border: "none", cursor: "pointer", color: "#0F172A", display: "flex", alignItems: "center", padding: 4 }}>
              <Menu size={22} />
            </button>
          )}
          {/* Mobile branding in topbar */}
          {isMobile && (
            <div style={{ display: "flex", alignItems: "center" }}>
              <img src="/daktarsab-logo-2.png" alt="DaktarSab" style={{ height: 28, objectFit: "contain" }} />
            </div>
          )}
          <div style={{ fontSize: 14, fontWeight: 700, flex: 1 }}>
            {!isMobile && <>Good morning, <span style={{ color: "#0F6E56" }}>Dr. {doctorProfile?.name?.split(" ")[0] || "..."}  </span> 👋</>}
            {isMobile && <span style={{ fontWeight: 700, color: "#0F172A" }}>{NAV_GROUPS.flatMap(g => g.items).find(i => i.id === nav)?.label ?? "Dashboard"}</span>}
          </div>
          {!isMobile && (
            <input placeholder="🔍 Search patients..." style={{ background: "#F1F5F4", border: "1px solid #E2E8F0", borderRadius: 10, padding: "7px 14px", fontSize: 12, fontFamily: "inherit", color: "#0F172A", outline: "none", width: 200 }} />
          )}
          <div style={{ width: 34, height: 34, borderRadius: 10, background: "#F1F5F4", border: "1px solid #E2E8F0", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", fontSize: 15, position: "relative", flexShrink: 0 }}>
            🔔<span style={{ position: "absolute", top: 6, right: 6, width: 7, height: 7, background: "#EF4444", borderRadius: "50%", border: "2px solid #fff" }} />
          </div>
        </div>

        {/* Scrollable content */}
        <div style={{ flex: 1, overflowY: "auto", display: "flex", flexDirection: "column" }}>
          {renderContent()}
        </div>
      </div>
      
      {viewingReportsFor && <ReportsModal booking={viewingReportsFor} onClose={() => setViewingReportsFor(null)} />}
      
      {/* Virtual Chamber / Telemedicine */}
      {activeCall && (
        <VideoChamber
          bookingId={activeCall.id}
          isDoctor={true}
          participantName={activeCall.user_name}
          onEndCall={() => setActiveCall(null)}
        />
      )}
    </div>
  );
}
