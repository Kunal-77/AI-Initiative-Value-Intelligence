"use client";

import { useEffect, useState, useMemo } from "react";
import { useAuth, useUser } from "@clerk/nextjs";
import {
  Layers,
  DollarSign,
  Cpu,
  Cloud,
  CreditCard,
  Plus,
  Calendar,
  TrendingUp,
  AlertTriangle,
  X,
  PlusCircle,
  Building2,
  Receipt,
  Sparkles,
  ShieldCheck,
  Zap,
  ArrowLeft,
  ArrowRight,
  Wallet,
} from "lucide-react";
import {
  AppHeader,
  Button,
  SkeletonMetricsRow,
  SkeletonCard,
  Skeleton,
  LazyViewport,
  TelemetryGridCanvas,
  ScrollProgressBar,
  SpotlightCard,
} from "@/components/ui";
import { SubscriptionOrbit } from "@/components/personal/SubscriptionOrbit";
import { ConnectAccountPanel } from "@/components/personal/ConnectAccountPanel";
import { CandidateReviewPanel } from "@/components/personal/CandidateReviewPanel";
import { TransactionExplorer } from "@/components/personal/TransactionExplorer";
import { SubscriptionLedger } from "@/components/personal/SubscriptionLedger";
import { RenewalTimelineCard } from "@/components/personal/RenewalTimelineCard";
import { SpendingInsightsCard } from "@/components/personal/SpendingInsightsCard";
import { AiUsageCard } from "@/components/personal/AiUsageCard";
import { PaymentMethodsCard } from "@/components/personal/PaymentMethodsCard";

import {
  getPersonalDashboard,
  getSubscriptions,
  getPaymentMethods,
  getCategories,
  getBankConnections,
  getSubscriptionCandidates,
  getBankTransactions,
  createBankConnection,
  syncBankConnection,
  deleteBankConnection,
  confirmCandidate,
  dismissCandidate,
  addSubscription,
  deleteSubscription,
  addPaymentMethod,
  addUsage,
} from "@/services/personal/personalService";

import {
  PersonalDashboard,
  Subscription,
  PaymentMethod,
  SubscriptionCategory,
  BankConnection,
  SubscriptionCandidate,
  BankTransaction,
} from "@/types/personal";

