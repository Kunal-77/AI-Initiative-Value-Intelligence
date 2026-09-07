"use client";

import React from "react";
import { AuthenticateWithRedirectCallback } from "@clerk/nextjs";

export default function SSOCallbackPage() {
  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col items-center justify-center p-6 relative overflow-hidden transition-colors duration-300">
      {/* Background Decorative Gradients */}
      <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-blue-900/10 rounded-full blur-[150px] pointer-events-none" />
      <div className="absolute top-[40%] right-[-10%] w-[50%] h-[50%] bg-indigo-950/20 rounded-full blur-[150px] pointer-events-none" />
      
      <div className="flex flex-col items-center space-y-4 relative z-10 animate-in fade-in duration-200">
        <div className="w-12 h-12 rounded-xl bg-gradient-to-tr from-[#7DA7D9] to-[#4F759B] flex items-center justify-center shadow-lg shadow-[#7DA7D9]/25 animate-pulse">
          <span className="font-extrabold text-xl text-[#0B0D11]">V</span>
        </div>
        <div className="flex items-center gap-2 text-xs font-semibold text-[#8F98A8] font-mono">
          <div className="w-2 h-2 rounded-full bg-[#7DA7D9] animate-ping" />
          <span>Verifying authentication context...</span>
        </div>
      </div>
      
      {/* Clerk redirection handler */}
      <div className="hidden">
        <AuthenticateWithRedirectCallback />
      </div>
    </div>
  );
}
