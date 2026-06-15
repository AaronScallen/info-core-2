"use client";

import { ProtectedRoute } from "@/components/protected-route";
import { getAuthHeaders } from "@/lib/auth";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";

interface EmployeeDirectory {
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

interface EmployeeDetail extends EmployeeDirectory {
  pid: number | null;
  dob: string | null;
  photoUrl?: string | null;
}

interface PaginatedEmployeesResponse {
  data: EmployeeDirectory[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

interface AssignmentRecord {
  assignmentId: number;
  assnId: number;
  locationName: string | null;
}

interface VehicleRecord {
  vehId: number;
  unitNumber: number | null;
  color: string | null;
  year: number | null;
  make: string | null;
  model: string | null;
  decals: boolean | null;
  vin: string | null;
  lpNumber: string | null;
  assignedToBadge?: number | null;
}

interface AbsenceRecord {
  absenceId: number;
  enumber: number | null;
  assignment: string | null;
  coveringEmpId: number | null;
  dateOfEntry: string | null;
  notes: string | null;
}

interface BodycamRecord {
  bwcId: number;
  device: string | null;
  locator: string | null;
  model: string | null;
  wifiMacAddress: string | null;
  assignedToBadge?: number | null;
}

interface CellPhoneRecord {
  phoneId: number;
  idShort: number | null;
  phoneNum: string | null;
  make: string | null;
  model: string | null;
  assignedToBadge?: number | null;
}

interface DetailRow {
  field: string;
  value: string;
}

interface EmployeeDetailReport {
  title: string;
  subtitle: string;
  photoUrl: string | null;
  rows: DetailRow[];
}

interface ReportColumn<T> {
  label: string;
  value: (row: T) => string;
}

interface ReportCardProps {
  title: string;
  description: string;
  filterValue: string;
  onFilterChange: (value: string) => void;
  filterPlaceholder: string;
  totalCount: number;
  matchCount: number;
  onExport: () => Promise<void>;
  onPrint: () => Promise<void>;
  isBusy: boolean;
  disabled: boolean;
}

interface FiltersState {
  employees: string;
  assignments: string;
  vehicles: string;
  absences: string;
  detail: string;
}

const REPORT_PAGE_SIZE = 100;

const EMPLOYEE_COLUMNS: ReportColumn<EmployeeDirectory>[] = [
  { label: "E-Number", value: (row) => formatValue(row.enumber) },
  { label: "Badge", value: (row) => formatValue(row.badge) },
  { label: "Position #", value: (row) => formatValue(row.positionNumber) },
  { label: "First Name", value: (row) => formatValue(row.firstName) },
  { label: "Last Name", value: (row) => formatValue(row.lastName) },
  { label: "Email", value: (row) => formatValue(row.email) },
  { label: "Assignment ID", value: (row) => formatValue(row.assignmentId) },
  { label: "BWC ID", value: (row) => formatValue(row.bwcId) },
  { label: "Vehicle ID", value: (row) => formatValue(row.vehId) },
  { label: "Cell Phone ID", value: (row) => formatValue(row.cellphoneId) },
];

const ASSIGNMENT_COLUMNS: ReportColumn<AssignmentRecord>[] = [
  { label: "Record ID", value: (row) => formatValue(row.assignmentId) },
  { label: "Assignment #", value: (row) => formatValue(row.assnId) },
  { label: "Location", value: (row) => formatValue(row.locationName) },
];

const VEHICLE_COLUMNS: ReportColumn<VehicleRecord>[] = [
  { label: "Vehicle ID", value: (row) => formatValue(row.vehId) },
  { label: "Unit #", value: (row) => formatValue(row.unitNumber) },
  { label: "Year", value: (row) => formatValue(row.year) },
  { label: "Make", value: (row) => formatValue(row.make) },
  { label: "Model", value: (row) => formatValue(row.model) },
  { label: "Color", value: (row) => formatValue(row.color) },
  { label: "Decals", value: (row) => formatValue(row.decals) },
  { label: "VIN", value: (row) => formatValue(row.vin) },
  { label: "LP #", value: (row) => formatValue(row.lpNumber) },
  { label: "Assigned Badge", value: (row) => formatValue(row.assignedToBadge) },
];

const ABSENCE_COLUMNS: ReportColumn<AbsenceRecord>[] = [
  { label: "Absence ID", value: (row) => formatValue(row.absenceId) },
  { label: "Employee #", value: (row) => formatValue(row.enumber) },
  { label: "Assignment", value: (row) => formatValue(row.assignment) },
  {
    label: "Covering Employee #",
    value: (row) => formatValue(row.coveringEmpId),
  },
  { label: "Date Entered", value: (row) => formatDate(row.dateOfEntry) },
  { label: "Notes", value: (row) => formatValue(row.notes) },
];

const DETAIL_COLUMNS: ReportColumn<DetailRow>[] = [
  { label: "Field", value: (row) => row.field },
  { label: "Value", value: (row) => row.value },
];

function formatValue(value: unknown): string {
  if (value === null || value === undefined || value === "") {
    return "-";
  }

  if (typeof value === "boolean") {
    return value ? "Yes" : "No";
  }

  return String(value);
}

function formatDate(value: string | null | undefined): string {
  if (!value) {
    return "-";
  }

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return date.toLocaleDateString();
}

function formatDateTime(value: Date): string {
  return value.toLocaleString();
}

function escapeHtml(value: string): string {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}

function escapeCsv(value: string): string {
  return `"${value.replaceAll('"', '""')}"`;
}

function normalizeText(value: string): string {
  return value
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[^a-z0-9\s]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function tokenize(value: string): string[] {
  return normalizeText(value).split(" ").filter(Boolean);
}

function soundex(value: string): string {
  const normalized = value.toUpperCase().replace(/[^A-Z]/g, "");
  if (!normalized) {
    return "";
  }

  const mapping: Record<string, string> = {
    B: "1",
    F: "1",
    P: "1",
    V: "1",
    C: "2",
    G: "2",
    J: "2",
    K: "2",
    Q: "2",
    S: "2",
    X: "2",
    Z: "2",
    D: "3",
    T: "3",
    L: "4",
    M: "5",
    N: "5",
    R: "6",
  };

  const firstLetter = normalized[0];
  const digits: string[] = [];
  let previous = mapping[firstLetter] ?? "";

  for (const character of normalized.slice(1)) {
    const code = mapping[character] ?? "";
    if (code && code !== previous) {
      digits.push(code);
    }
    previous = code;
  }

  return `${firstLetter}${digits.join("")}`.padEnd(4, "0").slice(0, 4);
}

function matchesPhoneticFilter(values: unknown[], query: string): boolean {
  const queryTokens = tokenize(query);
  if (queryTokens.length === 0) {
    return true;
  }

  const joined = values.map((value) => formatValue(value)).join(" ");
  const normalized = normalizeText(joined);
  const tokens = tokenize(joined);
  const codes = new Set(
    tokens.filter((token) => /[a-z]/.test(token)).map(soundex),
  );

  return queryTokens.every((token) => {
    if (normalized.includes(token)) {
      return true;
    }

    if (/^\d+$/.test(token)) {
      return tokens.some((candidate) => candidate.includes(token));
    }

    const code = soundex(token);
    if (code && codes.has(code)) {
      return true;
    }

    return tokens.some(
      (candidate) => candidate.startsWith(token) || token.startsWith(candidate),
    );
  });
}

function getEmployeeName(employee: EmployeeDirectory | EmployeeDetail): string {
  const parts = [employee.firstName, employee.lastName].filter(Boolean);
  return parts.length > 0 ? parts.join(" ") : "Unnamed Employee";
}

function downloadCsv<T>(
  rows: T[],
  columns: ReportColumn<T>[],
  filename: string,
): void {
  const csvRows = [
    columns.map((column) => escapeCsv(column.label)).join(","),
    ...rows.map((row) =>
      columns.map((column) => escapeCsv(column.value(row))).join(","),
    ),
  ];

  const blob = new Blob([csvRows.join("\r\n")], {
    type: "text/csv;charset=utf-8;",
  });
  const url = window.URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  window.URL.revokeObjectURL(url);
}

function openTablePrintWindow<T>(
  title: string,
  subtitle: string,
  rows: T[],
  columns: ReportColumn<T>[],
): void {
  const reportWindow = window.open("", "_blank", "noopener,noreferrer");
  if (!reportWindow) {
    throw new Error(
      "Unable to open print preview. Allow pop-ups and try again.",
    );
  }

  const headerMarkup = columns
    .map((column) => `<th>${escapeHtml(column.label)}</th>`)
    .join("");
  const bodyMarkup = rows
    .map(
      (row) => `
        <tr>
          ${columns
            .map((column) => `<td>${escapeHtml(column.value(row))}</td>`)
            .join("")}
        </tr>`,
    )
    .join("");

  reportWindow.document.write(`
    <!doctype html>
    <html lang="en">
      <head>
        <meta charset="utf-8" />
        <title>${escapeHtml(title)}</title>
        <style>
          body { font-family: "Segoe UI", Arial, sans-serif; margin: 24px; color: #111827; }
          h1 { margin: 0 0 8px; font-size: 24px; }
          p { margin: 0 0 16px; color: #4b5563; }
          table { width: 100%; border-collapse: collapse; font-size: 12px; }
          th, td { border: 1px solid #d1d5db; padding: 8px; text-align: left; vertical-align: top; }
          th { background: #f3f4f6; }
          @media print { body { margin: 12px; } }
        </style>
      </head>
      <body>
        <h1>${escapeHtml(title)}</h1>
        <p>${escapeHtml(subtitle)}</p>
        <table>
          <thead><tr>${headerMarkup}</tr></thead>
          <tbody>${bodyMarkup}</tbody>
        </table>
      </body>
    </html>
  `);

  reportWindow.document.close();
  reportWindow.focus();
  reportWindow.print();
}

function openDetailPrintWindow(report: EmployeeDetailReport): void {
  const reportWindow = window.open("", "_blank", "noopener,noreferrer");
  if (!reportWindow) {
    throw new Error(
      "Unable to open print preview. Allow pop-ups and try again.",
    );
  }

  const photoMarkup = report.photoUrl
    ? `<div class="photo"><img src="${escapeHtml(report.photoUrl)}" alt="Employee photo" /></div>`
    : "";
  const rowMarkup = report.rows
    .map(
      (row) => `
        <tr>
          <th>${escapeHtml(row.field)}</th>
          <td>${escapeHtml(row.value)}</td>
        </tr>`,
    )
    .join("");

  reportWindow.document.write(`
    <!doctype html>
    <html lang="en">
      <head>
        <meta charset="utf-8" />
        <title>${escapeHtml(report.title)}</title>
        <style>
          body { font-family: "Segoe UI", Arial, sans-serif; margin: 24px; color: #111827; }
          .header { display: flex; justify-content: space-between; gap: 24px; align-items: flex-start; margin-bottom: 16px; }
          h1 { margin: 0 0 8px; font-size: 24px; }
          p { margin: 0; color: #4b5563; }
          table { width: 100%; border-collapse: collapse; margin-top: 16px; }
          th, td { border: 1px solid #d1d5db; padding: 10px; text-align: left; vertical-align: top; }
          th { width: 30%; background: #f3f4f6; }
          .photo img { max-width: 180px; max-height: 180px; object-fit: cover; border-radius: 12px; border: 1px solid #d1d5db; }
          @media print { body { margin: 12px; } }
        </style>
      </head>
      <body>
        <div class="header">
          <div>
            <h1>${escapeHtml(report.title)}</h1>
            <p>${escapeHtml(report.subtitle)}</p>
          </div>
          ${photoMarkup}
        </div>
        <table><tbody>${rowMarkup}</tbody></table>
      </body>
    </html>
  `);

  reportWindow.document.close();
  reportWindow.focus();
  reportWindow.print();
}

function ReportCard({
  title,
  description,
  filterValue,
  onFilterChange,
  filterPlaceholder,
  totalCount,
  matchCount,
  onExport,
  onPrint,
  isBusy,
  disabled,
}: ReportCardProps) {
  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-700 dark:bg-slate-800">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div>
          <h2 className="text-2xl font-semibold text-slate-900 dark:text-white">
            {title}
          </h2>
          <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">
            {description}
          </p>
        </div>
        <div className="rounded-xl bg-slate-50 px-4 py-3 text-sm text-slate-600 dark:bg-slate-900/50 dark:text-slate-300">
          {matchCount} matching record(s) of {totalCount} loaded.
          <br />
          Phonetic matching is enabled.
        </div>
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-[minmax(0,1fr)_auto] lg:items-end">
        <label className="block">
          <span className="mb-2 block text-sm font-medium text-slate-700 dark:text-slate-200">
            Filter report contents
          </span>
          <input
            type="text"
            value={filterValue}
            onChange={(event) => onFilterChange(event.target.value)}
            placeholder={filterPlaceholder}
            className="w-full rounded-md border border-gray-300 bg-white px-4 py-2 text-gray-900 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:cursor-not-allowed disabled:opacity-60 dark:border-gray-600 dark:bg-gray-800 dark:text-white"
            disabled={disabled}
          />
        </label>

        <div className="flex flex-col gap-3 sm:flex-row">
          <button
            type="button"
            onClick={() => {
              void onExport();
            }}
            disabled={disabled || isBusy}
            className="rounded-md border border-emerald-600 px-4 py-2 text-sm font-semibold text-emerald-700 shadow-sm hover:bg-emerald-50 transition-colors disabled:cursor-not-allowed disabled:opacity-60 dark:border-emerald-500 dark:text-emerald-300 dark:hover:bg-emerald-900/20"
          >
            {isBusy ? "Preparing..." : "Export CSV"}
          </button>
          <button
            type="button"
            onClick={() => {
              void onPrint();
            }}
            disabled={disabled || isBusy}
            className="rounded-md border border-slate-600 px-4 py-2 text-sm font-semibold text-slate-700 shadow-sm hover:bg-slate-50 transition-colors disabled:cursor-not-allowed disabled:opacity-60 dark:border-slate-500 dark:text-slate-300 dark:hover:bg-slate-900/20"
          >
            {isBusy ? "Preparing..." : "Print / Save PDF"}
          </button>
        </div>
      </div>
    </section>
  );
}

async function fetchJson<T>(url: string): Promise<T> {
  const response = await fetch(url, { headers: getAuthHeaders() });
  if (!response.ok) {
    throw new Error(`Failed to fetch ${url}`);
  }
  return (await response.json()) as T;
}

async function fetchAllEmployees(): Promise<EmployeeDirectory[]> {
  const firstPage = await fetchJson<PaginatedEmployeesResponse>(
    `http://localhost:3001/api/employees?page=1&limit=${REPORT_PAGE_SIZE}`,
  );
  const records = [...firstPage.data];

  for (let page = 2; page <= firstPage.pagination.totalPages; page += 1) {
    const nextPage = await fetchJson<PaginatedEmployeesResponse>(
      `http://localhost:3001/api/employees?page=${page}&limit=${REPORT_PAGE_SIZE}`,
    );
    records.push(...nextPage.data);
  }

  return records;
}

export default function ReportsPage() {
  const [employees, setEmployees] = useState<EmployeeDirectory[]>([]);
  const [assignments, setAssignments] = useState<AssignmentRecord[]>([]);
  const [vehicles, setVehicles] = useState<VehicleRecord[]>([]);
  const [absences, setAbsences] = useState<AbsenceRecord[]>([]);
  const [bodycams, setBodycams] = useState<BodycamRecord[]>([]);
  const [cellPhones, setCellPhones] = useState<CellPhoneRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingError, setLoadingError] = useState<string | null>(null);
  const [busyReport, setBusyReport] = useState<string | null>(null);
  const [selectedEmployeeId, setSelectedEmployeeId] = useState<number | null>(
    null,
  );
  const [filters, setFilters] = useState<FiltersState>({
    employees: "",
    assignments: "",
    vehicles: "",
    absences: "",
    detail: "",
  });

  useEffect(() => {
    let active = true;

    const loadData = async () => {
      try {
        setLoading(true);
        setLoadingError(null);

        const [
          employeeData,
          assignmentData,
          vehicleData,
          absenceData,
          bodycamData,
          cellPhoneData,
        ] = await Promise.all([
          fetchAllEmployees(),
          fetchJson<AssignmentRecord[]>(
            "http://localhost:3001/api/assignments",
          ),
          fetchJson<VehicleRecord[]>("http://localhost:3001/api/vehicles"),
          fetchJson<AbsenceRecord[]>("http://localhost:3001/api/absences"),
          fetchJson<BodycamRecord[]>("http://localhost:3001/api/bodycams"),
          fetchJson<CellPhoneRecord[]>("http://localhost:3001/api/cellphones"),
        ]);

        if (!active) {
          return;
        }

        setEmployees(employeeData);
        setAssignments(assignmentData);
        setVehicles(vehicleData);
        setAbsences(absenceData);
        setBodycams(bodycamData);
        setCellPhones(cellPhoneData);
      } catch (error) {
        if (!active) {
          return;
        }

        setLoadingError(
          error instanceof Error ? error.message : "Failed to load reports.",
        );
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    };

    void loadData();

    return () => {
      active = false;
    };
  }, []);

  const updateFilter = (key: keyof FiltersState, value: string): void => {
    setFilters((current) => ({ ...current, [key]: value }));
    if (key === "detail") {
      setSelectedEmployeeId(null);
    }
  };

  const filteredEmployees = useMemo(
    () =>
      employees.filter((employee) =>
        matchesPhoneticFilter(
          [
            employee.enumber,
            employee.badge,
            employee.positionNumber,
            employee.firstName,
            employee.lastName,
            employee.email,
            employee.assignmentId,
            employee.bwcId,
            employee.vehId,
            employee.cellphoneId,
          ],
          filters.employees,
        ),
      ),
    [employees, filters.employees],
  );

  const filteredAssignments = useMemo(
    () =>
      assignments.filter((assignment) =>
        matchesPhoneticFilter(
          [assignment.assignmentId, assignment.assnId, assignment.locationName],
          filters.assignments,
        ),
      ),
    [assignments, filters.assignments],
  );

  const filteredVehicles = useMemo(
    () =>
      vehicles.filter((vehicle) =>
        matchesPhoneticFilter(
          [
            vehicle.vehId,
            vehicle.unitNumber,
            vehicle.color,
            vehicle.year,
            vehicle.make,
            vehicle.model,
            vehicle.decals,
            vehicle.vin,
            vehicle.lpNumber,
            vehicle.assignedToBadge,
          ],
          filters.vehicles,
        ),
      ),
    [vehicles, filters.vehicles],
  );

  const filteredAbsences = useMemo(
    () =>
      absences.filter((absence) =>
        matchesPhoneticFilter(
          [
            absence.absenceId,
            absence.enumber,
            absence.assignment,
            absence.coveringEmpId,
            absence.dateOfEntry,
            absence.notes,
          ],
          filters.absences,
        ),
      ),
    [absences, filters.absences],
  );

  const detailMatches = useMemo(
    () =>
      employees
        .filter((employee) =>
          matchesPhoneticFilter(
            [
              employee.enumber,
              employee.badge,
              employee.firstName,
              employee.lastName,
              employee.email,
            ],
            filters.detail,
          ),
        )
        .slice(0, 8),
    [employees, filters.detail],
  );

  const selectedEmployee = employees.find(
    (employee) => employee.enumber === selectedEmployeeId,
  );

  const runReportAction = async (
    key: string,
    action: () => Promise<void>,
  ): Promise<void> => {
    try {
      setBusyReport(key);
      await action();
    } catch (error) {
      alert(
        error instanceof Error ? error.message : "Failed to prepare report.",
      );
    } finally {
      setBusyReport(null);
    }
  };

  const exportEmployees = async (): Promise<void> => {
    if (filteredEmployees.length === 0) {
      throw new Error("No employees match the current filter.");
    }

    downloadCsv(
      filteredEmployees,
      EMPLOYEE_COLUMNS,
      `employees-report${filters.employees.trim() ? "-filtered" : ""}.csv`,
    );
  };

  const printEmployees = async (): Promise<void> => {
    if (filteredEmployees.length === 0) {
      throw new Error("No employees match the current filter.");
    }

    openTablePrintWindow(
      "Employee Directory Report",
      `Generated ${formatDateTime(new Date())} | ${filteredEmployees.length} employee(s)${filters.employees.trim() ? ` | Filter: ${filters.employees.trim()}` : ""}`,
      filteredEmployees,
      EMPLOYEE_COLUMNS,
    );
  };

  const exportAssignments = async (): Promise<void> => {
    if (filteredAssignments.length === 0) {
      throw new Error("No assignments match the current filter.");
    }

    downloadCsv(
      filteredAssignments,
      ASSIGNMENT_COLUMNS,
      `assignments-report${filters.assignments.trim() ? "-filtered" : ""}.csv`,
    );
  };

  const printAssignments = async (): Promise<void> => {
    if (filteredAssignments.length === 0) {
      throw new Error("No assignments match the current filter.");
    }

    openTablePrintWindow(
      "Assignments Report",
      `Generated ${formatDateTime(new Date())} | ${filteredAssignments.length} assignment(s)${filters.assignments.trim() ? ` | Filter: ${filters.assignments.trim()}` : ""}`,
      filteredAssignments,
      ASSIGNMENT_COLUMNS,
    );
  };

  const exportVehicles = async (): Promise<void> => {
    if (filteredVehicles.length === 0) {
      throw new Error("No vehicles match the current filter.");
    }

    downloadCsv(
      filteredVehicles,
      VEHICLE_COLUMNS,
      `vehicles-report${filters.vehicles.trim() ? "-filtered" : ""}.csv`,
    );
  };

  const printVehicles = async (): Promise<void> => {
    if (filteredVehicles.length === 0) {
      throw new Error("No vehicles match the current filter.");
    }

    openTablePrintWindow(
      "Vehicle Fleet Report",
      `Generated ${formatDateTime(new Date())} | ${filteredVehicles.length} vehicle(s)${filters.vehicles.trim() ? ` | Filter: ${filters.vehicles.trim()}` : ""}`,
      filteredVehicles,
      VEHICLE_COLUMNS,
    );
  };

  const exportAbsences = async (): Promise<void> => {
    if (filteredAbsences.length === 0) {
      throw new Error("No absences match the current filter.");
    }

    downloadCsv(
      filteredAbsences,
      ABSENCE_COLUMNS,
      `absences-report${filters.absences.trim() ? "-filtered" : ""}.csv`,
    );
  };

  const printAbsences = async (): Promise<void> => {
    if (filteredAbsences.length === 0) {
      throw new Error("No absences match the current filter.");
    }

    openTablePrintWindow(
      "Absences Report",
      `Generated ${formatDateTime(new Date())} | ${filteredAbsences.length} absence record(s)${filters.absences.trim() ? ` | Filter: ${filters.absences.trim()}` : ""}`,
      filteredAbsences,
      ABSENCE_COLUMNS,
    );
  };

  const resolveEmployeeId = (): number | null => {
    if (selectedEmployeeId) {
      return selectedEmployeeId;
    }
    if (detailMatches.length === 1) {
      return detailMatches[0]?.enumber ?? null;
    }
    return null;
  };

  const buildDetailReport = async (
    enumber: number,
  ): Promise<EmployeeDetailReport> => {
    const employee = await fetchJson<EmployeeDetail>(
      `http://localhost:3001/api/employees/${enumber}`,
    );
    const assignment = assignments.find(
      (item) => item.assignmentId === employee.assignmentId,
    );
    const vehicle = vehicles.find((item) => item.vehId === employee.vehId);
    const bodycam = bodycams.find((item) => item.bwcId === employee.bwcId);
    const cellPhone = cellPhones.find(
      (item) => item.phoneId === employee.cellphoneId,
    );

    return {
      title: `${getEmployeeName(employee)} Detailed Employee Report`,
      subtitle: `Generated ${formatDateTime(new Date())} | Employee #${employee.enumber}`,
      photoUrl: employee.photoUrl ?? null,
      rows: [
        { field: "Employee Number", value: formatValue(employee.enumber) },
        { field: "Badge", value: formatValue(employee.badge) },
        {
          field: "Position Number",
          value: formatValue(employee.positionNumber),
        },
        { field: "PID", value: formatValue(employee.pid) },
        { field: "First Name", value: formatValue(employee.firstName) },
        { field: "Last Name", value: formatValue(employee.lastName) },
        { field: "Full Name", value: getEmployeeName(employee) },
        { field: "Date of Birth", value: formatDate(employee.dob) },
        { field: "Email", value: formatValue(employee.email) },
        {
          field: "Assignment",
          value: assignment
            ? `${formatValue(assignment.locationName)} (${formatValue(assignment.assnId)})`
            : formatValue(employee.assignmentId),
        },
        {
          field: "Vehicle",
          value: vehicle
            ? `${formatValue(vehicle.unitNumber)} | ${formatValue(vehicle.year)} | ${formatValue(vehicle.make)} ${formatValue(vehicle.model)}`
            : formatValue(employee.vehId),
        },
        {
          field: "Body Camera",
          value: bodycam
            ? `${formatValue(bodycam.device)} | ${formatValue(bodycam.model)} | ${formatValue(bodycam.locator)}`
            : formatValue(employee.bwcId),
        },
        {
          field: "Cell Phone",
          value: cellPhone
            ? `${formatValue(cellPhone.idShort)} | ${formatValue(cellPhone.phoneNum)} | ${formatValue(cellPhone.make)} ${formatValue(cellPhone.model)}`
            : formatValue(employee.cellphoneId),
        },
      ],
    };
  };

  const exportDetail = async (): Promise<void> => {
    const enumber = resolveEmployeeId();
    if (!enumber) {
      throw new Error(
        "Select one employee match before exporting the detail report.",
      );
    }

    const report = await buildDetailReport(enumber);
    downloadCsv(
      report.rows,
      DETAIL_COLUMNS,
      `employee-${enumber}-detail-report.csv`,
    );
  };

  const printDetail = async (): Promise<void> => {
    const enumber = resolveEmployeeId();
    if (!enumber) {
      throw new Error(
        "Select one employee match before printing the detail report.",
      );
    }

    const report = await buildDetailReport(enumber);
    openDetailPrintWindow(report);
  };

  return (
    <ProtectedRoute requiredRole="command_staff">
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        <header className="bg-white dark:bg-gray-800 shadow">
          <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                  Reports
                </h1>
                <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
                  Command Staff reporting for employees, assignments, vehicles,
                  absences, and individual employee detail packets.
                </p>
              </div>
              <div className="flex items-center gap-4">
                <Link
                  href="/dashboard"
                  className="rounded-md bg-gray-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-gray-700 transition-colors"
                >
                  Back to Dashboard
                </Link>
                <Link
                  href="/dashboard/employees"
                  className="rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-semibold text-gray-700 shadow-sm hover:bg-gray-50 transition-colors dark:border-gray-600 dark:bg-gray-800 dark:text-gray-200 dark:hover:bg-gray-700"
                >
                  View Employees
                </Link>
              </div>
            </div>
          </div>
        </header>

        <main className="mx-auto max-w-7xl space-y-8 px-4 py-8 sm:px-6 lg:px-8">
          <section className="rounded-2xl border border-emerald-200 bg-emerald-50/80 p-6 text-sm text-emerald-900 shadow-sm dark:border-emerald-900/60 dark:bg-emerald-950/20 dark:text-emerald-100">
            Phonetic filtering is enabled across report inputs. Similar-sounding
            names such as Smith and Smyth will match even when the spelling
            differs.
          </section>

          {loadingError && (
            <section className="rounded-2xl border border-red-200 bg-red-50 p-6 text-sm text-red-800 shadow-sm dark:border-red-900/60 dark:bg-red-950/20 dark:text-red-200">
              {loadingError}
            </section>
          )}

          {loading && !loadingError && (
            <section className="rounded-2xl border border-slate-200 bg-white p-6 text-sm text-slate-600 shadow-sm dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300">
              Loading report datasets...
            </section>
          )}

          <ReportCard
            title="Employee Directory Report"
            description="Export or print the employee directory with phonetic filtering across names, emails, employee numbers, and assigned resource IDs."
            filterValue={filters.employees}
            onFilterChange={(value) => updateFilter("employees", value)}
            filterPlaceholder="Search by employee number, name, email, or assigned IDs..."
            totalCount={employees.length}
            matchCount={filteredEmployees.length}
            onExport={() => runReportAction("employees", exportEmployees)}
            onPrint={() => runReportAction("employees", printEmployees)}
            isBusy={busyReport === "employees"}
            disabled={loading || Boolean(loadingError)}
          />

          <div className="grid gap-8 xl:grid-cols-2">
            <ReportCard
              title="Assignments Report"
              description="Report assignment records with location details and assignment numbers."
              filterValue={filters.assignments}
              onFilterChange={(value) => updateFilter("assignments", value)}
              filterPlaceholder="Search by assignment number or location name..."
              totalCount={assignments.length}
              matchCount={filteredAssignments.length}
              onExport={() => runReportAction("assignments", exportAssignments)}
              onPrint={() => runReportAction("assignments", printAssignments)}
              isBusy={busyReport === "assignments"}
              disabled={loading || Boolean(loadingError)}
            />

            <ReportCard
              title="Vehicle Fleet Report"
              description="Report vehicle inventory, identifiers, and current assigned badge numbers."
              filterValue={filters.vehicles}
              onFilterChange={(value) => updateFilter("vehicles", value)}
              filterPlaceholder="Search by unit, make, model, VIN, plate, or assigned badge..."
              totalCount={vehicles.length}
              matchCount={filteredVehicles.length}
              onExport={() => runReportAction("vehicles", exportVehicles)}
              onPrint={() => runReportAction("vehicles", printVehicles)}
              isBusy={busyReport === "vehicles"}
              disabled={loading || Boolean(loadingError)}
            />
          </div>

          <ReportCard
            title="Absences Report"
            description="Report absence entries, covering employees, dates entered, and notes for staffing review."
            filterValue={filters.absences}
            onFilterChange={(value) => updateFilter("absences", value)}
            filterPlaceholder="Search by employee number, assignment, notes, or covering employee..."
            totalCount={absences.length}
            matchCount={filteredAbsences.length}
            onExport={() => runReportAction("absences", exportAbsences)}
            onPrint={() => runReportAction("absences", printAbsences)}
            isBusy={busyReport === "absences"}
            disabled={loading || Boolean(loadingError)}
          />

          <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-700 dark:bg-slate-800">
            <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
              <div>
                <h2 className="text-2xl font-semibold text-slate-900 dark:text-white">
                  Individual Employee Detail Report
                </h2>
                <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">
                  Generate a detailed report for one employee with profile,
                  assignment, vehicle, body camera, and cell phone context.
                </p>
              </div>
              <div className="rounded-xl bg-slate-50 px-4 py-3 text-sm text-slate-600 dark:bg-slate-900/50 dark:text-slate-300">
                {detailMatches.length} similar match(es) found.
                <br />
                {selectedEmployee
                  ? `Selected: ${getEmployeeName(selectedEmployee)} (#${selectedEmployee.enumber})`
                  : "Select one employee to enable the detail report."}
              </div>
            </div>

            <div className="mt-6 grid gap-6 lg:grid-cols-[minmax(0,1fr)_auto] lg:items-end">
              <label className="block">
                <span className="mb-2 block text-sm font-medium text-slate-700 dark:text-slate-200">
                  Find an employee
                </span>
                <input
                  type="text"
                  value={filters.detail}
                  onChange={(event) =>
                    updateFilter("detail", event.target.value)
                  }
                  placeholder="Type a name, badge, email, or employee number. Similar sounding names will match."
                  className="w-full rounded-md border border-gray-300 bg-white px-4 py-2 text-gray-900 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:cursor-not-allowed disabled:opacity-60 dark:border-gray-600 dark:bg-gray-800 dark:text-white"
                  disabled={loading || Boolean(loadingError)}
                />
              </label>

              <div className="flex flex-col gap-3 sm:flex-row">
                <button
                  type="button"
                  onClick={() => {
                    void runReportAction("detail", exportDetail);
                  }}
                  disabled={
                    loading || Boolean(loadingError) || busyReport === "detail"
                  }
                  className="rounded-md border border-emerald-600 px-4 py-2 text-sm font-semibold text-emerald-700 shadow-sm hover:bg-emerald-50 transition-colors disabled:cursor-not-allowed disabled:opacity-60 dark:border-emerald-500 dark:text-emerald-300 dark:hover:bg-emerald-900/20"
                >
                  {busyReport === "detail"
                    ? "Preparing..."
                    : "Export Detail CSV"}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    void runReportAction("detail", printDetail);
                  }}
                  disabled={
                    loading || Boolean(loadingError) || busyReport === "detail"
                  }
                  className="rounded-md border border-slate-600 px-4 py-2 text-sm font-semibold text-slate-700 shadow-sm hover:bg-slate-50 transition-colors disabled:cursor-not-allowed disabled:opacity-60 dark:border-slate-500 dark:text-slate-300 dark:hover:bg-slate-900/20"
                >
                  {busyReport === "detail"
                    ? "Preparing..."
                    : "Print / Save Detail PDF"}
                </button>
              </div>
            </div>

            <div className="mt-6 rounded-2xl border border-dashed border-slate-300 p-4 dark:border-slate-600">
              {filters.detail.trim().length === 0 ? (
                <p className="text-sm text-slate-600 dark:text-slate-300">
                  Start typing to see similar-sounding employee matches.
                </p>
              ) : detailMatches.length === 0 ? (
                <p className="text-sm text-slate-600 dark:text-slate-300">
                  No employees match the current phonetic filter.
                </p>
              ) : (
                <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
                  {detailMatches.map((employee) => {
                    const isSelected = employee.enumber === selectedEmployeeId;
                    return (
                      <button
                        key={employee.enumber}
                        type="button"
                        onClick={() => setSelectedEmployeeId(employee.enumber)}
                        className={`rounded-xl border p-4 text-left transition-colors ${
                          isSelected
                            ? "border-blue-600 bg-blue-50 dark:border-blue-400 dark:bg-blue-950/30"
                            : "border-slate-200 bg-white hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-900/30 dark:hover:bg-slate-900/60"
                        }`}
                      >
                        <p className="font-semibold text-slate-900 dark:text-white">
                          {getEmployeeName(employee)}
                        </p>
                        <p className="mt-1 text-sm text-slate-600 dark:text-slate-300">
                          #{employee.enumber} | Badge{" "}
                          {formatValue(employee.badge)}
                        </p>
                        <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                          {formatValue(employee.email)}
                        </p>
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          </section>
        </main>
      </div>
    </ProtectedRoute>
  );
}
