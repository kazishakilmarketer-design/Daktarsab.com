/**
 * Doctor Saab Auth Integration
 * Uses Supabase native auth — no third-party SDK dependencies.
 */
import { supabase } from "../supabase/client";
import { getAuthRedirectUrl } from "../../utils/authRedirect";

export const doctorSaabAuth = {
  auth: {
    signInWithGoogle: async (redirectTo?: string) => {
      return supabase.auth.signInWithOAuth({
        provider: "google",
        options: { redirectTo: redirectTo ?? getAuthRedirectUrl("home") },
      });
    },
  },
};
