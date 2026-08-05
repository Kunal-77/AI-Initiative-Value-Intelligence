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
        baseStyles = "px-4 py-2 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white rounded-lg text-xs font-semibold shadow-md shadow-purple-500/10 hover:shadow-purple-500/25 transition-all duration-300 hover:scale-[1.02] focus:outline-none focus:ring-2 focus:ring-purple-500/50 flex items-center justify-center gap-1.5 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer";
        break;
      case "secondary":
        baseStyles = "px-4 py-2 border border-border bg-card text-foreground hover:bg-secondary rounded-lg text-xs font-semibold transition-all duration-300 hover:scale-[1.01] focus:outline-none focus:ring-2 focus:ring-ring/25 flex items-center justify-center gap-1.5 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer";
        break;
      case "danger":
        baseStyles = "px-4 py-2 bg-rose-600 text-white rounded-lg text-sm font-semibold hover:bg-rose-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed";
        break;
      case "dark":
        baseStyles = "px-4 py-2 bg-primary hover:bg-primary/90 text-primary-foreground rounded-lg text-sm font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed";
        break;
      case "warning":
        baseStyles = "px-4 py-2 bg-amber-600 text-white rounded-lg text-sm font-semibold hover:bg-amber-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed";
        break;
      case "simple":
        baseStyles = "px-4 py-2 border border-border bg-card text-foreground rounded-lg text-sm disabled:opacity-50 disabled:cursor-not-allowed";
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
