"use client";

import { useClaims } from "@/hooks/use-claims";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { FileWarning, CheckCircle, DollarSign } from "lucide-react";
import { useMemo } from "react";

export function ClaimsSummary({ initialClaims }: { initialClaims: any[] }) {
    const { claims } = useClaims(initialClaims);

    const summary = useMemo(() => {
      const safeClaims = claims || [];
      const statementsNeeded = safeClaims.filter(c => !c.statementSent).length;
      const statementsSent = safeClaims.length - statementsNeeded;
      const totalOutstanding = safeClaims.filter(c => !c.statementSent).reduce((acc, c) => acc + c.amount, 0);
      return { statementsNeeded, statementsSent, totalOutstanding, totalClaims: safeClaims.length };
  }, [claims]);


    return (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Outstanding Balance</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${summary.totalOutstanding.toFixed(2)}</div>
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
            <div className="text-2xl font-bold">{summary.statementsNeeded}</div>
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
            <div className="text-2xl font-bold">{summary.statementsSent}</div>
            <p className="text-xs text-muted-foreground">
              Out of {summary.totalClaims} total claims
            </p>
          </CardContent>
        </Card>
      </div>
    );
}
