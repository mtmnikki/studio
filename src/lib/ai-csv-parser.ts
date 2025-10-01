import OpenAI from 'openai';
import Papa from 'papaparse';

export interface CSVColumn {
  originalName: string;
  mappedName: string;
  confidence: number;
}

export interface ParsedCSVData {
  mappedColumns: CSVColumn[];
  rows: any[];
  totalRows: number;
}

// Target schema for claims data
const TARGET_SCHEMA = {
  account_number: 'Account number or patient ID',
  patient_name: 'Patient full name',
  date_of_birth: 'Patient date of birth',
  address_street: 'Patient street address',
  address_city: 'Patient city',
  address_state: 'Patient state',
  address_zip: 'Patient ZIP code',
  service_date: 'Date of service (DOS)',
  cpt_hcpcs_code: 'CPT or HCPCS code',
  pharmacy_of_service: 'Pharmacy name or location',
  rx_number: 'Prescription/RX number',
  total_charged_amount: 'Total amount charged/billed',
  insurance_adjustment: 'Insurance adjustment/contractual',
  insurance_paid: 'Amount paid by insurance',
  patient_responsibility: 'Patient responsibility/patient pay',
  patient_paid_amount: 'Amount already paid by patient',
  account_balance: 'Outstanding balance',
  billing_status: 'Billing status',
  notes: 'Notes or comments',
};

export async function analyzeCSVColumns(
  csvHeaders: string[],
  sampleRows: any[],
  openaiApiKey: string
): Promise<Record<string, string>> {
  const openai = new OpenAI({
    apiKey: openaiApiKey,
    dangerouslyAllowBrowser: true, // Note: In production, this should be done server-side
  });

  const prompt = `You are a medical billing data expert. I have a CSV file with the following columns:

${csvHeaders.map((h, i) => `${i + 1}. "${h}"`).join('\n')}

Here are 2 sample rows of data:
${JSON.stringify(sampleRows.slice(0, 2), null, 2)}

I need to map these columns to my target database schema. The target fields are:

${Object.entries(TARGET_SCHEMA)
  .map(([key, desc]) => `- ${key}: ${desc}`)
  .join('\n')}

Please analyze the CSV columns and map each one to the most appropriate target field. Return ONLY a JSON object with the mapping, where keys are the original CSV column names and values are the target field names. If a column doesn't match any target field, map it to "unmapped".

Example format:
{
  "Patient Name": "patient_name",
  "DOB": "date_of_birth",
  "Unknown Column": "unmapped"
}`;

  try {
    const response = await openai.chat.completions.create({
      model: process.env.NEXT_PUBLIC_OPENAI_MODEL || 'gpt-4o-mini',
      messages: [
        {
          role: 'system',
          content:
            'You are a data mapping expert. Return only valid JSON, no markdown formatting or explanations.',
        },
        {
          role: 'user',
          content: prompt,
        },
      ],
      temperature: 0.3,
      max_tokens: 1000,
    });

    const content = response.choices[0].message.content?.trim() || '{}';
    // Remove markdown code blocks if present
    const jsonContent = content.replace(/```json\n?/g, '').replace(/```\n?/g, '');
    const mapping = JSON.parse(jsonContent);

    return mapping;
  } catch (error) {
    console.error('Error analyzing CSV columns:', error);
    throw new Error('Failed to analyze CSV columns with AI');
  }
}

export async function parseCSVWithAI(
  file: File,
  openaiApiKey: string
): Promise<ParsedCSVData> {
  return new Promise((resolve, reject) => {
    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      complete: async (results) => {
        try {
          const csvHeaders = results.meta.fields || [];
          const rows = results.data;

          if (rows.length === 0) {
            reject(new Error('CSV file is empty'));
            return;
          }

          // Get AI mapping
          const mapping = await analyzeCSVColumns(csvHeaders, rows, openaiApiKey);

          // Create mapped columns info
          const mappedColumns: CSVColumn[] = csvHeaders.map((header) => ({
            originalName: header,
            mappedName: mapping[header] || 'unmapped',
            confidence: mapping[header] === 'unmapped' ? 0 : 0.9,
          }));

          // Transform rows using the mapping
          const transformedRows = rows.map((row: any) => {
            const transformed: any = {};
            csvHeaders.forEach((header) => {
              const targetField = mapping[header];
              if (targetField && targetField !== 'unmapped') {
                transformed[targetField] = row[header];
              }
            });
            return transformed;
          });

          resolve({
            mappedColumns,
            rows: transformedRows,
            totalRows: transformedRows.length,
          });
        } catch (error) {
          reject(error);
        }
      },
      error: (error) => {
        reject(new Error(`CSV parsing error: ${error.message}`));
      },
    });
  });
}

export function transformToClaimData(parsedData: any): any {
  return {
    account_number: parsedData.account_number || '',
    patient_name: parsedData.patient_name || '',
    service_date: parsedData.service_date || new Date().toISOString().split('T')[0],
    cpt_hcpcs_code: parsedData.cpt_hcpcs_code || '',
    pharmacy_of_service: parsedData.pharmacy_of_service || '',
    rx_number: parsedData.rx_number || '',
    total_charged_amount: parseFloat(parsedData.total_charged_amount) || 0,
    insurance_adjustment: parseFloat(parsedData.insurance_adjustment) || 0,
    insurance_paid: parseFloat(parsedData.insurance_paid) || 0,
    patient_responsibility: parseFloat(parsedData.patient_responsibility) || 0,
    patient_paid_amount: parseFloat(parsedData.patient_paid_amount) || 0,
    account_balance:
      parseFloat(parsedData.patient_responsibility || 0) -
      parseFloat(parsedData.patient_paid_amount || 0),
    billing_status: parsedData.billing_status || 'Pending',
    payment_status: 'PENDING',
    workflow: 'New',
    statement_mailed: false,
    statement_two_mailed: false,
    statement_three_mailed: false,
    statement_paid: false,
    notes: parsedData.notes || '',
  };
}
