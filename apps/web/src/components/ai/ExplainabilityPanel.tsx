"use client";

import React from "react";
import { Dialog, DialogHeader, DialogTitle, DialogDescription, DialogContent, DialogFooter, Button } from "../ui";
import { AiRecommendation } from "../../types/ai";
import { ShieldCheck, Database, FileText, AlertTriangle, ArrowRight, Cpu, BarChart2, Layers } from "lucide-react";

export interface ExplainabilityPanelProps {
  isOpen: boolean;
  recommendation: AiRecommendation | null;
  onClose: () => void;
  onAccept?: (rec: AiRecommendation) => void;
  onReject?: (rec: AiRecommendation) => void;
}

export function ExplainabilityPanel({
  isOpen,
  recommendation,
  onClose,
  onAccept,
  onReject,
}: ExplainabilityPanelProps) {
  if (!recommendation) return null;

  const weights = [
    { source: "GCP Telemetry & Usage Logs", weight: 40 },
    { source: "Customer Care Benchmark Matrix", weight: 35 },
    { source: "Internal Fine-Tuning Evaluation", weight: 25 },
  ];

  return (
    <Dialog isOpen={isOpen} onClose={onClose} className="max-w-3xl w-full">
      <DialogHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold uppercase tracking-wider text-cyan-500 dark:text-cyan-400 px-2 py-0.5 rounded bg-cyan-500/10 border border-cyan-500/20">
              {recommendation.category}
            </span>
            <span className="text-xs font-mono text-muted-foreground">{recommendation.version}</span>
          </div>
          <span className="text-xs font-semibold px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
            +${recommendation.annualSavings.toLocaleString()} / yr
          </span>
        </div>

        <DialogTitle className="text-lg font-bold text-foreground mt-2">
          {recommendation.title}
        </DialogTitle>
        <DialogDescription className="text-xs text-muted-foreground">
          Initiative: <strong className="text-foreground">{recommendation.initiativeName}</strong> • Confidence: <strong className="text-cyan-500 dark:text-cyan-400">{recommendation.confidenceScore}%</strong>
        </DialogDescription>
      </DialogHeader>

      <DialogContent className="space-y-4 py-3 max-h-[70vh] overflow-y-auto pr-1">
        {/* Model Weight & Confidence Breakdown */}
        <div className="p-4 rounded-xl bg-cyan-500/5 border border-cyan-500/25 space-y-2">
          <h4 className="text-xs font-bold text-foreground flex items-center gap-1.5">
            <Cpu className="w-4 h-4 text-cyan-500 dark:text-cyan-400" /> AI Confidence Breakdown & Model Weights
          </h4>
          <div className="space-y-2 pt-1">
            {weights.map((w, idx) => (
              <div key={idx} className="space-y-0.5 text-xs">
                <div className="flex justify-between text-muted-foreground">
                  <span>{w.source}</span>
                  <span className="font-mono font-bold text-foreground">{w.weight}% Weight</span>
                </div>
                <div className="w-full h-1.5 bg-secondary rounded-full overflow-hidden">
                  <div className="h-full bg-gradient-to-r from-cyan-500 to-blue-500 rounded-full" style={{ width: `${w.weight * 2.5}%` }} />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Business, Financial & Technical Drivers */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
          <div className="p-3 rounded-lg bg-secondary/30 border border-border space-y-1">
            <span className="font-bold text-foreground block">Business Drivers</span>
            <p className="text-muted-foreground leading-relaxed text-[11px]">
              Substantial tier-1 ticket volume growth creating SLA bottlenecks during peak hours.
            </p>
          </div>
          <div className="p-3 rounded-lg bg-secondary/30 border border-border space-y-1">
            <span className="font-bold text-foreground block">Financial Drivers</span>
            <p className="text-muted-foreground leading-relaxed text-[11px]">
              Off-peak GPU dedicated node spend can be converted to serverless spot pricing.
            </p>
          </div>
          <div className="p-3 rounded-lg bg-secondary/30 border border-border space-y-1">
            <span className="font-bold text-foreground block">Technical Drivers</span>
            <p className="text-muted-foreground leading-relaxed text-[11px]">
              Llama-3 8B model fits under 14GB RAM while maintaining 96.2% Pass@1 accuracy.
            </p>
          </div>
        </div>

        {/* Operational & Compliance Impact */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
          <div className="p-3 rounded-lg bg-secondary/20 border border-border space-y-1">
            <span className="font-bold text-foreground block">Operational Impact</span>
            <p className="text-muted-foreground leading-relaxed">
              Zero workflow disruption for customer care agents; automated triage operates silently via Zendesk webhook triggers.
            </p>
          </div>
          <div className="p-3 rounded-lg bg-secondary/20 border border-border space-y-1">
            <span className="font-bold text-foreground block">Compliance & Data Privacy Impact</span>
            <p className="text-muted-foreground leading-relaxed">
              PII data masking active on all prompt payloads prior to external inference execution.
            </p>
          </div>
        </div>

        {/* Why? Algorithmic Reasoning */}
        <div className="p-4 rounded-xl bg-secondary/30 border border-border space-y-2">
          <h4 className="text-xs font-bold text-foreground flex items-center gap-1.5">
            <ShieldCheck className="w-4 h-4 text-accent" /> Why? (Algorithmic Reasoning)
          </h4>
          <ul className="space-y-1 text-xs text-muted-foreground list-disc pl-4">
            {recommendation.reasoning.map((r, idx) => (
              <li key={idx}>{r}</li>
            ))}
          </ul>
        </div>

        {/* Limitations & Suggested Validation Steps */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
          <div className="p-3 rounded-lg bg-amber-500/5 border border-amber-500/20 space-y-1">
            <span className="font-bold text-amber-500 block">Model Limitations</span>
            <p className="text-muted-foreground leading-relaxed text-[11px]">
              Minor latency spike (+120ms) possible during unexpected regional traffic spikes.
            </p>
          </div>
          <div className="p-3 rounded-lg bg-emerald-500/5 border border-emerald-500/20 space-y-1">
            <span className="font-bold text-emerald-500 block">Suggested Validation Steps</span>
            <p className="text-muted-foreground leading-relaxed text-[11px]">
              Deploy to staging environment with 5% shadow traffic before full production switch.
            </p>
          </div>
        </div>

        {/* Recommended Action */}
        <div className="p-3 rounded-lg bg-accent/10 border border-accent/30 space-y-1">
          <span className="text-[10px] font-bold uppercase text-accent tracking-wider">Recommended Executive Action</span>
          <p className="text-xs font-semibold text-foreground flex items-center gap-1.5">
            <ArrowRight className="w-3.5 h-3.5 text-accent shrink-0" />
            {recommendation.recommendedAction}
          </p>
        </div>
      </DialogContent>

      <DialogFooter className="flex justify-between items-center sm:justify-between">
        <Button onClick={onClose} variant="secondary" className="text-xs">
          Close Panel
        </Button>

        <div className="flex gap-2">
          {onReject && (
            <Button
              onClick={() => {
                onReject(recommendation);
                onClose();
              }}
              variant="secondary"
              className="text-xs"
            >
              Reject
            </Button>
          )}
          {onAccept && (
            <Button
              onClick={() => {
                onAccept(recommendation);
                onClose();
              }}
              variant="primary"
              className="text-xs"
            >
              Accept Recommendation
            </Button>
          )}
        </div>
      </DialogFooter>
    </Dialog>
  );
}
