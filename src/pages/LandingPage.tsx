/**
 * Doctor Saab — Premium Landing Page (v3)
 * Light hero, full-width 60/40 layout, professional alignment
 */
import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
    Stethoscope, Shield, ArrowRight, CheckCircle2,
    Building2, MessageCircle, MapPin, Menu, X,
    Ambulance, Lock, ChevronDown, Star, Zap, Search, Droplet
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import doctorAvatar from "@/assets/doctor-avatar.png";
import BookingModal, { ServiceType } from "@/components/BookingModal";
import { FileText } from "lucide-react";
import Logo from "@/components/Logo";

/* ─── Motion wrapper ─────────────────────────────────────────────────────── */
function Reveal({ children, delay = 0, className = "" }: { children: React.ReactNode; delay?: number; className?: string }) {
    return (
        <motion.div
            initial={{ opacity: 0, y: 28 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-60px" }}
            transition={{ duration: 0.6, delay, ease: [0.22, 1, 0.36, 1] }}
            className={className}
        >
            {children}
        </motion.div>
    );
}

/* ─── Data ───────────────────────────────────────────────────────────────── */
const STATS = [
    { value: "১২,৭৫০+", label: "পরামর্শ সম্পন্ন", accent: "#10b981" },
    { value: "২,২৩২+", label: "ভেরিফাইড ডাক্তার", accent: "#3b82f6" },
    { value: "১২,০০০+", label: "পার্টনার হাসপাতাল", accent: "#8b5cf6" },
    { value: "২৪/৭", label: "জরুরি সেবা ও সাপোর্ট", accent: "#f59e0b" },
];

const SOLUTION_CARDS = [
    {
        icon: Ambulance, accent: "#ef4444",
        bg: "from-red-50 to-orange-50", border: "border-red-100",
        tag: "২৪/৭ জরুরি সেবা", title: "আপৎকালীন দিশারি",
        body: "বিপদের প্রথম কয়েক মিনিট মূল্যবান। মাঝরাতে বা জরুরি প্রয়োজনে আতঙ্কিত হবেন না। তাৎক্ষণিক প্রাথমিক চিকিৎসা নির্দেশিকা এবং নিকটস্থ অ্যাম্বুলেন্স ও হাসপাতালের দ্রুত সংযোগ।",
    },
    {
        icon: Stethoscope, accent: "#3b82f6",
        bg: "from-blue-50 to-indigo-50", border: "border-blue-100",
        tag: "AI-চালিত বিশ্লেষণ", title: "সঠিক বিশেষজ্ঞ নির্বাচন",
        body: "ভুল ডাক্তার দেখিয়ে সময় ও অর্থ নষ্ট করবেন না। আমাদের স্মার্ট AI আপনার উপসর্গ বিশ্লেষণ করে জানাবে কোন বিশেষজ্ঞ আপনার জন্য সবচেয়ে সঠিক।",
    },
    {
        icon: Lock, accent: "#10b981",
        bg: "from-emerald-50 to-teal-50", border: "border-emerald-100",
        tag: "১০০% এনক্রিপ্টেড", title: "সুরক্ষা ও গোপনীয়তা",
        body: "লজ্জা নয়, সঠিক সমাধানই সুস্থতার চাবিকাঠি। গেস্ট মোডে পরিচয় গোপন রেখে কথা বলুন নারী স্বাস্থ্য বা মানসিক সমস্যার বিষয়ে। সম্পূর্ণ নিরাপদ।",
    },
];

const PARTNER_BENEFITS = [
    "সরাসরি হাই-ইনটেন্ট ভেরিফাইড রোগী (High-Intent Leads)",
    "আপনার প্র্যাকটিস বা ক্লিনিকের ডিজিটাল রূপান্তর",
    "অত্যাধুনিক টেলিমেডিসিন এবং চেম্বার ম্যানেজমেন্ট সুবিধা",
    "১২,০০০+ হাসপাতাল ও হাজারো ডাক্তারের শক্তিশালী নেটওয়ার্ক",
    "সম্পূর্ণ ফ্রি রেজিস্ট্রেশন — কোনো হিডেন চার্জ নেই",
];

/* ─── Stat counter ───────────────────────────────────────────────────────── */
function StatBadge({ value, label, accent }: { value: string; label: string; accent: string }) {
    const [show, setShow] = useState(false);
    return (
        <motion.div onViewportEnter={() => setShow(true)} viewport={{ once: true }} className="flex flex-col items-center gap-1">
            <motion.p
                initial={{ scale: 0.7, opacity: 0 }}
                animate={show ? { scale: 1, opacity: 1 } : {}}
                transition={{ type: "spring", stiffness: 240, damping: 18 }}
                className="text-3xl font-black md:text-4xl" style={{ color: accent }}
            >{value}</motion.p>
            <p className="text-xs font-medium text-gray-500 md:text-sm">{label}</p>
        </motion.div>
    );
}

/* ─── Component ─────────────────────────────────────────────────────────── */
export default function LandingPage() {
    const navigate = useNavigate();
    const { toast } = useToast();
    const onEnterApp = () => navigate("/home");
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
    const [scrolled, setScrolled] = useState(false);
    const [searchMode, setSearchMode] = useState('doctors');
    const [searchQuery, setSearchQuery] = useState("");

    // Booking Modal State
    const [bookingOpen, setBookingOpen] = useState(false);
    const [bookingConfig, setBookingConfig] = useState<{ service: ServiceType, name: string }>({ service: 'hospital', name: '' });

    const handleSearch = () => {
        if (searchMode === 'ambulances' || searchMode === 'blood') {
            toast({
                title: "শীঘ্রই আসছে (Coming Soon)",
                description: searchMode === 'ambulances' ? "আমাদের অ্যাম্বুলেন্স নেটওয়ার্ক খুব দ্রুত যুক্ত হচ্ছে।" : "ব্লাড ব্যাংক এবং ডোনার নেটওয়ার্ক শীঘ্রই চালু হবে।",
            });
            return;
        }

        const prompt = searchQuery.trim()
            ? `আমি ${searchMode === 'doctors' ? 'ডাক্তার' : 'হাসপাতাল'} খুঁজছি: ${searchQuery}`
            : "";

        navigate("/chat", { state: { initialPrompt: prompt } });
    };

    useEffect(() => {
        const fn = () => setScrolled(window.scrollY > 60);
        window.addEventListener("scroll", fn);
        return () => window.removeEventListener("scroll", fn);
    }, []);

    return (
        <div className="min-h-screen overflow-y-auto bg-white text-gray-900 antialiased">

            {/* ══ STICKY NAV ══════════════════════════════════════════════════════ */}
            <nav className={`fixed top-0 z-50 w-full transition-all duration-300 ${scrolled ? "border-b border-gray-100 bg-white shadow-sm" : "bg-white/80 backdrop-blur-sm"
                }`}>
                <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-5 md:px-10">
                    {/* Logo */}
                    <div className="flex items-center shrink-0">
                        <Logo className="h-8 md:h-10" />
                    </div>

                    {/* Desktop nav */}
                    <div className="hidden items-center gap-1 md:flex">
                        <a href="#features" className="rounded-lg px-4 py-2 text-sm font-medium text-gray-600 hover:bg-gray-50 hover:text-gray-900">সমাধান</a>
                        <a href="#partner-section" className="rounded-lg px-4 py-2 text-sm font-medium text-gray-600 hover:bg-gray-50 hover:text-gray-900">পার্টনার</a>
                        <Button variant="outline" size="sm" className="ml-2 gap-1.5 border-emerald-200 text-emerald-700 hover:bg-emerald-50"
                            onClick={() => document.getElementById("partner-section")?.scrollIntoView({ behavior: "smooth" })}>
                            <Building2 className="h-3.5 w-3.5" /> পার্টনার হোন
                        </Button>
                        <Button size="sm" className="ml-1 gap-1.5 bg-emerald-600 text-white shadow-md shadow-emerald-200 hover:bg-emerald-700" onClick={onEnterApp}>
                            <MessageCircle className="h-3.5 w-3.5" /> শুরু করুন
                        </Button>
                    </div>

                    {/* Mobile hamburger */}
                    <button className="flex h-9 w-9 items-center justify-center rounded-lg text-gray-600 hover:bg-gray-100 md:hidden"
                        onClick={() => setMobileMenuOpen(o => !o)}>
                        {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
                    </button>
                </div>

                {/* Mobile menu */}
                {mobileMenuOpen && (
                    <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }}
                        className="border-t border-gray-100 bg-white px-5 pb-5 pt-3 shadow-lg md:hidden">
                        <div className="flex flex-col gap-2">
                            <Button className="w-full gap-2 bg-emerald-600 text-white hover:bg-emerald-700" onClick={onEnterApp}>
                                <MessageCircle className="h-4 w-4" /> এআই পরামর্শ শুরু করুন
                            </Button>
                            <Button variant="outline" className="w-full gap-2 border-emerald-200 text-emerald-700"
                                onClick={() => { setMobileMenuOpen(false); document.getElementById("partner-section")?.scrollIntoView({ behavior: "smooth" }); }}>
                                <Building2 className="h-4 w-4" /> পার্টনার হিসেবে যোগ দিন
                            </Button>
                        </div>
                    </motion.div>
                )}
            </nav>

            {/* ══ HERO ════════════════════════════════════════════════════════════ */}
            {/* Light gradient: white → teal-50 */}
            <section className="relative overflow-hidden bg-gradient-to-br from-white via-teal-50/60 to-blue-50/80 pt-24 pb-16 md:pt-28 md:pb-20">
                {/* Subtle decorative blobs */}
                <div className="pointer-events-none absolute inset-0 overflow-hidden">
                    <div className="absolute -right-32 -top-32 h-[480px] w-[480px] rounded-full bg-emerald-100/60 blur-[100px]" />
                    <div className="absolute -bottom-24 -left-24 h-[400px] w-[400px] rounded-full bg-blue-100/50 blur-[80px]" />
                </div>

                {/* Full-width container */}
                <div className="relative mx-auto max-w-7xl px-5 md:px-10">

                    {/* Expanded Hero Layout for wider H1 */}
                    <div className="grid grid-cols-1 items-center gap-8 md:grid-cols-12 md:gap-4 lg:gap-6">

                        {/* ── Left column ── */}
                        <div className="md:col-span-8 lg:col-span-8 lg:pr-10">

                            {/* Badge */}
                            <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
                                className="mb-5 inline-flex items-center gap-2 rounded-full border border-emerald-200 bg-emerald-50 px-4 py-1.5 text-[11px] font-bold text-emerald-700">
                                <Star className="h-3 w-3 fill-emerald-500 text-emerald-500" />
                                বাংলাদেশের #১ ডিজিটাল স্বাস্থ্যসেবা নেটওয়ার্ক
                                <Zap className="h-3 w-3 text-emerald-500" />
                            </motion.div>

                            {/* H1 — main headline */}
                            <motion.h1 initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.18, duration: 0.65, ease: [0.22, 1, 0.36, 1] }}
                                className="mb-3 text-[32px] md:text-[42px] lg:text-[54px] font-black leading-[1.4] tracking-tight text-gray-900">
                                <span className="text-emerald-600">বিনামূল্যে</span> বাংলাদেশের নির্ভরযোগ্য ডিজিটাল স্বাস্থ্যসেবা নেটওয়ার্ক
                            </motion.h1>

                            {/* H2 — sub-headline */}
                            <motion.h2 initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3, duration: 0.55 }}
                                className="mb-4 mt-5 text-xl lg:text-2xl font-black text-emerald-600/90">
                                কোনো দালাল নেই, কোনো লুকানো চার্জ নেই।
                            </motion.h2>

                            {/* Body */}
                            <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.4 }}
                                className="mb-8 max-w-xl text-base leading-relaxed text-gray-500 md:text-lg">
                                ১,৬২০+ বিশেষজ্ঞ ডাক্তার এবং ১,০০০+ হাসপাতালের ভেরিফাইড ডাটাবেস।
                                AI-চালিত প্রাথমিক পরামর্শ থেকে শুরু করে সঠিক বিশেষজ্ঞ নির্বাচন —
                                সবই এখন আপনার হাতের মুঠোয়।
                            </motion.p>

                            {/* Hero Search Box (Multi-Vertical) */}
                            <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.48 }}
                                className="mt-8 relative z-10">
                                <div className="rounded-2xl bg-white p-2.5 shadow-xl shadow-emerald-100/50 border border-gray-100 max-w-xl">
                                    {/* Tabs */}
                                    <div className="flex gap-1 sm:gap-2 border-b border-gray-50 pb-2 mb-2.5 px-2 overflow-x-auto no-scrollbar">
                                        {[
                                            { id: 'doctors', label: 'ডাক্তার', icon: Stethoscope },
                                            { id: 'ambulances', label: 'অ্যাম্বুলেন্স', icon: Ambulance },
                                            { id: 'blood', label: 'ব্লাড ব্যাংক', icon: Droplet },
                                            { id: 'clinics', label: 'ক্লিনিক', icon: Building2 },
                                        ].map(tab => (
                                            <button
                                                key={tab.id}
                                                onClick={() => setSearchMode(tab.id)}
                                                className={`flex items-center gap-1.5 px-3.5 py-1.5 text-sm font-semibold rounded-full whitespace-nowrap transition-colors ${searchMode === tab.id ? 'bg-emerald-50 text-emerald-700' : 'text-gray-500 hover:bg-gray-50 hover:text-gray-900'}`}>
                                                <tab.icon className="h-3.5 w-3.5" />
                                                {tab.label}
                                            </button>
                                        ))}
                                    </div>
                                    {/* Input & Button */}
                                    <div className="flex items-center gap-2 px-2 pb-1 relative">
                                        <div className="hidden sm:flex items-center justify-center p-2 bg-gray-50 rounded-xl">
                                            <Search className="h-5 w-5 text-gray-400" />
                                        </div>
                                        <input
                                            type="text"
                                            value={searchQuery}
                                            onChange={(e) => setSearchQuery(e.target.value)}
                                            onKeyDown={(e) => {
                                                if (e.key === 'Enter') handleSearch();
                                            }}
                                            placeholder={
                                                searchMode === 'doctors' ? "বিশেষজ্ঞ ডাক্তার খুঁজুন (যেমন: কার্ডিওলজিস্ট)..." :
                                                    searchMode === 'ambulances' ? "জরুরি অ্যাম্বুলেন্স সার্ভিস খুঁজুন..." :
                                                        searchMode === 'blood' ? "রক্তের গ্রুপ ও ডোনার খুঁজুন..." :
                                                            "নিকটস্থ ক্লিনিক বা হাসপাতাল খুঁজুন..."
                                            }
                                            className="flex-1 bg-transparent text-[14px] sm:text-[15px] outline-none placeholder:text-gray-400 font-medium w-full"
                                        />
                                        <Button onClick={handleSearch} className="bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl px-6 sm:px-8 h-11 text-sm font-bold shadow-md shadow-emerald-200">
                                            খুঁজুন
                                        </Button>
                                    </div>
                                </div>
                            </motion.div>

                            {/* Trust line */}
                            <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.6 }}
                                className="mt-5 flex items-center gap-1.5 text-[12px] text-gray-400">
                                <Shield className="h-3.5 w-3.5 text-emerald-500" />
                                নিবন্ধন ছাড়াই ব্যবহার করুন · বিনামূল্যে · গেস্ট মোড উপলব্ধ
                            </motion.p>
                        </div>

                        {/* ── Right column — Doctor card ── */}
                        <motion.div initial={{ opacity: 0, x: 24 }} animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: 0.28, duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
                            className="flex justify-center md:col-span-4 lg:col-span-4 lg:justify-end">

                            <div className="relative w-full max-w-[320px]">
                                {/* Soft glow */}
                                <div className="absolute -inset-5 rounded-3xl bg-emerald-100/50 blur-2xl" />

                                {/* Card */}
                                <div className="relative overflow-hidden rounded-3xl border border-gray-100 bg-white shadow-2xl shadow-gray-200/80">
                                    {/* Top accent */}
                                    <div className="h-2 w-full bg-gradient-to-r from-emerald-500 to-blue-500" />

                                    <div className="p-6">
                                        {/* Avatar */}
                                        <div className="mx-auto mb-4 h-28 w-28 overflow-hidden rounded-2xl border-4 border-emerald-100 shadow-lg">
                                            <img src={doctorAvatar} alt="ডাক্তার সাব" className="h-full w-full object-cover" />
                                        </div>

                                        {/* Status */}
                                        <div className="mb-4 flex items-center justify-center gap-2">
                                            <span className="relative flex h-2.5 w-2.5">
                                                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
                                                <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-emerald-500" />
                                            </span>
                                            <span className="text-xs font-semibold text-emerald-600">এখন সক্রিয়</span>
                                        </div>

                                        {/* Chat bubble */}
                                        <div className="rounded-2xl bg-gradient-to-br from-emerald-50 to-teal-50 border border-emerald-100 px-4 py-3 text-center">
                                            <p className="text-sm font-bold text-gray-800">আপনার সমস্যা বলুন</p>
                                            <p className="mt-0.5 text-xs text-gray-500">আমি ২৪/৭ আপনার পাশে আছি</p>
                                        </div>

                                        {/* Quick stats */}
                                        <div className="mt-4 grid grid-cols-2 gap-2">
                                            <div className="rounded-xl bg-gray-50 py-2 text-center">
                                                <p className="text-sm font-black text-emerald-600">২,২৩২+</p>
                                                <p className="text-[10px] text-gray-400">ডাক্তার</p>
                                            </div>
                                            <div className="rounded-xl bg-gray-50 py-2 text-center">
                                                <p className="text-sm font-black text-blue-600">১২,০০০+</p>
                                                <p className="text-[10px] text-gray-400">হাসপাতাল</p>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    </div>
                </div>

                {/* Scroll hint */}
                <motion.div animate={{ y: [0, 7, 0] }} transition={{ repeat: Infinity, duration: 2 }}
                    className="absolute bottom-4 left-1/2 -translate-x-1/2 text-gray-300">
                    <ChevronDown className="h-5 w-5" />
                </motion.div>
            </section>

            {/* ══ BANNER ════════════════════════════════════════════════════════════ */}
            <div className="bg-emerald-600 px-4 py-3 text-center text-emerald-50 md:px-6">
                <p className="text-sm font-medium">ডাক্তার সাব সম্পূর্ণ বিনামূল্যে। আমরা কোনো গোপন চার্জ কাটি না।</p>
            </div>

            {/* ══ STATS ═══════════════════════════════════════════════════════════ */}
            <section className="border-y border-gray-100 bg-white py-12 md:py-16">
                <div className="mx-auto max-w-7xl px-5 md:px-10">
                    <Reveal className="mb-2 text-center">
                        <p className="text-xs font-bold uppercase tracking-widest text-gray-400">আমাদের প্রভাব</p>
                    </Reveal>
                    <div className="mt-6 grid grid-cols-2 gap-8 md:grid-cols-4 md:gap-12">
                        {STATS.map((s, i) => (
                            <Reveal key={s.label} delay={i * 0.08} className="text-center">
                                <StatBadge {...s} />
                            </Reveal>
                        ))}
                    </div>
                </div>
            </section>

            {/* ══ SOLUTION CARDS ══════════════════════════════════════════════════ */}
            <section id="features" className="bg-gray-50/70 py-20 md:py-28">
                <div className="mx-auto max-w-7xl px-5 md:px-10">
                    <Reveal className="mb-14 text-center">
                        <p className="mb-3 text-xs font-bold uppercase tracking-widest text-emerald-600">সমাধান</p>
                        <h2 className="text-2xl font-extrabold text-gray-900 md:text-4xl">আমরা কীভাবে সাহায্য করি?</h2>
                        <p className="mx-auto mt-3 max-w-lg text-sm text-gray-500 md:text-base">
                            সঠিক সময়ে সঠিক পদক্ষেপ — আপনার সুরক্ষায় এবং পরিবারের সুস্বাস্থ্যে।
                        </p>
                    </Reveal>

                    <div className="grid gap-6 md:grid-cols-3">
                        {SOLUTION_CARDS.map((card, i) => (
                            <Reveal key={card.title} delay={i * 0.12}>
                                <motion.article
                                    whileHover={{ y: -6, boxShadow: `0 24px 60px -12px ${card.accent}33` }}
                                    transition={{ type: "spring", stiffness: 300, damping: 22 }}
                                    className={`group relative h-full cursor-default overflow-hidden rounded-3xl border bg-gradient-to-br p-7 shadow-md transition-shadow ${card.bg} ${card.border}`}>
                                    <div className="absolute -right-8 -top-8 h-32 w-32 rounded-full opacity-10 transition-transform duration-500 group-hover:scale-150" style={{ backgroundColor: card.accent }} />
                                    <div className="mb-5 inline-flex h-12 w-12 items-center justify-center rounded-2xl shadow-lg transition-transform duration-300 group-hover:scale-110" style={{ backgroundColor: card.accent }}>
                                        <card.icon className="h-6 w-6 text-white" />
                                    </div>
                                    <span className="mb-3 inline-block rounded-full px-2.5 py-0.5 text-[10px] font-bold text-white" style={{ backgroundColor: card.accent }}>{card.tag}</span>
                                    <h3 className="mb-2 text-lg font-extrabold text-gray-900">{card.title}</h3>
                                    <p className="text-sm leading-relaxed text-gray-600">{card.body}</p>
                                </motion.article>
                            </Reveal>
                        ))}
                    </div>
                </div>
            </section>

            {/* ══ HOW IT WORKS ════════════════════════════════════════════════════ */}
            <section className="bg-white py-20 md:py-28">
                <div className="mx-auto max-w-7xl px-5 md:px-10">
                    <Reveal className="mb-14 text-center">
                        <p className="mb-3 text-xs font-bold uppercase tracking-widest text-blue-600">প্রক্রিয়া</p>
                        <h2 className="text-2xl font-extrabold text-gray-900 md:text-4xl">মাত্র ৩টি ধাপে সুস্থ থাকুন</h2>
                    </Reveal>

                    <div className="grid gap-6 md:grid-cols-3">
                        {[
                            { step: "০১", title: "সমস্যা বলুন", body: "আপনার সমস্যা বাংলায়, ইংরেজিতে, যেকোনো ভাষায় লিখুন বা বলুন।", color: "from-emerald-500 to-emerald-700" },
                            { step: "০২", title: "AI বিশ্লেষণ", body: "ডাক্তার সাব AI আপনার উপসর্গ বিশ্লেষণ করে প্রাথমিক পরামর্শ ও বিশেষজ্ঞের সুপারিশ দেবে।", color: "from-blue-500 to-blue-700" },
                            { step: "০৩", title: "অ্যাপয়েন্টমেন্ট", body: "কাছের ভেরিফাইড হাসপাতালে অ্যাপয়েন্টমেন্ট বুক করুন সরাসরি অ্যাপ থেকে।", color: "from-purple-500 to-violet-700" },
                        ].map((item, i) => (
                            <Reveal key={item.step} delay={i * 0.1}>
                                <div className="relative rounded-3xl border border-gray-100 bg-white p-7 shadow-md">
                                    <div className={`mb-5 inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br ${item.color} text-sm font-black text-white shadow-lg`}>{item.step}</div>
                                    <h3 className="mb-2 text-base font-bold text-gray-900">{item.title}</h3>
                                    <p className="text-sm leading-relaxed text-gray-500">{item.body}</p>
                                </div>
                            </Reveal>
                        ))}
                    </div>

                    <Reveal delay={0.3} className="mt-12 text-center">
                        <Button size="lg" className="gap-2.5 bg-emerald-600 px-10 text-base font-bold shadow-xl shadow-emerald-200 hover:bg-emerald-700 min-h-[52px]" onClick={onEnterApp}>
                            এখনই শুরু করুন <ArrowRight className="h-5 w-5" />
                        </Button>
                        <p className="mt-3 text-xs text-gray-400">বিনামূল্যে · নিবন্ধন ছাড়াই · গেস্ট মোড উপলব্ধ</p>
                    </Reveal>
                </div>
            </section>

            {/* ══ BOOKING SECTION ══════════════════════════════════════════════════ */}
            <section className="bg-gray-50/70 py-20 md:py-28">
                <div className="mx-auto max-w-7xl px-5 md:px-10">
                    <Reveal className="mb-14 text-center">
                        <p className="mb-3 text-xs font-bold uppercase tracking-widest text-emerald-600">আমাদের সেবাসমূহ</p>
                        <h2 className="text-2xl font-extrabold text-gray-900 md:text-4xl">সহজ বুকিং, দ্রুত সেবা</h2>
                        <p className="mx-auto mt-3 max-w-lg text-sm text-gray-500 md:text-base">
                            যেকোনো স্বাস্থ্য সেবার জন্য এখনই বুকিং রিকোয়েস্ট পাঠান। আমাদের প্রতিনিধি দ্রুত যোগাযোগ করবে।
                        </p>
                    </Reveal>

                    <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
                        {[
                            { id: "hospital", title: "হাসপাতাল বুকিং", icon: Building2, desc: "সেরা হাসপাতালে বেড ও কেবিন বুকিং" },
                            { id: "clinic", title: "ক্লিনিক ও ল্যাব", icon: Stethoscope, desc: "টেস্ট ও চেকআপের জন্য সিরিয়াল আনুন" },
                            { id: "ambulance", title: "অ্যাম্বুলেন্স সেবা", icon: Ambulance, desc: "জরুরি মুহূর্তে দ্রুত অ্যাম্বুলেন্স" },
                            { id: "diagnostic", title: "ডায়াগনস্টিক", icon: FileText, desc: "সব ধরণের রক্ত ও প্যাথলজি টেস্ট" },
                        ].map((s, i) => (
                            <Reveal key={s.id} delay={i * 0.1}>
                                <div className="group flex h-full flex-col justify-between overflow-hidden rounded-3xl border border-gray-100 bg-white p-6 shadow-sm transition-all hover:-translate-y-1 hover:shadow-xl">
                                    <div>
                                        <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-600 group-hover:bg-emerald-500 group-hover:text-white transition-colors duration-300">
                                            <s.icon className="h-6 w-6" />
                                        </div>
                                        <h3 className="mb-2 text-lg font-bold text-gray-900">{s.title}</h3>
                                        <p className="mb-6 text-sm leading-relaxed text-gray-500">{s.desc}</p>
                                    </div>
                                    <Button
                                        onClick={() => {
                                            setBookingConfig({ service: s.id as ServiceType, name: s.title });
                                            setBookingOpen(true);
                                        }}
                                        variant="outline"
                                        className="w-full gap-2 border-emerald-200 text-emerald-700 hover:bg-emerald-50"
                                    >
                                        বুকিং করুন <ArrowRight className="h-4 w-4" />
                                    </Button>
                                </div>
                            </Reveal>
                        ))}
                    </div>
                </div>
            </section>

            {/* ══ PARTNER (dark B2B) ══════════════════════════════════════════════ */}
            <section id="partner-section" className="relative overflow-hidden bg-gray-950 py-24 md:py-32">
                <div className="pointer-events-none absolute inset-0">
                    <div className="absolute right-0 top-0 h-[500px] w-[500px] rounded-full bg-blue-600/10 blur-[120px]" />
                    <div className="absolute bottom-0 left-0 h-[400px] w-[400px] rounded-full bg-emerald-500/10 blur-[100px]" />
                </div>
                <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.015)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.015)_1px,transparent_1px)] bg-[size:60px_60px]" />

                <div className="relative mx-auto max-w-7xl px-5 md:px-10">
                    <div className="grid gap-14 md:grid-cols-2 md:items-center">
                        <div>
                            <Reveal>
                                <p className="mb-4 text-xs font-bold uppercase tracking-widest text-emerald-400">ব্যবসায়িক অংশীদারিত্ব</p>
                                <h2 className="mb-4 text-2xl font-extrabold leading-tight text-white md:text-4xl">
                                    আপনার ক্লিনিকের সেবাকে রূপান্তর করুন{" "}
                                    <span className="bg-gradient-to-r from-emerald-400 to-blue-400 bg-clip-text text-transparent">ডিজিটাল পাওয়ারহাউজে।</span>
                                </h2>
                                <p className="mb-6 text-sm leading-relaxed text-gray-400 md:text-base">
                                    সরাসরি <span className="font-semibold text-white">হাই-ইনটেন্ট রোগী</span> পান। চেম্বার, ল্যাব, নাকি টেলিহেলথ—যেটাই হোক, ডাক্তার সাব আপনার সবচেয়ে বিশ্বস্ত ডিজিটাল মাধ্যম।
                                </p>
                                <Button size="lg"
                                    className="gap-2.5 bg-gradient-to-r from-emerald-500 to-emerald-600 px-8 font-bold text-white shadow-xl shadow-emerald-500/20 hover:from-emerald-400 hover:to-emerald-500 min-h-[52px]"
                                    onClick={() => window.location.href = "/join-as-partner"}>
                                    <Building2 className="h-5 w-5" /> পার্টনার হিসেবে আজই যোগ দিন <ArrowRight className="h-4 w-4" />
                                </Button>
                                <p className="mt-3 text-xs text-gray-500">কোনো সেটআপ ফি নেই · ২৪ ঘণ্টার মধ্যে অ্যাক্টিভেশন</p>
                            </Reveal>
                        </div>

                        <Reveal delay={0.15}>
                            <div className="rounded-3xl border border-white/5 bg-white/5 p-7 backdrop-blur-sm">
                                <p className="mb-5 text-xs font-bold uppercase tracking-widest text-gray-400">অন্তর্ভুক্ত সুবিধাসমূহ</p>
                                <div className="space-y-4">
                                    {PARTNER_BENEFITS.map(b => (
                                        <div key={b} className="flex items-start gap-3">
                                            <div className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-emerald-500/20">
                                                <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400" />
                                            </div>
                                            <p className="text-sm text-gray-300">{b}</p>
                                        </div>
                                    ))}
                                </div>
                                <div className="mt-6 overflow-hidden rounded-2xl border border-emerald-500/20 bg-emerald-500/10">
                                    <div className="px-5 py-4 text-center">
                                        <p className="text-xs font-semibold uppercase tracking-wider text-emerald-400">কারা যুক্ত হতে পারবেন?</p>
                                        <p className="mt-2 text-sm text-gray-300">
                                            স্পেশালিস্ট ডাক্তার • ক্লিনিক • ডায়াগনস্টিক সেন্টার • অ্যাম্বুলেন্স • ব্লাড ব্যাংক
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </Reveal>
                    </div>
                </div>
            </section>

            <footer className="border-t border-gray-800 bg-gray-950 px-5 py-8 md:px-10">
                <div className="mx-auto max-w-7xl space-y-4">
                    {/* Emergency disclaimer banner */}
                    <div className="flex items-start gap-3 rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3">
                        <span className="text-lg shrink-0">🚨</span>
                        <p className="text-xs leading-relaxed text-red-300">
                            <strong className="text-red-400">জরুরি সতর্কবার্তা:</strong> ডাক্তারসাব একটি জরুরি প্রতিক্রিয়া সেবা নয়। আমরা একটি ডিজিটাল স্বাস্থ্যসেবা আবিষ্কার প্ল্যাটফর্ম।
                            তাৎক্ষণিক জরুরি সহায়তার জন্য অনুগ্রহ করে <strong className="text-white">৯৯৯</strong> এ কল করুন।{" "}
                            <span className="text-red-400/70">DaktarSab is not an emergency response service. For immediate emergency assistance, please call 999.</span>
                        </p>
                    </div>

                    {/* Bottom row */}
                    <div className="flex flex-col items-center justify-between gap-3 md:flex-row">
                        <div className="flex items-center gap-2.5 bg-white px-2 py-1 rounded-lg">
                            <Logo className="h-6" />
                        </div>
                        <p className="text-center text-[11px] text-gray-500 max-w-md">
                            ডাক্তারসাব একটি ডিজিটাল হেলথকেয়ার ডিসকভারি প্ল্যাটফর্ম। আমরা সরাসরি চিকিৎসা সেবা বা পেমেন্ট প্রক্রিয়া করি না।
                            সকল সেবার দায়িত্ব সংশ্লিষ্ট সেবাদাতার।
                        </p>
                        <div className="flex items-center gap-5">
                            <a href="/about" className="text-[12px] font-semibold text-gray-400 hover:text-emerald-400 transition-colors">আমাদের কথা ও পলিসি</a>
                            <p className="text-[11px] text-gray-500">© ২০২৬ Daktarsab.com</p>
                        </div>
                    </div>
                </div>
            </footer>

            {/* Booking Modal */}
            <BookingModal
                open={bookingOpen}
                onClose={() => setBookingOpen(false)}
                serviceType={bookingConfig.service}
                providerName={bookingConfig.name}
            />
        </div>
    );
}
