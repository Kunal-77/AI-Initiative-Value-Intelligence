"use client";

import React, { useState, useMemo } from "react";
import { Sparkles, Check, X, Info, ShieldCheck, Bookmark, Eye, Copy, ChevronDown, ChevronUp, Search, Filter } from "lucide-react";
import { AiRecommendation, RecommendationStatus } from "../../types/ai";
import { Button, Badge, Skeleton, Input, Select } from "../ui";

export interface RecommendationFeedProps {
  recommendations: AiRecommendation[];
  loading?: boolean;
  onSelectExplainability: (rec: AiRecommendation) => void;
  onAccept: (rec: AiRecommendation) => void;
  onReject: (rec: AiRecommendation) => void;
  onStatusChange: (rec: AiRecommendation, newStatus: RecommendationStatus) => void;
}

export function RecommendationFeed({
  recommendations,
  loading = false,
  onSelectExplainability,
  onAccept,
  onReject,
  onStatusChange,
}: RecommendationFeedProps) {
  const [expandedIds, setExpandedIds] = useState<string[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("ALL");
  const [confidenceFilter, setConfidenceFilter] = useState<string>("ALL");

  const toggleExpand = (id: string) => {
    setExpandedIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const handleCopyText = (rec: AiRecommendation) => {
    navigator.clipboard.writeText(`${rec.title}: ${rec.description} (Savings: $${rec.annualSavings.toLocaleString()}/yr)`);
    alert("Recommendation copied to clipboard!");
  };

  const filtered = useMemo(() => {
    return recommendations.filter((rec) => {
      const matchesSearch =
        !searchQuery ||
        rec.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        rec.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        rec.initiativeName.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesStatus = statusFilter === "ALL" || rec.status === statusFilter;
      const matchesConfidence =
        confidenceFilter === "ALL" ||
        (confidenceFilter === "90" && rec.confidenceScore >= 90) ||
        (confidenceFilter === "80" && rec.confidenceScore >= 80);

      return matchesSearch && matchesStatus && matchesConfidence;
    });
  }, [recommendations, searchQuery, statusFilter, confidenceFilter]);

  if (loading) {
    return (
      <div className="space-y-4">
        {Array.from({ length: 3 }).map((_, idx) => (
          <div key={idx} className="p-5 rounded-xl border border-border bg-card space-y-3 shadow-2xs">
            <Skeleton className="h-4 w-40" />
            <Skeleton className="h-14 w-full" />
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="p-5 rounded-xl border border-border/80 bg-card text-card-foreground shadow-sm space-y-4">
      <div className="p-4 border-b border-border/60 bg-secondary/30 rounded-xl space-y-3">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-lg bg-cyan-500/10 border border-cyan-500/20 text-cyan-500 dark:text-cyan-400">
              <Sparkles className="w-4 h-4" />
            </div>
            <h3 className="text-sm font-bold text-foreground">AI Intelligence & Recommendations Feed</h3>
          </div>
          <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-secondary text-muted-foreground border border-border">
            {filtered.length} Filtered
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-1">
          <Input
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search recommendations..."
            className="text-xs h-8 py-1"
          />

          <Select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="text-xs h-8 py-1"
          >
            <option value="ALL">All Statuses</option>
            <option value="PENDING">PENDING</option>
            <option value="ACCEPTED">ACCEPTED</option>
            <option value="REJECTED">REJECTED</option>
            <option value="SAVED">SAVED FOR LATER</option>
            <option value="REVIEWED">MARK AS REVIEWED</option>
          </Select>

          <Select
            value={confidenceFilter}
            onChange={(e) => setConfidenceFilter(e.target.value)}
            className="text-xs h-8 py-1"
          >
            <option value="ALL">All Confidence Scores</option>
            <option value="90">90%+ High Confidence</option>
            <option value="80">80%+ Medium+ Confidence</option>
          </Select>
        </div>
      </div>

      {/* Cards List */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filtered.map((rec) => {
          const isExpanded = expandedIds.includes(rec.id);

          let statusBadge = "bg-secondary text-secondary-foreground border-border";
          if (rec.status === "ACCEPTED") statusBadge = "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20";
          if (rec.status === "REJECTED") statusBadge = "bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/20";
          if (rec.status === "SAVED") statusBadge = "bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border-indigo-500/20";

          return (
            <div
              key={rec.id}
              className="p-5 rounded-xl border border-border/80 bg-card text-card-foreground shadow-2xs hover:shadow-lg hover:shadow-blue-950/20 hover:border-cyan-500/40 transition-all flex flex-col justify-between gap-3 relative overflow-hidden"
            >
              <div className="space-y-2">
                <div className="flex items-start justify-between gap-2">
                  <div className="space-y-0.5 min-w-0">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-cyan-500 dark:text-cyan-400 block">
                      {rec.category}
                    </span>
                    <h4 className="text-sm font-bold text-foreground leading-snug">{rec.title}</h4>
                  </div>
                  <span className="text-xs font-semibold px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 shrink-0">
                    +${rec.annualSavings.toLocaleString()}/yr
                  </span>
                </div>

                <p className="text-xs text-muted-foreground leading-relaxed">{rec.description}</p>

                {/* Expand / Collapse Toggle Details */}
                {isExpanded && (
                  <div className="pt-2 space-y-2 text-xs border-t border-border/40 animate-in fade-in-50">
                    <div className="p-2.5 rounded bg-secondary/30 border border-border space-y-1">
                      <span className="text-[10px] font-bold uppercase text-foreground block">Algorithmic Reasoning</span>
                      <ul className="list-disc pl-3 text-[11px] text-muted-foreground space-y-1">
                        {rec.reasoning.map((r, i) => (
                          <li key={i}>{r}</li>
                        ))}
                      </ul>
                    </div>
                  </div>
                )}
              </div>

              {/* Confidence Meter Bar */}
              <div className="space-y-1">
                <div className="flex justify-between text-[10px]">
                  <span className="text-muted-foreground font-semibold">Confidence Score</span>
                  <span className="font-mono font-bold text-accent">{rec.confidenceScore}%</span>
                </div>
                <div className="w-full h-1.5 bg-secondary rounded-full overflow-hidden">
                  <div className="h-full bg-accent transition-all duration-300" style={{ width: `${rec.confidenceScore}%` }} />
                </div>
              </div>

              {/* Footer Meta & Action Triggers */}
              <div className="pt-2 border-t border-border flex flex-col gap-2">
                <div className="flex items-center justify-between text-xs">
                  <button
                    type="button"
                    onClick={() => onSelectExplainability(rec)}
                    className="text-accent hover:underline font-semibold flex items-center gap-1 text-[11px]"
                  >
                    <Info className="w-3.5 h-3.5" /> Explainability & Evidence
                  </button>

                  <div className="flex items-center gap-1 text-muted-foreground">
                    <button
                      type="button"
                      onClick={() => handleCopyText(rec)}
                      className="p-1 hover:text-foreground hover:bg-secondary rounded"
                      title="Copy text"
                    >
                      <Copy className="w-3.5 h-3.5" />
                    </button>
                    <button
                      type="button"
                      onClick={() => toggleExpand(rec.id)}
                      className="p-1 hover:text-foreground hover:bg-secondary rounded flex items-center text-[10px] font-semibold"
                    >
                      {isExpanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                    </button>
                  </div>
                </div>

                {/* Workflow Actions */}
                <div className="flex items-center justify-between gap-2 pt-1 border-t border-border/40">
                  <div className="flex gap-1">
                    <button
                      type="button"
                      onClick={() => onStatusChange(rec, "SAVED")}
                      className="p-1 text-[10px] font-semibold text-muted-foreground hover:text-foreground hover:bg-secondary rounded border border-border flex items-center gap-1"
                    >
                      <Bookmark className="w-3 h-3" /> Save
                    </button>
                    <button
                      type="button"
                      onClick={() => onStatusChange(rec, "REVIEWED")}
                      className="p-1 text-[10px] font-semibold text-muted-foreground hover:text-foreground hover:bg-secondary rounded border border-border flex items-center gap-1"
                    >
                      <Eye className="w-3 h-3" /> Review
                    </button>
                  </div>

                  <div className="flex items-center gap-1.5">
                    {rec.status === "PENDING" ? (
                      <>
                        <button
                          type="button"
                          onClick={() => onReject(rec)}
                          className="p-1 rounded text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors"
                          title="Decline"
                        >
                          <X className="w-4 h-4" />
                        </button>
                        <Button
                          onClick={() => onAccept(rec)}
                          variant="primary"
                          className="py-1 px-2.5 text-[10px] h-7"
                        >
                          <Check className="w-3 h-3 mr-1" /> Accept
                        </Button>
                      </>
                    ) : (
                      <span className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded border ${statusBadge}`}>
                        {rec.status}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
