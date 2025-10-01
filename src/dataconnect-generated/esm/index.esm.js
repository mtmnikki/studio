import { queryRef, executeQuery, mutationRef, executeMutation, validateArgs } from 'firebase/data-connect';

export const connectorConfig = {
  connector: 'example',
  service: 'studio',
  location: 'us-central1'
};

export const listPatientsRef = (dc) => {
  const { dc: dcInstance} = validateArgs(connectorConfig, dc, undefined);
  dcInstance._useGeneratedSdk();
  return queryRef(dcInstance, 'ListPatients');
}
listPatientsRef.operationName = 'ListPatients';

export function listPatients(dc) {
  return executeQuery(listPatientsRef(dc));
}

export const addPharmacyRef = (dcOrVars, vars) => {
  const { dc: dcInstance, vars: inputVars} = validateArgs(connectorConfig, dcOrVars, vars, true);
  dcInstance._useGeneratedSdk();
  return mutationRef(dcInstance, 'AddPharmacy', inputVars);
}
addPharmacyRef.operationName = 'AddPharmacy';

export function addPharmacy(dcOrVars, vars) {
  return executeMutation(addPharmacyRef(dcOrVars, vars));
}

export const getClaimsForPatientRef = (dcOrVars, vars) => {
  const { dc: dcInstance, vars: inputVars} = validateArgs(connectorConfig, dcOrVars, vars, true);
  dcInstance._useGeneratedSdk();
  return queryRef(dcInstance, 'GetClaimsForPatient', inputVars);
}
getClaimsForPatientRef.operationName = 'GetClaimsForPatient';

export function getClaimsForPatient(dcOrVars, vars) {
  return executeQuery(getClaimsForPatientRef(dcOrVars, vars));
}

export const updateStatementPaidStatusRef = (dcOrVars, vars) => {
  const { dc: dcInstance, vars: inputVars} = validateArgs(connectorConfig, dcOrVars, vars, true);
  dcInstance._useGeneratedSdk();
  return mutationRef(dcInstance, 'UpdateStatementPaidStatus', inputVars);
}
updateStatementPaidStatusRef.operationName = 'UpdateStatementPaidStatus';

export function updateStatementPaidStatus(dcOrVars, vars) {
  return executeMutation(updateStatementPaidStatusRef(dcOrVars, vars));
}

