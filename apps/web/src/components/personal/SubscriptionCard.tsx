"use client";

import React from "react";
import { Cpu, Tv, Music, Cloud, Layers, Trash2, Calendar, CreditCard, ExternalLink } from "lucide-react";
import { Subscription, PaymentMethod } from "@/types/personal";

export interface SubscriptionCardProps {
  subscription: Subscription;
  paymentMethods?: PaymentMethod[];
  renewalDate?: string;
  onDelete?: (id: string) => void;
  isDemo?: boolean;
}

export function SubscriptionCard({
  subscription,
  paymentMethods = [],
  renewalDate,
  onDelete,
  isDemo = false,
}: SubscriptionCardProps) {
  // Map subscription type to icon and colors
  const getCategoryTheme = (type: string) => {
    switch (type) {
      case "ai":
        return {
          icon: Cpu,
          badgeLabel: "AI & Productivity",
          colorClass: "text-[#7DA7D9] bg-[#7DA7D9]/10 border-[#7DA7D9]/25",
        };
      case "cloud":
        return {
          icon: Cloud,
          badgeLabel: "Cloud & Software",
          colorClass: "text-[#C9A86A] bg-[#C9A86A]/10 border-[#C9A86A]/25",
        };
      default:
        const catName = subscription.category?.name?.toUpperCase() || "";
        if (catName.includes("ENTERTAINMENT") || catName.includes("MEDIA")) {
          return {
            icon: Tv,
            badgeLabel: "Entertainment",
            colorClass: "text-[#C9A86A] bg-[#C9A86A]/10 border-[#C9A86A]/25",
          };
        }
        if (catName.includes("PRODUCTIVITY") || catName.includes("CREATIVE")) {
          return {
            icon: Layers,
            badgeLabel: "Productivity",
            colorClass: "text-[#7DA7D9] bg-[#7DA7D9]/10 border-[#7DA7D9]/25",
          };
        }
        return {
          icon: Layers,
          badgeLabel: "Other Subscription",
          colorClass: "text-[#8F98A8] bg-[#171C24] border-[#202630]",
        };
    }
  };

  const theme = getCategoryTheme(subscription.subscriptionType);
  const CatIcon = theme.icon;

  // Retrieve payment method details
  const linkedPm = paymentMethods.find(pm => pm.id === subscription.paymentMethodId) || subscription.paymentMethod;
  const cardLastFour = linkedPm?.lastFour;
  const cardBrand = linkedPm?.cardBrand || linkedPm?.type || "Card";

  const handleDeleteClick = () => {
    if (onDelete && confirm(`Are you sure you want to cancel and delete the tracking for "${subscription.name}"?`)) {
      onDelete(subscription.id);
    }
  };

  return (
    <div className="relative group overflow-hidden rounded-xl border border-[#202630] bg-[#11151C]/90 backdrop-blur-xl p-5 shadow-sm hover:border-[#7DA7D9]/40 hover:shadow-lg transition-all duration-200">

      {/* Grid Layout to align items precisely in an enterprise row */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-center text-xs">

        {/* Column 1: Avatar initials, Subscription Name, Category Tag & Badge (Left - 4 cols) */}
        <div className="lg:col-span-4 flex items-center gap-3.5 min-w-0">
          <div className="w-11 h-11 rounded-lg flex items-center justify-center font-bold text-xs uppercase bg-[#171C24] border border-[#202630] text-[#F4F1EA] tracking-widest shrink-0 group-hover:border-[#7DA7D9]/40 group-hover:text-[#7DA7D9] transition-colors">
            {subscription.name.substring(0, 2)}
          </div>
          <div className="space-y-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <h4 className="text-sm font-bold text-[#F4F1EA] truncate group-hover:text-[#7DA7D9] transition-colors" title={subscription.name}>
                {subscription.name}
              </h4>
              {isDemo ? (
                <span className="inline-flex items-center text-[9px] font-mono font-bold text-[#C9A86A] bg-[#C9A86A]/10 border border-[#C9A86A]/20 px-1.5 py-0.5 rounded-full whitespace-nowrap">
                  Simulated
                </span>
              ) : (
                <span className="inline-flex items-center text-[9px] font-mono font-bold text-[#7DA7D9] bg-[#7DA7D9]/10 border border-[#7DA7D9]/20 px-1.5 py-0.5 rounded-full whitespace-nowrap">
                  Active
                </span>
              )}
            </div>
            <span className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-[9px] font-bold uppercase tracking-wider border ${theme.colorClass}`}>
              <CatIcon className="w-2.5 h-2.5" /> {theme.badgeLabel}
            </span>
          </div>
        </div>

        {/* Column 2: Cost Amount, Plan details & Provider (Center-left - 3 cols) */}
        <div className="lg:col-span-3 space-y-1 min-w-0">
          <div className="flex items-baseline gap-1">
            <span className="text-base font-bold font-mono text-[#F4F1EA]">
              ${subscription.costAmount.toFixed(2)}
            </span>
            <span className="text-[10px] text-[#8F98A8] lowercase font-mono">
              / {subscription.billingCycle === "ANNUAL" ? "yr" : "mo"}
            </span>
          </div>
          <div className="text-[10px] text-[#8F98A8] space-y-0.5 font-mono">
            {subscription.modelPlan && (
              <div className="flex justify-between max-w-[180px]">
                <span className="text-[#8F98A8]">Plan:</span>
                <span className="font-semibold text-[#D9DEE7] truncate">{subscription.modelPlan}</span>
              </div>
            )}
            {subscription.provider && (
              <div className="flex justify-between max-w-[180px]">
                <span className="text-[#8F98A8]">Provider:</span>
                <span className="font-semibold text-[#D9DEE7] truncate">{subscription.provider}</span>
              </div>
            )}
          </div>
        </div>

        {/* Column 3: Renewal Date & Payment Method Linked (Center-right - 3 cols) */}
        <div className="lg:col-span-3 space-y-1.5 min-w-0">
          {renewalDate ? (
            <div className="flex items-center gap-2 text-[#8F98A8]">
              <Calendar className="w-3.5 h-3.5 shrink-0 text-[#7DA7D9]" />
              <span>Renews: <strong className="text-[#F4F1EA] font-semibold font-mono">{renewalDate}</strong></span>
            </div>
          ) : (
            <div className="flex items-center gap-2 text-[#8F98A8]">
              <Calendar className="w-3.5 h-3.5 shrink-0 text-[#8F98A8]" />
              <span>Renews: <span className="font-medium font-mono text-[#D9DEE7]">{subscription.billingCycle === "ANNUAL" ? "Annually" : "Monthly"}</span></span>
            </div>
          )}

          <div className="flex items-center gap-2 text-[#8F98A8]">
            <CreditCard className="w-3.5 h-3.5 shrink-0 text-[#C9A86A]" />
            <span className="truncate font-mono text-[#D9DEE7]">
              {cardLastFour ? `${cardBrand} •••• ${cardLastFour}` : "No payment links"}
            </span>
          </div>
        </div>

        {/* Column 4: Action Buttons (Right - 2 cols) */}
        <div className="lg:col-span-2 flex justify-end gap-2.5">
          <button
            onClick={() => alert(`Details for "${subscription.name}"\nType: ${subscription.subscriptionType}\nCost: $${subscription.costAmount}\nBilling Cycle: ${subscription.billingCycle}`)}
            className="flex-1 lg:flex-none inline-flex items-center justify-center gap-1.5 text-[10px] font-bold h-8 px-3 border border-[#202630] hover:border-[#7DA7D9]/40 text-[#F4F1EA] bg-[#171C24] hover:bg-[#202630] rounded-md transition-all cursor-pointer"
          >
            <ExternalLink className="w-3 h-3" /> Details
          </button>

          {onDelete && !isDemo && (
            <button
              onClick={handleDeleteClick}
              className="inline-flex items-center justify-center p-2 text-[#8F98A8] hover:text-rose-400 border border-[#202630] hover:border-rose-500/30 hover:bg-rose-500/10 rounded-md transition-all cursor-pointer shrink-0"
              title="Delete tracking"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

      </div>

    </div>
  );
}

