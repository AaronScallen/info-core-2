"use client";

import Link from "next/link";

export default function UnauthorizedPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 to-slate-800 p-4">
      <div className="text-center">
        <div className="mb-8">
          <h1 className="text-9xl font-bold text-red-500">403</h1>
          <h2 className="text-3xl font-semibold text-white mt-4">
            Access Denied
          </h2>
          <p className="text-slate-400 mt-2 text-lg">
            You don&apos;t have permission to access this resource.
          </p>
        </div>

        <div className="flex gap-4 justify-center">
          <Link
            href="/"
            className="rounded-md bg-blue-600 px-6 py-3 text-base font-semibold text-white shadow-sm hover:bg-blue-700 transition-colors"
          >
            Go Home
          </Link>
          <Link
            href="/login"
            className="rounded-md bg-slate-700 px-6 py-3 text-base font-semibold text-white shadow-sm hover:bg-slate-600 transition-colors"
          >
            Sign In
          </Link>
        </div>
      </div>
    </div>
  );
}
