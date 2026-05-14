/**
 * notificationService.ts
 * Central helper to invoke the `send-notification` Supabase Edge Function.
 * Fire-and-forget — never blocks the caller.
 */
import { supabase } from "@/integrations/supabase/client";

interface BookingNotificationPayload {
  user_name: string;
  user_email?: string;
  user_phone?: string;
  provider_name: string;
  preferred_date?: string | null;
  preferred_time?: string | null;
  meet_link?: string | null;
  status: string;
}

interface PartnerRegistrationPayload {
  name: string;
  email: string;
  phone: string;
  specialty?: string | null;
  bmdc_no: string;
  district?: string | null;
  status?: string;
  admin_notes?: string | null;
}

/**
 * Notify patient when their booking status changes (accepted/completed/cancelled).
 */
export async function notifyBookingUpdate(booking: BookingNotificationPayload) {
  try {
    await supabase.functions.invoke("send-notification", {
      body: {
        type: "booking_update",
        record: booking,
      },
    });
  } catch (e) {
    console.warn("[NotificationService] booking_update failed:", e);
  }
}

/**
 * Notify admin when a new partner registration is submitted.
 */
export async function notifyNewPartnerRegistration(registration: PartnerRegistrationPayload) {
  try {
    await supabase.functions.invoke("send-notification", {
      body: {
        type: "partner_registration_new",
        record: registration,
      },
    });
  } catch (e) {
    console.warn("[NotificationService] partner_registration_new failed:", e);
  }
}

/**
 * Notify partner/doctor when their application status is updated.
 */
export async function notifyPartnerStatusUpdate(registration: PartnerRegistrationPayload) {
  try {
    await supabase.functions.invoke("send-notification", {
      body: {
        type: "partner_registration_update",
        record: registration,
      },
    });
  } catch (e) {
    console.warn("[NotificationService] partner_registration_update failed:", e);
  }
}
