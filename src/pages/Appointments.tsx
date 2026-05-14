/**
 * Appointments.tsx — Live data from Supabase booking_requests table
 * Shows the logged-in user's own booking history, filterable by status.
 */
import { Plus, AlertTriangle, Calendar, Video, Clock, Loader2, RefreshCw, Stethoscope, Building2, FlaskConical, Ambulance, Star, Video as VideoIcon } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import ReviewForm from "@/components/dashboard/ReviewForm";
import VideoChamber from "@/components/dashboard/VideoChamber";
import PaymentGateway from "@/components/dashboard/PaymentGateway";

/* ── Types ─────────────────────────────────────────────────────────── */
interface Booking {
  id: string;
  created_at: string;
  service_type: string;
  provider_name: string;
  provider_id: string;
  user_name: string;
  user_phone: string;
  preferred_date: string | null;
  preferred_time: string | null;
  notes: string | null;
  status: string; // "new" | "accepted" | "completed" | "cancelled"
  meet_link?: string;
  payment_status?: string;
  consultation_fee?: number;
}

/* ── Status helpers ─────────────────────────────────────────────────── */
const STATUS_LABEL: Record<string, string> = {
  new:       "অপেক্ষমাণ",
  accepted:  "নিশ্চিত",
  completed: "সম্পন্ন",
  cancelled: "বাতিল",
};
const STATUS_STYLE: Record<string, { bg: string; text: string; border: string }> = {
  new:       { bg: "var(--amber0,#FFFBEB)", text: "var(--amber,#D97706)", border: "#FDE68A" },
  accepted:  { bg: "var(--g0,#EAF9F3)",    text: "var(--g6,#0d6b58)",    border: "#A7F3D0" },
  completed: { bg: "#F0FDF4",               text: "#16A34A",              border: "#BBF7D0" },
  cancelled: { bg: "var(--danger-soft,#FEF2F2)", text: "var(--danger,#DC2626)", border: "#FECACA" },
};
const SERVICE_ICON: Record<string, React.ReactNode> = {
  hospital:   <Building2 className="h-5 w-5" />,
  clinic:     <Stethoscope className="h-5 w-5" />,
  doctor:     <Stethoscope className="h-5 w-5" />,
  diagnostic: <FlaskConical className="h-5 w-5" />,
  ambulance:  <Ambulance className="h-5 w-5" />,
};
const SERVICE_LABEL: Record<string, string> = {
  hospital:   "হাসপাতাল",
  clinic:     "ক্লিনিক",
  doctor:     "ডাক্তার",
  diagnostic: "ডায়াগনস্টিক",
  ambulance:  "অ্যাম্বুলেন্স",
};

function formatDate(d: string | null): string {
  if (!d) return "—";
  try {
    return new Date(d).toLocaleDateString("bn-BD", { day: "numeric", month: "long", year: "numeric" });
  } catch { return d; }
}
function formatTime(t: string | null): string {
  if (!t) return "—";
  // HH:MM format → convert
  const [h, m] = t.split(":").map(Number);
  const ampm = h < 12 ? "AM" : "PM";
  const h12 = h % 12 || 12;
  return `${h12}:${String(m).padStart(2,"0")} ${ampm}`;
}
function relativeDate(iso: string): string {
  const diff = (Date.now() - new Date(iso).getTime()) / 1000;
  if (diff < 60)    return "এইমাত্র";
  if (diff < 3600)  return `${Math.floor(diff/60)} মিনিট আগে`;
  if (diff < 86400) return `${Math.floor(diff/3600)} ঘণ্টা আগে`;
  return `${Math.floor(diff/86400)} দিন আগে`;
}

