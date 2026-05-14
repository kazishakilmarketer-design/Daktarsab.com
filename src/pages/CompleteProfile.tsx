import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { User, Phone, ShieldCheck, ArrowRight, Calendar, MapPin, Droplets } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { useNavigate } from "react-router-dom";
import doctorAvatar from "@/assets/doctor-avatar.png";

const BLOOD_GROUPS = ["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"];
const DIVISIONS = ["ঢাকা", "চট্টগ্রাম", "রাজশাহী", "খুলনা", "বরিশাল", "সিলেট", "রংপুর", "ময়মনসিংহ"];
const DISTRICTS: Record<string, string[]> = {
  "ঢাকা": ["ঢাকা", "গাজীপুর", "নারায়ণগঞ্জ", "মানিকগঞ্জ", "নরসিংদী", "মুন্সীগঞ্জ", "কিশোরগঞ্জ"],
  "চট্টগ্রাম": ["চট্টগ্রাম", "কক্সবাজার", "রাঙামাটি", "ফেনী", "নোয়াখালী", "চাঁদপুর", "লক্ষ্মীপুর"],
  "রাজশাহী": ["রাজশাহী", "নওগাঁ", "নাটোর", "পাবনা", "সিরাজগঞ্জ", "বগুড়া", "জয়পুরহাট"],
  "খুলনা": ["খুলনা", "বাগেরহাট", "সাতক্ষীরা", "যশোর", "নড়াইল", "কুষ্টিয়া", "মেহেরপুর"],
  "বরিশাল": ["বরিশাল", "পটুয়াখালী", "ভোলা", "পিরোজপুর", "ঝালকাঠি", "বরগুনা"],
  "সিলেট": ["সিলেট", "মৌলভীবাজার", "হবিগঞ্জ", "সুনামগঞ্জ"],
  "রংপুর": ["রংপুর", "দিনাজপুর", "কুড়িগ্রাম", "গাইবান্ধা", "নীলফামারী", "ঠাকুরগাঁও"],
  "ময়মনসিংহ": ["ময়মনসিংহ", "জামালপুর", "শেরপুর", "নেত্রকোণা"],
};

