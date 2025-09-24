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
import { MoreHorizontal, FileText } from "lucide-react";
import Link from "next/link";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import type { Claim } from "@/lib/types";
import { useClaims } from "@/hooks/use-claims";

export function ClaimsTableClient({ initialClaims }: { initialClaims: Claim[] }) {
  const { claims, setClaims, getClaimStatus } = useClaims(initialClaims);
  const [filter, setFilter] = React.useState<"all" | "needed" | "sent">("all");
  
  const filteredClaims = React.useMemo(() => {
    if (typeof window !== 'undefined') {
      const urlParams = new URLSearchParams(window.location.search);
      const updatedClaimId = urlParams.get('updated');
      const claimStatus = getClaimStatus(updatedClaimId);

      if (updatedClaimId && claimStatus && !claimStatus.statementSent) {
        setTimeout(() => {
          setClaims(prevClaims => 
            prevClaims.map(c => 
              c.id === updatedClaimId ? { ...c, statementSent: true } : c
            )
          );
          window.history.replaceState({}, document.title, window.location.pathname);
        }, 0);
      }
    }
    
    switch (filter) {
      case 'needed':
        return claims.filter(c => !c.statementSent);
      case 'sent':
        return claims.filter(c => c.statementSent);
      case 'all':
      default:
        return claims;
    }
  }, [claims, filter, setClaims, getClaimStatus]);

  return (
    <Tabs defaultValue="all" onValueChange={(value) => setFilter(value as any)}>
      <div className="flex items-center">
        <TabsList>
          <TabsTrigger value="all">All</TabsTrigger>
          <TabsTrigger value="needed">Statement Needed</TabsTrigger>
          <TabsTrigger value="sent">Statement Sent</TabsTrigger>
        </TabsList>
      </div>
      <TabsContent value={filter}>
        <Card>
          <CardHeader>
            <CardTitle>Claims</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
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
                  <TableHead className="whitespace-nowrap">Billed</TableHead>
                  <TableHead className="whitespace-nowrap">Paid</TableHead>
                  <TableHead className="whitespace-nowrap">Adjustment</TableHead>
                  <TableHead className="whitespace-nowrap">Patient Pay</TableHead>
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
                    <TableRow key={claim.id}>
                      <TableCell className="whitespace-nowrap">{new Date(claim.checkDate).toLocaleDateString()}</TableCell>
                      <TableCell className="whitespace-nowrap">{claim.checkNumber}</TableCell>
                      <TableCell className="whitespace-nowrap">{claim.npi}</TableCell>
                      <TableCell className="whitespace-nowrap">{claim.payee}</TableCell>
                      <TableCell className="whitespace-nowrap">{claim.payer}</TableCell>
                      <TableCell className="whitespace-nowrap">{claim.rx}</TableCell>
                      <TableCell className="whitespace-nowrap">{new Date(claim.serviceDate).toLocaleDateString()}</TableCell>
                      <TableCell className="whitespace-nowrap">{claim.cardholderId}</TableCell>
                      <TableCell className="font-medium whitespace-nowrap">{claim.patientName}</TableCell>
                      <TableCell className="whitespace-nowrap">{claim.serviceDescription}</TableCell>
                      <TableCell className="whitespace-nowrap">{claim.productId}</TableCell>
                      <TableCell className="whitespace-nowrap">${claim.amount.toFixed(2)}</TableCell>
                      <TableCell className="whitespace-nowrap">${claim.paid.toFixed(2)}</TableCell>
                      <TableCell className="whitespace-nowrap">${claim.adjustment.toFixed(2)}</TableCell>
                      <TableCell className="whitespace-nowrap">${claim.patientPay.toFixed(2)}</TableCell>
                      <TableCell>
                        <Badge variant={claim.paymentStatus === 'PAID' ? "secondary" : "destructive"}>
                          {claim.paymentStatus}
                        </Badge>
                      </TableCell>
                      <TableCell className="whitespace-nowrap">{claim.postingStatus}</TableCell>
                      <TableCell className="whitespace-nowrap">{claim.workflow}</TableCell>
                      <TableCell className="whitespace-nowrap">{claim.notes}</TableCell>
                      <TableCell>
                        <Badge variant={claim.statementSent ? 'default' : 'outline'}>
                          {claim.statementSent ? 'Yes' : 'No'}
                        </Badge>
                      </TableCell>
                      <TableCell>
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
          </CardContent>
        </Card>
      </TabsContent>
    </Tabs>
  );
}
