"use client";

import { useAuth } from "@/components/auth-provider";
import { ProtectedRoute } from "@/components/protected-route";
import { getAuthHeaders } from "@/lib/auth";
import Link from "next/link";
import { useEffect, useState, useCallback } from "react";
import useSWR from "swr";

interface Employee {
  enumber: number;
  badge: number | null;
  positionNumber: number | null;
  lastName: string | null;
  firstName: string | null;
  email: string | null;
  assignmentId: number | null;
  bwcId: number | null;
  vehId: number | null;
  cellphoneId: number | null;
}

interface PaginatedResponse {
  data: Employee[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

// Debounce utility
function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
}

// SWR fetcher
const fetcher = (url: string) =>
  fetch(url, { headers: getAuthHeaders() }).then((res) => {
    if (!res.ok) throw new Error("Failed to fetch");
    return res.json();
  });

export default function EmployeesPageOptimized() {
  const { user } = useAuth();
  const [page, setPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState("");
  const [limit] = useState(50); // Items per page

  // Debounce search to avoid querying on every keystroke
  const debouncedSearch = useDebounce(searchTerm, 500);

  const canCreate = ["dispatch", "supervisor", "command_staff"].includes(
    user?.role || "",
  );
  const canEdit = ["dispatch", "supervisor", "command_staff"].includes(
    user?.role || "",
  );
  const canDelete = ["command_staff"].includes(user?.role || "");

  // Build API URL with pagination
  const apiUrl = `http://localhost:3001/api/employees?page=${page}&limit=${limit}${
    debouncedSearch ? `&search=${encodeURIComponent(debouncedSearch)}` : ""
  }`;

  // Use SWR for data fetching with cache
  const { data, error, isLoading, mutate } = useSWR<PaginatedResponse>(
    apiUrl,
    fetcher,
    {
      revalidateOnFocus: false, // Don't refetch when window regains focus
      dedupingInterval: 60000, // Cache for 1 minute (60 seconds)
      revalidateOnReconnect: true,
    },
  );

  const employees = data?.data || [];
  const pagination = data?.pagination;

  const handleDelete = async (enumber: number) => {
    if (!confirm("Are you sure you want to delete this employee?")) {
      return;
    }

    try {
      const response = await fetch(
        `http://localhost:3001/api/employees/${enumber}`,
        {
          method: "DELETE",
          headers: getAuthHeaders(),
        },
      );

      if (!response.ok) {
        throw new Error("Failed to delete employee");
      }

      // Revalidate cache after deletion
      mutate();
    } catch (err) {
      alert(err instanceof Error ? err.message : "Failed to delete employee");
    }
  };

  const getFullName = (employee: Employee) => {
    const parts = [];
    if (employee.firstName) parts.push(employee.firstName);
    if (employee.lastName) parts.push(employee.lastName);
    return parts.length > 0 ? parts.join(" ") : "-";
  };

  const handlePageChange = (newPage: number) => {
    if (newPage < 1 || (pagination && newPage > pagination.totalPages)) return;
    setPage(newPage);
  };

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
    setPage(1); // Reset to first page on new search
  };

  return (
    <ProtectedRoute>
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold">Employees</h1>
          {canCreate && (
            <Link
              href="/dashboard/employees/new"
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded"
            >
              Add Employee
            </Link>
          )}
        </div>

        {/* Search Bar */}
        <div className="mb-4">
          <input
            type="text"
            placeholder="Search employees..."
            value={searchTerm}
            onChange={handleSearchChange}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          {debouncedSearch !== searchTerm && (
            <span className="text-sm text-gray-500 ml-2">Searching...</span>
          )}
        </div>

        {/* Loading State */}
        {isLoading && (
          <div className="text-center py-8">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            <p className="mt-2 text-gray-600">Loading employees...</p>
          </div>
        )}

        {/* Error State */}
        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
            Error: {error.message}
          </div>
        )}

