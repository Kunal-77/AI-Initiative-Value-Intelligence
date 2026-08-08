"use client";

import React from "react";
import { AlertCircle } from "lucide-react";

interface AuthErrorProps {
  error?: string | null | { message: string }[] | any;
}

export function AuthError({ error }: AuthErrorProps) {
  if (!error) return null;

  let message = "";

  if (typeof error === "string") {
    message = error;
  } else if (Array.isArray(error)) {
    message = error.map((e) => e.message || "An error occurred.").join(" ");
  } else if (error.errors && Array.isArray(error.errors)) {
    message = error.errors.map((e: any) => e.message || "An error occurred.").join(" ");
  } else if (error.message) {
    message = error.message;
  } else {
    message = "An unexpected authentication error occurred. Please try again.";
  }

  return (
    <div
      role="alert"
      className="p-3.5 rounded-xl border border-rose-500/20 bg-rose-500/10 text-xs text-rose-600 dark:text-rose-400 font-medium flex gap-2.5 items-start animate-in fade-in slide-in-from-top-1 duration-200"
    >
      <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
      <span className="leading-relaxed">{message}</span>
    </div>
  );
}
