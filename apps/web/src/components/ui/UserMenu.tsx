"use client";

import React, { useState, useRef, useEffect } from "react";
import { useUser, useClerk } from "@clerk/nextjs";
import { useTheme } from "next-themes";
import { useRouter } from "next/navigation";
import { User, Settings, LogOut, Moon, Sun, ShieldCheck, Laptop } from "lucide-react";
import { cn } from "./cn";

export interface UserMenuProps extends React.HTMLAttributes<HTMLDivElement> {}

export function UserMenu({ className, ...props }: UserMenuProps) {
  const { user, isLoaded } = useUser();
  const { signOut } = useClerk();
  const router = useRouter();
  const { theme, setTheme, resolvedTheme } = useTheme();
  const [open, setOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const toggleTheme = () => {
    if (theme === "light") {
      setTheme("dark");
    } else if (theme === "dark") {
      setTheme("system");
    } else {
      setTheme("light");
    }
  };

  if (!isLoaded || !user) {
    return (
      <div className="w-8 h-8 rounded-full bg-secondary animate-pulse border border-border" />
    );
  }

  const initials = user.firstName && user.lastName
    ? `${user.firstName[0]}${user.lastName[0]}`.toUpperCase()
    : user.primaryEmailAddress?.emailAddress?.[0]?.toUpperCase() || "U";

  const fullName = user.fullName || user.primaryEmailAddress?.emailAddress || "User";
  const primaryEmail = user.primaryEmailAddress?.emailAddress || "";

  return (
    <div ref={dropdownRef} className={cn("relative inline-block", className)} {...props}>
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className="flex items-center justify-center w-8 h-8 rounded-full bg-primary text-primary-foreground font-semibold text-xs border border-border hover:ring-2 hover:ring-ring/30 transition-all focus:outline-none focus:ring-2 focus:ring-ring overflow-hidden"
        aria-label="User Profile Menu"
        title={fullName}
      >
        {user.imageUrl ? (
          <img src={user.imageUrl} alt={fullName} className="w-full h-full object-cover" />
        ) : (
          <span>{initials}</span>
        )}
      </button>

      {open && (
        <div className="absolute right-0 mt-2 w-64 bg-card text-card-foreground rounded-lg border border-border shadow-xl z-50 overflow-hidden animate-in fade-in-50 zoom-in-95 duration-100">
          {/* Header info */}
          <div className="p-3.5 border-b border-border bg-secondary/30">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-full bg-primary text-primary-foreground font-semibold text-xs flex items-center justify-center shrink-0 overflow-hidden border border-border">
                {user.imageUrl ? (
                  <img src={user.imageUrl} alt={fullName} className="w-full h-full object-cover" />
                ) : (
                  <span>{initials}</span>
                )}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs font-semibold text-foreground truncate">{fullName}</p>
                <p className="text-[11px] text-muted-foreground truncate">{primaryEmail}</p>
              </div>
            </div>
            <div className="mt-2.5 flex items-center gap-1.5 text-[10px] font-medium text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
              <ShieldCheck className="w-3 h-3 shrink-0" />
              <span>Verified Session Context</span>
            </div>
          </div>

          {/* Menu items */}
          <div className="p-1 text-xs">
            <div className="px-2 py-1.5 text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">
              Account Options
            </div>
            <button
              type="button"
              onClick={() => {
                setOpen(false);
                router.push("/personal");
              }}
              className="w-full flex items-center gap-2.5 px-2.5 py-1.5 rounded-md text-foreground hover:bg-secondary transition-colors"
            >
              <User className="w-3.5 h-3.5 text-muted-foreground" />
              <span>Profile & Workspace</span>
            </button>
            <button
              type="button"
              onClick={() => {
                setOpen(false);
                router.push("/personal");
              }}
              className="w-full flex items-center gap-2.5 px-2.5 py-1.5 rounded-md text-foreground hover:bg-secondary transition-colors"
            >
              <Settings className="w-3.5 h-3.5 text-muted-foreground" />
              <span>Settings</span>
            </button>
            <button
              type="button"
              onClick={toggleTheme}
              className="w-full flex items-center justify-between px-2.5 py-1.5 rounded-md text-foreground hover:bg-secondary transition-colors"
            >
              <div className="flex items-center gap-2.5">
                {theme === "system" ? (
                  <Laptop className="w-3.5 h-3.5 text-accent" />
                ) : resolvedTheme === "dark" ? (
                  <Moon className="w-3.5 h-3.5 text-purple-400" />
                ) : (
                  <Sun className="w-3.5 h-3.5 text-amber-500" />
                )}
                <span>Theme</span>
              </div>
              <span className="text-[10px] text-muted-foreground uppercase font-mono">{theme}</span>
            </button>
          </div>

          {/* Footer / Sign Out */}
          <div className="p-1 border-t border-border">
            <button
              type="button"
              onClick={async () => {
                await signOut();
                router.push("/");
              }}
              className="w-full flex items-center gap-2.5 px-2.5 py-1.5 rounded-md text-rose-600 dark:text-rose-400 hover:bg-rose-500/10 transition-colors font-medium text-xs"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>Sign Out</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
