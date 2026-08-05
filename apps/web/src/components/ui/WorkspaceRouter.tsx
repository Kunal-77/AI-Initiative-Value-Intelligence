"use client";

import { useAuth, useOrganizationList } from "@clerk/nextjs";
import { useRouter, usePathname } from "next/navigation";
import { useEffect } from "react";
import { useWorkspaceTransition } from "./WorkspaceTransitionContext";

export function WorkspaceRouter() {
  const { isLoaded: authLoaded, isSignedIn, orgId } = useAuth();
  const { isLoaded: orgListLoaded, setActive, userMemberships } = useOrganizationList({
    userMemberships: authLoaded && isSignedIn ? { keepPreviousData: true } : undefined,
  });
  const router = useRouter();
  const pathname = usePathname();
  const { endTransition } = useWorkspaceTransition();

  useEffect(() => {
    if (!authLoaded || !isSignedIn) return;

    // Only guard Business routes if an active organization is missing
    if (pathname.startsWith("/business")) {
      if (!orgId && orgListLoaded) {
        const orgs = userMemberships?.data || [];
        if (orgs.length === 1 && setActive) {
          setActive({ organization: orgs[0].organization.id })
            .catch((err) => console.error("Failed to auto-set org in Business route:", err));
        } else if (orgs.length !== 1) {
          router.replace("/workspace-select?flow=business");
        }
      } else {
        endTransition();
      }
    } else {
      endTransition();
    }
  }, [authLoaded, isSignedIn, orgId, orgListLoaded, pathname, userMemberships?.data, setActive, router, endTransition]);

  return null;
}
