import { motion } from "framer-motion";
import { X, Shield } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { useNavigate } from "react-router-dom";

export default function SavePromptBanner() {
  const [dismissed, setDismissed] = useState(false);
  const navigate = useNavigate();

  if (dismissed) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: -8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -8 }}
      className="mx-3 mt-2 rounded-lg border border-primary/20 bg-accent/60 p-3 md:mx-4"
    >
      <div className="flex items-start justify-between gap-2">
        <div className="flex-1 space-y-1">
          <div className="flex items-center gap-1.5">
            <Shield className="h-3.5 w-3.5 text-primary" />
            <span className="text-xs font-semibold text-foreground">পরামর্শ সেভ করুন</span>
          </div>
          <p className="text-[11px] leading-relaxed text-muted-foreground">
            আপনার এই পরামর্শটি স্থায়ীভাবে সেভ করতে এবং পরিবারের প্রোফাইল তৈরি করতে সাইন-আপ করুন।
          </p>
          <div className="flex gap-2 pt-1">
            <Button
              size="sm"
              className="h-7 gap-1 text-[11px] bg-primary text-primary-foreground hover:bg-primary/90"
              onClick={() => navigate("/auth")}
            >
              সাইন আপ করুন
            </Button>
          </div>
        </div>
        <button onClick={() => setDismissed(true)} className="text-muted-foreground hover:text-foreground p-0.5">
          <X className="h-3.5 w-3.5" />
        </button>
      </div>
    </motion.div>
  );
}
