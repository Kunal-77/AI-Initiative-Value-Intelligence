"use client";

import { ClerkProvider } from "@clerk/nextjs";
import { ThemeProvider } from "next-themes";
import { WorkspaceTransitionProvider, WorkspaceTransitionOverlay } from "../components/ui";

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <ClerkProvider>
      <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
        <WorkspaceTransitionProvider>
          {children}
          <WorkspaceTransitionOverlay />
        </WorkspaceTransitionProvider>
      </ThemeProvider>
    </ClerkProvider>
  );
}
