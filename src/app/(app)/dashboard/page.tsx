"use client";

import { PageHeader } from "@/components/page-header";
import { ClaimsTableClient } from "@/components/claims-table-client";
import { ClaimsSummary } from "@/components/claims-summary";
import { useClaims } from "@/hooks/use-claims";

export default function DashboardPage() {
  const { claims } = useClaims(); 

  return (
    <>
      <PageHeader
        title="Dashboard"
        description="Overview of your billing activity."
      />
      <ClaimsSummary initialClaims={claims} />
      <ClaimsTableClient initialClaims={claims} />
    </>
  );
}
