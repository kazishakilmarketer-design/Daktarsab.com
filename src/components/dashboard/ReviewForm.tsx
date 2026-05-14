import { useState } from "react";
import { Star, X, MessageSquare, CheckCircle, Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";

interface ReviewFormProps {
  bookingId: string;
  providerId: string;
  providerName: string;
  providerType: string; // 'doctor' | 'hospital'
  onClose: () => void;
  onSuccess: () => void;
}

export default function ReviewForm({ bookingId, providerId, providerName, providerType, onClose, onSuccess }: ReviewFormProps) {
  const { user } = useAuth();
  const { toast } = useToast();
  const [rating, setRating] = useState(5);
  const [hoverRating, setHoverRating] = useState(5);
  const [comment, setComment] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    setSubmitting(true);

    try {
      // 1. Insert review
      const { error: reviewErr } = await (supabase as any).from("reviews").insert({
        reviewer_id: user.id,
        provider_id: providerId === "00000000-0000-0000-0000-000000000000" ? user.id : providerId, // fallback if zero uuid
        provider_type: providerType === "doctor" ? "doctor" : "hospital",
        rating,
        comment: comment.trim() || null,
      });

      if (reviewErr) throw reviewErr;

      // 2. Mark booking as reviewed (Optional, we can just add a property to booking_requests)
      // We will just assume it's successful and let the UI handle it
      toast({ title: "ধন্যবাদ!", description: "আপনার রিভিউ সফলভাবে যুক্ত হয়েছে।" });
      onSuccess();
      
    } catch (err: any) {
      console.error(err);
      toast({ title: "ত্রুটি", description: "রিভিউ দিতে সমস্যা হয়েছে।", variant: "destructive" });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-0 bg-slate-900/40 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl w-full max-w-sm overflow-hidden shadow-2xl relative animate-in zoom-in-95 duration-200">
        
        {/* Header */}
        <div className="bg-gradient-to-br from-indigo-500 to-indigo-700 px-5 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <MessageSquare className="w-5 h-5 text-white" />
            <h3 className="text-white font-bold text-lg leading-none">রিভিউ দিন</h3>
          </div>
          <button onClick={onClose} className="w-8 h-8 flex items-center justify-center rounded-full bg-white/20 text-white hover:bg-white/30 transition-colors">
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Body */}
        <form onSubmit={handleSubmit} className="p-5">
          <p className="text-sm font-semibold text-slate-800 text-center mb-1">{providerName}</p>
          <p className="text-xs text-slate-500 text-center mb-5">আপনার অভিজ্ঞতা কেমন ছিল?</p>

          {/* Stars */}
          <div className="flex items-center justify-center gap-2 mb-6">
            {[1, 2, 3, 4, 5].map((star) => (
              <button
                key={star}
                type="button"
                onMouseEnter={() => setHoverRating(star)}
                onMouseLeave={() => setHoverRating(rating)}
                onClick={() => setRating(star)}
                className="p-1 focus:outline-none transition-transform hover:scale-110"
              >
                <Star
                  className={`w-8 h-8 ${
                    star <= hoverRating
                      ? "fill-amber-400 text-amber-400 drop-shadow-sm"
                      : "text-slate-200"
                  }`}
                />
              </button>
            ))}
          </div>

          {/* Comment */}
          <div className="mb-5">
            <label className="block text-xs font-bold text-slate-700 mb-2">মন্তব্য (ঐচ্ছিক)</label>
            <textarea
              rows={3}
              placeholder="আপনার মতামত লিখুন..."
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              className="w-full p-3 rounded-xl border border-slate-200 bg-slate-50 text-sm outline-none focus:border-indigo-400 focus:bg-white transition-all resize-none"
            />
          </div>

          <button
            type="submit"
            disabled={submitting}
            className="w-full py-3 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-bold rounded-xl flex items-center justify-center gap-2 transition-colors disabled:opacity-70"
          >
            {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle className="w-4 h-4" />}
            সাবমিট করুন
          </button>
        </form>
      </div>
    </div>
  );
}
