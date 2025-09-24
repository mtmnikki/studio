"use client";

import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { Printer } from "lucide-react";
import { useRouter } from "next/navigation";

export function PrintStatementButton({ claimId }: { claimId: string }) {
  const { toast } = useToast();
  const router = useRouter();
  
  const handlePrintAndMarkSent = () => {
    // This simulates updating the database and then telling the client to refetch/update.
    // In this demo, we pass a query param to the dashboard, which will trigger
    // a one-time state update in the `ClaimsTableClient` component.
    toast({
      title: "Statement Status Updated",
      description: "The claim has been marked as '1st Statement Sent'.",
    });

    // A small delay to allow toast to show before print dialog blocks UI
    setTimeout(() => {
        window.print();
        // After printing (or cancelling), redirect back to the dashboard with a flag.
        router.push(`/dashboard?updated=${claimId}`);
    }, 200);
  };

  return (
    <Button onClick={handlePrintAndMarkSent}>
      <Printer className="mr-2 h-4 w-4" />
      Print & Mark as Sent
    </Button>
  );
}
