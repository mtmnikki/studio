"use client";

import { useClaims } from "@/hooks/use-claims";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { FileWarning, CheckCircle, DollarSign } from "lucide-react";
import { useMemo } from "react";
import type { Claim } from "@/lib/types";
import { formatCurrency } from "@/lib/utils";

export function ClaimsSummary({ initialClaims = [] }: { initialClaims?: Claim[] }) {
    const { claims } = useClaims(initialClaims);

    const summary = useMemo(() => {
      const safeClaims = claims || [];
      const statementsNeeded = safeClaims.filter(c => !c.statementSent).length;
      const statementsSent = safeClaims.length - statementsNeeded;
      const totalOutstanding = safeClaims
        .filter(c => !c.statementSent)
        .reduce((acc, c) => acc + (c.patientPay ?? 0), 0);
      const totalRevenue = safeClaims.reduce((acc, c) => acc + (c.paid ?? 0), 0);
      return { statementsNeeded, statementsSent, totalOutstanding, totalClaims: safeClaims.length, totalRevenue };
  }, [claims]);

    return (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <Card className="relative overflow-hidden border-none bg-white/70 p-[1px] shadow-lg shadow-sky-200/50 backdrop-blur-xl transition hover:scale-[1.01]">
          <div className="rounded-2xl bg-gradient-to-br from-white/80 via-white/70 to-white/50 p-6">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 px-0 pb-2 pt-0">
              <CardTitle className="text-sm font-semibold uppercase tracking-wide text-slate-600">
                Outstanding Balance
              </CardTitle>
              <span className="rounded-full bg-gradient-to-br from-sky-500/20 to-indigo-500/30 p-2 text-sky-600">
                <DollarSign className="h-4 w-4" />
              </span>
            </CardHeader>
            <CardContent className="px-0">
              <div className="text-3xl font-bold text-slate-800">
                {formatCurrency(summary.totalOutstanding)}
              </div>
              <p className="mt-2 text-xs font-medium text-slate-500">
                Total owed across unsent statements
              </p>
            </CardContent>
          </div>
        </Card>
        <Card className="relative overflow-hidden border-none bg-white/70 p-[1px] shadow-lg shadow-sky-200/50 backdrop-blur-xl transition hover:scale-[1.01]">
          <div className="rounded-2xl bg-gradient-to-br from-white/80 via-white/70 to-white/50 p-6">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 px-0 pb-2 pt-0">
              <CardTitle className="text-sm font-semibold uppercase tracking-wide text-slate-600">
                Statements Needed
              </CardTitle>
              <span className="rounded-full bg-gradient-to-br from-indigo-500/20 to-sky-500/30 p-2 text-indigo-600">
                <FileWarning className="h-4 w-4" />
              </span>
            </CardHeader>
            <CardContent className="px-0">
              <div className="text-3xl font-bold text-slate-800">{summary.statementsNeeded}</div>
              <p className="mt-2 text-xs font-medium text-slate-500">
                Awaiting statement delivery
              </p>
            </CardContent>
          </div>
        </Card>
        <Card className="relative overflow-hidden border-none bg-white/70 p-[1px] shadow-lg shadow-sky-200/50 backdrop-blur-xl transition hover:scale-[1.01]">
          <div className="rounded-2xl bg-gradient-to-br from-white/80 via-white/70 to-white/50 p-6">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 px-0 pb-2 pt-0">
              <CardTitle className="text-sm font-semibold uppercase tracking-wide text-slate-600">
                Statements Sent
              </CardTitle>
              <span className="rounded-full bg-gradient-to-br from-teal-400/20 to-cyan-400/30 p-2 text-teal-600">
                <CheckCircle className="h-4 w-4" />
              </span>
            </CardHeader>
            <CardContent className="px-0">
              <div className="text-3xl font-bold text-slate-800">{summary.statementsSent}</div>
              <p className="mt-2 text-xs font-medium text-slate-500">
                Out of {summary.totalClaims} total claims
              </p>
            </CardContent>
          </div>
        </Card>
        <Card className="relative overflow-hidden border-none bg-white/70 p-[1px] shadow-lg shadow-sky-200/50 backdrop-blur-xl transition hover:scale-[1.01]">
          <div className="rounded-2xl bg-gradient-to-br from-white/80 via-white/70 to-white/50 p-6">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 px-0 pb-2 pt-0">
              <CardTitle className="text-sm font-semibold uppercase tracking-wide text-slate-600">
                Insurance Paid
              </CardTitle>
              <span className="rounded-full bg-gradient-to-br from-sky-500/20 to-teal-400/30 p-2 text-sky-600">
                <DollarSign className="h-4 w-4" />
              </span>
            </CardHeader>
            <CardContent className="px-0">
              <div className="text-3xl font-bold text-slate-800">
                {formatCurrency(summary.totalRevenue)}
              </div>
              <p className="mt-2 text-xs font-medium text-slate-500">Captured this billing cycle</p>
            </CardContent>
          </div>
        </Card>
      </div>
    );
}
