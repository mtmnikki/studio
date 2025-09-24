import { notFound } from "next/navigation";
import { claims, patients } from "@/lib/data";
import { calculateAccountNumber } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { PrintStatementButton } from "@/components/print-statement-button";

async function getData(claimId: string) {
  const claim = claims.find((c) => c.id === claimId);
  if (!claim) {
    return null;
  }
  const patient = patients.find((p) => p.id === claim.patientId);
  if (!patient) {
    return null;
  }
  const accountNumber = calculateAccountNumber(patient);
  return { claim, patient, accountNumber };
}

export default async function StatementPage({ params }: { params: { id: string } }) {
  const data = await getData(params.id);

  if (!data) {
    notFound();
  }

  const { claim, patient, accountNumber } = data;

  return (
    <div className="bg-background min-h-screen p-4 sm:p-8">
      <div className="max-w-4xl mx-auto">
        <div className="no-print mb-8 flex justify-between items-center">
          <Button variant="outline" asChild>
            <Link href="/dashboard">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Dashboard
            </Link>
          </Button>
          <PrintStatementButton claimId={claim.id} />
        </div>
        <div className="bg-card p-8 rounded-lg shadow-sm border">
          <header className="flex justify-between items-start mb-8">
            <div>
              <h1 className="text-3xl font-bold text-primary">Patient Statement</h1>
              <p className="text-muted-foreground">Date: {new Date().toLocaleDateString()}</p>
            </div>
            <div className="text-right">
              <h2 className="text-lg font-semibold">Jenn's Pharmacy</h2>
              <p className="text-sm text-muted-foreground">123 Wellness Way</p>
              <p className="text-sm text-muted-foreground">Healthville, ST 98765</p>
            </div>
          </header>

          <section className="grid grid-cols-2 gap-8 mb-12">
            <div>
              <h3 className="font-semibold mb-2 border-b pb-1">Bill To:</h3>
              <p className="font-bold">{patient.firstName} {patient.lastName}</p>
              <p>{patient.address.street}</p>
              <p>{patient.address.city}, {patient.address.state} {patient.address.zip}</p>
            </div>
            <div className="text-right">
              <h3 className="font-semibold mb-2">Account Number:</h3>
              <p className="font-mono text-lg">{accountNumber}</p>
              <h3 className="font-semibold mt-4 mb-2">Amount Due:</h3>
              <p className="text-3xl font-bold text-primary">${claim.amount.toFixed(2)}</p>
            </div>
          </section>

          <section>
            <h3 className="font-semibold mb-4 text-lg">Claim Details</h3>
            <div className="border rounded-lg">
              <table className="w-full">
                <thead className="bg-muted/50">
                  <tr>
                    <th className="p-3 text-left font-semibold">Service Date</th>
                    <th className="p-3 text-left font-semibold">Description</th>
                    <th className="p-3 text-right font-semibold">Amount</th>
                  </tr>
                </thead>
                <tbody>
                  <tr className="border-t">
                    <td className="p-3">{new Date(claim.serviceDate).toLocaleDateString()}</td>
                    <td className="p-3">{claim.serviceDescription}</td>
                    <td className="p-3 text-right">${claim.amount.toFixed(2)}</td>
                  </tr>
                </tbody>
                <tfoot>
                  <tr className="border-t font-bold bg-muted/50">
                    <td colSpan={2} className="p-3 text-right">Total Due</td>
                    <td className="p-3 text-right">${claim.amount.toFixed(2)}</td>
                  </tr>
                </tfoot>
              </table>
            </div>
          </section>

          <footer className="mt-12 text-center text-muted-foreground text-sm">
            <p>Please make payment by {new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toLocaleDateString()}.</p>
            <p>Thank you for your business!</p>
          </footer>
        </div>
      </div>
    </div>
  );
}
