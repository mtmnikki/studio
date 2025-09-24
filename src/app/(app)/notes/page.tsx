"use client";

import { useMemo, useState } from "react";
import { NotebookPen, Pin, Plus, Trash2 } from "lucide-react";

import { PageHeader } from "@/components/page-header";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useToast } from "@/hooks/use-toast";
import { useNotes } from "@/hooks/use-notes";
import type { Note } from "@/lib/types";

export default function NotesPage() {
  const { notes, addNote, updateNote, deleteNote, isLoading } = useNotes();
  const { toast } = useToast();

  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");

  const pinnedNotes = useMemo(() => notes.filter((note) => note.pinned), [notes]);
  const otherNotes = useMemo(() => notes.filter((note) => !note.pinned), [notes]);

  const handleCreateNote = async () => {
    if (!title.trim() && !content.trim()) {
      toast({
        title: "Add a note first",
        description: "Write a quick title or jot down some thoughts before saving.",
      });
      return;
    }

    await addNote({ title: title.trim() || "Quick note", content: content.trim(), pinned: false });
    setTitle("");
    setContent("");
    toast({
      title: "Note saved",
      description: "Your note is now available across the workspace.",
    });
  };

  const handleUpdate = async (noteId: string, updates: Partial<Note>) => {
    await updateNote(noteId, updates);
    toast({
      title: "Notebook updated",
      description: "Changes saved successfully.",
    });
  };

  const handleDelete = async (noteId: string) => {
    await deleteNote(noteId);
    toast({
      title: "Note removed",
      description: "This idea has been archived.",
    });
  };

  return (
    <>
      <PageHeader
        title="Team Notebook"
        description="Capture quick ideas, billing reminders, and call scripts in one colorful workspace."
      >
        <Badge className="hidden sm:flex items-center gap-2 bg-gradient-to-r from-indigo-400 via-sky-500 to-teal-300 text-slate-900">
          <NotebookPen className="h-4 w-4" />
          Jenn's notebook
        </Badge>
      </PageHeader>

      <div className="grid gap-6">
        <Card className="border-white/40 bg-white/30 shadow-2xl backdrop-blur-xl">
          <CardHeader>
            <CardTitle className="text-2xl text-slate-900">Create a note</CardTitle>
            <CardDescription className="text-slate-600">
              Drop in quick reminders or add colorful tags to keep everything organized.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Input
              value={title}
              onChange={(event) => setTitle(event.target.value)}
              placeholder="Title (e.g. Follow up with Dr. Lewis)"
              className="rounded-2xl border border-white/60 bg-white/70"
            />
            <Textarea
              value={content}
              onChange={(event) => setContent(event.target.value)}
              placeholder="Add context, call notes, tasks, or ideas..."
              rows={5}
              className="rounded-3xl border border-white/60 bg-white/70"
            />
            <div className="flex flex-wrap justify-between gap-3">
              <div className="flex items-center gap-2 text-xs text-slate-500">
                <span>
                  Tips: Use this space for workflow reminders, conversations, or to celebrate wins!
                </span>
              </div>
              <Button onClick={handleCreateNote} disabled={isLoading}>
                <Plus className="mr-2 h-4 w-4" />
                Save note
              </Button>
            </div>
          </CardContent>
        </Card>

        <div className="grid gap-6 lg:grid-cols-[minmax(0,0.8fr)_minmax(0,1.2fr)]">
          <Card className="border-white/40 bg-white/30 shadow-2xl backdrop-blur-xl">
            <CardHeader>
              <CardTitle className="text-xl text-slate-900">Pinned inspiration</CardTitle>
              <CardDescription className="text-slate-600">
                Keep key talking points and priority reminders right where you need them.
              </CardDescription>
            </CardHeader>
            <CardContent className="pt-0">
              <ScrollArea className="h-[320px] pr-2">
                <div className="space-y-4">
                  {pinnedNotes.length === 0 && (
                    <div className="rounded-3xl border border-dashed border-slate-300/60 bg-white/60 p-6 text-center text-sm text-slate-500">
                      Pin your favorite notes to keep them at the top of the stack.
                    </div>
                  )}
                  {pinnedNotes.map((note) => (
                    <article
                      key={note.id}
                      className="rounded-3xl border border-white/60 bg-gradient-to-br from-indigo-400/20 via-sky-400/20 to-teal-300/20 p-5 shadow"
                    >
                      <header className="flex items-start justify-between gap-3">
                        <div>
                          <h3 className="text-lg font-semibold text-slate-900">{note.title}</h3>
                          <p className="text-xs uppercase tracking-wide text-slate-600">
                            Updated {new Date(note.updatedAt).toLocaleString()}
                          </p>
                        </div>
                        <div className="flex gap-2">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleUpdate(note.id, { pinned: false })}
                            className="rounded-full bg-white/70 text-slate-600 hover:text-slate-900"
                          >
                            <Pin className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleDelete(note.id)}
                            className="rounded-full bg-white/70 text-rose-500 hover:text-rose-600"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </header>
                      <p className="mt-4 text-sm leading-6 text-slate-700 whitespace-pre-wrap">
                        {note.content || "No additional details yet."}
                      </p>
                    </article>
                  ))}
                </div>
              </ScrollArea>
            </CardContent>
          </Card>

          <Card className="border-white/40 bg-white/30 shadow-2xl backdrop-blur-xl">
            <CardHeader>
              <CardTitle className="text-xl text-slate-900">Working notes</CardTitle>
              <CardDescription className="text-slate-600">
                Drafts, checklists, and conversation snippets stay in sync for everyone.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {otherNotes.length === 0 && (
                <div className="rounded-3xl border border-dashed border-slate-300/60 bg-white/60 p-6 text-center text-sm text-slate-500">
                  Start logging updates during calls or while prepping statements to keep everyone aligned.
                </div>
              )}
              {otherNotes.map((note) => (
                <article
                  key={note.id}
                  className="rounded-3xl border border-white/60 bg-white/70 p-5 shadow transition-all hover:-translate-y-1 hover:shadow-xl"
                >
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <Input
                      defaultValue={note.title}
                      onBlur={(event) => handleUpdate(note.id, { title: event.target.value })}
                      className="max-w-lg rounded-2xl border border-white/60 bg-white/80 text-base font-semibold text-slate-900"
                    />
                    <div className="flex items-center gap-2">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleUpdate(note.id, { pinned: true })}
                        className="rounded-full bg-white/70 text-indigo-500 hover:text-indigo-700"
                      >
                        <Pin className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleDelete(note.id)}
                        className="rounded-full bg-white/70 text-rose-500 hover:text-rose-600"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                  <Textarea
                    defaultValue={note.content}
                    onBlur={(event) => handleUpdate(note.id, { content: event.target.value })}
                    rows={4}
                    className="mt-4 rounded-3xl border border-white/60 bg-white/80"
                  />
                  <div className="mt-3 flex flex-wrap items-center justify-between text-xs text-slate-500">
                    <span>Last updated {new Date(note.updatedAt).toLocaleString()}</span>
                    <span className="text-slate-500">Capture updates and we'll auto-save when you click away.</span>
                  </div>
                </article>
              ))}
            </CardContent>
          </Card>
        </div>
      </div>
    </>
  );
}
