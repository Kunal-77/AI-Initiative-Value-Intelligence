"use client";

import React, { createContext, useContext, useState, useCallback, useEffect } from "react";

interface WorkspaceTransitionContextType {
  isTransitioning: boolean;
  targetName: string | null;
  targetIsOrg: boolean;
  startTransition: (name: string, isOrg: boolean) => void;
  endTransition: () => void;
  toastError: string | null;
  setToastError: (error: string | null) => void;
}

const WorkspaceTransitionContext = createContext<WorkspaceTransitionContextType | undefined>(undefined);

export function WorkspaceTransitionProvider({ children }: { children: React.ReactNode }) {
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [targetName, setTargetName] = useState<string | null>(null);
  const [targetIsOrg, setTargetIsOrg] = useState(false);
  const [toastError, setToastError] = useState<string | null>(null);

  const startTransition = useCallback((name: string, isOrg: boolean) => {
    setTargetName(name);
    setTargetIsOrg(isOrg);
    setIsTransitioning(true);
    setToastError(null);
  }, []);

  const endTransition = useCallback(() => {
    setIsTransitioning(false);
    setTargetName(null);
  }, []);

  // Auto-dismiss toast error after 4s
  useEffect(() => {
    if (toastError) {
      const timer = setTimeout(() => setToastError(null), 4000);
      return () => clearTimeout(timer);
    }
  }, [toastError]);

  return (
    <WorkspaceTransitionContext.Provider
      value={{
        isTransitioning,
        targetName,
        targetIsOrg,
        startTransition,
        endTransition,
        toastError,
        setToastError,
      }}
    >
      {children}
    </WorkspaceTransitionContext.Provider>
  );
}

export function useWorkspaceTransition() {
  const context = useContext(WorkspaceTransitionContext);
  if (!context) {
    throw new Error("useWorkspaceTransition must be used within a WorkspaceTransitionProvider");
  }
  return context;
}
