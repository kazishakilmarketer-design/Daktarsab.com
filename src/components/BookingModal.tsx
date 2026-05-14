import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Calendar, Clock, User, Phone, FileText, CheckCircle2, X, Loader2 } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";

export type ServiceType = "hospital" | "clinic" | "diagnostic" | "ambulance" | "doctor";

interface BookingModalProps {
    open: boolean;
    onClose: () => void;
    serviceType: ServiceType;
    providerName: string;
    providerId?: string;
}

const SERVICE_LABELS: Record<ServiceType, string> = {
    hospital: "হাসপাতাল",
    clinic: "ক্লিনিক",
    diagnostic: "ডায়াগনস্টিক সেন্টার",
    ambulance: "অ্যাম্বুলেন্স সেবা",
    doctor: "ডাক্তার",
};

const SERVICE_COLORS: Record<ServiceType, string> = {
    hospital: "from-blue-500 to-blue-600",
    clinic: "from-emerald-500 to-emerald-600",
    diagnostic: "from-purple-500 to-violet-600",
    ambulance: "from-red-500 to-red-600",
    doctor: "from-teal-500 to-teal-600",
};

export default function BookingModal({
    open, onClose, serviceType, providerName, providerId
}: BookingModalProps) {
    const { user } = useAuth();
    const navigate = useNavigate();
    const [submitted, setSubmitted] = useState(false);
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState("");

    const [form, setForm] = useState({
        user_name: "",
        user_phone: "",
        preferred_date: "",
        preferred_time: "",
        notes: "",
    });

    // Pre-fill from profile if user is logged in
    useEffect(() => {
        if (!open) {
            setSubmitted(false);
            setError("");
            setForm({ user_name: "", user_phone: "", preferred_date: "", preferred_time: "", notes: "" });
            return;
        }
        if (user) {
            // Try to fetch profile data
            (supabase as any).from("profiles")
                .select("full_name, phone")
                .eq("user_id", user.id)
                .maybeSingle()
                .then(({ data }: { data: any }) => {
                    if (data) {
                        setForm(f => ({
                            ...f,
                            user_name: data.full_name || user.user_metadata?.display_name || "",
                            user_phone: data.phone || "",
                        }));
                    }
                });
        }
    }, [open, user]);

    const field = (key: keyof typeof form, val: string) =>
        setForm(f => ({ ...f, [key]: val }));

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        if (!form.user_name.trim()) { setError("নাম দিন"); return; }
        if (!form.user_phone.trim()) { setError("ফোন নম্বর দিন"); return; }

        setSubmitting(true);
        setError("");
        try {
            let finalProviderId = providerId;
            
            // BOOK-1: Fallback logic for undefined provider_id
            if (!finalProviderId && providerName) {
                const table = serviceType === "doctor" ? "doctors" : "hospitals";
                const nameCol = serviceType === "doctor" ? "doctor_name" : "name";
                
                try {
                    const { data: provData } = await (supabase as any)
                        .from(table)
                        .select("id")
                        .eq(nameCol, providerName)
                        .limit(1)
                        .maybeSingle();
                        
                    if (provData?.id) {
                        finalProviderId = provData.id;
                    } else {
                        finalProviderId = "00000000-0000-0000-0000-000000000000";
                    }
                } catch(e) {
                    finalProviderId = "00000000-0000-0000-0000-000000000000";
                }
            } else if (!finalProviderId) {
                finalProviderId = "00000000-0000-0000-0000-000000000000";
            }

            const { data, error: dbErr } = await (supabase as any)
                .from("booking_requests")
                .insert({
                    user_id: user?.id ?? null,
                    service_type: serviceType,
                    provider_id: finalProviderId,
                    provider_name: providerName,
                    user_name: form.user_name.trim(),
                    user_phone: form.user_phone.trim(),
                    preferred_date: form.preferred_date || null,
                    preferred_time: form.preferred_time || null,
                    notes: form.notes.trim() || null,
                    status: "new",
                })
                .select()
                .single();

            if (dbErr) throw dbErr;
            
            // Redirect to Payment Gateway
            onClose();
            navigate(`/payment?booking_id=${data.id}&amount=200`);
            
        } catch (err: any) {
            setError(err?.message || "সংযোগ সমস্যা। আবার চেষ্টা করুন।");
        } finally {
            setSubmitting(false);
        }
    }

    const gradientClass = SERVICE_COLORS[serviceType];

    return (
        <Dialog open={open} onOpenChange={(v) => { if (!v) onClose(); }}>
            <DialogContent className="max-w-md p-0 overflow-hidden border-0 shadow-2xl">
                <motion.div
                    initial={{ opacity: 0, scale: 0.97 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="flex flex-col max-h-[92dvh]"
                >
                    {/* Header */}
                    <DialogHeader className={`bg-gradient-to-r ${gradientClass} px-6 py-5 text-white shrink-0`}>
                        <div className="flex items-start justify-between">
                            <div>
                                <div className="text-xs font-semibold text-white/70 uppercase tracking-wide mb-1">
                                    {SERVICE_LABELS[serviceType]} বুকিং
                                </div>
                                <DialogTitle className="text-lg font-bold text-white leading-tight">
                                    {providerName}
                                </DialogTitle>
                                <p className="text-xs text-white/80 mt-1.5">
                                    ফর্মটি পূরণ করুন — সেবা প্রদানকারী যোগাযোগ করবে
                                </p>
                            </div>
                            <button onClick={onClose} className="text-white/60 hover:text-white transition-colors mt-0.5">
                                <X className="h-5 w-5" />
                            </button>
                        </div>
                    </DialogHeader>

                    {submitted ? (
                        /* Success state */
                        <motion.div
                            initial={{ opacity: 0, y: 12 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="flex flex-col items-center justify-center gap-4 px-6 py-12 text-center bg-white"
                        >
                            <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-emerald-100">
                                <CheckCircle2 className="h-8 w-8 text-emerald-600" />
                            </div>
                            <div>
                                <h3 className="text-lg font-bold text-gray-900 mb-2">অনুরোধ পাঠানো হয়েছে!</h3>
                                <p className="text-sm leading-relaxed text-gray-500">
                                    আপনার অনুরোধটি পাঠানো হয়েছে।<br />
                                    <strong className="text-gray-700">সংশ্লিষ্ট সেবা প্রদানকারী শীঘ্রই আপনার সাথে যোগাযোগ করবে।</strong>
                                </p>
                            </div>
                            <Button onClick={onClose} className="mt-2 w-full h-11 rounded-xl bg-emerald-600 hover:bg-emerald-700">
                                ঠিক আছে
                            </Button>
                        </motion.div>
                    ) : (
                        /* Form */
                        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto bg-white">
                            <div className="space-y-4 px-6 py-5">
                                {/* Name */}
                                <div className="space-y-1.5">
                                    <Label className="text-xs font-semibold text-gray-700">
                                        আপনার নাম <span className="text-red-500">*</span>
                                    </Label>
                                    <div className="relative">
                                        <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                                        <Input
                                            id="booking-name"
                                            value={form.user_name}
                                            onChange={e => field("user_name", e.target.value)}
                                            placeholder="আপনার পূর্ণ নাম"
                                            className="pl-9 h-11 rounded-xl border-gray-200 focus:border-emerald-500 focus:ring-emerald-500/20"
                                            required
                                        />
                                    </div>
                                </div>

                                {/* Phone */}
                                <div className="space-y-1.5">
                                    <Label className="text-xs font-semibold text-gray-700">
                                        মোবাইল নাম্বার <span className="text-red-500">*</span>
                                    </Label>
                                    <div className="relative">
                                        <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                                        <Input
                                            id="booking-phone"
                                            value={form.user_phone}
                                            onChange={e => field("user_phone", e.target.value)}
                                            placeholder="01XXXXXXXXX"
                                            type="tel"
                                            className="pl-9 h-11 rounded-xl border-gray-200 focus:border-emerald-500 focus:ring-emerald-500/20"
                                            required
                                        />
                                    </div>
                                </div>

                                {/* Date + Time row */}
                                <div className="grid grid-cols-2 gap-3">
                                    <div className="space-y-1.5">
                                        <Label className="text-xs font-semibold text-gray-700">পছন্দের তারিখ</Label>
                                        <div className="relative">
                                            <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                                            <Input
                                                id="booking-date"
                                                type="date"
                                                value={form.preferred_date}
                                                onChange={e => field("preferred_date", e.target.value)}
                                                min={new Date().toISOString().split("T")[0]}
                                                className="pl-9 h-11 rounded-xl border-gray-200 focus:border-emerald-500 focus:ring-emerald-500/20"
                                            />
                                        </div>
                                    </div>
                                    <div className="space-y-1.5">
                                        <Label className="text-xs font-semibold text-gray-700">পছন্দের সময়</Label>
                                        <div className="relative">
                                            <Clock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                                            <Input
                                                id="booking-time"
                                                type="time"
                                                value={form.preferred_time}
                                                onChange={e => field("preferred_time", e.target.value)}
                                                className="pl-9 h-11 rounded-xl border-gray-200 focus:border-emerald-500 focus:ring-emerald-500/20"
                                            />
                                        </div>
                                    </div>
                                </div>

                                {/* Notes */}
                                <div className="space-y-1.5">
                                    <Label className="text-xs font-semibold text-gray-700">
                                        বিশেষ বার্তা <span className="text-gray-400">(ঐচ্ছিক)</span>
                                    </Label>
                                    <div className="relative">
                                        <FileText className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                                        <Textarea
                                            id="booking-notes"
                                            value={form.notes}
                                            onChange={e => field("notes", e.target.value)}
                                            placeholder="আপনার সমস্যা বা বিশেষ প্রয়োজন লিখুন..."
                                            rows={3}
                                            className="pl-9 rounded-xl border-gray-200 focus:border-emerald-500 focus:ring-emerald-500/20 resize-none"
                                        />
                                    </div>
                                </div>

                                {error && (
                                    <p className="text-xs text-red-600 bg-red-50 rounded-lg px-3 py-2">{error}</p>
                                )}
                            </div>

                            {/* Footer */}
                            <div className="sticky bottom-0 bg-white border-t border-gray-100 px-6 py-4 shrink-0">
                                <Button
                                    id="booking-submit-btn"
                                    type="submit"
                                    disabled={submitting}
                                    className={`w-full h-12 rounded-xl bg-gradient-to-r ${gradientClass} text-white font-bold shadow-lg disabled:opacity-60`}
                                >
                                    {submitting ? (
                                        <span className="flex items-center gap-2">
                                            <Loader2 className="h-4 w-4 animate-spin" /> পাঠানো হচ্ছে...
                                        </span>
                                    ) : "বুকিং রিকোয়েস্ট পাঠান →"}
                                </Button>
                                <p className="text-center text-[10px] text-gray-400 mt-2">
                                    আপনার তথ্য সম্পূর্ণ নিরাপদ · কোনো পেমেন্ট নেই
                                </p>
                            </div>
                        </form>
                    )}
                </motion.div>
            </DialogContent>
        </Dialog>
    );
}
