"use client";

import React from "react";
import Link from "@/compat/link";
import { Sparkles, ArrowLeft, Mail, Globe, MapPin } from "lucide-react";
import { Button } from "@/components/ui";

export default function ContactPage() {
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
            <span className="text-xs font-mono tracking-widest uppercase">Contact Developer Team</span>
          </div>
          <h1 className="text-4xl font-bold tracking-tight sm:text-5xl">
            Get in Touch
          </h1>
          <p className="text-muted-foreground leading-relaxed">
            Have questions about integrating Value Intelligence into your enterprise infrastructure, custom LLM routing setups, or security configurations? Let us know.
          </p>
        </div>

        <hr className="border-border/40" />

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="p-5 rounded-xl border border-border/60 bg-card/40 space-y-3">
            <Mail className="w-5 h-5 text-blue-500" />
            <h3 className="font-bold text-sm">Developer Support</h3>
            <p className="text-[11px] text-muted-foreground leading-relaxed">
              support@valueintel.ai
            </p>
          </div>

          <div className="p-5 rounded-xl border border-border/60 bg-card/40 space-y-3">
            <Globe className="w-5 h-5 text-emerald-500" />
            <h3 className="font-bold text-sm">API Observability</h3>
            <p className="text-[11px] text-muted-foreground leading-relaxed">
              https://valueintel.ai/docs
            </p>
          </div>

          <div className="p-5 rounded-xl border border-border/60 bg-card/40 space-y-3">
            <MapPin className="w-5 h-5 text-indigo-500" />
            <h3 className="font-bold text-sm">Headquarters</h3>
            <p className="text-[11px] text-muted-foreground leading-relaxed">
              San Francisco, CA
            </p>
          </div>
        </div>

        <div className="p-6 rounded-xl border border-border/60 bg-secondary/20 space-y-3">
          <h2 className="font-bold text-lg">Enterprise Demands</h2>
          <p className="text-xs text-muted-foreground leading-relaxed">
            For custom deployment requests, single-tenant hosting contracts, SOC2 compliance audits, or bespoke capability mappings, please contact our core engineering team directly at engineering@valueintel.ai.
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
