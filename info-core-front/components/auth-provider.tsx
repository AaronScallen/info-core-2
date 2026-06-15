"use client";

import { createContext, useContext, useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import { getAuthUser, logout, AuthUser } from "@/lib/auth";

interface AuthContextType {
  user: AuthUser | null;
  isLoading: boolean;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  isLoading: true,
  logout: () => {},
});

export function useAuth() {
  return useContext(AuthContext);
}

interface AuthProviderProps {
  children: React.ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<AuthUser | null>(() => getAuthUser());
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    // Public pages that don't require authentication
    const publicPages = ["/", "/login", "/register", "/unauthorized"];

    // Redirect to login if not authenticated and not on public pages
    if (!user && !publicPages.includes(pathname)) {
      router.push("/login");
    }
  }, [pathname, router, user]);

  const handleLogout = () => {
    logout();
    setUser(null);
    // Force a hard navigation to ensure login page is fully reset
    router.push("/login");
    router.refresh();
  };

  return (
    <AuthContext.Provider value={{ user, isLoading, logout: handleLogout }}>
      {children}
    </AuthContext.Provider>
  );
}
