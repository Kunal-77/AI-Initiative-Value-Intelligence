"use client";

import React from "react";
import Link from "@/compat/link";
import { Sparkles, ArrowLeft, ShieldCheck, Target, TrendingUp } from "lucide-react";
import { Button } from "@/components/ui";

export default function AboutPage() {
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
            <span className="text-xs font-mono tracking-widest uppercase">About the Platform</span>
          </div>
          <h1 className="text-4xl font-bold tracking-tight sm:text-5xl">
            Aligning Enterprise AI with Realized Capital ROI
          </h1>
          <p className="text-muted-foreground leading-relaxed">
            Value Intelligence is a dedicated strategic portfolio command center and governance registry. 
            We provide C-suite executives, financial analysts, and engineering leaders with the tooling to model,
            track, and audit the realized savings and NPV projections of their artificial intelligence investments.
          </p>
        </div>

        <hr className="border-border/40" />

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="p-5 rounded-xl border border-border/60 bg-card/40 space-y-2">
            <Target className="w-5 h-5 text-blue-500" />
            <h3 className="font-bold text-sm">Strategic Alignment</h3>
            <p className="text-[11px] text-muted-foreground leading-relaxed">
              Verify that every active AI model deployment aligns with business area OKRs and strict corporate governance.
            </p>
          </div>

          <div className="p-5 rounded-xl border border-border/60 bg-card/40 space-y-2">
            <TrendingUp className="w-5 h-5 text-emerald-500" />
            <h3 className="font-bold text-sm">Realized Savings</h3>
            <p className="text-[11px] text-muted-foreground leading-relaxed">
              Track multi-provider compute, vector store database licensing, and actual human capital cost offsets in real-time.
            </p>
          </div>

          <div className="p-5 rounded-xl border border-border/60 bg-card/40 space-y-2">
            <ShieldCheck className="w-5 h-5 text-indigo-500" />
            <h3 className="font-bold text-sm">Continuous Audit</h3>
            <p className="text-[11px] text-muted-foreground leading-relaxed">
              Cryptographically secure lifecycle state transitions and ledger logging for compliance and validation controls.
            </p>
          </div>
        </div>

        <div className="p-6 rounded-xl border border-border/60 bg-secondary/20 space-y-3">
          <h2 className="font-bold text-lg">Our Philosophy</h2>
          <p className="text-xs text-muted-foreground leading-relaxed">
            In the modern era of rapid LLM adoption, businesses face unprecedented challenges in separating hype from value. 
            Value Intelligence was founded on the principle that artificial intelligence should be measured by the same rigorous 
            financial standards as any other strategic capital asset. We empower organizations to scale their AI agents and workflows 
            confidently, backed by concrete evidence and auditability.
          </p>
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
