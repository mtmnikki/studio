# **App Name**: Jenn's Dream Billing Platform

## Core Features:

- Automated Data Extraction: Automatically extracts claim data from the TransactRx portal's 'Check Detail' view, eliminating manual data entry.
- Data Consolidation: Appends extracted data as new rows to a master billing spreadsheet, creating a unified data source.
- Statement Identification: Scans the master spreadsheet to identify new claims requiring patient statements.
- Patient Data Fetching: Retrieves patient Date of Birth and full mailing address from a designated patient information source.
- Account Number Calculation: Calculates the patient's account number using the specified formula: First initial of the patient's first name + patient's two digit birth month (MM) + a zero (0) + patient's two digit birthday (DD) + first initial of the patient's last name + patient's four digit birth year (YYYY).
- Statement Generation: Generates professional, print-ready patient statements by populating a template with relevant patient and claim data.
- Status Update: Automatically updates the '1st Statement Sent?' field in the master spreadsheet after generating a statement to prevent duplicate billing.

## Style Guidelines:

- Primary color: Soft blue (#72BCD4), evoking trust and reliability in financial processes.
- Background color: Very light blue (#F0F8FF), providing a clean and professional backdrop.
- Accent color: Pale green (#B2DFDB), used for calls to action and highlighting important data.
- Body and headline font: 'Inter', a sans-serif, for clear and modern readability.
- Clean and organized layout to ensure easy navigation and readability of billing information.
- Simple, professional icons to represent different actions and data points within the application.
- Subtle animations or transitions to provide feedback during data processing and statement generation.