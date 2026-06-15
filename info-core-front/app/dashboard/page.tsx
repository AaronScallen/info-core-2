"use client";

import { useAuth } from "@/components/auth-provider";
import { ProtectedRoute } from "@/components/protected-route";
import Link from "next/link";
import { useEffect, useState } from "react";
import { Orbitron } from "next/font/google";

const orbitron = Orbitron({ subsets: ["latin"] });

interface DashboardStats {
  employeesCount: number;
  vehiclesCount: number;
  bodycamsCount: number;
  cellphonesCount: number;
}

export default function DashboardPage() {
  const { user, logout } = useAuth();
  const [stats, setStats] = useState<DashboardStats>({
    employeesCount: 0,
    vehiclesCount: 0,
    bodycamsCount: 0,
    cellphonesCount: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token) return;

        const headers = {
          Authorization: `Bearer ${token}`,
        };

        // Fetch all data in parallel
        const [employeesRes, vehiclesRes, bodycamsRes, cellphonesRes] =
          await Promise.all([
            fetch("http://localhost:3001/api/employees", { headers }),
            fetch("http://localhost:3001/api/vehicles", { headers }),
            fetch("http://localhost:3001/api/bodycams", { headers }),
            fetch("http://localhost:3001/api/cellphones", { headers }),
          ]);

        const [employees, vehicles, bodycams, cellphones] = await Promise.all([
          employeesRes.ok ? employeesRes.json() : [],
          vehiclesRes.ok ? vehiclesRes.json() : [],
          bodycamsRes.ok ? bodycamsRes.json() : [],
          cellphonesRes.ok ? cellphonesRes.json() : [],
        ]);

        setStats({
          employeesCount: Array.isArray(employees)
            ? employees.length
            : (employees?.pagination?.total ?? employees?.data?.length ?? 0),
          vehiclesCount: Array.isArray(vehicles) ? vehicles.length : 0,
          bodycamsCount: Array.isArray(bodycams) ? bodycams.length : 0,
          cellphonesCount: Array.isArray(cellphones) ? cellphones.length : 0,
        });
      } catch (error) {
        console.error("Error fetching dashboard stats:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        {/* Header */}
        <header className="bg-white dark:bg-gray-800 shadow">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-6 flex justify-between items-center">
            <div>
              <h1
                className={`text-3xl font-bold text-gray-900 dark:text-white ${orbitron.className} relative`}
              >
                <span
                  className="relative inline-block bg-linear-to-r from-gray-900 via-blue-600 to-gray-900 dark:from-white dark:via-blue-100 dark:to-white bg-clip-text text-transparent animate-shimmer"
                  style={{ backgroundSize: "200% 100%" }}
                >
                  InfoCore
                </span>
              </h1>
              <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
                Welcome back, {user?.username}!
              </p>
            </div>
            <div className="flex items-center gap-4">
              <div className="text-right">
                <div className="text-sm font-medium text-gray-900 dark:text-white">
                  {user?.username}
                </div>
                <div className="text-xs text-gray-600 dark:text-gray-400 capitalize">
                  {user?.role?.replace("_", " ")}
                </div>
              </div>
              <button
                onClick={logout}
                className="rounded-md bg-red-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-red-700 transition-colors"
              >
                Logout
              </button>
            </div>
          </div>
        </header>

        {/* Main Content */}
        <main className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
          {/* Quick Stats */}
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4 mb-8">
            <div className="bg-white dark:bg-gray-800 overflow-hidden shadow rounded-lg">
              <div className="p-5">
                <div className="flex items-center">
                  <div className="shrink-0">
                    <svg
                      className="h-6 w-6 text-blue-600"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"
                      />
                    </svg>
                  </div>
                  <div className="ml-5 w-0 flex-1">
                    <dl>
                      <dt className="text-sm font-medium text-gray-500 dark:text-gray-400 truncate">
                        Employees
                      </dt>
                      <dd className="text-lg font-semibold text-gray-900 dark:text-white">
                        {loading ? "..." : stats.employeesCount}
                      </dd>
                    </dl>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white dark:bg-gray-800 overflow-hidden shadow rounded-lg">
              <div className="p-5">
                <div className="flex items-center">
                  <div className="shrink-0">
                    <svg
                      className="h-6 w-6 text-green-600"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                      />
                    </svg>
                  </div>
                  <div className="ml-5 w-0 flex-1">
                    <dl>
                      <dt className="text-sm font-medium text-gray-500 dark:text-gray-400 truncate">
                        Active Vehicles
                      </dt>
                      <dd className="text-lg font-semibold text-gray-900 dark:text-white">
                        {loading ? "..." : stats.vehiclesCount}
                      </dd>
                    </dl>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white dark:bg-gray-800 overflow-hidden shadow rounded-lg">
              <div className="p-5">
                <div className="flex items-center">
                  <div className="shrink-0">
                    <svg
                      className="h-6 w-6 text-purple-600"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z"
                      />
                    </svg>
                  </div>
                  <div className="ml-5 w-0 flex-1">
                    <dl>
                      <dt className="text-sm font-medium text-gray-500 dark:text-gray-400 truncate">
                        Body Cameras
                      </dt>
                      <dd className="text-lg font-semibold text-gray-900 dark:text-white">
                        {loading ? "..." : stats.bodycamsCount}
                      </dd>
                    </dl>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white dark:bg-gray-800 overflow-hidden shadow rounded-lg">
              <div className="p-5">
                <div className="flex items-center">
                  <div className="shrink-0">
                    <svg
                      className="h-6 w-6 text-orange-600"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z"
                      />
                    </svg>
                  </div>
                  <div className="ml-5 w-0 flex-1">
                    <dl>
                      <dt className="text-sm font-medium text-gray-500 dark:text-gray-400 truncate">
                        Cell Phones
                      </dt>
                      <dd className="text-lg font-semibold text-gray-900 dark:text-white">
                        {loading ? "..." : stats.cellphonesCount}
                      </dd>
                    </dl>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Quick Links */}
          <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-6">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
              Quick Access
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <Link
                href="/dashboard/employees"
                className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
              >
                <h3 className="font-semibold text-gray-900 dark:text-white">
                  Employees
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                  Manage employee records and profiles
                </p>
              </Link>

              <Link
                href="/dashboard/vehicles"
                className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
              >
                <h3 className="font-semibold text-gray-900 dark:text-white">
                  Vehicle Fleet
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                  Track and manage police vehicles
                </p>
              </Link>

              <Link
                href="/dashboard/bodycams"
                className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
              >
                <h3 className="font-semibold text-gray-900 dark:text-white">
                  Body Cameras
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                  Manage body camera inventory
                </p>
              </Link>

              <Link
                href="/dashboard/cellphones"
                className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
              >
                <h3 className="font-semibold text-gray-900 dark:text-white">
                  Cell Phones
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                  View cell phone assignments
                </p>
              </Link>

              <Link
                href="/dashboard/assignments"
                className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
              >
                <h3 className="font-semibold text-gray-900 dark:text-white">
                  Assignments
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                  Manage location assignments
                </p>
              </Link>

              <Link
                href="/dashboard/absences"
                className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
              >
                <h3 className="font-semibold text-gray-900 dark:text-white">
                  Absences
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                  Track employee absences
                </p>
              </Link>

              <Link
                href="/dashboard/shift-roster"
                className="p-4 border-2 border-blue-300 dark:border-blue-700 rounded-lg hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors bg-blue-50/50 dark:bg-blue-900/10"
              >
                <div className="flex items-center justify-between">
                  <h3 className="font-semibold text-blue-900 dark:text-blue-300">
                    Shift Roster
                  </h3>
                  <span className="text-xs bg-blue-200 dark:bg-blue-800 text-blue-800 dark:text-blue-200 px-2 py-1 rounded-full font-medium">
                    Patrol
                  </span>
                </div>
                <p className="text-sm text-blue-700 dark:text-blue-400 mt-1">
                  View and manage patrol shift assignments
                </p>
              </Link>

              {user?.role === "command_staff" && (
                <Link
                  href="/dashboard/users"
                  className="p-4 border-2 border-purple-300 dark:border-purple-700 rounded-lg hover:bg-purple-50 dark:hover:bg-purple-900/20 transition-colors bg-purple-50/50 dark:bg-purple-900/10"
                >
                  <div className="flex items-center justify-between">
                    <h3 className="font-semibold text-purple-900 dark:text-purple-300">
                      User Management
                    </h3>
                    <span className="text-xs bg-purple-200 dark:bg-purple-800 text-purple-800 dark:text-purple-200 px-2 py-1 rounded-full font-medium">
                      Admin
                    </span>
                  </div>
                  <p className="text-sm text-purple-700 dark:text-purple-400 mt-1">
                    Manage system users and permissions
                  </p>
                </Link>
              )}

              {user?.role === "command_staff" && (
                <Link
                  href="/dashboard/reports"
                  className="p-4 border-2 border-emerald-300 dark:border-emerald-700 rounded-lg hover:bg-emerald-50 dark:hover:bg-emerald-900/20 transition-colors bg-emerald-50/50 dark:bg-emerald-900/10"
                >
                  <div className="flex items-center justify-between">
                    <h3 className="font-semibold text-emerald-900 dark:text-emerald-300">
                      Reports
                    </h3>
                    <span className="text-xs bg-emerald-200 dark:bg-emerald-800 text-emerald-800 dark:text-emerald-200 px-2 py-1 rounded-full font-medium">
                      Export
                    </span>
                  </div>
                  <p className="text-sm text-emerald-700 dark:text-emerald-400 mt-1">
                    Export CSV files and print command-staff reports
                  </p>
                </Link>
              )}

              {(user?.role === "command_staff" ||
                user?.role === "dispatch") && (
                <Link
                  href="/dashboard/alerts"
                  className="p-4 border-2 border-red-300 dark:border-red-700 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors bg-red-50/50 dark:bg-red-900/10"
                >
                  <div className="flex items-center justify-between">
                    <h3 className="font-semibold text-red-900 dark:text-red-300">
                      Emergency Alerts
                    </h3>
                    <span className="text-xs bg-red-200 dark:bg-red-800 text-red-800 dark:text-red-200 px-2 py-1 rounded-full font-medium">
                      Alerts
                    </span>
                  </div>
                  <p className="text-sm text-red-700 dark:text-red-400 mt-1">
                    Trigger and manage emergency alerts
                  </p>
                </Link>
              )}
            </div>
          </div>

          {/* Role-based Access Info */}
          <div className="mt-8 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
            <h3 className="font-semibold text-blue-900 dark:text-blue-300">
              Your Access Level:{" "}
              <span className="capitalize">
                {user?.role?.replace("_", " ")}
              </span>
            </h3>
            <p className="text-sm text-blue-800 dark:text-blue-400 mt-1">
              {user?.role === "command_staff" &&
                "You have full access to all system features and can manage all resources."}
              {user?.role === "supervisor" &&
                "You have access to view and modify most resources except user management."}
              {user?.role === "officer" &&
                "You have view-only access to most resources."}
              {user?.role === "dispatch" &&
                "You have access to view resources and manage assignments."}
            </p>
          </div>
        </main>
      </div>
    </ProtectedRoute>
  );
}
