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
  patientId: string;
  patientName: string; // Denormalized for easy display
  serviceDate: string; // YYYY-MM-DD, also known as DOS
  serviceDescription: string; // also known as Product
  amount: number; // also known as Billed
  statementSent: boolean;
  checkNumber: string;
  checkDate: string;

  // Fields from image
  npi: string;
  payee: string;
  payer: string;
  rx: string;
  cardholder: string;
  productId: string;
  paid: number;
  patientPay: number;
  adjustment: number;
  paymentStatus: 'PAID' | 'DENIED' | 'PENDING';
  postingStatus: 'Posted' | 'Unposted';
}
