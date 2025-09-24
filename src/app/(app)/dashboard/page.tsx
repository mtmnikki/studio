import { claims } from "@/lib/data";
import { PageHeader } from "@/components/page-header";
import { ClaimsTableClient } from "@/components/claims-table-client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { FileWarning, CheckCircle, DollarSign } from "lucide-react";

export default function DashboardPage() {
  const claimsData = claims; // In a real app, you'd fetch this
  const statementsNeeded = claimsData.filter(c => !c.statementSent).length;
  const statementsSent = claimsData.length - statementsNeeded;
  const totalOutstanding = claimsData.filter(c => !c.statementSent).reduce((acc, c) => acc + c.amount, 0);

  return (
    <>
      <PageHeader
        title="Dashboard"
        description="Overview of your billing activity."
      />
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Outstanding Balance</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${totalOutstanding.toFixed(2)}</div>
            <p className="text-xs text-muted-foreground">
              Total from claims needing statements
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Statements Needed</CardTitle>
            <FileWarning className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{statementsNeeded}</div>
            <p className="text-xs text-muted-foreground">
              New claims requiring a statement
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Statements Sent</CardTitle>
            <CheckCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{statementsSent}</div>
            <p className="text-xs text-muted-foreground">
              Out of {claimsData.length} total claims
            </p>
          </CardContent>
        </Card>
      </div>
      <ClaimsTableClient initialClaims={claimsData} />
    </>
  );
}
