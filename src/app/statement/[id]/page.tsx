"use client";

import * as React from "react";

import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { notFound } from "next/navigation";

import { PrintStatementButton } from "@/components/print-statement-button";
import type { StatementData } from "@/lib/statement-data";
import {
  fetchStatementDataByClaimId,
} from "@/lib/statement-data";
import { calculateAccountNumber } from "@/lib/utils";
import { generateStatementPDF, uploadStatementPDF } from "@/lib/pdf-generator";
import { createClient } from "@/lib/supabase/client";
import { Download } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

function formatDate(dateString: string) {
  const date = new Date(dateString);
  const userTimezoneOffset = date.getTimezoneOffset() * 60000;
  return new Date(date.getTime() + userTimezoneOffset).toLocaleDateString(
    "en-US",
    {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
    }
  );
}

function StatementDetails({ data }: { data: StatementData }) {
  const { claims, patient, accountNumber, totalAmountDue } = data;
  const statementDate = new Date();
  const paymentDueDate = new Date(
    statementDate.getTime() + 30 * 24 * 60 * 60 * 1000
  );

  return (
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
        <p className="font-bold">
          {patient.firstName.toUpperCase()} {patient.lastName.toUpperCase()}
        </p>
        <p>{patient.address.street.toUpperCase()}</p>
        <p>
          {patient.address.city.toUpperCase()}, {patient.address.state.toUpperCase()} {" "}
          {patient.address.zip}
        </p>
      </section>

      {/* Summary Table */}
      <section className="mb-8">
        <table className="w-full border-collapse border">
          <thead className="bg-muted/50">
            <tr className="border-b">
              <th className="p-2 text-left font-semibold border-r">
                Statement Date
              </th>
              <th className="p-2 text-left font-semibold border-r">Account</th>
              <th className="p-2 text-left font-semibold border-r">
                Payment Due
              </th>
              <th className="p-2 text-left font-semibold">Pay This Amount</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td className="p-2 border-r">
                {formatDate(statementDate.toISOString())}
              </td>
              <td className="p-2 border-r font-mono">{accountNumber}</td>
              <td className="p-2 border-r">
                {formatDate(paymentDueDate.toISOString())}
              </td>
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
              <th className="p-2 text-right font-semibold border-r">
                Insurance Paid
              </th>
              <th className="p-2 text-right font-semibold border-r">
                Insurance Adjustment
              </th>
              <th className="p-2 text-right font-semibold">Patient Pay</th>
            </tr>
          </thead>
          <tbody>
            {claims.map((claim) => (
              <tr key={claim.id} className="border-b">
                <td className="p-2 border-r">{formatDate(claim.serviceDate)}</td>
                <td className="p-2 border-r">
                  {claim.productId}– {claim.serviceDescription}
                </td>
                <td className="p-2 text-right border-r">
                  ${claim.amount.toFixed(2)}
                </td>
                <td className="p-2 text-right border-r">
                  ${claim.paid.toFixed(2)}
                </td>
                <td className="p-2 text-right border-r">
                  ${claim.adjustment.toFixed(2)}
                </td>
                <td className="p-2 text-right">
                  ${claim.patientPay.toFixed(2)}
                </td>
              </tr>
            ))}
          </tbody>
          <tfoot>
            <tr className="font-bold">
              <td colSpan={5} className="p-2 text-right">
                Balance Due
              </td>
              <td className="p-2 text-right">
                ${totalAmountDue.toFixed(2)}
              </td>
            </tr>
          </tfoot>
        </table>
      </section>

      {/* Footer Text */}
      <section className="text-xs text-center space-y-2 mb-10">
        <p>
          For your convenience, payments can be made by mail, phone, or in-person
          at your local Harps Pharmacy. We accept cash, credit/debit cards, and
          checks. If you have any questions regarding this statement, please
          contact your local Harps Pharmacy.
        </p>
        <p>Thank you for choosing Harps Pharmacy for your healthcare needs!</p>
      </section>

      {/* Remittance Slip */}
      <div className="border-t border-dashed pt-6 grid grid-cols-2 gap-8">
        {/* Left side: Payment details */}
        <div className="text-xs space-y-4">
          <div>
            <p className="font-bold text-sm">Account Number: {accountNumber}</p>
            <p className="font-bold text-sm">
              Amount Due: ${totalAmountDue.toFixed(2)}
            </p>
          </div>
          <div className="flex items-center gap-4">
            <label htmlFor="amount-enclosed" className="font-bold text-sm">
              Amount Enclosed
            </label>
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
            <p className="font-bold">
              {patient.firstName.toUpperCase()} {patient.lastName.toUpperCase()}
            </p>
            <p>{patient.address.street.toUpperCase()}</p>
            <p>
              {patient.address.city.toUpperCase()}, {patient.address.state.toUpperCase()} {" "}
              {patient.address.zip}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function StatementPage({ params }: { params: { id: string } }) {
  const [data, setData] = React.useState<StatementData | null>(null);
  const [isLoading, setIsLoading] = React.useState(true);
  const [errorMessage, setErrorMessage] = React.useState<string | null>(null);
  const [isDownloading, setIsDownloading] = React.useState(false);
  const supabase = createClient();
  const { toast } = useToast();

  React.useEffect(() => {
    let isMounted = true;

    setIsLoading(true);

    fetchStatementDataByClaimId(params.id, calculateAccountNumber)
      .then((statementData) => {
        if (!isMounted) return;
        if (!statementData) {
          setErrorMessage("We couldn't find a statement for this claim.");
          setData(null);
        } else {
          setErrorMessage(null);
          setData(statementData);
        }
        setIsLoading(false);
      })
      .catch((error) => {
        console.error("Failed to load statement", error);
        if (isMounted) {
          setData(null);
          setErrorMessage("An unexpected error occurred while loading the statement.");
          setIsLoading(false);
        }
      });

    return () => {
      isMounted = false;
    };
  }, [params.id]);

  const handleDownloadPDF = async () => {
    if (!data) return;

    setIsDownloading(true);
    try {
      // Generate PDF
      const pdf = generateStatementPDF(data);

      // Upload to Supabase storage
      const filePath = await uploadStatementPDF(
        pdf,
        data.patient.id,
        data.accountNumber,
        supabase
      );

      if (filePath) {
        // Track in generated_statements table
        await supabase.from('generated_statements').insert({
          patient_id: data.patient.id,
          account_number: data.accountNumber,
          statement_date: data.statementDate,
          statement_type: 'first',
          total_amount: data.totalAmountDue,
          pdf_path: filePath,
          claim_ids: data.claims.map(c => c.id),
          pharmacy_of_service: data.claims[0]?.pharmacyOfService,
          sent: false,
        });
      }

      // Download the PDF
      pdf.save(`statement_${data.accountNumber}_${Date.now()}.pdf`);

      toast({
        title: "PDF Downloaded",
        description: "Statement has been downloaded and saved to storage.",
      });
    } catch (error) {
      console.error("Error generating PDF:", error);
      toast({
        title: "Download Failed",
        description: "Failed to generate PDF statement.",
        variant: "destructive",
      });
    } finally {
      setIsDownloading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-indigo-400 via-sky-500 to-teal-300 p-8">
        <div className="rounded-3xl bg-white/40 px-8 py-6 text-lg font-semibold text-slate-700 shadow-xl backdrop-blur">
          Loading statement...
        </div>
      </div>
    );
  }

  if (!data || errorMessage) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-indigo-400 via-sky-500 to-teal-300 p-6">
        <div className="no-print w-full max-w-xl rounded-3xl border border-white/40 bg-white/50 p-8 text-center shadow-2xl backdrop-blur-xl">
          <h2 className="text-2xl font-semibold text-slate-700">Statement unavailable</h2>
          <p className="mt-3 text-sm text-slate-600">
            {errorMessage ?? "We couldn't locate the requested statement."}
          </p>
          <div className="mt-6 flex flex-wrap justify-center gap-3">
            <Button variant="outline" asChild className="rounded-full border-slate-200 bg-white/70 px-5 text-slate-600 shadow-sm">
              <Link href="/dashboard">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to Dashboard
              </Link>
            </Button>
            <Button
              onClick={() => window.location.reload()}
              className="rounded-full bg-gradient-to-r from-sky-500 to-teal-400 px-5 text-white shadow-lg hover:shadow-xl"
            >
              Try Again
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-400 via-sky-500 to-teal-300 p-4 sm:p-8 font-sans text-sm">
      <div className="mx-auto max-w-5xl">
        <div className="no-print mb-8 flex flex-wrap items-center justify-between gap-3 rounded-3xl border border-white/40 bg-white/50 px-5 py-4 shadow-lg backdrop-blur-xl">
          <Button variant="outline" asChild className="rounded-full border-slate-200 bg-white/70 px-5 text-slate-600 shadow-sm hover:bg-white">
            <Link href="/dashboard">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Dashboard
            </Link>
          </Button>
          <div className="flex gap-2">
            <Button
              onClick={handleDownloadPDF}
              disabled={isDownloading}
              variant="outline"
              className="rounded-full border-slate-200 bg-white/70 px-5 text-slate-600 shadow-sm hover:bg-white"
            >
              <Download className="mr-2 h-4 w-4" />
              {isDownloading ? "Generating..." : "Download PDF"}
            </Button>
            <PrintStatementButton
              claimIds={data.claims.map((claim) => claim.id)}
              patientId={data.patient.id}
            />
          </div>
        </div>

        <div className="rounded-3xl border border-white/70 bg-white/90 p-8 shadow-2xl">
          <StatementDetails data={data} />
        </div>
      </div>
    </div>
  );
}