import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";

import Header from "@/components/Header";
import ChatInterface from "@/components/ChatInterface";
import ResultsPanel from "@/components/ResultsPanel";
import ImpactBanner from "@/components/ImpactBanner";
import TermsAndConditionsModal from "@/components/TermsAndConditionsModal";
import LeadGateModal from "@/components/LeadGateModal";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Stethoscope, Building2, TestTubes, UserCheck } from "lucide-react";
import { useIsMobile } from "@/hooks/use-mobile";
import type { AiMedicalResponse } from "@/lib/aiChat";
import { useLocation } from "react-router-dom";

// Check T&C acceptance from localStorage
function hasAcceptedTos(): boolean {
  try {
    const stored = localStorage.getItem("daktarsab_tos_v1");
    return stored ? JSON.parse(stored).accepted === true : false;
  } catch {
    return false;
  }
}

export default function Index() {
  const location = useLocation();
  console.log("[Index] Mounting", { pathname: location.pathname, state: location.state });
  const initialPrompt = location.state?.initialPrompt as string | undefined;

  const [showResults, setShowResults] = useState(false);
  const [activeTab, setActiveTab] = useState("advice");
  const [aiResults, setAiResults] = useState<AiMedicalResponse | null>(null);
  const isMobile = useIsMobile();

  // T&C gate
  const [tosAccepted, setTosAccepted] = useState(hasAcceptedTos);

  // Lead Gate
  const [showLeadGate, setShowLeadGate] = useState(() => {
    return !sessionStorage.getItem("guest_mode_bypassed");
  });

  return (
    <div className="flex h-full min-h-full w-full flex-col bg-background overflow-hidden">
      {/* T&C Modal — must accept before using chat */}
      <TermsAndConditionsModal
        open={!tosAccepted}
        role="user"
        onAccept={() => setTosAccepted(true)}
      />

      {/* Lead Gate Modal (Only shows if T&C accepted and not bypassed) */}
      <LeadGateModal 
        open={tosAccepted && showLeadGate} 
        onOpenChange={setShowLeadGate}
        onGuestContinue={() => {
          sessionStorage.setItem("guest_mode_bypassed", "true");
          setShowLeadGate(false);
        }}
      />

      <div className="flex flex-1 overflow-hidden bg-[var(--g9)]">
        <main className="relative flex flex-1 flex-col overflow-hidden">
          <ChatInterface
            initialPrompt={initialPrompt}
            onShowResults={() => setShowResults(true)}
            onAiResults={(results) => setAiResults(results)}
          />
        </main>

        <AnimatePresence>
          {showResults && (
             <motion.div
               initial={{ x: "100%" }}
               animate={{ x: 0 }}
               exit={{ x: "100%" }}
               transition={{ type: "spring", damping: 25, stiffness: 200 }}
               className="absolute inset-0 z-50 bg-background"
             >
               <ResultsPanel onClose={() => setShowResults(false)} aiData={aiResults} />
             </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
