import { useState, useEffect } from "react";
import { BedDouble, Activity, Wind, AlertCircle } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

interface HospitalResource {
  hospital_id?: string;
  hospital_name: string;
  beds_available: number;
  icu_beds_available: number;
  oxygen_status: string;
  last_updated_at: string;
}

interface CapacityWidgetProps {
  hospitalName: string;
  compact?: boolean;
}

export default function CapacityWidget({ hospitalName, compact = false }: CapacityWidgetProps) {
  const [resource, setResource] = useState<HospitalResource | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchResource() {
      if (!hospitalName) return;
      try {
        const { data } = await (supabase as any)
          .from("hospital_resources")
          .select("*")
          .ilike("hospital_name", `%${hospitalName}%`)
          .limit(1)
          .maybeSingle();
        
        if (data) setResource(data);
      } catch (e) {
        console.error("Error fetching hospital capacity", e);
      } finally {
        setLoading(false);
      }
    }
    fetchResource();
  }, [hospitalName]);

  if (loading) {
    return <div className="h-4 w-20 animate-pulse bg-slate-200 rounded-md"></div>;
  }

  if (!resource) {
    if (compact) return null;
    return (
      <div className="flex items-center gap-1.5 text-[10px] text-slate-400 mt-1">
        <AlertCircle className="w-3 h-3" /> Live capacity not available
      </div>
    );
  }

  const o2Color = resource.oxygen_status === "High" ? "text-emerald-500" : resource.oxygen_status === "Medium" ? "text-amber-500" : "text-red-500";

  if (compact) {
    return (
      <div className="flex flex-wrap items-center gap-2 mt-1.5">
        <div className="flex items-center gap-1 bg-slate-50 px-1.5 py-0.5 rounded text-[10px] font-bold text-slate-600 border border-slate-100">
          <BedDouble className="w-3 h-3 text-indigo-500" /> {resource.beds_available}
        </div>
        <div className="flex items-center gap-1 bg-slate-50 px-1.5 py-0.5 rounded text-[10px] font-bold text-slate-600 border border-slate-100">
          <Activity className="w-3 h-3 text-rose-500" /> {resource.icu_beds_available}
        </div>
        <div className="flex items-center gap-1 bg-slate-50 px-1.5 py-0.5 rounded text-[10px] font-bold text-slate-600 border border-slate-100">
          <Wind className={`w-3 h-3 ${o2Color}`} /> O₂
        </div>
      </div>
    );
  }

  return (
    <div className="bg-slate-50 border border-slate-100 rounded-lg p-2.5 mt-2">
      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2 flex items-center gap-1">
        <span className="relative flex h-2 w-2">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
          <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
        </span>
        Live Capacity
      </p>
      <div className="grid grid-cols-3 gap-2">
        <div>
          <p className="text-[10px] text-slate-500 flex items-center gap-1"><BedDouble className="w-3 h-3" /> Beds</p>
          <p className="text-sm font-black text-slate-800">{resource.beds_available}</p>
        </div>
        <div>
          <p className="text-[10px] text-slate-500 flex items-center gap-1"><Activity className="w-3 h-3" /> ICU</p>
          <p className="text-sm font-black text-slate-800">{resource.icu_beds_available}</p>
        </div>
        <div>
          <p className="text-[10px] text-slate-500 flex items-center gap-1"><Wind className="w-3 h-3" /> O₂ Level</p>
          <p className={`text-[12px] font-bold mt-0.5 ${o2Color}`}>{resource.oxygen_status}</p>
        </div>
      </div>
    </div>
  );
}
