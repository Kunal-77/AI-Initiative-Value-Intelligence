"use client";

import { useAuth } from "@clerk/nextjs";
import { useRouter, usePathname } from "next/navigation";
import { useEffect } from "react";
import { useWorkspaceTransition } from "./WorkspaceTransitionContext";

export function WorkspaceRouter() {
  const { isLoaded, orgId, isSignedIn } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const { endTransition } = useWorkspaceTransition();

  useEffect(() => {
    if (!isLoaded || !isSignedIn) return;

    if (orgId) {
      if (!pathname.startsWith("/business")) {
        router.replace("/business/initiatives");
      } else {
        endTransition();
      }
    } else {
      if (!pathname.startsWith("/personal")) {
        router.replace("/personal");
      } else {
        endTransition();
      }
    }
  }, [isLoaded, orgId, isSignedIn, pathname, router, endTransition]);

  return null;
}
