/**
 * medicalRecords.ts
 * Helper utilities for uploading medical documents to Supabase Storage
 * and inserting metadata rows into the medical_records table.
 */
import { supabase } from "@/integrations/supabase/client";

export interface UploadResult {
  publicUrl: string;
  recordId: string;
  fileName: string;
  ocrAnalysis?: string;
}

/**
 * Uploads a medical document (image, PDF) to the patient_documents
 * Supabase Storage bucket and creates a row in medical_records.
 */
export async function uploadMedicalDocument(
  file: File,
  userId: string
): Promise<UploadResult> {
  // Sanitise the filename: strip spaces and special chars
  const ext = file.name.split(".").pop() || "jpg";
  const safeName = `${Date.now()}_${file.name.replace(/[^a-zA-Z0-9._-]/g, "_")}`;
  const storagePath = `${userId}/${safeName}`;

  // 1. Upload file to Supabase Storage bucket
  const { error: uploadErr } = await supabase.storage
    .from("patient_documents")
    .upload(storagePath, file, {
      contentType: file.type || "image/jpeg",
      upsert: false,
    });

  if (uploadErr) throw uploadErr;

  // 2. Get the public URL
  const { data: urlData } = supabase.storage
    .from("patient_documents")
    .getPublicUrl(storagePath);

  const publicUrl = urlData.publicUrl;

  // 3. Insert a row into medical_records
  const { data: record, error: dbErr } = await (supabase as any)
    .from("medical_records")
    .insert({
      user_id: userId,
      record_type: "report",
      title: file.name,
      file_url: publicUrl,
      notes: "Uploaded via AI chat camera",
    })
    .select("id")
    .single();

  if (dbErr) throw dbErr;

  // 4. Optional Gemini Vision OCR analysis (best-effort)
  let ocrAnalysis: string | undefined;
  try {
    const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;
    const SUPABASE_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY;
    if (SUPABASE_URL && SUPABASE_KEY) {
      const ocrRes = await fetch(`${SUPABASE_URL}/functions/v1/chat`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          apikey: SUPABASE_KEY,
          Authorization: `Bearer ${SUPABASE_KEY}`,
        },
        body: JSON.stringify({
          message: "এই মেডিকেল রিপোর্ট/প্রেসক্রিপশনটি বিশ্লেষণ করুন এবং মূল তথ্য বাংলায় সংক্ষেপ করুন। ওষুধ, রোগ নির্ণয়, এবং পরবর্তী পদক্ষেপ উল্লেখ করুন।",
          imageUrl: publicUrl,
        }),
      });
      if (ocrRes.ok) {
        ocrAnalysis = await ocrRes.text();
      }
    }
  } catch {
    // OCR is best-effort; don't fail the upload if it errors
  }

  return {
    publicUrl,
    recordId: record?.id || "",
    fileName: file.name,
    ocrAnalysis,
  };
}
