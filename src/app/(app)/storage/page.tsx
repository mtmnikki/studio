"use client";

import * as React from "react";
import { PageHeader } from "@/components/page-header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { initializeFirebase } from "@/firebase";
import { useToast } from "@/hooks/use-toast";
import { getDownloadURL, getMetadata, getStorage, listAll, ref, type StorageReference } from "firebase/storage";
import { ArrowDownToLine, Cloud, Copy, RefreshCcw } from "lucide-react";

interface StorageFile {
  name: string;
  fullPath: string;
  size: number;
  updated?: string;
  contentType?: string;
  url?: string;
}

async function collectFiles(reference: StorageReference, prefix = ""): Promise<StorageFile[]> {
  const result = await listAll(reference);
  const files: StorageFile[] = [];

  for (const item of result.items) {
    const metadata = await getMetadata(item).catch(() => undefined);
    const downloadUrl = await getDownloadURL(item).catch(() => undefined);

    files.push({
      name: item.name,
      fullPath: prefix ? `${prefix}/${item.name}` : item.name,
      size: metadata?.size ?? 0,
      updated: metadata?.updated,
      contentType: metadata?.contentType ?? undefined,
      url: downloadUrl,
    });
  }

  for (const folder of result.prefixes) {
    const nested = await collectFiles(folder, prefix ? `${prefix}/${folder.name}` : folder.name);
    files.push(...nested);
  }

  return files;
}

function formatSize(bytes: number) {
  if (!bytes) return "—";
  const units = ["B", "KB", "MB", "GB"];
  let size = bytes;
  let unitIndex = 0;
  while (size >= 1024 && unitIndex < units.length - 1) {
    size /= 1024;
    unitIndex += 1;
  }
  return `${size.toFixed(size < 10 && unitIndex > 0 ? 1 : 0)} ${units[unitIndex]}`;
}

function formatDate(value?: string) {
  if (!value) return "—";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

export default function StoragePage() {
  const { toast } = useToast();
  const firebase = initializeFirebase();
  const storage = React.useMemo(() => {
    try {
      return firebase.firebaseApp ? getStorage(firebase.firebaseApp) : null;
    } catch (error) {
      console.warn("Unable to initialize storage", error);
      return null;
    }
  }, [firebase.firebaseApp]);

  const [files, setFiles] = React.useState<StorageFile[]>([]);
  const [isLoading, setIsLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [searchTerm, setSearchTerm] = React.useState("");

  const loadFiles = React.useCallback(async () => {
    if (!storage) {
      setError("Firebase Storage is not available right now.");
      return;
    }

    setIsLoading(true);
    setError(null);
    try {
      const rootRef = ref(storage);
      const collected = await collectFiles(rootRef);
      collected.sort((a, b) => (b.updated ?? "").localeCompare(a.updated ?? ""));
      setFiles(collected);
    } catch (err) {
      console.error("Failed to load storage files", err);
      setError("We couldn't load files from storage. Try refreshing.");
    } finally {
      setIsLoading(false);
    }
  }, [storage]);

  React.useEffect(() => {
    loadFiles();
  }, [loadFiles]);

  const filteredFiles = React.useMemo(() => {
    const normalized = searchTerm.trim().toLowerCase();
    if (!normalized) return files;
    return files.filter((file) => file.fullPath.toLowerCase().includes(normalized));
  }, [files, searchTerm]);

  const handleCopyLink = (file: StorageFile) => {
    if (!file.url) {
      toast({
        title: "Link unavailable",
        description: "We couldn't fetch a download link yet.",
        variant: "destructive",
      });
      return;
    }

    if (typeof navigator === "undefined" || !navigator.clipboard) {
      toast({
        title: "Clipboard unsupported",
        description: "Your browser can't copy automatically. Use the download button instead.",
        variant: "destructive",
      });
      return;
    }

    navigator.clipboard
      .writeText(file.url)
      .then(() => {
        toast({
          title: "Link copied",
          description: "Share this file link with your team.",
        });
      })
      .catch(() => {
        toast({
          title: "Unable to copy",
          description: "Copy the link manually from the download button.",
          variant: "destructive",
        });
      });
  };

  return (
    <div className="space-y-8">
      <PageHeader
        title="File Library"
        description="Browse every file you've uploaded. Download receipts, statements, and exports in seconds."
        children={
          <Button
            onClick={loadFiles}
            className="rounded-full bg-gradient-to-r from-indigo-400 via-sky-400 to-teal-400 px-5 text-white shadow-lg hover:shadow-xl"
          >
            <RefreshCcw className="mr-2 h-4 w-4" /> Refresh
          </Button>
        }
      />

      <Card className="border-none bg-white/70 p-[1px] shadow-2xl shadow-sky-200/60">
        <div className="rounded-3xl bg-gradient-to-br from-white/90 via-white/80 to-white/60">
          <CardHeader className="space-y-3 border-b border-white/60">
            <CardTitle className="flex items-center justify-between text-lg font-semibold text-slate-700">
              <span className="flex items-center gap-2">
                <Cloud className="h-5 w-5 text-sky-500" /> Storage files
              </span>
              <Input
                value={searchTerm}
                onChange={(event) => setSearchTerm(event.target.value)}
                placeholder="Search files"
                className="h-11 w-full max-w-xs rounded-2xl border-none bg-white/80 px-4 text-sm shadow-inner"
              />
            </CardTitle>
          </CardHeader>
          <CardContent className="px-0 py-0">
            {error && (
              <div className="mx-6 mt-4 rounded-3xl border border-dashed border-red-200 bg-red-50/80 p-4 text-sm text-red-600">
                {error}
              </div>
            )}
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="bg-white/70">
                    <TableHead>File</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead className="text-right">Size</TableHead>
                    <TableHead>Updated</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {isLoading ? (
                    <TableRow>
                      <TableCell colSpan={5} className="h-24 text-center text-sm text-slate-500">
                        Loading files...
                      </TableCell>
                    </TableRow>
                  ) : filteredFiles.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={5} className="h-24 text-center text-sm text-slate-500">
                        No files found.
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredFiles.map((file) => (
                      <TableRow key={file.fullPath} className="transition hover:bg-sky-50/70">
                        <TableCell>
                          <div className="flex flex-col">
                            <span className="font-medium text-slate-700">{file.name}</span>
                            <span className="text-xs text-slate-500">{file.fullPath}</span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline" className="rounded-full border-slate-200 text-slate-500">
                            {file.contentType ?? "Unknown"}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right text-sm text-slate-600">{formatSize(file.size)}</TableCell>
                        <TableCell className="text-sm text-slate-600">{formatDate(file.updated)}</TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-2">
                            <Button
                              variant="ghost"
                              size="sm"
                              className="rounded-full border border-slate-200 bg-white/80 px-3 text-slate-600 hover:bg-white"
                              onClick={() => handleCopyLink(file)}
                            >
                              <Copy className="mr-2 h-4 w-4" /> Copy link
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="rounded-full border border-slate-200 bg-white/80 px-3 text-slate-600 hover:bg-white"
                              asChild
                              disabled={!file.url}
                            >
                              <a href={file.url ?? "#"} target="_blank" rel="noopener noreferrer">
                                <ArrowDownToLine className="mr-2 h-4 w-4" /> Download
                              </a>
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </div>
      </Card>
    </div>
  );
}
