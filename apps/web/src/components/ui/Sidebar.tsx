"use client";

import React, { useState } from "react";
import Link from "@/compat/link";
import { usePathname } from "@/compat/navigation";
import { useAuth } from "@clerk/nextjs";
import {
  FolderKanban,
  Sparkles,
  BarChart3,
  User,
  PanelLeftClose,
  Briefcase,
  Layers,
  CheckCircle2,
  Bell,
  Cpu,
  Plug,
} from "lucide-react";
import { cn } from "./cn";
import { WorkspaceSelector } from "./WorkspaceSelector";

export interface NavItem {
  label: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  badge?: string;
}

export interface NavGroup {
  title: string;
  items: NavItem[];
}

export interface SidebarProps extends React.HTMLAttributes<HTMLElement> {
  collapsed?: boolean;
  onToggleCollapse?: () => void;
}

export function Sidebar({ className, collapsed = false, onToggleCollapse, ...props }: SidebarProps) {
  const pathname = usePathname();
  const { orgId } = useAuth();
  const [isMobileOpen, setIsMobileOpen] = useState(false);

  const isBusiness = pathname.startsWith("/business") || Boolean(orgId);

  const businessNav: NavGroup[] = [
    {
      title: "Workspace Portfolio",
      items: [
        { label: "Executive Command Center", href: "/business/portfolio", icon: Layers },
        { label: "Initiatives Portfolio", href: "/business/initiatives", icon: FolderKanban },
        { label: "Financial Metrics Ledger", href: "/business/financials", icon: BarChart3 },
      ],
    },
    {
      title: "Decision Intelligence",
      items: [
        { label: "AI Value Studio", href: "/business/ai-studio", icon: Sparkles, badge: "AI" },
        { label: "AI Playground", href: "/business/ai-playground", icon: Cpu, badge: "LLM" },
        { label: "Executive Approval Center", href: "/business/approvals", icon: CheckCircle2, badge: "Governance" },
      ],
    },
    {
      title: "System Administration",
      items: [
        { label: "Enterprise Administration", href: "/business/admin", icon: Briefcase, badge: "Admin" },
        { label: "Notifications & Automation", href: "/business/notifications", icon: Bell, badge: "Alerts" },
        { label: "Integration Center", href: "/business/integrations", icon: Plug, badge: "Sync" },
      ],
    },
  ];

  const personalNav: NavGroup[] = [
    {
      title: "Personal Workspace",
      items: [
        { label: "Overview", href: "/personal", icon: User },
        { label: "Subscriptions & Spend", href: "/personal", icon: Layers },
      ],
    },
    {
      title: "Decision Intelligence",
      items: [
        { label: "AI Usage Analytics", href: "/personal", icon: Sparkles, badge: "AI" },
      ],
    },
  ];

  const navGroups = isBusiness ? businessNav : personalNav;

  return (
    <>
      {/* Mobile Backdrop Overlay */}
      {isMobileOpen && (
        <div
          className="fixed inset-0 z-40 bg-background/80 backdrop-blur-xs lg:hidden"
          onClick={() => setIsMobileOpen(false)}
        />
      )}

      <aside
        className={cn(
          "fixed top-0 bottom-0 left-0 z-40 flex flex-col bg-card text-card-foreground border-r border-border transition-all duration-200 ease-in-out select-none",
          collapsed ? "w-16" : "w-64",
          isMobileOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0",
          className
        )}
        {...props}
      >
        {/* Brand Header */}
        <div className="h-16 px-4 flex items-center justify-between border-b border-border shrink-0">
          <Link
            href="/"
            className={cn(
              "flex items-center gap-2.5 font-bold tracking-tight text-foreground transition-opacity hover:opacity-85",
              collapsed && "justify-center w-full"
            )}
          >
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-600 to-indigo-700 text-white flex items-center justify-center font-extrabold text-sm shrink-0 shadow-md shadow-blue-500/20">
              VI
            </div>
            {!collapsed && (
              <div className="flex flex-col leading-tight">
                <span className="text-xs font-bold tracking-wider uppercase text-foreground">
                  Value Intel
                </span>
                <span className="text-[10px] text-muted-foreground font-medium">Enterprise SaaS</span>
              </div>
            )}
          </Link>

          {!collapsed && onToggleCollapse && (
            <button
              type="button"
              onClick={onToggleCollapse}
              className="p-1.5 text-muted-foreground hover:text-foreground rounded-md hover:bg-secondary transition-colors"
              aria-label="Collapse Sidebar"
              title="Collapse Sidebar"
            >
              <PanelLeftClose className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Workspace Selector Bar */}
        <div className="p-3 border-b border-border bg-secondary/30 shrink-0">
          {!collapsed ? (
            <div className="space-y-1">
              <div className="flex items-center justify-between px-1 text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">
                <span>Active Context</span>
                <span className="text-[9px] px-1.5 py-0.2 rounded bg-secondary text-secondary-foreground font-mono border border-border">
                  {isBusiness ? "B2B" : "B2C"}
                </span>
              </div>
              <WorkspaceSelector />
            </div>
          ) : (
            <div className="flex justify-center" title="Active Workspace">
              <div className="w-8 h-8 rounded-md bg-secondary border border-border flex items-center justify-center text-muted-foreground">
                {isBusiness ? <Briefcase className="w-4 h-4" /> : <User className="w-4 h-4" />}
              </div>
            </div>
          )}
        </div>

        {/* Navigation Group Items */}
        <nav aria-label="Sidebar Navigation" className="flex-1 overflow-y-auto p-3 space-y-6">
          {navGroups.map((group, groupIdx) => (
            <div key={groupIdx} className="space-y-1.5">
              {!collapsed && (
                <div className="px-2.5 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                  {group.title}
                </div>
              )}
              <div className="space-y-1">
                {group.items.map((item, itemIdx) => {
                  const Icon = item.icon;
                  const isActive = pathname === item.href || (item.href !== "/business/initiatives" && pathname.startsWith(item.href));

                  return (
                    <Link
                      key={itemIdx}
                      href={item.href}
                      title={collapsed ? item.label : undefined}
                      className={cn(
                        "group relative flex items-center gap-3 px-2.5 py-2 rounded-lg text-xs font-medium transition-all duration-150",
                        isActive
                          ? "bg-blue-500/10 text-blue-500 dark:text-blue-400 font-semibold shadow-xs border border-blue-500/20"
                          : "text-muted-foreground hover:bg-secondary/70 hover:text-foreground",
                        collapsed && "justify-center px-0 py-2.5"
                      )}
                    >
                      {/* Active Left Pill */}
                      {isActive && (
                        <div className="absolute left-0 top-1.5 bottom-1.5 w-1 rounded-r-full bg-blue-500 shadow-sm shadow-blue-500/50" />
                      )}

                      <Icon
                        className={cn(
                          "w-4 h-4 shrink-0 transition-colors",
                          isActive
                            ? "text-blue-500 dark:text-blue-400"
                            : "text-muted-foreground group-hover:text-foreground"
                        )}
                      />

                      {!collapsed && (
                        <span className="flex-1 truncate">{item.label}</span>
                      )}

                      {!collapsed && item.badge && (
                        <span
                          className={cn(
                            "text-[9px] font-semibold px-1.5 py-0.5 rounded-full border",
                            item.badge === "AI" || item.badge === "LLM"
                              ? "bg-cyan-500/10 text-cyan-600 dark:text-cyan-400 border-cyan-500/20"
                              : item.badge === "Alerts"
                              ? "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20"
                              : item.badge === "Sync"
                              ? "bg-sky-500/10 text-sky-600 dark:text-sky-400 border-sky-500/20"
                              : "bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20"
                          )}
                        >
                          {item.badge}
                        </span>
                      )}
                    </Link>
                  );
                })}
              </div>
            </div>
          ))}
        </nav>

        {/* Footer / System Status */}
        <div className="p-3 border-t border-border bg-secondary/30 shrink-0">
          {!collapsed ? (
            <div className="flex items-center justify-between text-[11px] text-muted-foreground">
              <div className="flex items-center gap-1.5 text-emerald-600 dark:text-emerald-400 font-medium">
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>System Operational</span>
              </div>
              <span className="font-mono text-[10px]">v0.1</span>
            </div>
          ) : (
            <div className="flex justify-center" title="System Operational v0.1">
              <CheckCircle2 className="w-4 h-4 text-emerald-500" />
            </div>
          )}
        </div>
      </aside>
    </>
  );
}
