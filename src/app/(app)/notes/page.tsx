"use client";

import * as React from "react";
import { PageHeader } from "@/components/page-header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useJennNotes } from "@/hooks/use-notes";
import type { JennNote } from "@/lib/types";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";
import { Plus, Pencil, Trash2, Sparkles, Clock } from "lucide-react";

const moodMeta: Record<NonNullable<JennNote["mood"]>, { label: string; gradient: string; accent: string }> = {
  celebrate: {
    label: "Celebrate",
    gradient: "from-emerald-400/70 via-teal-300/80 to-sky-300/80",
    accent: "bg-emerald-400/80",
  },
  todo: {
    label: "To-Do",
    gradient: "from-indigo-400/70 via-sky-400/80 to-cyan-300/70",
    accent: "bg-indigo-400/80",
  },
  "follow-up": {
    label: "Follow Up",
    gradient: "from-amber-300/80 via-orange-300/80 to-pink-300/70",
    accent: "bg-amber-400/80",
  },
  idea: {
    label: "Idea",
    gradient: "from-violet-400/70 via-purple-400/70 to-sky-400/70",
    accent: "bg-violet-400/80",
  },
};

const moodFilterOptions: Array<{ value: "all" | NonNullable<JennNote["mood"]>; label: string }> = [
  { value: "all", label: "All" },
  { value: "celebrate", label: "Celebrate" },
  { value: "todo", label: "To-Do" },
  { value: "follow-up", label: "Follow Up" },
  { value: "idea", label: "Ideas" },
];

