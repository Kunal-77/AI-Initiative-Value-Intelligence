"use client";

import React, { useState, useEffect, useRef } from "react";
import { Search, Command, X, ArrowRight, FolderKanban, BarChart3, User, Sparkles } from "lucide-react";
import { useRouter } from "@/compat/navigation";
import { cn } from "./cn";

export interface SearchBarProps extends React.HTMLAttributes<HTMLDivElement> {}

export function SearchBar({ className, ...props }: SearchBarProps) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);
  const modalInputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();

  // Listen for Ctrl+K or Cmd+K
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === "k") {
        e.preventDefault();
        setOpen((prev) => !prev);
      } else if (e.key === "Escape" && open) {
        setOpen(false);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [open]);

  useEffect(() => {
    if (open) {
      setTimeout(() => modalInputRef.current?.focus(), 50);
    }
  }, [open]);

  const QUICK_LINKS = [
    { label: "Initiatives Portfolio", href: "/business/initiatives", icon: FolderKanban, category: "Navigation" },
    { label: "Personal Workspace Overview", href: "/personal", icon: User, category: "Navigation" },
    { label: "AI Value & Decision Intelligence", href: "/business/initiatives", icon: Sparkles, category: "AI Studio" },
    { label: "Financial Metrics Ledger", href: "/business/initiatives", icon: BarChart3, category: "Analytics" },
  ];

  const filteredLinks = query.trim()
    ? QUICK_LINKS.filter((item) => item.label.toLowerCase().includes(query.toLowerCase()))
    : QUICK_LINKS;

  const handleNavigate = (href: string) => {
    setOpen(false);
    setQuery("");
    router.push(href);
  };

  return (
    <div className={cn("relative inline-block w-full max-w-sm", className)} {...props}>
      {/* Trigger Bar */}
      <div
        onClick={() => setOpen(true)}
        className="group flex items-center justify-between w-full h-9 px-3 bg-secondary/60 hover:bg-secondary border border-border rounded-lg text-muted-foreground text-xs cursor-pointer transition-all duration-150 focus-within:ring-2 focus-within:ring-ring/20 focus-within:border-ring"
        role="button"
        tabIndex={0}
        aria-label="Search or type command"
      >
        <div className="flex items-center gap-2 overflow-hidden">
          <Search className="w-3.5 h-3.5 text-muted-foreground group-hover:text-foreground transition-colors shrink-0" />
          <span className="truncate text-muted-foreground">Search initiatives or commands...</span>
        </div>
        <kbd className="hidden sm:inline-flex items-center gap-0.5 px-1.5 py-0.5 text-[10px] font-mono text-muted-foreground bg-card border border-border rounded shadow-2xs shrink-0">
          <Command className="w-2.5 h-2.5" />K
        </kbd>
      </div>

      {/* Modal Palette Overlay */}
      {open && (
        <div className="fixed inset-0 z-50 flex items-start justify-center pt-16 sm:pt-24 px-4 bg-background/80 backdrop-blur-xs animate-in fade-in-0 duration-150">
          <div
            className="w-full max-w-lg bg-card text-card-foreground rounded-xl border border-border shadow-2xl overflow-hidden animate-in zoom-in-95 duration-150"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Input area */}
            <div className="flex items-center gap-3 px-4 py-3 border-b border-border">
              <Search className="w-4 h-4 text-muted-foreground shrink-0" />
              <input
                ref={modalInputRef}
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Type a command or search initiatives..."
                className="flex-1 bg-transparent text-sm text-foreground placeholder-muted-foreground focus:outline-none"
              />
              <button
                type="button"
                onClick={() => setOpen(false)}
                className="p-1 text-muted-foreground hover:text-foreground rounded hover:bg-secondary"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Quick Links List */}
            <div className="max-h-72 overflow-y-auto p-2">
              <div className="px-2 py-1 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                Commands & Pages
              </div>
              {filteredLinks.length > 0 ? (
                filteredLinks.map((item, idx) => {
                  const Icon = item.icon;
                  return (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => handleNavigate(item.href)}
                      className="w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-xs hover:bg-secondary transition-colors text-left group"
                    >
                      <div className="flex items-center gap-2.5">
                        <Icon className="w-4 h-4 text-muted-foreground group-hover:text-accent transition-colors shrink-0" />
                        <span className="font-medium text-foreground">{item.label}</span>
                      </div>
                      <div className="flex items-center gap-1.5 text-muted-foreground text-[11px]">
                        <span>{item.category}</span>
                        <ArrowRight className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity" />
                      </div>
                    </button>
                  );
                })
              ) : (
                <div className="p-6 text-center text-xs text-muted-foreground">
                  No matching initiatives or commands found for "{query}"
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="px-4 py-2 bg-secondary/40 border-t border-border flex items-center justify-between text-[11px] text-muted-foreground">
              <span>Use ↑↓ to navigate, Enter to select</span>
              <kbd className="px-1.5 py-0.5 rounded bg-secondary border border-border font-mono text-[10px]">ESC to close</kbd>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
