"use client";

import React from "react";
import { TelemetryGridCanvas, ScrollProgressBar } from "@/components/ui";

export default function BusinessLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="relative min-h-screen bg-[#0B0D11] text-[#F4F1EA] selection:bg-[#7DA7D9]/30">
      <ScrollProgressBar />
      <TelemetryGridCanvas particleCount={30} speed={0.25} />
      <div className="relative z-10">{children}</div>
    </div>
  );
}
