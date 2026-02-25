import { useState, useEffect } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';

export type AppRole = 'admin' | 'owner';

export interface UserProfile {
  id: string;
  username: string;
  display_name: string;
  email: string;
  role: AppRole | null;
}

// Rate limiting constants
const RATE_LIMIT_KEY = 'login_attempts';
const MAX_ATTEMPTS = 5;
const LOCKOUT_DURATION = 15 * 60 * 1000; // 15 minutes

interface RateLimitData {
  attempts: number;
  timestamp: number;
}

const checkRateLimit = (): { allowed: boolean; remainingMinutes?: number } => {
  try {
    const attemptsData = localStorage.getItem(RATE_LIMIT_KEY);
    if (!attemptsData) return { allowed: true };
    
    const { attempts, timestamp }: RateLimitData = JSON.parse(attemptsData);
    const now = Date.now();
    const elapsed = now - timestamp;
    
    if (elapsed > LOCKOUT_DURATION) {
      localStorage.removeItem(RATE_LIMIT_KEY);
      return { allowed: true };
    }
    
    if (attempts >= MAX_ATTEMPTS) {
      const remainingMs = LOCKOUT_DURATION - elapsed;
      const remainingMinutes = Math.ceil(remainingMs / 60000);
      return { allowed: false, remainingMinutes };
    }
    
    return { allowed: true };
  } catch {
    return { allowed: true };
  }
};

const recordLoginAttempt = (): void => {
  try {
    const attemptsData = localStorage.getItem(RATE_LIMIT_KEY);
    const now = Date.now();
    
    if (!attemptsData) {
      localStorage.setItem(RATE_LIMIT_KEY, JSON.stringify({
        attempts: 1,
        timestamp: now
      }));
      return;
    }
    
    const { attempts, timestamp }: RateLimitData = JSON.parse(attemptsData);
    
    if (now - timestamp > LOCKOUT_DURATION) {
      localStorage.setItem(RATE_LIMIT_KEY, JSON.stringify({
        attempts: 1,
        timestamp: now
      }));
    } else {
      localStorage.setItem(RATE_LIMIT_KEY, JSON.stringify({
        attempts: attempts + 1,
        timestamp
      }));
    }
  } catch {
    // Ignore storage errors
  }
};

const clearRateLimit = (): void => {
  try {
    localStorage.removeItem(RATE_LIMIT_KEY);
  } catch {
    // Ignore storage errors
  }
};

const DEMO_MODE_KEY = 'demo-mode';

const DEMO_USER: User = {
  id: 'demo-user-id',
  email: 'demo@blacktechstreet.com',
  aud: 'authenticated',
  role: 'authenticated',
  app_metadata: {},
  user_metadata: { display_name: 'Demo Admin' },
  created_at: new Date().toISOString(),
} as User;

const DEMO_PROFILE: UserProfile = {
  id: 'demo-user-id',
  username: 'demo-admin',
  display_name: 'Demo Admin',
  email: 'demo@blacktechstreet.com',
  role: 'admin',
};

export function useAuth() {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  const isDemoMode = typeof window !== 'undefined' && localStorage.getItem(DEMO_MODE_KEY) === 'true';

  // If demo mode, return synthetic data immediately
  if (isDemoMode) {
    return {
      user: DEMO_USER,
      session: null,
      profile: DEMO_PROFILE,
      loading: false,
      signIn: async () => ({ error: null }),
      signOut: async () => {
        localStorage.removeItem(DEMO_MODE_KEY);
        window.location.href = '/auth';
      },
      updatePassword: async () => ({ error: { message: 'Not available in demo mode' } }),
      isOwner: false,
      isAdmin: true,
    };
  }

  useEffect(() => {
    // Set up auth state listener FIRST
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        setSession(session);
        setUser(session?.user ?? null);
        
        // Defer profile fetch to avoid deadlock
        if (session?.user) {
          setTimeout(() => {
            fetchProfile(session.user.id);
          }, 0);
        } else {
          setProfile(null);
          setLoading(false);
        }
      }
    );

    // THEN check for existing session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      if (session?.user) {
        fetchProfile(session.user.id);
      } else {
        setLoading(false);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const fetchProfile = async (userId: string) => {
    try {
      // Fetch profile
      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();

      if (profileError) throw profileError;

      // Fetch role
      const { data: roleData, error: roleError } = await supabase
        .from('user_roles')
        .select('role')
        .eq('user_id', userId)
        .single();

      if (roleError && roleError.code !== 'PGRST116') throw roleError;

      setProfile({
        id: profileData.id,
        username: profileData.username,
        display_name: profileData.display_name,
        email: profileData.email,
        role: roleData?.role as AppRole || null,
      });
    } catch (error) {
      console.error('Error fetching profile:', error);
      setProfile(null);
    } finally {
      setLoading(false);
    }
  };

  const signIn = async (username: string, password: string) => {
    // Check rate limit before attempting login
    const rateLimitCheck = checkRateLimit();
    if (!rateLimitCheck.allowed) {
      return { 
        error: { 
          message: `Too many login attempts. Please try again in ${rateLimitCheck.remainingMinutes} minute${rateLimitCheck.remainingMinutes === 1 ? '' : 's'}.` 
        } 
      };
    }

    try {
      // Use security definer function to look up email by username
      const { data: email, error: lookupError } = await supabase
        .rpc('lookup_email_by_username', { lookup_username: username.toLowerCase() });

      if (lookupError || !email) {
        recordLoginAttempt();
        return { error: { message: 'Invalid username or password' } };
      }

      // Now sign in with email
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        recordLoginAttempt();
        return { error: { message: 'Invalid username or password' } };
      }

      // Success - clear rate limit
      clearRateLimit();
      return { error: null };
    } catch (error) {
      recordLoginAttempt();
      return { error: { message: 'An error occurred during sign in' } };
    }
  };

  const signOut = async () => {
    await supabase.auth.signOut();
    setUser(null);
    setSession(null);
    setProfile(null);
  };

  const updatePassword = async (newPassword: string) => {
    const { error } = await supabase.auth.updateUser({
      password: newPassword,
    });
    return { error };
  };

  const isOwner = profile?.role === 'owner';
  const isAdmin = profile?.role === 'admin' || profile?.role === 'owner';

  return {
    user,
    session,
    profile,
    loading,
    signIn,
    signOut,
    updatePassword,
    isOwner,
    isAdmin,
  };
}
