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
  serviceDate: string; // YYYY-MM-DD
  serviceDescription: string;
  amount: number;
  statementSent: boolean;
  checkNumber: string;
  checkDate: string;
}
