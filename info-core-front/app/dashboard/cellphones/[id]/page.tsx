"use client";

import { useAuth } from "@/components/auth-provider";
import { ProtectedRoute } from "@/components/protected-route";
import { getAuthHeaders } from "@/lib/auth";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";

interface CellPhone {
  phoneId: number;
  idShort: number | null;
  phoneNum: string | null;
  make: string | null;
  model: string | null;
}

export default function CellPhoneFormPage() {
  const { user } = useAuth();
  const router = useRouter();
  const params = useParams();
  const isNew = params.id === "new";
  const phoneId = isNew ? null : parseInt(params.id as string);

  const [loading, setLoading] = useState(!isNew);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [formData, setFormData] = useState<Partial<CellPhone>>({
    idShort: null,
    phoneNum: null,
    make: null,
    model: null,
  });

  const canEdit = user?.role === "supervisor" || user?.role === "command_staff";
  const canCreate =
    user?.role === "supervisor" || user?.role === "command_staff";
  const isEditable = isNew ? canCreate : canEdit;

  useEffect(() => {
    if (!isNew && phoneId) {
      fetchCellPhone();
    }
  }, [phoneId, isNew]);

  const fetchCellPhone = async () => {
    try {
      setLoading(true);
      const response = await fetch(
        `http://localhost:3001/api/cellphones/${phoneId}`,
        {
          headers: getAuthHeaders(),
        }
      );

      if (!response.ok) {
        throw new Error("Failed to fetch cell phone");
      }

      const data = await response.json();
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
        ? "http://localhost:3001/api/cellphones"
        : `http://localhost:3001/api/cellphones/${phoneId}`;

      const method = isNew ? "POST" : "PUT";

      const response = await fetch(url, {
        method,
        headers: getAuthHeaders(),
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to save cell phone");
      }

      router.push("/dashboard/cellphones");
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
      setSaving(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
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
              Loading cell phone...
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
                  {isNew ? "Add New Cell Phone" : "Cell Phone Details"}
                </h1>
                <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
                  {isNew
                    ? "Create a new cell phone record"
                    : isEditable
                    ? "View and edit cell phone information"
                    : "View cell phone information"}
                </p>
              </div>
              <Link
                href="/dashboard/cellphones"
                className="rounded-md bg-gray-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-gray-700 transition-colors"
              >
                Back to Cell Phones
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
                You have read-only access to this cell phone.
              </p>
            </div>
          )}

          <form onSubmit={handleSubmit}>
            <div className="bg-white dark:bg-gray-800 shadow rounded-lg">
              <div className="px-6 py-6 space-y-6">
                {!isNew && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                      Phone ID
                    </label>
                    <input
                      type="number"
                      disabled
                      value={formData.phoneId || ""}
                      className="mt-1 block w-full rounded-md border border-gray-300 dark:border-gray-600 bg-gray-100 dark:bg-gray-800 px-3 py-2 text-gray-500 dark:text-gray-400"
                    />
                    <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                      Auto-generated ID
                    </p>
                  </div>
                )}

                {/* ID Short */}
                <div>
                  <label
                    htmlFor="idShort"
                    className="block text-sm font-medium text-gray-700 dark:text-gray-300"
                  >
                    ID Short
                  </label>
                  <input
                    type="number"
                    id="idShort"
                    name="idShort"
                    disabled={!isEditable}
                    value={formData.idShort || ""}
                    onChange={handleChange}
                    className="mt-1 block w-full rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 px-3 py-2 text-gray-900 dark:text-white focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100 dark:disabled:bg-gray-800 disabled:text-gray-500"
                  />
                </div>

                {/* Phone Number */}
                <div>
                  <label
                    htmlFor="phoneNum"
                    className="block text-sm font-medium text-gray-700 dark:text-gray-300"
                  >
                    Phone Number
                  </label>
                  <input
                    type="text"
                    id="phoneNum"
                    name="phoneNum"
                    maxLength={20}
                    disabled={!isEditable}
                    value={formData.phoneNum || ""}
                    onChange={handleChange}
                    className="mt-1 block w-full rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 px-3 py-2 text-gray-900 dark:text-white focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100 dark:disabled:bg-gray-800 disabled:text-gray-500"
                    placeholder="(555) 555-5555"
                  />
                </div>

                {/* Make */}
                <div>
                  <label
                    htmlFor="make"
                    className="block text-sm font-medium text-gray-700 dark:text-gray-300"
                  >
                    Make
                  </label>
                  <input
                    type="text"
                    id="make"
                    name="make"
                    maxLength={50}
                    disabled={!isEditable}
                    value={formData.make || ""}
                    onChange={handleChange}
                    className="mt-1 block w-full rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 px-3 py-2 text-gray-900 dark:text-white focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100 dark:disabled:bg-gray-800 disabled:text-gray-500"
                    placeholder="Apple, Samsung, etc."
                  />
                </div>

                {/* Model */}
                <div>
                  <label
                    htmlFor="model"
                    className="block text-sm font-medium text-gray-700 dark:text-gray-300"
                  >
                    Model
                  </label>
                  <input
                    type="text"
                    id="model"
                    name="model"
                    maxLength={50}
                    disabled={!isEditable}
                    value={formData.model || ""}
                    onChange={handleChange}
                    className="mt-1 block w-full rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 px-3 py-2 text-gray-900 dark:text-white focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100 dark:disabled:bg-gray-800 disabled:text-gray-500"
                    placeholder="iPhone 15, Galaxy S24, etc."
                  />
                </div>
              </div>

              {/* Form Actions */}
              {isEditable && (
                <div className="px-6 py-4 bg-gray-50 dark:bg-gray-900 border-t border-gray-200 dark:border-gray-700 flex justify-end gap-3">
                  <Link
                    href="/dashboard/cellphones"
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
                      ? "Create Cell Phone"
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
