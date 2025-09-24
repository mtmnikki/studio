
"use client";

import {
  FileUp,
  Home,
  Users,
  Building2,
  StickyNote,
  Cloud,
} from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import React from "react";

import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Logo } from "@/components/icons";
import { FirebaseClientProvider, useAuth, useUser } from "@/firebase";
import { initiateAnonymousSignIn } from "@/firebase/non-blocking-login";

function AppAuthenticatedLayout({ children }: { children: React.ReactNode }) {
  const auth = useAuth();
  const { user, isUserLoading } = useUser();

  React.useEffect(() => {
    // If user is not logged in and not loading, sign in anonymously.
    if (!user && !isUserLoading) {
      initiateAnonymousSignIn(auth);
    }
  }, [user, isUserLoading, auth]);

  if (isUserLoading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <p>Loading...</p>
      </div>
    );
  }


  const pathname = usePathname();

  const navLinks = [
    { href: "/dashboard", label: "Dashboard", icon: Home },
    { href: "/patients", label: "Patients", icon: Users },
    { href: "/pharmacies", label: "Pharmacies", icon: Building2 },
    { href: "/import", label: "Import Data", icon: FileUp },
    { href: "/notes", label: "Jenn's Notes", icon: StickyNote },
    { href: "/storage", label: "File Library", icon: Cloud },
  ];

  return (
      <div className="flex min-h-screen w-full flex-col bg-transparent">
        <aside className="fixed inset-y-0 left-0 z-20 hidden w-20 flex-col border-r border-white/30 bg-white/40 pb-6 pt-8 shadow-2xl shadow-indigo-200/40 backdrop-blur-2xl sm:flex">
          <nav className="flex flex-1 flex-col items-center gap-6 px-3">
            <Link
              href="/dashboard"
              className="group flex h-12 w-12 items-center justify-center rounded-3xl bg-gradient-to-br from-indigo-500 to-sky-500 text-white shadow-xl shadow-sky-400/40 transition hover:scale-105"
            >
              <Logo className="h-5 w-5 transition-transform group-hover:rotate-6" />
              <span className="sr-only">Jenn's Billing</span>
            </Link>
            <TooltipProvider delayDuration={80}>
              {navLinks.map((item) => {
                const isActive = pathname.startsWith(item.href);
                return (
                  <Tooltip key={item.href}>
                    <TooltipTrigger asChild>
                      <Link
                        href={item.href}
                        className={`flex h-11 w-11 items-center justify-center rounded-2xl border border-white/30 text-slate-600 shadow transition ${
                          isActive
                            ? "bg-gradient-to-br from-indigo-400 to-sky-400 text-white"
                            : "bg-white/40 hover:bg-white/70 hover:text-slate-900"
                        }`}
                      >
                        <item.icon className="h-5 w-5" />
                        <span className="sr-only">{item.label}</span>
                      </Link>
                    </TooltipTrigger>
                    <TooltipContent side="right" className="rounded-xl border border-white/40 bg-white/80 text-slate-600 shadow">
                      {item.label}
                    </TooltipContent>
                  </Tooltip>
                );
              })}
            </TooltipProvider>
          </nav>
        </aside>
        <div className="flex flex-col sm:pl-20">
          <header className="sticky top-0 z-10 border-b border-white/40 bg-white/60 px-4 py-4 shadow-sm shadow-sky-100/60 backdrop-blur">
            <div className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-gradient-to-br from-indigo-400 to-sky-500 text-white shadow-lg">
                  <Logo className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">Jenn's Dream Billing</p>
                  <p className="text-lg font-semibold text-slate-700">Carefully curated statements</p>
                </div>
              </div>
              <nav className="hidden gap-2 md:flex">
                {navLinks.map((item) => {
                  const isActive = pathname.startsWith(item.href);
                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      className={`rounded-full border border-white/50 px-4 py-2 text-sm font-medium shadow-sm transition ${
                        isActive
                          ? "bg-gradient-to-r from-indigo-400 to-sky-500 text-white"
                          : "bg-white/60 text-slate-600 hover:bg-white hover:text-slate-900"
                      }`}
                    >
                      {item.label}
                    </Link>
                  );
                })}
              </nav>
            </div>
          </header>
          <main className="flex-1 p-4 sm:p-8">
            <div className="glass-panel glow-ring min-h-[calc(100vh-7rem)] w-full p-6 sm:p-8">
              {children}
            </div>
          </main>
        </div>
        <nav className="fixed inset-x-4 bottom-4 z-30 flex items-center justify-between rounded-3xl border border-white/40 bg-white/70 px-4 py-3 shadow-2xl shadow-sky-200/50 backdrop-blur md:hidden">
          {navLinks.map((item) => {
            const isActive = pathname.startsWith(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex flex-col items-center gap-1 text-xs font-medium transition ${
                  isActive ? "text-sky-600" : "text-slate-500 hover:text-slate-700"
                }`}
              >
                <item.icon className="h-5 w-5" />
                {item.label.split(" ")[0]}
              </Link>
            );
          })}
        </nav>
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
