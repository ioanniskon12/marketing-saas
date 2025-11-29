/**
 * Auth Provider
 *
 * Provides authentication context to the entire application.
 * Manages user state and authentication status with real-time updates.
 */

"use client";

import { createContext, useContext, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from '@/lib/supabase/client';

const AuthContext = createContext({
  user: null,
  session: null,
  loading: true,
  signOut: async () => {},
});

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const supabase = createClient();

  useEffect(() => {
    // Get initial session
    const initializeAuth = async () => {
      try {
        const {
          data: { session },
          error,
        } = await supabase.auth.getSession();

        if (error) {
          console.error("Error getting session:", error);
        }

        setSession(session);
        setUser(session?.user || null);
      } catch (error) {
        console.error("Error initializing auth:", error);
      } finally {
        setLoading(false);
      }
    };

    initializeAuth();

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      console.log("Auth event:", event);

      setSession(session);
      setUser(session?.user || null);
      setLoading(false);

      // Handle different auth events
      switch (event) {
        case "SIGNED_IN":
          // Refresh the page to update server-side state
          router.refresh();
          break;

        case "SIGNED_OUT":
          // Redirect to home page
          router.push("/");
          router.refresh();
          break;

        case "TOKEN_REFRESHED":
          // Token was refreshed, update state
          break;

        case "USER_UPDATED":
          // User metadata was updated
          break;

        case "PASSWORD_RECOVERY":
          // User requested password recovery
          router.push("/reset-password");
          break;

        default:
          break;
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [supabase, router]);

  const signOut = async () => {
    try {
      const { error } = await supabase.auth.signOut();

      if (error) {
        console.error("Error signing out:", error);
        throw error;
      }

      setUser(null);
      setSession(null);
      router.push("/");
      router.refresh();
    } catch (error) {
      console.error("Sign out error:", error);
      throw error;
    }
  };

  const value = {
    user,
    session,
    loading,
    signOut,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

/**
 * Hook to use auth context
 *
 * Usage:
 * ```javascript
 * const { user, loading, signOut } = useAuth();
 * ```
 */
export function useAuth() {
  const context = useContext(AuthContext);

  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }

  return context;
}

/**
 * Component to require authentication
 *
 * Usage:
 * ```javascript
 * <RequireAuth>
 *   <ProtectedComponent />
 * </RequireAuth>
 * ```
 */
export function RequireAuth({ children, fallback = null }) {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !user) {
      router.push("/login");
    }
  }, [user, loading, router]);

  if (loading) {
    return fallback || <AuthLoadingState />;
  }

  if (!user) {
    return fallback || null;
  }

  return children;
}

/**
 * Default loading state for authentication
 */
function AuthLoadingState() {
  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        minHeight: "100vh",
        fontSize: "14px",
        color: "#666",
      }}
    >
      Loading...
    </div>
  );
}

/**
 * Component to show content only when not authenticated
 *
 * Usage:
 * ```javascript
 * <GuestOnly>
 *   <LoginPrompt />
 * </GuestOnly>
 * ```
 */
export function GuestOnly({ children, fallback = null }) {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && user) {
      router.push("/dashboard");
    }
  }, [user, loading, router]);

  if (loading) {
    return fallback || <AuthLoadingState />;
  }

  if (user) {
    return fallback || null;
  }

  return children;
}
