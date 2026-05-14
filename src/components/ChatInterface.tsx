import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Send, AlertTriangle, Hospital, FlaskConical, Mic, MicOff, RotateCcw, Volume2, VolumeX, Camera, X, PhoneCall, Stethoscope, Activity, Navigation, Phone, Calendar, Info } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { usePatient, getTreatmentTier } from "@/contexts/PatientContext";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import OnboardingCard from "@/components/OnboardingCard";
import SavePromptBanner from "@/components/SavePromptBanner";
import ProfileSwitcher from "@/components/ProfileSwitcher";
import { handleMedicalConsultation } from "@/lib/orchestrator";
import { uploadMedicalDocument } from "@/lib/medicalRecords";
import { useNavigate } from "react-router-dom";
import { DoctorCard } from "@/components/cards/DoctorCard";
import { HospitalCard } from "@/components/cards/HospitalCard";
import { CostCard } from "@/components/cards/CostCard";
import BookingModal from "@/components/BookingModal";
import type { ServiceType } from "@/components/BookingModal";
import { isEmergencyMessage } from "@/lib/doctorSaabAgents";
import { useBengaliTTS } from "@/hooks/useBengaliTTS";
import { supabase } from "@/integrations/supabase/client";
import doctorAvatar from "@/assets/doctor-avatar.png";
import type { AiMedicalResponse } from "@/lib/aiChat";

interface Message {
  id: string;
  text: string;
  sender: "user" | "doctor";
  isError?: boolean;
  retryText?: string;
  imageUrl?: string;
  bookingTrigger?: "hospital" | "clinic" | "diagnostic" | "ambulance" | null;
  aiResponse?: AiMedicalResponse;
}

const defaultQuickActions = [
  { label: "জরুরি সাহায্য", icon: AlertTriangle, id: "emergency", emergency: true },
  { label: "কাছের হাসপাতাল", icon: Hospital, id: "hospital", emergency: false },
  { label: "টেস্টের খরচ", icon: FlaskConical, id: "diagnostic", emergency: false },
];

interface ChatInterfaceProps {
  initialPrompt?: string;
  onShowResults?: () => void;
  onAiResults?: (results: AiMedicalResponse) => void;
}

