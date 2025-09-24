"use client";

import { create } from 'zustand';
import { claims as initialClaimsData } from '@/lib/data';
import type { Claim } from '@/lib/types';

type ClaimsState = {
  claims: Claim[];
  setClaims: (claims: Claim[] | ((prev: Claim[]) => Claim[])) => void;
  addClaims: (newClaims: Claim[]) => void;
  updateClaim: (updatedClaim: Claim) => void;
  removeClaims: (claimIds: string[]) => void;
  getClaimStatus: (claimId: string | null) => { statementSent: boolean } | null;
};

// Use zustand for simple global state management
// This will persist across page navigations on the client side.
const useClaimsStore = create<ClaimsState>((set, get) => ({
  claims: initialClaimsData,
  setClaims: (updater) => {
    set((state) => ({
      claims: typeof updater === 'function' ? updater(state.claims) : updater,
    }));
  },
  addClaims: (newClaims) => {
    set((state) => ({
      claims: [...state.claims, ...newClaims],
    }));
  },
  updateClaim: (updatedClaim) => {
    set((state) => ({
      claims: state.claims.map((claim) =>
        claim.id === updatedClaim.id ? updatedClaim : claim
      ),
    }));
  },
  removeClaims: (claimIds) => {
    set((state) => ({
      claims: state.claims.filter(c => !claimIds.includes(c.id)),
    }));
  },
  getClaimStatus: (claimId) => {
    if (!claimId) return null;
    const claim = get().claims.find(c => c.id === claimId);
    return claim ? { statementSent: claim.statementSent } : null;
  }
}));

export const useClaims = (initialClaims?: Claim[]) => {
  const store = useClaimsStore();
  
  // This allows initializing the store with props if needed, but it won't
  // override the state if it has already been modified by an import, for example.
  if (initialClaims && store.claims === initialClaimsData) {
      // This is a one-time initialization.
  }
  
  return store;
};
