"use client";

import { LoadingState, WorkspaceRouter } from "../components/ui";

export default function RootPage() {
  return (
    <>
      <WorkspaceRouter />
      <LoadingState message="Redirecting to active workspace..." />
    </>
  );
}