export default function ChatInterface({ initialPrompt, onShowResults, onAiResults }: ChatInterfaceProps) {
  const { profile, setProfile, treatmentTier, isGuest, addRewardPoints, activeMember, familyMembers } = usePatient();
  const { user } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [onboardingDone, setOnboardingDone] = useState(false);
  const [emergencyBanner, setEmergencyBanner] = useState(false);
  const [consultationCount, setConsultationCount] = useState(0);
  const [dynamicActions, setDynamicActions] = useState(defaultQuickActions);
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "welcome",
      text: "আসসালামু আলাইকুম! আমি ডাক্তার সাব। 😊\n\nনিচে আপনার তথ্য দিন, অথবা সরাসরি আপনার সমস্যা লিখুন।",
      sender: "doctor",
    },
  ]);
  const [input, setInput] = useState("");

  // ── AI Memory: persist chat via localStorage + Supabase sync ──────────
  const CHAT_STORAGE_KEY = `ds_chat_${user?.id || 'guest'}`;
  const chatSyncRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Load: try localStorage first (instant), then fallback to Supabase
  useEffect(() => {
    let restored = false;
    try {
      const saved = localStorage.getItem(CHAT_STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved) as Message[];
        if (Array.isArray(parsed) && parsed.length > 1) {
          setMessages(parsed.map(m => ({ id: m.id, text: m.text, sender: m.sender })));
          setOnboardingDone(true);
          restored = true;
        }
      }
    } catch { /* corrupt storage — ignore */ }

    // If no local data and user is logged in, try Supabase
    if (!restored && user?.id) {
      (async () => {
        try {
          const { data } = await (supabase as any)
            .from("medical_records")
            .select("content_data")
            .eq("user_id", user.id)
            .eq("record_type", "chat_session")
            .order("created_at", { ascending: false })
            .limit(1)
            .maybeSingle();
          if (data?.content_data?.messages?.length > 1) {
            const msgs = data.content_data.messages as Message[];
            setMessages(msgs.map(m => ({ id: m.id, text: m.text, sender: m.sender })));
            setOnboardingDone(true);
          }
        } catch { /* silent */ }
      })();
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Save: localStorage (instant) + debounced Supabase sync
  useEffect(() => {
    if (messages.length <= 1) return;
    const toSave = messages.slice(-30).map(m => ({ id: m.id, text: m.text, sender: m.sender }));

    // 1. Instant localStorage save
    try {
      localStorage.setItem(CHAT_STORAGE_KEY, JSON.stringify(toSave));
    } catch { /* storage quota exceeded */ }

    // 2. Debounced Supabase sync (every 5 seconds max)
    if (user?.id) {
      if (chatSyncRef.current) clearTimeout(chatSyncRef.current);
      chatSyncRef.current = setTimeout(async () => {
        try {
          await (supabase as any).from("medical_records").upsert({
            user_id: user.id,
            record_type: "chat_session",
            title: "AI Chat Session",
            content_data: { messages: toSave, updated_at: new Date().toISOString() },
          }, { onConflict: "user_id,record_type" });
        } catch { /* silent — Supabase sync is best-effort */ }
      }, 5000);
    }
  }, [messages, CHAT_STORAGE_KEY, user?.id]);
  const [isTyping, setIsTyping] = useState(false);
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [initialPromptSent, setInitialPromptSent] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const sendDebounceRef = useRef<number | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const recognitionRef = useRef<any>(null);
  const [isListening, setIsListening] = useState(false);
  // Booking modal state
  const [bookingOpen, setBookingOpen] = useState(false);
  const [bookingServiceType, setBookingServiceType] = useState<ServiceType>("clinic");
  const [bookingProviderName, setBookingProviderName] = useState("ডাক্তার সাব নেটওয়ার্ক");

  useEffect(() => {
    // Initialize Web Speech API
    if (typeof window !== 'undefined' && ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window)) {
      const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      recognitionRef.current = new SpeechRecognition();
      recognitionRef.current.continuous = false;
      recognitionRef.current.interimResults = false;
      recognitionRef.current.lang = 'bn-BD';

      recognitionRef.current.onresult = (event: any) => {
        const transcript = event.results[event.results.length - 1][0].transcript;
        if (transcript) {
          setInput(prev => prev ? prev + ' ' + transcript : transcript);
        }
      };

      recognitionRef.current.onend = () => {
        setIsListening(false);
      };

      recognitionRef.current.onerror = (event: any) => {
        console.error("Speech recognition error", event.error);
        setIsListening(false);
      };
    }
  }, []);

  const toggleListening = async () => {
    if (!recognitionRef.current) {
      toast({ title: "অসমর্থিত ব্রাউজার", description: "আপনার ব্রাউজার ভয়েস ইনপুট সমর্থন করে না।", variant: "destructive" });
      return;
    }
    
    if (isListening) {
      recognitionRef.current.stop();
      setIsListening(false);
    } else {
      try {
        // Explicitly request microphone permission first to fix mobile WebView silent failures
        if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
          await navigator.mediaDevices.getUserMedia({ audio: true });
        }
        recognitionRef.current.start();
        setIsListening(true);
        toast({ title: "শুনছি...", description: "আপনার শারীরিক সমস্যাটি বলুন..." });
      } catch (err) {
        console.error("Mic error:", err);
        toast({ title: "পারমিশন এরর", description: "অনুগ্রহ করে মাইক্রোফোন ব্যবহারের অনুমতি দিন।", variant: "destructive" });
      }
    }
  };

  const handleImageCapture = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    // Reset input so same file can be re-selected
    e.target.value = "";

    if (!user) {
      // Guest: mock behaviour with a toast and a text message
      toast({ title: "রিপোর্ট পাঠানো হয়েছে", description: "AI এখন পর্যালোচনা করছে। রিপোর্ট সেভ করতে লগইন করুন।" });
      addMessage("এটি আমার মেডিকেল রিপোর্ট/প্রেসক্রিপশনের ছবি। দয়া করে দেখুন:");
      return;
    }

    toast({ title: "আপলোড হচ্ছে...", description: file.name });
    try {
      const { publicUrl, fileName, ocrAnalysis } = await uploadMedicalDocument(file, user.id);
      toast({ title: "✅ সফলভাবে সেভ হয়েছে", description: `${fileName} আপনার মেডিকেল ভল্টে সংরক্ষিত।` });
      addMessage(`📎 মেডিকেল রিপোর্ট আপলোড করা হয়েছে: **${fileName}**\nAI এখন বিশ্লেষণ করছে...`);
      // If AI could analyze it, inject the result as a doctor message
      if (ocrAnalysis && ocrAnalysis.trim()) {
        setTimeout(() => {
          setMessages(prev => [...prev, {
            id: `ocr-${Date.now()}`,
            sender: "doctor" as const,
            text: `🔬 **রিপোর্ট বিশ্লেষণ:**\n\n${ocrAnalysis}`,
            timestamp: new Date(),
          }]);
        }, 800);
      }
    } catch (err: any) {
      toast({ title: "আপলোড ব্যর্থ", description: err?.message || "পুনরায় চেষ্টা করুন।", variant: "destructive" });
      addMessage("এটি আমার মেডিকেল রিপোর্ট/প্রেসক্রিপশনের ছবি। দয়া করে দেখুন:");
    }
  };

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages, isTyping]);

  useEffect(() => {
    if (initialPrompt && onboardingDone && !initialPromptSent) {
      setInitialPromptSent(true);
      setTimeout(() => {
        addMessage(initialPrompt);
      }, 500);
    }
  }, [initialPrompt, onboardingDone, initialPromptSent]);

  function handleOnboardingSubmit(data: any) {
    let estimatedNumericalIncome = 20000;
    if (data.monthlyIncome.includes("Below 10,000")) estimatedNumericalIncome = 8000;
    else if (data.monthlyIncome.includes("25,000 – 50,000")) estimatedNumericalIncome = 35000;
    else if (data.monthlyIncome.includes("50,000 – 1,00,000")) estimatedNumericalIncome = 70000;
    else if (data.monthlyIncome.includes("Above 1,00,000")) estimatedNumericalIncome = 120000;

    setProfile({
      age: data.age,
      gender: data.gender,
      location: data.location,
      upazila: data.upazila,
      monthlyIncome: estimatedNumericalIncome,
    });

    setOnboardingDone(true);
    const tier = getTreatmentTier(estimatedNumericalIncome);
    const summaryText = `📋 তথ্য প্রদান করা হয়েছে | বয়স: ${data.age} | ${data.location}`;
    
    setMessages((prev) => [...prev, { id: Date.now().toString(), text: summaryText, sender: "user" }]);
    setIsTyping(true);

    setTimeout(() => {
      setIsTyping(false);
      setMessages((prev) => [
        ...prev,
        {
          id: (Date.now() + 1).toString(),
          text: `ধন্যবাদ! আপনার তথ্য সংরক্ষিত আছে। এখন সরাসরি আপনার শারীরিক সমস্যাটি বলুন। 😊`,
          sender: "doctor",
        },
      ]);
    }, 1000);
  }

  async function addMessage(text: string, imageFile?: File | null) {
    if (!text.trim() && !imageFile) return;

    if (text && isEmergencyMessage(text)) {
      setEmergencyBanner(true);
    }

    const userMsg: Message = { id: Date.now().toString(), text: text || "📷 ছবি পাঠানো হয়েছে", sender: "user" };
    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setSelectedImage(null);
    setImagePreview(null);
    setIsTyping(true);

    const doctorMsgId = (Date.now() + 1).toString();

    try {
      let fullResponseString = "";
      const result = await handleMedicalConsultation({
        message: text,
        userId: user?.id,
        patientContext: {
          age: profile.age,
          gender: profile.gender,
          location: profile.location,
          upazila: profile.upazila,
          monthlyIncome: profile.monthlyIncome,
          treatmentTier,
        },
        conversationHistory: messages
          .filter(m => m.id !== "welcome")
          .slice(-6)
          .map(m => ({ role: m.sender === "user" ? "user" : "model", text: m.text })),
        onDelta: (delta) => {
          fullResponseString += delta;
          setMessages((prev) => {
            const last = prev[prev.length - 1];
            if (last?.id === doctorMsgId) {
              return prev.map(m => m.id === doctorMsgId ? { ...m, text: fullResponseString } : m);
            }
            return [...prev, { id: doctorMsgId, text: fullResponseString, sender: "doctor" }];
          });
        }
      });

      setIsTyping(false);

      if (typeof result === "object") {
        setMessages((prev) =>
          prev.map(m => m.id === doctorMsgId ? { ...m, aiResponse: result, bookingTrigger: result.bookingTrigger } : m)
        );
        setConsultationCount(prev => prev + 1);
        if (onAiResults) onAiResults(result);
      } else {
        setMessages((prev) =>
          prev.map(m => m.id === doctorMsgId ? { ...m, text: result } : m)
        );
      }
    } catch (err: any) {
      setIsTyping(false);
      toast({ title: "সিস্টেম এরর", description: err.message, variant: "destructive" });
    }
  }

  async function handleBookingAction(trigger: string, providerName?: string) {
    const serviceMap: Record<string, ServiceType> = {
      hospital:   "hospital",
      clinic:     "clinic",
      diagnostic: "diagnostic",
      ambulance:  "ambulance",
      virtual:    "doctor",
      doctor:     "doctor",
    };
    const serviceType: ServiceType = serviceMap[trigger] || "clinic";
    setBookingServiceType(serviceType);
    setBookingProviderName(providerName || "ডাক্তার সাব নেটওয়ার্ক");
    setBookingOpen(true);
  }

  return (
    <div className="patient-screen chat-screen-bg active h-full relative" style={{ position: 'relative' }}>
      
      {/* Booking Modal */}
      <BookingModal
        open={bookingOpen}
        onClose={() => setBookingOpen(false)}
        serviceType={bookingServiceType}
        providerName={bookingProviderName}
      />
      
      {/* Header matching HTML */}
      <div className="chat-header">
        <div className="flex items-center justify-between">
          <div className="chat-ai-info">
            <div className="chat-ai-av relative">
              🤖
              <div className="absolute w-2.5 h-2.5 rounded-full border-2 border-[var(--g7)] bg-[var(--g3)] -bottom-1 -right-1" />
            </div>
            <div>
              <div className="chat-ai-name">ডাক্তার সাব AI</div>
              <div className="chat-ai-status">
                <div className="w-1.5 h-1.5 rounded-full bg-[var(--g3)] animate-pulse" /> 
                ২৪/৭ আপনার সেবায়
              </div>
            </div>
          </div>
          <Button variant="ghost" size="icon" className="tb-icon-btn dark text-white" onClick={() => navigate?.("/home")}>
             <X className="h-5 w-5" />
          </Button>
        </div>
      </div>

      {emergencyBanner && (
        <div className="bg-destructive text-white py-2 px-4 flex items-center justify-between text-xs font-bold animate-pulse z-10 shrink-0">
          <div className="flex items-center gap-2">
            <AlertTriangle className="h-4 w-4" />
            <span>জরুরি অবস্থা: ৯৯৯ এ কল দিন</span>
          </div>
          <Button variant="ghost" size="sm" className="h-6 text-white px-2 py-0" onClick={() => setEmergencyBanner(false)}>বন্ধ করুন</Button>
        </div>
      )}

      {!onboardingDone && !isGuest && (
        <div className="absolute inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm p-4">
          <OnboardingCard onSubmit={handleOnboardingSubmit} />
        </div>
      )}

      <div ref={scrollRef} className="chat-messages relative">
        {messages.map((msg) => (
          msg.sender === "doctor" ? (
            <div key={msg.id} className="ai-msg">
              <div className="ai-msg-av">🤖</div>
              <div className="flex flex-col gap-2">
                <div className="ai-bubble">
                  <p className="whitespace-pre-line text-sm">{msg.text}</p>
                </div>
                {msg.aiResponse && (
                  <div className="space-y-3 mt-1 animate-in fade-in slide-in-from-bottom-2 duration-500 w-full max-w-[90%] pl-2">
                    {msg.aiResponse.tests && msg.aiResponse.tests.length > 0 && (
                      <CostCard tests={msg.aiResponse.tests} />
                    )}
                    {msg.aiResponse.recommendedDoctors?.map((doc, i) => (
                      <DoctorCard 
                        key={i} 
                        doctor={doc} 
                        variant="v3"
                        onBook={() => handleBookingAction("clinic", doc.doctorName)} 
                        onVirtual={() => handleBookingAction("virtual", doc.doctorName)}
                      />
                    ))}
                    {msg.aiResponse.hospitals?.map((hosp, i) => (
                      <HospitalCard 
                        key={i} 
                        hospital={hosp} 
                        onCall={() => window.open(`tel:${hosp.phone || ""}`)} 
                        onDirection={() => {}}
                      />
                    ))}
                    {msg.bookingTrigger && (
                      <Button
                        className="w-full h-10 rounded-xl bg-primary font-bold gap-2 text-xs"
                        onClick={() => handleBookingAction(msg.bookingTrigger!, msg.aiResponse?.recommendedDoctors?.[0]?.doctorName)}
                      >
                        <Calendar className="h-4 w-4" /> বুকিং রিকোয়েস্ট
                      </Button>
                    )}
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div key={msg.id} className="user-msg">
              <div className="flex flex-col items-end gap-1">
                 <div className="user-bubble">
                   <p className="whitespace-pre-line text-sm">{msg.text}</p>
                 </div>
                 <span className="msg-time">{new Date().toLocaleTimeString('bn-BD', { hour: '2-digit', minute: '2-digit' })}</span>
              </div>
            </div>
          )
        ))}
        {isTyping && (
           <div className="ai-msg">
             <div className="ai-msg-av animate-pulse">🤖</div>
             <div className="ai-bubble flex gap-1 py-3">
               <div className="h-1.5 w-1.5 rounded-full bg-[var(--ink4)] animate-bounce" />
               <div className="h-1.5 w-1.5 rounded-full bg-[var(--ink4)] animate-bounce delay-100" />
               <div className="h-1.5 w-1.5 rounded-full bg-[var(--ink4)] animate-bounce delay-200" />
             </div>
           </div>
        )}
      </div>

      <div className="chat-input-bar">
        <input 
          type="file" 
          accept="image/*" 
          capture="environment" 
          ref={fileInputRef} 
          onChange={handleImageCapture} 
          className="hidden" 
          id="camera-input" 
        />
        <Button 
          variant="ghost" 
          size="icon" 
          className="h-10 w-10 shrink-0 text-[var(--ink3)] rounded-[20px] bg-[var(--bg)] hover:bg-[var(--line)]"
          onClick={() => fileInputRef.current?.click()}
        >
           <Camera className="h-5 w-5" />
        </Button>
        <div className="ci-wrap relative">
          <Input 
            className="ci-input h-10 w-full bg-transparent border-none p-0 focus-visible:ring-0 shadow-none text-base"
            placeholder="লক্ষণ, বয়স এবং লোকেশন বলুন..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && addMessage(input)}
          />
          {input ? (
             <button 
               className="h-8 w-8 rounded-full bg-[var(--g5)] text-white flex items-center justify-center shadow-md absolute right-1.5 transition-transform hover:scale-105"
               onClick={() => addMessage(input)}
               disabled={isTyping}
             >
               <Send className="h-3.5 w-3.5 ml-0.5" />
             </button>
          ) : (
             <button 
               className={`h-8 w-8 rounded-full flex items-center justify-center absolute right-1.5 transition-colors ${isListening ? 'bg-red-500 text-white animate-pulse shadow-md' : 'text-[var(--ink3)] hover:bg-slate-100'}`}
               onClick={toggleListening}
               title="ভয়েস ইনপুট"
             >
               {isListening ? <MicOff className="h-4 w-4" /> : <Mic className="h-4 w-4" />}
             </button>
          )}
        </div>
      </div>
    </div>
  );
}
