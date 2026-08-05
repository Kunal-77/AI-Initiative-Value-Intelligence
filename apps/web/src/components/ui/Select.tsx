import React from "react";
import { cn } from "./cn";

export type SelectProps = React.SelectHTMLAttributes<HTMLSelectElement>;

export const Select = React.forwardRef<HTMLSelectElement, SelectProps>(
  ({ className, children, ...props }, ref) => {
    return (
      <select
        ref={ref}
        className={cn(
          "bg-background border border-border text-foreground rounded-lg p-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring transition-colors disabled:bg-muted disabled:text-muted-foreground disabled:focus:outline-none",
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
