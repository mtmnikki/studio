-- Updated Database Schema for Jenn's Billing Studio (v2 - Real Data Model)
-- Run this in your Supabase SQL Editor

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Drop old tables if they exist (ONLY if you haven't populated data yet!)
-- DROP TABLE IF EXISTS claims CASCADE;
-- DROP TABLE IF EXISTS patients CASCADE;
-- DROP TABLE IF EXISTS pharmacies CASCADE;
-- DROP TABLE IF EXISTS notes CASCADE;

-- Patients Table (Enhanced with billing info)
CREATE TABLE IF NOT EXISTS patients (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  account_number TEXT UNIQUE NOT NULL,
  patient_name TEXT NOT NULL,
  first_name TEXT,
  last_name TEXT,
  date_of_birth DATE,
  email TEXT,
  phone TEXT,
  address_street TEXT,
  address_city TEXT,
  address_state TEXT,
  address_zip TEXT,
  status TEXT DEFAULT 'Active',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Pharmacies Table
CREATE TABLE IF NOT EXISTS pharmacies (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  npi TEXT,
  contact_name TEXT,
  phone TEXT,
  email TEXT,
  status TEXT DEFAULT 'Active',
  services TEXT[],
  address_street TEXT,
  address_city TEXT,
  address_state TEXT,
  address_zip TEXT,
  notes TEXT,
  last_sync_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Claims Table (Matches your real data model)
CREATE TABLE IF NOT EXISTS claims (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),

  -- Patient & Account Info
  patient_id UUID REFERENCES patients(id) ON DELETE SET NULL,
  account_number TEXT,
  patient_name TEXT NOT NULL,

  -- Service Details
  service_date DATE NOT NULL,
  cpt_hcpcs_code TEXT,
  pharmacy_of_service TEXT,
  rx_number TEXT,

  -- Financial Details
  total_charged_amount DECIMAL(10, 2) DEFAULT 0,
  insurance_adjustment DECIMAL(10, 2) DEFAULT 0,
  insurance_paid DECIMAL(10, 2) DEFAULT 0,
  patient_responsibility DECIMAL(10, 2) DEFAULT 0,
  patient_paid_amount DECIMAL(10, 2) DEFAULT 0,
  account_balance DECIMAL(10, 2) DEFAULT 0,

  -- Status & Workflow
  billing_status TEXT DEFAULT 'Pending' CHECK (billing_status IN ('Pending', 'Billed', 'Paid', 'Collections')),
  payment_status TEXT DEFAULT 'PENDING' CHECK (payment_status IN ('PAID', 'DENIED', 'PENDING')),
  workflow TEXT DEFAULT 'New' CHECK (workflow IN ('New', 'Pending', 'Complete', 'Sent to Collections')),

  -- Statements
  statement_created_date DATE,
  statement_mailed BOOLEAN DEFAULT FALSE,
  statement_two_mailed BOOLEAN DEFAULT FALSE,
  statement_three_mailed BOOLEAN DEFAULT FALSE,
  statement_sent_at TIMESTAMPTZ,
  statement_sent_2nd_at TIMESTAMPTZ,
  statement_sent_3rd_at TIMESTAMPTZ,
  statement_paid BOOLEAN DEFAULT FALSE,

  -- Additional Info
  notes TEXT,

  -- Metadata
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- CSV Uploads Table (Track uploaded files)
CREATE TABLE IF NOT EXISTS csv_uploads (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  file_name TEXT NOT NULL,
  file_path TEXT NOT NULL,
  uploaded_by TEXT,
  upload_date TIMESTAMPTZ DEFAULT NOW(),
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'processing', 'completed', 'failed')),
  records_imported INTEGER DEFAULT 0,
  errors TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Generated Statements Table (Track generated PDFs)
CREATE TABLE IF NOT EXISTS generated_statements (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  patient_id UUID REFERENCES patients(id) ON DELETE CASCADE,
  account_number TEXT,
  statement_date DATE NOT NULL,
  statement_type TEXT DEFAULT 'first' CHECK (statement_type IN ('first', 'second', 'third')),
  total_amount DECIMAL(10, 2) NOT NULL,
  pdf_path TEXT,
  sent BOOLEAN DEFAULT FALSE,
  sent_at TIMESTAMPTZ,
  claim_ids UUID[] DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Notes Table (Keep existing notes functionality)
CREATE TABLE IF NOT EXISTS notes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title TEXT NOT NULL,
  content TEXT,
  body TEXT,
  pinned BOOLEAN DEFAULT FALSE,
  tags TEXT[],
  mood TEXT CHECK (mood IN ('celebrate', 'todo', 'follow-up', 'idea')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_patients_account_number ON patients(account_number);
CREATE INDEX IF NOT EXISTS idx_patients_last_name ON patients(last_name);
CREATE INDEX IF NOT EXISTS idx_patients_email ON patients(email);

CREATE INDEX IF NOT EXISTS idx_pharmacies_name ON pharmacies(name);
CREATE INDEX IF NOT EXISTS idx_pharmacies_status ON pharmacies(status);

CREATE INDEX IF NOT EXISTS idx_claims_patient_id ON claims(patient_id);
CREATE INDEX IF NOT EXISTS idx_claims_account_number ON claims(account_number);
CREATE INDEX IF NOT EXISTS idx_claims_service_date ON claims(service_date);
CREATE INDEX IF NOT EXISTS idx_claims_billing_status ON claims(billing_status);
CREATE INDEX IF NOT EXISTS idx_claims_payment_status ON claims(payment_status);
CREATE INDEX IF NOT EXISTS idx_claims_pharmacy ON claims(pharmacy_of_service);

CREATE INDEX IF NOT EXISTS idx_csv_uploads_status ON csv_uploads(status);
CREATE INDEX IF NOT EXISTS idx_csv_uploads_date ON csv_uploads(upload_date DESC);

CREATE INDEX IF NOT EXISTS idx_statements_patient_id ON generated_statements(patient_id);
CREATE INDEX IF NOT EXISTS idx_statements_date ON generated_statements(statement_date DESC);

CREATE INDEX IF NOT EXISTS idx_notes_created_at ON notes(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_notes_pinned ON notes(pinned);

-- Function to automatically update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers for updated_at
DROP TRIGGER IF EXISTS update_patients_updated_at ON patients;
CREATE TRIGGER update_patients_updated_at
  BEFORE UPDATE ON patients
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_pharmacies_updated_at ON pharmacies;
CREATE TRIGGER update_pharmacies_updated_at
  BEFORE UPDATE ON pharmacies
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_notes_updated_at ON notes;
CREATE TRIGGER update_notes_updated_at
  BEFORE UPDATE ON notes
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_claims_updated_at ON claims;
CREATE TRIGGER update_claims_updated_at
  BEFORE UPDATE ON claims
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Function to calculate account balance
CREATE OR REPLACE FUNCTION calculate_account_balance()
RETURNS TRIGGER AS $$
BEGIN
  NEW.account_balance = NEW.patient_responsibility - COALESCE(NEW.patient_paid_amount, 0);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to auto-calculate account balance
DROP TRIGGER IF EXISTS auto_calculate_balance ON claims;
CREATE TRIGGER auto_calculate_balance
  BEFORE INSERT OR UPDATE ON claims
  FOR EACH ROW
  EXECUTE FUNCTION calculate_account_balance();

-- Enable Row Level Security (RLS)
ALTER TABLE patients ENABLE ROW LEVEL SECURITY;
ALTER TABLE pharmacies ENABLE ROW LEVEL SECURITY;
ALTER TABLE claims ENABLE ROW LEVEL SECURITY;
ALTER TABLE csv_uploads ENABLE ROW LEVEL SECURITY;
ALTER TABLE generated_statements ENABLE ROW LEVEL SECURITY;
ALTER TABLE notes ENABLE ROW LEVEL SECURITY;

-- Create policies (authenticated users can do everything for now)
-- Patients policies
DROP POLICY IF EXISTS "Enable all access for authenticated users" ON patients;
CREATE POLICY "Enable all access for authenticated users" ON patients
  FOR ALL USING (auth.role() = 'authenticated');

-- Pharmacies policies
DROP POLICY IF EXISTS "Enable all access for authenticated users" ON pharmacies;
CREATE POLICY "Enable all access for authenticated users" ON pharmacies
  FOR ALL USING (auth.role() = 'authenticated');

-- Claims policies
DROP POLICY IF EXISTS "Enable all access for authenticated users" ON claims;
CREATE POLICY "Enable all access for authenticated users" ON claims
  FOR ALL USING (auth.role() = 'authenticated');

-- CSV uploads policies
DROP POLICY IF EXISTS "Enable all access for authenticated users" ON csv_uploads;
CREATE POLICY "Enable all access for authenticated users" ON csv_uploads
  FOR ALL USING (auth.role() = 'authenticated');

-- Statements policies
DROP POLICY IF EXISTS "Enable all access for authenticated users" ON generated_statements;
CREATE POLICY "Enable all access for authenticated users" ON generated_statements
  FOR ALL USING (auth.role() = 'authenticated');

-- Notes policies
DROP POLICY IF EXISTS "Enable all access for authenticated users" ON notes;
CREATE POLICY "Enable all access for authenticated users" ON notes
  FOR ALL USING (auth.role() = 'authenticated');

-- Create storage buckets
INSERT INTO storage.buckets (id, name, public)
VALUES
  ('csv-uploads', 'csv-uploads', false),
  ('statements', 'statements', false),
  ('files', 'files', false)
ON CONFLICT (id) DO NOTHING;

-- Storage policies for csv-uploads bucket
DROP POLICY IF EXISTS "Authenticated users can upload CSVs" ON storage.objects;
CREATE POLICY "Authenticated users can upload CSVs"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'csv-uploads');

DROP POLICY IF EXISTS "Authenticated users can view CSVs" ON storage.objects;
CREATE POLICY "Authenticated users can view CSVs"
ON storage.objects FOR SELECT
TO authenticated
USING (bucket_id = 'csv-uploads');

-- Storage policies for statements bucket
DROP POLICY IF EXISTS "Authenticated users can upload statements" ON storage.objects;
CREATE POLICY "Authenticated users can upload statements"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'statements');

DROP POLICY IF EXISTS "Authenticated users can view statements" ON storage.objects;
CREATE POLICY "Authenticated users can view statements"
ON storage.objects FOR SELECT
TO authenticated
USING (bucket_id = 'statements');

-- Storage policies for files bucket
DROP POLICY IF EXISTS "Authenticated users can upload files" ON storage.objects;
CREATE POLICY "Authenticated users can upload files"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'files');

DROP POLICY IF EXISTS "Authenticated users can view files" ON storage.objects;
CREATE POLICY "Authenticated users can view files"
ON storage.objects FOR SELECT
TO authenticated
USING (bucket_id = 'files');

DROP POLICY IF EXISTS "Authenticated users can delete files" ON storage.objects;
CREATE POLICY "Authenticated users can delete files"
ON storage.objects FOR DELETE
TO authenticated
USING (bucket_id = 'files');

-- View for statement generation
CREATE OR REPLACE VIEW patient_statement_view AS
SELECT
  p.id as patient_id,
  p.account_number,
  p.patient_name,
  p.date_of_birth,
  p.address_street,
  p.address_city,
  p.address_state,
  p.address_zip,
  COUNT(c.id) as total_claims,
  SUM(c.account_balance) as total_balance,
  MAX(c.service_date) as last_service_date,
  BOOL_OR(c.statement_mailed) as any_statement_sent
FROM patients p
LEFT JOIN claims c ON p.id = c.patient_id
WHERE c.account_balance > 0
GROUP BY p.id, p.account_number, p.patient_name, p.date_of_birth,
         p.address_street, p.address_city, p.address_state, p.address_zip;
