"use client";

import { ProtectedRoute } from "@/components/protected-route";
import { getAuthHeaders } from "@/lib/auth";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

type Shift = "A-Shift" | "B-Shift" | "C-Shift";

interface PatrolOfficer {
  enumber: number;
  badge: number | null;
  lastName: string | null;
  firstName: string | null;
  assignmentId: number | null;
  locationName: string | null;
  vehId: number | null;
}

interface PoliceVehicle {
  vehId: number;
  unitNumber: number | null;
}

interface PatrolSupervisor {
  enumber: number;
  badge: number | null;
  lastName: string | null;
  firstName: string | null;
  assignmentId: number | null;
  locationName: string | null;
}

export default function NewShiftRosterPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [patrolOfficers, setPatrolOfficers] = useState<PatrolOfficer[]>([]);
  const [vehicles, setVehicles] = useState<PoliceVehicle[]>([]);
  const [supervisors, setSupervisors] = useState<PatrolSupervisor[]>([]);

  const [formData, setFormData] = useState({
    shift: "A-Shift" as Shift,
    rosterDate: new Date().toISOString().split("T")[0],
    enumber: 0,
    badgeNumber: 0,
    lastName: "",
    vehicleAssigned: null as number | null,
    patrolZone: "",
    keysInVehicle: false,
    passAlongNotes: "",
    supervisorEnumber: 0,
  });

  useEffect(() => {
    fetchPatrolOfficers();
    fetchVehicles();
    fetchSupervisors();
  }, []);

  const fetchPatrolOfficers = async () => {
    try {
      const response = await fetch(
        "http://localhost:3001/api/shift-roster/patrol-officers",
        {
          headers: getAuthHeaders(),
        },
      );

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        console.error("Failed to fetch patrol officers:", {
          status: response.status,
          statusText: response.statusText,
          error: errorData,
        });
        throw new Error(
          errorData.error ||
            `Failed to fetch patrol officers: ${response.status}`,
        );
      }

      const data = await response.json();
      setPatrolOfficers(data);
    } catch (err) {
      console.error("Error fetching patrol officers:", err);
      setError(
        err instanceof Error ? err.message : "Failed to load patrol officers",
      );
    }
  };

  const fetchVehicles = async () => {
    try {
      const response = await fetch("http://localhost:3001/api/vehicles", {
        headers: getAuthHeaders(),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        console.error("Failed to fetch vehicles:", {
          status: response.status,
          statusText: response.statusText,
          error: errorData,
        });
        throw new Error(
          errorData.error || `Failed to fetch vehicles: ${response.status}`,
        );
      }

      const data = await response.json();
      setVehicles(data);
    } catch (err) {
      console.error("Error fetching vehicles:", err);
      setError(err instanceof Error ? err.message : "Failed to load vehicles");
    }
  };

  const fetchSupervisors = async () => {
    try {
      const response = await fetch(
        "http://localhost:3001/api/shift-roster/supervisors",
        {
          headers: getAuthHeaders(),
        },
      );

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        console.error("Failed to fetch supervisors:", {
          status: response.status,
          statusText: response.statusText,
          error: errorData,
        });
        throw new Error(
          errorData.error || `Failed to fetch supervisors: ${response.status}`,
        );
      }

      const data = await response.json();
      setSupervisors(data);
    } catch (err) {
      console.error("Error fetching supervisors:", err);
      setError(
        err instanceof Error ? err.message : "Failed to load supervisors",
      );
    }
  };

  const handleOfficerChange = (enumber: number) => {
    const officer = patrolOfficers.find((o) => o.enumber === enumber);
    if (officer) {
      setFormData({
        ...formData,
        enumber: officer.enumber,
        badgeNumber: officer.badge || 0,
        lastName: officer.lastName || "",
        vehicleAssigned: officer.vehId || null,
      });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      console.log("Submitting form data:", formData);

      const response = await fetch("http://localhost:3001/api/shift-roster", {
        method: "POST",
        headers: {
          ...getAuthHeaders(),
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        let errorData;
        try {
          errorData = await response.json();
        } catch {
          errorData = {};
        }
        console.error("Server error response:", {
          status: response.status,
          statusText: response.statusText,
          error: errorData,
        });

        // Better error message handling
        let errorMessage = "Failed to create roster entry";
        if (errorData?.details) {
          errorMessage = `Validation error: ${JSON.stringify(errorData.details)}`;
        } else if (errorData?.error) {
          errorMessage = errorData.error;
        } else if (response.status === 400) {
          errorMessage =
            "Invalid data submitted. Please check all required fields.";
        } else if (response.status === 401) {
          errorMessage = "Unauthorized. Please log in again.";
        } else if (response.status === 500) {
          errorMessage = "Server error. Please try again or contact support.";
        } else {
          errorMessage = `Request failed with status ${response.status}: ${response.statusText}`;
        }

        throw new Error(errorMessage);
      }

      router.push("/dashboard/shift-roster");
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setLoading(false);
    }
  };

  return (
    <ProtectedRoute requiredRole={["supervisor", "command_staff"]}>
      <div className="p-6">
        <div className="max-w-2xl mx-auto">
          <h1 className="text-3xl font-bold mb-6">Create Shift Roster Entry</h1>

          {error && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1">Shift</label>
              <select
                value={formData.shift}
                onChange={(e) =>
                  setFormData({ ...formData, shift: e.target.value as Shift })
                }
                className="w-full rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 px-4 py-2 text-gray-900 dark:text-white focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              >
                <option value="A-Shift">A-Shift (05:45 - 14:00)</option>
                <option value="B-Shift">B-Shift (13:45 - 22:00)</option>
                <option value="C-Shift">C-Shift (21:45 - 06:00)</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">
                Roster Date
              </label>
              <input
                type="date"
                value={formData.rosterDate}
                onChange={(e) =>
                  setFormData({ ...formData, rosterDate: e.target.value })
                }
                className="w-full rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 px-4 py-2 text-gray-900 dark:text-white focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Officer</label>
              <select
                value={formData.enumber}
                onChange={(e) => handleOfficerChange(parseInt(e.target.value))}
                className="w-full rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 px-4 py-2 text-gray-900 dark:text-white focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              >
                <option value={0}>Select an officer...</option>
                {patrolOfficers.map((officer) => (
                  <option key={officer.enumber} value={officer.enumber}>
                    {officer.badge} - {officer.lastName}, {officer.firstName} (
                    {officer.locationName})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">
                Badge Number
              </label>
              <input
                type="number"
                value={formData.badgeNumber}
                readOnly
                className="w-full rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 px-4 py-2 text-gray-900 dark:text-white focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">
                Last Name
              </label>
              <input
                type="text"
                value={formData.lastName}
                readOnly
                className="w-full rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 px-4 py-2 text-gray-900 dark:text-white focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">
                Vehicle Assigned
              </label>
              <select
                value={formData.vehicleAssigned || ""}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    vehicleAssigned: e.target.value
                      ? parseInt(e.target.value)
                      : null,
                  })
                }
                className="w-full rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 px-4 py-2 text-gray-900 dark:text-white focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">No vehicle assigned</option>
                {vehicles.map((vehicle) => (
                  <option key={vehicle.vehId} value={vehicle.vehId}>
                    Unit {vehicle.unitNumber} - ID: {vehicle.vehId}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">
                Patrol Zone
              </label>
              <input
                type="text"
                value={formData.patrolZone}
                onChange={(e) =>
                  setFormData({ ...formData, patrolZone: e.target.value })
                }
                className="w-full rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 px-4 py-2 text-gray-900 dark:text-white focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="e.g., Zone 1, Downtown, etc."
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">
                Supervisor
              </label>
              <select
                value={formData.supervisorEnumber}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    supervisorEnumber: parseInt(e.target.value),
                  })
                }
                className="w-full rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 px-4 py-2 text-gray-900 dark:text-white focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              >
                <option value={0}>Select a supervisor...</option>
                {supervisors.map((supervisor) => (
                  <option key={supervisor.enumber} value={supervisor.enumber}>
                    {supervisor.badge} - {supervisor.lastName},{" "}
                    {supervisor.firstName}
                  </option>
                ))}
              </select>
            </div>

            <div className="flex items-center">
              <input
                type="checkbox"
                id="keysInVehicle"
                checked={formData.keysInVehicle}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    keysInVehicle: e.target.checked,
                  })
                }
                className="mr-2"
              />
              <label htmlFor="keysInVehicle" className="text-sm font-medium">
                Keys in Vehicle
              </label>
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">
                Pass Along Notes
              </label>
              <textarea
                value={formData.passAlongNotes}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    passAlongNotes: e.target.value,
                  })
                }
                className="w-full rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 px-4 py-2 text-gray-900 dark:text-white focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
                rows={4}
                placeholder="Any important notes for the next shift..."
              />
            </div>

            <div className="flex gap-2">
              <button
                type="submit"
                disabled={loading}
                className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded disabled:opacity-50"
              >
                {loading ? "Creating..." : "Create Roster Entry"}
              </button>
              <button
                type="button"
                onClick={() => router.back()}
                className="bg-gray-300 hover:bg-gray-400 text-gray-800 font-bold py-2 px-4 rounded"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      </div>
    </ProtectedRoute>
  );
}
