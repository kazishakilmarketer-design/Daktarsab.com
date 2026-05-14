import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Stethoscope, ChevronRight, ChevronLeft } from "lucide-react";
import doctorAvatar from "@/assets/doctor-avatar.png";

const slides = [
  {
    title: "আসসালামু আলাইকুম! আমি ডাক্তার সাব।",
    description:
      "আপনার সমস্যার প্রাথমিক ও জরুরি পরামর্শ দিতে আমি ২৪/৭ প্রস্তুত।",
  },
  {
    title: "সঠিক বিশেষজ্ঞ খুঁজুন",
    description:
      "আপনার এলাকার সবচেয়ে কাছের বিশেষজ্ঞ ডাক্তার আমি খুঁজে দেব।",
  },
  {
    title: "বাজেট আপনার নিয়ন্ত্রণেই",
    description:
      "সামর্থ্য অনুযায়ী সেরা হসপিটাল এবং টেস্টের খরচের সঠিক হিসাব জানুন।",
  },
];

interface OnboardingSlidesProps {
  onComplete: () => void;
}

export default function OnboardingSlides({ onComplete }: OnboardingSlidesProps) {
  const [current, setCurrent] = useState(0);

  const next = () => {
    if (current < slides.length - 1) setCurrent(current + 1);
    else onComplete();
  };

  const prev = () => {
    if (current > 0) setCurrent(current - 1);
  };

  return (
    <div className="flex h-[100dvh] flex-col items-center justify-between bg-gradient-to-b from-white via-emerald-50/50 to-emerald-100/40 px-6 py-10">
      {/* Top logo */}
      <motion.div
        initial={{ opacity: 0, y: -12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="flex items-center gap-2"
      >
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
          <Stethoscope className="h-5 w-5" />
        </div>
        <span className="text-lg font-bold text-foreground">ডাক্তার সাব</span>
      </motion.div>

      {/* Slide content */}
      <AnimatePresence mode="wait">
        <motion.div
          key={current}
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          transition={{ duration: 0.35, ease: "easeOut" }}
          className="flex max-w-xs flex-col items-center text-center"
        >
          {/* Mascot with speech-bubble effect */}
          <div className="relative mb-5">
            <div className="h-36 w-36 overflow-hidden rounded-full border-4 border-primary/30 shadow-xl shadow-primary/15 md:h-44 md:w-44">
              <img
                src={doctorAvatar}
                alt="ডাক্তার সাব মাসকট"
                className="h-full w-full object-cover"
              />
            </div>
            {/* Small speech indicator */}
            <div className="absolute -bottom-2 left-1/2 h-4 w-4 -translate-x-1/2 rotate-45 rounded-sm bg-card shadow-sm" />
          </div>

          {/* Speech bubble card */}
          <div className="rounded-2xl bg-card px-5 py-4 shadow-md">
            <h2 className="mb-2 text-lg font-bold leading-snug text-foreground md:text-xl">
              {slides[current].title}
            </h2>
            <p className="text-sm leading-relaxed text-muted-foreground md:text-base">
              {slides[current].description}
            </p>
          </div>
        </motion.div>
      </AnimatePresence>

      {/* Bottom controls */}
      <div className="flex w-full max-w-sm flex-col items-center gap-5">
        {/* Dots */}
        <div className="flex items-center gap-2">
          {slides.map((_, i) => (
            <button
              key={i}
              onClick={() => setCurrent(i)}
              className={`h-2 rounded-full transition-all ${
                i === current ? "w-6 bg-primary" : "w-2 bg-border"
              }`}
            />
          ))}
        </div>

        {/* Buttons */}
        <div className="flex w-full items-center justify-between gap-3">
          <Button
            variant="ghost"
            size="sm"
            onClick={prev}
            disabled={current === 0}
            className="gap-1 text-muted-foreground"
          >
            <ChevronLeft className="h-4 w-4" />
            পিছনে
          </Button>

          {current < slides.length - 1 ? (
            <Button
              onClick={next}
              className="min-h-[44px] flex-1 gap-1 shadow-md shadow-primary/20"
            >
              পরবর্তী
              <ChevronRight className="h-4 w-4" />
            </Button>
          ) : (
            <Button
              onClick={onComplete}
              className="min-h-[44px] flex-1 shadow-md shadow-primary/20"
            >
              শুরু করুন 🚀
            </Button>
          )}

          <Button
            variant="ghost"
            size="sm"
            onClick={onComplete}
            className="text-xs text-muted-foreground"
          >
            স্কিপ
          </Button>
        </div>
      </div>
    </div>
  );
}
