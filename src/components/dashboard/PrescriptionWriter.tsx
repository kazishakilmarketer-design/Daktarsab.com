import { useState, useEffect } from "react";
import { Search, CheckCircle, Save, Plus, Trash2, Calendar, User, FileText, Download, Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import html2canvas from "html2canvas";

export default function PrescriptionWriter() {
  const { user } = useAuth();
  const { toast } = useToast();
  
  const [patients, setPatients] = useState<any[]>([]);
  const [selectedPatientId, setSelectedPatientId] = useState<string>("");
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  
  const [diagnosis, setDiagnosis] = useState("");
  const [medicines, setMedicines] = useState<{name: string, dosage: string, duration: string}[]>([]);
  const [notes, setNotes] = useState("");
  
  const [medInput, setMedInput] = useState({name: "", dosage: "", duration: ""});

  useEffect(() => {
    // Load patients from accepted/completed bookings
    const loadPatients = async () => {
      setLoading(true);
      const { data } = await supabase
        .from("booking_requests")
        .select("user_id, user_name, user_phone")
        .in("status", ["accepted", "completed"])
        .eq("provider_name", user?.user_metadata?.full_name || "Doctor"); // Assuming we match by name or we could use a better join
      
      if (data) {
        // Unique patients
        const unique = Array.from(new Map(data.filter(d => d.user_id).map(item => [item.user_id, item])).values());
        setPatients(unique);
      }
      setLoading(false);
    };
    if (user) loadPatients();
  }, [user]);

  const addMedicine = () => {
    if (!medInput.name) return;
    setMedicines([...medicines, medInput]);
    setMedInput({name: "", dosage: "", duration: ""});
  };

  const handleSave = async () => {
    if (!selectedPatientId) {
      toast({ title: "ত্রুটি", description: "রোগী নির্বাচন করুন", variant: "destructive" });
      return;
    }
    if (!diagnosis || medicines.length === 0) {
      toast({ title: "ত্রুটি", description: "রোগ নির্ণয় এবং অন্তত একটি ওষুধ দিন", variant: "destructive" });
      return;
    }

    setSaving(true);
    try {
      // 1. Save to medical_records for patient history
      await supabase.from("medical_records").insert({
        user_id: selectedPatientId,
        record_type: "prescription",
        title: `প্রেসক্রিপশন: ${diagnosis}`,
        content_data: {
          diagnosis,
          medicines,
          notes,
          doctor_id: user?.id,
          doctor_name: user?.user_metadata?.full_name || "Doctor Saab"
        }
      });
      
      toast({ title: "সফল", description: "প্রেসক্রিপশন সফলভাবে সেভ হয়েছে।" });
      
      // Reset
      setDiagnosis("");
      setMedicines([]);
      setNotes("");
      setSelectedPatientId("");
      
    } catch (err) {
      console.error(err);
      toast({ title: "ত্রুটি", description: "সেভ করতে সমস্যা হয়েছে।", variant: "destructive" });
    } finally {
      setSaving(false);
    }
  };

  return (
    <div style={{ padding: "20px", flex: 1, overflowY: "auto", maxWidth: "800px", margin: "0 auto" }}>
      <div style={{ marginBottom: 20 }}>
        <h2 style={{ fontSize: 20, fontWeight: 800, color: "#0F172A", margin: 0, display: "flex", alignItems: "center", gap: 8 }}>
          <FileText className="w-6 h-6 text-indigo-600" /> ডিজিটাল প্রেসক্রিপশন
        </h2>
        <p style={{ fontSize: 13, color: "#64748B", marginTop: 4 }}>রোগীদের জন্য নিরাপদ ডিজিটাল প্রেসক্রিপশন তৈরি করুন</p>
      </div>

      <div style={{ background: "#fff", borderRadius: 16, padding: 24, boxShadow: "0 4px 6px -1px rgba(0,0,0,0.05), 0 2px 4px -1px rgba(0,0,0,0.03)" }}>
        
        {/* Patient Selection */}
        <div style={{ marginBottom: 20 }}>
          <label style={{ display: "block", fontSize: 13, fontWeight: 700, color: "#334155", marginBottom: 6 }}>রোগী নির্বাচন করুন</label>
          <select 
            value={selectedPatientId}
            onChange={(e) => setSelectedPatientId(e.target.value)}
            style={{ width: "100%", padding: "10px 14px", borderRadius: 8, border: "1px solid #E2E8F0", outline: "none", fontSize: 14 }}
          >
            <option value="">-- রোগী নির্বাচন করুন --</option>
            {patients.map(p => (
              <option key={p.user_id} value={p.user_id}>{p.user_name} ({p.user_phone})</option>
            ))}
          </select>
        </div>

        {/* Diagnosis */}
        <div style={{ marginBottom: 20 }}>
          <label style={{ display: "block", fontSize: 13, fontWeight: 700, color: "#334155", marginBottom: 6 }}>রোগ নির্ণয় (Diagnosis)</label>
          <input 
            type="text"
            value={diagnosis}
            onChange={e => setDiagnosis(e.target.value)}
            placeholder="যেমন: Viral Fever, Hypertension..."
            style={{ width: "100%", padding: "10px 14px", borderRadius: 8, border: "1px solid #E2E8F0", outline: "none", fontSize: 14 }}
          />
        </div>

        {/* Medicines */}
        <div style={{ marginBottom: 24, border: "1px solid #E2E8F0", borderRadius: 12, padding: 16, background: "#F8FAF9" }}>
          <h3 style={{ fontSize: 14, fontWeight: 700, color: "#0F172A", marginBottom: 12, display: "flex", alignItems: "center", gap: 6 }}>
            <Plus className="w-4 h-4 text-emerald-600" /> ওষুধ যোগ করুন
          </h3>
          
          <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr 1fr auto", gap: 10, alignItems: "end" }}>
            <div>
              <label style={{ display: "block", fontSize: 11, color: "#64748B", marginBottom: 4 }}>ওষুধের নাম</label>
              <input value={medInput.name} onChange={e=>setMedInput({...medInput, name: e.target.value})} placeholder="Tab. Napa 500mg" style={{ width: "100%", padding: "8px 12px", borderRadius: 6, border: "1px solid #CBD5E1", fontSize: 13 }} />
            </div>
            <div>
              <label style={{ display: "block", fontSize: 11, color: "#64748B", marginBottom: 4 }}>মাত্রা (Dosage)</label>
              <input value={medInput.dosage} onChange={e=>setMedInput({...medInput, dosage: e.target.value})} placeholder="1-0-1" style={{ width: "100%", padding: "8px 12px", borderRadius: 6, border: "1px solid #CBD5E1", fontSize: 13 }} />
            </div>
            <div>
              <label style={{ display: "block", fontSize: 11, color: "#64748B", marginBottom: 4 }}>মেয়াদ</label>
              <input value={medInput.duration} onChange={e=>setMedInput({...medInput, duration: e.target.value})} placeholder="5 দিন" style={{ width: "100%", padding: "8px 12px", borderRadius: 6, border: "1px solid #CBD5E1", fontSize: 13 }} />
            </div>
            <button onClick={addMedicine} style={{ padding: "8px 16px", background: "#0F172A", color: "#fff", borderRadius: 6, fontSize: 13, fontWeight: 600, border: "none", cursor: "pointer", height: "37px" }}>
              যোগ
            </button>
          </div>

          {medicines.length > 0 && (
            <div style={{ marginTop: 16 }}>
              <table style={{ width: "100%", borderCollapse: "collapse" }}>
                <thead>
                  <tr style={{ borderBottom: "1px solid #E2E8F0" }}>
                    <th style={{ textAlign: "left", padding: "8px", fontSize: 12, color: "#64748B" }}>ওষুধ</th>
                    <th style={{ textAlign: "left", padding: "8px", fontSize: 12, color: "#64748B" }}>মাত্রা</th>
                    <th style={{ textAlign: "left", padding: "8px", fontSize: 12, color: "#64748B" }}>মেয়াদ</th>
                    <th style={{ textAlign: "right", padding: "8px", fontSize: 12, color: "#64748B" }}>মুছুন</th>
                  </tr>
                </thead>
                <tbody>
                  {medicines.map((m, idx) => (
                    <tr key={idx} style={{ borderBottom: "1px dashed #E2E8F0" }}>
                      <td style={{ padding: "8px", fontSize: 13, fontWeight: 600 }}>{m.name}</td>
                      <td style={{ padding: "8px", fontSize: 13 }}>{m.dosage}</td>
                      <td style={{ padding: "8px", fontSize: 13 }}>{m.duration}</td>
                      <td style={{ padding: "8px", textAlign: "right" }}>
                        <button onClick={() => setMedicines(medicines.filter((_, i) => i !== idx))} style={{ background: "transparent", border: "none", color: "#EF4444", cursor: "pointer" }}>
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Notes */}
        <div style={{ marginBottom: 24 }}>
          <label style={{ display: "block", fontSize: 13, fontWeight: 700, color: "#334155", marginBottom: 6 }}>পরামর্শ / টেস্ট (Advice / Tests)</label>
          <textarea 
            rows={3}
            value={notes}
            onChange={e => setNotes(e.target.value)}
            placeholder="রোগীর জন্য অতিরিক্ত পরামর্শ বা টেস্টের নাম..."
            style={{ width: "100%", padding: "10px 14px", borderRadius: 8, border: "1px solid #E2E8F0", outline: "none", fontSize: 14, resize: "vertical" }}
          />
        </div>

        <button 
          onClick={handleSave} 
          disabled={saving || !selectedPatientId || medicines.length === 0}
          style={{ width: "100%", padding: "12px", background: "#4F46E5", color: "#fff", borderRadius: 8, fontSize: 15, fontWeight: 700, border: "none", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: 8, opacity: (saving || !selectedPatientId || medicines.length === 0) ? 0.6 : 1 }}
        >
          {saving ? <Loader2 className="w-5 h-5 animate-spin" /> : <Save className="w-5 h-5" />}
          প্রেসক্রিপশন সেভ করুন
        </button>

      </div>
    </div>
  );
}
