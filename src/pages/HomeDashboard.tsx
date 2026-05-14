import { useState, useEffect } from "react";
import { Bell, User, Search, Stethoscope, ChevronRight, PhoneCall, Building2, TestTubes, Activity, Settings, HeartPulse, Hospital, Pill, ActivitySquare, AlertCircle, Ambulance, Lock, CheckCircle2, ArrowRight } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import Logo from "@/components/Logo";
import { supabase } from "@/integrations/supabase/client";
import doctorAvatar from "@/assets/doctor-avatar.png";

const DEFAULT_STATS = [
    { value: "—", label: "পরামর্শ সম্পন্ন", accent: "#10b981" },
    { value: "—", label: "ভেরিফাইড ডাক্তার", accent: "#3b82f6" },
    { value: "—", label: "পার্টনার হাসপাতাল", accent: "#8b5cf6" },
    { value: "২৪/৭", label: "জরুরি সেবা ও সাপোর্ট", accent: "#f59e0b" },
];

const SOLUTION_CARDS = [
    {
        icon: Ambulance, accent: "#ef4444",
        bg: "from-red-50 to-orange-50", border: "border-red-100",
        tag: "২৪/৭ জরুরি সেবা", title: "আপৎকালীন দিশারি",
        body: "বিপদের প্রথম কয়েক মিনিট মূল্যবান। মাঝরাতে বা জরুরি প্রয়োজনে আতঙ্কিত হবেন না।",
    },
    {
        icon: Stethoscope, accent: "#3b82f6",
        bg: "from-blue-50 to-indigo-50", border: "border-blue-100",
        tag: "AI-চালিত বিশ্লেষণ", title: "সঠিক বিশেষজ্ঞ নির্বাচন",
        body: "ভুল ডাক্তার দেখিয়ে সময় ও অর্থ নষ্ট করবেন না। স্মার্ট AI সঠিক বিশেষজ্ঞ জানাবে।",
    },
    {
        icon: Lock, accent: "#10b981",
        bg: "from-emerald-50 to-teal-50", border: "border-emerald-100",
        tag: "১০০% এনক্রিপ্টেড", title: "সুরক্ষা ও গোপনীয়তা",
        body: "লজ্জা নয়, সঠিক সমাধানই সুস্থতার চাবিকাঠি। সম্পূর্ণ নিরাপদ এবং গোপনীয়।",
    },
];

const PARTNER_BENEFITS = [
    "সরাসরি হাই-ইনটেন্ট ভেরিফাইড রোগী (High-Intent Leads)",
    "আপনার প্র্যাকটিস বা ক্লিনিকের ডিজিটাল রূপান্তর",
    "অত্যাধুনিক টেলিমেডিসিন এবং চেম্বার ম্যানেজমেন্ট সুবিধা",
    "১২,০০০+ হাসপাতাল ও হাজারো ডাক্তারের শক্তিশালী নেটওয়ার্ক",
    "সম্পূর্ণ ফ্রি রেজিস্ট্রেশন — কোনো হিডেন চার্জ নেই",
];

