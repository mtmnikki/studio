import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"
import type { Patient } from "./types"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function calculateAccountNumber(patient: Patient): string {
  const rawDob = typeof patient.dateOfBirth === 'string' && patient.dateOfBirth.includes('-')
    ? patient.dateOfBirth
    : '1900-01-01';
  const [year = '1900', month = '01', day = '01'] = rawDob.split('-');

  const firstInitial = (patient.firstName?.charAt(0) || 'X').toUpperCase();
  const lastInitial = (patient.lastName?.charAt(0) || 'X').toUpperCase();

  return `${firstInitial}${month}0${day}${lastInitial}${year}`;
}
