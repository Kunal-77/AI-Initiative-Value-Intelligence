"use client";

import { useEffect, useState } from "react";
import { useAuth, useUser } from "@clerk/nextjs";
import {
  Layers,
  DollarSign,
  Cpu,
  Cloud,
  CreditCard,
  Plus,
  Trash2,
  Calendar,
  TrendingUp,
  AlertTriangle,
  X,
  PlusCircle,
  HelpCircle,
} from "lucide-react";
import { AppHeader, Button, SkeletonMetricsRow, SkeletonCard, Skeleton, LazyViewport } from "@/components/ui";
import {
  getPersonalDashboard,
  getSubscriptions,
  getPaymentMethods,
  getCategories,
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
} from "@/types/personal";

export default function PersonalWorkspacePage() {
  const { user, isLoaded: userLoaded } = useUser();
  const { getToken } = useAuth();

  // Data states
  const [dashboard, setDashboard] = useState<PersonalDashboard | null>(null);
  const [subscriptions, setSubscriptions] = useState<Subscription[]>([]);
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>([]);
  const [categories, setCategories] = useState<SubscriptionCategory[]>([]);
  
  // Loading & Error states
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Modals state
  const [isSubModalOpen, setIsSubModalOpen] = useState(false);
  const [isPmModalOpen, setIsPmModalOpen] = useState(false);
  const [isUsageModalOpen, setIsUsageModalOpen] = useState(false);

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
  const [pmType, setPmType] = useState("CREDIT_CARD");
  const [pmBrand, setPmBrand] = useState("Visa");
  const [pmLastFour, setPmLastFour] = useState("");
  const [pmExpiration, setPmExpiration] = useState("");
  const [pmFormError, setPmFormError] = useState<string | null>(null);
  const [pmSubmitting, setPmSubmitting] = useState(false);

  // Log Usage Form state
  const [usageSubId, setUsageSubId] = useState("");
  const [usageDate, setUsageDate] = useState(new Date().toISOString().split("T")[0]);
  const [usageQuantity, setUsageQuantity] = useState("");
  const [usageUnit, setUsageUnit] = useState("Tokens");
  const [usageCost, setUsageCost] = useState("");
  const [usageFormError, setUsageFormError] = useState<string | null>(null);
  const [usageSubmitting, setUsageSubmitting] = useState(false);

  // Refresh page data
  const loadData = async () => {
    setLoading(true);
    setError(null);
    try {
      const token = await getToken();
      if (!token) {
        setLoading(false);
        return;
      }

      const [dbData, subsData, pmData, catsData] = await Promise.all([
        getPersonalDashboard(token),
        getSubscriptions(token),
        getPaymentMethods(token),
        getCategories(token),
      ]);

      setDashboard(dbData);
      setSubscriptions(subsData);
      setPaymentMethods(pmData);
      setCategories(catsData);

      // Pre-select defaults for dropdowns
      if (catsData.length > 0) setSubCategory(catsData[0].id);
      if (pmData.length > 0) setSubPaymentMethod(pmData[0].id);
      const aiSub = subsData.find(s => s.subscriptionType === "ai");
      if (aiSub) setUsageSubId(aiSub.id);
    } catch (err: any) {
      console.error(err);
      setError(err.message || "Failed to load Personal Workspace data from backend.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (userLoaded) {
      loadData();
    }
  }, [userLoaded]);

  // Handle Subscription Submit
  const handleAddSubscription = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubFormError(null);
    setSubSubmitting(true);

    try {
      const token = await getToken();
      if (!token) throw new Error("Authentication failed.");

      if (!subName.trim()) throw new Error("Subscription Name is required.");
      if (!subCost || isNaN(Number(subCost)) || Number(subCost) <= 0) {
        throw new Error("Please enter a valid positive cost amount.");
      }
      if (!subCategory) throw new Error("Please select a category.");

      const postData: any = {
        name: subName,
        cost_amount: Number(subCost),
        currency_code: "USD",
        billing_cycle: subCycle,
        category_id: subCategory,
        payment_method_id: subPaymentMethod || null,
        subscription_type: subType,
      };

      if (subType === "cloud") {
        if (!cloudAccountId.trim()) throw new Error("Account Identifier is required.");
        postData.provider = cloudProvider;
        postData.account_identifier = cloudAccountId;
        postData.region = cloudRegion || null;
        postData.project_identifier = cloudProjectId || null;
      } else if (subType === "ai") {
        if (!aiModelPlan.trim()) throw new Error("Model Plan description is required.");
        postData.provider = aiProvider;
        postData.model_plan = aiModelPlan;
        postData.seat_count = Number(aiSeatCount) || 1;
      }

      await addSubscription(token, postData);
      
      // Reset & Close
      setSubName("");
      setSubCost("");
      setCloudAccountId("");
      setCloudRegion("");
      setCloudProjectId("");
      setAiModelPlan("");
      setAiSeatCount("1");
      setIsSubModalOpen(false);
      
      // Reload Workspace
      await loadData();
    } catch (err: any) {
      setSubFormError(err.message || "Failed to add subscription.");
    } finally {
      setSubSubmitting(false);
    }
  };

  // Handle Payment Method Submit
  const handleAddPaymentMethod = async (e: React.FormEvent) => {
    e.preventDefault();
    setPmFormError(null);
    setPmSubmitting(true);

    try {
      const token = await getToken();
      if (!token) throw new Error("Authentication failed.");

      if (pmType === "CREDIT_CARD" && (!pmLastFour || pmLastFour.length !== 4 || isNaN(Number(pmLastFour)))) {
        throw new Error("Please enter the last 4 digits of the card.");
      }

      await addPaymentMethod(token, {
        type: pmType,
        card_brand: pmType === "CREDIT_CARD" ? pmBrand : undefined,
        last_four: pmType === "CREDIT_CARD" ? pmLastFour : undefined,
        expires_at: pmType === "CREDIT_CARD" && pmExpiration ? `${pmExpiration}-01` : undefined,
      });

      setPmLastFour("");
      setPmExpiration("");
      setIsPmModalOpen(false);
      await loadData();
    } catch (err: any) {
      setPmFormError(err.message || "Failed to add payment method.");
    } finally {
      setPmSubmitting(false);
    }
  };

  // Handle Usage Submit
  const handleAddUsage = async (e: React.FormEvent) => {
    e.preventDefault();
    setUsageFormError(null);
    setUsageSubmitting(true);

    try {
      const token = await getToken();
      if (!token) throw new Error("Authentication failed.");

      if (!usageSubId) throw new Error("Please select an active AI subscription.");
      if (!usageQuantity || isNaN(Number(usageQuantity)) || Number(usageQuantity) <= 0) {
        throw new Error("Quantity must be a positive number.");
      }
      if (!usageCost || isNaN(Number(usageCost)) || Number(usageCost) < 0) {
        throw new Error("Cost must be a non-negative number.");
      }

      await addUsage(token, {
        subscription_id: usageSubId,
        usage_date: usageDate,
        quantity: Number(usageQuantity),
        unit: usageUnit,
        cost: Number(usageCost),
      });

      setUsageQuantity("");
      setUsageCost("");
      setIsUsageModalOpen(false);
      await loadData();
    } catch (err: any) {
      setUsageFormError(err.message || "Failed to log usage record.");
    } finally {
      setUsageSubmitting(false);
    }
  };

  // Handle Cancel/Delete
  const handleDeleteSubscription = async (id: string) => {
    if (!confirm("Are you sure you want to cancel and delete this subscription tracking?")) return;
    try {
      const token = await getToken();
      if (!token) throw new Error("Authentication failed.");
      await deleteSubscription(token, id);
      await loadData();
    } catch (err: any) {
      alert(err.message || "Failed to cancel subscription.");
    }
  };

  // Render Category Badge
  const getSubBadge = (type: string) => {
    switch (type) {
      case "ai":
        return <span className="inline-flex items-center gap-1 text-[10px] font-semibold bg-cyan-500/10 text-cyan-600 dark:text-cyan-400 px-2 py-0.5 rounded-full border border-cyan-500/20"><Cpu className="w-3 h-3" /> AI Tool</span>;
      case "cloud":
        return <span className="inline-flex items-center gap-1 text-[10px] font-semibold bg-blue-500/10 text-blue-600 dark:text-blue-400 px-2 py-0.5 rounded-full border border-blue-500/20"><Cloud className="w-3 h-3" /> Cloud</span>;
      default:
        return <span className="inline-flex items-center gap-1 text-[10px] font-semibold bg-secondary text-secondary-foreground px-2 py-0.5 rounded-full border border-border"><Layers className="w-3 h-3" /> Generic</span>;
    }
  };

  if (!userLoaded) {
    return (
      <div className="min-h-screen bg-background text-foreground flex flex-col font-sans">
        <AppHeader badge="Personal Workspace" />
        <main className="flex-1 max-w-6xl w-full mx-auto px-4 sm:px-6 py-12 flex flex-col gap-8">
          <div className="h-10 w-48 bg-muted rounded-lg animate-pulse" />
          <SkeletonMetricsRow />
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2"><SkeletonCard /></div>
            <div><SkeletonCard /></div>
          </div>
        </main>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-background text-foreground flex flex-col font-sans">
        <AppHeader badge="Personal Workspace" />
        <main className="flex-1 max-w-md w-full mx-auto px-6 py-24 flex flex-col items-center text-center gap-4">
          <AlertTriangle className="w-12 h-12 text-rose-500 animate-bounce" />
          <h2 className="text-xl font-bold tracking-tight text-foreground">Workspace Offline</h2>
          <p className="text-sm text-muted-foreground">{error}</p>
          <Button onClick={loadData} variant="primary" className="mt-4">
            Retry Connection
          </Button>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col font-sans transition-colors animate-page-entrance">
      <AppHeader
        showLink={true}
        badge="Personal Workspace"
        showOrgSwitcher={true}
        showUserButton={true}
      />

      <main className="flex-1 max-w-6xl w-full mx-auto px-4 sm:px-6 py-8 flex flex-col gap-8">
        {/* Header Block */}
        <section className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div className="space-y-1">
            <h1 className="text-3xl font-bold tracking-tight text-foreground">
              Personal Workspace
            </h1>
            <p className="text-sm text-muted-foreground">
              Welcome back, <span className="font-semibold text-foreground">{user?.fullName || user?.primaryEmailAddress?.emailAddress}</span>. Manage your personal subscriptions, AI tool usage, and cloud sandbox accounts.
            </p>
          </div>
          <div className="flex gap-2.5 shrink-0">
            <Button
              onClick={() => setIsPmModalOpen(true)}
              variant="secondary"
              className="h-10 text-xs px-4"
            >
              <CreditCard className="w-3.5 h-3.5 mr-1.5" /> Add Payment Method
            </Button>
            <Button
              onClick={() => setIsSubModalOpen(true)}
              variant="primary"
              className="h-10 text-xs px-4 shadow-lg shadow-blue-500/15"
            >
              <Plus className="w-3.5 h-3.5 mr-1.5" /> Register Subscription
            </Button>
          </div>
        </section>

        {/* Metrics Grid */}
        <section className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-card border border-border/80 p-5 rounded-xl shadow-2xs hover:shadow-lg hover:shadow-blue-950/20 hover:border-blue-500/40 transition-all duration-200 flex flex-col gap-1.5">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">
                Monthly Spend
              </span>
              <div className="p-2 rounded-lg bg-blue-500/10 border border-blue-500/20 text-blue-500 dark:text-blue-400">
                <DollarSign className="w-3.5 h-3.5" />
              </div>
            </div>
            <span className="text-2xl font-bold tracking-tight text-foreground font-mono">
              {loading && !dashboard ? (
                <Skeleton className="h-6 w-20" />
              ) : (
                `$${dashboard?.monthlySpend.toFixed(2) || "0.00"}`
              )}
            </span>
            <span className="text-[10px] text-muted-foreground">Active recurring commitments</span>
          </div>

          <div className="bg-card border border-border/80 p-5 rounded-xl shadow-2xs hover:shadow-lg hover:shadow-blue-950/20 hover:border-cyan-500/40 transition-all duration-200 flex flex-col gap-1.5">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">
                AI Tools Spend
              </span>
              <div className="p-2 rounded-lg bg-cyan-500/10 border border-cyan-500/20 text-cyan-500 dark:text-cyan-400">
                <Cpu className="w-3.5 h-3.5" />
              </div>
            </div>
            <span className="text-2xl font-bold tracking-tight text-foreground font-mono">
              {loading && !dashboard ? (
                <Skeleton className="h-6 w-20" />
              ) : (
                `$${dashboard?.aiSpend.toFixed(2) || "0.00"}`
              )}
            </span>
            <span className="text-[10px] text-muted-foreground">Generative AI subscriptions</span>
          </div>

          <div className="bg-card border border-border/80 p-5 rounded-xl shadow-2xs hover:shadow-lg hover:shadow-blue-950/20 hover:border-blue-500/40 transition-all duration-200 flex flex-col gap-1.5">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">
                Subscriptions
              </span>
              <div className="p-2 rounded-lg bg-blue-500/10 border border-blue-500/20 text-blue-500 dark:text-blue-400">
                <Layers className="w-3.5 h-3.5" />
              </div>
            </div>
            <span className="text-2xl font-bold tracking-tight text-foreground font-mono">
              {loading && !dashboard ? (
                <Skeleton className="h-6 w-8" />
              ) : (
                dashboard?.activeSubscriptionsCount || 0
              )}
            </span>
            <span className="text-[10px] text-muted-foreground">Active tracking records</span>
          </div>

          <div className="bg-card border border-border/80 p-5 rounded-xl shadow-2xs hover:shadow-lg hover:shadow-blue-950/20 hover:border-blue-500/40 transition-all duration-200 flex flex-col gap-1.5">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">
                Cloud Projects
              </span>
              <div className="p-2 rounded-lg bg-blue-500/10 border border-blue-500/20 text-blue-500 dark:text-blue-400">
                <Cloud className="w-3.5 h-3.5" />
              </div>
            </div>
            <span className="text-2xl font-bold tracking-tight text-foreground font-mono">
              {loading && !dashboard ? (
                <Skeleton className="h-6 w-8" />
              ) : (
                dashboard?.cloudProjectsCount || 0
              )}
            </span>
            <span className="text-[10px] text-muted-foreground">AWS / GCP / Azure project keys</span>
          </div>
        </section>

        {/* Dashboard Content split grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Left panel: Active Subscriptions List */}
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-card border border-border rounded-xl shadow-xs overflow-hidden">
              <div className="px-5 py-4 border-b border-border flex items-center justify-between">
                <h3 className="text-sm font-bold text-foreground">Subscriptions Tracking Ledger</h3>
                <span className="text-[11px] text-muted-foreground font-mono">Verified PostgreSQL persistence</span>
              </div>

              {loading && subscriptions.length === 0 ? (
                <div className="p-4 space-y-3">
                  {Array.from({ length: 4 }).map((_, i) => (
                    <div key={i} className="flex justify-between items-center py-2.5 border-b border-border/50 last:border-0">
                      <Skeleton className="h-4 w-1/3" />
                      <Skeleton className="h-4 w-1/4" />
                      <Skeleton className="h-4 w-12" />
                    </div>
                  ))}
                </div>
              ) : subscriptions.length === 0 ? (
                <div className="p-12 flex flex-col items-center justify-center text-center gap-3">
                  <div className="p-3 bg-secondary rounded-full text-muted-foreground border border-border">
                    <Layers className="w-6 h-6" />
                  </div>
                  <h4 className="text-sm font-bold text-foreground">No Subscriptions Tracked Yet</h4>
                  <p className="text-xs text-muted-foreground max-w-sm">
                    No active generic, cloud, or AI subscriptions are registered in your workspace. Click "Register Subscription" above to create your first record.
                  </p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse text-xs">
                    <thead>
                      <tr className="border-b border-border bg-muted/40 font-semibold text-muted-foreground whitespace-nowrap">
                        <th className="p-3.5 w-[28%]">Name</th>
                        <th className="p-3.5 w-[12%]">Type</th>
                        <th className="p-3.5 w-[14%]">Category</th>
                        <th className="p-3.5 w-[14%]">Billing</th>
                        <th className="p-3.5 w-[24%]">Details</th>
                        <th className="p-3.5 w-[8%] text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border">
                      {subscriptions.map((sub) => (
                        <tr key={sub.id} className="hover:bg-blue-500/5 transition-colors">
                          <td className="p-3.5 font-bold text-foreground max-w-0 truncate" title={sub.name}>{sub.name}</td>
                          <td className="p-3.5">{getSubBadge(sub.subscriptionType)}</td>
                          <td className="p-3.5">
                            <span className="text-[10px] text-muted-foreground bg-secondary px-2 py-0.5 rounded border border-border whitespace-nowrap">
                              {sub.category?.name || "Generic"}
                            </span>
                          </td>
                          <td className="p-3.5 font-mono text-foreground whitespace-nowrap">
                            ${sub.costAmount.toFixed(2)} / <span className="text-[10px] text-muted-foreground lowercase">{sub.billingCycle === "ANNUAL" ? "yr" : "mo"}</span>
                          </td>
                          <td className="p-3.5 max-w-0 truncate text-muted-foreground">
                            {sub.subscriptionType === "cloud" && (
                              <span className="text-[10px]" title={`${sub.provider} (${sub.region || "No region"}) Account: ${sub.accountIdentifier}`}>
                                {sub.provider}: {sub.projectIdentifier || sub.accountIdentifier}
                              </span>
                            )}
                            {sub.subscriptionType === "ai" && (
                              <span className="text-[10px]" title={`${sub.provider} plan: ${sub.modelPlan} seats: ${sub.seatCount}`}>
                                {sub.provider}: {sub.modelPlan} ({sub.seatCount} seats)
                              </span>
                            )}
                            {sub.subscriptionType === "generic" && (
                              <span className="text-[10px]">
                                Card ending in: {sub.paymentMethod?.lastFour ? `•••• ${sub.paymentMethod.lastFour}` : "N/A"}
                              </span>
                            )}
                          </td>
                          <td className="p-3.5 text-right">
                            <button
                              onClick={() => handleDeleteSubscription(sub.id)}
                              className="p-1.5 text-muted-foreground hover:text-rose-500 hover:bg-rose-500/10 rounded-md transition-colors cursor-pointer"
                              title="Delete/Cancel tracking"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>

            {/* AI Metered Usage Logging */}
            <div className="bg-card border border-border rounded-xl shadow-xs overflow-hidden">
              <div className="px-5 py-4 border-b border-border flex items-center justify-between">
                <div className="space-y-0.5">
                  <h3 className="text-sm font-bold text-foreground">AI Token & API Metered Consumption</h3>
                  <p className="text-[11px] text-muted-foreground">Track dynamic API usage costs connected to subscriptions</p>
                </div>
                {subscriptions.some(s => s.subscriptionType === "ai") && (
                  <Button
                    onClick={() => setIsUsageModalOpen(true)}
                    variant="secondary"
                    className="h-8 text-[10px] px-3.5"
                  >
                    <PlusCircle className="w-3 h-3 mr-1" /> Log API Consumption
                  </Button>
                )}
              </div>

              <LazyViewport name="AI Token Consumption" placeholder={<div className="p-5 space-y-3"><Skeleton className="h-4 w-full" /><Skeleton className="h-4 w-5/6" /></div>} minHeight="120px" rootMargin="200px 0px">
                {() => (
                  loading && !dashboard ? (
                    <div className="p-5 space-y-3">
                      <Skeleton className="h-4 w-full" />
                      <Skeleton className="h-4 w-5/6" />
                    </div>
                  ) : dashboard?.recentUsage.length === 0 ? (
                    <div className="p-8 text-center text-xs text-muted-foreground">
                      No metered API consumption logged yet.
                    </div>
                  ) : (
                    <div className="p-5 space-y-4">
                      {dashboard?.recentUsage.map((u) => {
                        const sub = subscriptions.find(s => s.id === u.subscriptionId);
                        return (
                          <div key={u.id} className="flex items-center justify-between text-xs border-b border-border pb-3 last:border-0 last:pb-0">
                            <div className="space-y-0.5">
                              <span className="font-bold text-foreground">{sub?.name || "AI Subscription"}</span>
                              <div className="flex gap-2 items-center text-[10px] text-muted-foreground">
                                <span>{u.usageDate}</span>
                                <span>•</span>
                                <span>{u.quantity.toLocaleString()} {u.unit}</span>
                              </div>
                            </div>
                            <span className="font-bold text-foreground font-mono">${u.cost.toFixed(2)}</span>
                          </div>
                        );
                      })}
                    </div>
                  )
                )}
              </LazyViewport>
            </div>
          </div>

          {/* Right panel: Renewals and Payment Methods */}
          <div className="space-y-6">
            
            {/* Upcoming Renewals Card */}
            <div className="bg-card border border-border rounded-xl shadow-xs overflow-hidden">
              <div className="px-5 py-4 border-b border-border flex items-center justify-between">
                <h3 className="text-sm font-bold text-foreground flex items-center gap-1.5">
                  <Calendar className="w-4 h-4 text-blue-500" /> Renewal Calendar (30 Days)
                </h3>
              </div>

              {loading && !dashboard ? (
                <div className="p-4 space-y-3">
                  <Skeleton className="h-4 w-1/3" />
                  <Skeleton className="h-4 w-1/4" />
                </div>
              ) : dashboard?.upcomingRenewals.length === 0 ? (
                <div className="p-6 text-center text-xs text-muted-foreground">
                  No upcoming subscription renewals in the next 30 days.
                </div>
              ) : (
                <div className="divide-y divide-border">
                  {dashboard?.upcomingRenewals.map((item) => {
                    const sub = subscriptions.find(s => s.id === item.subscriptionId);
                    return (
                      <div key={item.id} className="p-4 flex items-center justify-between text-xs hover:bg-muted/5">
                        <div className="space-y-0.5">
                          <span className="font-bold text-foreground">{sub?.name || "Subscription"}</span>
                          <span className="block text-[10px] text-muted-foreground">Renews on: {item.renewalDate}</span>
                        </div>
                        <span className="font-mono text-foreground font-bold">${sub?.costAmount.toFixed(2)}</span>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Payment Instruments Vault */}
            <div className="bg-card border border-border rounded-xl shadow-xs overflow-hidden">
              <div className="px-5 py-4 border-b border-border flex items-center justify-between">
                <h3 className="text-sm font-bold text-foreground flex items-center gap-1.5">
                  <CreditCard className="w-4 h-4 text-sky-500" /> Saved Payment Methods
                </h3>
              </div>

              <LazyViewport name="Saved Payment Instruments" placeholder={<div className="p-4 space-y-2"><Skeleton className="h-4 w-1/2" /><Skeleton className="h-4 w-1/3" /></div>} minHeight="100px" rootMargin="200px 0px">
                {() => (
                  loading && paymentMethods.length === 0 ? (
                    <div className="p-4 space-y-2">
                      <Skeleton className="h-4 w-1/2" />
                      <Skeleton className="h-4 w-1/3" />
                    </div>
                  ) : paymentMethods.length === 0 ? (
                    <div className="p-6 text-center text-xs text-muted-foreground flex flex-col items-center gap-2">
                      <span>No payment methods registered yet.</span>
                      <button
                        onClick={() => setIsPmModalOpen(true)}
                        className="text-[10px] text-blue-600 dark:text-blue-400 font-bold hover:underline cursor-pointer"
                      >
                        Add credit card
                      </button>
                    </div>
                  ) : (
                    <div className="p-5 space-y-3.5">
                      {paymentMethods.map((pm) => (
                        <div key={pm.id} className="flex items-center justify-between text-xs border border-border p-3.5 rounded-lg bg-muted/20">
                          <div className="flex items-center gap-2.5">
                            <CreditCard className="w-4 h-4 text-muted-foreground" />
                            <div>
                              <span className="font-bold text-foreground">{pm.cardBrand || "Credit Card"}</span>
                              <span className="block text-[10px] font-mono text-muted-foreground">•••• •••• •••• {pm.lastFour}</span>
                            </div>
                          </div>
                          <span className="text-[10px] text-muted-foreground">Expires: {pm.expiresAt?.substring(0, 7) || "N/A"}</span>
                        </div>
                      ))}
                    </div>
                  )
                )}
              </LazyViewport>
            </div>
          </div>
        </div>
      </main>

      {/* MODAL 1: REGISTER SUBSCRIPTION */}
      {isSubModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-in fade-in duration-200">
          <div className="bg-card border border-border w-full max-w-lg rounded-xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
            <div className="px-5 py-4 border-b border-border flex items-center justify-between">
              <h3 className="text-sm font-bold text-foreground">Register New Subscription</h3>
              <button onClick={() => setIsSubModalOpen(false)} className="p-1 hover:bg-secondary rounded-md text-muted-foreground hover:text-foreground transition-colors cursor-pointer">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleAddSubscription} className="flex-1 overflow-y-auto p-5 space-y-4">
              {subFormError && (
                <div className="p-3 bg-rose-500/10 border border-rose-500/20 text-rose-600 dark:text-rose-400 rounded-lg text-xs font-medium flex gap-1.5 items-center">
                  <AlertTriangle className="w-4 h-4 shrink-0" />
                  {subFormError}
                </div>
              )}

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5 col-span-2">
                  <label className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">Subscription Name</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. OpenAI Plus, AWS Personal Sandbox"
                    value={subName}
                    onChange={(e) => setSubName(e.target.value)}
                    className="w-full text-xs h-10 px-3 bg-background border border-border rounded-lg text-foreground focus:outline-none focus:ring-2 focus:ring-blue-500/30"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">Type</label>
                  <select
                    value={subType}
                    onChange={(e) => setSubType(e.target.value)}
                    className="w-full text-xs h-10 px-3 bg-background border border-border rounded-lg text-foreground focus:outline-none focus:ring-2 focus:ring-blue-500/30"
                  >
                    <option value="generic">Generic SaaS</option>
                    <option value="cloud">Cloud Sandbox</option>
                    <option value="ai">Generative AI Tool</option>
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">Category</label>
                  <select
                    value={subCategory}
                    onChange={(e) => setSubCategory(e.target.value)}
                    className="w-full text-xs h-10 px-3 bg-background border border-border rounded-lg text-foreground focus:outline-none focus:ring-2 focus:ring-blue-500/30"
                  >
                    {categories.map((c) => (
                      <option key={c.id} value={c.id}>{c.name}</option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">Cost Amount (USD)</label>
                  <input
                    type="text"
                    required
                    placeholder="0.00"
                    value={subCost}
                    onChange={(e) => setSubCost(e.target.value)}
                    className="w-full text-xs h-10 px-3 bg-background border border-border rounded-lg text-foreground font-mono focus:outline-none focus:ring-2 focus:ring-blue-500/30"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">Billing Cycle</label>
                  <select
                    value={subCycle}
                    onChange={(e) => setSubCycle(e.target.value)}
                    className="w-full text-xs h-10 px-3 bg-background border border-border rounded-lg text-foreground focus:outline-none focus:ring-2 focus:ring-blue-500/30"
                  >
                    <option value="MONTHLY">Monthly</option>
                    <option value="ANNUAL">Annual</option>
                  </select>
                </div>

                <div className="space-y-1.5 col-span-2">
                  <label className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">Payment Instrument</label>
                  <select
                    value={subPaymentMethod}
                    onChange={(e) => setSubPaymentMethod(e.target.value)}
                    className="w-full text-xs h-10 px-3 bg-background border border-border rounded-lg text-foreground focus:outline-none focus:ring-2 focus:ring-blue-500/30"
                  >
                    <option value="">No linked payment method</option>
                    {paymentMethods.map((pm) => (
                      <option key={pm.id} value={pm.id}>{pm.cardBrand} (•••• {pm.lastFour})</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Cloud Custom fields */}
              {subType === "cloud" && (
                <div className="p-4 bg-muted/20 border border-border rounded-lg space-y-3.5">
                  <h4 className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Cloud Account Settings</h4>
                  
                  <div className="grid grid-cols-2 gap-3.5">
                    <div className="space-y-1">
                      <label className="text-[9px] font-bold text-muted-foreground uppercase">Cloud Provider</label>
                      <select
                        value={cloudProvider}
                        onChange={(e) => setCloudProvider(e.target.value)}
                        className="w-full text-xs h-8 px-2 bg-background border border-border rounded-md text-foreground"
                      >
                        <option value="AWS">Amazon Web Services</option>
                        <option value="GCP">Google Cloud Platform</option>
                        <option value="AZURE">Microsoft Azure</option>
                      </select>
                    </div>

                    <div className="space-y-1">
                      <label className="text-[9px] font-bold text-muted-foreground uppercase">Account ID / Number</label>
                      <input
                        type="text"
                        required
                        placeholder="12-digit number or email"
                        value={cloudAccountId}
                        onChange={(e) => setCloudAccountId(e.target.value)}
                        className="w-full text-xs h-8 px-2 bg-background border border-border rounded-md text-foreground font-mono"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="text-[9px] font-bold text-muted-foreground uppercase">Region</label>
                      <input
                        type="text"
                        placeholder="us-east-1"
                        value={cloudRegion}
                        onChange={(e) => setCloudRegion(e.target.value)}
                        className="w-full text-xs h-8 px-2 bg-background border border-border rounded-md text-foreground font-mono"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="text-[9px] font-bold text-muted-foreground uppercase">Project ID</label>
                      <input
                        type="text"
                        placeholder="personal-sandbox-dev"
                        value={cloudProjectId}
                        onChange={(e) => setCloudProjectId(e.target.value)}
                        className="w-full text-xs h-8 px-2 bg-background border border-border rounded-md text-foreground font-mono"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* AI Custom fields */}
              {subType === "ai" && (
                <div className="p-4 bg-muted/20 border border-border rounded-lg space-y-3.5">
                  <h4 className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Generative AI Setup</h4>
                  
                  <div className="grid grid-cols-2 gap-3.5">
                    <div className="space-y-1">
                      <label className="text-[9px] font-bold text-muted-foreground uppercase">AI Service Provider</label>
                      <select
                        value={aiProvider}
                        onChange={(e) => setAiProvider(e.target.value)}
                        className="w-full text-xs h-8 px-2 bg-background border border-border rounded-md text-foreground"
                      >
                        <option value="OpenAI">OpenAI (ChatGPT)</option>
                        <option value="Anthropic">Anthropic (Claude)</option>
                        <option value="Midjourney">Midjourney</option>
                        <option value="Cursor">Cursor AI</option>
                      </select>
                    </div>

                    <div className="space-y-1">
                      <label className="text-[9px] font-bold text-muted-foreground uppercase">Model / License Plan</label>
                      <input
                        type="text"
                        required
                        placeholder="Claude Pro, ChatGPT Plus"
                        value={aiModelPlan}
                        onChange={(e) => setAiModelPlan(e.target.value)}
                        className="w-full text-xs h-8 px-2 bg-background border border-border rounded-md text-foreground"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="text-[9px] font-bold text-muted-foreground uppercase">Allocated Seats</label>
                      <input
                        type="number"
                        min="1"
                        required
                        value={aiSeatCount}
                        onChange={(e) => setAiSeatCount(e.target.value)}
                        className="w-full text-xs h-8 px-2 bg-background border border-border rounded-md text-foreground font-mono"
                      />
                    </div>
                  </div>
                </div>
              )}

              <div className="border-t border-border pt-4 flex justify-end gap-2.5">
                <Button type="button" variant="secondary" onClick={() => setIsSubModalOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit" variant="primary" loading={subSubmitting} loadingText="Saving...">
                  Create Subscription Record
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 2: ADD PAYMENT METHOD */}
      {isPmModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-in fade-in duration-200">
          <div className="bg-card border border-border w-full max-w-sm rounded-xl shadow-2xl overflow-hidden">
            <div className="px-5 py-4 border-b border-border flex items-center justify-between">
              <h3 className="text-sm font-bold text-foreground">Add Payment Instrument</h3>
              <button onClick={() => setIsPmModalOpen(false)} className="p-1 hover:bg-secondary rounded-md text-muted-foreground hover:text-foreground transition-colors cursor-pointer">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleAddPaymentMethod} className="p-5 space-y-4">
              {pmFormError && (
                <div className="p-3 bg-rose-500/10 border border-rose-500/20 text-rose-600 dark:text-rose-400 rounded-lg text-xs font-medium">
                  {pmFormError}
                </div>
              )}

              <div className="space-y-1.5">
                <label className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">Type</label>
                <select
                  value={pmType}
                  onChange={(e) => setPmType(e.target.value)}
                  className="w-full text-xs h-10 px-3 bg-background border border-border rounded-lg text-foreground focus:outline-none"
                >
                  <option value="CREDIT_CARD">Credit Card</option>
                  <option value="BANK_ACCOUNT">Bank Account</option>
                  <option value="PAYPAL">PayPal</option>
                </select>
              </div>

              {pmType === "CREDIT_CARD" && (
                <>
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">Brand</label>
                    <select
                      value={pmBrand}
                      onChange={(e) => setPmBrand(e.target.value)}
                      className="w-full text-xs h-10 px-3 bg-background border border-border rounded-lg text-foreground focus:outline-none"
                    >
                      <option value="Visa">Visa</option>
                      <option value="Mastercard">Mastercard</option>
                      <option value="American Express">American Express</option>
                    </select>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">Last 4 Digits</label>
                      <input
                        type="text"
                        maxLength={4}
                        required
                        placeholder="4242"
                        value={pmLastFour}
                        onChange={(e) => setPmLastFour(e.target.value.replace(/\D/g, ""))}
                        className="w-full text-xs h-10 px-3 bg-background border border-border rounded-lg text-foreground font-mono focus:outline-none"
                      />
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">Expiration (YYYY-MM)</label>
                      <input
                        type="text"
                        placeholder="2030-12"
                        value={pmExpiration}
                        onChange={(e) => setPmExpiration(e.target.value)}
                        className="w-full text-xs h-10 px-3 bg-background border border-border rounded-lg text-foreground font-mono focus:outline-none"
                      />
                    </div>
                  </div>
                </>
              )}

              <div className="border-t border-border pt-4 flex justify-end gap-2.5">
                <Button type="button" variant="secondary" onClick={() => setIsPmModalOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit" variant="primary" loading={pmSubmitting} loadingText="Adding...">
                  Save Instrument
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 3: LOG USAGE */}
      {isUsageModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-in fade-in duration-200">
          <div className="bg-card border border-border w-full max-w-sm rounded-xl shadow-2xl overflow-hidden">
            <div className="px-5 py-4 border-b border-border flex items-center justify-between">
              <h3 className="text-sm font-bold text-foreground">Log API Consumption</h3>
              <button onClick={() => setIsUsageModalOpen(false)} className="p-1 hover:bg-secondary rounded-md text-muted-foreground hover:text-foreground transition-colors cursor-pointer">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleAddUsage} className="p-5 space-y-4">
              {usageFormError && (
                <div className="p-3 bg-rose-500/10 border border-rose-500/20 text-rose-600 dark:text-rose-400 rounded-lg text-xs font-medium">
                  {usageFormError}
                </div>
              )}

              <div className="space-y-1.5">
                <label className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">Select AI Tool</label>
                <select
                  value={usageSubId}
                  onChange={(e) => setUsageSubId(e.target.value)}
                  className="w-full text-xs h-10 px-3 bg-background border border-border rounded-lg text-foreground focus:outline-none"
                >
                  {subscriptions
                    .filter((s) => s.subscriptionType === "ai")
                    .map((s) => (
                      <option key={s.id} value={s.id}>{s.name} ({s.provider})</option>
                    ))}
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">Usage Date</label>
                <input
                  type="date"
                  required
                  value={usageDate}
                  onChange={(e) => setUsageDate(e.target.value)}
                  className="w-full text-xs h-10 px-3 bg-background border border-border rounded-lg text-foreground font-mono focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">Quantity</label>
                  <input
                    type="number"
                    min="1"
                    required
                    placeholder="150"
                    value={usageQuantity}
                    onChange={(e) => setUsageQuantity(e.target.value)}
                    className="w-full text-xs h-10 px-3 bg-background border border-border rounded-lg text-foreground font-mono focus:outline-none"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">Unit</label>
                  <input
                    type="text"
                    required
                    placeholder="API_CALLS, Tokens"
                    value={usageUnit}
                    onChange={(e) => setUsageUnit(e.target.value)}
                    className="w-full text-xs h-10 px-3 bg-background border border-border rounded-lg text-foreground focus:outline-none"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">Calculated Cost (USD)</label>
                <input
                  type="text"
                  required
                  placeholder="1.50"
                  value={usageCost}
                  onChange={(e) => setUsageCost(e.target.value)}
                  className="w-full text-xs h-10 px-3 bg-background border border-border rounded-lg text-foreground font-mono focus:outline-none"
                />
              </div>

              <div className="border-t border-border pt-4 flex justify-end gap-2.5">
                <Button type="button" variant="secondary" onClick={() => setIsUsageModalOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit" variant="primary" loading={usageSubmitting} loadingText="Logging...">
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
