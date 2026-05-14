import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, User, Phone, ShieldCheck } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";

interface ProfileGateProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onSuccess: () => void;
}

export default function ProfileGate({ open, onOpenChange, onSuccess }: ProfileGateProps) {
    const { user, refreshProfile } = useAuth();
    const { toast } = useToast();
    const [name, setName] = useState(user?.user_metadata?.display_name || "");
    const [phone, setPhone] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!user) return;
        if (!name.trim() || !phone.trim()) {
            toast({ title: "তথ্য অসম্পূর্ণ", description: "অনুগ্রহ করে আপনার নাম এবং ফোন নাম্বার দিন।", variant: "destructive" });
            return;
        }

        setIsSubmitting(true);
        try {
            // Check if a profile row already exists for this user
            const { data: existing } = await supabase
                .from('profiles')
                .select('id')
                .eq('user_id', user.id)
                .maybeSingle();

            let error;
            if (existing) {
                const updateRes = await supabase.from('profiles')
                    .update({ full_name: name.trim(), phone: phone.trim() })
                    .eq('user_id', user.id);
                error = updateRes.error;
            } else {
                const insertRes = await supabase.from('profiles')
                    .insert({ user_id: user.id, full_name: name.trim(), phone: phone.trim() });
                error = insertRes.error;
            }

            if (error) throw error;

            toast({
                title: "প্রোফাইল আপডেট সফল!",
                description: "এখন আপনি অ্যাপয়েন্টমেন্ট নিতে পারবেন।",
            });
            await refreshProfile();
            onSuccess();
        } catch (err: any) {
            console.error(err);
            toast({ title: "সমস্যা হয়েছে", description: "প্রোফাইল সেভ করা যায়নি। আবার চেষ্টা করুন।", variant: "destructive" });
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-md p-0 overflow-hidden border-0 bg-transparent">
                <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    className="bg-white rounded-3xl overflow-hidden shadow-2xl relative"
                >
                    {/* Header Graphic */}
                    <div className="bg-gradient-to-r from-emerald-500 to-teal-600 p-6 text-white relative flex flex-col items-center justify-center text-center">
                        <button
                            onClick={() => onOpenChange(false)}
                            className="absolute top-4 right-4 h-8 w-8 rounded-full bg-white/20 flex items-center justify-center hover:bg-white/30 transition-colors"
                        >
                            <X className="h-4 w-4" />
                        </button>
                        <div className="h-16 w-16 bg-white/20 rounded-2xl backdrop-blur-md flex items-center justify-center mb-4 shadow-inner border border-white/30">
                            <User className="h-8 w-8" />
                        </div>
                        <h2 className="text-xl font-bold mb-1">প্রোফাইল সম্পূর্ণ করুন</h2>
                        <p className="text-sm text-emerald-50 opacity-90">
                            অ্যাপয়েন্টমেন্ট নিতে আপনার নাম এবং ফোন নাম্বার আবশ্যক
                        </p>
                    </div>

                    {/* Form Content */}
                    <form onSubmit={handleSubmit} className="p-6 space-y-4">
                        <div className="space-y-1.5">
                            <Label htmlFor="gate-name" className="text-xs font-semibold text-gray-700">রোগীর নাম <span className="text-red-500">*</span></Label>
                            <div className="relative">
                                <User className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                                <Input
                                    id="gate-name"
                                    value={name}
                                    onChange={(e) => setName(e.target.value)}
                                    placeholder="আপনার পূর্ণ নাম"
                                    className="pl-9 h-11 bg-gray-50/50 border-gray-200 focus:bg-white transition-colors"
                                    required
                                />
                            </div>
                        </div>

                        <div className="space-y-1.5">
                            <Label htmlFor="gate-phone" className="text-xs font-semibold text-gray-700">মোবাইল নাম্বার <span className="text-red-500">*</span></Label>
                            <div className="relative">
                                <Phone className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                                <Input
                                    id="gate-phone"
                                    value={phone}
                                    onChange={(e) => setPhone(e.target.value)}
                                    placeholder="01XXXXXXXXX"
                                    className="pl-9 h-11 bg-gray-50/50 border-gray-200 focus:bg-white transition-colors"
                                    required
                                />
                            </div>
                        </div>

                        <div className="pt-2">
                            <Button
                                type="submit"
                                className="w-full h-12 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold shadow-md shadow-emerald-200"
                                disabled={isSubmitting || !name.trim() || !phone.trim()}
                            >
                                {isSubmitting ? "সেভ হচ্ছে..." : "সংরক্ষণ করুন ও এগিয়ে যান"}
                            </Button>
                        </div>

                        <p className="flex items-center justify-center gap-1.5 text-[10px] text-gray-400 mt-4">
                            <ShieldCheck className="h-3 w-3 text-emerald-500" /> আপনার তথ্য সম্পূর্ণ সুরক্ষিত
                        </p>
                    </form>
                </motion.div>
            </DialogContent>
        </Dialog>
    );
}
