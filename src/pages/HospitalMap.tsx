import HospitalMapView from "@/components/HospitalMapView";
import { Map } from "lucide-react";

export default function HospitalMap() {
  return (
    <div className="patient-screen active flex flex-col" style={{ paddingBottom: 72 }}>
      {/* Header */}
      <div className="flex items-center gap-3 px-4 pt-4 pb-3 bg-white border-b border-gray-100 flex-shrink-0">
        <div className="w-8 h-8 rounded-lg bg-emerald-100 flex items-center justify-center">
          <Map className="w-4 h-4 text-emerald-700" />
        </div>
        <div>
          <h1 className="text-[16px] font-extrabold text-gray-900">হাসপাতাল ও ক্লিনিক</h1>
          <p className="text-[11px] text-gray-400">কাছের স্বাস্থ্য কেন্দ্র খুঁজুন</p>
        </div>
      </div>

      {/* Map — fills remaining space */}
      <div className="flex-1 relative" style={{ minHeight: 0 }}>
        <HospitalMapView />
      </div>
    </div>
  );
}
