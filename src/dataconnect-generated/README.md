# Generated TypeScript README
This README will guide you through the process of using the generated JavaScript SDK package for the connector `example`. It will also provide examples on how to use your generated SDK to call your Data Connect queries and mutations.

**If you're looking for the `React README`, you can find it at [`dataconnect-generated/react/README.md`](./react/README.md)**

***NOTE:** This README is generated alongside the generated SDK. If you make changes to this file, they will be overwritten when the SDK is regenerated.*

# Table of Contents
- [**Overview**](#generated-javascript-readme)
- [**Accessing the connector**](#accessing-the-connector)
  - [*Connecting to the local Emulator*](#connecting-to-the-local-emulator)
- [**Queries**](#queries)
  - [*ListPatients*](#listpatients)
  - [*GetClaimsForPatient*](#getclaimsforpatient)
- [**Mutations**](#mutations)
  - [*AddPharmacy*](#addpharmacy)
  - [*UpdateStatementPaidStatus*](#updatestatementpaidstatus)

# Accessing the connector
A connector is a collection of Queries and Mutations. One SDK is generated for each connector - this SDK is generated for the connector `example`. You can find more information about connectors in the [Data Connect documentation](https://firebase.google.com/docs/data-connect#how-does).

You can use this generated SDK by importing from the package `@dataconnect/generated` as shown below. Both CommonJS and ESM imports are supported.

You can also follow the instructions from the [Data Connect documentation](https://firebase.google.com/docs/data-connect/web-sdk#set-client).

```typescript
import { getDataConnect } from 'firebase/data-connect';
import { connectorConfig } from '@dataconnect/generated';

const dataConnect = getDataConnect(connectorConfig);
```

## Connecting to the local Emulator
By default, the connector will connect to the production service.

To connect to the emulator, you can use the following code.
You can also follow the emulator instructions from the [Data Connect documentation](https://firebase.google.com/docs/data-connect/web-sdk#instrument-clients).

```typescript
import { connectDataConnectEmulator, getDataConnect } from 'firebase/data-connect';
import { connectorConfig } from '@dataconnect/generated';

const dataConnect = getDataConnect(connectorConfig);
connectDataConnectEmulator(dataConnect, 'localhost', 9399);
```

After it's initialized, you can call your Data Connect [queries](#queries) and [mutations](#mutations) from your generated SDK.

# Queries

There are two ways to execute a Data Connect Query using the generated Web SDK:
- Using a Query Reference function, which returns a `QueryRef`
  - The `QueryRef` can be used as an argument to `executeQuery()`, which will execute the Query and return a `QueryPromise`
- Using an action shortcut function, which returns a `QueryPromise`
  - Calling the action shortcut function will execute the Query and return a `QueryPromise`

The following is true for both the action shortcut function and the `QueryRef` function:
- The `QueryPromise` returned will resolve to the result of the Query once it has finished executing
- If the Query accepts arguments, both the action shortcut function and the `QueryRef` function accept a single argument: an object that contains all the required variables (and the optional variables) for the Query
- Both functions can be called with or without passing in a `DataConnect` instance as an argument. If no `DataConnect` argument is passed in, then the generated SDK will call `getDataConnect(connectorConfig)` behind the scenes for you.

Below are examples of how to use the `example` connector's generated functions to execute each query. You can also follow the examples from the [Data Connect documentation](https://firebase.google.com/docs/data-connect/web-sdk#using-queries).

## ListPatients
You can execute the `ListPatients` query using the following action shortcut function, or by calling `executeQuery()` after calling the following `QueryRef` function, both of which are defined in [dataconnect-generated/index.d.ts](./index.d.ts):
```typescript
listPatients(): QueryPromise<ListPatientsData, undefined>;

interface ListPatientsRef {
  ...
  /* Allow users to create refs without passing in DataConnect */
  (): QueryRef<ListPatientsData, undefined>;
}
export const listPatientsRef: ListPatientsRef;
```
You can also pass in a `DataConnect` instance to the action shortcut function or `QueryRef` function.
```typescript
listPatients(dc: DataConnect): QueryPromise<ListPatientsData, undefined>;

interface ListPatientsRef {
  ...
  (dc: DataConnect): QueryRef<ListPatientsData, undefined>;
}
export const listPatientsRef: ListPatientsRef;
```

If you need the name of the operation without creating a ref, you can retrieve the operation name by calling the `operationName` property on the listPatientsRef:
```typescript
const name = listPatientsRef.operationName;
console.log(name);
```

### Variables
The `ListPatients` query has no variables.
### Return Type
Recall that executing the `ListPatients` query returns a `QueryPromise` that resolves to an object with a `data` property.

The `data` property is an object of type `ListPatientsData`, which is defined in [dataconnect-generated/index.d.ts](./index.d.ts). It has the following fields:
```typescript
export interface ListPatientsData {
  patients: ({
    id: UUIDString;
    name: string;
    email?: string | null;
  } & Patient_Key)[];
}
```
### Using `ListPatients`'s action shortcut function

```typescript
import { getDataConnect } from 'firebase/data-connect';
import { connectorConfig, listPatients } from '@dataconnect/generated';


// Call the `listPatients()` function to execute the query.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await listPatients();

// You can also pass in a `DataConnect` instance to the action shortcut function.
const dataConnect = getDataConnect(connectorConfig);
const { data } = await listPatients(dataConnect);

console.log(data.patients);

// Or, you can use the `Promise` API.
listPatients().then((response) => {
  const data = response.data;
  console.log(data.patients);
});
```

### Using `ListPatients`'s `QueryRef` function

```typescript
import { getDataConnect, executeQuery } from 'firebase/data-connect';
import { connectorConfig, listPatientsRef } from '@dataconnect/generated';


// Call the `listPatientsRef()` function to get a reference to the query.
const ref = listPatientsRef();

// You can also pass in a `DataConnect` instance to the `QueryRef` function.
const dataConnect = getDataConnect(connectorConfig);
const ref = listPatientsRef(dataConnect);

// Call `executeQuery()` on the reference to execute the query.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await executeQuery(ref);

console.log(data.patients);

// Or, you can use the `Promise` API.
executeQuery(ref).then((response) => {
  const data = response.data;
  console.log(data.patients);
});
```

## GetClaimsForPatient
You can execute the `GetClaimsForPatient` query using the following action shortcut function, or by calling `executeQuery()` after calling the following `QueryRef` function, both of which are defined in [dataconnect-generated/index.d.ts](./index.d.ts):
```typescript
getClaimsForPatient(vars: GetClaimsForPatientVariables): QueryPromise<GetClaimsForPatientData, GetClaimsForPatientVariables>;

interface GetClaimsForPatientRef {
  ...
  /* Allow users to create refs without passing in DataConnect */
  (vars: GetClaimsForPatientVariables): QueryRef<GetClaimsForPatientData, GetClaimsForPatientVariables>;
}
export const getClaimsForPatientRef: GetClaimsForPatientRef;
```
You can also pass in a `DataConnect` instance to the action shortcut function or `QueryRef` function.
```typescript
getClaimsForPatient(dc: DataConnect, vars: GetClaimsForPatientVariables): QueryPromise<GetClaimsForPatientData, GetClaimsForPatientVariables>;

interface GetClaimsForPatientRef {
  ...
  (dc: DataConnect, vars: GetClaimsForPatientVariables): QueryRef<GetClaimsForPatientData, GetClaimsForPatientVariables>;
}
export const getClaimsForPatientRef: GetClaimsForPatientRef;
```

If you need the name of the operation without creating a ref, you can retrieve the operation name by calling the `operationName` property on the getClaimsForPatientRef:
```typescript
const name = getClaimsForPatientRef.operationName;
console.log(name);
```

### Variables
The `GetClaimsForPatient` query requires an argument of type `GetClaimsForPatientVariables`, which is defined in [dataconnect-generated/index.d.ts](./index.d.ts). It has the following fields:

```typescript
export interface GetClaimsForPatientVariables {
  patientId: UUIDString;
}
```
### Return Type
Recall that executing the `GetClaimsForPatient` query returns a `QueryPromise` that resolves to an object with a `data` property.

The `data` property is an object of type `GetClaimsForPatientData`, which is defined in [dataconnect-generated/index.d.ts](./index.d.ts). It has the following fields:
```typescript
export interface GetClaimsForPatientData {
  claims: ({
    id: UUIDString;
    serviceDate: DateString;
    totalChargedAmount: number;
    patientResponsibility: number;
  } & Claim_Key)[];
}
```
### Using `GetClaimsForPatient`'s action shortcut function

```typescript
import { getDataConnect } from 'firebase/data-connect';
import { connectorConfig, getClaimsForPatient, GetClaimsForPatientVariables } from '@dataconnect/generated';

// The `GetClaimsForPatient` query requires an argument of type `GetClaimsForPatientVariables`:
const getClaimsForPatientVars: GetClaimsForPatientVariables = {
  patientId: ..., 
};

// Call the `getClaimsForPatient()` function to execute the query.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await getClaimsForPatient(getClaimsForPatientVars);
// Variables can be defined inline as well.
const { data } = await getClaimsForPatient({ patientId: ..., });

// You can also pass in a `DataConnect` instance to the action shortcut function.
const dataConnect = getDataConnect(connectorConfig);
const { data } = await getClaimsForPatient(dataConnect, getClaimsForPatientVars);

console.log(data.claims);

// Or, you can use the `Promise` API.
getClaimsForPatient(getClaimsForPatientVars).then((response) => {
  const data = response.data;
  console.log(data.claims);
});
```

### Using `GetClaimsForPatient`'s `QueryRef` function

```typescript
import { getDataConnect, executeQuery } from 'firebase/data-connect';
import { connectorConfig, getClaimsForPatientRef, GetClaimsForPatientVariables } from '@dataconnect/generated';

// The `GetClaimsForPatient` query requires an argument of type `GetClaimsForPatientVariables`:
const getClaimsForPatientVars: GetClaimsForPatientVariables = {
  patientId: ..., 
};

// Call the `getClaimsForPatientRef()` function to get a reference to the query.
const ref = getClaimsForPatientRef(getClaimsForPatientVars);
// Variables can be defined inline as well.
const ref = getClaimsForPatientRef({ patientId: ..., });

// You can also pass in a `DataConnect` instance to the `QueryRef` function.
const dataConnect = getDataConnect(connectorConfig);
const ref = getClaimsForPatientRef(dataConnect, getClaimsForPatientVars);

// Call `executeQuery()` on the reference to execute the query.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await executeQuery(ref);

console.log(data.claims);

// Or, you can use the `Promise` API.
executeQuery(ref).then((response) => {
  const data = response.data;
  console.log(data.claims);
});
```

# Mutations

There are two ways to execute a Data Connect Mutation using the generated Web SDK:
- Using a Mutation Reference function, which returns a `MutationRef`
  - The `MutationRef` can be used as an argument to `executeMutation()`, which will execute the Mutation and return a `MutationPromise`
- Using an action shortcut function, which returns a `MutationPromise`
  - Calling the action shortcut function will execute the Mutation and return a `MutationPromise`

The following is true for both the action shortcut function and the `MutationRef` function:
- The `MutationPromise` returned will resolve to the result of the Mutation once it has finished executing
- If the Mutation accepts arguments, both the action shortcut function and the `MutationRef` function accept a single argument: an object that contains all the required variables (and the optional variables) for the Mutation
- Both functions can be called with or without passing in a `DataConnect` instance as an argument. If no `DataConnect` argument is passed in, then the generated SDK will call `getDataConnect(connectorConfig)` behind the scenes for you.

Below are examples of how to use the `example` connector's generated functions to execute each mutation. You can also follow the examples from the [Data Connect documentation](https://firebase.google.com/docs/data-connect/web-sdk#using-mutations).

## AddPharmacy
You can execute the `AddPharmacy` mutation using the following action shortcut function, or by calling `executeMutation()` after calling the following `MutationRef` function, both of which are defined in [dataconnect-generated/index.d.ts](./index.d.ts):
```typescript
addPharmacy(vars: AddPharmacyVariables): MutationPromise<AddPharmacyData, AddPharmacyVariables>;

interface AddPharmacyRef {
  ...
  /* Allow users to create refs without passing in DataConnect */
  (vars: AddPharmacyVariables): MutationRef<AddPharmacyData, AddPharmacyVariables>;
}
export const addPharmacyRef: AddPharmacyRef;
```
You can also pass in a `DataConnect` instance to the action shortcut function or `MutationRef` function.
```typescript
addPharmacy(dc: DataConnect, vars: AddPharmacyVariables): MutationPromise<AddPharmacyData, AddPharmacyVariables>;

interface AddPharmacyRef {
  ...
  (dc: DataConnect, vars: AddPharmacyVariables): MutationRef<AddPharmacyData, AddPharmacyVariables>;
}
export const addPharmacyRef: AddPharmacyRef;
```

If you need the name of the operation without creating a ref, you can retrieve the operation name by calling the `operationName` property on the addPharmacyRef:
```typescript
const name = addPharmacyRef.operationName;
console.log(name);
```

### Variables
The `AddPharmacy` mutation requires an argument of type `AddPharmacyVariables`, which is defined in [dataconnect-generated/index.d.ts](./index.d.ts). It has the following fields:

```typescript
export interface AddPharmacyVariables {
  name: string;
  address: string;
}
```
### Return Type
Recall that executing the `AddPharmacy` mutation returns a `MutationPromise` that resolves to an object with a `data` property.

The `data` property is an object of type `AddPharmacyData`, which is defined in [dataconnect-generated/index.d.ts](./index.d.ts). It has the following fields:
```typescript
export interface AddPharmacyData {
  pharmacy_insert: Pharmacy_Key;
}
```
### Using `AddPharmacy`'s action shortcut function

```typescript
import { getDataConnect } from 'firebase/data-connect';
import { connectorConfig, addPharmacy, AddPharmacyVariables } from '@dataconnect/generated';

// The `AddPharmacy` mutation requires an argument of type `AddPharmacyVariables`:
const addPharmacyVars: AddPharmacyVariables = {
  name: ..., 
  address: ..., 
};

// Call the `addPharmacy()` function to execute the mutation.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await addPharmacy(addPharmacyVars);
// Variables can be defined inline as well.
const { data } = await addPharmacy({ name: ..., address: ..., });

// You can also pass in a `DataConnect` instance to the action shortcut function.
const dataConnect = getDataConnect(connectorConfig);
const { data } = await addPharmacy(dataConnect, addPharmacyVars);

console.log(data.pharmacy_insert);

// Or, you can use the `Promise` API.
addPharmacy(addPharmacyVars).then((response) => {
  const data = response.data;
  console.log(data.pharmacy_insert);
});
```

### Using `AddPharmacy`'s `MutationRef` function

```typescript
import { getDataConnect, executeMutation } from 'firebase/data-connect';
import { connectorConfig, addPharmacyRef, AddPharmacyVariables } from '@dataconnect/generated';

// The `AddPharmacy` mutation requires an argument of type `AddPharmacyVariables`:
const addPharmacyVars: AddPharmacyVariables = {
  name: ..., 
  address: ..., 
};

// Call the `addPharmacyRef()` function to get a reference to the mutation.
const ref = addPharmacyRef(addPharmacyVars);
// Variables can be defined inline as well.
const ref = addPharmacyRef({ name: ..., address: ..., });

// You can also pass in a `DataConnect` instance to the `MutationRef` function.
const dataConnect = getDataConnect(connectorConfig);
const ref = addPharmacyRef(dataConnect, addPharmacyVars);

// Call `executeMutation()` on the reference to execute the mutation.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await executeMutation(ref);

console.log(data.pharmacy_insert);

// Or, you can use the `Promise` API.
executeMutation(ref).then((response) => {
  const data = response.data;
  console.log(data.pharmacy_insert);
});
```

## UpdateStatementPaidStatus
You can execute the `UpdateStatementPaidStatus` mutation using the following action shortcut function, or by calling `executeMutation()` after calling the following `MutationRef` function, both of which are defined in [dataconnect-generated/index.d.ts](./index.d.ts):
```typescript
updateStatementPaidStatus(vars: UpdateStatementPaidStatusVariables): MutationPromise<UpdateStatementPaidStatusData, UpdateStatementPaidStatusVariables>;

interface UpdateStatementPaidStatusRef {
  ...
  /* Allow users to create refs without passing in DataConnect */
  (vars: UpdateStatementPaidStatusVariables): MutationRef<UpdateStatementPaidStatusData, UpdateStatementPaidStatusVariables>;
}
export const updateStatementPaidStatusRef: UpdateStatementPaidStatusRef;
```
You can also pass in a `DataConnect` instance to the action shortcut function or `MutationRef` function.
```typescript
updateStatementPaidStatus(dc: DataConnect, vars: UpdateStatementPaidStatusVariables): MutationPromise<UpdateStatementPaidStatusData, UpdateStatementPaidStatusVariables>;

interface UpdateStatementPaidStatusRef {
  ...
  (dc: DataConnect, vars: UpdateStatementPaidStatusVariables): MutationRef<UpdateStatementPaidStatusData, UpdateStatementPaidStatusVariables>;
}
export const updateStatementPaidStatusRef: UpdateStatementPaidStatusRef;
```

If you need the name of the operation without creating a ref, you can retrieve the operation name by calling the `operationName` property on the updateStatementPaidStatusRef:
```typescript
const name = updateStatementPaidStatusRef.operationName;
console.log(name);
```

### Variables
The `UpdateStatementPaidStatus` mutation requires an argument of type `UpdateStatementPaidStatusVariables`, which is defined in [dataconnect-generated/index.d.ts](./index.d.ts). It has the following fields:

```typescript
export interface UpdateStatementPaidStatusVariables {
  statementId: UUIDString;
  statementPaid: boolean;
}
```
### Return Type
Recall that executing the `UpdateStatementPaidStatus` mutation returns a `MutationPromise` that resolves to an object with a `data` property.

The `data` property is an object of type `UpdateStatementPaidStatusData`, which is defined in [dataconnect-generated/index.d.ts](./index.d.ts). It has the following fields:
```typescript
export interface UpdateStatementPaidStatusData {
  statement_update?: Statement_Key | null;
}
```
### Using `UpdateStatementPaidStatus`'s action shortcut function

```typescript
import { getDataConnect } from 'firebase/data-connect';
import { connectorConfig, updateStatementPaidStatus, UpdateStatementPaidStatusVariables } from '@dataconnect/generated';

// The `UpdateStatementPaidStatus` mutation requires an argument of type `UpdateStatementPaidStatusVariables`:
const updateStatementPaidStatusVars: UpdateStatementPaidStatusVariables = {
  statementId: ..., 
  statementPaid: ..., 
};

// Call the `updateStatementPaidStatus()` function to execute the mutation.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await updateStatementPaidStatus(updateStatementPaidStatusVars);
// Variables can be defined inline as well.
const { data } = await updateStatementPaidStatus({ statementId: ..., statementPaid: ..., });

// You can also pass in a `DataConnect` instance to the action shortcut function.
const dataConnect = getDataConnect(connectorConfig);
const { data } = await updateStatementPaidStatus(dataConnect, updateStatementPaidStatusVars);

console.log(data.statement_update);

// Or, you can use the `Promise` API.
updateStatementPaidStatus(updateStatementPaidStatusVars).then((response) => {
  const data = response.data;
  console.log(data.statement_update);
});
```

### Using `UpdateStatementPaidStatus`'s `MutationRef` function

```typescript
import { getDataConnect, executeMutation } from 'firebase/data-connect';
import { connectorConfig, updateStatementPaidStatusRef, UpdateStatementPaidStatusVariables } from '@dataconnect/generated';

// The `UpdateStatementPaidStatus` mutation requires an argument of type `UpdateStatementPaidStatusVariables`:
const updateStatementPaidStatusVars: UpdateStatementPaidStatusVariables = {
  statementId: ..., 
  statementPaid: ..., 
};

// Call the `updateStatementPaidStatusRef()` function to get a reference to the mutation.
const ref = updateStatementPaidStatusRef(updateStatementPaidStatusVars);
// Variables can be defined inline as well.
const ref = updateStatementPaidStatusRef({ statementId: ..., statementPaid: ..., });

// You can also pass in a `DataConnect` instance to the `MutationRef` function.
const dataConnect = getDataConnect(connectorConfig);
const ref = updateStatementPaidStatusRef(dataConnect, updateStatementPaidStatusVars);

// Call `executeMutation()` on the reference to execute the mutation.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await executeMutation(ref);

console.log(data.statement_update);

// Or, you can use the `Promise` API.
executeMutation(ref).then((response) => {
  const data = response.data;
  console.log(data.statement_update);
});
```

