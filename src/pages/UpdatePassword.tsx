import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Lock, Eye, EyeOff, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import Logo from "@/components/Logo";

export default function UpdatePassword() {
    const navigate = useNavigate();
    const { toast } = useToast();
    const [password, setPassword] = useState("");
    const [confirm, setConfirm] = useState("");
    const [showPass, setShowPass] = useState(false);
    const [loading, setLoading] = useState(false);
    const [sessionReady, setSessionReady] = useState(false);

    // Supabase embeds the recovery token in the URL hash (#access_token=...&type=recovery)
    // The client automatically parses this and sets the session.
    useEffect(() => {
        const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
            if (event === "PASSWORD_RECOVERY" && session) {
                setSessionReady(true);
            }
        });

        // Also check if there's already a valid session (user clicked link, page loaded)
        supabase.auth.getSession().then(({ data: { session } }) => {
            if (session) setSessionReady(true);
        });

        return () => subscription.unsubscribe();
    }, []);

    const handleUpdate = async (e: React.FormEvent) => {
        e.preventDefault();
        if (password.length < 8) {
            toast({ title: "পাসওয়ার্ড কমপক্ষে ৮ অক্ষর হতে হবে", variant: "destructive" });
            return;
        }
        if (password !== confirm) {
            toast({ title: "পাসওয়ার্ড মিলছে না", description: "দুটি পাসওয়ার্ড একই হতে হবে।", variant: "destructive" });
            return;
        }
        setLoading(true);
        try {
            const { error } = await supabase.auth.updateUser({ password });
            if (error) throw error;
            toast({ title: "✅ পাসওয়ার্ড পরিবর্তন সফল!", description: "এখন লগইন করুন।" });
            await supabase.auth.signOut();
            navigate("/auth");
        } catch (err: any) {
            toast({ title: "সমস্যা হয়েছে", description: err?.message, variant: "destructive" });
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-emerald-50/50 p-4">
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="w-full max-w-sm bg-white rounded-3xl shadow-xl ring-1 ring-black/5 overflow-hidden"
            >
                {/* Header */}
                <div className="bg-gradient-to-b from-emerald-500 to-emerald-600 px-6 pt-8 pb-10 text-center">
                    <Logo className="h-12 mx-auto mb-3" />
                    <h1 className="text-xl font-bold text-white">নতুন পাসওয়ার্ড সেট করুন</h1>
                    <p className="text-emerald-100 text-sm mt-1">নিরাপদ পাসওয়ার্ড দিন (কমপক্ষে ৮ অক্ষর)</p>
                </div>

                {/* Form */}
                <div className="relative -mt-6 bg-white rounded-t-3xl pt-8 px-6 pb-6 shadow-[0_-8px_16px_rgba(0,0,0,0.05)]">
                    {!sessionReady ? (
                        <div className="text-center py-8 space-y-3">
                            <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-emerald-500 border-t-transparent" />
                            <p className="text-sm text-slate-500">রিকভারি সেশন যাচাই করা হচ্ছে...</p>
                            <p className="text-xs text-slate-400">
                                যদি কাজ না করে, ইমেইলের লিংকটি সরাসরি ব্রাউজারে ওপেন করুন।
                            </p>
                        </div>
                    ) : (
                        <form onSubmit={handleUpdate} className="space-y-4">
                            {/* New Password */}
                            <div className="space-y-1.5">
                                <Label className="text-xs font-semibold text-slate-700 ml-1">
                                    নতুন পাসওয়ার্ড <span className="text-rose-500">*</span>
                                </Label>
                                <div className="relative">
                                    <Lock className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                                    <Input
                                        type={showPass ? "text" : "password"}
                                        value={password}
                                        onChange={e => setPassword(e.target.value)}
                                        placeholder="কমপক্ষে ৮ অক্ষর"
                                        className="pl-10 pr-10 h-12 bg-slate-50/50 border-slate-200 focus:border-emerald-500 rounded-xl"
                                        required
                                    />
                                    <button
                                        type="button"
                                        className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400"
                                        onClick={() => setShowPass(s => !s)}
                                    >
                                        {showPass ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                                    </button>
                                </div>
                            </div>

                            {/* Confirm */}
                            <div className="space-y-1.5">
                                <Label className="text-xs font-semibold text-slate-700 ml-1">
                                    পাসওয়ার্ড নিশ্চিত করুন <span className="text-rose-500">*</span>
                                </Label>
                                <div className="relative">
                                    <Lock className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                                    <Input
                                        type="password"
                                        value={confirm}
                                        onChange={e => setConfirm(e.target.value)}
                                        placeholder="একই পাসওয়ার্ড আবার দিন"
                                        className="pl-10 h-12 bg-slate-50/50 border-slate-200 focus:border-emerald-500 rounded-xl"
                                        required
                                    />
                                </div>
                                {confirm && password !== confirm && (
                                    <p className="text-xs text-rose-500 ml-1">পাসওয়ার্ড মিলছে না</p>
                                )}
                            </div>

                            <div className="pt-2">
                                <Button
                                    type="submit"
                                    className="w-full h-12 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold shadow-lg"
                                    disabled={loading || !password || !confirm || password !== confirm}
                                >
                                    {loading ? "পরিবর্তন হচ্ছে..." : "পাসওয়ার্ড পরিবর্তন করুন →"}
                                </Button>
                            </div>

                            <p className="flex items-center justify-center gap-1.5 text-[11px] text-slate-400 mt-2">
                                <ShieldCheck className="h-3.5 w-3.5 text-emerald-500" />
                                এন্ড-টু-এন্ড এনক্রিপ্টেড
                            </p>
                        </form>
                    )}
                </div>
            </motion.div>
        </div>
    );
}
