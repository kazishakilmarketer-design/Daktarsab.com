/**
 * DaktarSab — Partner Dashboard
 * Route: /partner-dashboard
 * ✅ Responsive: hamburger sidebar on mobile
 * ✅ Functional nav: Overview / Bookings / Schedule / Earnings + placeholders
 * ✅ DaktarSab branding in sidebar
 * ✅ [P0] Real booking_requests data from Supabase
 */
import { useState, useEffect, useCallback } from "react";
import { Link } from "react-router-dom";
import { Eye, EyeOff, LogOut, Mail, Lock, Menu, X, Loader2, RefreshCw, Phone } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

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

/* ─── Color tokens ─────────────────────────────────────────────────────── */
const G = {
  g9: "#042d22", g8: "#063d30", g7: "#085041", g6: "#0d6b58", g5: "#0F6E56",
  g4: "#1D9E75", g3: "#5DCAA5", g2: "#9FE1CB", g1: "#D1F5EA", g0: "#EAF9F3",
};

/* ─── Role guard ────────────────────────────────────────────────────────── */
// Partners use role = 'doctor' — set when admin approves the application

/* ─── Booking type ─────────────────────────────────────────────────────── */
interface Booking {
  id: string;
  created_at: string;
  service_type: string;
  provider_name: string;
  user_name: string;
  user_phone: string;
  preferred_date: string | null;
  preferred_time: string | null;
  notes: string | null;
  status: string;
  payment_status?: string;
}

/* ─── Helpers ──────────────────────────────────────────────────────────── */
function initials(n: string) { return n.split(" ").map(w => w[0]).join("").toUpperCase().slice(0,2); }
const INIT_C = ["#EAF9F3:#0d6b58","#EFF6FF:#3B82F6","#FFFBEB:#D97706","#FDF4FF:#9333EA","#FEF2F2:#DC2626"];
function initColor(n: string) { const [bg,color] = INIT_C[n.charCodeAt(0)%INIT_C.length].split(":"); return {bg,color}; }
function fmtDate(d: string|null) {
  if (!d) return "—";
  try { return new Date(d).toLocaleDateString("bn-BD", {day:"numeric",month:"short",year:"numeric"}); } catch { return d; }
}
function relTime(iso: string) {
  const s = (Date.now()-new Date(iso).getTime())/1000;
  if (s<60) return "এইমাত্র";
  if (s<3600) return `${Math.floor(s/60)} মিনিট আগে`;
  if (s<86400) return `${Math.floor(s/3600)} ঘণ্টা আগে`;
  return `${Math.floor(s/86400)} দিন আগে`;
}

/* ─── Static timeline ──────────────────────────────────────────────────── */
const TIMELINE = [
  { time: "09:00", name: "Mohammad Ali — Cardiology",   detail: "Emergency referral · Dr. Rahim Ahmed",  urgent: true,  filled: true },
  { time: "10:30", name: "Fatema Khanam — Gynecology",  detail: "Routine · Dr. Sara Begum",              urgent: false, filled: true },
  { time: "11:00", name: "Urgent: Neurology Walk-in",   detail: "Stroke symptoms — immediate attention", urgent: true,  filled: false },
  { time: "14:00", name: "Nilufa Rashid — Orthopedics", detail: "Follow-up · Dr. Karim Hossain",        urgent: false, filled: false },
  { time: "16:30", name: "Karim Mia — Pediatrics",     detail: "Child consultation · Dr. Amir Ali",    urgent: false, filled: false },
];

const EARNINGS_BARS = [
  { label: "Mon", pct: 60, val: "৳18k", peak: false }, { label: "Tue", pct: 46, val: "৳14k", peak: false },
  { label: "Wed", pct: 73, val: "৳22k", peak: false }, { label: "Thu", pct: 63, val: "৳19k", peak: false },
  { label: "Fri", pct: 100,val: "৳30k", peak: true  }, { label: "Sat", pct: 46, val: "৳14k", peak: false },
  { label: "Sun", pct: 23, val: "৳7k",  peak: false },
];

const CAL_DAYS = [
  { d: "23", other: true }, { d: "24", other: true }, { d: "25", other: true }, { d: "26", other: true }, { d: "27", other: true }, { d: "28", other: true }, { d: "1", other: false },
  ...[2,3,4,5,6,7,8].map(d => ({ d: String(d), booked: [2,3,4,5,6].includes(d), busy: d===5, off: d===7 })),
  ...[9,10,11,12,13,14,15].map(d => ({ d: String(d), booked: [9,10,11,12,13].includes(d), busy: d===11, off: d===14 })),
  ...[16,17,18,19,20,21,22].map(d => ({ d: String(d), booked: [16,17,18,19,20].includes(d), busy: d===18, today: d===21, off: d===22 })),
].map(d => ({ d: (d as any).d ?? "", other: (d as any).other ?? false, booked: (d as any).booked ?? false, busy: (d as any).busy ?? false, today: (d as any).today ?? false, off: (d as any).off ?? false }));

/* ─── Badge ────────────────────────────────────────────────────────────── */
const BADGE_V: Record<string, { bg: string; color: string }> = {
  emergency: { bg: "#FEF2F2", color: "#DC2626" }, urgent:   { bg: "#FFFBEB", color: "#D97706" },
  mild:      { bg: "#EFF6FF", color: "#2563EB" }, pending:  { bg: "#FFFBEB", color: "#D97706" },
  accepted:  { bg: G.g0,     color: G.g6       }, declined: { bg: "#FEF2F2", color: "#DC2626" },
  new:       { bg: "#FFFBEB", color: "#D97706"  }, completed:{ bg: "#EFF6FF", color: "#3B82F6" },
  cancelled: { bg: "#FEF2F2", color: "#DC2626" },
};
function Badge({ variant, children }: { variant: string; children: React.ReactNode }) {
  const s = BADGE_V[variant] ?? { bg: "#F3F4F6", color: "#6B7280" };
  return (
    <span style={{ display:"inline-flex", alignItems:"center", gap:4, padding:"4px 9px", borderRadius:8, fontSize:11, fontWeight:700, background:s.bg, color:s.color }}>
      <span style={{ width:5,height:5,borderRadius:"50%",background:"currentColor",flexShrink:0,display:"inline-block" }} />
      {children}
    </span>
  );
}

