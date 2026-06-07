/**
 * Doctors.tsx — Live data from Supabase `doctors` table via useDoctors hook.
 * Falls back to graceful skeleton/empty-state while loading.
 */
import { useState, useMemo, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Search, Star, Clock, ChevronRight, X, SlidersHorizontal, Loader2, RefreshCw, Stethoscope } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { DoctorCard } from "@/components/cards/DoctorCard";
import type { RecommendedDoctor } from "@/lib/aiChat";
import BookingModal from "@/components/BookingModal";

/* ── Types from Supabase doctors table ─────────────────────────────── */
interface Doctor {
  id: string;
  doctor_name: string;
  qualification: string;
  specialization: string;
  designation: string;
  chamber: string;
  division: string;
  image_url: string | null;
  profile_url: string | null;
  is_verified?: boolean;
  fee_in_person?: number;
  rating?: number;
  review_count?: number;
  experience_years?: number;
  is_available?: boolean;
}

const SPECIALTIES = [
  "সব", "মেডিসিন", "কার্ডিওলজি", "শিশু", "গাইনী", "অর্থো", "চর্ম", "চক্ষু", "ইএনটি", "নিউরো", "ডেন্টাল",
];

// Map tab label → partial specialization match keywords
const SPEC_KEYWORDS: Record<string, string[]> = {
  "মেডিসিন":  ["medicine", "physician", "মেডিসিন", "general"],
  "কার্ডিওলজি": ["cardio", "heart", "হৃদ"],
  "শিশু":    ["pediatr", "paediatr", "শিশু", "child"],
  "গাইনী":   ["gynec", "gynaec", "obstet", "গাইনী", "প্রসূতি"],
  "অর্থো":   ["orthop", "bone", "হাড়", "অর্থো"],
  "চর্ম":    ["derma", "skin", "চর্ম"],
  "চক্ষু":   ["ophtha", "eye", "চোখ", "চক্ষু"],
  "ইএনটি":   ["ent", "ear", "nose", "throat", "ইএনটি"],
  "নিউরো":   ["neurol", "স্নায়ু", "brain", "মস্তিষ্ক", "নিউরো"],
  "ডেন্টাল": ["dental", "dent", "দাঁত", "ডেন্ট"],
};

// Emoji avatar based on specialization keyword
function specEmoji(spec: string): string {
  const s = spec.toLowerCase();
  if (s.includes("cardio") || s.includes("heart") || s.includes("হৃদ")) return "❤️";
  if (s.includes("gynec")  || s.includes("obstet") || s.includes("গাইনী"))   return "🌸";
  if (s.includes("pediatr") || s.includes("শিশু"))   return "👶";
  if (s.includes("orthop")  || s.includes("bone") || s.includes("হাড়"))     return "🦴";
  if (s.includes("derma")   || s.includes("skin") || s.includes("চর্ম"))     return "✨";
  if (s.includes("ophtha")  || s.includes("eye")  || s.includes("চক্ষু"))    return "👁️";
  if (s.includes("dental")  || s.includes("দাঁত")) return "🦷";
  if (s.includes("neurol")  || s.includes("স্নায়ু") || s.includes("brain")) return "🧠";
  if (s.includes("ent")     || s.includes("ear"))  return "👂";
  if (s.includes("medicine")|| s.includes("মেডিসিন") || s.includes("general")) return "💊";
  return "🩺";
}

/* ── Skeleton card ───────────────────────────────────────────────────── */
function SkeletonCard() {
  return (
    <div className="bg-white rounded-[18px] border border-slate-100 shadow-sm p-4 flex flex-col md:flex-row gap-4 animate-pulse">
      <div className="flex items-start gap-4 flex-1">
        <div className="w-14 h-14 md:w-16 md:h-16 rounded-[16px] bg-slate-200 flex-shrink-0" />
        <div className="flex-1 space-y-2 pt-1">
          <div className="h-4 bg-slate-200 rounded w-3/5" />
          <div className="h-3 bg-slate-100 rounded w-2/5" />
          <div className="flex gap-1.5 mt-2">
            <div className="h-4 w-12 bg-slate-100 rounded" />
            <div className="h-4 w-12 bg-slate-100 rounded" />
          </div>
        </div>
      </div>
      <div className="flex md:flex-col items-center md:items-end justify-between md:justify-center gap-3 pt-3 md:pt-0 border-t md:border-t-0 border-slate-100 shrink-0">
        <div className="flex flex-col items-start md:items-end space-y-1">
          <div className="h-3 w-16 bg-slate-100 rounded" />
          <div className="h-5 w-12 bg-slate-200 rounded" />
        </div>
        <div className="h-9 md:h-10 w-24 bg-slate-200 rounded-xl" />
      </div>
    </div>
  );
}

