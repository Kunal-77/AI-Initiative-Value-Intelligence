"use client";

import { ClerkProvider } from "@clerk/nextjs";
import { WorkspaceTransitionProvider, WorkspaceTransitionOverlay } from "../components/ui";

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <ClerkProvider>
      <WorkspaceTransitionProvider>
        {children}
        <WorkspaceTransitionOverlay />
      </WorkspaceTransitionProvider>
    </ClerkProvider>
  );
}
