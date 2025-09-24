"use client";

import { useEffect, useMemo, useState } from "react";
import {
  Building2,
  ClipboardList,
  Layers,
  Mail,
  MapPin,
  Phone,
  Sparkles,
  TrendingUp,
} from "lucide-react";

import { PageHeader } from "@/components/page-header";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { cn } from "@/lib/utils";
import type { Claim, Pharmacy } from "@/lib/types";
import { usePharmacies } from "@/hooks/use-pharmacies";
import { useClaims } from "@/hooks/use-claims";

const statusPalette: Record<string, string> = {
  Active: "bg-emerald-400/20 text-emerald-900",
  "Needs Attention": "bg-amber-400/20 text-amber-900",
  Paused: "bg-rose-400/20 text-rose-900",
  "New Partner": "bg-sky-400/20 text-sky-900",
};

type PharmacyDashboard = {
  pharmacy: Pharmacy;
  displayName: string;
  statusLabel: keyof typeof statusPalette;
  outstandingBalance: number;
  claimsVolume: number;
  uniquePatients: number;
  lastActivity: string | null;
  timeline: Claim[];
};

const formatCurrency = (value: number) =>
  new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(value);

const formatDate = (value: string | null) => {
  if (!value) return "No activity yet";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "No activity yet";
  return date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
};

const resolveStatus = (pharmacy: Pharmacy, metrics: { outstanding: number; recentClaims: number }) => {
  if (pharmacy.status && pharmacy.status in statusPalette) {
    return pharmacy.status as keyof typeof statusPalette;
  }

  if (metrics.outstanding === 0 && metrics.recentClaims === 0) {
    return "New Partner" as const;
  }

  if (metrics.outstanding > 0 && metrics.recentClaims > 5) {
    return "Needs Attention" as const;
  }

  if (metrics.outstanding > 2000) {
    return "Needs Attention" as const;
  }

  return "Active" as const;
};

