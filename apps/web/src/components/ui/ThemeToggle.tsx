"use client";

import React, { useEffect, useState } from "react";
import { Sun, Moon } from "lucide-react";
import { cn } from "./cn";

export interface ThemeToggleProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {}

export function ThemeToggle({ className, ...props }: ThemeToggleProps) {
  const [theme, setTheme] = useState<"light" | "dark">("dark");
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const stored = localStorage.getItem("theme");
    if (stored === "light" || stored === "dark") {
      setTheme(stored);
      document.documentElement.classList.toggle("dark", stored === "dark");
    } else {
      const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
      const initialTheme = prefersDark ? "dark" : "light";
      setTheme(initialTheme);
      document.documentElement.classList.toggle("dark", prefersDark);
    }
  }, []);

  const toggleTheme = () => {
    const nextTheme = theme === "dark" ? "light" : "dark";
    setTheme(nextTheme);
    localStorage.setItem("theme", nextTheme);
    document.documentElement.classList.toggle("dark", nextTheme === "dark");
  };

  if (!mounted) {
    return (
      <div className="w-8 h-8 rounded-md bg-secondary animate-pulse border border-border" />
    );
  }

  return (
    <button
      type="button"
      onClick={toggleTheme}
      className={cn(
        "relative flex items-center justify-center w-8 h-8 rounded-md text-muted-foreground hover:text-foreground bg-card/80 hover:bg-secondary border border-border transition-colors focus:outline-none focus:ring-2 focus:ring-ring/20 focus:border-ring",
        className
      )}
      aria-label={`Switch to ${theme === "dark" ? "light" : "dark"} mode`}
      title={`Switch to ${theme === "dark" ? "light" : "dark"} mode`}
      {...props}
    >
      {theme === "dark" ? (
        <Sun className="w-4 h-4 text-amber-400 transition-transform hover:rotate-45 duration-200" />
      ) : (
        <Moon className="w-4 h-4 text-zinc-600 dark:text-zinc-300 transition-transform hover:-rotate-12 duration-200" />
      )}
    </button>
  );
}
