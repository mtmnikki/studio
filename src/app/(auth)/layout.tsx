"use client";

import React from "react";

import { FirebaseClientProvider } from "@/firebase";

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <FirebaseClientProvider>
      <div className="min-h-screen bg-[radial-gradient(circle_at_top,_rgba(165,243,252,0.4),_transparent_55%),_linear-gradient(135deg,_rgba(99,102,241,0.35),_rgba(45,212,191,0.3))]">
        {children}
      </div>
    </FirebaseClientProvider>
  );
}
