export interface Patient {
  id: string;
  accountNumber: string;
  patientName: string;
  firstName?: string;
  lastName?: string;
  dateOfBirth?: string; // YYYY-MM-DD
  email?: string;
  phone?: string;
  addressStreet?: string;
  addressCity?: string;
  addressState?: string;
  addressZip?: string;
  status?: "Active" | "Inactive" | "Collections";
  createdAt?: string;
  updatedAt?: string;
}

export interface Claim {
  id: string;

  // Patient & Account Info
  patientId?: string;
  accountNumber?: string;
  patientName: string;

  // Service Details
  serviceDate: string; // YYYY-MM-DD (DOS)
  cptHcpcsCode?: string;
  pharmacyOfService?: string;
  rxNumber?: string;

  // Financial Details
  totalChargedAmount: number;
  insuranceAdjustment: number;
  insurancePaid: number;
  patientResponsibility: number;
  patientPaidAmount: number;
  accountBalance: number;

  // Status & Workflow
  billingStatus: 'Pending' | 'Billed' | 'Paid' | 'Collections';
  paymentStatus: 'PAID' | 'DENIED' | 'PENDING';
  workflow: 'New' | 'Pending' | 'Complete' | 'Sent to Collections';

  // Statements
  statementCreatedDate?: string | null;
  statementMailed: boolean;
  statementTwoMailed: boolean;
  statementThreeMailed: boolean;
  statementSentAt?: string | null;
  statementSent2ndAt?: string | null;
  statementSent3rdAt?: string | null;
  statementPaid: boolean;

  // Additional Info
  notes?: string;

  // Metadata
  createdAt?: string;
  updatedAt?: string;
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

export interface Note {
  id: string;
  title: string;
  content?: string;
  body?: string;
  createdAt: string;
  updatedAt: string;
  tags?: string[];
  pinned?: boolean;
  mood?: "celebrate" | "todo" | "follow-up" | "idea";
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

export interface CSVUpload {
  id: string;
  fileName: string;
  filePath: string;
  uploadedBy?: string;
  uploadDate: string;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  recordsImported: number;
  errors?: string;
  createdAt: string;
}

export interface GeneratedStatement {
  id: string;
  patientId: string;
  accountNumber: string;
  statementDate: string;
  statementType: 'first' | 'second' | 'third';
  totalAmount: number;
  pdfPath?: string;
  sent: boolean;
  sentAt?: string | null;
  claimIds: string[];
  createdAt: string;
}

export interface StatementData {
  patient: Patient;
  claims: Claim[];
  accountNumber: string;
  totalAmountDue: number;
  statementDate: string;
  dueDate: string;
}