export default function CompleteProfile() {
    const { user, hasCompletedProfile, refreshProfile } = useAuth();
    const { toast } = useToast();
    const navigate = useNavigate();
    const [fullName, setFullName] = useState("");
    const [phone, setPhone] = useState("");
    const [age, setAge] = useState("");
    const [gender, setGender] = useState("");
    const [bloodGroup, setBloodGroup] = useState("");
    const [division, setDivision] = useState("");
    const [district, setDistrict] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);

    // Pre-fill name from Google/OAuth metadata
    useEffect(() => {
        if (user?.user_metadata) {
            setFullName(
                user.user_metadata.full_name ||
                user.user_metadata.name ||
                user.user_metadata.display_name ||
                ""
            );
        }
    }, [user]);

    // Redirect if profile already complete
    useEffect(() => {
        if (hasCompletedProfile) {
            navigate("/home");
        }
    }, [hasCompletedProfile, navigate]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!user) {
            toast({ title: "লগইন সেশন পাওয়া যায়নি", description: "অনুগ্রহ করে আবার লগইন করুন।", variant: "destructive" });
            navigate("/auth");
            return;
        }

        if (!fullName.trim()) {
            toast({ title: "নাম আবশ্যক", description: "অনুগ্রহ করে আপনার পূর্ণ নাম দিন।", variant: "destructive" });
            return;
        }
        if (!phone.trim()) {
            toast({ title: "ফোন নম্বর আবশ্যক", description: "অনুগ্রহ করে আপনার মোবাইল নম্বর দিন।", variant: "destructive" });
            return;
        }

        setIsSubmitting(true);
        try {
            // Check if profile row already exists (created by trigger or previous attempt)
            const { data: existing } = await supabase
                .from("profiles")
                .select("id")
                .eq("user_id", user.id)
                .maybeSingle();

            let error;
            const payload = {
                full_name: fullName.trim(),
                phone: phone.trim(),
                age: age || null,
                gender: gender || null,
                blood_group: bloodGroup || null,
                district: district || division || null,
            };
            if (existing) {
                const res = await (supabase as any).from("profiles").update(payload).eq("user_id", user.id);
                error = res.error;
            } else {
                const res = await (supabase as any).from("profiles").insert({ user_id: user.id, ...payload });
                error = res.error;
            }

            if (error) throw error;

            toast({ title: "প্রোফাইল সেটআপ সফল! 🎉", description: "স্বাগতম ডাক্তার সাব-এ।" });
            refreshProfile().catch(console.error); // Non-blocking
            navigate("/home");
        } catch (err: any) {
            console.error("Profile save error:", err);
            toast({
                title: "সমস্যা হয়েছে",
                description: err?.message || "প্রোফাইল সেভ করা যায়নি। আবার চেষ্টা করুন।",
                variant: "destructive",
            });
        } finally {
            setIsSubmitting(false);
        }
    };

    if (!user) {
        return (
            <div className="flex min-h-[100dvh] items-center justify-center bg-slate-50">
                <div className="text-center space-y-4">
                    <div className="inline-block animate-spin h-8 w-8 rounded-full border-4 border-emerald-500 border-t-transparent" />
                    <p className="text-sm text-gray-500">অপেক্ষা করুন...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="flex min-h-[100dvh] items-center justify-center bg-gradient-to-br from-slate-50 to-emerald-50/50 p-4">
            <motion.div
                initial={{ opacity: 0, scale: 0.95, y: 10 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                className="w-full max-w-sm rounded-[2rem] bg-white shadow-xl shadow-emerald-900/5 ring-1 ring-black/5 overflow-hidden"
            >
                {/* Header */}
                <div className="bg-gradient-to-b from-emerald-500 to-emerald-600 px-6 pt-8 pb-10 text-center relative overflow-hidden">
                    <div className="absolute -top-24 -right-24 w-48 h-48 bg-white/10 rounded-full blur-2xl" />
                    <div className="absolute -bottom-12 -left-12 w-32 h-32 bg-teal-400/20 rounded-full blur-xl" />
                    <div className="relative z-10 flex flex-col items-center">
                        <div className="h-20 w-20 overflow-hidden rounded-2xl border-[3px] border-white/20 shadow-lg bg-white mb-4">
                            <img src={doctorAvatar} alt="ডাক্তার সাব" className="h-full w-full object-cover" />
                        </div>
                        <h1 className="text-2xl font-bold text-white mb-1">স্বাগতম!</h1>
                        <p className="text-emerald-50 text-sm opacity-90 leading-relaxed max-w-[240px] mx-auto">
                            এগিয়ে যেতে আপনার প্রোফাইল সম্পূর্ণ করুন।
                        </p>
                    </div>
                </div>

                {/* Form */}
                <div className="relative -mt-6 bg-white rounded-t-3xl pt-8 px-6 pb-6 shadow-[0_-8px_16px_rgba(0,0,0,0.05)]">
                    <form onSubmit={handleSubmit} className="space-y-3">
                        {/* Full Name */}
                        <div className="space-y-1.5">
                            <Label htmlFor="full-name" className="text-xs font-semibold text-slate-700 ml-1">
                                পূর্ণ নাম <span className="text-rose-500">*</span>
                            </Label>
                            <div className="relative">
                                <User className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                                <Input id="full-name" value={fullName} onChange={(e) => setFullName(e.target.value)} placeholder="আপনার পূর্ণ নাম" className="pl-10 h-11 bg-slate-50/50 border-slate-200 focus:border-emerald-500 rounded-xl" required />
                            </div>
                        </div>
                        {/* Phone */}
                        <div className="space-y-1.5">
                            <Label htmlFor="phone-number" className="text-xs font-semibold text-slate-700 ml-1">
                                মোবাইল <span className="text-rose-500">*</span>
                            </Label>
                            <div className="relative">
                                <Phone className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                                <Input id="phone-number" value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="01XXXXXXXXX" type="tel" className="pl-10 h-11 bg-slate-50/50 border-slate-200 focus:border-emerald-500 rounded-xl" required />
                            </div>
                        </div>
                        {/* Age & Gender */}
                        <div className="grid grid-cols-2 gap-2">
                            <div className="space-y-1.5">
                                <Label className="text-xs font-semibold text-slate-700 ml-1">বয়স</Label>
                                <div className="relative">
                                    <Calendar className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                                    <Input type="number" min="1" max="120" value={age} onChange={e => setAge(e.target.value)} placeholder="যেমন: 28" className="pl-9 h-11 bg-slate-50/50 border-slate-200 focus:border-emerald-500 rounded-xl" />
                                </div>
                            </div>
                            <div className="space-y-1.5">
                                <Label className="text-xs font-semibold text-slate-700 ml-1">লিঙ্গ</Label>
                                <select value={gender} onChange={e => setGender(e.target.value)} className="w-full h-11 px-3 text-sm bg-slate-50/50 border border-slate-200 rounded-xl focus:border-emerald-500 focus:ring-0 font-inherit outline-none">
                                    <option value="">নির্বাচন করুন</option>
                                    <option value="পুরুষ">পুরুষ</option>
                                    <option value="মহিলা">মহিলা</option>
                                    <option value="অন্যান্য">অন্যান্য</option>
                                </select>
                            </div>
                        </div>
                        {/* Blood Group */}
                        <div className="space-y-1.5">
                            <Label className="text-xs font-semibold text-slate-700 ml-1">রক্তের গ্রুপ</Label>
                            <div className="relative">
                                <Droplets className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-red-400" />
                                <select value={bloodGroup} onChange={e => setBloodGroup(e.target.value)} className="w-full h-11 pl-10 pr-3 text-sm bg-slate-50/50 border border-slate-200 rounded-xl focus:border-emerald-500 focus:ring-0 outline-none">
                                    <option value="">রক্তের গ্রুপ</option>
                                    {BLOOD_GROUPS.map(g => <option key={g} value={g}>{g}</option>)}
                                </select>
                            </div>
                        </div>
                        {/* Division → District */}
                        <div className="grid grid-cols-2 gap-2">
                            <div className="space-y-1.5">
                                <Label className="text-xs font-semibold text-slate-700 ml-1">বিভাগ</Label>
                                <div className="relative">
                                    <MapPin className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                                    <select value={division} onChange={e => { setDivision(e.target.value); setDistrict(""); }} className="w-full h-11 pl-9 pr-3 text-sm bg-slate-50/50 border border-slate-200 rounded-xl focus:border-emerald-500 outline-none">
                                        <option value="">বিভাগ</option>
                                        {DIVISIONS.map(d => <option key={d} value={d}>{d}</option>)}
                                    </select>
                                </div>
                            </div>
                            <div className="space-y-1.5">
                                <Label className="text-xs font-semibold text-slate-700 ml-1">জেলা</Label>
                                <select value={district} onChange={e => setDistrict(e.target.value)} disabled={!division} className="w-full h-11 px-3 text-sm bg-slate-50/50 border border-slate-200 rounded-xl focus:border-emerald-500 outline-none">
                                    <option value="">জেলা</option>
                                    {(DISTRICTS[division] || []).map(d => <option key={d} value={d}>{d}</option>)}
                                </select>
                            </div>
                        </div>
                        {/* Submit */}
                        <div className="pt-2">
                            <Button type="submit" className="w-full h-12 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold shadow-lg" disabled={isSubmitting || !fullName.trim() || !phone.trim()}>
                                <span className="flex items-center justify-center gap-2">
                                    {isSubmitting ? "সেভ হচ্ছে..." : "সংরক্ষণ করুন"}
                                    {!isSubmitting && <ArrowRight className="h-4 w-4" />}
                                </span>
                            </Button>
                        </div>
                        <p className="flex items-center justify-center gap-1.5 text-[11px] font-medium text-slate-400 mt-2">
                            <ShieldCheck className="h-3.5 w-3.5 text-emerald-500" /> আপনার তথ্য সম্পূর্ণ সুরক্ষিত
                        </p>
                    </form>
                </div>
            </motion.div>
        </div>
    );
}
