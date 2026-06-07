import { useState, useEffect, createContext, useContext, ReactNode, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import type { User, Session } from "@supabase/supabase-js";

interface AuthContextType {
  user: User | null;
  session: Session | null;
  loading: boolean;
  isCheckingProfile: boolean;
  hasCompletedProfile: boolean;
  userProfile: { 
    full_name?: string; 
    phone?: string; 
    age?: string; 
    gender?: string; 
    district?: string; 
    blood_group?: string;
    role?: 'patient' | 'doctor' | 'admin' | 'kazi' | 'partner';
  } | null;
  refreshProfile: () => Promise<void>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  session: null,
  loading: true,
  isCheckingProfile: false,
  hasCompletedProfile: false,
  userProfile: null,
  refreshProfile: async () => { },
  signOut: async () => { },
});

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [isCheckingProfile, setIsCheckingProfile] = useState(false);
  const [hasCompletedProfile, setHasCompletedProfile] = useState(false);
  const [userProfile, setUserProfile] = useState<{ 
    full_name?: string; 
    phone?: string; 
    age?: string; 
    gender?: string; 
    district?: string; 
    blood_group?: string;
    role?: 'patient' | 'doctor' | 'admin' | 'kazi' | 'partner';
  } | null>(null);

  const checkProfile = useCallback(async (userId: string) => {
    setIsCheckingProfile(true);
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('full_name, phone, age, gender, district, blood_group, role')
        .eq('user_id', userId)
        .maybeSingle();

      if (!error && data) {
        setUserProfile(data as any);
        if ((data as any).full_name && (data as any).phone) {
          setHasCompletedProfile(true);
        } else {
          setHasCompletedProfile(false);
        }
      } else {
        setUserProfile(null);
        setHasCompletedProfile(false);
      }
    } catch (e) {
      setUserProfile(null);
      setHasCompletedProfile(false);
    } finally {
      setIsCheckingProfile(false);
    }
  }, []);

  const refreshProfile = useCallback(async () => {
    if (user) {
      await checkProfile(user.id);
    }
  }, [user, checkProfile]);

  useEffect(() => {
    // Safety Timeout: Force loading to false after 6 seconds if initialization hangs
    const safetyTimeout = setTimeout(() => {
      setLoading(prev => {
        if (prev) {
          console.warn("Auth initialization timed out. Forcing loading to false.");
          return false;
        }
        return prev;
      });
      setIsCheckingProfile(false); // Fix: also clear profile checking flag
    }, 6000);

    let isMounted = true;

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (_event, session) => {
        if (!isMounted) return;
        setSession(session);
        setUser(session?.user ?? null);
        try {
          if (session?.user) {
            await checkProfile(session.user.id);
          } else {
            setHasCompletedProfile(false);
          }
        } catch (err) {
          console.error("Error in onAuthStateChange profile check:", err);
        } finally {
          if (isMounted) {
            setLoading(false);
            clearTimeout(safetyTimeout);
          }
        }
      }
    );

    supabase.auth.getSession().then(async ({ data: { session } }) => {
      if (!isMounted) return;
      setSession(session);
      setUser(session?.user ?? null);
      try {
        if (session?.user) {
          await checkProfile(session.user.id);
        } else {
          setHasCompletedProfile(false);
        }
      } catch (err) {
        console.error("Error in getSession profile check:", err);
      } finally {
        if (isMounted) {
          setLoading(false);
          clearTimeout(safetyTimeout);
        }
      }
    }).catch(err => {
      console.error("Critical error in getSession:", err);
      if (isMounted) {
        setLoading(false);
        setIsCheckingProfile(false);
        clearTimeout(safetyTimeout);
      }
    });

    return () => {
      isMounted = false;
      subscription.unsubscribe();
      clearTimeout(safetyTimeout);
    };
  }, [checkProfile]);

  useEffect(() => {
    // Dynamic import to prevent crash on web platforms where Capacitor plugins don't load
    import("@capacitor/app")
      .then(({ App }) => {
        App.addListener("appUrlOpen", async (data: { url: string }) => {
          console.log("[DeepLink] Opened app with URL:", data.url);
          try {
            // Replace custom scheme to normalize URL protocol for parsing
            const normalized = data.url.replace("com.doctorsaab.app://", "http://localhost/");
            const parsedUrl = new URL(normalized);

            // 1. PKCE Auth Flow (Magic Link / Code Exchange)
            const code = parsedUrl.searchParams.get("code");
            if (code) {
              console.log("[DeepLink] Exchanging code for session...");
              const { error } = await supabase.auth.exchangeCodeForSession(code);
              if (error) {
                console.error("[DeepLink] Code exchange error:", error);
              } else {
                console.log("[DeepLink] Code exchange successful!");
                // Route inside local WebView
                window.location.href = parsedUrl.pathname + parsedUrl.search + parsedUrl.hash;
              }
              return;
            }

            // 2. Implicit Auth Flow (OAuth hash parameters)
            const hash = parsedUrl.hash;
            if (hash) {
              const params = new URLSearchParams(hash.substring(1));
              const accessToken = params.get("access_token");
              const refreshToken = params.get("refresh_token");
              if (accessToken && refreshToken) {
                console.log("[DeepLink] Setting session from hash...");
                const { error } = await supabase.auth.setSession({
                  access_token: accessToken,
                  refresh_token: refreshToken,
                });
                if (error) {
                  console.error("[DeepLink] Set session error:", error);
                } else {
                  console.log("[DeepLink] Set session successful!");
                  // Route inside local WebView
                  window.location.href = parsedUrl.pathname + parsedUrl.search + parsedUrl.hash;
                }
              }
            }
          } catch (err) {
            console.error("[DeepLink] Error parsing deep link URL:", err);
          }
        });
      })
      .catch((err) => {
        console.log("[DeepLink] Capacitor App plugin not loaded (normal in web browsers).", err);
      });
  }, []);

  const signOut = async () => {
    await supabase.auth.signOut();
    setHasCompletedProfile(false);
    setUserProfile(null);
  };

  return (
    <AuthContext.Provider value={{ user, session, loading, isCheckingProfile, hasCompletedProfile, userProfile, refreshProfile, signOut }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
