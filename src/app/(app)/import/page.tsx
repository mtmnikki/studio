"use client";

import { PageHeader } from "@/components/page-header";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { useState } from "react";

export default function ImportPage() {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);

  const handleProcessData = () => {
    setIsLoading(true);
    // In a real app, you would parse the textarea content
    // and create new claim records. Here we simulate a delay.
    setTimeout(() => {
      setIsLoading(false);
      toast({
        title: "Data Processed",
        description: "Successfully simulated processing of claim data.",
        variant: "default",
        className: "bg-accent text-accent-foreground"
      });
    }, 1500);
  };

  return (
    <>
      <PageHeader
        title="Import Data"
        description="Paste data from TransactRx to create new claims."
      />
      <Card>
        <CardHeader>
          <CardTitle>Extract Claim Data</CardTitle>
          <CardDescription>
            Paste the raw text from the 'Check Detail' view in the TransactRx portal below. The app will automatically extract claims.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Textarea
            placeholder="Paste your claim data here..."
            className="min-h-[300px] font-mono text-sm"
            disabled={isLoading}
          />
        </CardContent>
        <CardFooter className="border-t px-6 py-4">
          <Button onClick={handleProcessData} disabled={isLoading}>
            {isLoading ? "Processing..." : "Process Data"}
          </Button>
        </CardFooter>
      </Card>
    </>
  );
}
