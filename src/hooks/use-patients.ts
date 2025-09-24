"use client";

import React from "react";
import { collection } from "firebase/firestore";

import type { Patient } from "@/lib/types";
import { useCollection, useFirestore, useMemoFirebase } from "@/firebase";

export const usePatients = () => {
  const firestore = useFirestore();

  const patientsCollection = useMemoFirebase(() => {
    if (!firestore) return null;
    return collection(firestore, "patients");
  }, [firestore]);

  const { data: patientsSnapshot, isLoading, error } =
    useCollection<Patient>(patientsCollection);

  const patients = React.useMemo(() => patientsSnapshot ?? [], [patientsSnapshot]);

  return {
    patients,
    isLoading,
    error,
  };
};
