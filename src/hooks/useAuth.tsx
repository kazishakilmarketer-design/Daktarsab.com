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
    }, 6000);

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (_event, session) => {
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
          setLoading(false);
          clearTimeout(safetyTimeout);
        }
      }
    );

    supabase.auth.getSession().then(async ({ data: { session } }) => {
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
        setLoading(false);
        clearTimeout(safetyTimeout);
      }
    }).catch(err => {
      console.error("Critical error in getSession:", err);
      setLoading(false);
      clearTimeout(safetyTimeout);
    });

    return () => {
      subscription.unsubscribe();
      clearTimeout(safetyTimeout);
    };
  }, [checkProfile]);

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
