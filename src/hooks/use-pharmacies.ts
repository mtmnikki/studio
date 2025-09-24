"use client";

import React from "react";
import { collection } from "firebase/firestore";

import type { Pharmacy } from "@/lib/types";
import { useCollection, useFirestore, useMemoFirebase } from "@/firebase";

export const usePharmacies = () => {
  const firestore = useFirestore();

  const pharmaciesCollection = useMemoFirebase(() => {
    if (!firestore) return null;
    return collection(firestore, "pharmacies");
  }, [firestore]);

  const { data: pharmaciesSnapshot, isLoading, error } =
    useCollection<Pharmacy>(pharmaciesCollection);

  const pharmacies = React.useMemo(
    () => pharmaciesSnapshot ?? [],
    [pharmaciesSnapshot]
  );

  return {
    pharmacies,
    isLoading,
    error,
  };
};
