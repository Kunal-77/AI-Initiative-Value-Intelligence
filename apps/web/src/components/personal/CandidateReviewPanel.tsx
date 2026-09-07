"use client";

import React, { useState } from "react";
import {
  Sparkles,
  Check,
  X,
  Calendar,
  Layers,
  ArrowRight,
  TrendingUp,
  ShieldCheck,
  CheckCircle2,
} from "lucide-react";
import { SubscriptionCandidate } from "../../types/personal";
import { cn } from "../ui/cn";

export interface CandidateReviewPanelProps {
  candidates: SubscriptionCandidate[];
  onConfirm: (candidateId: string) => Promise<void>;
  onDismiss: (candidateId: string) => Promise<void>;
  isProcessing?: boolean;
}

export function CandidateReviewPanel({
  candidates,
  onConfirm,
  onDismiss,
  isProcessing = false,
}: CandidateReviewPanelProps) {
  const [actingId, setActingId] = useState<string | null>(null);
  const [actionType, setActionType] = useState<"confirm" | "dismiss" | null>(null);
  const [successToast, setSuccessToast] = useState<string | null>(null);

  if (!candidates || candidates.length === 0) {
    return null;
  }

  const handleConfirm = async (cand: SubscriptionCandidate) => {
    setActingId(cand.id);
    setActionType("confirm");
    try {
      await onConfirm(cand.id);
      setSuccessToast(`Confirmed "${cand.merchantName}" as active subscription!`);
      setTimeout(() => setSuccessToast(null), 3500);
    } catch (err: any) {
      alert(err.message || "Failed to confirm candidate.");
    } finally {
      setActingId(null);
      setActionType(null);
    }
  };

  const handleDismiss = async (cand: SubscriptionCandidate) => {
    setActingId(cand.id);
    setActionType("dismiss");
    try {
      await onDismiss(cand.id);
      setSuccessToast(`Dismissed "${cand.merchantName}".`);
      setTimeout(() => setSuccessToast(null), 3000);
    } catch (err: any) {
      alert(err.message || "Failed to dismiss candidate.");
    } finally {
      setActingId(null);
      setActionType(null);
    }
  };

  return (
    <section className="rounded-xl border border-[#C9A86A]/30 bg-[#11151C] shadow-lg overflow-hidden relative transition-all">
      {/* Top Banner Header */}
      <div className="px-5 py-4 bg-[#C9A86A]/10 border-b border-[#C9A86A]/20 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-lg bg-[#C9A86A]/20 text-[#C9A86A] shadow-xs">
            <Sparkles className="w-4 h-4 animate-pulse" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-sm font-bold text-[#F4F1EA]">Recurring Candidates Detected</h3>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-extrabold bg-[#C9A86A] text-[#0B0D11]">
                {candidates.length} PENDING
              </span>
            </div>
            <p className="text-[11px] text-[#8F98A8]">
              Deterministic recurring cadences discovered in your ingested statements. Confirm to add to your ledger.
            </p>
          </div>
        </div>

        {successToast && (
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-md bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 text-xs font-semibold animate-in fade-in">
            <CheckCircle2 className="w-3.5 h-3.5" />
            {successToast}
          </div>
        )}
      </div>

      {/* Candidate Cards Grid */}
      <div className="p-4 sm:p-5 grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        {candidates.map((cand) => {
          const isBusy = actingId === cand.id;

          return (
            <div
              key={cand.id}
              className="rounded-xl border border-[#202630] bg-[#0E1116] p-4 flex flex-col justify-between gap-4 hover:border-[#7DA7D9]/40 transition-all duration-200 shadow-sm relative group"
            >
              {/* Card Header */}
              <div className="space-y-2.5">
                <div className="flex items-start justify-between gap-2">
                  <div className="space-y-0.5 min-w-0">
                    <span className="text-sm font-bold text-[#F4F1EA] block truncate group-hover:text-[#7DA7D9] transition-colors">
                      {cand.merchantName}
                    </span>
                    <span className="text-[10px] font-mono text-[#8F98A8] uppercase tracking-wider">
                      Category: {cand.category}
                    </span>
                  </div>

                  <div className="flex flex-col items-end shrink-0">
                    <span className="text-sm font-bold font-mono text-[#F4F1EA]">
                      ${cand.amount.toFixed(2)}
                    </span>
                    <span className="text-[10px] font-mono text-[#8F98A8] lowercase">
                      / {cand.billingFrequency === "ANNUAL" ? "year" : "month"}
                    </span>
                  </div>
                </div>

                {/* Telemetry metadata pill row */}
                <div className="grid grid-cols-2 gap-2 text-[10px] font-mono pt-2 border-t border-[#202630]">
                  <div className="space-y-0.5">
                    <span className="text-[#8F98A8] block">Date Span</span>
                    <span className="text-[#D9DEE7] truncate block">
                      {cand.firstTransactionDate} → {cand.lastTransactionDate}
                    </span>
                  </div>

                  <div className="space-y-0.5 text-right">
                    <span className="text-[#8F98A8] block">Next Projected</span>
                    <span className="text-[#C9A86A] font-bold block">
                      {cand.nextExpectedDate || "In ~30 days"}
                    </span>
                  </div>
                </div>

                {/* Confidence Bar */}
                <div className="pt-1 flex items-center justify-between gap-2 text-[10px] font-mono">
                  <span className="text-[#8F98A8] flex items-center gap-1">
                    <TrendingUp className="w-3 h-3 text-[#7DA7D9]" /> Confidence:
                  </span>
                  <div className="flex items-center gap-1.5">
                    <div className="w-16 h-1.5 rounded-full bg-[#171C24] overflow-hidden">
                      <div
                        className="h-full bg-linear-to-r from-[#7DA7D9] to-emerald-400"
                        style={{ width: `${cand.confidenceScore}%` }}
                      />
                    </div>
                    <span className="font-bold text-[#F4F1EA]">{cand.confidenceScore}%</span>
                  </div>
                </div>
              </div>

              {/* Action Buttons Row */}
              <div className="flex gap-2 pt-2 border-t border-[#202630]">
                <button
                  onClick={() => handleConfirm(cand)}
                  disabled={isBusy || isProcessing}
                  className="flex-1 text-xs h-8 px-3 rounded-lg font-bold bg-[#C9A86A] hover:bg-[#D4B87D] text-[#0B0D11] transition-all flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50 active:scale-[0.98] shadow-sm"
                >
                  <Check className="w-3.5 h-3.5" />
                  {isBusy && actionType === "confirm" ? "Confirming..." : "Confirm"}
                </button>

                <button
                  onClick={() => handleDismiss(cand)}
                  disabled={isBusy || isProcessing}
                  className="text-xs h-8 px-3 rounded-lg font-bold text-[#8F98A8] hover:text-rose-400 hover:bg-rose-950/20 border border-[#202630] hover:border-rose-500/30 transition-all flex items-center justify-center gap-1 cursor-pointer disabled:opacity-50 active:scale-[0.98]"
                  title="Dismiss candidate"
                >
                  <X className="w-3.5 h-3.5" />
                  <span>Dismiss</span>
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
