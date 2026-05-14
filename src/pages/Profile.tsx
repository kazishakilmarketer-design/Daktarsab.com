import { useState, useEffect } from "react";
import { 
  User, Mail, Phone, MapPin, Pill, Activity, History, Settings, LogOut, 
  Stethoscope, Award, ChevronRight, X, Heart, Building2, Eye, TestTubes, BriefcaseMedical, Baby,
  CalendarDays, Plus, Save, Edit3, Trash2, ShieldCheck, Users
} from "lucide-react";
import Header from "@/components/Header";
import { usePatient } from "@/contexts/PatientContext";
import { useProfile } from "@/hooks/useProfile";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";

const districts = [
  "ঢাকা", "চট্টগ্রাম", "রাজশাহী", "খুলনা", "বরিশাল",
  "সিলেট", "রংপুর", "ময়মনসিংহ", "কুমিল্লা", "গাজীপুর",
];

export default function Profile() {
  // We still use PatientContext for the active member selection (chat context) and rewards
  const { rewardPoints, activeMemberId, setActiveMemberId } = usePatient();

  // The new local-storage hook handles the actual data
  const { profile, isLoaded, updateProfile, addFamilyMember, deleteFamilyMember } = useProfile();

  // Primary User Form State
  const [isEditingDocs, setIsEditingDocs] = useState(false);
  const [editName, setEditName] = useState("");
  const [editPhone, setEditPhone] = useState("");
  const [editBlood, setEditBlood] = useState("");
  const [editDistrict, setEditDistrict] = useState("");
  const [editUpazila, setEditUpazila] = useState("");

  // Family Member Form State
  const [dialogOpen, setDialogOpen] = useState(false);
  const [newName, setNewName] = useState("");
  const [newRelation, setNewRelation] = useState("");
  const [newAge, setNewAge] = useState("");
  const [newGender, setNewGender] = useState("");

  // Sync form state when profile loads
  useEffect(() => {
    if (isLoaded) {
      setEditName(profile.name || "");
      setEditPhone(profile.phone || "");
      setEditBlood(profile.bloodGroup || "");
      setEditDistrict(profile.district || "");
      setEditUpazila(profile.upazila || "");
    }
  }, [isLoaded, profile]);

  if (!isLoaded) return <div className="p-8 text-center text-muted-foreground">লোড হচ্ছে...</div>;

  function handleSavePrimary() {
    updateProfile({
      name: editName,
      phone: editPhone,
      bloodGroup: editBlood,
      district: editDistrict,
      upazila: editUpazila,
    });
    setIsEditingDocs(false);
  }

  function handleAddMember() {
    if (!newName.trim() || !newAge || !newGender) return;
    addFamilyMember({
      name: newName,
      relation: newRelation || "পরিবার",
      age: newAge,
      gender: newGender,
    });
    setNewName(""); setNewRelation(""); setNewAge(""); setNewGender("");
    setDialogOpen(false);
  }

  return (
    <div className="flex h-full flex-col bg-slate-50">
      <Header />
      <div className="flex-1 overflow-y-auto p-4 md:p-6 lg:p-8">
        <div className="mx-auto max-w-3xl w-full space-y-5">

          {/* ─── PRIMARY DETAILS CARD ────────────────────────────────────── */}
          <Card className="border-primary/20 shadow-sm">
            <CardHeader className="pb-2 flex flex-row justify-between items-start">
              <div className="flex items-center gap-3">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/10">
                  <User className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <CardTitle className="text-base font-bold text-foreground">আমার প্রোফাইল</CardTitle>
                  <p className="text-xs text-muted-foreground flex gap-1 items-center mt-0.5">
                    <ShieldCheck className="h-3 w-3 text-emerald-500" />
                    ডিভাইসে সুরক্ষিত
                  </p>
                </div>
              </div>
              {!isEditingDocs ? (
                <Button variant="ghost" size="sm" onClick={() => setIsEditingDocs(true)} className="h-8 px-2 text-xs">
                  <Edit3 className="mr-1 h-3.5 w-3.5" /> এডিট
                </Button>
              ) : (
                <Button size="sm" onClick={handleSavePrimary} className="h-8 px-3 text-xs bg-emerald-600">
                  <Save className="mr-1 h-3.5 w-3.5" /> সেভ করুন
                </Button>
              )}
            </CardHeader>
            <CardContent className="pt-2">
              {isEditingDocs ? (
                <div className="space-y-3 bg-white p-3 rounded-xl border border-slate-100">
                  <div className="space-y-1.5">
                    <Label className="text-xs">আপনার নাম</Label>
                    <Input value={editName} onChange={(e) => setEditName(e.target.value)} placeholder="যেমন: আব্দুল করিম" className="h-8 text-sm" />
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div className="space-y-1.5">
                      <Label className="text-xs">মোবাইল নম্বর</Label>
                      <Input value={editPhone} onChange={(e) => setEditPhone(e.target.value)} placeholder="01XXX" className="h-8 text-sm" />
                    </div>
                    <div className="space-y-1.5">
                      <Label className="text-xs">রক্তের গ্রুপ</Label>
                      <Select value={editBlood} onValueChange={setEditBlood}>
                        <SelectTrigger className="h-8 text-xs"><SelectValue placeholder="নির্বাচন" /></SelectTrigger>
                        <SelectContent>
                          {["A+", "A-", "B+", "B-", "O+", "O-", "AB+", "AB-"].map(bg => (
                            <SelectItem key={bg} value={bg}>{bg}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div className="space-y-1.5">
                      <Label className="text-xs">জেলা</Label>
                      <Select value={editDistrict} onValueChange={setEditDistrict}>
                        <SelectTrigger className="h-8 text-xs"><SelectValue placeholder="জেলা" /></SelectTrigger>
                        <SelectContent>
                          {districts.map((d) => <SelectItem key={d} value={d}>{d}</SelectItem>)}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-1.5">
                      <Label className="text-xs">উপজেলা (Upazila)</Label>
                      <Input value={editUpazila} onChange={(e) => setEditUpazila(e.target.value)} placeholder="যেমন: মিরপুর" className="h-8 text-sm" />
                    </div>
                  </div>
                </div>
              ) : (
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-y-4 gap-x-2 bg-slate-50 p-4 rounded-xl">
                  <div>
                    <p className="text-[10px] uppercase tracking-wider text-muted-foreground font-semibold">নাম</p>
                    <p className="text-sm font-medium mt-0.5">{profile.name || "—"}</p>
                  </div>
                  <div>
                    <p className="text-[10px] uppercase tracking-wider text-muted-foreground font-semibold">মোবাইল</p>
                    <p className="text-sm font-medium mt-0.5">{profile.phone || "—"}</p>
                  </div>
                  <div>
                    <p className="text-[10px] uppercase tracking-wider text-muted-foreground font-semibold">রক্তের গ্রুপ</p>
                    <p className="text-sm font-medium mt-0.5 text-red-600 font-bold">{profile.bloodGroup || "—"}</p>
                  </div>
                  <div>
                    <p className="text-[10px] uppercase tracking-wider text-muted-foreground font-semibold">ঠিকানা</p>
                    <p className="text-sm font-medium mt-0.5">
                      {profile.upazila ? `${profile.upazila}, ` : ""}{profile.district || "—"}
                    </p>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* ─── HEALTH POINTS ────────────────────────────────────────────── */}
          <Card className="border-accent bg-gradient-to-br from-accent/50 to-card shadow-sm">
            <CardContent className="flex items-center gap-4 p-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10">
                <Award className="h-6 w-6 text-primary" />
              </div>
              <div className="flex-1">
                <p className="text-sm font-bold text-foreground">হেলথ পয়েন্ট</p>
                <p className="text-2xl font-bold text-primary">{rewardPoints}</p>
              </div>
              <div className="text-right">
                <p className="text-[10px] text-muted-foreground">প্রতি পরামর্শে +৫</p>
                <p className="text-[10px] text-muted-foreground">রিডিম শীঘ্রই আসছে</p>
              </div>
            </CardContent>
          </Card>

          {/* ─── FAMILY MEMBERS ───────────────────────────────────────────── */}
          <Card className="shadow-sm">
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm font-bold flex items-center gap-2">
                  <Heart className="h-4 w-4 text-rose-500 fill-rose-500/20" />
                  পরিবারের সদস্য
                </CardTitle>

                <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
                  <DialogTrigger asChild>
                    <Button size="sm" variant="outline" className="h-7 gap-1 text-xs rounded-full">
                      <Plus className="h-3 w-3" /> সদস্য যোগ
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-sm rounded-2xl">
                    <DialogHeader>
                      <DialogTitle>নতুন সদস্য যোগ করুন</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4 pt-2">
                      <div className="space-y-1.5">
                        <Label className="text-xs font-semibold">নাম *</Label>
                        <Input value={newName} onChange={(e) => setNewName(e.target.value)} placeholder="যেমন: আম্মা" className="h-10 text-sm" />
                      </div>
                      <div className="space-y-1.5">
                        <Label className="text-xs font-semibold">সম্পর্ক</Label>
                        <Input value={newRelation} onChange={(e) => setNewRelation(e.target.value)} placeholder="যেমন: মা, ভাই" className="h-10 text-sm" />
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div className="space-y-1.5">
                          <Label className="text-xs font-semibold">বয়স *</Label>
                          <Input type="number" value={newAge} onChange={(e) => setNewAge(e.target.value)} placeholder="৫৫" className="h-10 text-sm" />
                        </div>
                        <div className="space-y-1.5">
                          <Label className="text-xs font-semibold">লিঙ্গ *</Label>
                          <Select value={newGender} onValueChange={setNewGender}>
                            <SelectTrigger className="h-10"><SelectValue placeholder="নির্বাচন" /></SelectTrigger>
                            <SelectContent>
                              <SelectItem value="পুরুষ">পুরুষ</SelectItem>
                              <SelectItem value="মহিলা">মহিলা</SelectItem>
                              <SelectItem value="অন্যান্য">অন্যান্য</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </div>
                      <Button className="w-full mt-2 h-10 rounded-xl" onClick={handleAddMember} disabled={!newName.trim() || !newAge || !newGender}>
                        সদস্য সেভ করুন
                      </Button>
                    </div>
                  </DialogContent>
                </Dialog>
              </div>
            </CardHeader>
            <CardContent className="space-y-3 pt-2">
              {profile.familyMembers.length === 0 ? (
                <div className="py-6 flex flex-col items-center justify-center text-center bg-slate-50 border border-dashed rounded-xl">
                  <Users className="mb-2 h-6 w-6 text-slate-300" />
                  <p className="text-xs text-muted-foreground">এখনো কোনো সদস্য যোগ করা হয়নি</p>
                  <p className="text-[10px] text-muted-foreground mt-1">পরিবারের তথ্য ডিভাইসে নিরাপদে সেভ থাকবে</p>
                </div>
              ) : (
                profile.familyMembers.map((m) => (
                  <div
                    key={m.id}
                    className={`flex w-full items-center gap-3 rounded-xl border p-3 text-left transition-colors relative group ${activeMemberId === m.id
                      ? "border-emerald-500/50 bg-emerald-50/50"
                      : "border-border hover:bg-secondary/30"
                      }`}
                  >
                    <button
                      onClick={() => setActiveMemberId(activeMemberId === m.id ? null : m.id)}
                      className="flex flex-1 items-center gap-3 text-left"
                    >
                      <div className={`flex h-10 w-10 items-center justify-center rounded-full text-sm font-bold ${activeMemberId === m.id ? "bg-emerald-500 text-white" : "bg-primary/10 text-primary"
                        }`}>
                        {m.name.charAt(0)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold truncate text-slate-800">{m.name}</p>
                        <p className="text-[11px] text-muted-foreground mt-0.5">{m.relation} • বয়স {m.age} • {m.gender}</p>
                      </div>
                    </button>

                    {activeMemberId === m.id && (
                      <Badge variant="default" className="text-[10px] shrink-0 bg-emerald-500 absolute top-3 right-3 shadow-none">চ্যাটে সক্রিয়</Badge>
                    )}

                    {/* Delete Button (Visible on hover or if not active) */}
                    <button
                      onClick={(e) => { e.stopPropagation(); deleteFamilyMember(m.id); }}
                      className="p-2 text-slate-300 hover:text-red-500 transition-colors rounded-full hover:bg-red-50"
                      title="Delete Member"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                ))
              )}
            </CardContent>
          </Card>

        </div>
      </div>
    </div>
  );
}
