"use client";

import React, { useState, useEffect, Suspense } from "react";
import { useAuth, useUser, useOrganizationList, useClerk } from "@clerk/nextjs";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { Briefcase, User, ArrowRight, Plus } from "lucide-react";
import { Button, SkeletonMetricsRow, ThemeToggle } from "../../components/ui";

function WorkspaceSelectContent() {
  const { isLoaded: authLoaded, isSignedIn } = useAuth();
  const { user, isLoaded: userLoaded } = useUser();
  const { isLoaded: orgListLoaded, setActive, userMemberships } = useOrganizationList({
    userMemberships: authLoaded && isSignedIn ? { keepPreviousData: true } : undefined,
  });
  const { openCreateOrganization } = useClerk();
  const router = useRouter();
  const searchParams = useSearchParams();
  
  // Detect flow parameter
  const isBusinessOnly = searchParams.get("flow") === "business";
  const [loadingWorkspace, setLoadingWorkspace] = useState<string | null>(null);

  useEffect(() => {
    if (authLoaded && !isSignedIn) {
      router.replace("/sign-in?redirect_url=/workspace-select");
    }
  }, [authLoaded, isSignedIn, router]);

  useEffect(() => {
    if (!authLoaded || !isSignedIn || !orgListLoaded) return;
    const orgs = userMemberships?.data || [];
    if (isBusinessOnly && orgs.length === 1 && setActive && !loadingWorkspace) {
      const singleOrgId = orgs[0].organization.id;
      setLoadingWorkspace(singleOrgId);
      setActive({ organization: singleOrgId })
        .then(() => {
          router.replace("/business/initiatives");
        })
        .catch((err) => {
          console.error("Auto-select organization failed:", err);
          setLoadingWorkspace(null);
        });
    }
  }, [authLoaded, isSignedIn, orgListLoaded, isBusinessOnly, userMemberships?.data, setActive, router, loadingWorkspace]);

  const handleSelectWorkspace = async (workspaceId: string | null) => {
    if (workspaceId === "new-org") {
      if (openCreateOrganization) {
        openCreateOrganization();
      }
      return;
    }
    const trackingId = workspaceId || "personal";
    setLoadingWorkspace(trackingId);
    try {
      if (workspaceId === null) {
        // Personal Workspace
        if (setActive) {
          await setActive({ organization: null });
        }
        router.push("/personal");
      } else {
        // Business Workspace Organization
        if (setActive) {
          await setActive({ organization: workspaceId });
        }
        router.push("/business/initiatives");
      }
    } catch (err) {
      console.error("Failed to select workspace:", err);
      setLoadingWorkspace(null);
    }
  };

  const organizations = userMemberships?.data || [];

  if (!authLoaded || !userLoaded || !isSignedIn || !orgListLoaded || (isBusinessOnly && organizations.length === 1)) {
    return (
      <div className="min-h-screen bg-background text-foreground flex flex-col items-center justify-center p-6 transition-colors duration-300">
        <div className="w-full max-w-md space-y-6">
          <SkeletonMetricsRow />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col justify-between font-sans relative overflow-hidden transition-colors duration-300">
      {/* Background Decorative Gradients */}
      <div className="absolute top-[-20%] left-[-10%] w-[60%] h-[60%] bg-blue-900/5 dark:bg-blue-950/25 rounded-full blur-[150px] pointer-events-none" />
      <div className="absolute bottom-[-20%] right-[-10%] w-[60%] h-[60%] bg-indigo-950/5 dark:bg-blue-900/15 rounded-full blur-[150px] pointer-events-none" />

      {/* Header */}
      <header className="w-full max-w-7xl mx-auto px-6 py-6 flex items-center justify-between border-b border-border/40 relative z-10">
        <Link
          href="/"
          className="flex items-center gap-2.5 group cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 rounded-lg"
          aria-label="Back to landing page"
        >
          <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center shadow-md shadow-blue-500/20 group-hover:scale-105 transition-transform duration-300">
            <span className="font-extrabold text-sm text-white">V</span>
          </div>
          <span className="font-bold tracking-tight text-sm text-foreground group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
            Value Intelligence
          </span>
        </Link>
        <div className="flex items-center gap-4">
          <div className="hidden sm:block text-xs text-muted-foreground font-mono">
            Logged in as: <span className="text-foreground font-semibold">{user?.primaryEmailAddress?.emailAddress}</span>
          </div>
          <ThemeToggle />
        </div>
      </header>

      {/* Main Selector */}
      <main className="flex-1 flex flex-col items-center justify-center px-4 py-16 relative z-10">
        <div className="w-full max-w-4xl space-y-12">
          {/* Welcome Text */}
          <div className="text-center space-y-3">
            <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight bg-gradient-to-r from-foreground to-muted-foreground bg-clip-text text-transparent">
              {isBusinessOnly ? "Select Organization" : "Select Your Workspace"}
            </h1>
            <p className="text-sm text-muted-foreground max-w-md mx-auto leading-relaxed">
              {isBusinessOnly
                ? "Choose the organization workspace you'd like to configure or continue with."
                : "Choose the environment configured for your workflow style. You can switch workspaces at any time."}
            </p>
          </div>

          {/* Dual Cards Container */}
          <div className={isBusinessOnly ? "max-w-lg mx-auto w-full" : "grid grid-cols-1 md:grid-cols-2 gap-8 items-stretch"}>
            {/* Card 1: Business Workspace */}
            <div className="group relative rounded-2xl border border-border bg-card p-6 shadow-md transition-all duration-300 hover:border-blue-500/40 hover:shadow-lg hover:shadow-blue-950/20 flex flex-col justify-between">
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <div className="w-12 h-12 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-600 dark:text-blue-400">
                    <Briefcase className="w-6 h-6" />
                  </div>
                  <span className="text-[10px] font-mono uppercase tracking-wider text-blue-600 dark:text-blue-400 font-semibold px-2 py-0.5 rounded-full bg-blue-500/10 dark:bg-blue-950/40 border border-blue-500/15">
                    Enterprise
                  </span>
                </div>

                <div className="space-y-2">
                  <h2 className="text-xl font-bold text-foreground group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                    Business Workspace
                  </h2>
                  <p className="text-xs text-muted-foreground leading-relaxed">
                    AI initiative management, ROI calculations, executive portfolio tracking, and state-machine governance workflows for C-suite decision alignment.
                  </p>
                </div>

                <div className="pt-2 border-t border-border/40 space-y-3">
                  <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider block">
                    Ideal For
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    {["CIO / CTO", "CFO", "Enterprise PMO", "AI Teams"].map((role, idx) => (
                      <span key={idx} className="px-2 py-0.5 rounded bg-secondary border border-border/60 text-[10px] text-foreground font-medium">
                        {role}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              {/* Business Organizations Sub-selection */}
              <div className="mt-8 space-y-4">
                {organizations.length > 0 ? (
                  <div className="space-y-2">
                    <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider block">
                      Select Organization
                    </span>
                    <div className="space-y-2 max-h-[160px] overflow-y-auto pr-1">
                      {organizations.map((membership) => {
                        const org = membership.organization;
                        const isSelected = loadingWorkspace === org.id;
                        return (
                          <button
                            key={org.id}
                            type="button"
                            disabled={loadingWorkspace !== null}
                            onClick={() => handleSelectWorkspace(org.id)}
                            className="w-full p-3 rounded-xl border border-border bg-background hover:bg-secondary hover:border-blue-500/30 text-left transition-all flex items-center justify-between text-xs group/item cursor-pointer focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                          >
                            <span className="font-semibold text-foreground group-hover/item:text-blue-600 dark:group-hover/item:text-blue-400 transition-colors">
                              {org.name}
                            </span>
                            {isSelected ? (
                              <span className="text-[10px] font-mono text-blue-600 dark:text-blue-400">Loading...</span>
                            ) : (
                              <ArrowRight className="w-3.5 h-3.5 text-muted-foreground group-hover/item:translate-x-0.5 transition-transform" />
                            )}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                ) : (
                  <Button
                    onClick={() => handleSelectWorkspace("new-org")}
                    disabled={loadingWorkspace !== null}
                    variant="primary"
                    className="w-full text-xs h-10 py-0 flex items-center justify-center gap-1.5 shadow-lg shadow-blue-500/15"
                  >
                    <Plus className="w-4 h-4" /> Create or Join Organization
                  </Button>
                )}
              </div>
            </div>

            {/* Card 2: Personal Workspace - Rendered conditionally */}
            {!isBusinessOnly && (
              <div className="group relative rounded-2xl border border-border bg-card p-6 shadow-md transition-all duration-300 hover:border-sky-500/40 hover:shadow-lg hover:shadow-blue-950/20 flex flex-col justify-between">
                <div className="space-y-6">
                  <div className="flex items-center justify-between">
                    <div className="w-12 h-12 rounded-xl bg-sky-500/10 border border-sky-500/20 flex items-center justify-center text-sky-600 dark:text-sky-400">
                      <User className="w-6 h-6" />
                    </div>
                    <span className="text-[10px] font-mono uppercase tracking-wider text-sky-600 dark:text-sky-400 font-semibold px-2 py-0.5 rounded-full bg-sky-500/10 dark:bg-sky-950/40 border border-sky-500/15">
                      Individual
                    </span>
                  </div>

                  <div className="space-y-2">
                    <h2 className="text-xl font-bold text-foreground group-hover:text-sky-400 transition-colors">
                      Personal Workspace
                    </h2>
                    <p className="text-xs text-muted-foreground leading-relaxed">
                      Improve individual productivity, structure everyday workflows, manage individual initiatives, and test backend API configurations inside your private sandbox.
                    </p>
                  </div>

                  <div className="pt-2 border-t border-border/40 space-y-3">
                    <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider block">
                      Ideal For
                    </span>
                    <div className="flex flex-wrap gap-1.5">
                      {["Founders", "Professionals", "Freelancers", "Developers"].map((role, idx) => (
                        <span key={idx} className="px-2 py-0.5 rounded bg-secondary border border-border/60 text-[10px] text-foreground font-medium">
                          {role}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="mt-8">
                  <Button
                    onClick={() => handleSelectWorkspace(null)}
                    loading={loadingWorkspace === "personal"}
                    disabled={loadingWorkspace !== null}
                    variant="secondary"
                    className="w-full text-xs font-bold py-2.5 flex items-center justify-center gap-1.5 hover:border-sky-500/40 hover:text-sky-400"
                  >
                    Enter Personal Workspace <ArrowRight className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            )}
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="w-full max-w-7xl mx-auto px-6 py-6 text-center text-[10px] text-muted-foreground border-t border-border/40 relative z-10">
        © 2026 AI Initiative Value Intelligence. All rights reserved. Premium C-Suite Decision Intelligence.
      </footer>
    </div>
  );
}

export default function WorkspaceSelectPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-background text-foreground flex flex-col items-center justify-center p-6">
        <div className="w-full max-w-md space-y-6">
          <SkeletonMetricsRow />
        </div>
      </div>
    }>
      <WorkspaceSelectContent />
    </Suspense>
  );
}
