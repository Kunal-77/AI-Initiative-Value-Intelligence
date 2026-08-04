import React from "react";
import { cn } from "./cn";

export type TextareaProps = React.TextareaHTMLAttributes<HTMLTextAreaElement>;

export const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ className, ...props }, ref) => {
    return (
      <textarea
        ref={ref}
        className={cn(
          "bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-lg p-2 text-sm focus:outline-indigo-500 transition-colors placeholder:text-zinc-400 dark:placeholder:text-zinc-600 disabled:bg-zinc-100 disabled:dark:bg-zinc-950/50 disabled:text-zinc-500 disabled:focus:outline-none min-h-16",
          className
        )}
        {...props}
      />
    );
  }
);

Textarea.displayName = "Textarea";
