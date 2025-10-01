-- Database Schema for Jenn's Billing Studio
-- Run this in your Supabase SQL Editor

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Patients Table
CREATE TABLE IF NOT EXISTS patients (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  first_name TEXT,
  last_name TEXT,
  date_of_birth DATE,
  email TEXT,
  phone TEXT,
  status TEXT,
  street TEXT,
  city TEXT,
  state TEXT,
  zip TEXT,
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
  street TEXT,
  city TEXT,
  state TEXT,
  zip TEXT,
  notes TEXT,
  last_sync_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Notes Table
CREATE TABLE IF NOT EXISTS notes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title TEXT NOT NULL,
  content TEXT,
  pinned BOOLEAN DEFAULT FALSE,
  tags TEXT[],
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Claims Table
CREATE TABLE IF NOT EXISTS claims (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  check_date DATE NOT NULL,
  check_number TEXT NOT NULL,
  npi TEXT,
  payee TEXT,
  payer TEXT,
  rx TEXT,
  service_date DATE NOT NULL,
  cardholder_id TEXT,
  patient_name TEXT,
  patient_id UUID REFERENCES patients(id) ON DELETE SET NULL,
  service_description TEXT,
  product_id TEXT,
  amount DECIMAL(10, 2) DEFAULT 0,
  paid DECIMAL(10, 2) DEFAULT 0,
  adjustment DECIMAL(10, 2) DEFAULT 0,
  patient_pay DECIMAL(10, 2) DEFAULT 0,
  payment_status TEXT DEFAULT 'PENDING' CHECK (payment_status IN ('PAID', 'DENIED', 'PENDING')),
  posting_status TEXT DEFAULT 'Unposted' CHECK (posting_status IN ('Posted', 'Unposted')),
  workflow TEXT DEFAULT 'New' CHECK (workflow IN ('New', 'Pending', 'Complete', 'Sent to Collections')),
  notes TEXT,
  statement_sent BOOLEAN DEFAULT FALSE,
  statement_sent_2nd BOOLEAN DEFAULT FALSE,
  statement_sent_at TIMESTAMPTZ,
  statement_sent_2nd_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_patients_last_name ON patients(last_name);
CREATE INDEX IF NOT EXISTS idx_patients_email ON patients(email);
CREATE INDEX IF NOT EXISTS idx_pharmacies_name ON pharmacies(name);
CREATE INDEX IF NOT EXISTS idx_pharmacies_status ON pharmacies(status);
CREATE INDEX IF NOT EXISTS idx_claims_patient_id ON claims(patient_id);
CREATE INDEX IF NOT EXISTS idx_claims_check_date ON claims(check_date);
CREATE INDEX IF NOT EXISTS idx_claims_service_date ON claims(service_date);
CREATE INDEX IF NOT EXISTS idx_claims_payment_status ON claims(payment_status);
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
CREATE TRIGGER update_patients_updated_at
  BEFORE UPDATE ON patients
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_pharmacies_updated_at
  BEFORE UPDATE ON pharmacies
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_notes_updated_at
  BEFORE UPDATE ON notes
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_claims_updated_at
  BEFORE UPDATE ON claims
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Enable Row Level Security (RLS)
ALTER TABLE patients ENABLE ROW LEVEL SECURITY;
ALTER TABLE pharmacies ENABLE ROW LEVEL SECURITY;
ALTER TABLE notes ENABLE ROW LEVEL SECURITY;
ALTER TABLE claims ENABLE ROW LEVEL SECURITY;

-- Create policies (authenticated users can do everything for now)
-- You can customize these based on your security requirements

-- Patients policies
CREATE POLICY "Enable all access for authenticated users" ON patients
  FOR ALL USING (auth.role() = 'authenticated');

-- Pharmacies policies
CREATE POLICY "Enable all access for authenticated users" ON pharmacies
  FOR ALL USING (auth.role() = 'authenticated');

-- Notes policies
CREATE POLICY "Enable all access for authenticated users" ON notes
  FOR ALL USING (auth.role() = 'authenticated');

-- Claims policies
CREATE POLICY "Enable all access for authenticated users" ON claims
  FOR ALL USING (auth.role() = 'authenticated');

-- Create storage bucket for files
INSERT INTO storage.buckets (id, name, public)
VALUES ('files', 'files', false)
ON CONFLICT (id) DO NOTHING;

-- Storage policies for files bucket
CREATE POLICY "Authenticated users can upload files"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'files');

CREATE POLICY "Authenticated users can view files"
ON storage.objects FOR SELECT
TO authenticated
USING (bucket_id = 'files');

CREATE POLICY "Authenticated users can delete files"
ON storage.objects FOR DELETE
TO authenticated
USING (bucket_id = 'files');
