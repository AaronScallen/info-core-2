"use client";

import { useAuth } from "@/components/auth-provider";
import { ProtectedRoute } from "@/components/protected-route";
import { getAuthHeaders } from "@/lib/auth";
import Link from "next/link";
import Image from "next/image";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useState, useRef, useCallback } from "react";

interface Employee {
  enumber: number;
  badge: number | null;
  positionNumber: number | null;
  pid: number | null;
  dob: string | null;
  lastName: string | null;
  firstName: string | null;
  email: string | null;
  assignmentId: number | null;
  bwcId: number | null;
  vehId: number | null;
  cellphoneId: number | null;
  photoUrl?: string | null;
}

interface Vehicle {
  vehId: number;
  unitNumber: number | null;
  make: string | null;
  model: string | null;
  year: number | null;
}

interface Assignment {
  assignmentId: number;
  assnId: number;
  locationName: string | null;
}

interface CellPhone {
  phoneId: number;
  idShort: number | null;
  phoneNum: string | null;
  make: string | null;
  model: string | null;
}

export default function EmployeeFormPage() {
  const { user } = useAuth();
  const router = useRouter();
  const params = useParams();
  const isNew = params.id === "new";
  const enumber = isNew ? null : parseInt(params.id as string);

  const [loading, setLoading] = useState(!isNew);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [cellphones, setCellphones] = useState<CellPhone[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isDuplicateEnumber, setIsDuplicateEnumber] = useState(false);
  const [checkingDuplicate, setCheckingDuplicate] = useState(false);
  const duplicateCheckTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const [formData, setFormData] = useState<Partial<Employee>>({
    enumber: undefined,
    badge: null,
    positionNumber: null,
    pid: null,
    dob: null,
    lastName: null,
    firstName: null,
    email: null,
    assignmentId: null,
    bwcId: null,
    vehId: null,
    cellphoneId: null,
  });

  const canEdit = ["dispatch", "supervisor", "command_staff"].includes(
    user?.role || "",
  );
  const canCreate = ["dispatch", "supervisor", "command_staff"].includes(
    user?.role || "",
  );
  const isEditable = isNew ? canCreate : canEdit;

  const fetchVehicles = useCallback(async () => {
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
  }, []);

  const fetchAssignments = useCallback(async () => {
    try {
      const response = await fetch("http://localhost:3001/api/assignments", {
        headers: getAuthHeaders(),
      });

      if (!response.ok) {
        throw new Error("Failed to fetch assignments");
      }

      const data = await response.json();
      setAssignments(data);
    } catch (err) {
      console.error("Error fetching assignments:", err);
    }
  }, []);

  const fetchCellphones = useCallback(async () => {
    try {
      const response = await fetch("http://localhost:3001/api/cellphones", {
        headers: getAuthHeaders(),
      });

      if (!response.ok) {
        throw new Error("Failed to fetch cellphones");
      }

      const data = await response.json();
      setCellphones(data);
    } catch (err) {
      console.error("Error fetching cellphones:", err);
    }
  }, []);

  const checkDuplicateEnumber = useCallback(
    async (enumber: number) => {
      if (!isNew || !enumber) {
        setIsDuplicateEnumber(false);
        return;
      }

      try {
        setCheckingDuplicate(true);
        const response = await fetch(
          `http://localhost:3001/api/employees/${enumber}`,
          {
            headers: getAuthHeaders(),
          },
        );

        // If response is OK, employee exists (duplicate)
        if (response.ok) {
          setIsDuplicateEnumber(true);
        } else if (response.status === 404) {
          // 404 means employee doesn't exist (good)
          setIsDuplicateEnumber(false);
        } else {
          // Other errors
          console.error("Error checking employee number:", response.status);
          setIsDuplicateEnumber(false);
        }
      } catch (err) {
        console.error("Error checking duplicate:", err);
        setIsDuplicateEnumber(false);
      } finally {
        setCheckingDuplicate(false);
      }
    },
    [isNew],
  );

  const fetchEmployee = useCallback(async () => {
    try {
      setLoading(true);
      const response = await fetch(
        `http://localhost:3001/api/employees/${enumber}`,
        {
          headers: getAuthHeaders(),
        },
      );

      if (!response.ok) {
        throw new Error("Failed to fetch employee");
      }

      const data = await response.json();

      // Format date for input field
      if (data.dob) {
        const date = new Date(data.dob);
        data.dob = date.toISOString().slice(0, 10); // Format for date input
      }

      // Set photo preview if exists
      if (data.photoUrl) {
        setPhotoPreview(data.photoUrl);
      }

      setFormData(data);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setLoading(false);
    }
  }, [enumber]);

  useEffect(() => {
    if (!isNew && enumber) {
      fetchEmployee();
    }
    fetchVehicles();
    fetchAssignments();
    fetchCellphones();
  }, [
    enumber,
    isNew,
    fetchEmployee,
    fetchVehicles,
    fetchAssignments,
    fetchCellphones,
  ]);

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (duplicateCheckTimeoutRef.current) {
        clearTimeout(duplicateCheckTimeoutRef.current);
      }
    };
  }, []);

  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Validate file type
      if (!file.type.startsWith("image/")) {
        alert("Please select an image file");
        return;
      }

      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        alert("Image size must be less than 5MB");
        return;
      }

      setPhotoFile(file);

      // Create preview
      const reader = new FileReader();
      reader.onloadend = () => {
        setPhotoPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleRemovePhoto = () => {
    setPhotoFile(null);
    setPhotoPreview(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
    // If editing existing employee, mark photo for deletion
    setFormData((prev) => ({
      ...prev,
      photoUrl: null,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!isEditable) {
      alert("You don't have permission to perform this action");
      return;
    }

    // Validate required fields
    if (isNew && !formData.enumber) {
      setError("Employee number is required");
      return;
    }

    // Check for duplicate employee number
    if (isNew && isDuplicateEnumber) {
      setError(
        "This employee number already exists. Please use a different number.",
      );
      return;
    }

    try {
      setSaving(true);
      setError(null);

      // For now, we'll store the photo as base64 in the database
      // In production, you'd upload to a file storage service
      let photoData = formData.photoUrl;
      if (photoFile && photoPreview) {
        photoData = photoPreview;
      }

      const dataToSubmit = {
        ...formData,
        photoUrl: photoData,
      };

      const url = isNew
        ? "http://localhost:3001/api/employees"
        : `http://localhost:3001/api/employees/${enumber}`;

      const method = isNew ? "POST" : "PUT";

      const response = await fetch(url, {
        method,
        headers: getAuthHeaders(),
        body: JSON.stringify(dataToSubmit),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to save employee");
      }

      router.push("/dashboard/employees");
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
      setSaving(false);
    }
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>,
  ) => {
    const { name, value, type } = e.target;

    if (type === "number") {
      const numValue = value === "" ? null : parseInt(value);
      setFormData((prev) => ({
        ...prev,
        [name]: numValue,
      }));

      // Check for duplicate employee number with debounce
      if (name === "enumber" && isNew && numValue) {
        // Clear previous timeout
        if (duplicateCheckTimeoutRef.current) {
          clearTimeout(duplicateCheckTimeoutRef.current);
        }

        // Set new timeout for debounced check
        duplicateCheckTimeoutRef.current = setTimeout(() => {
          checkDuplicateEnumber(numValue);
        }, 500);
      } else if (name === "enumber" && isNew && !numValue) {
        setIsDuplicateEnumber(false);
        setCheckingDuplicate(false);
      }
    } else if (type === "date") {
      setFormData((prev) => ({
        ...prev,
        [name]: value === "" ? null : value,
      }));
    } else if (type === "select-one") {
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
              Loading employee...
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
                  {isNew ? "Add New Employee" : "Employee Details"}
                </h1>
                <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
                  {isNew
                    ? "Create a new employee record"
                    : isEditable
                      ? "View and edit employee information"
                      : "View employee information"}
                </p>
              </div>
              <Link
                href="/dashboard/employees"
                className="rounded-md bg-gray-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-gray-700 transition-colors"
              >
                Back to Employees
              </Link>
            </div>
          </div>
        </header>

        {/* Main Content */}
        <main className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 py-8">
          {error && (
            <div className="mb-6 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-md p-4">
              <p className="text-red-800 dark:text-red-200">{error}</p>
            </div>
          )}

          {!isEditable && !isNew && (
            <div className="mb-6 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-md p-4">
              <p className="text-yellow-800 dark:text-yellow-200">
                You have read-only access to this employee record.
              </p>
            </div>
          )}

          <form onSubmit={handleSubmit}>
            <div className="bg-white dark:bg-gray-800 shadow rounded-lg">
              <div className="px-6 py-6 space-y-6">
                {/* Photo Upload Section */}
                <div className="flex flex-col items-center space-y-4 pb-6 border-b border-gray-200 dark:border-gray-700">
                  <div className="relative">
                    <div className="h-32 w-32 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center overflow-hidden">
                      {photoPreview ? (
                        <Image
                          src={photoPreview}
                          alt="Employee photo"
                          width={128}
                          height={128}
                          className="h-full w-full object-cover"
                        />
                      ) : (
                        <svg
                          className="h-16 w-16 text-gray-400"
                          fill="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path d="M24 20.993V24H0v-2.996A14.977 14.977 0 0112.004 15c4.904 0 9.26 2.354 11.996 5.993zM16.002 8.999a4 4 0 11-8 0 4 4 0 018 0z" />
                        </svg>
                      )}
                    </div>
                    {photoPreview && isEditable && (
                      <button
                        type="button"
                        onClick={handleRemovePhoto}
                        className="absolute top-0 right-0 bg-red-600 text-white rounded-full p-1.5 hover:bg-red-700 transition-colors"
                        title="Remove photo"
                      >
                        <svg
                          className="h-4 w-4"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M6 18L18 6M6 6l12 12"
                          />
                        </svg>
                      </button>
                    )}
                  </div>
                  {isEditable && (
                    <div className="flex flex-col items-center">
                      <input
                        ref={fileInputRef}
                        type="file"
                        accept="image/*"
                        onChange={handlePhotoChange}
                        className="hidden"
                        id="photo-upload"
                      />
                      <label
                        htmlFor="photo-upload"
                        className="cursor-pointer rounded-md bg-blue-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-blue-700 transition-colors"
                      >
                        {photoPreview ? "Change Photo" : "Upload Photo"}
                      </label>
                      <p className="mt-2 text-xs text-gray-500 dark:text-gray-400">
                        JPG, PNG, GIF up to 5MB
                      </p>
                    </div>
                  )}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Employee Number */}
                  <div>
                    <label
                      htmlFor="enumber"
                      className="block text-sm font-medium text-gray-700 dark:text-gray-300"
                    >
                      Employee Number <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="number"
                      id="enumber"
                      name="enumber"
                      required
                      disabled={!isNew}
                      value={formData.enumber || ""}
                      onChange={handleChange}
                      className={`mt-1 block w-full rounded-md border ${
                        isDuplicateEnumber
                          ? "border-red-500 focus:border-red-500 focus:ring-red-500"
                          : "border-gray-300 dark:border-gray-600 focus:border-blue-500 focus:ring-blue-500"
                      } bg-white dark:bg-gray-700 px-3 py-2 text-gray-900 dark:text-white focus:outline-none focus:ring-2 disabled:bg-gray-100 dark:disabled:bg-gray-800 disabled:text-gray-500`}
                    />
                    {isNew && checkingDuplicate && (
                      <p className="mt-1 text-sm text-blue-600 dark:text-blue-400 flex items-center">
                        <svg
                          className="animate-spin h-4 w-4 mr-1"
                          xmlns="http://www.w3.org/2000/svg"
                          fill="none"
                          viewBox="0 0 24 24"
                        >
                          <circle
                            className="opacity-25"
                            cx="12"
                            cy="12"
                            r="10"
                            stroke="currentColor"
                            strokeWidth="4"
                          ></circle>
                          <path
                            className="opacity-75"
                            fill="currentColor"
                            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                          ></path>
                        </svg>
                        Checking availability...
                      </p>
                    )}
                    {isNew && !checkingDuplicate && isDuplicateEnumber && (
                      <p className="mt-1 text-sm text-red-600 dark:text-red-400 flex items-center">
                        <svg
                          className="h-4 w-4 mr-1"
                          fill="currentColor"
                          viewBox="0 0 20 20"
                        >
                          <path
                            fillRule="evenodd"
                            d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                            clipRule="evenodd"
                          />
                        </svg>
                        This employee number already exists
                      </p>
                    )}
                    {isNew &&
                      !checkingDuplicate &&
                      !isDuplicateEnumber &&
                      formData.enumber && (
                        <p className="mt-1 text-sm text-green-600 dark:text-green-400 flex items-center">
                          <svg
                            className="h-4 w-4 mr-1"
                            fill="currentColor"
                            viewBox="0 0 20 20"
                          >
                            <path
                              fillRule="evenodd"
                              d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                              clipRule="evenodd"
                            />
                          </svg>
                          Employee number is available
                        </p>
                      )}
                    {!isNew && (
                      <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                        Cannot be changed
                      </p>
                    )}
                  </div>

                  {/* Badge Number */}
                  <div>
                    <label
                      htmlFor="badge"
                      className="block text-sm font-medium text-gray-700 dark:text-gray-300"
                    >
                      Badge Number
                    </label>
                    <input
                      type="number"
                      id="badge"
                      name="badge"
                      disabled={!isEditable}
                      value={formData.badge || ""}
                      onChange={handleChange}
                      className="mt-1 block w-full rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 px-3 py-2 text-gray-900 dark:text-white focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100 dark:disabled:bg-gray-800 disabled:text-gray-500"
                    />
                  </div>

                  {/* First Name */}
                  <div>
                    <label
                      htmlFor="firstName"
                      className="block text-sm font-medium text-gray-700 dark:text-gray-300"
                    >
                      First Name
                    </label>
                    <input
                      type="text"
                      id="firstName"
                      name="firstName"
                      maxLength={100}
                      disabled={!isEditable}
                      value={formData.firstName || ""}
                      onChange={handleChange}
                      className="mt-1 block w-full rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 px-3 py-2 text-gray-900 dark:text-white focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100 dark:disabled:bg-gray-800 disabled:text-gray-500"
                    />
                  </div>

                  {/* Last Name */}
                  <div>
                    <label
                      htmlFor="lastName"
                      className="block text-sm font-medium text-gray-700 dark:text-gray-300"
                    >
                      Last Name
                    </label>
                    <input
                      type="text"
                      id="lastName"
                      name="lastName"
                      maxLength={100}
                      disabled={!isEditable}
                      value={formData.lastName || ""}
                      onChange={handleChange}
                      className="mt-1 block w-full rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 px-3 py-2 text-gray-900 dark:text-white focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100 dark:disabled:bg-gray-800 disabled:text-gray-500"
                    />
                  </div>

                  {/* Email */}
                  <div>
                    <label
                      htmlFor="email"
                      className="block text-sm font-medium text-gray-700 dark:text-gray-300"
                    >
                      Email Address
                    </label>
                    <input
                      type="email"
                      id="email"
                      name="email"
                      maxLength={255}
                      disabled={!isEditable}
                      value={formData.email || ""}
                      onChange={handleChange}
                      className="mt-1 block w-full rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 px-3 py-2 text-gray-900 dark:text-white focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100 dark:disabled:bg-gray-800 disabled:text-gray-500"
                      placeholder="employee@department.gov"
                    />
                  </div>

                  {/* Date of Birth */}
                  <div>
                    <label
                      htmlFor="dob"
                      className="block text-sm font-medium text-gray-700 dark:text-gray-300"
                    >
                      Date of Birth
                    </label>
                    <input
                      type="date"
                      id="dob"
                      name="dob"
                      disabled={!isEditable}
                      value={formData.dob || ""}
                      onChange={handleChange}
                      className="mt-1 block w-full rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 px-3 py-2 text-gray-900 dark:text-white focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100 dark:disabled:bg-gray-800 disabled:text-gray-500"
                    />
                  </div>

                  {/* PID */}
                  <div>
                    <label
                      htmlFor="pid"
                      className="block text-sm font-medium text-gray-700 dark:text-gray-300"
                    >
                      PID
                    </label>
                    <input
                      type="number"
                      id="pid"
                      name="pid"
                      disabled={!isEditable}
                      value={formData.pid || ""}
                      onChange={handleChange}
                      className="mt-1 block w-full rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 px-3 py-2 text-gray-900 dark:text-white focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100 dark:disabled:bg-gray-800 disabled:text-gray-500"
                    />
                  </div>

                  {/* Position Number */}
                  <div>
                    <label
                      htmlFor="positionNumber"
                      className="block text-sm font-medium text-gray-700 dark:text-gray-300"
                    >
                      Position Number
                    </label>
                    <input
                      type="number"
                      id="positionNumber"
                      name="positionNumber"
                      disabled={!isEditable}
                      value={formData.positionNumber || ""}
                      onChange={handleChange}
                      className="mt-1 block w-full rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 px-3 py-2 text-gray-900 dark:text-white focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100 dark:disabled:bg-gray-800 disabled:text-gray-500"
                    />
                  </div>

                  {/* Assignment */}
                  <div>
                    <label
                      htmlFor="assignmentId"
                      className="block text-sm font-medium text-gray-700 dark:text-gray-300"
                    >
                      Assignment Location
                    </label>
                    <select
                      id="assignmentId"
                      name="assignmentId"
                      disabled={!isEditable}
                      value={formData.assignmentId || ""}
                      onChange={handleChange}
                      className="mt-1 block w-full rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 px-3 py-2 text-gray-900 dark:text-white focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100 dark:disabled:bg-gray-800 disabled:text-gray-500"
                    >
                      <option value="">-- Select Assignment --</option>
                      {assignments
                        .sort((a, b) => {
                          const nameA = a.locationName || "";
                          const nameB = b.locationName || "";
                          return nameA.localeCompare(nameB);
                        })
                        .map((assignment) => (
                          <option
                            key={assignment.assnId}
                            value={assignment.assnId}
                          >
                            {assignment.locationName ||
                              `Assignment ${assignment.assnId}`}
                          </option>
                        ))}
                    </select>
                    <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                      Employee&apos;s assigned location
                    </p>
                  </div>

                  {/* Body Camera ID */}
                  <div>
                    <label
                      htmlFor="bwcId"
                      className="block text-sm font-medium text-gray-700 dark:text-gray-300"
                    >
                      Body Camera ID
                    </label>
                    <input
                      type="number"
                      id="bwcId"
                      name="bwcId"
                      disabled={!isEditable}
                      value={formData.bwcId || ""}
                      onChange={handleChange}
                      className="mt-1 block w-full rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 px-3 py-2 text-gray-900 dark:text-white focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100 dark:disabled:bg-gray-800 disabled:text-gray-500"
                    />
                    <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                      Assigned body camera
                    </p>
                  </div>

                  {/* Vehicle ID */}
                  <div>
                    <label
                      htmlFor="vehId"
                      className="block text-sm font-medium text-gray-700 dark:text-gray-300"
                    >
                      Vehicle
                    </label>
                    <select
                      id="vehId"
                      name="vehId"
                      disabled={!isEditable}
                      value={formData.vehId || ""}
                      onChange={handleChange}
                      className="mt-1 block w-full rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 px-3 py-2 text-gray-900 dark:text-white focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100 dark:disabled:bg-gray-800 disabled:text-gray-500"
                    >
                      <option value="">-- Select Vehicle --</option>
                      {vehicles
                        .sort((a, b) => {
                          const unitA = a.unitNumber ?? 0;
                          const unitB = b.unitNumber ?? 0;
                          return unitA - unitB;
                        })
                        .map((vehicle) => (
                          <option key={vehicle.vehId} value={vehicle.vehId}>
                            Unit {vehicle.unitNumber || "N/A"}
                            {vehicle.make || vehicle.model
                              ? ` - ${vehicle.year || ""} ${
                                  vehicle.make || ""
                                } ${vehicle.model || ""}`.trim()
                              : ""}
                          </option>
                        ))}
                    </select>
                    <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                      Assigned police vehicle
                    </p>
                  </div>

                  {/* Cell Phone */}
                  <div>
                    <label
                      htmlFor="cellphoneId"
                      className="block text-sm font-medium text-gray-700 dark:text-gray-300"
                    >
                      Cell Phone
                    </label>
                    <select
                      id="cellphoneId"
                      name="cellphoneId"
                      disabled={!isEditable}
                      value={formData.cellphoneId || ""}
                      onChange={handleChange}
                      className="mt-1 block w-full rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 px-3 py-2 text-gray-900 dark:text-white focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100 dark:disabled:bg-gray-800 disabled:text-gray-500"
                    >
                      <option value="">-- Select Cell Phone --</option>
                      {cellphones
                        .sort((a, b) => {
                          const numA = a.phoneNum || "";
                          const numB = b.phoneNum || "";
                          return numA.localeCompare(numB);
                        })
                        .map((phone) => (
                          <option key={phone.phoneId} value={phone.phoneId}>
                            {phone.phoneNum || `Phone ID ${phone.phoneId}`}
                            {phone.make || phone.model
                              ? ` (${phone.make || ""} ${
                                  phone.model || ""
                                }`.trim() + ")"
                              : ""}
                          </option>
                        ))}
                    </select>
                    <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                      Assigned cell phone
                    </p>
                  </div>
                </div>
              </div>

              {/* Form Actions */}
              {isEditable && (
                <div className="px-6 py-4 bg-gray-50 dark:bg-gray-900 border-t border-gray-200 dark:border-gray-700 flex justify-end gap-3">
                  <Link
                    href="/dashboard/employees"
                    className="rounded-md bg-white dark:bg-gray-700 px-4 py-2 text-sm font-semibold text-gray-900 dark:text-white shadow-sm border border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-600 transition-colors"
                  >
                    Cancel
                  </Link>
                  <button
                    type="submit"
                    disabled={saving || (isNew && isDuplicateEnumber)}
                    className="rounded-md bg-blue-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-blue-700 transition-colors disabled:bg-blue-400 disabled:cursor-not-allowed"
                  >
                    {saving
                      ? "Saving..."
                      : isNew
                        ? "Create Employee"
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
