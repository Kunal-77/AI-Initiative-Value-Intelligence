"use client";

import React from "react";
import Link from "@/compat/link";
import { usePathname } from "@/compat/navigation";
import { PanelLeft } from "lucide-react";
import { cn } from "./cn";
import { Breadcrumbs } from "./Breadcrumbs";
import { SearchBar } from "./SearchBar";
import { NotificationButton } from "./NotificationButton";
import { UserMenu } from "./UserMenu";
import { WorkspaceSelector } from "./WorkspaceSelector";

export interface AppHeaderProps extends React.HTMLAttributes<HTMLElement> {
  badge?: React.ReactNode;
  showLink?: boolean;
  rightContent?: React.ReactNode;
  showOrgSwitcher?: boolean;
  showUserButton?: boolean;
  onToggleSidebar?: () => void;
  breadcrumbs?: { label: string; href?: string }[];
}

export const AppHeader = React.forwardRef<HTMLElement, AppHeaderProps>(
  (
    {
      className,
      badge,
      showLink = true,
      rightContent,
      showOrgSwitcher = true,
      showUserButton = true,
      onToggleSidebar,
      breadcrumbs,
      ...props
    },
    ref
  ) => {
    const pathname = usePathname() || "";
    let homeHref = "/";
    if (pathname.startsWith("/business")) {
      homeHref = "/business/initiatives";
    } else if (pathname.startsWith("/personal")) {
      homeHref = "/personal";
    }

    return (
      <header
        ref={ref}
        className={cn(
          "sticky top-0 z-30 h-16 border-b border-border/80 bg-background/80 text-card-foreground backdrop-blur-xl transition-colors",
          className
        )}
        {...props}
      >
        <div className="h-full max-w-[1536px] mx-auto px-4 sm:px-6 flex items-center justify-between gap-4">
          {/* Left section: Sidebar toggle + Brand / Breadcrumbs */}
          <div className="flex items-center gap-3 min-w-0">
            {onToggleSidebar && (
              <button
                type="button"
                onClick={onToggleSidebar}
                className="p-1.5 text-muted-foreground hover:text-foreground rounded-lg hover:bg-secondary transition-colors cursor-pointer"
                aria-label="Toggle Sidebar Navigation"
                title="Toggle Sidebar Navigation"
              >
                <PanelLeft className="w-4 h-4" />
              </button>
            )}

            <div className="flex items-center gap-2.5 min-w-0">
              {showLink ? (
                <Link
                  href={homeHref}
                  className="font-extrabold tracking-wider text-xs bg-gradient-to-r from-foreground to-muted-foreground bg-clip-text text-transparent hover:opacity-85 shrink-0 hidden sm:inline-block uppercase"
                >
                  Value Intelligence
                </Link>
              ) : (
                <span className="font-extrabold tracking-wider text-xs bg-gradient-to-r from-foreground to-muted-foreground bg-clip-text text-transparent shrink-0 hidden sm:inline-block uppercase">
                  Value Intelligence
                </span>
              )}

              {badge && (
                <span className="text-[10px] font-semibold bg-secondary text-secondary-foreground px-2 py-0.5 rounded-full border border-border shrink-0">
                  {badge}
                </span>
              )}

              <div className="hidden md:flex items-center text-border mx-1 shrink-0">|</div>

              <Breadcrumbs items={breadcrumbs} className="hidden md:flex truncate" />
            </div>
          </div>

          {/* Middle section: Enterprise Search Bar */}
          <div className="flex-1 max-w-xs sm:max-w-sm hidden sm:block">
            <SearchBar />
          </div>

          {/* Right section: Workspace Selector, Notifications, Theme, User Menu */}
          <div className="flex items-center gap-2 sm:gap-3 shrink-0">
            {rightContent !== undefined ? (
              rightContent
            ) : (
              <>
                {showOrgSwitcher && (
                  <div className="hidden lg:block w-44">
                    <WorkspaceSelector />
                  </div>
                )}
                <NotificationButton />
                {showUserButton && <UserMenu />}
              </>
            )}
          </div>
        </div>
      </header>
    );
  }
);

AppHeader.displayName = "AppHeader";
