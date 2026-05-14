import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";

function parseCSV(text: string) {
  const lines = text.trim().split("\n");
  const headers = lines[0].replace(/^\uFEFF/, "").split(",").map((h) => h.trim());
  const rows: Record<string, string>[] = [];
  for (let i = 1; i < lines.length; i++) {
    // Handle quoted CSV fields
    const values: string[] = [];
    let current = "";
    let inQuotes = false;
    for (let j = 0; j < lines[i].length; j++) {
      const ch = lines[i][j];
      if (ch === '"') {
        inQuotes = !inQuotes;
      } else if (ch === ',' && !inQuotes) {
        values.push(current.trim());
        current = "";
      } else {
        current += ch;
      }
    }
    values.push(current.trim());
    if (values.length < headers.length) continue;
    const row: Record<string, string> = {};
    headers.forEach((h, idx) => (row[h] = values[idx] || ""));
    rows.push(row);
  }
  return rows;
}

function mapCategory(cat: string): string {
  const c = cat?.toLowerCase().trim();
  if (c === "government") return "সরকারি";
  if (c === "premium") return "প্রিমিয়াম";
  return "বেসরকারি";
}

export default function ImportHospitals() {
  const [status, setStatus] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleImportHospitals() {
    setLoading(true);
    setStatus("Hospital CSV ফাইল পড়ছে...");
    try {
      const res = await fetch("/data/hospitals.csv");
      const text = await res.text();
      const rows = parseCSV(text);
      setStatus(`${rows.length} হাসপাতাল পাওয়া গেছে। আপলোড শুরু হচ্ছে...`);
      const { data, error } = await supabase.functions.invoke("import-hospitals", {
        body: { csvData: rows },
      });
      if (error) {
        setStatus(`এরর: ${error.message}`);
      } else {
        setStatus(`✅ সফলভাবে ${data?.inserted || 0} হাসপাতাল আপলোড হয়েছে!`);
      }
    } catch (e: unknown) {
      setStatus(`এরর: ${(e as Error).message}`);
    } finally {
      setLoading(false);
    }
  }

  async function handleImportDoctors() {
    setLoading(true);
    setStatus("Doctor CSV ফাইল পড়ছে...");
    try {
      const res = await fetch("/data/doctors_directory.csv");
      const text = await res.text();
      const rows = parseCSV(text);
      setStatus(`${rows.length} ডাক্তার পাওয়া গেছে। আপলোড শুরু হচ্ছে...`);
      const { data, error } = await supabase.functions.invoke("import-doctors", {
        body: { csvData: rows },
      });
      if (error) {
        setStatus(`এরর: ${error.message}`);
      } else {
        setStatus(`✅ সফলভাবে ${data?.inserted || 0} ডাক্তার আপলোড হয়েছে!`);
      }
    } catch (e: unknown) {
      setStatus(`এরর: ${(e as Error).message}`);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex flex-col items-center justify-center gap-4 p-8">
      <h2 className="text-lg font-bold">Data Import</h2>
      <div className="flex gap-3">
        <Button onClick={handleImportHospitals} disabled={loading}>
          {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          Hospital CSV আপলোড
        </Button>
        <Button onClick={handleImportDoctors} disabled={loading} variant="secondary">
          {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          Doctor CSV আপলোড
        </Button>
      </div>
      {status && <p className="text-sm text-muted-foreground">{status}</p>}
    </div>
  );
}
