"use client";

import { doc, writeBatch } from "firebase/firestore";
import type { Firestore } from "firebase/firestore";

type StatementMarkingOptions = {
  statement?: "first" | "second";
  markedAt?: Date;
};

/**
 * Marks the provided claim documents as having a patient statement sent.
 *
 * The update happens in a Firestore batch so that either all claim documents
 * are updated or none of them are. By default we mark the first statement as
 * sent, but callers can opt-in to marking the second statement instead.
 */
export async function markClaimsStatementStatus(
  firestore: Firestore,
  claimIds: string[],
  options: StatementMarkingOptions = {}
) {
  if (!claimIds.length) {
    return;
  }

  const { statement = "first", markedAt = new Date() } = options;
  const timestamp = markedAt.toISOString();

  const batch = writeBatch(firestore);

  claimIds.forEach((claimId) => {
    const claimRef = doc(firestore, "claims", claimId);
    if (statement === "second") {
      batch.update(claimRef, {
        statementSent2nd: true,
        statementSent2ndAt: timestamp,
      });
    } else {
      batch.update(claimRef, {
        statementSent: true,
        statementSentAt: timestamp,
      });
    }
  });

  await batch.commit();
}
