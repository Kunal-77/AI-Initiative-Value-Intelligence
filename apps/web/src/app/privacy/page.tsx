"use client";

import React from "react";
import Link from "@/compat/link";
import { Sparkles, ArrowLeft, Shield } from "lucide-react";
import { Button } from "@/components/ui";

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-background text-foreground font-sans flex flex-col relative overflow-hidden">
      <div className="absolute inset-0 bg-dot-pattern opacity-[0.035] pointer-events-none z-0" />
      <div className="hero-gradient-mesh absolute top-[-10%] left-1/2 -translate-x-1/2 w-[1100px] h-[650px] pointer-events-none opacity-40 z-0" />

      {/* Header */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-background/70 backdrop-blur-md border-b border-border/40">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2.5 group">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center shadow-lg">
              <span className="font-extrabold text-sm text-white">V</span>
            </div>
            <span className="font-bold tracking-tight text-sm text-foreground">Value Intelligence</span>
          </Link>
          <Link href="/">
            <Button variant="secondary" className="text-xs">
              <ArrowLeft className="w-3.5 h-3.5 mr-1" />
              Back to Home
            </Button>
          </Link>
        </div>
      </header>

      {/* Content */}
      <main className="flex-1 max-w-3xl mx-auto px-6 pt-32 pb-20 relative z-10 space-y-12">
        <div className="space-y-4">
          <div className="flex items-center gap-2 text-primary">
            <Sparkles className="w-4 h-4" />
            <span className="text-xs font-mono tracking-widest uppercase">Compliance & Privacy</span>
          </div>
          <h1 className="text-4xl font-bold tracking-tight sm:text-5xl">
            Data Privacy & Security Policies
          </h1>
          <p className="text-muted-foreground leading-relaxed">
            At Value Intelligence, security is built into our architecture. We are committed to protecting corporate portfolios and financial audit ledgers through enterprise-grade data isolation guidelines.
          </p>
        </div>

        <hr className="border-border/40" />

        <div className="space-y-6 text-xs text-muted-foreground leading-relaxed">
          <div className="space-y-2">
            <h2 className="text-sm font-bold text-foreground flex items-center gap-2">
              <Shield className="w-4 h-4 text-blue-500" />
              1. Row Level Security & Multi-Tenancy
            </h2>
            <p>
              We enforce strict multi-tenant separation. Your organization's data, model metrics, cost logs, and budget indicators are safeguarded using Postgres Row Level Security (RLS) policies scoped by active organization identifiers validated through Clerk identity tokens.
            </p>
          </div>

          <div className="space-y-2">
            <h2 className="text-sm font-bold text-foreground flex items-center gap-2">
              <Shield className="w-4 h-4 text-emerald-500" />
              2. Credentials & Token Safeguards
            </h2>
            <p>
              Value Intelligence does not store LLM provider API credentials in plain text. Integrations, keys, and tokens are encrypted at rest using industry-standard KMS envelopes. Developer and user secrets are never logged or exposed via API discovery routes.
            </p>
          </div>

          <div className="space-y-2">
            <h2 className="text-sm font-bold text-foreground flex items-center gap-2">
              <Shield className="w-4 h-4 text-indigo-500" />
              3. Compliance Audits
            </h2>
            <p>
              Strategic initiatives lifecycle updates and cost mappings are cryptographically signed to build a tamper-resistant governance trail. Security posture scans, container vulnerability assessments, and compliance health logs are conducted continuously to maintain alignment with SOC2 framework specifications.
            </p>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-border bg-card text-card-foreground py-8">
        <div className="max-w-7xl mx-auto px-6 text-center text-[10px] text-muted-foreground">
          © 2026 AI Initiative Value Intelligence. All rights reserved.
        </div>
      </footer>
    </div>
  );
}
