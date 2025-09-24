"use client";

import * as React from "react";
import type { Pharmacy } from "@/lib/types";
import { useCollection, useFirestore, useMemoFirebase } from "@/firebase";
import { collection, doc } from "firebase/firestore";
import { updateDocumentNonBlocking } from "@/firebase/non-blocking-updates";

export function usePharmacies(initialPharmacies: Pharmacy[] = []) {
  const firestore = useFirestore();

  const pharmaciesCollection = useMemoFirebase(() => {
    if (!firestore) return null;
    return collection(firestore, "pharmacies");
  }, [firestore]);

  const { data, isLoading, error } = useCollection<Pharmacy>(pharmaciesCollection);

  const pharmacies = React.useMemo(() => {
    const values = data ?? initialPharmacies ?? [];
    return [...values].sort((a, b) => (a.name ?? "").localeCompare(b.name ?? ""));
  }, [data, initialPharmacies]);

  const updatePharmacy = React.useCallback(
    (pharmacyId: string, updates: Partial<Pharmacy>) => {
      if (!firestore) return;
      const ref = doc(firestore, "pharmacies", pharmacyId);
      updateDocumentNonBlocking(ref, updates);
    },
    [firestore]
  );

  return {
    pharmacies,
    isLoading,
    error,
    updatePharmacy,
  };
}
