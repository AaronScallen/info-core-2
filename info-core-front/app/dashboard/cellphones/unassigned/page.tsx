"use client";

import { useAuth } from "@/components/auth-provider";
import { ProtectedRoute } from "@/components/protected-route";
import { getAuthHeaders } from "@/lib/auth";
import Link from "next/link";
import { useEffect, useState } from "react";

interface CellPhone {
  phoneId: number;
  idShort: number | null;
  phoneNum: string | null;
  make: string | null;
  model: string | null;
}

interface Employee {
  enumber: number;
  cellphoneId: number | null;
}

export default function UnassignedCellPhonesPage() {
  const { user } = useAuth();
  const [unassignedCellPhones, setUnassignedCellPhones] = useState<CellPhone[]>(
    []
  );
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");

  const canCreate =
    user?.role === "supervisor" || user?.role === "command_staff";
  const canEdit = user?.role === "supervisor" || user?.role === "command_staff";

  useEffect(() => {
    fetchUnassignedCellPhones();
  }, []);

  const fetchUnassignedCellPhones = async () => {
    try {
      setLoading(true);
      // Fetch all cell phones
      const cellPhonesResponse = await fetch(
        "http://localhost:3001/api/cellphones",
        {
          headers: getAuthHeaders(),
        }
      );

      if (!cellPhonesResponse.ok) {
        throw new Error("Failed to fetch cell phones");
      }

      const allCellPhones: CellPhone[] = await cellPhonesResponse.json();

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

      // Get all assigned cell phone IDs
      const assignedCellPhoneIds = new Set(
        employees
          .filter((emp) => emp.cellphoneId !== null)
          .map((emp) => emp.cellphoneId)
      );

      // Filter cell phones that are not assigned
      const unassigned = allCellPhones.filter(
        (phone) => !assignedCellPhoneIds.has(phone.phoneId)
      );

      setUnassignedCellPhones(unassigned);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setLoading(false);
    }
  };

  const filteredCellPhones = unassignedCellPhones.filter((phone) => {
    const searchLower = searchTerm.toLowerCase();
    return (
      phone.phoneId.toString().includes(searchLower) ||
      phone.idShort?.toString().includes(searchLower) ||
      phone.phoneNum?.toLowerCase().includes(searchLower) ||
      phone.make?.toLowerCase().includes(searchLower) ||
      phone.model?.toLowerCase().includes(searchLower)
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
                  Unassigned Cell Phones
                </h1>
                <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
                  Cell phones not currently assigned to any employee
                </p>
              </div>
              <div className="flex items-center gap-4">
                <Link
                  href="/dashboard/cellphones"
                  className="rounded-md bg-gray-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-gray-700 transition-colors"
                >
                  All Cell Phones
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
              placeholder="Search cell phones (ID, phone number, make, model)..."
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
                Loading unassigned cell phones...
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
          {!loading && !error && filteredCellPhones.length === 0 && (
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
                  d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z"
                />
              </svg>
              <h3 className="mt-2 text-sm font-semibold text-gray-900 dark:text-white">
                No unassigned cell phones
              </h3>
              <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                All cell phones are currently assigned to employees
              </p>
            </div>
          )}

          {/* Cell Phones Table */}
          {!loading && !error && filteredCellPhones.length > 0 && (
            <div className="bg-white dark:bg-gray-800 shadow-md rounded-lg overflow-hidden">
              <div className="px-4 py-3 border-b border-gray-200 dark:border-gray-700">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                  {filteredCellPhones.length} Unassigned Cell Phone
                  {filteredCellPhones.length !== 1 ? "s" : ""}
                </h3>
              </div>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                  <thead className="bg-gray-50 dark:bg-gray-700">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                        Phone ID
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                        Short ID
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                        Phone Number
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                        Make
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                        Model
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                    {filteredCellPhones.map((phone) => (
                      <tr
                        key={phone.phoneId}
                        className="hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                      >
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">
                          {phone.phoneId}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700 dark:text-gray-300">
                          {phone.idShort || "—"}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700 dark:text-gray-300">
                          {phone.phoneNum || "—"}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700 dark:text-gray-300">
                          {phone.make || "—"}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700 dark:text-gray-300">
                          {phone.model || "—"}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          <Link
                            href={`/dashboard/cellphones/${phone.phoneId}`}
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
