import { Capacitor } from "@capacitor/core";

/**
 * Returns the proper redirect URL for Supabase authentication.
 * On native platforms (iOS/Android), it resolves to the custom scheme so the browser deep links back to the app.
 * On web platforms, it resolves to standard HTTP window location origin.
 */
export const getAuthRedirectUrl = (path: string = "home"): string => {
  if (Capacitor.isNativePlatform()) {
    return `com.doctorsaab.app://${path}`;
  }
  return `${window.location.origin}/${path}`;
};
