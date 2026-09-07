"use client";

import React from "react";
import { Calendar, Clock, AlertTriangle, CheckCircle2, ChevronRight } from "lucide-react";
import { RenewalSchedule, Subscription } from "../../types/personal";
import { cn } from "../ui/cn";

export interface RenewalTimelineCardProps {
  renewals: RenewalSchedule[];
  subscriptions: Subscription[];
  loading?: boolean;
}

export function RenewalTimelineCard({ renewals, subscriptions, loading = false }: RenewalTimelineCardProps) {
  // Sort renewals chronologically
  const sortedRenewals = [...renewals].sort(
    (a, b) => new Date(a.renewalDate).getTime() - new Date(b.renewalDate).getTime()
  );

  const getDaysRemaining = (renewalDateStr: string) => {
    const renDate = new Date(renewalDateStr);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    renDate.setHours(0, 0, 0, 0);
    const diff = Math.ceil((renDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
    return diff;
  };

  const totalUpcomingAmount = sortedRenewals.reduce((sum, item) => {
    const sub = subscriptions.find((s) => s.id === item.subscriptionId);
    return sum + (sub?.costAmount || 0);
  }, 0);

  return (
    <div className="rounded-xl border border-[#202630] bg-[#11151C] shadow-md overflow-hidden flex flex-col space-y-4 p-5 sm:p-6 transition-all">
      {/* Header */}
      <div className="flex items-center justify-between gap-3 border-b border-[#202630] pb-3.5">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-lg bg-[#7DA7D9]/10 border border-[#7DA7D9]/20 text-[#7DA7D9]">
            <Calendar className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-[#F4F1EA]">30-Day Renewal Timeline</h3>
            <p className="text-[11px] text-[#8F98A8]">Chronological countdown of upcoming subscription charges</p>
          </div>
        </div>

        {sortedRenewals.length > 0 && (
          <span className="text-[10px] font-mono font-bold text-[#C9A86A] bg-[#C9A86A]/10 border border-[#C9A86A]/20 px-2 py-0.5 rounded">
            Total: ${totalUpcomingAmount.toFixed(2)}
          </span>
        )}
      </div>

      {/* Content List */}
      {loading ? (
        <div className="p-4 space-y-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="h-10 bg-[#171C24] rounded animate-pulse" />
          ))}
        </div>
      ) : sortedRenewals.length === 0 ? (
        <div className="p-8 text-center text-xs text-[#8F98A8] border border-[#202630] rounded-xl bg-[#0E1116] space-y-1">
          <Calendar className="w-6 h-6 text-[#8F98A8] mx-auto mb-2 opacity-50" />
          <span className="font-semibold text-[#F4F1EA] block">No Renewals in 30 Days</span>
          <span>All active subscriptions are beyond the 30-day billing window.</span>
        </div>
      ) : (
        <div className="divide-y divide-[#202630] border border-[#202630] rounded-xl overflow-hidden bg-[#0E1116]">
          {sortedRenewals.map((item) => {
            const sub = subscriptions.find((s) => s.id === item.subscriptionId);
            const days = getDaysRemaining(item.renewalDate);

            let urgencyClass = "text-[#7DA7D9] bg-[#7DA7D9]/10 border-[#7DA7D9]/25";
            let urgencyLabel = `In ${days} days`;

            if (days <= 0) {
              urgencyClass = "text-rose-400 bg-rose-500/15 border-rose-500/30 animate-pulse";
              urgencyLabel = "Renews Today";
            } else if (days <= 3) {
              urgencyClass = "text-rose-400 bg-rose-500/15 border-rose-500/30";
              urgencyLabel = `In ${days}d (Urgent)`;
            } else if (days <= 7) {
              urgencyClass = "text-[#C9A86A] bg-[#C9A86A]/15 border-[#C9A86A]/30";
              urgencyLabel = `In ${days} days`;
            }

            return (
              <div
                key={item.id}
                className="p-3.5 sm:p-4 flex items-center justify-between gap-3 hover:bg-[#171C24]/50 transition-colors text-xs"
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  <div className="w-8 h-8 rounded-lg bg-[#171C24] border border-[#202630] flex items-center justify-center font-bold text-xs text-[#7DA7D9] shrink-0">
                    {(sub?.name || "Sub").substring(0, 2).toUpperCase()}
                  </div>

                  <div className="space-y-0.5 min-w-0">
                    <span className="font-bold text-[#F4F1EA] block truncate text-xs">
                      {sub?.name || "Subscription"}
                    </span>
                    <div className="flex items-center gap-1.5 text-[10px] text-[#8F98A8] font-mono whitespace-nowrap">
                      <span>{item.renewalDate}</span>
                      <span>•</span>
                      <span>{item.autoRenew ? "Auto-renew" : "Manual"}</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2.5 shrink-0">
                  <span
                    className={cn(
                      "px-2 py-0.5 rounded-full text-[10px] font-mono font-bold border whitespace-nowrap shrink-0",
                      urgencyClass
                    )}
                  >
                    {urgencyLabel}
                  </span>

                  <span className="font-mono font-bold text-xs text-[#F4F1EA] whitespace-nowrap shrink-0">
                    ${sub?.costAmount.toFixed(2) || "0.00"}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
