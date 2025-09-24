import { claims } from "@/lib/data";
import { PageHeader } from "@/components/page-header";
import { ClaimsTableClient } from "@/components/claims-table-client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { FileWarning, CheckCircle, DollarSign } from "lucide-react";
import { ClaimsSummary } from "@/components/claims-summary";

export default function DashboardPage() {
  const claimsData = claims; // In a real app, you'd fetch this from a DB

  return (
    <>
      <PageHeader
        title="Dashboard"
        description="Overview of your billing activity."
      />
      <ClaimsSummary initialClaims={claimsData} />
      <ClaimsTableClient initialClaims={claimsData} />
    </>
  );
}
