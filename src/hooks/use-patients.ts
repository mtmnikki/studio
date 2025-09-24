"use client";

import * as React from "react";
import type { Patient } from "@/lib/types";
import { useCollection, useFirestore, useMemoFirebase } from "@/firebase";
import { collection, doc } from "firebase/firestore";
import { updateDocumentNonBlocking } from "@/firebase/non-blocking-updates";

export function usePatients(initialPatients: Patient[] = []) {
  const firestore = useFirestore();

  const patientsCollection = useMemoFirebase(() => {
    if (!firestore) return null;
    return collection(firestore, "patients");
  }, [firestore]);

  const { data, isLoading, error } = useCollection<Patient>(patientsCollection);

  const patients = React.useMemo(() => {
    const values = data ?? initialPatients ?? [];
    return [...values].sort((a, b) => {
      const nameA = `${a.lastName ?? ""} ${a.firstName ?? ""}`.trim().toLowerCase();
      const nameB = `${b.lastName ?? ""} ${b.firstName ?? ""}`.trim().toLowerCase();
      return nameA.localeCompare(nameB);
    });
  }, [data, initialPatients]);

  const updatePatient = React.useCallback(
    (patientId: string, updates: Partial<Patient>) => {
      if (!firestore) return;
      const ref = doc(firestore, "patients", patientId);
      updateDocumentNonBlocking(ref, updates);
    },
    [firestore]
  );

  return {
    patients,
    isLoading,
    error,
    updatePatient,
  };
}
