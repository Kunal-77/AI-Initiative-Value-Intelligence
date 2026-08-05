import React from "react";
import { cn } from "./cn";

export type TextareaProps = React.TextareaHTMLAttributes<HTMLTextAreaElement>;

export const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ className, ...props }, ref) => {
    return (
      <textarea
        ref={ref}
        className={cn(
          "bg-background border border-border text-foreground rounded-lg p-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring transition-colors placeholder:text-muted-foreground disabled:bg-muted disabled:text-muted-foreground disabled:focus:outline-none min-h-16",
          className
        )}
        {...props}
      />
    );
  }
);

Textarea.displayName = "Textarea";
