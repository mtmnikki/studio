"use client";

import React from 'react';
import type { Claim } from '@/lib/types';
import { useCollection } from '@/lib/supabase/hooks';
import { createClient } from '@/lib/supabase/client';
import { mapClaimToDb, mapDbClaimToClaim } from '@/lib/mappers';

export const useClaims = (initialClaims: Claim[] = []) => {
  const supabase = createClient();
  const { data: rawClaims, isLoading, error } = useCollection<Record<string, any>>('claims', 'service_date', false);

  const claims = React.useMemo<Claim[]>(() => {
    if (rawClaims && rawClaims.length) {
      return rawClaims.map(mapDbClaimToClaim);
    }
    return initialClaims;
  }, [rawClaims, initialClaims]);

  const addClaims = React.useCallback(async (newClaims: Array<Partial<Claim> | Record<string, any>>) => {
    try {
      const payload = newClaims.map((claim) => {
        if (claim && typeof claim === 'object' && 'total_charged_amount' in claim) {
          const { id, ...rest } = claim as Record<string, any>;
          return rest;
        }
        const { id, ...rest } = claim as Claim;
        return mapClaimToDb(rest);
      });

      const { error: insertError } = await supabase.from('claims').insert(payload);
      if (insertError) {
        throw insertError;
      }
    } catch (insertError) {
      console.error('Error adding claims:', insertError);
      throw insertError;
    }
  }, [supabase]);

  const updateClaim = React.useCallback(async (updatedClaim: Claim) => {
    const { id, ...claimData } = updatedClaim;

    try {
      const { error: updateError } = await supabase
        .from('claims')
        .update(mapClaimToDb(claimData))
        .eq('id', id);

      if (updateError) {
        throw updateError;
      }
    } catch (updateError) {
      console.error('Error updating claim:', updateError);
      throw updateError;
    }
  }, [supabase]);

  const removeClaims = React.useCallback(async (claimIds: string[]) => {
    try {
      const { error: deleteError } = await supabase
        .from('claims')
        .delete()
        .in('id', claimIds);

      if (deleteError) {
        throw deleteError;
      }
    } catch (deleteError) {
      console.error('Error removing claims:', deleteError);
      throw deleteError;
    }
  }, [supabase]);

  const getClaimStatus = React.useCallback(
    (claimId: string | null) => {
      if (!claimId) return null;
      const claim = claims.find((c) => c.id === claimId);
      return claim ? { statementMailed: claim.statementMailed } : null;
    },
    [claims]
  );

  return {
    claims,
    isLoading,
    error,
    addClaims,
    updateClaim,
    removeClaims,
    getClaimStatus,
  };
};
