import React from "react";

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?:
    | "ACTIVE"
    | "SUBMITTED"
    | "COMPLETED"
    | "DRAFT"
    | "PAUSED"
    | "CANCELLED"
    | "ARCHIVED"
    | "ABANDONED"
    | "NEUTRAL"
    | "success"
    | "info"
    | "warning"
    | "error";
}

export const Badge = React.forwardRef<HTMLSpanElement, BadgeProps>(
  ({ className = "", variant = "NEUTRAL", children, ...props }, ref) => {
    let variantStyles = "bg-secondary text-muted-foreground border-border";

    switch (variant) {
      case "ACTIVE":
      case "success":
        variantStyles = "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20";
        break;
      case "SUBMITTED":
      case "info":
        variantStyles = "bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20";
        break;
      case "COMPLETED":
        variantStyles = "bg-cyan-500/10 text-cyan-600 dark:text-cyan-400 border-cyan-500/20";
        break;
      case "PAUSED":
      case "warning":
        variantStyles = "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20";
        break;
      case "error":
      case "ABANDONED":
      case "CANCELLED":
        variantStyles = "bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/20";
        break;
      case "ARCHIVED":
      case "DRAFT":
      case "NEUTRAL":
      default:
        variantStyles = "bg-secondary text-secondary-foreground border-border";
        break;
    }

    const combinedClassName = `text-xs px-2 py-0.5 rounded-full font-medium border ${variantStyles} ${className}`.trim();

    return (
      <span ref={ref} className={combinedClassName} {...props}>
        {children}
      </span>
    );
  }
);

Badge.displayName = "Badge";
