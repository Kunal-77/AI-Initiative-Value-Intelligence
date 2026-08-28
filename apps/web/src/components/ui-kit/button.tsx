import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-full text-sm font-medium cursor-pointer transition-all duration-300 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 disabled:cursor-not-allowed [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0",
  {
    variants: {
      variant: {
        default: "bg-white dark:bg-zinc-100 text-black dark:text-zinc-950 font-bold uppercase tracking-wider hover:bg-white/90 dark:hover:bg-zinc-100/90 hover:shadow-[0_0_18px_rgba(45,212,191,0.55)]",
        destructive: "bg-destructive text-destructive-foreground font-semibold hover:bg-destructive/90 hover:shadow-[0_0_18px_rgba(244,63,94,0.45)]",
        outline:
          "border border-input bg-background shadow-sm font-semibold hover:bg-accent hover:text-accent-foreground hover:border-teal-500/30 hover:shadow-[0_0_18px_rgba(45,212,191,0.45)]",
        secondary: "bg-secondary text-secondary-foreground shadow-sm font-semibold hover:bg-secondary/80 hover:border-teal-500/30 hover:shadow-[0_0_18px_rgba(45,212,191,0.45)]",
        ghost: "font-semibold hover:bg-accent hover:text-accent-foreground hover:shadow-[0_0_12px_rgba(45,212,191,0.35)]",
        link: "text-primary underline-offset-4 hover:underline",
      },
      size: {
        default: "h-9 px-4 py-2",
        sm: "h-8 rounded-full px-3 text-xs",
        lg: "h-10 rounded-full px-8",
        icon: "h-9 w-9",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  },
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>, VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button";
    return (
      <Comp className={cn(buttonVariants({ variant, size, className }))} ref={ref} {...props} />
    );
  },
);
Button.displayName = "Button";

export { Button, buttonVariants };
