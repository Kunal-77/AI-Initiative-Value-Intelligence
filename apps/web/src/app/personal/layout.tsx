"use client";

import { useAuth } from "@clerk/nextjs";
import { LoadingState, WorkspaceRouter } from "../../components/ui";

export default function PersonalLayout({ children }: { children: React.ReactNode }) {
  const { isLoaded } = useAuth();

  if (!isLoaded) {
    return <LoadingState message="Loading Workspace..." />;
  }

  return (
    <>
      <WorkspaceRouter />
      {children}
    </>
  );
}
