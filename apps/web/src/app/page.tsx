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
  Lock,
  ChevronDown,
  Cpu,
  FileSpreadsheet,
  Check,
  Zap,
  Briefcase,
  User,
  Settings,
  LogOut,
  Shield,
  BarChart3,
  Server,
  ArrowUpRight,
} from "lucide-react";
import {
  Button,
  ThemeToggle,
  ScrollAnimate,
  TelemetryGridCanvas,
  ScrollProgressBar,
  SpotlightCard,
  BorderBeam,
} from "@/components/ui";
import { HeroVisual } from "@/components/site/HeroVisual";

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

  const stepRefs = useRef<(HTMLElement | null)[]>([]);

  useEffect(() => {
    if (typeof window === "undefined" || window.innerWidth < 1024) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const index = Number(entry.target.getAttribute("data-step-index"));
            if (!isNaN(index)) {
              setActiveTourStep(index);
            }
          }
        });
      },
      {
        rootMargin: "-25% 0px -45% 0px",
        threshold: 0.1,
      }
    );

    stepRefs.current.forEach((el) => {
      if (el) observer.observe(el);
    });

    return () => {
      observer.disconnect();
    };
  }, []);

  if (!authLoaded) {
    return (
      <div className="min-h-screen bg-[#0B0D11] text-[#F4F1EA] flex flex-col items-center justify-center p-6 relative overflow-hidden transition-colors duration-300">
        <TelemetryGridCanvas particleCount={25} />
        <div className="flex flex-col items-center space-y-4 relative z-10 animate-in fade-in duration-200">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-tr from-[#7DA7D9] to-[#4F759B] flex items-center justify-center shadow-lg shadow-[#7DA7D9]/25 animate-pulse">
            <span className="font-extrabold text-xl text-[#0B0D11]">V</span>
          </div>
          <div className="flex items-center gap-2 text-xs font-semibold text-[#8F98A8] font-mono">
            <div className="w-2 h-2 rounded-full bg-[#7DA7D9] animate-ping" />
            <span>Verifying session security context...</span>
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

  // Guided tour interactive showcase tabs
  const tourSteps = [
    {
      title: "Executive Command Center",
      description: "Get immediate clarity on total portfolio ROI, net realized savings, and program risks across all active enterprise lines.",
      badge: "Analytics",
      mockup: (
        <div className="space-y-4 font-sans text-xs">
          <div className="flex items-center justify-between border-b border-[#202630] pb-3">
            <div className="flex items-center gap-2">
              <div className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
              <span className="font-bold text-[#F4F1EA] text-sm">Portfolio Health & Financial Ledger</span>
            </div>
            <span className="text-[10px] font-mono px-2.5 py-0.5 rounded-full bg-[#7DA7D9]/15 text-[#7DA7D9] font-bold border border-[#7DA7D9]/30">
              Live Sync Active
            </span>
          </div>
          <div className="grid grid-cols-3 gap-3">
            <div className="p-3.5 rounded-xl bg-[#171C24] border border-[#202630] text-center space-y-1.5 shadow-sm hover:border-[#7DA7D9]/40 transition-colors">
              <span className="text-[9px] uppercase tracking-wider text-[#8F98A8] font-bold block whitespace-nowrap">Portfolio ROI</span>
              <span className="text-base font-extrabold text-[#7DA7D9] font-mono block whitespace-nowrap">+215.4%</span>
              <span className="text-[9px] text-emerald-400 font-mono block whitespace-nowrap">▲ 14.2% QoQ</span>
            </div>
            <div className="p-3.5 rounded-xl bg-[#171C24] border border-[#202630] text-center space-y-1.5 shadow-sm hover:border-emerald-500/40 transition-colors">
              <span className="text-[9px] uppercase tracking-wider text-[#8F98A8] font-bold block whitespace-nowrap">Realized Savings</span>
              <span className="text-base font-extrabold text-emerald-400 font-mono block whitespace-nowrap">$4.94M</span>
              <span className="text-[9px] text-[#8F98A8] font-mono block whitespace-nowrap">Target: $4.50M</span>
            </div>
            <div className="p-3.5 rounded-xl bg-[#171C24] border border-[#202630] text-center space-y-1.5 shadow-sm hover:border-[#C9A86A]/40 transition-colors">
              <span className="text-[9px] uppercase tracking-wider text-[#8F98A8] font-bold block whitespace-nowrap">Active Pilots</span>
              <span className="text-base font-extrabold text-[#C9A86A] font-mono block whitespace-nowrap">14</span>
              <span className="text-[9px] text-[#8F98A8] font-mono block whitespace-nowrap">8 in Stage 4+</span>
            </div>
          </div>
          <div className="p-3.5 rounded-xl bg-[#171C24]/70 border border-[#202630] space-y-2">
            <div className="flex justify-between text-[10px] text-[#8F98A8] font-mono">
              <span className="whitespace-nowrap">Budget Allocation ($4.80M Committed)</span>
              <span className="font-bold text-[#F4F1EA] whitespace-nowrap">78% Utilized</span>
            </div>
            <div className="h-2 bg-[#0E1116] rounded-full overflow-hidden border border-[#202630]">
              <div className="h-full bg-gradient-to-r from-[#7DA7D9] via-[#C9A86A] to-emerald-400 rounded-full w-[78%] transition-all duration-500" />
            </div>
          </div>
          <div className="pt-2 border-t border-[#202630] flex items-center justify-between text-[10px] text-[#8F98A8] gap-2">
            <span className="truncate">Next Executive Gate: <strong className="text-[#F4F1EA]">Q3 Portfolio Review</strong></span>
            <span className="text-[#7DA7D9] font-semibold font-mono whitespace-nowrap shrink-0 bg-[#7DA7D9]/10 px-2 py-0.5 rounded border border-[#7DA7D9]/20">12 Initiatives on Track</span>
          </div>
        </div>
      ),
    },
    {
      title: "AI Studio Recommendations",
      description: "Generate deep explainable summaries, model NPV forecast curves, and run multi-scenario sensitivity comparisons.",
      badge: "AI Modeling",
      mockup: (
        <div className="space-y-4 font-sans text-xs">
          <div className="flex items-center justify-between border-b border-[#202630] pb-3">
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-[#7DA7D9]" />
              <span className="font-bold text-[#F4F1EA] text-sm">AI Value Studio Forecaster</span>
            </div>
            <span className="text-[10px] font-mono text-[#C9A86A] px-2.5 py-0.5 rounded-full bg-[#C9A86A]/10 border border-[#C9A86A]/20 font-bold">
              94% Confidence
            </span>
          </div>
          <div className="p-3.5 rounded-xl bg-[#171C24] border border-[#202630] space-y-2 shadow-sm">
            <div className="flex justify-between text-[11px] items-center">
              <span className="font-semibold text-[#F4F1EA]">GPU Cluster Optimization Engine</span>
              <span className="font-mono text-emerald-400 font-bold bg-emerald-400/10 px-2 py-0.5 rounded border border-emerald-400/20">+148% ROI</span>
            </div>
            <p className="text-[11px] text-[#8F98A8] leading-relaxed">
              Recommendation: Fast-track to immediate pilot scale. Expected payback period is 9.2 months with Net Present Value (NPV) of $1,240,000.
            </p>
          </div>
          <div className="grid grid-cols-2 gap-2.5 text-[10px] font-mono">
            <div className="p-2.5 rounded-lg bg-[#171C24]/60 border border-[#202630]">
              <span className="text-[#8F98A8] block text-[9px] uppercase">Discount Rate</span>
              <span className="font-bold text-[#F4F1EA] text-xs">8.5% (WACC)</span>
            </div>
            <div className="p-2.5 rounded-lg bg-[#171C24]/60 border border-[#202630]">
              <span className="text-[#8F98A8] block text-[9px] uppercase">Risk Factor</span>
              <span className="font-bold text-emerald-400 text-xs">Low Variance (±4%)</span>
            </div>
          </div>
          <div className="flex gap-2 pt-1">
            <button type="button" className="px-3.5 py-1.5 rounded-lg bg-[#7DA7D9] hover:bg-[#A5C3E8] text-[#0B0D11] font-semibold text-[11px] shadow-sm transition-colors cursor-pointer">Accept Scenario</button>
            <button type="button" className="px-3.5 py-1.5 rounded-lg bg-[#171C24] hover:bg-[#202630] border border-[#202630] text-[#F4F1EA] font-semibold text-[11px] transition-colors cursor-pointer">Run Alternative</button>
          </div>
        </div>
      ),
    },
    {
      title: "Governance State Machine",
      description: "Track initiative lifecycle gates through an 8-stage state machine with complete audit trails and SLA checks.",
      badge: "Compliance",
      mockup: (
        <div className="space-y-4 font-sans text-xs">
          <div className="flex items-center justify-between border-b border-[#202630] pb-3">
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-[#7DA7D9]" />
              <span className="font-bold text-[#F4F1EA] text-sm">Active Governance State Gate</span>
            </div>
            <span className="text-[10px] font-mono text-[#C9A86A] font-semibold px-2.5 py-0.5 rounded-full bg-[#C9A86A]/10 border border-[#C9A86A]/20">
              SLA Active: 1.4d
            </span>
          </div>
          <div className="flex items-center gap-1.5 overflow-x-auto py-1">
            {["Draft", "Review", "Approved", "Deploying"].map((step, idx) => (
              <div key={idx} className="flex items-center gap-1 shrink-0">
                <span className={`px-2.5 py-1 rounded-md text-[10px] font-semibold ${
                  idx <= 2
                    ? "bg-[#7DA7D9]/15 text-[#7DA7D9] border border-[#7DA7D9]/30"
                    : "bg-[#171C24] text-[#8F98A8] border border-[#202630]"
                }`}>
                  {step}
                </span>
                {idx < 3 && <span className="text-[#8F98A8] text-xs font-bold">→</span>}
              </div>
            ))}
          </div>
          <div className="p-3.5 bg-[#171C24] rounded-xl border border-[#202630] font-mono text-[10px] text-[#8F98A8] space-y-1.5 shadow-sm">
            <div className="text-[#F4F1EA] font-semibold">[2026-08-04 14:20] User Marc.V transitioned state: REVIEW → APPROVED</div>
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
      a: "The Business Workspace is built for enterprise organizations requiring multi-tenant isolation (Supabase RLS), custom RBAC configuration, Power BI connectors, governance workflows, and multi-provider AI observability dashboards. The Personal Workspace is a sandbox for individual founders, developers, or researchers to manage personal subscriptions, AI tool usage, and cloud sandbox accounts.",
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
    <div className="min-h-screen bg-[#0B0D11] text-[#F4F1EA] font-sans selection:bg-[#7DA7D9]/30 overflow-hidden relative transition-colors duration-300">
      {/* 2px Hairline Scroll Progress Bar */}
      <ScrollProgressBar />

      {/* Living 60fps Telemetry Mesh Background */}
      <TelemetryGridCanvas particleCount={40} speed={0.3} />

      {/* Header / Navigation */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-[#0B0D11]/80 backdrop-blur-md border-b border-[#171C24]">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <button
            type="button"
            onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
            className="flex items-center gap-2.5 group cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-[#7DA7D9] rounded-lg active:scale-[0.98] transition-transform"
            aria-label="Scroll back to top"
          >
            <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-[#7DA7D9] to-[#4F759B] flex items-center justify-center shadow-lg shadow-[#7DA7D9]/20 group-hover:scale-105 transition-transform duration-300">
              <span className="font-extrabold text-sm text-[#0B0D11]">V</span>
            </div>
            <span className="font-bold tracking-tight text-sm text-[#F4F1EA] group-hover:text-[#7DA7D9] transition-colors">
              Value Intelligence
            </span>
          </button>

          <nav className="hidden md:flex items-center gap-6 text-xs text-[#8F98A8] font-medium">
            <a href="#problems" className="hover:text-[#F4F1EA] transition-colors">Solutions</a>
            <a href="#overview" className="hover:text-[#F4F1EA] transition-colors">Pipeline</a>
            <a href="#tour" className="hover:text-[#F4F1EA] transition-colors">Platform</a>
            <a href="#features" className="hover:text-[#F4F1EA] transition-colors">Workspaces</a>
            <a href="#pricing" className="hover:text-[#F4F1EA] transition-colors">Pricing</a>
            <a href="#faq" className="hover:text-[#F4F1EA] transition-colors">FAQ</a>
          </nav>

          <div className="flex items-center gap-3">
            {isSignedIn ? (
              <div className="relative" ref={consoleDropdownRef}>
                <Button
                  variant="primary"
                  onClick={() => setIsConsoleOpen(!isConsoleOpen)}
                  className="px-4 py-1.5 text-xs font-semibold flex items-center gap-1 active:scale-[0.98] transition-all bg-[#7DA7D9] text-[#0B0D11] hover:bg-[#A5C3E8]"
                >
                  Console <ChevronDown className={`w-3.5 h-3.5 transition-transform duration-200 ${isConsoleOpen ? "rotate-180" : ""}`} />
                </Button>
                {isConsoleOpen && (
                  <div className="absolute right-0 mt-2 w-52 rounded-xl border border-[#202630] bg-[#11151C] p-1.5 shadow-2xl z-50 animate-in fade-in slide-in-from-top-1 duration-200">
                    <button
                      type="button"
                      disabled={loadingBusiness}
                      onClick={() => {
                        setIsConsoleOpen(false);
                        handleBusinessWorkspaceClick();
                      }}
                      className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-left text-xs font-semibold text-[#F4F1EA] hover:bg-[#171C24] transition-colors cursor-pointer disabled:opacity-50"
                    >
                      <Briefcase className="w-3.5 h-3.5 text-[#7DA7D9]" />
                      <span>Business Workspace</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setIsConsoleOpen(false);
                        handlePersonalWorkspaceClick();
                      }}
                      className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-left text-xs font-semibold text-[#F4F1EA] hover:bg-[#171C24] transition-colors cursor-pointer"
                    >
                      <User className="w-3.5 h-3.5 text-[#C9A86A]" />
                      <span>Personal Workspace</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setIsConsoleOpen(false);
                        router.push("/workspace-select");
                      }}
                      className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-left text-xs font-semibold text-[#F4F1EA] hover:bg-[#171C24] transition-colors cursor-pointer"
                    >
                      <Layers className="w-3.5 h-3.5 text-[#8F98A8]" />
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
                      className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-left text-xs font-semibold text-[#F4F1EA] hover:bg-[#171C24] transition-colors cursor-pointer"
                    >
                      <Settings className="w-3.5 h-3.5 text-[#8F98A8]" />
                      <span>Manage Account</span>
                    </button>
                    <div className="h-px bg-[#202630] my-1" />
                    <button
                      type="button"
                      onClick={async () => {
                        setIsConsoleOpen(false);
                        await signOut();
                        router.push("/");
                      }}
                      className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-left text-xs font-semibold text-rose-400 hover:bg-rose-500/10 transition-colors cursor-pointer"
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
                  <span className="text-xs text-[#8F98A8] hover:text-[#F4F1EA] transition-colors font-medium mr-2 cursor-pointer font-bold">
                    Sign In
                  </span>
                </Link>
                <Link href="/sign-up">
                  <Button variant="primary" className="px-4 py-1.5 text-xs font-semibold active:scale-[0.98] transition-all bg-[#7DA7D9] text-[#0B0D11] hover:bg-[#A5C3E8]">
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
      <section className="relative overflow-hidden z-10 pt-32 pb-20 border-b border-[#171C24] bg-[#0B0D11] w-full">
        <div className="max-w-7xl mx-auto px-6 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            {/* Left Column: Headline, Description and CTAs */}
            <div className="lg:col-span-7 flex flex-col items-center lg:items-start text-center lg:text-left space-y-8">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#11151C] border border-[#202630] text-[10px] font-mono uppercase tracking-wider text-[#7DA7D9]">
                <Shield className="w-3.5 h-3.5 text-[#7DA7D9]" />
                Institutional AI Governance Platform
              </div>

              <div className="space-y-4">
                <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight leading-[1.08] text-[#F4F1EA]">
                  Transform AI Portfolios Into Measurable Enterprise Value
                </h1>
                <p className="text-sm sm:text-base text-[#8F98A8] leading-relaxed max-w-xl">
                  The unified decision intelligence engine for C-suites. Model NPV & cash flows, enforce 8-stage governance gates, audit multi-provider LLM models, and track personal cloud spend.
                </p>
              </div>

              <div className="flex flex-wrap items-center justify-center lg:justify-start gap-3.5 w-full">
                {isSignedIn ? (
                  <>
                    <Button
                      variant="primary"
                      onClick={handleBusinessWorkspaceClick}
                      disabled={loadingBusiness}
                      className="h-11 px-6 text-xs font-bold bg-[#7DA7D9] text-[#0B0D11] hover:bg-[#A5C3E8] rounded-xl shadow-lg active:scale-[0.98] transition-all"
                    >
                      {loadingBusiness ? "Loading..." : "Business Workspace"} <ArrowRight className="w-4 h-4 ml-1" />
                    </Button>
                    <Button
                      variant="secondary"
                      onClick={handlePersonalWorkspaceClick}
                      className="h-11 px-6 text-xs font-bold bg-[#171C24] text-[#F4F1EA] border border-[#202630] hover:border-[#C9A86A]/40 rounded-xl active:scale-[0.98] transition-all"
                    >
                      Personal Workspace <ArrowRight className="w-4 h-4 ml-1 text-[#C9A86A]" />
                    </Button>
                  </>
                ) : (
                  <>
                    <Link href="/sign-up">
                      <Button variant="primary" className="h-11 px-6 text-xs font-bold bg-[#7DA7D9] text-[#0B0D11] hover:bg-[#A5C3E8] rounded-xl shadow-lg active:scale-[0.98] transition-all">
                        Get Started
                      </Button>
                    </Link>
                    <a href="#tour">
                      <Button variant="secondary" className="h-11 px-6 text-xs font-bold bg-[#171C24] text-[#F4F1EA] border border-[#202630] hover:border-[#7DA7D9]/40 rounded-xl active:scale-[0.98] transition-all">
                        Explore Guided Tour
                      </Button>
                    </a>
                  </>
                )}
              </div>
            </div>

            {/* Right Column: Hero Visual Monolith */}
            <div className="lg:col-span-5 w-full flex items-center justify-center">
              <HeroVisual />
            </div>
          </div>

          {/* Live Dashboard Preview Mockup with 21st.dev Border Beam */}
          <div className="pt-16 max-w-5xl mx-auto relative group">
            <SpotlightCard
              tiltEnabled={true}
              spotlightColor="rgba(125, 167, 217, 0.12)"
              className="p-5 relative overflow-hidden rounded-2xl border-[#202630] bg-[#11151C]/95 shadow-2xl"
            >
              <BorderBeam size={220} duration={14} colorFrom="#7DA7D9" colorTo="#C9A86A" />

              <div className="flex items-center gap-2 pb-3 border-b border-[#202630] text-[#8F98A8]">
                <span className="w-2.5 h-2.5 rounded-full bg-[#202630]" />
                <span className="w-2.5 h-2.5 rounded-full bg-[#202630]" />
                <span className="w-2.5 h-2.5 rounded-full bg-[#202630]" />
                <span className="text-[10px] font-mono ml-2 tracking-wider uppercase text-[#8F98A8]">
                  HTTPS://APP.VALUEINTEL.AI/EXECUTIVE-COMMAND
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-4 gap-4 pt-4 text-left">
                <div className="md:col-span-3 p-5 rounded-xl border border-[#202630] bg-[#0E1116] space-y-4">
                  <div className="flex items-center justify-between border-b border-[#202630] pb-2">
                    <div className="flex items-center gap-4 text-[10px] font-mono">
                      <div>
                        <span className="text-[#8F98A8]">REALIZED SAVINGS: </span>
                        <span className="font-bold text-[#7DA7D9]">$4.94M</span>
                      </div>
                      <div>
                        <span className="text-[#8F98A8]">PORTFOLIO ROI: </span>
                        <span className="font-bold text-[#C9A86A]">+185.4%</span>
                      </div>
                    </div>
                    <span className="text-[10px] text-[#8F98A8] font-mono">Q3 Forecast Verified</span>
                  </div>
                  <div className="space-y-2">
                    {[
                      { name: "Customer Support Automation Bot", roi: "+215%", stage: "APPROVED", color: "text-[#7DA7D9]" },
                      { name: "GPU Infrastructure Scheduler", roi: "+148%", stage: "EXECUTIVE_REVIEW", color: "text-[#C9A86A]" },
                      { name: "Automated Financial Reconciliation", roi: "+95%", stage: "DEPLOYED", color: "text-emerald-400" },
                    ].map((item, idx) => (
                      <div
                        key={idx}
                        className="p-3 rounded-lg border border-[#202630] bg-[#11151C] flex flex-col gap-2 text-xs hover:border-[#7DA7D9]/40 transition-colors"
                      >
                        <div className="flex items-center justify-between">
                          <div className="space-y-0.5">
                            <span className="font-semibold text-[#F4F1EA] block">{item.name}</span>
                            <div className="flex items-center gap-1.5">
                              <span className="text-[9px] text-[#8F98A8] font-mono">Stage: {item.stage}</span>
                              <span className="w-1.5 h-1.5 rounded-full bg-[#7DA7D9] animate-pulse" />
                            </div>
                          </div>
                          <span className={`font-bold font-mono ${item.color}`}>{item.roi} ROI</span>
                        </div>
                        <div className="h-1 bg-[#171C24] rounded-full overflow-hidden w-36 border border-[#202630]">
                          <div
                            className="h-full bg-gradient-to-r from-[#7DA7D9] to-[#C9A86A] rounded-full"
                            style={{ width: item.roi === "+215%" ? "85%" : item.roi === "+148%" ? "68%" : "45%" }}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="p-5 rounded-xl border border-[#202630] bg-[#0E1116] space-y-4 flex flex-col justify-between">
                  <div className="space-y-2 text-xs">
                    <span className="text-[9px] font-mono text-[#7DA7D9] tracking-wider uppercase block font-bold">
                      Decision Intelligence
                    </span>
                    <p className="text-[#8F98A8] leading-relaxed text-[11px]">
                      "Automating Customer Support presents a 9.2 month payback period with a 94.2% confidence indicator."
                    </p>
                  </div>
                  <div className="pt-3 border-t border-[#202630] flex flex-col gap-2">
                    <div className="flex items-center gap-2">
                      <div className="w-5 h-5 rounded bg-[#7DA7D9]/10 border border-[#7DA7D9]/20 flex items-center justify-center">
                        <Sparkles className="w-3 h-3 text-[#7DA7D9]" />
                      </div>
                      <span className="text-[9px] font-bold text-[#F4F1EA]">94.2% Confidence</span>
                    </div>
                    <div className="h-1 bg-[#171C24] rounded-full overflow-hidden w-full border border-[#202630]">
                      <div className="h-full bg-[#7DA7D9] rounded-full" style={{ width: "94%" }} />
                    </div>
                  </div>
                </div>
              </div>
            </SpotlightCard>
          </div>
        </div>
      </section>

      {/* Chapter 2: The Problem (with 3D Perspective Spotlight Cards) */}
      <section id="problems" className="py-24 border-t border-[#171C24] bg-[#0E1116] relative z-10 transition-colors duration-300 overflow-hidden">
        <div className="max-w-7xl mx-auto px-6 space-y-12 relative z-10">
          <div className="text-center space-y-3">
            <span className="text-[10px] font-mono uppercase tracking-wider text-[#7DA7D9] font-bold">The Problem</span>
            <h2 className="text-2xl sm:text-4xl font-extrabold tracking-tight text-[#F4F1EA]">
              Why Enterprise AI Initiatives Stall
            </h2>
            <p className="text-xs sm:text-sm text-[#8F98A8] max-w-lg mx-auto">
              Lack of clear financial baselines, unmonitored model API burn, fragmented spreadsheets, and governance gate bottlenecks.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-xs">
            {[
              {
                title: "Uncontrolled Cloud & LLM Costs",
                desc: "API bills multiply across departments without clear business unit or initiative attribution.",
                fix: "Real-time token & seat attribution ledgers.",
              },
              {
                title: "Manual Legacy Reporting",
                desc: "Executives wait weeks for static slide decks that fail to account for variance and market shifts.",
                fix: "Live C-suite financial intelligence dashboards.",
              },
              {
                title: "Shadow AI & Key Sprawl",
                desc: "API credentials leaked across teams without centralized encryption, rotation, or RBAC scopes.",
                fix: "Secured enterprise secrets vault & RLS scopes.",
              },
            ].map((p, idx) => (
              <ScrollAnimate key={idx} delayMs={idx * 120}>
                <SpotlightCard
                  tiltEnabled={true}
                  spotlightColor="rgba(125, 167, 217, 0.12)"
                  className="p-6 rounded-xl border-[#202630] bg-[#11151C] space-y-4 flex flex-col justify-between h-full"
                >
                  <div className="space-y-2">
                    <h3 className="font-bold text-[#F4F1EA] text-sm">{p.title}</h3>
                    <p className="text-[#8F98A8] text-[11px] leading-relaxed">{p.desc}</p>
                  </div>
                  <div className="pt-3 border-t border-[#202630] text-[#7DA7D9] font-semibold flex items-center gap-1.5 font-mono text-[11px]">
                    <Zap className="w-3.5 h-3.5 shrink-0" /> {p.fix}
                  </div>
                </SpotlightCard>
              </ScrollAnimate>
            ))}
          </div>
        </div>
      </section>

      {/* Chapter 3: The Unified Pipeline */}
      <section id="overview" className="py-24 border-t border-[#171C24] bg-[#0B0D11] relative z-10 overflow-hidden">
          <div className="max-w-7xl mx-auto px-6 space-y-12 relative z-10">
            <div className="text-center space-y-3">
              <span className="text-[10px] font-mono uppercase tracking-wider text-[#C9A86A] font-bold">The Pipeline</span>
              <h2 className="text-2xl sm:text-4xl font-extrabold tracking-tight text-[#F4F1EA]">
                The 6-Stage Value Lifecycle
              </h2>
              <p className="text-xs sm:text-sm text-[#8F98A8] max-w-lg mx-auto">
                Follow the journey of a single strategic initiative from concept selection to real-world cash flow realization.
              </p>
            </div>

            <div className="relative pt-4">
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 relative z-10 text-xs">
                {[
                  { step: "1. Idea Setup", icon: Sparkles, desc: "Submit details via Wizard" },
                  { step: "2. AI Analysis", icon: Cpu, desc: "Explainable scenario ROI" },
                  { step: "3. Financials", icon: FileSpreadsheet, desc: "Cash flows & NPV" },
                  { step: "4. Governance", icon: CheckCircle2, desc: "8-Gate review timeline" },
                  { step: "5. Command", icon: Layers, desc: "Multi-project tracking" },
                  { step: "6. Reporting", icon: Activity, desc: "C-Suite PDF export" },
                ].map((p, idx) => {
                  const Icon = p.icon;
                  return (
                    <ScrollAnimate key={idx} delayMs={idx * 70}>
                      <SpotlightCard
                        tiltEnabled={true}
                        spotlightColor="rgba(201, 168, 106, 0.12)"
                        className="p-4 sm:p-5 rounded-xl border-[#202630] bg-[#11151C] h-full"
                      >
                        <div className="flex flex-col items-center justify-center text-center space-y-3 h-full w-full">
                          <div className="w-10 h-10 rounded-xl bg-[#7DA7D9]/10 border border-[#7DA7D9]/20 flex items-center justify-center text-[#7DA7D9] mx-auto shrink-0 shadow-sm">
                            <Icon className="w-4 h-4" />
                          </div>
                          <div className="space-y-1 w-full text-center">
                            <span className="font-bold text-[#F4F1EA] block text-xs whitespace-nowrap">{p.step}</span>
                            <span className="text-[10px] text-[#8F98A8] leading-tight block text-center">{p.desc}</span>
                          </div>
                        </div>
                      </SpotlightCard>
                    </ScrollAnimate>
                  );
                })}
              </div>
            </div>
          </div>
        </section>

      {/* Chapter 4: Interactive Guided Tour */}
      <section id="tour" className="py-24 border-t border-[#171C24] bg-[#0E1116] relative z-10 transition-colors duration-300 overflow-hidden">
        <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 lg:grid-cols-2 gap-12 items-start relative z-10">
          <div className="space-y-6">
            <div className="space-y-3">
              <span className="text-[10px] font-mono uppercase tracking-wider text-[#7DA7D9] font-bold">Interactive Showcase</span>
              <h2 className="text-3xl font-extrabold tracking-tight text-[#F4F1EA]">
                Explore the Platform in Action
              </h2>
              <p className="text-xs sm:text-sm text-[#8F98A8] leading-relaxed">
                Click through the modules below to preview how our C-suite decision components orchestrate financial data dynamically.
              </p>
            </div>

            <div className="space-y-3 text-xs">
              {tourSteps.map((step, idx) => (
                <button
                  key={idx}
                  type="button"
                  ref={(el) => {
                    stepRefs.current[idx] = el;
                  }}
                  data-step-index={idx}
                  onClick={() => setActiveTourStep(idx)}
                  className={`w-full p-4 rounded-xl border text-left transition-all flex flex-col gap-1 cursor-pointer ${
                    activeTourStep === idx
                      ? "border-l-4 border-l-[#7DA7D9] bg-[#7DA7D9]/10 border-[#7DA7D9]/30 text-[#F4F1EA] font-semibold shadow-md"
                      : "bg-[#11151C] border-[#202630] text-[#8F98A8] hover:bg-[#171C24] hover:text-[#F4F1EA]"
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-[#F4F1EA]">{step.title}</span>
                    <span
                      className={`text-[9px] font-mono uppercase px-2 py-0.5 rounded-full font-bold ${
                        activeTourStep === idx
                          ? "bg-[#7DA7D9]/20 text-[#7DA7D9]"
                          : "bg-[#171C24] text-[#8F98A8]"
                      }`}
                    >
                      {step.badge}
                    </span>
                  </div>
                  <p className="text-[11px] leading-relaxed text-[#8F98A8]">{step.description}</p>
                </button>
              ))}
            </div>
          </div>

          <div className="lg:sticky lg:top-32 rounded-2xl border border-[#202630] bg-[#11151C] shadow-2xl overflow-hidden relative">
            {/* Terminal / Browser Window Bar */}
            <div className="flex items-center justify-between px-4 py-2.5 border-b border-[#202630] bg-[#0E1116]/90 backdrop-blur-md">
              <div className="flex items-center gap-1.5">
                <div className="w-2.5 h-2.5 rounded-full bg-[#E5484D]/70 border border-[#E5484D]" />
                <div className="w-2.5 h-2.5 rounded-full bg-[#FFB224]/70 border border-[#FFB224]" />
                <div className="w-2.5 h-2.5 rounded-full bg-[#30A46C]/70 border border-[#30A46C]" />
                <span className="text-[10px] font-mono text-[#8F98A8] ml-2 tracking-wider">aivi://decision-engine/preview</span>
              </div>
              <div className="flex items-center gap-1.5 font-mono text-[10px] text-[#7DA7D9] bg-[#7DA7D9]/10 px-2 py-0.5 rounded-full border border-[#7DA7D9]/20 font-bold">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                SYSTEM READY
              </div>
            </div>

            {/* Active Mockup Display */}
            <div className="p-6 relative min-h-[350px]">
              {tourSteps.map((step, idx) => (
                <div
                  key={idx}
                  className={`transition-all duration-500 ease-in-out ${
                    activeTourStep === idx
                      ? "opacity-100 translate-y-0 scale-100 pointer-events-auto relative z-10"
                      : "opacity-0 translate-y-4 scale-[0.98] pointer-events-none absolute inset-6"
                  }`}
                >
                  {step.mockup}
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Chapter 5: Workspaces Architecture */}
      <section id="features" className="py-24 border-t border-[#171C24] bg-[#0B0D11] relative z-10 transition-colors duration-300 overflow-hidden">
        <div className="max-w-7xl mx-auto px-6 space-y-20 relative z-10">
          {/* Workspace 1: Business */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div className="space-y-6">
              <div className="space-y-3">
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#7DA7D9]/10 border border-[#7DA7D9]/20 text-[10px] text-[#7DA7D9] font-bold uppercase tracking-wider font-mono">
                  <Briefcase className="w-3.5 h-3.5" />
                  Business Workspace
                </div>
                <h2 className="text-3xl font-extrabold tracking-tight text-[#F4F1EA]">
                  Enterprise AI Portfolio Governance
                </h2>
                <p className="text-xs sm:text-sm text-[#8F98A8] leading-relaxed">
                  Provide executives with a centralized command center to approve capital investments, audit project timelines, allocate budgets, and verify savings against targets.
                </p>
              </div>

              <div className="grid grid-cols-2 gap-4 text-xs">
                {[
                  "Executive Dashboard",
                  "AI Value Forecaster",
                  "Financial NPV Ledger",
                  "Portfolio Command Center",
                  "Governance Gate Machine",
                  "Multi-Provider LLM Engine",
                ].map((item, idx) => (
                  <div key={idx} className="flex items-center gap-2 text-[#F4F1EA]">
                    <CheckCircle2 className="w-4 h-4 text-[#7DA7D9] shrink-0" />
                    <span>{item}</span>
                  </div>
                ))}
              </div>

              <div className="pt-2">
                <Button
                  variant="primary"
                  onClick={handleBusinessWorkspaceClick}
                  disabled={loadingBusiness}
                  className="px-5 py-2.5 text-xs font-bold bg-[#7DA7D9] text-[#0B0D11] hover:bg-[#A5C3E8] rounded-xl shadow-lg active:scale-[0.98] transition-all cursor-pointer"
                >
                  {loadingBusiness ? "Loading..." : "Launch Business Workspace"} <ArrowRight className="w-3.5 h-3.5 ml-1" />
                </Button>
              </div>
            </div>

            <SpotlightCard
              tiltEnabled={true}
              spotlightColor="rgba(125, 167, 217, 0.12)"
              className="rounded-2xl border-[#202630] bg-[#11151C] p-6 space-y-4"
            >
              <span className="text-[10px] font-mono text-[#7DA7D9] uppercase tracking-wider block font-bold">
                Target Stakeholders
              </span>
              <div className="grid grid-cols-2 gap-3 text-xs">
                {[
                  { title: "CIO / CTO", desc: "Oversee architectural execution" },
                  { title: "CFO / Finance", desc: "Audit ROI realization & WACC" },
                  { title: "PMO Director", desc: "Enforce stage-gate milestones" },
                  { title: "AI Engineers", desc: "Test LLM prompts & latency" },
                ].map((st, idx) => (
                  <ScrollAnimate key={idx} delayMs={idx * 80}>
                    <div className="p-3.5 rounded-xl border border-[#202630] bg-[#171C24] hover:border-[#7DA7D9]/40 transition-colors h-full">
                      <span className="font-bold text-[#F4F1EA] block">{st.title}</span>
                      <span className="text-[10px] text-[#8F98A8]">{st.desc}</span>
                    </div>
                  </ScrollAnimate>
                ))}
              </div>
            </SpotlightCard>
          </div>

          {/* Workspace 2: Personal */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center pt-12 border-t border-[#171C24]">
            <SpotlightCard
              tiltEnabled={true}
              spotlightColor="rgba(201, 168, 106, 0.12)"
              className="rounded-2xl border-[#202630] bg-[#11151C] p-6 space-y-4 lg:order-last"
            >
              <span className="text-[10px] font-mono text-[#C9A86A] uppercase tracking-wider block font-bold">
                Key Capabilities
              </span>
              <div className="space-y-2.5 text-xs">
                {[
                  { label: "Personal SaaS & API Ledger", desc: "Manage recurring seats, tool licenses, and monthly billing cycles." },
                  { label: "AI Usage Analytics", desc: "Track token consumption across OpenAI, Anthropic, and Gemini keys." },
                  { label: "Cloud Sandbox Testing", desc: "Monitor individual AWS/GCP developer instances." },
                ].map((cap, idx) => (
                  <ScrollAnimate key={idx} delayMs={idx * 80}>
                    <div className="p-3.5 rounded-xl border border-[#202630] bg-[#171C24] space-y-1 hover:border-[#C9A86A]/40 transition-colors">
                      <span className="font-bold text-[#F4F1EA] block">{cap.label}</span>
                      <p className="text-[11px] text-[#8F98A8]">{cap.desc}</p>
                    </div>
                  </ScrollAnimate>
                ))}
              </div>
            </SpotlightCard>

            <div className="space-y-6">
              <div className="space-y-3">
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#C9A86A]/10 border border-[#C9A86A]/20 text-[10px] text-[#C9A86A] font-bold uppercase tracking-wider font-mono">
                  <User className="w-3.5 h-3.5" />
                  Personal Workspace
                </div>
                <h2 className="text-3xl font-extrabold tracking-tight text-[#F4F1EA]">
                  Individual Productivity Sandbox
                </h2>
                <p className="text-xs sm:text-sm text-[#8F98A8] leading-relaxed">
                  A personalized cockpit built for individual engineers, researchers, and founders to manage everyday AI subscriptions, verify API credentials, and track monthly cloud spend.
                </p>
              </div>

              <div className="grid grid-cols-2 gap-4 text-xs">
                {[
                  "Subscription Ledger",
                  "Individual API Tokens",
                  "Spending Categories",
                  "3D Orbital Visualizer",
                  "Payment Management",
                  "Usage Diagnostics",
                ].map((item, idx) => (
                  <div key={idx} className="flex items-center gap-2 text-[#F4F1EA]">
                    <CheckCircle2 className="w-4 h-4 text-[#C9A86A] shrink-0" />
                    <span>{item}</span>
                  </div>
                ))}
              </div>

              <div className="pt-2">
                <Button
                  variant="secondary"
                  onClick={handlePersonalWorkspaceClick}
                  className="px-5 py-2.5 text-xs font-bold bg-[#171C24] text-[#F4F1EA] border border-[#202630] hover:border-[#C9A86A]/40 rounded-xl shadow-lg active:scale-[0.98] transition-all cursor-pointer"
                >
                  Launch Personal Workspace <ArrowRight className="w-3.5 h-3.5 ml-1 text-[#C9A86A]" />
                </Button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Chapter 6: Institutional Pricing */}
      <section id="pricing" className="py-24 border-t border-[#171C24] bg-[#0E1116] relative z-10 transition-colors duration-300 overflow-hidden">
        <div className="max-w-7xl mx-auto px-6 space-y-12 relative z-10">
          <div className="text-center space-y-4">
            <span className="text-[10px] font-mono uppercase tracking-wider text-[#7DA7D9] font-bold">Institutional Pricing</span>
            <h2 className="text-2xl sm:text-4xl font-extrabold tracking-tight text-[#F4F1EA]">
              Transparent, Decision-Grade Plans
            </h2>
            <p className="text-xs sm:text-sm text-[#8F98A8] max-w-md mx-auto">
              Select the plan configured for your organization. Switch billing frequencies at any time.
            </p>

            <div className="inline-flex items-center gap-1.5 p-1 rounded-xl bg-[#11151C] border border-[#202630]">
              <button
                type="button"
                onClick={() => setIsYearlyPricing(false)}
                className={`px-3.5 py-1 rounded-lg text-[10px] font-semibold transition-colors cursor-pointer active:scale-[0.98] ${
                  !isYearlyPricing ? "bg-[#7DA7D9] text-[#0B0D11]" : "text-[#8F98A8] hover:text-[#F4F1EA]"
                }`}
              >
                Monthly
              </button>
              <button
                type="button"
                onClick={() => setIsYearlyPricing(true)}
                className={`px-3.5 py-1 rounded-lg text-[10px] font-semibold transition-colors cursor-pointer active:scale-[0.98] ${
                  isYearlyPricing ? "bg-[#7DA7D9] text-[#0B0D11]" : "text-[#8F98A8] hover:text-[#F4F1EA]"
                }`}
              >
                Yearly (Save 20%)
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto items-stretch">
            {[
              {
                name: "Free Sandbox",
                price: "0",
                desc: "Explore AI value forecasting and personal sandboxes.",
                features: ["1 Personal Workspace", "1 Business Organization", "Basic AI Studio Analysis", "Event Bus notifications", "CSV exports"],
              },
              {
                name: "Professional",
                price: isYearlyPricing ? "159" : "199",
                desc: "Ideal for growing teams tracking multi-initiative portfolios.",
                features: ["Unlimited Personal Workspaces", "3 Business Organizations", "Advanced explainable recommendations", "8-stage state machine integration", "SLA bottleneck analytics", "Priority Support"],
                popular: true,
              },
              {
                name: "Enterprise",
                price: isYearlyPricing ? "799" : "999",
                desc: "Fully compliant control for absolute security and auditability.",
                features: ["Unlimited Organizations & Seats", "Custom RBAC permission matrix", "Dedicated database instance (Supabase)", "Custom LLM provider registry integration", "Power BI & CSV stream sync", "Dedicated Success Director"],
              },
            ].map((plan, idx) => (
              <ScrollAnimate key={idx} delayMs={idx * 120}>
                <SpotlightCard
                  tiltEnabled={true}
                  spotlightColor={plan.popular ? "rgba(125, 167, 217, 0.18)" : "rgba(201, 168, 106, 0.12)"}
                  className={`p-7 rounded-2xl border relative flex flex-col justify-between h-full ${
                    plan.popular
                      ? "border-[#7DA7D9] bg-[#11151C]/95 ring-1 ring-[#7DA7D9]/30"
                      : "border-[#202630] bg-[#11151C]"
                  }`}
                >
                  {plan.popular && (
                    <>
                      <BorderBeam size={180} duration={12} colorFrom="#7DA7D9" colorTo="#C9A86A" />
                      <span className="absolute top-0 right-6 -translate-y-1/2 px-2.5 py-0.5 rounded-full bg-[#7DA7D9] text-[#0B0D11] text-[9px] font-bold uppercase tracking-wider">
                        Recommended
                      </span>
                    </>
                  )}

                  <div className="space-y-6">
                    <div className="space-y-2 text-xs">
                      <h3 className="font-bold text-[#F4F1EA] text-base">{plan.name}</h3>
                      <p className="text-[#8F98A8]">{plan.desc}</p>
                    </div>

                    <div className="flex items-baseline gap-1">
                      <span className="text-3xl font-extrabold text-[#F4F1EA] font-mono">${plan.price}</span>
                      <span className="text-[10px] text-[#8F98A8]">/month</span>
                    </div>

                    <div className="pt-4 border-t border-[#202630] space-y-2.5">
                      {plan.features.map((ft, i) => (
                        <div key={i} className="flex items-start gap-2 text-[11px] text-[#F4F1EA]">
                          <Check className="w-3.5 h-3.5 text-[#7DA7D9] shrink-0 mt-0.5" />
                          <span>{ft}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="mt-8">
                    <Link href={isSignedIn ? "/workspace-select" : "/sign-up"}>
                      <Button
                        variant={plan.popular ? "primary" : "secondary"}
                        className={`w-full text-xs font-bold py-2.5 cursor-pointer active:scale-[0.98] transition-all rounded-xl ${
                          plan.popular
                            ? "bg-[#7DA7D9] text-[#0B0D11] hover:bg-[#A5C3E8]"
                            : "bg-[#171C24] text-[#F4F1EA] border border-[#202630] hover:border-[#7DA7D9]/40"
                        }`}
                      >
                        {isSignedIn ? "Launch Console" : "Get Started"}
                      </Button>
                    </Link>
                  </div>
                </SpotlightCard>
              </ScrollAnimate>
            ))}
          </div>
        </div>
      </section>

      {/* Chapter 7: FAQ */}
      <section id="faq" className="py-24 border-t border-[#171C24] bg-[#0B0D11] relative z-10 transition-colors duration-300">
        <div className="max-w-3xl mx-auto px-6 space-y-12">
          <div className="text-center space-y-3">
            <span className="text-[10px] font-mono uppercase tracking-wider text-[#7DA7D9] font-bold">Frequently Asked</span>
            <h2 className="text-2xl sm:text-4xl font-extrabold tracking-tight text-[#F4F1EA]">
              Questions & Answers
            </h2>
          </div>

          <div className="space-y-4 text-xs">
            {faqs.map((faq, idx) => (
              <ScrollAnimate key={idx} delayMs={0}>
                <div className="rounded-xl border border-[#202630] bg-[#11151C] shadow-sm hover:border-[#7DA7D9]/30 transition-colors overflow-hidden">
                  <button
                    type="button"
                    onClick={() => setOpenFaqIndex(openFaqIndex === idx ? null : idx)}
                    className="w-full p-4 text-left font-bold text-[#F4F1EA] hover:bg-[#171C24] transition-colors flex items-center justify-between cursor-pointer"
                  >
                    <span>{faq.q}</span>
                    <ChevronDown className={`w-4 h-4 text-[#8F98A8] transition-transform duration-200 ${openFaqIndex === idx ? "rotate-180" : ""}`} />
                  </button>
                  {openFaqIndex === idx && (
                    <div className="p-4 border-t border-[#202630] bg-[#171C24]/50 text-[#8F98A8] leading-relaxed text-[11px] animate-in fade-in duration-150">
                      {faq.a}
                    </div>
                  )}
                </div>
              </ScrollAnimate>
            ))}
          </div>
        </div>
      </section>

      {/* Global Institutional Footer */}
      <footer className="border-t border-[#171C24] bg-[#0E1116] text-[#8F98A8] py-14 relative z-10">
        <div className="max-w-7xl mx-auto px-6 grid grid-cols-2 md:grid-cols-5 gap-8 text-xs">
          <div className="col-span-2 md:col-span-2 space-y-3.5">
            <div className="flex items-center gap-2.5">
              <div className="w-6 h-6 rounded bg-gradient-to-tr from-[#7DA7D9] to-[#4F759B] flex items-center justify-center">
                <span className="font-extrabold text-[10px] text-[#0B0D11]">V</span>
              </div>
              <span className="font-bold text-[#F4F1EA]">Value Intelligence</span>
            </div>
            <p className="text-[11px] leading-relaxed text-[#8F98A8] max-w-sm">
              Institutional decision intelligence for enterprise AI alignment, ROI modeling, and personal software capital management.
            </p>
            <div className="pt-2">
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-[#171C24] border border-[#202630] text-[10px] font-mono text-[#7DA7D9]">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                Security Enclave Active
              </span>
            </div>
          </div>

          <div className="space-y-2.5">
            <span className="font-bold text-[#F4F1EA] uppercase tracking-wider text-[10px] block font-mono">Platform</span>
            <Link href="/about" className="hover:text-[#F4F1EA] transition-colors block text-[11px]">About Platform</Link>
            <Link href="/workspace-select" className="hover:text-[#F4F1EA] transition-colors block text-[11px]">Workspaces</Link>
            <Link href="/personal" className="hover:text-[#F4F1EA] transition-colors block text-[11px]">Personal Suite</Link>
            <Link href="/contact" className="hover:text-[#F4F1EA] transition-colors block text-[11px]">Contact & Support</Link>
          </div>

          <div className="space-y-2.5">
            <span className="font-bold text-[#F4F1EA] uppercase tracking-wider text-[10px] block font-mono">Product</span>
            <a href="#problems" className="hover:text-[#F4F1EA] transition-colors block text-[11px]">Strategic Solutions</a>
            <a href="#tour" className="hover:text-[#F4F1EA] transition-colors block text-[11px]">Interactive Tour</a>
            <a href="#pricing" className="hover:text-[#F4F1EA] transition-colors block text-[11px]">Pricing Tiers</a>
            <a href="#faq" className="hover:text-[#F4F1EA] transition-colors block text-[11px]">Common Questions</a>
          </div>

          <div className="space-y-2.5">
            <span className="font-bold text-[#F4F1EA] uppercase tracking-wider text-[10px] block font-mono">Legal & Trust</span>
            <Link href="/privacy" className="hover:text-[#F4F1EA] transition-colors block text-[11px]">Privacy Policy</Link>
            <Link href="/terms" className="hover:text-[#F4F1EA] transition-colors block text-[11px]">Terms of Service</Link>
            <Link href="/terms" className="hover:text-[#F4F1EA] transition-colors block text-[11px]">Demo Data Disclosure</Link>
            <Link href="/privacy" className="hover:text-[#F4F1EA] transition-colors block text-[11px]">Security & Isolation</Link>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-6 pt-8 mt-8 border-t border-[#171C24] flex flex-col sm:flex-row items-center justify-between gap-4 text-[10px] text-[#8F98A8] font-mono">
          <div>
            © 2026 AI Initiative Value Intelligence. Institutional Decision Grade Platform.
          </div>
          <div className="text-[10px] text-[#8F98A8]/80 text-center sm:text-right">
            Financial connector operates in simulated demo mode. Projections are decision intelligence estimates.
          </div>
        </div>
      </footer>
    </div>
  );
}
