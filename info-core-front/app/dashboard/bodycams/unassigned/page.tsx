"use client";

import { useAuth } from "@/components/auth-provider";
import { ProtectedRoute } from "@/components/protected-route";
import { getAuthHeaders } from "@/lib/auth";
import Link from "next/link";
import { useEffect, useState } from "react";

interface Bodycam {
  bwcId: number;
  device: string | null;
  locator: string | null;
  model: string | null;
  wifiMacAddress: string | null;
}

interface Employee {
  enumber: number;
  bwcId: number | null;
}

export default function UnassignedBodycamsPage() {
  const { user } = useAuth();
  const [unassignedBodycams, setUnassignedBodycams] = useState<Bodycam[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");

  const canCreate =
    user?.role === "supervisor" || user?.role === "command_staff";
  const canEdit = user?.role === "supervisor" || user?.role === "command_staff";

  useEffect(() => {
    fetchUnassignedBodycams();
  }, []);

  const fetchUnassignedBodycams = async () => {
    try {
      setLoading(true);
      // Fetch all bodycams
      const bodycamsResponse = await fetch(
        "http://localhost:3001/api/bodycams",
        {
          headers: getAuthHeaders(),
        }
      );

      if (!bodycamsResponse.ok) {
        throw new Error("Failed to fetch bodycams");
      }

      const allBodycams: Bodycam[] = await bodycamsResponse.json();

      // Fetch all employees
      const employeesResponse = await fetch(
        "http://localhost:3001/api/employees",
        {
          headers: getAuthHeaders(),
        }
      );

      if (!employeesResponse.ok) {
        throw new Error("Failed to fetch employees");
      }

      const employees: Employee[] = await employeesResponse.json();

      // Get all assigned bodycam IDs
      const assignedBodycamIds = new Set(
        employees.filter((emp) => emp.bwcId !== null).map((emp) => emp.bwcId)
      );

      // Filter bodycams that are not assigned
      const unassigned = allBodycams.filter(
        (bodycam) => !assignedBodycamIds.has(bodycam.bwcId)
      );

      setUnassignedBodycams(unassigned);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setLoading(false);
    }
  };

  const filteredBodycams = unassignedBodycams.filter((bodycam) => {
    const searchLower = searchTerm.toLowerCase();
    return (
      bodycam.bwcId.toString().includes(searchLower) ||
      bodycam.device?.toLowerCase().includes(searchLower) ||
      bodycam.locator?.toLowerCase().includes(searchLower) ||
      bodycam.model?.toLowerCase().includes(searchLower) ||
      bodycam.wifiMacAddress?.toLowerCase().includes(searchLower)
    );
  });

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        {/* Header */}
        <header className="bg-white dark:bg-gray-800 shadow">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-6">
            <div className="flex justify-between items-center">
              <div>
                <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                  Unassigned Body Cameras
                </h1>
                <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
                  Body cameras not currently assigned to any employee
                </p>
              </div>
              <div className="flex items-center gap-4">
                <Link
                  href="/dashboard/bodycams"
                  className="rounded-md bg-gray-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-gray-700 transition-colors"
                >
                  All Bodycams
                </Link>
                <Link
                  href="/dashboard"
                  className="rounded-md bg-gray-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-gray-700 transition-colors"
                >
                  Dashboard
                </Link>
              </div>
            </div>
          </div>
        </header>

        {/* Main Content */}
        <main className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
          {/* Search Bar */}
          <div className="mb-6">
            <input
              type="text"
              placeholder="Search bodycams (ID, device, locator, model, MAC address)..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 px-4 py-2 text-gray-900 dark:text-white focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Loading State */}
          {loading && (
            <div className="text-center py-12">
              <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
              <p className="mt-2 text-gray-600 dark:text-gray-400">
                Loading unassigned bodycams...
              </p>
            </div>
          )}

          {/* Error State */}
          {error && (
            <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-md p-4">
              <p className="text-red-800 dark:text-red-200">{error}</p>
            </div>
          )}

          {/* Empty State */}
          {!loading && !error && filteredBodycams.length === 0 && (
            <div className="text-center py-12">
              <svg
                className="mx-auto h-12 w-12 text-gray-400"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                aria-hidden="true"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z"
                />
              </svg>
              <h3 className="mt-2 text-sm font-semibold text-gray-900 dark:text-white">
                No unassigned bodycams
              </h3>
              <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                All body cameras are currently assigned to employees
              </p>
            </div>
          )}

          {/* Bodycams Table */}
          {!loading && !error && filteredBodycams.length > 0 && (
            <div className="bg-white dark:bg-gray-800 shadow-md rounded-lg overflow-hidden">
              <div className="px-4 py-3 border-b border-gray-200 dark:border-gray-700">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                  {filteredBodycams.length} Unassigned Bodycam
                  {filteredBodycams.length !== 1 ? "s" : ""}
                </h3>
              </div>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                  <thead className="bg-gray-50 dark:bg-gray-700">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                        BWC ID
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                        Device
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                        Locator
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                        Model
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                        WiFi MAC Address
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                    {filteredBodycams.map((bodycam) => (
                      <tr
                        key={bodycam.bwcId}
                        className="hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                      >
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">
                          {bodycam.bwcId}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700 dark:text-gray-300">
                          {bodycam.device || "—"}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700 dark:text-gray-300">
                          {bodycam.locator || "—"}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700 dark:text-gray-300">
                          {bodycam.model || "—"}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700 dark:text-gray-300 font-mono">
                          {bodycam.wifiMacAddress || "—"}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          <Link
                            href={`/dashboard/bodycams/${bodycam.bwcId}`}
                            className="text-blue-600 hover:text-blue-900 dark:text-blue-400 dark:hover:text-blue-300"
                          >
                            View Details
                          </Link>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </main>
      </div>
    </ProtectedRoute>
  );
}
