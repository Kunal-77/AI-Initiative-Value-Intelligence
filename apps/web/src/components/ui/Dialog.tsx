import React, { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { cn } from "./cn";

export interface DialogProps extends React.HTMLAttributes<HTMLDivElement> {
  isOpen: boolean;
  onClose: () => void;
}

export const Dialog = React.forwardRef<HTMLDivElement, DialogProps>(
  ({ className, isOpen, onClose, children, ...props }, ref) => {
    const [mounted, setMounted] = useState(false);

    // Mount guard to prevent SSR hydration mismatch
    useEffect(() => {
      setMounted(true);
    }, []);

    // Escape key handling
    useEffect(() => {
      const handleKeyDown = (e: KeyboardEvent) => {
        if (e.key === "Escape" && isOpen) {
          onClose();
        }
      };
      window.addEventListener("keydown", handleKeyDown);
      return () => window.removeEventListener("keydown", handleKeyDown);
    }, [isOpen, onClose]);

    if (!isOpen || !mounted) return null;

    return createPortal(
      <div
        ref={ref}
        className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-in fade-in duration-150"
        onClick={(e) => {
          if (e.target === e.currentTarget) {
            onClose();
          }
        }}
        {...props}
      >
        <div className={cn("bg-card text-card-foreground border border-border/80 rounded-2xl p-6 max-w-md w-full flex flex-col gap-4 shadow-2xl shadow-black/50 animate-in fade-in zoom-in-95 duration-150", className)}>
          {children}
        </div>
      </div>,
      document.body
    );
  }
);
Dialog.displayName = "Dialog";

export const DialogHeader = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div ref={ref} className={cn("flex flex-col gap-1.5 text-left", className)} {...props} />
  )
);
DialogHeader.displayName = "DialogHeader";

export const DialogTitle = React.forwardRef<HTMLHeadingElement, React.HTMLAttributes<HTMLHeadingElement>>(
  ({ className, ...props }, ref) => (
    <h3 ref={ref} className={cn("text-lg font-bold text-foreground", className)} {...props} />
  )
);
DialogTitle.displayName = "DialogTitle";

export const DialogDescription = React.forwardRef<HTMLParagraphElement, React.HTMLAttributes<HTMLParagraphElement>>(
  ({ className, ...props }, ref) => (
    <p ref={ref} className={cn("text-sm text-muted-foreground", className)} {...props} />
  )
);
DialogDescription.displayName = "DialogDescription";

export const DialogContent = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div ref={ref} className={cn("flex flex-col gap-3", className)} {...props} />
  )
);
DialogContent.displayName = "DialogContent";

export const DialogFooter = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div ref={ref} className={cn("flex justify-end gap-3 mt-2", className)} {...props} />
  )
);
DialogFooter.displayName = "DialogFooter";
