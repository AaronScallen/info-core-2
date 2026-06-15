"use client";

import { useAuth } from "@/components/auth-provider";
import { ProtectedRoute } from "@/components/protected-route";
import { getAuthHeaders } from "@/lib/auth";
import Link from "next/link";
import { useEffect, useState } from "react";

interface EmergencyAlert {
  alertId: number;
  priority: "LOW" | "MEDIUM" | "HIGH" | "CRITICAL";
  location: string;
  description: string;
  isActive: boolean;
  triggeredAt: string;
  cancelledAt: string | null;
  createdBy: number | null;
  cancelledBy: number | null;
}

const PRIORITY_OPTIONS = ["LOW", "MEDIUM", "HIGH", "CRITICAL"] as const;

const PRIORITY_BADGE: Record<string, string> = {
  CRITICAL: "bg-red-100 text-red-800 dark:bg-red-900/40 dark:text-red-300",
  HIGH: "bg-orange-100 text-orange-800 dark:bg-orange-900/40 dark:text-orange-300",
  MEDIUM:
    "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/40 dark:text-yellow-300",
  LOW: "bg-blue-100 text-blue-800 dark:bg-blue-900/40 dark:text-blue-300",
};

export default function AlertsPage() {
  const { user } = useAuth();

  const canManage = ["command_staff", "dispatch"].includes(user?.role ?? "");

  const [activeAlert, setActiveAlert] = useState<EmergencyAlert | null>(null);
  const [history, setHistory] = useState<EmergencyAlert[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [cancelling, setCancelling] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    priority: "HIGH" as (typeof PRIORITY_OPTIONS)[number],
    location: "",
    description: "",
  });

  const fetchData = async () => {
    try {
      const [activeRes, historyRes] = await Promise.all([
        fetch("http://localhost:3001/api/alerts/active", {
          headers: getAuthHeaders(),
        }),
        fetch("http://localhost:3001/api/alerts", {
          headers: getAuthHeaders(),
        }),
      ]);

      if (activeRes.ok) {
        setActiveAlert(await activeRes.json());
      }
      if (historyRes.ok) {
        setHistory(await historyRes.json());
      }
    } catch (err) {
      setError("Failed to load alerts");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleTrigger = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!canManage) return;

    try {
      setSubmitting(true);
      setError(null);
      setSuccess(null);

      const res = await fetch("http://localhost:3001/api/alerts", {
        method: "POST",
        headers: getAuthHeaders(),
        body: JSON.stringify(formData),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error ?? "Failed to trigger alert");
      }

      setSuccess("Emergency alert triggered successfully.");
      setFormData({ priority: "HIGH", location: "", description: "" });
      await fetchData();
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setSubmitting(false);
    }
  };

  const handleCancel = async (alertId: number) => {
    if (!canManage) return;

    try {
      setCancelling(true);
      setError(null);
      setSuccess(null);

      const res = await fetch(
        `http://localhost:3001/api/alerts/${alertId}/cancel`,
        {
          method: "PUT",
          headers: getAuthHeaders(),
        },
      );

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error ?? "Failed to cancel alert");
      }

      setSuccess("Alert cancelled successfully.");
      await fetchData();
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setCancelling(false);
    }
  };

  if (!canManage) {
    return (
      <ProtectedRoute>
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
          <div className="text-center">
            <p className="text-gray-600 dark:text-gray-400">
              You do not have permission to access this page.
            </p>
            <Link
              href="/dashboard"
              className="mt-4 inline-block text-blue-600 hover:underline"
            >
              Back to Dashboard
            </Link>
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
                  Emergency Alerts
                </h1>
                <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
                  Trigger and manage emergency alerts visible to all users
                </p>
              </div>
              <Link
                href="/dashboard"
                className="rounded-md bg-gray-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-gray-700 transition-colors"
              >
                Back to Dashboard
              </Link>
            </div>
          </div>
        </header>

        <main className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 py-8 space-y-8">
          {/* Feedback */}
          {error && (
            <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-md p-4">
              <p className="text-red-800 dark:text-red-200">{error}</p>
            </div>
          )}
          {success && (
            <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-md p-4">
              <p className="text-green-800 dark:text-green-200">{success}</p>
            </div>
          )}

          {/* Active Alert Card */}
          {activeAlert && (
            <div className="bg-red-50 dark:bg-red-900/20 border-2 border-red-400 dark:border-red-600 rounded-lg p-6">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <h2 className="text-lg font-bold text-red-900 dark:text-red-200 flex items-center gap-2">
                    <span>⚠</span>
                    <span>ACTIVE ALERT</span>
                    <span
                      className={`ml-2 text-xs font-semibold px-2 py-0.5 rounded-full ${PRIORITY_BADGE[activeAlert.priority]}`}
                    >
                      {activeAlert.priority}
                    </span>
                  </h2>
                  <p className="mt-2 text-sm font-semibold text-red-800 dark:text-red-300">
                    📍 {activeAlert.location}
                  </p>
                  <p className="mt-1 text-sm text-red-800 dark:text-red-300">
                    {activeAlert.description}
                  </p>
                  <p className="mt-2 text-xs text-red-700 dark:text-red-400">
                    Triggered:{" "}
                    {new Date(activeAlert.triggeredAt).toLocaleString()}
                  </p>
                </div>
                <button
                  onClick={() => handleCancel(activeAlert.alertId)}
                  disabled={cancelling}
                  className="shrink-0 rounded-md bg-red-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  {cancelling ? "Cancelling..." : "Cancel Alert"}
                </button>
              </div>
            </div>
          )}

          {!activeAlert && !loading && (
            <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-md p-4">
              <p className="text-green-800 dark:text-green-200 font-medium">
                ✓ No active emergency alerts.
              </p>
            </div>
          )}

          {/* Trigger Form */}
          <div className="bg-white dark:bg-gray-800 shadow rounded-lg">
            <div className="px-6 py-5 border-b border-gray-200 dark:border-gray-700">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                Trigger New Alert
              </h2>
              <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                This alert will be immediately visible to all logged-in users.
                Any existing active alert will be automatically cancelled.
              </p>
            </div>
            <form onSubmit={handleTrigger}>
              <div className="px-6 py-6 space-y-5">
                {/* Priority */}
                <div>
                  <label
                    htmlFor="priority"
                    className="block text-sm font-medium text-gray-700 dark:text-gray-300"
                  >
                    Priority <span className="text-red-500">*</span>
                  </label>
                  <select
                    id="priority"
                    value={formData.priority}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        priority: e.target
                          .value as (typeof PRIORITY_OPTIONS)[number],
                      }))
                    }
                    className="mt-1 block w-full rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 px-3 py-2 text-gray-900 dark:text-white focus:border-red-500 focus:outline-none focus:ring-2 focus:ring-red-500"
                    required
                  >
                    {PRIORITY_OPTIONS.map((p) => (
                      <option key={p} value={p}>
                        {p}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Location */}
                <div>
                  <label
                    htmlFor="location"
                    className="block text-sm font-medium text-gray-700 dark:text-gray-300"
                  >
                    Location <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    id="location"
                    maxLength={255}
                    required
                    value={formData.location}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        location: e.target.value,
                      }))
                    }
                    className="mt-1 block w-full rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 px-3 py-2 text-gray-900 dark:text-white focus:border-red-500 focus:outline-none focus:ring-2 focus:ring-red-500"
                    placeholder="e.g., Main Street & 5th Ave, Sector 4"
                  />
                </div>

                {/* Description */}
                <div>
                  <label
                    htmlFor="description"
                    className="block text-sm font-medium text-gray-700 dark:text-gray-300"
                  >
                    Brief Description <span className="text-red-500">*</span>
                  </label>
                  <textarea
                    id="description"
                    rows={3}
                    required
                    value={formData.description}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        description: e.target.value,
                      }))
                    }
                    className="mt-1 block w-full rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 px-3 py-2 text-gray-900 dark:text-white focus:border-red-500 focus:outline-none focus:ring-2 focus:ring-red-500"
                    placeholder="Brief description of the emergency situation..."
                  />
                </div>
              </div>

              <div className="px-6 py-4 bg-gray-50 dark:bg-gray-900 border-t border-gray-200 dark:border-gray-700 flex justify-end">
                <button
                  type="submit"
                  disabled={submitting}
                  className="rounded-md bg-red-600 px-6 py-2 text-sm font-semibold text-white shadow-sm hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  {submitting ? "Triggering..." : "⚠ Trigger Alert"}
                </button>
              </div>
            </form>
          </div>

          {/* Alert History */}
          <div className="bg-white dark:bg-gray-800 shadow rounded-lg">
            <div className="px-6 py-5 border-b border-gray-200 dark:border-gray-700">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                Alert History
              </h2>
            </div>
            <div className="divide-y divide-gray-200 dark:divide-gray-700">
              {loading && (
                <div className="px-6 py-8 text-center text-gray-500 dark:text-gray-400">
                  Loading...
                </div>
              )}
              {!loading && history.length === 0 && (
                <div className="px-6 py-8 text-center text-gray-500 dark:text-gray-400">
                  No alerts have been triggered yet.
                </div>
              )}
              {history.map((alert) => (
                <div key={alert.alertId} className="px-6 py-4">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <div className="flex items-center gap-2">
                        <span
                          className={`text-xs font-semibold px-2 py-0.5 rounded-full ${PRIORITY_BADGE[alert.priority]}`}
                        >
                          {alert.priority}
                        </span>
                        {alert.isActive && (
                          <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-300 animate-pulse">
                            ACTIVE
                          </span>
                        )}
                        <span className="text-sm font-semibold text-gray-900 dark:text-white">
                          {alert.location}
                        </span>
                      </div>
                      <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
                        {alert.description}
                      </p>
                      <div className="mt-1 text-xs text-gray-500 dark:text-gray-500 space-x-4">
                        <span>
                          Triggered:{" "}
                          {new Date(alert.triggeredAt).toLocaleString()}
                        </span>
                        {alert.cancelledAt && (
                          <span>
                            Cancelled:{" "}
                            {new Date(alert.cancelledAt).toLocaleString()}
                          </span>
                        )}
                      </div>
                    </div>
                    {alert.isActive && (
                      <button
                        onClick={() => handleCancel(alert.alertId)}
                        disabled={cancelling}
                        className="shrink-0 rounded-md bg-red-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-red-700 disabled:opacity-50 transition-colors"
                      >
                        Cancel
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </main>
      </div>
    </ProtectedRoute>
  );
}
