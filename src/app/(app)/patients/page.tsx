"use client";

import { useEffect, useMemo, useState } from "react";
import { Activity, ArrowRight, CalendarClock, Filter, HeartPulse, Search, Users } from "lucide-react";

import { PageHeader } from "@/components/page-header";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { cn } from "@/lib/utils";
import type { Claim, Patient } from "@/lib/types";
import { usePatients } from "@/hooks/use-patients";
import { useClaims } from "@/hooks/use-claims";

const statusPalette: Record<string, string> = {
  Clear: "bg-emerald-400/20 text-emerald-900",
  "Needs Attention": "bg-amber-400/20 text-amber-900",
  Critical: "bg-rose-400/20 text-rose-900",
  Active: "bg-sky-400/20 text-sky-900",
};

type PatientDashboard = {
  patient: Patient;
  fullName: string;
  outstandingBalance: number;
  activeClaims: number;
  lastServiceDate: string | null;
  workflows: Record<string, number>;
  paymentStatuses: Record<string, number>;
  statusLabel: keyof typeof statusPalette;
  timeline: Claim[];
};

const formatCurrency = (value: number) =>
  new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(value);

const formatDate = (value?: string | null, fallback = "No activity yet") => {
  if (!value) return fallback;
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return fallback;
  return date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
};

const determineStatus = (dashboard: PatientDashboard) => {
  if (dashboard.outstandingBalance <= 0 && dashboard.activeClaims === 0) {
    return "Clear" as const;
  }

  if (dashboard.workflows["Sent to Collections"]) {
    return "Critical" as const;
  }

  if (
    dashboard.outstandingBalance > 0 &&
    (dashboard.workflows.Pending || dashboard.paymentStatuses.DENIED)
  ) {
    return "Needs Attention" as const;
  }

  return "Active" as const;
};

