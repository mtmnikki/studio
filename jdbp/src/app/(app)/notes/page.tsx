
"use client";

import * as React from "react";
import { PageHeader } from "@/components/page-header";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { useNotes } from "@/hooks/use-notes";
import type { Note } from "@/lib/types";
import {
    Plus,
    Trash2,
    Edit,
    Tag,
    Smile,
    ListTodo,
    Lightbulb,
    MessageSquare,
    Search,
} from "lucide-react";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { format } from "date-fns";

const moodIcons: Record<NonNullable<Note["mood"]>, React.ElementType> = {
    celebrate: Smile,
    todo: ListTodo,
    idea: Lightbulb,
    "follow-up": MessageSquare,
};

const moodLabels: Record<NonNullable<Note["mood"]>, string> = {
    celebrate: "Celebrate",
    todo: "To-Do",
    idea: "Idea",
    "follow-up": "Follow-Up",
};

function NoteCard({
    note,
    onEdit,
    onDelete,
}: {
    note: Note;
    onEdit: () => void;
    onDelete: () => void;
}) {
    const MoodIcon = moodIcons[note.mood ?? "follow-up"];
    const moodLabel = moodLabels[note.mood ?? "follow-up"];

    return (
        <Card className="flex flex-col border-none bg-white/70 p-[1px] shadow-lg shadow-sky-200/40 transition hover:shadow-xl hover:scale-[1.01]">
            <div className="flex h-full flex-col rounded-3xl bg-gradient-to-br from-white/90 via-white/80 to-white/60">
                <CardHeader className="flex flex-row items-start justify-between gap-4 border-b border-white/60 pb-4">
                    <div>
                        <CardTitle className="text-lg font-semibold text-slate-700">{note.title}</CardTitle>
                        <CardDescription className="mt-1 flex flex-wrap items-center gap-2 text-xs">
                            <span>{format(new Date(note.updatedAt), "MMM d, yyyy")}</span>
                            <span className="text-slate-300">|</span>
                            <span className="flex items-center gap-1.5">
                                <MoodIcon className="h-4 w-4 text-sky-500" />
                                <span>{moodLabel}</span>
                            </span>
                        </CardDescription>
                    </div>
                    <div className="flex items-center gap-1">
                        <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 rounded-full text-slate-500 hover:bg-white/80 hover:text-slate-800"
                            onClick={onEdit}
                        >
                            <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 rounded-full text-slate-500 hover:bg-white/80 hover:text-red-500"
                            onClick={onDelete}
                        >
                            <Trash2 className="h-4 w-4" />
                        </Button>
                    </div>
                </CardHeader>
                <CardContent className="flex-1 px-6 py-4">
                    <p className="whitespace-pre-wrap text-sm text-slate-600">{note.body}</p>
                </CardContent>
                {note.tags && note.tags.length > 0 && (
                    <CardFooter className="flex flex-wrap gap-2 border-t border-white/60 px-6 py-3">
                        {note.tags.map((tag) => (
                            <Badge key={tag} variant="secondary" className="rounded-full bg-sky-100 text-sky-700">
                                <Tag className="mr-1.5 h-3 w-3" />
                                {tag}
                            </Badge>
                        ))}
                    </CardFooter>
                )}
            </div>
        </Card>
    );
}

