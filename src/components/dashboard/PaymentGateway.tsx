import { useState } from "react";
import { CreditCard, ShieldCheck, Loader2, CheckCircle2, AlertCircle } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface PaymentGatewayProps {
  bookingId: string;
  amount: number;
  onSuccess: () => void;
  onCancel: () => void;
}

export default function PaymentGateway({ bookingId, amount, onSuccess, onCancel }: PaymentGatewayProps) {
  const { toast } = useToast();
  const [method, setMethod] = useState<"bkash" | "nagad" | "card">("bkash");
  const [loading, setLoading] = useState(false);
  const [phone, setPhone] = useState("");

  const handlePayment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (method !== "card" && phone.length < 11) {
      toast({ title: "ভুল নম্বর", description: "অনুগ্রহ করে সঠিক মোবাইল নম্বর দিন।", variant: "destructive" });
      return;
    }

    setLoading(true);

    // Mocking a 2-second payment gateway delay
    setTimeout(async () => {
      try {
        const { error } = await (supabase as any)
          .from("booking_requests")
          .update({ payment_status: "paid" })
          .eq("id", bookingId);

        if (error) throw error;

        toast({
          title: "পেমেন্ট সফল!",
          description: "আপনার বুকিং ফি সফলভাবে জমা হয়েছে।",
        });
        onSuccess();
      } catch (err: any) {
        console.error(err);
        toast({ title: "ত্রুটি", description: "পেমেন্ট ব্যর্থ হয়েছে। আবার চেষ্টা করুন।", variant: "destructive" });
      } finally {
        setLoading(false);
      }
    }, 2000);
  };

  return (
    <div className="fixed inset-0 z-[150] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white w-full max-w-md rounded-2xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
        
        {/* Header */}
        <div className="bg-slate-900 px-6 py-5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-emerald-500/20 flex items-center justify-center">
              <ShieldCheck className="w-5 h-5 text-emerald-400" />
            </div>
            <div>
              <h3 className="text-white font-bold text-lg leading-none">Secure Payment</h3>
              <p className="text-slate-400 text-xs mt-1">DaktarSab Gateway</p>
            </div>
          </div>
          <div className="text-right">
            <p className="text-slate-400 text-xs">Total Amount</p>
            <p className="text-emerald-400 font-bold text-xl leading-none mt-1">৳{amount}</p>
          </div>
        </div>

        {/* Body */}
        <form onSubmit={handlePayment} className="p-6">
          <p className="text-sm font-semibold text-slate-800 mb-4">পেমেন্ট মেথড নির্বাচন করুন</p>
          
          <div className="grid grid-cols-3 gap-3 mb-6">
            {/* bKash */}
            <label className={`cursor-pointer border-2 rounded-xl p-3 flex flex-col items-center justify-center gap-2 transition-all ${method === "bkash" ? "border-pink-500 bg-pink-50" : "border-slate-200 hover:border-pink-200"}`}>
              <input type="radio" name="method" value="bkash" checked={method === "bkash"} onChange={() => setMethod("bkash")} className="hidden" />
              <div className="w-8 h-8 rounded-full bg-pink-500 text-white flex items-center justify-center font-bold italic text-sm">b</div>
              <span className="text-[11px] font-bold text-slate-700">bKash</span>
            </label>
            
            {/* Nagad */}
            <label className={`cursor-pointer border-2 rounded-xl p-3 flex flex-col items-center justify-center gap-2 transition-all ${method === "nagad" ? "border-orange-500 bg-orange-50" : "border-slate-200 hover:border-orange-200"}`}>
              <input type="radio" name="method" value="nagad" checked={method === "nagad"} onChange={() => setMethod("nagad")} className="hidden" />
              <div className="w-8 h-8 rounded-full bg-orange-500 text-white flex items-center justify-center font-bold text-sm">N</div>
              <span className="text-[11px] font-bold text-slate-700">Nagad</span>
            </label>
            
            {/* Card */}
            <label className={`cursor-pointer border-2 rounded-xl p-3 flex flex-col items-center justify-center gap-2 transition-all ${method === "card" ? "border-indigo-500 bg-indigo-50" : "border-slate-200 hover:border-indigo-200"}`}>
              <input type="radio" name="method" value="card" checked={method === "card"} onChange={() => setMethod("card")} className="hidden" />
              <div className="w-8 h-8 rounded-full bg-indigo-500 text-white flex items-center justify-center"><CreditCard className="w-4 h-4" /></div>
              <span className="text-[11px] font-bold text-slate-700">Card</span>
            </label>
          </div>

          {method !== "card" ? (
            <div className="mb-6">
              <label className="block text-xs font-bold text-slate-700 mb-2">আপনার {method === "bkash" ? "bKash" : "Nagad"} নম্বর</label>
              <input
                type="tel"
                placeholder="01XXXXXXXXX"
                value={phone}
                onChange={(e) => setPhone(e.target.value.replace(/\D/g, '').slice(0, 11))}
                className="w-full p-3 rounded-xl border border-slate-200 bg-slate-50 text-sm outline-none focus:border-indigo-400 focus:bg-white transition-all text-center tracking-widest font-medium"
                required
              />
            </div>
          ) : (
            <div className="mb-6 p-4 rounded-xl bg-slate-50 border border-slate-200 flex flex-col items-center justify-center text-center">
              <AlertCircle className="w-6 h-6 text-slate-400 mb-2" />
              <p className="text-xs text-slate-500">কার্ড পেমেন্ট সাময়িকভাবে বন্ধ আছে। অনুগ্রহ করে মোবাইল ব্যাংকিং ব্যবহার করুন।</p>
            </div>
          )}

          <div className="flex gap-3">
            <button
              type="button"
              onClick={onCancel}
              disabled={loading}
              className="flex-1 py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 text-sm font-bold rounded-xl transition-colors disabled:opacity-50"
            >
              বাতিল
            </button>
            <button
              type="submit"
              disabled={loading || (method === "card")}
              className="flex-[2] py-3 bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-bold rounded-xl flex items-center justify-center gap-2 transition-colors disabled:opacity-70"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  প্রসেস হচ্ছে...
                </>
              ) : (
                <>
                  <CheckCircle2 className="w-4 h-4" />
                  পেমেন্ট করুন
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
