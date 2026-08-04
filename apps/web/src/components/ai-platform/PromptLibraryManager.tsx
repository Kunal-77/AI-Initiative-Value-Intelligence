"use client";

import React, { useState } from "react";
import { BookOpen, Copy, Check } from "lucide-react";
import { PROMPT_LIBRARY } from "../../lib/ai/promptLibrary";
import { PromptTemplate } from "../../types/ai-platform";
import { Badge } from "../ui";

export function PromptLibraryManager() {
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const handleCopy = (id: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 1200);
  };

  return (
    <div className="p-5 rounded-xl border border-border bg-card text-card-foreground shadow-2xs space-y-4">
      <div className="flex items-center justify-between border-b border-border/60 pb-2">
        <div className="flex items-center gap-2">
          <BookOpen className="w-4 h-4 text-accent" />
          <h3 className="text-sm font-bold text-foreground">Central Versioned Prompt Library</h3>
        </div>
        <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-accent/15 text-accent font-bold">
          {PROMPT_LIBRARY.length} Templates
        </span>
      </div>

      <div className="space-y-3">
        {PROMPT_LIBRARY.map((tmpl) => (
          <div key={tmpl.id} className="p-3.5 rounded-lg bg-secondary/30 border border-border space-y-2 text-xs">
            <div className="flex justify-between items-center">
              <div className="flex items-center gap-2">
                <span className="font-bold text-foreground">{tmpl.name}</span>
                <span className="text-[9px] font-mono px-1.5 py-0.2 rounded bg-secondary text-muted-foreground border border-border">
                  v{tmpl.version}
                </span>
              </div>
              <Badge variant="info">{tmpl.category}</Badge>
            </div>

            <div className="p-2.5 rounded bg-card border border-border font-mono text-[11px] text-muted-foreground space-y-1">
              <div>
                <span className="text-accent font-bold">System:</span> {tmpl.systemPrompt}
              </div>
              <div>
                <span className="text-emerald-500 font-bold">Template:</span> {tmpl.userPromptTemplate}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
