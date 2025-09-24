"use client";

import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { Printer } from "lucide-react";
import { useRouter } from "next/navigation";
import { useClaims } from "@/hooks/use-claims";

export function PrintStatementButton({ claimId }: { claimId: string }) {
  const { toast } = useToast();
  const router = useRouter();
  const { setClaims } = useClaims();
  
  const handlePrintAndMarkSent = () => {
    setClaims(prevClaims => 
      prevClaims.map(c => 
        c.id === claimId ? { ...c, statementSent: true } : c
      )
    );

    toast({
      title: "Statement Status Updated",
      description: "The claim has been marked as '1st Statement Sent'.",
    });

    setTimeout(() => {
        window.print();
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
