"use client";

import React from "react";

export function AuthDivider() {
  return (
    <div className="relative my-6">
      <div className="absolute inset-0 flex items-center">
        <span className="w-full border-t border-border/80" />
      </div>
      <div className="relative flex justify-center text-xs uppercase">
        <span className="bg-card px-2.5 text-[10px] font-bold font-mono tracking-widest text-muted-foreground">
          OR
        </span>
      </div>
    </div>
  );
}
