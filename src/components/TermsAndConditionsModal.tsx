import { useState, useRef, useEffect } from "react";
import { motion } from "framer-motion";
import { ShieldCheck, AlertTriangle, CheckCircle2, PhoneCall } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";

interface TermsAndConditionsModalProps {
    open: boolean;
    /** Called when the user clicks "I Accept". The modal does not close itself. */
    onAccept: () => void;
    /** Role used for DB logging: 'user' | 'doctor' | 'ambulance' | 'blood_bank' */
    role?: string;
}

export default function TermsAndConditionsModal({
    open,
    onAccept,
    role = "user",
}: TermsAndConditionsModalProps) {
    const { user } = useAuth();
    const [agreed, setAgreed] = useState(false);
    const [submitting, setSubmitting] = useState(false);
    const [scrolledToBottom, setScrolledToBottom] = useState(false);
    const contentRef = useRef<HTMLDivElement>(null);

    // Reset when modal opens
    useEffect(() => {
        if (open) { setAgreed(false); setScrolledToBottom(false); }
    }, [open]);

    function handleScroll() {
        const el = contentRef.current;
        if (!el) return;
        if (el.scrollTop + el.clientHeight >= el.scrollHeight - 30) {
            setScrolledToBottom(true);
        }
    }

    async function handleAccept() {
        if (!agreed) return;
        setSubmitting(true);
        try {
            // Save to localStorage (persists across sessions)
            localStorage.setItem("daktarsab_tos_v1", JSON.stringify({ accepted: true, role, ts: Date.now() }));

            // Log to Supabase if user is authenticated
            if (user) {
                await supabase.from("terms_acceptance").insert({
                    user_id: user.id,
                    role,
                } as any);
            }
            onAccept();
        } catch (e) {
            console.error("T&C logging failed:", e);
            // Still allow user to proceed — logging is non-blocking
            onAccept();
        } finally {
            setSubmitting(false);
        }
    }

    return (
        <Dialog open={open} onOpenChange={() => { /* Cannot close by clicking outside — must accept */ }}>
            <DialogContent
                className="max-w-lg p-0 overflow-hidden border-0 shadow-2xl"
                onPointerDownOutside={(e) => e.preventDefault()}
                onEscapeKeyDown={(e) => e.preventDefault()}
            >
                <motion.div
                    initial={{ opacity: 0, scale: 0.97 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="flex flex-col max-h-[90dvh]"
                >
                    {/* Header */}
                    <DialogHeader className="bg-gradient-to-r from-emerald-600 to-teal-600 px-6 py-5 text-white shrink-0">
                        <div className="flex items-center gap-3 mb-1">
                            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/20 backdrop-blur-sm">
                                <ShieldCheck className="h-5 w-5" />
                            </div>
                            <div>
                                <DialogTitle className="text-lg font-bold text-white">
                                    শর্তাবলী ও গোপনীয়তা নীতি
                                </DialogTitle>
                                <p className="text-xs text-emerald-100 mt-0.5">Terms & Conditions · Privacy Policy</p>
                            </div>
                        </div>
                        {/* Emergency banner */}
                        <div className="mt-3 flex items-center gap-2 rounded-lg bg-red-500/80 px-3 py-2 text-xs font-semibold">
                            <AlertTriangle className="h-3.5 w-3.5 shrink-0" />
                            <span>জরুরি অবস্থায় সরাসরি</span>
                            <a href="tel:999" className="flex items-center gap-1 underline font-bold">
                                <PhoneCall className="h-3 w-3" /> ৯৯৯
                            </a>
                            <span>কল করুন — ডাক্তারসাব জরুরি সেবা নয়।</span>
                        </div>
                    </DialogHeader>

                    {/* Scrollable content */}
                    <div
                        ref={contentRef}
                        onScroll={handleScroll}
                        className="flex-1 overflow-y-auto px-6 py-5 space-y-5 text-sm text-gray-700 bg-white"
                        style={{ maxHeight: "50vh" }}
                    >
                        <Section title="১. প্ল্যাটফর্মের প্রকৃতি · Nature of Platform">
                            <p>
                                <strong>ডাক্তারসাব</strong> একটি ডিজিটাল স্বাস্থ্যসেবা আবিষ্কার ও ডিরেক্টরি প্ল্যাটফর্ম। আমরা
                                ব্যবহারকারীদের হাসপাতাল, ডাক্তার, অ্যাম্বুলেন্স সেবা এবং রক্ত ব্যাংকের সাথে সংযুক্ত করি।{" "}
                                <strong>আমরা সরাসরি চিকিৎসা সেবা প্রদান করি না।</strong>
                            </p>
                            <p className="text-xs text-gray-500 mt-1">
                                DaktarSab is a digital healthcare discovery platform. We do not provide medical treatment or
                                emergency services directly.
                            </p>
                        </Section>

                        <Section title="২. দায়বদ্ধতার সীমাবদ্ধতা · No Liability">
                            <p>
                                ডাক্তারসাব চিকিৎসার ফলাফল, অ্যাম্বুলেন্স বিলম্ব, রক্ত সংক্রান্ত সমস্যা বা যেকোনো সেবার মান
                                সম্পর্কিত বিষয়ে দায়ী নয়। এই দায়িত্ব সম্পূর্ণরূপে তালিকাভুক্ত সেবাদাতার।
                            </p>
                            <p className="text-xs text-gray-500 mt-1">
                                DaktarSab is not responsible for medical outcomes, ambulance delays, blood unit issues, or
                                service quality. These responsibilities belong solely to the listed provider.
                            </p>
                        </Section>

                        <Section title="৩. আর্থিক সম্পৃক্ততা নেই · No Financial Involvement">
                            <p>
                                সকল পেমেন্ট ও সার্ভিস ফি সরাসরি ব্যবহারকারী এবং সেবা প্রদানকারীর মধ্যে সম্পন্ন হবে।{" "}
                                <strong>ডাক্তারসাব কোনো পেমেন্ট প্রক্রিয়া করে না এবং আর্থিক বিরোধে মধ্যস্থতা করে না।</strong>
                            </p>
                        </Section>

                        <Section title="৪. ব্যবহারকারীর শর্ত · User Clause">
                            <p>
                                জীবন-হুমকিজনক জরুরি অবস্থায়, প্ল্যাটফর্মের মাধ্যমে সাড়ার জন্য অপেক্ষা না করে সরাসরি জাতীয়
                                জরুরি সেবা (<strong>৯৯৯</strong>) এ কল করুন।
                            </p>
                            <p className="text-xs text-gray-500 mt-1">
                                In a life-threatening emergency, immediately contact the national emergency service (999) instead
                                of waiting for a platform response.
                            </p>
                        </Section>

                        <Section title="৫. ডাক্তারের শর্ত · Doctor Clause">
                            <p>
                                নিবন্ধন করে আপনি নিশ্চিত করছেন যে আপনি একজন বৈধ BMDC নিবন্ধিত চিকিৎসা পেশাদার।
                            </p>
                        </Section>

                        <Section title="৬. অ্যাম্বুলেন্স সেবার শর্ত · Ambulance Clause">
                            <p>
                                অ্যাম্বুলেন্স সেবাদাতাদের নিশ্চিত করতে হবে যে যানবাহনগুলি BRTA দ্বারা লাইসেন্সপ্রাপ্ত এবং সঠিক
                                সরঞ্জাম বজায় রাখে।
                            </p>
                        </Section>

                        <Section title="৭. রক্ত ব্যাংকের শর্ত · Blood Bank Clause">
                            <p>
                                রক্ত ব্যাংকগুলিকে বাংলাদেশের নিরাপদ রক্ত সঞ্চালন আইন মেনে চলতে হবে এবং স্ক্রিনিংয়ের নির্ভুলতা
                                নিশ্চিত করতে হবে।
                            </p>
                        </Section>

                        <Section title="৮. গোপনীয়তা নীতি · Privacy Policy">
                            <p>
                                আপনার প্রদত্ত তথ্য শুধুমাত্র স্বাস্থ্যসেবা সংযোগের উদ্দেশ্যে ব্যবহার করা হবে। আমরা তৃতীয়
                                পক্ষের কাছে আপনার ব্যক্তিগত তথ্য বিক্রি করি না।
                            </p>
                            <p className="text-xs text-gray-500 mt-1">
                                Your data is used solely for healthcare connection purposes. We do not sell personal information
                                to third parties.
                            </p>
                        </Section>

                        {/* Scroll nudge */}
                        {!scrolledToBottom && (
                            <p className="text-center text-xs text-emerald-600 font-semibold animate-pulse pb-2">
                                ↓ সম্পূর্ণ পড়তে নিচে স্ক্রোল করুন · Scroll down to continue ↓
                            </p>
                        )}
                    </div>

                    {/* Footer */}
                    <div className="shrink-0 border-t border-gray-100 bg-gray-50 px-6 py-4 space-y-3">
                        <label className="flex items-start gap-3 cursor-pointer group">
                            <Checkbox
                                id="tos-agree"
                                checked={agreed}
                                onCheckedChange={(v) => setAgreed(v === true)}
                                className="mt-0.5 border-emerald-400 data-[state=checked]:bg-emerald-600 data-[state=checked]:border-emerald-600"
                            />
                            <span className="text-sm leading-relaxed text-gray-700 group-hover:text-gray-900">
                                আমি উপরের সকল শর্তাবলী পড়েছি এবং সম্মত আছি।{" "}
                                <span className="text-xs text-gray-500">
                                    I have read and agree to all Terms & Conditions.
                                </span>
                            </span>
                        </label>

                        <Button
                            id="tos-accept-btn"
                            onClick={handleAccept}
                            disabled={!agreed || submitting}
                            className="w-full h-12 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold shadow-lg shadow-emerald-600/20 disabled:opacity-50"
                        >
                            {submitting ? (
                                "সংরক্ষণ হচ্ছে..."
                            ) : (
                                <span className="flex items-center gap-2">
                                    <CheckCircle2 className="h-4 w-4" />
                                    আমি সম্মত — শুরু করুন · I Accept
                                </span>
                            )}
                        </Button>
                        <p className="text-center text-[10px] text-gray-400">
                            জরুরি সেবার জন্য ৯৯৯ কল করুন · For emergency call 999
                        </p>
                    </div>
                </motion.div>
            </DialogContent>
        </Dialog>
    );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
    return (
        <div className="space-y-1.5">
            <h3 className="text-xs font-bold text-emerald-700 uppercase tracking-wide">{title}</h3>
            <div className="text-sm leading-relaxed text-gray-600 space-y-1">{children}</div>
        </div>
    );
}
