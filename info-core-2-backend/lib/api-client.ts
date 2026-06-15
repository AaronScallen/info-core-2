// API Client for Next.js Frontend
// Copy this file to your Next.js app (e.g., lib/api-client.ts)

import type {
  User,
  Assignment,
  Bodycam,
  PoliceVehicle,
  CellPhone,
  Employee,
  Absence,
  LoginRequest,
  LoginResponse,
  RegisterRequest,
  CreateEmployeeRequest,
  UpdateEmployeeRequest,
  CreateAssignmentRequest,
  UpdateAssignmentRequest,
  CreateBodycamRequest,
  UpdateBodycamRequest,
  CreatePoliceVehicleRequest,
  UpdatePoliceVehicleRequest,
  CreateCellPhoneRequest,
  UpdateCellPhoneRequest,
  CreateAbsenceRequest,
  UpdateAbsenceRequest,
  UpdateUserRequest,
} from "../types/api-types";

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001/api";

// -----------------------------------------------------------------------------
// Helper Functions
// -----------------------------------------------------------------------------

class ApiClient {
  private baseUrl: string;

  constructor(baseUrl: string = API_BASE_URL) {
    this.baseUrl = baseUrl;
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const url = `${this.baseUrl}${endpoint}`;
    const token = this.getToken();

    const headers: Record<string, string> = {
      "Content-Type": "application/json",
      ...(options.headers as Record<string, string>),
    };

    if (token) {
      headers["Authorization"] = `Bearer ${token}`;
    }

    const response = await fetch(url, {
      ...options,
      headers,
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({
        error: "An error occurred",
      }));
      throw new Error(error.error || `HTTP ${response.status}`);
    }

    return response.json();
  }

  private getToken(): string | null {
    if (typeof window !== "undefined") {
      return localStorage.getItem("token");
    }
    return null;
  }

  setToken(token: string): void {
    if (typeof window !== "undefined") {
      localStorage.setItem("token", token);
    }
  }

  clearToken(): void {
    if (typeof window !== "undefined") {
      localStorage.removeItem("token");
    }
  }

  // -----------------------------------------------------------------------------
  // Auth
  // -----------------------------------------------------------------------------

  async register(data: RegisterRequest): Promise<User> {
    return this.request<User>("/auth/register", {
      method: "POST",
      body: JSON.stringify(data),
    });
  }

  async login(data: LoginRequest): Promise<LoginResponse> {
    const response = await this.request<LoginResponse>("/auth/login", {
      method: "POST",
      body: JSON.stringify(data),
    });
    this.setToken(response.token);
    return response;
  }

  logout(): void {
    this.clearToken();
  }

  // -----------------------------------------------------------------------------
  // Employees
  // -----------------------------------------------------------------------------

  async getEmployees(): Promise<Employee[]> {
    return this.request<Employee[]>("/employees");
  }

  async getEmployee(id: number): Promise<Employee> {
    return this.request<Employee>(`/employees/${id}`);
  }

  async createEmployee(data: CreateEmployeeRequest): Promise<Employee> {
    return this.request<Employee>("/employees", {
      method: "POST",
      body: JSON.stringify(data),
    });
  }

  async updateEmployee(
    id: number,
    data: UpdateEmployeeRequest
  ): Promise<Employee> {
    return this.request<Employee>(`/employees/${id}`, {
      method: "PUT",
      body: JSON.stringify(data),
    });
  }

  async deleteEmployee(id: number): Promise<{ message: string }> {
    return this.request<{ message: string }>(`/employees/${id}`, {
      method: "DELETE",
    });
  }

  // -----------------------------------------------------------------------------
  // Assignments
  // -----------------------------------------------------------------------------

  async getAssignments(): Promise<Assignment[]> {
    return this.request<Assignment[]>("/assignments");
  }

  async getAssignment(id: number): Promise<Assignment> {
    return this.request<Assignment>(`/assignments/${id}`);
  }

  async createAssignment(data: CreateAssignmentRequest): Promise<Assignment> {
    return this.request<Assignment>("/assignments", {
      method: "POST",
      body: JSON.stringify(data),
    });
  }

  async updateAssignment(
    id: number,
    data: UpdateAssignmentRequest
  ): Promise<Assignment> {
    return this.request<Assignment>(`/assignments/${id}`, {
      method: "PUT",
      body: JSON.stringify(data),
    });
  }

  async deleteAssignment(id: number): Promise<{ message: string }> {
    return this.request<{ message: string }>(`/assignments/${id}`, {
      method: "DELETE",
    });
  }

  // -----------------------------------------------------------------------------
  // Bodycams
  // -----------------------------------------------------------------------------

