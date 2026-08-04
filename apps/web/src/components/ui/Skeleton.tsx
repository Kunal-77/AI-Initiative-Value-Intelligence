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
