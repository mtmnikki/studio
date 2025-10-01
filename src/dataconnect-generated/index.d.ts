import { ConnectorConfig, DataConnect, QueryRef, QueryPromise, MutationRef, MutationPromise } from 'firebase/data-connect';

export const connectorConfig: ConnectorConfig;

export type TimestampString = string;
export type UUIDString = string;
export type Int64String = string;
export type DateString = string;




export interface AddPharmacyData {
  pharmacy_insert: Pharmacy_Key;
}

export interface AddPharmacyVariables {
  name: string;
  address: string;
}

export interface Claim_Key {
  id: UUIDString;
  __typename?: 'Claim_Key';
}

export interface GetClaimsForPatientData {
  claims: ({
    id: UUIDString;
    serviceDate: DateString;
    totalChargedAmount: number;
    patientResponsibility: number;
  } & Claim_Key)[];
}

export interface GetClaimsForPatientVariables {
  patientId: UUIDString;
}

export interface ListPatientsData {
  patients: ({
    id: UUIDString;
    name: string;
    email?: string | null;
  } & Patient_Key)[];
}

export interface Patient_Key {
  id: UUIDString;
  __typename?: 'Patient_Key';
}

export interface Pharmacy_Key {
  id: UUIDString;
  __typename?: 'Pharmacy_Key';
}

export interface Statement_Key {
  id: UUIDString;
  __typename?: 'Statement_Key';
}

export interface UpdateStatementPaidStatusData {
  statement_update?: Statement_Key | null;
}

export interface UpdateStatementPaidStatusVariables {
  statementId: UUIDString;
  statementPaid: boolean;
}

interface ListPatientsRef {
  /* Allow users to create refs without passing in DataConnect */
  (): QueryRef<ListPatientsData, undefined>;
  /* Allow users to pass in custom DataConnect instances */
  (dc: DataConnect): QueryRef<ListPatientsData, undefined>;
  operationName: string;
}
export const listPatientsRef: ListPatientsRef;

export function listPatients(): QueryPromise<ListPatientsData, undefined>;
export function listPatients(dc: DataConnect): QueryPromise<ListPatientsData, undefined>;

interface AddPharmacyRef {
  /* Allow users to create refs without passing in DataConnect */
  (vars: AddPharmacyVariables): MutationRef<AddPharmacyData, AddPharmacyVariables>;
  /* Allow users to pass in custom DataConnect instances */
  (dc: DataConnect, vars: AddPharmacyVariables): MutationRef<AddPharmacyData, AddPharmacyVariables>;
  operationName: string;
}
export const addPharmacyRef: AddPharmacyRef;

export function addPharmacy(vars: AddPharmacyVariables): MutationPromise<AddPharmacyData, AddPharmacyVariables>;
export function addPharmacy(dc: DataConnect, vars: AddPharmacyVariables): MutationPromise<AddPharmacyData, AddPharmacyVariables>;

interface GetClaimsForPatientRef {
  /* Allow users to create refs without passing in DataConnect */
  (vars: GetClaimsForPatientVariables): QueryRef<GetClaimsForPatientData, GetClaimsForPatientVariables>;
  /* Allow users to pass in custom DataConnect instances */
  (dc: DataConnect, vars: GetClaimsForPatientVariables): QueryRef<GetClaimsForPatientData, GetClaimsForPatientVariables>;
  operationName: string;
}
export const getClaimsForPatientRef: GetClaimsForPatientRef;

export function getClaimsForPatient(vars: GetClaimsForPatientVariables): QueryPromise<GetClaimsForPatientData, GetClaimsForPatientVariables>;
export function getClaimsForPatient(dc: DataConnect, vars: GetClaimsForPatientVariables): QueryPromise<GetClaimsForPatientData, GetClaimsForPatientVariables>;

interface UpdateStatementPaidStatusRef {
  /* Allow users to create refs without passing in DataConnect */
  (vars: UpdateStatementPaidStatusVariables): MutationRef<UpdateStatementPaidStatusData, UpdateStatementPaidStatusVariables>;
  /* Allow users to pass in custom DataConnect instances */
  (dc: DataConnect, vars: UpdateStatementPaidStatusVariables): MutationRef<UpdateStatementPaidStatusData, UpdateStatementPaidStatusVariables>;
  operationName: string;
}
export const updateStatementPaidStatusRef: UpdateStatementPaidStatusRef;

export function updateStatementPaidStatus(vars: UpdateStatementPaidStatusVariables): MutationPromise<UpdateStatementPaidStatusData, UpdateStatementPaidStatusVariables>;
export function updateStatementPaidStatus(dc: DataConnect, vars: UpdateStatementPaidStatusVariables): MutationPromise<UpdateStatementPaidStatusData, UpdateStatementPaidStatusVariables>;

