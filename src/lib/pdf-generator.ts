import jsPDF from 'jspdf';
import type { StatementData } from './types';

interface PharmacyInfo {
  name: string;
  address: string;
  city: string;
  state: string;
  zip: string;
  phone: string;
}

const DEFAULT_PHARMACY: PharmacyInfo = {
  name: 'Harps Pharmacy #144',
  address: '1120 E. German Ln',
  city: 'Conway',
  state: 'AR',
  zip: '72032',
  phone: '501-329-3733',
};

export function generateStatementPDF(
  statementData: StatementData,
  pharmacyInfo: PharmacyInfo = DEFAULT_PHARMACY
): jsPDF {
  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();

  // Helper function to format currency
  const formatCurrency = (amount: number) => {
    return `$${amount.toFixed(2)}`;
  };

  // Helper function to format date
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: '2-digit',
      day: '2-digit',
      year: 'numeric',
    });
  };

  // Header - Pharmacy Info (Left) and "STATEMENT" (Right)
  doc.setFontSize(12);
  doc.setFont('helvetica', 'bold');
  doc.text(pharmacyInfo.name, 20, 20);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(10);
  doc.text(pharmacyInfo.address, 20, 26);
  doc.text(`${pharmacyInfo.city}, ${pharmacyInfo.state} ${pharmacyInfo.zip}`, 20, 32);
  doc.text(pharmacyInfo.phone, 20, 38);

  // "STATEMENT" header (right aligned)
  doc.setFontSize(20);
  doc.setFont('helvetica', 'bold');
  doc.text('STATEMENT', pageWidth - 20, 30, { align: 'right' });

  // Horizontal line
  doc.setLineWidth(0.5);
  doc.line(20, 45, pageWidth - 20, 45);

  // Patient Address
  doc.setFontSize(11);
  doc.setFont('helvetica', 'bold');
  const patientY = 55;
  doc.text(statementData.patient.patientName.toUpperCase(), 20, patientY);
  doc.setFont('helvetica', 'normal');
  if (statementData.patient.addressStreet) {
    doc.text(statementData.patient.addressStreet.toUpperCase(), 20, patientY + 6);
  }
  const cityStateZip = [
    statementData.patient.addressCity?.toUpperCase(),
    statementData.patient.addressState?.toUpperCase(),
    statementData.patient.addressZip,
  ]
    .filter(Boolean)
    .join(', ');
  if (cityStateZip) {
    doc.text(cityStateZip, 20, patientY + 12);
  }

  // Summary Table
  const summaryY = 80;
  doc.setFillColor(240, 240, 240);
  doc.rect(20, summaryY, pageWidth - 40, 8, 'F');

  doc.setFontSize(9);
  doc.setFont('helvetica', 'bold');
  doc.text('Statement Date', 25, summaryY + 5.5);
  doc.text('Account', 70, summaryY + 5.5);
  doc.text('Payment Due', 120, summaryY + 5.5);
  doc.text('Pay This Amount', 165, summaryY + 5.5, { align: 'right' });

  doc.setFont('helvetica', 'normal');
  doc.text(formatDate(statementData.statementDate), 25, summaryY + 13);
  doc.text(statementData.accountNumber, 70, summaryY + 13);
  doc.text(formatDate(statementData.dueDate), 120, summaryY + 13);
  doc.setFont('helvetica', 'bold');
  doc.text(formatCurrency(statementData.totalAmountDue), 185, summaryY + 13, {
    align: 'right',
  });

  // Claims Detail Table
  const detailY = 105;
  doc.setFillColor(240, 240, 240);
  doc.rect(20, detailY, pageWidth - 40, 8, 'F');

  doc.setFontSize(9);
  doc.setFont('helvetica', 'bold');
  doc.text('Date', 25, detailY + 5.5);
  doc.text('Description', 50, detailY + 5.5);
  doc.text('Billed', 110, detailY + 5.5, { align: 'right' });
  doc.text('Insurance\nPaid', 130, detailY + 5.5, { align: 'right' });
  doc.text('Insurance\nAdjustment', 155, detailY + 5.5, { align: 'right' });
  doc.text('Patient Pay', 185, detailY + 5.5, { align: 'right' });

  // Draw borders for header
  doc.setDrawColor(200, 200, 200);
  doc.rect(20, detailY, pageWidth - 40, 8);

  // Claims rows
  let currentY = detailY + 15;
  doc.setFont('helvetica', 'normal');

  statementData.claims.forEach((claim, index) => {
    if (currentY > pageHeight - 60) {
      doc.addPage();
      currentY = 20;
    }

    doc.text(formatDate(claim.serviceDate), 25, currentY);
    const description = `${claim.cptHcpcsCode || ''}– ${claim.pharmacyOfService || 'Service'}`;
    doc.text(description, 50, currentY);
    doc.text(formatCurrency(claim.totalChargedAmount), 110, currentY, {
      align: 'right',
    });
    doc.text(formatCurrency(-claim.insurancePaid), 130, currentY, { align: 'right' });
    doc.text(formatCurrency(-claim.insuranceAdjustment), 155, currentY, {
      align: 'right',
    });
    doc.text(formatCurrency(claim.patientResponsibility), 185, currentY, {
      align: 'right',
    });

    currentY += 7;
  });

  // Balance Due row
  currentY += 5;
  doc.setFontSize(10);
  doc.setFont('helvetica', 'bold');
  doc.text('Balance Due', 155, currentY, { align: 'right' });
  doc.text(formatCurrency(statementData.totalAmountDue), 185, currentY, {
    align: 'right',
  });

  // Footer text
  currentY += 15;
  doc.setFontSize(8);
  doc.setFont('helvetica', 'normal');
  const footerText1 =
    'For your convenience, payments can be made by mail, phone, or in-person at your local Harps Pharmacy. We';
  const footerText2 =
    'accept cash, credit/debit cards, and checks. If you have any questions regarding this statement, please contact';
  const footerText3 = 'your local Harps Pharmacy.';
  const footerText4 = 'Thank you for choosing Harps Pharmacy for your healthcare needs!';

  doc.text(footerText1, 20, currentY);
  doc.text(footerText2, 20, currentY + 4);
  doc.text(footerText3, 20, currentY + 8);
  doc.text(footerText4, 20, currentY + 16);

  // Detachable remittance slip (dashed line)
  currentY += 30;
  doc.setLineDash([2, 2]);
  doc.line(20, currentY, pageWidth - 20, currentY);
  doc.setLineDash([]);

  // Remittance section
  currentY += 10;
  doc.setFontSize(9);
  doc.setFont('helvetica', 'bold');
  doc.text(`Account Number: ${statementData.accountNumber}`, pageWidth / 2 + 20, currentY);
  doc.text(
    `Amount Due: ${formatCurrency(statementData.totalAmountDue)}`,
    pageWidth / 2 + 20,
    currentY + 6
  );

  currentY += 15;
  doc.text('Amount Enclosed', pageWidth / 2 + 20, currentY);
  doc.rect(pageWidth / 2 + 60, currentY - 4, 40, 8); // Box for amount

  // Patient address on remittance
  doc.setFont('helvetica', 'bold');
  doc.text(statementData.patient.patientName.toUpperCase(), 20, currentY);
  doc.setFont('helvetica', 'normal');
  if (statementData.patient.addressStreet) {
    doc.text(statementData.patient.addressStreet.toUpperCase(), 20, currentY + 6);
  }
  if (cityStateZip) {
    doc.text(cityStateZip, 20, currentY + 12);
  }

  // Payment address
  currentY += 20;
  doc.setFont('helvetica', 'normal');
  doc.text('Make check payable to/Mail check to:', pageWidth / 2 + 20, currentY);
  doc.setFont('helvetica', 'bold');
  doc.text(pharmacyInfo.name, pageWidth / 2 + 20, currentY + 5);
  doc.setFont('helvetica', 'normal');
  doc.text(pharmacyInfo.address, pageWidth / 2 + 20, currentY + 10);
  doc.text(
    `${pharmacyInfo.city}, ${pharmacyInfo.state} ${pharmacyInfo.zip}`,
    pageWidth / 2 + 20,
    currentY + 15
  );

  return doc;
}

export async function uploadStatementPDF(
  pdf: jsPDF,
  patientId: string,
  accountNumber: string,
  supabase: any
): Promise<string | null> {
  try {
    const pdfBlob = pdf.output('blob');
    const fileName = `statement_${accountNumber}_${Date.now()}.pdf`;
    const filePath = `${patientId}/${fileName}`;

    const { data, error } = await supabase.storage
      .from('statements')
      .upload(filePath, pdfBlob, {
        contentType: 'application/pdf',
        upsert: false,
      });

    if (error) {
      console.error('Error uploading PDF:', error);
      return null;
    }

    return filePath;
  } catch (error) {
    console.error('Error in uploadStatementPDF:', error);
    return null;
  }
}
