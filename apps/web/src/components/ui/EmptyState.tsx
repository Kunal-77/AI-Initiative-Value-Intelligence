"use client";

import React from "react";
import { FolderOpen } from "lucide-react";
import { Button } from "./Button";
import { cn } from "./cn";

export interface EmptyStateProps extends React.HTMLAttributes<HTMLDivElement> {
  message?: string;
  title?: string;
  description?: string;
  actionText?: string;
  onActionClick?: () => void;
  icon?: React.ReactNode;
  variant?: "dashed" | "card" | "simple";
}

export const EmptyState = React.forwardRef<HTMLDivElement, EmptyStateProps>(
  (
    {
      className,
      message,
      title,
      description,
      actionText,
      onActionClick,
      icon,
      variant = "dashed",
      ...props
    },
    ref
  ) => {
    const heading = title || message || "No items found";
    const body = description || (title ? message : undefined) || "Get started by creating a new entry below.";

    let containerStyle = "text-center py-16 px-6 font-sans flex flex-col items-center justify-center";
    if (variant === "dashed") {
      containerStyle = "text-center py-16 px-6 font-sans flex flex-col items-center justify-center border border-dashed border-border rounded-xl bg-card/40 text-card-foreground";
    } else if (variant === "card") {
      containerStyle = "text-center py-16 px-6 font-sans flex flex-col items-center justify-center border border-border rounded-xl bg-card text-card-foreground shadow-2xs";
    }

    return (
      <div ref={ref} className={cn(containerStyle, className)} {...props}>
        <div className="w-12 h-12 rounded-xl bg-blue-500/10 text-blue-500 dark:text-blue-400 border border-blue-500/20 flex items-center justify-center mb-4 shadow-xs">
          {icon ? icon : <FolderOpen className="w-6 h-6" />}
        </div>
        <h3 className="text-base font-semibold text-foreground mb-1 tracking-tight">
          {heading}
        </h3>
        {body && (
          <p className="text-xs text-muted-foreground max-w-sm mb-5 leading-relaxed">
            {body}
          </p>
        )}
        {actionText && onActionClick && (
          <Button
            type="button"
            onClick={onActionClick}
            variant="primary"
          >
            {actionText}
          </Button>
        )}
      </div>
    );
  }
);

EmptyState.displayName = "EmptyState";
