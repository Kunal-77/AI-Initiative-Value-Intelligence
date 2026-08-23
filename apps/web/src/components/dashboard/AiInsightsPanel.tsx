"use client";

import React, { useState } from "react";
import { Sparkles, Check, X, ShieldCheck, ChevronRight } from "lucide-react";
import { Skeleton, ErrorBanner, Button } from "../ui";
import { MOCK_AI_RECOMMENDATIONS, AiRecommendationMock } from "../../lib/mockData";

export interface AiInsightsPanelProps {
  insights?: AiRecommendationMock[];
  loading?: boolean;
  error?: string | null;
}

export function AiInsightsPanel({
  insights = MOCK_AI_RECOMMENDATIONS,
  loading = false,
  error = null,
}: AiInsightsPanelProps) {
  const [dismissedIds, setDismissedIds] = useState<string[]>([]);
  const [acceptedIds, setAcceptedIds] = useState<string[]>([]);

  if (loading) {
    return (
      <div className="p-5 rounded-xl border border-accent/30 bg-card space-y-3 shadow-xs">
        <Skeleton className="h-4 w-40" />
        <Skeleton className="h-16 w-full" />
        <Skeleton className="h-12 w-full" />
      </div>
    );
  }

  if (error) {
    return <ErrorBanner message={`Failed to load AI insights: ${error}`} variant="red" />;
  }

  const activeInsights = insights.filter(
    (i) => !dismissedIds.includes(i.id) && !acceptedIds.includes(i.id)
  );

  // Take top 2 (1 primary + 1 secondary) to reduce panel height
  const visibleInsights = activeInsights.slice(0, 2);

  return (
    <div className="p-5 rounded-xl border border-blue-500/30 bg-card text-card-foreground shadow-sm space-y-4 relative overflow-hidden motion-reveal motion-glow-cyan">
      {/* Accent blue glow backdrop */}
      <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/10 rounded-full blur-2xl pointer-events-none" />

      {/* Header */}
      <div className="flex items-center justify-between relative z-10">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-lg bg-cyan-500/10 text-cyan-500 dark:text-cyan-400 border border-cyan-500/20 animate-pulse-slow">
            <Sparkles className="w-3.5 h-3.5" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-foreground">AI Value Studio Insights</h3>
            <p className="text-[10px] text-muted-foreground">Top recommendations</p>
          </div>
        </div>
        <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-cyan-500/10 text-cyan-600 dark:text-cyan-400 border border-cyan-500/20 animate-pulse">
          AI Active
        </span>
      </div>

      {visibleInsights.length === 0 ? (
        <div className="p-4 text-center text-xs text-muted-foreground bg-secondary/30 rounded-lg border border-border">
          All recommendations reviewed.
        </div>
      ) : (
        <div className="space-y-2.5 relative z-10">
          {visibleInsights.map((item, index) => (
            <div
              key={item.id}
              className={`p-3 rounded-xl border transition-colors space-y-2 motion-hover-lift-cyan ${
                index === 0
                  ? "bg-cyan-500/5 border-cyan-500/30 shadow-2xs"
                  : "bg-secondary/35 border-border/70 hover:border-border"
              }`}
            >
              <div className="flex items-start justify-between gap-2">
                <div className="flex items-center gap-1.5 min-w-0">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-cyan-500 dark:text-cyan-400 shrink-0">
                    {index === 0 ? "Primary" : "Secondary"}
                  </span>
                  <h4 className="text-xs font-bold text-foreground leading-snug truncate">{item.title}</h4>
                </div>
                <span className="text-[10px] font-semibold px-1.5 py-0.5 rounded bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 shrink-0">
                  {item.impact}
                </span>
              </div>

              <p className="text-[11px] text-muted-foreground leading-relaxed line-clamp-2">{item.description}</p>

              {/* Citation & Actions */}
              <div className="flex items-center justify-between pt-0.5 text-[10px]">
                <div className="flex items-center gap-1 text-muted-foreground">
                  <ShieldCheck className="w-3 h-3 text-cyan-500 dark:text-cyan-400" />
                  <span className="motion-number-reveal">{item.confidence}% conf</span>
                </div>

                <div className="flex items-center gap-1.5">
                  <button
                    type="button"
                    onClick={() => setDismissedIds((prev) => [...prev, item.id])}
                    className="p-1 rounded text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors"
                    title="Decline Suggestion"
                  >
                    <X className="w-3 h-3" />
                  </button>
                  <Button
                    onClick={() => setAcceptedIds((prev) => [...prev, item.id])}
                    variant="primary"
                    className="py-0.5 px-2 text-[10px] h-6 cta-button-hover"
                  >
                    <Check className="w-3 h-3 mr-1" />
                    Accept
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Footer View All Action */}
      <div className="pt-1 border-t border-border flex justify-end">
        <button
          type="button"
          onClick={() => alert("Viewing all AI Value Studio Recommendations...")}
          className="text-xs font-semibold text-blue-500 dark:text-blue-400 hover:underline flex items-center gap-1"
        >
          View all recommendations
          <ChevronRight className="w-3 h-3" />
        </button>
      </div>
    </div>
  );
}
