"use client";

import { useAuth } from "@/components/auth-provider";
import { ProtectedRoute } from "@/components/protected-route";
import { getAuthHeaders } from "@/lib/auth";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useCallback, useEffect, useState } from "react";

interface User {
  id: number;
  username: string;
  role: string;
  employeeId: number | null;
  createdAt?: string;
}

interface Employee {
  enumber: number;
  firstName: string | null;
  lastName: string | null;
  badge: number | null;
}

export default function UserFormPage() {
  const { user: currentUser } = useAuth();
  const router = useRouter();
  const params = useParams();
  const isNew = params.id === "new";
  const userId = isNew ? null : parseInt(params.id as string);

  const [loading, setLoading] = useState(!isNew);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [loadingEmployees, setLoadingEmployees] = useState(true);

  const [formData, setFormData] = useState<
    Partial<User> & { password?: string }
  >({
    username: "",
    password: "",
    role: "officer",
    employeeId: null,
  });

  // Only command staff can manage users
  const canAccess = currentUser?.role === "command_staff";
  const isEditable = canAccess;

  const fetchEmployees = useCallback(async () => {
    try {
      setLoadingEmployees(true);
      const response = await fetch("http://localhost:3001/api/employees", {
        headers: getAuthHeaders(),
      });

      if (response.ok) {
        const payload = await response.json();
        const employeeList = Array.isArray(payload)
          ? payload
          : Array.isArray(payload?.data)
            ? payload.data
            : [];
        setEmployees(employeeList);
      } else {
        setEmployees([]);
      }
    } catch (err) {
      console.error("Error fetching employees:", err);
      setEmployees([]);
    } finally {
      setLoadingEmployees(false);
    }
  }, []);

  const fetchUser = useCallback(async () => {
    try {
      setLoading(true);
      const response = await fetch(
        `http://localhost:3001/api/users/${userId}`,
        {
          headers: getAuthHeaders(),
        },
      );

      if (!response.ok) {
        throw new Error("Failed to fetch user");
      }

      const data = await response.json();
      setFormData({
        username: data.username,
        role: data.role,
        employeeId: data.employeeId,
        password: "", // Never populate password field
      });
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setLoading(false);
    }
  }, [userId]);

  useEffect(() => {
    if (!canAccess) {
      return;
    }

    fetchEmployees();

    if (isNew) {
      setLoading(false);
      return;
    }

    if (!Number.isFinite(userId)) {
      setError("Invalid user id");
      setLoading(false);
      return;
    }

    void fetchUser();
  }, [canAccess, fetchEmployees, fetchUser, isNew, userId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!isEditable) {
      alert("You don't have permission to perform this action");
      return;
    }

    // Validate required fields
    if (!formData.username || formData.username.length < 3) {
      setError("Username must be at least 3 characters long");
      return;
    }

    if (isNew && (!formData.password || formData.password.length < 6)) {
      setError("Password must be at least 6 characters long");
      return;
    }

    if (!isNew && formData.password && formData.password.length < 6) {
      setError("Password must be at least 6 characters long if provided");
      return;
    }

    try {
      setSaving(true);
      setError(null);

      const dataToSubmit: {
        username: string;
        role: string;
        employeeId: number | null;
        password?: string;
      } = {
        username: formData.username,
        role: formData.role || "officer",
        employeeId: formData.employeeId ?? null,
      };

      // Only include password if it's set
      if (formData.password) {
        dataToSubmit.password = formData.password;
      }

      const url = isNew
        ? "http://localhost:3001/api/auth/register"
        : `http://localhost:3001/api/users/${userId}`;

      const method = isNew ? "POST" : "PUT";

      const response = await fetch(url, {
        method,
        headers: getAuthHeaders(),
        body: JSON.stringify(dataToSubmit),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to save user");
      }

      router.push("/dashboard/users");
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
      setSaving(false);
    }
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>,
  ) => {
    const { name, value } = e.target;

    // Convert employeeId to number or null
    if (name === "employeeId") {
      setFormData((prev) => ({
        ...prev,
        [name]: value === "" ? null : parseInt(value, 10),
      }));
    } else {
      setFormData((prev) => ({
        ...prev,
        [name]: value,
      }));
    }
  };

  if (!canAccess) {
    return (
      <ProtectedRoute>
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
          <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-6 text-center max-w-md">
            <h2 className="text-xl font-semibold text-red-800 dark:text-red-200 mb-2">
              Access Denied
            </h2>
            <p className="text-red-600 dark:text-red-400">
              Only Command Staff members can manage users.
            </p>
            <Link
              href="/dashboard"
              className="mt-4 inline-block text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 underline"
            >
              Return to Dashboard
            </Link>
          </div>
        </div>
      </ProtectedRoute>
    );
  }

  if (loading) {
    return (
      <ProtectedRoute>
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
          <div className="text-center">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            <p className="mt-2 text-gray-600 dark:text-gray-400">
              Loading user data...
            </p>
          </div>
        </div>
      </ProtectedRoute>
    );
  }

  const getEmployeeDisplay = (emp: Employee) => {
    const name = [emp.firstName, emp.lastName].filter(Boolean).join(" ");
    const badge = emp.badge ? `#${emp.badge}` : "";
    return `${emp.enumber} - ${name || "Unknown"} ${badge}`.trim();
  };

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        {/* Header */}
        <header className="bg-white dark:bg-gray-800 shadow">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-6">
            <div className="flex justify-between items-center">
              <div>
                <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                  {isNew ? "Add New User" : "Edit User"}
                </h1>
                <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
                  {isNew
                    ? "Create a new user account"
                    : "Update user information and permissions"}
                </p>
              </div>
              <Link
                href="/dashboard/users"
                className="rounded-md bg-gray-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-gray-700 transition-colors"
              >
                Back to Users
              </Link>
            </div>
          </div>
        </header>

        {/* Main Content */}
        <main className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 py-8">
          {error && (
            <div className="mb-6 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-md p-4">
              <p className="text-red-800 dark:text-red-200">{error}</p>
            </div>
          )}

          <form onSubmit={handleSubmit}>
            <div className="bg-white dark:bg-gray-800 shadow rounded-lg">
              <div className="px-6 py-6 space-y-6">
                {/* Username */}
                <div>
                  <label
                    htmlFor="username"
                    className="block text-sm font-medium text-gray-700 dark:text-gray-300"
                  >
                    Username <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    id="username"
                    name="username"
                    value={formData.username}
                    onChange={handleChange}
                    disabled={!isEditable}
                    required
                    minLength={3}
                    maxLength={50}
                    className="mt-1 block w-full rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 px-3 py-2 text-gray-900 dark:text-white focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100 dark:disabled:bg-gray-800 disabled:text-gray-500"
                    placeholder="Enter username"
                  />
                  <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                    Must be 3-50 characters long
                  </p>
                </div>

                {/* Password */}
                <div>
                  <label
                    htmlFor="password"
                    className="block text-sm font-medium text-gray-700 dark:text-gray-300"
                  >
                    Password {isNew && <span className="text-red-500">*</span>}
                  </label>
                  <input
                    type="password"
                    id="password"
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    disabled={!isEditable}
                    required={isNew}
                    minLength={6}
                    className="mt-1 block w-full rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 px-3 py-2 text-gray-900 dark:text-white focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100 dark:disabled:bg-gray-800 disabled:text-gray-500"
                    placeholder={
                      isNew
                        ? "Enter password"
                        : "Leave blank to keep current password"
                    }
                  />
                  <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                    {isNew
                      ? "Must be at least 6 characters long"
                      : "Leave blank to keep current password, or enter new password (min 6 characters)"}
                  </p>
                </div>

                {/* Role */}
                <div>
                  <label
                    htmlFor="role"
                    className="block text-sm font-medium text-gray-700 dark:text-gray-300"
                  >
                    Role <span className="text-red-500">*</span>
                  </label>
                  <select
                    id="role"
                    name="role"
                    value={formData.role}
                    onChange={handleChange}
                    disabled={!isEditable}
                    required
                    className="mt-1 block w-full rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 px-3 py-2 text-gray-900 dark:text-white focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100 dark:disabled:bg-gray-800 disabled:text-gray-500"
                  >
                    <option value="dispatch">Dispatch</option>
                    <option value="officer">Officer</option>
                    <option value="supervisor">Supervisor</option>
                    <option value="command_staff">Command Staff</option>
                  </select>
                  <div className="mt-2 text-sm text-gray-600 dark:text-gray-400 space-y-1">
                    <p>
                      <strong>Dispatch:</strong> Basic access
                    </p>
                    <p>
                      <strong>Officer:</strong> Standard user access
                    </p>
                    <p>
                      <strong>Supervisor:</strong> Enhanced permissions
                    </p>
                    <p>
                      <strong>Command Staff:</strong> Full administrative access
                      including user management
                    </p>
                  </div>
                </div>

                {/* Employee Link */}
                <div>
                  <label
                    htmlFor="employeeId"
                    className="block text-sm font-medium text-gray-700 mb-2"
                  >
                    Link to Employee (Optional)
                  </label>
                  {loadingEmployees ? (
                    <div className="text-sm text-gray-500 dark:text-gray-400">
                      Loading employees...
                    </div>
                  ) : (
                    <select
                      id="employeeId"
                      name="employeeId"
                      value={formData.employeeId || ""}
                      onChange={handleChange}
                      disabled={!isEditable}
                      className="mt-1 block w-full rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 px-3 py-2 text-gray-900 dark:text-white focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100 dark:disabled:bg-gray-800 disabled:text-gray-500"
                    >
                      <option value="">-- No Employee Link --</option>
                      {(Array.isArray(employees) ? employees : [])
                        .filter(
                          (emp, index, self) =>
                            index ===
                            self.findIndex((e) => e.enumber === emp.enumber),
                        )
                        .map((emp, index) => (
                          <option
                            key={`emp-${emp.enumber}-${index}`}
                            value={emp.enumber}
                          >
                            {getEmployeeDisplay(emp)}
                          </option>
                        ))}
                    </select>
                  )}
                  <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                    Optionally link this user account to an employee record
                  </p>
                </div>
              </div>

              {/* Form Actions */}
              <div className="px-6 pb-6">
                <div className="flex gap-4 pt-4 border-t border-gray-200 dark:border-gray-700">
                  <button
                    type="submit"
                    disabled={!isEditable || saving}
                    className="flex-1 rounded-md bg-blue-600 px-6 py-3 text-sm font-semibold text-white shadow-sm hover:bg-blue-700 transition-colors disabled:bg-gray-400 dark:disabled:bg-gray-600 disabled:cursor-not-allowed"
                  >
                    {saving
                      ? "Saving..."
                      : isNew
                        ? "Create User"
                        : "Update User"}
                  </button>
                  <Link
                    href="/dashboard/users"
                    className="flex-1 rounded-md bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 text-gray-800 dark:text-white px-6 py-3 text-sm font-semibold text-center transition-colors"
                  >
                    Cancel
                  </Link>
                </div>
              </div>
            </div>
          </form>

          {/* Additional Info */}
          {!isNew && formData.createdAt && (
            <div className="mt-6 pt-6 border-t border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 shadow rounded-lg px-6 py-4">
              <p className="text-sm text-gray-600 dark:text-gray-400">
                <strong>Account Created:</strong>{" "}
                {new Date(formData.createdAt).toLocaleString()}
              </p>
            </div>
          )}
        </main>

        {/* Help Text */}
        <div className="mt-6 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
          <h3 className="font-medium text-blue-900 dark:text-blue-300 mb-2">
            Important Notes:
          </h3>
          <ul className="text-sm text-blue-800 dark:text-blue-400 space-y-1 list-disc list-inside">
            <li>Only Command Staff members can create and manage users</li>
            <li>Usernames must be unique across the system</li>
            <li>Passwords are encrypted and cannot be viewed after creation</li>
            <li>
              Role determines what actions the user can perform in the system
            </li>
            <li>
              Linking to an employee is optional but recommended for tracking
            </li>
          </ul>
        </div>
      </div>
    </ProtectedRoute>
  );
}
