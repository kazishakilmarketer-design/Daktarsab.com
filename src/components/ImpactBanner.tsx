/**
 * ImpactBanner — Doctor Saab Trust Builder Section
 * Shows animated stats: consultations, doctors, hospitals, savings
 */
import { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import { Stethoscope, ShieldCheck, Building2, TrendingUp } from "lucide-react";

interface Stat {
    icon: React.ElementType;
    value: number;
    suffix: string;
    label: string;
    color: string;
}

const STATS: Stat[] = [
    { icon: Stethoscope, value: 12750, suffix: "+", label: "পরামর্শ সম্পন্ন", color: "text-primary" },
    { icon: ShieldCheck, value: 2232, suffix: "+", label: "ভেরিফাইড ডাক্তার", color: "text-blue-500" },
    { icon: Building2, value: 12000, suffix: "+", label: "পার্টনার হাসপাতাল", color: "text-purple-500" },
    { icon: TrendingUp, value: 15, suffix: "লক্ষ+", label: "টাকা সাশ্রয়", color: "text-emerald-600" },
];

function AnimatedCounter({ target, suffix }: { target: number; suffix: string }) {
    const [count, setCount] = useState(0);
    const ref = useRef<HTMLSpanElement>(null);
    const started = useRef(false);

    useEffect(() => {
        const observer = new IntersectionObserver(
            ([entry]) => {
                if (entry.isIntersecting && !started.current) {
                    started.current = true;
                    const duration = 1600;
                    const steps = 50;
                    const increment = target / steps;
                    let current = 0;
                    const timer = setInterval(() => {
                        current += increment;
                        if (current >= target) { setCount(target); clearInterval(timer); }
                        else setCount(Math.floor(current));
                    }, duration / steps);
                }
            },
            { threshold: 0.3 }
        );
        if (ref.current) observer.observe(ref.current);
        return () => observer.disconnect();
    }, [target]);

    return (
        <span ref={ref} className="tabular-nums">
            {count.toLocaleString("bn-BD")}{suffix}
        </span>
    );
}

export default function ImpactBanner() {
    return (
        <div className="border-b border-border/50 bg-gradient-to-r from-primary/5 via-blue-50/30 to-purple-50/20 px-3 py-3">
            {/* Headline */}
            <motion.p
                initial={{ opacity: 0, y: -6 }}
                animate={{ opacity: 1, y: 0 }}
                className="mb-2.5 text-center text-[11px] font-semibold leading-snug text-muted-foreground px-2"
            >
                বাংলাদেশের নির্ভরযোগ্য ডিজিটাল স্বাস্থ্যসেবা নেটওয়ার্ক —{" "}
                <span className="text-primary">কোনো দালাল নেই, কোনো লুকানো চার্জ নেই।</span>
            </motion.p>

            {/* Stats grid */}
            <div className="grid grid-cols-4 gap-1.5">
                {STATS.map((stat, i) => (
                    <motion.div
                        key={stat.label}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: i * 0.08 }}
                        className="flex flex-col items-center rounded-lg border border-border/40 bg-card/80 px-1 py-2 text-center backdrop-blur-sm"
                    >
                        <stat.icon className={`mb-1 h-4 w-4 ${stat.color}`} />
                        <p className={`text-sm font-bold leading-none ${stat.color}`}>
                            <AnimatedCounter target={stat.value} suffix={stat.suffix} />
                        </p>
                        <p className="mt-0.5 text-[9px] leading-tight text-muted-foreground">{stat.label}</p>
                    </motion.div>
                ))}
            </div>
        </div>
    );
}
