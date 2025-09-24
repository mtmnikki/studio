"use client";

import React from 'react';
import type { Claim } from '@/lib/types';
import { useCollection, useFirestore, useMemoFirebase } from '@/firebase';
import { collection, doc, writeBatch } from 'firebase/firestore';
import { updateDocumentNonBlocking, deleteDocumentNonBlocking } from '@/firebase/non-blocking-updates';

export const useClaims = (initialClaims: Claim[] = []) => {
  const firestore = useFirestore();
  
  const claimsCollection = useMemoFirebase(() => {
    if (!firestore) return null;
    return collection(firestore, 'claims');
  }, [firestore]);

  const { data: claims = [], isLoading, error } = useCollection<Claim>(claimsCollection);

  // Use initialClaims only when Firebase is not available
  const effectiveClaims = React.useMemo(() => {
    return firestore ? claims : initialClaims;
  }, [firestore, claims, initialClaims]);

  const addClaims = React.useCallback(async (newClaims: Omit<Claim, 'id'>[]) => {
    if (!firestore) return;
    
    const batch = writeBatch(firestore);
    const claimsCol = collection(firestore, 'claims');

    newClaims.forEach((claimData) => {
      const docRef = doc(claimsCol);
      batch.set(docRef, claimData);
    });

    try {
      await batch.commit();
    } catch (error) {
      console.error("Error adding claims:", error);
      throw error;
    }
  }, [firestore]);

  const updateClaim = React.useCallback((updatedClaim: Claim) => {
    if (!firestore) return;
    
    const { id, ...claimData } = updatedClaim;
    const claimRef = doc(firestore, 'claims', id);
    updateDocumentNonBlocking(claimRef, claimData);
  }, [firestore]);

  const removeClaims = React.useCallback((claimIds: string[]) => {
    if (!firestore) return;
    
    claimIds.forEach(id => {
      const claimRef = doc(firestore, 'claims', id);
      deleteDocumentNonBlocking(claimRef);
    });
  }, [firestore]);

  const getClaimStatus = React.useCallback((claimId: string | null) => {
    if (!claimId) return null;
    const claim = effectiveClaims.find(c => c.id === claimId);
    return claim ? { statementSent: claim.statementSent } : null;
  }, [effectiveClaims]);

  return {
    claims: effectiveClaims,
    isLoading: isLoading || !firestore,
    error,
    addClaims,
    updateClaim,
    removeClaims,
    getClaimStatus
  };
};