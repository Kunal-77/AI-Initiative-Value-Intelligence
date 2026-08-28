"use client";

import React from "react";
import Link from "@/compat/link";
import { usePathname } from "@/compat/navigation";
import { ChevronRight } from "lucide-react";
import { cn } from "./cn";

export interface BreadcrumbItem {
  label: string;
  href?: string;
}

export interface BreadcrumbsProps extends React.HTMLAttributes<HTMLElement> {
  items?: BreadcrumbItem[];
}

export function Breadcrumbs({ items, className, ...props }: BreadcrumbsProps) {
  const pathname = usePathname();

  let breadcrumbItems: BreadcrumbItem[] = [];

  if (items && items.length > 0) {
    breadcrumbItems = items;
  } else {
    // Generate from pathname
    const segments = pathname.split("/").filter(Boolean);

    if (segments.length === 0) {
      breadcrumbItems = [{ label: "Home", href: "/" }];
    } else {
      let cumulativePath = "";
      breadcrumbItems = segments.map((segment, idx) => {
        cumulativePath += `/${segment}`;
        
        let label = segment;
        if (segment === "business") label = "Business";
        else if (segment === "personal") label = "Personal Workspace";
        else if (segment === "initiatives") label = "Initiatives";
        else if (segment.length > 15 && (segment.startsWith("init_") || segment.length > 20)) {
          label = "Initiative Details";
        } else {
          label = segment.charAt(0).toUpperCase() + segment.slice(1);
        }

        const isLast = idx === segments.length - 1;
        return {
          label,
          href: isLast ? undefined : cumulativePath,
        };
      });
    }
  }

  return (
    <nav
      aria-label="Breadcrumb"
      className={cn("flex items-center text-xs font-medium text-muted-foreground", className)}
      {...props}
    >
      <ol className="flex items-center gap-1.5 flex-wrap">
        {breadcrumbItems.map((item, index) => {
          const isLast = index === breadcrumbItems.length - 1;

          return (
            <li key={index} className="flex items-center gap-1.5">
              {index > 0 && (
                <ChevronRight className="w-3.5 h-3.5 text-muted-foreground shrink-0" aria-hidden="true" />
              )}
              {item.href && !isLast ? (
                <Link
                  href={item.href}
                  className="hover:text-foreground transition-colors focus:outline-none focus:underline"
                >
                  {item.label}
                </Link>
              ) : (
                <span
                  className={cn(
                    isLast ? "text-foreground font-semibold" : "text-muted-foreground"
                  )}
                  aria-current={isLast ? "page" : undefined}
                >
                  {item.label}
                </span>
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
