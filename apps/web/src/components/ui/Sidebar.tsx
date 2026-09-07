"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
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
  mobileOpen?: boolean;
  onCloseMobile?: () => void;
}

export function Sidebar({
  className,
  collapsed = false,
  onToggleCollapse,
  mobileOpen,
  onCloseMobile,
  ...props
}: SidebarProps) {
  const pathname = usePathname();
  const { orgId } = useAuth();
  const [internalMobileOpen, setInternalMobileOpen] = useState(false);

  const isMobileOpen = mobileOpen !== undefined ? mobileOpen : internalMobileOpen;
  const closeMobile = () => {
    if (onCloseMobile) {
      onCloseMobile();
    } else {
      setInternalMobileOpen(false);
    }
  };

  // Close mobile drawer on route change
  React.useEffect(() => {
    closeMobile();
  }, [pathname]);

  // Escape key to dismiss mobile drawer
  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isMobileOpen) {
        closeMobile();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isMobileOpen]);

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
        { label: "Overview & Subscriptions", href: "/personal", icon: Layers },
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
          className="fixed inset-0 z-40 bg-[#0B0D11]/80 backdrop-blur-xs lg:hidden transition-opacity"
          onClick={closeMobile}
          aria-hidden="true"
        />
      )}

      <aside
        className={cn(
          "fixed top-0 bottom-0 left-0 z-40 flex flex-col bg-[#0E1116] text-[#F4F1EA] border-r border-[#171C24] transition-all duration-200 ease-in-out select-none shadow-2xl lg:shadow-none",
          collapsed ? "w-16" : "w-64",
          isMobileOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0",
          className
        )}
        {...props}
      >
        {/* Brand Header */}
        <div className="h-16 px-4 flex items-center justify-between border-b border-[#171C24] shrink-0">
          <Link
            href="/"
            className={cn(
              "flex items-center gap-2.5 font-bold tracking-tight text-[#F4F1EA] transition-opacity hover:opacity-85",
              collapsed && "justify-center w-full"
            )}
          >
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[#7DA7D9] to-[#4F759B] text-[#0B0D11] flex items-center justify-center font-extrabold text-sm shrink-0 shadow-md shadow-[#7DA7D9]/20">
              VI
            </div>
            {!collapsed && (
              <div className="flex flex-col leading-tight">
                <span className="text-xs font-bold tracking-wider uppercase text-[#F4F1EA]">
                  Value Intel
                </span>
                <span className="text-[10px] text-[#8F98A8] font-medium">Enterprise Intelligence</span>
              </div>
            )}
          </Link>

          {!collapsed && onToggleCollapse && (
            <button
              type="button"
              onClick={onToggleCollapse}
              className="p-1.5 text-[#8F98A8] hover:text-[#F4F1EA] rounded-md hover:bg-[#171C24] transition-colors"
              aria-label="Collapse Sidebar"
              title="Collapse Sidebar"
            >
              <PanelLeftClose className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Workspace Selector Bar */}
        <div className="p-3 border-b border-[#171C24] bg-[#0B0D11]/40 shrink-0">
          {!collapsed ? (
            <div className="space-y-1">
              <div className="flex items-center justify-between px-1 text-[10px] font-semibold text-[#8F98A8] uppercase tracking-wider">
                <span>Active Context</span>
                <span className="text-[9px] px-1.5 py-0.2 rounded bg-[#171C24] text-[#D9DEE7] font-mono border border-white/[0.06]">
                  {isBusiness ? "B2B" : "B2C"}
                </span>
              </div>
              <WorkspaceSelector />
            </div>
          ) : (
            <div className="flex justify-center" title="Active Workspace">
              <div className="w-8 h-8 rounded-md bg-[#171C24] border border-white/[0.06] flex items-center justify-center text-[#8F98A8]">
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
                <div className="px-2.5 text-[10px] font-semibold uppercase tracking-wider text-[#8F98A8]">
                  {group.title}
                </div>
              )}
              <div className="space-y-1">
                {group.items.map((item, itemIdx) => {
                  const Icon = item.icon;
                  const isActive =
                    pathname === item.href ||
                    (item.href !== "/business/initiatives" &&
                      item.href !== "/personal" &&
                      pathname.startsWith(item.href));

                  return (
                    <Link
                      key={itemIdx}
                      href={item.href}
                      title={collapsed ? item.label : undefined}
                      className={cn(
                        "group relative flex items-center gap-3 px-2.5 py-2 rounded-lg text-xs font-medium transition-all duration-150",
                        isActive
                          ? "bg-[#7DA7D9]/15 text-[#7DA7D9] font-semibold shadow-xs border border-[#7DA7D9]/30"
                          : "text-[#8F98A8] hover:bg-[#171C24]/80 hover:text-[#F4F1EA]",
                        collapsed && "justify-center px-0 py-2.5"
                      )}
                    >
                      {/* Active Left Pill */}
                      {isActive && (
                        <div className="absolute left-0 top-1.5 bottom-1.5 w-1 rounded-r-full bg-[#7DA7D9] shadow-sm shadow-[#7DA7D9]/50" />
                      )}

                      <Icon
                        className={cn(
                          "w-4 h-4 shrink-0 transition-colors",
                          isActive
                            ? "text-[#7DA7D9]"
                            : "text-[#8F98A8] group-hover:text-[#F4F1EA]"
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
                              ? "bg-[#7DA7D9]/10 text-[#7DA7D9] border-[#7DA7D9]/20"
                              : item.badge === "Alerts"
                              ? "bg-[#C9A86A]/10 text-[#C9A86A] border-[#C9A86A]/20"
                              : item.badge === "Governance"
                              ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20"
                              : "bg-[#7DA7D9]/10 text-[#7DA7D9] border-[#7DA7D9]/20"
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
        <div className="p-3 border-t border-[#171C24] bg-[#0B0D11]/40 shrink-0">
          {!collapsed ? (
            <div className="flex items-center justify-between text-[11px] text-[#8F98A8]">
              <div className="flex items-center gap-1.5 text-emerald-400 font-medium">
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>System Operational</span>
              </div>
              <span className="font-mono text-[10px]">v1.0-SEC</span>
            </div>
          ) : (
            <div className="flex justify-center" title="System Operational v1.0-SEC">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            </div>
          )}
        </div>
      </aside>
    </>
  );
}

export default Sidebar;
