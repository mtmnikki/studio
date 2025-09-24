

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

const workflowOptions = [
  "New", "Pending", "Complete", "Sent to Collections"
] as const;

const formatDate = (dateString: string) => {
    if (!dateString) return '';
    // Dates from firestore might be in a different format, ensure consistency
    const date = new Date(dateString);
    // Add timezone offset to prevent the date from changing
    const userTimezoneOffset = date.getTimezoneOffset() * 60000;
    return new Date(date.getTime() + userTimezoneOffset).toLocaleDateString('en-US', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
    });
}


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
      working = working.filter((c) => !c.statementSent && (c.patientPay ?? 0) > 0);
    } else if (filter === "sent") {
      working = working.filter((c) => c.statementSent);
    }

    if (!normalizedSearch) {
      return working;
    }

    return working.filter((claim) => {
      const haystack = [
        claim.patientName,
        claim.payee,
        claim.payer,
        claim.serviceDescription,
        claim.productId,
        claim.checkNumber,
        claim.rx,
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
      setSelectedClaimIds(filteredClaims.map(c => c.id));
    } else {
      setSelectedClaimIds([]);
    }
  };

  const handleSelectRow = (claimId: string, checked: boolean) => {
    if (checked) {
      setSelectedClaimIds(prev => [...prev, claimId]);
    } else {
      setSelectedClaimIds(prev => prev.filter(id => id !== claimId));
    }
  };
  
  const handleFieldChange = (claimId: string, field: keyof Claim, value: any) => {
    const claim = claims.find(c => c.id === claimId);
    if (claim) {
      if (field === "statementSent") {
        updateClaim({
          ...claim,
          statementSent: Boolean(value),
          statementSentAt: value ? new Date().toISOString() : null,
        });
        return;
      }

      if (field === "statementSent2nd") {
        updateClaim({
          ...claim,
          statementSent2nd: Boolean(value),
          statementSent2ndAt: value ? new Date().toISOString() : null,
        });
        return;
      }

      updateClaim({ ...claim, [field]: value });
    }
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
    const selectedClaims = claims.filter(c => selectedClaimIds.includes(c.id));
    // Ensure we only get unique patient IDs
    const patientIds = [
      ...new Set(
        selectedClaims
          .map((c) => c.patientId)
          .filter((id): id is string => Boolean(id))
      ),
    ];

    if (!patientIds.length) {
      toast({
        title: "Missing patient information",
        description:
          "Select claims with a linked patient before generating statements.",
        variant: "destructive",
      });
      return;
    }

    const query = new URLSearchParams(patientIds.map(id => ['p', id])).toString();
    router.push(`/statement/bulk?${query}`);
  };
  
  const getWorkflowBadgeVariant = (workflow: typeof workflowOptions[number]) => {
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
    const cellValue = claim[field];
    
    if (field === 'paymentStatus') {
      return (
        <Select value={claim.paymentStatus} onValueChange={(value) => handleFieldChange(claim.id, 'paymentStatus', value)}>
          <SelectTrigger className="h-8 w-[110px] bg-transparent border-0 shadow-none focus:ring-0">
            <Badge variant={claim.paymentStatus === 'PAID' ? "secondary" : claim.paymentStatus === 'PENDING' ? 'outline' : "destructive"}>{claim.paymentStatus}</Badge>
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="PAID">PAID</SelectItem>
            <SelectItem value="DENIED">DENIED</SelectItem>
            <SelectItem value="PENDING">PENDING</SelectItem>
          </SelectContent>
        </Select>
      )
    }
    if (field === 'postingStatus') {
      return (
        <Select value={claim.postingStatus} onValueChange={(value) => handleFieldChange(claim.id, 'postingStatus', value)}>
          <SelectTrigger className="h-8 w-[120px] bg-transparent border-0 shadow-none focus:ring-0">
             <SelectValue placeholder="Select Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="Posted">Posted</SelectItem>
            <SelectItem value="Unposted">Unposted</SelectItem>
          </SelectContent>
        </Select>
      )
    }
     if (field === 'notes') {
      return (
        <Select
          value={claim.notes}
          onValueChange={(value) => handleFieldChange(claim.id, 'notes', value === '__none__' ? '' : value)}
        >
          <SelectTrigger className="h-8 w-[200px] bg-transparent border-0 shadow-none focus:ring-0">
             <div className="truncate">{claim.notes || <span className="text-muted-foreground">Add a note...</span>}</div>
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="__none__">None</SelectItem>
            {noteOptions.map(option => (
              <SelectItem key={option} value={option}>{option}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      )
    }
    if (field === 'statementSent') {
        return (
           <Checkbox
              className="mx-auto block"
              checked={!!cellValue}
              onCheckedChange={(checked) => handleFieldChange(claim.id, 'statementSent', !!checked)}
            />
        )
    }
    if (field === 'statementSent2nd') {
        return (
           <Checkbox
              className="mx-auto block"
              checked={!!cellValue}
              onCheckedChange={(checked) => handleFieldChange(claim.id, 'statementSent2nd', !!checked)}
            />
        )
    }
    if (field === 'workflow') {
      return (
        <Select value={claim.workflow} onValueChange={(value) => handleFieldChange(claim.id, 'workflow', value)}>
          <SelectTrigger className="h-8 w-[150px] bg-transparent border-0 shadow-none focus:ring-0">
            <Badge variant={getWorkflowBadgeVariant(claim.workflow as any)}>{claim.workflow}</Badge>
          </SelectTrigger>
          <SelectContent>
            {workflowOptions.map(option => (
              <SelectItem key={option} value={option}>{option}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      )
    }
    if (typeof cellValue === 'number' && ['amount', 'paid', 'adjustment', 'patientPay'].includes(field)) {
      return formatCurrency(cellValue);
    }
    if ((field.toLowerCase().includes('date') || field === 'serviceDate') && cellValue) {
        return formatDate(cellValue as string);
    }

    return cellValue as React.ReactNode;
  };


  return (
    <Tabs defaultValue="all" onValueChange={(value) => setFilter(value as any)}>
      <div className="flex items-center gap-4">
        <TabsList>
          <TabsTrigger value="all">All</TabsTrigger>
          <TabsTrigger value="needed">Statement Needed</TabsTrigger>
          <TabsTrigger value="sent">Statement Sent</TabsTrigger>
        </TabsList>
        {numSelected > 0 && (
          <div className="flex items-center gap-2">
            <span className="text-sm text-muted-foreground">{numSelected} selected</span>
            <Button variant="outline" size="sm" onClick={handleGenerateStatements}>
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
      <TabsContent value={filter}>
        <Card>
          <CardHeader>
            <CardTitle>Claims</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="relative overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>
                      <Checkbox
                        checked={isAllSelected}
                        onCheckedChange={(checked) => handleSelectAll(Boolean(checked))}
                        aria-label="Select all"
                      />
                    </TableHead>
                    <TableHead className="whitespace-nowrap">Check Date</TableHead>
                    <TableHead className="whitespace-nowrap">Check #</TableHead>
                    <TableHead className="whitespace-nowrap">NPI</TableHead>
                    <TableHead className="whitespace-nowrap">Payee</TableHead>
                    <TableHead className="whitespace-nowrap">Payer</TableHead>
                    <TableHead className="whitespace-nowrap">Rx #</TableHead>
                    <TableHead className="whitespace-nowrap">DOS</TableHead>
                    <TableHead className="whitespace-nowrap">Cardholder ID</TableHead>
                    <TableHead className="whitespace-nowrap">Patient</TableHead>
                    <TableHead className="whitespace-nowrap">Service</TableHead>
                    <TableHead className="whitespace-nowrap">CPT/HCPCS</TableHead>
                    <TableHead className="whitespace-nowrap text-right">Billed</TableHead>
                    <TableHead className="whitespace-nowrap text-right">Paid</TableHead>
                    <TableHead className="whitespace-nowrap text-right">Adjustment</TableHead>
                    <TableHead className="whitespace-nowrap text-right">Patient Pay</TableHead>
                    <TableHead className="whitespace-nowrap">Payment Status</TableHead>
                    <TableHead className="whitespace-nowrap">Posting Status</TableHead>
                    <TableHead className="whitespace-nowrap">Workflow</TableHead>
                    <TableHead className="whitespace-nowrap">Notes</TableHead>
                    <TableHead className="whitespace-nowrap text-center">1st Stmt Sent?</TableHead>
                    <TableHead className="whitespace-nowrap text-center">1st Sent Date</TableHead>
                    <TableHead className="whitespace-nowrap text-center">2nd Stmt Sent?</TableHead>
                    <TableHead className="whitespace-nowrap text-center">2nd Sent Date</TableHead>
                    <TableHead>
                      <span className="sr-only">Actions</span>
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredClaims.length > 0 ? (
                    filteredClaims.map((claim) => (
                      <TableRow key={claim.id} data-state={selectedClaimIds.includes(claim.id) ? "selected" : ""}>
                         <TableCell>
                          <Checkbox
                            checked={selectedClaimIds.includes(claim.id)}
                            onCheckedChange={(checked) => handleSelectRow(claim.id, Boolean(checked))}
                            aria-label={`Select claim ${claim.id}`}
                          />
                        </TableCell>
                        <TableCell className="whitespace-nowrap">{formatDate(claim.checkDate)}</TableCell>
                        <TableCell className="whitespace-nowrap">{claim.checkNumber}</TableCell>
                        <TableCell className="whitespace-nowrap">{claim.npi}</TableCell>
                        <TableCell className="whitespace-nowrap">{claim.payee}</TableCell>
                        <TableCell className="whitespace-nowrap">{claim.payer}</TableCell>
                        <TableCell className="whitespace-nowrap">{claim.rx}</TableCell>
                        <TableCell className="whitespace-nowrap">{formatDate(claim.serviceDate)}</TableCell>
                        <TableCell className="whitespace-nowrap">{claim.cardholderId}</TableCell>
                        <TableCell className="font-medium whitespace-nowrap">{claim.patientName}</TableCell>
                        <TableCell className="whitespace-nowrap">{claim.serviceDescription}</TableCell>
                        <TableCell className="whitespace-nowrap">{claim.productId}</TableCell>
                        <TableCell className="whitespace-nowrap text-right">{formatCurrency(claim.amount)}</TableCell>
                        <TableCell className="whitespace-nowrap text-right">{formatCurrency(claim.paid)}</TableCell>
                        <TableCell className="whitespace-nowrap text-right">{formatCurrency(claim.adjustment)}</TableCell>
                        <TableCell className="whitespace-nowrap text-right">{formatCurrency(claim.patientPay)}</TableCell>
                        <TableCell className="whitespace-nowrap">{renderCell(claim, 'paymentStatus')}</TableCell>
                        <TableCell className="whitespace-nowrap">{renderCell(claim, 'postingStatus')}</TableCell>
                        <TableCell className="whitespace-nowrap">{renderCell(claim, 'workflow')}</TableCell>
                        <TableCell className="whitespace-nowrap">{renderCell(claim, 'notes')}</TableCell>
                        <TableCell className="whitespace-nowrap text-center">{renderCell(claim, 'statementSent')}</TableCell>
                        <TableCell className="whitespace-nowrap text-center">
                          {claim.statementSentAt ? formatDate(claim.statementSentAt) : "—"}
                        </TableCell>
                        <TableCell className="whitespace-nowrap text-center">{renderCell(claim, 'statementSent2nd')}</TableCell>
                        <TableCell className="whitespace-nowrap text-center">
                          {claim.statementSent2ndAt ? formatDate(claim.statementSent2ndAt) : "—"}
                        </TableCell>
                        <TableCell>
                            <div className="flex items-center">
                              <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                  <Button aria-haspopup="true" size="icon" variant="ghost">
                                    <MoreHorizontal className="h-4 w-4" />
                                    <span className="sr-only">Toggle menu</span>
                                  </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end">
                                  <DropdownMenuLabel>Actions</DropdownMenuLabel>
                                  <DropdownMenuItem asChild>
                                    <Link href={`/statement/${claim.id}`}>
                                      <FileText className="mr-2 h-4 w-4" />
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
                      <TableCell colSpan={23} className="h-24 text-center text-slate-500">
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
