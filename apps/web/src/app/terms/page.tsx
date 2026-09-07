"use client";

import React from "react";
import Link from "@/compat/link";
import { Sparkles, ArrowLeft, Scale, Shield, AlertCircle, FileText } from "lucide-react";
import { Button } from "@/components/ui";

export default function TermsPage() {
  React.useEffect(() => {
    document.title = "Terms of Service & Usage Disclosures | AIVI";
  }, []);

  return (
    <div className="min-h-screen bg-background text-foreground font-sans flex flex-col relative overflow-hidden">
      <div className="absolute inset-0 bg-dot-pattern opacity-[0.035] pointer-events-none z-0" />
      <div className="hero-gradient-mesh absolute top-[-10%] left-1/2 -translate-x-1/2 w-[1100px] h-[650px] pointer-events-none opacity-40 z-0" />

      {/* Header */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-background/70 backdrop-blur-md border-b border-border/40">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2.5 group">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-[#7DA7D9] to-[#4F759B] flex items-center justify-center shadow-lg">
              <span className="font-extrabold text-sm text-[#0B0D11]">V</span>
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
          <div className="flex items-center gap-2 text-[#7DA7D9]">
            <Sparkles className="w-4 h-4" />
            <span className="text-xs font-mono tracking-widest uppercase">Terms & Disclosures</span>
          </div>
          <h1 className="text-4xl font-bold tracking-tight sm:text-5xl">
            Terms of Service & Usage Disclosures
          </h1>
          <p className="text-muted-foreground leading-relaxed">
            These terms govern your access to and use of the Value Intelligence platform across both Business and Personal workspace environments.
          </p>
        </div>

        <hr className="border-border/40" />

        <div className="space-y-8 text-xs text-muted-foreground leading-relaxed">
          {/* Section 1 */}
          <div className="space-y-2">
            <h2 className="text-sm font-bold text-foreground flex items-center gap-2">
              <Scale className="w-4 h-4 text-[#7DA7D9]" />
              1. Platform Purpose & Strategic Scope
            </h2>
            <p>
              Value Intelligence (AIVI) provides decision-support software, portfolio ROI models, governance stage-gate reviews, and subscription commitment intelligence. The platform delivers analytical estimates, NPV calculations, and AI decision insights to assist executives and researchers in evaluating software capital expenditures.
            </p>
          </div>

          {/* Section 2: Important Demo Disclosure */}
          <div className="p-5 rounded-xl border border-[#C9A86A]/30 bg-[#C9A86A]/5 space-y-3">
            <h2 className="text-sm font-bold text-[#C9A86A] flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-[#C9A86A]" />
              2. Simulated & Demo Financial Connection Disclosure
            </h2>
            <p className="text-[#F4F1EA]">
              The Personal Workspace bank connection integration is provided under a simulated financial provider architecture for demonstration, testing, and prototype management. No real bank accounts or credentials are held, transferred, or charged through the simulated connector. Ingested transactions, merchant normalization, and cadence detections in demo mode operate solely on deterministic test fixtures.
            </p>
          </div>

          {/* Section 3 */}
          <div className="space-y-2">
            <h2 className="text-sm font-bold text-foreground flex items-center gap-2">
              <Shield className="w-4 h-4 text-emerald-500" />
              3. AI Usage & Decision Intelligence
            </h2>
            <p>
              Recommendations, risk scores, and scenario comparisons produced by the AI Value Studio are grounded in uploaded initiative parameters, financial ledgers, and telemetry inputs. These outputs represent analytical projections and do not constitute certified accounting, financial auditing, or legal advice.
            </p>
          </div>

          {/* Section 4 */}
          <div className="space-y-2">
            <h2 className="text-sm font-bold text-foreground flex items-center gap-2">
              <FileText className="w-4 h-4 text-[#7DA7D9]" />
              4. User Isolation & Workspace Governance
            </h2>
            <p>
              Users maintain distinct isolation boundaries between their individual personal workspaces and organizational business workspaces. Personal data, registered payment instruments, and API usage records are isolated per user identity, while enterprise initiatives and financial approval streams remain strictly bound to their respective organization identifier via Postgres Row Level Security (RLS).
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
