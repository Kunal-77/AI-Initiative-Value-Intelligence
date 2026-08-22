"use client";

import React, { useEffect, useState, useRef } from "react";
import { useTheme } from "next-themes";
import { Sun, Moon, Laptop } from "lucide-react";
import { cn } from "./cn";

export interface ThemeToggleProps extends React.HTMLAttributes<HTMLDivElement> {}

export function ThemeToggle({ className, ...props }: ThemeToggleProps) {
  const { theme, setTheme, resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setMounted(true);
    // Close dropdown on click outside
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  if (!mounted) {
    return (
      <div className="w-8 h-8 rounded-md bg-secondary border border-border animate-pulse" />
    );
  }

  const activeIcon = () => {
    if (theme === "system") return <Laptop className="w-4 h-4 text-accent" />;
    return resolvedTheme === "dark" ? (
      <Moon className="w-4 h-4 text-blue-400" />
    ) : (
      <Sun className="w-4 h-4 text-amber-500" />
    );
  };

  return (
    <div ref={dropdownRef} className={cn("relative inline-block text-left", className)} {...props}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center justify-center w-8 h-8 rounded-md text-muted-foreground hover:text-foreground bg-card border border-border transition-colors hover:bg-secondary focus:outline-none focus:ring-2 focus:ring-ring/20 focus:border-ring"
        aria-expanded={isOpen}
        aria-label="Toggle theme selector dropdown"
        title="Choose Theme"
      >
        {activeIcon()}
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-1.5 w-32 rounded-lg border border-border bg-card p-1 shadow-lg z-50 animate-in fade-in duration-100 focus:outline-none">
          {[
            { value: "light", label: "Light", icon: Sun, color: "text-amber-500" },
            { value: "dark", label: "Dark", icon: Moon, color: "text-blue-400" },
            { value: "system", label: "System", icon: Laptop, color: "text-accent" },
          ].map((item) => {
            const Icon = item.icon;
            const isSelected = theme === item.value;
            return (
              <button
                key={item.value}
                type="button"
                onClick={() => {
                  setTheme(item.value);
                  setIsOpen(false);
                }}
                className={cn(
                  "w-full flex items-center gap-2 px-2.5 py-1.5 rounded-md text-left text-xs font-medium transition-colors hover:bg-secondary",
                  isSelected ? "bg-accent/10 text-foreground font-bold" : "text-muted-foreground"
                )}
              >
                <Icon className={cn("w-3.5 h-3.5", item.color)} />
                <span>{item.label}</span>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
