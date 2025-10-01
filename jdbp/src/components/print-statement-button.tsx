"use client";

import * as React from "react";

import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { Printer } from "lucide-react";
import { useRouter } from "next/navigation";
import { markClaimsStatementStatus } from "@/lib/statement-actions";

type PrintStatementButtonProps = {
  claimIds: string[];
  patientId: string;
  statement?: "first" | "second";
  redirectTo?: string;
};

export function PrintStatementButton({
  claimIds,
  patientId,
  statement = "first",
  redirectTo = "/dashboard",
}: PrintStatementButtonProps) {
  const { toast } = useToast();
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = React.useState(false);

  const buildRedirectUrl = React.useCallback(() => {
    try {
      const url = new URL(redirectTo, window.location.origin);
      url.searchParams.set("updatedPatient", patientId);
      return url.pathname + (url.search ? `?${url.searchParams.toString()}` : "");
    } catch {
      return `${redirectTo}?updatedPatient=${patientId}`;
    }
  }, [redirectTo, patientId]);

  const handlePrintAndMarkSent = async () => {
    if (!claimIds.length) {
      toast({
        title: "No claims available",
        description: "There are no claims to update for this patient.",
        variant: "destructive",
      });
      return;
    }

    try {
      setIsSubmitting(true);
      await markClaimsStatementStatus(claimIds, { statement });

      toast({
        title: "Statement status updated",
        description:
          statement === "second"
            ? "The patient's claims were marked as having a second statement sent."
            : "The patient's claims were marked as having a first statement sent.",
      });

      setTimeout(() => {
        window.print();
        router.push(buildRedirectUrl());
      }, 250);
    } catch (error) {
      console.error("Failed to mark statements as sent", error);
      toast({
        title: "Unable to update statement",
        description: "An unexpected error occurred while updating the claim records.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Button onClick={handlePrintAndMarkSent} disabled={isSubmitting}>
      <Printer className="mr-2 h-4 w-4" />
      {isSubmitting ? "Updating..." : "Print & Mark as Sent"}
    </Button>
  );
}
