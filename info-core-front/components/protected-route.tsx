"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { isAuthenticated, hasRole } from "@/lib/auth";

interface ProtectedRouteProps {
  children: React.ReactNode;
  requiredRole?: string | string[];
}

export function ProtectedRoute({
  children,
  requiredRole,
}: ProtectedRouteProps) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    setIsLoading(true);

    if (!isAuthenticated()) {
      router.push("/login");
      return;
    }

    if (requiredRole && !hasRole(requiredRole)) {
      router.push("/unauthorized");
      return;
    }

    setIsLoading(false);
  }, [router, requiredRole]);

  if (isLoading) {
    return null;
  }

  if (!isAuthenticated()) {
    return null;
  }

  if (requiredRole && !hasRole(requiredRole)) {
    return null;
  }

  return <>{children}</>;
}
