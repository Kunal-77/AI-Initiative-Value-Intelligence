"use client";

import React, { useState, useRef, useEffect, useId } from "react";
import { useUser, useOrganizationList, useAuth } from "@clerk/nextjs";
import { Building2, User, Check, ChevronsUpDown } from "lucide-react";
import { useWorkspaceTransition } from "./WorkspaceTransitionContext";
import { cn } from "./cn";

export interface WorkspaceSelectorProps extends React.HTMLAttributes<HTMLDivElement> {}

export function WorkspaceSelector({ className, ...props }: WorkspaceSelectorProps) {
  const { user } = useUser();
  const { orgId } = useAuth();
  const { isLoaded, setActive, userMemberships } = useOrganizationList({
    userMemberships: {
      keepPreviousData: true,
    },
  });

  const { startTransition, endTransition, setToastError } = useWorkspaceTransition();

  const [isOpen, setIsOpen] = useState(false);
  const [isPending, setIsPending] = useState(false);
  const [highlightedIndex, setHighlightedIndex] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const listboxId = useId();

  // Active value resolution
  const activeValue = orgId || "personal";

  // Build workspace options list
  const options = React.useMemo(() => {
    const list = [
      { id: "personal", name: "Personal Workspace", isOrg: false },
    ];
    if (userMemberships.data) {
      userMemberships.data.forEach((mem) => {
        list.push({
          id: mem.organization.id,
          name: mem.organization.name,
          isOrg: true,
        });
      });
    }
    return list;
  }, [userMemberships.data]);

  const activeOption = options.find((o) => o.id === activeValue) || options[0];

  // Handle outside click
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Sync highlighted index when menu opens
  useEffect(() => {
    if (isOpen) {
      const activeIdx = options.findIndex((o) => o.id === activeValue);
      setHighlightedIndex(activeIdx >= 0 ? activeIdx : 0);
    }
  }, [isOpen, activeValue, options]);

  const handleSelect = async (val: string) => {
    setIsOpen(false);
    if (val === activeValue || !setActive || isPending) return;

    const targetOpt = options.find((o) => o.id === val);
    const targetName = targetOpt?.name || (val === "personal" ? "Personal Workspace" : "Organization");
    const targetIsOrg = targetOpt?.isOrg ?? val !== "personal";

    // Immediate visual feedback & overlay activation
    setIsPending(true);
    startTransition(targetName, targetIsOrg);

    try {
      if (val === "personal") {
        await setActive({ organization: null });
      } else {
        await setActive({ organization: val });
      }
    } catch (err: any) {
      console.error("[WorkspaceSelector] Error switching workspace:", err);
      endTransition();
      setToastError("Unable to switch workspace. Please try again.");
      setIsPending(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (isPending) return;
    if (!isOpen) {
      if (e.key === "ArrowDown" || e.key === "ArrowUp" || e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        setIsOpen(true);
      }
      return;
    }

    switch (e.key) {
      case "ArrowDown":
        e.preventDefault();
        setHighlightedIndex((prev) => (prev + 1) % options.length);
        break;
      case "ArrowUp":
        e.preventDefault();
        setHighlightedIndex((prev) => (prev - 1 + options.length) % options.length);
        break;
      case "Enter":
      case " ":
        e.preventDefault();
        if (options[highlightedIndex]) {
          handleSelect(options[highlightedIndex].id);
        }
        break;
      case "Escape":
      case "Tab":
        setIsOpen(false);
        triggerRef.current?.focus();
        break;
    }
  };

  if (!isLoaded || !user) {
    return (
      <div className="h-9 w-full rounded-lg border border-border bg-secondary animate-pulse" />
    );
  }

  return (
    <div
      ref={containerRef}
      className={cn("relative w-full max-w-full box-border select-none", className)}
      {...props}
    >
      {/* Custom Trigger Button */}
      <button
        ref={triggerRef}
        type="button"
        role="combobox"
        aria-haspopup="listbox"
        aria-expanded={isOpen}
        aria-controls={listboxId}
        aria-busy={isPending}
        aria-label="Select Workspace"
        disabled={isPending}
        onClick={() => setIsOpen((prev) => !prev)}
        onKeyDown={handleKeyDown}
        className={cn(
          "w-full h-9 px-3 flex items-center justify-between gap-2 rounded-lg border border-border bg-card hover:bg-secondary text-xs font-semibold text-card-foreground shadow-2xs transition-colors focus:outline-none focus:ring-2 focus:ring-ring/20 focus:border-ring cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed",
          isOpen && "border-ring ring-2 ring-ring/20 bg-secondary"
        )}
      >
        <div className="flex items-center gap-2 min-w-0 flex-1">
          {activeOption.isOrg ? (
            <Building2 className="w-3.5 h-3.5 text-muted-foreground shrink-0" />
          ) : (
            <User className="w-3.5 h-3.5 text-muted-foreground shrink-0" />
          )}
          <span className="truncate text-left flex-1">{activeOption.name}</span>
        </div>

        <ChevronsUpDown className="w-3.5 h-3.5 text-muted-foreground shrink-0 opacity-70" />
      </button>

      {/* Custom Dropdown Menu */}
      {isOpen && !isPending && (
        <div
          id={listboxId}
          role="listbox"
          aria-label="Workspaces"
          className="absolute top-full left-0 right-0 mt-1 w-full rounded-lg border border-border bg-card text-card-foreground shadow-lg z-50 overflow-hidden animate-in fade-in-50 zoom-in-95 duration-100"
        >
          <div className="p-1 max-h-60 overflow-y-auto space-y-0.5">
            {options.map((opt, index) => {
              const isSelected = opt.id === activeValue;
              const isHighlighted = index === highlightedIndex;

              return (
                <div
                  key={opt.id}
                  role="option"
                  aria-selected={isSelected}
                  tabIndex={-1}
                  onClick={() => handleSelect(opt.id)}
                  onMouseEnter={() => setHighlightedIndex(index)}
                  className={cn(
                    "flex items-center justify-between gap-2 px-2.5 py-1.5 rounded-md text-xs font-medium cursor-pointer transition-colors",
                    isHighlighted ? "bg-secondary text-foreground" : "text-muted-foreground hover:text-foreground hover:bg-secondary/60",
                    isSelected && "font-semibold text-foreground"
                  )}
                >
                  <div className="flex items-center gap-2.5 min-w-0 flex-1">
                    {opt.isOrg ? (
                      <Building2 className="w-3.5 h-3.5 text-muted-foreground shrink-0" />
                    ) : (
                      <User className="w-3.5 h-3.5 text-muted-foreground shrink-0" />
                    )}
                    <span className="truncate flex-1">{opt.name}</span>
                  </div>

                  {isSelected && (
                    <Check className="w-3.5 h-3.5 text-accent shrink-0" />
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