function NoteDialog({
    note,
    onSave,
    children,
}: {
    note?: Note;
    onSave: (data: Partial<Note>, noteId?: string) => Promise<void>;
    children: React.ReactNode;
}) {
    const { toast } = useToast();
    const [isOpen, setIsOpen] = React.useState(false);
    const [title, setTitle] = React.useState(note?.title ?? "");
    const [body, setBody] = React.useState(note?.body ?? "");
    const [tags, setTags] = React.useState(note?.tags?.join(", ") ?? "");
    const [mood, setMood] = React.useState<Note["mood"]>(
        note?.mood ?? "follow-up"
    );
    const [isSaving, setIsSaving] = React.useState(false);

    const handleSave = async () => {
        if (!title.trim() || !body.trim()) {
            toast({
                title: "Missing fields",
                description: "A note needs a title and a body.",
                variant: "destructive",
            });
            return;
        }

        setIsSaving(true);
        try {
            await onSave(
                {
                    title,
                    body,
                    tags: tags.split(",").map((t) => t.trim()).filter(Boolean),
                    mood,
                },
                note?.id
            );
            setIsOpen(false);
            toast({
                title: note ? "Note updated" : "Note created",
                description: "Your note has been saved successfully.",
                className: "bg-accent text-accent-foreground"
            });
        } catch (err) {
            toast({
                title: "Save failed",
                description: "We couldn't save your note. Please try again.",
                variant: "destructive",
            });
        } finally {
            setIsSaving(false);
        }
    };

    React.useEffect(() => {
        if (isOpen) {
            setTitle(note?.title ?? "");
            setBody(note?.body ?? "");
            setTags(note?.tags?.join(", ") ?? "");
            setMood(note?.mood ?? "follow-up");
        }
    }, [isOpen, note]);

    return (
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <DialogTrigger asChild>{children}</DialogTrigger>
            <DialogContent className="sm:max-w-xl">
                <DialogHeader>
                    <DialogTitle>{note ? "Edit Note" : "Create New Note"}</DialogTitle>
                    <DialogDescription>
                        {note
                            ? "Make changes to your existing note."
                            : "Add a new note to your collection."}
                    </DialogDescription>
                </DialogHeader>
                <div className="grid gap-6 py-4">
                    <div className="grid grid-cols-4 items-center gap-4">
                        <label htmlFor="title" className="text-right text-sm font-medium text-slate-600">
                            Title
                        </label>
                        <Input
                            id="title"
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            className="col-span-3 h-11 rounded-xl bg-slate-50 shadow-inner"
                        />
                    </div>
                    <div className="grid grid-cols-4 items-start gap-4">
                        <label htmlFor="body" className="pt-3 text-right text-sm font-medium text-slate-600">
                            Body
                        </label>
                        <Textarea
                            id="body"
                            value={body}
                            onChange={(e) => setBody(e.target.value)}
                            className="col-span-3 min-h-[120px] rounded-xl bg-slate-50 shadow-inner"
                            placeholder="Jot down your thoughts..."
                        />
                    </div>
                    <div className="grid grid-cols-4 items-center gap-4">
                        <label htmlFor="tags" className="text-right text-sm font-medium text-slate-600">
                            Tags
                        </label>
                        <Input
                            id="tags"
                            value={tags}
                            onChange={(e) => setTags(e.target.value)}
                            className="col-span-3 h-11 rounded-xl bg-slate-50 shadow-inner"
                            placeholder="e.g., important, urgent"
                        />
                    </div>
                    <div className="grid grid-cols-4 items-center gap-4">
                        <label htmlFor="mood" className="text-right text-sm font-medium text-slate-600">
                            Mood
                        </label>
                        <Select
                            value={mood}
                            onValueChange={(value) => setMood(value as Note["mood"])}
                        >
                            <SelectTrigger className="col-span-3 h-11 rounded-xl bg-slate-50 shadow-inner">
                                <SelectValue placeholder="Select a mood" />
                            </SelectTrigger>
                            <SelectContent>
                                {Object.entries(moodLabels).map(([key, label]) => (
                                    <SelectItem key={key} value={key}>
                                        <div className="flex items-center gap-2">
                                            {React.createElement(moodIcons[key as keyof typeof moodIcons], { className: "h-4 w-4" })}
                                            {label}
                                        </div>
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>
                </div>
                <DialogFooter>
                    <Button
                        variant="outline"
                        className="rounded-full"
                        onClick={() => setIsOpen(false)}
                    >
                        Cancel
                    </Button>
                    <Button
                        onClick={handleSave}
                        disabled={isSaving}
                        className="rounded-full bg-gradient-to-r from-sky-500 to-teal-400 text-white shadow-lg hover:shadow-xl"
                    >
                        {isSaving ? "Saving..." : "Save Note"}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}

export default function NotesPage() {
    const { notes, isLoading, addNote, updateNote, deleteNote } = useNotes();
    const { toast } = useToast();
    const [searchTerm, setSearchTerm] = React.useState("");

    const filteredNotes = React.useMemo(() => {
        const normalizedSearch = searchTerm.trim().toLowerCase();
        if (!normalizedSearch) return notes;
        return notes.filter((note) =>
            [note.title, note.body, ...(note.tags ?? [])]
                .join(" ")
                .toLowerCase()
                .includes(normalizedSearch)
        );
    }, [notes, searchTerm]);

    const handleSave = (data: Partial<Note>, noteId?: string) => {
        return noteId ? updateNote(noteId, data) : addNote(data as Partial<Note> & { title: string });
    };

    const handleDelete = async (noteId: string) => {
        try {
            await deleteNote(noteId);
            toast({
                title: "Note deleted",
                description: "The note has been removed from your workspace.",
            });
        } catch (err) {
            toast({
                title: "Delete failed",
                description: "We couldn't remove the note. Please try again.",
                variant: "destructive",
            });
        }
    };

    return (
        <div className="space-y-8">
            <PageHeader
                title="Jenn's Notes"
                description="Your personal scratchpad for brilliant ideas, urgent reminders, and important follow-ups."
            >
                <NoteDialog onSave={handleSave}>
                    <Button className="rounded-full bg-gradient-to-r from-indigo-400 via-sky-400 to-teal-400 px-5 text-white shadow-lg hover:shadow-xl">
                        <Plus className="mr-2 h-4 w-4" /> New Note
                    </Button>
                </NoteDialog>
            </PageHeader>

            <div className="relative">
                <Search className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" />
                <Input
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    placeholder="Search notes by title, content, or tag..."
                    className="h-12 w-full rounded-2xl border-white/60 bg-white/60 px-12 text-base shadow-inner shadow-sky-200/50"
                />
            </div>

            {isLoading && (
                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                    {[...Array(3)].map((_, i) => (
                        <div key={i} className="h-[250px] animate-pulse rounded-3xl bg-slate-200/50" />
                    ))}
                </div>
            )}

            {!isLoading && filteredNotes.length === 0 && (
                <div className="flex flex-col items-center justify-center rounded-3xl border-2 border-dashed border-slate-200/80 bg-white/70 py-20 text-center">
                    <MessageSquare className="h-12 w-12 text-slate-300" />
                    <h3 className="mt-4 text-xl font-semibold text-slate-600">
                        {searchTerm ? "No notes found" : "Your workspace is empty"}
                    </h3>
                    <p className="mt-2 text-sm text-slate-500">
                        {searchTerm
                            ? "Try a different search term to find what you're looking for."
                            : "Click 'New Note' to start capturing your thoughts."}
                    </p>
                </div>
            )}

            {!isLoading && filteredNotes.length > 0 && (
                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                    {filteredNotes.map((note) => (
                        <NoteDialog
                            key={note.id}
                            note={note}
                            onSave={handleSave}
                        >
                            <NoteCard
                                note={note}
                                onEdit={() => { }}
                                onDelete={(e) => {
                                    e.stopPropagation();
                                    handleDelete(note.id);
                                }}
                            />
                        </NoteDialog>
                    ))}
                </div>
            )}
        </div>
    );
}

