import { ListPatientsData, AddPharmacyData, AddPharmacyVariables, GetClaimsForPatientData, GetClaimsForPatientVariables, UpdateStatementPaidStatusData, UpdateStatementPaidStatusVariables } from '../';
import { UseDataConnectQueryResult, useDataConnectQueryOptions, UseDataConnectMutationResult, useDataConnectMutationOptions} from '@tanstack-query-firebase/react/data-connect';
import { UseQueryResult, UseMutationResult} from '@tanstack/react-query';
import { DataConnect } from 'firebase/data-connect';
import { FirebaseError } from 'firebase/app';


export function useListPatients(options?: useDataConnectQueryOptions<ListPatientsData>): UseDataConnectQueryResult<ListPatientsData, undefined>;
export function useListPatients(dc: DataConnect, options?: useDataConnectQueryOptions<ListPatientsData>): UseDataConnectQueryResult<ListPatientsData, undefined>;

export function useAddPharmacy(options?: useDataConnectMutationOptions<AddPharmacyData, FirebaseError, AddPharmacyVariables>): UseDataConnectMutationResult<AddPharmacyData, AddPharmacyVariables>;
export function useAddPharmacy(dc: DataConnect, options?: useDataConnectMutationOptions<AddPharmacyData, FirebaseError, AddPharmacyVariables>): UseDataConnectMutationResult<AddPharmacyData, AddPharmacyVariables>;

export function useGetClaimsForPatient(vars: GetClaimsForPatientVariables, options?: useDataConnectQueryOptions<GetClaimsForPatientData>): UseDataConnectQueryResult<GetClaimsForPatientData, GetClaimsForPatientVariables>;
export function useGetClaimsForPatient(dc: DataConnect, vars: GetClaimsForPatientVariables, options?: useDataConnectQueryOptions<GetClaimsForPatientData>): UseDataConnectQueryResult<GetClaimsForPatientData, GetClaimsForPatientVariables>;

export function useUpdateStatementPaidStatus(options?: useDataConnectMutationOptions<UpdateStatementPaidStatusData, FirebaseError, UpdateStatementPaidStatusVariables>): UseDataConnectMutationResult<UpdateStatementPaidStatusData, UpdateStatementPaidStatusVariables>;
export function useUpdateStatementPaidStatus(dc: DataConnect, options?: useDataConnectMutationOptions<UpdateStatementPaidStatusData, FirebaseError, UpdateStatementPaidStatusVariables>): UseDataConnectMutationResult<UpdateStatementPaidStatusData, UpdateStatementPaidStatusVariables>;
