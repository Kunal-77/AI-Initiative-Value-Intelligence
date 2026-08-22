"use client";

import React, { useState, useRef, useEffect } from "react";
import { Bell, Sparkles, AlertCircle, CheckCircle2 } from "lucide-react";
import { cn } from "./cn";

export interface NotificationItem {
  id: string;
  title: string;
  description: string;
  timestamp: string;
  type: "ai" | "alert" | "success";
  read: boolean;
}

const DEFAULT_NOTIFICATIONS: NotificationItem[] = [
  {
    id: "1",
    title: "AI Optimization Recommendation",
    description: "New cost reduction opportunity detected for Customer Support Automation.",
    timestamp: "10m ago",
    type: "ai",
    read: false,
  },
  {
    id: "2",
    title: "Baseline Milestone Approved",
    description: "Customer Support Automation baseline metrics have been approved.",
    timestamp: "1h ago",
    type: "success",
    read: false,
  },
  {
    id: "3",
    title: "Cost Item Variance Alert",
    description: "Cloud compute actual spend exceeded planned budget by 12%.",
    timestamp: "3h ago",
    type: "alert",
    read: true,
  },
];

export interface NotificationButtonProps extends React.HTMLAttributes<HTMLDivElement> {}

export function NotificationButton({ className, ...props }: NotificationButtonProps) {
  const [open, setOpen] = useState(false);
  const [notifications, setNotifications] = useState<NotificationItem[]>(DEFAULT_NOTIFICATIONS);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const unreadCount = notifications.filter((n) => !n.read).length;

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const markAllRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
  };

  return (
    <div ref={dropdownRef} className={cn("relative inline-block", className)} {...props}>
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className="relative flex items-center justify-center w-8 h-8 rounded-lg text-muted-foreground hover:text-foreground bg-card hover:bg-secondary/80 border border-border/80 transition-all focus:outline-none focus:ring-2 focus:ring-blue-500/20 cursor-pointer"
        aria-label="Notifications"
        title="Notifications"
      >
        <Bell className="w-4 h-4" />
        {unreadCount > 0 && (
          <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-blue-500 ring-2 ring-background animate-pulse" />
        )}
      </button>

      {open && (
        <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-card text-card-foreground rounded-2xl border border-border/80 shadow-2xl z-50 overflow-hidden animate-in fade-in-50 zoom-in-95 duration-100">
          <div className="px-4 py-3 border-b border-border/70 flex items-center justify-between bg-secondary/30">
            <div className="flex items-center gap-2">
              <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Notifications
              </h3>
              {unreadCount > 0 && (
                <span className="text-[10px] bg-blue-500/10 text-blue-600 dark:text-blue-400 font-semibold px-1.5 py-0.5 rounded-full border border-blue-500/20">
                  {unreadCount} new
                </span>
              )}
            </div>
            {unreadCount > 0 && (
              <button
                type="button"
                onClick={markAllRead}
                className="text-xs text-blue-500 dark:text-blue-400 hover:underline font-medium cursor-pointer"
              >
                Mark all read
              </button>
            )}
          </div>

          <div className="max-h-80 overflow-y-auto divide-y divide-border/60">
            {notifications.map((n) => (
              <div
                key={n.id}
                className={cn(
                  "p-3.5 flex gap-3 transition-colors hover:bg-secondary/40",
                  !n.read && "bg-blue-500/5"
                )}
              >
                <div className="shrink-0 mt-0.5">
                  {n.type === "ai" && <Sparkles className="w-4 h-4 text-cyan-500 dark:text-cyan-400" />}
                  {n.type === "alert" && <AlertCircle className="w-4 h-4 text-rose-500" />}
                  {n.type === "success" && <CheckCircle2 className="w-4 h-4 text-emerald-500" />}
                </div>
                <div className="flex-1 text-xs">
                  <div className="flex items-center justify-between gap-2 mb-0.5">
                    <p className="font-semibold text-foreground">{n.title}</p>
                    <span className="text-[10px] font-mono text-muted-foreground shrink-0">{n.timestamp}</span>
                  </div>
                  <p className="text-muted-foreground leading-relaxed">{n.description}</p>
                </div>
              </div>
            ))}
          </div>

          <div className="p-2 border-t border-border text-center bg-secondary/30">
            <span className="text-[11px] text-muted-foreground">
              Value Intelligence Decision Platform
            </span>
          </div>
        </div>
      )}
    </div>
  );
}
