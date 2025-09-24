
"use client";

import { create } from 'zustand';
import type { Claim } from '@/lib/types';
import { useCollection, useFirestore, useMemoFirebase } from '@/firebase';
import { collection, doc, writeBatch } from 'firebase/firestore';
import { updateDocumentNonBlocking, deleteDocumentNonBlocking, addDocumentNonBlocking } from '@/firebase/non-blocking-updates';
import React from 'react';

type ClaimsState = {
  claims: Claim[];
  setClaims: (claims: Claim[] | ((prev: Claim[]) => Claim[])) => void;
  addClaims: (newClaims: Omit<Claim, 'id'>[]) => Promise<void>;
  updateClaim: (updatedClaim: Claim) => void;
  removeClaims: (claimIds: string[]) => void;
  getClaimStatus: (claimId: string | null) => { statementSent: boolean } | null;
};

const useClaimsStore = create<ClaimsState>((set, get) => ({
  claims: [], // Initial state is an empty array, will be populated by Firebase
  setClaims: (updater) => {
     // This function is now more of a direct setter from the hook
    const newClaims = typeof updater === 'function' ? updater(get().claims) : updater;
    set({ claims: newClaims });
  },
  addClaims: async (newClaims) => {
    // This function is now handled by the hook directly to get firestore instance
  },
  updateClaim: (updatedClaim) => {
    // This is now handled by the hook
  },
  removeClaims: (claimIds) => {
    // This is now handled by the hook
  },
  getClaimStatus: (claimId) => {
    if (!claimId) return null;
    const claim = get().claims.find(c => c.id === claimId);
    return claim ? { statementSent: claim.statementSent } : null;
  }
}));


export const useClaims = (initialClaims: Claim[] = []) => {
  const store = useClaimsStore();
  const firestore = useFirestore();
  
  const claimsCollection = useMemoFirebase(() => {
    if (!firestore) return null;
    return collection(firestore, 'claims');
  }, [firestore]);

  const { data: claimsData, isLoading, error } = useCollection<Claim>(claimsCollection);
  
  // Update Zustand store whenever Firebase data changes
  React.useEffect(() => {
    if (claimsData) {
      store.setClaims(claimsData);
    } else if (initialClaims.length > 0 && !firestore) { // Only use initialClaims if firestore isn't ready
        store.setClaims(initialClaims);
    }
  }, [claimsData, initialClaims, firestore]);

  const addClaims = async (newClaims: Omit<Claim, 'id'>[]) => {
    if (!firestore) return;
    const batch = writeBatch(firestore);
    const claimsCol = collection(firestore, 'claims');

    newClaims.forEach((claimData) => {
        const docRef = doc(claimsCol); // Create a new doc with a random ID
        batch.set(docRef, claimData);
    });

    try {
        await batch.commit();
    } catch (e: any) {
        console.error("Error adding claims in batch:", e);
        // Here you could emit a global error or show a toast
    }
  };

  const updateClaim = (updatedClaim: Claim) => {
    if (!firestore) return;
    const { id, ...claimData } = updatedClaim;
    const claimRef = doc(firestore, 'claims', id);
    updateDocumentNonBlocking(claimRef, claimData);
  };

  const removeClaims = (claimIds: string[]) => {
    if (!firestore) return;
    claimIds.forEach(id => {
      const claimRef = doc(firestore, 'claims', id);
      deleteDocumentNonBlocking(claimRef);
    });
  };

  return { 
    ...store,
    claims: store.claims, // Return claims from the store
    isLoading: isLoading || !firestore, // Also loading if firestore is not yet available
    error,
    addClaims,
    updateClaim,
    removeClaims
  };
};