/* ── Main component ─────────────────────────────────────────────────── */
function normalizeSpecialtyParam(specParam: string | null): string {
  if (!specParam) return "সব";
  const p = specParam.trim();
  if (p === "হৃদরোগ" || p === "কার্ডিওলজি") return "কার্ডিওলজি";
  if (p === "স্নায়ু" || p === "নিউরো") return "নিউরো";
  if (p === "অর্থোপেডিক" || p === "অর্থো") return "অর্থো";
  if (p === "চোখ" || p === "চক্ষু") return "চক্ষু";
  if (p === "ডেন্টাল") return "ডেন্টাল";
  if (p === "শিশু") return "শিশু";
  if (p === "মেডিসিন") return "মেডিসিন";
  if (p === "গাইনী") return "গাইনী";
  if (p === "চর্ম") return "চর্ম";
  if (p === "ইএনটি") return "ইএনটি";
  return p;
}

export default function Doctors() {
  const [searchParams] = useSearchParams();
  const initialSearch = searchParams.get("search") || "";
  const initialSpecialty = normalizeSpecialtyParam(searchParams.get("specialty"));

  const [doctors, setDoctors]     = useState<Doctor[]>([]);
  const [loading, setLoading]     = useState(true);
  const [error, setError]         = useState("");
  const [search, setSearch]       = useState(initialSearch);
  const [activeSpec, setActiveSpec] = useState(initialSpecialty);
  const [showFilter, setShowFilter] = useState(false);
  const [sortBy, setSortBy]       = useState<"name" | "fee" | "exp">("name");
  const [booking, setBooking]     = useState<{ open: boolean; doc: Doctor | null }>({ open: false, doc: null });

  // Sync state with URL params changes
  useEffect(() => {
    const qSearch = searchParams.get("search") || "";
    const qSpec = normalizeSpecialtyParam(searchParams.get("specialty"));
    setSearch(qSearch);
    setActiveSpec(qSpec);
  }, [searchParams]);

  /* ── Fetch doctors ───────────────────────────────────────────────── */
  async function fetchDoctors() {
    setLoading(true); setError("");
    try {
      const { data, error: dbErr } = await (supabase as any)
        .from("doctors")
        .select("*")
        .order("doctor_name", { ascending: true })
        .limit(500);
      if (dbErr) throw dbErr;
      setDoctors(data || []);
    } catch (e: any) {
      setError(e?.message || "ডাক্তার লোড করা যায়নি");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { fetchDoctors(); }, []);

  /* ── Filter + sort ───────────────────────────────────────────────── */
  const filtered = useMemo(() => {
    let list = [...doctors];
    // Search
    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter(d =>
        d.doctor_name.toLowerCase().includes(q) ||
        d.specialization.toLowerCase().includes(q) ||
        d.chamber.toLowerCase().includes(q) ||
        d.designation.toLowerCase().includes(q)
      );
    }
    // Specialty tab
    if (activeSpec !== "সব") {
      const keywords = SPEC_KEYWORDS[activeSpec] ?? [];
      list = list.filter(d => keywords.some(k => d.specialization.toLowerCase().includes(k)));
    }
    // Sort
    if (sortBy === "fee") list.sort((a, b) => (a.fee_in_person ?? 0) - (b.fee_in_person ?? 0));
    else if (sortBy === "exp") list.sort((a, b) => (b.experience_years ?? 0) - (a.experience_years ?? 0));
    else list.sort((a, b) => a.doctor_name.localeCompare(b.doctor_name, "bn"));
    return list;
  }, [doctors, search, activeSpec, sortBy]);

  return (
    <div className="patient-screen active flex flex-col" style={{ background: "#f8fafc", paddingBottom: 72 }}>
      {/* Header */}
      <div className="bg-white border-b border-gray-100">
        <div className="flex items-center justify-between px-4 pt-3 pb-2">
          <div>
            <h1 className="text-[17px] font-extrabold text-gray-900">বিশেষজ্ঞ ডাক্তার</h1>
            {!loading && !error && (
              <p className="text-[11px] text-gray-400 mt-0.5">{doctors.length}জন ভেরিফাইড ডাক্তার</p>
            )}
          </div>
          <div className="flex items-center gap-2">
            <button onClick={fetchDoctors} className="flex items-center justify-center h-8 w-8 bg-emerald-50 text-emerald-600 rounded-lg">
              <RefreshCw className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => setShowFilter(v => !v)}
              className="flex items-center gap-1.5 bg-emerald-50 text-emerald-700 text-[12px] font-bold px-3 py-1.5 rounded-lg"
            >
              <SlidersHorizontal className="w-3.5 h-3.5" />
              ফিল্টার
            </button>
          </div>
        </div>

        {/* Search */}
        <div className="px-4 pb-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="নাম, বিভাগ বা হাসপাতাল..."
              className="w-full pl-9 pr-9 py-2.5 rounded-xl border border-gray-200 bg-gray-50 text-[13px] outline-none focus:border-emerald-400 focus:bg-white transition-all"
            />
            {search && (
              <button onClick={() => setSearch("")} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400">
                <X className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>

        {/* Sort filter */}
        {showFilter && (
          <div className="px-4 pb-3 border-t border-gray-100 pt-2">
            <p className="text-[11px] font-bold text-gray-500 mb-2">সাজান:</p>
            <div className="flex gap-2">
              {[{ key: "name", label: "নাম" }, { key: "fee", label: "কম ফি" }, { key: "exp", label: "অভিজ্ঞতা" }].map(o => (
                <button
                  key={o.key}
                  onClick={() => setSortBy(o.key as typeof sortBy)}
                  className={`text-[12px] font-bold px-3 py-1 rounded-full border transition-all ${sortBy === o.key ? "bg-emerald-600 text-white border-emerald-600" : "text-gray-600 border-gray-200 bg-white"}`}
                >
                  {o.label}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Specialty tabs */}
        <div className="flex gap-2 overflow-x-auto px-4 pb-3 pt-1 scrollbar-hide">
          {SPECIALTIES.map(s => (
            <button
              key={s}
              onClick={() => setActiveSpec(s)}
              className={`flex-shrink-0 text-[12px] font-bold px-3 py-1.5 rounded-full border transition-all ${activeSpec === s ? "bg-emerald-600 text-white border-emerald-600" : "text-gray-600 border-gray-200 bg-white"}`}
            >
              {s}
            </button>
          ))}
        </div>
      </div>

      {/* Results */}
      <div className="flex-1 overflow-y-auto px-4 pt-4">
        {/* Loading skeletons */}
        {loading && (
          <div className="grid gap-3">
            {[1,2,3,4].map(i => <SkeletonCard key={i} />)}
          </div>
        )}

        {/* Error */}
        {!loading && error && (
          <div className="flex flex-col items-center justify-center py-20 text-center gap-3">
            <div className="text-4xl">⚠️</div>
            <p className="text-[13px] font-bold text-red-600">{error}</p>
            <button onClick={fetchDoctors} className="px-5 py-2 rounded-xl bg-emerald-600 text-white text-[13px] font-bold">
              আবার চেষ্টা
            </button>
          </div>
        )}

        {/* Empty state */}
        {!loading && !error && filtered.length === 0 && (
          <div className="flex flex-col items-center justify-center py-16 px-6 mt-4 bg-white rounded-3xl border border-dashed border-emerald-200 text-center">
            <div className="w-20 h-20 mb-5 bg-emerald-50 rounded-full flex items-center justify-center border-4 border-emerald-100/50">
              <div className="text-4xl text-emerald-500 opacity-80">🔍</div>
            </div>
            <h3 className="text-lg font-extrabold text-slate-800 mb-1.5">
              {doctors.length === 0 ? "কোনো ডাক্তার পাওয়া যায়নি" : "কোনো ফলাফল পাওয়া যায়নি"}
            </h3>
            <p className="text-[13px] text-slate-500 max-w-[260px] leading-relaxed mb-6">
              {doctors.length === 0
                ? "আপনার ডেটাবেজে কোনো ডাক্তার যোগ করা হয়নি। অনুগ্রহ করে নতুন ডাক্তার যোগ করুন।"
                : "আপনার সার্চের সাথে মিলছে এমন কোনো ডাক্তার নেই। অনুগ্রহ করে অন্য নাম বা বিভাগ দিয়ে খুঁজুন।"}
            </p>
            {doctors.length > 0 && (
              <button 
                onClick={() => { setSearch(""); setActiveSpec("সব"); }} 
                className="px-6 py-2.5 bg-emerald-600 hover:bg-emerald-700 transition-colors text-white text-sm font-bold rounded-xl shadow-sm shadow-emerald-600/20"
              >
                সব ডাক্তার দেখুন
              </button>
            )}
          </div>
        )}

        {/* Count + cards */}
        {!loading && !error && filtered.length > 0 && (
          <>
            <p className="text-[11px] font-semibold text-gray-400 mb-3">{filtered.length}জন ডাক্তার পাওয়া গেছে</p>
            <div className="grid gap-4 px-1">
              {filtered.map(doc => (
                <DoctorCard
                  key={doc.id}
                  variant="v1"
                  doctor={{
                    doctorName: doc.doctor_name,
                    specialization: doc.specialization,
                    qualification: doc.qualification,
                    designation: doc.designation,
                    chamber: doc.chamber || doc.division,
                    rating: doc.rating,
                    fee: doc.fee_in_person,
                    experience: doc.experience_years ? `${doc.experience_years} বছর` : undefined,
                    image_url: doc.image_url || undefined,
                  }}
                  onBook={() => setBooking({ open: true, doc })}
                />
              ))}
            </div>
          </>
        )}
        <div className="h-4" />
      </div>

      {/* Booking Modal */}
      {booking.doc && (
        <BookingModal
          open={booking.open}
          onClose={() => setBooking({ open: false, doc: null })}
          serviceType="doctor"
          providerName={booking.doc.doctor_name}
          providerId={booking.doc.id}
        />
      )}
    </div>
  );
}
