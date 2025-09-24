"use client";

import * as React from "react";
import { PageHeader } from "@/components/page-header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { usePharmacies } from "@/hooks/use-pharmacies";
import { useClaims } from "@/hooks/use-claims";
import type { Claim, Pharmacy } from "@/lib/types";
import { formatCurrency } from "@/lib/utils";
import { Building2, Filter, Layers, Target, TrendingUp } from "lucide-react";

const filterOptions = [
  { value: "all", label: "All" },
  { value: "active", label: "Active" },
  { value: "needs-review", label: "Needs Review" },
  { value: "prospect", label: "Prospects" },
];

function normalize(value?: string | null) {
  return value?.toLowerCase().replace(/[^a-z0-9]/g, "") ?? "";
}

function matchesPharmacy(claim: Claim, pharmacy: Pharmacy) {
  if (!pharmacy) return false;
  if (pharmacy.npi && claim.npi && normalize(pharmacy.npi) === normalize(claim.npi)) {
    return true;
  }

  const payee = normalize(claim.payee);
  const payer = normalize(claim.payer);
  const name = normalize(pharmacy.name);
  const id = normalize(pharmacy.id);

  if (name && payee && (payee.includes(name) || name.includes(payee))) {
    return true;
  }
  if (id && payee && (payee.includes(id) || id.includes(payee))) {
    return true;
  }
  if (name && payer && payer.includes(name)) {
    return true;
  }
  return false;
}

function formatDate(value?: string | null) {
  if (!value) return "—";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}

type PharmacySummary = {
  claims: Claim[];
  outstanding: number;
  totalClaims: number;
  totalPaid: number;
  statementsDue: number;
  lastCheckDate: string | null;
  topServices: Record<string, number>;
};

