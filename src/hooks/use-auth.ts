"use client";

import { useEffect, useState } from "react";
import type { AuthChangeEvent, Session, User } from "@supabase/supabase-js";
import { createClient } from "@/utils/supabase/client";

export function useAuth() {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const supabase = createClient();

    // Check current user session
    supabase.auth
      .getUser()
      .then((response: { data: { user: User | null }; error: unknown }) => {
        if (!response.error && response.data.user) {
          setUser(response.data.user);
        } else {
          setUser(null);
        }
        setIsLoading(false);
      });

    // Subscribe to auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(
      (_event: AuthChangeEvent, session: Session | null) => {
        setUser(session?.user ?? null);
        setIsLoading(false);
      }
    );

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const signInWithGoogle = async () => {
    try {
      const supabase = createClient();

      const origin =
        typeof window !== "undefined" ? window.location.origin : "";

      const { error } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: {
          redirectTo: `${origin}/auth/callback`,
        },
      });

      if (error) {
        console.error("Supabase sign in error:", error.message);
      }
    } catch (err) {
      console.error("Sign in failed:", err);
    }
  };

  const signOut = async () => {
    try {
      const supabase = createClient();

      const { error } = await supabase.auth.signOut();

      if (error) {
        console.error("Supabase sign out error:", error.message);
      }

      setUser(null);
    } catch (err) {
      console.error("Sign out failed:", err);
      setUser(null);
    }
  };

  return {
    user,
    isLoading,
    signInWithGoogle,
    signOut,
  };
}
