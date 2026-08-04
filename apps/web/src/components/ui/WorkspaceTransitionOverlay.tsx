"use client";

import React from "react";
import { Building2, User, Loader2, AlertCircle } from "lucide-react";
import { useWorkspaceTransition } from "./WorkspaceTransitionContext";
import { cn } from "./cn";

export function WorkspaceTransitionOverlay() {
  const { isTransitioning, targetName, targetIsOrg, toastError, setToastError } = useWorkspaceTransition();

  if (!isTransitioning && !toastError) {
    return null;
  }

  return (
    <>
      {/* Workspace Switch Toast Error */}
      {toastError && (
        <div className="fixed bottom-6 right-6 z-50 flex items-center gap-3 px-4 py-3 bg-card text-card-foreground border border-rose-500/30 rounded-xl shadow-2xl animate-in slide-in-from-bottom-5 duration-200">
          <AlertCircle className="w-4 h-4 text-rose-500 shrink-0" />
          <div className="text-xs font-medium">{toastError}</div>
          <button
            type="button"
            onClick={() => setToastError(null)}
            className="ml-2 text-xs text-muted-foreground hover:text-foreground font-semibold"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* Transition Overlay */}
      {isTransitioning && (
        <div
          role="status"
          aria-live="polite"
          aria-busy="true"
          className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-md transition-all duration-200 animate-in fade-in-0"
        >
          <div className="w-full max-w-sm mx-4 p-6 bg-card text-card-foreground border border-border shadow-2xl rounded-2xl flex flex-col items-center gap-4 scale-[0.98] animate-in zoom-in-95 duration-150 select-none">
            {/* Top Brand Pill */}
            <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-secondary/80 border border-border">
              <div className="w-5 h-5 rounded bg-primary text-primary-foreground font-extrabold text-[10px] flex items-center justify-center">
                VI
              </div>
              <span className="text-[10px] font-bold tracking-wider uppercase text-foreground">
                Value Intelligence
              </span>
            </div>

            {/* Target Workspace Icon */}
            <div className="relative p-4 rounded-full bg-secondary text-foreground border border-border shadow-xs">
              {targetIsOrg ? (
                <Building2 className="w-6 h-6 text-accent" />
              ) : (
                <User className="w-6 h-6 text-accent" />
              )}
              <div className="absolute -bottom-1 -right-1 p-1 rounded-full bg-card border border-border shadow-xs">
                <Loader2 className="w-3.5 h-3.5 text-accent animate-spin" />
              </div>
            </div>

            {/* Status Messages */}
            <div className="text-center space-y-1">
              <p className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                Switching workspace...
              </p>
              <h3 className="text-base font-bold text-foreground truncate max-w-xs px-2">
                {targetName || "Workspace"}
              </h3>
            </div>

            {/* Progress Bar */}
            <div className="w-full h-1 bg-secondary rounded-full overflow-hidden">
              <div className="h-full bg-accent animate-pulse w-full rounded-full" />
            </div>
          </div>
        </div>
      )}
    </>
  );
}
