import { useState, useEffect } from "react";
import { ClipboardList, CheckCircle, AlertCircle, ChevronRight, Search, Pill, Save, BookOpen, Loader2, Trash2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";

/* ── Medicine price database ─────────────────────────────────────── */
const MEDICINE_PRICES: Record<string, { generic: string; price: string; alternative: string; altPrice: string }> = {
  "napa":      { generic: "প্যারাসিটামল ৫০০mg",   price: "৳২/ট্যাব", alternative: "এসিটামিনোফেন",   altPrice: "৳৩/ট্যাব" },
  "seklo":     { generic: "সেক্লো (ওমেপ্রাজল ২০mg)", price: "৳৮/ট্যাব", alternative: "নেক্সিয়াম",      altPrice: "৳১৫/ট্যাব" },
  "amoxil":    { generic: "অ্যামক্সিসিলিন ৫০০mg", price: "৳৬/ট্যাব", alternative: "ক্লাভাম",         altPrice: "৳১২/ট্যাব" },
  "metformin": { generic: "মেটফর্মিন ৫০০mg",      price: "৳৩/ট্যাব", alternative: "গ্লুকোফেজ",       altPrice: "৳৬/ট্যাব" },
  "amlodipine":{ generic: "অ্যামলোডিপিন ৫mg",     price: "৳২/ট্যাব", alternative: "নরভাস্ক",         altPrice: "৳৮/ট্যাব" },
  "losartan":  { generic: "লোসার্টান ৫০mg",        price: "৳৪/ট্যাব", alternative: "কোজার",            altPrice: "৳১০/ট্যাব" },
  "atorvastatin":{ generic: "অ্যাটোরভাস্ট্যাটিন ৪০mg", price: "৳৫/ট্যাব", alternative: "লিপিটর",    altPrice: "৳১৮/ট্যাব" },
};

const TIPS = [
  { icon: "💊", title: "জেনেরিক ওষুধ কিনুন",          body: "ব্র্যান্ড নাম এড়িয়ে জেনেরিক কিনলে ৫০-৭০% সাশ্রয় হয়।" },
  { icon: "🔬", title: "প্রেসক্রিপশন ছাড়া টেস্ট নয়", body: "অপ্রয়োজনীয় টেস্ট এড়িয়ে চলুন — ডাক্তারের পরামর্শ নিন।" },
  { icon: "🏥", title: "সরকারি হাসপাতাল ব্যবহার করুন", body: "অনেক টেস্ট সরকারি হাসপাতালে বিনামূল্যে বা কম খরচে হয়।" },
];

interface MedRecord {
  id: string;
  created_at: string;
  title: string;
  content_data: Record<string, string> | null;
}

function fmtDate(iso: string) {
  try { return new Date(iso).toLocaleDateString("bn-BD", { day: "numeric", month: "short", year: "numeric" }); }
  catch { return iso; }
}

export default function Prescription() {
  const { user } = useAuth();
  const [query, setQuery]     = useState("");
  const [result, setResult]   = useState<typeof MEDICINE_PRICES[string] | null>(null);
  const [notFound, setNotFound] = useState(false);
  const [saving, setSaving]   = useState(false);
  const [saved, setSaved]     = useState(false);
  const [records, setRecords] = useState<MedRecord[]>([]);
  const [loadingRec, setLoadingRec] = useState(false);

  /* ── Load past records for logged-in user ─────────────────────── */
  async function loadRecords() {
    if (!user) return;
    setLoadingRec(true);
    const { data } = await (supabase as any)
      .from("medical_records")
      .select("id, created_at, title, content_data")
      .eq("user_id", user.id)
      .eq("record_type", "prescription")
      .order("created_at", { ascending: false })
      .limit(15);
    setRecords(data || []);
    setLoadingRec(false);
  }

  useEffect(() => { loadRecords(); }, [user]);

  const handleSearch = () => {
    const key = query.trim().toLowerCase();
    setSaved(false);
    if (MEDICINE_PRICES[key]) { setResult(MEDICINE_PRICES[key]); setNotFound(false); }
    else { setResult(null); setNotFound(true); }
  };

  /* ── Save to Supabase medical_records ─────────────────────────── */
  async function handleSave() {
    if (!user || !result) return;
    setSaving(true);
    await (supabase as any).from("medical_records").insert({
      user_id:      user.id,
      record_type:  "prescription",
      title:        `ওষুধ: ${query.trim()} — ${result.generic}`,
      content_data: {
        medicine: query.trim(), generic: result.generic,
        price: result.price, alternative: result.alternative, altPrice: result.altPrice,
      },
    });
    setSaving(false);
    setSaved(true);
    loadRecords();
  }

  /* ── Delete a record ──────────────────────────────────────────── */
  async function handleDelete(id: string) {
    await (supabase as any).from("medical_records").delete().eq("id", id).eq("user_id", user?.id);
    setRecords(p => p.filter(r => r.id !== id));
  }

  return (
    <div className="patient-screen active" style={{ background: "#f8fafc", paddingBottom: 72, overflowY: "auto" }}>
      {/* Header */}
      <div className="bg-gradient-to-br from-violet-600 to-indigo-700 px-5 pt-6 pb-8">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-10 h-10 rounded-xl bg-white/15 flex items-center justify-center">
            <ClipboardList className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="text-[17px] font-extrabold text-white">প্রেসক্রিপশন অডিটর</h1>
            <p className="text-[11px] text-violet-200">ওষুধ ও টেস্টের খরচ যাচাই ও সেভ করুন</p>
          </div>
        </div>
      </div>

      <div className="px-4 -mt-4">
        {/* Search card */}
        <div className="bg-white rounded-2xl shadow-md border border-gray-100 p-4 mb-4">
          <p className="text-[12px] font-bold text-gray-600 mb-2">ওষুধের নাম লিখুন (ইংরেজিতে)</p>
          <p className="text-[10px] text-gray-400 mb-2">উদাহরণ: napa, seklo, amoxil, metformin, amlodipine, losartan, atorvastatin</p>
          <div className="flex gap-2">
            <div className="relative flex-1">
              <Pill className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                value={query}
                onChange={e => setQuery(e.target.value)}
                onKeyDown={e => e.key === "Enter" && handleSearch()}
                placeholder="ওষুধের নাম লিখুন..."
                className="w-full pl-9 py-2.5 rounded-xl border border-gray-200 bg-gray-50 text-[13px] outline-none focus:border-violet-400 focus:bg-white transition-all"
              />
            </div>
            <button onClick={handleSearch} className="bg-violet-600 text-white px-4 rounded-xl text-[13px] font-bold">
              <Search className="w-4 h-4" />
            </button>
          </div>

          {result && (
            <div className="mt-4 rounded-xl bg-emerald-50 border border-emerald-200 p-4">
              <div className="flex items-center gap-2 mb-2">
                <CheckCircle className="w-4 h-4 text-emerald-600" />
                <span className="text-[12px] font-bold text-emerald-700">পাওয়া গেছে</span>
              </div>
              <p className="text-[14px] font-extrabold text-gray-900 mb-1">{result.generic}</p>
              <p className="text-[13px] text-emerald-700 font-bold">সাধারণ মূল্য: {result.price}</p>
              <div className="mt-3 border-t border-emerald-200 pt-3">
                <p className="text-[11px] text-gray-500 mb-1">বিকল্প ওষুধ:</p>
                <p className="text-[12px] font-semibold text-gray-700">{result.alternative} — {result.altPrice}</p>
              </div>
              {/* Save to medical records */}
              {user ? (
                saved ? (
                  <div className="mt-3 flex items-center gap-2 text-emerald-600 text-[12px] font-bold">
                    <CheckCircle className="w-4 h-4" /> মেডিকেল রেকর্ডে সেভ হয়েছে!
                  </div>
                ) : (
                  <button
                    onClick={handleSave}
                    disabled={saving}
                    className="mt-3 flex items-center gap-2 bg-violet-600 hover:bg-violet-700 text-white text-[12px] font-bold px-4 py-2 rounded-xl transition-colors disabled:opacity-60"
                  >
                    {saving ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Save className="w-3.5 h-3.5" />}
                    মেডিকেল রেকর্ড সেভ করুন
                  </button>
                )
              ) : (
                <p className="mt-3 text-[11px] text-gray-400">
                  💡 রেকর্ড সেভ করতে <a href="/auth" className="text-violet-600 font-bold underline">লগইন করুন</a>
                </p>
              )}
            </div>
          )}

          {notFound && (
            <div className="mt-4 rounded-xl bg-red-50 border border-red-200 p-4 flex items-center gap-3">
              <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0" />
              <div>
                <p className="text-[13px] font-bold text-red-700">পাওয়া যায়নি</p>
                <p className="text-[11px] text-red-500 mt-0.5">আমাদের ডেটাবেজে এই ওষুধের তথ্য এখনো নেই।</p>
              </div>
            </div>
          )}
        </div>

        {/* Past Medical Records (logged-in only) */}
        {user && (
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 mb-4">
            <div className="flex items-center gap-2 mb-3">
              <BookOpen className="w-4 h-4 text-violet-600" />
              <p className="text-[13px] font-extrabold text-gray-800">আমার মেডিকেল রেকর্ড</p>
            </div>
            {loadingRec ? (
              <div className="flex justify-center py-4">
                <Loader2 className="w-5 h-5 animate-spin text-violet-400" />
              </div>
            ) : records.length === 0 ? (
              <p className="text-[12px] text-gray-400 text-center py-4">
                কোনো রেকর্ড নেই। ওষুধ সার্চ করে "সেভ করুন" বাটনে চাপুন।
              </p>
            ) : (
              <div className="divide-y divide-gray-100">
                {records.map(r => {
                  const data: any = r.content_data || {};
                  const isPrescription = !!data.medicines;
                  
                  return (
                    <div key={r.id} className="py-3 flex flex-col gap-2">
                      <div className="flex items-center gap-2">
                        <div className="flex-1 min-w-0">
                          <p className="text-[13px] font-bold text-gray-800 truncate">{r.title}</p>
                          <p className="text-[11px] text-gray-400 mt-0.5">{fmtDate(r.created_at)} {data.doctor_name && `• ${data.doctor_name}`}</p>
                        </div>
                        <button
                          onClick={() => handleDelete(r.id)}
                          className="shrink-0 p-1.5 rounded-lg bg-red-50 text-red-400 hover:text-red-600 hover:bg-red-100 transition-colors"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                      
                      {isPrescription && (
                        <div className="mt-2 bg-slate-50 border border-slate-100 rounded-xl p-3">
                          <div className="mb-2">
                            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Diagnosis</span>
                            <p className="text-[12px] font-semibold text-slate-800">{data.diagnosis}</p>
                          </div>
                          
                          <div className="mb-2">
                            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Medicines</span>
                            <ul className="mt-1 space-y-1">
                              {data.medicines.map((m: any, i: number) => (
                                <li key={i} className="text-[12px] flex items-start gap-2">
                                  <span className="text-emerald-500 font-bold">•</span>
                                  <div>
                                    <span className="font-bold text-slate-800">{m.name}</span>
                                    <span className="text-slate-500 ml-1">({m.dosage} — {m.duration})</span>
                                  </div>
                                </li>
                              ))}
                            </ul>
                          </div>
                          
                          {data.notes && (
                            <div className="mt-2 pt-2 border-t border-slate-200">
                              <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Advice</span>
                              <p className="text-[11px] text-slate-600 mt-0.5 whitespace-pre-wrap">{data.notes}</p>
                            </div>
                          )}
                        </div>
                      )}
                      
                      {/* Original Auditor Save Layout */}
                      {!isPrescription && data.generic && (
                        <div className="mt-1 bg-emerald-50 border border-emerald-100 rounded-lg p-2 text-[11px]">
                          <p className="font-semibold text-emerald-800">{data.generic} <span className="font-normal text-emerald-600">({data.price})</span></p>
                          {data.alternative && (
                            <p className="text-slate-600 mt-1">বিকল্প: {data.alternative} <span className="text-slate-400">({data.altPrice})</span></p>
                          )}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* Saving tips */}
        <div className="mb-4">
          <p className="text-[13px] font-extrabold text-gray-800 mb-3">💡 খরচ কমানোর টিপস</p>
          <div className="grid gap-3">
            {TIPS.map(t => (
              <div key={t.title} className="bg-white rounded-2xl border border-gray-100 p-4 flex gap-3 items-start">
                <span className="text-2xl">{t.icon}</span>
                <div>
                  <p className="text-[13px] font-bold text-gray-800">{t.title}</p>
                  <p className="text-[11px] text-gray-500 mt-0.5 leading-relaxed">{t.body}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* CTA */}
        <div
          className="bg-gradient-to-r from-violet-600 to-indigo-600 rounded-2xl p-5 flex items-center justify-between mb-4 cursor-pointer"
          onClick={() => window.location.href = "/chat"}
        >
          <div>
            <p className="text-[14px] font-extrabold text-white">ডাক্তারের পরামর্শ নিন</p>
            <p className="text-[11px] text-violet-200 mt-0.5">AI দিয়ে এখনই বিশেষজ্ঞ জানুন</p>
          </div>
          <ChevronRight className="w-5 h-5 text-white" />
        </div>
      </div>
    </div>
  );
}
