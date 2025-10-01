import type { Claim, Patient } from "./types";

const toNumber = (value: unknown): number => {
  if (typeof value === "number") {
    return Number.isFinite(value) ? value : 0;
  }
  if (typeof value === "string" && value.trim() !== "") {
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : 0;
  }
  return 0;
};

const toBoolean = (value: unknown): boolean => {
  if (typeof value === "boolean") {
    return value;
  }
  if (typeof value === "string") {
    const normalized = value.trim().toLowerCase();
    return ["true", "1", "yes", "y", "t"].includes(normalized);
  }
  if (typeof value === "number") {
    return value === 1;
  }
  return false;
};

const toStringOrNull = (value: unknown): string | null => {
  if (value === undefined || value === null) {
    return null;
  }
  const stringValue = String(value);
  return stringValue.length ? stringValue : null;
};

const toStringValue = (value: unknown, fallback = ""): string => {
  const resolved = toStringOrNull(value);
  return resolved ?? fallback;
};

export function mapDbClaimToClaim(row: Record<string, any>): Claim {
  return {
    id: toStringValue(row.id),
    patientId: toStringOrNull(row.patient_id) ?? undefined,
    accountNumber: toStringValue(row.account_number),
    patientName: toStringValue(row.patient_name),
    serviceDate: toStringValue(row.service_date),
    cptHcpcsCode: toStringOrNull(row.cpt_hcpcs_code) ?? undefined,
    pharmacyOfService: toStringOrNull(row.pharmacy_of_service) ?? undefined,
    rxNumber: toStringOrNull(row.rx_number) ?? undefined,
    totalChargedAmount: toNumber(row.total_charged_amount),
    insuranceAdjustment: toNumber(row.insurance_adjustment),
    insurancePaid: toNumber(row.insurance_paid),
    patientResponsibility: toNumber(row.patient_responsibility),
    patientPaidAmount: toNumber(row.patient_paid_amount),
    accountBalance: toNumber(row.account_balance),
    billingStatus: (toStringOrNull(row.billing_status) as Claim["billingStatus"]) ?? "Pending",
    paymentStatus: (toStringOrNull(row.payment_status) as Claim["paymentStatus"]) ?? "PENDING",
    workflow: (toStringOrNull(row.workflow) as Claim["workflow"]) ?? "New",
    statementCreatedDate: toStringOrNull(row.statement_created_date),
    statementMailed: toBoolean(row.statement_mailed),
    statementTwoMailed: toBoolean(row.statement_two_mailed),
    statementThreeMailed: toBoolean(row.statement_three_mailed),
    statementSentAt: toStringOrNull(row.statement_sent_at),
    statementSent2ndAt: toStringOrNull(row.statement_sent_2nd_at),
    statementSent3rdAt: toStringOrNull(row.statement_sent_3rd_at),
    statementPaid: toBoolean(row.statement_paid),
    notes: toStringOrNull(row.notes) ?? undefined,
    createdAt: toStringOrNull(row.created_at) ?? undefined,
    updatedAt: toStringOrNull(row.updated_at) ?? undefined,
  };
}

export function mapClaimToDb(claim: Partial<Claim>): Record<string, any> {
  const payload: Record<string, any> = {
    account_number: claim.accountNumber,
    patient_id: claim.patientId,
    patient_name: claim.patientName,
    service_date: claim.serviceDate,
    cpt_hcpcs_code: claim.cptHcpcsCode,
    pharmacy_of_service: claim.pharmacyOfService,
    rx_number: claim.rxNumber,
    total_charged_amount: claim.totalChargedAmount,
    insurance_adjustment: claim.insuranceAdjustment,
    insurance_paid: claim.insurancePaid,
    patient_responsibility: claim.patientResponsibility,
    patient_paid_amount: claim.patientPaidAmount,
    account_balance: claim.accountBalance,
    billing_status: claim.billingStatus,
    payment_status: claim.paymentStatus,
    workflow: claim.workflow,
    statement_created_date: claim.statementCreatedDate,
    statement_mailed: claim.statementMailed,
    statement_two_mailed: claim.statementTwoMailed,
    statement_three_mailed: claim.statementThreeMailed,
    statement_sent_at: claim.statementSentAt,
    statement_sent_2nd_at: claim.statementSent2ndAt,
    statement_sent_3rd_at: claim.statementSent3rdAt,
    statement_paid: claim.statementPaid,
    notes: claim.notes,
  };

  return Object.fromEntries(
    Object.entries(payload).filter(([, value]) => value !== undefined)
  );
}

export function mapDbPatientToPatient(row: Record<string, any>): Patient {
  return {
    id: toStringValue(row.id),
    accountNumber: toStringValue(row.account_number ?? row.accountNumber ?? ""),
    patientName: toStringValue(row.patient_name ?? row.patientName ?? ""),
    firstName: toStringOrNull(row.first_name ?? row.firstName) ?? undefined,
    lastName: toStringOrNull(row.last_name ?? row.lastName) ?? undefined,
    dateOfBirth: toStringOrNull(row.date_of_birth ?? row.dateOfBirth) ?? undefined,
    email: toStringOrNull(row.email) ?? undefined,
    phone: toStringOrNull(row.phone) ?? undefined,
    addressStreet: toStringOrNull(row.address_street ?? row.street) ?? undefined,
    addressCity: toStringOrNull(row.address_city ?? row.city) ?? undefined,
    addressState: toStringOrNull(row.address_state ?? row.state) ?? undefined,
    addressZip: toStringOrNull(row.address_zip ?? row.zip) ?? undefined,
    status: (toStringOrNull(row.status) as Patient["status"]) ?? "Active",
    createdAt: toStringOrNull(row.created_at) ?? undefined,
    updatedAt: toStringOrNull(row.updated_at) ?? undefined,
  };
}
