/**
 * Doctor Saab Admin Dashboard
 * Route: /kazi
 * ✅ PRODUCTION: Real Supabase Auth + profiles.role = 'admin' guard
 * ✅ Partner Approvals tab — approve/reject pending doctor applications
 * ✅ Leads tab — view bookings & lead data
 * ✅ Billing tab — per-partner revenue ledger
 */
import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
    TrendingUp, Users, Building2, Stethoscope, ShieldCheck,
    LogOut, Eye, EyeOff, BarChart3, MapPin, Phone, UserPlus, AlertTriangle,
    CalendarDays, Clock, RefreshCw, CheckCircle2, Mail, Lock, UserCheck, XCircle
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { supabase } from "@/integrations/supabase/client";
import { notifyBookingUpdate, notifyPartnerStatusUpdate } from "@/lib/notificationService";
import { LEAD_REVENUE_BDT } from "@/lib/leadTracking";
import Logo from "@/components/Logo";
import "@/styles/admin.css";

const PARTNER_LABELS: Record<string, string> = {
    "all": "সব",
    "specialist_doctor": "স্পেশালিস্ট ডাক্তার",
    "intern_doctor": "ইন্টার্ন ডাক্তার",
    "clinic": "ক্লিনিক / ল্যাব",
    "ambulance": "অ্যাম্বুলেন্স",
    "blood_bank": "ব্লাড ব্যাংক",
    "register": "নিবন্ধন"
};

interface BookingRequest {
    id: string;
    user_name: string;
    user_phone: string;
    service_type: string;
    provider_name: string;
    preferred_date: string | null;
    preferred_time: string | null;
    notes: string | null;
    status: string;
    created_at: string;
}

interface LeadRow {
    id: string;
    type: string;
    doctor_name: string | null;
    hospital_name: string | null;
    district: string | null;
    specialty: string | null;
    partner_type: string | null;
    created_at: string;
    patient_name?: string | null;
    phone?: string | null;
    status?: string | null;
    symptom?: string | null;
    condition?: string | null;
    assigned_partner?: string | null;
    source?: string | null;
}

interface PartnerApplication {
    id: string;
    created_at: string;
    name: string;
    email: string;
    phone: string;
    bmdc_no: string;
    specialty: string | null;
    degrees: string | null;
    experience_years: number | null;
    district: string | null;
    division: string | null;
    fee_in_person: number | null;
    hospital_name: string | null;
    status: string;
    admin_notes: string | null;
}

interface Stats {
    total: number;
    appointments: number;
    calls: number;
    labTests: number;
    directions: number;
    successfulLeads: number;
    topDistricts: { district: string; count: number }[];
    topSpecialties: { specialty: string; count: number }[];
    recentLeads: LeadRow[];
}