function formatRelative(date: string) {
  const dt = new Date(date);
  if (Number.isNaN(dt.getTime())) return date;
  return dt.toLocaleString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

type NoteDraft = {
  title: string;
  body: string;
  tags: string;
  mood: NonNullable<JennNote["mood"]>;
};

const emptyDraft: NoteDraft = {
  title: "",
  body: "",
  tags: "",
  mood: "todo",
};

export default function NotesPage() {
  const { notes, isLoading, addNote, updateNote, removeNote } = useJennNotes();
  const { toast } = useToast();

  const [searchTerm, setSearchTerm] = React.useState("");
  const [moodFilter, setMoodFilter] = React.useState<(typeof moodFilterOptions)[number]["value"]>("all");
  const [createOpen, setCreateOpen] = React.useState(false);
  const [createDraft, setCreateDraft] = React.useState<NoteDraft>(emptyDraft);
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [editingNote, setEditingNote] = React.useState<JennNote | null>(null);
  const [editingDraft, setEditingDraft] = React.useState<NoteDraft>(emptyDraft);

  const filteredNotes = React.useMemo(() => {
    const normalizedSearch = searchTerm.trim().toLowerCase();
    return notes
      .filter((note) =>
        moodFilter === "all" ? true : note.mood === moodFilter
      )
      .filter((note) => {
        if (!normalizedSearch) return true;
        const haystack = [note.title, note.body, ...(note.tags ?? [])]
          .join(" ")
          .toLowerCase();
        return haystack.includes(normalizedSearch);
      });
  }, [notes, searchTerm, moodFilter]);

  const tagCounts = React.useMemo(() => {
    const counts = new Map<string, number>();
    notes.forEach((note) => {
      (note.tags ?? []).forEach((tag) => {
        const trimmed = tag.trim();
        if (!trimmed) return;
        counts.set(trimmed, (counts.get(trimmed) ?? 0) + 1);
      });
    });
    return Array.from(counts.entries()).sort((a, b) => b[1] - a[1]);
  }, [notes]);

  const handleCreateNote = async () => {
    if (!createDraft.title || !createDraft.body) {
      toast({
        title: "Add a title and note",
        description: "Both fields are needed to create a note.",
        variant: "destructive",
      });
      return;
    }

    try {
      setIsSubmitting(true);
      await addNote({
        title: createDraft.title,
        body: createDraft.body,
        tags: createDraft.tags
          .split(",")
          .map((tag) => tag.trim())
          .filter(Boolean),
        mood: createDraft.mood,
      });
      setCreateDraft(emptyDraft);
      setCreateOpen(false);
      toast({
        title: "Note saved",
        description: "Your thoughts were captured for Jenn!",
      });
    } catch (error) {
      console.error("Failed to add note", error);
      toast({
        title: "Unable to add note",
        description: "Please try again in a moment.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const openEdit = (note: JennNote) => {
    setEditingNote(note);
    setEditingDraft({
      title: note.title,
      body: note.body,
      tags: (note.tags ?? []).join(", "),
      mood: note.mood ?? "todo",
    });
  };

  const handleUpdateNote = async () => {
    if (!editingNote) return;
    if (!editingDraft.title || !editingDraft.body) {
      toast({
        title: "Add a title and note",
        description: "Both fields are needed to update a note.",
        variant: "destructive",
      });
      return;
    }

    try {
      setIsSubmitting(true);
      await updateNote(editingNote.id, {
        title: editingDraft.title,
        body: editingDraft.body,
        tags: editingDraft.tags
          .split(",")
          .map((tag) => tag.trim())
          .filter(Boolean),
        mood: editingDraft.mood,
      });
      setEditingNote(null);
      toast({
        title: "Note updated",
        description: "Changes have been saved.",
      });
    } catch (error) {
      console.error("Failed to update note", error);
      toast({
        title: "Unable to update note",
        description: "Please try again in a moment.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteNote = async (note: JennNote) => {
    try {
      await removeNote(note.id);
      toast({
        title: "Note removed",
        description: "That entry is now archived.",
      });
    } catch (error) {
      console.error("Failed to delete note", error);
      toast({
        title: "Unable to delete note",
        description: "Please try again in a moment.",
        variant: "destructive",
      });
    }
  };

  const summary = React.useMemo(() => {
    return {
      total: notes.length,
      celebrate: notes.filter((note) => note.mood === "celebrate").length,
      actionable: notes.filter((note) => note.mood === "todo" || note.mood === "follow-up").length,
    };
  }, [notes]);

  return (
    <div className="space-y-8">
      <PageHeader
        title="Jenn's Notes"
        description="Capture wins, reminders, and ideas in one vibrant workspace."
        children={
          <Button
            onClick={() => setCreateOpen(true)}
            className="rounded-full bg-gradient-to-r from-indigo-400 via-sky-400 to-teal-400 px-5 text-white shadow-lg hover:shadow-xl"
          >
            <Plus className="mr-2 h-4 w-4" /> New note
          </Button>
        }
      />

      <div className="grid gap-6 lg:grid-cols-[320px,1fr]">
        <div className="space-y-4">
          <Card className="border-none bg-white/70 p-[1px] shadow-xl shadow-sky-200/50">
            <div className="rounded-3xl bg-gradient-to-br from-white/90 via-white/80 to-white/60">
              <CardHeader className="space-y-3 border-b border-white/60">
                <CardTitle className="flex items-center gap-2 text-lg font-semibold text-slate-700">
                  <Sparkles className="h-5 w-5 text-sky-500" /> Filters
                </CardTitle>
                <div className="space-y-3">
                  <Input
                    value={searchTerm}
                    onChange={(event) => setSearchTerm(event.target.value)}
                    placeholder="Search notes"
                    className="h-11 rounded-2xl border-none bg-white/80 px-4 text-sm shadow-inner"
                  />
                  <Tabs
                    value={moodFilter}
                    onValueChange={(value) => setMoodFilter(value as (typeof moodFilterOptions)[number]["value"])}
                  >
                    <TabsList className="grid h-11 grid-cols-5 rounded-2xl bg-slate-100/60 p-[2px]">
                      {moodFilterOptions.map((option) => (
                        <TabsTrigger
                          key={option.value}
                          value={option.value}
                          className="rounded-2xl px-2 text-[11px] font-semibold uppercase tracking-wide text-slate-500 transition data-[state=active]:bg-gradient-to-r data-[state=active]:from-indigo-400 data-[state=active]:to-sky-400 data-[state=active]:text-white"
                        >
                          {option.label}
                        </TabsTrigger>
                      ))}
                    </TabsList>
                  </Tabs>
                </div>
              </CardHeader>
              <CardContent className="space-y-4 p-6">
                <div className="grid gap-3">
                  <div className="rounded-3xl border border-white/60 bg-white/80 p-4 shadow-inner">
                    <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Total Notes</p>
                    <p className="mt-1 text-2xl font-semibold text-slate-700">{summary.total}</p>
                    <p className="text-xs text-slate-500">Jenn's journal of billing brilliance</p>
                  </div>
                  <div className="rounded-3xl border border-white/60 bg-white/80 p-4 shadow-inner">
                    <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Actionable</p>
                    <p className="mt-1 text-2xl font-semibold text-slate-700">{summary.actionable}</p>
                    <p className="text-xs text-slate-500">Follow-ups & to-dos</p>
                  </div>
                  <div className="rounded-3xl border border-white/60 bg-white/80 p-4 shadow-inner">
                    <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Celebrations</p>
                    <p className="mt-1 text-2xl font-semibold text-slate-700">{summary.celebrate}</p>
                    <p className="text-xs text-slate-500">Wins worth sharing</p>
                  </div>
                </div>

                {tagCounts.length > 0 && (
                  <div className="rounded-3xl border border-white/60 bg-white/80 p-4 shadow-inner">
                    <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Top tags</p>
                    <div className="mt-3 flex flex-wrap gap-2">
                      {tagCounts.slice(0, 8).map(([tag, count]) => (
                        <Badge key={tag} variant="outline" className="rounded-full border-slate-200 text-slate-600">
                          #{tag} · {count}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}
              </CardContent>
            </div>
          </Card>
        </div>

        <div className="space-y-4">
          {isLoading ? (
            <div className="rounded-3xl border border-dashed border-slate-200/80 bg-white/70 p-12 text-center text-sm text-slate-500">
              Loading Jenn's notes...
            </div>
          ) : filteredNotes.length === 0 ? (
            <div className="rounded-3xl border border-dashed border-slate-200/80 bg-white/70 p-12 text-center text-sm text-slate-500">
              No notes match your filters yet.
            </div>
          ) : (
            <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
              {filteredNotes.map((note) => {
                const mood = note.mood ?? "todo";
                const meta = moodMeta[mood];
                return (
                  <Card key={note.id} className="border-none bg-transparent p-[1px]">
                    <div
                      className={cn(
                        "flex h-full flex-col rounded-3xl border border-white/50 bg-white/80 p-6 shadow-xl transition hover:-translate-y-1 hover:shadow-2xl",
                        `bg-gradient-to-br ${meta.gradient}`
                      )}
                    >
                      <div className="flex items-center justify-between gap-3">
                        <Badge className={cn("rounded-full px-3 py-1 text-xs font-semibold text-white", meta.accent)}>
                          {meta.label}
                        </Badge>
                        <span className="flex items-center gap-1 text-xs text-white/80">
                          <Clock className="h-3.5 w-3.5" /> {formatRelative(note.updatedAt)}
                        </span>
                      </div>
                      <h3 className="mt-4 text-xl font-semibold text-white">{note.title}</h3>
                      <p className="mt-3 flex-1 whitespace-pre-line text-sm text-white/90">{note.body}</p>
                      {note.tags && note.tags.length > 0 && (
                        <div className="mt-4 flex flex-wrap gap-2">
                          {note.tags.map((tag) => (
                            <span
                              key={tag}
                              className="rounded-full bg-white/30 px-3 py-1 text-xs font-medium text-white/90 backdrop-blur"
                            >
                              #{tag}
                            </span>
                          ))}
                        </div>
                      )}
                      <div className="mt-6 flex items-center justify-end gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          className="rounded-full bg-white/30 text-white hover:bg-white/50"
                          onClick={() => openEdit(note)}
                        >
                          <Pencil className="mr-1.5 h-4 w-4" /> Edit
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="rounded-full bg-white/20 text-white hover:bg-white/40"
                          onClick={() => handleDeleteNote(note)}
                        >
                          <Trash2 className="mr-1.5 h-4 w-4" /> Delete
                        </Button>
                      </div>
                    </div>
                  </Card>
                );
              })}
            </div>
          )}
        </div>
      </div>

      <Dialog open={createOpen} onOpenChange={(open) => {
        setCreateOpen(open);
        if (!open) {
          setCreateDraft(emptyDraft);
        }
      }}>
        <DialogContent className="max-w-lg rounded-3xl border border-white/60 bg-white/90 shadow-2xl">
          <DialogHeader>
            <DialogTitle className="text-xl font-semibold text-slate-700">New note</DialogTitle>
            <DialogDescription className="text-sm text-slate-500">
              Capture a quick update, reminder, or celebration for Jenn.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 pt-2">
            <Input
              value={createDraft.title}
              onChange={(event) => setCreateDraft((draft) => ({ ...draft, title: event.target.value }))}
              placeholder="Title"
              className="h-11 rounded-2xl border border-slate-200 bg-white/90"
            />
            <Textarea
              value={createDraft.body}
              onChange={(event) => setCreateDraft((draft) => ({ ...draft, body: event.target.value }))}
              placeholder="Write your note"
              className="min-h-[140px] rounded-2xl border border-slate-200 bg-white/90"
            />
            <Input
              value={createDraft.tags}
              onChange={(event) => setCreateDraft((draft) => ({ ...draft, tags: event.target.value }))}
              placeholder="Tags (comma separated)"
              className="h-11 rounded-2xl border border-slate-200 bg-white/90"
            />
            <Tabs
              value={createDraft.mood}
              onValueChange={(value) => setCreateDraft((draft) => ({ ...draft, mood: value as NoteDraft["mood"] }))}
            >
              <TabsList className="grid h-11 grid-cols-4 rounded-2xl bg-slate-100/60 p-[2px]">
                {Object.entries(moodMeta).map(([key, meta]) => (
                  <TabsTrigger
                    key={key}
                    value={key}
                    className="rounded-2xl px-2 text-[11px] font-semibold uppercase tracking-wide text-slate-500 transition data-[state=active]:bg-gradient-to-r data-[state=active]:from-indigo-400 data-[state=active]:to-sky-400 data-[state=active]:text-white"
                  >
                    {meta.label}
                  </TabsTrigger>
                ))}
              </TabsList>
            </Tabs>
          </div>
          <DialogFooter className="mt-6">
            <Button
              variant="ghost"
              className="rounded-full px-4 text-slate-500 hover:text-slate-700"
              onClick={() => setCreateOpen(false)}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button
              className="rounded-full bg-gradient-to-r from-indigo-400 via-sky-400 to-teal-400 px-5 text-white shadow-lg hover:shadow-xl"
              onClick={handleCreateNote}
              disabled={isSubmitting}
            >
              {isSubmitting ? "Saving..." : "Save note"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={Boolean(editingNote)} onOpenChange={(open) => {
        if (!open) {
          setEditingNote(null);
          setEditingDraft(emptyDraft);
        }
      }}>
        <DialogContent className="max-w-lg rounded-3xl border border-white/60 bg-white/90 shadow-2xl">
          <DialogHeader>
            <DialogTitle className="text-xl font-semibold text-slate-700">Edit note</DialogTitle>
            <DialogDescription className="text-sm text-slate-500">
              Update the details for this note.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 pt-2">
            <Input
              value={editingDraft.title}
              onChange={(event) => setEditingDraft((draft) => ({ ...draft, title: event.target.value }))}
              placeholder="Title"
              className="h-11 rounded-2xl border border-slate-200 bg-white/90"
            />
            <Textarea
              value={editingDraft.body}
              onChange={(event) => setEditingDraft((draft) => ({ ...draft, body: event.target.value }))}
              placeholder="Write your note"
              className="min-h-[140px] rounded-2xl border border-slate-200 bg-white/90"
            />
            <Input
              value={editingDraft.tags}
              onChange={(event) => setEditingDraft((draft) => ({ ...draft, tags: event.target.value }))}
              placeholder="Tags (comma separated)"
              className="h-11 rounded-2xl border border-slate-200 bg-white/90"
            />
            <Tabs
              value={editingDraft.mood}
              onValueChange={(value) => setEditingDraft((draft) => ({ ...draft, mood: value as NoteDraft["mood"] }))}
            >
              <TabsList className="grid h-11 grid-cols-4 rounded-2xl bg-slate-100/60 p-[2px]">
                {Object.entries(moodMeta).map(([key, meta]) => (
                  <TabsTrigger
                    key={key}
                    value={key}
                    className="rounded-2xl px-2 text-[11px] font-semibold uppercase tracking-wide text-slate-500 transition data-[state=active]:bg-gradient-to-r data-[state=active]:from-indigo-400 data-[state=active]:to-sky-400 data-[state=active]:text-white"
                  >
                    {meta.label}
                  </TabsTrigger>
                ))}
              </TabsList>
            </Tabs>
          </div>
          <DialogFooter className="mt-6">
            <Button
              variant="ghost"
              className="rounded-full px-4 text-slate-500 hover:text-slate-700"
              onClick={() => setEditingNote(null)}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button
              className="rounded-full bg-gradient-to-r from-indigo-400 via-sky-400 to-teal-400 px-5 text-white shadow-lg hover:shadow-xl"
              onClick={handleUpdateNote}
              disabled={isSubmitting}
            >
              {isSubmitting ? "Saving..." : "Update note"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
