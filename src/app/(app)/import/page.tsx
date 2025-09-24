"use client";

import { PageHeader } from "@/components/page-header";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { useState } from "react";
import Papa from "papaparse";
import { useClaims } from "@/hooks/use-claims";
import { useRouter } from "next/navigation";
import type { Claim } from "@/lib/types";
import { parseBooleanFlag, parseCurrency } from "@/lib/utils";

export default function ImportPage() {
  const { toast } = useToast();
  const router = useRouter();
  const { addClaims } = useClaims();
  const [isLoading, setIsLoading] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files.length > 0) {
      setSelectedFile(event.target.files[0]);
    }
  };

  const parseCurrency = (value: unknown) => {
    if (typeof value === "number" && Number.isFinite(value)) {
      return value;
    }

    if (!value) {
      return 0;
    }

    const cleaned = String(value)
      .replace(/[$,]/g, "")
      .replace(/\((.*)\)/, "-$1")
      .replace(/[^0-9.-]/g, "");

    const parsed = parseFloat(cleaned);

    return Number.isFinite(parsed) ? parsed : 0;
  };

  const handleProcessData = () => {
    if (!selectedFile) {
      toast({
        title: "No File Selected",
        description: "Please select a CSV file to process.",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);

    Papa.parse(selectedFile, {
      header: true,
      skipEmptyLines: true,
      transformHeader: (header) => header.trim(),
      // @ts-ignore
      complete: async (results: { data: any[] }) => {
        try {
          const newClaims: Omit<Claim, "id">[] = results.data.map((row: any, index: number) => {
            
            const parseDate = (dateString: string) => {
              if (!dateString) return new Date().toISOString().split('T')[0];
              const date = new Date(dateString);
              // Adding timezone offset to avoid date changes
              const userTimezoneOffset = date.getTimezoneOffset() * 60000;
              return new Date(date.getTime() + userTimezoneOffset).toISOString().split('T')[0];
            }
            
            // A simple way to generate unique IDs for the new claims.
            // In a real app, this would be handled by a database.
            const patientId = `pat_imported_${row["Patient"]?.replace(/\s/g, '_') || index}`;


            return {
              checkDate: parseDate(row["Check Date"]),
              checkNumber: row["Check #"] || '',
              npi: row["NPI"] || '',
              payee: row["Payee"] || '',
              payer: row["Payer"] || '',
              rx: row["Rx"] || '',
              serviceDate: parseDate(row["DOS"]),
              cardholderId: row["Cardholder ID"] || '',
              patientName: row["Patient"] || 'Unknown',
              patientId: patientId, // Assign a temporary patientId
              serviceDescription: row["Service"] || '',
              productId: row["CPT/HCPCS Code"] || '',
              amount: parseCurrency(row["Billed"]),
              paid: parseCurrency(row["Paid"]),
              adjustment: parseCurrency(row["Adjustment"]),
              patientPay: parseCurrency(row["Patient Pay"]),
              paymentStatus: row["Payment Status"] || 'PENDING',
              postingStatus: row["Posting Status"] || 'Unposted',
              workflow: row["Workflow"] || 'New',
              notes: row["Notes"] || '',
              statementSent: parseBooleanFlag(row["1st Statement Sent?"]),
              statementSent2nd: parseBooleanFlag(row["2nd Statement Sent?"]),
            };
          });

          await addClaims(newClaims);

          setIsLoading(false);
          toast({
            title: "File Processed Successfully",
            description: `Added ${newClaims.length} new claims. Redirecting to dashboard...`,
            variant: "default",
            className: "bg-accent text-accent-foreground"
          });
          
          setSelectedFile(null);
          const fileInput = document.getElementById('csv-upload') as HTMLInputElement;
          if (fileInput) fileInput.value = '';

          // Redirect to the dashboard to see the new data
          setTimeout(() => router.push('/dashboard'), 1500);

        } catch (error: any) {
           setIsLoading(false);
           toast({
             title: "Error Processing Data",
             description: `An error occurred while transforming the data: ${error.message}`,
             variant: "destructive",
           });
        }
      },
      error: (error: any) => {
        setIsLoading(false);
        toast({
          title: "Error Parsing File",
          description: error.message,
          variant: "destructive",
        });
      },
    });
  };

  return (
    <>
      <PageHeader
        title="Import Data"
        description="Upload a CSV file to create new claims."
      />
      <Card className="border-white/60 bg-white/50">
        <CardHeader className="space-y-3">
          <CardTitle className="text-2xl text-slate-900">Upload claim data</CardTitle>
          <CardDescription className="text-slate-600">
            Select a CSV file containing the claim data. The columns must match the expected format. New claims will be added to the dashboard.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="rounded-3xl border border-dashed border-white/60 bg-white/70 p-6 text-sm text-slate-600 shadow-inner">
            <p className="font-semibold text-slate-800">Tips for perfect imports</p>
            <ul className="mt-2 space-y-1 text-xs leading-5">
              <li>• Ensure currency values omit special characters besides $ and commas.</li>
              <li>• Include patient identifiers to keep statements flowing smoothly.</li>
              <li>• We'll auto-detect dates and patient balances for you.</li>
            </ul>
          </div>
          <Input
            id="csv-upload"
            type="file"
            accept=".csv"
            onChange={handleFileChange}
            disabled={isLoading}
            className="rounded-2xl border border-white/60 bg-white/80"
          />
        </CardContent>
        <CardFooter className="flex items-center justify-end gap-3 border-t border-white/40 px-6 py-4">
          <Button variant="outline" onClick={() => {
            setSelectedFile(null);
            const fileInput = document.getElementById('csv-upload') as HTMLInputElement;
            if (fileInput) fileInput.value = '';
          }} disabled={isLoading}>
            Reset
          </Button>
          <Button onClick={handleProcessData} disabled={isLoading || !selectedFile}>
            {isLoading ? "Processing..." : "Process data"}
          </Button>
        </CardFooter>
      </Card>
    </>
  );
}
