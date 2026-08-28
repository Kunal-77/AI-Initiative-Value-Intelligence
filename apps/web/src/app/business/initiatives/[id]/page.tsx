"use client";

import { useState, useEffect, use, Suspense, useRef } from "react";
import { useAuth, useOrganization } from "@clerk/nextjs";
import Link from "@/compat/link";
import { useRouter } from "@/compat/navigation";
import {
  Button,
  Badge,
  ErrorBanner,
  LoadingState,
  EmptyState,
  Label,
  Card,
  Input,
  Select,
  AppHeader,
  InitiativeActivityTimeline,
  InitiativeStatusManager,
  InitiativeLifecycleState,
  UnifiedLifecycleBar,
  CrossModuleNav,
  ContextSidebarPanel,
} from "@/components/ui";
import { MOCK_AUDIT_EVENTS, MOCK_MILESTONES, MOCK_AI_RECOMMENDATIONS } from "@/lib/mockData";
import {
  InitiativeModel,
  getInitiativeById,
  updateCanonicalInitiative,
  addInvestmentCostItem,
} from "@/lib/initiativeStore";
import { ShieldCheck, Target, Calendar, Users, FileText, Sparkles, ArrowLeft, DollarSign } from "lucide-react";

interface PageProps {
  params: Promise<{ id: string }>;
}

export default function InitiativeDetailPage(props: PageProps) {
  return (
    <Suspense fallback={<LoadingState message="Loading initiative workspace..." />}>
      <InitiativeDetailContent {...props} />
    </Suspense>
  );
}

