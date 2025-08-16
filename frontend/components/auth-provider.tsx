"use client";

import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
  useCallback,
} from "react";
import { createClient, User } from "@supabase/supabase-js";
import axiosInstance from "@/lib/axiosInstance";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const publicAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !publicAnonKey) {
  throw new Error("Missing Supabase environment variables");
}

const supabase = createClient(supabaseUrl, publicAnonKey, {
  auth: {
    persistSession: false,
    autoRefreshToken: true,
    detectSessionInUrl: true,
  },
});

export type ExtendedUser = User & {
  profile: {
    name: string;
    avatar_url: string;
  };
};

type AuthState = {
  user: ExtendedUser | null;
  status: "authenticated" | "unauthenticated" | "loading";
  signOut: () => Promise<void>;
  signInWithOAuth: (
    provider: "google" | "github" | "linkedin"
  ) => Promise<void>;
};

const AuthCtx = createContext<AuthState>({
  user: null,
  status: "loading",
  signOut: async () => {},
  signInWithOAuth: async () => {},
});

export default function AuthProvider({
  initialUser,
  children,
}: {
  initialUser: ExtendedUser | null;
  children: React.ReactNode;
}) {
  const [user, setUser] = useState<ExtendedUser | null>(initialUser);
  const [status, setStatus] = useState<
    "authenticated" | "unauthenticated" | "loading"
  >(initialUser ? "authenticated" : "loading");

  // Utility functions
  const setAxiosAuthHeader = useCallback((token?: string) => {
    if (token) {
      axiosInstance.defaults.headers.common[
        "Authorization"
      ] = `Bearer ${token}`;
    } else {
      delete axiosInstance.defaults.headers.common["Authorization"];
    }
  }, []);

  const updateAuthState = useCallback(
    (user: User | null, token?: string) => {
      setUser(setExtendedUser(user));
      setStatus(user ? "authenticated" : "unauthenticated");
      setAxiosAuthHeader(token);
    },
    [setAxiosAuthHeader]
  );

  // Sign out function
  const signOut = useCallback(async () => {
    try {
      await supabase.auth.signOut();
      updateAuthState(null);
    } catch (error) {
      console.error("Error signing out:", error);
      throw error;
    }
  }, [updateAuthState]);

  // Sign in with OAuth function
  const signInWithOAuth = useCallback(
    async (provider: "google" | "github" | "linkedin") => {
      try {
        await supabase.auth.signInWithOAuth({
          provider,
          options: {
            redirectTo: `${process.env.NEXT_PUBLIC_APP_URL}/my-resumes`,
          },
        });
      } catch (error) {
        console.error("Error signing in with OAuth:", error);
        throw error;
      }
    },
    []
  );

  // Initialize auth state
  const initializeAuth = useCallback(async () => {
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (user) {
        const {
          data: { session },
        } = await supabase.auth.getSession();
        updateAuthState(user, session?.access_token);
      } else {
        updateAuthState(null);
      }
    } catch (error) {
      console.error("Error initializing auth:", error);
      updateAuthState(null);
    }
  }, [updateAuthState]);

  useEffect(() => {
    // Initialize auth state
    initializeAuth();

    // Listen to auth state changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      console.log("Auth state changed:", event, session?.user?.email);
      updateAuthState(session?.user || null, session?.access_token);
    });

    return () => subscription.unsubscribe();
  }, [initializeAuth, updateAuthState]);

  const value = useMemo(
    () => ({ user, status, signOut, signInWithOAuth }),
    [user, status, signOut, signInWithOAuth]
  );

  return <AuthCtx.Provider value={value}>{children}</AuthCtx.Provider>;
}

export const useAuth = () => useContext(AuthCtx);

function getUserProfile(user: User) {
  return {
    name: user.user_metadata?.name,
    avatar_url: user.user_metadata?.avatar_url,
  };
}

function setExtendedUser(user: User | null) {
  if (!user) return null;
  return { ...user, profile: getUserProfile(user) };
}
