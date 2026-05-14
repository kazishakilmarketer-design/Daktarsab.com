import { useState } from "react";
import { motion } from "framer-motion";
import { Mail, Lock, User, ArrowLeft, FileText } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";
import doctorAvatar from "@/assets/doctor-avatar.png";
import TermsAndConditionsModal from "@/components/TermsAndConditionsModal";
import Logo from "@/components/Logo";

export default function Auth() {
  const [mode, setMode] = useState<"login" | "signup">("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(false);
  const [tosAccepted, setTosAccepted] = useState(false);
  const [tosModalOpen, setTosModalOpen] = useState(false);
  const { toast } = useToast();
  const navigate = useNavigate();

  const handleEmail = async (e: React.FormEvent) => {
    e.preventDefault();
    if (mode === "signup" && !tosAccepted) {
      toast({ title: "শর্তাবলী গ্রহণ করুন", description: "সাইন আপ করতে শর্তাবলী পড়ুন ও সম্মত হন।", variant: "destructive" });
      setTosModalOpen(true);
      return;
    }
    setLoading(true);
    try {
      if (mode === "signup") {
        const { data, error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: { display_name: name },
            emailRedirectTo: window.location.origin,
          },
        });
        if (error) throw error;
        
        // If email confirmation is disabled, Supabase returns a session immediately
        if (data.session) {
          toast({ title: "স্বাগতম!", description: "আপনার একাউন্ট সফলভাবে তৈরি হয়েছে।" });
          navigate("/complete-profile");
        } else {
          toast({ title: "ইমেইল যাচাই করুন", description: "আপনার ইমেইলে একটি যাচাই লিংক পাঠানো হয়েছে।" });
        }
      } else {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
        navigate("/home");
      }
    } catch (err) {
      toast({ title: "সমস্যা হয়েছে", description: err instanceof Error ? err.message : "আবার চেষ্টা করুন", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  const handleGoogle = async () => {
    setLoading(true);
    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: `${window.location.origin}/home`,
        queryParams: {
          access_type: 'offline',
          prompt: 'consent',
        }
      },
    });
    if (error) {
      toast({ title: "Google লগইন সমস্যা", description: error.message, variant: "destructive" });
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-[100dvh] flex-col items-center justify-center bg-gradient-to-b from-background via-emerald-50/30 to-background p-4">
      {/* T&C Modal */}
      <TermsAndConditionsModal
        open={tosModalOpen}
        role="user"
        onAccept={() => { setTosAccepted(true); setTosModalOpen(false); }}
      />

      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="w-full max-w-sm space-y-6">
        {/* Header */}
        <div className="flex flex-col items-center gap-3 text-center">
          <Logo className="h-16 mb-2" />
          <div>
            <p className="text-sm text-muted-foreground">
              {mode === "login" ? "আপনার একাউন্টে লগইন করুন" : "নতুন একাউন্ট তৈরি করুন"}
            </p>
          </div>
        </div>

        {/* Google */}
        <Button
          variant="outline"
          className="w-full min-h-[44px] gap-2 bg-white text-gray-700 hover:bg-gray-50 border-gray-300 shadow-sm font-medium"
          onClick={handleGoogle}
          disabled={loading}
        >
          <svg className="h-4 w-4" viewBox="0 0 24 24">
            <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 01-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4" />
            <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
            <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
            <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
          </svg>
          Google দিয়ে চালিয়ে যান
        </Button>

        <div className="relative">
          <div className="absolute inset-0 flex items-center"><span className="w-full border-t border-border" /></div>
          <div className="relative flex justify-center text-xs uppercase">
            <span className="bg-background px-2 text-muted-foreground">অথবা</span>
          </div>
        </div>

        {/* Email form */}
        <form onSubmit={handleEmail} className="space-y-3">
          {mode === "signup" && (
            <div className="space-y-1.5">
              <Label htmlFor="name" className="text-xs">নাম</Label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input id="name" value={name} onChange={(e) => setName(e.target.value)} placeholder="আপনার নাম" className="min-h-[44px] pl-9" />
              </div>
            </div>
          )}
          <div className="space-y-1.5">
            <Label htmlFor="email" className="text-xs">ইমেইল</Label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="email@example.com" className="min-h-[44px] pl-9" required />
            </div>
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="password" className="text-xs">পাসওয়ার্ড</Label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input id="password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="••••••••" className="min-h-[44px] pl-9" required minLength={6} />
            </div>
          </div>

          {/* T&C section for signup */}
          {mode === "signup" && (
            <div className={`flex items-center gap-3 rounded-xl border px-4 py-3 transition-all ${tosAccepted ? "border-emerald-300 bg-emerald-50" : "border-border bg-muted/30"}`}>
              {tosAccepted ? (
                <span className="text-xs text-emerald-700 font-semibold flex-1">✅ শর্তাবলী গ্রহণ করা হয়েছে</span>
              ) : (
                <span className="text-xs text-muted-foreground flex-1">সাইন আপের আগে শর্তাবলী পড়তে হবে</span>
              )}
              <Button type="button" variant="outline" size="sm" className="text-xs gap-1.5 shrink-0 h-8" onClick={() => setTosModalOpen(true)}>
                <FileText className="h-3 w-3" />
                {tosAccepted ? "পুনরায় পড়ুন" : "শর্তাবলী পড়ুন"}
              </Button>
            </div>
          )}

          <Button type="submit" className="w-full min-h-[44px]" disabled={loading || (mode === "signup" && !tosAccepted)}>
            {loading ? "অপেক্ষা করুন..." : mode === "login" ? "লগইন" : "সাইন আপ"}
          </Button>
        </form>

        <p className="text-center text-xs text-muted-foreground">
          {mode === "login" ? "একাউন্ট নেই? " : "একাউন্ট আছে? "}
          <button onClick={() => { setMode(mode === "login" ? "signup" : "login"); setTosAccepted(false); }} className="font-semibold text-primary underline-offset-2 hover:underline">
            {mode === "login" ? "সাইন আপ করুন" : "লগইন করুন"}
          </button>
        </p>

        <Button variant="ghost" size="sm" className="mx-auto flex gap-1.5 text-xs text-muted-foreground" onClick={() => navigate("/")}>
          <ArrowLeft className="h-3 w-3" />
          গেস্ট হিসেবে চালিয়ে যান
        </Button>
      </motion.div>
    </div>
  );
}
