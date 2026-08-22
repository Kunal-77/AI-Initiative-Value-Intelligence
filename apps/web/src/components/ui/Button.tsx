import React from "react";

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "danger" | "dark" | "warning" | "simple";
  loading?: boolean;
  loadingText?: string;
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className = "", variant = "primary", loading = false, loadingText, children, disabled, ...props }, ref) => {
    let baseStyles = "px-4 py-2 rounded-lg text-sm font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed";
    
    switch (variant) {
      case "primary":
        baseStyles = "px-4 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white rounded-lg text-xs font-semibold shadow-sm shadow-blue-500/20 hover:shadow-md hover:shadow-blue-500/35 transition-all duration-200 hover:brightness-105 active:scale-[0.98] focus:outline-none focus:ring-2 focus:ring-blue-500/50 flex items-center justify-center gap-1.5 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer";
        break;
      case "secondary":
        baseStyles = "px-4 py-2 border border-border/80 bg-card text-foreground hover:bg-secondary hover:border-blue-500/40 rounded-lg text-xs font-semibold shadow-2xs hover:shadow-sm transition-all duration-200 active:scale-[0.98] focus:outline-none focus:ring-2 focus:ring-ring/25 flex items-center justify-center gap-1.5 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer";
        break;
      case "danger":
        baseStyles = "px-4 py-2 bg-rose-600 hover:bg-rose-500 text-white rounded-lg text-xs font-semibold shadow-sm shadow-rose-500/20 hover:shadow-md hover:shadow-rose-500/30 transition-all duration-200 active:scale-[0.98] focus:outline-none focus:ring-2 focus:ring-rose-500/50 flex items-center justify-center gap-1.5 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer";
        break;
      case "dark":
        baseStyles = "px-4 py-2 bg-primary hover:bg-primary/90 text-primary-foreground rounded-lg text-xs font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed";
        break;
      case "warning":
        baseStyles = "px-4 py-2 bg-amber-600 hover:bg-amber-500 text-white rounded-lg text-xs font-semibold shadow-sm shadow-amber-500/20 transition-all duration-200 active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed";
        break;
      case "simple":
        baseStyles = "px-4 py-2 border border-border bg-card text-foreground rounded-lg text-xs disabled:opacity-50 disabled:cursor-not-allowed";
        break;
    }

    // Combine default and overridden className properties
    const combinedClassName = `${baseStyles} ${className}`.trim();

    return (
      <button
        ref={ref}
        disabled={disabled || loading}
        className={combinedClassName}
        {...props}
      >
        {loading ? loadingText || "Loading..." : children}
      </button>
    );
  }
);

Button.displayName = "Button";
