import React from "react";
import { cn } from "./cn";

export type InputProps = React.InputHTMLAttributes<HTMLInputElement>;

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type = "text", ...props }, ref) => {
    return (
      <input
        type={type}
        ref={ref}
        className={cn(
          "bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-lg p-2 text-sm focus:outline-indigo-500 transition-colors placeholder:text-zinc-400 dark:placeholder:text-zinc-600 disabled:bg-zinc-100 disabled:dark:bg-zinc-950/50 disabled:text-zinc-500 disabled:focus:outline-none",
          className
        )}
        {...props}
      />
    );
  }
);

Input.displayName = "Input";
