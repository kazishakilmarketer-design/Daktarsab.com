import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, UploadCloud, FileText, Trash2, Loader2, Download } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";

interface ReportRec {
  id: string;
  title: string;
  file_url: string;
  created_at: string;
}

export default function TestReports() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { toast } = useToast();

  const [reports, setReports] = useState<ReportRec[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);



  const loadReports = useCallback(async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from("medical_records")
        .select("id, title, file_url, created_at")
        .eq("user_id", user?.id)
        .eq("record_type", "report")
        .order("created_at", { ascending: false });
      if (error) throw error;
      setReports(data || []);
    } catch (e: unknown) {
      toast({ title: "Error", description: e instanceof Error ? e.message : "Unknown error", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  }, [user?.id, toast]);

  useEffect(() => {
    if (user) loadReports();
  }, [user, loadReports]);

  async function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    if (!e.target.files?.[0] || !user) return;
    const file = e.target.files[0];

    // Restrict size/type if needed
    if (file.size > 5 * 1024 * 1024) {
      toast({ title: "ফাইল সাইজ বেশি", description: "৫ মেগাবাইট এর ছোট ফাইল আপলোড করুন।", variant: "destructive" });
      return;
    }

    setUploading(true);
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${user.id}/${Date.now()}.${fileExt}`;

      // Upload to Storage
      const { error: uploadErr } = await supabase.storage
        .from("patient_documents")
        .upload(fileName, file);

      if (uploadErr) throw uploadErr;

      // Ensure the meet_link/file_url schema insert
      const { error: insertErr } = await supabase.from("medical_records").insert({
        user_id: user.id,
        record_type: "report",
        title: file.name,
        file_url: fileName
      });

      if (insertErr) throw insertErr;

      toast({ title: "সফল", description: "রিপোর্ট সফলভাবে আপলোড হয়েছে!" });
      loadReports();
    } catch (err: unknown) {
      toast({ title: "আপলোড ব্যর্থ", description: err instanceof Error ? err.message : "Unknown error", variant: "destructive" });
    } finally {
      setUploading(false);
      e.target.value = ''; // reset
    }
  }

  async function deleteReport(id: string, file_url: string) {
    if (!confirm("আপনি কি নিশ্চিত এই রিপোর্টটি মুছে ফেলতে চান?")) return;
    try {
      const { error: delStorageErr } = await supabase.storage.from("patient_documents").remove([file_url]);
      if (delStorageErr) throw delStorageErr;
      
      const { error } = await supabase.from("medical_records").delete().eq("id", id);
      if (error) throw error;

      toast({ title: "সফল", description: "রিপোর্ট মুছে ফেলা হয়েছে।" });
      setReports(r => r.filter(x => x.id !== id));
    } catch (err: unknown) {
      toast({ title: "ত্রুটি", description: err instanceof Error ? err.message : "Unknown error", variant: "destructive" });
    }
  }

  async function downloadReport(file_url: string) {
    try {
      const { data, error } = await supabase.storage.from("patient_documents").createSignedUrl(file_url, 60);
      if (error) throw error;
      if (data?.signedUrl) window.open(data.signedUrl, '_blank');
    } catch (err: unknown) {
      toast({ title: "ডাউনলোড ব্যর্থ", description: err instanceof Error ? err.message : "Unknown error", variant: "destructive" });
    }
  }

  return (
    <div className="patient-screen active bg-white">
      {/* Header */}
      <div className="flex items-center gap-3 px-4 h-14 border-b border-gray-100 sticky top-0 bg-white z-10 w-full" style={{ left: 0, right: 0 }}>
        <button onClick={() => navigate("/profile")} className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-50 text-gray-700">
          <ArrowLeft className="w-5 h-5" />
        </button>
        <span className="font-bold text-[15px] sm:text-base text-gray-900">টেস্টের রিপোর্ট</span>
      </div>

      <div className="p-4 safe-area-bottom">
        {/* Upload Zone */}
        <div className="border border-dashed border-[#1DB954] bg-[#E8F8EE] rounded-2xl p-6 text-center mb-6 relative hover:opacity-90 transition-opacity">
          <input 
            type="file" 
            accept="image/jpeg,image/png,application/pdf"
            onChange={handleFileChange}
            disabled={uploading}
            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer disabled:cursor-not-allowed" 
          />
          {uploading ? (
            <div className="flex flex-col items-center gap-2">
              <Loader2 className="w-8 h-8 animate-spin text-[#1DB954]" />
              <span className="text-sm font-semibold text-[#0d6b58]">আপলোড হচ্ছে...</span>
            </div>
          ) : (
            <div className="flex flex-col items-center gap-2">
              <UploadCloud className="w-8 h-8 text-[#1DB954]" />
              <span className="text-[13px] font-bold text-[#0d6b58]">ল্যাব রিপোর্ট আপলোড করুন</span>
              <span className="text-[11px] text-[#0d6b58] opacity-70">JPG, PNG, PDF (Max 5MB)</span>
            </div>
          )}
        </div>

        {/* List */}
        <div className="font-bold text-[14px] text-gray-900 mb-3">আমার আপলোড করা রিপোর্ট</div>
        {loading ? (
          <div className="py-10 flex justify-center"><Loader2 className="w-6 h-6 animate-spin text-gray-400" /></div>
        ) : reports.length === 0 ? (
          <div className="text-center py-10 bg-gray-50 rounded-xl border border-gray-100">
            <FileText className="w-8 h-8 text-gray-300 mx-auto mb-2" />
            <div className="text-xs text-gray-500 font-medium">কোনো রিপোর্ট পাওয়া যায়নি</div>
          </div>
        ) : (
          <div className="flex flex-col gap-3">
            {reports.map(r => (
              <div key={r.id} className="border border-gray-100 rounded-xl p-3 flex items-center gap-3 bg-white shadow-[0_2px_8px_rgba(0,0,0,0.02)]">
                <div className="w-10 h-10 rounded-lg bg-gray-50 border border-gray-100 flex items-center justify-center text-gray-400 flex-shrink-0">
                  <FileText className="w-5 h-5" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-[13px] font-bold text-gray-900 truncate">{r.title}</div>
                  <div className="text-[11px] text-gray-500 mt-0.5">{new Date(r.created_at).toLocaleDateString('en-GB')}</div>
                </div>
                <div className="flex items-center gap-1">
                  <button onClick={() => downloadReport(r.file_url)} className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-[#EAF9F3] text-[#0d6b58] transition-colors">
                    <Download className="w-4 h-4" />
                  </button>
                  <button onClick={() => deleteReport(r.id, r.file_url)} className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-[#FEF2F2] text-[#EF4444] transition-colors">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
