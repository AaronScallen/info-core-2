"use client";

import { ProtectedRoute } from "@/components/protected-route";
import { getAuthHeaders } from "@/lib/auth";
import { useRouter, useParams } from "next/navigation";
import { useEffect, useState } from "react";

type Shift = "A-Shift" | "B-Shift" | "C-Shift";

interface PatrolOfficer {
  enumber: number;
  badge: number | null;
  lastName: string | null;
  firstName: string | null;
  assignmentId: number | null;
  locationName: string | null;
}

interface PoliceVehicle {
  vehId: number;
  unitNumber: number | null;
}

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
}

export default function EditShiftRosterPage() {
  const router = useRouter();
  const params = useParams();
  const rosterId = params?.id as string;

  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [patrolOfficers, setPatrolOfficers] = useState<PatrolOfficer[]>([]);
  const [vehicles, setVehicles] = useState<PoliceVehicle[]>([]);

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
    fetchRoster();
    fetchPatrolOfficers();
    fetchVehicles();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [rosterId]);

  const fetchRoster = async () => {
    try {
      const response = await fetch(
        `http://localhost:3001/api/shift-roster/${rosterId}`,
        {
          headers: getAuthHeaders(),
        }
      );

      if (!response.ok) {
        throw new Error("Failed to fetch roster entry");
      }

      const data: ShiftRoster = await response.json();
      setFormData({
        shift: data.shift,
        rosterDate: data.rosterDate,
        enumber: data.enumber,
        badgeNumber: data.badgeNumber,
        lastName: data.lastName,
        vehicleAssigned: data.vehicleAssigned,
        patrolZone: data.patrolZone || "",
        keysInVehicle: data.keysInVehicle,
        passAlongNotes: data.passAlongNotes || "",
        supervisorEnumber: data.supervisorEnumber,
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setFetching(false);
    }
  };

  const fetchPatrolOfficers = async () => {
    try {
      const response = await fetch(
        "http://localhost:3001/api/shift-roster/patrol-officers",
        {
          headers: getAuthHeaders(),
        }
      );

      if (!response.ok) {
        throw new Error("Failed to fetch patrol officers");
      }

      const data = await response.json();
      setPatrolOfficers(data);
    } catch (err) {
      console.error("Error fetching patrol officers:", err);
    }
  };

  const fetchVehicles = async () => {
    try {
      const response = await fetch("http://localhost:3001/api/vehicles", {
        headers: getAuthHeaders(),
      });

      if (!response.ok) {
        throw new Error("Failed to fetch vehicles");
      }

      const data = await response.json();
      setVehicles(data);
    } catch (err) {
      console.error("Error fetching vehicles:", err);
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
      });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const response = await fetch(
        `http://localhost:3001/api/shift-roster/${rosterId}`,
        {
          method: "PUT",
          headers: {
            ...getAuthHeaders(),
            "Content-Type": "application/json",
          },
          body: JSON.stringify(formData),
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to update roster entry");
      }

      router.push("/dashboard/shift-roster");
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setLoading(false);
    }
  };

  if (fetching) {
    return (
      <ProtectedRoute requiredRole={["supervisor", "command_staff"]}>
        <div className="p-6 text-center">Loading...</div>
      </ProtectedRoute>
    );
  }

  return (
    <ProtectedRoute requiredRole={["supervisor", "command_staff"]}>
      <div className="p-6">
        <div className="max-w-2xl mx-auto">
          <h1 className="text-3xl font-bold mb-6">Edit Shift Roster Entry</h1>

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
                className="w-full border rounded px-3 py-2"
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
                className="w-full border rounded px-3 py-2"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Officer</label>
              <select
                value={formData.enumber}
                onChange={(e) => handleOfficerChange(parseInt(e.target.value))}
                className="w-full border rounded px-3 py-2"
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
                className="w-full border rounded px-3 py-2 bg-gray-100"
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
                className="w-full border rounded px-3 py-2 bg-gray-100"
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
                className="w-full border rounded px-3 py-2"
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
                className="w-full border rounded px-3 py-2"
                placeholder="e.g., Zone 1, Downtown, etc."
              />
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
                className="w-full border rounded px-3 py-2"
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
                {loading ? "Updating..." : "Update Roster Entry"}
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
