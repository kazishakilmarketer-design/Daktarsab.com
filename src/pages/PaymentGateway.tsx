import { useState, useEffect } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { ShieldCheck, CreditCard, ChevronLeft, Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

export default function PaymentGateway() {
  const [params] = useSearchParams();
  const navigate = useNavigate();
  const { toast } = useToast();

  const bookingId = params.get("booking_id");
  const amount = params.get("amount") || "200";

  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    if (!bookingId) {
      toast({ title: "ত্রুটি", description: "অবৈধ পেমেন্ট রিকোয়েস্ট", variant: "destructive" });
      navigate("/home");
    }
  }, [bookingId, navigate, toast]);

  async function handlePayment(method: string) {
    if (!bookingId) return;
    setLoading(true);

    try {
      // Simulation delay
      await new Promise(res => setTimeout(res, 2000));

      const { error } = await (supabase as any)
        .from("booking_requests")
        .update({ 
          payment_status: "paid",
          status: "confirmed",
          transaction_id: `${method.toUpperCase()}_TXN_${Math.random().toString(36).substr(2, 9).toUpperCase()}`
        })
        .eq("id", bookingId);

      if (error) throw error;

      setSuccess(true);
      setTimeout(() => {
        navigate("/appointments");
      }, 2500);

    } catch (e: any) {
      toast({ title: "পেমেন্ট ব্যর্থ", description: e.message, variant: "destructive" });
      setLoading(false);
    }
  }

  if (success) {
    return (
      <div className="min-h-screen bg-[#F8FAF9] flex flex-col items-center justify-center p-6">
        <div className="w-20 h-20 bg-[#1DB954] rounded-full flex items-center justify-center mb-6 shadow-lg shadow-[#1DB954]/30 animate-bounce">
          <ShieldCheck className="w-10 h-10 text-white" />
        </div>
        <h2 className="text-2xl font-bold text-[#0F172A] mb-2 font-['Outfit']">পেমেন্ট সফল হয়েছে!</h2>
        <p className="text-[#64748B] text-center max-w-xs font-medium">আপনার অ্যাপয়েন্টমেন্ট নিশ্চিত করা হয়েছে। ডাক্তার শীঘ্রই এটি গ্রহণ করবেন।</p>
        <p className="text-xs text-[#94A3B8] mt-6">Redirecting to appointments...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F1F5F4] font-['Outfit']">
      <div className="bg-[#0d6b58] text-white pt-safe px-4 pb-6 shadow-md rounded-b-[2rem]">
        <div className="flex items-center gap-3 pt-4 mb-8">
          <button onClick={() => navigate(-1)} className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center hover:bg-white/20 transition-colors">
            <ChevronLeft size={20} />
          </button>
          <span className="font-bold text-lg">Secure Checkout</span>
        </div>
        <div className="text-center">
          <div className="text-sm text-white/80 font-medium mb-1">Total Amount</div>
          <div className="text-4xl font-extrabold tracking-tight">৳ {amount}</div>
        </div>
      </div>

      <div className="p-4 -mt-4 relative z-10">
        <div className="bg-white rounded-2xl p-5 shadow-sm border border-[#E2E8F0]">
          <div className="flex items-center gap-2 mb-4">
            <CreditCard className="text-[#3B82F6] w-5 h-5" />
            <span className="font-bold text-[#0F172A]">Select Payment Method</span>
          </div>
          
          <p className="text-[12px] text-[#64748B] mb-4 bg-blue-50 p-2 rounded-lg border border-blue-100">
            Note: This is a Secure Sandbox interface. No real money will be deducted.
          </p>

          <div className="space-y-3">
            <button 
              onClick={() => handlePayment('bKash')}
              disabled={loading}
              className="w-full flex items-center justify-between p-4 rounded-xl border-2 border-[#E2E8F0] focus:border-[#E1147B] bg-white transition-all disabled:opacity-50 group hover:shadow-md"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-[#E1147B] rounded-lg p-2 flex items-center justify-center">
                  <span className="text-white font-bold text-xl">b</span>
                </div>
                <span className="font-bold text-[#0F172A]">bKash Sandbox</span>
              </div>
              {loading ? <Loader2 className="w-5 h-5 animate-spin text-[#E1147B]" /> : <span className="text-sm font-bold text-[#E1147B] opacity-0 group-hover:opacity-100 transition-opacity">Pay</span>}
            </button>

            <button 
              onClick={() => handlePayment('sslcommerz')}
              disabled={loading}
              className="w-full flex items-center justify-between p-4 rounded-xl border-2 border-[#E2E8F0] focus:border-[#0F172A] bg-white transition-all disabled:opacity-50 group hover:shadow-md"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-[#0F172A] rounded-lg p-2 flex items-center justify-center">
                  <ShieldCheck className="text-white w-6 h-6" />
                </div>
                <span className="font-bold text-[#0F172A]">SSLCommerz Mock</span>
              </div>
              {loading ? <Loader2 className="w-5 h-5 animate-spin text-[#0F172A]" /> : <span className="text-sm font-bold text-[#0F172A] opacity-0 group-hover:opacity-100 transition-opacity">Pay</span>}
            </button>
          </div>
        </div>
      </div>
      
      <div className="text-center mt-6 flex items-center justify-center gap-2 text-[#94A3B8] text-xs font-medium">
        <ShieldCheck className="w-4 h-4" /> 256-bit Encrypted Checkout
      </div>
    </div>
  );
}
