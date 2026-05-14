import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Star, MapPin, Award, Stethoscope, Clock, CheckCircle2, MoreHorizontal } from "lucide-react";
import type { RecommendedDoctor } from "@/lib/aiChat";
import { cn } from "@/lib/utils";

interface DoctorCardProps {
  doctor: RecommendedDoctor;
  onBook: (doctor: RecommendedDoctor) => void;
  onVirtual?: (doctor: RecommendedDoctor) => void;
  variant?: 'v1' | 'v2' | 'v3' | 'v4' | 'v5';
}

export function DoctorCard({ doctor, onBook, onVirtual, variant = 'v1' }: DoctorCardProps) {
  const initial = doctor.doctorName?.charAt(0) || "D";
  
  // V1: Premium List Card (Search Results) - Based on .doc-result-card
  if (variant === 'v1') {
    return (
      <Card 
        className="overflow-hidden border-border/40 shadow-sm transition-all hover:shadow-md hover:border-primary/20 cursor-pointer bg-white group flex flex-col md:flex-row gap-4 p-4 rounded-[18px]"
        onClick={() => onBook(doctor)}
      >
        <div className="flex items-start gap-4 flex-1 min-w-0">
          <div className="relative shrink-0">
            <div className="w-14 h-14 md:w-16 md:h-16 rounded-[16px] bg-[#EAF9F3] text-[#085041] flex items-center justify-center text-xl md:text-2xl font-bold">
              {initial}
            </div>
            <div className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full bg-[#0F6E56] border-2 border-white flex items-center justify-center shadow-sm">
              <CheckCircle2 className="w-3 h-3 text-white" />
            </div>
          </div>
          
          <div className="flex-1 min-w-0 font-bangla">
            <h3 className="text-base md:text-[17px] font-bold text-[#111827] truncate group-hover:text-[#0F6E56] transition-colors leading-tight">
              {doctor.doctorName}
            </h3>
            <p className="text-[12px] md:text-[13px] text-[#6B7280] truncate mt-0.5">
              {doctor.specialization} • {doctor.qualification}
            </p>
            <div className="flex gap-1.5 mt-2 flex-wrap">
              <Badge variant="outline" className="text-[10px] py-0 px-2 border-[#D1F5EA] bg-[#EAF9F3] text-[#0d6b58] font-semibold">ভেরিফাইড</Badge>
              {doctor.experience && (
                <Badge variant="outline" className="text-[10px] py-0 px-2 border-slate-200 bg-slate-50 text-slate-600 font-medium">{doctor.experience}</Badge>
              )}
            </div>
          </div>
        </div>
        
        <div className="flex md:flex-col items-center md:items-end justify-between md:justify-center gap-3 pt-3 md:pt-0 border-t md:border-t-0 border-slate-100 shrink-0">
          <div className="flex flex-col items-start md:items-end">
             <div className="text-[13px] font-bold text-amber-500 flex items-center gap-1">
               <Star className="w-3.5 h-3.5 fill-current" /> {doctor.rating || '4.9'}
               <span className="text-[11px] text-slate-400 font-medium">({doctor.reviewCount || '120'})</span>
             </div>
             <div className="text-lg font-black text-[#0F6E56]">৳{doctor.fee || '৮০০'}</div>
          </div>
          <Button 
            size="sm" 
            className="h-9 md:h-10 text-[13px] px-6 font-bold bg-[#0F6E56] hover:bg-[#085041] text-white rounded-xl shadow-sm font-bangla"
            onClick={(e) => {
              e.stopPropagation();
              onBook(doctor);
            }}
          >
            অ্যাপয়েন্টমেন্ট
          </Button>
        </div>
      </Card>
    );
  }

  // V2: Compact Horizontal Card (Scroll Lists) - Based on .doc-h-card
  if (variant === 'v2') {
    return (
      <Card 
        className="shrink-0 w-[160px] md:w-[180px] overflow-hidden border-border/40 shadow-sm transition-all hover:shadow-md hover:border-primary/20 cursor-pointer bg-white group p-3.5 rounded-[18px] font-bangla"
        onClick={() => onBook(doctor)}
      >
        <div className="relative w-12 h-12 md:w-14 md:h-14 rounded-[14px] bg-[#EAF9F3] text-[#085041] flex items-center justify-center text-lg md:text-xl font-bold mb-3">
          {initial}
          <div className="absolute -bottom-1 -right-1 w-4 h-4 rounded-full bg-[#0F6E56] border-2 border-white flex items-center justify-center">
            <CheckCircle2 className="w-2.5 h-2.5 text-white" />
          </div>
        </div>
        
        <h3 className="text-[13px] md:text-sm font-bold text-[#111827] truncate group-hover:text-[#0F6E56] transition-colors mb-0.5">
          {doctor.doctorName}
        </h3>
        <p className="text-[11px] text-[#6B7280] truncate mb-3">
          {doctor.specialization}
        </p>
        
        <div className="flex items-center justify-between mt-auto pt-2 border-t border-slate-50">
          <div className="text-[11px] font-bold text-amber-500 flex items-center gap-0.5">
            <Star className="w-2.5 h-2.5 fill-current" /> {doctor.rating || '4.9'}
          </div>
          <div className="text-[12px] font-bold text-[#0F6E56]">৳{doctor.fee || '৮০০'}</div>
        </div>
      </Card>
    );
  }

  // V3: Chat Recommendation Card - Based on .doc-rec-card
  if (variant === 'v3') {
    return (
      <Card 
        className="overflow-hidden border-border/40 shadow-sm transition-all hover:bg-[#EAF9F3]/30 cursor-pointer bg-white p-3 rounded-2xl font-bangla w-full max-w-[280px] md:max-w-sm"
        onClick={() => onBook(doctor)}
      >
        <div className="flex gap-3 items-start">
          <div className="w-10 h-10 md:w-12 md:h-12 rounded-[10px] bg-[#EAF9F3] text-[#085041] flex items-center justify-center text-base md:text-lg font-bold shrink-0">
            {initial}
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between gap-2">
              <h3 className="text-[13px] md:text-sm font-bold text-[#111827] truncate">{doctor.doctorName}</h3>
              <Button 
                variant="ghost" 
                size="sm" 
                className="h-7 text-[11px] px-2.5 font-bold text-[#0F6E56] bg-[#EAF9F3] hover:bg-[#D1F5EA] border-none rounded-lg"
                onClick={(e) => {
                  e.stopPropagation();
                  onBook(doctor);
                }}
              >
                বুকিং
              </Button>
            </div>
            <p className="text-[11px] md:text-[12px] text-[#6B7280] truncate">{doctor.specialization}</p>
            
            <div className="flex gap-4 mt-2.5 pt-2.5 border-t border-slate-100">
              <div className="text-[11px]">
                <span className="block text-[#6B7280]">ফি</span>
                <span className="font-bold text-[#0F6E56]">৳{doctor.fee || '৮০০'}</span>
              </div>
              <div className="text-[11px]">
                <span className="block text-[#6B7280]">অভিজ্ঞতা</span>
                <span className="font-bold text-[#111827]">{doctor.experience || '৫+ বছর'}</span>
              </div>
              <div className="text-[11px] ml-auto">
                <span className="block text-[#6B7280] text-right">রেটিং</span>
                <span className="font-bold text-amber-500 flex items-center gap-0.5 justify-end">
                  <Star className="w-2.5 h-2.5 fill-current" /> {doctor.rating || '4.9'}
                </span>
              </div>
            </div>
          </div>
        </div>
      </Card>
    );
  }

  // V4 & V5: Default/Fallback
  return (
    <Card 
      className="p-4 flex flex-col md:flex-row gap-4 items-center bg-white rounded-xl border-border/40 font-bangla"
      onClick={() => onBook(doctor)}
    >
      <div className="w-12 h-12 rounded-full bg-[#EAF9F3] text-[#0F6E56] flex items-center justify-center font-bold">
        {initial}
      </div>
      <div className="text-center md:text-left">
        <h3 className="font-bold">{doctor.doctorName}</h3>
        <p className="text-sm text-slate-500">{doctor.specialization}</p>
      </div>
      <Button className="md:ml-auto bg-[#0F6E56]" onClick={() => onBook(doctor)}>
        বিস্তারিত
      </Button>
    </Card>
  );
}
