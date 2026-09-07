"use client";

import React, { useState, useMemo } from "react";
import {
  Layers,
  Search,
  Filter,
  LayoutGrid,
  List,
  Plus,
  Trash2,
  Calendar,
  CreditCard,
  ExternalLink,
  Cpu,
  Tv,
  Music,
  Cloud,
  Clock,
  AlertCircle,
} from "lucide-react";
import { Subscription, PaymentMethod, RenewalSchedule } from "../../types/personal";
import { cn } from "../ui/cn";

export interface SubscriptionLedgerProps {
  subscriptions: Subscription[];
  renewals?: RenewalSchedule[];
  paymentMethods?: PaymentMethod[];
  onAddClick: () => void;
  onDeleteClick: (id: string) => void;
  loading?: boolean;
}

export function SubscriptionLedger({
  subscriptions,
  renewals = [],
  paymentMethods = [],
  onAddClick,
  onDeleteClick,
  loading = false,
}: SubscriptionLedgerProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("ALL");
  const [selectedCycle, setSelectedCycle] = useState("ALL"); // ALL, MONTHLY, ANNUAL
  const [viewMode, setViewMode] = useState<"list" | "grid">("list");

  // Helper to calculate next renewal date & days remaining
  const getRenewalInfo = (sub: Subscription) => {
    const directSchedule = renewals.find((r) => r.subscriptionId === sub.id);
    if (directSchedule) {
      const renDate = new Date(directSchedule.renewalDate);
      const now = new Date();
      const diffTime = renDate.getTime() - now.getTime();
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      return {
        dateString: directSchedule.renewalDate,
        daysRemaining: diffDays,
      };
    }

    // Estimate based on createdAt or fallback
    const daysToAdd = sub.billingCycle === "ANNUAL" ? 365 : 30;
    const renDate = new Date(sub.createdAt || new Date());
    renDate.setDate(renDate.getDate() + daysToAdd);
    const now = new Date();
    const diffTime = renDate.getTime() - now.getTime();
    const diffDays = Math.max(1, Math.ceil(diffTime / (1000 * 60 * 60 * 24)));

    return {
      dateString: renDate.toISOString().split("T")[0],
      daysRemaining: diffDays,
    };
  };

  const getUrgencyBadge = (daysRemaining: number) => {
    if (daysRemaining <= 3) {
      return {
        label: daysRemaining <= 0 ? "Renews Today" : `In ${daysRemaining}d (Urgent)`,
        className: "bg-rose-500/15 border-rose-500/30 text-rose-400",
      };
    }
    if (daysRemaining <= 7) {
      return {
        label: `In ${daysRemaining} days`,
        className: "bg-[#C9A86A]/15 border-[#C9A86A]/30 text-[#C9A86A]",
      };
    }
    return {
      label: `In ${daysRemaining} days`,
      className: "bg-[#7DA7D9]/10 border-[#7DA7D9]/20 text-[#7DA7D9]",
    };
  };

  const getCategoryTheme = (sub: Subscription) => {
    const type = sub.subscriptionType;
    if (type === "ai") {
      return {
        icon: Cpu,
        label: "AI & Productivity",
        colorClass: "text-[#7DA7D9] bg-[#7DA7D9]/10 border-[#7DA7D9]/25",
      };
    }
    if (type === "cloud") {
      return {
        icon: Cloud,
        label: "Cloud Sandbox",
        colorClass: "text-[#C9A86A] bg-[#C9A86A]/10 border-[#C9A86A]/25",
      };
    }
    const nameLower = sub.name.toLowerCase();
    if (nameLower.includes("spotify") || nameLower.includes("music")) {
      return {
        icon: Music,
        label: "Music Streaming",
        colorClass: "text-emerald-400 bg-emerald-500/10 border-emerald-500/25",
      };
    }
    if (nameLower.includes("netflix") || nameLower.includes("prime") || nameLower.includes("tv")) {
      return {
        icon: Tv,
        label: "Entertainment",
        colorClass: "text-[#C9A86A] bg-[#C9A86A]/10 border-[#C9A86A]/25",
      };
    }
    return {
      icon: Layers,
      label: sub.category?.name || "General SaaS",
      colorClass: "text-[#8F98A8] bg-[#171C24] border-[#202630]",
    };
  };

  // Filter subscriptions
  const filteredSubscriptions = useMemo(() => {
    return subscriptions.filter((sub) => {
      // Search
      if (searchTerm.trim()) {
        const q = searchTerm.toLowerCase();
        const matchesName = sub.name.toLowerCase().includes(q);
        const matchesProvider = sub.provider?.toLowerCase().includes(q);
        const matchesModel = sub.modelPlan?.toLowerCase().includes(q);
        if (!matchesName && !matchesProvider && !matchesModel) return false;
      }

      // Cycle
      if (selectedCycle !== "ALL" && sub.billingCycle !== selectedCycle) {
        return false;
      }

      // Category
      if (selectedCategory !== "ALL") {
        if (selectedCategory === "AI" && sub.subscriptionType !== "ai") return false;
        if (selectedCategory === "CLOUD" && sub.subscriptionType !== "cloud") return false;
        if (selectedCategory === "GENERIC" && sub.subscriptionType !== "generic") return false;
      }

      return true;
    });
  }, [subscriptions, searchTerm, selectedCategory, selectedCycle]);

  return (
    <div className="rounded-xl border border-[#202630] bg-[#11151C] shadow-md overflow-hidden flex flex-col space-y-4 p-5 sm:p-6 transition-all">
      {/* Header Row */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 border-b border-[#202630] pb-4">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-lg bg-[#7DA7D9]/10 border border-[#7DA7D9]/20 text-[#7DA7D9]">
            <Layers className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-[#F4F1EA]">Subscription Intelligence Ledger</h3>
            <p className="text-[11px] text-[#8F98A8]">
              Active recurring commitments, verified cadence schedules, and renewal urgency
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* Grid / List view switcher */}
          <div className="flex items-center p-0.5 rounded-lg bg-[#0E1116] border border-[#202630]">
            <button
              onClick={() => setViewMode("list")}
              className={cn(
                "p-1.5 rounded-md transition-all cursor-pointer",
                viewMode === "list" ? "bg-[#171C24] text-[#7DA7D9] shadow-xs" : "text-[#8F98A8] hover:text-[#F4F1EA]"
              )}
              title="List View"
            >
              <List className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => setViewMode("grid")}
              className={cn(
                "p-1.5 rounded-md transition-all cursor-pointer",
                viewMode === "grid" ? "bg-[#171C24] text-[#7DA7D9] shadow-xs" : "text-[#8F98A8] hover:text-[#F4F1EA]"
              )}
              title="Grid View"
            >
              <LayoutGrid className="w-3.5 h-3.5" />
            </button>
          </div>

          <button
            onClick={onAddClick}
            className="text-xs h-8 px-3 rounded-lg font-bold bg-[#C9A86A] text-[#0B0D11] hover:bg-[#D4B87D] transition-all flex items-center gap-1.5 cursor-pointer shadow-sm active:scale-[0.98]"
          >
            <Plus className="w-3.5 h-3.5" /> Add Subscription
          </button>
        </div>
      </div>

      {/* Filter & Search Bar */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div className="relative">
          <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-[#8F98A8]" />
          <input
            type="text"
            placeholder="Search subscriptions, providers..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full text-xs h-9 pl-9 pr-3 bg-[#0B0D11] border border-[#202630] rounded-lg text-[#F4F1EA] placeholder:text-[#8F98A8]/60 focus:outline-none focus:border-[#7DA7D9]"
          />
        </div>

        <div>
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="w-full text-xs h-9 px-3 bg-[#0B0D11] border border-[#202630] rounded-lg text-[#F4F1EA] focus:outline-none focus:border-[#7DA7D9] cursor-pointer"
          >
            <option value="ALL">All Categories</option>
            <option value="AI">AI & Productivity Tools</option>
            <option value="CLOUD">Cloud Sandboxes</option>
            <option value="GENERIC">General SaaS / Media</option>
          </select>
        </div>

        <div>
          <select
            value={selectedCycle}
            onChange={(e) => setSelectedCycle(e.target.value)}
            className="w-full text-xs h-9 px-3 bg-[#0B0D11] border border-[#202630] rounded-lg text-[#F4F1EA] focus:outline-none focus:border-[#7DA7D9] cursor-pointer"
          >
            <option value="ALL">All Billing Cycles</option>
            <option value="MONTHLY">Monthly Billing</option>
            <option value="ANNUAL">Annual Billing</option>
          </select>
        </div>
      </div>

      {/* Subscriptions Content */}
      {loading ? (
        <div className="p-8 space-y-3">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="h-10 bg-[#171C24] rounded animate-pulse" />
          ))}
        </div>
      ) : subscriptions.length === 0 ? (
        <div className="p-12 text-center flex flex-col items-center justify-center gap-3 border border-[#202630] rounded-xl bg-[#0E1116]">
          <div className="w-12 h-12 rounded-xl bg-[#171C24] border border-[#202630] flex items-center justify-center text-[#8F98A8]">
            <Layers className="w-6 h-6" />
          </div>
          <div className="space-y-1">
            <h4 className="text-sm font-bold text-[#F4F1EA]">No Subscriptions Registered</h4>
            <p className="text-xs text-[#8F98A8] max-w-sm">
              Add a subscription manually or sync your simulated connection to confirm auto-detected candidates.
            </p>
          </div>
          <button
            onClick={onAddClick}
            className="mt-2 text-xs h-8 px-4 rounded-lg font-bold bg-[#C9A86A] text-[#0B0D11] hover:bg-[#D4B87D] transition-all cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5 mr-1" /> Register Subscription
          </button>
        </div>
      ) : filteredSubscriptions.length === 0 ? (
        <div className="p-8 text-center text-xs text-[#8F98A8] border border-[#202630] rounded-xl bg-[#0E1116]">
          No subscriptions match your search or filter criteria.
        </div>
      ) : viewMode === "list" ? (
        <div className="border border-[#202630] rounded-xl overflow-hidden bg-[#0E1116]">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-[#202630] bg-[#11151C] text-[#8F98A8] uppercase font-mono text-[10px]">
                  <th className="p-3.5 font-semibold whitespace-nowrap">Service</th>
                  <th className="p-3.5 font-semibold whitespace-nowrap">Category</th>
                  <th className="p-3.5 font-semibold whitespace-nowrap">Cycle</th>
                  <th className="p-3.5 font-semibold whitespace-nowrap">Cost (USD)</th>
                  <th className="p-3.5 font-semibold whitespace-nowrap">Next Renewal</th>
                  <th className="p-3.5 font-semibold whitespace-nowrap">Urgency</th>
                  <th className="p-3.5 font-semibold text-right whitespace-nowrap">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#202630]">
                {filteredSubscriptions.map((sub) => {
                  const theme = getCategoryTheme(sub);
                  const Icon = theme.icon;
                  const ren = getRenewalInfo(sub);
                  const urgency = getUrgencyBadge(ren.daysRemaining);

                  return (
                    <tr key={sub.id} className="hover:bg-[#171C24]/50 transition-colors">
                      <td className="p-3.5">
                        <div className="flex items-center gap-2.5 min-w-0">
                          <div className="w-8 h-8 rounded-lg bg-[#171C24] border border-[#202630] flex items-center justify-center font-bold text-xs uppercase text-[#7DA7D9] shrink-0">
                            {sub.name.substring(0, 2).toUpperCase()}
                          </div>
                          <div className="min-w-0">
                            <span className="font-bold text-[#F4F1EA] block text-xs truncate max-w-[190px]" title={sub.name}>
                              {sub.name}
                            </span>
                            {sub.provider && (
                              <span className="text-[10px] text-[#8F98A8] font-mono block truncate max-w-[190px]">
                                {sub.provider} {sub.modelPlan ? `• ${sub.modelPlan}` : ""}
                              </span>
                            )}
                          </div>
                        </div>
                      </td>

                      <td className="p-3.5 whitespace-nowrap">
                        <span
                          className={cn(
                            "inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold border whitespace-nowrap",
                            theme.colorClass
                          )}
                        >
                          <Icon className="w-3 h-3" /> {theme.label}
                        </span>
                      </td>

                      <td className="p-3.5 font-mono text-[11px] text-[#8F98A8] whitespace-nowrap">{sub.billingCycle}</td>

                      <td className="p-3.5 font-mono font-bold text-[#F4F1EA] whitespace-nowrap">
                        ${sub.costAmount.toFixed(2)}
                      </td>

                      <td className="p-3.5 font-mono text-[11px] text-[#D9DEE7] whitespace-nowrap">
                        {ren.dateString}
                      </td>

                      <td className="p-3.5 whitespace-nowrap">
                        <span
                          className={cn(
                            "inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-mono font-bold border whitespace-nowrap",
                            urgency.className
                          )}
                        >
                          <Clock className="w-2.5 h-2.5" />
                          {urgency.label}
                        </span>
                      </td>

                      <td className="p-3.5 text-right whitespace-nowrap">
                        <button
                          onClick={() => onDeleteClick(sub.id)}
                          className="p-1.5 text-[#8F98A8] hover:text-rose-400 hover:bg-rose-500/10 rounded-md transition-colors cursor-pointer"
                          title="Cancel tracking"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {filteredSubscriptions.map((sub) => {
            const theme = getCategoryTheme(sub);
            const Icon = theme.icon;
            const ren = getRenewalInfo(sub);
            const urgency = getUrgencyBadge(ren.daysRemaining);

            return (
              <div
                key={sub.id}
                className="rounded-xl border border-[#202630] bg-[#0E1116] p-4 flex flex-col justify-between gap-4 hover:border-[#7DA7D9]/40 transition-all shadow-xs"
              >
                <div className="space-y-3">
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-2.5 min-w-0">
                      <div className="w-9 h-9 rounded-lg bg-[#171C24] border border-[#202630] flex items-center justify-center font-bold text-xs text-[#7DA7D9]">
                        {sub.name.substring(0, 2)}
                      </div>
                      <div className="min-w-0">
                        <h4 className="text-xs font-bold text-[#F4F1EA] truncate">{sub.name}</h4>
                        <span className="text-[10px] text-[#8F98A8] block font-mono">{sub.billingCycle}</span>
                      </div>
                    </div>

                    <div className="text-right shrink-0">
                      <span className="text-sm font-bold font-mono text-[#F4F1EA]">
                        ${sub.costAmount.toFixed(2)}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between text-[10px] pt-2 border-t border-[#202630]">
                    <span
                      className={cn(
                        "inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold border",
                        theme.colorClass
                      )}
                    >
                      <Icon className="w-2.5 h-2.5" /> {theme.label}
                    </span>

                    <span
                      className={cn(
                        "inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[9px] font-mono font-bold border",
                        urgency.className
                      )}
                    >
                      <Clock className="w-2.5 h-2.5" />
                      {urgency.label}
                    </span>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-2 border-t border-[#202630] text-[10px] text-[#8F98A8]">
                  <span>Renews: <strong className="text-[#D9DEE7] font-mono">{ren.dateString}</strong></span>
                  <button
                    onClick={() => onDeleteClick(sub.id)}
                    className="p-1 text-[#8F98A8] hover:text-rose-400 hover:bg-rose-500/10 rounded-md transition-colors cursor-pointer"
                    title="Cancel tracking"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
