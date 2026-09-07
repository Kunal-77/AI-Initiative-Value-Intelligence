"use client";

import React, { useState } from "react";
import { Sidebar } from "./Sidebar";
import { AppHeader } from "./AppHeader";
import { TelemetryGridCanvas } from "./TelemetryGridCanvas";
import { ScrollProgressBar } from "./ScrollProgressBar";
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
  const [mobileOpen, setMobileOpen] = useState(false);

  const toggleSidebar = () => {
    if (typeof window !== "undefined" && window.innerWidth < 1024) {
      setMobileOpen((prev) => !prev);
    } else {
      setSidebarCollapsed((prev) => !prev);
    }
  };

  return (
    <div className="relative min-h-screen bg-background text-foreground flex flex-col font-sans transition-colors selection:bg-[#7DA7D9]/20 selection:text-[#F4F1EA]">
      {/* Hairline Scroll Progress Bar */}
      <ScrollProgressBar />

      {/* Dynamic 60fps Telemetry Mesh Background */}
      <TelemetryGridCanvas particleCount={35} />

      <Sidebar
        collapsed={sidebarCollapsed}
        onToggleCollapse={toggleSidebar}
        mobileOpen={mobileOpen}
        onCloseMobile={() => setMobileOpen(false)}
      />

      <div
        className={cn(
          "relative z-10 flex-1 flex flex-col transition-all duration-200 ease-in-out min-w-0",
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

export default AppShell;
