"use client";

import React, { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth, useOrganizationList, useClerk } from "@clerk/nextjs";
import {
  Sparkles,
  ArrowRight,
  TrendingUp,
  ShieldCheck,
  Activity,
  Layers,
  CheckCircle2,
  Plug,
  Lock,
  ChevronDown,
  Play,
  Cpu,
  Database,
  Terminal,
  FileSpreadsheet,
  Check,
  Zap,
  HelpCircle,
  Briefcase,
  User,
  Settings,
  LogOut,
} from "lucide-react";
import { Button, ThemeToggle } from "../components/ui";

export default function LandingPage() {
  const { isLoaded: authLoaded, isSignedIn } = useAuth();
  const router = useRouter();
  const { openUserProfile, signOut } = useClerk();
  const { isLoaded: orgListLoaded, setActive, userMemberships } = useOrganizationList({
    userMemberships: authLoaded && isSignedIn ? { keepPreviousData: true } : undefined,
  });

  const [activeTourStep, setActiveTourStep] = useState(0);
  const [isYearlyPricing, setIsYearlyPricing] = useState(false);
  const [openFaqIndex, setOpenFaqIndex] = useState<number | null>(null);
  const [isConsoleOpen, setIsConsoleOpen] = useState(false);
  const [loadingBusiness, setLoadingBusiness] = useState(false);
  const consoleDropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown on click outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (consoleDropdownRef.current && !consoleDropdownRef.current.contains(event.target as Node)) {
        setIsConsoleOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  if (!authLoaded) {
    return (
      <div className="min-h-screen bg-background text-foreground flex flex-col items-center justify-center p-6 relative overflow-hidden transition-colors duration-300">
        <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-blue-900/10 rounded-full blur-[150px] pointer-events-none" />
        <div className="absolute top-[40%] right-[-10%] w-[50%] h-[50%] bg-indigo-950/20 rounded-full blur-[150px] pointer-events-none" />
        <div className="flex flex-col items-center space-y-4 relative z-10 animate-in fade-in duration-200">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center shadow-lg shadow-blue-500/25 animate-pulse">
            <span className="font-extrabold text-xl text-white">V</span>
          </div>
          <div className="flex items-center gap-2 text-xs font-semibold text-muted-foreground font-mono">
            <div className="w-2 h-2 rounded-full bg-blue-500 animate-ping" />
            <span>Verifying session context...</span>
          </div>
        </div>
      </div>
    );
  }

  const handleBusinessWorkspaceClick = async () => {
    if (!authLoaded || !isSignedIn) {
      router.push("/sign-up?redirect_url=/workspace-select%3Fflow%3Dbusiness");
      return;
    }
    setLoadingBusiness(true);
    try {
      const orgs = userMemberships?.data || [];
      if (orgs.length === 1 && setActive) {
        const orgId = orgs[0].organization.id;
        await setActive({ organization: orgId });
        router.push("/business/initiatives");
      } else {
        router.push("/workspace-select?flow=business");
      }
    } catch (err) {
      console.error("Error setting active organization:", err);
      router.push("/workspace-select?flow=business");
    } finally {
      setLoadingBusiness(false);
    }
  };

  const handlePersonalWorkspaceClick = async () => {
    if (!authLoaded || !isSignedIn) {
      router.push("/sign-up?redirect_url=/personal");
      return;
    }
    try {
      if (setActive) {
        await setActive({ organization: null });
      }
      router.push("/personal");
    } catch (err) {
      console.error("Error clearing organization for personal workspace:", err);
      router.push("/personal");
    }
  };

  // guided tour mockup content
  const tourSteps = [
    {
      title: "Executive Command Center",
      description: "Get immediate clarity on total portfolio ROI, net realized savings, and program risks across all active lines.",
      badge: "Analytics",
      mockup: (
        <div className="p-6 rounded-xl border border-border/80 bg-card/95 text-foreground space-y-4 shadow-2xl font-sans text-xs">
          <div className="flex items-center justify-between border-b border-border/60 pb-3">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span className="font-bold text-foreground">Portfolio Health & Financial Ledger</span>
            </div>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-blue-500/10 text-blue-500 dark:text-blue-400 font-semibold border border-blue-500/20">Live Sync</span>
          </div>
          <div className="grid grid-cols-3 gap-3">
            <div className="p-3 rounded-lg bg-secondary/30 border border-border/60 text-center space-y-1">
              <span className="text-[9px] uppercase tracking-wider text-muted-foreground font-bold block">Portfolio ROI</span>
              <span className="text-base font-extrabold text-blue-500 dark:text-blue-400 font-mono">+215.4%</span>
            </div>
            <div className="p-3 rounded-lg bg-secondary/30 border border-border/60 text-center space-y-1">
              <span className="text-[9px] uppercase tracking-wider text-muted-foreground font-bold block">Realized Savings</span>
              <span className="text-base font-extrabold text-emerald-500 dark:text-emerald-400 font-mono">$4.94M</span>
            </div>
            <div className="p-3 rounded-lg bg-secondary/30 border border-border/60 text-center space-y-1">
              <span className="text-[9px] uppercase tracking-wider text-muted-foreground font-bold block">Active Pilots</span>
              <span className="text-base font-extrabold text-foreground font-mono">14</span>
            </div>
          </div>
          <div className="space-y-1.5 pt-1">
            <div className="flex justify-between text-[10px] text-muted-foreground font-mono">
              <span>Budget Allocation ($4.8M Target)</span>
              <span className="font-bold text-foreground">78% Utilized</span>
            </div>
            <div className="h-2 bg-secondary rounded-full overflow-hidden border border-border/60">
              <div className="h-full bg-gradient-to-r from-blue-600 to-indigo-600 rounded-full w-[78%] transition-all duration-500" />
            </div>
          </div>
          <div className="pt-2 border-t border-border/60 flex items-center justify-between text-[10px] text-muted-foreground">
            <span>Next Executive Gate: <strong>Q3 Portfolio Review</strong></span>
            <span className="text-blue-500 dark:text-blue-400 font-semibold font-mono">12 Initiatives on Track</span>
          </div>
        </div>
      ),
    },
    {
      title: "AI Studio Recommendations",
      description: "Generate deep explainable summaries, model NPV forecast curves, and run multi-scenario comparisons.",
      badge: "AI Modeling",
      mockup: (
        <div className="p-6 rounded-xl border border-border/80 bg-card/95 text-foreground space-y-4 shadow-2xl font-sans text-xs">
          <div className="flex items-center justify-between border-b border-border/60 pb-3">
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-cyan-500 dark:text-cyan-400" />
              <span className="font-bold text-foreground">AI Value Studio Forecaster</span>
            </div>
            <span className="text-[10px] font-mono text-cyan-500 dark:text-cyan-400 px-2 py-0.5 rounded bg-cyan-500/10 border border-cyan-500/20 font-bold">94% Confidence</span>
          </div>
          <div className="p-3.5 rounded-lg bg-cyan-500/5 border border-cyan-500/20 space-y-2">
            <div className="flex justify-between text-[11px]">
              <span className="font-semibold text-foreground">GPU Cluster Optimization Engine</span>
              <span className="font-mono text-emerald-500 dark:text-emerald-400 font-bold">+148% Projected ROI</span>
            </div>
            <p className="text-[11px] text-muted-foreground leading-relaxed">
              Recommendation: Fast-track to immediate pilot scale. Expected payback period is 9.2 months with Net Present Value (NPV) of $1,240,000.
            </p>
          </div>
          <div className="grid grid-cols-2 gap-2 text-[10px] font-mono">
            <div className="p-2 rounded bg-secondary/30 border border-border/50">
              <span className="text-muted-foreground block">Discount Rate</span>
              <span className="font-bold text-foreground">8.5% (WACC)</span>
            </div>
            <div className="p-2 rounded bg-secondary/30 border border-border/50">
              <span className="text-muted-foreground block">Risk Factor</span>
              <span className="font-bold text-emerald-500 dark:text-emerald-400">Low Variance (±4%)</span>
            </div>
          </div>
          <div className="flex gap-2 pt-1">
            <button type="button" className="px-3 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-white font-semibold text-[10px] shadow-sm transition-colors cursor-pointer">Accept Scenario</button>
            <button type="button" className="px-3 py-1.5 rounded-lg bg-secondary hover:bg-secondary/80 border border-border text-foreground font-semibold text-[10px] transition-colors cursor-pointer">Run Alternative</button>
          </div>
        </div>
      ),
    },
    {
      title: "Governance State Machine",
      description: "Track initiative lifecycle gates through an 8-stage state machine with complete audit trails and SLA checks.",
      badge: "Compliance",
      mockup: (
        <div className="p-6 rounded-xl border border-border/80 bg-card/95 text-foreground space-y-4 shadow-2xl font-sans text-xs">
          <div className="flex items-center justify-between border-b border-border/60 pb-3">
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-blue-500 dark:text-blue-400" />
              <span className="font-bold text-foreground">Active Governance State Gate</span>
            </div>
            <span className="text-[10px] font-mono text-amber-500 dark:text-amber-400 font-semibold px-2 py-0.5 rounded bg-amber-500/10 border border-amber-500/20">SLA Active: 1.4d</span>
          </div>
          <div className="flex items-center gap-1.5 overflow-x-auto py-1">
            {["Draft", "Review", "Approved", "Deploying"].map((step, idx) => (
              <div key={idx} className="flex items-center gap-1 shrink-0">
                <span className={`px-2.5 py-1 rounded-md text-[10px] font-semibold ${
                  idx <= 2
                    ? "bg-blue-500/15 text-blue-500 dark:text-blue-400 border border-blue-500/30"
                    : "bg-secondary text-muted-foreground border border-border/60"
                }`}>
                  {step}
                </span>
                {idx < 3 && <span className="text-muted-foreground text-xs font-bold">→</span>}
              </div>
            ))}
          </div>
          <div className="p-3 bg-secondary/30 rounded-lg border border-border/60 font-mono text-[10px] text-muted-foreground space-y-1">
            <div className="text-foreground font-semibold">[2026-08-04 14:20] User Marc.V transitioned state: REVIEW → APPROVED</div>
            <div>[2026-08-04 14:20] Cryptographic hash sha256:7f8a9e recorded to immutable ledger.</div>
            <div>[2026-08-04 14:20] Automated notification dispatched to Executive Sponsor.</div>
          </div>
        </div>
      ),
    },
  ];

  const faqs = [
    {
      q: "What is the difference between the Business and Personal workspaces?",
      a: "The Business Workspace is built for enterprise organizations requiring multi-tenant isolation (Supabase RLS), custom RBAC configuration, Power BI connectors, governance workflows, and multi-provider AI observability dashboards. The Personal Workspace is a sandbox for individual founders, developers, or students to manage personal productivity tools, track personal tasks, and test API connectivity.",
    },
    {
      q: "Does the platform support multi-provider AI model switching?",
      a: "Yes. Our AI Provider Engine supports OpenAI, Azure OpenAI, Google Gemini, Anthropic Claude, Local Ollama, and a robust Mock engine fallback out-of-the-box. Developers can configure API keys dynamically in the admin console.",
    },
    {
      q: "How is tenant security managed?",
      a: "Security is built directly into our database architecture. We use PostgreSQL Row Level Security (RLS) policies linking every record back to a Clerk tenant organization, ensuring complete isolation of corporate data.",
    },
  ];

  return (
    <div className="min-h-screen bg-background text-foreground font-sans selection:bg-blue-600/30 overflow-hidden relative transition-colors duration-300">
      {/* Background Ambience & Dot Grid Texture */}
      <div className="absolute inset-0 bg-dot-pattern opacity-[0.035] pointer-events-none z-0" />

      {/* Single Signature Hero Gradient Mesh (Violet -> Indigo -> Electric Blue -> Navy) */}
      <div className="hero-gradient-mesh absolute top-[-10%] left-1/2 -translate-x-1/2 w-[1100px] h-[650px] pointer-events-none animate-hero-mesh z-0" />

      {/* Header / Navigation */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-background/70 backdrop-blur-md border-b border-border/40">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <button
            type="button"
            onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
            className="flex items-center gap-2.5 group cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 rounded-lg active:scale-[0.98] transition-transform"
            aria-label="Scroll back to top"
          >
            <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center shadow-lg shadow-blue-500/20 group-hover:scale-105 transition-transform duration-300">
              <span className="font-extrabold text-sm text-white">V</span>
            </div>
            <span className="font-bold tracking-tight text-sm text-foreground group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
              Value Intelligence
            </span>
          </button>

          <nav className="hidden md:flex items-center gap-6 text-xs text-muted-foreground font-medium">
            <a href="#problems" className="hover:text-foreground transition-colors">Solutions</a>
            <a href="#overview" className="hover:text-foreground transition-colors">Platform</a>
            <a href="#features" className="hover:text-foreground transition-colors">Workspace</a>
            <a href="#pricing" className="hover:text-foreground transition-colors">Pricing</a>
            <a href="#faq" className="hover:text-foreground transition-colors">FAQ</a>
          </nav>

          <div className="flex items-center gap-3">
            {isSignedIn ? (
              <div className="relative" ref={consoleDropdownRef}>
                <Button
                  variant="primary"
                  onClick={() => setIsConsoleOpen(!isConsoleOpen)}
                  className="px-4 py-1.5 text-xs font-semibold flex items-center gap-1 active:scale-[0.98] transition-all"
                >
                  Console <ChevronDown className={`w-3.5 h-3.5 transition-transform duration-200 ${isConsoleOpen ? "rotate-180" : ""}`} />
                </Button>
                {isConsoleOpen && (
                  <div className="absolute right-0 mt-2 w-48 rounded-lg border border-border bg-card p-1 shadow-lg z-50 animate-in fade-in slide-in-from-top-1 duration-200">
                    <button
                      type="button"
                      disabled={loadingBusiness}
                      onClick={() => {
                        setIsConsoleOpen(false);
                        handleBusinessWorkspaceClick();
                      }}
                      className="w-full flex items-center gap-2 px-3 py-2 rounded-md text-left text-xs font-semibold text-foreground hover:bg-secondary transition-colors cursor-pointer disabled:opacity-50"
                    >
                      <Briefcase className="w-3.5 h-3.5 text-blue-500" />
                      <span>Business Workspace</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setIsConsoleOpen(false);
                        handlePersonalWorkspaceClick();
                      }}
                      className="w-full flex items-center gap-2 px-3 py-2 rounded-md text-left text-xs font-semibold text-foreground hover:bg-secondary transition-colors cursor-pointer"
                    >
                      <User className="w-3.5 h-3.5 text-sky-400" />
                      <span>Personal Workspace</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setIsConsoleOpen(false);
                        router.push("/workspace-select");
                      }}
                      className="w-full flex items-center gap-2 px-3 py-2 rounded-md text-left text-xs font-semibold text-foreground hover:bg-secondary transition-colors cursor-pointer"
                    >
                      <Layers className="w-3.5 h-3.5 text-muted-foreground" />
                      <span>Switch Workspace</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setIsConsoleOpen(false);
                        if (openUserProfile) {
                          openUserProfile();
                        } else {
                          router.push("/personal");
                        }
                      }}
                      className="w-full flex items-center gap-2 px-3 py-2 rounded-md text-left text-xs font-semibold text-foreground hover:bg-secondary transition-colors cursor-pointer"
                    >
                      <Settings className="w-3.5 h-3.5 text-muted-foreground" />
                      <span>Manage Account</span>
                    </button>
                    <div className="h-px bg-border my-1" />
                    <button
                      type="button"
                      onClick={async () => {
                        setIsConsoleOpen(false);
                        await signOut();
                        router.push("/");
                      }}
                      className="w-full flex items-center gap-2 px-3 py-2 rounded-md text-left text-xs font-semibold text-rose-600 dark:text-rose-400 hover:bg-rose-500/10 transition-colors cursor-pointer"
                    >
                      <LogOut className="w-3.5 h-3.5" />
                      <span>Sign Out</span>
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <>
                <Link href="/sign-in">
                  <span className="text-xs text-muted-foreground hover:text-foreground transition-colors font-medium mr-2 cursor-pointer font-bold">
                    Sign In
                  </span>
                </Link>
                <Link href="/sign-up">
                  <Button variant="primary" className="px-4 py-1.5 text-xs font-semibold active:scale-[0.98] transition-all">
                    Get Started
                  </Button>
                </Link>
              </>
            )}
            <ThemeToggle />
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="pt-32 pb-20 px-6 max-w-7xl mx-auto text-center space-y-8 relative z-10">
        <div className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-blue-500/10 border border-blue-500/20 text-[10px] font-semibold text-blue-600 dark:text-blue-400 tracking-wide hero-entrance-badge">
          <Sparkles className="w-3.5 h-3.5 text-cyan-500 dark:text-cyan-400" /> Built for enterprise AI governance teams
        </div>
 
        <div className="space-y-4 max-w-4xl mx-auto">
          <h1 className="text-4xl sm:text-6xl font-extrabold tracking-tight leading-[1.1] text-transparent bg-clip-text bg-gradient-to-b from-foreground to-muted-foreground hero-entrance-title">
            Transform AI Investments Into Measurable Business Value
          </h1>
          <p className="text-sm sm:text-base text-muted-foreground max-w-2xl mx-auto leading-relaxed hero-entrance-desc">
            The world's first unified public decision intelligence system. Model ROIs, review governance gates, monitor multi-provider models, and manage personal productivity.
          </p>
        </div>
 
        <div className="flex items-center justify-center gap-3.5 hero-entrance-ctas">
          {isSignedIn ? (
            <>
              <Button
                variant="primary"
                onClick={handleBusinessWorkspaceClick}
                disabled={loadingBusiness}
                className="px-5 py-2.5 text-xs font-bold shadow-lg shadow-blue-500/20 active:scale-[0.98] transition-all cta-button-hover"
              >
                {loadingBusiness ? "Loading..." : "Business Workspace"} <ArrowRight className="w-3.5 h-3.5" />
              </Button>
              <Button
                variant="secondary"
                onClick={handlePersonalWorkspaceClick}
                className="px-5 py-2.5 text-xs font-bold active:scale-[0.98] transition-all cta-button-hover"
              >
                Personal Workspace <ArrowRight className="w-3.5 h-3.5" />
              </Button>
            </>
          ) : (
            <>
              <Link href="/sign-up">
                <Button variant="primary" className="px-5 py-2.5 text-xs font-bold shadow-lg shadow-blue-500/20 active:scale-[0.98] transition-all cta-button-hover">
                  Get Started
                </Button>
              </Link>
              <a href="#tour">
                <Button variant="secondary" className="px-5 py-2.5 text-xs font-bold active:scale-[0.98] transition-all cta-button-hover">
                  Explore Guided Tour
                </Button>
              </a>
            </>
          )}
        </div>
 
        {/* Dashboard Preview Frame */}
        <div className="pt-12 max-w-5xl mx-auto relative group hero-entrance-dashboard">
          <div className="rounded-2xl border border-border/80 dark:border-blue-500/25 bg-card p-4 relative overflow-hidden backdrop-blur-xs animate-product-float dashboard-rim-glow dashboard-hover-state">
            <div className="flex items-center gap-1.5 pb-3 border-b border-border/60 text-muted-foreground">
              <span className="w-2.5 h-2.5 rounded-full bg-border" />
              <span className="w-2.5 h-2.5 rounded-full bg-border" />
              <span className="w-2.5 h-2.5 rounded-full bg-border" />
              <span className="text-[9px] font-mono ml-2 tracking-wider text-muted-foreground uppercase">HTTPS://APP.VALUEINTEL.AI/PORTFOLIO</span>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 pt-4 text-left">
              <div className="md:col-span-3 p-5 rounded-xl border border-border bg-background/90 space-y-4 shadow-2xs motion-hover-lift">
                <div className="flex items-center justify-between border-b border-border/40 pb-2 mb-2">
                  <div className="flex items-center gap-4 text-[10px] font-mono">
                    <div>
                      <span className="text-muted-foreground">REALIZED SAVINGS: </span>
                      <span className="font-bold text-emerald-500 motion-number-reveal">$4.94M</span>
                    </div>
                    <div>
                      <span className="text-muted-foreground">PORTFOLIO ROI: </span>
                      <span className="font-bold text-blue-500 motion-number-reveal">+185.4%</span>
                    </div>
                  </div>
                  <span className="text-[10px] text-muted-foreground font-mono">Q3 Enterprise Forecast</span>
                </div>
                <div className="space-y-2">
                  {[
                    { name: "Customer Support Automation Bot", roi: "+215%", stage: "APPROVED", color: "text-blue-600 dark:text-blue-400" },
                    { name: "GPU Infrastructure Scheduler", roi: "+148%", stage: "EXECUTIVE_REVIEW", color: "text-indigo-600 dark:text-indigo-400" },
                    { name: "Automated Financial Reconciliation", roi: "+95%", stage: "DEPLOYED", color: "text-emerald-600 dark:text-emerald-400" }
                  ].map((item, idx) => (
                    <div key={idx} className="p-3 rounded-lg border border-border/60 bg-secondary/20 flex flex-col gap-2 text-xs hover:border-blue-500/30 transition-colors">
                      <div className="flex items-center justify-between">
                        <div className="space-y-0.5">
                          <span className="font-semibold text-foreground block">{item.name}</span>
                          <div className="flex items-center gap-1.5">
                            <span className="text-[9px] text-muted-foreground font-mono">Stage: {item.stage}</span>
                            <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${
                              item.stage === "DEPLOYED" || item.stage === "APPROVED"
                                ? "bg-emerald-500/80 shadow-[0_0_6px_rgba(16,185,129,0.5)]"
                                : "bg-amber-500/80 shadow-[0_0_6px_rgba(245,158,11,0.5)]"
                            } animate-pulse`} />
                          </div>
                        </div>
                        <span className={`font-bold font-mono ${item.color}`}>{item.roi} ROI</span>
                      </div>
                      {/* Mini trend progress bar acting as drawn chart visual */}
                      <div className="h-1 bg-secondary rounded-full overflow-hidden w-32 border border-border/40">
                        <div className="h-full bg-gradient-to-r from-blue-600 to-indigo-600 rounded-full motion-draw" style={{ width: item.roi === "+215%" ? "85%" : item.roi === "+148%" ? "68%" : "42%" }} />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              <div className="p-5 rounded-xl border border-border bg-background/90 space-y-4 flex flex-col justify-between shadow-2xs motion-hover-lift-cyan">
                <div className="space-y-2 text-xs">
                  <span className="text-[10px] font-mono text-cyan-500 dark:text-cyan-400 tracking-wider uppercase block">AI Insights</span>
                  <p className="text-muted-foreground leading-relaxed text-[11px]">
                    "Automating Customer Support presents a 9.2 month payback period with a 94% confidence indicator."
                  </p>
                </div>
                <div className="pt-3 border-t border-border flex flex-col gap-2">
                  <div className="flex items-center gap-2">
                    <div className="w-5 h-5 rounded bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center animate-pulse-slow">
                      <Sparkles className="w-3 h-3 text-cyan-600 dark:text-cyan-400" />
                    </div>
                    <span className="text-[9px] font-bold text-foreground">94% Confidence</span>
                  </div>
                  {/* Subtle animated fill/reveal indicator */}
                  <div className="h-1 bg-secondary rounded-full overflow-hidden w-full border border-border/40">
                    <div className="h-full bg-cyan-500 rounded-full motion-draw" style={{ width: "94%" }} />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Business Problems Section */}
      <section id="problems" className="py-24 border-t border-border/80 bg-secondary/35 dark:bg-secondary/20 relative z-10 transition-colors duration-300 overflow-hidden">
        {/* Subtle Ambient Backlight */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[350px] bg-blue-600/5 rounded-full blur-[140px] pointer-events-none" />

        <div className="max-w-7xl mx-auto px-6 space-y-12 relative z-10">
          <div className="text-center space-y-3">
            <span className="text-[10px] font-mono uppercase tracking-wider text-blue-500 dark:text-blue-400 font-bold">The Problem</span>
            <h2 className="text-2xl sm:text-4xl font-extrabold tracking-tight text-foreground">
              Why Enterprise AI Projects Fail
            </h2>
            <p className="text-xs sm:text-sm text-muted-foreground max-w-lg mx-auto">
              Lack of clear ROI baselines, fragmented data silos, unmonitored model spending, and governance gate bottlenecks.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-xs">
            {[
              {
                title: "Uncontrolled Cloud & LLM Costs",
                desc: "API bills multiply without business unit attribution.",
                fix: "Real-time token and seat attribution metrics."
              },
              {
                title: "Manual Legacy Reporting",
                desc: "Executives wait weeks for static slide decks.",
                fix: "AI-assisted C-suite reporting dashboards."
              },
              {
                title: "Shadow AI & Key Sprawl",
                desc: "API credentials leaked across public repos.",
                fix: "Secured enterprise secrets and RBAC scopes."
              }
            ].map((p, idx) => (
              <div key={idx} className="p-5 rounded-xl border border-border/85 bg-card space-y-3 flex flex-col justify-between hover:shadow-lg hover:-translate-y-0.5 hover:border-blue-500/40 dark:hover:border-blue-500/40 transition-all duration-200">
                <div className="space-y-1">
                  <h3 className="font-bold text-foreground text-sm">{p.title}</h3>
                  <p className="text-muted-foreground text-[11px] leading-relaxed">{p.desc}</p>
                </div>
                <div className="pt-3 border-t border-border/65 text-blue-500 dark:text-blue-400 font-semibold flex items-center gap-1.5">
                  <Zap className="w-3.5 h-3.5 shrink-0" /> {p.fix}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Platform Overview Workflow */}
      <section id="overview" className="py-24 border-t border-border/80 bg-background relative z-10 overflow-hidden">
        {/* Subtle Grid Texture & Ambient Glow */}
        <div className="absolute inset-0 bg-grid-subtle opacity-[0.035] pointer-events-none" />
        <div className="absolute top-12 left-1/2 -translate-x-1/2 w-[550px] h-[250px] bg-blue-600/5 rounded-full blur-[130px] pointer-events-none" />

        <div className="max-w-7xl mx-auto px-6 space-y-12 relative z-10">
          <div className="text-center space-y-3">
            <span className="text-[10px] font-mono uppercase tracking-wider text-blue-500 dark:text-blue-400 font-bold">The Pipeline</span>
            <h2 className="text-2xl sm:text-4xl font-extrabold tracking-tight text-foreground">
              The Unified Lifecycle Pipeline
            </h2>
            <p className="text-xs sm:text-sm text-muted-foreground max-w-lg mx-auto">
              Follow the journey of a single strategic initiative from concept selection to real-world value realization.
            </p>
          </div>

          <div className="relative pt-4">
            {/* Desktop Connecting Flow Line with traveling light pulse */}
            <div className="hidden lg:block absolute top-[36px] left-[8%] right-[8%] h-[2px] bg-border/60 overflow-hidden z-0">
              <div className="w-full h-full bg-gradient-to-r from-transparent via-blue-500 to-transparent animate-beam-slide opacity-80" />
            </div>

            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 relative z-10 text-xs">
              {[
                { step: "1. Idea Setup", icon: Sparkles, desc: "Submit details via Wizard" },
                { step: "2. AI Analysis", icon: Cpu, desc: "Explainable scenario ROI" },
                { step: "3. Financials", icon: FileSpreadsheet, desc: "Cash flows & NPV" },
                { step: "4. Governance", icon: CheckCircle2, desc: "8-Gate timeline review" },
                { step: "5. Command", icon: Layers, desc: "Multi-project tracking" },
                { step: "6. Reporting", icon: Activity, desc: "C-Suite PDF export" }
              ].map((p, idx) => {
                const Icon = p.icon;
                return (
                  <div key={idx} className="p-4 rounded-xl border border-border/80 bg-card shadow-2xs text-center space-y-2 relative transition-all hover:shadow-lg hover:-translate-y-0.5 hover:border-blue-500/40 duration-200">
                    <div className="w-10 h-10 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center mx-auto text-blue-500 dark:text-blue-400 shadow-2xs">
                      <Icon className="w-4 h-4" />
                    </div>
                    <div>
                      <span className="font-bold text-foreground block text-xs">{p.step}</span>
                      <span className="text-[10px] text-muted-foreground leading-normal">{p.desc}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </section>

      {/* Guided Scroll Tour */}
      <section id="tour" className="py-24 border-t border-border/80 bg-secondary/30 dark:bg-secondary/25 relative z-10 transition-colors duration-300 overflow-hidden">
        {/* Ambient Halo behind Showcase */}
        <div className="absolute top-1/2 right-12 -translate-y-1/2 w-[550px] h-[450px] bg-gradient-to-tr from-blue-600/10 via-cyan-500/6 to-transparent rounded-full blur-[140px] pointer-events-none" />

        <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 lg:grid-cols-2 gap-12 items-center relative z-10">
          <div className="space-y-6">
            <div className="space-y-3">
              <span className="text-[10px] font-mono uppercase tracking-wider text-blue-500 dark:text-blue-400 font-bold">Interactive Demo</span>
              <h2 className="text-3xl font-extrabold tracking-tight text-foreground">
                Explore the Platform in Action
              </h2>
              <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
                Click through the tabs below to preview how our C-suite decision components orchestrate data dynamically.
              </p>
            </div>

            <div className="space-y-3 text-xs">
              {tourSteps.map((step, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => setActiveTourStep(idx)}
                  className={`w-full p-4 rounded-xl border text-left transition-all flex flex-col gap-1 cursor-pointer ${
                    activeTourStep === idx
                      ? "border-l-4 border-l-blue-500 bg-blue-500/10 border-blue-500/30 text-foreground shadow-sm font-semibold"
                      : "bg-card border-border/80 text-muted-foreground hover:bg-secondary/40 hover:-translate-y-0.5"
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-foreground">{step.title}</span>
                    <span className={`text-[9px] font-mono uppercase px-2 py-0.5 rounded-full ${
                      activeTourStep === idx ? "bg-blue-500/20 text-blue-600 dark:text-blue-300 font-bold" : "bg-secondary text-muted-foreground"
                    }`}>
                      {step.badge}
                    </span>
                  </div>
                  <p className="text-[11px] leading-relaxed text-muted-foreground">{step.description}</p>
                </button>
              ))}
            </div>
          </div>

          <div className="relative p-6 rounded-2xl border border-border/80 dark:border-blue-500/20 bg-card shadow-2xl shadow-blue-950/30 flex items-center justify-center min-h-[300px] transition-colors duration-300">
            <div className="w-full transition-all duration-300 transform scale-100">
              {tourSteps[activeTourStep].mockup}
            </div>
          </div>
        </div>
      </section>

      {/* Dual Workspace Sections */}
      <section id="features" className="py-24 border-t border-border/80 bg-background relative z-10 transition-colors duration-300 overflow-hidden">
        {/* Subtle Ambient Workspace Halos */}
        <div className="absolute top-1/4 left-[-8%] w-[500px] h-[400px] bg-blue-600/5 rounded-full blur-[150px] pointer-events-none" />
        <div className="absolute bottom-1/4 right-[-8%] w-[500px] h-[400px] bg-indigo-600/6 rounded-full blur-[150px] pointer-events-none" />

        <div className="max-w-7xl mx-auto px-6 space-y-20 relative z-10">
          {/* Workspace 1: Business Workspace */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div className="space-y-6">
              <div className="space-y-3">
                <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-blue-600/10 dark:bg-blue-500/10 border border-blue-500/20 text-[10px] text-blue-600 dark:text-blue-400 font-bold uppercase tracking-wider">
                  Business Workspace
                </div>
                <h2 className="text-3xl font-extrabold tracking-tight text-foreground">
                  Enterprise AI Initiative Governance Platform
                </h2>
                <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
                  Provide executives with a centralized command center to approve investments, audit timelines, manage CAPEX/OPEX budgets, and trace realized savings against targets.
                </p>
              </div>

              <div className="grid grid-cols-2 gap-4 text-xs">
                {[
                  "Executive Dashboard",
                  "AI Value Studio",
                  "Financial Intelligence",
                  "Portfolio Management",
                  "Governance Timeline",
                  "Multi-provider AI"
                ].map((item, idx) => (
                  <div key={idx} className="flex items-center gap-2 text-foreground">
                    <CheckCircle2 className="w-4 h-4 text-blue-500 dark:text-blue-400 shrink-0" />
                    <span>{item}</span>
                  </div>
                ))}
              </div>

              <div className="pt-2">
                {isSignedIn ? (
                  <Button
                    variant="primary"
                    onClick={handleBusinessWorkspaceClick}
                    disabled={loadingBusiness}
                    className="px-4 py-2 text-xs font-bold shadow-sm active:scale-[0.98] transition-all"
                  >
                    {loadingBusiness ? "Loading..." : "Launch Business Workspace"} <ArrowRight className="w-3.5 h-3.5" />
                  </Button>
                ) : (
                  <Link href="/sign-up">
                    <Button variant="primary" className="px-4 py-2 text-xs font-bold shadow-sm active:scale-[0.98] transition-all">
                      Launch Business Workspace <ArrowRight className="w-3.5 h-3.5" />
                    </Button>
                  </Link>
                )}
              </div>
            </div>

            <div className="rounded-2xl border border-border bg-card p-5 space-y-4 shadow-sm transition-colors duration-300">
              <span className="text-[10px] font-mono text-blue-600 dark:text-blue-400 uppercase tracking-wider block">Target Stakeholders</span>
              <div className="grid grid-cols-2 gap-3 text-xs">
                {[
                  { title: "CIO / CTO", desc: "Oversee technical execution" },
                  { title: "CFO / Finance", desc: "Validate ROI realization" },
                  { title: "PMO Manager", desc: "Manage milestone schedules" },
                  { title: "AI Engineers", desc: "Monitor prompt outputs" }
                ].map((st, idx) => (
                  <div key={idx} className="p-3 rounded-lg border border-border/60 bg-secondary/35 hover:border-blue-500/30 transition-colors">
                    <span className="font-bold text-foreground block">{st.title}</span>
                    <span className="text-[10px] text-muted-foreground">{st.desc}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Workspace 2: Personal Workspace */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center pt-12 border-t border-border/80">
            <div className="rounded-2xl border border-border bg-card p-5 space-y-4 lg:order-last shadow-sm transition-colors duration-300">
              <span className="text-[10px] font-mono text-indigo-600 dark:text-indigo-400 uppercase tracking-wider block">Key Capabilities</span>
              <div className="space-y-2 text-xs">
                {[
                  { label: "Personal AI Productivity Sandbox", desc: "Test custom system prompts and test API keys dynamically." },
                  { label: "Individual Task Planning", desc: "Structure personal projects with milestones." },
                  { label: "Developer Connectivity Logs", desc: "Validate backend health and context routes directly." }
                ].map((cap, idx) => (
                  <div key={idx} className="p-3 rounded-lg border border-border/60 bg-secondary/35 space-y-1 hover:border-indigo-500/30 transition-colors">
                    <span className="font-bold text-foreground block">{cap.label}</span>
                    <p className="text-[11px] text-muted-foreground">{cap.desc}</p>
                  </div>
                ))}
              </div>
            </div>

            <div className="space-y-6">
              <div className="space-y-3">
                <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-indigo-600/10 dark:bg-indigo-500/10 border border-indigo-500/20 text-[10px] text-indigo-600 dark:text-indigo-400 font-bold uppercase tracking-wider">
                  Personal Workspace
                </div>
                <h2 className="text-3xl font-extrabold tracking-tight text-foreground">
                  Individual AI Productivity Workspace
                </h2>
                <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
                  A personalized sandbox built for individual founders, developers, students, and freelancers to structure everyday productivity tasks, verify API endpoints, and leverage sandbox resources.
                </p>
              </div>

              <div className="grid grid-cols-2 gap-4 text-xs">
                {[
                  "Productivity Tracking",
                  "Developer API Logs",
                  "Clerk Auth Diagnostics",
                  "Personal Task Lists",
                  "Custom System Prompts",
                  "API Status Checks"
                ].map((item, idx) => (
                  <div key={idx} className="flex items-center gap-2 text-foreground">
                    <CheckCircle2 className="w-4 h-4 text-indigo-600 dark:text-indigo-400 shrink-0" />
                    <span>{item}</span>
                  </div>
                ))}
              </div>

              <div className="pt-2">
                <Link href={isSignedIn ? "/personal" : "/sign-up?redirect_url=/personal"}>
                  <Button variant="primary" className="px-4 py-2 text-xs font-bold shadow-sm active:scale-[0.98] transition-all">
                    Launch Personal Workspace <ArrowRight className="w-3.5 h-3.5" />
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Security & Enterprise Trust */}
      <section className="py-24 border-t border-border/80 bg-secondary/25 dark:bg-secondary/15 relative z-10 transition-colors duration-300 overflow-hidden">
        {/* Subtle Grid Texture */}
        <div className="absolute inset-0 bg-grid-subtle opacity-[0.035] pointer-events-none" />
        <div className="absolute top-1/2 right-1/4 -translate-y-1/2 w-[450px] h-[350px] bg-blue-600/5 rounded-full blur-[130px] pointer-events-none" />

        <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 lg:grid-cols-2 gap-12 items-center relative z-10">
          <div className="space-y-6">
            <div className="space-y-3">
              <span className="text-[10px] font-mono uppercase tracking-wider text-blue-500 dark:text-blue-400 font-bold">Compliance & Security</span>
              <h2 className="text-3xl font-extrabold tracking-tight text-foreground">
                Enterprise Trust & Security Architecture
              </h2>
              <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
                Security is built directly into our code. We implement state-of-the-art encryption, access policies, and data isolation boundaries to keep your proprietary business strategies safe.
              </p>
            </div>

            <div className="space-y-3 text-xs">
              {[
                { title: "Row Level Security (RLS)", desc: "Database rows are automatically filtered by organization context." },
                { title: "Role-Based Access Control (RBAC)", desc: "10 default roles mapping across 12 permission scopes." },
                { title: "Encrypted Secrets Vault", desc: "LLM API keys and webhook tokens are encrypted at rest." }
              ].map((sc, idx) => (
                <div key={idx} className="p-3.5 rounded-xl border border-border/80 bg-card flex gap-3 shadow-2xs hover:border-blue-500/30 hover:-translate-y-0.5 transition-all duration-200">
                  <Lock className="w-4 h-4 text-blue-500 dark:text-blue-400 shrink-0 mt-0.5" />
                  <div className="space-y-0.5">
                    <span className="font-bold text-foreground block">{sc.title}</span>
                    <p className="text-[11px] text-muted-foreground leading-relaxed">{sc.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="p-6 rounded-2xl border border-border/80 bg-card shadow-xl space-y-4 transition-colors duration-300">
            <div className="flex items-center gap-2 pb-3 border-b border-border/70 text-xs font-mono text-muted-foreground">
              <Terminal className="w-4 h-4 text-accent" />
              <span>System Security Telemetry</span>
            </div>
            <div className="space-y-2 font-mono text-[10px] text-muted-foreground">
              <div className="flex justify-between">
                <span>Database Connection</span>
                <span className="text-emerald-600 dark:text-emerald-500 font-bold">SSL Secure</span>
              </div>
              <div className="flex justify-between">
                <span>Row Level Security Status</span>
                <span className="text-emerald-600 dark:text-emerald-500 font-bold">ENFORCED</span>
              </div>
              <div className="flex justify-between">
                <span>Audit Logs Stream</span>
                <span className="text-emerald-600 dark:text-emerald-500 font-bold">ACTIVE</span>
              </div>
              <div className="flex justify-between">
                <span>SSO / Clerk Authentication</span>
                <span className="text-emerald-600 dark:text-emerald-500 font-bold">OPERATIONAL</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section id="pricing" className="py-24 border-t border-border/80 bg-secondary/35 dark:bg-secondary/20 relative z-10 transition-colors duration-300 overflow-hidden">
        {/* Centered Soft Blue Backlight */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[550px] h-[350px] bg-blue-600/6 rounded-full blur-[140px] pointer-events-none" />

        <div className="max-w-7xl mx-auto px-6 space-y-12 relative z-10">
          <div className="text-center space-y-4">
            <span className="text-[10px] font-mono uppercase tracking-wider text-blue-500 dark:text-blue-400 font-bold">Simple Pricing</span>
            <h2 className="text-2xl sm:text-4xl font-extrabold tracking-tight text-foreground">
              Transparent, Enterprise Pricing Plans
            </h2>
            <p className="text-xs sm:text-sm text-muted-foreground max-w-md mx-auto">
              Select the plan configured for your team. Switch plans or billing frequencies at any time.
            </p>

            <div className="inline-flex items-center gap-1.5 p-1 rounded-lg bg-card border border-border shadow-2xs">
              <button
                type="button"
                onClick={() => setIsYearlyPricing(false)}
                className={`px-3 py-1 rounded text-[10px] font-semibold transition-colors cursor-pointer active:scale-[0.98] ${
                  !isYearlyPricing ? "bg-blue-600 text-white" : "text-muted-foreground hover:text-foreground"
                }`}
              >
                Monthly
              </button>
              <button
                type="button"
                onClick={() => setIsYearlyPricing(true)}
                className={`px-3 py-1 rounded text-[10px] font-semibold transition-colors cursor-pointer active:scale-[0.98] ${
                  isYearlyPricing ? "bg-blue-600 text-white" : "text-muted-foreground hover:text-foreground"
                }`}
              >
                Yearly (Save 20%)
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto items-stretch">
            {[
              {
                name: "Free Trial",
                price: "0",
                desc: "Explore AI value studio and personal sandboxes.",
                features: ["1 Personal Workspace", "1 Business Organization", "Basic AI Studio Analysis", "Event Bus notifications", "CSV exports"]
              },
              {
                name: "Professional",
                price: isYearlyPricing ? "159" : "199",
                desc: "Ideal for growing teams tracking multiple projects.",
                features: ["Unlimited Personal Workspaces", "3 Business Organizations", "Advanced explainable recommendations", "8-stage state machine integration", "SLA bottleneck analytics", "Priority Support"],
                popular: true
              },
              {
                name: "Enterprise",
                price: isYearlyPricing ? "799" : "999",
                desc: "Fully compliant control for absolute security.",
                features: ["Unlimited Organizations & Seats", "Custom RBAC permission matrix", "Dedicated database instance (Supabase)", "Custom LLM provider registry integration", "Sync logs CSV & Power BI streams", "Dedicated Success Manager"]
              }
            ].map((plan, idx) => (
              <div
                key={idx}
                className={`p-6 rounded-2xl border bg-card relative flex flex-col justify-between transition-all duration-200 hover:shadow-xl hover:-translate-y-1 ${
                  plan.popular
                    ? "border-blue-500 shadow-xl shadow-blue-500/10 dark:shadow-blue-500/5 ring-2 ring-blue-500/15"
                    : "border-border/80 hover:border-blue-500/40"
                }`}
              >
                {plan.popular && (
                  <span className="absolute top-0 right-6 -translate-y-1/2 px-2.5 py-0.5 rounded-full bg-blue-600 text-white text-[9px] font-bold uppercase tracking-wider">
                    Popular
                  </span>
                )}
                <div className="space-y-6">
                  <div className="space-y-2 text-xs">
                    <h3 className="font-bold text-foreground text-base">{plan.name}</h3>
                    <p className="text-muted-foreground">{plan.desc}</p>
                  </div>

                  <div className="flex items-baseline gap-1">
                    <span className="text-3xl font-extrabold text-foreground font-mono">${plan.price}</span>
                    <span className="text-[10px] text-muted-foreground">/month</span>
                  </div>

                  <div className="pt-4 border-t border-border/60 space-y-2">
                    {plan.features.map((ft, i) => (
                      <div key={i} className="flex items-start gap-2 text-[11px] text-foreground">
                        <Check className="w-3.5 h-3.5 text-blue-500 dark:text-blue-400 shrink-0 mt-0.5" />
                        <span>{ft}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="mt-8">
                  <Link href={isSignedIn ? "/workspace-select" : "/sign-up"}>
                    <Button variant={plan.popular ? "primary" : "secondary"} className="w-full text-xs font-bold py-2.5 cursor-pointer active:scale-[0.98] transition-all">
                      {isSignedIn ? "Launch Console" : "Get Started"}
                    </Button>
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section id="faq" className="py-24 border-t border-border/80 bg-background relative z-10 transition-colors duration-300">
        <div className="max-w-3xl mx-auto px-6 space-y-12">
          <div className="text-center space-y-3">
            <span className="text-[10px] font-mono uppercase tracking-wider text-blue-500 dark:text-blue-400 font-bold">Got Questions?</span>
            <h2 className="text-2xl sm:text-4xl font-extrabold tracking-tight text-foreground">
              Frequently Asked Questions
            </h2>
          </div>

          <div className="space-y-4 text-xs">
            {faqs.map((faq, idx) => (
              <div key={idx} className="rounded-xl border border-border/80 bg-card shadow-2xs hover:border-blue-500/30 transition-colors overflow-hidden">
                <button
                  type="button"
                  onClick={() => setOpenFaqIndex(openFaqIndex === idx ? null : idx)}
                  className="w-full p-4 text-left font-bold text-foreground hover:bg-secondary/40 transition-colors flex items-center justify-between cursor-pointer"
                >
                  <span>{faq.q}</span>
                  <ChevronDown className={`w-4 h-4 text-muted-foreground transition-transform duration-200 ${openFaqIndex === idx ? "rotate-180" : ""}`} />
                </button>
                {openFaqIndex === idx && (
                  <div className="p-4 border-t border-border/70 bg-secondary/20 text-muted-foreground leading-relaxed text-[11px] animate-in fade-in duration-150">
                    {faq.a}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Final CTA Section */}
      <section className="py-32 border-t border-border/80 bg-background relative overflow-hidden z-10 transition-colors duration-300">
        <div className="absolute inset-0 bg-gradient-to-tr from-blue-600/12 via-indigo-600/10 to-cyan-500/6 blur-[150px] pointer-events-none animate-aurora-slow" />
        <div className="max-w-5xl mx-auto px-6 text-center space-y-8 relative z-10">
          {isSignedIn ? (
            <>
              <h2 className="text-3xl sm:text-5xl font-extrabold tracking-tight text-transparent bg-clip-text bg-gradient-to-b from-foreground to-muted-foreground dark:from-zinc-50 dark:to-zinc-400 animate-in fade-in slide-in-from-bottom-2 duration-300">
                Continue Your Work
              </h2>
              <p className="text-xs sm:text-sm text-muted-foreground max-w-md mx-auto leading-relaxed">
                You're already signed in. Choose the workspace you'd like to continue with.
              </p>
              <div className="flex items-center justify-center gap-3.5 pt-4">
                <Button
                  variant="primary"
                  onClick={handleBusinessWorkspaceClick}
                  disabled={loadingBusiness}
                  className="px-6 py-2.5 text-xs font-bold shadow-lg shadow-blue-500/20 active:scale-[0.98] transition-all"
                >
                  {loadingBusiness ? "Loading..." : "Business Workspace"} <ArrowRight className="w-3.5 h-3.5" />
                </Button>
                <Button
                  variant="secondary"
                  onClick={handlePersonalWorkspaceClick}
                  className="px-6 py-2.5 text-xs font-bold active:scale-[0.98] transition-all"
                >
                  Personal Workspace <ArrowRight className="w-3.5 h-3.5" />
                </Button>
              </div>
            </>
          ) : (
            <>
              <h2 className="text-3xl sm:text-5xl font-extrabold tracking-tight text-transparent bg-clip-text bg-gradient-to-b from-foreground to-muted-foreground dark:from-zinc-50 dark:to-zinc-400">
                Transform Your AI Initiative Portfolios Today
              </h2>
              <p className="text-xs sm:text-sm text-muted-foreground max-w-md mx-auto leading-relaxed">
                Gain immediate clarity on ROI projections, track realized savings ledgers, and establish governance approval workflows.
              </p>
              <div className="flex items-center justify-center gap-3.5">
                <Link href="/sign-up">
                  <Button variant="primary" className="px-6 py-2.5 text-xs font-bold shadow-lg shadow-blue-500/20 active:scale-[0.98] transition-all">
                    Get Started
                  </Button>
                </Link>
                <Link href="/sign-in">
                  <Button variant="secondary" className="px-6 py-2.5 text-xs font-bold active:scale-[0.98] transition-all">
                    Sign In
                  </Button>
                </Link>
              </div>
            </>
          )}
        </div>
      </section>

      {/* Global Footer */}
      <footer className="border-t border-border bg-card text-card-foreground py-12 relative z-10">
        <div className="max-w-7xl mx-auto px-6 grid grid-cols-2 sm:grid-cols-4 gap-8 text-xs text-muted-foreground">
          <div className="space-y-3">
            <div className="flex items-center gap-2.5">
              <div className="w-6 h-6 rounded bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center">
                <span className="font-extrabold text-[10px] text-white">V</span>
              </div>
              <span className="font-bold text-foreground">Value Intelligence</span>
            </div>
            <p className="text-[10px] leading-relaxed">
              Premium C-Suite decision intelligence for enterprise AI alignment.
            </p>
          </div>
          <div className="space-y-2">
            <span className="font-bold text-foreground uppercase tracking-wider text-[10px] block">Product</span>
            <a href="#problems" className="hover:text-foreground transition-colors block text-[11px]">Solutions</a>
            <a href="#tour" className="hover:text-foreground transition-colors block text-[11px]">Guided Tour</a>
            <a href="#pricing" className="hover:text-foreground transition-colors block text-[11px]">Pricing Plans</a>
          </div>
          <div className="space-y-2">
            <span className="font-bold text-foreground uppercase tracking-wider text-[10px] block">Security</span>
            <span className="block text-[11px]">Row Level Security</span>
            <span className="block text-[11px]">RBAC Permissions</span>
            <span className="block text-[11px]">Encrypted Keys</span>
          </div>
          <div className="space-y-2">
            <span className="font-bold text-foreground uppercase tracking-wider text-[10px] block">Company</span>
            <span className="block text-[11px]">About Us</span>
            <span className="block text-[11px]">Privacy Policy</span>
            <span className="block text-[11px]">Terms of Service</span>
          </div>
        </div>
        <div className="max-w-7xl mx-auto px-6 pt-8 mt-8 border-t border-border text-center text-[10px] text-muted-foreground">
          © 2026 AI Initiative Value Intelligence. All rights reserved. Built for production-ready executive scale.
        </div>
      </footer>
    </div>
  );
}
