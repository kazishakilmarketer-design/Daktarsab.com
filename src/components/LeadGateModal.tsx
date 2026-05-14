import { useState, useEffect } from "react";
import { X, ShieldCheck, UserCircle, ArrowRight } from "lucide-react";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/useAuth";
import { VisuallyHidden } from "@radix-ui/react-visually-hidden";
import { supabase } from "@/integrations/supabase/client";

interface LeadGateModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onGuestContinue: () => void;
}

export default function LeadGateModal({ open, onOpenChange, onGuestContinue }: LeadGateModalProps) {
  const { user } = useAuth();

  // If user is already logged in, we shouldn't show this gate.
  useEffect(() => {
    if (user && open) {
      onOpenChange(false);
    }
  }, [user, open, onOpenChange]);

  if (user) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md p-0 overflow-hidden border-none bg-transparent shadow-none [&>button]:hidden">
        <VisuallyHidden>
            <DialogTitle>লগইন প্রয়োজন</DialogTitle>
        </VisuallyHidden>
        <div className="relative bg-white rounded-2xl overflow-hidden shadow-xl border border-border">
          
          {/* Header Graphic */}
          <div className="bg-emerald-50 p-6 flex flex-col items-center justify-center text-center border-b border-emerald-100">
            <div className="h-14 w-14 bg-emerald-100 rounded-full flex items-center justify-center mb-4 ring-4 ring-emerald-50">
              <ShieldCheck className="h-7 w-7 text-emerald-600" />
            </div>
            <h2 className="text-lg font-bold text-emerald-950">পরামর্শ শুরু করতে লগইন করুন</h2>
            <p className="text-xs text-emerald-700/80 mt-1 max-w-[240px]">
              আপনার মেডিকেল রেকর্ড সুরক্ষায় রাখতে এবং ভালো সার্ভিস পেতে একটি ফ্রি অ্যাকাউন্ট তৈরি করুন।
            </p>
          </div>

          <div className="p-6 space-y-4">
            <Button 
              className="w-full h-12 bg-[#4285F4] hover:bg-[#3367D6] text-white flex items-center gap-3 text-sm font-medium transition-all shadow-sm"
              onClick={async () => {
                await supabase.auth.signInWithOAuth({
                  provider: "google",
                  options: { redirectTo: `${window.location.origin}/` },
                });
              }}
            >
              <div className="bg-white p-1 rounded-sm flex items-center justify-center">
                <svg className="w-4 h-4" viewBox="0 0 24 24">
                    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                </svg>
              </div>
              Google দিয়ে কানেক্ট করুন
            </Button>

            <div className="relative flex items-center py-2">
              <div className="flex-grow border-t border-slate-200"></div>
              <span className="flex-shrink-0 mx-3 text-[10px] text-slate-400 font-medium uppercase tracking-wider">অথবা</span>
              <div className="flex-grow border-t border-slate-200"></div>
            </div>

            <button 
              onClick={() => {
                onGuestContinue();
                onOpenChange(false);
              }}
              className="w-full h-11 flex items-center justify-center gap-2 rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-50 text-xs font-semibold transition-colors"
            >
              <UserCircle className="h-4 w-4 text-slate-400" />
              গোপন পরামর্শ নিন (Guest Mode)
              <ArrowRight className="h-3.5 w-3.5 ml-1 text-slate-400" />
            </button>
            <p className="text-[10px] text-center text-slate-400 px-4">
              গেস্ট মোডে আপনার কোনো পুরোনো রিপোর্ট বা প্রেসক্রিপশন সেভ থাকবে না।
            </p>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