  async getBodycams(): Promise<Bodycam[]> {
    return this.request<Bodycam[]>("/bodycams");
  }

  async getBodycam(id: number): Promise<Bodycam> {
    return this.request<Bodycam>(`/bodycams/${id}`);
  }

  async createBodycam(data: CreateBodycamRequest): Promise<Bodycam> {
    return this.request<Bodycam>("/bodycams", {
      method: "POST",
      body: JSON.stringify(data),
    });
  }

  async updateBodycam(
    id: number,
    data: UpdateBodycamRequest
  ): Promise<Bodycam> {
    return this.request<Bodycam>(`/bodycams/${id}`, {
      method: "PUT",
      body: JSON.stringify(data),
    });
  }

  async deleteBodycam(id: number): Promise<{ message: string }> {
    return this.request<{ message: string }>(`/bodycams/${id}`, {
      method: "DELETE",
    });
  }

  // -----------------------------------------------------------------------------
  // Police Vehicles
  // -----------------------------------------------------------------------------

  async getVehicles(): Promise<PoliceVehicle[]> {
    return this.request<PoliceVehicle[]>("/vehicles");
  }

  async getVehicle(id: number): Promise<PoliceVehicle> {
    return this.request<PoliceVehicle>(`/vehicles/${id}`);
  }

  async createVehicle(
    data: CreatePoliceVehicleRequest
  ): Promise<PoliceVehicle> {
    return this.request<PoliceVehicle>("/vehicles", {
      method: "POST",
      body: JSON.stringify(data),
    });
  }

  async updateVehicle(
    id: number,
    data: UpdatePoliceVehicleRequest
  ): Promise<PoliceVehicle> {
    return this.request<PoliceVehicle>(`/vehicles/${id}`, {
      method: "PUT",
      body: JSON.stringify(data),
    });
  }

  async deleteVehicle(id: number): Promise<{ message: string }> {
    return this.request<{ message: string }>(`/vehicles/${id}`, {
      method: "DELETE",
    });
  }

  // -----------------------------------------------------------------------------
  // Cell Phones
  // -----------------------------------------------------------------------------

  async getCellPhones(): Promise<CellPhone[]> {
    return this.request<CellPhone[]>("/cellphones");
  }

  async getCellPhone(id: number): Promise<CellPhone> {
    return this.request<CellPhone>(`/cellphones/${id}`);
  }

  async createCellPhone(data: CreateCellPhoneRequest): Promise<CellPhone> {
    return this.request<CellPhone>("/cellphones", {
      method: "POST",
      body: JSON.stringify(data),
    });
  }

  async updateCellPhone(
    id: number,
    data: UpdateCellPhoneRequest
  ): Promise<CellPhone> {
    return this.request<CellPhone>(`/cellphones/${id}`, {
      method: "PUT",
      body: JSON.stringify(data),
    });
  }

  async deleteCellPhone(id: number): Promise<{ message: string }> {
    return this.request<{ message: string }>(`/cellphones/${id}`, {
      method: "DELETE",
    });
  }

  // -----------------------------------------------------------------------------
  // Absences
  // -----------------------------------------------------------------------------

  async getAbsences(): Promise<Absence[]> {
    return this.request<Absence[]>("/absences");
  }

  async getAbsence(id: number): Promise<Absence> {
    return this.request<Absence>(`/absences/${id}`);
  }

  async createAbsence(data: CreateAbsenceRequest): Promise<Absence> {
    return this.request<Absence>("/absences", {
      method: "POST",
      body: JSON.stringify(data),
    });
  }

  async updateAbsence(
    id: number,
    data: UpdateAbsenceRequest
  ): Promise<Absence> {
    return this.request<Absence>(`/absences/${id}`, {
      method: "PUT",
      body: JSON.stringify(data),
    });
  }

  async deleteAbsence(id: number): Promise<{ message: string }> {
    return this.request<{ message: string }>(`/absences/${id}`, {
      method: "DELETE",
    });
  }

  // -----------------------------------------------------------------------------
  // Users
  // -----------------------------------------------------------------------------

  async getUsers(): Promise<User[]> {
    return this.request<User[]>("/users");
  }

  async getUser(id: number): Promise<User> {
    return this.request<User>(`/users/${id}`);
  }

  async updateUser(id: number, data: UpdateUserRequest): Promise<User> {
    return this.request<User>(`/users/${id}`, {
      method: "PUT",
      body: JSON.stringify(data),
    });
  }

  async deleteUser(id: number): Promise<{ message: string }> {
    return this.request<{ message: string }>(`/users/${id}`, {
      method: "DELETE",
    });
  }
}

// Export a singleton instance
export const apiClient = new ApiClient();

// Export the class for custom instances
export default ApiClient;
