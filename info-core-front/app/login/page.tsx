"use client";

import { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import Image from "next/image";

const demoLogins = [
  {
    role: "command_staff",
    label: "Command Staff",
    username: "demo.command",
    password: "InfoCore123!",
  },
  {
    role: "supervisor",
    label: "Supervisor",
    username: "demo.supervisor",
    password: "InfoCore123!",
  },
  {
    role: "dispatch",
    label: "Dispatch",
    username: "demo.dispatch",
    password: "InfoCore123!",
  },
  {
    role: "officer",
    label: "Officer",
    username: "demo.officer",
    password: "InfoCore123!",
  },
] as const;

export default function LoginPage() {
  const searchParams = useSearchParams();
  const [formData, setFormData] = useState({
    username: "",
    password: "",
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");
  const isDevelopment = process.env.NODE_ENV !== "production";

  // Check for registration success message
  useEffect(() => {
    if (searchParams.get("registered") === "true") {
      setSuccessMessage("Registration successful! Please log in.");
    }
  }, [searchParams]);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    e.stopPropagation();

    setError("");
    setSuccessMessage("");

    if (!formData.username || !formData.password) {
      setError("Please enter both username and password");
      return;
    }

    setLoading(true);

    try {
      const response = await fetch("http://localhost:3001/api/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          username: formData.username,
          password: formData.password,
        }),
      });

      const responseText = await response.text();
      let data: { token?: string; role?: string; message?: string } = {};

      if (responseText) {
        try {
          data = JSON.parse(responseText) as typeof data;
        } catch {
          data = {
            message: "Authentication service returned an unexpected response",
          };
        }
      }

      if (!response.ok) {
        throw new Error(data.message || "Login failed");
      }

      // Store token and role in localStorage
      localStorage.setItem("token", data.token);
      localStorage.setItem("role", data.role);
      localStorage.setItem("username", formData.username);

      // Redirect to dashboard using window.location for immediate navigation
      window.location.href = "/dashboard";
    } catch (err) {
      setError(err instanceof Error ? err.message : "Login failed");
      setLoading(false);
    }
  };

  const fillDemoLogin = (username: string, password: string) => {
    setFormData({ username, password });
    setError("");
    setSuccessMessage("");
  };

  return (
    <div className="min-h-screen flex bg-slate-900">
      {/* Left Side - Logo */}
      <div className="hidden lg:flex lg:w-1/2 bg-linear-to-br from-blue-900 to-indigo-950 items-center justify-center p-12">
        <div className="text-center">
          <Image
            src="/6pt_InfoCore.png"
            alt="InfoCore Logo"
            width={300}
            height={300}
            className="drop-shadow-2xl mx-auto mb-8"
          />
          <h1 className="text-6xl font-bold text-white tracking-tight">
            InfoCore
          </h1>
          <p className="text-xl text-blue-200 mt-4">
            Law Enforcement Resource Management
          </p>
        </div>
      </div>

      {/* Right Side - Form */}
      <div className="flex-1 flex items-center justify-center p-8">
        <div className="w-full max-w-md">
          <div className="bg-slate-800 rounded-lg shadow-xl p-8">
            <div className="text-center mb-8">
              <h1 className="text-3xl font-bold text-white">Welcome Back</h1>
              <p className="text-slate-400 mt-2">Sign in to InfoCore</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              {successMessage && (
                <div className="bg-green-900/20 border border-green-800 text-green-400 px-4 py-3 rounded">
                  {successMessage}
                </div>
              )}

              {error && (
                <div className="bg-red-900/20 border border-red-800 text-red-400 px-4 py-3 rounded">
                  {error}
                </div>
              )}

              <div>
                <label
                  htmlFor="username"
                  className="block text-sm font-medium text-slate-300 mb-2"
                >
                  Username
                </label>
                <input
                  id="username"
                  type="text"
                  required
                  value={formData.username}
                  onChange={(e) =>
                    setFormData({ ...formData, username: e.target.value })
                  }
                  className="w-full px-4 py-2 border border-slate-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-slate-700 text-white"
                  placeholder="Enter your username"
                  autoComplete="username"
                />
              </div>

              <div>
                <label
                  htmlFor="password"
                  className="block text-sm font-medium text-slate-300 mb-2"
                >
                  Password
                </label>
                <input
                  id="password"
                  type="password"
                  required
                  value={formData.password}
                  onChange={(e) =>
                    setFormData({ ...formData, password: e.target.value })
                  }
                  className="w-full px-4 py-2 border border-slate-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-slate-700 text-white"
                  placeholder="Enter your password"
                  autoComplete="current-password"
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 rounded-lg transition duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? "Signing in..." : "Sign In"}
              </button>
            </form>

            <div className="mt-6 text-center">
              <p className="text-slate-400">
                Don&apos;t have an account?{" "}
                <Link
                  href="/register"
                  className="text-blue-400 hover:text-blue-300 font-medium"
                >
                  Register
                </Link>
              </p>
            </div>

            {isDevelopment && (
              <div className="mt-8 border-t border-slate-700 pt-6">
                <div className="mb-4">
                  <p className="text-sm font-semibold uppercase tracking-[0.2em] text-blue-300">
                    Development Logins
                  </p>
                  <p className="mt-2 text-sm text-slate-400">
                    These demo accounts use the same password and are intended
                    for local development only.
                  </p>
                </div>

                <div className="grid gap-3 sm:grid-cols-2">
                  {demoLogins.map((account) => (
                    <div
                      key={account.role}
                      className="rounded-xl border border-slate-700 bg-slate-900/60 p-4"
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <p className="text-sm font-semibold text-white">
                            {account.label}
                          </p>
                          <p className="mt-1 text-xs uppercase tracking-[0.18em] text-blue-300">
                            {account.role.replace("_", " ")}
                          </p>
                        </div>
                        <button
                          type="button"
                          onClick={() =>
                            fillDemoLogin(account.username, account.password)
                          }
                          className="rounded-full border border-blue-500/40 bg-blue-500/10 px-3 py-1 text-xs font-medium text-blue-200 transition hover:bg-blue-500/20"
                        >
                          Use
                        </button>
                      </div>

                      <dl className="mt-3 space-y-2 text-sm">
                        <div>
                          <dt className="text-slate-500">Username</dt>
                          <dd className="break-all text-slate-200">
                            {account.username}
                          </dd>
                        </div>
                        <div>
                          <dt className="text-slate-500">Password</dt>
                          <dd className="text-slate-200">{account.password}</dd>
                        </div>
                      </dl>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
