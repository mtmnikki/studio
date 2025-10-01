"use client";

import { PageHeader } from "@/components/page-header";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { useState } from "react";
import { useClaims } from "@/hooks/use-claims";
import { useRouter } from "next/navigation";
import { parseSimpleCSV, transformSimpleCSVToClaims } from "@/lib/simple-csv-parser";
import { Badge } from "@/components/ui/badge";
import { CheckCircle2, Upload, FileText, ArrowRight } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

export default function ImportSimplePage() {
  const { toast } = useToast();
  const router = useRouter();
  const { addClaims } = useClaims();
  const supabase = createClient();

  const [isLoading, setIsLoading] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [parsedData, setParsedData] = useState<any>(null);
  const [step, setStep] = useState<'select' | 'preview' | 'importing'>('select');

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files.length > 0) {
      setSelectedFile(event.target.files[0]);
      setParsedData(null);
      setStep('select');
    }
  };

  const handleParseCSV = async () => {
    if (!selectedFile) {
      toast({
        title: "No File Selected",
        description: "Please select a CSV file to import.",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);

    try {
      console.log('Parsing CSV file:', selectedFile.name);

      // Parse CSV with auto-mapping
      const parsed = await parseSimpleCSV(selectedFile);
      console.log('Parsed data:', parsed);

      setParsedData(parsed);
      setStep('preview');

      const mappedCount = parsed.mappings.filter(m => m.targetField !== 'unmapped').length;

      toast({
        title: "CSV Parsed Successfully!",
        description: `Found ${parsed.totalRows} rows and auto-mapped ${mappedCount} columns.`,
      });
    } catch (error: any) {
      console.error('Parse error:', error);
      toast({
        title: "Parse Failed",
        description: error.message || "Failed to parse CSV file",
        variant: "destructive",
      });
      setStep('select');
    } finally {
      setIsLoading(false);
    }
  };

  const handleImportData = async () => {
    if (!parsedData) return;

    setIsLoading(true);
    setStep('importing');

    try {
      // Check if user is authenticated
      const { data: { session } } = await supabase.auth.getSession();
      console.log('Session check:', session ? 'Logged in as ' + session.user.email : 'NOT LOGGED IN');

      if (!session) {
        throw new Error('You must be logged in to import data. Please log in and try again.');
      }

      console.log('Transforming rows to claims...');

      // Transform CSV data to claims
      const claims = transformSimpleCSVToClaims(parsedData.rows, parsedData.mappings);
      console.log('Transformed claims (first 2):', JSON.stringify(claims.slice(0, 2), null, 2));
      console.log('Total claims to import:', claims.length);

      // Upload CSV to storage
      if (selectedFile) {
        const timestamp = Date.now();
        const filePath = `uploads/${timestamp}_${selectedFile.name}`;
        console.log('Uploading CSV to storage...');
        const { error: uploadError } = await supabase.storage.from('csv-uploads').upload(filePath, selectedFile);
        if (uploadError) {
          console.error('CSV upload error:', uploadError);
        }
      }

      // Import to database
      console.log('Importing to database...');
      await addClaims(claims);

      toast({
        title: "Import Complete!",
        description: `Successfully imported ${claims.length} claims.`,
      });

      // Redirect to dashboard
      setTimeout(() => router.push('/dashboard'), 1500);
    } catch (error: any) {
      console.error('Import error:', error);
      console.error('Error details:', JSON.stringify(error, null, 2));
      toast({
        title: "Import Failed",
        description: error.message || error.msg || "Failed to import data. Check console for details.",
        variant: "destructive",
      });
      setStep('preview');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen flex-col">
      <PageHeader
        title="Simple CSV Import"
        description="Import billing data from CSV files with automatic column mapping"
      />

      <div className="flex-1 space-y-6 p-8 pt-6">

        {/* Step 1: File Selection */}
        {step === 'select' && (
          <Card>
            <CardHeader>
              <CardTitle>Upload CSV File</CardTitle>
              <CardDescription>
                Select a CSV file containing billing claims. Columns will be automatically mapped.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-4">
                <Input
                  type="file"
                  accept=".csv"
                  onChange={handleFileChange}
                  className="flex-1"
                />
                <Button
                  onClick={handleParseCSV}
                  disabled={!selectedFile || isLoading}
                  size="lg"
                >
                  {isLoading ? (
                    <>Processing...</>
                  ) : (
                    <>
                      <Upload className="mr-2 h-4 w-4" />
                      Parse CSV
                    </>
                  )}
                </Button>
              </div>

              {selectedFile && (
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <FileText className="h-4 w-4" />
                  <span>{selectedFile.name}</span>
                  <Badge variant="secondary">{(selectedFile.size / 1024).toFixed(1)} KB</Badge>
                </div>
              )}

              <div className="mt-6 rounded-lg border bg-muted/50 p-4">
                <h4 className="font-semibold mb-2">Auto-Mapped Columns:</h4>
                <div className="grid grid-cols-2 gap-2 text-sm">
                  <div>account_number, patient_name, service_date</div>
                  <div>total_charged_amount, insurance_paid</div>
                  <div>patient_responsibility, billing_status</div>
                  <div>pharmacy_of_service, and more...</div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Step 2: Preview & Confirm */}
        {step === 'preview' && parsedData && (
          <Card>
            <CardHeader>
              <CardTitle>Preview Import Data</CardTitle>
              <CardDescription>
                Review the mapped data before importing. Showing first 5 rows of {parsedData.totalRows} total.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">

              {/* Column Mappings */}
              <div>
                <h4 className="font-semibold mb-3 flex items-center gap-2">
                  <CheckCircle2 className="h-5 w-5 text-green-600" />
                  Column Mappings
                </h4>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-2 text-sm">
                  {parsedData.mappings.map((mapping: any, i: number) => (
                    <div key={i} className="flex items-center gap-2 p-2 rounded border">
                      <span className="text-muted-foreground">{mapping.csvColumn}</span>
                      <ArrowRight className="h-3 w-3" />
                      <Badge variant={mapping.targetField === 'unmapped' ? 'destructive' : 'default'}>
                        {mapping.targetField}
                      </Badge>
                    </div>
                  ))}
                </div>
              </div>

              {/* Data Preview */}
              <div>
                <h4 className="font-semibold mb-3">Data Preview (first 5 rows)</h4>
                <div className="rounded-lg border overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        {parsedData.headers.slice(0, 6).map((header: string, i: number) => (
                          <TableHead key={i}>{header}</TableHead>
                        ))}
                        {parsedData.headers.length > 6 && <TableHead>...</TableHead>}
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {parsedData.rows.slice(0, 5).map((row: any, i: number) => (
                        <TableRow key={i}>
                          {parsedData.headers.slice(0, 6).map((header: string, j: number) => (
                            <TableCell key={j}>{row[header]}</TableCell>
                          ))}
                          {parsedData.headers.length > 6 && <TableCell>...</TableCell>}
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-3">
                <Button
                  variant="outline"
                  onClick={() => {
                    setStep('select');
                    setParsedData(null);
                  }}
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleImportData}
                  disabled={isLoading}
                  size="lg"
                  className="flex-1"
                >
                  {isLoading ? 'Importing...' : `Import ${parsedData.totalRows} Claims`}
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Step 3: Importing */}
        {step === 'importing' && (
          <Card>
            <CardContent className="py-12 text-center">
              <div className="animate-pulse">
                <Upload className="h-16 w-16 mx-auto mb-4 text-primary" />
                <h3 className="text-xl font-semibold mb-2">Importing Data...</h3>
                <p className="text-muted-foreground">
                  Please wait while we import {parsedData?.totalRows} claims.
                </p>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
