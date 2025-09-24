"use client";

import { PageHeader } from "@/components/page-header";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { useState } from "react";
import Papa from "papaparse";

export default function ImportPage() {
  const { toast } = useToast();
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
      complete: (results) => {
        console.log("Parsed CSV data:", results.data);
        // In a real app, you would process results.data and create new claim records.
        // For example, sending it to an API endpoint.
        setIsLoading(false);
        toast({
          title: "File Processed",
          description: `Successfully parsed ${results.data.length} records from ${selectedFile.name}.`,
          variant: "default",
          className: "bg-accent text-accent-foreground"
        });
        setSelectedFile(null);
        // Reset the file input
        const fileInput = document.getElementById('csv-upload') as HTMLInputElement;
        if(fileInput) fileInput.value = '';
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
            Select a CSV file containing the claim data. The app will automatically extract and process the claims.
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
