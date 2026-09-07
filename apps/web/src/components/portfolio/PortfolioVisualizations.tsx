"use client";

import React from "react";
import { BarChart3, TrendingUp, PieChart, ShieldAlert, Layers } from "lucide-react";
import { SpotlightCard } from "../ui";

export function PortfolioVisualizations() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      {/* 1. Line Chart: Portfolio Value Trend */}
      <SpotlightCard tiltEnabled={true} className="p-5 rounded-xl border-[#202630] bg-[#11151C]/95 space-y-4">
        <div className="flex items-center justify-between border-b border-[#202630] pb-2">
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-lg bg-[#7DA7D9]/10 border border-[#7DA7D9]/20 text-[#7DA7D9]">
              <TrendingUp className="w-4 h-4" />
            </div>
            <h3 className="text-sm font-bold text-[#F4F1EA]">Portfolio Value Realization Trend</h3>
          </div>
          <span className="text-[10px] font-mono font-bold text-emerald-400">+215% Overall ROI</span>
        </div>

        <div className="space-y-3">
          <div className="h-36 flex items-end justify-between gap-2 pt-4 px-2 border-b border-[#202630]">
            {[
              { label: "Jan", val: 35 },
              { label: "Feb", val: 48 },
              { label: "Mar", val: 62 },
              { label: "Apr", val: 78 },
              { label: "May", val: 95 },
              { label: "Jun", val: 120 },
            ].map((m, idx) => (
              <div key={idx} className="flex-1 flex flex-col items-center gap-1 group">
                <div
                  className="w-full bg-gradient-to-t from-[#4F759B] to-[#7DA7D9] rounded-t transition-all group-hover:brightness-125"
                  style={{ height: `${m.val}%` }}
                />
                <span className="text-[9px] font-mono text-[#8F98A8]">{m.label}</span>
              </div>
            ))}
          </div>
        </div>
      </SpotlightCard>

      {/* 2. Donut Chart: Investment Allocation by Business Area */}
      <SpotlightCard tiltEnabled={true} spotlightColor="rgba(201, 168, 106, 0.12)" className="p-5 rounded-xl border-[#202630] bg-[#11151C]/95 space-y-4">
        <div className="flex items-center justify-between border-b border-[#202630] pb-2">
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-lg bg-[#C9A86A]/10 border border-[#C9A86A]/20 text-[#C9A86A]">
              <PieChart className="w-4 h-4" />
            </div>
            <h3 className="text-sm font-bold text-[#F4F1EA]">Capital Allocation by Business Area</h3>
          </div>
          <span className="text-[10px] font-mono text-[#8F98A8]">$2.9M Total</span>
        </div>

        <div className="space-y-3">
          {[
            { area: "Operations & Care", percentage: 38, amount: "$1,100,000", color: "bg-[#7DA7D9]" },
            { area: "Software Engineering", percentage: 31, amount: "$900,000", color: "bg-[#C9A86A]" },
            { area: "Legal & Compliance", percentage: 17, amount: "$500,000", color: "bg-[#8F98A8]" },
            { area: "Finance & Risk", percentage: 14, amount: "$400,000", color: "bg-emerald-400" },
          ].map((item, idx) => (
            <div key={idx} className="space-y-1 text-xs">
              <div className="flex justify-between text-[#8F98A8] text-[11px]">
                <span className="font-semibold text-[#D9DEE7]">{item.area}</span>
                <span className="font-mono text-[#8F98A8]">{item.amount} ({item.percentage}%)</span>
              </div>
              <div className="w-full h-2 bg-[#0E1116] rounded-full overflow-hidden border border-[#202630]">
                <div className={`h-full ${item.color} rounded-full`} style={{ width: `${item.percentage}%` }} />
              </div>
            </div>
          ))}
        </div>
      </SpotlightCard>

      {/* 3. Heatmap / Risk Matrix Grid */}
      <SpotlightCard tiltEnabled={true} className="p-5 rounded-xl border-[#202630] bg-[#11151C]/95 space-y-4 md:col-span-2">
        <div className="flex items-center justify-between border-b border-[#202630] pb-2">
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-lg bg-rose-500/10 border border-rose-500/20 text-rose-400">
              <ShieldAlert className="w-4 h-4" />
            </div>
            <h3 className="text-sm font-bold text-[#F4F1EA]">Portfolio Executive Risk Matrix</h3>
          </div>
          <span className="text-[10px] font-mono text-[#8F98A8]">Impact vs Probability</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-center text-xs">
          <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/20 space-y-1 hover:border-emerald-500/40 transition-colors">
            <span className="font-bold text-emerald-400 block font-mono text-[11px] uppercase tracking-wider">Low Risk / High Impact</span>
            <span className="text-2xl font-extrabold font-mono text-[#F4F1EA] block">5 Initiatives</span>
            <p className="text-[10px] text-[#8F98A8]">Customer Support, Code Pilot</p>
          </div>

          <div className="p-4 rounded-xl bg-[#C9A86A]/10 border border-[#C9A86A]/20 space-y-1 hover:border-[#C9A86A]/40 transition-colors">
            <span className="font-bold text-[#C9A86A] block font-mono text-[11px] uppercase tracking-wider">Medium Risk / High Impact</span>
            <span className="text-2xl font-extrabold font-mono text-[#F4F1EA] block">3 Initiatives</span>
            <p className="text-[10px] text-[#8F98A8]">Legal Contract Processing</p>
          </div>

          <div className="p-4 rounded-xl bg-rose-500/10 border border-rose-500/20 space-y-1 hover:border-rose-500/40 transition-colors">
            <span className="font-bold text-rose-400 block font-mono text-[11px] uppercase tracking-wider">High Risk / High Impact</span>
            <span className="text-2xl font-extrabold font-mono text-[#F4F1EA] block">1 Initiative</span>
            <p className="text-[10px] text-[#8F98A8]">Predictive Supply Chain Demand</p>
          </div>
        </div>
      </SpotlightCard>
    </div>
  );
}

