"use client";

import { PageHeader } from "@/components/page-header";
import { ClaimsTableClient } from "@/components/claims-table-client";
import { ClaimsSummary } from "@/components/claims-summary";
import { useClaims } from "@/hooks/use-claims";

export default function DashboardPage() {
  const { claims, isLoading } = useClaims(); 

  if (isLoading) {
    return (
        <div className="flex justify-center items-center h-64">
          <p>Loading claims data...</p>
        </div>
    )
  }

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
