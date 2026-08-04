import React from "react";

export interface ErrorBannerProps extends React.HTMLAttributes<HTMLDivElement> {
  message: string | null;
  onClose?: () => void;
  variant?: "red" | "rose";
}

export const ErrorBanner = React.forwardRef<HTMLDivElement, ErrorBannerProps>(
  ({ className = "", message, onClose, variant = "red", ...props }, ref) => {
    if (!message) return null;

    let baseStyles = "p-4 border flex justify-between items-center";
    let colorStyles = "";

    if (variant === "rose") {
      baseStyles += " rounded-xl text-sm";
      colorStyles = "bg-rose-50 dark:bg-rose-950/20 border-rose-200 dark:border-rose-800 text-rose-800 dark:text-rose-400";
    } else {
      baseStyles += " rounded-lg";
      colorStyles = "bg-red-50 dark:bg-red-950/20 text-red-600 dark:text-red-400 border-red-200/50";
    }

    const combinedClassName = `${baseStyles} ${colorStyles} ${className}`.trim();

    return (
      <div ref={ref} className={combinedClassName} {...props}>
        <span>{message}</span>
        {onClose && (
          <button
            type="button"
            onClick={onClose}
            className="text-rose-500 hover:text-rose-700 font-bold px-2 transition-colors"
          >
            &times;
          </button>
        )}
      </div>
    );
  }
);

ErrorBanner.displayName = "ErrorBanner";
