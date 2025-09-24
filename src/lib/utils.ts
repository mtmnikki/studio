import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"
import type { Patient } from "./types"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function calculateAccountNumber(patient: Patient): string {
  const [year, month, day] = patient.dateOfBirth.split('-');
  const firstInitial = patient.firstName.charAt(0).toUpperCase();
  const lastInitial = patient.lastName.charAt(0).toUpperCase();

  return `${firstInitial}${month}0${day}${lastInitial}${year}`;
}
