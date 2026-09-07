"use client";

import React, { useState, useEffect } from "react";
import { motion } from "motion/react";
import { ShieldCheck, TrendingUp, Sparkles, Activity, Layers, Lock, Cpu } from "lucide-react";

export function HeroVisual() {
  const [telemetryTicks, setTelemetryTicks] = useState({
    activeNpv: 4.94,
    confidence: 94.2,
    alphaRatio: 2.84,
    gateStatus: "OPTIMAL",
  });

  // Gentle live telemetry simulation
  useEffect(() => {
    const interval = setInterval(() => {
      setTelemetryTicks((prev) => ({
        activeNpv: Number((4.94 + (Math.sin(Date.now() / 3000) * 0.08)).toFixed(2)),
        confidence: Number((94.2 + (Math.cos(Date.now() / 4000) * 0.5)).toFixed(1)),
        alphaRatio: Number((2.84 + (Math.sin(Date.now() / 2500) * 0.04)).toFixed(2)),
        gateStatus: "OPTIMAL",
      }));
    }, 1500);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="relative mx-auto aspect-square w-full max-w-[560px] hero-entrance-dashboard flex items-center justify-center select-none">
      {/* 3D Perspective Container */}
      <div
        className="relative w-full h-full flex items-center justify-center"
        style={{ perspective: "1000px" }}
      >
        {/* Background Ambient Radial Glow */}
        <div className="absolute inset-4 rounded-full bg-radial from-[#7DA7D9]/10 via-[#C9A86A]/5 to-transparent blur-3xl pointer-events-none" />

        {/* Outer Static Calibration Ring with Monospace Degrees */}
        <div className="absolute inset-[4%] rounded-full border border-[#202630] flex items-center justify-center">
          <div className="absolute top-1 font-mono text-[8px] text-[#8F98A8]/60 tracking-widest">000° LAT</div>
          <div className="absolute bottom-1 font-mono text-[8px] text-[#8F98A8]/60 tracking-widest">180° S</div>
          <div className="absolute left-1 font-mono text-[8px] text-[#8F98A8]/60 tracking-widest">270° W</div>
          <div className="absolute right-1 font-mono text-[8px] text-[#8F98A8]/60 tracking-widest">090° E</div>
        </div>

        {/* 2D Rotating Precision Radar Sweep Grid */}
        <svg
          className="absolute inset-[8%] w-[84%] h-[84%] spin-slow pointer-events-none opacity-40"
          viewBox="0 0 400 400"
          fill="none"
        >
          <circle cx="200" cy="200" r="195" stroke="#7DA7D9" strokeWidth="0.75" strokeDasharray="3 6" />
          <circle cx="200" cy="200" r="140" stroke="#202630" strokeWidth="1" />
          <circle cx="200" cy="200" r="85" stroke="#C9A86A" strokeWidth="0.75" strokeDasharray="2 4" />
          <line x1="200" y1="0" x2="200" y2="400" stroke="#202630" strokeWidth="0.75" />
          <line x1="0" y1="200" x2="400" y2="200" stroke="#202630" strokeWidth="0.75" />
          {/* Subtle radar angle tick lines */}
          <line x1="60" y1="60" x2="340" y2="340" stroke="#7DA7D9" strokeWidth="0.5" strokeDasharray="2 8" opacity="0.4" />
          <line x1="340" y1="60" x2="60" y2="340" stroke="#C9A86A" strokeWidth="0.5" strokeDasharray="2 8" opacity="0.4" />
        </svg>

        {/* Reverse Spinning Telemetry Ring */}
        <div className="spin-reverse-slow absolute inset-[12%] rounded-full border border-dashed border-[#7DA7D9]/25 pointer-events-none">
          <span className="absolute top-[8%] left-1/2 -translate-x-1/2 w-2 h-2 rounded-full bg-[#7DA7D9] shadow-[0_0_8px_#7DA7D9]" />
          <span className="absolute bottom-[8%] left-1/2 -translate-x-1/2 w-1.5 h-1.5 rounded-full bg-[#C9A86A] shadow-[0_0_8px_#C9A86A]" />
        </div>

        {/* 3D Gyroscopic Orbital Ring 1 (Tilted on X axis) */}
        <div
          className="absolute inset-[16%] rounded-full border-2 border-[#7DA7D9]/40 pointer-events-none"
          style={{
            transformStyle: "preserve-3d",
            animation: "gyroRotateX 22s linear infinite",
            boxShadow: "0 0 20px -5px rgba(125, 167, 217, 0.2)",
          }}
        >
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-2.5 h-2.5 rounded-full bg-[#7DA7D9] border border-[#0B0D11]" />
        </div>

        {/* 3D Gyroscopic Orbital Ring 2 (Tilted on Y axis) */}
        <div
          className="absolute inset-[20%] rounded-full border border-[#C9A86A]/50 pointer-events-none"
          style={{
            transformStyle: "preserve-3d",
            animation: "gyroRotateY 28s linear infinite",
            boxShadow: "0 0 20px -5px rgba(201, 168, 106, 0.2)",
          }}
        >
          <div className="absolute top-1/2 left-0 -translate-y-1/2 w-2 h-2 rounded-full bg-[#C9A86A] border border-[#0B0D11]" />
        </div>

        {/* Floating Telemetry Badge 1 (Top Right: NPV Forecaster) */}
        <motion.div
          animate={{ y: [-4, 4, -4] }}
          transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
          className="absolute top-[10%] right-[2%] z-20 p-2.5 rounded-lg border border-[#202630] bg-[#11151C]/90 backdrop-blur-md shadow-xl flex items-center gap-2.5 pointer-events-auto hover:border-[#7DA7D9]/50 transition-colors"
        >
          <div className="p-1.5 rounded bg-[#7DA7D9]/10 border border-[#7DA7D9]/20 text-[#7DA7D9]">
            <TrendingUp className="w-3.5 h-3.5" />
          </div>
          <div>
            <span className="text-[9px] font-mono text-[#8F98A8] uppercase tracking-wider block">REALIZED NPV</span>
            <span className="text-xs font-mono font-bold text-[#F4F1EA]">${telemetryTicks.activeNpv}M</span>
          </div>
        </motion.div>

        {/* Floating Telemetry Badge 2 (Bottom Left: Confidence Score) */}
        <motion.div
          animate={{ y: [4, -4, 4] }}
          transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
          className="absolute bottom-[10%] left-[2%] z-20 p-2.5 rounded-lg border border-[#202630] bg-[#11151C]/90 backdrop-blur-md shadow-xl flex items-center gap-2.5 pointer-events-auto hover:border-[#C9A86A]/50 transition-colors"
        >
          <div className="p-1.5 rounded bg-[#C9A86A]/10 border border-[#C9A86A]/20 text-[#C9A86A]">
            <Sparkles className="w-3.5 h-3.5" />
          </div>
          <div>
            <span className="text-[9px] font-mono text-[#8F98A8] uppercase tracking-wider block">MODEL CONFIDENCE</span>
            <span className="text-xs font-mono font-bold text-[#C9A86A]">{telemetryTicks.confidence}%</span>
          </div>
        </motion.div>

        {/* Floating Telemetry Badge 3 (Top Left: Alpha Ratio) */}
        <motion.div
          animate={{ y: [-3, 3, -3] }}
          transition={{ duration: 5.5, repeat: Infinity, ease: "easeInOut", delay: 1 }}
          className="absolute top-[12%] left-[4%] z-20 px-2.5 py-1.5 rounded-md border border-[#202630] bg-[#11151C]/90 backdrop-blur-md text-[10px] font-mono text-[#8F98A8] flex items-center gap-1.5"
        >
          <span className="w-1.5 h-1.5 rounded-full bg-[#7DA7D9] animate-ping" />
          <span>ALPHA: <strong className="text-[#F4F1EA]">{telemetryTicks.alphaRatio}x</strong></span>
        </motion.div>

        {/* Floating Telemetry Badge 4 (Bottom Right: Gate SLA) */}
        <motion.div
          animate={{ y: [3, -3, 3] }}
          transition={{ duration: 4.8, repeat: Infinity, ease: "easeInOut", delay: 0.5 }}
          className="absolute bottom-[14%] right-[4%] z-20 px-2.5 py-1.5 rounded-md border border-[#202630] bg-[#11151C]/90 backdrop-blur-md text-[10px] font-mono text-[#8F98A8] flex items-center gap-1.5"
        >
          <ShieldCheck className="w-3 h-3 text-[#7DA7D9]" />
          <span>GATE: <strong className="text-[#7DA7D9]">{telemetryTicks.gateStatus}</strong></span>
        </motion.div>

        {/* Central Core Emblem — Institutional Metallic Shield Monolith */}
        <div className="relative z-10 w-36 h-36 rounded-2xl border border-[#202630] bg-gradient-to-b from-[#171C24] via-[#11151C] to-[#0E1116] p-4 flex flex-col items-center justify-between shadow-2xl shadow-black/80 float-slow group">
          {/* Top Status Header */}
          <div className="w-full flex items-center justify-between border-b border-[#202630] pb-1.5">
            <span className="text-[8px] font-mono text-[#8F98A8] tracking-widest">AIVI-CORE</span>
            <div className="w-1.5 h-1.5 rounded-full bg-[#7DA7D9] shadow-[0_0_6px_#7DA7D9] animate-pulse" />
          </div>

          {/* Central Monogram / Insignia */}
          <div className="relative flex items-center justify-center my-1">
            <div className="w-14 h-14 rounded-xl border border-[#7DA7D9]/30 bg-[#0B0D11] flex items-center justify-center shadow-inner group-hover:border-[#C9A86A]/50 transition-colors">
              <span className="text-xl font-extrabold tracking-tight bg-gradient-to-br from-[#F4F1EA] via-[#7DA7D9] to-[#C9A86A] bg-clip-text text-transparent font-mono">
                AIVI
              </span>
            </div>
            {/* Corner Precision Reticles */}
            <div className="absolute -top-1 -left-1 w-1.5 h-1.5 border-t border-l border-[#7DA7D9]" />
            <div className="absolute -top-1 -right-1 w-1.5 h-1.5 border-t border-r border-[#7DA7D9]" />
            <div className="absolute -bottom-1 -left-1 w-1.5 h-1.5 border-b border-l border-[#7DA7D9]" />
            <div className="absolute -bottom-1 -right-1 w-1.5 h-1.5 border-b border-r border-[#7DA7D9]" />
          </div>

          {/* Bottom Telemetry Metric */}
          <div className="w-full text-center border-t border-[#202630] pt-1">
            <span className="text-[8px] font-mono text-[#C9A86A] tracking-wider block font-semibold">
              TELEMETRY V2.4
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}

export default HeroVisual;
