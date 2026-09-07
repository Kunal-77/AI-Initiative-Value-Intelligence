"use client";

import React from "react";
import { Cpu, PlusCircle, Activity, Zap } from "lucide-react";
import { UsageRecord, Subscription } from "../../types/personal";

export interface AiUsageCardProps {
  usageRecords: UsageRecord[];
  subscriptions: Subscription[];
  onLogClick: () => void;
  loading?: boolean;
}

export function AiUsageCard({
  usageRecords,
  subscriptions,
  onLogClick,
  loading = false,
}: AiUsageCardProps) {
  const hasAiSubs = subscriptions.some((s) => s.subscriptionType === "ai");

  return (
    <div className="rounded-xl border border-[#202630] bg-[#11151C] shadow-md overflow-hidden flex flex-col space-y-4 p-5 sm:p-6 transition-all">
      {/* Header */}
      <div className="flex items-center justify-between gap-3 border-b border-[#202630] pb-3.5">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-lg bg-[#C9A86A]/10 border border-[#C9A86A]/20 text-[#C9A86A]">
            <Cpu className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-[#F4F1EA]">AI Token & Metered Consumption</h3>
            <p className="text-[11px] text-[#8F98A8]">
              Track dynamic API token usage and variable consumption fees
            </p>
          </div>
        </div>

        {hasAiSubs && (
          <button
            onClick={onLogClick}
            className="text-xs h-8 px-3 rounded-lg font-bold bg-[#171C24] text-[#F4F1EA] border border-[#202630] hover:border-[#7DA7D9]/40 hover:bg-[#202630] transition-all flex items-center gap-1.5 cursor-pointer active:scale-[0.98]"
          >
            <PlusCircle className="w-3.5 h-3.5 text-[#7DA7D9]" /> Log Consumption
          </button>
        )}
      </div>

      {/* Content */}
      {loading ? (
        <div className="p-4 space-y-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="h-8 bg-[#171C24] rounded animate-pulse" />
          ))}
        </div>
      ) : usageRecords.length === 0 ? (
        <div className="p-8 text-center text-xs text-[#8F98A8] border border-[#202630] rounded-xl bg-[#0E1116] space-y-1">
          <Zap className="w-6 h-6 text-[#8F98A8] mx-auto mb-2 opacity-50" />
          <span className="font-semibold text-[#F4F1EA] block">No Metered Usage Recorded</span>
          <span>Log token consumption for your active AI subscriptions to track variable compute costs.</span>
        </div>
      ) : (
        <div className="divide-y divide-[#202630] border border-[#202630] rounded-xl overflow-hidden bg-[#0E1116]">
          {usageRecords.map((u) => {
            const sub = subscriptions.find((s) => s.id === u.subscriptionId);
            return (
              <div
                key={u.id}
                className="p-3.5 sm:p-4 flex items-center justify-between gap-3 hover:bg-[#171C24]/50 transition-colors text-xs"
              >
                <div className="space-y-0.5 min-w-0">
                  <span className="font-bold text-[#F4F1EA] block truncate text-xs">
                    {sub?.name || "AI Subscription"}
                  </span>
                  <div className="flex items-center gap-2 text-[10px] text-[#8F98A8] font-mono">
                    <span>{u.usageDate}</span>
                    <span>•</span>
                    <span>
                      {u.quantity.toLocaleString()} {u.unit}
                    </span>
                  </div>
                </div>

                <span className="font-mono font-bold text-sm text-[#7DA7D9] shrink-0">
                  ${u.cost.toFixed(2)}
                </span>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
