"use client";

import * as React from "react";
import type { Pharmacy } from "@/lib/types";
import { useCollection } from "@/lib/supabase/hooks";
import { createClient } from "@/lib/supabase/client";

export function usePharmacies(initialPharmacies: Pharmacy[] = []) {
    const supabase = createClient();
    const { data, isLoading, error } = useCollection<Pharmacy>('pharmacies', 'name', true);

    const pharmacies = React.useMemo(() => {
        const values = data ?? initialPharmacies ?? [];
        return [...values].sort((a, b) => (a.name ?? "").localeCompare(b.name ?? ""));
    }, [data, initialPharmacies]);

    const updatePharmacy = React.useCallback(
        async (pharmacyId: string, updates: Partial<Pharmacy>) => {
            try {
                const { error } = await supabase
                    .from('pharmacies')
                    .update(updates)
                    .eq('id', pharmacyId);

                if (error) throw error;
            } catch (error) {
                console.error("Error updating pharmacy:", error);
                throw error;
            }
        },
        [supabase]
    );

    return {
        pharmacies,
        isLoading,
        error,
        updatePharmacy,
    };
}