function InitiativeDetailContent({ params }: PageProps) {
  const resolvedParams = use(params);
  const initiativeId = resolvedParams.id;

  const { getToken, orgId } = useAuth();
  const router = useRouter();

  const isMountedRef = useRef(true);
  useEffect(() => {
    isMountedRef.current = true;
    return () => {
      isMountedRef.current = false;
    };
  }, []);

  const [initiative, setInitiative] = useState<InitiativeModel | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Active Tab
  const [activeTab, setActiveTab] = useState<"overview" | "business_case" | "financials" | "timeline" | "audit">("overview");

  // Form State - Add Cost
  const [costCategory, setCostCategory] = useState("SOFTWARE");
  const [costType, setCostType] = useState("PLANNED");
  const [costAmount, setCostAmount] = useState("");
  const [addingCost, setAddingCost] = useState(false);

  const loadData = async () => {
    if (!orgId) return;
    if (isMountedRef.current) setLoading(true);
    if (isMountedRef.current) setError(null);

    try {
      const token = await getToken();
      if (!token) throw new Error("No session token available.");
      const stored = await getInitiativeById(token, initiativeId);
      if (stored) {
        setInitiative(stored);
      } else {
        setError(`Initiative with ID "${initiativeId}" not found.`);
      }
    } catch (err: any) {
      console.error(err);
      if (isMountedRef.current) setError(err.message || "An error occurred loading initiative.");
    } finally {
      if (isMountedRef.current) setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [orgId, initiativeId]);

  const handleStatusTransition = async (newState: InitiativeLifecycleState) => {
    if (!initiative) return;
    try {
      const token = await getToken();
      if (!token) throw new Error("No session token available.");
      const updated = await updateCanonicalInitiative(token, initiative.id, { status: newState as any });
      if (updated) setInitiative(updated);
    } catch (err: any) {
      alert(err.message || "Failed to transition state.");
    }
  };

  const handleAddCost = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!costAmount || !initiative) return;
    setAddingCost(true);

    try {
      const token = await getToken();
      if (!token) throw new Error("No session token available.");
      await addInvestmentCostItem(token, initiative.id, {
        category: costCategory,
        value_type: costType,
        amount: Number(costAmount),
        currency: initiative.currency || "USD",
      });
      await loadData();
      setCostAmount("");
    } catch (err: any) {
      alert(err.message || "Failed to add cost item.");
    } finally {
      setAddingCost(false);
    }
  };

  if (!orgId || loading) {
    return <LoadingState message="Loading initiative workspace..." />;
  }

  if (error || !initiative) {
    return (
      <div className="min-h-screen bg-background text-foreground flex flex-col items-center justify-center p-6 text-center max-w-md mx-auto">
        <h1 className="text-xl font-bold mb-2">Initiative Not Found</h1>
        <p className="text-sm text-muted-foreground mb-6">{error || "Initiative does not exist."}</p>
        <Link href="/business/initiatives" className="text-sm text-accent font-medium hover:underline">
          ← Back to Initiatives Directory
        </Link>
      </div>
    );
  }

  const formattedBudget = `$${Number(initiative.plannedBudget || 0).toLocaleString()} ${initiative.currency || "USD"}`;

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col font-sans transition-colors">
      <AppHeader badge="Initiative Workspace" />

      <main className="flex-1 max-w-[1536px] w-full mx-auto px-4 sm:px-6 py-8 space-y-6">
        {/* Phase 7: Unified Lifecycle Navigation Bar */}
        <UnifiedLifecycleBar activeStep="initiative" />

        {/* Top Header & Navigation */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-border">
          <div className="space-y-1">
            <Link
              href="/business/initiatives"
              className="text-xs text-muted-foreground hover:text-foreground inline-flex items-center gap-1 mb-1"
            >
              <ArrowLeft className="w-3 h-3" /> Back to Initiatives Directory
            </Link>
            <div className="flex items-center gap-3">
              <h1 className="text-2xl font-bold tracking-tight text-foreground">{initiative.name}</h1>
              <Badge variant={initiative.status as any}>{initiative.status}</Badge>
            </div>
            <p className="text-xs text-muted-foreground">
              Business Area: <span className="font-semibold text-foreground">{initiative.businessArea}</span> • Owner: <span className="font-semibold text-foreground">{initiative.owner}</span>
            </p>
          </div>

          <InitiativeStatusManager
            currentStatus={initiative.status as InitiativeLifecycleState}
            onStatusChange={handleStatusTransition}
          />
        </div>

        {/* Phase 7: Contextual Cross-Module Navigation Bar */}
        <CrossModuleNav />

        {/* Section Tabs */}
        <div className="flex border-b border-border gap-2">
          {[
            { id: "overview", label: "Overview & Objectives" },
            { id: "business_case", label: "Business Case & Risk" },
            { id: "financials", label: "Financial Ledger & Costs" },
            { id: "timeline", label: "Milestones & Gates" },
            { id: "audit", label: "Activity Audit Stream" },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`px-4 py-2 text-xs font-bold border-b-2 -mb-px transition-colors ${
                activeTab === tab.id
                  ? "border-accent text-accent"
                  : "border-transparent text-muted-foreground hover:text-foreground"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Tab 1: Overview */}
        {activeTab === "overview" && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 space-y-6">
              <Card className="p-6 space-y-4">
                <h3 className="text-sm font-bold text-foreground flex items-center gap-2">
                  <Target className="w-4 h-4 text-accent" /> Strategic Problem & AI Intervention
                </h3>
                <div className="space-y-3 text-xs">
                  <div>
                    <span className="font-semibold text-muted-foreground block uppercase text-[10px] tracking-wider">Problem Statement</span>
                    <p className="text-foreground leading-relaxed mt-1">{initiative.problemStatement}</p>
                  </div>
                  <div>
                    <span className="font-semibold text-muted-foreground block uppercase text-[10px] tracking-wider">Proposed AI Intervention</span>
                    <p className="text-foreground leading-relaxed mt-1">{initiative.aiIntervention}</p>
                  </div>
                </div>
              </Card>

              <Card className="p-6 space-y-4">
                <h3 className="text-sm font-bold text-foreground flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-accent" /> Success Metrics & Target Improvement
                </h3>
                <div className="grid grid-cols-2 gap-4 text-xs">
                  <div className="p-3 rounded-lg bg-secondary/30 border border-border">
                    <span className="text-muted-foreground text-[10px] uppercase font-bold block">Primary Target Metric</span>
                    <span className="font-bold text-foreground text-sm">{initiative.targetMetric}</span>
                  </div>
                  <div className="p-3 rounded-lg bg-secondary/30 border border-border">
                    <span className="text-muted-foreground text-[10px] uppercase font-bold block">Target Improvement</span>
                    <span className="font-bold text-emerald-500 text-sm">{initiative.targetImprovement}</span>
                  </div>
                </div>
              </Card>
            </div>

            <div className="space-y-6">
              <ContextSidebarPanel />

              <Card className="p-6 space-y-4">
                <h3 className="text-sm font-bold text-foreground flex items-center gap-2">
                  <Users className="w-4 h-4 text-accent" /> Key Stakeholders
                </h3>
                <div className="space-y-2 text-xs">
                  <div className="flex justify-between py-1 border-b border-border">
                    <span className="text-muted-foreground">Executive Sponsor:</span>
                    <span className="font-medium text-foreground">{initiative.executiveSponsor}</span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-border">
                    <span className="text-muted-foreground">Primary Owner:</span>
                    <span className="font-medium text-foreground">{initiative.owner}</span>
                  </div>
                  <div className="flex justify-between py-1">
                    <span className="text-muted-foreground">Project Lead:</span>
                    <span className="font-medium text-foreground">{initiative.projectLead}</span>
                  </div>
                </div>
              </Card>

              <Card className="p-6 space-y-3">
                <span className="text-xs text-muted-foreground uppercase font-bold">Planned Budget Allocation</span>
                <p className="text-2xl font-extrabold font-mono text-foreground">{formattedBudget}</p>
                <span className="text-[11px] text-muted-foreground">Value Impact: {initiative.valueImpact}</span>
              </Card>
            </div>
          </div>
        )}

        {/* Tab 2: Business Case */}
        {activeTab === "business_case" && (
          <Card className="p-6 space-y-6">
            <h3 className="text-sm font-bold text-foreground flex items-center gap-2">
              <FileText className="w-4 h-4 text-accent" /> Executive Business Case & Dependencies
            </h3>
            <div className="space-y-4 text-xs">
              <div>
                <span className="font-bold text-muted-foreground uppercase text-[10px]">Expected Business Outcome</span>
                <p className="text-foreground leading-relaxed mt-1">{initiative.expectedBusinessOutcome}</p>
              </div>
              <div className="p-4 rounded-lg bg-secondary/30 border border-border space-y-2">
                <span className="font-bold text-foreground">Risk & Security Assessment</span>
                <p className="text-muted-foreground leading-relaxed">
                  Requires SOC2 compliance validation for PII data masking prior to production model deployment.
                </p>
              </div>
            </div>
          </Card>
        )}

        {/* Tab 3: Financials */}
        {activeTab === "financials" && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <Card className="p-5 space-y-1">
                <span className="text-xs text-muted-foreground font-semibold uppercase">Planned Budget</span>
                <p className="text-2xl font-extrabold font-mono text-foreground">{formattedBudget}</p>
              </Card>
              <Card className="p-5 space-y-1">
                <span className="text-xs text-muted-foreground font-semibold uppercase">Value Impact</span>
                <p className="text-2xl font-extrabold font-mono text-emerald-500">{initiative.valueImpact}</p>
              </Card>
              <Card className="p-5 space-y-1">
                <span className="text-xs text-muted-foreground font-semibold uppercase">Portfolio Health</span>
                <p className="text-2xl font-extrabold font-mono text-accent">{initiative.health}</p>
              </Card>
            </div>

            <form onSubmit={handleAddCost} className="p-5 rounded-xl border border-border bg-card space-y-4">
              <h4 className="text-xs font-bold uppercase text-muted-foreground">Add Cost Line Item</h4>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
                <div>
                  <Label>Category</Label>
                  <Select value={costCategory} onChange={(e) => setCostCategory(e.target.value)}>
                    <option value="SOFTWARE">GPU & Software License</option>
                    <option value="INFRASTRUCTURE">Cloud Infrastructure</option>
                    <option value="LABOR">Engineering Staffing</option>
                  </Select>
                </div>
                <div>
                  <Label>Value Type</Label>
                  <Select value={costType} onChange={(e) => setCostType(e.target.value)}>
                    <option value="PLANNED">Planned Budget</option>
                    <option value="ACTUAL">Realized Actual Cost</option>
                  </Select>
                </div>
                <div>
                  <Label required>Amount (USD)</Label>
                  <Input
                    type="number"
                    value={costAmount}
                    onChange={(e) => setCostAmount(e.target.value)}
                    placeholder="12000.00"
                    required
                  />
                </div>
              </div>
              <div className="flex justify-end">
                <Button type="submit" loading={addingCost} variant="primary" className="text-xs">
                  Add Cost Item
                </Button>
              </div>
            </form>
          </div>
        )}

        {/* Tab 4: Timeline & Milestones */}
        {activeTab === "timeline" && (
          <Card className="p-6 space-y-4">
            <h3 className="text-sm font-bold text-foreground flex items-center gap-2">
              <Calendar className="w-4 h-4 text-accent" /> Decision Gates & Milestones
            </h3>
            <div className="space-y-3">
              {MOCK_MILESTONES.map((ms) => (
                <div key={ms.id} className="p-3 rounded-lg bg-secondary/30 border border-border flex justify-between items-center text-xs">
                  <div>
                    <p className="font-bold text-foreground">{ms.title}</p>
                    <p className="text-muted-foreground text-[10px]">Owner: {ms.owner} • Due {ms.dueDate}</p>
                  </div>
                  <Badge variant="info">{ms.status}</Badge>
                </div>
              ))}
            </div>
          </Card>
        )}

        {/* Tab 5: Audit Stream */}
        {activeTab === "audit" && (
          <InitiativeActivityTimeline events={MOCK_AUDIT_EVENTS} />
        )}
      </main>
    </div>
  );
}
