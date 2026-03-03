"use client";
/* This file provides shared auth state and redirects for protected pages. */
import {
  onAuthStateChanged,
  type User,
  type Unsubscribe,
} from "firebase/auth";
import { usePathname, useRouter } from "next/navigation";
import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import { auth } from "@/lib/firebase";

type AuthContextValue = {
  user: User | null;
  isLoading: boolean;
};

const AuthContext = createContext<AuthContextValue>({
  user: null,
  isLoading: true,
});

function setSessionCookie(isSignedIn: boolean) {
  if (typeof document === "undefined") {
    return;
  }
  if (isSignedIn) {
    document.cookie = "mvp_session=1; path=/; max-age=2592000; samesite=lax";
  } else {
    document.cookie = "mvp_session=; path=/; max-age=0; samesite=lax";
  }
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const pathname = usePathname();
  const router = useRouter();

  useEffect(() => {
    let unsubscribe: Unsubscribe;
    unsubscribe = onAuthStateChanged(auth, (nextUser) => {
      setUser(nextUser);
      setSessionCookie(Boolean(nextUser));
      setIsLoading(false);
    });
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    if (isLoading) {
      return;
    }
    const isAuthRoute = pathname.startsWith("/login") || pathname.startsWith("/signup");
    const isPublicRoute = isAuthRoute || pathname === "/";
    const isOnboarding = pathname.startsWith("/onboarding");

    if (!user && !isPublicRoute && !isOnboarding) {
      router.replace("/login");
    }
    if (user && isAuthRoute) {
      router.replace("/dashboard");
    }
  }, [isLoading, pathname, router, user]);

  const value = useMemo(
    () => ({
      user,
      isLoading,
    }),
    [user, isLoading],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  return useContext(AuthContext);
}
