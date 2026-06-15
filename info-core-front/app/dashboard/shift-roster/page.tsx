"use client";

import { useAuth } from "@/components/auth-provider";
import { ProtectedRoute } from "@/components/protected-route";
import { getAuthHeaders } from "@/lib/auth";
import Link from "next/link";
import { useEffect, useState } from "react";

type Shift = "A-Shift" | "B-Shift" | "C-Shift";

interface ShiftRoster {
  rosterId: number;
  shift: Shift;
  rosterDate: string;
  enumber: number;
  badgeNumber: number;
  lastName: string;
  vehicleAssigned: number | null;
  patrolZone: string | null;
  keysInVehicle: boolean;
  passAlongNotes: string | null;
  supervisorEnumber: number;
  createdAt: string;
  updatedAt: string;
}

export default function ShiftRosterPage() {
  const { user } = useAuth();
  const [rosters, setRosters] = useState<ShiftRoster[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<"day" | "week" | "month">("day");
  const [selectedDate, setSelectedDate] = useState<string>(
    new Date().toISOString().split("T")[0]
  );
  const [selectedShift, setSelectedShift] = useState<Shift | "all">("all");

  const canCreate = ["supervisor", "command_staff"].includes(user?.role || "");
  const canEdit = ["supervisor", "command_staff"].includes(user?.role || "");
  const canDelete = ["supervisor", "command_staff"].includes(user?.role || "");

  useEffect(() => {
    fetchRosters();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedDate, viewMode, selectedShift]);

  const fetchRosters = async () => {
    try {
      setLoading(true);
      let url = "http://localhost:3001/api/shift-roster";

      if (viewMode === "day") {
        url = `http://localhost:3001/api/shift-roster/date/${selectedDate}`;
      } else {
        const { startDate, endDate } = getDateRange();
        url = `http://localhost:3001/api/shift-roster/range?startDate=${startDate}&endDate=${endDate}`;
      }

      const response = await fetch(url, {
        headers: getAuthHeaders(),
      });

      if (!response.ok) {
        throw new Error("Failed to fetch shift rosters");
      }

      let data = await response.json();

      // Filter by shift if not "all"
      if (selectedShift !== "all") {
        data = data.filter((r: ShiftRoster) => r.shift === selectedShift);
      }

      setRosters(data);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setLoading(false);
    }
  };

  const getDateRange = () => {
    const date = new Date(selectedDate);
    let startDate = "";
    let endDate = "";

    if (viewMode === "week") {
      const dayOfWeek = date.getDay();
      const diff = date.getDate() - dayOfWeek;
      const sunday = new Date(date.setDate(diff));
      const saturday = new Date(sunday);
      saturday.setDate(sunday.getDate() + 6);

      startDate = sunday.toISOString().split("T")[0];
      endDate = saturday.toISOString().split("T")[0];
    } else if (viewMode === "month") {
      const firstDay = new Date(date.getFullYear(), date.getMonth(), 1);
      const lastDay = new Date(date.getFullYear(), date.getMonth() + 1, 0);

      startDate = firstDay.toISOString().split("T")[0];
      endDate = lastDay.toISOString().split("T")[0];
    }

    return { startDate, endDate };
  };

  const handleDelete = async (rosterId: number) => {
    if (!confirm("Are you sure you want to delete this roster entry?")) {
      return;
    }

    try {
      const response = await fetch(
        `http://localhost:3001/api/shift-roster/${rosterId}`,
        {
          method: "DELETE",
          headers: getAuthHeaders(),
        }
      );

      if (!response.ok) {
        throw new Error("Failed to delete roster entry");
      }

      fetchRosters();
    } catch (err) {
      alert(
        err instanceof Error ? err.message : "Failed to delete roster entry"
      );
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString();
  };

  const getShiftTimes = (shift: Shift) => {
    switch (shift) {
      case "A-Shift":
        return "05:45 - 14:00";
      case "B-Shift":
        return "13:45 - 22:00";
      case "C-Shift":
        return "21:45 - 06:00";
    }
  };

  const groupRostersByDateAndShift = () => {
    const grouped: {
      [date: string]: { [shift: string]: ShiftRoster[] };
    } = {};

    rosters.forEach((roster) => {
      if (!grouped[roster.rosterDate]) {
        grouped[roster.rosterDate] = {
          "A-Shift": [],
          "B-Shift": [],
          "C-Shift": [],
        };
      }
      grouped[roster.rosterDate][roster.shift].push(roster);
    });

    return grouped;
  };

  const navigateDate = (direction: "prev" | "next") => {
    const date = new Date(selectedDate);

    if (viewMode === "day") {
      date.setDate(date.getDate() + (direction === "next" ? 1 : -1));
    } else if (viewMode === "week") {
      date.setDate(date.getDate() + (direction === "next" ? 7 : -7));
    } else if (viewMode === "month") {
      date.setMonth(date.getMonth() + (direction === "next" ? 1 : -1));
    }

    setSelectedDate(date.toISOString().split("T")[0]);
  };

  return (
    <ProtectedRoute requiredRole={["officer", "supervisor", "command_staff"]}>
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        {/* Header */}
        <header className="bg-white dark:bg-gray-800 shadow">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-6">
            <div className="flex justify-between items-center">
              <div>
                <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                  Shift Roster
                </h1>
                <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
                  Manage shift assignments and daily roster
                </p>
              </div>
              <div className="flex items-center gap-4">
                <Link
                  href="/dashboard"
                  className="rounded-md bg-gray-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-gray-700 transition-colors"
                >
                  Back to Dashboard
                </Link>
                {canCreate && (
                  <Link
                    href="/dashboard/shift-roster/new"
                    className="rounded-md bg-blue-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-blue-700 transition-colors"
                  >
                    Create Roster Entry
                  </Link>
                )}
              </div>
            </div>
          </div>
        </header>

        {/* Main Content */}
        <main className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
          {/* View Mode Selector */}
          <div className="mb-6 bg-white dark:bg-gray-800 rounded-lg shadow p-4">
            <div className="flex gap-4 items-center flex-wrap">
              <div className="flex gap-2">
                <button
                  onClick={() => setViewMode("day")}
                  className={`px-4 py-2 rounded-md font-medium transition-colors ${
                    viewMode === "day"
                      ? "bg-blue-600 text-white"
                      : "bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600"
                  }`}
                >
                  Day View
                </button>
                <button
                  onClick={() => setViewMode("week")}
                  className={`px-4 py-2 rounded-md font-medium transition-colors ${
                    viewMode === "week"
                      ? "bg-blue-600 text-white"
                      : "bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600"
                  }`}
                >
                  Week View
                </button>
                <button
                  onClick={() => setViewMode("month")}
                  className={`px-4 py-2 rounded-md font-medium transition-colors ${
                    viewMode === "month"
                      ? "bg-blue-600 text-white"
                      : "bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600"
                  }`}
                >
                  Month View
                </button>
              </div>

              <div className="flex gap-2 items-center">
                <button
                  onClick={() => navigateDate("prev")}
                  className="bg-gray-300 dark:bg-gray-700 hover:bg-gray-400 dark:hover:bg-gray-600 text-gray-800 dark:text-gray-200 px-3 py-2 rounded-md font-medium transition-colors"
                >
                  &larr; Prev
                </button>
                <input
                  type="date"
                  value={selectedDate}
                  onChange={(e) => setSelectedDate(e.target.value)}
                  className="rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 px-3 py-2 text-gray-900 dark:text-white focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <button
                  onClick={() => navigateDate("next")}
                  className="bg-gray-300 dark:bg-gray-700 hover:bg-gray-400 dark:hover:bg-gray-600 text-gray-800 dark:text-gray-200 px-3 py-2 rounded-md font-medium transition-colors"
                >
                  Next &rarr;
                </button>
              </div>

              <select
                value={selectedShift}
                onChange={(e) =>
                  setSelectedShift(e.target.value as Shift | "all")
                }
                className="rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 px-3 py-2 text-gray-900 dark:text-white focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="all">All Shifts</option>
                <option value="A-Shift">A-Shift</option>
                <option value="B-Shift">B-Shift</option>
                <option value="C-Shift">C-Shift</option>
              </select>
            </div>
          </div>

          {error && (
            <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4 mb-6">
              <p className="text-red-800 dark:text-red-200">{error}</p>
            </div>
          )}

          {loading ? (
            <div className="text-center py-12">
              <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
              <p className="mt-2 text-gray-600 dark:text-gray-400">
                Loading roster...
              </p>
            </div>
          ) : (
            <div className="space-y-6">
              {Object.entries(groupRostersByDateAndShift()).map(
                ([date, shifts]) => (
                  <div
                    key={date}
                    className="bg-white dark:bg-gray-800 rounded-lg shadow"
                  >
                    <div className="bg-gray-50 dark:bg-gray-900 px-6 py-4 border-b border-gray-200 dark:border-gray-700">
                      <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                        {formatDate(date)}
                      </h2>
                    </div>

                    {Object.entries(shifts).map(([shift, rosterEntries]) => {
                      if (rosterEntries.length === 0) return null;

                      return (
                        <div
                          key={shift}
                          className="p-6 border-b border-gray-200 dark:border-gray-700 last:border-b-0"
                        >
                          <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">
                            {shift} ({getShiftTimes(shift as Shift)})
                          </h3>

                          <div className="overflow-x-auto">
                            <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                              <thead className="bg-gray-50 dark:bg-gray-900">
                                <tr>
                                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                    Badge
                                  </th>
                                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                    Last Name
                                  </th>
                                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                    Vehicle
                                  </th>
                                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                    Patrol Zone
                                  </th>
                                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                    Keys
                                  </th>
                                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                    Notes
                                  </th>
                                  {(canEdit || canDelete) && (
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                      Actions
                                    </th>
                                  )}
                                </tr>
                              </thead>
                              <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                                {rosterEntries.map((roster) => (
                                  <tr
                                    key={roster.rosterId}
                                    className="hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                                  >
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-100">
                                      {roster.badgeNumber}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-100">
                                      {roster.lastName}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-100">
                                      {roster.vehicleAssigned || "-"}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-100">
                                      {roster.patrolZone || "-"}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-100">
                                      {roster.keysInVehicle ? "Yes" : "No"}
                                    </td>
                                    <td className="px-6 py-4 text-sm text-gray-900 dark:text-gray-100 max-w-xs truncate">
                                      {roster.passAlongNotes || "-"}
                                    </td>
                                    {(canEdit || canDelete) && (
                                      <td className="px-6 py-4 whitespace-nowrap text-sm">
                                        <div className="flex gap-3">
                                          {canEdit && (
                                            <Link
                                              href={`/dashboard/shift-roster/${roster.rosterId}`}
                                              className="text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 font-medium transition-colors"
                                            >
                                              Edit
                                            </Link>
                                          )}
                                          {canDelete && (
                                            <button
                                              onClick={() =>
                                                handleDelete(roster.rosterId)
                                              }
                                              className="text-red-600 dark:text-red-400 hover:text-red-800 dark:hover:text-red-300 font-medium transition-colors"
                                            >
                                              Delete
                                            </button>
                                          )}
                                        </div>
                                      </td>
                                    )}
                                  </tr>
                                ))}
                              </tbody>
                            </table>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )
              )}

              {rosters.length === 0 && (
                <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-12 text-center">
                  <p className="text-gray-500 dark:text-gray-400 text-lg">
                    No roster entries found for the selected period.
                  </p>
                </div>
              )}
            </div>
          )}
        </main>
      </div>
    </ProtectedRoute>
  );
}
