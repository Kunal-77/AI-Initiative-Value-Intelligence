"use client";

import React from "react";
import { Dialog, DialogHeader, DialogTitle, DialogDescription, DialogContent, DialogFooter, Button } from "../ui";
import { AiRecommendation } from "../../types/ai";
import { ShieldCheck, Database, FileText, AlertTriangle, ArrowRight, Cpu, BarChart2, Layers, CheckCircle, Sparkles } from "lucide-react";

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
    <Dialog isOpen={isOpen} onClose={onClose} className="max-w-3xl w-full border border-[#202630] bg-[#11151C]/95 backdrop-blur-xl shadow-2xl">
      <DialogHeader className="border-b border-[#202630] pb-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold uppercase tracking-wider text-[#7DA7D9] px-2.5 py-1 rounded-full bg-[#7DA7D9]/10 border border-[#7DA7D9]/30 font-mono">
              {recommendation.category}
            </span>
            <span className="text-xs font-mono text-[#8F98A8]">{recommendation.version}</span>
          </div>
          <span className="text-xs font-bold font-mono px-2.5 py-1 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
            +${recommendation.annualSavings.toLocaleString()} / yr
          </span>
        </div>

        <DialogTitle className="text-lg font-bold text-[#F4F1EA] mt-3 flex items-center gap-2">
          <Sparkles className="w-5 h-5 text-[#7DA7D9] shrink-0" />
          {recommendation.title}
        </DialogTitle>
        <DialogDescription className="text-xs text-[#8F98A8] flex items-center gap-3 mt-1">
          <span>Initiative: <strong className="text-[#F4F1EA]">{recommendation.initiativeName}</strong></span>
          <span>•</span>
          <span>Confidence: <strong className="text-[#7DA7D9] font-mono">{recommendation.confidenceScore}%</strong></span>
        </DialogDescription>
      </DialogHeader>

      <DialogContent className="space-y-4 py-4 max-h-[70vh] overflow-y-auto pr-1">
        {/* Model Weight & Confidence Breakdown */}
        <div className="p-4 rounded-xl bg-[#7DA7D9]/5 border border-[#7DA7D9]/25 space-y-3">
          <h4 className="text-xs font-bold text-[#F4F1EA] flex items-center gap-1.5">
            <Cpu className="w-4 h-4 text-[#7DA7D9]" /> AI Confidence Breakdown & Model Weights
          </h4>
          <div className="space-y-2.5 pt-1">
            {weights.map((w, idx) => (
              <div key={idx} className="space-y-1 text-xs">
                <div className="flex justify-between text-[#8F98A8]">
                  <span>{w.source}</span>
                  <span className="font-mono font-bold text-[#7DA7D9]">{w.weight}% Weight</span>
                </div>
                <div className="w-full h-1.5 bg-[#0E1116] rounded-full overflow-hidden border border-[#202630]">
                  <div className="h-full bg-gradient-to-r from-[#4F759B] to-[#7DA7D9] rounded-full" style={{ width: `${w.weight * 2.5}%` }} />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Business, Financial & Technical Drivers */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
          <div className="p-3.5 rounded-xl bg-[#171C24] border border-[#202630] space-y-1">
            <span className="font-bold text-[#F4F1EA] block">Business Drivers</span>
            <p className="text-[#8F98A8] leading-relaxed text-[11px]">
              Substantial tier-1 ticket volume growth creating SLA bottlenecks during peak hours.
            </p>
          </div>
          <div className="p-3.5 rounded-xl bg-[#171C24] border border-[#202630] space-y-1">
            <span className="font-bold text-[#F4F1EA] block">Financial Drivers</span>
            <p className="text-[#8F98A8] leading-relaxed text-[11px]">
              Off-peak GPU dedicated node spend can be converted to serverless spot pricing.
            </p>
          </div>
          <div className="p-3.5 rounded-xl bg-[#171C24] border border-[#202630] space-y-1">
            <span className="font-bold text-[#F4F1EA] block">Technical Drivers</span>
            <p className="text-[#8F98A8] leading-relaxed text-[11px]">
              Llama-3 8B model fits under 14GB RAM while maintaining 96.2% Pass@1 accuracy.
            </p>
          </div>
        </div>

        {/* Operational & Compliance Impact */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
          <div className="p-3.5 rounded-xl bg-[#171C24]/60 border border-[#202630] space-y-1">
            <span className="font-bold text-[#F4F1EA] block">Operational Impact</span>
            <p className="text-[#8F98A8] leading-relaxed text-[11px]">
              Zero workflow disruption for customer care agents; automated triage operates silently via Zendesk webhook triggers.
            </p>
          </div>
          <div className="p-3.5 rounded-xl bg-[#171C24]/60 border border-[#202630] space-y-1">
            <span className="font-bold text-[#F4F1EA] block">Compliance & Data Privacy Impact</span>
            <p className="text-[#8F98A8] leading-relaxed text-[11px]">
              PII data masking active on all prompt payloads prior to external inference execution.
            </p>
          </div>
        </div>

        {/* Why? Algorithmic Reasoning */}
        <div className="p-4 rounded-xl bg-[#171C24] border border-[#202630] space-y-2">
          <h4 className="text-xs font-bold text-[#F4F1EA] flex items-center gap-1.5">
            <ShieldCheck className="w-4 h-4 text-[#7DA7D9]" /> Why? (Algorithmic Reasoning)
          </h4>
          <ul className="space-y-1 text-xs text-[#8F98A8] list-disc pl-4">
            {recommendation.reasoning.map((r, idx) => (
              <li key={idx} className="leading-relaxed">{r}</li>
            ))}
          </ul>
        </div>

        {/* Limitations & Suggested Validation Steps */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
          <div className="p-3.5 rounded-xl bg-amber-500/5 border border-amber-500/20 space-y-1">
            <span className="font-bold text-amber-400 block">Model Limitations</span>
            <p className="text-[#8F98A8] leading-relaxed text-[11px]">
              Minor latency spike (+120ms) possible during unexpected regional traffic spikes.
            </p>
          </div>
          <div className="p-3.5 rounded-xl bg-emerald-500/5 border border-emerald-500/20 space-y-1">
            <span className="font-bold text-emerald-400 block">Suggested Validation Steps</span>
            <p className="text-[#8F98A8] leading-relaxed text-[11px]">
              Deploy to staging environment with 5% shadow traffic before full production switch.
            </p>
          </div>
        </div>

        {/* Recommended Action */}
        <div className="p-3.5 rounded-xl bg-[#7DA7D9]/10 border border-[#7DA7D9]/30 space-y-1">
          <span className="text-[10px] font-mono font-bold uppercase text-[#7DA7D9] tracking-wider">Recommended Executive Action</span>
          <p className="text-xs font-semibold text-[#F4F1EA] flex items-center gap-2">
            <ArrowRight className="w-4 h-4 text-[#7DA7D9] shrink-0" />
            {recommendation.recommendedAction}
          </p>
        </div>
      </DialogContent>

      <DialogFooter className="flex justify-between items-center sm:justify-between border-t border-border/60 pt-4">
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
              className="text-xs hover:text-rose-400 hover:border-rose-500/40"
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
