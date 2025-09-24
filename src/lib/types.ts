export interface Patient {
  id: string;
  firstName: string;
  lastName: string;
  dateOfBirth: string; // YYYY-MM-DD
  address: {
    street: string;
    city: string;
    state: string;
    zip: string;
  };
}

export interface Claim {
  id: string;
  checkDate: string; // YYYY-MM-DD
  checkNumber: string;
  npi: string;
  payee: string;
  payer: string;
  rx: string;
  serviceDate: string; // YYYY-MM-DD, also known as DOS
  cardholderId: string;
  patientName: string; // Denormalized for easy display
  patientId: string;
  serviceDescription: string; // also known as Product/Service
  productId: string; // CPT/HCPCS Code
  amount: number; // also known as Billed
  paid: number;
  adjustment: number;
  patientPay: number;
  paymentStatus: 'PAID' | 'DENIED' | 'PENDING';
  postingStatus: 'Posted' | 'Unposted';
  workflow: string; // From options in image
  notes: string;
  statementSent: boolean; // 1st Statement Sent?
}
