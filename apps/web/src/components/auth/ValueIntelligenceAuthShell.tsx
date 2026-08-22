"use client";

import React from "react";
import { ThemeToggle } from "../ui/ThemeToggle";

interface ValueIntelligenceAuthShellProps {
  children: React.ReactNode;
}

export function ValueIntelligenceAuthShell({ children }: ValueIntelligenceAuthShellProps) {
  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col justify-between font-sans relative overflow-hidden transition-colors duration-300">
      {/* Background Decorative Gradients */}
      <div className="absolute top-[-20%] left-[-10%] w-[60%] h-[60%] bg-blue-900/5 dark:bg-blue-950/25 rounded-full blur-[150px] pointer-events-none" />
      <div className="absolute bottom-[-20%] right-[-10%] w-[60%] h-[60%] bg-indigo-950/5 dark:bg-blue-900/15 rounded-full blur-[150px] pointer-events-none" />

      {/* Header with Theme Toggle */}
      <header className="w-full max-w-7xl mx-auto px-6 py-4 flex items-center justify-end relative z-10">
        <ThemeToggle />
      </header>

      {/* Main Authentication Card */}
      <main className="flex-1 flex flex-col items-center justify-center px-4 py-8 relative z-10">
        <div className="w-full max-w-md space-y-6">
          <div className="rounded-2xl border border-border bg-card p-6 sm:p-8 shadow-lg backdrop-blur-xs relative overflow-hidden transition-all duration-300">
            {children}
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="w-full max-w-7xl mx-auto px-6 py-6 text-center text-[10px] text-muted-foreground border-t border-border/40 relative z-10">
        © 2026 AI Initiative Value Intelligence. All rights reserved. Secure, Clerk-verified C-Suite decision context.
      </footer>
    </div>
  );
}
