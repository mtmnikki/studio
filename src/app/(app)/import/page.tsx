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
      complete: (results: { data: any[] }) => {
        try {
          const newClaims: Claim[] = results.data.map((row: any, index: number) => {
            // A simple way to generate unique IDs for the new claims.
            // In a real app, this would be handled by a database.
            const newId = `clm_imported_${Date.now()}_${index}`;
            const patientId = `pat_imported_${Date.now()}_${index}`;
            return {
              id: newId,
              checkDate: row["Check Date"] ? new Date(row["Check Date"]).toISOString().split('T')[0] : '',
              checkNumber: row["Check #"] || '',
              npi: row["NPI"] || '',
              payee: row["Payee"] || '',
              payer: row["Payer"] || '',
              rx: row["Rx"] || '',
              serviceDate: row["DOS"] ? new Date(row["DOS"]).toISOString().split('T')[0] : '',
              cardholderId: row["Cardholder ID"] || '',
              patientName: row["Patient"] || 'Unknown',
              patientId: patientId, // Assign a temporary patientId
              serviceDescription: row["Service"] || '',
              productId: row["CPT/HCPCS Code"] || '',
              amount: parseFloat(row["Billed"] || '0'),
              paid: parseFloat(row["Paid"] || '0'),
              adjustment: parseFloat(row["Adjustment"] || '0'),
              patientPay: parseFloat(row["Patient Pay"] || '0'),
              paymentStatus: row["Payment Status"] || 'PENDING',
              postingStatus: row["Posting Status"] || 'Unposted',
              workflow: row["Workflow"] || 'New',
              notes: row["Notes"] || '',
              statementSent: row["1st Statement Sent?"]?.toLowerCase() === 'true',
            };
          });

          addClaims(newClaims);

          setIsLoading(false);
          toast({
            title: "File Processed Successfully",
            description: `Added ${newClaims.length} new claims. Redirecting to dashboard...`,
            variant: "default",
            className: "bg-accent text-accent-foreground"
          });
          
          setSelectedFile(null);
          const fileInput = document.getElementById('csv-upload') as HTMLInputElement;
          if(fileInput) fileInput.value = '';

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
      <Card>
        <CardHeader>
          <CardTitle>Upload Claim Data</CardTitle>
          <CardDescription>
            Select a CSV file containing the claim data. The columns must match the expected format. New claims will be added to the dashboard.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Input
            id="csv-upload"
            type="file"
            accept=".csv"
            onChange={handleFileChange}
            disabled={isLoading}
          />
        </CardContent>
        <CardFooter className="border-t px-6 py-4">
          <Button onClick={handleProcessData} disabled={isLoading || !selectedFile}>
            {isLoading ? "Processing..." : "Process Data"}
          </Button>
        </CardFooter>
      </Card>
    </>
  );
}
