"use client";

import React, { useState } from "react";
import { Sidebar } from "./Sidebar";
import { AppHeader } from "./AppHeader";
import { cn } from "./cn";

export interface AppShellProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  badge?: React.ReactNode;
  breadcrumbs?: { label: string; href?: string }[];
  showOrgSwitcher?: boolean;
}

export function AppShell({
  children,
  badge,
  breadcrumbs,
  showOrgSwitcher = true,
  className,
  ...props
}: AppShellProps) {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  const toggleSidebar = () => {
    setSidebarCollapsed((prev) => !prev);
  };

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col font-sans transition-colors">
      <Sidebar
        collapsed={sidebarCollapsed}
        onToggleCollapse={toggleSidebar}
      />

      <div
        className={cn(
          "flex-1 flex flex-col transition-all duration-200 ease-in-out min-w-0",
          sidebarCollapsed ? "lg:pl-16" : "lg:pl-64"
        )}
      >
        <AppHeader
          badge={badge}
          breadcrumbs={breadcrumbs}
          showOrgSwitcher={showOrgSwitcher}
          onToggleSidebar={toggleSidebar}
        />

        <main className={cn("flex-1 p-4 sm:p-6 md:p-8 max-w-[1536px] w-full mx-auto space-y-8", className)} {...props}>
          {children}
        </main>
      </div>
    </div>
  );
}
