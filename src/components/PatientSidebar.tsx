import { usePatient, getTreatmentTier } from "@/contexts/PatientContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { Badge } from "@/components/ui/badge";
import { UserRound, Banknote } from "lucide-react";
import DistrictSelector from "@/components/DistrictSelector";

export default function PatientSidebar() {
  const { profile, setProfile, treatmentTier } = usePatient();

  const tierColor = {
    "সরকারি": "bg-accent text-accent-foreground",
    "বেসরকারি": "bg-chat-user text-chat-user-foreground",
    "প্রিমিয়াম": "bg-primary text-primary-foreground",
  }[treatmentTier];

  return (
    <div className="space-y-4 p-4">
      <Card className="border-border shadow-sm">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-base">
            <UserRound className="h-4 w-4 text-primary" />
            রোগীর তথ্য
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Age */}
          <div className="space-y-1.5">
            <Label htmlFor="age" className="text-sm">বয়স</Label>
            <Input
              id="age"
              type="number"
              placeholder="যেমন: ৩৫"
              value={profile.age}
              onChange={(e) => setProfile((p) => ({ ...p, age: e.target.value }))}
              className="h-9"
            />
          </div>

          {/* Gender */}
          <div className="space-y-1.5">
            <Label className="text-sm">লিঙ্গ</Label>
            <Select
              value={profile.gender}
              onValueChange={(v) => setProfile((p) => ({ ...p, gender: v as any }))}
            >
              <SelectTrigger className="h-9">
                <SelectValue placeholder="নির্বাচন করুন" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="পুরুষ">পুরুষ</SelectItem>
                <SelectItem value="মহিলা">মহিলা</SelectItem>
                <SelectItem value="অন্যান্য">অন্যান্য</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Location */}
          <DistrictSelector
            value={profile.location}
            onValueChange={(v) => setProfile((p) => ({ ...p, location: v }))}
            upazila={profile.upazila || ""}
            onUpazilaChange={(v) => setProfile((p) => ({ ...p, upazila: v }))}
            showUpazila
          />

          {/* Income Slider */}
          <div className="space-y-2">
            <Label className="flex items-center gap-1.5 text-sm">
              <Banknote className="h-3.5 w-3.5 text-primary" />
              মাসিক আয়
            </Label>
            <Slider
              value={[profile.monthlyIncome]}
              onValueChange={([v]) => setProfile((p) => ({ ...p, monthlyIncome: v }))}
              min={5000}
              max={100000}
              step={1000}
              className="py-2"
            />
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">
                ৳{profile.monthlyIncome.toLocaleString("bn-BD")}
              </span>
              <Badge className={tierColor}>
                {treatmentTier}
              </Badge>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
