"use client";

import React, { useState } from "react";
import {
  CreditCard,
  AlertTriangle,
  CheckCircle2,
  RefreshCw,
  Link2Off,
  Sparkles,
  ShieldCheck,
  Building2,
  Receipt,
} from "lucide-react";
import { cn } from "../ui/cn";
import { BankConnection } from "../../types/personal";

export interface ConnectAccountPanelProps {
  connection?: BankConnection | null;
  transactionCount?: number;
  isSyncing?: boolean;
  onConnect?: () => void;
  onSync?: () => void;
  onDisconnect?: (connectionId: string) => void;
}

export function ConnectAccountPanel({
  connection,
  transactionCount = 0,
  isSyncing = false,
  onConnect,
  onSync,
  onDisconnect,
}: ConnectAccountPanelProps) {
  const [disconnecting, setDisconnecting] = useState(false);
  const isConnected = !!connection && connection.status !== "REVOKED";

  const formattedLastSync = connection?.lastSyncedAt
    ? new Date(connection.lastSyncedAt).toLocaleString([], {
        month: "short",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      })
    : "Never synced";

  const effectiveTxnCount = connection?.transactionCount ?? transactionCount;

  const handleDisconnect = async () => {
    if (!connection || !onDisconnect) return;
    if (
      confirm(
        "Disconnect simulated connection? This will remove the demo statement feed, associated transactions, and unconfirmed candidates."
      )
    ) {
      setDisconnecting(true);
      try {
        await onDisconnect(connection.id);
      } finally {
        setDisconnecting(false);
      }
    }
  };

  return (
    <div className="p-5 sm:p-6 rounded-xl border border-[#202630] bg-[#11151C] text-[#F4F1EA] shadow-md space-y-4 hover:border-[#7DA7D9]/30 transition-all duration-200 relative overflow-hidden">
      {/* Top Header Row */}
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-lg bg-[#7DA7D9]/10 border border-[#7DA7D9]/20 text-[#7DA7D9]">
            <Building2 className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-[#F4F1EA]">Account & Statement Connection</h3>
            <p className="text-[11px] text-[#8F98A8]">
              Automated financial statement ingestion & recurring payment detection
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-[10px] font-mono px-2.5 py-0.5 rounded-md bg-[#C9A86A]/10 border border-[#C9A86A]/25 text-[#C9A86A] font-bold tracking-wider uppercase whitespace-nowrap">
            Simulated Connection
          </span>
          {isConnected && (
            <span className="text-[10px] font-mono px-2 py-0.5 rounded-md bg-emerald-500/10 border border-emerald-500/25 text-emerald-400 font-bold uppercase whitespace-nowrap">
              Demo Feed
            </span>
          )}
        </div>
      </div>

      {!isConnected ? (
        <div className="p-4 rounded-xl bg-[#0E1116] border border-[#202630] space-y-3.5">
          {/* Status Header */}
          <div className="flex items-center justify-between gap-2 border-b border-[#202630] pb-3">
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="w-9 h-9 rounded-lg bg-[#171C24] border border-[#202630] flex items-center justify-center text-[#7DA7D9] shrink-0 shadow-inner">
                <Building2 className="w-4 h-4" />
              </div>
              <div className="min-w-0">
                <span className="text-xs font-bold text-[#F4F1EA] block truncate">
                  Simulated Banking Provider
                </span>
                <span className="text-[10px] font-mono text-[#8F98A8] block whitespace-nowrap">
                  Sandbox Ingestion Gateway
                </span>
              </div>
            </div>

            <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-[#171C24] border border-[#202630] text-[#8F98A8] whitespace-nowrap shrink-0">
              NOT CONNECTED
            </span>
          </div>

          <div className="flex items-start gap-2.5">
            <AlertTriangle className="w-4 h-4 text-[#C9A86A] shrink-0 mt-0.5" />
            <p className="text-[11px] text-[#8F98A8] leading-relaxed">
              Connect the built-in simulated bank provider to ingest realistic 90-day multi-cadence statements
              (Netflix, OpenAI, Spotify, AWS, GitHub) and test automatic subscription discovery.
            </p>
          </div>

          <button
            onClick={onConnect}
            className="w-full text-xs h-9 px-4 rounded-lg font-bold border border-[#7DA7D9]/40 hover:border-[#7DA7D9]/70 bg-[#7DA7D9]/15 hover:bg-[#7DA7D9]/25 transition-all text-[#7DA7D9] cursor-pointer flex items-center justify-center gap-2 shadow-sm active:scale-[0.98] whitespace-nowrap"
          >
            <Sparkles className="w-3.5 h-3.5 text-[#7DA7D9]" />
            Connect Simulated Account (Demo Data)
          </button>
        </div>
      ) : (
        <div className="p-4 rounded-xl bg-[#0E1116] border border-[#202630] space-y-3.5">
          {/* Connected Institution Info */}
          <div className="flex items-center justify-between gap-2 border-b border-[#202630] pb-3">
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="w-9 h-9 rounded-lg bg-[#171C24] border border-[#202630] flex items-center justify-center text-[#7DA7D9] shrink-0 shadow-inner">
                <Building2 className="w-4 h-4" />
              </div>
              <div className="min-w-0">
                <span className="text-xs font-bold text-[#F4F1EA] block truncate">
                  {connection.institutionName}
                </span>
                <span className="text-[10px] font-mono text-[#8F98A8] block whitespace-nowrap">
                  {connection.accountType} •••• {connection.accountMask}
                </span>
              </div>
            </div>

            <span
              className={cn(
                "text-[10px] font-mono font-bold px-2 py-0.5 rounded border flex items-center gap-1 shrink-0 whitespace-nowrap",
                isSyncing || connection.status === "SYNCING"
                  ? "bg-[#7DA7D9]/15 border-[#7DA7D9]/30 text-[#7DA7D9] animate-pulse"
                  : "bg-emerald-500/15 border-emerald-500/30 text-emerald-400"
              )}
            >
              <CheckCircle2 className="w-3 h-3" />
              {isSyncing || connection.status === "SYNCING" ? "SYNCING..." : "CONNECTED"}
            </span>
          </div>

          {/* Telemetry Stats Bar */}
          <div className="grid grid-cols-2 gap-3 text-xs border-b border-[#202630] pb-3">
            <div>
              <span className="text-[10px] font-mono uppercase text-[#8F98A8] block">Ingested Txns</span>
              <span className="font-bold font-mono text-xs text-[#F4F1EA] flex items-center gap-1 mt-0.5 whitespace-nowrap">
                <Receipt className="w-3 h-3 text-[#7DA7D9]" />
                {effectiveTxnCount} records
              </span>
            </div>

            <div>
              <span className="text-[10px] font-mono uppercase text-[#8F98A8] block">Last Synced</span>
              <span className="font-mono text-[11px] text-[#D9DEE7] truncate block mt-0.5 whitespace-nowrap">
                {formattedLastSync}
              </span>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="space-y-2.5 pt-1">
            <div className="flex items-center gap-2 text-[10px] text-[#8F98A8]">
              <ShieldCheck className="w-3.5 h-3.5 text-[#C9A86A] shrink-0" />
              <span className="leading-tight">Simulated test sandbox — zero real banking credentials used.</span>
            </div>

            <div className="flex gap-2">
              <button
                onClick={onSync}
                disabled={isSyncing}
                className="flex-1 text-xs h-8 px-3 rounded-lg font-bold bg-[#171C24] border border-[#202630] hover:border-[#7DA7D9]/50 hover:bg-[#202630] text-[#F4F1EA] cursor-pointer transition-all flex items-center justify-center gap-1.5 disabled:opacity-50 disabled:cursor-not-allowed active:scale-[0.98] whitespace-nowrap"
              >
                <RefreshCw className={cn("w-3.5 h-3.5 text-[#7DA7D9]", isSyncing && "animate-spin")} />
                {isSyncing ? "Ingesting..." : "Sync Feed Now"}
              </button>

              <button
                onClick={handleDisconnect}
                disabled={isSyncing || disconnecting}
                className="text-xs h-8 px-3 rounded-lg font-bold text-rose-400 hover:text-rose-300 hover:bg-rose-950/30 border border-rose-500/25 hover:border-rose-500/40 transition-all cursor-pointer disabled:opacity-50 flex items-center justify-center gap-1 active:scale-[0.98] whitespace-nowrap shrink-0"
                title="Disconnect Simulated Account"
              >
                <Link2Off className="w-3.5 h-3.5" />
                <span>Disconnect</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
