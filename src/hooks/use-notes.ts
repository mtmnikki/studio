"use client";

import React from "react";
import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  updateDoc,
} from "firebase/firestore";

import type { Note } from "@/lib/types";
import { useCollection, useFirestore, useMemoFirebase } from "@/firebase";

export const useNotes = () => {
  const firestore = useFirestore();

  const notesCollection = useMemoFirebase(() => {
    if (!firestore) return null;
    return collection(firestore, "notes");
  }, [firestore]);

  const { data: notesSnapshot, isLoading, error } = useCollection<Note>(
    notesCollection
  );

  const notes = React.useMemo(() => notesSnapshot ?? [], [notesSnapshot]);

  const addNote = React.useCallback(
    async (note: Pick<Note, "title" | "content" | "tags" | "pinned">) => {
      if (!notesCollection) return;
      const timestamp = new Date().toISOString();
      await addDoc(notesCollection, {
        ...note,
        createdAt: timestamp,
        updatedAt: timestamp,
      });
    },
    [notesCollection]
  );

  const updateNote = React.useCallback(
    async (noteId: string, updates: Partial<Note>) => {
      const noteRef = doc(firestore, "notes", noteId);
      await updateDoc(noteRef, {
        ...updates,
        updatedAt: new Date().toISOString(),
      });
    },
    [firestore]
  );

  const deleteNote = React.useCallback(
    async (noteId: string) => {
      const noteRef = doc(firestore, "notes", noteId);
      await deleteDoc(noteRef);
    },
    [firestore]
  );

  return {
    notes,
    isLoading,
    error,
    addNote,
    updateNote,
    deleteNote,
  };
};
