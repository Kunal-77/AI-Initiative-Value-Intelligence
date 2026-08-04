import React from "react";
import { cn } from "./cn";

export type SelectProps = React.SelectHTMLAttributes<HTMLSelectElement>;

export const Select = React.forwardRef<HTMLSelectElement, SelectProps>(
  ({ className, children, ...props }, ref) => {
    return (
      <select
        ref={ref}
        className={cn(
          "bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-lg p-2 text-sm focus:outline-indigo-500 transition-colors disabled:bg-zinc-100 disabled:dark:bg-zinc-950/50 disabled:text-zinc-500 disabled:focus:outline-none",
          className
        )}
        {...props}
      >
        {children}
      </select>
    );
  }
);

Select.displayName = "Select";
