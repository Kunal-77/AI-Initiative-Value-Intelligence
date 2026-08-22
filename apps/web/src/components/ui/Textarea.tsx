import React from "react";
import { cn } from "./cn";

export type TextareaProps = React.TextareaHTMLAttributes<HTMLTextAreaElement>;

export const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ className, ...props }, ref) => {
    return (
      <textarea
        ref={ref}
        className={cn(
          "bg-secondary/25 hover:bg-secondary/40 focus:bg-background border border-border/80 text-foreground rounded-lg p-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500/60 transition-all duration-150 placeholder:text-muted-foreground/70 disabled:bg-muted disabled:text-muted-foreground disabled:focus:outline-none min-h-16",
          className
        )}
        {...props}
      />
    );
  }
);

Textarea.displayName = "Textarea";