/* ── Main component ─────────────────────────────────────────────────── */
export default function Appointments() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<"upcoming" | "completed" | "cancelled">("upcoming");
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError]   = useState("");
  const [reviewTarget, setReviewTarget] = useState<Booking | null>(null);
  const [activeCall, setActiveCall] = useState<Booking | null>(null);
  const [paymentTarget, setPaymentTarget] = useState<Booking | null>(null);

  /* ── Fetch from Supabase ─────────────────────────────────────────── */
  async function fetchBookings() {
    if (!user) { setLoading(false); return; }
    setLoading(true); setError("");
    try {
      const { data, error: dbErr } = await (supabase as any)
        .from("booking_requests")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });
      if (dbErr) throw dbErr;
      setBookings(data || []);
    } catch (e: any) {
      setError(e?.message || "ডেটা লোড করা যায়নি");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { fetchBookings(); }, [user]);

  /* ── Filter by tab ──────────────────────────────────────────────── */
  const displayed = bookings.filter(b => {
    if (activeTab === "upcoming")   return b.status === "new"  || b.status === "accepted";
    if (activeTab === "completed")  return b.status === "completed";
    if (activeTab === "cancelled")  return b.status === "cancelled";
    return true;
  });

  const upcomingCount  = bookings.filter(b => b.status === "new" || b.status === "accepted").length;
  const completedCount = bookings.filter(b => b.status === "completed").length;
  const cancelledCount = bookings.filter(b => b.status === "cancelled").length;

  /* ── Cancel a booking ───────────────────────────────────────────── */
  async function handleCancel(id: string) {
    const { error: dbErr } = await (supabase as any)
      .from("booking_requests")
      .update({ status: "cancelled" })
      .eq("id", id)
      .eq("user_id", user?.id);
    if (!dbErr) setBookings(p => p.map(b => b.id === id ? { ...b, status: "cancelled" } : b));
  }

  const TAB_LABELS = [
    { id: "upcoming",   label: "আসন্ন",   count: upcomingCount  },
    { id: "completed",  label: "সম্পন্ন", count: completedCount },
    { id: "cancelled",  label: "বাতিল",   count: cancelledCount },
  ];

  return (
    <div className="patient-screen active bg-[var(--bg)]" id="sc-appointments">
      {/* Topbar */}
      <div className="topbar bg-[var(--white)] shadow-[0_1px_0_rgba(0,0,0,0.05)] pt-safe px-4 pb-2">
        <div className="flex items-center justify-between w-full pt-2">
          <span className="tb-title text-base font-bold text-[var(--ink)]">আমার বুকিং</span>
          <button onClick={fetchBookings} className="tb-icon-btn light h-8 w-8 !bg-[var(--g0)] !text-[var(--g7)]">
            <RefreshCw className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center px-4 pt-4 pb-2 gap-2 overflow-x-auto no-scrollbar bg-[var(--white)] shadow-[0_4px_12px_rgba(0,0,0,0.03)] z-10">
        {TAB_LABELS.map(t => (
          <div
            key={t.id}
            className={`flex items-center gap-1.5 px-4 py-2 text-[13px] font-bold rounded-full whitespace-nowrap cursor-pointer transition-all ${activeTab === t.id ? "bg-[var(--g8)] text-white shadow-sm" : "bg-[var(--g0)] text-[var(--g6)]"}`}
            onClick={() => setActiveTab(t.id as typeof activeTab)}
          >
            {t.label}
            {t.count > 0 && (
              <span style={{ background: activeTab === t.id ? "rgba(255,255,255,.25)" : "var(--g5)", color: "#fff", fontSize: 10, fontWeight: 800, borderRadius: 10, padding: "1px 7px" }}>
                {t.count}
              </span>
            )}
          </div>
        ))}
      </div>

      {/* Content */}
      <div className="scroll-body flex-1 overflow-y-auto p-4 space-y-3 pb-24">
        {/* Loading */}
        {loading && (
          <div className="flex flex-col items-center justify-center py-24 gap-3">
            <Loader2 className="h-8 w-8 animate-spin text-[var(--g6)]" />
            <p className="text-[13px] text-[var(--ink3)]">লোড হচ্ছে...</p>
          </div>
        )}

        {/* Error */}
        {!loading && error && (
          <div className="flex flex-col items-center justify-center py-16 gap-3 text-center">
            <div className="text-4xl">⚠️</div>
            <p className="text-[13px] font-bold text-red-600">{error}</p>
            <button
              onClick={fetchBookings}
              className="mt-2 px-5 py-2 rounded-xl bg-[var(--g8)] text-white text-[13px] font-bold"
            >আবার চেষ্টা করুন</button>
          </div>
        )}

        {/* Not logged in */}
        {!loading && !error && !user && (
          <div className="flex flex-col items-center justify-center py-20 gap-3 text-center">
            <div className="text-5xl">🔐</div>
            <p className="text-[14px] font-bold text-[var(--ink)]">লগইন করুন</p>
            <p className="text-[12px] text-[var(--ink3)]">আপনার বুকিং দেখতে লগইন করতে হবে।</p>
          </div>
        )}

        {/* Empty state */}
        {!loading && !error && user && displayed.length === 0 && (
          <div className="flex flex-col items-center justify-center py-20 gap-3 text-center">
            <div className="text-5xl">
              {activeTab === "upcoming"  ? "📋" : activeTab === "completed" ? "✅" : "⏹️"}
            </div>
            <p className="text-[14px] font-bold text-[var(--ink)]">কোনো বুকিং নেই</p>
            <p className="text-[12px] text-[var(--ink3)]">
              {activeTab === "upcoming"
                ? "AI চ্যাট থেকে ডাক্তার বা হাসপাতাল বুক করুন।"
                : "এই ক্যাটাগরিতে কোনো বুকিং পাওয়া যায়নি।"}
            </p>
          </div>
        )}

        {/* Booking Cards */}
        {!loading && !error && displayed.map(b => {
          const sStyle  = STATUS_STYLE[b.status] ?? STATUS_STYLE.new;
          const sLabel  = STATUS_LABEL[b.status] ?? b.status;
          const svcIcon = SERVICE_ICON[b.service_type] ?? <Stethoscope className="h-5 w-5" />;
          const svcLbl  = SERVICE_LABEL[b.service_type] ?? b.service_type;

          return (
            <div key={b.id} className="bg-[var(--white)] rounded-[var(--r-lg)] border border-[var(--border)] shadow-sm overflow-hidden">
              {/* Head */}
              <div className="flex items-start gap-3 p-3">
                <div className="h-10 w-10 shrink-0 rounded-[var(--r-md)] flex items-center justify-center"
                  style={{ background: sStyle.bg, color: sStyle.text }}>
                  {svcIcon}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-bold text-[var(--ink)] truncate">{b.provider_name}</div>
                  <div className="text-[11px] text-[var(--ink3)] mt-0.5">{svcLbl}</div>
                </div>
                <div className="flex flex-col items-end gap-1">
                  <span className="shrink-0 px-2 py-0.5 rounded text-[10px] font-bold border"
                    style={{ background: sStyle.bg, color: sStyle.text, borderColor: sStyle.border }}>
                    {sLabel}
                  </span>
                  {b.payment_status === "paid" && (
                    <span className="shrink-0 px-2 py-0.5 rounded text-[10px] font-bold border"
                      style={{ background: "#F0FDF4", color: "#16A34A", borderColor: "#BBF7D0", display: "inline-flex", alignItems: "center", gap: 2 }}>
                      ৳ Paid
                    </span>
                  )}
                </div>
              </div>

              {/* Detail grid */}
              <div className="px-3 pb-3">
                <div className="bg-[var(--bg)] rounded-md p-2.5 grid grid-cols-2 gap-y-2 gap-x-4">
                  <div className="flex items-center gap-1.5 text-[11px] text-[var(--ink2)]">
                    <Calendar className="h-3 w-3 text-[var(--g5)]" />
                    <strong>{b.preferred_date ? formatDate(b.preferred_date) : "তারিখ নির্ধারিত হয়নি"}</strong>
                  </div>
                  <div className="flex items-center gap-1.5 text-[11px] text-[var(--ink2)]">
                    <Clock className="h-3 w-3 text-[var(--g5)]" />
                    <strong>{b.preferred_time ? formatTime(b.preferred_time) : "সময় নির্ধারিত হয়নি"}</strong>
                  </div>
                  {b.notes && (
                    <div className="col-span-2 text-[11px] text-[var(--ink3)] italic truncate">📝 {b.notes}</div>
                  )}
                  <div className="col-span-2 text-[10px] text-[var(--ink3)]">
                    📬 অনুরোধ পাঠানো: {relativeDate(b.created_at)}
                  </div>
                </div>
              </div>

              {/* Actions */}
              {(b.status === "new" || b.status === "accepted") && (
                <div className="flex pb-3 px-3 gap-2">
                  {b.status === "accepted" && b.meet_link && (
                    <button
                      onClick={() => window.open(b.meet_link, "_blank")}
                      className="flex-[1.5] py-2 bg-[var(--g8)] text-white text-[12px] font-bold rounded-md flex items-center justify-center gap-1.5 shadow-md shadow-[#1D9E75]/20 hover:scale-[1.02] transition-transform"
                    ><Video className="w-4 h-4" /> ভিডিও কল এ যুক্ত হোন</button>
                  )}
                  <button
                    onClick={() => handleCancel(b.id)}
                    className="flex-1 py-2 bg-[var(--danger-soft)] text-[var(--danger)] text-[12px] font-bold rounded-md hover:bg-red-100 transition-colors"
                  >বাতিল করুন</button>
                </div>
              )}
              {b.status === "accepted" && (
                <div className="flex flex-col gap-2 pb-3 px-3">
                  {b.payment_status !== "paid" && (
                    <button
                      onClick={() => setPaymentTarget(b)}
                      className="w-full py-2 bg-emerald-50 text-emerald-700 border border-emerald-200 text-[12px] font-bold rounded-md hover:bg-emerald-100 transition-colors flex items-center justify-center gap-1"
                    >
                      পেমেন্ট করুন (৳৫০০)
                    </button>
                  )}
                  <div className="flex gap-2">
                    <button
                      onClick={() => setActiveCall(b)}
                      className="flex-1 py-2 bg-indigo-50 text-indigo-700 border border-indigo-200 text-[12px] font-bold rounded-md hover:bg-indigo-100 transition-colors flex items-center justify-center gap-1"
                    >
                      <VideoIcon className="w-4 h-4" /> জয়েন কল
                    </button>
                    <button
                      onClick={() => handleCancel(b.id)}
                      className="flex-1 py-2 bg-red-50 text-red-600 border border-red-100 text-[12px] font-bold rounded-md hover:bg-red-100 transition-colors"
                    >বাতিল করুন</button>
                  </div>
                </div>
              )}
              {b.status === "completed" && (
                <div className="flex pb-3 px-3 gap-2">
                  <button
                    onClick={() => setReviewTarget(b)}
                    className="flex-1 py-2 bg-amber-50 text-amber-600 border border-amber-200 text-[12px] font-bold rounded-md hover:bg-amber-100 transition-colors flex items-center justify-center gap-1"
                  >
                    <Star className="w-4 h-4 fill-amber-500 text-amber-500" /> রিভিউ দিন
                  </button>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {reviewTarget && (
        <ReviewForm
          bookingId={reviewTarget.id}
          providerId={reviewTarget.provider_id || "00000000-0000-0000-0000-000000000000"}
          providerName={reviewTarget.provider_name}
          providerType={["hospital", "clinic", "diagnostic"].includes(reviewTarget.service_type) ? "hospital" : "doctor"}
          onClose={() => setReviewTarget(null)}
          onSuccess={() => setReviewTarget(null)}
        />
      )}

      {activeCall && (
        <VideoChamber
          bookingId={activeCall.id}
          isDoctor={false}
          participantName={activeCall.provider_name}
          onEndCall={() => setActiveCall(null)}
        />
      )}

      {paymentTarget && (
        <PaymentGateway
          bookingId={paymentTarget.id}
          amount={500}
          onCancel={() => setPaymentTarget(null)}
          onSuccess={() => {
            setPaymentTarget(null);
            fetchBookings(); // Refresh the list
          }}
        />
      )}
    </div>
  );
}
