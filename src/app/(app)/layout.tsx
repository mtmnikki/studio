
"use client";

import {
  FileUp,
  FolderOpen,
  Home,
  NotebookPen,
  Users,
  Building2,
  LogOut,
} from "lucide-react";
import Link from "next/link";
import React from "react";
import { usePathname, useRouter } from "next/navigation";
import { signOut } from "firebase/auth";

import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Logo } from "@/components/icons";
import { Button } from "@/components/ui/button";
import { FirebaseClientProvider, useAuth, useUser } from "@/firebase";
import { useToast } from "@/hooks/use-toast";

function AppAuthenticatedLayout({ children }: { children: React.ReactNode }) {
  const auth = useAuth();
  const { user, isUserLoading } = useUser();
  const router = useRouter();
  const pathname = usePathname();
  const { toast } = useToast();
  const [isSigningOut, setIsSigningOut] = React.useState(false);

  React.useEffect(() => {
    if (!isUserLoading && !user) {
      const redirectTarget = pathname && pathname !== "/" ? pathname : "/dashboard";
      router.replace(`/login?redirect=${encodeURIComponent(redirectTarget)}`);
    }
  }, [isUserLoading, user, pathname, router]);

  const handleSignOut = React.useCallback(async () => {
    if (!auth || isSigningOut) return;

    setIsSigningOut(true);
    try {
      await signOut(auth);
      toast({
        title: "Signed out",
        description: "You have been signed out of Jenn's Billing Studio.",
      });
      router.replace("/login");
    } catch (error) {
      console.error("Failed to sign out", error);
      toast({
        title: "Unable to sign out",
        description:
          error instanceof Error
            ? error.message
            : "Please refresh the page and try again.",
        variant: "destructive",
      });
    } finally {
      setIsSigningOut(false);
    }
  }, [auth, isSigningOut, toast, router]);

  if (isUserLoading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <p>Loading...</p>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="flex h-screen items-center justify-center bg-[radial-gradient(circle_at_top,_rgba(165,243,252,0.35),_transparent_60%),_linear-gradient(135deg,_rgba(99,102,241,0.25),_rgba(20,184,166,0.25))]">
        <p className="rounded-full bg-white/70 px-4 py-2 text-sm text-slate-600 shadow">Redirecting to login…</p>
      </div>
    );
  }
  return (
    <div className="relative flex min-h-screen w-full flex-col bg-[radial-gradient(circle_at_top,_rgba(165,243,252,0.35),_transparent_60%),_linear-gradient(135deg,_rgba(99,102,241,0.25),_rgba(20,184,166,0.25))]">
        <aside className="fixed inset-y-0 left-0 z-20 hidden w-20 flex-col border-r border-white/30 bg-white/20 pb-6 pt-5 shadow-xl backdrop-blur-xl sm:flex">
          <nav className="flex h-full flex-col items-center gap-6">
            <Link
              href="/dashboard"
              className="group flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-indigo-500 via-sky-500 to-teal-400 text-lg font-semibold text-white shadow-lg transition-all hover:shadow-2xl"
            >
              <Logo className="h-6 w-6 transition-transform group-hover:scale-110" />
              <span className="sr-only">Jenn's Billing Studio</span>
            </Link>
            <TooltipProvider delayDuration={100}>
              <div className="flex flex-1 flex-col items-center gap-3">
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Link
                      href="/dashboard"
                      className="flex h-11 w-11 items-center justify-center rounded-xl bg-white/40 text-slate-700 shadow-sm transition-all hover:translate-x-1 hover:bg-white/70 hover:text-slate-900"
                    >
                      <Home className="h-5 w-5" />
                      <span className="sr-only">Dashboard</span>
                    </Link>
                  </TooltipTrigger>
                  <TooltipContent side="right">Dashboard</TooltipContent>
                </Tooltip>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Link
                      href="/patients"
                      className="flex h-11 w-11 items-center justify-center rounded-xl bg-white/40 text-slate-700 shadow-sm transition-all hover:translate-x-1 hover:bg-white/70 hover:text-slate-900"
                    >
                      <Users className="h-5 w-5" />
                      <span className="sr-only">Patients</span>
                    </Link>
                  </TooltipTrigger>
                  <TooltipContent side="right">Patients</TooltipContent>
                </Tooltip>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Link
                      href="/pharmacies"
                      className="flex h-11 w-11 items-center justify-center rounded-xl bg-white/40 text-slate-700 shadow-sm transition-all hover:translate-x-1 hover:bg-white/70 hover:text-slate-900"
                    >
                      <Building2 className="h-5 w-5" />
                      <span className="sr-only">Pharmacies</span>
                    </Link>
                  </TooltipTrigger>
                  <TooltipContent side="right">Pharmacies</TooltipContent>
                </Tooltip>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Link
                      href="/notes"
                      className="flex h-11 w-11 items-center justify-center rounded-xl bg-white/40 text-slate-700 shadow-sm transition-all hover:translate-x-1 hover:bg-white/70 hover:text-slate-900"
                    >
                      <NotebookPen className="h-5 w-5" />
                      <span className="sr-only">Notes</span>
                    </Link>
                  </TooltipTrigger>
                  <TooltipContent side="right">Notes</TooltipContent>
                </Tooltip>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Link
                      href="/files"
                      className="flex h-11 w-11 items-center justify-center rounded-xl bg-white/40 text-slate-700 shadow-sm transition-all hover:translate-x-1 hover:bg-white/70 hover:text-slate-900"
                    >
                      <FolderOpen className="h-5 w-5" />
                      <span className="sr-only">Files</span>
                    </Link>
                  </TooltipTrigger>
                  <TooltipContent side="right">Files</TooltipContent>
                </Tooltip>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Link
                      href="/import"
                      className="mt-auto flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-500 via-sky-500 to-teal-400 text-white shadow-lg transition-all hover:translate-x-1 hover:shadow-xl"
                    >
                      <FileUp className="h-5 w-5" />
                      <span className="sr-only">Import</span>
                    </Link>
                  </TooltipTrigger>
                  <TooltipContent side="right">Import data</TooltipContent>
                </Tooltip>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <button
                      type="button"
                      onClick={handleSignOut}
                      disabled={isSigningOut}
                      className="mt-2 flex h-11 w-11 items-center justify-center rounded-xl bg-white/40 text-slate-700 shadow-sm transition-all hover:translate-x-1 hover:bg-white/70 hover:text-slate-900 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      <LogOut className="h-5 w-5" />
                      <span className="sr-only">Log out</span>
                    </button>
                  </TooltipTrigger>
                  <TooltipContent side="right">Log out</TooltipContent>
                </Tooltip>
              </div>
            </TooltipProvider>
          </nav>
        </aside>
        <div className="flex flex-col sm:pl-20">
          <div className="sticky top-0 z-10 flex items-center justify-between gap-3 bg-white/70 px-4 py-3 shadow-lg backdrop-blur-lg sm:hidden">
            <Link href="/dashboard" className="flex items-center gap-2 text-sm font-semibold text-slate-700">
              <Logo className="h-5 w-5" />
              Jenn's Billing
            </Link>
            <div className="flex items-center gap-2 text-xs font-semibold text-slate-600">
              <Link href="/patients" className="rounded-full bg-white/80 px-3 py-1 shadow">Patients</Link>
              <Link href="/pharmacies" className="rounded-full bg-white/80 px-3 py-1 shadow">Pharmacies</Link>
              <Link href="/notes" className="rounded-full bg-white/80 px-3 py-1 shadow">Notes</Link>
              <Link href="/files" className="rounded-full bg-white/80 px-3 py-1 shadow">Files</Link>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={handleSignOut}
              disabled={isSigningOut}
              className="text-xs"
            >
              Log out
            </Button>
          </div>
          <main className="relative flex-1 space-y-6 p-4 sm:p-8">
            <div className="absolute inset-0 -z-10 bg-[radial-gradient(circle_at_top,_rgba(59,130,246,0.15),_transparent_55%)]" />
            <div className="absolute inset-0 -z-20 bg-[radial-gradient(circle_at_bottom,_rgba(20,184,166,0.15),_transparent_55%)]" />
            <div className="relative space-y-6">
              {children}
            </div>
          </main>
        </div>
    </div>
  );
}


export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <FirebaseClientProvider>
      <AppAuthenticatedLayout>{children}</AppAuthenticatedLayout>
    </FirebaseClientProvider>
  );
}
