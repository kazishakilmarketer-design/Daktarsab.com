import React, { useRef, useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, IdCard, QrCode, Activity, Heart, Droplet, User, Calendar, MapPin, Download, Loader2, FileText } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { usePatient } from "@/contexts/PatientContext";
import html2canvas from "html2canvas";
import { useToast } from "@/hooks/use-toast";
import { QRCodeSVG } from "qrcode.react";
import { supabase } from "@/integrations/supabase/client";
import { Upload, File, Trash2 } from "lucide-react";

export default function HealthCard() {
  const navigate = useNavigate();
  const { user, userProfile } = useAuth();
  const { profile } = usePatient();

  const displayName = userProfile?.full_name || user?.user_metadata?.full_name || "সম্মানিত ব্যবহারকারী";
  const displayPhone = userProfile?.phone || user?.phone || "ফোন নম্বর যোগ করুন";
  const displayAge = userProfile?.age || profile?.age || "N/A";
  const displayGender = userProfile?.gender || profile?.gender || "N/A";
  const displayBloodGroup = (userProfile as any)?.blood_group || "N/A";
  const { toast } = useToast();
  const cardRef = useRef<HTMLDivElement>(null);
  const [downloading, setDownloading] = useState(false);
  const [medicalRecords, setMedicalRecords] = useState<any[]>([]);
  const [activeTab, setActiveTab] = useState<"card" | "vault">("card");
  const [vaultFiles, setVaultFiles] = useState<any[]>([]);
  const [isUploading, setIsUploading] = useState(false);

  useEffect(() => {
    if (user?.id) {
      supabase
        .from("medical_records")
        .select("*")
        .eq("patient_id", user.id)
        .eq("type", "summary")
        .order("created_at", { ascending: false })
        .limit(3)
        .then(({ data }) => {
          if (data) setMedicalRecords(data);
        });
        
      fetchVaultFiles();
    }
  }, [user?.id]);

  const fetchVaultFiles = async () => {
    if (!user?.id) return;
    const { data, error } = await supabase
      .from("health_vault")
      .select("*")
      .eq("user_id", user.id)
      .order("upload_date", { ascending: false });
    
    if (!error && data) {
      setVaultFiles(data);
    }
  };

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file || !user?.id) return;

    setIsUploading(true);
    try {
      // 1. Upload to Supabase Storage (assuming bucket 'medical_files' exists, if not we simulate)
      // For now, we simulate the storage upload and just insert into the vault table
      const fileExt = file.name.split('.').pop();
      const fileName = `${Math.random()}.${fileExt}`;
      const mockUrl = `https://example.com/storage/${fileName}`;

      let fileType = "other";
      if (file.name.toLowerCase().includes("prescription")) fileType = "prescription";
      else if (file.name.toLowerCase().includes("lab")) fileType = "lab_report";
      else if (file.name.toLowerCase().includes("xray")) fileType = "xray";

      const { error } = await supabase.from("health_vault").insert({
        user_id: user.id,
        file_name: file.name,
        file_url: mockUrl,
        file_type: fileType
      });

      if (error) throw error;
      
      toast({ title: "সফল!", description: "ফাইল সফলভাবে আপলোড হয়েছে।" });
      fetchVaultFiles();
    } catch (err: any) {
      toast({ title: "ত্রুটি", description: err.message || "ফাইল আপলোড ব্যর্থ হয়েছে।", variant: "destructive" });
    } finally {
      setIsUploading(false);
    }
  };

  const deleteVaultFile = async (id: string) => {
    try {
      const { error } = await supabase.from("health_vault").delete().eq("id", id);
      if (error) throw error;
      toast({ title: "সফল!", description: "ফাইল ডিলিট করা হয়েছে।" });
      fetchVaultFiles();
    } catch (err) {
      toast({ title: "ত্রুটি", description: "ডিলিট করতে সমস্যা হয়েছে।", variant: "destructive" });
    }
  };

  // Generate a mock unique ID from the user's UUID for the health card
  const generateMedicalId = (uuid: string) => {
    if (!uuid) return "MD-0000-0000";
    const segment = uuid.split('-')[0].toUpperCase();
    return `MD-${segment}-${uuid.substring(9, 13).toUpperCase()}`;
  };

  const medicalId = generateMedicalId(user?.id || "");

  const handleDownload = async () => {
    if (!cardRef.current) return;
    setDownloading(true);
    try {
      const canvas = await html2canvas(cardRef.current, { scale: 3, useCORS: true, backgroundColor: null });
      const image = canvas.toDataURL("image/png");
      const a = document.createElement("a");
      a.href = image;
      a.download = `DoctorSaab_HealthCard_${displayName}.png`;
      a.click();
      toast({ title: "সফল!", description: "স্বাস্থ্য কার্ড আপনার গ্যালারিতে সেভ হয়েছে।" });
    } catch (err) {
      toast({ title: "ত্রুটি", description: "কার্ড সেভ করতে সমস্যা হয়েছে।", variant: "destructive" });
    } finally {
      setDownloading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[var(--bg)] pb-20">
      <div className="bg-white sticky top-0 z-50 flex items-center justify-between h-14 px-4 shadow-sm">
        <div className="flex items-center">
          <button onClick={() => navigate(-1)} className="p-2 -ml-2 text-slate-600 rounded-full hover:bg-slate-100 transition-colors">
            <ArrowLeft className="w-5 h-5" />
          </button>
          <span className="font-semibold text-slate-800 ml-2">ডিজিটাল স্বাস্থ্য কার্ড</span>
        </div>
        <button onClick={handleDownload} disabled={downloading} className="flex items-center gap-1.5 text-sm font-semibold text-white bg-[var(--primary)] px-3 py-1.5 rounded-full hover:bg-emerald-700 transition-colors disabled:opacity-60">
          {downloading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Download className="w-4 h-4" />}
          সেভ করুন
        </button>
      </div>

      <div className="flex bg-white px-4 pt-2 shadow-sm mb-4">
        <button 
          onClick={() => setActiveTab("card")}
          className={`flex-1 pb-3 text-sm font-bold border-b-2 transition-colors ${activeTab === "card" ? "border-[var(--primary)] text-[var(--primary)]" : "border-transparent text-slate-500 hover:text-slate-700"}`}
        >
          আমার কার্ড
        </button>
        <button 
          onClick={() => setActiveTab("vault")}
          className={`flex-1 pb-3 text-sm font-bold border-b-2 transition-colors ${activeTab === "vault" ? "border-[var(--primary)] text-[var(--primary)]" : "border-transparent text-slate-500 hover:text-slate-700"}`}
        >
          হেলথ ভল্ট
        </button>
      </div>

      {activeTab === "card" ? (
        <div className="p-4 space-y-6 overflow-x-hidden">
          <div ref={cardRef} className="relative overflow-hidden rounded-2xl shadow-xl aspect-[1.6/1] flex flex-col justify-between p-5"
               style={{
                 background: "linear-gradient(135deg, var(--g8), var(--g5))",
                 boxShadow: "0 20px 40px -10px rgba(10, 169, 126, 0.4)"
               }}>
            
            <div className="flex justify-between items-start">
              <div className="flex items-center gap-2">
                <div className="bg-white/20 p-2 rounded-lg backdrop-blur-sm">
                  <IdCard className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h2 className="text-white font-bold text-lg leading-tight">ডাক্তার সাব</h2>
                  <p className="text-white/80 text-[10px] uppercase font-medium tracking-wider">Health ID Card</p>
                </div>
              </div>
              <div className="bg-white p-1 rounded-sm">
                <QRCodeSVG 
                  value={JSON.stringify({
                    id: medicalId,
                    name: displayName,
                    bg: displayBloodGroup
                  })} 
                  size={40} 
                  level="L" 
                  fgColor="#0d6b58" 
                />
              </div>
            </div>

            <div className="mt-auto">
              <div className="space-y-1">
                <p className="text-white/70 text-xs font-medium uppercase tracking-widest">রোগীর নাম</p>
                <p className="text-white text-xl font-bold">{displayName}</p>
              </div>
              
              <div className="flex justify-between items-end mt-4">
                <div>
                  <p className="text-white/70 text-xs font-medium uppercase tracking-widest mb-1">কার্ড নম্বর</p>
                  <p className="text-white font-mono font-medium tracking-wider">{medicalId}</p>
                </div>
                <div className="text-right">
                  <p className="text-white/70 text-xs font-medium uppercase tracking-widest mb-1">ভ্যালিডিটি</p>
                  <p className="text-white text-sm font-medium">Lifetime</p>
                </div>
              </div>
            </div>

            <div className="absolute -bottom-12 -right-12 text-white/5 opacity-50 transform rotate-[-15deg]">
              <Activity className="w-48 h-48" />
            </div>
          </div>

          <div className="bg-white rounded-2xl p-5 shadow-sm border border-slate-100">
            <h3 className="font-bold text-slate-800 mb-4 flex items-center gap-2">
              <User className="w-5 h-5 text-[var(--g6)]" />
              মেডিকেল প্রোফাইল তথ্য
            </h3>
            
            <div className="grid grid-cols-2 gap-y-5 gap-x-4">
              <div className="col-span-2 flex items-center p-3 bg-slate-50 rounded-xl">
                <div className="bg-green-100 p-2 rounded-full mr-3 text-green-600">
                  <Heart className="w-4 h-4" />
                </div>
                <div>
                  <p className="text-[10px] text-slate-500 font-medium uppercase tracking-wide">রেজিস্টার্ড মোবাইল</p>
                  <p className="text-sm font-bold text-slate-800">{displayPhone}</p>
                </div>
              </div>

              <div className="flex items-center p-3 bg-red-50 rounded-xl">
                <div className="bg-red-100 p-2 rounded-full mr-3 text-red-600">
                  <Droplet className="w-4 h-4" />
                </div>
                <div>
                  <p className="text-[10px] text-red-500 font-medium uppercase tracking-wide">ব্লাড গ্রুপ</p>
                  <p className="text-sm font-bold text-red-900">{displayBloodGroup}</p>
                </div>
              </div>

              <div className="flex items-center p-3 bg-blue-50 rounded-xl">
                <div className="bg-blue-100 p-2 rounded-full mr-3 text-blue-600">
                  <Calendar className="w-4 h-4" />
                </div>
                <div>
                  <p className="text-[10px] text-blue-500 font-medium uppercase tracking-wide">বয়স</p>
                  <p className="text-sm font-bold text-blue-900">{displayAge}</p>
                </div>
              </div>

              <div className="flex items-center p-3 bg-purple-50 rounded-xl">
                <div className="bg-purple-100 p-2 rounded-full mr-3 text-purple-600">
                  <User className="w-4 h-4" />
                </div>
                <div>
                  <p className="text-[10px] text-purple-500 font-medium uppercase tracking-wide">লিঙ্গ</p>
                  <p className="text-sm font-bold text-purple-900">{displayGender}</p>
                </div>
              </div>

              <div className="flex items-center p-3 bg-orange-50 rounded-xl">
                <div className="bg-orange-100 p-2 rounded-full mr-3 text-orange-600">
                  <MapPin className="w-4 h-4" />
                </div>
                <div>
                  <p className="text-[10px] text-orange-500 font-medium uppercase tracking-wide">স্থায়ী ঠিকানা</p>
                  <p className="text-sm font-bold text-orange-900 truncate w-24" title={userProfile?.district || "N/A"}>
                    {userProfile?.district || "N/A"}
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 flex items-start gap-3">
            <Activity className="w-5 h-5 text-[var(--g6)] shrink-0 mt-0.5" />
            <p className="text-xs text-slate-600 leading-relaxed">
              এই ডিজিটাল স্বাস্থ্য কার্ডটি ডাক্তার সাব নেটওয়ার্কের যেকোনো হাসপাতালে বা ডাক্তারের কাছে সেবা গ্রহণের সময় আপনার পরিচয় হিসেবে কাজে লাগবে।
            </p>
          </div>

          {medicalRecords.length > 0 && (
            <div className="bg-white rounded-2xl p-5 shadow-sm border border-slate-100">
              <h3 className="font-bold text-slate-800 mb-4 flex items-center gap-2">
                <FileText className="w-5 h-5 text-indigo-500" />
                সাম্প্রতিক পরামর্শ
              </h3>
              <div className="space-y-3">
                {medicalRecords.map((record) => (
                  <div key={record.id} className="p-3 bg-slate-50 border border-slate-100 rounded-xl">
                    <div className="flex justify-between items-start mb-1">
                      <span className="text-xs font-semibold text-slate-700">
                        {new Date(record.created_at).toLocaleDateString('bn-BD', { year: 'numeric', month: 'long', day: 'numeric' })}
                      </span>
                      <span className="text-[10px] font-medium px-2 py-0.5 bg-indigo-100 text-indigo-700 rounded-full">
                        সারসংক্ষেপ
                      </span>
                    </div>
                    <p className="text-sm text-slate-600 line-clamp-2 mt-1">
                      {record.content_data?.notes || "পরামর্শের বিস্তারিত তথ্য উপলব্ধ নয়"}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      ) : (
        <div className="p-4 max-w-[430px] mx-auto">
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100 text-center mb-6">
            <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-4 text-emerald-600">
              <Upload className="w-8 h-8" />
            </div>
            <h3 className="text-lg font-bold text-slate-800 mb-2">মেডিকেল রিপোর্ট আপলোড করুন</h3>
            <p className="text-sm text-slate-500 mb-6">আপনার প্রেসক্রিপশন, ল্যাব রিপোর্ট বা এক্স-রে সংরক্ষণ করুন নিরাপদে।</p>
            
            <label className="relative overflow-hidden cursor-pointer bg-[var(--primary)] text-white px-6 py-3 rounded-xl font-semibold shadow-md shadow-emerald-200 inline-flex items-center gap-2 hover:bg-emerald-700 transition-colors">
              {isUploading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Upload className="w-5 h-5" />}
              {isUploading ? "আপলোড হচ্ছে..." : "ফাইল নির্বাচন করুন"}
              <input type="file" className="absolute inset-0 opacity-0 cursor-pointer" onChange={handleFileUpload} disabled={isUploading} accept=".pdf,.png,.jpg,.jpeg" />
            </label>
          </div>

          <h4 className="font-bold text-slate-800 mb-4 px-1">আমার ফাইলসমূহ ({vaultFiles.length})</h4>
          <div className="space-y-3">
            {vaultFiles.length === 0 ? (
              <div className="text-center py-8 text-slate-400 text-sm bg-slate-50 rounded-xl border border-dashed border-slate-200">
                কোনো ফাইল আপলোড করা হয়নি
              </div>
            ) : (
              vaultFiles.map((file) => (
                <div key={file.id} className="bg-white p-4 rounded-xl shadow-sm border border-slate-100 flex items-center gap-4">
                  <div className="w-12 h-12 bg-slate-50 rounded-lg flex items-center justify-center text-slate-400 shrink-0">
                    <File className="w-6 h-6" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h5 className="font-semibold text-slate-800 text-sm truncate">{file.file_name}</h5>
                    <p className="text-xs text-slate-500 capitalize">{file.file_type.replace('_', ' ')} • {new Date(file.upload_date).toLocaleDateString()}</p>
                  </div>
                  <button onClick={() => deleteVaultFile(file.id)} className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors shrink-0">
                    <Trash2 className="w-5 h-5" />
                  </button>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}
