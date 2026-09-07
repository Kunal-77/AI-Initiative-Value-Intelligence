"use client";

import React, { useState, useEffect, Suspense } from "react";
import { useAuth, useUser, useOrganizationList, useClerk } from "@clerk/nextjs";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { Briefcase, User, ArrowRight, Plus, HelpCircle, Shield, Sparkles } from "lucide-react";
import {
  Button,
  SkeletonMetricsRow,
  ThemeToggle,
  TelemetryGridCanvas,
  ScrollProgressBar,
  SpotlightCard,
  BorderBeam,
} from "@/components/ui";

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
    document.title = "Select Workspace Context | AIVI";
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
      <div className="min-h-screen bg-[#0B0D11] text-[#F4F1EA] flex flex-col items-center justify-center p-6">
        <div className="w-full max-w-md space-y-6">
          <SkeletonMetricsRow />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0B0D11] text-[#F4F1EA] flex flex-col justify-between font-sans relative overflow-hidden transition-colors selection:bg-[#7DA7D9]/30">
      <ScrollProgressBar />
      <TelemetryGridCanvas particleCount={30} connectionDistance={120} speed={0.3} />

      {/* Header */}
      <header className="w-full max-w-7xl mx-auto px-6 py-6 flex items-center justify-between border-b border-[#171C24] relative z-10">
        <Link
          href="/"
          className="flex items-center gap-2.5 group cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-[#7DA7D9] rounded-lg"
          aria-label="Back to landing page"
        >
          <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-[#7DA7D9] to-[#4F759B] flex items-center justify-center shadow-md shadow-[#7DA7D9]/20 group-hover:scale-105 transition-transform duration-300">
            <span className="font-extrabold text-sm text-[#0B0D11]">V</span>
          </div>
          <span className="font-bold tracking-tight text-sm text-[#F4F1EA] group-hover:text-[#7DA7D9] transition-colors">
            Value Intelligence
          </span>
        </Link>
        <div className="flex items-center gap-4">
          <div className="hidden sm:block text-xs text-[#8F98A8] font-mono">
            Logged in as: <span className="text-[#F4F1EA] font-semibold">{user?.primaryEmailAddress?.emailAddress}</span>
          </div>
          <ThemeToggle />
        </div>
      </header>

      {/* Main Selector */}
      <main className="flex-1 flex flex-col items-center justify-center px-4 py-16 relative z-10">
        <div className="w-full max-w-4xl space-y-12">
          {/* Welcome Text */}
          <div className="text-center space-y-3">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-[#202630] bg-[#11151C] text-[10px] font-mono text-[#7DA7D9] uppercase tracking-wider">
              <Shield className="w-3 h-3 text-[#7DA7D9]" />
              Enterprise Security Enclave
            </div>
            <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-[#F4F1EA]">
              {isBusinessOnly ? "Select Organization" : "Select Your Workspace Context"}
            </h1>
            <p className="text-xs text-[#8F98A8] max-w-md mx-auto leading-relaxed">
              {isBusinessOnly
                ? "Choose the enterprise organization workspace you wish to analyze or govern."
                : "Choose the environment configured for your workflow style. You can switch workspaces at any time."}
            </p>
          </div>

          {/* Dual Cards Container */}
          <div className={isBusinessOnly ? "max-w-lg mx-auto w-full" : "grid grid-cols-1 md:grid-cols-2 gap-8 items-stretch"}>
            {/* Card 1: Business Workspace */}
            <SpotlightCard
              tiltEnabled={true}
              spotlightColor="rgba(125, 167, 217, 0.14)"
              className="p-7 flex flex-col justify-between border-[#202630] bg-[#11151C]/95 hover:border-[#7DA7D9]/40 relative group"
            >
              <BorderBeam size={180} duration={12} colorFrom="#7DA7D9" colorTo="#4F759B" />
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <div className="w-12 h-12 rounded-xl bg-[#7DA7D9]/10 border border-[#7DA7D9]/20 flex items-center justify-center text-[#7DA7D9]">
                    <Briefcase className="w-5 h-5" />
                  </div>
                  <span className="text-[9px] font-mono uppercase tracking-[0.16em] bg-[#7DA7D9]/10 border border-[#7DA7D9]/25 text-[#7DA7D9] px-2.5 py-0.5 rounded-full font-bold">
                    B2B Enterprise
                  </span>
                </div>

                <div className="space-y-2 text-xs">
                  <h2 className="text-lg font-bold text-[#F4F1EA] flex items-center gap-1.5">
                    Business Workspace
                  </h2>
                  <p className="text-[#8F98A8] leading-relaxed text-[11px]">
                    Access multi-initiative portfolios, run financial NPV/IRR calculations, review stage-gate approvals, and audit AI ROI.
                  </p>
                </div>

                {organizations.length > 0 ? (
                  <div className="space-y-3">
                    <div className="text-[10px] font-mono uppercase tracking-wider text-[#8F98A8]">
                      Available Organizations ({organizations.length})
                    </div>
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
                            className="w-full p-3 rounded-xl border border-[#202630] bg-[#171C24] hover:bg-[#202630] hover:border-[#7DA7D9]/40 text-left transition-all flex items-center justify-between text-xs group/item cursor-pointer focus:outline-none focus:ring-2 focus:ring-[#7DA7D9]/30"
                          >
                            <span className="font-semibold text-[#F4F1EA] group-hover/item:text-[#7DA7D9] transition-colors">
                              {org.name}
                            </span>
                            {isSelected ? (
                              <span className="text-[10px] font-mono text-[#7DA7D9] animate-pulse">Loading...</span>
                            ) : (
                              <ArrowRight className="w-3.5 h-3.5 text-[#8F98A8] group-hover/item:translate-x-0.5 transition-transform group-hover/item:text-[#7DA7D9]" />
                            )}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                ) : (
                  <div className="p-4 rounded-xl border border-[#202630] bg-[#171C24]/50 text-center text-xs space-y-2">
                    <HelpCircle className="w-6 h-6 text-[#8F98A8] mx-auto" />
                    <p className="text-[11px] text-[#8F98A8]">
                      You are not currently linked to an enterprise organization.
                    </p>
                  </div>
                )}
              </div>

              <div className="mt-8">
                <Button
                  onClick={() => handleSelectWorkspace("new-org")}
                  disabled={loadingWorkspace !== null}
                  variant="secondary"
                  className="w-full text-xs font-bold py-2.5 flex items-center justify-center gap-1.5 bg-[#171C24] text-[#F4F1EA] border border-[#202630] hover:border-[#7DA7D9]/40 hover:bg-[#202630] rounded-xl cursor-pointer"
                >
                  <Plus className="w-4 h-4 text-[#7DA7D9]" /> Register New Organization
                </Button>
              </div>
            </SpotlightCard>

            {/* Card 2: Personal Workspace */}
            {!isBusinessOnly && (
              <SpotlightCard
                tiltEnabled={true}
                spotlightColor="rgba(201, 168, 106, 0.14)"
                className="p-7 flex flex-col justify-between border-[#202630] bg-[#11151C]/95 hover:border-[#C9A86A]/40 relative group"
              >
                <div className="space-y-6">
                  <div className="flex items-center justify-between">
                    <div className="w-12 h-12 rounded-xl bg-[#C9A86A]/10 border border-[#C9A86A]/20 flex items-center justify-center text-[#C9A86A]">
                      <User className="w-5 h-5" />
                    </div>
                    <span className="text-[9px] font-mono uppercase tracking-[0.16em] bg-[#C9A86A]/10 border border-[#C9A86A]/25 text-[#C9A86A] px-2.5 py-0.5 rounded-full font-bold">
                      B2C Personal
                    </span>
                  </div>

                  <div className="space-y-2 text-xs">
                    <h2 className="text-lg font-bold text-[#F4F1EA]">
                      Personal Workspace
                    </h2>
                    <p className="text-[#8F98A8] leading-relaxed text-[11px]">
                      Manage recurring SaaS subscriptions, individual AI API keys, cloud computing sandboxes, and monthly billing cycles.
                    </p>
                  </div>

                  <div className="space-y-3">
                    <div className="text-[10px] font-mono uppercase tracking-wider text-[#8F98A8]">
                      Designed For
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {["Engineers", "Founders", "Designers", "Researchers"].map((role, idx) => (
                        <span
                          key={idx}
                          className="px-2.5 py-1 rounded-md bg-[#171C24] border border-[#202630] text-[10px] text-[#D9DEE7] font-medium font-mono"
                        >
                          {role}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="mt-8">
                  <Button
                    onClick={() => handleSelectWorkspace(null)}
                    disabled={loadingWorkspace !== null}
                    variant="primary"
                    className="w-full text-xs font-bold py-2.5 flex items-center justify-center gap-1.5 bg-[#C9A86A] text-[#0B0D11] hover:bg-[#D4B87D] rounded-xl shadow-lg active:scale-[0.99] transition-all cursor-pointer"
                  >
                    {loadingWorkspace === "personal" ? (
                      <span className="animate-pulse font-mono">Entering Workspace...</span>
                    ) : (
                      <>
                        Enter Personal Workspace <ArrowRight className="w-4 h-4" />
                      </>
                    )}
                  </Button>
                </div>
              </SpotlightCard>
            )}
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="w-full max-w-7xl mx-auto px-6 py-6 text-center text-[11px] text-[#8F98A8] border-t border-[#171C24] relative z-10 font-mono">
        © 2026 AI Initiative Value Intelligence. Institutional Decision Grade Platform.
      </footer>
    </div>
  );
}

export default function WorkspaceSelectPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-[#0B0D11] text-[#F4F1EA] flex flex-col items-center justify-center p-6">
          <div className="w-full max-w-md space-y-6">
            <SkeletonMetricsRow />
          </div>
        </div>
      }
    >
      <WorkspaceSelectContent />
    </Suspense>
  );
}
