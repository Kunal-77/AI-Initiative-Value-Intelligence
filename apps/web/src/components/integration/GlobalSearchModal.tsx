"use client";

import React, { useState, useEffect } from "react";
import Link from "@/compat/link";
import { Search, ArrowRight, X, Command } from "lucide-react";
import { Dialog, DialogHeader, DialogTitle, DialogContent, Input } from "../ui";
import { GlobalSearchResult } from "../../types/integration";
import { getGlobalSearchIndex } from "../../services/integration/integrationService";
import { performGlobalSearch } from "../../lib/integration/eventBus";

export interface GlobalSearchModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function GlobalSearchModal({ isOpen, onClose }: GlobalSearchModalProps) {
  const [query, setQuery] = useState("");
  const [searchIndex, setSearchIndex] = useState<GlobalSearchResult[]>([]);

  useEffect(() => {
    getGlobalSearchIndex().then(setSearchIndex);
  }, []);

  const results = performGlobalSearch(query, searchIndex);

  return (
    <Dialog isOpen={isOpen} onClose={onClose} className="max-w-xl w-full">
      <DialogHeader>
        <div className="flex items-center gap-2">
          <Command className="w-4 h-4 text-accent" />
          <DialogTitle className="text-sm font-bold text-foreground">
            Enterprise Global Search
          </DialogTitle>
        </div>
      </DialogHeader>

      <DialogContent className="space-y-4 py-2">
        <Input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search initiatives, AI recommendations, expenses, approvals..."
          className="text-xs py-2 h-10 font-medium"
          autoFocus
        />

        <div className="space-y-2 max-h-72 overflow-y-auto pr-1">
          {query.trim() && results.length === 0 ? (
            <p className="text-xs text-muted-foreground py-4 text-center">No matching results found for "{query}".</p>
          ) : (
            results.map((res) => (
              <Link
                key={res.id}
                href={res.href}
                onClick={onClose}
                className="p-3 rounded-lg bg-secondary/30 hover:bg-secondary border border-border flex items-center justify-between transition-colors block text-xs"
              >
                <div className="space-y-0.5">
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-bold uppercase text-accent px-1.5 py-0.2 rounded bg-accent/15">
                      {res.type}
                    </span>
                    <span className="font-bold text-foreground">{res.title}</span>
                  </div>
                  <p className="text-[11px] text-muted-foreground">{res.subtitle}</p>
                </div>
                <ArrowRight className="w-3.5 h-3.5 text-muted-foreground shrink-0" />
              </Link>
            ))
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
