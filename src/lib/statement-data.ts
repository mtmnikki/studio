"use client";

import {
  collection,
  doc,
  getDoc,
  getDocs,
  query,
  where,
} from "firebase/firestore";
import type { Firestore } from "firebase/firestore";

import type { Claim, Patient } from "@/lib/types";

export type StatementData = {
  claims: Claim[];
  patient: Patient;
  accountNumber: string;
  totalAmountDue: number;
};

export function createFallbackPatient(claim: Claim): Patient {
  const safeName = claim.patientName?.trim() || "Patient";
  const [firstName = "Patient", ...rest] = safeName.split(" ");
  const lastName = rest.join(" ");
  const fallbackId = claim.patientId || claim.cardholderId || `claim-${claim.id}`;

  return {
    id: fallbackId,
    firstName,
    lastName,
    dateOfBirth: "1900-01-01",
    address: {
      street: "N/A",
      city: "N/A",
      state: "N/A",
      zip: "N/A",
    },
  };
}

export async function fetchPatient(
  firestore: Firestore,
  patientId: string,
  fallbackFromClaim?: Claim
): Promise<Patient | null> {
  if (!patientId) {
    return fallbackFromClaim ? createFallbackPatient(fallbackFromClaim) : null;
  }

  const patientRef = doc(firestore, "patients", patientId);
  const patientSnap = await getDoc(patientRef);

  if (patientSnap.exists()) {
    return { id: patientSnap.id, ...patientSnap.data() } as Patient;
  }

  return fallbackFromClaim ? createFallbackPatient(fallbackFromClaim) : null;
}

export async function fetchClaimsForPatient(
  firestore: Firestore,
  patientId: string
): Promise<Claim[]> {
  if (!patientId) {
    return [];
  }
  const claimsQuery = query(
    collection(firestore, "claims"),
    where("patientId", "==", patientId),
    where("patientPay", ">", 0)
  );

  const claimsSnap = await getDocs(claimsQuery);
  return claimsSnap.docs.map((docSnap) => ({
    id: docSnap.id,
    ...docSnap.data(),
  })) as Claim[];
}

export async function fetchStatementDataByClaimId(
  firestore: Firestore,
  claimId: string,
  calculateAccountNumber: (patient: Patient) => string
): Promise<StatementData | null> {
  const claimRef = doc(firestore, "claims", claimId);
  const claimSnap = await getDoc(claimRef);

  if (!claimSnap.exists()) {
    return null;
  }

  const initialClaim = { id: claimSnap.id, ...claimSnap.data() } as Claim;
  const resolvedClaim: Claim = {
    ...initialClaim,
    patientId:
      initialClaim.patientId ||
      initialClaim.cardholderId ||
      `claim-${initialClaim.id}`,
    patientName: initialClaim.patientName || "Patient",
  };

  const patient =
    (await fetchPatient(firestore, initialClaim.patientId ?? "", resolvedClaim)) ||
    createFallbackPatient(resolvedClaim);

  if (!patient) {
    return null;
  }

  const patientClaims = await fetchClaimsForPatient(
    firestore,
    patient.id
  );

  const claimsForStatement = patientClaims.length
    ? patientClaims.filter((claim) => !claim.statementSent)
    : [resolvedClaim];

  return buildStatementData(patient, claimsForStatement, calculateAccountNumber);
}

export async function fetchStatementsForPatients(
  firestore: Firestore,
  patientIds: string[],
  calculateAccountNumber: (patient: Patient) => string
): Promise<StatementData[]> {
  const statements: StatementData[] = [];

  for (const patientId of patientIds) {
    const claims = await fetchClaimsForPatient(firestore, patientId);

    if (!claims.length) {
      continue;
    }

    const patient = await fetchPatient(firestore, patientId, claims[0]);

    if (!patient) {
      continue;
    }

    const relevantClaims = claims.filter((claim) => !claim.statementSent);

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
    (acc, claim) => acc + (claim.patientPay ?? 0),
    0
  );

  return {
    claims,
    patient,
    accountNumber: calculateAccountNumber(patient),
    totalAmountDue,
  };
}
