import type { Patient, Claim } from './types';

export const patients: Patient[] = [
  {
    id: 'pat_001',
    firstName: 'Alice',
    lastName: 'Smith',
    dateOfBirth: '1985-05-15',
    address: {
      street: '123 Maple St',
      city: 'Anytown',
      state: 'CA',
      zip: '12345',
    },
  },
  {
    id: 'pat_002',
    firstName: 'Bob',
    lastName: 'Johnson',
    dateOfBirth: '1992-11-20',
    address: {
      street: '456 Oak Ave',
      city: 'Someville',
      state: 'NY',
      zip: '54321',
    },
  },
  {
    id: 'pat_003',
    firstName: 'Charlie',
    lastName: 'Brown',
    dateOfBirth: '1978-02-10',
    address: {
      street: '789 Pine Ln',
      city: 'Metropolis',
      state: 'IL',
      zip: '67890',
    },
  },
];

export const claims: Claim[] = [
  {
    id: 'clm_001',
    checkDate: '2024-09-04',
    checkNumber: '170242487',
    npi: '1043310360',
    payee: 'Price Cutter Pha',
    payer: 'Blue Cross Blue',
    rx: '8009837',
    serviceDate: '2024-02-16', // DOS
    cardholderId: 'MOV500241550',
    patientName: 'KEEGAN OWEN',
    patientId: 'pat_001',
    serviceDescription: 'Infectious agent', // Product
    productId: '87430',
    amount: 35.22, // Billed
    paid: 0.00,
    adjustment: 35.22,
    patientPay: 0.00,
    paymentStatus: 'DENIED',
    postingStatus: 'Posted',
    workflow: 'Pending',
    notes: 'We will not receive payment',
    statementSent: true,
    statementSent2nd: false,
  },
  {
    id: 'clm_002',
    checkDate: '2024-09-05',
    checkNumber: 'ST0009089395',
    npi: '1043310360',
    payee: 'Price Cutter Pha',
    payer: 'Blue Cross Blue',
    rx: '8104353',
    serviceDate: '2024-08-19', // DOS
    cardholderId: 'XCHK00417800',
    patientName: 'KRISTI HAMILTO',
    patientId: 'pat_002',
    serviceDescription: 'Infectious agen', // Product
    productId: '87430',
    amount: 35.22, // Billed
    paid: 18.92,
    adjustment: 16.30,
    patientPay: 0.00,
    paymentStatus: 'PAID',
    postingStatus: 'Posted',
    workflow: 'New',
    notes: 'Paid- see payment on other influenza test',
    statementSent: false,
    statementSent2nd: false,
  },
  {
    id: 'clm_003',
    checkDate: '2024-09-04',
    checkNumber: '170242487',
    npi: '1043310360',
    payee: 'Price Cutter Pha',
    payer: 'Blue Cross Blue',
    rx: '8009836',
    serviceDate: '2024-02-16', // DOS
    cardholderId: 'MOV500241550',
    patientName: 'KEEGAN OWEN',
    patientId: 'pat_001',
    serviceDescription: 'Infectious agen', // Product
    productId: '87400',
    amount: 62.40, // Billed
    paid: 0.00,
    adjustment: 62.40,
    patientPay: 0.00,
    paymentStatus: 'DENIED',
    postingStatus: 'Posted',
    workflow: 'New',
    notes: 'Patient Meeting Deductible/Co-insurance',
    statementSent: false,
    statementSent2nd: false,
  },
  {
    id: 'clm_004',
    checkDate: '2024-09-09',
    checkNumber: 'AB0009454575',
    npi: '1043310360',
    payee: 'Price Cutter Pha',
    payer: 'Blue Cross Blue',
    rx: '8010331',
    serviceDate: '2024-08-01', // DOS
    cardholderId: 'EXX600619358',
    patientName: 'MORGAN TILGH',
    patientId: 'pat_003',
    serviceDescription: 'E/M New Patier', // Product
    productId: '99202',
    amount: 103.77, // Billed
    paid: 64.38,
    adjustment: 39.39,
    patientPay: 0.00,
    paymentStatus: 'PAID',
    postingStatus: 'Unposted',
    workflow: 'Complete',
    notes: 'Payment Received',
    statementSent: true,
    statementSent2nd: true,
  },
  {
    id: 'clm_005',
    checkDate: '2024-09-11',
    checkNumber: '9823523',
    npi: '1336768985',
    payee: 'Harps Pharmac',
    payer: 'Blue Cross Blue',
    rx: '8003388',
    serviceDate: '2024-09-03', // DOS
    cardholderId: 'CZQAN5652440',
    patientName: 'BRANTLEY FAR',
    patientId: 'pat_003',
    serviceDescription: 'Infectious agent', // Product
    productId: '87430',
    amount: 35.22, // Billed
    paid: 18.92,
    adjustment: 16.30,
    patientPay: 0.00,
    paymentStatus: 'PAID',
    postingStatus: 'Posted',
    workflow: 'New',
    notes: '',
    statementSent: false,
    statementSent2nd: false,
  },
];