        {/* Pagination Info */}
        {pagination && !isLoading && (
          <div className="mb-4 text-sm text-gray-600">
            Showing {(pagination.page - 1) * pagination.limit + 1} to{" "}
            {Math.min(pagination.page * pagination.limit, pagination.total)} of{" "}
            {pagination.total} employees
          </div>
        )}

        {/* Employees Table */}
        {!isLoading && !error && employees.length > 0 && (
          <div className="overflow-x-auto">
            <table className="min-w-full bg-white border border-gray-300">
              <thead className="bg-gray-100">
                <tr>
                  <th className="px-4 py-2 border-b text-left">E-Number</th>
                  <th className="px-4 py-2 border-b text-left">Badge</th>
                  <th className="px-4 py-2 border-b text-left">Name</th>
                  <th className="px-4 py-2 border-b text-left">Email</th>
                  <th className="px-4 py-2 border-b text-left">Actions</th>
                </tr>
              </thead>
              <tbody>
                {employees.map((employee) => (
                  <tr key={employee.enumber} className="hover:bg-gray-50">
                    <td className="px-4 py-2 border-b">{employee.enumber}</td>
                    <td className="px-4 py-2 border-b">
                      {employee.badge || "-"}
                    </td>
                    <td className="px-4 py-2 border-b">
                      {getFullName(employee)}
                    </td>
                    <td className="px-4 py-2 border-b">
                      {employee.email || "-"}
                    </td>
                    <td className="px-4 py-2 border-b space-x-2">
                      <Link
                        href={`/dashboard/employees/${employee.enumber}`}
                        className="text-blue-600 hover:underline"
                      >
                        View
                      </Link>
                      {canEdit && (
                        <Link
                          href={`/dashboard/employees/${employee.enumber}/edit`}
                          className="text-green-600 hover:underline"
                        >
                          Edit
                        </Link>
                      )}
                      {canDelete && (
                        <button
                          onClick={() => handleDelete(employee.enumber)}
                          className="text-red-600 hover:underline"
                        >
                          Delete
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Empty State */}
        {!isLoading && !error && employees.length === 0 && (
          <div className="text-center py-8 text-gray-600">
            No employees found.
          </div>
        )}

        {/* Pagination Controls */}
        {pagination && pagination.totalPages > 1 && (
          <div className="mt-6 flex justify-center items-center space-x-2">
            <button
              onClick={() => handlePageChange(1)}
              disabled={pagination.page === 1}
              className="px-3 py-1 border rounded disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-100"
            >
              First
            </button>
            <button
              onClick={() => handlePageChange(pagination.page - 1)}
              disabled={pagination.page === 1}
              className="px-3 py-1 border rounded disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-100"
            >
              Previous
            </button>

            {/* Page Numbers */}
            <div className="flex space-x-1">
              {Array.from(
                { length: Math.min(5, pagination.totalPages) },
                (_, i) => {
                  let pageNum;
                  if (pagination.totalPages <= 5) {
                    pageNum = i + 1;
                  } else if (pagination.page <= 3) {
                    pageNum = i + 1;
                  } else if (pagination.page >= pagination.totalPages - 2) {
                    pageNum = pagination.totalPages - 4 + i;
                  } else {
                    pageNum = pagination.page - 2 + i;
                  }

                  return (
                    <button
                      key={pageNum}
                      onClick={() => handlePageChange(pageNum)}
                      className={`px-3 py-1 border rounded ${
                        pagination.page === pageNum
                          ? "bg-blue-600 text-white"
                          : "hover:bg-gray-100"
                      }`}
                    >
                      {pageNum}
                    </button>
                  );
                },
              )}
            </div>

            <button
              onClick={() => handlePageChange(pagination.page + 1)}
              disabled={pagination.page === pagination.totalPages}
              className="px-3 py-1 border rounded disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-100"
            >
              Next
            </button>
            <button
              onClick={() => handlePageChange(pagination.totalPages)}
              disabled={pagination.page === pagination.totalPages}
              className="px-3 py-1 border rounded disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-100"
            >
              Last
            </button>
          </div>
        )}
      </div>
    </ProtectedRoute>
  );
}
