"use client";

import * as React from "react";
import type { Patient } from "@/lib/types";
import { useCollection } from "@/lib/supabase/hooks";
import { createClient } from "@/lib/supabase/client";

export function usePatients(initialPatients: Patient[] = []) {
  const supabase = createClient();
  const { data, isLoading, error } = useCollection<Patient>("patients", "last_name", true);

  const patients = React.useMemo(() => {
    const values = data ?? initialPatients ?? [];
    return [...values].sort((a, b) => {
      const nameA = `${a.lastName ?? ""} ${a.firstName ?? ""}`.trim().toLowerCase();
      const nameB = `${b.lastName ?? ""} ${b.firstName ?? ""}`.trim().toLowerCase();
      return nameA.localeCompare(nameB);
    });
  }, [data, initialPatients]);

  const updatePatient = React.useCallback(
    async (patientId: string, updates: Partial<Patient>) => {
      const { error: updateError } = await supabase
        .from("patients")
        .update(updates)
        .eq("id", patientId);

      if (updateError) {
        console.error("Error updating patient:", updateError);
        throw updateError;
      }
    },
    [supabase]
  );

  return {
    patients,
    isLoading,
    error,
    updatePatient,
  };
}
