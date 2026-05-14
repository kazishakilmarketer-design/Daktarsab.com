/**
 * Doctor Saab Lead Tracking — Supabase insert on CTA clicks
 * ৳200 per verified lead
 */
import { supabase } from "@/integrations/supabase/client";

export type LeadType = "appointment" | "call" | "lab_test" | "direction" | "register";

export interface Lead {
    type: LeadType;
    doctor_name?: string;
    hospital_name?: string;
    specialty?: string;
    district?: string;
    user_id?: string;
    partner_type?: string;
    symptom?: string;
    condition?: string;
    source?: string;
}

/**
 * Track a lead action. Silently fails (never blocks UI).
 * Revenue: each lead = ৳200
 */
export async function trackLead(lead: Lead): Promise<void> {
    try {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        await (supabase as any).from("leads").insert({
            type: lead.type,
            doctor_name: lead.doctor_name ?? null,
            hospital_name: lead.hospital_name ?? null,
            specialty: lead.specialty ?? null,
            district: lead.district ?? null,
            partner_type: lead.partner_type ?? null,
            symptom: lead.symptom ?? null,
            condition: lead.condition ?? null,
            source: lead.source ?? null,
            created_at: new Date().toISOString(),
        });
    } catch {
        // Silent fail — never block the UI for analytics
    }
}

export const LEAD_REVENUE_BDT = 200;