export default function PersonalWorkspacePage() {
  const { user, isLoaded: userLoaded } = useUser();
  const { getToken } = useAuth();

  useEffect(() => {
    document.title = "Personal Workspace | AIVI";
  }, []);

  // Core Data states
  const [dashboard, setDashboard] = useState<PersonalDashboard | null>(null);
  const [subscriptions, setSubscriptions] = useState<Subscription[]>([]);
  const [bankConnections, setBankConnections] = useState<BankConnection[]>([]);
  const [candidates, setCandidates] = useState<SubscriptionCandidate[]>([]);
  const [transactions, setTransactions] = useState<BankTransaction[]>([]);
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>([]);
  const [categories, setCategories] = useState<SubscriptionCategory[]>([]);

  // Loading & State flags
  const [loading, setLoading] = useState(true);
  const [isSyncing, setIsSyncing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Modals state
  const [isSubModalOpen, setIsSubModalOpen] = useState(false);
  const [isPmModalOpen, setIsPmModalOpen] = useState(false);
  const [isUsageModalOpen, setIsUsageModalOpen] = useState(false);
  const [hoveredCategory, setHoveredCategory] = useState<string | null>(null);

  // Add Subscription Form state
  const [subName, setSubName] = useState("");
  const [subCost, setSubCost] = useState("");
  const [subCycle, setSubCycle] = useState("MONTHLY");
  const [subCategory, setSubCategory] = useState("");
  const [subPaymentMethod, setSubPaymentMethod] = useState("");
  const [subType, setSubType] = useState("generic"); // generic, cloud, ai
  const [subFormError, setSubFormError] = useState<string | null>(null);
  const [subSubmitting, setSubSubmitting] = useState(false);

  // Cloud specific form state
  const [cloudProvider, setCloudProvider] = useState("AWS");
  const [cloudAccountId, setCloudAccountId] = useState("");
  const [cloudRegion, setCloudRegion] = useState("");
  const [cloudProjectId, setCloudProjectId] = useState("");

  // AI specific form state
  const [aiProvider, setAiProvider] = useState("OpenAI");
  const [aiModelPlan, setAiModelPlan] = useState("");
  const [aiSeatCount, setAiSeatCount] = useState("1");

  // Add Payment Method Form state
  const [pmStep, setPmStep] = useState<1 | 2>(1);
  const [pmType, setPmType] = useState("CREDIT_CARD");
  const [pmBrand, setPmBrand] = useState("Visa");
  const [pmLastFour, setPmLastFour] = useState("");
  const [pmExpiration, setPmExpiration] = useState("");
  const [pmBankName, setPmBankName] = useState("Chase Bank");
  const [pmAccountType, setPmAccountType] = useState("CHECKING");
  const [pmPaypalEmail, setPmPaypalEmail] = useState("");
  const [pmFormError, setPmFormError] = useState<string | null>(null);
  const [pmSubmitting, setPmSubmitting] = useState(false);

  // Global Escape key dismiss listener for active modals
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        if (isPmModalOpen) {
          setIsPmModalOpen(false);
          setPmStep(1);
        } else if (isSubModalOpen) {
          setIsSubModalOpen(false);
        } else if (isUsageModalOpen) {
          setIsUsageModalOpen(false);
        }
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isPmModalOpen, isSubModalOpen, isUsageModalOpen]);

  // Log Usage Form state
  const [usageSubId, setUsageSubId] = useState("");
  const [usageQuantity, setUsageQuantity] = useState("");
  const [usageUnit, setUsageUnit] = useState("API_CALLS");
  const [usageCost, setUsageCost] = useState("");
  const [usageDate, setUsageDate] = useState(new Date().toISOString().split("T")[0]);
  const [usageFormError, setUsageFormError] = useState<string | null>(null);
  const [usageSubmitting, setUsageSubmitting] = useState(false);

  // Comprehensive Data Loader
  const loadData = async () => {
    try {
      setLoading(true);
      setError(null);
      const token = await getToken();
      if (!token) {
        throw new Error("Authentication token not available. Please sign in again.");
      }

      const [dashRes, subsRes, connsRes, candsRes, txnsRes, pmRes, catRes] = await Promise.all([
        getPersonalDashboard(token).catch((err) => {
          console.error("Dashboard load failed:", err);
          return null;
        }),
        getSubscriptions(token).catch(() => []),
        getBankConnections(token).catch(() => []),
        getSubscriptionCandidates(token).catch(() => []),
        getBankTransactions(token).catch(() => []),
        getPaymentMethods(token).catch(() => []),
        getCategories(token).catch(() => []),
      ]);

      if (dashRes) setDashboard(dashRes);
      setSubscriptions(subsRes);
      setBankConnections(connsRes);
      setCandidates(candsRes);
      setTransactions(txnsRes);
      setPaymentMethods(pmRes);
      setCategories(catRes);

      if (catRes.length > 0 && !subCategory) {
        setSubCategory(catRes[0].id);
      }
    } catch (err: any) {
      console.error("Failed to load personal workspace:", err);
      setError(err.message || "Failed to load personal workspace data.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (userLoaded) {
      loadData();
    }
  }, [userLoaded]);

  // Handle Connect Simulated Account
  const handleConnectAccount = async () => {
    try {
      setIsSyncing(true);
      const token = await getToken();
      if (!token) throw new Error("Authentication failed.");

      const newConn = await createBankConnection(token, {
        provider: "SIMULATED",
        institution_name: "Sandbox Demo Bank",
        account_mask: "4821",
        account_type: "CHECKING",
      });

      // Auto-sync after connection
      await syncBankConnection(token, newConn.id);
      await loadData();
    } catch (err: any) {
      alert(err.message || "Failed to create simulated connection.");
    } finally {
      setIsSyncing(false);
    }
  };

  // Handle Sync Account
  const handleSyncAccount = async () => {
    const activeConn = bankConnections.find((c) => c.status !== "REVOKED");
    if (!activeConn) {
      handleConnectAccount();
      return;
    }

    try {
      setIsSyncing(true);
      const token = await getToken();
      if (!token) throw new Error("Authentication failed.");

      await syncBankConnection(token, activeConn.id);
      await loadData();
    } catch (err: any) {
      alert(err.message || "Failed to sync connection feed.");
    } finally {
      setIsSyncing(false);
    }
  };

  // Handle Disconnect Account
  const handleDisconnectAccount = async (connectionId: string) => {
    try {
      const token = await getToken();
      if (!token) throw new Error("Authentication failed.");

      await deleteBankConnection(token, connectionId);
      await loadData();
    } catch (err: any) {
      alert(err.message || "Failed to disconnect account.");
    }
  };

  // Handle Confirm Candidate
  const handleConfirmCandidate = async (candidateId: string) => {
    const token = await getToken();
    if (!token) throw new Error("Authentication failed.");

    await confirmCandidate(token, candidateId);
    await loadData();
  };

  // Handle Dismiss Candidate
  const handleDismissCandidate = async (candidateId: string) => {
    const token = await getToken();
    if (!token) throw new Error("Authentication failed.");

    await dismissCandidate(token, candidateId);
    setCandidates((prev) => prev.filter((c) => c.id !== candidateId));
  };

  // Handle Delete Subscription
  const handleDeleteSubscription = async (id: string) => {
    if (!confirm("Are you sure you want to cancel tracking for this subscription?")) {
      return;
    }

    try {
      const token = await getToken();
      if (!token) throw new Error("Authentication failed.");
      await deleteSubscription(token, id);
      await loadData();
    } catch (err: any) {
      alert(err.message || "Failed to delete subscription.");
    }
  };

  // Handle Add Subscription Submission
  const handleAddSubscription = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubFormError(null);
    setSubSubmitting(true);

    try {
      const token = await getToken();
      if (!token) throw new Error("Authentication failed.");

      const cost = parseFloat(subCost);
      if (isNaN(cost) || cost < 0) {
        throw new Error("Please enter a valid cost amount.");
      }

      const payload: any = {
        name: subName,
        billing_cycle: subCycle,
        cost_amount: cost,
        currency_code: "USD",
        category_id: subCategory || undefined,
        payment_method_id: subPaymentMethod || undefined,
        subscription_type: subType,
      };

      if (subType === "cloud") {
        payload.provider = cloudProvider;
        payload.account_identifier = cloudAccountId;
        payload.region = cloudRegion;
        payload.project_identifier = cloudProjectId;
      } else if (subType === "ai") {
        payload.provider = aiProvider;
        payload.model_plan = aiModelPlan;
        payload.seat_count = parseInt(aiSeatCount, 10) || 1;
      }

      await addSubscription(token, payload);
      setIsSubModalOpen(false);

      // Reset form
      setSubName("");
      setSubCost("");
      setSubCycle("MONTHLY");
      setSubType("generic");

      // Reload
      await loadData();
    } catch (err: any) {
      setSubFormError(err.message || "Failed to create subscription.");
    } finally {
      setSubSubmitting(false);
    }
  };

  // Handle Add Payment Method Submission
  const handleAddPaymentMethod = async (e: React.FormEvent) => {
    e.preventDefault();
    setPmFormError(null);
    setPmSubmitting(true);

    try {
      const token = await getToken();
      if (!token) throw new Error("Authentication failed.");

      let payload: any = {
        type: pmType,
      };

      if (pmType === "CREDIT_CARD") {
        if (pmLastFour.length !== 4) {
          throw new Error("Please provide a valid 4-digit card number.");
        }
        payload.card_brand = pmBrand;
        payload.last_four = pmLastFour;
        payload.expires_at = pmExpiration ? `${pmExpiration}-01` : undefined;
      } else if (pmType === "BANK_ACCOUNT") {
        if (pmLastFour.length !== 4) {
          throw new Error("Please provide the last 4 digits of the account.");
        }
        payload.card_brand = pmBankName || "Bank Account";
        payload.last_four = pmLastFour;
      } else if (pmType === "PAYPAL") {
        if (!pmPaypalEmail.trim()) {
          throw new Error("Please provide a PayPal billing email address.");
        }
        payload.card_brand = "PayPal";
        payload.last_four = pmPaypalEmail.includes("@") ? pmPaypalEmail.split("@")[0].slice(-4) : "PAYP";
      }

      await addPaymentMethod(token, payload);
      setIsPmModalOpen(false);
      setPmStep(1);

      // Reset
      setPmLastFour("");
      setPmExpiration("");
      setPmBankName("Chase Bank");
      setPmPaypalEmail("");

      await loadData();
    } catch (err: any) {
      setPmFormError(err.message || "Failed to add payment method.");
    } finally {
      setPmSubmitting(false);
    }
  };

  // Handle Log Usage Submission
  const handleAddUsage = async (e: React.FormEvent) => {
    e.preventDefault();
    setUsageFormError(null);
    setUsageSubmitting(true);

    try {
      const token = await getToken();
      if (!token) throw new Error("Authentication failed.");

      const qty = parseFloat(usageQuantity);
      const cost = parseFloat(usageCost);

      if (isNaN(qty) || qty <= 0) throw new Error("Please provide a valid quantity.");
      if (isNaN(cost) || cost < 0) throw new Error("Please provide a valid cost amount.");
      if (!usageSubId) throw new Error("Please select an active AI subscription.");

      await addUsage(token, {
        subscription_id: usageSubId,
        quantity: qty,
        unit: usageUnit,
        cost: cost,
        usage_date: usageDate,
      });

      setIsUsageModalOpen(false);
      setUsageQuantity("");
      setUsageCost("");

      await loadData();
    } catch (err: any) {
      setUsageFormError(err.message || "Failed to log API usage.");
    } finally {
      setUsageSubmitting(false);
    }
  };

  // Calculated Yearly Spending
  const estimatedYearlySpend = useMemo(() => {
    let yearly = 0;
    subscriptions.forEach((sub) => {
      if (sub.status === "ACTIVE") {
        if (sub.billingCycle === "ANNUAL") {
          yearly += sub.costAmount;
        } else {
          yearly += sub.costAmount * 12;
        }
      }
    });
    return yearly;
  }, [subscriptions]);

  // Orbit Category Data mapping
  const uiCategoryMetrics = useMemo(() => {
    const map: Record<string, { count: number; cost: number }> = {
      "AI & Productivity": { count: 0, cost: 0 },
      Entertainment: { count: 0, cost: 0 },
      Music: { count: 0, cost: 0 },
      "Cloud & Software": { count: 0, cost: 0 },
      Other: { count: 0, cost: 0 },
    };

    subscriptions.forEach((sub) => {
      if (sub.status !== "ACTIVE") return;
      const nameLower = sub.name.toLowerCase();
      let group = "Other";
      if (nameLower.includes("spotify") || nameLower.includes("music")) {
        group = "Music";
      } else if (
        sub.subscriptionType === "ai" ||
        sub.category?.name === "AI_TOOL" ||
        sub.category?.name === "PRODUCTIVITY"
      ) {
        group = "AI & Productivity";
      } else if (sub.subscriptionType === "cloud" || sub.category?.name === "CLOUD_SERVICE") {
        group = "Cloud & Software";
      } else if (sub.category?.name === "ENTERTAINMENT") {
        group = "Entertainment";
      }

      const amt = sub.costAmount;
      const monthlyAmt = sub.billingCycle === "ANNUAL" ? amt / 12 : amt;

      if (map[group]) {
        map[group].count += 1;
        map[group].cost += monthlyAmt;
      } else {
        map[group] = { count: 1, cost: monthlyAmt };
      }
    });

    return Object.keys(map).map((key) => ({
      name: key,
      count: map[key].count,
      monthlyCost: map[key].cost,
      colorClass: "",
      icon: Cpu,
    }));
  }, [subscriptions]);

  const activeBankConnection = bankConnections.find((c) => c.status !== "REVOKED") || null;

  if (!userLoaded) {
    return (
      <div className="min-h-screen bg-[#0B0D11] text-[#F4F1EA] flex flex-col font-sans">
        <AppHeader badge="Personal Workspace" />
        <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 py-12 flex flex-col gap-8">
          <div className="h-10 w-48 bg-[#171C24] rounded-lg animate-pulse" />
          <SkeletonMetricsRow />
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2">
              <SkeletonCard />
            </div>
            <div>
              <SkeletonCard />
            </div>
          </div>
        </main>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-[#0B0D11] text-[#F4F1EA] flex flex-col font-sans">
        <AppHeader badge="Personal Workspace" />
        <main className="flex-1 max-w-md w-full mx-auto px-6 py-24 flex flex-col items-center text-center gap-4">
          <AlertTriangle className="w-12 h-12 text-rose-500 animate-bounce" />
          <h2 className="text-xl font-bold tracking-tight text-[#F4F1EA]">Workspace Offline</h2>
          <p className="text-sm text-[#8F98A8]">{error}</p>
          <Button onClick={loadData} variant="primary" className="mt-4 bg-[#C9A86A] text-[#0B0D11]">
            Retry Connection
          </Button>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0B0D11] text-[#F4F1EA] flex flex-col font-sans relative overflow-hidden transition-colors selection:bg-[#7DA7D9]/30">
      {/* 2px Hairline Scroll Progress Bar */}
      <ScrollProgressBar />

      {/* Living 60fps Telemetry Particle Canvas */}
      <TelemetryGridCanvas particleCount={30} connectionDistance={110} speed={0.25} />

      {/* Subtle Dot Matrix Layer */}
      <div className="absolute inset-0 bg-dot-pattern opacity-30 pointer-events-none z-0" />

      <AppHeader
        showLink={true}
        badge="Personal Workspace"
        showOrgSwitcher={true}
        showUserButton={true}
      />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 py-8 flex flex-col gap-8 relative z-10">
        {/* Header Block */}
        <section className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 pb-4 border-b border-[#202630]">
          <div className="space-y-1">
            <div className="inline-flex items-center gap-2 px-2.5 py-0.5 rounded-md border border-[#202630] bg-[#11151C]">
              <span className="w-1.5 h-1.5 rounded-full bg-[#7DA7D9] animate-pulse" />
              <span className="font-mono text-[10px] text-[#7DA7D9] uppercase tracking-wider font-semibold">
                PERSONAL FINANCIAL INTELLIGENCE
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-[#F4F1EA]">
              Personal Workspace
            </h1>
            <p className="text-xs text-[#8F98A8]">
              Welcome back,{" "}
              <span className="font-semibold text-[#F4F1EA]">
                {user?.fullName || user?.primaryEmailAddress?.emailAddress}
              </span>
              . Manage your personal subscriptions, recurring commitments, and simulated statement feeds.
            </p>
          </div>

          <div className="flex flex-wrap gap-2.5 shrink-0">
            <Button
              onClick={() => setIsPmModalOpen(true)}
              variant="secondary"
              className="h-9 text-xs px-3.5 bg-[#171C24] text-[#F4F1EA] border border-[#202630] hover:border-[#7DA7D9]/40 rounded-lg active:scale-[0.98] transition-all cursor-pointer"
            >
              <CreditCard className="w-3.5 h-3.5 mr-1.5 text-[#7DA7D9]" /> Add Card
            </Button>
            <Button
              onClick={() => setIsSubModalOpen(true)}
              variant="primary"
              className="h-9 text-xs px-4 bg-[#C9A86A] text-[#0B0D11] hover:bg-[#D4B87D] font-semibold rounded-lg shadow-md active:scale-[0.98] transition-all cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5 mr-1.5" /> Register Subscription
            </Button>
          </div>
        </section>

        {/* 4 Bento KPI Metrics Row (Real DB Data) */}
        <section className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <SpotlightCard
            tiltEffect={true}
            spotlightColor="rgba(125, 167, 217, 0.15)"
            className="p-5 rounded-xl border-[#202630] bg-[#11151C] group"
          >
            <div className="flex flex-col justify-between h-full min-h-[110px]">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-mono font-bold text-[#8F98A8] uppercase tracking-wider">
                  Monthly Spending
                </span>
                <div className="p-2 rounded-lg bg-[#7DA7D9]/10 border border-[#7DA7D9]/20 text-[#7DA7D9]">
                  <DollarSign className="w-3.5 h-3.5" />
                </div>
              </div>
              <div className="space-y-1">
                <div className="text-2xl font-bold tracking-tight text-[#F4F1EA] font-mono">
                  {loading && !dashboard ? (
                    <Skeleton className="h-6 w-20" />
                  ) : (
                    `$${dashboard?.monthlySpend.toFixed(2) || "0.00"}`
                  )}
                </div>
                <div className="text-[10px] text-[#8F98A8]">Active recurring commitment</div>
              </div>
            </div>
          </SpotlightCard>

          <SpotlightCard
            tiltEffect={true}
            spotlightColor="rgba(201, 168, 106, 0.15)"
            className="p-5 rounded-xl border-[#202630] bg-[#11151C] group"
          >
            <div className="flex flex-col justify-between h-full min-h-[110px]">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-mono font-bold text-[#8F98A8] uppercase tracking-wider">
                  Estimated Yearly
                </span>
                <div className="p-2 rounded-lg bg-[#C9A86A]/10 border border-[#C9A86A]/20 text-[#C9A86A]">
                  <TrendingUp className="w-3.5 h-3.5" />
                </div>
              </div>
              <div className="space-y-1">
                <div className="text-2xl font-bold tracking-tight text-[#F4F1EA] font-mono">
                  {loading && !dashboard ? (
                    <Skeleton className="h-6 w-24" />
                  ) : (
                    `$${estimatedYearlySpend.toFixed(2)}`
                  )}
                </div>
                <div className="text-[10px] text-[#8F98A8]">Annual run-rate projection</div>
              </div>
            </div>
          </SpotlightCard>

          <SpotlightCard
            tiltEffect={true}
            spotlightColor="rgba(125, 167, 217, 0.15)"
            className="p-5 rounded-xl border-[#202630] bg-[#11151C] group"
          >
            <div className="flex flex-col justify-between h-full min-h-[110px]">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-mono font-bold text-[#8F98A8] uppercase tracking-wider">
                  Active Subscriptions
                </span>
                <div className="p-2 rounded-lg bg-[#7DA7D9]/10 border border-[#7DA7D9]/20 text-[#7DA7D9]">
                  <Layers className="w-3.5 h-3.5" />
                </div>
              </div>
              <div className="space-y-1">
                <div className="text-2xl font-bold tracking-tight text-[#F4F1EA] font-mono">
                  {loading && !dashboard ? (
                    <Skeleton className="h-6 w-8" />
                  ) : (
                    dashboard?.activeSubscriptionsCount ?? subscriptions.length
                  )}
                </div>
                <div className="text-[10px] text-[#8F98A8]">Tracked in verified database</div>
              </div>
            </div>
          </SpotlightCard>

          <SpotlightCard
            tiltEffect={true}
            spotlightColor="rgba(201, 168, 106, 0.15)"
            className="p-5 rounded-xl border-[#202630] bg-[#11151C] group"
          >
            <div className="flex flex-col justify-between h-full min-h-[110px]">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-mono font-bold text-[#8F98A8] uppercase tracking-wider">
                  30-Day Renewals
                </span>
                <div className="p-2 rounded-lg bg-[#C9A86A]/10 border border-[#C9A86A]/20 text-[#C9A86A]">
                  <Calendar className="w-3.5 h-3.5" />
                </div>
              </div>
              <div className="space-y-1">
                <div className="text-2xl font-bold tracking-tight text-[#F4F1EA] font-mono">
                  {loading && !dashboard ? (
                    <Skeleton className="h-6 w-8" />
                  ) : (
                    dashboard?.upcomingRenewals.length || 0
                  )}
                </div>
                <div className="text-[10px] text-[#8F98A8]">Charges in next 30 days</div>
              </div>
            </div>
          </SpotlightCard>
        </section>

        {/* 3D Subscription Orbit Visual Ecosystem */}
        <SpotlightCard
          tiltEffect={false}
          spotlightColor="rgba(125, 167, 217, 0.1)"
          className="rounded-xl p-6 relative overflow-hidden h-[440px] flex items-center justify-center border-[#202630] bg-[#11151C]"
        >
          <SubscriptionOrbit
            totalSpend={dashboard?.monthlySpend || 0}
            activeCount={dashboard?.activeSubscriptionsCount || subscriptions.length}
            categoryData={uiCategoryMetrics}
            onHoverCategory={(cat) => setHoveredCategory(cat)}
            hoveredCategory={hoveredCategory}
          />
        </SpotlightCard>

        {/* Candidate Review Staging Panel (When Candidates Exist) */}
        {candidates.length > 0 && (
          <CandidateReviewPanel
            candidates={candidates}
            onConfirm={handleConfirmCandidate}
            onDismiss={handleDismissCandidate}
            isProcessing={loading}
          />
        )}

        {/* Main 2-Column Responsive Bento Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Left Column (8 cols on desktop): Ledger, Transaction Explorer, Spending Insights */}
          <div className="lg:col-span-8 space-y-8">
            {/* 1. Subscription Intelligence Ledger */}
            <SubscriptionLedger
              subscriptions={subscriptions}
              renewals={dashboard?.upcomingRenewals || []}
              paymentMethods={paymentMethods}
              onAddClick={() => setIsSubModalOpen(true)}
              onDeleteClick={handleDeleteSubscription}
              loading={loading}
            />

            {/* 2. Ingested Transaction Explorer */}
            <TransactionExplorer transactions={transactions} loading={loading} />

            {/* 3. Spending Insights */}
            <SpendingInsightsCard
              subscriptions={subscriptions}
              renewals={dashboard?.upcomingRenewals || []}
              candidates={candidates}
              monthlySpend={dashboard?.monthlySpend || 0}
            />
          </div>

          {/* Right Column (4 cols on desktop): Connection Panel, Renewals, AI Usage, Payment Methods */}
          <div className="lg:col-span-4 space-y-8">
            {/* 1. Connection Panel */}
            <ConnectAccountPanel
              connection={activeBankConnection}
              transactionCount={transactions.length}
              isSyncing={isSyncing}
              onConnect={handleConnectAccount}
              onSync={handleSyncAccount}
              onDisconnect={handleDisconnectAccount}
            />

            {/* 2. Renewal Timeline (30 Days) */}
            <RenewalTimelineCard
              renewals={dashboard?.upcomingRenewals || []}
              subscriptions={subscriptions}
              loading={loading}
            />

            {/* 3. AI Token & Metered Consumption */}
            <AiUsageCard
              usageRecords={dashboard?.recentUsage || []}
              subscriptions={subscriptions}
              onLogClick={() => setIsUsageModalOpen(true)}
              loading={loading}
            />

            {/* 4. Payment Instruments Vault */}
            <PaymentMethodsCard
              paymentMethods={paymentMethods}
              onAddClick={() => setIsPmModalOpen(true)}
              loading={loading}
            />
          </div>
        </div>
      </main>

      {/* MODAL 1: REGISTER SUBSCRIPTION (Single-Step Form with Cancel + Primary) */}
      {isSubModalOpen && (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="sub-modal-title"
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-xs p-4 animate-in fade-in duration-200"
          onClick={(e) => {
            if (e.target === e.currentTarget) setIsSubModalOpen(false);
          }}
        >
          <div className="bg-[#11151C] border border-[#202630] w-full max-w-lg rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[88vh]">
            {/* Header */}
            <div className="px-6 py-4 border-b border-[#202630] flex items-center justify-between bg-[#171C24]/50">
              <div>
                <h3 id="sub-modal-title" className="text-sm font-bold text-[#F4F1EA]">
                  Register New Subscription
                </h3>
                <p className="text-[11px] text-[#8F98A8]">
                  Add a recurring software, AI, or cloud infrastructure commitment
                </p>
              </div>
              <button
                type="button"
                onClick={() => setIsSubModalOpen(false)}
                aria-label="Close modal"
                className="p-1.5 hover:bg-[#202630] rounded-lg text-[#8F98A8] hover:text-[#F4F1EA] transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Scrollable Form Body */}
            <form onSubmit={handleAddSubscription} className="flex-1 flex flex-col min-h-0 overflow-hidden">
              <div className="flex-1 overflow-y-auto p-6 space-y-4">
                {subFormError && (
                  <div className="p-3 bg-rose-500/10 border border-rose-500/20 text-rose-400 rounded-lg text-xs font-medium flex gap-2 items-center">
                    <AlertTriangle className="w-4 h-4 shrink-0" />
                    <span>{subFormError}</span>
                  </div>
                )}

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1.5 col-span-2">
                    <label className="text-[10px] font-mono uppercase tracking-wider text-[#8F98A8]">
                      Subscription Name <span className="text-rose-400">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. OpenAI Plus, AWS Personal Sandbox"
                      value={subName}
                      onChange={(e) => setSubName(e.target.value)}
                      className="w-full text-xs h-10 px-3 bg-[#0B0D11] border border-[#202630] rounded-lg text-[#F4F1EA] focus:outline-none focus:border-[#7DA7D9]"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-[10px] font-mono uppercase tracking-wider text-[#8F98A8]">Type</label>
                    <select
                      value={subType}
                      onChange={(e) => setSubType(e.target.value)}
                      className="w-full text-xs h-10 px-3 bg-[#0B0D11] border border-[#202630] rounded-lg text-[#F4F1EA] focus:outline-none focus:border-[#7DA7D9]"
                    >
                      <option value="generic">Generic SaaS</option>
                      <option value="cloud">Cloud Sandbox</option>
                      <option value="ai">Generative AI Tool</option>
                    </select>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-[10px] font-mono uppercase tracking-wider text-[#8F98A8]">Category</label>
                    <select
                      value={subCategory}
                      onChange={(e) => setSubCategory(e.target.value)}
                      className="w-full text-xs h-10 px-3 bg-[#0B0D11] border border-[#202630] rounded-lg text-[#F4F1EA] focus:outline-none focus:border-[#7DA7D9]"
                    >
                      {categories.map((c) => (
                        <option key={c.id} value={c.id}>
                          {c.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-[10px] font-mono uppercase tracking-wider text-[#8F98A8]">
                      Cost Amount (USD) <span className="text-rose-400">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="0.00"
                      value={subCost}
                      onChange={(e) => setSubCost(e.target.value)}
                      className="w-full text-xs h-10 px-3 bg-[#0B0D11] border border-[#202630] rounded-lg text-[#F4F1EA] font-mono focus:outline-none focus:border-[#7DA7D9]"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-[10px] font-mono uppercase tracking-wider text-[#8F98A8]">
                      Billing Cycle
                    </label>
                    <select
                      value={subCycle}
                      onChange={(e) => setSubCycle(e.target.value)}
                      className="w-full text-xs h-10 px-3 bg-[#0B0D11] border border-[#202630] rounded-lg text-[#F4F1EA] focus:outline-none focus:border-[#7DA7D9]"
                    >
                      <option value="MONTHLY">Monthly</option>
                      <option value="ANNUAL">Annual</option>
                    </select>
                  </div>

                  <div className="space-y-1.5 col-span-2">
                    <label className="text-[10px] font-mono uppercase tracking-wider text-[#8F98A8]">
                      Payment Instrument (Optional)
                    </label>
                    <select
                      value={subPaymentMethod}
                      onChange={(e) => setSubPaymentMethod(e.target.value)}
                      className="w-full text-xs h-10 px-3 bg-[#0B0D11] border border-[#202630] rounded-lg text-[#F4F1EA] focus:outline-none focus:border-[#7DA7D9]"
                    >
                      <option value="">None / Manual Invoice</option>
                      {paymentMethods.map((pm) => (
                        <option key={pm.id} value={pm.id}>
                          {pm.cardBrand} ending in {pm.lastFour}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Conditional Form Fields based on Type */}
                {subType === "cloud" && (
                  <div className="pt-4 border-t border-[#202630] space-y-3">
                    <span className="text-[10px] font-mono font-bold text-[#7DA7D9] uppercase tracking-wider block">
                      Cloud Configuration
                    </span>
                    <div className="grid grid-cols-2 gap-3">
                      <div className="space-y-1">
                        <label className="text-[10px] text-[#8F98A8]">Provider</label>
                        <select
                          value={cloudProvider}
                          onChange={(e) => setCloudProvider(e.target.value)}
                          className="w-full text-xs h-9 px-2.5 bg-[#0B0D11] border border-[#202630] rounded-lg text-[#F4F1EA]"
                        >
                          <option value="AWS">Amazon Web Services (AWS)</option>
                          <option value="GCP">Google Cloud Platform (GCP)</option>
                          <option value="AZURE">Microsoft Azure</option>
                        </select>
                      </div>

                      <div className="space-y-1">
                        <label className="text-[10px] text-[#8F98A8]">Account ID / Tenant</label>
                        <input
                          type="text"
                          placeholder="1234-5678-9012"
                          value={cloudAccountId}
                          onChange={(e) => setCloudAccountId(e.target.value)}
                          className="w-full text-xs h-9 px-2.5 bg-[#0B0D11] border border-[#202630] rounded-lg text-[#F4F1EA] font-mono"
                        />
                      </div>

                      <div className="space-y-1">
                        <label className="text-[10px] text-[#8F98A8]">Region (Optional)</label>
                        <input
                          type="text"
                          placeholder="us-east-1"
                          value={cloudRegion}
                          onChange={(e) => setCloudRegion(e.target.value)}
                          className="w-full text-xs h-9 px-2.5 bg-[#0B0D11] border border-[#202630] rounded-lg text-[#F4F1EA]"
                        />
                      </div>

                      <div className="space-y-1">
                        <label className="text-[10px] text-[#8F98A8]">Project Identifier</label>
                        <input
                          type="text"
                          placeholder="my-sandbox-project"
                          value={cloudProjectId}
                          onChange={(e) => setCloudProjectId(e.target.value)}
                          className="w-full text-xs h-9 px-2.5 bg-[#0B0D11] border border-[#202630] rounded-lg text-[#F4F1EA]"
                        />
                      </div>
                    </div>
                  </div>
                )}

                {subType === "ai" && (
                  <div className="pt-4 border-t border-[#202630] space-y-3">
                    <span className="text-[10px] font-mono font-bold text-[#C9A86A] uppercase tracking-wider block">
                      AI Tool Details
                    </span>
                    <div className="grid grid-cols-2 gap-3">
                      <div className="space-y-1">
                        <label className="text-[10px] text-[#8F98A8]">Provider / Engine</label>
                        <input
                          type="text"
                          placeholder="OpenAI, Anthropic, Midjourney"
                          value={aiProvider}
                          onChange={(e) => setAiProvider(e.target.value)}
                          className="w-full text-xs h-9 px-2.5 bg-[#0B0D11] border border-[#202630] rounded-lg text-[#F4F1EA]"
                        />
                      </div>

                      <div className="space-y-1">
                        <label className="text-[10px] text-[#8F98A8]">Plan Tier</label>
                        <input
                          type="text"
                          placeholder="ChatGPT Plus, Claude Pro"
                          value={aiModelPlan}
                          onChange={(e) => setAiModelPlan(e.target.value)}
                          className="w-full text-xs h-9 px-2.5 bg-[#0B0D11] border border-[#202630] rounded-lg text-[#F4F1EA]"
                        />
                      </div>

                      <div className="space-y-1 col-span-2">
                        <label className="text-[10px] text-[#8F98A8]">Seat Count</label>
                        <input
                          type="number"
                          min="1"
                          value={aiSeatCount}
                          onChange={(e) => setAiSeatCount(e.target.value)}
                          className="w-full text-xs h-9 px-2.5 bg-[#0B0D11] border border-[#202630] rounded-lg text-[#F4F1EA] font-mono"
                        />
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Fixed Footer */}
              <div className="border-t border-[#202630] px-6 py-4 bg-[#11151C] flex items-center justify-between gap-3 shrink-0">
                <Button type="button" variant="secondary" onClick={() => setIsSubModalOpen(false)}>
                  Cancel
                </Button>
                <Button
                  type="submit"
                  variant="primary"
                  loading={subSubmitting}
                  loadingText="Registering..."
                  className="bg-[#C9A86A] text-[#0B0D11] hover:bg-[#D4B87D] font-semibold px-5"
                >
                  Confirm Registration
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 2: ADD PAYMENT METHOD (2-Step Nested Wizard with Back Navigation) */}
      {isPmModalOpen && (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="pm-modal-title"
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-xs p-4 animate-in fade-in duration-200"
          onClick={(e) => {
            if (e.target === e.currentTarget) {
              setIsPmModalOpen(false);
              setPmStep(1);
            }
          }}
        >
          <div className="bg-[#11151C] border border-[#202630] w-full max-w-md rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[88vh]">
            {/* Header with Step Indicator and Back Button */}
            <div className="px-6 py-4 border-b border-[#202630] flex items-center justify-between bg-[#171C24]/50">
              <div className="flex items-center gap-3">
                {pmStep === 2 && (
                  <button
                    type="button"
                    onClick={() => setPmStep(1)}
                    className="p-1.5 hover:bg-[#202630] rounded-lg text-[#8F98A8] hover:text-[#F4F1EA] transition-colors cursor-pointer flex items-center gap-1 text-xs"
                    title="Back to Instrument Selection"
                  >
                    <ArrowLeft className="w-4 h-4" />
                  </button>
                )}
                <div>
                  <h3 id="pm-modal-title" className="text-sm font-bold text-[#F4F1EA]">
                    {pmStep === 1
                      ? "Add Payment Instrument"
                      : pmType === "CREDIT_CARD"
                      ? "Card Details"
                      : pmType === "BANK_ACCOUNT"
                      ? "Bank Account Details"
                      : "PayPal Account Details"}
                  </h3>
                  <p className="text-[11px] text-[#8F98A8]">
                    {pmStep === 1 ? "Step 1 of 2 — Select type" : "Step 2 of 2 — Enter instrument details"}
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => {
                  setIsPmModalOpen(false);
                  setPmStep(1);
                }}
                aria-label="Close modal"
                className="p-1.5 hover:bg-[#202630] rounded-lg text-[#8F98A8] hover:text-[#F4F1EA] transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Modal Body */}
            {pmStep === 1 ? (
              /* STEP 1: Instrument Type Selector */
              <div className="p-6 space-y-4">
                <p className="text-xs text-[#8F98A8]">
                  Select the financial instrument you want to tokenize for recurring subscriptions and AI usage:
                </p>

                <div className="space-y-3">
                  {/* Card Option 1: Credit / Debit Card */}
                  <div
                    onClick={() => {
                      setPmType("CREDIT_CARD");
                      setPmStep(2);
                    }}
                    className={`p-4 rounded-xl border transition-all duration-200 cursor-pointer flex items-center justify-between group ${
                      pmType === "CREDIT_CARD"
                        ? "bg-[#7DA7D9]/10 border-[#7DA7D9]/50 shadow-xs"
                        : "bg-[#0B0D11] border-[#202630] hover:border-[#7DA7D9]/30 hover:bg-[#171C24]/60"
                    }`}
                  >
                    <div className="flex items-center gap-3.5">
                      <div className="p-2.5 rounded-lg bg-[#7DA7D9]/15 text-[#7DA7D9] border border-[#7DA7D9]/25">
                        <CreditCard className="w-5 h-5" />
                      </div>
                      <div>
                        <span className="text-xs font-bold text-[#F4F1EA] block group-hover:text-[#7DA7D9] transition-colors">
                          Credit or Debit Card
                        </span>
                        <span className="text-[11px] text-[#8F98A8]">Visa, Mastercard, American Express</span>
                      </div>
                    </div>
                    <ArrowRight className="w-4 h-4 text-[#8F98A8] group-hover:text-[#7DA7D9] transition-transform group-hover:translate-x-0.5" />
                  </div>

                  {/* Card Option 2: Direct Bank Account */}
                  <div
                    onClick={() => {
                      setPmType("BANK_ACCOUNT");
                      setPmStep(2);
                    }}
                    className={`p-4 rounded-xl border transition-all duration-200 cursor-pointer flex items-center justify-between group ${
                      pmType === "BANK_ACCOUNT"
                        ? "bg-[#C9A86A]/10 border-[#C9A86A]/50 shadow-xs"
                        : "bg-[#0B0D11] border-[#202630] hover:border-[#C9A86A]/30 hover:bg-[#171C24]/60"
                    }`}
                  >
                    <div className="flex items-center gap-3.5">
                      <div className="p-2.5 rounded-lg bg-[#C9A86A]/15 text-[#C9A86A] border border-[#C9A86A]/25">
                        <Building2 className="w-5 h-5" />
                      </div>
                      <div>
                        <span className="text-xs font-bold text-[#F4F1EA] block group-hover:text-[#C9A86A] transition-colors">
                          Direct Bank Account
                        </span>
                        <span className="text-[11px] text-[#8F98A8]">Checking or Savings account via ACH</span>
                      </div>
                    </div>
                    <ArrowRight className="w-4 h-4 text-[#8F98A8] group-hover:text-[#C9A86A] transition-transform group-hover:translate-x-0.5" />
                  </div>

                  {/* Card Option 3: PayPal / Digital Wallet */}
                  <div
                    onClick={() => {
                      setPmType("PAYPAL");
                      setPmStep(2);
                    }}
                    className={`p-4 rounded-xl border transition-all duration-200 cursor-pointer flex items-center justify-between group ${
                      pmType === "PAYPAL"
                        ? "bg-emerald-500/10 border-emerald-500/50 shadow-xs"
                        : "bg-[#0B0D11] border-[#202630] hover:border-emerald-500/30 hover:bg-[#171C24]/60"
                    }`}
                  >
                    <div className="flex items-center gap-3.5">
                      <div className="p-2.5 rounded-lg bg-emerald-500/15 text-emerald-400 border border-emerald-500/25">
                        <Wallet className="w-5 h-5" />
                      </div>
                      <div>
                        <span className="text-xs font-bold text-[#F4F1EA] block group-hover:text-emerald-400 transition-colors">
                          PayPal / Digital Wallet
                        </span>
                        <span className="text-[11px] text-[#8F98A8]">Instant billing account authorization</span>
                      </div>
                    </div>
                    <ArrowRight className="w-4 h-4 text-[#8F98A8] group-hover:text-emerald-400 transition-transform group-hover:translate-x-0.5" />
                  </div>
                </div>

                {/* Footer for Step 1 */}
                <div className="border-t border-[#202630] pt-4 flex items-center justify-between">
                  <Button
                    type="button"
                    variant="secondary"
                    onClick={() => {
                      setIsPmModalOpen(false);
                      setPmStep(1);
                    }}
                  >
                    Cancel
                  </Button>
                  <Button
                    type="button"
                    variant="primary"
                    onClick={() => setPmStep(2)}
                    className="bg-[#C9A86A] text-[#0B0D11] hover:bg-[#D4B87D] font-semibold"
                  >
                    Continue
                    <ArrowRight className="w-3.5 h-3.5 ml-1.5" />
                  </Button>
                </div>
              </div>
            ) : (
              /* STEP 2: Instrument Form Details */
              <form onSubmit={handleAddPaymentMethod} className="flex-1 flex flex-col min-h-0 overflow-hidden">
                <div className="flex-1 overflow-y-auto p-6 space-y-4">
                  {pmFormError && (
                    <div className="p-3 bg-rose-500/10 border border-rose-500/20 text-rose-400 rounded-lg text-xs font-medium flex gap-2 items-center">
                      <AlertTriangle className="w-4 h-4 shrink-0" />
                      <span>{pmFormError}</span>
                    </div>
                  )}

                  {/* Credit Card Fields */}
                  {pmType === "CREDIT_CARD" && (
                    <>
                      <div className="space-y-1.5">
                        <label className="text-[10px] font-mono uppercase tracking-wider text-[#8F98A8]">
                          Card Network / Brand
                        </label>
                        <select
                          value={pmBrand}
                          onChange={(e) => setPmBrand(e.target.value)}
                          className="w-full text-xs h-10 px-3 bg-[#0B0D11] border border-[#202630] rounded-lg text-[#F4F1EA] focus:outline-none focus:border-[#7DA7D9]"
                        >
                          <option value="Visa">Visa</option>
                          <option value="Mastercard">Mastercard</option>
                          <option value="American Express">American Express</option>
                        </select>
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-1.5">
                          <label className="text-[10px] font-mono uppercase tracking-wider text-[#8F98A8]">
                            Last 4 Digits <span className="text-rose-400">*</span>
                          </label>
                          <input
                            type="text"
                            maxLength={4}
                            required
                            placeholder="4242"
                            value={pmLastFour}
                            onChange={(e) => setPmLastFour(e.target.value.replace(/\D/g, ""))}
                            className="w-full text-xs h-10 px-3 bg-[#0B0D11] border border-[#202630] rounded-lg text-[#F4F1EA] font-mono focus:outline-none focus:border-[#7DA7D9]"
                          />
                        </div>

                        <div className="space-y-1.5">
                          <label className="text-[10px] font-mono uppercase tracking-wider text-[#8F98A8]">
                            Expiry (YYYY-MM)
                          </label>
                          <input
                            type="text"
                            placeholder="2030-12"
                            value={pmExpiration}
                            onChange={(e) => setPmExpiration(e.target.value)}
                            className="w-full text-xs h-10 px-3 bg-[#0B0D11] border border-[#202630] rounded-lg text-[#F4F1EA] font-mono focus:outline-none focus:border-[#7DA7D9]"
                          />
                        </div>
                      </div>
                    </>
                  )}

                  {/* Bank Account Fields */}
                  {pmType === "BANK_ACCOUNT" && (
                    <>
                      <div className="space-y-1.5">
                        <label className="text-[10px] font-mono uppercase tracking-wider text-[#8F98A8]">
                          Financial Institution
                        </label>
                        <input
                          type="text"
                          required
                          placeholder="e.g. Chase, Wells Fargo, SVB"
                          value={pmBankName}
                          onChange={(e) => setPmBankName(e.target.value)}
                          className="w-full text-xs h-10 px-3 bg-[#0B0D11] border border-[#202630] rounded-lg text-[#F4F1EA] focus:outline-none focus:border-[#C9A86A]"
                        />
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-1.5">
                          <label className="text-[10px] font-mono uppercase tracking-wider text-[#8F98A8]">
                            Account Type
                          </label>
                          <select
                            value={pmAccountType}
                            onChange={(e) => setPmAccountType(e.target.value)}
                            className="w-full text-xs h-10 px-3 bg-[#0B0D11] border border-[#202630] rounded-lg text-[#F4F1EA] focus:outline-none focus:border-[#C9A86A]"
                          >
                            <option value="CHECKING">Checking</option>
                            <option value="SAVINGS">Savings</option>
                          </select>
                        </div>

                        <div className="space-y-1.5">
                          <label className="text-[10px] font-mono uppercase tracking-wider text-[#8F98A8]">
                            Last 4 Digits <span className="text-rose-400">*</span>
                          </label>
                          <input
                            type="text"
                            maxLength={4}
                            required
                            placeholder="9821"
                            value={pmLastFour}
                            onChange={(e) => setPmLastFour(e.target.value.replace(/\D/g, ""))}
                            className="w-full text-xs h-10 px-3 bg-[#0B0D11] border border-[#202630] rounded-lg text-[#F4F1EA] font-mono focus:outline-none focus:border-[#C9A86A]"
                          />
                        </div>
                      </div>
                    </>
                  )}

                  {/* PayPal Fields */}
                  {pmType === "PAYPAL" && (
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-mono uppercase tracking-wider text-[#8F98A8]">
                        PayPal Account Email <span className="text-rose-400">*</span>
                      </label>
                      <input
                        type="email"
                        required
                        placeholder="billing@company.com"
                        value={pmPaypalEmail}
                        onChange={(e) => setPmPaypalEmail(e.target.value)}
                        className="w-full text-xs h-10 px-3 bg-[#0B0D11] border border-[#202630] rounded-lg text-[#F4F1EA] focus:outline-none focus:border-emerald-500"
                      />
                    </div>
                  )}
                </div>

                {/* Fixed Footer for Step 2 with Back + Cancel + Save */}
                <div className="border-t border-[#202630] px-6 py-4 bg-[#11151C] flex items-center justify-between gap-3 shrink-0">
                  <Button
                    type="button"
                    variant="secondary"
                    onClick={() => setPmStep(1)}
                    className="text-xs"
                  >
                    <ArrowLeft className="w-3.5 h-3.5 mr-1" />
                    Back
                  </Button>

                  <div className="flex items-center gap-2.5">
                    <Button
                      type="button"
                      variant="secondary"
                      onClick={() => {
                        setIsPmModalOpen(false);
                        setPmStep(1);
                      }}
                    >
                      Cancel
                    </Button>
                    <Button
                      type="submit"
                      variant="primary"
                      loading={pmSubmitting}
                      loadingText="Saving..."
                      className="bg-[#C9A86A] text-[#0B0D11] hover:bg-[#D4B87D] font-semibold px-4"
                    >
                      Save Instrument
                    </Button>
                  </div>
                </div>
              </form>
            )}
          </div>
        </div>
      )}

      {/* MODAL 3: LOG API CONSUMPTION (Single-Step Form with Cancel + Primary) */}
      {isUsageModalOpen && (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="usage-modal-title"
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-xs p-4 animate-in fade-in duration-200"
          onClick={(e) => {
            if (e.target === e.currentTarget) setIsUsageModalOpen(false);
          }}
        >
          <div className="bg-[#11151C] border border-[#202630] w-full max-w-sm rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[88vh]">
            {/* Header */}
            <div className="px-6 py-4 border-b border-[#202630] flex items-center justify-between bg-[#171C24]/50">
              <div>
                <h3 id="usage-modal-title" className="text-sm font-bold text-[#F4F1EA]">
                  Log API Consumption
                </h3>
                <p className="text-[11px] text-[#8F98A8]">Record metered token or invocation expense</p>
              </div>
              <button
                type="button"
                onClick={() => setIsUsageModalOpen(false)}
                aria-label="Close modal"
                className="p-1.5 hover:bg-[#202630] rounded-lg text-[#8F98A8] hover:text-[#F4F1EA] transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Scrollable Form Body */}
            <form onSubmit={handleAddUsage} className="flex-1 flex flex-col min-h-0 overflow-hidden">
              <div className="flex-1 overflow-y-auto p-6 space-y-4">
                {usageFormError && (
                  <div className="p-3 bg-rose-500/10 border border-rose-500/20 text-rose-400 rounded-lg text-xs font-medium flex gap-2 items-center">
                    <AlertTriangle className="w-4 h-4 shrink-0" />
                    <span>{usageFormError}</span>
                  </div>
                )}

                <div className="space-y-1.5">
                  <label className="text-[10px] font-mono uppercase tracking-wider text-[#8F98A8]">
                    Select AI Tool <span className="text-rose-400">*</span>
                  </label>
                  <select
                    value={usageSubId}
                    onChange={(e) => setUsageSubId(e.target.value)}
                    className="w-full text-xs h-10 px-3 bg-[#0B0D11] border border-[#202630] rounded-lg text-[#F4F1EA] focus:outline-none focus:border-[#7DA7D9]"
                  >
                    {subscriptions
                      .filter((s) => s.subscriptionType === "ai")
                      .map((s) => (
                        <option key={s.id} value={s.id}>
                          {s.name} ({s.provider})
                        </option>
                      ))}
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="text-[10px] font-mono uppercase tracking-wider text-[#8F98A8]">
                    Usage Date <span className="text-rose-400">*</span>
                  </label>
                  <input
                    type="date"
                    required
                    value={usageDate}
                    onChange={(e) => setUsageDate(e.target.value)}
                    className="w-full text-xs h-10 px-3 bg-[#0B0D11] border border-[#202630] rounded-lg text-[#F4F1EA] font-mono focus:outline-none focus:border-[#7DA7D9]"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-mono uppercase tracking-wider text-[#8F98A8]">
                      Quantity <span className="text-rose-400">*</span>
                    </label>
                    <input
                      type="number"
                      min="1"
                      required
                      placeholder="150"
                      value={usageQuantity}
                      onChange={(e) => setUsageQuantity(e.target.value)}
                      className="w-full text-xs h-10 px-3 bg-[#0B0D11] border border-[#202630] rounded-lg text-[#F4F1EA] font-mono focus:outline-none focus:border-[#7DA7D9]"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-[10px] font-mono uppercase tracking-wider text-[#8F98A8]">Unit</label>
                    <input
                      type="text"
                      required
                      placeholder="API_CALLS, Tokens"
                      value={usageUnit}
                      onChange={(e) => setUsageUnit(e.target.value)}
                      className="w-full text-xs h-10 px-3 bg-[#0B0D11] border border-[#202630] rounded-lg text-[#F4F1EA] focus:outline-none focus:border-[#7DA7D9]"
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-[10px] font-mono uppercase tracking-wider text-[#8F98A8]">
                    Calculated Cost (USD) <span className="text-rose-400">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="1.50"
                    value={usageCost}
                    onChange={(e) => setUsageCost(e.target.value)}
                    className="w-full text-xs h-10 px-3 bg-[#0B0D11] border border-[#202630] rounded-lg text-[#F4F1EA] font-mono focus:outline-none focus:border-[#7DA7D9]"
                  />
                </div>
              </div>

              {/* Fixed Footer */}
              <div className="border-t border-[#202630] px-6 py-4 bg-[#11151C] flex items-center justify-between gap-3 shrink-0">
                <Button type="button" variant="secondary" onClick={() => setIsUsageModalOpen(false)}>
                  Cancel
                </Button>
                <Button
                  type="submit"
                  variant="primary"
                  loading={usageSubmitting}
                  loadingText="Logging..."
                  className="bg-[#C9A86A] text-[#0B0D11] hover:bg-[#D4B87D] font-semibold px-5"
                >
                  Log Usage
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
