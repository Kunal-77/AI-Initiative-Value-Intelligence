"use client";

import React from "react";
import { cn } from "./cn";

export interface SkeletonProps extends React.HTMLAttributes<HTMLDivElement> {}

export function Skeleton({ className, ...props }: SkeletonProps) {
  return (
    <div
      className={cn("animate-pulse rounded-md bg-secondary/80", className)}
      aria-busy="true"
      aria-live="polite"
      {...props}
    />
  );
}

export function SkeletonCard({ className }: { className?: string }) {
  return (
    <div className={cn("p-6 rounded-xl border border-border bg-card space-y-4", className)}>
      <Skeleton className="h-5 w-1/3" />
      <Skeleton className="h-4 w-2/3" />
      <div className="pt-4 space-y-2">
        <Skeleton className="h-8 w-full" />
        <Skeleton className="h-8 w-4/5" />
      </div>
    </div>
  );
}

export function SkeletonMetricsRow({ className }: { className?: string }) {
  return (
    <div className={cn("grid grid-cols-1 md:grid-cols-3 gap-6", className)}>
      <div className="p-5 rounded-xl border border-border bg-card space-y-3">
        <Skeleton className="h-4 w-24" />
        <Skeleton className="h-8 w-32" />
        <Skeleton className="h-3 w-40" />
      </div>
      <div className="p-5 rounded-xl border border-border bg-card space-y-3">
        <Skeleton className="h-4 w-24" />
        <Skeleton className="h-8 w-32" />
        <Skeleton className="h-3 w-40" />
      </div>
      <div className="p-5 rounded-xl border border-border bg-card space-y-3">
        <Skeleton className="h-4 w-24" />
        <Skeleton className="h-8 w-32" />
        <Skeleton className="h-3 w-40" />
      </div>
    </div>
  );
}

export function SkeletonTable({ rows = 4, className }: { rows?: number; className?: string }) {
  return (
    <div className={cn("rounded-xl border border-border bg-card overflow-hidden", className)}>
      <div className="p-4 border-b border-border bg-secondary/40 flex justify-between">
        <Skeleton className="h-5 w-36" />
        <Skeleton className="h-5 w-24" />
      </div>
      <div className="p-4 space-y-3">
        {Array.from({ length: rows }).map((_, i) => (
          <div key={i} className="flex justify-between items-center py-2 border-b border-border/50 last:border-0">
            <Skeleton className="h-4 w-1/3" />
            <Skeleton className="h-4 w-1/4" />
            <Skeleton className="h-4 w-16" />
          </div>
        ))}
      </div>
    </div>
  );
}

export function SkeletonChart({ className }: { className?: string }) {
  return (
    <div className={cn("p-5 rounded-xl border border-border bg-card space-y-4", className)}>
      <div className="flex justify-between items-center pb-2 border-b border-border/40">
        <Skeleton className="h-5 w-1/3" />
        <Skeleton className="h-4 w-16" />
      </div>
      <div className="h-32 flex items-end justify-between gap-2 pt-4 px-2">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="flex-1 flex flex-col items-center gap-2">
            <Skeleton className="w-full bg-secondary/60 rounded-t" style={{ height: `${20 + (i % 3) * 25}%` }} />
            <Skeleton className="h-3 w-8" />
          </div>
        ))}
      </div>
    </div>
  );
}

export function SkeletonTimeline({ className }: { className?: string }) {
  return (
    <div className={cn("p-5 rounded-xl border border-border bg-card space-y-4", className)}>
      <div className="flex justify-between items-center pb-2 border-b border-border/40">
        <Skeleton className="h-5 w-1/4" />
        <Skeleton className="h-4 w-12" />
      </div>
      <div className="space-y-4 pt-2">
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="flex items-start gap-3 border-l-2 border-border/50 pl-4 relative">
            <div className="absolute -left-[6px] top-1.5 w-2.5 h-2.5 rounded-full bg-border" />
            <div className="flex-1 space-y-1.5">
              <Skeleton className="h-4 w-1/3" />
              <Skeleton className="h-3 w-2/3" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export function SkeletonConsole({ className }: { className?: string }) {
  return (
    <div className={cn("p-5 rounded-xl border border-border bg-card space-y-4", className)}>
      <div className="flex justify-between items-center pb-2 border-b border-border/40">
        <Skeleton className="h-5 w-1/4" />
        <Skeleton className="h-4 w-20" />
      </div>
      <div className="bg-secondary/40 p-4 rounded-lg font-mono space-y-2 min-h-[140px]">
        <Skeleton className="h-3.5 w-full bg-secondary/80" />
        <Skeleton className="h-3.5 w-11/12 bg-secondary/80" />
        <Skeleton className="h-3.5 w-10/12 bg-secondary/80" />
        <Skeleton className="h-3.5 w-9/12 bg-secondary/80" />
      </div>
    </div>
  );
}
