"use client";

import { createClient } from "@/lib/supabase/client";
import type { Claim, Patient } from "@/lib/types";
import { mapDbClaimToClaim, mapDbPatientToPatient } from "@/lib/mappers";

export type StatementData = {
  claims: Claim[];
  patient: Patient;
  accountNumber: string;
  totalAmountDue: number;
  statementDate: string;
  dueDate: string;
};

export function createFallbackPatient(claim: Claim): Patient {
  const [firstName = "Patient", lastName = ""] = claim.patientName.split(" ");

  return {
    id: claim.patientId || "",
    accountNumber: claim.accountNumber || "",
    patientName: claim.patientName,
    firstName,
    lastName,
    dateOfBirth: "1900-01-01",
    addressStreet: claim.pharmacyOfService ?? "N/A",
    addressCity: "N/A",
    addressState: "N/A",
    addressZip: "N/A",
    status: "Active",
  };
}

export async function fetchPatient(
  patientId: string,
  fallbackFromClaim?: Claim
): Promise<Patient | null> {
  if (!patientId) {
    return null;
  }

  const supabase = createClient();
  const { data: patientRow, error } = await supabase
    .from("patients")
    .select("*")
    .eq("id", patientId)
    .single();

  if (error || !patientRow) {
    return fallbackFromClaim ? createFallbackPatient(fallbackFromClaim) : null;
  }

  return mapDbPatientToPatient(patientRow);
}

export async function fetchClaimsForPatient(
  patientId: string
): Promise<Claim[]> {
  const supabase = createClient();
  const { data: claimRows, error } = await supabase
    .from("claims")
    .select("*")
    .eq("patient_id", patientId)
    .gt("patient_responsibility", 0);

  if (error || !claimRows) {
    return [];
  }

  return claimRows.map(mapDbClaimToClaim);
}

export async function fetchStatementDataByClaimId(
  claimId: string,
  calculateAccountNumber: (patient: Patient) => string
): Promise<StatementData | null> {
  const supabase = createClient();
  const { data: claimRow, error } = await supabase
    .from("claims")
    .select("*")
    .eq("id", claimId)
    .single();

  if (error || !claimRow) {
    return null;
  }

  const claim = mapDbClaimToClaim(claimRow);

  if (!claim.patientId) {
    return null;
  }

  const patient = await fetchPatient(claim.patientId, claim);

  if (!patient) {
    return null;
  }

  const patientClaims = await fetchClaimsForPatient(patient.id);

  const claimsForStatement = patientClaims.length
    ? patientClaims.filter((candidate) => !candidate.statementMailed)
    : [claim];

  return buildStatementData(patient, claimsForStatement, calculateAccountNumber);
}

export async function fetchStatementsForPatients(
  patientIds: string[],
  calculateAccountNumber: (patient: Patient) => string
): Promise<StatementData[]> {
  const statements: StatementData[] = [];

  for (const patientId of patientIds) {
    const claims = await fetchClaimsForPatient(patientId);

    if (!claims.length) {
      continue;
    }

    const patient = await fetchPatient(patientId, claims[0]);

    if (!patient) {
      continue;
    }

    const relevantClaims = claims.filter((claim) => !claim.statementMailed);

    const statementData = buildStatementData(
      patient,
      relevantClaims,
      calculateAccountNumber
    );

    if (statementData) {
      statements.push(statementData);
    }
  }

  return statements;
}

export function buildStatementData(
  patient: Patient,
  claims: Claim[],
  calculateAccountNumber: (patient: Patient) => string
): StatementData | null {
  if (!claims.length) {
    return null;
  }

  const totalAmountDue = claims.reduce(
    (acc, claim) => acc + claim.patientResponsibility,
    0
  );

  const statementDate = new Date().toISOString();
  const dueDate = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString();

  return {
    claims,
    patient,
    accountNumber: calculateAccountNumber(patient),
    totalAmountDue,
    statementDate,
    dueDate,
  };
}