export default function PharmaciesPage() {
  const { pharmacies, isLoading: pharmaciesLoading } = usePharmacies();
  const { claims, isLoading: claimsLoading } = useClaims();

  const [searchTerm, setSearchTerm] = React.useState("");
  const [statusFilter, setStatusFilter] = React.useState<(typeof filterOptions)[number]["value"]>("all");
  const [selectedPharmacyId, setSelectedPharmacyId] = React.useState<string | null>(null);
  const [activeTab, setActiveTab] = React.useState("overview");

  const summaries = React.useMemo(() => {
    const map = new Map<string, PharmacySummary>();
    (pharmacies ?? []).forEach((pharmacy) => {
      const relatedClaims = (claims ?? []).filter((claim) => matchesPharmacy(claim, pharmacy));
      const summary: PharmacySummary = {
        claims: relatedClaims,
        outstanding: 0,
        totalClaims: relatedClaims.length,
        totalPaid: 0,
        statementsDue: 0,
        lastCheckDate: null,
        topServices: {},
      };

      relatedClaims.forEach((claim) => {
        summary.outstanding += claim.statementSent ? 0 : (claim.patientPay ?? 0);
        summary.totalPaid += claim.paid ?? 0;
        if (!claim.statementSent) {
          summary.statementsDue += 1;
        }
        if (claim.checkDate) {
          const iso = new Date(claim.checkDate).toISOString();
          if (!summary.lastCheckDate || iso > summary.lastCheckDate) {
            summary.lastCheckDate = iso;
          }
        }
        if (claim.serviceDescription) {
          const key = claim.serviceDescription;
          summary.topServices[key] = (summary.topServices[key] ?? 0) + 1;
        }
      });
      map.set(pharmacy.id, summary);
    });
    return map;
  }, [pharmacies, claims]);

  const filteredPharmacies = React.useMemo(() => {
    const normalizedSearch = normalize(searchTerm);
    return (pharmacies ?? []).filter((pharmacy) => {
      const summary = summaries.get(pharmacy.id);

      if (statusFilter === "active" && pharmacy.status !== "Active") {
        return false;
      }
      if (statusFilter === "needs-review" && (!summary || summary.statementsDue === 0)) {
        return false;
      }
      if (statusFilter === "prospect" && pharmacy.status !== "Prospect") {
        return false;
      }

      if (!normalizedSearch) {
        return true;
      }

      const haystack = [
        pharmacy.name,
        pharmacy.contactName,
        pharmacy.phone,
        pharmacy.email,
        pharmacy.address?.city,
        pharmacy.address?.state,
      ]
        .filter(Boolean)
        .map((value) => normalize(value?.toString()))
        .join(" ");

      return haystack.includes(normalizedSearch);
    });
  }, [pharmacies, summaries, statusFilter, searchTerm]);

  React.useEffect(() => {
    if (!selectedPharmacyId && filteredPharmacies.length) {
      setSelectedPharmacyId(filteredPharmacies[0].id);
    }
  }, [filteredPharmacies, selectedPharmacyId]);

  React.useEffect(() => {
    if (selectedPharmacyId && !filteredPharmacies.some((item) => item.id === selectedPharmacyId)) {
      setSelectedPharmacyId(filteredPharmacies[0]?.id ?? null);
    }
  }, [filteredPharmacies, selectedPharmacyId]);

  const selectedPharmacy = React.useMemo(
    () => filteredPharmacies.find((pharmacy) => pharmacy.id === selectedPharmacyId) ?? filteredPharmacies[0] ?? null,
    [filteredPharmacies, selectedPharmacyId]
  );

  const selectedSummary = selectedPharmacy ? summaries.get(selectedPharmacy.id) ?? {
    claims: [],
    outstanding: 0,
    totalClaims: 0,
    totalPaid: 0,
    statementsDue: 0,
    lastCheckDate: null,
    topServices: {},
  } : null;

  const dashboardTotals = React.useMemo(() => {
    const base = { total: filteredPharmacies.length, outstanding: 0, due: 0, paid: 0 };
    filteredPharmacies.forEach((pharmacy) => {
      const summary = summaries.get(pharmacy.id);
      if (!summary) return;
      base.outstanding += summary.outstanding;
      base.due += summary.statementsDue;
      base.paid += summary.totalPaid;
    });
    return base;
  }, [filteredPharmacies, summaries]);

  const isLoading = pharmaciesLoading || claimsLoading;

  return (
    <div className="space-y-8">
      <PageHeader
        title="Pharmacy Partnerships"
        description="Track pharmacy relationships, outstanding balances, and operational history to keep everything moving smoothly."
      />

      <div className="grid gap-6 lg:grid-cols-[340px,1fr]">
        <div className="space-y-4">
          <Card className="border-none bg-white/70 p-[1px] shadow-xl shadow-sky-200/50">
            <div className="rounded-3xl bg-gradient-to-br from-white/90 via-white/80 to-white/60">
              <CardHeader className="space-y-3 border-b border-white/60">
                <CardTitle className="flex items-center gap-2 text-lg font-semibold text-slate-700">
                  <Filter className="h-5 w-5 text-sky-500" /> Pharmacy Directory
                </CardTitle>
                <div className="flex flex-col gap-3">
                  <Input
                    value={searchTerm}
                    onChange={(event) => setSearchTerm(event.target.value)}
                    placeholder="Search by name, contact, or city"
                    className="h-11 rounded-2xl border-none bg-white/80 px-4 text-sm shadow-inner"
                  />
                  <Tabs
                    value={statusFilter}
                    onValueChange={(value) => setStatusFilter(value as (typeof filterOptions)[number]["value"])}
                  >
                    <TabsList className="grid h-11 grid-cols-4 rounded-2xl bg-slate-100/60 p-[2px]">
                      {filterOptions.map((option) => (
                        <TabsTrigger
                          key={option.value}
                          value={option.value}
                          className="rounded-2xl px-2 text-xs font-semibold uppercase tracking-wide text-slate-500 transition data-[state=active]:bg-gradient-to-r data-[state=active]:from-sky-400 data-[state=active]:to-teal-400 data-[state=active]:text-white"
                        >
                          {option.label}
                        </TabsTrigger>
                      ))}
                    </TabsList>
                  </Tabs>
                </div>
              </CardHeader>
              <CardContent className="px-0 py-0">
                <ScrollArea className="h-[520px] px-4">
                  <div className="space-y-3 py-4">
                    {isLoading && (
                      <div className="rounded-2xl border border-dashed border-slate-200/80 bg-white/70 p-6 text-center text-sm text-slate-500">
                        Loading pharmacies...
                      </div>
                    )}
                    {!isLoading && filteredPharmacies.length === 0 && (
                      <div className="rounded-2xl border border-dashed border-slate-200/80 bg-white/70 p-6 text-center text-sm text-slate-500">
                        No pharmacies match your filters yet.
                      </div>
                    )}
                    {!isLoading &&
                      filteredPharmacies.map((pharmacy) => {
                        const summary = summaries.get(pharmacy.id);
                        const isActive = selectedPharmacy && pharmacy.id === selectedPharmacy.id;

                        return (
                          <button
                            key={pharmacy.id}
                            onClick={() => {
                              setSelectedPharmacyId(pharmacy.id);
                              setActiveTab("overview");
                            }}
                            className={`w-full rounded-3xl border p-4 text-left transition hover:shadow-lg ${
                              isActive
                                ? "border-transparent bg-gradient-to-r from-sky-400/90 via-cyan-400/90 to-teal-400/90 text-white shadow-xl"
                                : "border-white/60 bg-white/70 text-slate-600 hover:bg-white"
                            }`}
                          >
                            <div className="flex items-start justify-between gap-3">
                              <div>
                                <p className={`text-base font-semibold ${isActive ? "text-white" : "text-slate-700"}`}>
                                  {pharmacy.name}
                                </p>
                                <p className={`text-xs ${isActive ? "text-white/80" : "text-slate-500"}`}>
                                  {pharmacy.address?.city}, {pharmacy.address?.state}
                                </p>
                              </div>
                              <div className="text-right">
                                <p className={`text-sm font-semibold ${isActive ? "text-white" : "text-slate-700"}`}>
                                  {formatCurrency(summary?.outstanding ?? 0)}
                                </p>
                                <p className={`text-[11px] uppercase tracking-wide ${isActive ? "text-white/80" : "text-slate-400"}`}>
                                  Outstanding
                                </p>
                              </div>
                            </div>
                            <div className="mt-3 flex flex-wrap items-center gap-2">
                              {pharmacy.status && (
                                <Badge variant={isActive ? "secondary" : "outline"}>{pharmacy.status}</Badge>
                              )}
                              {summary && summary.statementsDue > 0 && (
                                <Badge variant="destructive">{summary.statementsDue} statements due</Badge>
                              )}
                              {summary && summary.totalClaims > 0 && (
                                <Badge variant="outline" className={isActive ? "border-white/50 text-white" : "text-slate-500"}>
                                  {summary.totalClaims} claims
                                </Badge>
                              )}
                            </div>
                          </button>
                        );
                      })}
                  </div>
                </ScrollArea>
              </CardContent>
            </div>
          </Card>

          <Card className="border-none bg-white/70 p-[1px] shadow-xl shadow-sky-200/50">
            <div className="rounded-3xl bg-gradient-to-br from-white/90 via-white/80 to-white/60">
              <CardHeader className="border-b border-white/60 pb-4">
                <CardTitle className="flex items-center gap-2 text-lg font-semibold text-slate-700">
                  <Layers className="h-5 w-5 text-teal-500" /> Network Pulse
                </CardTitle>
              </CardHeader>
              <CardContent className="grid gap-4 p-6">
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="rounded-3xl border border-white/60 bg-white/80 p-4 shadow-inner">
                    <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Active Partners</p>
                    <p className="mt-2 text-2xl font-semibold text-slate-700">{dashboardTotals.total}</p>
                    <p className="text-xs text-slate-500">Visible with current filters</p>
                  </div>
                  <div className="rounded-3xl border border-white/60 bg-white/80 p-4 shadow-inner">
                    <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Outstanding</p>
                    <p className="mt-2 text-2xl font-semibold text-slate-700">{formatCurrency(dashboardTotals.outstanding)}</p>
                    <p className="text-xs text-slate-500">Awaiting reimbursement</p>
                  </div>
                  <div className="rounded-3xl border border-white/60 bg-white/80 p-4 shadow-inner">
                    <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Statements Due</p>
                    <p className="mt-2 text-2xl font-semibold text-slate-700">{dashboardTotals.due}</p>
                    <p className="text-xs text-slate-500">Follow-up recommended</p>
                  </div>
                  <div className="rounded-3xl border border-white/60 bg-white/80 p-4 shadow-inner">
                    <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Insurance Paid</p>
                    <p className="mt-2 text-2xl font-semibold text-slate-700">{formatCurrency(dashboardTotals.paid)}</p>
                    <p className="text-xs text-slate-500">Captured in cycle</p>
                  </div>
                </div>
              </CardContent>
            </div>
          </Card>
        </div>

        <div className="space-y-6">
          <Card className="border-none bg-white/70 p-[1px] shadow-2xl shadow-sky-200/60">
            <div className="rounded-3xl bg-gradient-to-br from-white/90 via-white/80 to-white/60">
              <CardHeader className="border-b border-white/60 pb-4">
                <CardTitle className="flex items-center justify-between text-lg font-semibold text-slate-700">
                  <span>Pharmacy Profile</span>
                  {selectedPharmacy && (
                    <Badge variant="outline" className="rounded-full border-sky-200 text-sky-600">
                      {selectedPharmacy.status ?? "Status Pending"}
                    </Badge>
                  )}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6 p-6">
                {!selectedPharmacy && (
                  <div className="rounded-3xl border border-dashed border-slate-200/80 bg-white/70 p-6 text-center text-sm text-slate-500">
                    Select a pharmacy to see detailed history and performance insights.
                  </div>
                )}

                {selectedPharmacy && selectedSummary && (
                  <div className="space-y-6">
                    <div className="grid gap-6 lg:grid-cols-2">
                      <div className="rounded-3xl border border-white/60 bg-white/80 p-6 shadow-inner">
                        <h3 className="text-sm font-semibold uppercase tracking-wide text-slate-500">Contact</h3>
                        <p className="mt-2 text-lg font-semibold text-slate-700">{selectedPharmacy.name}</p>
                        {selectedPharmacy.address && (
                          <p className="text-sm text-slate-500">
                            {selectedPharmacy.address.street}
                            <br />
                            {selectedPharmacy.address.city}, {selectedPharmacy.address.state} {selectedPharmacy.address.zip}
                          </p>
                        )}
                        <div className="mt-3 space-y-1 text-sm text-slate-500">
                          {selectedPharmacy.contactName && <p>Contact: {selectedPharmacy.contactName}</p>}
                          {selectedPharmacy.phone && <p>{selectedPharmacy.phone}</p>}
                          {selectedPharmacy.email && <p>{selectedPharmacy.email}</p>}
                          {selectedPharmacy.npi && <p>NPI: {selectedPharmacy.npi}</p>}
                        </div>
                      </div>
                      <div className="rounded-3xl border border-white/60 bg-white/80 p-6 shadow-inner">
                        <h3 className="text-sm font-semibold uppercase tracking-wide text-slate-500">Performance</h3>
                        <div className="mt-4 grid gap-3 text-sm">
                          <div className="flex items-center justify-between rounded-2xl border border-white/60 bg-white/70 p-3">
                            <span className="text-slate-500">Outstanding</span>
                            <span className="font-semibold text-slate-700">{formatCurrency(selectedSummary.outstanding)}</span>
                          </div>
                          <div className="flex items-center justify-between rounded-2xl border border-white/60 bg-white/70 p-3">
                            <span className="text-slate-500">Insurance Paid</span>
                            <span className="font-semibold text-slate-700">{formatCurrency(selectedSummary.totalPaid)}</span>
                          </div>
                          <div className="flex items-center justify-between rounded-2xl border border-white/60 bg-white/70 p-3">
                            <span className="text-slate-500">Statements Due</span>
                            <span className="font-semibold text-slate-700">{selectedSummary.statementsDue}</span>
                          </div>
                          <div className="flex items-center justify-between rounded-2xl border border-white/60 bg-white/70 p-3">
                            <span className="text-slate-500">Last Payment</span>
                            <span className="font-semibold text-slate-700">{formatDate(selectedSummary.lastCheckDate)}</span>
                          </div>
                        </div>
                      </div>
                    </div>

                    <Tabs value={activeTab} onValueChange={setActiveTab}>
                      <TabsList className="mb-4 rounded-2xl bg-slate-100/60 p-[2px]">
                        <TabsTrigger
                          value="overview"
                          className="rounded-2xl px-4 py-2 text-sm font-semibold text-slate-500 data-[state=active]:bg-gradient-to-r data-[state=active]:from-sky-400 data-[state=active]:to-cyan-400 data-[state=active]:text-white"
                        >
                          Overview
                        </TabsTrigger>
                        <TabsTrigger
                          value="history"
                          className="rounded-2xl px-4 py-2 text-sm font-semibold text-slate-500 data-[state=active]:bg-gradient-to-r data-[state=active]:from-cyan-400 data-[state=active]:to-teal-400 data-[state=active]:text-white"
                        >
                          Claims
                        </TabsTrigger>
                        <TabsTrigger
                          value="insights"
                          className="rounded-2xl px-4 py-2 text-sm font-semibold text-slate-500 data-[state=active]:bg-gradient-to-r data-[state=active]:from-teal-400 data-[state=active]:to-emerald-300 data-[state=active]:text-white"
                        >
                          Insights
                        </TabsTrigger>
                      </TabsList>

                      <TabsContent value="overview" className="space-y-4">
                        <div className="rounded-3xl border border-white/60 bg-white/80 p-6 shadow-inner">
                          <h3 className="flex items-center gap-2 text-sm font-semibold uppercase tracking-wide text-slate-500">
                            <Building2 className="h-4 w-4 text-sky-500" /> Engagement Summary
                          </h3>
                          <div className="mt-4 grid gap-4 sm:grid-cols-2">
                            <div className="rounded-2xl border border-white/60 bg-white/70 p-4">
                              <p className="text-xs uppercase tracking-wide text-slate-500">Total Claims</p>
                              <p className="mt-1 text-2xl font-semibold text-slate-700">{selectedSummary.totalClaims}</p>
                              <p className="text-xs text-slate-500">Filed with this pharmacy</p>
                            </div>
                            <div className="rounded-2xl border border-white/60 bg-white/70 p-4">
                              <p className="text-xs uppercase tracking-wide text-slate-500">Top Service</p>
                              <p className="mt-1 text-2xl font-semibold text-slate-700">
                                {Object.entries(selectedSummary.topServices)
                                  .sort((a, b) => b[1] - a[1])[0]?.[0] ?? "—"}
                              </p>
                              <p className="text-xs text-slate-500">Most common billing item</p>
                            </div>
                            <div className="rounded-2xl border border-white/60 bg-white/70 p-4">
                              <p className="text-xs uppercase tracking-wide text-slate-500">Statements Due</p>
                              <p className="mt-1 text-2xl font-semibold text-slate-700">{selectedSummary.statementsDue}</p>
                              <p className="text-xs text-slate-500">Pending patient follow-up</p>
                            </div>
                            <div className="rounded-2xl border border-white/60 bg-white/70 p-4">
                              <p className="text-xs uppercase tracking-wide text-slate-500">Outstanding</p>
                              <p className="mt-1 text-2xl font-semibold text-slate-700">{formatCurrency(selectedSummary.outstanding)}</p>
                              <p className="text-xs text-slate-500">Balance to recover</p>
                            </div>
                          </div>
                        </div>
                      </TabsContent>

                      <TabsContent value="history" className="rounded-3xl border border-white/60 bg-white/80 p-6 shadow-inner">
                        {selectedSummary.claims.length === 0 ? (
                          <p className="text-sm text-slate-500">No claims on record for this pharmacy yet.</p>
                        ) : (
                          <div className="overflow-x-auto">
                            <Table>
                              <TableHeader>
                                <TableRow className="bg-white/70">
                                  <TableHead>Check Date</TableHead>
                                  <TableHead>Patient</TableHead>
                                  <TableHead>Service</TableHead>
                                  <TableHead className="text-right">Paid</TableHead>
                                  <TableHead className="text-right">Outstanding</TableHead>
                                  <TableHead>Status</TableHead>
                                </TableRow>
                              </TableHeader>
                              <TableBody>
                                {[...selectedSummary.claims]
                                  .sort((a, b) => (b.checkDate ?? "").localeCompare(a.checkDate ?? ""))
                                  .map((claim) => (
                                    <TableRow key={claim.id} className="transition hover:bg-sky-50/70">
                                      <TableCell>{formatDate(claim.checkDate)}</TableCell>
                                      <TableCell>
                                        <p className="font-medium text-slate-700">{claim.patientName}</p>
                                        <p className="text-xs text-slate-500">{claim.rx}</p>
                                      </TableCell>
                                      <TableCell>
                                        <p className="text-sm text-slate-600">{claim.serviceDescription}</p>
                                        <p className="text-xs text-slate-400">{claim.productId}</p>
                                      </TableCell>
                                      <TableCell className="text-right">{formatCurrency(claim.paid)}</TableCell>
                                      <TableCell className="text-right">{formatCurrency(claim.patientPay)}</TableCell>
                                      <TableCell>
                                        <Badge variant={claim.statementSent ? "outline" : "destructive"}>
                                          {claim.statementSent ? "Statement Sent" : "Needs Statement"}
                                        </Badge>
                                      </TableCell>
                                    </TableRow>
                                  ))}
                              </TableBody>
                            </Table>
                          </div>
                        )}
                      </TabsContent>

                      <TabsContent value="insights" className="rounded-3xl border border-white/60 bg-white/80 p-6 shadow-inner">
                        <div className="grid gap-4 md:grid-cols-2">
                          <div className="rounded-2xl border border-white/60 bg-white/70 p-4">
                            <h4 className="flex items-center gap-2 text-sm font-semibold uppercase tracking-wide text-slate-500">
                              <Target className="h-4 w-4 text-sky-500" /> Action Items
                            </h4>
                            <ul className="mt-3 space-y-2 text-sm text-slate-600">
                              <li>
                                • {selectedSummary.statementsDue > 0 ? `${selectedSummary.statementsDue} patient statements` : "No statements"} pending.
                              </li>
                              <li>
                                • {selectedSummary.outstanding > 0 ? `${formatCurrency(selectedSummary.outstanding)} outstanding balance` : "No outstanding balance"}.
                              </li>
                              <li>
                                • Last payment {formatDate(selectedSummary.lastCheckDate)}.
                              </li>
                            </ul>
                          </div>
                          <div className="rounded-2xl border border-white/60 bg-white/70 p-4">
                            <h4 className="flex items-center gap-2 text-sm font-semibold uppercase tracking-wide text-slate-500">
                              <TrendingUp className="h-4 w-4 text-teal-500" /> Service Mix
                            </h4>
                            <div className="mt-3 space-y-2 text-sm text-slate-600">
                              {Object.entries(selectedSummary.topServices)
                                .sort((a, b) => b[1] - a[1])
                                .slice(0, 5)
                                .map(([service, count]) => (
                                  <div key={service} className="flex items-center justify-between">
                                    <span>{service}</span>
                                    <span className="rounded-full bg-slate-100 px-2 py-1 text-xs text-slate-500">{count}</span>
                                  </div>
                                ))}
                              {Object.keys(selectedSummary.topServices).length === 0 && (
                                <p className="text-sm text-slate-500">No service mix data yet.</p>
                              )}
                            </div>
                          </div>
                        </div>
                      </TabsContent>
                    </Tabs>
                  </div>
                )}
              </CardContent>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
