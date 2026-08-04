"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Bell, Bookmark, Check, ArrowRight, ShieldCheck, Sparkles, DollarSign, Layers } from "lucide-react";
import { NotificationItem, NotificationType } from "../../types/notification";
import { Badge, Button } from "../ui";

export interface NotificationCenterDrawerProps {
  notifications: NotificationItem[];
  onMarkRead: (id: string) => void;
  onTogglePin: (id: string) => void;
}

export function NotificationCenterDrawer({
  notifications,
  onMarkRead,
  onTogglePin,
}: NotificationCenterDrawerProps) {
  const [filterTab, setFilterTab] = useState<string>("ALL");

  const filtered = notifications.filter((item) => {
    if (filterTab === "UNREAD") return !item.read;
    if (filterTab === "PINNED") return item.pinned;
    if (filterTab === "AI") return item.type === "AI_RECOMMENDATION";
    if (filterTab === "WORKFLOW") return item.type === "WORKFLOW";
    return true;
  });

  return (
    <div className="p-5 rounded-xl border border-border bg-card text-card-foreground shadow-2xs space-y-4">
      <div className="flex items-center justify-between border-b border-border/60 pb-2">
        <div className="flex items-center gap-2">
          <Bell className="w-4 h-4 text-accent" />
          <h3 className="text-sm font-bold text-foreground">Enterprise Notification Center</h3>
        </div>
        <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-accent/15 text-accent font-bold">
          {notifications.filter((n) => !n.read).length} Unread
        </span>
      </div>

      {/* Filter Tabs */}
      <div className="flex gap-1 text-[10px] overflow-x-auto py-1">
        {[
          { id: "ALL", label: "All Feed" },
          { id: "UNREAD", label: "Unread" },
          { id: "PINNED", label: "Pinned" },
          { id: "AI", label: "AI Signals" },
          { id: "WORKFLOW", label: "Governance" },
        ].map((tab) => (
          <button
            key={tab.id}
            type="button"
            onClick={() => setFilterTab(tab.id)}
            className={`px-2.5 py-1 rounded border font-semibold transition-colors shrink-0 ${
              filterTab === tab.id
                ? "bg-accent/15 text-accent border-accent/30 font-bold"
                : "bg-secondary text-muted-foreground border-border hover:bg-secondary/80"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Notification List */}
      <div className="space-y-2.5 max-h-80 overflow-y-auto pr-1">
        {filtered.length === 0 ? (
          <p className="text-xs text-muted-foreground py-4 text-center">No notifications found.</p>
        ) : (
          filtered.map((item) => {
            let badgeStyle = "bg-secondary text-secondary-foreground border-border";
            if (item.type === "AI_RECOMMENDATION") badgeStyle = "bg-accent/15 text-accent border-accent/30";
            if (item.type === "WORKFLOW") badgeStyle = "bg-indigo-500/10 text-indigo-600 border-indigo-500/20";
            if (item.type === "FINANCIAL") badgeStyle = "bg-emerald-500/10 text-emerald-600 border-emerald-500/20";

            return (
              <div
                key={item.id}
                className={`p-3.5 rounded-lg border transition-all text-xs space-y-1.5 ${
                  !item.read ? "bg-accent/5 border-accent/30" : "bg-secondary/20 border-border opacity-90"
                }`}
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-1.5 min-w-0">
                    <span className={`text-[9px] font-bold uppercase px-1.5 py-0.2 rounded border shrink-0 ${badgeStyle}`}>
                      {item.type.replace("_", " ")}
                    </span>
                    <span className="font-bold text-foreground truncate">{item.title}</span>
                  </div>
                  <span className="text-[9px] font-mono text-muted-foreground shrink-0">{item.timestamp}</span>
                </div>

                <p className="text-[11px] text-muted-foreground leading-relaxed">{item.message}</p>

                <div className="pt-1 flex items-center justify-between border-t border-border/40 text-[10px]">
                  {item.actionHref ? (
                    <Link href={item.actionHref} className="text-accent hover:underline font-bold flex items-center">
                      Open Module <ArrowRight className="w-3 h-3 ml-0.5" />
                    </Link>
                  ) : <span />}

                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => onTogglePin(item.id)}
                      className={`p-1 rounded hover:bg-secondary ${item.pinned ? "text-accent font-bold" : "text-muted-foreground"}`}
                      title="Pin Notification"
                    >
                      <Bookmark className="w-3.5 h-3.5" />
                    </button>
                    {!item.read && (
                      <button
                        type="button"
                        onClick={() => onMarkRead(item.id)}
                        className="text-muted-foreground hover:text-foreground font-semibold flex items-center gap-0.5"
                      >
                        <Check className="w-3 h-3" /> Mark Read
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
