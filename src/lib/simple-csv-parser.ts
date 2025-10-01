import Papa from 'papaparse';

export interface SimpleColumnMapping {
  csvColumn: string;
  targetField: string;
}

// Common column name mappings - ONLY FIELDS IN CLAIMS TABLE
// ALL MAPPINGS USE SNAKE_CASE TO MATCH DATABASE SCHEMA
const AUTO_MAPPINGS: Record<string, string> = {
  // Account/Patient Info (ONLY fields that exist in claims table)
  'account_number': 'account_number',
  'accountnumber': 'account_number',
  'account': 'account_number',
  'acct': 'account_number',
  'patient_name': 'patient_name',
  'patientname': 'patient_name',
  'name': 'patient_name',
  'patient': 'patient_name',

  // Service Info
  'service_date': 'service_date',
  'servicedate': 'service_date',
  'date_of_service': 'service_date',
  'dos': 'service_date',
  'cpt_hcpcs_code': 'cpt_hcpcs_code',
  'cpt': 'cpt_hcpcs_code',
  'hcpcs': 'cpt_hcpcs_code',
  'code': 'cpt_hcpcs_code',
  'procedure_code': 'cpt_hcpcs_code',
  'pharmacy_of_service': 'pharmacy_of_service',
  'pharmacy': 'pharmacy_of_service',
  'location': 'pharmacy_of_service',
  'rx_number': 'rx_number',
  'rx': 'rx_number',
  'prescription_number': 'rx_number',

  // Financial
  'total_charged_amount': 'total_charged_amount',
  'charged_amount': 'total_charged_amount',
  'billed': 'total_charged_amount',
  'charge': 'total_charged_amount',
  'amount': 'total_charged_amount',
  'total_charge': 'total_charged_amount',
  'insurance_adjustment': 'insurance_adjustment',
  'adjustment': 'insurance_adjustment',
  'ins_adjustment': 'insurance_adjustment',
  'insurance_paid': 'insurance_paid',
  'ins_paid': 'insurance_paid',
  'paid': 'insurance_paid',
  'insurance_payment': 'insurance_paid',
  'patient_responsibility': 'patient_responsibility',
  'patient_resp': 'patient_responsibility',
  'patient_pay': 'patient_responsibility',
  'patient_portion': 'patient_responsibility',
  'patient_paid_amount': 'patient_paid_amount',
  'paid_amount': 'patient_paid_amount',
  'amount_paid': 'patient_paid_amount',
  'account_balance': 'account_balance',
  'balance_due': 'account_balance',
  'balance': 'account_balance',

  // Status fields
  'billing_status': 'billing_status',
  'status': 'billing_status',
  'payment_status': 'payment_status',
  'workflow': 'workflow',

  // Statement DATES - map to the _at fields, NOT the boolean _mailed fields
  'statement_mailed': 'statement_sent_at',
  'statement_sent': 'statement_sent_at',
  'statement_1_date': 'statement_sent_at',
  'statement_two_mailed': 'statement_sent_2nd_at',
  'statement_2_date': 'statement_sent_2nd_at',
  'statement_three_mailed': 'statement_sent_3rd_at',
  'statement_3_date': 'statement_sent_3rd_at',
  'statement_created_date': 'statement_created_date',
  'statement_date': 'statement_created_date',
  'statement_paid': 'statement_created_date', // Map to created date for now

  'notes': 'notes',
  'note': 'notes',
  'comment': 'notes',
  'comments': 'notes',
};

export function autoMapColumns(csvHeaders: string[]): SimpleColumnMapping[] {
  return csvHeaders.map(header => {
    const normalized = header.toLowerCase().trim().replace(/\s+/g, '_');
    const mappedField = AUTO_MAPPINGS[normalized] || 'unmapped';

    return {
      csvColumn: header,
      targetField: mappedField,
    };
  });
}

export interface ParsedSimpleCSV {
  headers: string[];
  rows: any[];
  mappings: SimpleColumnMapping[];
  totalRows: number;
}

export async function parseSimpleCSV(file: File): Promise<ParsedSimpleCSV> {
  return new Promise((resolve, reject) => {
    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      complete: (results) => {
        const headers = results.meta.fields || [];
        const mappings = autoMapColumns(headers);

        resolve({
          headers,
          rows: results.data,
          mappings,
          totalRows: results.data.length,
        });
      },
      error: (error) => {
        reject(error);
      },
    });
  });
}

export function transformSimpleCSVToClaims(
  rows: any[],
  mappings: SimpleColumnMapping[]
): any[] {
  // Log mappings for debugging
  console.log('Column mappings:', mappings.filter(m => m.targetField !== 'unmapped'));

  return rows.map((row, index) => {
    const claim: any = {};
    // Don't set ID - let PostgreSQL generate UUID automatically

    // Apply mappings
    mappings.forEach(({ csvColumn, targetField }) => {
      if (targetField !== 'unmapped' && row[csvColumn] !== undefined) {
        const value = row[csvColumn];

        // Skip empty values
        if (value === null || value === undefined || value === '') {
          return;
        }

        // Handle different data types based on field name
        if (targetField.includes('_amount') || targetField.includes('_paid') || targetField.includes('_adjustment') || targetField.includes('_balance') || targetField.includes('_responsibility')) {
          // Financial fields - convert to number
          claim[targetField] = parseFloat(value) || 0;
        } else if (targetField.includes('_mailed') || targetField === 'statement_paid') {
          // Boolean fields - ONLY accept actual boolean values
          const lowerValue = String(value).toLowerCase().trim();
          // If it's a number other than 0 or 1, skip it
          if (!isNaN(Number(value)) && value !== '0' && value !== '1') {
            console.warn(`Skipping non-boolean value "${value}" for field "${targetField}"`);
            return; // Skip this field entirely
          }
          claim[targetField] = lowerValue === 'true' || lowerValue === '1' || lowerValue === 'yes' || lowerValue === 't';
        } else if (targetField.includes('_date') || targetField.includes('_at')) {
          // Date/timestamp fields - keep as string
          claim[targetField] = value;
        } else {
          // String fields
          claim[targetField] = value;
        }
      }
    });

    // Set defaults ONLY for required NOT NULL fields
    if (!claim.patient_name) claim.patient_name = 'Unknown Patient';
    if (!claim.service_date) claim.service_date = new Date().toISOString().split('T')[0];

    // Set numeric defaults only if completely missing
    if (claim.total_charged_amount === undefined || claim.total_charged_amount === null) {
      claim.total_charged_amount = 0;
    }
    if (claim.insurance_paid === undefined || claim.insurance_paid === null) {
      claim.insurance_paid = 0;
    }
    if (claim.insurance_adjustment === undefined || claim.insurance_adjustment === null) {
      claim.insurance_adjustment = 0;
    }
    if (claim.patient_responsibility === undefined || claim.patient_responsibility === null) {
      claim.patient_responsibility = 0;
    }
    if (claim.patient_paid_amount === undefined || claim.patient_paid_amount === null) {
      claim.patient_paid_amount = 0;
    }
    if (claim.account_balance === undefined || claim.account_balance === null) {
      claim.account_balance = 0;
    }

    // DO NOT set boolean defaults - let database handle them

    return claim;
  });
}