export default function PharmaciesPage() {
  const { pharmacies, isLoading: pharmacyLoading } = usePharmacies();
  const { claims, isLoading: claimsLoading } = useClaims();

  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<"all" | "active" | "attention" | "paused">("all");
  const [selectedPharmacyId, setSelectedPharmacyId] = useState<string | null>(null);

  const dashboards = useMemo<PharmacyDashboard[]>(() => {
    return pharmacies.map((pharmacy) => {
      const relatedClaims = (claims || []).filter((claim) => {
        const normalizedName = (pharmacy.name || "").toLowerCase();
        return (
          claim.payee?.toLowerCase() === normalizedName ||
          claim.payer?.toLowerCase() === normalizedName ||
          claim.npi === pharmacy.id
        );
      });

      const outstandingBalance = relatedClaims.reduce(
        (total, claim) => (!claim.statementSent ? total + (claim.patientPay ?? 0) : total),
        0
      );

      const uniquePatients = new Set(relatedClaims.map((claim) => claim.patientId)).size;

      const sortedTimeline = [...relatedClaims].sort(
        (a, b) => new Date(b.serviceDate).getTime() - new Date(a.serviceDate).getTime()
      );

      const metrics = {
        outstanding: outstandingBalance,
        recentClaims: sortedTimeline.slice(0, 6).length,
      };

      const dashboard: PharmacyDashboard = {
        pharmacy,
        displayName: pharmacy.name || "Unnamed Pharmacy",
        statusLabel: "Active",
        outstandingBalance,
        claimsVolume: relatedClaims.length,
        uniquePatients,
        lastActivity: sortedTimeline[0]?.serviceDate || null,
        timeline: sortedTimeline,
      };

      dashboard.statusLabel = resolveStatus(pharmacy, metrics);

      return dashboard;
    });
  }, [pharmacies, claims]);

  const filteredDashboards = useMemo(() => {
    const term = searchTerm.toLowerCase();
    return dashboards
      .filter((dashboard) => {
        if (!term) return true;
        return (
          dashboard.displayName.toLowerCase().includes(term) ||
          dashboard.pharmacy.id?.toLowerCase().includes(term) ||
          dashboard.pharmacy.address?.city?.toLowerCase().includes(term || "")
        );
      })
      .filter((dashboard) => {
        if (statusFilter === "all") return true;
        if (statusFilter === "active") {
          return dashboard.statusLabel === "Active" || dashboard.statusLabel === "New Partner";
        }
        if (statusFilter === "attention") {
          return dashboard.statusLabel === "Needs Attention";
        }
        return dashboard.statusLabel === "Paused";
      });
  }, [dashboards, searchTerm, statusFilter]);

  useEffect(() => {
    if (filteredDashboards.length === 0) {
      setSelectedPharmacyId(null);
      return;
    }

    if (!selectedPharmacyId || !filteredDashboards.some((d) => d.pharmacy.id === selectedPharmacyId)) {
      setSelectedPharmacyId(filteredDashboards[0]?.pharmacy.id ?? null);
    }
  }, [filteredDashboards, selectedPharmacyId]);

  const selectedDashboard = filteredDashboards.find((dashboard) => dashboard.pharmacy.id === selectedPharmacyId);

  const totalOutstanding = dashboards.reduce((total, item) => total + item.outstandingBalance, 0);
  const activePartners = dashboards.filter((item) => item.statusLabel === "Active").length;
  const attentionPartners = dashboards.filter((item) => item.statusLabel === "Needs Attention").length;

  const isBusy = pharmacyLoading || claimsLoading;

  return (
    <>
      <PageHeader
        title="Pharmacies"
        description="Monitor partner performance, statement readiness, and communication history."
      >
        <Button variant="outline" className="hidden sm:flex">
          <Layers className="mr-2 h-4 w-4" />
          Configure segments
        </Button>
      </PageHeader>

      <div className="grid gap-6">
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <Card className="bg-white/30 backdrop-blur-xl border-transparent shadow-xl">
            <CardHeader className="pb-3">
              <CardDescription className="flex items-center gap-2 text-indigo-900/80">
                <Building2 className="h-4 w-4" />
                Total pharmacies
              </CardDescription>
              <CardTitle className="text-3xl font-bold text-slate-900">{dashboards.length}</CardTitle>
            </CardHeader>
            <CardContent className="pt-0 text-sm text-slate-600">
              Partners connected to your billing workspace.
            </CardContent>
          </Card>

          <Card className="bg-white/30 backdrop-blur-xl border-transparent shadow-xl">
            <CardHeader className="pb-3">
              <CardDescription className="flex items-center gap-2 text-sky-900/80">
                <TrendingUp className="h-4 w-4" />
                Partner balance
              </CardDescription>
              <CardTitle className="text-3xl font-bold text-slate-900">
                {formatCurrency(totalOutstanding)}
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-0 text-sm text-slate-600">
              Outstanding patient responsibility tied to partners.
            </CardContent>
          </Card>

          <Card className="bg-white/30 backdrop-blur-xl border-transparent shadow-xl">
            <CardHeader className="pb-3">
              <CardDescription className="flex items-center gap-2 text-emerald-900/80">
                <Sparkles className="h-4 w-4" />
                Active partners
              </CardDescription>
              <CardTitle className="text-3xl font-bold text-slate-900">{activePartners}</CardTitle>
            </CardHeader>
            <CardContent className="pt-0 text-sm text-slate-600">
              Pharmacies with steady throughput this month.
            </CardContent>
          </Card>

          <Card className="bg-white/30 backdrop-blur-xl border-transparent shadow-xl">
            <CardHeader className="pb-3">
              <CardDescription className="flex items-center gap-2 text-rose-900/80">
                <ClipboardList className="h-4 w-4" />
                Needs review
              </CardDescription>
              <CardTitle className="text-3xl font-bold text-slate-900">{attentionPartners}</CardTitle>
            </CardHeader>
            <CardContent className="pt-0 text-sm text-slate-600">
              Partners requiring follow-up on claims or balances.
            </CardContent>
          </Card>
        </div>

        <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.2fr)]">
          <Card className="overflow-hidden border-white/40 bg-white/30 shadow-2xl backdrop-blur-xl">
            <CardHeader className="space-y-4">
              <div className="rounded-2xl border border-white/60 bg-white/60 px-4 py-3 shadow-inner">
                <div className="flex items-center gap-3">
                  <Layers className="h-4 w-4 text-slate-500" />
                  <Input
                    value={searchTerm}
                    onChange={(event) => setSearchTerm(event.target.value)}
                    placeholder="Search by name, ID, or city"
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
                  <TabsTrigger value="paused">Paused</TabsTrigger>
                </TabsList>
              </Tabs>
            </CardHeader>
            <CardContent className="pt-0">
              <ScrollArea className="h-[540px] pr-4">
                <div className="space-y-3">
                  {isBusy && (
                    <div className="rounded-2xl border border-dashed border-slate-300/60 bg-white/40 p-6 text-center text-sm text-slate-500">
                      Loading pharmacy dashboards...
                    </div>
                  )}
                  {!isBusy && filteredDashboards.length === 0 && (
                    <div className="rounded-2xl border border-dashed border-slate-300/60 bg-white/40 p-6 text-center text-sm text-slate-500">
                      No pharmacies match your filters yet.
                    </div>
                  )}
                  {filteredDashboards.map((dashboard) => (
                    <button
                      key={dashboard.pharmacy.id}
                      type="button"
                      onClick={() => setSelectedPharmacyId(dashboard.pharmacy.id)}
                      className={cn(
                        "group w-full rounded-3xl border px-5 py-4 text-left transition-all",
                        "bg-white/60 shadow hover:shadow-xl hover:-translate-y-1",
                        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-400",
                        selectedPharmacyId === dashboard.pharmacy.id
                          ? "border-transparent bg-gradient-to-r from-indigo-400/30 via-sky-400/30 to-teal-300/30 shadow-xl"
                          : "border-white/70"
                      )}
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <h3 className="text-lg font-semibold text-slate-900">
                            {dashboard.displayName}
                          </h3>
                          <p className="text-xs uppercase tracking-wide text-slate-500">
                            ID: {dashboard.pharmacy.id}
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
                          {formatCurrency(dashboard.outstandingBalance)} outstanding
                        </span>
                        <span className="h-1 w-1 rounded-full bg-slate-300" />
                        <span>{dashboard.claimsVolume} claims</span>
                        <span className="h-1 w-1 rounded-full bg-slate-300" />
                        <span>{dashboard.uniquePatients} patients</span>
                        {dashboard.lastActivity && (
                          <>
                            <span className="h-1 w-1 rounded-full bg-slate-300" />
                            <span>Last DOS {formatDate(dashboard.lastActivity)}</span>
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
                  <CardDescription className="text-slate-500">Pharmacy snapshot</CardDescription>
                  <CardTitle className="text-3xl font-semibold text-slate-900">
                    {selectedDashboard?.displayName || "Select a pharmacy"}
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
                  Last activity {formatDate(selectedDashboard.lastActivity)}
                </p>
              )}
            </CardHeader>
            <CardContent className="space-y-6">
              {!selectedDashboard && (
                <div className="rounded-3xl border border-dashed border-slate-300/60 bg-white/60 p-10 text-center text-slate-500">
                  Choose a pharmacy on the left to explore performance insights.
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
                      <p className="text-xs uppercase tracking-wide text-slate-600">Claim volume</p>
                      <p className="mt-2 text-2xl font-semibold">{selectedDashboard.claimsVolume}</p>
                    </div>
                    <div className="rounded-3xl border border-white/60 bg-white/70 p-4 text-slate-800 shadow">
                      <p className="text-xs uppercase tracking-wide text-slate-600">Unique patients</p>
                      <p className="mt-2 text-2xl font-semibold">{selectedDashboard.uniquePatients}</p>
                    </div>
                  </div>

                  <div className="rounded-3xl border border-white/60 bg-white/70 p-6 shadow">
                    <h3 className="text-lg font-semibold text-slate-900">Contact details</h3>
                    <div className="mt-4 grid gap-3 text-sm text-slate-600 sm:grid-cols-2">
                      <div className="flex items-start gap-3">
                        <MapPin className="mt-0.5 h-4 w-4 text-slate-500" />
                        <div>
                          <p className="text-xs uppercase tracking-wide text-slate-500">Address</p>
                          <p className="mt-1">
                            {selectedDashboard.pharmacy.address?.street || "—"}
                            <br />
                            {selectedDashboard.pharmacy.address?.city || ""}
                            {selectedDashboard.pharmacy.address?.city ? ", " : ""}
                            {selectedDashboard.pharmacy.address?.state || ""}{" "}
                            {selectedDashboard.pharmacy.address?.zip || ""}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-start gap-3">
                        <Phone className="mt-0.5 h-4 w-4 text-slate-500" />
                        <div>
                          <p className="text-xs uppercase tracking-wide text-slate-500">Phone</p>
                          <p className="mt-1">{selectedDashboard.pharmacy.phone || "—"}</p>
                        </div>
                      </div>
                      <div className="flex items-start gap-3">
                        <Mail className="mt-0.5 h-4 w-4 text-slate-500" />
                        <div>
                          <p className="text-xs uppercase tracking-wide text-slate-500">Email</p>
                          <p className="mt-1">{selectedDashboard.pharmacy.email || "—"}</p>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="rounded-3xl border border-white/60 bg-white/70 p-6 shadow">
                    <div className="flex items-center justify-between">
                      <h3 className="text-lg font-semibold text-slate-900">Recent activity</h3>
                      <Button variant="ghost" size="sm" className="text-sky-600">
                        View all
                      </Button>
                    </div>
                    <div className="mt-6 space-y-5">
                      {selectedDashboard.timeline.slice(0, 6).map((claim) => (
                        <div
                          key={claim.id}
                          className="relative rounded-2xl border border-transparent bg-white/80 p-4 shadow-sm transition-all hover:-translate-y-1 hover:border-cyan-200 hover:shadow-lg"
                        >
                          <div className="flex flex-wrap items-center justify-between gap-3 text-sm text-slate-600">
                            <div>
                              <p className="font-semibold text-slate-900">
                                {claim.patientName || "Patient"}
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
                          No recent claim activity for this partner.
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
