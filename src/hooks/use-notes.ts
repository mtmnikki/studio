"use client";

import * as React from "react";
import type { JennNote } from "@/lib/types";
import { useCollection, useFirestore, useMemoFirebase } from "@/firebase";
import { collection, deleteDoc, doc, setDoc, updateDoc } from "firebase/firestore";

export type CreateNoteInput = {
  title: string;
  body: string;
  tags?: string[];
  mood?: JennNote["mood"];
};

export function useJennNotes(initialNotes: JennNote[] = []) {
  const firestore = useFirestore();

  const notesCollection = useMemoFirebase(() => {
    if (!firestore) return null;
    return collection(firestore, "notes");
  }, [firestore]);

  const { data, isLoading, error } = useCollection<JennNote>(notesCollection);

  const notes = React.useMemo(() => {
    const values = data ?? initialNotes ?? [];
    return [...values].sort((a, b) => (b.updatedAt ?? "").localeCompare(a.updatedAt ?? ""));
  }, [data, initialNotes]);

  const addNote = React.useCallback(
    async (input: CreateNoteInput) => {
      if (!firestore) return null;
      const ref = doc(collection(firestore, "notes"));
      const now = new Date().toISOString();
      await setDoc(ref, {
        title: input.title,
        body: input.body,
        tags: input.tags ?? [],
        mood: input.mood ?? "follow-up",
        createdAt: now,
        updatedAt: now,
      });
      return ref.id;
    },
    [firestore]
  );

  const updateNote = React.useCallback(
    async (noteId: string, updates: Partial<CreateNoteInput>) => {
      if (!firestore) return;
      const ref = doc(firestore, "notes", noteId);
      await updateDoc(ref, {
        ...updates,
        updatedAt: new Date().toISOString(),
      });
    },
    [firestore]
  );

  const removeNote = React.useCallback(
    async (noteId: string) => {
      if (!firestore) return;
      const ref = doc(firestore, "notes", noteId);
      await deleteDoc(ref);
    },
    [firestore]
  );

  return {
    notes,
    isLoading,
    error,
    addNote,
    updateNote,
    removeNote,
  };
}
