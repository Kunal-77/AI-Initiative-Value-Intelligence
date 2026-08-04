"use client";

import React from "react";
import { Play, Sparkles, Clock, Zap, RefreshCw, Square } from "lucide-react";
import { Button, Badge } from "../ui";
import { LlmCompletionResponse } from "../../types/ai-platform";

export interface StreamingConsoleProps {
  isStreaming: boolean;
  output: string;
  responseMeta: LlmCompletionResponse | null;
  onRunStream: () => void;
  onCancelStream: () => void;
}

export function StreamingConsole({
  isStreaming,
  output,
  responseMeta,
  onRunStream,
  onCancelStream,
}: StreamingConsoleProps) {
  return (
    <div className="p-5 rounded-xl border border-border bg-card text-card-foreground shadow-2xs space-y-4">
      <div className="flex items-center justify-between border-b border-border/60 pb-2">
        <div className="flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-accent" />
          <h3 className="text-sm font-bold text-foreground">Live Streaming AI Execution Console</h3>
        </div>

        <div className="flex items-center gap-2">
          {isStreaming ? (
            <Button onClick={onCancelStream} variant="secondary" className="text-xs h-7 py-0 px-2.5 text-rose-500">
              <Square className="w-3 h-3 mr-1 fill-current" /> Stop Stream
            </Button>
          ) : (
            <Button onClick={onRunStream} variant="primary" className="text-xs h-7 py-0 px-3">
              <Play className="w-3.5 h-3.5 mr-1 fill-current" /> Run Streaming Prompt
            </Button>
          )}
        </div>
      </div>

      {/* Console Display */}
      <div className="p-4 rounded-lg bg-black/90 text-emerald-400 font-mono text-xs space-y-2 min-h-44 max-h-72 overflow-y-auto border border-border/80 shadow-inner">
        {output ? (
          <p className="whitespace-pre-wrap leading-relaxed">{output}</p>
        ) : (
          <span className="text-muted-foreground/60 italic">// Ready to execute streaming LLM inference...</span>
        )}
      </div>

      {/* Meta Scorecard Bar */}
      {responseMeta && (
        <div className="p-3 rounded-lg bg-secondary/30 border border-border flex items-center justify-between text-xs font-mono">
          <div className="flex items-center gap-3">
            <span className="text-accent font-bold">Latency: {responseMeta.latencyMs}ms</span>
            <span className="text-muted-foreground">•</span>
            <span className="text-muted-foreground">Tokens: {responseMeta.promptTokens} in / {responseMeta.completionTokens} out</span>
          </div>

          <div className="flex items-center gap-3">
            <span className="text-emerald-500 font-bold">Est Cost: ${responseMeta.costUsd.toFixed(4)}</span>
            <Badge variant="ACTIVE">Score: {responseMeta.confidenceScore}%</Badge>
          </div>
        </div>
      )}
    </div>
  );
}
