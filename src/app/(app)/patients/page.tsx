"use client";

import * as React from "react";
import { PageHeader } from "@/components/page-header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Separator } from "@/components/ui/separator";
import { Progress } from "@/components/ui/progress";
import { usePatients } from "@/hooks/use-patients";
import { useClaims } from "@/hooks/use-claims";
import type { Claim, Patient } from "@/lib/types";
import { formatCurrency } from "@/lib/utils";
import { Search, Activity, ClipboardList } from "lucide-react";

function formatDisplayDate(value?: string | null) {
  if (!value) return "—";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}

function getPatientName(patient: Patient) {
  return `${patient.firstName} ${patient.lastName}`.trim();
}

type PatientSummary = {
  claims: Claim[];
  outstanding: number;
  needed: number;
  sent: number;
  total: number;
  totalPaid: number;
  lastServiceDate: string | null;
  lastUpdate: string | null;
};

const filterOptions = [
  { value: "all", label: "All" },
  { value: "active", label: "Active" },
  { value: "needs-action", label: "Needs Action" },
  { value: "collections", label: "Collections" },
];

export default function PatientsPage() {
  const { patients, isLoading: patientsLoading } = usePatients();
  const { claims, isLoading: claimsLoading } = useClaims();

  const [searchTerm, setSearchTerm] = React.useState("");
  const [statusFilter, setStatusFilter] = React.useState<(typeof filterOptions)[number]["value"]>("all");
  const [selectedPatientId, setSelectedPatientId] = React.useState<string | null>(null);
  const [activeTab, setActiveTab] = React.useState("overview");

  const summaries = React.useMemo(() => {
    const map = new Map<string, PatientSummary>();
    (claims ?? []).forEach((claim) => {
      if (!claim.patientId) return;
      const current = map.get(claim.patientId) ?? {
        claims: [],
        outstanding: 0,
        needed: 0,
        sent: 0,
        total: 0,
        totalPaid: 0,
        lastServiceDate: null as string | null,
        lastUpdate: null as string | null,
      };

      current.claims.push(claim);
      current.total += 1;
      current.totalPaid += claim.paid ?? 0;
      const patientPayValue = claim.patientPay ?? 0;
      if (!claim.statementSent) {
        current.outstanding += patientPayValue;
        current.needed += 1;
      } else {
        current.sent += 1;
      }

      if (claim.serviceDate) {
        const date = new Date(claim.serviceDate).toISOString();
        if (!current.lastServiceDate || date > current.lastServiceDate) {
          current.lastServiceDate = date;
        }
      }

      const possibleUpdate = claim.statementSent2ndAt ?? claim.statementSentAt ?? claim.checkDate;
      if (possibleUpdate) {
        const normalized = new Date(possibleUpdate).toISOString();
        if (!current.lastUpdate || normalized > current.lastUpdate) {
          current.lastUpdate = normalized;
        }
      }

      map.set(claim.patientId, current);
    });
    return map;
  }, [claims]);

  const filteredPatients = React.useMemo(() => {
    const normalizedSearch = searchTerm.trim().toLowerCase();

    return (patients ?? []).filter((patient) => {
      const summary = summaries.get(patient.id);

      if (statusFilter === "active" && patient.status && patient.status !== "Active") {
        return false;
      }
      if (statusFilter === "needs-action" && (!summary || summary.outstanding <= 0)) {
        return false;
      }
      if (statusFilter === "collections" && patient.status !== "Collections") {
        return false;
      }

      if (!normalizedSearch) {
        return true;
      }

      const haystack = [
        patient.firstName,
        patient.lastName,
        patient.address?.city,
        patient.address?.state,
        patient.address?.street,
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();

      return haystack.includes(normalizedSearch);
    });
  }, [patients, searchTerm, statusFilter, summaries]);

  React.useEffect(() => {
    if (!selectedPatientId && filteredPatients.length) {
      setSelectedPatientId(filteredPatients[0].id);
    }
  }, [filteredPatients, selectedPatientId]);

  React.useEffect(() => {
    if (selectedPatientId && !filteredPatients.some((patient) => patient.id === selectedPatientId)) {
      setSelectedPatientId(filteredPatients[0]?.id ?? null);
    }
  }, [filteredPatients, selectedPatientId]);

  const selectedPatient = React.useMemo(
    () => filteredPatients.find((patient) => patient.id === selectedPatientId) ?? filteredPatients[0] ?? null,
    [filteredPatients, selectedPatientId]
  );

  const selectedSummary = selectedPatient ? summaries.get(selectedPatient.id) ?? {
    claims: [],
    outstanding: 0,
    needed: 0,
    sent: 0,
    total: 0,
    totalPaid: 0,
    lastServiceDate: null,
    lastUpdate: null,
  } : null;

  const dashboardTotals = React.useMemo(() => {
    const base = { patients: filteredPatients.length, outstanding: 0, statements: 0, collected: 0 };
    filteredPatients.forEach((patient) => {
      const summary = summaries.get(patient.id);
      if (!summary) return;
      base.outstanding += summary.outstanding;
      base.statements += summary.needed;
      base.collected += summary.totalPaid;
    });
    return base;
  }, [filteredPatients, summaries]);

  const isLoading = patientsLoading || claimsLoading;

  return (
    <div className="space-y-8">
      <PageHeader
        title="Patient Navigator"
        description="Search, filter, and drill into individual patients to understand balances, activity, and statement history."
      />

      <div className="grid gap-6 lg:grid-cols-[340px,1fr]">
        <div className="space-y-4">
          <Card className="border-none bg-white/70 p-[1px] shadow-xl shadow-sky-200/50">
            <div className="rounded-3xl bg-gradient-to-br from-white/90 via-white/80 to-white/60">
              <CardHeader className="space-y-3 border-b border-white/60">
                <CardTitle className="flex items-center gap-2 text-lg font-semibold text-slate-700">
                  <Search className="h-5 w-5 text-sky-500" /> Patient List
                </CardTitle>
                <div className="flex flex-col gap-3">
                  <Input
                    value={searchTerm}
                    onChange={(event) => setSearchTerm(event.target.value)}
                    placeholder="Search by name, city, or ID"
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
                          className="rounded-2xl px-2 text-xs font-semibold uppercase tracking-wide text-slate-500 transition data-[state=active]:bg-gradient-to-r data-[state=active]:from-indigo-400 data-[state=active]:to-sky-400 data-[state=active]:text-white"
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
                        Loading patients...
                      </div>
                    )}
                    {!isLoading && filteredPatients.length === 0 && (
                      <div className="rounded-2xl border border-dashed border-slate-200/80 bg-white/70 p-6 text-center text-sm text-slate-500">
                        No patients match your filters right now.
                      </div>
                    )}
                    {!isLoading &&
                      filteredPatients.map((patient) => {
                        const summary = summaries.get(patient.id);
                        const isActive = selectedPatient && patient.id === selectedPatient.id;
                        const outstanding = summary?.outstanding ?? 0;
                        const lastVisit = summary?.lastServiceDate ?? patient.lastVisitAt;

                        return (
                          <button
                            key={patient.id}
                            onClick={() => {
                              setSelectedPatientId(patient.id);
                              setActiveTab("overview");
                            }}
                            className={`w-full rounded-3xl border p-4 text-left transition hover:shadow-lg ${
                              isActive
                                ? "border-transparent bg-gradient-to-r from-indigo-400/90 via-sky-400/90 to-teal-400/90 text-white shadow-xl"
                                : "border-white/60 bg-white/70 text-slate-600 hover:bg-white"
                            }`}
                          >
                            <div className="flex items-start justify-between gap-3">
                              <div>
                                <p className={`text-base font-semibold ${isActive ? "text-white" : "text-slate-700"}`}>
                                  {getPatientName(patient)}
                                </p>
                                <p className={`text-xs ${isActive ? "text-white/80" : "text-slate-500"}`}>
                                  {patient.address?.city}, {patient.address?.state}
                                </p>
                              </div>
                              <div className="text-right">
                                <p className={`text-sm font-semibold ${isActive ? "text-white" : "text-slate-700"}`}>
                                  {formatCurrency(outstanding)}
                                </p>
                                <p className={`text-[11px] uppercase tracking-wide ${isActive ? "text-white/80" : "text-slate-400"}`}>
                                  Outstanding
                                </p>
                              </div>
                            </div>
                            <div className="mt-3 flex flex-wrap items-center gap-2">
                              {patient.status && (
                                <Badge variant={isActive ? "secondary" : "outline"}>{patient.status}</Badge>
                              )}
                              {summary && summary.needed > 0 && (
                                <Badge variant="destructive">{summary.needed} statements due</Badge>
                              )}
                              {lastVisit && (
                                <Badge variant="outline" className={isActive ? "border-white/50 text-white" : "text-slate-500"}>
                                  Last DOS {formatDisplayDate(lastVisit)}
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
                  <Activity className="h-5 w-5 text-teal-500" /> Patient Metrics
                </CardTitle>
              </CardHeader>
              <CardContent className="grid gap-4 p-6">
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="rounded-3xl border border-white/60 bg-white/80 p-4 shadow-inner">
                    <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Patients</p>
                    <p className="mt-2 text-2xl font-semibold text-slate-700">{dashboardTotals.patients}</p>
                    <p className="text-xs text-slate-500">Currently visible</p>
                  </div>
                  <div className="rounded-3xl border border-white/60 bg-white/80 p-4 shadow-inner">
                    <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Outstanding</p>
                    <p className="mt-2 text-2xl font-semibold text-slate-700">{formatCurrency(dashboardTotals.outstanding)}</p>
                    <p className="text-xs text-slate-500">Across filtered patients</p>
                  </div>
                  <div className="rounded-3xl border border-white/60 bg-white/80 p-4 shadow-inner">
                    <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Statements Due</p>
                    <p className="mt-2 text-2xl font-semibold text-slate-700">{dashboardTotals.statements}</p>
                    <p className="text-xs text-slate-500">Waiting to be sent</p>
                  </div>
                  <div className="rounded-3xl border border-white/60 bg-white/80 p-4 shadow-inner">
                    <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Insurance Paid</p>
                    <p className="mt-2 text-2xl font-semibold text-slate-700">{formatCurrency(dashboardTotals.collected)}</p>
                    <p className="text-xs text-slate-500">Recorded payments</p>
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
                  <span>Patient Overview</span>
                  {selectedPatient && (
                    <Badge variant="outline" className="rounded-full border-sky-200 text-sky-600">
                      {selectedPatient.status ?? "Status Pending"}
                    </Badge>
                  )}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6 p-6">
                {!selectedPatient && (
                  <div className="rounded-3xl border border-dashed border-slate-200/80 bg-white/70 p-6 text-center text-sm text-slate-500">
                    Select a patient from the list to view their full history.
                  </div>
                )}

                {selectedPatient && selectedSummary && (
                  <div className="space-y-6">
                    <div className="grid gap-6 lg:grid-cols-2">
                      <div className="rounded-3xl border border-white/60 bg-white/80 p-6 shadow-inner">
                        <h3 className="text-sm font-semibold uppercase tracking-wide text-slate-500">Contact</h3>
                        <p className="mt-2 text-lg font-semibold text-slate-700">{getPatientName(selectedPatient)}</p>
                        <p className="text-sm text-slate-500">
                          {selectedPatient.address?.street}
                          <br />
                          {selectedPatient.address?.city}, {selectedPatient.address?.state} {selectedPatient.address?.zip}
                        </p>
                        <div className="mt-3 space-y-1 text-sm text-slate-500">
                          {selectedPatient.phone && <p>{selectedPatient.phone}</p>}
                          {selectedPatient.email && <p>{selectedPatient.email}</p>}
                          <p>DOB: {formatDisplayDate(selectedPatient.dateOfBirth)}</p>
                        </div>
                      </div>
                      <div className="rounded-3xl border border-white/60 bg-white/80 p-6 shadow-inner">
                        <h3 className="text-sm font-semibold uppercase tracking-wide text-slate-500">Statement Health</h3>
                        <div className="mt-4 space-y-4">
                          <div>
                            <div className="flex items-center justify-between text-sm">
                              <span className="text-slate-500">Progress</span>
                              <span className="font-semibold text-slate-700">
                                {selectedSummary.sent}/{selectedSummary.total}
                              </span>
                            </div>
                            <Progress value={selectedSummary.total ? (selectedSummary.sent / selectedSummary.total) * 100 : 0} className="mt-2 h-2 rounded-full bg-slate-200/70" />
                          </div>
                          <div className="grid grid-cols-2 gap-3 text-sm">
                            <div className="rounded-2xl border border-white/60 bg-white/70 p-3 text-center">
                              <p className="text-xs uppercase tracking-wide text-slate-500">Outstanding</p>
                              <p className="mt-1 text-base font-semibold text-slate-700">{formatCurrency(selectedSummary.outstanding)}</p>
                            </div>
                            <div className="rounded-2xl border border-white/60 bg-white/70 p-3 text-center">
                              <p className="text-xs uppercase tracking-wide text-slate-500">Insurance Paid</p>
                              <p className="mt-1 text-base font-semibold text-slate-700">{formatCurrency(selectedSummary.totalPaid)}</p>
                            </div>
                            <div className="rounded-2xl border border-white/60 bg-white/70 p-3 text-center">
                              <p className="text-xs uppercase tracking-wide text-slate-500">Statements Needed</p>
                              <p className="mt-1 text-base font-semibold text-slate-700">{selectedSummary.needed}</p>
                            </div>
                            <div className="rounded-2xl border border-white/60 bg-white/70 p-3 text-center">
                              <p className="text-xs uppercase tracking-wide text-slate-500">Last DOS</p>
                              <p className="mt-1 text-base font-semibold text-slate-700">{formatDisplayDate(selectedSummary.lastServiceDate)}</p>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>

                    <Tabs value={activeTab} onValueChange={setActiveTab}>
                      <TabsList className="mb-4 rounded-2xl bg-slate-100/60 p-[2px]">
                        <TabsTrigger
                          value="overview"
                          className="rounded-2xl px-4 py-2 text-sm font-semibold text-slate-500 data-[state=active]:bg-gradient-to-r data-[state=active]:from-indigo-400 data-[state=active]:to-sky-400 data-[state=active]:text-white"
                        >
                          Dashboard
                        </TabsTrigger>
                        <TabsTrigger
                          value="history"
                          className="rounded-2xl px-4 py-2 text-sm font-semibold text-slate-500 data-[state=active]:bg-gradient-to-r data-[state=active]:from-sky-400 data-[state=active]:to-teal-400 data-[state=active]:text-white"
                        >
                          Claim History
                        </TabsTrigger>
                        <TabsTrigger
                          value="timeline"
                          className="rounded-2xl px-4 py-2 text-sm font-semibold text-slate-500 data-[state=active]:bg-gradient-to-r data-[state=active]:from-teal-400 data-[state=active]:to-cyan-400 data-[state=active]:text-white"
                        >
                          Timeline
                        </TabsTrigger>
                      </TabsList>

                      <TabsContent value="overview" className="space-y-4">
                        <div className="rounded-3xl border border-white/60 bg-white/80 p-6 shadow-inner">
                          <h3 className="flex items-center gap-2 text-sm font-semibold uppercase tracking-wide text-slate-500">
                            <ClipboardList className="h-4 w-4 text-sky-500" /> Summary
                          </h3>
                          <Separator className="my-4 bg-slate-200/70" />
                          <div className="grid gap-4 sm:grid-cols-2">
                            <div className="rounded-2xl border border-white/60 bg-white/70 p-4">
                              <p className="text-xs uppercase tracking-wide text-slate-500">Total Claims</p>
                              <p className="mt-1 text-2xl font-semibold text-slate-700">{selectedSummary.total}</p>
                              <p className="text-xs text-slate-500">Lifetime in system</p>
                            </div>
                            <div className="rounded-2xl border border-white/60 bg-white/70 p-4">
                              <p className="text-xs uppercase tracking-wide text-slate-500">Last Update</p>
                              <p className="mt-1 text-2xl font-semibold text-slate-700">{formatDisplayDate(selectedSummary.lastUpdate)}</p>
                              <p className="text-xs text-slate-500">Most recent activity</p>
                            </div>
                            <div className="rounded-2xl border border-white/60 bg-white/70 p-4">
                              <p className="text-xs uppercase tracking-wide text-slate-500">Sent Statements</p>
                              <p className="mt-1 text-2xl font-semibold text-slate-700">{selectedSummary.sent}</p>
                              <p className="text-xs text-slate-500">Marked as delivered</p>
                            </div>
                            <div className="rounded-2xl border border-white/60 bg-white/70 p-4">
                              <p className="text-xs uppercase tracking-wide text-slate-500">Pending Statements</p>
                              <p className="mt-1 text-2xl font-semibold text-slate-700">{selectedSummary.needed}</p>
                              <p className="text-xs text-slate-500">Ready for generation</p>
                            </div>
                          </div>
                        </div>
                      </TabsContent>

                      <TabsContent value="history" className="rounded-3xl border border-white/60 bg-white/80 p-6 shadow-inner">
                        {selectedSummary.claims.length === 0 ? (
                          <p className="text-sm text-slate-500">No claims recorded for this patient yet.</p>
                        ) : (
                          <div className="overflow-x-auto">
                            <Table>
                              <TableHeader>
                                <TableRow className="bg-white/70">
                                  <TableHead>DOS</TableHead>
                                  <TableHead>Service</TableHead>
                                  <TableHead className="text-right">Billed</TableHead>
                                  <TableHead className="text-right">Paid</TableHead>
                                  <TableHead className="text-right">Patient Pay</TableHead>
                                  <TableHead>Status</TableHead>
                                  <TableHead>Workflow</TableHead>
                                </TableRow>
                              </TableHeader>
                              <TableBody>
                                {[...selectedSummary.claims]
                                  .sort((a, b) => (b.serviceDate ?? "").localeCompare(a.serviceDate ?? ""))
                                  .map((claim) => (
                                    <TableRow key={claim.id} className="transition hover:bg-sky-50/70">
                                      <TableCell>{formatDisplayDate(claim.serviceDate)}</TableCell>
                                      <TableCell>
                                        <p className="font-medium text-slate-700">{claim.serviceDescription || "Service"}</p>
                                        <p className="text-xs text-slate-500">Rx {claim.rx}</p>
                                      </TableCell>
                                      <TableCell className="text-right">{formatCurrency(claim.amount)}</TableCell>
                                      <TableCell className="text-right">{formatCurrency(claim.paid)}</TableCell>
                                      <TableCell className="text-right">{formatCurrency(claim.patientPay)}</TableCell>
                                      <TableCell>
                                        <Badge variant={claim.statementSent ? "outline" : "destructive"}>
                                          {claim.statementSent ? "Sent" : "Pending"}
                                        </Badge>
                                      </TableCell>
                                      <TableCell>
                                        <Badge variant="secondary">{claim.workflow}</Badge>
                                      </TableCell>
                                    </TableRow>
                                  ))}
                              </TableBody>
                            </Table>
                          </div>
                        )}
                      </TabsContent>

                      <TabsContent value="timeline" className="rounded-3xl border border-white/60 bg-white/80 p-6 shadow-inner">
                        <div className="space-y-4">
                          {selectedSummary.claims.length === 0 ? (
                            <p className="text-sm text-slate-500">No events recorded yet.</p>
                          ) : (
                            [...selectedSummary.claims]
                              .sort((a, b) => (a.serviceDate ?? "").localeCompare(b.serviceDate ?? ""))
                              .map((claim) => (
                                <div key={claim.id} className="flex gap-4">
                                  <div className="relative flex flex-col items-center">
                                    <div className="mt-1 h-4 w-4 rounded-full bg-gradient-to-br from-sky-400 to-teal-400 shadow-lg" />
                                    <div className="mt-1 h-full w-[2px] bg-slate-200" />
                                  </div>
                                  <div className="flex-1 rounded-2xl border border-white/60 bg-white/70 p-4 shadow-sm">
                                    <div className="flex flex-wrap items-center justify-between gap-2">
                                      <div>
                                        <p className="text-sm font-semibold text-slate-700">{formatDisplayDate(claim.serviceDate)}</p>
                                        <p className="text-xs uppercase tracking-wide text-slate-400">Service Date</p>
                                      </div>
                                      <Badge variant={claim.statementSent ? "outline" : "secondary"}>
                                        {claim.statementSent ? "Statement Sent" : "Needs Statement"}
                                      </Badge>
                                    </div>
                                    <p className="mt-3 text-sm text-slate-600">
                                      {claim.serviceDescription || "Service"} · {claim.productId || claim.rx}
                                    </p>
                                    <div className="mt-3 grid gap-2 text-xs text-slate-500 sm:grid-cols-3">
                                      <p>Billed: {formatCurrency(claim.amount)}</p>
                                      <p>Paid: {formatCurrency(claim.paid)}</p>
                                      <p>Patient: {formatCurrency(claim.patientPay)}</p>
                                    </div>
                                  </div>
                                </div>
                              ))
                          )}
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
