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
    patientId: 'pat_001',
    patientName: 'KEEGAN OWEN',
    serviceDate: '2024-02-16', // DOS
    serviceDescription: 'Infectious agent', // Product
    amount: 35.22, // Billed
    statementSent: true,
    checkNumber: '170242487',
    checkDate: '2024-09-04',
    npi: '1043310360',
    payee: 'Price Cutter Pha',
    payer: 'Blue Cross Blue',
    rx: '8009837',
    cardholder: 'MOV500241550',
    productId: '87430',
    paid: 0.00,
    patientPay: 0.00,
    adjustment: 35.22,
    paymentStatus: 'DENIED',
    postingStatus: 'Posted',
  },
  {
    id: 'clm_002',
    patientId: 'pat_002',
    patientName: 'KRISTI HAMILTO',
    serviceDate: '2024-08-19', // DOS
    serviceDescription: 'Infectious agen', // Product
    amount: 35.22, // Billed
    statementSent: false,
    checkNumber: 'ST0009089395',
    checkDate: '2024-09-05',
    npi: '1043310360',
    payee: 'Price Cutter Pha',
    payer: 'Blue Cross Blue',
    rx: '8104353',
    cardholder: 'XCHK00417800',
    productId: '87430',
    paid: 18.92,
    patientPay: 0.00,
    adjustment: 16.30,
    paymentStatus: 'PAID',
    postingStatus: 'Posted',
  },
  {
    id: 'clm_003',
    patientId: 'pat_001',
    patientName: 'KEEGAN OWEN',
    serviceDate: '2024-02-16', // DOS
    serviceDescription: 'Infectious agen', // Product
    amount: 62.40, // Billed
    statementSent: false,
    checkNumber: '170242487',
    checkDate: '2024-09-04',
    npi: '1043310360',
    payee: 'Price Cutter Pha',
    payer: 'Blue Cross Blue',
    rx: '8009836',
    cardholder: 'MOV500241550',
    productId: '87400',
    paid: 0.00,
    patientPay: 0.00,
    adjustment: 62.40,
    paymentStatus: 'DENIED',
    postingStatus: 'Posted',
  },
  {
    id: 'clm_004',
    patientId: 'pat_003',
    patientName: 'MORGAN TILGH',
    serviceDate: '2024-08-01', // DOS
    serviceDescription: 'E/M New Patier', // Product
    amount: 103.77, // Billed
    statementSent: true,
    checkNumber: 'AB0009454575',
    checkDate: '2024-09-09',
    npi: '1043310360',
    payee: 'Price Cutter Pha',
    payer: 'Blue Cross Blue',
    rx: '8010331',
    cardholder: 'EXX600619358',
    productId: '99202',
    paid: 64.38,
    patientPay: 0.00,
    adjustment: 39.39,
    paymentStatus: 'PAID',
    postingStatus: 'Unposted',
  },
  {
    id: 'clm_005',
    patientId: 'pat_003',
    patientName: 'BRANTLEY FAR',
    serviceDate: '2024-09-03', // DOS
    serviceDescription: 'Infectious agent', // Product
    amount: 35.22, // Billed
    statementSent: false,
    checkNumber: '9823523',
    checkDate: '2024-09-11',
    npi: '1336768985',
    payee: 'Harps Pharmac',
    payer: 'Blue Cross Blue',
    rx: '8003388',
    cardholder: 'CZQAN5652440',
    productId: '87430',
    paid: 18.92,
    patientPay: 0.00,
    adjustment: 16.30,
    paymentStatus: 'PAID',
    postingStatus: 'Posted',
  },
];
