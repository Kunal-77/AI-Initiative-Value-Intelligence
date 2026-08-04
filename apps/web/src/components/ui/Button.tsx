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
        baseStyles = "px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-sm font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed";
        break;
      case "secondary":
        baseStyles = "px-4 py-2 border border-zinc-200 dark:border-zinc-800 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-lg text-sm transition-colors disabled:opacity-50 disabled:cursor-not-allowed";
        break;
      case "danger":
        baseStyles = "px-4 py-2 bg-rose-600 text-white rounded-lg text-sm font-semibold hover:bg-rose-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed";
        break;
      case "dark":
        baseStyles = "px-4 py-2 bg-zinc-900 hover:bg-zinc-800 text-white dark:bg-zinc-100 dark:hover:bg-zinc-200 dark:text-zinc-900 rounded-lg text-sm font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed";
        break;
      case "warning":
        baseStyles = "px-4 py-2 bg-amber-600 text-white rounded-lg text-sm font-semibold hover:bg-amber-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed";
        break;
      case "simple":
        baseStyles = "px-4 py-2 border border-zinc-200 rounded-lg text-sm disabled:opacity-50 disabled:cursor-not-allowed";
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
