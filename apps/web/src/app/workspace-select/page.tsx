"use client";

import React, { useState } from "react";
import { useUser, useOrganizationList } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Briefcase, User, ArrowRight, Plus } from "lucide-react";
import { Button, Card, SkeletonMetricsRow, ThemeToggle } from "../../components/ui";

export default function WorkspaceSelectPage() {
  const { user, isLoaded: userLoaded } = useUser();
  const { isLoaded: orgListLoaded, setActive, userMemberships } = useOrganizationList({
    userMemberships: {
      keepPreviousData: true,
    },
  });
  const router = useRouter();
  const [loadingWorkspace, setLoadingWorkspace] = useState<string | null>(null);

  const handleSelectWorkspace = async (workspaceId: string | null) => {
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

  if (!userLoaded || !orgListLoaded) {
    return (
      <div className="min-h-screen bg-background text-foreground flex flex-col items-center justify-center p-6 transition-colors duration-300">
        <div className="w-full max-w-md space-y-6">
          <SkeletonMetricsRow />
        </div>
      </div>
    );
  }

  const organizations = userMemberships.data || [];

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col justify-between font-sans relative overflow-hidden transition-colors duration-300">
      {/* Background Decorative Gradients */}
      <div className="absolute top-[-20%] left-[-10%] w-[60%] h-[60%] bg-purple-900/5 dark:bg-purple-900/10 rounded-full blur-[150px] pointer-events-none" />
      <div className="absolute bottom-[-20%] right-[-10%] w-[60%] h-[60%] bg-indigo-900/5 dark:bg-indigo-900/10 rounded-full blur-[150px] pointer-events-none" />

      {/* Header */}
      <header className="w-full max-w-7xl mx-auto px-6 py-6 flex items-center justify-between border-b border-border/40 relative z-10">
        <Link
          href="/"
          className="flex items-center gap-2.5 group cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 rounded-lg"
          aria-label="Back to landing page"
        >
          <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-purple-600 to-indigo-600 flex items-center justify-center shadow-md shadow-purple-500/20 group-hover:scale-105 transition-transform duration-300">
            <span className="font-extrabold text-sm text-white">V</span>
          </div>
          <span className="font-bold tracking-tight text-sm text-foreground group-hover:text-purple-600 dark:group-hover:text-purple-400 transition-colors">
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
              Select Your Workspace
            </h1>
            <p className="text-sm text-muted-foreground max-w-md mx-auto leading-relaxed">
              Choose the environment configured for your workflow style. You can switch workspaces at any time.
            </p>
          </div>

          {/* Dual Cards Container */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-stretch">
            {/* Card 1: Business Workspace */}
            <div className="group relative rounded-2xl border border-border bg-card p-6 shadow-md transition-all duration-300 hover:border-purple-500/40 hover:shadow-lg flex flex-col justify-between">
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <div className="w-12 h-12 rounded-xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-purple-600 dark:text-purple-400">
                    <Briefcase className="w-6 h-6" />
                  </div>
                  <span className="text-[10px] font-mono uppercase tracking-wider text-purple-600 dark:text-purple-400 font-semibold px-2 py-0.5 rounded-full bg-purple-500/10 dark:bg-purple-950/40 border border-purple-500/15">
                    Enterprise
                  </span>
                </div>

                <div className="space-y-2">
                  <h2 className="text-xl font-bold text-foreground group-hover:text-purple-600 dark:group-hover:text-purple-400 transition-colors">
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
                            className="w-full p-3 rounded-xl border border-border bg-background hover:bg-secondary hover:border-purple-500/30 text-left transition-all flex items-center justify-between text-xs group/item cursor-pointer focus:outline-none focus:ring-2 focus:ring-purple-500/20"
                          >
                            <span className="font-semibold text-foreground group-hover/item:text-purple-600 dark:group-hover/item:text-purple-400 transition-colors">
                              {org.name}
                            </span>
                            {isSelected ? (
                              <span className="text-[10px] font-mono text-purple-600 dark:text-purple-400">Loading...</span>
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
                    className="w-full text-xs h-10 py-0 flex items-center justify-center gap-1.5 shadow-lg shadow-purple-500/10"
                  >
                    <Plus className="w-4 h-4" /> Create or Join Organization
                  </Button>
                )}
              </div>
            </div>

            {/* Card 2: Personal Workspace */}
            <div className="group relative rounded-2xl border border-border bg-card p-6 shadow-md transition-all duration-300 hover:border-indigo-500/40 hover:shadow-lg flex flex-col justify-between">
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <div className="w-12 h-12 rounded-xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-600 dark:text-indigo-400">
                    <User className="w-6 h-6" />
                  </div>
                  <span className="text-[10px] font-mono uppercase tracking-wider text-indigo-600 dark:text-indigo-400 font-semibold px-2 py-0.5 rounded-full bg-indigo-500/10 dark:bg-indigo-950/40 border border-indigo-500/15">
                    Individual
                  </span>
                </div>

                <div className="space-y-2">
                  <h2 className="text-xl font-bold text-foreground group-hover:text-indigo-400 transition-colors">
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
                  className="w-full text-xs h-10 py-0 flex items-center justify-center gap-1.5 hover:border-indigo-500/30 font-semibold"
                >
                  Enter Personal Workspace <ArrowRight className="w-4 h-4 text-muted-foreground" />
                </Button>
              </div>
            </div>
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
