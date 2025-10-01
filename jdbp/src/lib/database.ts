// Helper aliases (optional)
export type UUID = string;
export type TimestamptzString = string; // ISO string
export type DateString = string;        // YYYY-MM-DD
export type NumericString = string;     // Supabase returns numeric as string

// Enums
export type Role = 'admin' | 'pharmacy';
export type BillingStatus = 'Pending' | 'Billed' | 'Paid' | 'Collections';
export type PaymentStatus = 'PAID' | 'DENIED' | 'PENDING';
export type Workflow = 'New' | 'Pending' | 'Complete' | 'Sent to Collections';
export type CsvUploadStatus = 'pending' | 'processing' | 'completed' | 'failed';
export type StatementType = 'first' | 'second' | 'third';
export type NoteMood = 'celebrate' | 'todo' | 'follow-up' | 'idea';

// accounts
export interface Accounts {
    account_id: UUID;
    email: string;
    pharmacy_name: string | null;
    subscription_status: string | null; // default 'active'
    created_at: TimestamptzString | null;
    updated_at: TimestamptzString | null;
    pharmacy_phone: string | null;
    address1: string | null;
    city: string | null;
    state: string | null;
    zipcode: string | null;
    role: Role; // default 'pharmacy'
}

// claims
export interface Claims {
    id: UUID;
    patient_id: UUID | null;
    account_number: string | null;
    patient_name: string;
    service_date: DateString;
    cpt_hcpcs_code: string | null;
    pharmacy_of_service: string | null;
    rx_number: string | null;
    total_charged_amount: NumericString | null; // default 0
    insurance_adjustment: NumericString | null; // default 0
    insurance_paid: NumericString | null;       // default 0
    patient_responsibility: NumericString | null; // default 0
    patient_paid_amount: NumericString | null;  // default 0
    account_balance: NumericString | null;      // default 0
    billing_status: BillingStatus | null;       // default 'Pending'
    payment_status: PaymentStatus | null;       // default 'PENDING'
    workflow: Workflow | null;                  // default 'New'
    statement_created_date: DateString | null;
    statement_mailed: boolean | null;           // default false
    statement_two_mailed: boolean | null;       // default false
    statement_three_mailed: boolean | null;     // default false
    statement_sent_at: TimestamptzString | null;
    statement_sent_2nd_at: TimestamptzString | null;
    statement_sent_3rd_at: TimestamptzString | null;
    statement_paid: boolean | null;             // default false
    notes: string | null;
    created_at: TimestamptzString | null;       // default now()
    updated_at: TimestamptzString | null;       // default now()
}

// csv_uploads
export interface CsvUploads {
    id: UUID;
    file_name: string;
    file_path: string;
    uploaded_by: string | null;
    upload_date: TimestamptzString | null;   // default now()
    status: CsvUploadStatus | null;          // default 'pending'
    records_imported: number | null;         // default 0
    errors: string | null;
    created_at: TimestamptzString | null;    // default now()
}

// generated_statements
export interface GeneratedStatements {
    id: UUID;
    patient_id: UUID | null;
    account_number: string | null;
    statement_date: DateString;
    statement_type: StatementType | null;    // default 'first'
    total_amount: NumericString;
    pdf_path: string | null;
    sent: boolean | null;                    // default false
    sent_at: TimestamptzString | null;
    claim_ids: UUID[] | null;                // default []
    created_at: TimestamptzString | null;    // default now()
}

// notes
export interface Notes {
    id: UUID;
    title: string;
    content: string | null;
    body: string | null;
    pinned: boolean | null;                  // default false
    tags: string[] | null;
    mood: NoteMood | null;
    created_at: TimestamptzString | null;    // default now()
    updated_at: TimestamptzString | null;    // default now()
}

// patients
export interface Patients {
    id: UUID;
    account_number: string;                  // unique
    patient_name: string;
    first_name: string | null;
    last_name: string | null;
    date_of_birth: DateString | null;
    email: string | null;
    phone: string | null;
    address_street: string | null;
    address_city: string | null;
    address_state: string | null;
    address_zip: string | null;
    status: string | null;                   // default 'Active'
    created_at: TimestamptzString | null;    // default now()
    updated_at: TimestamptzString | null;    // default now()
}

// pharmacies
export interface Pharmacies {
    id: UUID;
    name: string;
    npi: string | null;
    contact_name: string | null;
    phone: string | null;
    email: string | null;
    status: string | null;                   // default 'Active'
    services: string[] | null;
    address_street: string | null;
    address_city: string | null;
    address_state: string | null;
    address_zip: string | null;
    notes: string | null;
    last_sync_at: TimestamptzString | null;
    created_at: TimestamptzString | null;    // default now()
    updated_at: TimestamptzString | null;    // default now()
}