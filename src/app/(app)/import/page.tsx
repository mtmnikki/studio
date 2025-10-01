"use client";

import { PageHeader } from "@/components/page-header";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { useState } from "react";
import { useClaims } from "@/hooks/use-claims";
import { useRouter } from "next/navigation";
import { parseCSVWithAI, transformToClaimData } from "@/lib/ai-csv-parser";
import { Badge } from "@/components/ui/badge";
import { CheckCircle2, AlertCircle, Sparkles } from "lucide-react";
import { createClient } from "@/lib/supabase/client";

export default function ImportPage() {
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

  const handleAnalyzeWithAI = async () => {
    if (!selectedFile) {
      toast({
        title: "No File Selected",
        description: "Please select a CSV file to analyze.",
        variant: "destructive",
      });
      return;
    }

    // Check for OpenAI API key
    const openaiKey = process.env.NEXT_PUBLIC_OPENAI_API_KEY;
    if (!openaiKey) {
      toast({
        title: "API Key Missing",
        description: "OpenAI API key is not configured. Please add NEXT_PUBLIC_OPENAI_API_KEY to your .env.local file.",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    setStep('preview');

    try {
      // Upload CSV to storage first
      const timestamp = Date.now();
      const filePath = `uploads/${timestamp}_${selectedFile.name}`;

      const { error: uploadError } = await supabase.storage
        .from('csv-uploads')
        .upload(filePath, selectedFile);

      if (uploadError) throw uploadError;

      // Parse CSV with AI
      const parsed = await parseCSVWithAI(selectedFile, openaiKey);
      setParsedData(parsed);

      toast({
        title: "AI Analysis Complete!",
        description: `Successfully mapped ${parsed.mappedColumns.filter((c: any) => c.mappedName !== 'unmapped').length} columns and found ${parsed.totalRows} records.`,
      });
    } catch (error: any) {
      toast({
        title: "AI Analysis Failed",
        description: error.message || "Failed to analyze CSV with AI",
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
      // Transform parsed data to claim format
      const claims = parsedData.rows.map((row: any) => transformToClaimData(row));

      // Import to Supabase
      await addClaims(claims);

      toast({
        title: "Import Successful!",
        description: `Successfully imported ${claims.length} claims. Redirecting...`,
      });

      // Reset state
      setSelectedFile(null);
      setParsedData(null);
      setStep('select');
      const fileInput = document.getElementById('csv-upload') as HTMLInputElement;
      if (fileInput) fileInput.value = '';

      // Redirect to dashboard
      setTimeout(() => router.push('/dashboard'), 1500);
    } catch (error: any) {
      toast({
        title: "Import Failed",
        description: error.message || "Failed to import claims data",
        variant: "destructive",
      });
      setStep('preview');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Import Claims Data"
        description="Upload CSV files and let AI automatically map your columns to the correct fields."
      />

      {/* Step 1: Upload File */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-indigo-500" />
            AI-Powered CSV Import
          </CardTitle>
          <CardDescription>
            Upload any CSV file format - our AI will automatically detect and map your columns.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Input
            id="csv-upload"
            type="file"
            accept=".csv"
            onChange={handleFileChange}
            disabled={isLoading}
            className="cursor-pointer"
          />
          {selectedFile && (
            <div className="mt-4 rounded-lg border border-blue-200 bg-blue-50 p-4">
              <p className="text-sm font-medium text-blue-900">
                Selected: {selectedFile.name}
              </p>
              <p className="text-xs text-blue-700">
                Size: {(selectedFile.size / 1024).toFixed(2)} KB
              </p>
            </div>
          )}
        </CardContent>
        <CardFooter className="border-t px-6 py-4">
          <Button
            onClick={handleAnalyzeWithAI}
            disabled={isLoading || !selectedFile || step !== 'select'}
            className="bg-gradient-to-r from-indigo-500 to-purple-500 hover:from-indigo-600 hover:to-purple-600"
          >
            {isLoading ? (
              <>Analyzing with AI...</>
            ) : (
              <>
                <Sparkles className="mr-2 h-4 w-4" />
                Analyze with AI
              </>
            )}
          </Button>
        </CardFooter>
      </Card>

      {/* Step 2: Preview Mapping */}
      {parsedData && step === 'preview' && (
        <Card>
          <CardHeader>
            <CardTitle>Column Mapping Preview</CardTitle>
            <CardDescription>
              AI has automatically mapped your columns. Review and import when ready.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {parsedData.mappedColumns.map((col: any, idx: number) => (
                <div
                  key={idx}
                  className="flex items-center justify-between rounded-lg border p-3"
                >
                  <div className="flex items-center gap-3">
                    {col.mappedName !== 'unmapped' ? (
                      <CheckCircle2 className="h-5 w-5 text-green-500" />
                    ) : (
                      <AlertCircle className="h-5 w-5 text-orange-500" />
                    )}
                    <div>
                      <p className="font-medium">{col.originalName}</p>
                      <p className="text-xs text-muted-foreground">
                        {col.mappedName !== 'unmapped' ? (
                          <>Maps to: <span className="font-mono">{col.mappedName}</span></>
                        ) : (
                          'Not mapped (will be skipped)'
                        )}
                      </p>
                    </div>
                  </div>
                  <Badge variant={col.mappedName !== 'unmapped' ? 'default' : 'outline'}>
                    {col.mappedName !== 'unmapped' ? 'Mapped' : 'Unmapped'}
                  </Badge>
                </div>
              ))}
            </div>

            <div className="mt-6 rounded-lg bg-slate-50 p-4">
              <p className="text-sm font-medium text-slate-900">
                Import Summary
              </p>
              <div className="mt-2 grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-slate-600">Total Rows</p>
                  <p className="text-lg font-bold">{parsedData.totalRows}</p>
                </div>
                <div>
                  <p className="text-slate-600">Mapped Columns</p>
                  <p className="text-lg font-bold">
                    {parsedData.mappedColumns.filter((c: any) => c.mappedName !== 'unmapped').length}
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
          <CardFooter className="border-t px-6 py-4 flex gap-3">
            <Button
              variant="outline"
              onClick={() => {
                setParsedData(null);
                setStep('select');
              }}
              disabled={isLoading}
            >
              Cancel
            </Button>
            <Button
              onClick={handleImportData}
              disabled={isLoading}
              className="bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600"
            >
              {isLoading ? 'Importing...' : `Import ${parsedData.totalRows} Records`}
            </Button>
          </CardFooter>
        </Card>
      )}
    </div>
  );
}
