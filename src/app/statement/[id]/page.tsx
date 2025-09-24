import { notFound } from "next/navigation";
import { calculateAccountNumber } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { PrintStatementButton } from "@/components/print-statement-button";
import type { Claim, Patient } from "@/lib/types";
import { doc, getDoc, getDocs, collection, query, where } from "firebase/firestore";
import { getSdks } from "@/firebase";
import { initializeFirebase } from "@/firebase";

// This is a temporary solution for server-side data fetching.
// In a real app, you would have a more robust way of getting the firestore instance.
const { firestore } = initializeFirebase();

async function getStatementData(claimId: string): Promise<{
    claims: Claim[];
    patient: Patient;
    accountNumber: string;
    totalAmountDue: number;
} | null> {
    if (!firestore) return null;
    const claimRef = doc(firestore, "claims", claimId);
    const claimSnap = await getDoc(claimRef);

    if (!claimSnap.exists()) {
        return null;
    }
    const initialClaim = { id: claimSnap.id, ...claimSnap.data() } as Claim;

     if (!initialClaim.patientId) return null;

    const patientRef = doc(firestore, "patients", initialClaim.patientId);
    const patientSnap = await getDoc(patientRef);
    
    let patient: Patient;

    if (!patientSnap.exists()) {
         // In a real app, we might create a dummy patient record from the claim
        patient = {
            id: initialClaim.patientId,
            firstName: initialClaim.patientName.split(' ')[0] || 'Patient',
            lastName: initialClaim.patientName.split(' ')[1] || '',
            dateOfBirth: '1900-01-01', // Placeholder
            address: { street: 'N/A', city: 'N/A', state: 'N/A', zip: 'N/A' },
        };
    } else {
        patient = { id: patientSnap.id, ...patientSnap.data() } as Patient;
    }

    return getStatementDataForPatient(patient, initialClaim);
}

async function getStatementDataForPatient(patient: Patient, initialClaim: Claim) {
    if (!firestore) return null;
    const claimsQuery = query(
        collection(firestore, "claims"),
        where("patientId", "==", patient.id),
        where("statementSent", "==", false)
    );
    const claimsSnap = await getDocs(claimsQuery);
    
    const patientClaims: Claim[] = claimsSnap.docs.map(doc => ({ id: doc.id, ...doc.data() } as Claim));

    const claimsForStatement = patientClaims.length > 0 ? patientClaims : [initialClaim];

    const accountNumber = calculateAccountNumber(patient);
    const totalAmountDue = claimsForStatement.reduce((acc, claim) => acc + claim.patientPay, 0);

    return { claims: claimsForStatement, patient, accountNumber, totalAmountDue };
}


function formatDate(dateString: string) {
    const date = new Date(dateString);
    const userTimezoneOffset = date.getTimezoneOffset() * 60000;
    return new Date(date.getTime() + userTimezoneOffset).toLocaleDateString('en-US', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
    });
}


