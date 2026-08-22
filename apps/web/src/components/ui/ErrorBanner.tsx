import React from "react";
import { AlertCircle, X } from "lucide-react";
import { cn } from "./cn";

export interface ErrorBannerProps extends React.HTMLAttributes<HTMLDivElement> {
  message: string | null;
  onClose?: () => void;
  variant?: "red" | "rose";
}

export const ErrorBanner = React.forwardRef<HTMLDivElement, ErrorBannerProps>(
  ({ className = "", message, onClose, variant = "red", ...props }, ref) => {
    if (!message) return null;

    return (
      <div
        ref={ref}
        className={cn(
          "p-3.5 rounded-xl border border-rose-500/20 bg-rose-500/10 text-rose-600 dark:text-rose-400 text-xs font-medium flex items-center justify-between gap-3 shadow-2xs",
          className
        )}
        {...props}
      >
        <div className="flex items-center gap-2 min-w-0 flex-1">
          <AlertCircle className="w-4 h-4 shrink-0 text-rose-500" />
          <span className="truncate">{message}</span>
        </div>
        {onClose && (
          <button
            type="button"
            onClick={onClose}
            className="text-rose-500 hover:text-rose-400 p-1 rounded-md hover:bg-rose-500/20 transition-colors cursor-pointer shrink-0"
            aria-label="Dismiss error"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        )}
      </div>
    );
  }
);

ErrorBanner.displayName = "ErrorBanner";
