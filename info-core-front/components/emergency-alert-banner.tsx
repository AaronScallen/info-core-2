"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import { useAuth } from "@/components/auth-provider";
import { getAuthHeaders } from "@/lib/auth";
import Link from "next/link";

interface EmergencyAlert {
  alertId: number;
  priority: "LOW" | "MEDIUM" | "HIGH" | "CRITICAL";
  location: string;
  description: string;
  isActive: boolean;
  triggeredAt: string;
}

const PRIORITY_STYLES: Record<string, string> = {
  CRITICAL: "bg-red-700 border-red-500 text-white",
  HIGH: "bg-orange-600 border-orange-400 text-white",
  MEDIUM: "bg-yellow-500 border-yellow-300 text-gray-900",
  LOW: "bg-blue-600 border-blue-400 text-white",
};

const PRIORITY_PULSE: Record<string, boolean> = {
  CRITICAL: true,
  HIGH: true,
  MEDIUM: false,
  LOW: false,
};

export function EmergencyAlertBanner() {
  const { user } = useAuth();
  const [alert, setAlert] = useState<EmergencyAlert | null>(null);
  const lastPlayedAlertIdRef = useRef<number | null>(null);

  const playAlertTone = useCallback(() => {
    if (typeof window === "undefined") return;

    const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
    if (!AudioCtx) return;

    try {
      const ctx = new AudioCtx() as AudioContext;

      const createBeep = (
        startAt: number,
        duration: number,
        frequency: number,
      ) => {
        const oscillator = ctx.createOscillator();
        const gain = ctx.createGain();

        oscillator.type = "sine";
        oscillator.frequency.setValueAtTime(frequency, startAt);

        gain.gain.setValueAtTime(0.0001, startAt);
        gain.gain.exponentialRampToValueAtTime(0.3, startAt + 0.02);
        gain.gain.exponentialRampToValueAtTime(0.0001, startAt + duration);

        oscillator.connect(gain);
        gain.connect(ctx.destination);

        oscillator.start(startAt);
        oscillator.stop(startAt + duration + 0.02);
      };

      const now = ctx.currentTime;
      createBeep(now, 0.32, 900);
      createBeep(now + 0.42, 0.32, 700);

      setTimeout(() => {
        void ctx.close();
      }, 1200);
    } catch {
      // Silent fail for browsers blocking autoplay/audio context
    }
  }, []);

  const fetchActiveAlert = useCallback(async () => {
    if (!user) return;
    try {
      const res = await fetch("http://localhost:3001/api/alerts/active", {
        headers: getAuthHeaders(),
      });
      if (!res.ok) return;
      const data = await res.json();
      setAlert(data);
    } catch {
      // Silent fail — network error should not break the app
    }
  }, [user]);

  useEffect(() => {
    if (!user) {
      setAlert(null);
      lastPlayedAlertIdRef.current = null;
      return;
    }

    fetchActiveAlert();
    const interval = setInterval(fetchActiveAlert, 10000);
    return () => clearInterval(interval);
  }, [user, fetchActiveAlert]);

  useEffect(() => {
    if (!alert) {
      lastPlayedAlertIdRef.current = null;
      return;
    }

    if (lastPlayedAlertIdRef.current === alert.alertId) {
      return;
    }

    playAlertTone();
    lastPlayedAlertIdRef.current = alert.alertId;
  }, [alert, playAlertTone]);

  if (!alert) return null;

  const styles = PRIORITY_STYLES[alert.priority] ?? PRIORITY_STYLES.HIGH;
  const shouldPulse = PRIORITY_PULSE[alert.priority] ?? false;

  const formattedTime = new Date(alert.triggeredAt).toLocaleString();

  return (
    <div
      className={`w-full border-b-4 px-4 py-3 ${styles} ${
        shouldPulse ? "animate-pulse" : ""
      }`}
      role="alert"
      aria-live="assertive"
    >
      <div className="mx-auto max-w-7xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
        <div className="flex items-start gap-3">
          {/* Warning icon */}
          <svg
            className="h-6 w-6 shrink-0 mt-0.5"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z"
            />
          </svg>
          <div>
            <span className="font-bold text-sm uppercase tracking-wider">
              ⚠ EMERGENCY ALERT — {alert.priority}
            </span>
            <div className="mt-0.5 text-sm font-semibold">
              📍 {alert.location}
            </div>
            <div className="mt-0.5 text-sm">{alert.description}</div>
            <div className="mt-0.5 text-xs opacity-80">
              Triggered: {formattedTime}
            </div>
          </div>
        </div>

        {(user?.role === "command_staff" || user?.role === "dispatch") && (
          <Link
            href="/dashboard/alerts"
            className="shrink-0 rounded-md bg-white/20 hover:bg-white/30 px-3 py-1.5 text-sm font-semibold border border-white/40 transition-colors"
          >
            Manage Alert
          </Link>
        )}
      </div>
    </div>
  );
}
