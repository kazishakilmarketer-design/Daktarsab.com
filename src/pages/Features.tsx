import { Construction, LayoutList, Pill, RefreshCcw, FileText, UploadCloud, TestTube, Microscope, HeartPulse } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { motion } from "framer-motion";

export default function Features() {
  const currentFeatures = [
    {
      title: "AI স্বাস্থ্য পরামর্শ",
      desc: "ডাক্তার সাব AI এর সাহায্যে যেকোনো শারীরিক লক্ষণের প্রাথমিক পরামর্শ এবং কোন বিশেষজ্ঞ দেখানো উচিত তা জানুন।",
      icon: HeartPulse,
      badge: "জনপ্রিয়"
    },
    {
      title: "প্রেসক্রিপশন অডিটর",
      desc: "আপনার ডাক্তারি প্রেসক্রিপশনের ছবি আপলোড করে ওষুধের নাম, নিয়ম এবং বিকল্প জানুন।",
      icon: FileText,
      badge: "সক্রিয়"
    },
    {
      title: "কাছের হাসপাতাল",
      desc: "আপনার লোকেশন অনুযায়ী সবচেয়ে কাছের হাসপাতাল, ক্লিনিক বা অ্যাম্বুলেন্স খুঁজে বের করুন।",
      icon: Microscope,
      badge: "সক্রিয়"
    }
  ];

  const upcomingFeatures = [
    {
      title: "মেডিসিন ডেলিভারি",
      desc: "প্রেসক্রিপশন স্ক্যান করে ঘরে বসেই প্রয়োজনীয় ওষুধ অর্ডার করুন মাত্র কয়েক ক্লিকে।",
      icon: Pill
    },
    {
      title: "ল্যাব টেস্ট বুকিং",
      desc: "ডায়াগনস্টিক সেন্টারে না গিয়ে বাসায় থেকে প্যাথলজি টেস্টের স্যাম্পল కలেকশন সুবিধা।",
      icon: TestTube
    },
    {
      title: "টেলিমেডিসিন (লাইভ কল)",
      desc: "বিশেষজ্ঞ ডাক্তারদের সাথে সরাসরি ভিডিও বা অডিও কলের মাধ্যমে চিকিৎসা সেবা।",
      icon: RefreshCcw
    },
    {
      title: "হেলথ রেকর্ড স্টোরেজ",
      desc: "আগের সব প্রেসক্রিপশন এবং টেস্ট রিপোর্ট সুরক্ষিতভাবে সেভ করে রাখার সুবিধা।",
      icon: UploadCloud
    }
  ];

  return (
    <div className="flex h-screen flex-col bg-slate-50">
      <div className="flex-1 overflow-y-auto px-4 py-8 md:px-8">
        <div className="mx-auto max-w-4xl space-y-10">
          
          <div className="text-center space-y-3">
            <h1 className="text-3xl font-bold text-slate-900 tracking-tight flex justify-center items-center gap-2">
              <LayoutList className="h-8 w-8 text-primary" />
              সকল সেবাসমূহ
            </h1>
            <p className="text-muted-foreground text-sm max-w-md mx-auto">
              ডাক্তার সাব প্ল্যাটফর্মের বর্তমান সুবিধা এবং আগামী দিনের সকল উদ্ভাবনী স্বাস্থ্য সেবার তালিকা।
            </p>
          </div>

          <section>
            <h2 className="text-xl font-bold mb-4 flex items-center gap-2">বর্তমান ফিচারসমূহ</h2>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {currentFeatures.map((f, i) => (
                <motion.div 
                  initial={{ opacity: 0, y: 15 }} 
                  animate={{ opacity: 1, y: 0 }} 
                  transition={{ delay: i * 0.1 }}
                  key={i} 
                  className="bg-white p-5 rounded-2xl shadow-sm border border-slate-100 flex flex-col gap-3"
                >
                  <div className="flex items-center justify-between">
                    <div className="h-10 w-10 bg-emerald-50 rounded-xl flex items-center justify-center">
                      <f.icon className="h-5 w-5 text-emerald-600" />
                    </div>
                    <Badge className="bg-emerald-100 text-emerald-700 hover:bg-emerald-200 shadow-none border-none pointer-events-none">
                      {f.badge}
                    </Badge>
                  </div>
                  <div>
                    <h3 className="font-bold text-slate-800">{f.title}</h3>
                    <p className="text-sm text-slate-500 mt-1 leading-relaxed">{f.desc}</p>
                  </div>
                </motion.div>
              ))}
            </div>
          </section>

          <section className="pb-12">
            <h2 className="text-xl font-bold mb-4 flex items-center gap-2 text-slate-700">
              <Construction className="h-5 w-5 text-amber-500" /> আপকামিং ফিচারসমূহ
            </h2>
            <div className="grid gap-4 md:grid-cols-2">
              {upcomingFeatures.map((f, i) => (
                <motion.div 
                  initial={{ opacity: 0, scale: 0.95 }} 
                  animate={{ opacity: 1, scale: 1 }} 
                  transition={{ delay: 0.3 + (i * 0.1) }}
                  key={i} 
                  className="bg-slate-100/50 p-5 rounded-2xl border border-dashed border-slate-200 flex items-start gap-4"
                >
                  <div className="h-12 w-12 bg-slate-200/50 rounded-xl flex items-center justify-center shrink-0">
                    <f.icon className="h-6 w-6 text-slate-400" />
                  </div>
                  <div>
                    <h3 className="font-bold text-slate-700">{f.title}</h3>
                    <p className="text-sm text-slate-500 mt-1 leading-relaxed">{f.desc}</p>
                    <Badge variant="outline" className="mt-2 text-[10px] text-slate-400 border-slate-200">শীঘ্রই আসছে</Badge>
                  </div>
                </motion.div>
              ))}
            </div>
          </section>

        </div>
      </div>
    </div>
  );
}
