"use client";

import React, { useState } from "react";
import { Sliders, Bell, Mail, MessageSquare } from "lucide-react";
import { NotificationPreference } from "../../types/notification";
import { Select } from "../ui";

export interface NotificationPreferencesCardProps {
  preferences: NotificationPreference[];
}

export function NotificationPreferencesCard({ preferences: initialPrefs }: NotificationPreferencesCardProps) {
  const [prefs, setPrefs] = useState(initialPrefs);

  const toggleChannel = (idx: number) => {
    setPrefs((prev) =>
      prev.map((item, i) => (i === idx ? { ...item, enabled: !item.enabled } : item))
    );
  };

  return (
    <div className="p-5 rounded-xl border border-border bg-card text-card-foreground shadow-2xs space-y-4">
      <div className="flex items-center justify-between border-b border-border/60 pb-2">
        <div className="flex items-center gap-2">
          <Sliders className="w-4 h-4 text-accent" />
          <h3 className="text-sm font-bold text-foreground">Enterprise Channel Delivery Preferences</h3>
        </div>
        <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-secondary text-muted-foreground border border-border">
          Per-User Configuration
        </span>
      </div>

      <div className="space-y-3">
        {prefs.map((p, idx) => (
          <div key={idx} className="p-3.5 rounded-lg bg-secondary/30 border border-border flex items-center justify-between text-xs">
            <div className="space-y-0.5">
              <span className="font-bold text-foreground block">{p.channel} Channel ({p.category})</span>
              <span className="text-[10px] text-muted-foreground">Frequency: {p.digestFrequency}</span>
            </div>

            <button
              type="button"
              onClick={() => toggleChannel(idx)}
              className={`px-3 py-1 rounded text-xs font-bold transition-colors ${
                p.enabled
                  ? "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30"
                  : "bg-secondary text-muted-foreground border border-border"
              }`}
            >
              {p.enabled ? "Active" : "Muted"}
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
