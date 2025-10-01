"use client";

import React from "react";
import type { Note } from "@/lib/types";
import { useCollection } from "@/lib/supabase/hooks";
import { createClient } from "@/lib/supabase/client";

export const useNotes = () => {
  const supabase = createClient();
  const { data: notesSnapshot, isLoading, error } = useCollection<Note>('notes', 'created_at', false);

  const notes = React.useMemo(() => notesSnapshot ?? [], [notesSnapshot]);

  const addNote = React.useCallback(
    async (note: Partial<Note> & { title: string }) => {
      const timestamp = new Date().toISOString();

      try {
        const { error } = await supabase
          .from('notes')
          .insert([{
            ...note,
            created_at: timestamp,
            updated_at: timestamp,
          }]);

        if (error) throw error;
      } catch (error) {
        console.error("Error adding note:", error);
        throw error;
      }
    },
    [supabase]
  );

  const updateNote = React.useCallback(
    async (noteId: string, updates: Partial<Note>) => {
      try {
        const { error } = await supabase
          .from('notes')
          .update({
            ...updates,
            updated_at: new Date().toISOString(),
          })
          .eq('id', noteId);

        if (error) throw error;
      } catch (error) {
        console.error("Error updating note:", error);
        throw error;
      }
    },
    [supabase]
  );

  const deleteNote = React.useCallback(
    async (noteId: string) => {
      try {
        const { error } = await supabase
          .from('notes')
          .delete()
          .eq('id', noteId);

        if (error) throw error;
      } catch (error) {
        console.error("Error deleting note:", error);
        throw error;
      }
    },
    [supabase]
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
