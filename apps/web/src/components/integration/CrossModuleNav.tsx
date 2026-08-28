"use client";

import React from "react";
import Link from "@/compat/link";
import { usePathname } from "@/compat/navigation";
import { ArrowRight, Compass } from "lucide-react";
import { getCrossModuleLinks } from "../../services/integration/integrationService";

export function CrossModuleNav() {
  const pathname = usePathname();
  const links = getCrossModuleLinks(pathname);

  return (
    <div className="p-3.5 rounded-xl border border-border bg-card text-card-foreground shadow-2xs flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
      <div className="flex items-center gap-2">
        <Compass className="w-4 h-4 text-accent shrink-0" />
        <span className="font-bold text-foreground">Cross-Module Workspace Navigation:</span>
      </div>

      <div className="flex items-center gap-2 overflow-x-auto py-0.5">
        {links.map((link, idx) => (
          <Link
            key={idx}
            href={link.href}
            className="px-2.5 py-1 rounded-md bg-secondary/40 hover:bg-secondary text-foreground font-semibold inline-flex items-center gap-1 border border-border shrink-0 transition-colors"
          >
            {link.label}
            {link.badge && (
              <span className="text-[9px] font-mono px-1 py-0.2 rounded bg-accent/15 text-accent font-bold">
                {link.badge}
              </span>
            )}
            <ArrowRight className="w-3 h-3 text-muted-foreground ml-0.5" />
          </Link>
        ))}
      </div>
    </div>
  );
}
