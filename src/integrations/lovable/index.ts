/**
 * Doctor Saab Auth Integration
 * Uses Supabase native auth — no third-party SDK dependencies.
 */
import { supabase } from "../supabase/client";

export const doctorSaabAuth = {
  auth: {
    signInWithGoogle: async (redirectTo?: string) => {
      return supabase.auth.signInWithOAuth({
        provider: "google",
        options: { redirectTo: redirectTo ?? window.location.origin },
      });
    },
  },
};
