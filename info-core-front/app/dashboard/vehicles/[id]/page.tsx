"use client";

import { useAuth } from "@/components/auth-provider";
import { ProtectedRoute } from "@/components/protected-route";
import { getAuthHeaders } from "@/lib/auth";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useCallback, useEffect, useState } from "react";

interface PoliceVehicle {
  vehId: number;
  unitNumber: number | null;
  color: string | null;
  year: number | null;
  make: string | null;
  model: string | null;
  decals: boolean | null;
  vin: string | null;
  lpNumber: string | null;
}

interface Employee {
  enumber: number;
  badge: number | null;
  firstName: string | null;
  lastName: string | null;
}

export default function VehicleFormPage() {
  const { user } = useAuth();
  const router = useRouter();
  const params = useParams();
  const isNew = params.id === "new";
  const vehicleId = isNew ? null : parseInt(params.id as string);

  const [loading, setLoading] = useState(!isNew);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [assignedEmployee, setAssignedEmployee] = useState<Employee | null>(
    null
  );

  const [formData, setFormData] = useState<Partial<PoliceVehicle>>({
    vehId: 0,
    unitNumber: null,
    color: null,
    year: null,
    make: null,
    model: null,
    decals: false,
    vin: null,
    lpNumber: null,
  });

  const canEdit = user?.role === "supervisor" || user?.role === "command_staff";
  const canCreate = user?.role === "command_staff";
  const isEditable = isNew ? canCreate : canEdit;

  const fetchVehicle = useCallback(async () => {
    try {
      setLoading(true);
      const response = await fetch(
        `http://localhost:3001/api/vehicles/${vehicleId}`,
        {
          headers: getAuthHeaders(),
        }
      );

      if (!response.ok) {
        throw new Error("Failed to fetch vehicle");
      }

      const data = await response.json();
      setFormData(data);

      // Fetch assigned employee
      await fetchAssignedEmployee(data.vehId);

      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setLoading(false);
    }
  }, [vehicleId]);

  useEffect(() => {
    if (!isNew && vehicleId) {
      fetchVehicle();
    }
  }, [vehicleId, isNew, fetchVehicle]);

  const fetchAssignedEmployee = async (vehId: number) => {
    try {
      const response = await fetch(
        `http://localhost:3001/api/employees?vehId=${vehId}`,
        {
          headers: getAuthHeaders(),
        }
      );

      if (!response.ok) {
        throw new Error("Failed to fetch assigned employee");
      }

      const employees = await response.json();
      if (employees && employees.length > 0) {
        setAssignedEmployee(employees[0]);
      } else {
        setAssignedEmployee(null);
      }
    } catch (err) {
      console.error("Error fetching assigned employee:", err);
      setAssignedEmployee(null);
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
        ? "http://localhost:3001/api/vehicles"
        : `http://localhost:3001/api/vehicles/${vehicleId}`;

      const method = isNew ? "POST" : "PUT";

      const response = await fetch(url, {
        method,
        headers: getAuthHeaders(),
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to save vehicle");
      }

      // Redirect to list page on success
      router.push("/dashboard/vehicles");
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
      setSaving(false);
    }
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value, type } = e.target;

    if (type === "checkbox") {
      setFormData((prev) => ({
        ...prev,
        [name]: (e.target as HTMLInputElement).checked,
      }));
    } else if (type === "number") {
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
              Loading vehicle...
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
                  {isNew ? "Add New Vehicle" : "Vehicle Details"}
                </h1>
                <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
                  {isNew
                    ? "Create a new vehicle record"
                    : isEditable
                    ? "View and edit vehicle information"
                    : "View vehicle information"}
                </p>
              </div>
              <Link
                href="/dashboard/vehicles"
                className="rounded-md bg-gray-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-gray-700 transition-colors"
              >
                Back to Vehicles
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
                You have read-only access to this vehicle.
              </p>
            </div>
          )}

          <form onSubmit={handleSubmit}>
            {/* Assigned Badge Number */}
            {!isNew && (
              <div className="mb-4 px-4 py-3 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-md">
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  Assigned Badge Number:{" "}
                </span>
                <span className="text-sm font-semibold text-gray-900 dark:text-white">
                  {assignedEmployee?.badge || "Not Assigned"}
                </span>
              </div>
            )}

            <div className="bg-white dark:bg-gray-800 shadow rounded-lg">
              <div className="px-6 py-6 space-y-6">
                {/* Vehicle ID */}
                <div>
                  <label
                    htmlFor="vehId"
                    className="block text-sm font-medium text-gray-700 dark:text-gray-300"
                  >
                    Vehicle ID <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="number"
                    id="vehId"
                    name="vehId"
                    required
                    disabled={!isNew}
                    value={formData.vehId || ""}
                    onChange={handleChange}
                    className="mt-1 block w-full rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 px-3 py-2 text-gray-900 dark:text-white focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100 dark:disabled:bg-gray-800 disabled:text-gray-500"
                  />
                  <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                    {isNew
                      ? "Enter the vehicle ID"
                      : "Vehicle ID cannot be changed"}
                  </p>
                </div>

                {/* Unit Number */}
                <div>
                  <label
                    htmlFor="unitNumber"
                    className="block text-sm font-medium text-gray-700 dark:text-gray-300"
                  >
                    Unit Number
                  </label>
                  <input
                    type="number"
                    id="unitNumber"
                    name="unitNumber"
                    disabled={!isEditable}
                    value={formData.unitNumber || ""}
                    onChange={handleChange}
                    className="mt-1 block w-full rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 px-3 py-2 text-gray-900 dark:text-white focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100 dark:disabled:bg-gray-800 disabled:text-gray-500"
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
                  />
                </div>

                {/* Year */}
                <div>
                  <label
                    htmlFor="year"
                    className="block text-sm font-medium text-gray-700 dark:text-gray-300"
                  >
                    Year
                  </label>
                  <input
                    type="number"
                    id="year"
                    name="year"
                    min="1900"
                    max="2100"
                    disabled={!isEditable}
                    value={formData.year || ""}
                    onChange={handleChange}
                    className="mt-1 block w-full rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 px-3 py-2 text-gray-900 dark:text-white focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100 dark:disabled:bg-gray-800 disabled:text-gray-500"
                  />
                </div>

                {/* Color */}
                <div>
                  <label
                    htmlFor="color"
                    className="block text-sm font-medium text-gray-700 dark:text-gray-300"
                  >
                    Color
                  </label>
                  <input
                    type="text"
                    id="color"
                    name="color"
                    maxLength={50}
                    disabled={!isEditable}
                    value={formData.color || ""}
                    onChange={handleChange}
                    className="mt-1 block w-full rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 px-3 py-2 text-gray-900 dark:text-white focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100 dark:disabled:bg-gray-800 disabled:text-gray-500"
                  />
                </div>

                {/* VIN */}
                <div>
                  <label
                    htmlFor="vin"
                    className="block text-sm font-medium text-gray-700 dark:text-gray-300"
                  >
                    VIN
                  </label>
                  <input
                    type="text"
                    id="vin"
                    name="vin"
                    maxLength={100}
                    disabled={!isEditable}
                    value={formData.vin || ""}
                    onChange={handleChange}
                    className="mt-1 block w-full rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 px-3 py-2 text-gray-900 dark:text-white focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100 dark:disabled:bg-gray-800 disabled:text-gray-500 font-mono"
                  />
                </div>

                {/* License Plate */}
                <div>
                  <label
                    htmlFor="lpNumber"
                    className="block text-sm font-medium text-gray-700 dark:text-gray-300"
                  >
                    License Plate Number
                  </label>
                  <input
                    type="text"
                    id="lpNumber"
                    name="lpNumber"
                    maxLength={20}
                    disabled={!isEditable}
                    value={formData.lpNumber || ""}
                    onChange={handleChange}
                    className="mt-1 block w-full rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 px-3 py-2 text-gray-900 dark:text-white focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100 dark:disabled:bg-gray-800 disabled:text-gray-500"
                  />
                </div>

                {/* Decals */}
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="decals"
                    name="decals"
                    disabled={!isEditable}
                    checked={formData.decals || false}
                    onChange={handleChange}
                    className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500 disabled:opacity-50"
                  />
                  <label
                    htmlFor="decals"
                    className="ml-2 block text-sm text-gray-700 dark:text-gray-300"
                  >
                    Has Decals
                  </label>
                </div>
              </div>

              {/* Form Actions */}
              {isEditable && (
                <div className="px-6 py-4 bg-gray-50 dark:bg-gray-900 border-t border-gray-200 dark:border-gray-700 flex justify-end gap-3">
                  <Link
                    href="/dashboard/vehicles"
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
                      ? "Create Vehicle"
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