function ComingSoon({ label }: { label: string }) {
  return (
    <div style={{ flex:1, display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center", padding:40, gap:12, textAlign:"center" }}>
      <div style={{ fontSize:48 }}>🚧</div>
      <h2 style={{ fontSize:20, fontWeight:800, color:"#0F172A" }}>{label}</h2>
      <p style={{ fontSize:13, color:"#64748B" }}>এই সেকশনটি শীঘ্রই চালু হবে।</p>
    </div>
  );
}

type NavItem = "overview" | "bookings" | "schedule" | "earnings" | "doctors" | "settings" | "profile";

export default function PartnerDashboard() {
  const isMobile = useIsMobile(1024);

  /* Auth */
  const [email, setEmail]     = useState("");
  const [pass, setPass]       = useState("");
  const [showPass, setShowPass] = useState(false);
  const [auth, setAuth]       = useState(false);
  const [isPartner, setIsPartner] = useState(false);
  const [checkingRole, setCheckingRole] = useState(true);
  const [authErr, setAuthErr] = useState("");
  const [authLoading, setAuthLoading] = useState(false);
  const [partnerProfile, setPartnerProfile] = useState<{ name: string } | null>(null);

  /* Check session on mount */
  useEffect(() => {
    const checkSession = async () => {
      setCheckingRole(true);
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user) {
        setAuth(true);
        await verifyPartnerRole(session.user.id, session.user.email ?? "");
      } else {
        setCheckingRole(false);
      }
    };
    checkSession();
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (!session) { setAuth(false); setIsPartner(false); setPartnerProfile(null); }
    });
    return () => subscription.unsubscribe();
  }, []);

  async function verifyPartnerRole(userId: string, emailStr: string) {
    try {
      const { data } = await (supabase as any)
        .from("profiles")
        .select("role")
        .eq("user_id", userId)
        .maybeSingle();
      if (data?.role === "doctor" || data?.role === "admin") {
        setIsPartner(true);
        await loadProfile(emailStr);
      } else {
        setIsPartner(false);
      }
    } catch {
      setIsPartner(false);
    } finally {
      setCheckingRole(false);
    }
  }

  async function loadProfile(emailStr: string) {
    try {
      // attempt to load full_name from profiles
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const { data } = await (supabase as any).from("profiles").select("full_name").eq("id", user.id).maybeSingle();
        if (data?.full_name) { setPartnerProfile({ name: data.full_name }); return; }
      }
    } catch { /* ignore */ }
    setPartnerProfile({ name: emailStr.split("@")[0] });
  }
  /* UI */
  const [nav, setNav]           = useState<NavItem>("overview");
  const [sideOpen, setSideOpen] = useState(false);

  /* Real Supabase bookings */
  const [bookings, setBookings]         = useState<Booking[]>([]);
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
    } catch (e) { console.warn("PartnerDashboard: fetchBookings failed", e); }
    finally { setLoadingBookings(false); }
  }, []);

  useEffect(() => { if (auth) fetchBookings(); }, [auth, fetchBookings]);

  /* Realtime new booking notifications */
  useEffect(() => {
    if (!auth) return;
    const ch = (supabase as any)
      .channel("booking_requests_partner")
      .on("postgres_changes", { event:"INSERT", schema:"public", table:"booking_requests" }, () => fetchBookings())
      .subscribe();
    return () => (supabase as any).removeChannel(ch);
  }, [auth, fetchBookings]);

  async function updateStatus(id: string, status: string) {
    await (supabase as any).from("booking_requests").update({ status }).eq("id", id);
    setBookings(p => p.map(b => b.id===id ? {...b, status} : b));
  }

  const newBookings      = bookings.filter(b => b.status === "new");
  const acceptedBookings = bookings.filter(b => b.status === "accepted");
  const completedBookings= bookings.filter(b => b.status === "completed");

  function goNav(item: NavItem) { setNav(item); if (isMobile) setSideOpen(false); }

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    setAuthLoading(true);
    setAuthErr("");
    try {
      const { data, error } = await supabase.auth.signInWithPassword({ email: email.trim(), password: pass });
      if (error) throw error;
      setAuth(true);
      setAuthErr("");
      await verifyPartnerRole(data.user.id, data.user?.email ?? "");
    } catch (err: any) {
      setAuthErr(err?.message || "লগইন ব্যর্থ হয়েছে। ইমেইল বা পাসওয়ার্ড যাচাই করুন।");
    } finally {
      setAuthLoading(false);
    }
  }
  const pendingCount = newBookings.length;

  /* ── Role check loading ──────────────────────────────────────────────── */
  if (checkingRole) return (
    <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", background: "linear-gradient(135deg,#EAF9F3,#F0F9F6)" }}>
      <div style={{ textAlign: "center" }}>
        <div style={{ fontSize: 36, marginBottom: 12 }}>🏥</div>
        <p style={{ color: "#64748B", fontSize: 14 }}>অনুমতি যাচাই করা হচ্ছে...</p>
      </div>
    </div>
  );

  /* ── Access denied ────────────────────────────────────────────────── */
  if (auth && !isPartner) return (
    <div style={{ minHeight: "100vh", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 16, background: "linear-gradient(135deg,#EAF9F3,#F0F9F6)", padding: 20 }}>
      <div style={{ fontSize: 48 }}>🚫</div>
      <h2 style={{ fontSize: 20, fontWeight: 800, color: "#0F172A", margin: 0 }}>অ্যাক্সেস অনুমোদিত নয়</h2>
      <p style={{ fontSize: 14, color: "#64748B", textAlign: "center", maxWidth: 320 }}>
        এই ড্যাশবোর্ডটি শুধুমাত্র অনুমোদিত পার্টনারদের জন্য।<br />
        আপনার আবেদন এখনো অনুমোদিত হয়নি অথবা <code style={{ background: "#EAF9F3", padding: "2px 6px", borderRadius: 4 }}>role = 'doctor'</code> সেট নেই।
      </p>
      <button onClick={() => { supabase.auth.signOut(); setAuth(false); setIsPartner(false); }}
        style={{ padding: "10px 20px", borderRadius: 10, background: "#0F6E56", color: "#fff", border: "none", fontWeight: 700, cursor: "pointer", fontFamily: "inherit" }}>
        অন্য একাউন্ট দিয়ে লগইন করুন
      </button>
    </div>
  );

  /* ── Login ─────────────────────────────────────────────────────────────── */
  if (!auth) return (
    <div style={{ minHeight: "100vh", background: "linear-gradient(135deg,#EAF9F3,#F0F9F6)", display: "flex", alignItems: "center", justifyContent: "center", padding: 20, fontFamily: "'Outfit',sans-serif" }}>
      <div style={{ background: "#fff", borderRadius: 20, boxShadow: "0 8px 40px rgba(0,0,0,.12)", width: "100%", maxWidth: 420, overflow: "hidden" }}>
        {/* White logo header — logo is blue+green, NOT visible on dark green bg */}
        <div style={{ background: "#fff", borderBottom: "1px solid #E2E8F0", padding: "28px 32px", textAlign: "center" }}>
          <div style={{ display: "flex", justifyContent: "center", marginBottom: 16 }}>
            <img src="/daktarsab-logo.png" alt="DaktarSab Logo" style={{ height: 56, objectFit: "contain" }} />
          </div>
          <div style={{ width: 48, height: 48, borderRadius: 14, background: G.g0, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 24, margin: "0 auto 10px" }}>🏥</div>
          <h1 style={{ fontSize: 18, fontWeight: 800, color: "#111827", margin: 0 }}>পার্টনার ড্যাশবোর্ড</h1>
          <p style={{ fontSize: 12, color: "#64748B", marginTop: 4 }}>DaktarSab Partner Portal</p>
        </div>
        <div style={{ padding: "28px 32px" }}>
          <form onSubmit={handleLogin}>
            <div style={{ marginBottom: 12 }}>
              <label style={{ fontSize: 12, fontWeight: 700, color: "#111827", display: "block", marginBottom: 5 }}>ইমেইল ঠিকানা (Gmail)</label>
              <div style={{ position: "relative" }}>
                <Mail size={15} style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)", color: "#9CA3AF" }} />
                <input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="partner@gmail.com"
                  style={{ width: "100%", padding: "11px 14px 11px 36px", border: "1.5px solid #E5E7EB", borderRadius: 10, fontSize: 14, fontFamily: "inherit", outline: "none", background: "#F8FAF9", boxSizing: "border-box" }} />
              </div>
            </div>
            <div style={{ marginBottom: 16 }}>
              <label style={{ fontSize: 12, fontWeight: 700, color: "#111827", display: "block", marginBottom: 5 }}>পাসওয়ার্ড</label>
              <div style={{ position: "relative" }}>
                <Lock size={15} style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)", color: "#9CA3AF" }} />
                <input type={showPass ? "text" : "password"} value={pass} onChange={e => setPass(e.target.value)} placeholder="আপনার পাসওয়ার্ড দিন"
                  style={{ width: "100%", padding: "11px 42px 11px 36px", border: "1.5px solid #E5E7EB", borderRadius: 10, fontSize: 14, fontFamily: "inherit", outline: "none", background: "#F8FAF9", boxSizing: "border-box" }} />
                <button type="button" onClick={() => setShowPass(v => !v)}
                  style={{ position: "absolute", right: 12, top: "50%", transform: "translateY(-50%)", background: "none", border: "none", cursor: "pointer", color: "#9CA3AF" }}>
                  {showPass ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>
            {authErr && <p style={{ color: "#DC2626", fontSize: 12, marginBottom: 12, background: "#FEF2F2", padding: "8px 12px", borderRadius: 8 }}>{authErr}</p>}
            <button type="submit" disabled={authLoading} style={{ width: "100%", padding: 12, background: G.g5, color: "#fff", border: "none", borderRadius: 10, fontSize: 14, fontWeight: 700, cursor: authLoading ? "not-allowed" : "pointer", fontFamily: "inherit", opacity: authLoading ? 0.7 : 1 }}>
              {authLoading ? <Loader2 size={16} style={{ animation:"spin 1s linear infinite", display:"inline-block" }} /> : "লগইন করুন →"}
            </button>
          </form>
          <p style={{ textAlign: "center", fontSize: 12, color: "#9CA3AF", marginTop: 20 }}>
            নিবন্ধিত নন? <Link to="/join-as-partner" style={{ color: G.g5, fontWeight: 700 }}>এখানে আবেদন করুন</Link>
          </p>
        </div>
      </div>
    </div>
  );

  /* ── Nav groups ──────────────────────────────────────────────────────── */
  const NAV_GROUPS = [
    { section: "Management", items: [
      { id: "overview",  ico: "📊", label: "Overview" },
      { id: "bookings",  ico: "📋", label: "Booking Requests", badge: pendingCount > 0 ? pendingCount : null },
      { id: "schedule",  ico: "📅", label: "Today's Schedule" },
      { id: "earnings",  ico: "💰", label: "Earnings" },
    ]},
    { section: "Operations", items: [
      { id: "doctors",   ico: "🩺", label: "Our Doctors" },
      { id: "inventory", ico: "📦", label: "Inventory" },
    ]},
    { section: "Account", items: [
      { id: "profile",   ico: "🏥", label: "Partner Profile" },
      { id: "settings",  ico: "⚙️", label: "Settings" },
    ]},
  ];

  const SIDEBAR_W = 240;

  /* ── Sidebar ─────────────────────────────────────────────────────────── */
  const SidebarEl = (
    <aside style={{
      width: SIDEBAR_W, background: G.g9, flexShrink: 0, height: "100vh", display: "flex",
      flexDirection: "column", zIndex: 60, position: "fixed", top: 0, left: 0,
      transform: isMobile && !sideOpen ? `translateX(-${SIDEBAR_W}px)` : "translateX(0)",
      transition: "transform .25s ease", boxShadow: isMobile && sideOpen ? "4px 0 20px rgba(0,0,0,.3)" : "none",
    }}>
      {/* Branding — white/glass panel so logo (blue+green) is visible on dark sidebar */}
      <div style={{ padding: "14px 14px", borderBottom: `1px solid ${G.g8}`, display: "flex", alignItems: "center", gap: 8 }}>
        <div style={{ background: "rgba(255,255,255,.95)", borderRadius: 10, padding: "6px 10px", flex: 1, minWidth: 0, display: "flex", alignItems: "center" }}>
          <img src="/daktarsab-logo.png" alt="DaktarSab" style={{ height: 32, objectFit: "contain", width: "100%" }} />
        </div>
        {isMobile && (
          <button onClick={() => setSideOpen(false)} style={{ background: "none", border: "none", cursor: "pointer", color: G.g2, padding: 4, flexShrink: 0 }}>
            <X size={18} />
          </button>
        )}
      </div>

      {/* Partner card */}
      <div style={{ padding: "14px 14px 12px", borderBottom: `1px solid ${G.g8}` }}>
        <div style={{ width: 46, height: 46, borderRadius: 12, background: G.g7, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 22, marginBottom: 8 }}>🏥</div>
        <div style={{ fontSize: 14, fontWeight: 700, color: "#fff", marginBottom: 2 }}>{partnerProfile?.name || "পার্টনার লোড হচ্ছে..."}</div>
        <div style={{ fontSize: 11, color: G.g2, marginBottom: 6 }}>নিবন্ধিত পার্টনার পোর্টাল</div>
        <div style={{ display: "inline-flex", alignItems: "center", gap: 4, background: G.g7, border: `1px solid ${G.g6}`, color: G.g3, fontSize: 10, fontWeight: 700, padding: "3px 9px", borderRadius: 8 }}>
          ● Active Partner
        </div>
      </div>

      {/* Nav */}
      <nav style={{ flex: 1, padding: "8px 10px", overflowY: "auto" }}>
        {NAV_GROUPS.map(g => (
          <div key={g.section}>
            <div style={{ fontSize: 9, fontWeight: 700, color: G.g2, letterSpacing: ".7px", textTransform: "uppercase", padding: "10px 8px 4px", opacity: 0.7 }}>{g.section}</div>
            {g.items.map(it => (
              <div key={it.id} onClick={() => goNav(it.id as NavItem)}
                style={{ display: "flex", alignItems: "center", gap: 9, padding: "9px 10px", borderRadius: 10, cursor: "pointer",
                  color: nav === it.id ? "#fff" : G.g2,
                  fontSize: 13, fontWeight: nav === it.id ? 700 : 500,
                  background: nav === it.id ? G.g7 : "transparent",
                  marginBottom: 1, transition: "all .15s" }}>
                <span style={{ fontSize: 15, width: 20, textAlign: "center" }}>{it.ico}</span>
                {it.label}
                {it.badge != null && it.badge > 0 && <span style={{ marginLeft: "auto", background: "#EF4444", color: "#fff", fontSize: 9, fontWeight: 700, padding: "2px 7px", borderRadius: 10 }}>{it.badge}</span>}
              </div>
            ))}
          </div>
        ))}
      </nav>

      {/* Bottom logout */}
      <div style={{ padding: 12, borderTop: `1px solid ${G.g8}` }}>
        <div style={{ display: "flex", gap: 6, alignItems: "center", justifyContent: "space-between", background: G.g7, borderRadius: 10, padding: "10px 12px", marginBottom: 8 }}>
          <div>
            <div style={{ fontSize: 11, fontWeight: 600, color: "#fff" }}>Portal Status</div>
            <div style={{ fontSize: 10, color: G.g3 }}>🟢 All systems active</div>
          </div>
        </div>
        <button onClick={async () => { 
            const { error } = await supabase.auth.signOut();
            if (error) console.error("Sign out error:", error);
            setAuth(false); 
            window.location.href = '/auth'; 
          }}
          style={{ width: "100%", padding: 8, display: "flex", alignItems: "center", justifyContent: "center", gap: 6, fontSize: 12, fontWeight: 600, color: G.g2, background: "none", border: `1px solid ${G.g7}`, cursor: "pointer", borderRadius: 8, fontFamily: "inherit" }}>
          <LogOut size={13} /> Logout
        </button>
      </div>
    </aside>
  );

  /* ── Shared UI atoms ──────────────────────────────────────────────────── */
  const Card = ({ children, style }: { children: React.ReactNode; style?: React.CSSProperties }) => (
    <div style={{ background: "#fff", borderRadius: 14, border: "1px solid #E2E8F0", boxShadow: "0 1px 3px rgba(0,0,0,.06)", ...style }}>{children}</div>
  );
  const CardHead = ({ children }: { children: React.ReactNode }) => (
    <div style={{ padding: "14px 18px", borderBottom: "1px solid #E2E8F0", display: "flex", alignItems: "center", justifyContent: "space-between" }}>{children}</div>
  );
  const CardTitle = ({ children }: { children: React.ReactNode }) => (
    <div style={{ fontSize: 14, fontWeight: 700, color: "#111827" }}>{children}</div>
  );

  /* ── OVERVIEW ──────────────────────────────────────────────────────────── */

  /* -- RESOURCE UPDATE PANEL -- */
  const ResourceUpdatePanel = () => {
    const [resBeds, setResBeds]     = useState("");
    const [resIcu, setResIcu]       = useState("");
    const [resO2, setResO2]         = useState("High");
    const [resSaving, setResSaving] = useState(false);
    const [resSaved, setResSaved]   = useState(false);
    async function submitResources(e: React.FormEvent) {
      e.preventDefault();
      if (!resBeds && !resIcu) return;
      setResSaving(true);
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) throw new Error("Not authenticated");
        const { data: reg } = await (supabase as any)
          .from("partner_registrations").select("hospital_name").eq("email", user.email).limit(1).maybeSingle();
        const hospitalName = (reg as any)?.hospital_name || "My Hospital";
        await (supabase as any).from("hospital_resources").upsert({
          hospital_name: hospitalName, beds_available: parseInt(resBeds)||0,
          icu_beds_available: parseInt(resIcu)||0, oxygen_status: resO2,
          updated_by: user.id, last_updated_at: new Date().toISOString(),
        }, { onConflict: "hospital_name" });
        setResSaved(true); setTimeout(() => setResSaved(false), 3000);
      } catch (err) { console.error(err); } finally { setResSaving(false); }
    }
    return (
      <Card style={{ marginBottom: 18 }}>
        <CardHead><CardTitle>🏥 হাসপাতাল রিসোর্স আপডেট</CardTitle>
          <span style={{ fontSize: 11, color: "#64748B" }}>Live capacity for patients</span></CardHead>
        <form onSubmit={submitResources} style={{ padding: 18, display: "flex", flexWrap: "wrap", gap: 12, alignItems: "flex-end" }}>
          <div style={{ flex: "1 1 110px" }}>
            <label style={{ fontSize: 11, fontWeight: 600, color: "#374151", display:"block", marginBottom:5 }}>🛏 Beds</label>
            <input type="number" min="0" value={resBeds} onChange={e=>setResBeds(e.target.value)} placeholder="e.g. 45"
              style={{ width:"100%", padding:"9px 12px", borderRadius:9, border:"1px solid #E2E8F0", fontSize:13, fontFamily:"inherit", outline:"none", boxSizing:"border-box" }} />
          </div>
          <div style={{ flex: "1 1 110px" }}>
            <label style={{ fontSize: 11, fontWeight: 600, color: "#374151", display:"block", marginBottom:5 }}>🏥 ICU</label>
            <input type="number" min="0" value={resIcu} onChange={e=>setResIcu(e.target.value)} placeholder="e.g. 8"
              style={{ width:"100%", padding:"9px 12px", borderRadius:9, border:"1px solid #E2E8F0", fontSize:13, fontFamily:"inherit", outline:"none", boxSizing:"border-box" }} />
          </div>
          <div style={{ flex: "1 1 110px" }}>
            <label style={{ fontSize: 11, fontWeight: 600, color: "#374151", display:"block", marginBottom:5 }}>💨 Oxygen</label>
            <select value={resO2} onChange={e=>setResO2(e.target.value)} style={{ width:"100%", padding:"9px 12px", borderRadius:9, border:"1px solid #E2E8F0", fontSize:13, fontFamily:"inherit", background:"#fff", outline:"none", boxSizing:"border-box" }}>
              <option value="High">🟢 High</option>
              <option value="Medium">🟡 Medium</option>
              <option value="Low">🔴 Low</option>
            </select>
          </div>
          <button type="submit" disabled={resSaving} style={{ padding:"9px 20px", borderRadius:9, border:"none", background:resSaving?"#94A3B8":G.g5, color:"#fff", fontSize:13, fontWeight:700, cursor:resSaving?"not-allowed":"pointer", fontFamily:"inherit" }}>
            {resSaving ? "সেভ হচ্ছে..." : resSaved ? "✅ Saved!" : "আপডেট করুন"}
          </button>
        </form>
      </Card>
    );
  };

  /* ── Dynamic Earnings Calculation ── */
  const paidBookings = bookings.filter(b => b.payment_status === "paid");
  const totalRevenue = paidBookings.length * 500;
  const patientsCount = [...new Set(paidBookings.map(b => b.user_phone))].length;
  const avgPerPatient = patientsCount > 0 ? Math.round(totalRevenue / patientsCount) : 0;

  // Calculate dynamic daily earnings for Mon-Sun
  const now = new Date();
  const getDayEarnings = (dayOffset: number) => {
    const targetDate = new Date(now.getTime() - dayOffset * 24 * 60 * 60 * 1000);
    return paidBookings.filter(b => new Date(b.created_at).toDateString() === targetDate.toDateString()).length * 500;
  };

  const mon = getDayEarnings((now.getDay() + 6) % 7);
  const tue = getDayEarnings((now.getDay() + 5) % 7);
  const wed = getDayEarnings((now.getDay() + 4) % 7);
  const thu = getDayEarnings((now.getDay() + 3) % 7);
  const fri = getDayEarnings((now.getDay() + 2) % 7);
  const sat = getDayEarnings((now.getDay() + 1) % 7);
  const sun = getDayEarnings(now.getDay());

  const maxVal = Math.max(mon, tue, wed, thu, fri, sat, sun, 500);
  const dayLabels = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
  const dayVals = [mon, tue, wed, thu, fri, sat, sun];
  const earningsBars = dayLabels.map((label, idx) => ({
    label,
    pct: Math.round((dayVals[idx] / maxVal) * 100),
    val: `৳${(dayVals[idx] / 1000).toFixed(1)}k`,
    peak: dayVals[idx] === maxVal && maxVal > 0,
  }));

  const OverviewView = () => (
    <div style={{ padding: isMobile ? 14 : 24, flex: 1 }}>
      {/* Metrics */}
      <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr 1fr" : "repeat(4,1fr)", gap: 14, marginBottom: 18 }}>
        {[
          { label: "Today's Bookings",  ico: "📋", bg: G.g0,       val: bookings.filter(b => new Date(b.created_at).toDateString() === new Date().toDateString()).length, sub: `${bookings.filter(b => b.status === 'new').length} pending` },
          { label: "Confirmed",         ico: "✅", bg: "#F0FDF4",    val: bookings.filter(b => b.status === 'accepted').length,   sub: "Accepted bookings" },
          { label: "Completed",         ico: "🏆", bg: "#EFF6FF",    val: bookings.filter(b => b.status === 'completed').length, sub: "Total completed" },
          { label: "Total Requests",    ico: "📥", bg: "#F5F3FF",    val: bookings.length, sub: "All time" },
        ].map(m => (
          <Card key={m.label} style={{ padding: 16 }}>
            <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: 12 }}>
              <div style={{ fontSize: 10, fontWeight: 600, color: "#64748B", textTransform: "uppercase", letterSpacing: ".4px" }}>{m.label}</div>
              <div style={{ width: 32, height: 32, borderRadius: 9, background: m.bg, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 15, flexShrink: 0 }}>{m.ico}</div>
            </div>
            <div style={{ fontSize: 24, fontWeight: 800, color: "#111827", marginBottom: 4 }}>{m.val}</div>
            <div style={{ fontSize: 11, color: G.g6, fontWeight: 600 }}>{m.sub}</div>
          </Card>
        ))}
      </div>

      {/* Bookings + Schedule */}
      <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr" : "3fr 2fr", gap: 18, marginBottom: 18 }}>
        {/* Pending bookings */}
        <Card>
          <CardHead>
            <CardTitle>সাম্প্রতিক বুকিং রিকোয়েস্ট</CardTitle>
            <div style={{ display: "flex", gap: 8 }}>
              <Badge variant="pending">{pendingCount} নতুন</Badge>
              <button onClick={() => goNav("bookings")} style={{ fontSize: 11, fontWeight: 700, color: G.g6, background: G.g0, border: "none", borderRadius: 8, padding: "4px 10px", cursor: "pointer", fontFamily: "inherit" }}>সব দেখুন</button>
            </div>
          </CardHead>
          <div style={{ overflowX: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse", minWidth: 400 }}>
              <thead>
                <tr>{["রোগী","সেবা","তারিখ","স্ট্যাটাস",""].map(h => (
                  <th key={h} style={{ fontSize: 10, fontWeight: 700, color: "#64748B", textTransform: "uppercase", letterSpacing: ".5px", padding: "8px 14px", background: "#F8FAF9", textAlign: "left" }}>{h}</th>
                ))}</tr>
              </thead>
              <tbody>
                {loadingBookings ? (
                  <tr><td colSpan={5} style={{ textAlign:"center", padding:20 }}><Loader2 size={18} style={{ animation:"spin 1s linear infinite", color:G.g6 }}/></td></tr>
                ) : bookings.length === 0 ? (
                  <tr><td colSpan={5} style={{ textAlign:"center", padding:20, color:"#94A3B8", fontSize:12 }}>কোনো বুকিং নেই</td></tr>
                ) : bookings.slice(0, 4).map(b => {
                  const {bg, color} = initColor(b.user_name);
                  return (
                    <tr key={b.id} style={{ borderBottom: "1px solid #E2E8F0" }}>
                      <td style={{ padding: "11px 14px" }}>
                        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                          <div style={{ width: 28, height: 28, borderRadius: 7, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 11, fontWeight: 700, flexShrink: 0, background: bg, color }}>{initials(b.user_name)}</div>
                          <div>
                            <div style={{ fontSize: 12, fontWeight: 600, color: "#111827" }}>{b.user_name}</div>
                            <div style={{ fontSize: 10, color: "#6B7280" }}>{b.user_phone}</div>
                          </div>
                        </div>
                      </td>
                      <td style={{ padding: "11px 14px", fontSize: 12, color: "#374151" }}>{b.service_type || "—"}</td>
                      <td style={{ padding: "11px 14px", fontSize: 11, color:"#64748B" }}>{fmtDate(b.preferred_date)}</td>
                      <td style={{ padding: "11px 14px" }}><Badge variant={b.status}>{b.status === "new" ? "নতুন" : b.status === "accepted" ? "গৃহীত" : b.status === "completed" ? "সম্পন্ন" : "বাতিল"}</Badge></td>
                      <td style={{ padding: "11px 14px" }}>
                        {b.status === "new" && (
                          <div style={{ display: "flex", gap: 4 }}>
                            <button onClick={() => updateStatus(b.id, "accepted")} style={{ padding: "4px 8px", borderRadius: 6, fontSize: 11, fontWeight: 700, fontFamily: "inherit", cursor: "pointer", border: "none", background: G.g0, color: G.g6 }}>✓</button>
                            <button onClick={() => updateStatus(b.id, "cancelled")} style={{ padding: "4px 8px", borderRadius: 6, fontSize: 11, fontWeight: 700, fontFamily: "inherit", cursor: "pointer", border: "none", background: "#FEF2F2", color: "#DC2626" }}>✕</button>
                          </div>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </Card>

        <Card>
          <CardHead><CardTitle>Today's Schedule</CardTitle>
            <button onClick={() => goNav("schedule")} style={{ fontSize: 11, fontWeight: 700, color: G.g6, background: G.g0, border: "none", borderRadius: 7, padding: "4px 10px", cursor: "pointer", fontFamily: "inherit" }}>সব দেখুন</button>
          </CardHead>
          <div style={{ padding: 16 }}>
            {bookings.filter(b => b.status === "accepted").length === 0 ? (
              <div style={{ textAlign: "center", padding: "24px 0", color: "#94A3B8", fontSize: 12 }}>আজকের কোনো নির্ধারিত অ্যাপয়েন্টমেন্ট নেই</div>
            ) : bookings.filter(b => b.status === "accepted").slice(0, 5).map((b, i, arr) => {
              const {bg, color} = initColor(b.user_name);
              return (
                <div key={b.id} style={{ display: "flex", gap: 12, marginBottom: 12, alignItems: "flex-start" }}>
                  <div style={{ display: "flex", flexDirection: "column", alignItems: "center", flexShrink: 0 }}>
                    <div style={{ width: 10, height: 10, borderRadius: "50%", background: G.g4, marginTop: 4 }} />
                    {i < arr.length - 1 && <div style={{ width: 1.5, height: 28, background: "#E2E8F0", marginTop: 3 }} />}
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                      <span style={{ fontSize: 10, fontWeight: 700, color: G.g6, background: G.g0, padding: "2px 7px", borderRadius: 5, flexShrink: 0 }}>{b.preferred_time || "—"}</span>
                    </div>
                    <div style={{ fontSize: 12, fontWeight: 600, color: "#111827", marginTop: 3 }}>{b.user_name} — {b.service_type || "Consultation"}</div>
                    <div style={{ fontSize: 10, color: "#6B7280" }}>{b.notes || "No notes"}</div>
                  </div>
                </div>
              );
            })}
          </div>
        </Card>
      </div>

      {/* Hospital Resource Update Panel */}
      <ResourceUpdatePanel />

      {/* Earnings chart + Calendar */}
      <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr" : "1fr 1fr", gap: 18 }}>
        <Card>
          <CardHead>
            <CardTitle>Total Revenue</CardTitle>
            <span style={{ fontSize: 13, fontWeight: 700, color: G.g5 }}>৳ {totalRevenue.toLocaleString()}</span>
          </CardHead>
          <div style={{ padding: 18 }}>
            <div style={{ display: "flex", alignItems: "flex-end", gap: 5, height: 90 }}>
              {earningsBars.map(b => (
                <div key={b.label} style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: 3 }}>
                  <div style={{ fontSize: 9, color: "#6B7280", fontWeight: b.peak ? 700 : 400 }}>{b.peak ? `৳${(totalRevenue/2000).toFixed(0)}k` : ""}</div>
                  <div style={{ width: "100%", height: `${b.pct}%`, borderRadius: "4px 4px 0 0", background: b.peak ? G.g4 : G.g1 }} />
                  <div style={{ fontSize: 9, color: "#6B7280" }}>{b.label}</div>
                </div>
              ))}
            </div>
            <div style={{ marginTop: 14, display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 10, borderTop: "1px solid #E2E8F0", paddingTop: 14 }}>
              {[[`৳${(totalRevenue/1000).toFixed(1)}k`,"Total Revenue"],[`${patientsCount}`,"Patients"],[`৳${avgPerPatient}`,"Avg/Patient"]].map(([v, l]) => (
                <div key={l} style={{ textAlign: "center" }}>
                  <div style={{ fontSize: 15, fontWeight: 800, color: "#111827" }}>{v}</div>
                  <div style={{ fontSize: 10, color: "#6B7280" }}>{l}</div>
                </div>
              ))}
            </div>
          </div>
        </Card>

        <Card>
          <CardHead><CardTitle>Availability Calendar — March 2026</CardTitle></CardHead>
          <div style={{ padding: 16 }}>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(7,1fr)", gap: 3, marginBottom: 10 }}>
              {["S","M","T","W","T","F","S"].map((d, i) => (
                <div key={i} style={{ textAlign: "center", fontSize: 9, fontWeight: 700, color: "#9CA3AF", padding: "4px 0" }}>{d}</div>
              ))}
              {CAL_DAYS.map((d, i) => (
                <div key={i} style={{
                  textAlign: "center", fontSize: 11, padding: "5px 0", borderRadius: 6, cursor: "pointer", fontWeight: d.today ? 800 : 500,
                  color: d.other ? "#D1D5DB" : d.today ? "#fff" : d.off ? "#9CA3AF" : "#374151",
                  background: d.today ? G.g5 : d.busy ? G.g1 : d.booked ? G.g0 : "transparent",
                  border: d.today ? "none" : "1px solid transparent",
                }}>{d.d}</div>
              ))}
            </div>
            <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
              {[[G.g0,"Available"],[G.g1,"Busy"],[G.g5,"Today"],["transparent","Off"]].map(([bg, label]) => (
                <div key={label as string} style={{ display: "flex", alignItems: "center", gap: 4, fontSize: 10, color: "#6B7280" }}>
                  <div style={{ width: 10, height: 10, borderRadius: 3, background: bg as string, border: "1px solid #E2E8F0" }} />{label}
                </div>
              ))}
            </div>
          </div>
        </Card>
      </div>
    </div>
  );

  /* ── BOOKINGS FULL PAGE (real Supabase) ─────────────────────────────── */
  const BookingsView = () => (
    <div style={{ padding: isMobile ? 14 : 24, flex: 1 }}>
      <div style={{ marginBottom: 20, display:"flex", alignItems:"center", justifyContent:"space-between", flexWrap:"wrap", gap:10 }}>
        <div>
          <h2 style={{ fontSize: 20, fontWeight: 800, color: "#111827", margin: 0 }}>বুকিং রিকোয়েস্ট</h2>
          <p style={{ fontSize: 13, color: "#6B7280", marginTop: 4 }}>{newBookings.length} নতুন · {bookings.length} মোট</p>
        </div>
        <button onClick={fetchBookings} style={{ display:"flex", alignItems:"center", gap:6, padding:"8px 14px", borderRadius:9, background:G.g0, border:"none", color:G.g6, fontWeight:700, fontSize:12, cursor:"pointer", fontFamily:"inherit" }}>
          <RefreshCw size={13}/> রিফ্রেশ
        </button>
      </div>
      <Card style={{ overflow: "hidden" }}>
        <CardHead><CardTitle>সকল বুকিং</CardTitle><Badge variant="pending">{newBookings.length} নতুন</Badge></CardHead>
        <div style={{ overflowX: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse", minWidth: 560 }}>
            <thead>
              <tr>{["রোগী","ফোন","সেবা","তারিখ","স্ট্যাটাস","অ্যাকশন"].map(h => (
                <th key={h} style={{ fontSize: 10, fontWeight: 700, color: "#64748B", textTransform: "uppercase", letterSpacing: ".5px", padding: "10px 16px", background: "#F8FAF9", textAlign: "left" }}>{h}</th>
              ))}</tr>
            </thead>
            <tbody>
              {loadingBookings ? (
                <tr><td colSpan={6} style={{ textAlign:"center", padding:30 }}><Loader2 size={22} style={{ animation:"spin 1s linear infinite", color:G.g6 }}/></td></tr>
              ) : bookings.length === 0 ? (
                <tr><td colSpan={6} style={{ textAlign:"center", padding:24, color:"#94A3B8", fontSize:13 }}>কোনো বুকিং নেই</td></tr>
              ) : bookings.map(b => {
                const {bg, color} = initColor(b.user_name);
                return (
                  <tr key={b.id} style={{ borderBottom: "1px solid #E2E8F0", opacity: b.status === "cancelled" ? 0.5 : 1, transition:"opacity .2s" }}>
                    <td style={{ padding: "14px 16px" }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 9 }}>
                        <div style={{ width: 32, height: 32, borderRadius: 9, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 13, fontWeight: 700, flexShrink: 0, background: bg, color }}>{initials(b.user_name)}</div>
                        <div>
                          <div style={{ fontSize: 13, fontWeight: 600, color: "#111827" }}>{b.user_name}</div>
                          {b.notes && <div style={{ fontSize: 11, color: "#6B7280", maxWidth:160, overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>{b.notes}</div>}
                        </div>
                      </div>
                    </td>
                    <td style={{ padding: "14px 16px", fontSize: 12, color: "#374151" }}>{b.user_phone}</td>
                    <td style={{ padding: "14px 16px", fontSize: 12, fontWeight: 600 }}>{b.service_type || "—"}</td>
                    <td style={{ padding: "14px 16px", fontSize: 12, color:"#64748B" }}>{fmtDate(b.preferred_date)}</td>
                    <td style={{ padding: "14px 16px" }}><Badge variant={b.status}>{b.status === "new" ? "নতুন" : b.status === "accepted" ? "গৃহীত" : b.status === "completed" ? "সম্পন্ন" : "বাতিল"}</Badge></td>
                    <td style={{ padding: "14px 16px" }}>
                      {b.status === "new" && (
                        <div style={{ display: "flex", gap: 4 }}>
                          <button onClick={() => updateStatus(b.id, "accepted")} style={{ padding: "6px 12px", borderRadius: 7, fontSize: 12, fontWeight: 700, fontFamily: "inherit", cursor: "pointer", border: "none", background: G.g0, color: G.g6 }}>✓ গ্রহণ</button>
                          <button onClick={() => updateStatus(b.id, "cancelled")} style={{ padding: "6px 12px", borderRadius: 7, fontSize: 12, fontWeight: 700, fontFamily: "inherit", cursor: "pointer", border: "none", background: "#FEF2F2", color: "#DC2626" }}>✕ বাতিল</button>
                        </div>
                      )}
                      {b.status === "accepted" && (
                        <button onClick={() => updateStatus(b.id, "completed")} style={{ padding: "6px 12px", borderRadius: 7, fontSize: 12, fontWeight: 700, fontFamily: "inherit", cursor: "pointer", border: "none", background: "#EFF6FF", color: "#3B82F6" }}>সম্পন্ন করুন</button>
                      )}
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

  /* ── SCHEDULE PAGE ──────────────────────────────────────────────────── */
  const ScheduleView = () => (
    <div style={{ padding: isMobile ? 14 : 24, flex: 1 }}>
      <div style={{ marginBottom: 20 }}>
        <h2 style={{ fontSize: 20, fontWeight: 800, color: "#111827", margin: 0 }}>Today's Schedule</h2>
        <p style={{ fontSize: 13, color: "#6B7280", marginTop: 4 }}>March 21, 2026 · {TIMELINE.length} appointments</p>
      </div>
      <Card>
        <div style={{ padding: 20 }}>
          {TIMELINE.map((t, i) => (
            <div key={i} style={{ display: "flex", gap: 16, marginBottom: 16, alignItems: "flex-start" }}>
              <div style={{ display: "flex", flexDirection: "column", alignItems: "center", flexShrink: 0 }}>
                <div style={{ width: 12, height: 12, borderRadius: "50%", background: t.urgent ? "#EF4444" : t.filled ? G.g4 : "#E2E8F0", marginTop: 4 }} />
                {i < TIMELINE.length - 1 && <div style={{ width: 2, height: 40, background: "#E2E8F0", marginTop: 4 }} />}
              </div>
              <div style={{ flex: 1, background: t.urgent ? "#FEF2F2" : "#F8FAF9", borderRadius: 12, padding: "12px 14px", border: `1px solid ${t.urgent ? "#FECACA" : "#E2E8F0"}` }}>
                <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}>
                  <span style={{ fontSize: 11, fontWeight: 800, color: t.urgent ? "#EF4444" : G.g6, background: t.urgent ? "#FEF2F2" : G.g0, padding: "3px 9px", borderRadius: 6, border: `1px solid ${t.urgent ? "#FECACA" : G.g1}` }}>{t.time}</span>
                  {t.urgent && <span style={{ fontSize: 10, fontWeight: 700, color: "#EF4444" }}>🚨 URGENT</span>}
                  {t.filled && !t.urgent && <span style={{ fontSize: 10, color: G.g4 }}>✓ Confirmed</span>}
                </div>
                <div style={{ fontSize: 13, fontWeight: 700, color: "#111827" }}>{t.name}</div>
                <div style={{ fontSize: 11, color: "#6B7280", marginTop: 2 }}>{t.detail}</div>
              </div>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );

  /* ── EARNINGS PAGE ──────────────────────────────────────────────────── */
  const EarningsView = () => (
    <div style={{ padding: isMobile ? 14 : 24, flex: 1 }}>
      <div style={{ marginBottom: 20 }}>
        <h2 style={{ fontSize: 20, fontWeight: 800, color: "#111827", margin: 0 }}>Earnings</h2>
        <p style={{ fontSize: 13, color: "#6B7280", marginTop: 4 }}>This week's financial overview</p>
      </div>
      <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr 1fr" : "repeat(3,1fr)", gap: 14, marginBottom: 18 }}>
        {[
          { label: "Total Revenue", val: `৳${totalRevenue.toLocaleString()}`, sub: "From paid bookings", color: G.g5 },
          { label: "Pending Payments", val: `৳${(bookings.filter(b => b.status === "accepted" && b.payment_status !== "paid").length * 500).toLocaleString()}`, sub: "To be collected", color: "#3B82F6" },
          { label: "Avg Per Patient", val: `৳${avgPerPatient}`, sub: "Average revenue",  color: "#8B5CF6" },
        ].map(m => (
          <Card key={m.label} style={{ padding: 20 }}>
            <div style={{ fontSize: 11, color: "#6B7280", fontWeight: 600, textTransform: "uppercase", letterSpacing: ".4px", marginBottom: 10 }}>{m.label}</div>
            <div style={{ fontSize: 26, fontWeight: 800, color: m.color, marginBottom: 4 }}>{m.val}</div>
            <div style={{ fontSize: 11, color: G.g6, fontWeight: 600 }}>{m.sub}</div>
          </Card>
        ))}
      </div>
      <Card>
        <CardHead><CardTitle>Weekly Earnings Breakdown</CardTitle></CardHead>
        <div style={{ padding: 20 }}>
          <div style={{ display: "flex", alignItems: "flex-end", gap: 8, height: 120, marginBottom: 14 }}>
            {EARNINGS_BARS.map(b => (
              <div key={b.label} style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: 4 }}>
                <div style={{ fontSize: 10, fontWeight: b.peak ? 800 : 400, color: b.peak ? G.g5 : "#9CA3AF" }}>{b.val}</div>
                <div style={{ width: "100%", height: `${b.pct}%`, borderRadius: "5px 5px 0 0", background: b.peak ? G.g4 : G.g1, transition: "height .3s" }} />
                <div style={{ fontSize: 10, color: "#6B7280", fontWeight: b.peak ? 700 : 400 }}>{b.label}</div>
              </div>
            ))}
          </div>
        </div>
      </Card>
    </div>
  );

  /* ── Render nav content ──────────────────────────────────────────────── */
  function renderContent() {
    switch (nav) {
      case "overview":  return <OverviewView />;
      case "bookings":  return <BookingsView />;
      case "schedule":  return <ScheduleView />;
      case "earnings":  return <EarningsView />;
      default: return <ComingSoon label={NAV_GROUPS.flatMap(g => g.items).find(i => i.id === nav)?.label ?? nav} />;
    }
  }

  const currentLabel = NAV_GROUPS.flatMap(g => g.items).find(i => i.id === nav)?.label ?? "Overview";

  /* ── Main layout ─────────────────────────────────────────────────────── */
  return (
    <div style={{ display: "flex", minHeight: "100vh", fontFamily: "'Plus Jakarta Sans',sans-serif", background: "#F8FAF9" }}>
      {/* Mobile overlay */}
      {isMobile && sideOpen && (
        <div onClick={() => setSideOpen(false)}
          style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,.45)", zIndex: 55, backdropFilter: "blur(2px)" }} />
      )}

      {SidebarEl}

      <div style={{ marginLeft: isMobile ? 0 : SIDEBAR_W, flex: 1, display: "flex", flexDirection: "column", minWidth: 0 }}>
        {/* Topbar */}
        <div style={{ height: 54, background: "#fff", borderBottom: "1px solid #E2E8F0", display: "flex", alignItems: "center", padding: "0 18px", gap: 12, position: "sticky", top: 0, zIndex: 40 }}>
          {isMobile && (
            <button onClick={() => setSideOpen(true)} style={{ background: "none", border: "none", cursor: "pointer", color: "#111827", display: "flex", alignItems: "center", padding: 4 }}>
              <Menu size={22} />
            </button>
          )}
          {isMobile && (
            <div style={{ display: "flex", alignItems: "center" }}>
              <img src="/daktarsab-logo.png" alt="DaktarSab" style={{ height: 28, objectFit: "contain" }} />
            </div>
          )}
          <div style={{ flex: 1, fontSize: 14, fontWeight: 700, color: "#111827" }}>
            {isMobile ? currentLabel : `Partner Dashboard — ${partnerProfile?.name || "Welcome"}`}
          </div>
          {!isMobile && (
            <input placeholder="🔍 Search bookings..." style={{ background: "#F8FAF9", border: "1px solid #E2E8F0", borderRadius: 10, padding: "7px 14px", fontSize: 12, fontFamily: "inherit", color: "#111827", outline: "none", width: 200 }} />
          )}
          <div style={{ width: 34, height: 34, borderRadius: 10, background: "#F8FAF9", border: "1px solid #E2E8F0", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", fontSize: 15, position: "relative", flexShrink: 0 }}>
            🔔<span style={{ position: "absolute", top: 6, right: 6, width: 7, height: 7, background: "#EF4444", borderRadius: "50%", border: "2px solid #fff" }} />
          </div>
        </div>

        {/* Scrollable content */}
        <div style={{ flex: 1, overflowY: "auto", display: "flex", flexDirection: "column" }}>
          {renderContent()}
        </div>
      </div>
    </div>
  );
}