export default async function StatementPage({ params }: { params: { id: string } }) {
  const data = await getStatementData(params.id);

  if (!data) {
    notFound();
  }

  const { claims: statementClaims, patient, accountNumber, totalAmountDue } = data;
  const statementDate = new Date();
  const paymentDueDate = new Date(statementDate.getTime() + 30 * 24 * 60 * 60 * 1000);

  return (
    <div className="bg-background min-h-screen p-4 sm:p-8 font-sans text-sm">
      <div className="max-w-4xl mx-auto">
        <div className="no-print mb-8 flex justify-between items-center">
          <Button variant="outline" asChild>
            <Link href="/dashboard">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Dashboard
            </Link>
          </Button>
          <PrintStatementButton claimId={params.id} patientId={patient.id} />
        </div>

        {/* Statement Content */}
        <div className="bg-card p-8 rounded-lg shadow-sm border text-black">
          {/* Header */}
          <header className="grid grid-cols-2 items-start mb-8">
            <div>
              <h2 className="text-lg font-semibold">Harps Pharmacy #144</h2>
              <p>1120 E. German Ln</p>
              <p>Conway, AR 72032</p>
              <p>501-329-3733</p>
            </div>
            <div className="text-right">
              <h1 className="text-3xl font-bold tracking-wider">STATEMENT</h1>
            </div>
          </header>

          {/* Patient Info */}
          <section className="mb-6">
            <p className="font-bold">{patient.firstName.toUpperCase()} {patient.lastName.toUpperCase()}</p>
            <p>{patient.address.street.toUpperCase()}</p>
            <p>{patient.address.city.toUpperCase()}, {patient.address.state.toUpperCase()} {patient.address.zip}</p>
          </section>

          {/* Summary Table */}
          <section className="mb-8">
            <table className="w-full border-collapse border">
              <thead className="bg-muted/50">
                <tr className="border-b">
                  <th className="p-2 text-left font-semibold border-r">Statement Date</th>
                  <th className="p-2 text-left font-semibold border-r">Account</th>
                  <th className="p-2 text-left font-semibold border-r">Payment Due</th>
                  <th className="p-2 text-left font-semibold">Pay This Amount</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td className="p-2 border-r">{formatDate(statementDate.toISOString())}</td>
                  <td className="p-2 border-r font-mono">{accountNumber}</td>
                  <td className="p-2 border-r">{formatDate(paymentDueDate.toISOString())}</td>
                  <td className="p-2 font-bold">${totalAmountDue.toFixed(2)}</td>
                </tr>
              </tbody>
            </table>
          </section>

          {/* Details Table */}
          <section className="mb-8">
            <table className="w-full border-collapse border">
              <thead className="bg-muted/50">
                <tr className="border-b">
                  <th className="p-2 text-left font-semibold border-r">Date</th>
                  <th className="p-2 text-left font-semibold border-r">Description</th>
                  <th className="p-2 text-right font-semibold border-r">Billed</th>
                  <th className="p-2 text-right font-semibold border-r">Insurance Paid</th>
                  <th className="p-2 text-right font-semibold border-r">Insurance Adjustment</th>
                  <th className="p-2 text-right font-semibold">Patient Pay</th>
                </tr>
              </thead>
              <tbody>
                {statementClaims.map(claim => (
                  <tr key={claim.id} className="border-b">
                    <td className="p-2 border-r">{formatDate(claim.serviceDate)}</td>
                    <td className="p-2 border-r">{claim.productId}– {claim.serviceDescription}</td>
                    <td className="p-2 text-right border-r">${claim.amount.toFixed(2)}</td>
                    <td className="p-2 text-right border-r">${claim.paid.toFixed(2)}</td>
                    <td className="p-2 text-right border-r">${claim.adjustment.toFixed(2)}</td>
                    <td className="p-2 text-right">${claim.patientPay.toFixed(2)}</td>
                  </tr>
                ))}
              </tbody>
              <tfoot>
                <tr className="font-bold">
                  <td colSpan={5} className="p-2 text-right">Balance Due</td>
                  <td className="p-2 text-right">${totalAmountDue.toFixed(2)}</td>
                </tr>
              </tfoot>
            </table>
          </section>
          
          {/* Footer Text */}
          <section className="text-xs text-center space-y-2 mb-10">
              <p>For your convenience, payments can be made by mail, phone, or in-person at your local Harps Pharmacy. We accept cash, credit/debit cards, and checks. If you have any questions regarding this statement, please contact your local Harps Pharmacy.</p>
              <p>Thank you for choosing Harps Pharmacy for your healthcare needs!</p>
          </section>
          
          {/* Remittance Slip */}
           <div className="border-t border-dashed pt-6 grid grid-cols-2 gap-8">
            {/* Left side: Payment details */}
            <div className="text-xs space-y-4">
              <div>
                <p className="font-bold text-sm">Account Number: {accountNumber}</p>
                <p className="font-bold text-sm">Amount Due: ${totalAmountDue.toFixed(2)}</p>
              </div>
              <div className="flex items-center gap-4">
                <label htmlFor="amount-enclosed" className="font-bold text-sm">Amount Enclosed</label>
                <div className="border h-8 w-32"></div>
              </div>
              <div>
                <p className="font-bold">Make check payable to/Mail check to:</p>
                <p>Harps Pharmacy #144</p>
                <p>1120 E. German Ln</p>
                <p>Conway, AR 72032</p>
              </div>
            </div>

            {/* Right side: Mailing address for window envelope */}
            <div className="text-xs">
              <div className="pl-8 pt-12">
                <p className="font-bold">{patient.firstName.toUpperCase()} {patient.lastName.toUpperCase()}</p>
                <p>{patient.address.street.toUpperCase()}</p>
                <p>{patient.address.city.toUpperCase()}, {patient.address.state.toUpperCase()} {patient.address.zip}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