export default function PatientsPage() {
  const { patients, isLoading: patientsLoading } = usePatients();
  const { claims, isLoading: claimsLoading } = useClaims();

  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<"all" | "attention" | "clear" | "active">("all");
  const [selectedPatientId, setSelectedPatientId] = useState<string | null>(null);

  const dashboards = useMemo<PatientDashboard[]>(() => {
    return patients.map((patient) => {
      const patientClaims = (claims || []).filter((claim) => claim.patientId === patient.id);

      const outstandingBalance = patientClaims.reduce((total, claim) => {
        const amount = claim.patientPay ?? 0;
        return !claim.statementSent ? total + amount : total;
      }, 0);

      const activeClaims = patientClaims.filter((claim) => !claim.statementSent).length;

      const workflows = patientClaims.reduce<Record<string, number>>((acc, c) => {
        acc[c.workflow] = (acc[c.workflow] || 0) + 1;
        return acc;
      }, {});

      const paymentStatuses = patientClaims.reduce<Record<string, number>>((acc, c) => {
        acc[c.paymentStatus] = (acc[c.paymentStatus] || 0) + 1;
        return acc;
      }, {});

      const sortedTimeline = [...patientClaims].sort(
        (a, b) => new Date(b.serviceDate).getTime() - new Date(a.serviceDate).getTime()
      );

      const fullName = [patient.firstName, patient.lastName]
        .filter((part) => !!part)
        .join(" ")
        .trim();

      const dashboard: PatientDashboard = {
        patient,
        fullName: fullName || patient.id || "Unnamed Patient",
        outstandingBalance,
        activeClaims,
        lastServiceDate: sortedTimeline[0]?.serviceDate || null,
        workflows,
        paymentStatuses,
        statusLabel: "Active",
        timeline: sortedTimeline,
      };

      dashboard.statusLabel = determineStatus(dashboard);

      return dashboard;
    });
  }, [patients, claims]);

  const filteredDashboards = useMemo(() => {
    const term = searchTerm.toLowerCase();
    return dashboards
      .filter((dashboard) => {
        if (!term) return true;
        const addressText = [
          dashboard.patient.address?.street,
          dashboard.patient.address?.city,
          dashboard.patient.address?.state,
          dashboard.patient.address?.zip,
        ]
          .filter((part) => !!part)
          .join(" ")
          .toLowerCase();

        return (
          dashboard.fullName.toLowerCase().includes(term) ||
          dashboard.patient.id.toLowerCase().includes(term) ||
          addressText.includes(term)
        );
      })
      .filter((dashboard) => {
        if (statusFilter === "all") return true;
        if (statusFilter === "attention") {
          return ["Needs Attention", "Critical"].includes(dashboard.statusLabel);
        }
        if (statusFilter === "clear") {
          return dashboard.statusLabel === "Clear";
        }
        return dashboard.statusLabel === "Active";
      });
  }, [dashboards, searchTerm, statusFilter]);

  useEffect(() => {
    if (filteredDashboards.length === 0) {
      setSelectedPatientId(null);
      return;
    }

    if (!selectedPatientId || !filteredDashboards.some((d) => d.patient.id === selectedPatientId)) {
      setSelectedPatientId(filteredDashboards[0]?.patient.id ?? null);
    }
  }, [filteredDashboards, selectedPatientId]);

  const selectedDashboard = filteredDashboards.find((dashboard) => dashboard.patient.id === selectedPatientId);

  const totalOutstanding = dashboards.reduce((total, item) => total + item.outstandingBalance, 0);
  const totalActive = dashboards.filter((item) => item.statusLabel === "Active").length;
  const attentionCount = dashboards.filter((item) => ["Needs Attention", "Critical"].includes(item.statusLabel)).length;

  const isBusy = patientsLoading || claimsLoading;

  return (
    <>
      <PageHeader
        title="Patients"
        description="Track balances, communication history, and claim workflows for every patient."
      >
        <Button variant="outline" className="hidden sm:flex">
          <Filter className="mr-2 h-4 w-4" />
          Smart Filters
        </Button>
      </PageHeader>

      <div className="grid gap-6">
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <Card className="bg-white/30 backdrop-blur-xl border-transparent shadow-xl">
            <CardHeader className="pb-3">
              <CardDescription className="flex items-center gap-2 text-indigo-900/80">
                <Users className="h-4 w-4" />
                Total patients
              </CardDescription>
              <CardTitle className="text-3xl font-bold text-slate-900">{dashboards.length}</CardTitle>
            </CardHeader>
            <CardContent className="pt-0 text-sm text-slate-600">
              Active records in your workspace.
            </CardContent>
          </Card>

          <Card className="bg-white/30 backdrop-blur-xl border-transparent shadow-xl">
            <CardHeader className="pb-3">
              <CardDescription className="flex items-center gap-2 text-sky-900/80">
                <Activity className="h-4 w-4" />
                Outstanding balance
              </CardDescription>
              <CardTitle className="text-3xl font-bold text-slate-900">
                {formatCurrency(totalOutstanding)}
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-0 text-sm text-slate-600">
              Open patient responsibility remaining.
            </CardContent>
          </Card>

          <Card className="bg-white/30 backdrop-blur-xl border-transparent shadow-xl">
            <CardHeader className="pb-3">
              <CardDescription className="flex items-center gap-2 text-cyan-900/80">
                <HeartPulse className="h-4 w-4" />
                Active follow-ups
              </CardDescription>
              <CardTitle className="text-3xl font-bold text-slate-900">{totalActive}</CardTitle>
            </CardHeader>
            <CardContent className="pt-0 text-sm text-slate-600">
              Patients with open workflows today.
            </CardContent>
          </Card>

          <Card className="bg-white/30 backdrop-blur-xl border-transparent shadow-xl">
            <CardHeader className="pb-3">
              <CardDescription className="flex items-center gap-2 text-rose-900/80">
                <CalendarClock className="h-4 w-4" />
                Needs attention
              </CardDescription>
              <CardTitle className="text-3xl font-bold text-slate-900">{attentionCount}</CardTitle>
            </CardHeader>
            <CardContent className="pt-0 text-sm text-slate-600">
              Accounts ready for outreach or escalation.
            </CardContent>
          </Card>
        </div>

        <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.2fr)]">
          <Card className="overflow-hidden border-white/40 bg-white/30 shadow-2xl backdrop-blur-xl">
            <CardHeader className="space-y-4">
              <div className="rounded-2xl border border-white/60 bg-white/60 px-4 py-3 shadow-inner">
                <div className="flex items-center gap-3">
                  <Search className="h-4 w-4 text-slate-500" />
                  <Input
                    value={searchTerm}
                    onChange={(event) => setSearchTerm(event.target.value)}
                    placeholder="Search by name or ID"
                    className="border-0 bg-transparent p-0 focus-visible:ring-0"
                  />
                </div>
              </div>
              <Tabs
                value={statusFilter}
                onValueChange={(value) => setStatusFilter(value as typeof statusFilter)}
              >
                <TabsList className="grid grid-cols-4 gap-2 rounded-2xl bg-white/70 p-1 text-xs font-semibold text-slate-600">
                  <TabsTrigger value="all">All</TabsTrigger>
                  <TabsTrigger value="active">Active</TabsTrigger>
                  <TabsTrigger value="attention">Attention</TabsTrigger>
                  <TabsTrigger value="clear">Clear</TabsTrigger>
                </TabsList>
              </Tabs>
            </CardHeader>
            <CardContent className="pt-0">
              <ScrollArea className="h-[540px] pr-4">
                <div className="space-y-3">
                  {isBusy && (
                    <div className="rounded-2xl border border-dashed border-slate-300/60 bg-white/40 p-6 text-center text-sm text-slate-500">
                      Loading patient insights...
                    </div>
                  )}
                  {!isBusy && filteredDashboards.length === 0 && (
                    <div className="rounded-2xl border border-dashed border-slate-300/60 bg-white/40 p-6 text-center text-sm text-slate-500">
                      No patients match your filters yet.
                    </div>
                  )}
                  {filteredDashboards.map((dashboard) => (
                    <button
                      key={dashboard.patient.id}
                      type="button"
                      onClick={() => setSelectedPatientId(dashboard.patient.id)}
                      className={cn(
                        "group w-full rounded-3xl border px-5 py-4 text-left transition-all",
                        "bg-white/60 shadow hover:shadow-xl hover:-translate-y-1",
                        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-400",
                        selectedPatientId === dashboard.patient.id
                          ? "border-transparent bg-gradient-to-r from-indigo-400/30 via-sky-400/30 to-teal-300/30 shadow-xl"
                          : "border-white/70"
                      )}
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <h3 className="text-lg font-semibold text-slate-900">
                            {dashboard.fullName || "Unnamed Patient"}
                          </h3>
                          <p className="text-xs uppercase tracking-wide text-slate-500">
                            ID: {dashboard.patient.id}
                          </p>
                        </div>
                        <Badge
                          className={cn(
                            "rounded-full px-3 py-1 text-xs font-semibold backdrop-blur",
                            statusPalette[dashboard.statusLabel]
                          )}
                        >
                          {dashboard.statusLabel}
                        </Badge>
                      </div>
                      <div className="mt-4 flex flex-wrap items-center gap-3 text-sm text-slate-600">
                        <span className="font-semibold text-slate-900">
                          {formatCurrency(dashboard.outstandingBalance)} due
                        </span>
                        <span className="h-1 w-1 rounded-full bg-slate-300" />
                        <span>{dashboard.activeClaims} open claims</span>
                        {dashboard.lastServiceDate && (
                          <>
                            <span className="h-1 w-1 rounded-full bg-slate-300" />
                            <span>Last DOS {formatDate(dashboard.lastServiceDate)}</span>
                          </>
                        )}
                      </div>
                    </button>
                  ))}
                </div>
              </ScrollArea>
            </CardContent>
          </Card>

          <Card className="border-white/40 bg-white/30 shadow-2xl backdrop-blur-xl">
            <CardHeader className="space-y-2">
              <div className="flex items-center justify-between gap-4">
                <div>
                  <CardDescription className="text-slate-500">Patient overview</CardDescription>
                  <CardTitle className="text-3xl font-semibold text-slate-900">
                    {selectedDashboard?.fullName || "Select a patient"}
                  </CardTitle>
                </div>
                {selectedDashboard && (
                  <Badge
                    className={cn(
                      "rounded-full px-3 py-1 text-xs font-semibold backdrop-blur",
                      statusPalette[selectedDashboard.statusLabel]
                    )}
                  >
                    {selectedDashboard.statusLabel}
                  </Badge>
                )}
              </div>
              {selectedDashboard && (
                <p className="text-sm text-slate-600">
                  Last activity {formatDate(selectedDashboard.lastServiceDate)}
                </p>
              )}
            </CardHeader>
            <CardContent className="space-y-6">
              {!selectedDashboard && (
                <div className="rounded-3xl border border-dashed border-slate-300/60 bg-white/60 p-10 text-center text-slate-500">
                  Choose a patient on the left to see their account snapshot.
                </div>
              )}

              {selectedDashboard && (
                <div className="space-y-6">
                  <div className="grid gap-4 sm:grid-cols-3">
                    <div className="rounded-3xl border border-white/60 bg-gradient-to-br from-indigo-400/20 via-sky-400/20 to-teal-300/20 p-4 text-slate-800 shadow">
                      <p className="text-xs uppercase tracking-wide text-slate-600">Outstanding</p>
                      <p className="mt-2 text-2xl font-semibold">
                        {formatCurrency(selectedDashboard.outstandingBalance)}
                      </p>
                    </div>
                    <div className="rounded-3xl border border-white/60 bg-white/70 p-4 text-slate-800 shadow">
                      <p className="text-xs uppercase tracking-wide text-slate-600">Open claims</p>
                      <p className="mt-2 text-2xl font-semibold">{selectedDashboard.activeClaims}</p>
                    </div>
                    <div className="rounded-3xl border border-white/60 bg-white/70 p-4 text-slate-800 shadow">
                      <p className="text-xs uppercase tracking-wide text-slate-600">Payment mix</p>
                      <p className="mt-2 text-sm leading-5 text-slate-600">
                        {Object.entries(selectedDashboard.paymentStatuses)
                          .map(([status, count]) => `${status}: ${count}`)
                          .join(" · ") || "Awaiting payments"}
                      </p>
                    </div>
                  </div>

                  <div className="rounded-3xl border border-white/60 bg-white/70 p-6 shadow">
                    <h3 className="text-lg font-semibold text-slate-900">Contact & status</h3>
                    <div className="mt-4 grid gap-3 text-sm text-slate-600 sm:grid-cols-2">
                      <div>
                        <p className="text-xs uppercase tracking-wide text-slate-500">Address</p>
                        <p className="mt-1 whitespace-pre-line">
                          {
                            selectedDashboard.patient.address?.street ||
                              "No address on file"
                          }
                          {(() => {
                            const secondaryLine = [
                              selectedDashboard.patient.address?.city,
                              selectedDashboard.patient.address?.state,
                              selectedDashboard.patient.address?.zip,
                            ]
                              .filter((part) => !!part)
                              .join(", ");

                            return secondaryLine
                              ? `\n${secondaryLine}`
                              : "";
                          })()}
                        </p>
                      </div>
                      <div>
                        <p className="text-xs uppercase tracking-wide text-slate-500">DOB</p>
                        <p className="mt-1">
                          {formatDate(selectedDashboard.patient.dateOfBirth, "Not provided")}
                        </p>
                      </div>
                      <div>
                        <p className="text-xs uppercase tracking-wide text-slate-500">Workflow mix</p>
                        <div className="mt-1 flex flex-wrap gap-2">
                          {Object.entries(selectedDashboard.workflows).map(([workflow, count]) => (
                            <Badge
                              key={workflow}
                              variant="secondary"
                              className="rounded-full bg-gradient-to-r from-sky-400/40 via-cyan-400/40 to-teal-300/40 text-slate-700"
                            >
                              {workflow} · {count}
                            </Badge>
                          ))}
                          {Object.keys(selectedDashboard.workflows).length === 0 && (
                            <span className="text-slate-500">No workflows yet</span>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="rounded-3xl border border-white/60 bg-white/70 p-6 shadow">
                    <div className="flex items-center justify-between">
                      <h3 className="text-lg font-semibold text-slate-900">History & timeline</h3>
                      <Button variant="ghost" size="sm" className="text-sky-600">
                        Detailed view
                        <ArrowRight className="ml-2 h-4 w-4" />
                      </Button>
                    </div>
                    <div className="mt-6 space-y-5">
                      {selectedDashboard.timeline.slice(0, 6).map((claim) => (
                        <div
                          key={claim.id}
                          className="relative rounded-2xl border border-transparent bg-white/80 p-4 shadow-sm transition-all hover:-translate-y-1 hover:border-sky-200 hover:shadow-lg"
                        >
                          <div className="flex flex-wrap items-center justify-between gap-3 text-sm text-slate-600">
                            <div>
                              <p className="font-semibold text-slate-900">
                                {claim.serviceDescription || "Service"}
                              </p>
                              <p className="text-xs uppercase tracking-wide text-slate-500">
                                DOS {formatDate(claim.serviceDate)} · Rx {claim.rx || "—"}
                              </p>
                            </div>
                            <div className="text-right">
                              <p className="font-semibold text-slate-900">
                                {formatCurrency(claim.patientPay ?? 0)}
                              </p>
                              <p className="text-xs text-slate-500">
                                {claim.paymentStatus} · {claim.workflow}
                              </p>
                            </div>
                          </div>
                        </div>
                      ))}
                      {selectedDashboard.timeline.length === 0 && (
                        <div className="rounded-2xl border border-dashed border-slate-300/60 bg-white/60 p-6 text-center text-sm text-slate-500">
                          No claim history yet.
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </>
  );
}
