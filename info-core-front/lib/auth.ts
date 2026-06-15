// Authentication utility functions

export interface AuthUser {
  username: string;
  role: string;
  token: string;
}

/**
 * Get the current authenticated user from localStorage
 */
export function getAuthUser(): AuthUser | null {
  if (typeof window === "undefined") return null;

  const token = localStorage.getItem("token");
  const role = localStorage.getItem("role");
  const username = localStorage.getItem("username");

  if (!token || !role || !username) {
    return null;
  }

  return { token, role, username };
}

/**
 * Check if user is authenticated
 */
export function isAuthenticated(): boolean {
  return getAuthUser() !== null;
}

/**
 * Check if user has a specific role
 */
export function hasRole(requiredRole: string | string[]): boolean {
  const user = getAuthUser();
  if (!user) return false;

  if (Array.isArray(requiredRole)) {
    return requiredRole.includes(user.role);
  }

  return user.role === requiredRole;
}

/**
 * Logout the user by clearing localStorage
 */
export function logout(): void {
  if (typeof window === "undefined") return;

  localStorage.removeItem("token");
  localStorage.removeItem("role");
  localStorage.removeItem("username");
}

/**
 * Get authorization headers for API requests
 */
export function getAuthHeaders(): HeadersInit {
  const user = getAuthUser();
  if (!user) {
    return {
      "Content-Type": "application/json",
    };
  }

  return {
    "Content-Type": "application/json",
    Authorization: `Bearer ${user.token}`,
  };
}
