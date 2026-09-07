"use client";

import React from "react";
import { CreditCard, Plus, ShieldCheck, Check } from "lucide-react";
import { PaymentMethod } from "../../types/personal";
import { cn } from "../ui/cn";

export interface PaymentMethodsCardProps {
  paymentMethods: PaymentMethod[];
  onAddClick: () => void;
  loading?: boolean;
}

export function PaymentMethodsCard({
  paymentMethods,
  onAddClick,
  loading = false,
}: PaymentMethodsCardProps) {
  return (
    <div className="rounded-xl border border-[#202630] bg-[#11151C] shadow-md overflow-hidden flex flex-col space-y-4 p-5 sm:p-6 transition-all">
      {/* Header */}
      <div className="flex items-center justify-between gap-3 border-b border-[#202630] pb-3.5">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-lg bg-[#C9A86A]/10 border border-[#C9A86A]/20 text-[#C9A86A]">
            <CreditCard className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-[#F4F1EA]">Payment Instruments Vault</h3>
            <p className="text-[11px] text-[#8F98A8]">
              Secure tokenized payment methods linked to active recurring subscriptions
            </p>
          </div>
        </div>

        <button
          onClick={onAddClick}
          className="text-xs h-8 px-3 rounded-lg font-bold bg-[#171C24] text-[#F4F1EA] border border-[#202630] hover:border-[#7DA7D9]/40 hover:bg-[#202630] transition-all flex items-center gap-1.5 cursor-pointer active:scale-[0.98]"
        >
          <Plus className="w-3.5 h-3.5 text-[#7DA7D9]" /> Add Instrument
        </button>
      </div>

      {/* Content */}
      {loading ? (
        <div className="p-4 space-y-3">
          {Array.from({ length: 2 }).map((_, i) => (
            <div key={i} className="h-10 bg-[#171C24] rounded animate-pulse" />
          ))}
        </div>
      ) : paymentMethods.length === 0 ? (
        <div className="p-8 text-center text-xs text-[#8F98A8] border border-[#202630] rounded-xl bg-[#0E1116] space-y-2 flex flex-col items-center">
          <CreditCard className="w-6 h-6 text-[#8F98A8] opacity-50" />
          <span className="font-semibold text-[#F4F1EA]">No Payment Methods Stored</span>
          <p className="max-w-xs">Register payment cards to link and categorize recurring charges.</p>
          <button
            onClick={onAddClick}
            className="mt-1 text-xs text-[#7DA7D9] font-bold hover:underline cursor-pointer"
          >
            Add card now
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-2.5">
          {paymentMethods.map((pm, index) => (
            <div
              key={pm.id}
              className="p-3.5 sm:p-4 rounded-xl border border-[#202630] bg-[#0E1116] flex items-center justify-between gap-3 hover:border-[#7DA7D9]/40 transition-all text-xs"
            >
              <div className="flex items-center gap-3 min-w-0">
                <div className="p-2 rounded-lg bg-[#171C24] border border-[#202630] text-[#7DA7D9] shrink-0">
                  <CreditCard className="w-4 h-4" />
                </div>
                <div className="space-y-0.5 min-w-0">
                  <div className="flex items-center gap-1.5 whitespace-nowrap">
                    <span className="font-bold text-[#F4F1EA] truncate">{pm.cardBrand || "Credit Card"}</span>
                    {index === 0 && (
                      <span className="text-[9px] font-mono font-bold bg-[#7DA7D9]/15 text-[#7DA7D9] px-1.5 py-0.5 rounded shrink-0">
                        PRIMARY
                      </span>
                    )}
                  </div>
                  <span className="text-[11px] font-mono text-[#8F98A8] block whitespace-nowrap">
                    •••• •••• •••• {pm.lastFour || "••••"}
                  </span>
                </div>
              </div>

              <span className="text-[10px] font-mono text-[#8F98A8] shrink-0 whitespace-nowrap">
                Exp: {pm.expiresAt ? pm.expiresAt.substring(0, 7) : "N/A"}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
