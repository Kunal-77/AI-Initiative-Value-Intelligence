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
  const { isSignedIn } = useAuth();
  const router = useRouter();
  const { openUserProfile, signOut } = useClerk();
  const { isLoaded: orgListLoaded, setActive, userMemberships } = useOrganizationList({
    userMemberships: {
      keepPreviousData: true,
    },
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

  const handleBusinessWorkspaceClick = async () => {
    setLoadingBusiness(true);
    try {
      const orgs = userMemberships.data || [];
      if (orgs.length === 1 && setActive) {
        const orgId = orgs[0].organization.id;
        await setActive({ organization: orgId });
        router.push("/business/initiatives");
      } else {
        router.push("/workspace-select");
      }
    } catch (err) {
      console.error("Error setting active organization:", err);
      router.push("/workspace-select");
    } finally {
      setLoadingBusiness(false);
    }
  };

  // guided tour mockup content
  const tourSteps = [
    {
      title: "Executive Command Center",
      description: "Get immediate clarity on total portfolio ROI, net realized savings, and program risks across all active lines.",
      badge: "Analytics",
      mockup: (
        <div className="p-5 rounded-xl border border-zinc-800 bg-zinc-900/90 text-zinc-100 space-y-4 shadow-2xl font-sans text-xs">
          <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
            <span className="font-bold text-zinc-200">Portfolio Health Ledger</span>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-purple-500/10 text-purple-400 font-semibold border border-purple-500/20">Live Sync</span>
          </div>
          <div className="grid grid-cols-3 gap-3">
            <div className="p-3 rounded-lg bg-zinc-950 border border-zinc-800 text-center space-y-1">
              <span className="text-[9px] uppercase tracking-wider text-zinc-500 font-bold block">Portfolio ROI</span>
              <span className="text-base font-extrabold text-purple-400 font-mono">+215.4%</span>
            </div>
            <div className="p-3 rounded-lg bg-zinc-950 border border-zinc-800 text-center space-y-1">
              <span className="text-[9px] uppercase tracking-wider text-zinc-500 font-bold block">Realized Savings</span>
              <span className="text-base font-extrabold text-emerald-400 font-mono">$4.94M</span>
            </div>
            <div className="p-3 rounded-lg bg-zinc-950 border border-zinc-800 text-center space-y-1">
              <span className="text-[9px] uppercase tracking-wider text-zinc-500 font-bold block">Active Pilots</span>
              <span className="text-base font-extrabold text-zinc-200 font-mono">14</span>
            </div>
          </div>
          <div className="h-2 bg-zinc-950 rounded-full overflow-hidden border border-zinc-850">
            <div className="h-full bg-gradient-to-r from-purple-500 to-indigo-500 rounded-full w-[78%] transition-all duration-500" />
          </div>
          <div className="flex justify-between text-[9px] text-zinc-500 font-mono">
            <span>Budget Utilization: 78%</span>
            <span>$1,020,000 remaining</span>
          </div>
        </div>
      ),
    },
    {
      title: "AI Studio Recommendations",
      description: "Generate deep explainable summaries, model NPV forecast curves, and run multi-scenario comparisons.",
      badge: "AI Modeling",
      mockup: (
        <div className="p-5 rounded-xl border border-zinc-800 bg-zinc-900/90 text-zinc-100 space-y-4 shadow-2xl font-sans text-xs">
          <div className="flex items-center gap-2 border-b border-zinc-800 pb-3">
            <Sparkles className="w-4 h-4 text-purple-400" />
            <span className="font-bold text-zinc-200">AI Studio Forecaster v1.0.0</span>
          </div>
          <div className="p-3 rounded-lg bg-purple-950/20 border border-purple-500/20 space-y-2">
            <div className="flex justify-between text-[10px]">
              <span className="font-semibold text-purple-300">GPU Cluster Optimization Project</span>
              <span className="font-mono text-purple-400 font-bold">94% Confidence</span>
            </div>
            <p className="text-[10px] text-zinc-400 leading-relaxed">
              Recommendation: Proceed with immediate pilot scale. Potential payback period is 9.2 months with expected Net Present Value (NPV) of $1,240,000.
            </p>
          </div>
          <div className="flex gap-2">
            <button type="button" className="px-2.5 py-1 rounded bg-purple-600 text-white font-semibold text-[9px]">Accept Scenario</button>
            <button type="button" className="px-2.5 py-1 rounded bg-zinc-950 border border-zinc-850 text-zinc-400 text-[9px]">Run Alternative</button>
          </div>
        </div>
      ),
    },
    {
      title: "Governance State Machine",
      description: "Track initiative lifecycle gates through an 8-stage state machine with complete audit trails and SLA checks.",
      badge: "Compliance",
      mockup: (
        <div className="p-5 rounded-xl border border-zinc-800 bg-zinc-900/90 text-zinc-100 space-y-4 shadow-2xl font-sans text-xs">
          <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
            <span className="font-bold text-zinc-200">Active Governance State</span>
            <span className="text-[10px] font-mono text-amber-400 font-semibold px-2 py-0.5 rounded bg-amber-500/10 border border-amber-500/15">SLA Active: 1.4d</span>
          </div>
          <div className="flex items-center gap-1.5 overflow-x-auto py-1">
            {["Draft", "Review", "Approved", "Deploying"].map((step, idx) => (
              <div key={idx} className="flex items-center gap-1 shrink-0">
                <span className={`px-2 py-0.5 rounded text-[9px] font-semibold ${
                  idx <= 2
                    ? "bg-purple-500/15 text-purple-400 border border-purple-500/20"
                    : "bg-zinc-950 text-zinc-500 border border-zinc-850"
                }`}>
                  {step}
                </span>
                {idx < 3 && <span className="text-zinc-650">→</span>}
              </div>
            ))}
          </div>
          <div className="p-3 bg-zinc-950 rounded-lg border border-zinc-850 font-mono text-[9px] text-zinc-400 space-y-1">
            <div>[2026-08-04 14:20] User Marc.V transition review -&gt; APPROVED</div>
            <div>[2026-08-04 14:20] Email notification dispatched to Owner.</div>
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
    <div className="min-h-screen bg-background text-foreground font-sans selection:bg-purple-600/30 overflow-hidden relative transition-colors duration-300">
      {/* Glow Effects */}
      <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-purple-900/10 rounded-full blur-[150px] pointer-events-none" />
      <div className="absolute top-[40%] right-[-10%] w-[50%] h-[50%] bg-indigo-900/10 rounded-full blur-[150px] pointer-events-none" />

      {/* Header / Navigation */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-background/70 backdrop-blur-md border-b border-border/40">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <button
            type="button"
            onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
            className="flex items-center gap-2.5 group cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 rounded-lg"
            aria-label="Scroll back to top"
          >
            <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-purple-600 to-indigo-600 flex items-center justify-center shadow-lg shadow-purple-500/20 group-hover:scale-105 transition-transform duration-300">
              <span className="font-extrabold text-sm text-white">V</span>
            </div>
            <span className="font-bold tracking-tight text-sm text-foreground group-hover:text-purple-600 dark:group-hover:text-purple-400 transition-colors">
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
                  className="px-4 py-1.5 text-xs font-semibold flex items-center gap-1"
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
                      <Briefcase className="w-3.5 h-3.5 text-purple-500" />
                      <span>Business Workspace</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setIsConsoleOpen(false);
                        router.push("/personal");
                      }}
                      className="w-full flex items-center gap-2 px-3 py-2 rounded-md text-left text-xs font-semibold text-foreground hover:bg-secondary transition-colors cursor-pointer"
                    >
                      <User className="w-3.5 h-3.5 text-indigo-400" />
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
                      <span>Workspace Selector</span>
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
                      <span>Account Settings</span>
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
                  <span className="text-xs text-zinc-400 hover:text-zinc-200 transition-colors font-medium mr-2 cursor-pointer font-bold">
                    Sign In
                  </span>
                </Link>
                <Link href="/sign-up">
                  <Button variant="primary" className="px-4 py-1.5 text-xs font-semibold">
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
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-purple-600/10 dark:bg-purple-950/40 border border-purple-500/20 dark:border-purple-500/25 text-[10px] font-semibold text-purple-600 dark:text-purple-400 tracking-wide uppercase">
          <Sparkles className="w-3 h-3" /> Enterprise Release Candidate v1.0.0
        </div>

        <div className="space-y-4 max-w-4xl mx-auto">
          <h1 className="text-4xl sm:text-6xl font-extrabold tracking-tight leading-[1.1] text-transparent bg-clip-text bg-gradient-to-b from-foreground to-muted-foreground dark:from-zinc-50 dark:to-zinc-400">
            Transform AI Investments Into Measurable Business Value
          </h1>
          <p className="text-sm sm:text-base text-muted-foreground max-w-2xl mx-auto leading-relaxed">
            The world's first unified public decision intelligence system. Model ROIs, review governance gates, monitor multi-provider models, and manage personal productivity.
          </p>
        </div>

        <div className="flex items-center justify-center gap-3.5">
          {isSignedIn ? (
            <>
              <Button
                variant="primary"
                onClick={handleBusinessWorkspaceClick}
                disabled={loadingBusiness}
                className="px-5 py-2.5 text-xs font-bold shadow-lg shadow-purple-500/20"
              >
                {loadingBusiness ? "Loading..." : "Business Workspace"} <ArrowRight className="w-3.5 h-3.5" />
              </Button>
              <Button
                variant="secondary"
                onClick={() => router.push("/personal")}
                className="px-5 py-2.5 text-xs font-bold"
              >
                Personal Workspace <ArrowRight className="w-3.5 h-3.5" />
              </Button>
            </>
          ) : (
            <>
              <Link href="/sign-up">
                <Button variant="primary" className="px-5 py-2.5 text-xs font-bold shadow-lg shadow-purple-500/20">
                  Start Free
                </Button>
              </Link>
              <a href="#tour">
                <Button variant="secondary" className="px-5 py-2.5 text-xs font-bold">
                  Explore Guided Tour
                </Button>
              </a>
            </>
          )}
        </div>

        {/* Dashboard Preview Frame */}
        <div className="pt-12 max-w-5xl mx-auto relative group">
          <div className="absolute inset-0 bg-gradient-to-t from-purple-500/10 to-indigo-500/10 rounded-2xl blur-xl opacity-30 group-hover:opacity-50 transition-opacity" />
          <div className="rounded-2xl border border-border/80 bg-card p-4 shadow-xl relative overflow-hidden backdrop-blur-xs transition-colors duration-300">
            <div className="flex items-center gap-1.5 pb-3 border-b border-border/60 text-muted-foreground">
              <span className="w-2.5 h-2.5 rounded-full bg-border" />
              <span className="w-2.5 h-2.5 rounded-full bg-border" />
              <span className="w-2.5 h-2.5 rounded-full bg-border" />
              <span className="text-[9px] font-mono ml-2 tracking-wider text-muted-foreground uppercase">HTTPS://APP.VALUEINTEL.AI/PORTFOLIO</span>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 pt-4 text-left">
              <div className="md:col-span-3 p-5 rounded-xl border border-border bg-background/90 space-y-4 shadow-2xs">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-foreground">Active Strategic Initiatives</span>
                  <span className="text-[10px] text-muted-foreground">Q3 Enterprise Forecast</span>
                </div>
                <div className="space-y-2">
                  {[
                    { name: "Customer Support Automation Bot", roi: "+215%", stage: "APPROVED", color: "text-purple-600 dark:text-purple-400" },
                    { name: "GPU Infrastructure Scheduler", roi: "+148%", stage: "EXECUTIVE_REVIEW", color: "text-indigo-600 dark:text-indigo-400" },
                    { name: "Automated Financial Reconciliation", roi: "+95%", stage: "DEPLOYED", color: "text-emerald-600 dark:text-emerald-400" }
                  ].map((item, idx) => (
                    <div key={idx} className="p-3 rounded-lg border border-border/60 bg-secondary/20 flex items-center justify-between text-xs">
                      <div className="space-y-0.5">
                        <span className="font-semibold text-foreground block">{item.name}</span>
                        <span className="text-[9px] text-muted-foreground font-mono">Stage: {item.stage}</span>
                      </div>
                      <span className={`font-bold font-mono ${item.color}`}>{item.roi} ROI</span>
                    </div>
                  ))}
                </div>
              </div>
              <div className="p-5 rounded-xl border border-border bg-background/90 space-y-4 flex flex-col justify-between shadow-2xs">
                <div className="space-y-2 text-xs">
                  <span className="text-[10px] font-mono text-accent dark:text-purple-400 tracking-wider uppercase block">AI Insights</span>
                  <p className="text-muted-foreground leading-relaxed text-[11px]">
                    "Automating Customer Support presents a 9.2 month payback period with a 94% confidence indicator."
                  </p>
                </div>
                <div className="pt-3 border-t border-border flex items-center gap-2">
                  <div className="w-5 h-5 rounded bg-purple-500/10 border border-purple-500/20 flex items-center justify-center">
                    <Sparkles className="w-3 h-3 text-purple-600 dark:text-purple-400" />
                  </div>
                  <span className="text-[9px] font-bold text-foreground">94% Confidence</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Business Problems Section */}
      <section id="problems" className="py-24 border-t border-border bg-secondary/30 dark:bg-zinc-950/50 relative z-10 transition-colors duration-300">
        <div className="max-w-7xl mx-auto px-6 space-y-12">
          <div className="text-center space-y-3">
            <span className="text-[10px] font-mono uppercase tracking-wider text-accent dark:text-purple-400 font-bold">The Problem</span>
            <h2 className="text-2xl sm:text-4xl font-extrabold tracking-tight text-foreground">
              Why Enterprise AI Projects Fail
            </h2>
            <p className="text-xs sm:text-sm text-muted-foreground max-w-lg mx-auto">
              Without unified tracking, organization-wide AI projects lose alignment, blow past budgets, or leak data.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 text-xs">
            {[
              {
                title: "AI Investments with No ROI",
                desc: "Companies spend millions on models without metrics.",
                fix: "Real-time cash flow & break-even forecasts."
              },
              {
                title: "Disconnected Operations",
                desc: "Teams launch shadow pipelines without IT approval.",
                fix: "8-Stage centralized governance gate controls."
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
              <div key={idx} className="p-5 rounded-xl border border-border/85 bg-card space-y-3 flex flex-col justify-between hover:shadow-md hover:border-accent/40 dark:hover:border-purple-500/40 transition-all duration-300">
                <div className="space-y-1">
                  <h3 className="font-bold text-foreground text-sm">{p.title}</h3>
                  <p className="text-muted-foreground text-[11px] leading-relaxed">{p.desc}</p>
                </div>
                <div className="pt-3 border-t border-border/65 text-accent dark:text-purple-400 font-semibold flex items-center gap-1.5">
                  <Zap className="w-3.5 h-3.5 shrink-0" /> {p.fix}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Platform Overview Workflow */}
      <section id="overview" className="py-24 border-t border-border relative z-10">
        <div className="max-w-7xl mx-auto px-6 space-y-12">
          <div className="text-center space-y-3">
            <span className="text-[10px] font-mono uppercase tracking-wider text-accent dark:text-purple-400 font-bold">The Pipeline</span>
            <h2 className="text-2xl sm:text-4xl font-extrabold tracking-tight text-foreground">
              The Unified Lifecycle Pipeline
            </h2>
            <p className="text-xs sm:text-sm text-muted-foreground max-w-lg mx-auto">
              Follow the journey of a single strategic initiative from concept selection to real-world value realization.
            </p>
          </div>

          <div className="flex flex-col md:flex-row items-center justify-between gap-3 overflow-x-auto py-2 text-xs">
            {[
              { step: "Idea Setup", icon: Sparkles, desc: "Submit details via Wizard" },
              { step: "AI Analysis", icon: Cpu, desc: "Explainable scenario ROI" },
              { step: "Financials", icon: FileSpreadsheet, desc: "Cash flows & NPV" },
              { step: "Governance", icon: CheckCircle2, desc: "8-Gate timeline review" },
              { step: "Portfolio Command", icon: Layers, desc: "Multi-project tracking" },
              { step: "Reporting", icon: Activity, desc: "C-Suite PDF export" }
            ].map((p, idx) => {
              const Icon = p.icon;
              return (
                <div key={idx} className="flex-1 min-w-[150px] p-4 rounded-xl border border-border bg-card shadow-xs text-center space-y-2 relative transition-all hover:shadow-md hover:border-accent/30 duration-300">
                  <div className="w-8 h-8 rounded-lg bg-accent/10 border border-accent/20 flex items-center justify-center mx-auto text-accent">
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
      </section>

      {/* Guided Scroll Tour */}
      <section id="tour" className="py-24 border-t border-border bg-secondary/20 dark:bg-zinc-900/10 relative z-10 transition-colors duration-300">
        <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <div className="space-y-6">
            <div className="space-y-3">
              <span className="text-[10px] font-mono uppercase tracking-wider text-accent dark:text-purple-400 font-bold">Interactive Demo</span>
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
                  className={`w-full p-4 rounded-xl border text-left transition-all flex flex-col gap-1 ${
                    activeTourStep === idx
                      ? "bg-purple-600/10 dark:bg-purple-950/15 border-purple-500/30 text-foreground shadow-sm"
                      : "bg-card border-border/80 text-muted-foreground hover:bg-secondary/40"
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-foreground">{step.title}</span>
                    <span className={`text-[9px] font-mono uppercase px-2 py-0.2 rounded-full ${
                      activeTourStep === idx ? "bg-purple-600/10 dark:bg-purple-500/20 text-purple-600 dark:text-purple-300" : "bg-secondary text-muted-foreground"
                    }`}>
                      {step.badge}
                    </span>
                  </div>
                  <p className="text-[11px] leading-relaxed text-muted-foreground">{step.description}</p>
                </button>
              ))}
            </div>
          </div>

          <div className="relative p-6 rounded-2xl border border-border bg-card shadow-xl flex items-center justify-center min-h-[300px] transition-colors duration-300">
            <div className="absolute inset-0 bg-purple-500/5 blur-3xl rounded-full pointer-events-none" />
            <div className="w-full transition-all duration-300 transform scale-100">
              {tourSteps[activeTourStep].mockup}
            </div>
          </div>
        </div>
      </section>

      {/* Dual Workspace Sections */}
      <section id="features" className="py-24 border-t border-border bg-background relative z-10 transition-colors duration-300">
        <div className="max-w-7xl mx-auto px-6 space-y-20">
          {/* Workspace 1: Business Workspace */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div className="space-y-6">
              <div className="space-y-3">
                <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-purple-600/10 dark:bg-purple-500/10 border border-purple-500/20 text-[10px] text-purple-600 dark:text-purple-400 font-bold uppercase tracking-wider">
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
                    <CheckCircle2 className="w-4 h-4 text-accent dark:text-purple-400 shrink-0" />
                    <span>{item}</span>
                  </div>
                ))}
              </div>

              <div className="pt-2">
                <Link href={isSignedIn ? "/workspace-select" : "/sign-up"}>
                  <Button variant="primary" className="px-4 py-2 text-xs font-bold">
                    Launch Business Workspace <ArrowRight className="w-3.5 h-3.5" />
                  </Button>
                </Link>
              </div>
            </div>

            <div className="rounded-2xl border border-border bg-card p-5 space-y-4 shadow-sm transition-colors duration-300">
              <span className="text-[10px] font-mono text-purple-600 dark:text-purple-400 uppercase tracking-wider block">Target Stakeholders</span>
              <div className="grid grid-cols-2 gap-3 text-xs">
                {[
                  { title: "CIO / CTO", desc: "Oversee technical execution" },
                  { title: "CFO / Finance", desc: "Validate ROI realization" },
                  { title: "PMO Manager", desc: "Manage milestone schedules" },
                  { title: "AI Engineers", desc: "Monitor prompt outputs" }
                ].map((st, idx) => (
                  <div key={idx} className="p-3 rounded-lg border border-border/60 bg-secondary/35">
                    <span className="font-bold text-foreground block">{st.title}</span>
                    <span className="text-[10px] text-muted-foreground">{st.desc}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Workspace 2: Personal Workspace */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center pt-12 border-t border-border">
            <div className="rounded-2xl border border-border bg-card p-5 space-y-4 lg:order-last shadow-sm transition-colors duration-300">
              <span className="text-[10px] font-mono text-indigo-600 dark:text-indigo-400 uppercase tracking-wider block">Key Capabilities</span>
              <div className="space-y-2 text-xs">
                {[
                  { label: "Personal AI Productivity Sandbox", desc: "Test custom system prompts and test API keys dynamically." },
                  { label: "Individual Task Planning", desc: "Structure personal projects with milestones." },
                  { label: "Developer Connectivity Logs", desc: "Validate backend health and context routes directly." }
                ].map((cap, idx) => (
                  <div key={idx} className="p-3 rounded-lg border border-border/60 bg-secondary/35 space-y-1">
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
                <Link href={isSignedIn ? "/personal" : "/sign-up"}>
                  <Button variant="primary" className="px-4 py-2 text-xs font-bold">
                    Launch Personal Workspace <ArrowRight className="w-3.5 h-3.5" />
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Security & Enterprise Trust */}
      <section className="py-24 border-t border-border bg-secondary/15 dark:bg-zinc-900/10 relative z-10 transition-colors duration-300">
        <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <div className="space-y-6">
            <div className="space-y-3">
              <span className="text-[10px] font-mono uppercase tracking-wider text-accent dark:text-purple-400 font-bold">Compliance & Security</span>
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
                <div key={idx} className="p-3.5 rounded-xl border border-border bg-card flex gap-3 shadow-2xs">
                  <Lock className="w-4 h-4 text-accent dark:text-purple-400 shrink-0 mt-0.5" />
                  <div className="space-y-0.5">
                    <span className="font-bold text-foreground block">{sc.title}</span>
                    <p className="text-[11px] text-muted-foreground leading-relaxed">{sc.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="p-6 rounded-2xl border border-border bg-card shadow-xl space-y-4 transition-colors duration-300">
            <div className="flex items-center gap-2 pb-3 border-b border-border text-xs font-mono text-muted-foreground">
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
      <section id="pricing" className="py-24 border-t border-border bg-secondary/30 dark:bg-zinc-950/50 relative z-10 transition-colors duration-300">
        <div className="max-w-7xl mx-auto px-6 space-y-12">
          <div className="text-center space-y-4">
            <span className="text-[10px] font-mono uppercase tracking-wider text-accent dark:text-purple-400 font-bold">Simple Pricing</span>
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
                className={`px-3 py-1 rounded text-[10px] font-semibold transition-colors cursor-pointer ${
                  !isYearlyPricing ? "bg-purple-600 text-white" : "text-muted-foreground hover:text-foreground"
                }`}
              >
                Monthly
              </button>
              <button
                type="button"
                onClick={() => setIsYearlyPricing(true)}
                className={`px-3 py-1 rounded text-[10px] font-semibold transition-colors cursor-pointer ${
                  isYearlyPricing ? "bg-purple-600 text-white" : "text-muted-foreground hover:text-foreground"
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
                className={`p-6 rounded-2xl border bg-card relative flex flex-col justify-between transition-all duration-300 hover:shadow-lg ${
                  plan.popular
                    ? "border-purple-500 shadow-xl shadow-purple-500/10 dark:shadow-purple-500/5 ring-2 ring-purple-500/10 dark:ring-purple-500/20 scale-100"
                    : "border-border/80"
                }`}
              >
                {plan.popular && (
                  <span className="absolute top-0 right-6 -translate-y-1/2 px-2.5 py-0.5 rounded-full bg-purple-600 text-white text-[9px] font-bold uppercase tracking-wider">
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
                        <Check className="w-3.5 h-3.5 text-accent dark:text-purple-400 shrink-0 mt-0.5" />
                        <span>{ft}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="mt-8">
                  <Link href={isSignedIn ? "/workspace-select" : "/sign-up"}>
                    <Button variant={plan.popular ? "primary" : "secondary"} className="w-full text-xs font-bold py-2.5">
                      {plan.name === "Free Trial" ? "Start Free" : "Get Started"}
                    </Button>
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section id="faq" className="py-24 border-t border-border bg-background relative z-10 transition-colors duration-300">
        <div className="max-w-3xl mx-auto px-6 space-y-12">
          <div className="text-center space-y-3">
            <span className="text-[10px] font-mono uppercase tracking-wider text-accent dark:text-purple-400 font-bold">Got Questions?</span>
            <h2 className="text-2xl sm:text-4xl font-extrabold tracking-tight text-foreground">
              Frequently Asked Questions
            </h2>
          </div>

          <div className="space-y-4 text-xs">
            {faqs.map((faq, idx) => (
              <div key={idx} className="rounded-xl border border-border bg-card shadow-sm hover:border-accent/30 transition-colors overflow-hidden">
                <button
                  type="button"
                  onClick={() => setOpenFaqIndex(openFaqIndex === idx ? null : idx)}
                  className="w-full p-4 text-left font-bold text-foreground hover:bg-secondary/40 transition-colors flex items-center justify-between"
                >
                  <span>{faq.q}</span>
                  <ChevronDown className={`w-4 h-4 text-muted-foreground transition-transform ${openFaqIndex === idx ? "rotate-180" : ""}`} />
                </button>
                {openFaqIndex === idx && (
                  <div className="p-4 border-t border-border bg-secondary/20 text-muted-foreground leading-relaxed text-[11px]">
                    {faq.a}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Final CTA Section */}
      <section className="py-32 border-t border-border bg-background relative overflow-hidden z-10 transition-colors duration-300">
        <div className="absolute inset-0 bg-gradient-to-tr from-purple-900/10 via-indigo-900/10 to-transparent blur-[120px] pointer-events-none" />
        <div className="max-w-5xl mx-auto px-6 text-center space-y-8 relative">
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
                  className="px-6 py-2.5 text-xs font-bold shadow-lg shadow-purple-500/20"
                >
                  {loadingBusiness ? "Loading..." : "Business Workspace"} <ArrowRight className="w-3.5 h-3.5" />
                </Button>
                <Button
                  variant="secondary"
                  onClick={() => router.push("/personal")}
                  className="px-6 py-2.5 text-xs font-bold"
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
                  <Button variant="primary" className="px-6 py-2.5 text-xs font-bold shadow-lg shadow-purple-500/20">
                    Start Free Trial
                  </Button>
                </Link>
                <Link href="/sign-in">
                  <Button variant="secondary" className="px-6 py-2.5 text-xs font-bold">
                    Sign In
                  </Button>
                </Link>
              </div>
            </>
          )}
        </div>
      </section>

      {/* Global Footer */}
      <footer className="border-t border-zinc-800/40 bg-zinc-950 py-12 relative z-10">
        <div className="max-w-7xl mx-auto px-6 grid grid-cols-2 sm:grid-cols-4 gap-8 text-xs text-zinc-500">
          <div className="space-y-3">
            <div className="flex items-center gap-2.5">
              <div className="w-6 h-6 rounded bg-gradient-to-tr from-purple-600 to-indigo-600 flex items-center justify-center">
                <span className="font-extrabold text-[10px] text-white">V</span>
              </div>
              <span className="font-bold text-zinc-300">Value Intelligence</span>
            </div>
            <p className="text-[10px] leading-relaxed">
              Premium C-Suite decision intelligence for enterprise AI alignment.
            </p>
          </div>
          <div className="space-y-2">
            <span className="font-bold text-zinc-300 uppercase tracking-wider text-[10px] block">Product</span>
            <a href="#problems" className="hover:text-zinc-300 transition-colors block text-[11px]">Solutions</a>
            <a href="#tour" className="hover:text-zinc-300 transition-colors block text-[11px]">Guided Tour</a>
            <a href="#pricing" className="hover:text-zinc-300 transition-colors block text-[11px]">Pricing Plans</a>
          </div>
          <div className="space-y-2">
            <span className="font-bold text-zinc-300 uppercase tracking-wider text-[10px] block">Security</span>
            <span className="block text-[11px]">Row Level Security</span>
            <span className="block text-[11px]">RBAC Permissions</span>
            <span className="block text-[11px]">Encrypted Keys</span>
          </div>
          <div className="space-y-2">
            <span className="font-bold text-zinc-300 uppercase tracking-wider text-[10px] block">Company</span>
            <span className="block text-[11px]">About Us</span>
            <span className="block text-[11px]">Privacy Policy</span>
            <span className="block text-[11px]">Terms of Service</span>
          </div>
        </div>
        <div className="max-w-7xl mx-auto px-6 pt-8 mt-8 border-t border-zinc-900 text-center text-[10px] text-zinc-650">
          © 2026 AI Initiative Value Intelligence. All rights reserved. Built for production-ready executive scale.
        </div>
      </footer>
    </div>
  );
}
