"use client";

import React from "react";
import { Sparkles } from "lucide-react";
import { cn } from "./cn";

export interface LoadingStateProps extends React.HTMLAttributes<HTMLDivElement> {
  message?: string;
  fullScreen?: boolean;
}

export const LoadingState = React.forwardRef<HTMLDivElement, LoadingStateProps>(
  ({ className, message = "Loading Workspace...", fullScreen = true, ...props }, ref) => {
    const textElement = (
      <div className="flex flex-col items-center gap-3">
        <div className="relative flex items-center justify-center">
          <div className="w-10 h-10 rounded-full border-2 border-border animate-spin border-t-accent" />
          <Sparkles className="w-4 h-4 text-accent absolute" />
        </div>
        <div className="text-xs font-semibold tracking-wide text-muted-foreground animate-pulse">
          {message}
        </div>
      </div>
    );

    if (fullScreen) {
      return (
        <div
          ref={ref}
          className={cn("flex min-h-screen items-center justify-center bg-background text-foreground font-sans", className)}
          {...props}
        >
          {textElement}
        </div>
      );
    }

    return (
      <div
        ref={ref}
        className={cn("flex flex-col items-center justify-center py-16 px-6 font-sans", className)}
        {...props}
      >
        {textElement}
      </div>
    );
  }
);

LoadingState.displayName = "LoadingState";
