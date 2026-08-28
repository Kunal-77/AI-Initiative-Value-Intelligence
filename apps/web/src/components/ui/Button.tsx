import React from "react";

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "danger" | "dark" | "warning" | "simple";
  loading?: boolean;
  loadingText?: string;
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className = "", variant = "primary", loading = false, loadingText, children, disabled, ...props }, ref) => {
    let baseStyles = "px-4 py-2 rounded-full text-sm font-medium transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-500/50";
    
    switch (variant) {
      case "primary":
        baseStyles = "px-4 py-2 bg-white dark:bg-zinc-100 text-black dark:text-zinc-950 rounded-full text-xs font-bold uppercase tracking-wider shadow-sm hover:bg-white/90 dark:hover:bg-zinc-100/90 hover:shadow-[0_0_18px_rgba(45,212,191,0.55)] transition-all duration-300 active:scale-[0.98] flex items-center justify-center gap-1.5 cursor-pointer";
        break;
      case "secondary":
        baseStyles = "px-4 py-2 border border-border/80 bg-card text-foreground hover:bg-secondary hover:border-teal-500/30 rounded-full text-xs font-semibold shadow-2xs hover:shadow-[0_0_18px_rgba(45,212,191,0.45)] transition-all duration-300 active:scale-[0.98] flex items-center justify-center gap-1.5 cursor-pointer";
        break;
      case "danger":
        baseStyles = "px-4 py-2 bg-rose-600 hover:bg-rose-500 text-white rounded-full text-xs font-semibold shadow-sm hover:shadow-[0_0_18px_rgba(244,63,94,0.45)] transition-all duration-300 active:scale-[0.98] flex items-center justify-center gap-1.5 cursor-pointer";
        break;
      case "dark":
        baseStyles = "px-4 py-2 bg-primary hover:bg-primary/90 text-primary-foreground rounded-full text-xs font-medium hover:shadow-[0_0_18px_rgba(45,212,191,0.45)] transition-all duration-300 active:scale-[0.98] flex items-center justify-center gap-1.5 cursor-pointer";
        break;
      case "warning":
        baseStyles = "px-4 py-2 bg-amber-600 hover:bg-amber-500 text-white rounded-full text-xs font-semibold shadow-sm hover:shadow-[0_0_18px_rgba(245,158,11,0.45)] transition-all duration-300 active:scale-[0.98] flex items-center justify-center gap-1.5 cursor-pointer";
        break;
      case "simple":
        baseStyles = "px-4 py-2 border border-border bg-card text-foreground rounded-full text-xs hover:bg-secondary hover:border-teal-500/30 hover:shadow-[0_0_18px_rgba(45,212,191,0.45)] transition-all duration-300 active:scale-[0.98] flex items-center justify-center gap-1.5 cursor-pointer";
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
