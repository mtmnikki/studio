export interface PatientAddress {
  street?: string;
  city?: string;
  state?: string;
  zip?: string;
}

export interface Patient {
  id: string;
  firstName?: string;
  lastName?: string;
  dateOfBirth?: string; // YYYY-MM-DD
  email?: string;
  phone?: string;
  status?: string;
  createdAt?: string;
  updatedAt?: string;
  address?: PatientAddress;
}

export interface Pharmacy {
  id: string;
  name: string;
  contactName?: string;
  phone?: string;
  email?: string;
  status?: string;
  tags?: string[];
  notes?: string;
  address?: {
    street?: string;
    city?: string;
    state?: string;
    zip?: string;
  };
  lastUpdated?: string;
  createdAt?: string;
}

export interface Note {
  id: string;
  title: string;
  content: string;
  createdAt: string;
  updatedAt: string;
  pinned?: boolean;
  tags?: string[];
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
  workflow: 'New' | 'Pending' | 'Complete' | 'Sent to Collections';
  notes: string;
  statementSent: boolean; // 1st Statement Sent?
  statementSent2nd: boolean; // 2nd Statement Sent?
  statementSentAt?: string | null;
  statementSent2ndAt?: string | null;
}

export interface Pharmacy {
  id: string;
  name: string;
  npi?: string;
  contactName?: string;
  phone?: string;
  email?: string;
  status?: "Active" | "Paused" | "Prospect";
  services?: string[];
  address?: {
    street?: string;
    city?: string;
    state?: string;
    zip?: string;
  };
  notes?: string;
  lastSyncAt?: string | null;
}

export interface JennNote {
  id: string;
  title: string;
  body: string;
  createdAt: string;
  updatedAt: string;
  tags?: string[];
  mood?: "celebrate" | "todo" | "follow-up" | "idea";
}
