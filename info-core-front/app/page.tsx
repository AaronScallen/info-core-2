"use client";

import { useAuth } from "@/components/auth-provider";
import Link from "next/link";
import Image from "next/image";
import { useSyncExternalStore } from "react";
import { Orbitron } from "next/font/google";

const orbitron = Orbitron({ subsets: ["latin"] });

export default function Home() {
  const { user, logout } = useAuth();
  const mounted = useSyncExternalStore(
    () => () => {},
    () => true,
    () => false,
  );

  return (
    <div className="min-h-screen bg-linear-to-b from-gray-900 to-gray-950">
      {/* Hero Section */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-linear-to-b from-blue-900 to-indigo-950"></div>
        <div className="relative mx-auto max-w-7xl px-6 py-16 sm:py-20 lg:px-8">
          <div className="text-center">
            <div className="flex justify-center mb-8">
              <Image
                src="/6pt_InfoCore.png"
                alt="InfoCore Logo"
                width={200}
                height={200}
                className="drop-shadow-2xl"
              />
            </div>
            <h1
              className={`text-5xl font-bold tracking-tight text-white sm:text-7xl ${orbitron.className} relative`}
            >
              <span
                className="relative inline-block bg-linear-to-r from-white via-blue-300 to-white bg-clip-text text-transparent animate-shimmer"
                style={{ backgroundSize: "200% 100%" }}
              >
                InfoCore
              </span>
            </h1>
            <p className="mt-6 text-xl leading-8 text-blue-100">
              Developed by Cpl A. Scallen
            </p>
            <p className="mx-auto mt-4 max-w-2xl text-lg text-blue-200">
              Track personnel, equipment, and assignments in one unified
              platform.
            </p>
            <div className="mt-6 flex items-center justify-center gap-x-6">
              {!mounted ? (
                // Skeleton loader
                <div className="h-12 w-40 bg-white/20 rounded-md animate-pulse"></div>
              ) : user ? (
                <Link
                  href="/dashboard"
                  className="rounded-md bg-white px-6 py-3 text-base font-semibold text-blue-600 shadow-sm hover:bg-blue-50 transition-colors"
                >
                  Go to Dashboard
                </Link>
              ) : (
                <>
                  <Link
                    href="/register"
                    className="rounded-md bg-white px-6 py-3 text-base font-semibold text-blue-600 shadow-sm hover:bg-blue-50 transition-colors"
                  >
                    Get Started
                  </Link>
                  <a
                    href="#features"
                    className="text-base font-semibold leading-7 text-white hover:text-blue-100 transition-colors"
                  >
                    Learn More <span aria-hidden="true">→</span>
                  </a>
                </>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-12 sm:py-16 bg-gray-900">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="text-3xl font-bold tracking-tight text-white sm:text-4xl">
              Core Features
            </h2>
            <p className="mt-4 text-lg leading-8 text-gray-300">
              Manage your department&apos;s resources efficiently.
            </p>
          </div>

          <div className="mx-auto mt-8 max-w-7xl">
            <dl className="grid max-w-xl grid-cols-1 gap-8 lg:max-w-none lg:grid-cols-3">
              {/* Employee Management */}
              <div className="flex flex-col rounded-2xl bg-gray-800 p-8 shadow-lg border border-gray-700">
                <dt className="flex items-center gap-x-3 text-lg font-semibold leading-7 text-white">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-600">
                    <svg
                      className="h-6 w-6 text-white"
                      fill="none"
                      viewBox="0 0 24 24"
                      strokeWidth="1.5"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M15 19.128a9.38 9.38 0 002.625.372 9.337 9.337 0 004.121-.952 4.125 4.125 0 00-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 018.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0111.964-3.07M12 6.375a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zm8.25 2.25a2.625 2.625 0 11-5.25 0 2.625 2.625 0 015.25 0z"
                      />
                    </svg>
                  </div>
                  Employee Management
                </dt>
                <dd className="mt-4 flex flex-auto flex-col text-base leading-7 text-gray-300">
                  <p className="flex-auto">
                    Manage employee records, badge numbers, positions, and
                    assignments.
                  </p>
                </dd>
              </div>

              {/* Equipment Tracking */}
              <div className="flex flex-col rounded-2xl bg-gray-800 p-8 shadow-lg border border-gray-700">
                <dt className="flex items-center gap-x-3 text-lg font-semibold leading-7 text-white">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-indigo-600">
                    <svg
                      className="h-6 w-6 text-white"
                      fill="none"
                      viewBox="0 0 24 24"
                      strokeWidth="1.5"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M6.827 6.175A2.31 2.31 0 015.186 7.23c-.38.054-.757.112-1.134.175C2.999 7.58 2.25 8.507 2.25 9.574V18a2.25 2.25 0 002.25 2.25h15A2.25 2.25 0 0021.75 18V9.574c0-1.067-.75-1.994-1.802-2.169a47.865 47.865 0 00-1.134-.175 2.31 2.31 0 01-1.64-1.055l-.822-1.316a2.192 2.192 0 00-1.736-1.039 48.774 48.774 0 00-5.232 0 2.192 2.192 0 00-1.736 1.039l-.821 1.316z"
                      />
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M16.5 12.75a4.5 4.5 0 11-9 0 4.5 4.5 0 019 0zM18.75 10.5h.008v.008h-.008V10.5z"
                      />
                    </svg>
                  </div>
                  Equipment Tracking
                </dt>
                <dd className="mt-4 flex flex-auto flex-col text-base leading-7 text-gray-300">
                  <p className="flex-auto">
                    Track bodycams, cell phones, vehicles, and equipment
                    assignments.
                  </p>
                </dd>
              </div>

              {/* Assignment & Absence Management */}
              <div className="flex flex-col rounded-2xl bg-gray-800 p-8 shadow-lg border border-gray-700">
                <dt className="flex items-center gap-x-3 text-lg font-semibold leading-7 text-white">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-purple-600">
                    <svg
                      className="h-6 w-6 text-white"
                      fill="none"
                      viewBox="0 0 24 24"
                      strokeWidth="1.5"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5"
                      />
                    </svg>
                  </div>
                  Assignment & Scheduling
                </dt>
                <dd className="mt-4 flex flex-auto flex-col text-base leading-7 text-gray-300">
                  <p className="flex-auto">
                    Manage district assignments, absences, and staffing
                    coverage.
                  </p>
                </dd>
              </div>
            </dl>
          </div>
        </div>
      </section>

      {/* Security & Access Control Section */}
      <section className="bg-blue-900 py-10">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="text-3xl font-bold tracking-tight text-white sm:text-4xl">
              Role-Based Security
            </h2>
            <p className="mt-4 text-lg leading-8 text-blue-100">
              Secure access control based on department roles.
            </p>
          </div>
          <div className="mx-auto mt-6 grid max-w-5xl grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-4">
            <div className="rounded-lg bg-white/10 p-6 backdrop-blur-sm">
              <h3 className="text-lg font-semibold text-white">Officer</h3>
              <p className="mt-2 text-sm text-blue-100">
                View resource information and assignments
              </p>
            </div>
            <div className="rounded-lg bg-white/10 p-6 backdrop-blur-sm">
              <h3 className="text-lg font-semibold text-white">Dispatch</h3>
              <p className="mt-2 text-sm text-blue-100">
                Manage absences and coverage coordination
              </p>
            </div>
            <div className="rounded-lg bg-white/10 p-6 backdrop-blur-sm">
              <h3 className="text-lg font-semibold text-white">Supervisor</h3>
              <p className="mt-2 text-sm text-blue-100">
                Edit resources and manage assignments
              </p>
            </div>
            <div className="rounded-lg bg-white/10 p-6 backdrop-blur-sm">
              <h3 className="text-lg font-semibold text-white">
                Command Staff
              </h3>
              <p className="mt-2 text-sm text-blue-100">
                Full administrative access and control
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-12 bg-gray-900">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="text-3xl font-bold tracking-tight text-white sm:text-4xl">
              Ready to get started?
            </h2>
            <p className="mt-4 text-lg leading-8 text-gray-300">
              Join InfoCore today.
            </p>
            <div className="mt-6 flex items-center justify-center gap-x-6">
              <a
                href="#"
                className="rounded-md bg-blue-600 px-6 py-3 text-base font-semibold text-white shadow-sm hover:bg-blue-500 transition-colors"
              >
                Sign In
              </a>
              <a
                href="#"
                className="text-base font-semibold leading-7 text-white hover:text-blue-400 transition-colors"
              >
                Contact Support <span aria-hidden="true">→</span>
              </a>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