function StatCard({ icon: Icon, label, value, sub, color }: {
    icon: React.ElementType; label: string; value: string; sub?: string; color: string;
}) {
    return (
        <Card className="border-border/60">
            <CardContent className="flex items-center gap-3 p-4">
                <div className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl ${color}`}>
                    <Icon className="h-5 w-5" />
                </div>
                <div>
                    <p className="text-xs text-muted-foreground">{label}</p>
                    <p className="text-xl font-bold text-foreground">{value}</p>
                    {sub && <p className="text-[10px] text-muted-foreground">{sub}</p>}
                </div>
            </CardContent>
        </Card>
    );
}

export default function AdminDashboard() {
    const [email, setEmail] = useState("");
    const [pass, setPass] = useState("");
    const [showPass, setShowPass] = useState(false);
    const [auth, setAuth] = useState(false);
    const [authLoading, setAuthLoading] = useState(false);
    const [checkingRole, setCheckingRole] = useState(true);
    const [isAdmin, setIsAdmin] = useState(false);
    const [stats, setStats] = useState<Stats | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [activeTab, setActiveTab] = useState<"leads" | "bookings" | "billing" | "approvals">("leads");
    const [searchQuery, setSearchQuery] = useState("");

    // ── Check session on mount ─────────────────────────────────────────
    useEffect(() => {
        const checkSession = async () => {
            setCheckingRole(true);
            const { data: { session } } = await supabase.auth.getSession();
            if (session?.user) {
                await verifyAdminRole(session.user.id);
            } else {
                setCheckingRole(false);
            }
        };
        checkSession();
    }, []);

    async function verifyAdminRole(userId: string) {
        try {
            const { data } = await (supabase as any)
                .from("profiles")
                .select("role")
                .eq("user_id", userId)
                .maybeSingle();
            if (data?.role === "admin") {
                setIsAdmin(true);
                setAuth(true);
            } else {
                setIsAdmin(false);
                setAuth(true); // logged in but not admin
            }
        } catch {
            setIsAdmin(false);
            setAuth(false);
        } finally {
            setCheckingRole(false);
        }
    }

    // Fetch data whenever auth + admin succeeds
    useEffect(() => {
        if (auth && isAdmin) {
            fetchStats();
            fetchBookings();
            fetchApplications();
        }
    }, [auth, isAdmin]);

    // Leads state
    const [allLeads, setAllLeads] = useState<LeadRow[]>([]);
    const [partnerFilter, setPartnerFilter] = useState<string>("all");

    // Bookings state
    const [bookings, setBookings] = useState<BookingRequest[]>([]);
    const [bookingsLoading, setBookingsLoading] = useState(false);
    const [updatingId, setUpdatingId] = useState<string | null>(null);

    // Partner Applications state
    const [applications, setApplications] = useState<PartnerApplication[]>([]);
    const [applicationsLoading, setApplicationsLoading] = useState(false);
    const [approvingId, setApprovingId] = useState<string | null>(null);

    async function fetchStats() {
        setLoading(true);
        setError("");
        try {
            const { data, error } = await (supabase as any)
                .from("leads")
                .select("*")
                .order("created_at", { ascending: false })
                .limit(500);
            if (error) throw error;
            setAllLeads((data as LeadRow[]) || []);
        } catch (err: unknown) {
            const msg = (err as Error)?.message || "unknown";
            setError(`ডেটা লোড ব্যর্থ: ${msg}`);
        } finally {
            setLoading(false);
        }
    }

    async function fetchBookings() {
        setBookingsLoading(true);
        try {
            const { data, error: dbErr } = await (supabase as any)
                .from("booking_requests")
                .select("*")
                .order("created_at", { ascending: false });
            if (dbErr) throw dbErr;
            setBookings((data as BookingRequest[]) || []);
        } catch (err: any) {
            console.warn("fetchBookings error:", err?.message);
        } finally {
            setBookingsLoading(false);
        }
    }

    async function fetchApplications() {
        setApplicationsLoading(true);
        try {
            const { data, error: dbErr } = await (supabase as any)
                .from("partner_registrations")
                .select("id, created_at, name, email, phone, bmdc_no, specialty, degrees, experience_years, district, division, fee_in_person, hospital_name, status, admin_notes")
                .order("created_at", { ascending: false });
            if (dbErr) throw dbErr;
            setApplications((data as PartnerApplication[]) || []);
        } catch (err: any) {
            console.warn("fetchApplications error:", err?.message);
        } finally {
            setApplicationsLoading(false);
        }
    }

    async function updateBookingStatus(id: string, status: string) {
        setUpdatingId(id);
        try {
            await (supabase as any).from("booking_requests").update({ status }).eq("id", id);
            const booking = bookings.find(b => b.id === id);
            setBookings(prev => prev.map(b => b.id === id ? { ...b, status } : b));
            // Fire-and-forget: send email notification to patient
            if (booking) {
                notifyBookingUpdate({
                    user_name: booking.user_name,
                    user_phone: booking.user_phone,
                    provider_name: booking.provider_name,
                    preferred_date: booking.preferred_date,
                    preferred_time: booking.preferred_time,
                    status,
                });
            }
        } catch { /* silent */ } finally {
            setUpdatingId(null);
        }
    }

    async function updateApplicationStatus(id: string, status: "approved" | "rejected", notes?: string) {
        setApprovingId(id);
        try {
            await (supabase as any)
                .from("partner_registrations")
                .update({ status, admin_notes: notes || null, reviewed_at: new Date().toISOString() })
                .eq("id", id);
            const app = applications.find(a => a.id === id);
            setApplications(prev => prev.map(a => a.id === id ? { ...a, status } : a));
            // Fire-and-forget: notify the partner/doctor of their application status
            if (app) {
                notifyPartnerStatusUpdate({
                    name: app.name,
                    email: app.email,
                    phone: app.phone,
                    specialty: app.specialty,
                    bmdc_no: app.bmdc_no,
                    district: app.district,
                    status,
                    admin_notes: notes || null,
                });
            }
        } catch (e: any) {
            setError("আপডেট ব্যর্থ: " + e?.message);
        } finally {
            setApprovingId(null);
        }
    }

    // Client-side aggregation
    const billingData = allLeads.reduce((acc, lead) => {
        if (lead.assigned_partner) {
            acc[lead.assigned_partner] = (acc[lead.assigned_partner] || 0) + 1;
        }
        return acc;
    }, {} as Record<string, number>);

    async function assignPartner(leadId: string, partner: string) {
        setUpdatingId(leadId + "_assign");
        try {
            await (supabase as any).from("leads").update({ assigned_partner: partner }).eq("id", leadId);
            setAllLeads(prev => prev.map(l => l.id === leadId ? { ...l, assigned_partner: partner } : l));
        } catch (e: any) {
            setError("পার্টনার অ্যাসাইন করতে সমস্যা হয়েছে: " + e?.message);
        } finally {
            setUpdatingId(null);
        }
    }

    useEffect(() => {
        const rows = partnerFilter === "all"
            ? allLeads
            : allLeads.filter(r => r.partner_type === partnerFilter);

        const districtMap: Record<string, number> = {};
        const specialtyMap: Record<string, number> = {};
        rows.forEach(r => {
            if (r.district) districtMap[r.district] = (districtMap[r.district] || 0) + 1;
            if (r.specialty) specialtyMap[r.specialty] = (specialtyMap[r.specialty] || 0) + 1;
        });

        setStats({
            total: rows.length,
            appointments: rows.filter(r => r.type === "appointment").length,
            calls: rows.filter(r => r.type === "call").length,
            labTests: rows.filter(r => r.type === "lab_test").length,
            directions: rows.filter(r => r.type === "direction").length,
            successfulLeads: rows.filter(r => r.status && r.status !== 'pending' && r.status !== 'rejected').length || rows.length,
            topDistricts: Object.entries(districtMap).sort((a, b) => b[1] - a[1]).slice(0, 5).map(([district, count]) => ({ district, count })),
            topSpecialties: Object.entries(specialtyMap).sort((a, b) => b[1] - a[1]).slice(0, 5).map(([specialty, count]) => ({ specialty, count })),
            recentLeads: rows.slice(0, 10),
        });
    }, [allLeads, partnerFilter]);

    async function handleLogin(e: React.FormEvent) {
        e.preventDefault();
        setAuthLoading(true);
        setError("");
        try {
            const { data, error: authErr } = await supabase.auth.signInWithPassword({
                email: email.trim(),
                password: pass,
            });
            if (authErr) throw authErr;
            await verifyAdminRole(data.user.id);
        } catch (err: any) {
            setError(err?.message || "লগইন ব্যর্থ হয়েছে।");
        } finally {
            setAuthLoading(false);
        }
    }

    async function handleLogout() {
        await supabase.auth.signOut();
        setAuth(false);
        setIsAdmin(false);
        setEmail("");
        setPass("");
    }

    // ── Loading / role check ───────────────────────────────────────────
    if (checkingRole) return (
        <div className="flex h-screen items-center justify-center bg-background">
            <div className="flex flex-col items-center gap-3">
                <Logo className="h-12 animate-pulse" />
                <p className="text-sm text-muted-foreground">অনুমতি যাচাই করা হচ্ছে...</p>
            </div>
        </div>
    );

    // ── Access denied (logged in but not admin) ────────────────────────
    if (auth && !isAdmin) return (
        <div className="flex h-screen flex-col items-center justify-center bg-background gap-4">
            <Logo className="h-12" />
            <div className="text-center space-y-2">
                <p className="text-xl font-bold text-destructive">অ্যাক্সেস অনুমোদিত নয়</p>
                <p className="text-sm text-muted-foreground">
                    এই পেইজটি শুধুমাত্র Admin রোলের জন্য।<br />
                    আপনার একাউন্টে <code className="bg-muted px-1 rounded">role = 'admin'</code> সেট করা নেই।
                </p>
            </div>
            <Button variant="outline" onClick={handleLogout}>অন্য একাউন্ট দিয়ে লগইন করুন</Button>
        </div>
    );

    // ── Login screen ──────────────────────────────────────────────────────────
    if (!auth) return (
        <div className="flex h-screen flex-col items-center justify-center bg-background px-4">
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
                className="w-full max-w-sm space-y-5">
                <div className="text-center space-y-2">
                    <Logo className="h-14 mx-auto mb-2" />
                    <h1 className="text-xl font-bold">অ্যাডমিন প্যানেল</h1>
                    <p className="text-sm text-muted-foreground">ডাক্তার সাব — Super Admin Portal</p>
                </div>
                <form onSubmit={handleLogin} className="space-y-3">
                    <div className="relative">
                        <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                        <Input
                            type="email"
                            placeholder="admin@daktarsab.com"
                            value={email}
                            onChange={e => setEmail(e.target.value)}
                            className="pl-9"
                            required
                        />
                    </div>
                    <div className="relative">
                        <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                        <Input
                            type={showPass ? "text" : "password"}
                            placeholder="পাসওয়ার্ড"
                            value={pass}
                            onChange={e => setPass(e.target.value)}
                            className="pl-9 pr-10"
                            required
                        />
                        <button type="button" className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground"
                            onClick={() => setShowPass(s => !s)}>
                            {showPass ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                        </button>
                    </div>
                    {error && <p className="text-xs text-destructive bg-destructive/10 p-2 rounded">{error}</p>}
                    <Button type="submit" className="w-full" disabled={authLoading}>
                        {authLoading ? "লগইন করা হচ্ছে..." : "প্রবেশ করুন →"}
                    </Button>
                </form>
                <p className="text-center text-[11px] text-muted-foreground">
                    ⚠️ এই পেইজটি শুধুমাত্র <code>role = 'admin'</code> একাউন্টের জন্য।
                </p>
            </motion.div>
        </div>
    );

    // ── Dashboard ─────────────────────────────────────────────────────────────
    const pendingApps = applications.filter(a => a.status === "pending");

    return (
        <div className="admin-root">
            {/* SIDEBAR */}
            <aside className="sidebar">
                <div className="px-6 py-4 border-b border-border/10">
                    <Logo className="h-10" />
                </div>
                <nav className="sb-nav">
                    <div className="sb-section">Overview</div>
                    <div className={`sb-item ${activeTab === 'leads' ? 'active' : ''}`} onClick={() => setActiveTab('leads')}><span className="sb-icon">📊</span>Dashboard</div>
                    <div className={`sb-item ${activeTab === 'bookings' ? 'active' : ''}`} onClick={() => { setActiveTab('bookings'); if (bookings.length === 0) fetchBookings(); }}><span className="sb-icon">📋</span>Bookings {bookings.filter(b => b.status === "new").length > 0 && <span className="sb-badge">{bookings.filter(b => b.status === "new").length}</span>}</div>

                    <div className="sb-section">Management</div>
                    <div className={`sb-item ${activeTab === 'approvals' ? 'active' : ''}`} onClick={() => { setActiveTab('approvals'); fetchApplications(); }}>
                        <span className="sb-icon">🩺</span>Partner Approvals
                        {pendingApps.length > 0 && <span className="sb-badge">{pendingApps.length}</span>}
                    </div>
                    <div className={`sb-item ${activeTab === 'billing' ? 'active' : ''}`} onClick={() => setActiveTab('billing')}><span className="sb-icon">🤝</span>Partners (Billing)</div>

                    <div className="sb-section">System</div>
                    <div className="sb-item" onClick={handleLogout}><span className="sb-icon">🔐</span>Log Out</div>
                </nav>
                <div className="sb-footer">
                    <div className="sb-user">
                        <div className="sb-user-av">A</div>
                        <div><div className="sb-user-name">Admin Panel</div><div className="sb-user-role">Super Admin</div></div>
                    </div>
                </div>
            </aside>

            {/* MAIN */}
            <div className="main">
                <div className="topbar">
                    <div className="topbar-title">Admin Dashboard</div>
                    <input className="topbar-search" placeholder="🔍 Search doctors, hospitals, patients..." value={searchQuery} onChange={e => setSearchQuery(e.target.value)} />
                    <div className="topbar-actions">
                        <div className="icon-btn">🔔<span className="notif-dot"></span></div>
                    </div>
                </div>

                <div className="body">
                    {/* LEADS (DASHBOARD) TAB */}
                    {activeTab === "leads" && (
                        <>
                            {/* Filter Chips */}
                            <div style={{ display: "flex", gap: "8px", marginBottom: "20px", overflowX: "auto", paddingBottom: "4px" }}>
                                {["all", "specialist_doctor", "intern_doctor", "clinic", "ambulance", "blood_bank"].map(f => (
                                    <button
                                        key={f}
                                        onClick={() => setPartnerFilter(f)}
                                        className={`badge ${partnerFilter === f ? 'green' : 'gray'}`}
                                        style={{ cursor: "pointer", padding: "6px 14px", fontSize: "12px" }}
                                    >
                                        {PARTNER_LABELS[f] || f}
                                    </button>
                                ))}
                                <button className="btn btn-ghost-sm" onClick={fetchStats} disabled={loading}>{loading ? '...' : 'Refresh'}</button>
                            </div>

                            {/* METRICS */}
                            <div className="metrics-grid">
                                <div className="metric-card">
                                    <div className="metric-header"><span className="metric-label">Total Leads</span><div className="metric-icon mi-green">📊</div></div>
                                    <div className="metric-val">{stats?.total || 0}</div>
                                    <div className="metric-change up">{(stats?.total || 0) * 200} BDT Est. Revenue</div>
                                </div>
                                <div className="metric-card">
                                    <div className="metric-header"><span className="metric-label">Appointments</span><div className="metric-icon mi-blue">📅</div></div>
                                    <div className="metric-val">{stats?.appointments || 0}</div>
                                </div>
                                <div className="metric-card">
                                    <div className="metric-header"><span className="metric-label">Call Leads</span><div className="metric-icon mi-teal">📞</div></div>
                                    <div className="metric-val">{stats?.calls || 0}</div>
                                </div>
                                <div className="metric-card">
                                    <div className="metric-header"><span className="metric-label">Successful Matches</span><div className="metric-icon mi-amber">✅</div></div>
                                    <div className="metric-val">{stats?.successfulLeads || 0}</div>
                                </div>
                            </div>

                            <div className="content-grid three" style={{ marginBottom: "20px" }}>
                                <div className="card">
                                    <div className="card-header"><span className="card-title">Top Districts</span></div>
                                    <div className="card-body">
                                        <table className="data-table">
                                            <thead><tr><th>District</th><th>Lead Count</th></tr></thead>
                                            <tbody>
                                                {stats?.topDistricts.map(d => (
                                                    <tr key={d.district}>
                                                        <td className="font-semibold">{d.district}</td>
                                                        <td><span className="badge blue">{d.count} Leads</span></td>
                                                    </tr>
                                                ))}
                                                {!stats?.topDistricts.length && <tr><td colSpan={2}>No data</td></tr>}
                                            </tbody>
                                        </table>
                                    </div>
                                </div>

                                <div className="card">
                                    <div className="card-header"><span className="card-title">Live Activity</span><span className="badge green">● Live</span></div>
                                    <div className="card-body" style={{ padding: "8px 16px" }}>
                                        <div className="activity-list">
                                            {stats?.recentLeads.slice(0, 4).map(l => (
                                                <div className="activity-item" key={l.id}>
                                                    <div className="activity-icon mi-blue">ℹ️</div>
                                                    <div className="activity-body">
                                                        <div className="activity-title">New Lead — <strong>{l.doctor_name || l.hospital_name || l.condition || "Query"}</strong></div>
                                                        <div className="activity-time">{new Date(l.created_at).toLocaleTimeString()} · {l.district || "Unknown Region"}</div>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="card" style={{ marginBottom: "20px" }}>
                                <div className="card-header"><span className="card-title">Recent Leads Log</span></div>
                                <div style={{ overflowX: "auto" }}>
                                    <table className="data-table">
                                        <thead>
                                            <tr>
                                                <th>Date</th><th>Patient</th><th>Inquiry/Symptom</th>
                                                <th>Target Partner</th><th>Assignment</th><th>Location</th><th>Status</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {(searchQuery ? stats?.recentLeads.filter(l => {
                                                const q = searchQuery.toLowerCase();
                                                return (l.patient_name || "").toLowerCase().includes(q) || (l.phone || "").includes(q) || (l.doctor_name || "").toLowerCase().includes(q) || (l.hospital_name || "").toLowerCase().includes(q) || (l.district || "").toLowerCase().includes(q) || (l.condition || "").toLowerCase().includes(q);
                                            }) : stats?.recentLeads)?.map(l => (
                                                <tr key={l.id}>
                                                    <td style={{ color: "var(--text3)", fontSize: "12px" }}>{new Date(l.created_at).toLocaleDateString()}</td>
                                                    <td><div className="td-name">{l.patient_name || "Guest"}</div><div className="td-sub">{l.phone || "—"}</div></td>
                                                    <td><div className="td-name">{l.condition || "General"}</div><div className="td-sub">{l.symptom || "—"}</div></td>
                                                    <td><div className="td-name">{l.doctor_name || l.hospital_name || "—"}</div><div className="td-sub">{l.specialty || ""}</div></td>
                                                    <td>
                                                        <div style={{ display: "flex", gap: "6px", alignItems: "center" }}>
                                                            {l.assigned_partner ? <span className="badge green">{l.assigned_partner}</span> : <span className="badge gray">Unassigned</span>}
                                                            <button className="btn btn-ghost-sm" style={{ padding: "2px 6px", fontSize: "10px" }} onClick={() => {
                                                                const partner = prompt("Assign partner:", l.assigned_partner || "");
                                                                if (partner !== null) assignPartner(l.id, partner.trim());
                                                            }}>Edit</button>
                                                        </div>
                                                    </td>
                                                    <td>{l.district || "—"}</td>
                                                    <td><span className={`badge ${l.status === 'Converted' ? 'green' : 'amber'}`}>{l.status || "Pending"}</span></td>
                                                </tr>
                                            ))}
                                            {!stats?.recentLeads.length && <tr><td colSpan={7}>No leads found.</td></tr>}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        </>
                    )}

                    {/* BOOKINGS TAB */}
                    {activeTab === "bookings" && (
                        <div className="card" style={{ marginBottom: "20px" }}>
                            <div className="card-header">
                                <span className="card-title">Booking Requests</span>
                                <div style={{ display: "flex", gap: "8px" }}>
                                    <button className="btn btn-ghost-sm" onClick={fetchBookings}>Refresh</button>
                                </div>
                            </div>
                            <div style={{ overflowX: "auto" }}>
                                <table className="data-table">
                                    <thead>
                                        <tr>
                                            <th>Date</th><th>Patient</th><th>Service</th>
                                            <th>Provider</th><th>Status</th><th>Time Slot</th><th>Action</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {(searchQuery ? bookings.filter(b => {
                                            const q = searchQuery.toLowerCase();
                                            return b.user_name.toLowerCase().includes(q) || b.user_phone.includes(q) || b.provider_name.toLowerCase().includes(q) || b.service_type.toLowerCase().includes(q);
                                        }) : bookings).map(b => (
                                            <tr key={b.id}>
                                                <td style={{ color: "var(--text3)", fontSize: "12px" }}>{new Date(b.created_at).toLocaleDateString()}</td>
                                                <td><div className="td-name">{b.user_name}</div><div className="td-sub">{b.user_phone}</div></td>
                                                <td>{b.service_type}</td>
                                                <td>{b.provider_name}</td>
                                                <td>
                                                    <Select
                                                        value={b.status}
                                                        onValueChange={(v) => updateBookingStatus(b.id, v)}
                                                        disabled={updatingId === b.id}
                                                    >
                                                        <SelectTrigger className="h-7 w-32 text-xs" style={{ background: "var(--surface2)", border: "1px solid var(--border)", color: "var(--text)", outline: "none" }}>
                                                            <SelectValue />
                                                        </SelectTrigger>
                                                        <SelectContent>
                                                            <SelectItem value="new">New</SelectItem>
                                                            <SelectItem value="contacted">Contacted</SelectItem>
                                                            <SelectItem value="confirmed">Confirmed</SelectItem>
                                                            <SelectItem value="closed">Closed</SelectItem>
                                                        </SelectContent>
                                                    </Select>
                                                </td>
                                                <td style={{ color: "var(--text3)", fontSize: "12px" }}>
                                                    {b.preferred_date || "—"} {b.preferred_time || ""}
                                                </td>
                                                <td>
                                                    <button className="btn btn-ghost-sm">Details</button>
                                                </td>
                                            </tr>
                                        ))}
                                        {!bookings.length && <tr><td colSpan={7}>No bookings found.</td></tr>}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    )}

                    {/* PARTNER APPROVALS TAB */}
                    {activeTab === "approvals" && (
                        <div className="card" style={{ marginBottom: "20px" }}>
                            <div className="card-header">
                                <span className="card-title">Partner / Doctor Applications</span>
                                <div style={{ display: "flex", gap: "8px", alignItems: "center" }}>
                                    {pendingApps.length > 0 && <span className="badge amber">{pendingApps.length} Pending</span>}
                                    <button className="btn btn-ghost-sm" onClick={fetchApplications} disabled={applicationsLoading}>
                                        {applicationsLoading ? "..." : "Refresh"}
                                    </button>
                                </div>
                            </div>
                            <div style={{ overflowX: "auto" }}>
                                <table className="data-table">
                                    <thead>
                                        <tr>
                                            <th>Applied</th><th>Doctor</th><th>Specialty</th>
                                            <th>Location</th><th>Fee</th><th>Status</th><th>Action</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {(searchQuery ? applications.filter(a => {
                                            const q = searchQuery.toLowerCase();
                                            return a.name.toLowerCase().includes(q) || a.email.toLowerCase().includes(q) || a.phone.includes(q) || (a.specialty || "").toLowerCase().includes(q) || (a.district || "").toLowerCase().includes(q);
                                        }) : applications).map(a => (
                                            <tr key={a.id}>
                                                <td style={{ color: "var(--text3)", fontSize: "12px" }}>
                                                    {new Date(a.created_at).toLocaleDateString()}
                                                </td>
                                                <td>
                                                    <div className="td-name">{a.name}</div>
                                                    <div className="td-sub">{a.email}</div>
                                                    <div className="td-sub">{a.phone}</div>
                                                </td>
                                                <td>
                                                    <div className="td-name">{a.specialty || "—"}</div>
                                                    <div className="td-sub">{a.degrees || "—"}</div>
                                                    <div className="td-sub">BMDC: {a.bmdc_no}</div>
                                                </td>
                                                <td>{a.district || "—"}, {a.division || ""}</td>
                                                <td>৳{a.fee_in_person || 0}</td>
                                                <td>
                                                    <span className={`badge ${a.status === 'approved' ? 'green' : a.status === 'rejected' ? 'red' : 'amber'}`}>
                                                        {a.status === 'approved' ? 'অনুমোদিত' : a.status === 'rejected' ? 'প্রত্যাখ্যাত' : 'অপেক্ষমাণ'}
                                                    </span>
                                                </td>
                                                <td>
                                                    {a.status === "pending" && (
                                                        <div style={{ display: "flex", gap: "6px" }}>
                                                            <button
                                                                className="btn btn-ghost-sm"
                                                                style={{ background: "var(--g0)", color: "var(--g6)", border: "1px solid var(--g2)" }}
                                                                disabled={approvingId === a.id}
                                                                onClick={() => updateApplicationStatus(a.id, "approved")}
                                                            >
                                                                {approvingId === a.id ? "..." : "✓ অনুমোদন"}
                                                            </button>
                                                            <button
                                                                className="btn btn-ghost-sm"
                                                                style={{ background: "#FEF2F2", color: "#DC2626", border: "1px solid #FECACA" }}
                                                                disabled={approvingId === a.id}
                                                                onClick={() => {
                                                                    const note = prompt("Rejection reason (optional):", "");
                                                                    updateApplicationStatus(a.id, "rejected", note || undefined);
                                                                }}
                                                            >
                                                                ✕ প্রত্যাখ্যান
                                                            </button>
                                                        </div>
                                                    )}
                                                    {a.status !== "pending" && (
                                                        <span style={{ fontSize: "11px", color: "var(--text3)" }}>
                                                            {a.admin_notes || "No notes"}
                                                        </span>
                                                    )}
                                                </td>
                                            </tr>
                                        ))}
                                        {!applications.length && (
                                            <tr><td colSpan={7} style={{ textAlign: "center", padding: "24px", color: "var(--text3)" }}>কোনো আবেদন নেই।</td></tr>
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    )}

                    {/* BILLING TAB */}
                    {activeTab === "billing" && (
                        <div className="card" style={{ marginBottom: "20px" }}>
                            <div className="card-header">
                                <span className="card-title">Partner Billing Ledger</span>
                                <span className="badge amber">200 BDT per lead</span>
                            </div>
                            <div style={{ overflowX: "auto" }}>
                                <table className="data-table">
                                    <thead>
                                        <tr>
                                            <th>Partner Name</th><th>Total Leads</th><th>Total Due (BDT)</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {Object.entries(billingData).map(([partner, count]) => (
                                            <tr key={partner}>
                                                <td><div className="td-name">{partner}</div></td>
                                                <td>{count}</td>
                                                <td style={{ color: "var(--green-bright)", fontWeight: "700" }}>৳{(count * 200).toLocaleString("bn-BD")}</td>
                                            </tr>
                                        ))}
                                        {Object.keys(billingData).length === 0 && (
                                            <tr><td colSpan={3}>No billing data found. Assign partners to leads to track revenue.</td></tr>
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
