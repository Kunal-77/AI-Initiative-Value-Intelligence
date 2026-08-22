"use client";

import React, { useState, useRef, useEffect } from "react";
import { useAuth, useUser, useClerk, useOrganizationList } from "@clerk/nextjs";
import { useTheme } from "next-themes";
import { useRouter } from "next/navigation";
import { User, Briefcase, Settings, LogOut, Moon, Sun, ShieldCheck, Laptop, Layers } from "lucide-react";
import { useWorkspaceTransition } from "./WorkspaceTransitionContext";
import { cn } from "./cn";

export interface UserMenuProps extends React.HTMLAttributes<HTMLDivElement> {}

export function UserMenu({ className, ...props }: UserMenuProps) {
  const { isLoaded: authLoaded, isSignedIn } = useAuth();
  const { user, isLoaded: userLoaded } = useUser();
  const { signOut, openUserProfile } = useClerk();
  const { setActive, userMemberships } = useOrganizationList({
    userMemberships: authLoaded && isSignedIn ? { keepPreviousData: true } : undefined,
  });
  const { startTransition, endTransition } = useWorkspaceTransition();

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

  const handleSwitchToPersonal = async () => {
    setOpen(false);
    startTransition("Personal Workspace", false);
    try {
      if (setActive) {
        await setActive({ organization: null });
      }
      router.push("/personal");
    } catch (err) {
      console.error("Failed to switch to Personal Workspace:", err);
      endTransition();
    }
  };

  const handleSwitchToBusiness = async () => {
    setOpen(false);
    const orgs = userMemberships?.data || [];
    if (orgs.length === 1 && setActive) {
      const org = orgs[0].organization;
      startTransition(org.name, true);
      try {
        await setActive({ organization: org.id });
        router.push("/business/initiatives");
      } catch (err) {
        console.error("Failed to switch to Business Workspace:", err);
        endTransition();
      }
    } else {
      router.push("/workspace-select?flow=business");
    }
  };

  if (!authLoaded || !isSignedIn || !userLoaded || !user) {
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
    <div ref={dropdownRef} className={cn("relative inline-block text-left select-none", className)} {...props}>
      <button
        type="button"
        onClick={() => setOpen((prev) => !prev)}
        className="flex items-center justify-center w-8 h-8 rounded-full bg-gradient-to-tr from-blue-600 to-indigo-600 text-white font-semibold text-xs shadow-md shadow-blue-500/20 hover:scale-105 transition-all focus:outline-none focus:ring-2 focus:ring-ring/50 cursor-pointer"
        aria-label="User menu"
      >
        {user.imageUrl ? (
          <img
            src={user.imageUrl}
            alt={fullName}
            className="w-full h-full rounded-full object-cover"
          />
        ) : (
          <span>{initials}</span>
        )}
      </button>

      {open && (
        <div className="absolute right-0 mt-2 w-64 rounded-xl border border-border bg-card text-card-foreground shadow-xl z-50 overflow-hidden animate-in fade-in zoom-in-95 duration-100">
          {/* Header info */}
          <div className="p-3 border-b border-border bg-secondary/30">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-full bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center text-white font-bold text-xs shrink-0 overflow-hidden">
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
              Navigation & Workspaces
            </div>
            <button
              type="button"
              onClick={handleSwitchToBusiness}
              className="w-full flex items-center gap-2.5 px-2.5 py-1.5 rounded-md text-foreground hover:bg-secondary transition-colors cursor-pointer"
            >
              <Briefcase className="w-3.5 h-3.5 text-blue-500" />
              <span>Business Workspace</span>
            </button>
            <button
              type="button"
              onClick={handleSwitchToPersonal}
              className="w-full flex items-center gap-2.5 px-2.5 py-1.5 rounded-md text-foreground hover:bg-secondary transition-colors cursor-pointer"
            >
              <User className="w-3.5 h-3.5 text-sky-400" />
              <span>Personal Workspace</span>
            </button>
            <button
              type="button"
              onClick={() => {
                setOpen(false);
                router.push("/workspace-select");
              }}
              className="w-full flex items-center gap-2.5 px-2.5 py-1.5 rounded-md text-foreground hover:bg-secondary transition-colors cursor-pointer"
            >
              <Layers className="w-3.5 h-3.5 text-muted-foreground" />
              <span>Switch Workspace</span>
            </button>
            
            <div className="h-px bg-border/60 my-1" />

            <button
              type="button"
              onClick={() => {
                setOpen(false);
                if (openUserProfile) {
                  openUserProfile();
                } else {
                  router.push("/personal");
                }
              }}
              className="w-full flex items-center gap-2.5 px-2.5 py-1.5 rounded-md text-foreground hover:bg-secondary transition-colors cursor-pointer"
            >
              <Settings className="w-3.5 h-3.5 text-muted-foreground" />
              <span>Manage Account</span>
            </button>
            <button
              type="button"
              onClick={toggleTheme}
              className="w-full flex items-center justify-between px-2.5 py-1.5 rounded-md text-foreground hover:bg-secondary transition-colors cursor-pointer"
            >
              <div className="flex items-center gap-2.5">
                {theme === "system" ? (
                  <Laptop className="w-3.5 h-3.5 text-accent" />
                ) : resolvedTheme === "dark" ? (
                  <Moon className="w-3.5 h-3.5 text-blue-400" />
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
                setOpen(false);
                await signOut();
                router.push("/");
              }}
              className="w-full flex items-center gap-2.5 px-2.5 py-1.5 rounded-md text-rose-600 dark:text-rose-400 hover:bg-rose-500/10 transition-colors font-medium text-xs cursor-pointer"
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
