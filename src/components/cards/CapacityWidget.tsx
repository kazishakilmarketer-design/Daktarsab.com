/**
 * CapacityWidget.tsx
 * Fetches and displays live hospital resource data (Beds / ICU / Oxygen)
 * from the hospital_resources table in Supabase.
 */
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";

interface CapacityData {
  beds_available: number;
  icu_beds_available: number;
  oxygen_status: "High" | "Medium" | "Low";
  last_updated_at?: string;
}

interface CapacityWidgetProps {
  hospitalName: string;
  compact?: boolean; // true = inline badge row, false = expanded card
}

const O2_COLORS: Record<string, { bg: string; text: string; dot: string }> = {
  High:   { bg: "#ECFDF5", text: "#065F46", dot: "#10B981" },
  Medium: { bg: "#FFFBEB", text: "#92400E", dot: "#F59E0B" },
  Low:    { bg: "#FEF2F2", text: "#991B1B", dot: "#EF4444" },
};

export function CapacityWidget({ hospitalName, compact = true }: CapacityWidgetProps) {
  const [data, setData]     = useState<CapacityData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!hospitalName) { setLoading(false); return; }
    let cancelled = false;

    async function fetchCapacity() {
      try {
        const { data: rows } = await (supabase as any)
          .from("hospital_resources")
          .select("beds_available, icu_beds_available, oxygen_status, last_updated_at")
          .ilike("hospital_name", `%${hospitalName.slice(0, 20)}%`)
          .limit(1)
          .maybeSingle();
        if (!cancelled) setData(rows || null);
      } catch { /* no-op */ }
      finally { if (!cancelled) setLoading(false); }
    }

    fetchCapacity();
    return () => { cancelled = true; };
  }, [hospitalName]);

  if (loading) {
    return (
      <div style={{ display: "flex", gap: 6, marginTop: 6 }}>
        {[1,2,3].map(i => (
          <div key={i} style={{ height: 20, width: 60, borderRadius: 6, background: "#F1F5F9", animation: "pulse 1.5s ease-in-out infinite" }} />
        ))}
      </div>
    );
  }

  if (!data) return null; // No resource data yet — stay silent

  const o2 = O2_COLORS[data.oxygen_status] ?? O2_COLORS.Medium;

  if (compact) {
    return (
      <div style={{ display: "flex", flexWrap: "wrap", gap: 5, marginTop: 7 }}>
        {/* Beds */}
        <span style={{ display: "inline-flex", alignItems: "center", gap: 4, background: "#F0FDF4", color: "#166534", fontSize: 10, fontWeight: 700, padding: "3px 8px", borderRadius: 6, border: "1px solid #BBF7D0" }}>
          🛏 {data.beds_available} Beds
        </span>
        {/* ICU */}
        <span style={{ display: "inline-flex", alignItems: "center", gap: 4, background: "#EFF6FF", color: "#1D4ED8", fontSize: 10, fontWeight: 700, padding: "3px 8px", borderRadius: 6, border: "1px solid #BFDBFE" }}>
          🏥 {data.icu_beds_available} ICU
        </span>
        {/* Oxygen */}
        <span style={{ display: "inline-flex", alignItems: "center", gap: 4, background: o2.bg, color: o2.text, fontSize: 10, fontWeight: 700, padding: "3px 8px", borderRadius: 6, border: `1px solid ${o2.dot}44` }}>
          <span style={{ width: 6, height: 6, borderRadius: "50%", background: o2.dot, display: "inline-block" }} />
          O₂ {data.oxygen_status}
        </span>
      </div>
    );
  }

  // Expanded variant
  return (
    <div style={{ marginTop: 10, padding: "10px 12px", background: "#F8FAFC", borderRadius: 10, border: "1px solid #E2E8F0" }}>
      <div style={{ fontSize: 10, fontWeight: 700, color: "#64748B", letterSpacing: ".5px", marginBottom: 8, textTransform: "uppercase" }}>Live Hospital Capacity</div>
      <div style={{ display: "flex", gap: 12 }}>
        <div style={{ textAlign: "center" }}>
          <div style={{ fontSize: 20, fontWeight: 800, color: "#166534" }}>{data.beds_available}</div>
          <div style={{ fontSize: 10, color: "#64748B" }}>Beds</div>
        </div>
        <div style={{ textAlign: "center" }}>
          <div style={{ fontSize: 20, fontWeight: 800, color: "#1D4ED8" }}>{data.icu_beds_available}</div>
          <div style={{ fontSize: 10, color: "#64748B" }}>ICU</div>
        </div>
        <div style={{ textAlign: "center" }}>
          <div style={{ fontSize: 14, fontWeight: 800, color: o2.text }}>{data.oxygen_status}</div>
          <div style={{ fontSize: 10, color: "#64748B" }}>Oxygen</div>
        </div>
      </div>
      {data.last_updated_at && (
        <div style={{ fontSize: 9, color: "#94A3B8", marginTop: 6 }}>
          Updated {new Date(data.last_updated_at).toLocaleTimeString("bn-BD", { hour: "2-digit", minute: "2-digit" })}
        </div>
      )}
    </div>
  );
}
