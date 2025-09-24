"use client";

import { useClaims } from "@/hooks/use-claims";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { FileWarning, CheckCircle, DollarSign } from "lucide-react";
import { useMemo } from "react";
import type { Claim } from "@/lib/types";

export function ClaimsSummary({ initialClaims = [] }: { initialClaims?: Claim[] }) {
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
        <Card className="relative overflow-hidden border-transparent bg-gradient-to-br from-indigo-500/20 via-sky-500/20 to-teal-400/20">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-semibold uppercase tracking-wide text-slate-700">Outstanding Balance</CardTitle>
            <span className="rounded-full bg-white/70 p-2 text-slate-600 shadow">
              <DollarSign className="h-4 w-4" />
            </span>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-slate-900">${summary.totalOutstanding.toFixed(2)}</div>
            <p className="text-xs font-medium uppercase tracking-wide text-slate-600">
              Total from claims needing statements
            </p>
          </CardContent>
        </Card>
        <Card className="border-white/40 bg-white/50">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-semibold uppercase tracking-wide text-slate-700">Statements Needed</CardTitle>
            <span className="rounded-full bg-sky-100 p-2 text-sky-600 shadow">
              <FileWarning className="h-4 w-4" />
            </span>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-slate-900">{summary.statementsNeeded}</div>
            <p className="text-xs font-medium uppercase tracking-wide text-slate-600">
              New claims requiring a statement
            </p>
          </CardContent>
        </Card>
        <Card className="border-white/40 bg-white/60">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-semibold uppercase tracking-wide text-slate-700">Statements Sent</CardTitle>
            <span className="rounded-full bg-emerald-100 p-2 text-emerald-600 shadow">
              <CheckCircle className="h-4 w-4" />
            </span>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-slate-900">{summary.statementsSent}</div>
            <p className="text-xs font-medium uppercase tracking-wide text-slate-600">
              Out of {summary.totalClaims} total claims
            </p>
          </CardContent>
        </Card>
      </div>
    );
}
