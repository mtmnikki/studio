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

export function ClaimsTableClient({ initialClaims }: { initialClaims: Claim[] }) {
  const [claims, setClaims] = React.useState<Claim[]>(initialClaims);
  const [filter, setFilter] = React.useState<"all" | "needed" | "sent">("all");
  
  const filteredClaims = React.useMemo(() => {
    if (typeof window !== 'undefined') {
      const urlParams = new URLSearchParams(window.location.search);
      const updatedClaimId = urlParams.get('updated');
      if (updatedClaimId && !claims.find(c => c.id === updatedClaimId)?.statementSent) {
        // This effect runs only once on client-side after a redirect
        // to update the state, simulating a database update.
        setTimeout(() => {
          setClaims(prevClaims => 
            prevClaims.map(c => 
              c.id === updatedClaimId ? { ...c, statementSent: true } : c
            )
          );
          // Clean the URL
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
  }, [claims, filter]);

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
                  <TableHead>Check Date</TableHead>
                  <TableHead>Check #</TableHead>
                  <TableHead>NPI</TableHead>
                  <TableHead>Payee</TableHead>
                  <TableHead>Payer</TableHead>
                  <TableHead>Rx #</TableHead>
                  <TableHead>DOS</TableHead>
                  <TableHead>Cardholder ID</TableHead>
                  <TableHead>Patient</TableHead>
                  <TableHead>Service</TableHead>
                  <TableHead>CPT/HCPCS</TableHead>
                  <TableHead>Billed</TableHead>
                  <TableHead>Paid</TableHead>
                  <TableHead>Adjustment</TableHead>
                  <TableHead>Patient Pay</TableHead>
                  <TableHead>Payment Status</TableHead>
                  <TableHead>Posting Status</TableHead>
                  <TableHead>Workflow</TableHead>
                  <TableHead>Notes</TableHead>
                  <TableHead>1st Stmt Sent?</TableHead>
                  <TableHead>
                    <span className="sr-only">Actions</span>
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredClaims.length > 0 ? (
                  filteredClaims.map((claim) => (
                    <TableRow key={claim.id}>
                      <TableCell>{new Date(claim.checkDate).toLocaleDateString()}</TableCell>
                      <TableCell>{claim.checkNumber}</TableCell>
                      <TableCell>{claim.npi}</TableCell>
                      <TableCell>{claim.payee}</TableCell>
                      <TableCell>{claim.payer}</TableCell>
                      <TableCell>{claim.rx}</TableCell>
                      <TableCell>{new Date(claim.serviceDate).toLocaleDateString()}</TableCell>
                      <TableCell>{claim.cardholderId}</TableCell>
                      <TableCell className="font-medium">{claim.patientName}</TableCell>
                      <TableCell>{claim.serviceDescription}</TableCell>
                      <TableCell>{claim.productId}</TableCell>
                      <TableCell>${claim.amount.toFixed(2)}</TableCell>
                      <TableCell>${claim.paid.toFixed(2)}</TableCell>
                      <TableCell>${claim.adjustment.toFixed(2)}</TableCell>
                      <TableCell>${claim.patientPay.toFixed(2)}</TableCell>
                      <TableCell>
                        <Badge variant={claim.paymentStatus === 'PAID' ? "secondary" : "destructive"}>
                          {claim.paymentStatus}
                        </Badge>
                      </TableCell>
                      <TableCell>{claim.postingStatus}</TableCell>
                      <TableCell>{claim.workflow}</TableCell>
                      <TableCell>{claim.notes}</TableCell>
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
