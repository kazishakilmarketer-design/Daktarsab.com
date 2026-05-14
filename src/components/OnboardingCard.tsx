import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { LogIn } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { getTreatmentTier, usePatient } from "@/contexts/PatientContext";
import { useAuth } from "@/hooks/useAuth";
import DistrictSelector from "@/components/DistrictSelector";
import { incomeRanges } from "@/lib/locations";


interface OnboardingCardProps {
  onSubmit: (data: {
    forWhom: "self" | "other";
    otherName: string;
    age: string;
    gender: string;
    location: string;
    upazila: string;
    monthlyIncome: string;
    saveProfile: boolean;
  }) => void;
}

export default function OnboardingCard({ onSubmit }: OnboardingCardProps) {
  const { isGuest } = usePatient();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [forWhom, setForWhom] = useState<"self" | "other">("self");
  const [otherName, setOtherName] = useState("");
  const [age, setAge] = useState("");
  const [gender, setGender] = useState("");
  const [location, setLocation] = useState("");
  const [upazila, setUpazila] = useState("");
  const [income, setIncome] = useState(incomeRanges[1]);
  const [saveProfile, setSaveProfile] = useState(false);

  // Default tier estimation based on the new string-based income range
  let estimatedNumericalIncome = 20000;
  if (income.includes("Below 10,000")) estimatedNumericalIncome = 8000;
  else if (income.includes("25,000 – 50,000")) estimatedNumericalIncome = 35000;
  else if (income.includes("50,000 – 1,00,000")) estimatedNumericalIncome = 70000;
  else if (income.includes("Above 1,00,000")) estimatedNumericalIncome = 120000;

  const tier = getTreatmentTier(estimatedNumericalIncome);
  const tierColor = {
    "সরকারি": "bg-accent text-accent-foreground",
    "বেসরকারি": "bg-chat-user text-chat-user-foreground",
    "প্রিমিয়াম": "bg-primary text-primary-foreground",
  }[tier];

  const isValid = age && gender && location && upazila && income && (!user || forWhom === "self" || otherName.trim());

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 16 }}
      transition={{ duration: 0.3 }}
      className="border-t border-border bg-card/80 backdrop-blur-sm p-2 pb-[env(safe-area-inset-bottom,8px)] md:p-3"
    >
      <Card className="border-border/60 shadow-md">
        <CardContent className="space-y-3 p-3 md:p-4">
          {/* Login prompt card — only for guests */}
          {!user && (
            <Card className="border-primary/30 bg-accent/50">
              <CardContent className="flex items-center gap-3 p-3">
                <LogIn className="h-5 w-5 shrink-0 text-primary" />
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-medium text-foreground">সেভড প্রোফাইল ব্যবহার করতে লগইন করুন।</p>
                  <p className="text-[10px] text-muted-foreground">পরিবারের তথ্য ও চ্যাট হিস্ট্রি সেভ থাকবে।</p>
                </div>
                <Button size="sm" className="h-7 shrink-0 gap-1 text-[11px]" onClick={() => navigate("/auth")}>
                  লগইন
                </Button>
              </CardContent>
            </Card>
          )}

          {/* Opening question — contextual */}
          <p className="text-xs text-center text-muted-foreground leading-relaxed">
            {user
              ? "আজ আমি আপনাকে বা আপনার পরিবারের কাউকে কীভাবে সাহায্য করতে পারি?"
              : "আপনার বেসিক তথ্য দিন, তারপর সমস্যা লিখুন।"}
          </p>

          {/* Guest mode indicator */}
          {!user && (
            <p className="text-[10px] text-center text-muted-foreground/60 tracking-wide">
              গেস্ট মোড — সাইন আপ ছাড়াই ব্যবহার করুন
            </p>
          )}

          {/* For whom toggle — only for logged-in users */}
          {user && (
            <Tabs value={forWhom} onValueChange={(v) => setForWhom(v as "self" | "other")} className="w-full">
              <TabsList className="grid w-full grid-cols-2 h-9">
                <TabsTrigger value="self" className="text-xs md:text-sm">আমার জন্য</TabsTrigger>
                <TabsTrigger value="other" className="text-xs md:text-sm">পরিবারের কারো জন্য</TabsTrigger>
              </TabsList>
            </Tabs>
          )}

          {/* Other person's name — only for logged-in "other" */}
          <AnimatePresence>
            {user && forWhom === "other" && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                className="space-y-1"
              >
                <Label className="text-xs text-muted-foreground">নাম / সম্পর্ক</Label>
                <Input
                  placeholder="যেমন: মা, ছোট ভাই"
                  value={otherName}
                  onChange={(e) => setOtherName(e.target.value)}
                  className="h-9 text-sm"
                />
              </motion.div>
            )}
          </AnimatePresence>

          {/* Age & Gender row */}
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label className="text-xs text-muted-foreground">বয়স</Label>
              <Input
                type="number"
                placeholder="৩৫"
                value={age}
                onChange={(e) => setAge(e.target.value)}
                className="h-9 text-sm"
              />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs text-muted-foreground">লিঙ্গ</Label>
              <Select value={gender} onValueChange={setGender}>
                <SelectTrigger className="h-9">
                  <SelectValue placeholder="নির্বাচন" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="পুরুষ">পুরুষ</SelectItem>
                  <SelectItem value="মহিলা">মহিলা</SelectItem>
                  <SelectItem value="অন্যান্য">অন্যান্য</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Location */}
          <DistrictSelector
            value={location}
            onValueChange={setLocation}
            upazila={upazila}
            onUpazilaChange={setUpazila}
            showUpazila={!!location}
          />

          {/* Income Dropdown — Always Visible */}
          <div className="space-y-1.5">
            <Label className="text-xs text-muted-foreground">মাসিক আয় (Monthly Income Range)</Label>
            <Select value={income} onValueChange={setIncome}>
              <SelectTrigger className="h-9">
                <SelectValue placeholder="আয় নির্বাচন" />
              </SelectTrigger>
              <SelectContent>
                {incomeRanges.map(range => (
                  <SelectItem key={range} value={range}>{range}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <div className="flex items-center justify-end">
              <Badge className={`text-[10px] ${tierColor}`}>{tier} সুবিধা</Badge>
            </div>
          </div>

          {/* Save profile checkbox — only for logged-in users */}
          {user && (
            <div className="flex items-center gap-2">
              <Checkbox
                id="save-profile"
                checked={saveProfile}
                onCheckedChange={(v) => setSaveProfile(v === true)}
              />
              <Label htmlFor="save-profile" className="text-xs text-muted-foreground cursor-pointer">
                তথ্য সেভ করুন (Family Profile)
              </Label>
            </div>
          )}

          {/* Submit */}
          <Button
            className="min-h-[44px] w-full bg-primary text-primary-foreground hover:bg-primary/90"
            onClick={() => onSubmit({
              forWhom: !user ? "self" : forWhom,
              otherName: !user ? "" : otherName,
              age,
              gender,
              location,
              upazila,
              monthlyIncome: income,
              saveProfile: !user ? false : saveProfile,
            })}
            disabled={!isValid}
          >
            শুরু করুন
          </Button>
        </CardContent>
      </Card>
    </motion.div>
  );
}