export default function HomeDashboard() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState("ডাক্তার");

  const quickActions = [
    { icon: <AlertCircle className="text-red-500" size={24} />, label: "জরুরি", colorClass: "qa-emergency", path: "/hospital-map" },
    { icon: <Hospital className="text-blue-500" size={24} />, label: "হাসপাতাল", colorClass: "qa-hospital", path: "/hospital-map" },
    { icon: <ActivitySquare className="text-amber-500" size={24} />, label: "অ্যাম্বুলেন্স", colorClass: "qa-ambulance", path: "/hospital-map" },
    { icon: <HeartPulse className="text-red-500" size={24} />, label: "ব্লাড ব্যাংক", colorClass: "qa-blood", path: "/hospital-map" },
    { icon: <TestTubes className="text-green-500" size={24} />, label: "ডায়াগনস্টিক", colorClass: "qa-test", path: "/hospital-map" },
    { icon: <Pill className="text-purple-500" size={24} />, label: "ফার্মেসি", colorClass: "qa-medicine", path: "/pharmacy" },
    { icon: <PhoneCall className="text-teal-500" size={24} />, label: "টেলিমেডিসিন", colorClass: "qa-telemedicine", path: "/chat" },
    { icon: <Settings className="text-gray-500" size={24} />, label: "অন্যান্য", colorClass: "qa-more", path: "/profile" },
  ];

  const specialties = [
    { icon: "🫀", name: "হৃদরোগ" },
    { icon: "🧠", name: "স্নায়ু" },
    { icon: "🦷", name: "ডেন্টাল" },
    { icon: "👁️", name: "চোখ" },
    { icon: "🦴", name: "অর্থোপেডিক" },
    { icon: "👶", name: "শিশু" }
  ];

  const [topDoctors, setTopDoctors] = useState<any[]>([]);
  const [liveStats, setLiveStats] = useState(DEFAULT_STATS);

  useEffect(() => {
    async function fetchTopDoctors() {
      try {
        const { data, error } = await (supabase as any)
          .from("doctors")
          .select("*")
          .limit(5);
        if (!error && data) {
          setTopDoctors(data);
        }
      } catch (e) {
        console.error("Error fetching top doctors", e);
      }
    }

    async function fetchLiveStats() {
      try {
        const toBn = (n: number) => n.toLocaleString("bn-BD");

        const [consultRes, doctorRes, hospitalRes] = await Promise.all([
          (supabase as any).from("medical_records").select("id", { count: "exact", head: true }),
          (supabase as any).from("doctors").select("id", { count: "exact", head: true }),
          (supabase as any).from("hospitals").select("id", { count: "exact", head: true }),
        ]);

        setLiveStats([
          { value: `${toBn(consultRes.count || 0)}+`, label: "পরামর্শ সম্পন্ন", accent: "#10b981" },
          { value: `${toBn(doctorRes.count || 0)}+`, label: "ভেরিফাইড ডাক্তার", accent: "#3b82f6" },
          { value: `${toBn(hospitalRes.count || 0)}+`, label: "পার্টনার হাসপাতাল", accent: "#8b5cf6" },
          { value: "২৪/৭", label: "জরুরি সেবা ও সাপোর্ট", accent: "#f59e0b" },
        ]);
      } catch {
        // keep defaults
      }
    }

    fetchTopDoctors();
    fetchLiveStats();
  }, []);

  return (
    <div className="patient-screen active" id="sc-home">

      <div className="scroll-body px-0 pt-0 pb-24">
        {/* Premium Clean Hero */}
        <div className="relative overflow-hidden bg-gradient-to-br from-white via-teal-50/40 to-emerald-50/60 pt-4 pb-10 px-5">
           {/* Decorative blobs */}
          <div className="pointer-events-none absolute inset-0 overflow-hidden">
            <div className="absolute -right-20 -top-20 h-64 w-64 rounded-full bg-emerald-100/40 blur-[50px]" />
            <div className="absolute -bottom-10 -left-10 h-48 w-48 rounded-full bg-blue-100/30 blur-[40px]" />
          </div>

          <div className="relative z-10">
            <div className="mb-3 inline-flex items-center gap-1.5 rounded-full border border-emerald-200/60 bg-emerald-50/80 px-3 py-1 text-[10px] font-bold text-emerald-700">
              <span className="flex h-2 w-2 rounded-full bg-emerald-500"></span>
              বাংলাদেশের #১ ডিজিটাল হেলথকেয়ার
            </div>

            <h1 className="mb-3 text-[26px] font-black leading-[1.3] tracking-tight text-gray-900">
              <span className="text-emerald-600">বিনামূল্যে</span> বাংলাদেশের নির্ভরযোগ্য ডিজিটাল স্বাস্থ্যসেবা নেটওয়ার্ক
            </h1>
            
            <p className="mb-6 text-sm font-semibold text-emerald-600/90">
              কোনো দালাল নেই, কোনো লুকানো চার্জ নেই।
            </p>

            {/* Premium Search Card inside Hero */}
            <div className="rounded-2xl bg-white p-2.5 shadow-xl shadow-emerald-100/50 border border-gray-100/80">
              <div className="flex gap-1 border-b border-gray-50 pb-2 mb-2 w-full overflow-x-auto no-scrollbar">
                {[
                  { id: 'ডাক্তার', icon: Stethoscope },
                  { id: 'অ্যাম্বুলেন্স', icon: ActivitySquare },
                  { id: 'ব্লাড ব্যাংক', icon: HeartPulse },
                  { id: 'ক্লিনিক', icon: Building2 },
                ].map(tab => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`flex items-center gap-1.5 px-3 py-1.5 text-[11px] font-bold rounded-full whitespace-nowrap transition-colors ${activeTab === tab.id ? 'bg-emerald-50 text-emerald-700' : 'text-gray-500 hover:bg-gray-50 hover:text-gray-900'}`}
                  >
                    <tab.icon className="h-3 w-3" />
                    {tab.id}
                  </button>
                ))}
              </div>
              
              <div className="flex items-center gap-2 p-1 relative w-full">
                <input
                  type="text"
                  placeholder={
                    activeTab === 'ডাক্তার' ? "বিশেষজ্ঞ ডাক্তার খুঁজুন..." :
                    activeTab === 'অ্যাম্বুলেন্স' ? "অ্যাম্বুলেন্স খুঁজুন..." :
                    activeTab === 'ব্লাড ব্যাংক' ? "রক্তের গ্রুপ খুঁজুন..." :
                    "ক্লিনিক খুঁজুন..."
                  }
                  className="flex-1 bg-transparent text-[13px] outline-none placeholder:text-gray-400 font-medium pl-2"
                />
                <button 
                  onClick={() => navigate("/doctors")}
                  className="bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl px-5 h-10 text-[13px] font-bold shadow-md shadow-emerald-200 transition-all active:scale-95"
                >
                  খুঁজুন
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Content Wrapper for internal padding */}
        <div className="px-5">

        {/* AI Banner */}
        <div className="ai-banner mt-2" onClick={() => navigate("/chat")}>
          <div className="ai-banner-icon animate-pulse">🤖</div>
          <div className="flex-1">
            <div className="ai-banner-title">AI স্বাস্থ্য সহকারী</div>
            <div className="ai-banner-sub">লক্ষণ বলে জেনে নিন কোন ডাক্তার দেখানো উচিত</div>
          </div>
          <ChevronRight className="ai-banner-arrow" />
        </div>

        {/* Services Section */}
        <div className="mt-8 mb-4 text-center px-4">
          <p className="mb-1 text-[11px] font-bold uppercase tracking-widest text-emerald-600">আমাদের সেবাসমূহ</p>
          <h2 className="text-[22px] font-extrabold text-gray-900 leading-tight">সহজ বুকিং, দ্রুত সেবা</h2>
          <p className="mt-2 text-[13px] text-gray-500 leading-relaxed max-w-[280px] mx-auto">
            যেকোনো স্বাস্থ্য সেবার জন্য এখনই বুকিং রিকোয়েস্ট পাঠান।
          </p>
        </div>
        <div className="quick-grid">
          {quickActions.map((qa, i) => (
            <div key={i} className={`qa-item ${qa.colorClass}`} onClick={() => navigate(qa.path)}>
              <div className="qa-icon-box">{qa.icon}</div>
              <div className="qa-label">{qa.label}</div>
            </div>
          ))}
        </div>

        {/* Specialty Scroll */}
        <div className="sec-head mt-2">
          <div className="sec-title">বিশেষজ্ঞ খুঁজুন</div>
          <div className="sec-more" onClick={() => navigate("/doctors")}>সবগুলো দেখুন</div>
        </div>
        <div className="spec-scroll">
          {specialties.map((spec, i) => (
            <div key={i} className="spec-item" onClick={() => navigate(`/doctors?specialty=${spec.name}`)}>
              <div className="spec-icon leading-none">{spec.icon}</div>
              <div className="spec-label">{spec.name}</div>
            </div>
          ))}
        </div>

        {/* Doctor Scroll */}
         <div className="sec-head mt-4">
          <div className="sec-title">জনপ্রিয় ডাক্তারগণ</div>
          <div className="sec-more" onClick={() => navigate("/doctors")}>সবগুলো দেখুন</div>
        </div>
        <div className="doc-scroll">
          {topDoctors.length > 0 ? (
            topDoctors.map(doc => (
               <div key={doc.id} className="doc-h-card" onClick={() => navigate("/doctors")}>
               <div className="dhc-av">{doc.doctor_name?.[0] || 'ড'}
                  {doc.is_verified && <div className="dhc-v">✓</div>}
               </div>
               <div className="dhc-name">{doc.doctor_name}</div>
               <div className="dhc-spec">{doc.specialization}</div>
               <div className="dhc-foot">
                 <div className="dhc-rating">⭐ {doc.rating || "৪.৮"}</div>
                 <div className="dhc-fee">৳{doc.fee_in_person || "৬০০"}</div>
               </div>
             </div>
            ))
          ) : (
             <div className="doc-h-card animate-pulse">
               <div className="dhc-av bg-gray-200"></div>
               <div className="dhc-name h-4 w-24 bg-gray-200 rounded mt-1"></div>
               <div className="dhc-spec h-3 w-16 bg-gray-100 rounded mt-2"></div>
             </div>
          )}
        </div>

        {/* ══ ADDED LANDING PAGE SECTIONS ══ */}
        <div className="mt-8 pb-10">
          
          {/* STATS */}
          <section className="bg-white py-12 border-y border-gray-100">
            <div className="px-5 text-center">
              <p className="text-[11px] font-bold uppercase tracking-widest text-gray-400 mb-6">আমাদের প্রভাব</p>
              <div className="grid grid-cols-2 gap-y-8 gap-x-4">
                  {liveStats.map((s, i) => (
                      <div key={s.label} className="flex flex-col items-center gap-1">
                          <p className="text-3xl font-black md:text-4xl" style={{ color: s.accent }}>{s.value}</p>
                          <p className="text-[11px] font-medium text-gray-500">{s.label}</p>
                      </div>
                  ))}
              </div>
            </div>
          </section>

          {/* SOLUTIONS */}
          <section className="bg-gray-50/70 py-12">
              <div className="px-5">
                  <div className="mb-10 text-center">
                      <p className="mb-2 text-[11px] font-bold uppercase tracking-widest text-emerald-600">সমাধান</p>
                      <h2 className="text-2xl font-extrabold text-gray-900">আমরা কীভাবে সাহায্য করি?</h2>
                      <p className="mx-auto mt-3 text-[13px] text-gray-500 leading-relaxed">
                          সঠিক সময়ে সঠিক পদক্ষেপ — আপনার সুরক্ষায় এবং পরিবারের সুস্বাস্থ্যে।
                      </p>
                  </div>

                  <div className="grid gap-4">
                      {SOLUTION_CARDS.map((card, i) => (
                          <article key={card.title} className={`relative overflow-hidden rounded-2xl border bg-gradient-to-br p-6 shadow-sm transition-shadow ${card.bg} ${card.border}`}>
                              <div className="mb-4 inline-flex h-10 w-10 items-center justify-center rounded-xl shadow-sm" style={{ backgroundColor: card.accent }}>
                                  <card.icon className="h-5 w-5 text-white" />
                              </div>
                              <br/>
                              <span className="mb-3 inline-block rounded-full px-2.5 py-0.5 text-[10px] font-bold text-white shadow-sm" style={{ backgroundColor: card.accent }}>{card.tag}</span>
                              <h3 className="mb-2 text-lg font-extrabold text-gray-900">{card.title}</h3>
                              <p className="text-[13px] leading-relaxed text-gray-600">{card.body}</p>
                          </article>
                      ))}
                  </div>
              </div>
          </section>

          {/* HOW IT WORKS */}
          <section className="bg-white py-12 border-b border-gray-100">
              <div className="px-5">
                  <div className="mb-10 text-center">
                      <p className="mb-2 text-[11px] font-bold uppercase tracking-widest text-blue-600">প্রক্রিয়া</p>
                      <h2 className="text-2xl font-extrabold text-gray-900">মাত্র ৩টি ধাপে সুস্থ থাকুন</h2>
                  </div>

                  <div className="grid gap-4">
                      {[
                          { step: "০১", title: "সমস্যা বলুন", body: "আপনার সমস্যা বাংলায়, ইংরেজিতে, যেকোনো ভাষায় লিখুন বা বলুন।", color: "from-emerald-500 to-emerald-700" },
                          { step: "০২", title: "AI বিশ্লেষণ", body: "ডাক্তার সাব AI আপনার উপসর্গ বিশ্লেষণ করে প্রাথমিক পরামর্শ ও বিশেষজ্ঞের সুপারিশ দেবে।", color: "from-blue-500 to-blue-700" },
                          { step: "০৩", title: "অ্যাপয়েন্টমেন্ট", body: "কাছের ভেরিফাইড হাসপাতালে অ্যাপয়েন্টমেন্ট বুক করুন সরাসরি অ্যাপ থেকে।", color: "from-purple-500 to-violet-700" },
                      ].map((item, i) => (
                          <div key={item.step} className="relative rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
                              <div className={`mb-4 inline-flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br ${item.color} text-sm font-black text-white shadow-md`}>{item.step}</div>
                              <h3 className="mb-1 text-[15px] font-bold text-gray-900">{item.title}</h3>
                              <p className="text-[13px] leading-relaxed text-gray-500">{item.body}</p>
                          </div>
                      ))}
                  </div>
              </div>
          </section>

          {/* B2B PARTNER */}
          <section className="relative overflow-hidden bg-gray-950 py-16">
              <div className="relative px-5">
                  <p className="mb-3 text-[11px] font-bold uppercase tracking-widest text-emerald-400">ব্যবসায়িক অংশীদারিত্ব</p>
                  <h2 className="mb-4 text-2xl font-extrabold leading-tight text-white">
                      আপনার ক্লিনিকের সেবাকে রূপান্তর করুন <br/>
                      <span className="bg-gradient-to-r from-emerald-400 to-blue-400 bg-clip-text text-transparent">ডিজিটাল পাওয়ারহাউজে।</span>
                  </h2>
                  <p className="mb-6 text-[13px] leading-relaxed text-gray-400">
                      সরাসরি <span className="font-semibold text-white">হাই-ইনটেন্ট রোগী</span> পান। চেম্বার, ল্যাব, নাকি টেলিহেলথ—যেটাই হোক, ডাক্তার সাব আপনার সবচেয়ে বিশ্বস্ত ডিজিটাল মাধ্যম।
                  </p>
                  <button className="flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-emerald-500 to-emerald-600 px-6 py-3.5 text-[14px] font-bold text-white shadow-xl shadow-emerald-500/20 active:scale-95 transition-transform" onClick={() => window.location.href = "/join-as-partner"}>
                      <Building2 className="h-4 w-4" /> পার্টনার হিসেবে আজই যোগ দিন <ArrowRight className="h-4 w-4" />
                  </button>
                  <p className="mt-3 text-center text-[10px] text-gray-500">কোনো সেটআপ ফি নেই · ২৪ ঘণ্টার মধ্যে অ্যাক্টিভেশন</p>

                  <div className="mt-10 rounded-2xl border border-white/5 bg-white/5 p-5 backdrop-blur-sm">
                      <p className="mb-4 text-[11px] font-bold uppercase tracking-widest text-gray-400">অন্তর্ভুক্ত সুবিধাসমূহ</p>
                      <div className="space-y-3">
                          {PARTNER_BENEFITS.map(b => (
                              <div key={b} className="flex items-start gap-2.5">
                                  <div className="mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center rounded-full bg-emerald-500/20">
                                      <CheckCircle2 className="h-3 w-3 text-emerald-400" />
                                  </div>
                                  <p className="text-[12px] text-gray-300 leading-relaxed">{b}</p>
                              </div>
                          ))}
                      </div>
                  </div>
              </div>
          </section>

        </div>

        </div>
      </div>
    </div>
  );
}
