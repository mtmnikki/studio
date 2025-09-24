
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
import { MoreHorizontal, FileText, Trash2, Edit, Save, XCircle } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import type { Claim } from "@/lib/types";
import { useClaims } from "@/hooks/use-claims";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";

export function ClaimsTableClient({ initialClaims }: { initialClaims: Claim[] }) {
  const { claims, setClaims, getClaimStatus, removeClaims, updateClaim } = useClaims(initialClaims);
  const { toast } = useToast();
  const router = useRouter();

  const [filter, setFilter] = React.useState<"all" | "needed" | "sent">("all");
  const [selectedClaimIds, setSelectedClaimIds] = React.useState<string[]>([]);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = React.useState(false);
  const [editingClaimId, setEditingClaimId] = React.useState<string | null>(null);
  const [editingData, setEditingData] = React.useState<Partial<Claim>>({});

  const filteredClaims = React.useMemo(() => {
    if (typeof window !== 'undefined') {
      const urlParams = new URLSearchParams(window.location.search);
      const updatedPatientId = urlParams.get('updatedPatient');
      if (updatedPatientId) {
        setTimeout(() => {
          setClaims(prevClaims => 
            prevClaims.map(c => 
              c.patientId === updatedPatientId ? { ...c, statementSent: true } : c
            )
          );
          window.history.replaceState({}, document.title, window.location.pathname);
        }, 0);
      }
    }
    
    const claimsToFilter = claims;
    switch (filter) {
      case 'needed':
        return claimsToFilter.filter(c => !c.statementSent && c.patientPay > 0);
      case 'sent':
        return claimsToFilter.filter(c => c.statementSent);
      case 'all':
      default:
        return claimsToFilter;
    }
  }, [claims, filter, setClaims, getClaimStatus]);

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
  
  const handleEdit = (claim: Claim) => {
    setEditingClaimId(claim.id);
    setEditingData(claim);
  };
  
  const handleCancelEdit = () => {
    setEditingClaimId(null);
    setEditingData({});
  };
  
  const handleSave = () => {
    if (editingClaimId && editingData.id) {
      updateClaim(editingData as Claim);
      toast({
        title: "Claim Updated",
        description: "The claim has been successfully updated.",
      });
      handleCancelEdit();
    }
  };
  
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setEditingData(prev => ({ ...prev, [name]: value }));
  };

  const handleSelectChange = (name: string, value: string) => {
    setEditingData(prev => ({ ...prev, [name]: value }));
  }

  const handleCheckboxChange = (name: string, checked: boolean) => {
    setEditingData(prev => ({ ...prev, [name]: checked }));
  }

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
    const patientIds = [...new Set(selectedClaims.map(c => c.patientId))];
    const query = new URLSearchParams(patientIds.map(id => ['p', id])).toString();
    router.push(`/statement/bulk?${query}`);
  };

  const renderCell = (claim: Claim, field: keyof Claim) => {
    const isEditing = editingClaimId === claim.id;
    const isEditableField = ['paymentStatus', 'postingStatus', 'workflow', 'notes', 'statementSent'].includes(field);

    if (isEditing && isEditableField) {
      if (field === 'paymentStatus') {
        return (
          <Select name="paymentStatus" value={editingData.paymentStatus} onValueChange={(value) => handleSelectChange('paymentStatus', value)}>
            <SelectTrigger className="h-8 w-[100px]"><SelectValue placeholder="Select Status" /></SelectTrigger>
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
          <Select name="postingStatus" value={editingData.postingStatus} onValueChange={(value) => handleSelectChange('postingStatus', value)}>
            <SelectTrigger className="h-8 w-[110px]"><SelectValue placeholder="Select Status" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="Posted">Posted</SelectItem>
              <SelectItem value="Unposted">Unposted</SelectItem>
            </SelectContent>
          </Select>
        )
      }
      if (field === 'statementSent') {
          return (
             <Checkbox
                checked={editingData.statementSent}
                onCheckedChange={(checked) => handleCheckboxChange('statementSent', !!checked)}
              />
          )
      }
      return (
        <Input
          name={field}
          value={editingData[field] as string | number}
          onChange={handleInputChange}
          className="h-8"
        />
      );
    }
    
    const cellValue = claim[field];
    if (field === 'statementSent') {
      return (
        <Badge variant={cellValue ? 'default' : 'outline'}>
          {cellValue ? 'Yes' : 'No'}
        </Badge>
      );
    }
    if (field === 'paymentStatus') {
      return <Badge variant={claim.paymentStatus === 'PAID' ? "secondary" : claim.paymentStatus === 'PENDING' ? 'outline' : "destructive"}>{claim.paymentStatus}</Badge>
    }
     if (typeof cellValue === 'number' && ['amount', 'paid', 'adjustment', 'patientPay'].includes(field)) {
      return `$${cellValue.toFixed(2)}`;
    }
    if (field.toLowerCase().includes('date') && cellValue) {
        return new Date(cellValue as string).toLocaleDateString();
    }

    return cellValue as React.ReactNode;
  };


  return (
    <Tabs defaultValue="all" onValueChange={(value) => setFilter(value as any)}>
      <div className="flex items-center gap-4">
        {numSelected > 0 ? (
          <div className="flex items-center gap-2">
            <span className="text-sm text-muted-foreground">{numSelected} selected</span>
            <Button variant="outline" size="sm" onClick={handleGenerateStatements}>
              <FileText className="mr-2 h-4 w-4" />
              Generate Statements
            </Button>
            <Button variant="destructive" size="sm" onClick={() => setIsDeleteDialogOpen(true)}>
              <Trash2 className="mr-2 h-4 w-4" />
              Delete ({numSelected})
            </Button>
          </div>
        ) : (
          <TabsList>
            <TabsTrigger value="all">All</TabsTrigger>
            <TabsTrigger value="needed">Statement Needed</TabsTrigger>
            <TabsTrigger value="sent">Statement Sent</TabsTrigger>
          </TabsList>
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
                    <TableHead className="whitespace-nowrap">1st Stmt Sent?</TableHead>
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
                        <TableCell className="whitespace-nowrap">{claim.checkDate ? new Date(claim.checkDate).toLocaleDateString() : ''}</TableCell>
                        <TableCell className="whitespace-nowrap">{claim.checkNumber}</TableCell>
                        <TableCell className="whitespace-nowrap">{claim.npi}</TableCell>
                        <TableCell className="whitespace-nowrap">{claim.payee}</TableCell>
                        <TableCell className="whitespace-nowrap">{claim.payer}</TableCell>
                        <TableCell className="whitespace-nowrap">{claim.rx}</TableCell>
                        <TableCell className="whitespace-nowrap">{claim.serviceDate ? new Date(claim.serviceDate).toLocaleDateString() : ''}</TableCell>
                        <TableCell className="whitespace-nowrap">{claim.cardholderId}</TableCell>
                        <TableCell className="font-medium whitespace-nowrap">{claim.patientName}</TableCell>
                        <TableCell className="whitespace-nowrap">{claim.serviceDescription}</TableCell>
                        <TableCell className="whitespace-nowrap">{claim.productId}</TableCell>
                        <TableCell className="whitespace-nowrap text-right">${claim.amount.toFixed(2)}</TableCell>
                        <TableCell className="whitespace-nowrap text-right">${claim.paid.toFixed(2)}</TableCell>
                        <TableCell className="whitespace-nowrap text-right">${claim.adjustment.toFixed(2)}</TableCell>
                        <TableCell className="whitespace-nowrap text-right">${claim.patientPay.toFixed(2)}</TableCell>
                        <TableCell>{renderCell(claim, 'paymentStatus')}</TableCell>
                        <TableCell className="whitespace-nowrap">{renderCell(claim, 'postingStatus')}</TableCell>
                        <TableCell className="whitespace-nowrap">{renderCell(claim, 'workflow')}</TableCell>
                        <TableCell className="whitespace-nowrap">{renderCell(claim, 'notes')}</TableCell>
                        <TableCell className="whitespace-nowrap">{renderCell(claim, 'statementSent')}</TableCell>
                        <TableCell>
                           {editingClaimId === claim.id ? (
                            <div className="flex items-center gap-2">
                              <Button onClick={handleSave} size="icon" variant="ghost"><Save className="h-4 w-4" /></Button>
                              <Button onClick={handleCancelEdit} size="icon" variant="ghost"><XCircle className="h-4 w-4" /></Button>
                            </div>
                          ) : (
                            <div className="flex items-center">
                              <Button onClick={() => handleEdit(claim)} size="icon" variant="ghost"><Edit className="h-4 w-4" /></Button>
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
                          )}
                        </TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={22} className="h-24 text-center">
                        No claims found for this filter.
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
          </CardContent>
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

    
    