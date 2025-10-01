import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import type { Patient } from "./types";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function calculateAccountNumber(patient: Patient): string {
  const firstInitial = (patient.firstName?.charAt(0) ?? patient.patientName?.charAt(0) ?? "P").toUpperCase();
  const lastInitial = (patient.lastName?.charAt(0) ?? patient.patientName?.split(" ")?.at(-1)?.charAt(0) ?? "N").toUpperCase();
  const dob = patient.dateOfBirth;

  if (!dob || typeof dob !== "string" || !dob.includes("-")) {
    const nowSuffix = new Date().toISOString().slice(2, 8).replace(/[^0-9]/g, "");
    return `${firstInitial}${nowSuffix}${lastInitial}`;
  }

  const [year = "0000", month = "00", day = "00"] = dob.split("-");
  const paddedMonth = month.padStart(2, "0");
  const paddedDay = day.padStart(2, "0");

  return `${firstInitial}${paddedMonth}0${paddedDay}${lastInitial}${year}`;
}

export function parseCurrency(value: unknown): number {
  if (typeof value === "number") {
    return Number.isFinite(value) ? value : 0;
  }

  if (typeof value !== "string") {
    return 0;
  }

  const trimmed = value.trim();
  if (!trimmed) {
    return 0;
  }

  const isNegative = /\((.*)\)/.test(trimmed) || trimmed.startsWith("-");
  const numeric = trimmed
    .replace(/[,$\s]/g, "")
    .replace(/^[^0-9.-]+/, "")
    .replace(/[^0-9.\-]/g, "");

  if (!numeric) {
    return 0;
  }

  const parsed = parseFloat(numeric);
  if (!Number.isFinite(parsed)) {
    return 0;
  }

  return isNegative ? -Math.abs(parsed) : parsed;
}

export function formatCurrency(value: number | null | undefined, { fallback = "$0.00" } = {}): string {
  if (typeof value !== "number" || !Number.isFinite(value)) {
    return fallback;
  }

  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value);
}

export function parseBooleanFlag(value: unknown): boolean {
  if (typeof value === "boolean") {
    return value;
  }

  if (typeof value === "number") {
    return value === 1;
  }

  if (typeof value === "string") {
    const normalized = value.trim().toLowerCase();
    return ["true", "yes", "y", "sent", "1"].includes(normalized);
  }

  return false;
}
