"use client";

import { createClient } from "@/lib/supabase/client";

type StatementMarkingOptions = {
  statement?: "first" | "second";
  markedAt?: Date;
};

export async function markClaimsStatementStatus(
  claimIds: string[],
  options: StatementMarkingOptions = {}
) {
  if (!claimIds.length) {
    return;
  }

  const { statement = "first", markedAt = new Date() } = options;
  const timestamp = markedAt.toISOString();
  const supabase = createClient();

  const updates = claimIds.map((claimId) => {
    if (statement === "second") {
      return supabase
        .from("claims")
        .update({
          statement_two_mailed: true,
          statement_sent_2nd_at: timestamp,
        })
        .eq("id", claimId);
    }

    return supabase
      .from("claims")
      .update({
        statement_mailed: true,
        statement_sent_at: timestamp,
      })
      .eq("id", claimId);
  });

  await Promise.all(updates);
}
