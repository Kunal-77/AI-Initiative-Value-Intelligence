"use client";

import React from "react";
import Link from "@/compat/link";

interface AuthBrandProps {
  title?: string;
  subtitle?: string;
}

export function AuthBrand({ title, subtitle }: AuthBrandProps) {
  return (
    <div className="flex flex-col items-center text-center space-y-4">
      <Link
        href="/"
        className="flex items-center gap-2.5 group cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 rounded-lg p-1"
        aria-label="Go to landing page"
      >
        <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center shadow-lg shadow-blue-500/20 group-hover:scale-105 transition-transform duration-300">
          <span className="font-extrabold text-lg text-white">V</span>
        </div>
        <span className="font-extrabold tracking-tight text-lg text-foreground group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
          Value Intelligence
        </span>
      </Link>
      
      {title && (
        <div className="space-y-1.5 pt-2">
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-foreground">
            {title}
          </h1>
          {subtitle && (
            <p className="text-xs sm:text-sm text-muted-foreground max-w-sm leading-relaxed">
              {subtitle}
            </p>
          )}
        </div>
      )}
    </div>
  );
}
