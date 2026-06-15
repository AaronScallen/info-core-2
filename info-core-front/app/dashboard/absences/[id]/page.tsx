"use client";

import { useAuth } from "@/components/auth-provider";
import { ProtectedRoute } from "@/components/protected-route";
import { getAuthHeaders } from "@/lib/auth";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";

interface Absence {
  absenceId: number;
  enumber: number | null;
  assignment: string | null;
  coveringEmpId: number | null;
  dateOfEntry: string | null;
  notes: string | null;
}

interface Employee {
  enumber: number;
  badge: number | null;
  firstName: string | null;
  lastName: string | null;
}

export default function AbsenceFormPage() {
  const { user } = useAuth();
  const router = useRouter();
  const params = useParams();
  const isNew = params.id === "new";
  const absenceId = isNew ? null : parseInt(params.id as string);

  const [loading, setLoading] = useState(!isNew);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [employees, setEmployees] = useState<Employee[]>([]);

  const [formData, setFormData] = useState<Partial<Absence>>({
    enumber: null,
    assignment: null,
    coveringEmpId: null,
    dateOfEntry: null,
    notes: null,
  });

  const canEdit = ["dispatch", "supervisor", "command_staff"].includes(
    user?.role || "",
  );
  const canCreate = ["dispatch", "supervisor", "command_staff"].includes(
    user?.role || "",
  );
  const isEditable = isNew ? canCreate : canEdit;

  useEffect(() => {
    fetchEmployees();
    if (!isNew && absenceId) {
      fetchAbsence();
    }
  }, [absenceId, isNew]);

  const fetchEmployees = async () => {
    try {
      const response = await fetch(
        "http://localhost:3001/api/employees?limit=10000",
        { headers: getAuthHeaders() },
      );
      if (!response.ok) return;
      const data = await response.json();
      const list: Employee[] = Array.isArray(data) ? data : (data.data ?? []);
      const sorted = list.sort((a, b) =>
        (a.lastName ?? "").localeCompare(b.lastName ?? ""),
      );
      setEmployees(sorted);
    } catch {
      // non-critical, fall back silently
    }
  };

  const fetchAbsence = async () => {
    try {
      setLoading(true);
      const response = await fetch(
        `http://localhost:3001/api/absences/${absenceId}`,
        {
          headers: getAuthHeaders(),
        },
      );

      if (!response.ok) {
        throw new Error("Failed to fetch absence");
      }

      const data = await response.json();

      // Format date for input field
      if (data.dateOfEntry) {
        const date = new Date(data.dateOfEntry);
        data.dateOfEntry = date.toISOString().slice(0, 16); // Format for datetime-local input
      }

      setFormData(data);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!isEditable) {
      alert("You don't have permission to perform this action");
      return;
    }

    try {
      setSaving(true);
      setError(null);

      const url = isNew
        ? "http://localhost:3001/api/absences"
        : `http://localhost:3001/api/absences/${absenceId}`;

      const method = isNew ? "POST" : "PUT";

      const response = await fetch(url, {
        method,
        headers: getAuthHeaders(),
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to save absence");
      }

      router.push("/dashboard/absences");
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
      setSaving(false);
    }
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => {
    const { name, value, type } = e.target;

    if (type === "number") {
      setFormData((prev) => ({
        ...prev,
        [name]: value === "" ? null : parseInt(value),
      }));
    } else {
      setFormData((prev) => ({
        ...prev,
        [name]: value === "" ? null : value,
      }));
    }
  };

  if (loading) {
    return (
      <ProtectedRoute>
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
          <div className="text-center">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            <p className="mt-2 text-gray-600 dark:text-gray-400">
              Loading absence...
            </p>
          </div>
        </div>
      </ProtectedRoute>
    );
  }

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        {/* Header */}
        <header className="bg-white dark:bg-gray-800 shadow">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-6">
            <div className="flex justify-between items-center">
              <div>
                <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                  {isNew ? "Add New Absence" : "Absence Details"}
                </h1>
                <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
                  {isNew
                    ? "Create a new absence record"
                    : isEditable
                      ? "View and edit absence information"
                      : "View absence information"}
                </p>
              </div>
              <Link
                href="/dashboard/absences"
                className="rounded-md bg-gray-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-gray-700 transition-colors"
              >
                Back to Absences
              </Link>
            </div>
          </div>
        </header>

        {/* Main Content */}
        <main className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8 py-8">
          {error && (
            <div className="mb-6 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-md p-4">
              <p className="text-red-800 dark:text-red-200">{error}</p>
            </div>
          )}

          {!isEditable && !isNew && (
            <div className="mb-6 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-md p-4">
              <p className="text-yellow-800 dark:text-yellow-200">
                You have read-only access to this absence record.
              </p>
            </div>
          )}

          <form onSubmit={handleSubmit}>
            <div className="bg-white dark:bg-gray-800 shadow rounded-lg">
              <div className="px-6 py-6 space-y-6">
                {!isNew && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                      Absence ID
                    </label>
                    <input
                      type="number"
                      disabled
                      value={formData.absenceId || ""}
                      className="mt-1 block w-full rounded-md border border-gray-300 dark:border-gray-600 bg-gray-100 dark:bg-gray-800 px-3 py-2 text-gray-500 dark:text-gray-400"
                    />
                    <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                      Auto-generated ID
                    </p>
                  </div>
                )}

                {/* Employee Number */}
                <div>
                  <label
                    htmlFor="enumber"
                    className="block text-sm font-medium text-gray-700 dark:text-gray-300"
                  >
                    Employee
                  </label>
                  <select
                    id="enumber"
                    name="enumber"
                    disabled={!isEditable}
                    value={formData.enumber ?? ""}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        enumber:
                          e.target.value === ""
                            ? null
                            : parseInt(e.target.value),
                      }))
                    }
                    className="mt-1 block w-full rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 px-3 py-2 text-gray-900 dark:text-white focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100 dark:disabled:bg-gray-800 disabled:text-gray-500"
                  >
                    <option value="">Select employee...</option>
                    {employees.map((emp) => (
                      <option key={emp.enumber} value={emp.enumber}>
                        {emp.badge} - {emp.lastName}
                      </option>
                    ))}
                  </select>
                  <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                    Employee who is absent
                  </p>
                </div>

                {/* Assignment */}
                <div>
                  <label
                    htmlFor="assignment"
                    className="block text-sm font-medium text-gray-700 dark:text-gray-300"
                  >
                    Assignment
                  </label>
                  <input
                    type="text"
                    id="assignment"
                    name="assignment"
                    maxLength={255}
                    disabled={!isEditable}
                    value={formData.assignment || ""}
                    onChange={handleChange}
                    className="mt-1 block w-full rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 px-3 py-2 text-gray-900 dark:text-white focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100 dark:disabled:bg-gray-800 disabled:text-gray-500"
                    placeholder="e.g., Patrol Division, Detective Bureau"
                  />
                </div>

                {/* Covering Employee ID */}
                <div>
                  <label
                    htmlFor="coveringEmpId"
                    className="block text-sm font-medium text-gray-700 dark:text-gray-300"
                  >
                    Covering Employee
                  </label>
                  <select
                    id="coveringEmpId"
                    name="coveringEmpId"
                    disabled={!isEditable}
                    value={formData.coveringEmpId ?? ""}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        coveringEmpId:
                          e.target.value === ""
                            ? null
                            : parseInt(e.target.value),
                      }))
                    }
                    className="mt-1 block w-full rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 px-3 py-2 text-gray-900 dark:text-white focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100 dark:disabled:bg-gray-800 disabled:text-gray-500"
                  >
                    <option value="">Select covering employee...</option>
                    {employees.map((emp) => (
                      <option key={emp.enumber} value={emp.enumber}>
                        {emp.badge} - {emp.lastName}
                      </option>
                    ))}
                  </select>
                  <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                    Employee covering this absence
                  </p>
                </div>

                {/* Date of Entry */}
                <div>
                  <label
                    htmlFor="dateOfEntry"
                    className="block text-sm font-medium text-gray-700 dark:text-gray-300"
                  >
                    Date of Entry
                  </label>
                  <input
                    type="datetime-local"
                    id="dateOfEntry"
                    name="dateOfEntry"
                    disabled={!isEditable}
                    value={formData.dateOfEntry || ""}
                    onChange={handleChange}
                    className="mt-1 block w-full rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 px-3 py-2 text-gray-900 dark:text-white focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100 dark:disabled:bg-gray-800 disabled:text-gray-500"
                  />
                </div>

                {/* Notes */}
                <div>
                  <label
                    htmlFor="notes"
                    className="block text-sm font-medium text-gray-700 dark:text-gray-300"
                  >
                    Notes
                  </label>
                  <textarea
                    id="notes"
                    name="notes"
                    rows={4}
                    disabled={!isEditable}
                    value={formData.notes || ""}
                    onChange={handleChange}
                    className="mt-1 block w-full rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 px-3 py-2 text-gray-900 dark:text-white focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100 dark:disabled:bg-gray-800 disabled:text-gray-500"
                    placeholder="Additional notes or details about this absence..."
                  />
                </div>
              </div>

              {/* Form Actions */}
              {isEditable && (
                <div className="px-6 py-4 bg-gray-50 dark:bg-gray-900 border-t border-gray-200 dark:border-gray-700 flex justify-end gap-3">
                  <Link
                    href="/dashboard/absences"
                    className="rounded-md bg-white dark:bg-gray-700 px-4 py-2 text-sm font-semibold text-gray-900 dark:text-white shadow-sm border border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-600 transition-colors"
                  >
                    Cancel
                  </Link>
                  <button
                    type="submit"
                    disabled={saving}
                    className="rounded-md bg-blue-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-blue-700 transition-colors disabled:bg-blue-400 disabled:cursor-not-allowed"
                  >
                    {saving
                      ? "Saving..."
                      : isNew
                        ? "Create Absence"
                        : "Save Changes"}
                  </button>
                </div>
              )}
            </div>
          </form>
        </main>
      </div>
    </ProtectedRoute>
  );
}
