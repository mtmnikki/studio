"use client";

import { useEffect, useMemo, useState } from "react";
import { CloudDownload, FileSpreadsheet, FolderOpen, Loader2, RefreshCw } from "lucide-react";
import { getDownloadURL, getMetadata, getStorage, listAll, ref } from "firebase/storage";

import { PageHeader } from "@/components/page-header";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useToast } from "@/hooks/use-toast";
import { initializeFirebase } from "@/firebase";

interface StorageFile {
  name: string;
  path: string;
  size: number;
  contentType?: string;
  updated?: string;
  downloadUrl: string;
}

const formatBytes = (bytes: number) => {
  if (!bytes) return "0 B";
  const units = ["B", "KB", "MB", "GB", "TB"];
  const index = Math.min(Math.floor(Math.log(bytes) / Math.log(1024)), units.length - 1);
  const value = bytes / Math.pow(1024, index);
  return `${value.toFixed(1)} ${units[index]}`;
};

export default function FilesPage() {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [files, setFiles] = useState<StorageFile[]>([]);
  const [query, setQuery] = useState("");

  const loadFiles = async () => {
    setIsLoading(true);
    try {
      const { firebaseApp } = initializeFirebase();
      const storage = getStorage(firebaseApp);

      const uploadsRef = ref(storage, "uploads");
      const rootRef = ref(storage, "/");

      const snapshot = await listAll(uploadsRef).catch(async () => listAll(rootRef));

      const items = await Promise.all(
        snapshot.items.map(async (item) => {
          const [metadata, downloadUrl] = await Promise.all([
            getMetadata(item),
            getDownloadURL(item),
          ]);

          return {
            name: item.name,
            path: item.fullPath,
            size: metadata.size ?? 0,
            contentType: metadata.contentType ?? undefined,
            updated: metadata.updated ?? metadata.timeCreated,
            downloadUrl,
          } satisfies StorageFile;
        })
      );

      setFiles(items.sort((a, b) => (b.updated ?? "").localeCompare(a.updated ?? "")));
    } catch (error: any) {
      console.error("Failed to load storage files", error);
      toast({
        title: "Unable to load files",
        description: error.message ?? "Please check your Firebase Storage permissions.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    void loadFiles();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const filteredFiles = useMemo(() => {
    const term = query.toLowerCase();
    return files.filter((file) => {
      if (!term) return true;
      return (
        file.name.toLowerCase().includes(term) ||
        file.path.toLowerCase().includes(term) ||
        (file.contentType ?? "").toLowerCase().includes(term)
      );
    });
  }, [files, query]);

  return (
    <>
      <PageHeader
        title="File Library"
        description="Review every CSV, export, and statement you've uploaded into Firebase Storage."
      >
        <Button variant="outline" onClick={() => void loadFiles()} disabled={isLoading}>
          <RefreshCw className="mr-2 h-4 w-4" />
          Refresh
        </Button>
      </PageHeader>

      <div className="grid gap-6">
        <Card className="border-white/40 bg-white/30 shadow-2xl backdrop-blur-xl">
          <CardHeader className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
            <div>
              <CardTitle className="text-2xl text-slate-900">Uploaded files</CardTitle>
              <CardDescription className="text-slate-600">
                Search, preview, and download the data powering your dashboards.
              </CardDescription>
            </div>
            <Input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Search files by name, type, or folder"
              className="max-w-sm rounded-2xl border border-white/60 bg-white/70"
            />
          </CardHeader>
          <CardContent className="pt-0">
            <div className="rounded-3xl border border-white/40 bg-white/50 p-4 shadow-inner">
              <div className="flex flex-wrap items-center gap-3 text-sm text-slate-600">
                <Badge className="bg-gradient-to-r from-indigo-400 via-sky-500 to-teal-300 text-slate-900">
                  <FolderOpen className="mr-1 h-4 w-4" />
                  {files.length} items
                </Badge>
                <Badge variant="outline" className="border-white/60 text-slate-600">
                  Showing {filteredFiles.length} matches
                </Badge>
              </div>
            </div>
          </CardContent>
          <CardContent>
            <ScrollArea className="h-[520px]">
              <div className="rounded-3xl border border-white/40 bg-white/60 shadow-sm">
                <Table>
                  <TableHeader className="bg-gradient-to-r from-indigo-400/20 via-sky-400/20 to-teal-300/20">
                    <TableRow className="border-white/40 text-slate-700">
                      <TableHead className="w-[40%]">File</TableHead>
                      <TableHead>Type</TableHead>
                      <TableHead>Updated</TableHead>
                      <TableHead className="text-right">Size</TableHead>
                      <TableHead className="text-right">Download</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {isLoading && (
                      <TableRow>
                        <TableCell colSpan={5} className="py-12 text-center text-slate-500">
                          <Loader2 className="mx-auto mb-3 h-6 w-6 animate-spin text-sky-500" />
                          Fetching latest uploads...
                        </TableCell>
                      </TableRow>
                    )}
                    {!isLoading && filteredFiles.length === 0 && (
                      <TableRow>
                        <TableCell colSpan={5} className="py-12 text-center text-slate-500">
                          No uploads match your search yet.
                        </TableCell>
                      </TableRow>
                    )}
                    {!isLoading &&
                      filteredFiles.map((file) => (
                        <TableRow key={file.path} className="border-white/30 text-slate-700 transition-colors hover:bg-sky-50/60">
                          <TableCell className="font-medium text-slate-900">
                            <div className="flex items-center gap-3">
                              <FileSpreadsheet className="h-5 w-5 text-sky-500" />
                              <div>
                                <p className="text-sm font-semibold">{file.name}</p>
                                <p className="text-xs text-slate-500">{file.path}</p>
                              </div>
                            </div>
                          </TableCell>
                          <TableCell>{file.contentType || "Unknown"}</TableCell>
                          <TableCell>
                            {file.updated
                              ? new Date(file.updated).toLocaleString()
                              : "—"}
                          </TableCell>
                          <TableCell className="text-right font-medium">
                            {formatBytes(file.size)}
                          </TableCell>
                          <TableCell className="text-right">
                            <Button asChild size="sm" variant="ghost" className="text-sky-600">
                              <a href={file.downloadUrl} target="_blank" rel="noreferrer">
                                <CloudDownload className="mr-2 h-4 w-4" />
                                Download
                              </a>
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                  </TableBody>
                </Table>
              </div>
            </ScrollArea>
          </CardContent>
          <CardFooter className="flex items-center justify-between text-sm text-slate-500">
            <span>Storage items load directly from Firebase in real-time.</span>
            <span className="flex items-center gap-2">
              <Loader2 className={isLoading ? "h-4 w-4 animate-spin text-sky-500" : "h-4 w-4 text-slate-400"} />
              {isLoading ? "Refreshing" : "Up to date"}
            </span>
          </CardFooter>
        </Card>
      </div>
    </>
  );
}
