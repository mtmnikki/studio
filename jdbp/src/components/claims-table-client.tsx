"use client";

import * as React from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { MoreHorizontal, FileText, Trash2 } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import type { Claim } from "@/lib/types";
import { useClaims } from "@/hooks/use-claims";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";
import { formatCurrency } from "@/lib/utils";

const noteOptions = [
  "We will not receive payment",
  "Paid- see payment on other influenza test",
  "Patient Meeting Deductible/Co-insurance",
  "The impact of prior payer(s) adjudication including payments and/or adjustments. (Use only with Group Code OA)",
  "Payment Received",
  "Reversed Claim",
];

const workflowOptions: Claim["workflow"][] = ["New", "Pending", "Complete", "Sent to Collections"];
const billingStatusOptions: Claim["billingStatus"][] = ["Pending", "Billed", "Paid", "Collections"];
const paymentStatusOptions: Claim["paymentStatus"][] = ["PAID", "DENIED", "PENDING"];

const formatDate = (dateString?: string | null) => {
  if (!dateString) return "";
  const date = new Date(dateString);
  if (Number.isNaN(date.getTime())) {
    return dateString;
  }
  return date.toLocaleDateString("en-US", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  });
};

export function ClaimsTableClient({ initialClaims = [] }: { initialClaims?: Claim[] }) {
  const { claims, removeClaims, updateClaim } = useClaims(initialClaims);
  const { toast } = useToast();
  const router = useRouter();

  const [filter, setFilter] = React.useState<"all" | "needed" | "sent">("all");
  const [selectedClaimIds, setSelectedClaimIds] = React.useState<string[]>([]);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = React.useState(false);
  const [searchTerm, setSearchTerm] = React.useState("");

  const filteredClaims = React.useMemo(() => {
    if (!claims) return [];

    const normalizedSearch = searchTerm.trim().toLowerCase();

    let working = claims;
    if (filter === "needed") {
      working = working.filter((claim) => !claim.statementMailed && claim.patientResponsibility > 0);
    } else if (filter === "sent") {
      working = working.filter((claim) => claim.statementMailed);
    }

    if (!normalizedSearch) {
      return working;
    }

    return working.filter((claim) => {
      const haystack = [
        claim.patientName,
        claim.accountNumber,
        claim.pharmacyOfService,
        claim.rxNumber,
        claim.cptHcpcsCode,
        claim.notes,
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();

      return haystack.includes(normalizedSearch);
    });
  }, [claims, filter, searchTerm]);

  React.useEffect(() => {
    setSelectedClaimIds([]);
  }, [filter]);

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedClaimIds(filteredClaims.map((claim) => claim.id));
    } else {
      setSelectedClaimIds([]);
    }
  };

  const handleSelectRow = (claimId: string, checked: boolean) => {
    if (checked) {
      setSelectedClaimIds((prev) => [...prev, claimId]);
    } else {
      setSelectedClaimIds((prev) => prev.filter((id) => id !== claimId));
    }
  };

  const handleFieldChange = (claimId: string, field: keyof Claim, value: any) => {
    const claim = claims?.find((item) => item.id === claimId);
    if (!claim) return;

    if (field === "statementMailed") {
      updateClaim({
        ...claim,
        statementMailed: Boolean(value),
        statementSentAt: value ? new Date().toISOString() : null,
      });
      return;
    }

    if (field === "statementTwoMailed") {
      updateClaim({
        ...claim,
        statementTwoMailed: Boolean(value),
        statementSent2ndAt: value ? new Date().toISOString() : null,
      });
      return;
    }

    updateClaim({
      ...claim,
      [field]: value,
    });
  };

  const numSelected = selectedClaimIds.length;
  const isAllSelected = numSelected > 0 && numSelected === filteredClaims.length;

  const handleDeleteSelected = () => {
    removeClaims(selectedClaimIds);
    toast({
      title: "Claims Deleted",
      description: `${numSelected} claims have been successfully deleted.`,
    });
    setSelectedClaimIds([]);
    setIsDeleteDialogOpen(false);
  };

  const handleGenerateStatements = () => {
    if (!claims) return;

    const selectedClaims = claims.filter((claim) => selectedClaimIds.includes(claim.id));
    const patientIds = selectedClaims
      .map((claim) => claim.patientId)
      .filter((value): value is string => Boolean(value));

    const uniquePatientIds = Array.from(new Set(patientIds));

    if (!uniquePatientIds.length) {
      toast({
        title: "No patients selected",
        description: "Select claims that have an associated patient to generate statements.",
        variant: "destructive",
      });
      return;
    }

    const query = new URLSearchParams(uniquePatientIds.map((id) => ["p", id])).toString();
    router.push(`/statement/bulk?${query}`);
  };

  const getWorkflowBadgeVariant = (workflow: Claim["workflow"]) => {
    switch (workflow) {
      case "New":
        return "default";
      case "Pending":
        return "secondary";
      case "Complete":
        return "outline";
      case "Sent to Collections":
        return "destructive";
      default:
        return "outline";
    }
  };

  const renderCell = (claim: Claim, field: keyof Claim) => {
    const value = claim[field];

    if (field === "paymentStatus") {
      return (
        <Select value={claim.paymentStatus} onValueChange={(next) => handleFieldChange(claim.id, field, next)}>
          <SelectTrigger className="h-8 w-[110px] bg-transparent border-0 shadow-none focus:ring-0">
            <Badge
              variant={
                claim.paymentStatus === "PAID"
                  ? "secondary"
                  : claim.paymentStatus === "PENDING"
                  ? "outline"
                  : "destructive"
              }
            >
              {claim.paymentStatus}
            </Badge>
          </SelectTrigger>
          <SelectContent>
            {paymentStatusOptions.map((option) => (
              <SelectItem key={option} value={option}>
                {option}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      );
    }

    if (field === "billingStatus") {
      return (
        <Select value={claim.billingStatus} onValueChange={(next) => handleFieldChange(claim.id, field, next)}>
          <SelectTrigger className="h-8 w-[120px] bg-transparent border-0 shadow-none focus:ring-0">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {billingStatusOptions.map((option) => (
              <SelectItem key={option} value={option}>
                {option}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      );
    }

    if (field === "workflow") {
      return (
        <Select value={claim.workflow} onValueChange={(next) => handleFieldChange(claim.id, field, next)}>
          <SelectTrigger className="h-8 w-[150px] bg-transparent border-0 shadow-none focus:ring-0">
            <Badge variant={getWorkflowBadgeVariant(claim.workflow)}>{claim.workflow}</Badge>
          </SelectTrigger>
          <SelectContent>
            {workflowOptions.map((option) => (
              <SelectItem key={option} value={option}>
                {option}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      );
    }

    if (field === "notes") {
      return (
        <Select
          value={claim.notes ?? ""}
          onValueChange={(next) => handleFieldChange(claim.id, field, next === "__none__" ? "" : next)}
        >
          <SelectTrigger className="h-8 w-[220px] bg-transparent border-0 shadow-none focus:ring-0">
            <div className="truncate">
              {claim.notes || <span className="text-muted-foreground">Add a note...</span>}
            </div>
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="__none__">None</SelectItem>
            {noteOptions.map((option) => (
              <SelectItem key={option} value={option}>
                {option}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      );
    }

    if (field === "statementMailed" || field === "statementTwoMailed") {
      return (
        <Checkbox
          className="mx-auto block"
          checked={Boolean(value)}
          onCheckedChange={(checked) => handleFieldChange(claim.id, field, checked)}
        />
      );
    }

    return value as React.ReactNode;
  };

  return (
    <Tabs
      defaultValue="all"
      onValueChange={(next) => setFilter(next as typeof filter)}
      className="rounded-3xl border border-white/40 bg-white/40 p-4 shadow-xl shadow-sky-200/40 backdrop-blur-xl"
    >
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex flex-wrap items-center gap-3">
          <TabsList className="bg-gradient-to-r from-indigo-400/80 via-sky-500/80 to-teal-300/80 p-[2px]">
            <TabsTrigger
              value="all"
              className="rounded-2xl bg-white/80 px-4 py-2 text-sm font-semibold text-slate-600 transition hover:bg-white data-[state=active]:bg-gradient-to-r data-[state=active]:from-indigo-400/70 data-[state=active]:to-sky-400/70 data-[state=active]:text-slate-50"
            >
              All
            </TabsTrigger>
            <TabsTrigger
              value="needed"
              className="rounded-2xl bg-white/50 px-4 py-2 text-sm font-semibold text-slate-600 transition hover:bg-white data-[state=active]:bg-gradient-to-r data-[state=active]:from-sky-400/80 data-[state=active]:to-cyan-400/80 data-[state=active]:text-slate-50"
            >
              Statement Needed
            </TabsTrigger>
            <TabsTrigger
              value="sent"
              className="rounded-2xl bg-white/50 px-4 py-2 text-sm font-semibold text-slate-600 transition hover:bg-white data-[state=active]:bg-gradient-to-r data-[state=active]:from-teal-400/80 data-[state=active]:to-emerald-300/80 data-[state=active]:text-slate-50"
            >
              Statement Sent
            </TabsTrigger>
          </TabsList>
          <Input
            value={searchTerm}
            onChange={(event) => setSearchTerm(event.target.value)}
            placeholder="Search patient, account, pharmacy, RX..."
            className="h-11 w-full min-w-[220px] max-w-xs rounded-2xl border-none bg-white/70 px-4 text-sm text-slate-600 shadow-inner shadow-sky-200/50 backdrop-blur"
          />
        </div>
        {numSelected > 0 && (
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-sm font-medium text-slate-600">
              {numSelected} selected
            </span>
            <Button
              variant="outline"
              size="sm"
              onClick={handleGenerateStatements}
              className="rounded-full border-none bg-gradient-to-r from-sky-500 to-teal-400 px-4 text-white shadow-lg shadow-sky-300/50 transition hover:shadow-xl"
            >
              <FileText className="mr-2 h-4 w-4" />
              Generate Statements
            </Button>
            <Button
              variant="destructive"
              size="sm"
              onClick={() => setIsDeleteDialogOpen(true)}
              className="rounded-full px-4"
            >
              <Trash2 className="mr-2 h-4 w-4" />
              Delete ({numSelected})
            </Button>
          </div>
        )}
      </div>
      <TabsContent value={filter} className="mt-6">
        <Card className="border-none bg-white/70 p-[1px] shadow-2xl shadow-sky-200/50">
          <div className="rounded-3xl bg-gradient-to-br from-white/90 via-white/70 to-white/60">
            <CardHeader className="flex flex-col items-start gap-2 border-b border-white/60 px-6 py-6">
              <CardTitle className="text-xl font-semibold text-slate-700">
                Claims
              </CardTitle>
              <p className="text-sm text-slate-500">
                Monitor and manage statements in real time.
              </p>
            </CardHeader>
            <CardContent className="px-0 py-0">
              <div className="relative overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-white/70">
                      <TableHead className="w-[50px]">
                        <Checkbox checked={isAllSelected} onCheckedChange={(checked) => handleSelectAll(Boolean(checked))} />
                      </TableHead>
                      <TableHead>Patient</TableHead>
                      <TableHead>Account</TableHead>
                      <TableHead>Service Date</TableHead>
                      <TableHead>Pharmacy</TableHead>
                      <TableHead>RX</TableHead>
                      <TableHead>CPT/HCPCS</TableHead>
                      <TableHead className="text-right">Charged</TableHead>
                      <TableHead className="text-right">Insurance Paid</TableHead>
                      <TableHead className="text-right">Adjustment</TableHead>
                      <TableHead className="text-right">Patient Pay</TableHead>
                      <TableHead className="text-right">Balance</TableHead>
                      <TableHead>Payment Status</TableHead>
                      <TableHead>Billing Status</TableHead>
                      <TableHead>Workflow</TableHead>
                      <TableHead>Notes</TableHead>
                      <TableHead className="text-center">Statement Sent</TableHead>
                      <TableHead className="text-center">Sent At</TableHead>
                      <TableHead className="text-center">Second Notice</TableHead>
                      <TableHead className="text-center">Second Sent</TableHead>
                      <TableHead></TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredClaims.length > 0 ? (
                      filteredClaims.map((claim) => (
                        <TableRow
                          key={claim.id}
                          data-state={selectedClaimIds.includes(claim.id) ? "selected" : ""}
                          className="bg-transparent transition hover:bg-sky-50/60"
                        >
                          <TableCell>
                            <Checkbox
                              checked={selectedClaimIds.includes(claim.id)}
                              onCheckedChange={(checked) => handleSelectRow(claim.id, Boolean(checked))}
                              aria-label={`Select claim ${claim.id}`}
                            />
                          </TableCell>
                          <TableCell className="whitespace-nowrap font-medium">{claim.patientName}</TableCell>
                          <TableCell className="whitespace-nowrap">{claim.accountNumber}</TableCell>
                          <TableCell className="whitespace-nowrap">{formatDate(claim.serviceDate)}</TableCell>
                          <TableCell className="whitespace-nowrap">{claim.pharmacyOfService ?? "-"}</TableCell>
                          <TableCell className="whitespace-nowrap">{claim.rxNumber ?? "-"}</TableCell>
                          <TableCell className="whitespace-nowrap">{claim.cptHcpcsCode ?? "-"}</TableCell>
                          <TableCell className="whitespace-nowrap text-right">{formatCurrency(claim.totalChargedAmount)}</TableCell>
                          <TableCell className="whitespace-nowrap text-right">{formatCurrency(claim.insurancePaid)}</TableCell>
                          <TableCell className="whitespace-nowrap text-right">{formatCurrency(claim.insuranceAdjustment)}</TableCell>
                          <TableCell className="whitespace-nowrap text-right">{formatCurrency(claim.patientResponsibility)}</TableCell>
                          <TableCell className="whitespace-nowrap text-right">{formatCurrency(claim.accountBalance)}</TableCell>
                          <TableCell className="whitespace-nowrap">{renderCell(claim, "paymentStatus")}</TableCell>
                          <TableCell className="whitespace-nowrap">{renderCell(claim, "billingStatus")}</TableCell>
                          <TableCell className="whitespace-nowrap">{renderCell(claim, "workflow")}</TableCell>
                          <TableCell className="whitespace-nowrap">{renderCell(claim, "notes")}</TableCell>
                          <TableCell className="whitespace-nowrap text-center">{renderCell(claim, "statementMailed")}</TableCell>
                          <TableCell className="whitespace-nowrap text-center">{claim.statementSentAt ? formatDate(claim.statementSentAt) : "-"}</TableCell>
                          <TableCell className="whitespace-nowrap text-center">{renderCell(claim, "statementTwoMailed")}</TableCell>
                          <TableCell className="whitespace-nowrap text-center">{claim.statementSent2ndAt ? formatDate(claim.statementSent2ndAt) : "-"}</TableCell>
                          <TableCell>
                            <div className="flex items-center">
                              <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                  <Button aria-haspopup="true" size="icon" variant="ghost">
                                    <MoreHorizontal className="h-4 w-4" />
                                    <span className="sr-only">Toggle menu</span>
                                  </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end" className="rounded-2xl border border-slate-100 bg-white/90 shadow-lg">
                                  <DropdownMenuLabel className="text-xs uppercase tracking-wide text-slate-500">
                                    Actions
                                  </DropdownMenuLabel>
                                  <DropdownMenuItem asChild className="rounded-xl text-slate-600 focus:bg-sky-100/70">
                                    <Link href={`/statement/${claim.id}`} className="flex items-center">
                                      <FileText className="mr-2 h-4 w-4 text-sky-500" />
                                      Generate Statement
                                    </Link>
                                  </DropdownMenuItem>
                                </DropdownMenuContent>
                              </DropdownMenu>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))
                    ) : (
                      <TableRow>
                        <TableCell colSpan={21} className="h-24 text-center">
                          No claims found for this filter.
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </div>
        </Card>
      </TabsContent>
      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete the {numSelected} selected claim(s). This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteSelected}>Delete</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </Tabs>
  );
}
