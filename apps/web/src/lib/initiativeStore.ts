/**
 * Canonical Initiative Model & Reactive In-Memory / LocalStorage Store
 * Single source of truth for Initiative Management (Phase 2.1)
 */

export type InitiativeStatus =
  | "DRAFT"
  | "SUBMITTED"
  | "ACTIVE"
  | "PAUSED"
  | "COMPLETED"
  | "CANCELLED"
  | "ARCHIVED"
  | "NEUTRAL";

export type InitiativeHealth = "Healthy" | "Risk" | "Review";

export interface InitiativeModel {
  id: string;
  name: string;
  businessArea: string;
  status: InitiativeStatus;
  owner: string;
  executiveSponsor: string;
  projectLead: string;
  plannedBudget: string;
  currency: string;
  plannedStartDate: string;
  problemStatement: string;
  aiIntervention: string;
  expectedBusinessOutcome: string;
  targetMetric: string;
  targetImprovement: string;
  health: InitiativeHealth;
  valueImpact: string;
  createdAt: string;
  updatedAt: string;
}

const STORAGE_KEY = "ai_value_intel_initiatives_v1";

export const INITIAL_CANONICAL_INITIATIVES: InitiativeModel[] = [
  {
    id: "init_cs_auto",
    name: "Customer Support Automation",
    businessArea: "Operations & Care",
    status: "ACTIVE",
    owner: "Sarah Jenkins (CFO)",
    executiveSponsor: "Marcus Vance (CTO)",
    projectLead: "David Miller (PM)",
    plannedBudget: "650000",
    currency: "USD",
    plannedStartDate: "2026-03-01",
    problemStatement: "Tier-1 support ticket volumes increased by 42% YOY, straining operational capacity and creating SLA bottlenecks.",
    aiIntervention: "Deploy fine-tuned Llama-3 70B inference pipeline integrated with Zendesk API to automate ticket triage and auto-resolution.",
    expectedBusinessOutcome: "Reduce Tier-1 resolution latency by 35% while cutting operational costs.",
    targetMetric: "Ticket Resolution Velocity",
    targetImprovement: "35%",
    health: "Healthy",
    valueImpact: "$1.40M / yr",
    createdAt: "2026-01-15T09:00:00Z",
    updatedAt: "2026-08-04T12:00:00Z",
  },
  {
    id: "init_dev_pilot",
    name: "AI Code Assistant Pilot",
    businessArea: "Software Engineering",
    status: "ACTIVE",
    owner: "Alex Rivera (VP Eng)",
    executiveSponsor: "Marcus Vance (CTO)",
    projectLead: "Elena Rostova",
    plannedBudget: "320000",
    currency: "USD",
    plannedStartDate: "2026-04-15",
    problemStatement: "Engineering velocity impacted by repetitive boilerplate setup and slow PR review cycles.",
    aiIntervention: "Provision GitHub Copilot Enterprise and custom IDE code completion agents for 150 core developers.",
    expectedBusinessOutcome: "Increase developer throughput by 20% and reduce code review turnaround time.",
    targetMetric: "PR Cycle Time",
    targetImprovement: "20%",
    health: "Healthy",
    valueImpact: "$850K / yr",
    createdAt: "2026-02-01T10:00:00Z",
    updatedAt: "2026-08-03T14:30:00Z",
  },
  {
    id: "init_doc_proc",
    name: "Automated Document Processing",
    businessArea: "Legal & Compliance",
    status: "SUBMITTED",
    owner: "Elena Rostova (General Counsel)",
    executiveSponsor: "Sarah Jenkins (CFO)",
    projectLead: "James Thornton",
    plannedBudget: "280000",
    currency: "USD",
    plannedStartDate: "2026-05-10",
    problemStatement: "Manual vendor contract ingestion takes 4.5 hours per document with potential compliance oversight risk.",
    aiIntervention: "Implement multimodal OCR + Claude 3.5 Sonnet document extraction for automated clause validation.",
    expectedBusinessOutcome: "Extract contract terms with 99% accuracy and reduce audit preparation from weeks to hours.",
    targetMetric: "Document Ingestion Speed",
    targetImprovement: "90%",
    health: "Review",
    valueImpact: "$620K / yr",
    createdAt: "2026-03-10T11:20:00Z",
    updatedAt: "2026-08-02T16:45:00Z",
  },
  {
    id: "init_supply_chain",
    name: "Predictive Supply Chain Demand",
    businessArea: "Logistics & Supply Chain",
    status: "COMPLETED",
    owner: "James Thornton (COO)",
    executiveSponsor: "Sarah Jenkins (CFO)",
    projectLead: "Alex Rivera",
    plannedBudget: "750000",
    currency: "USD",
    plannedStartDate: "2026-02-01",
    problemStatement: "Excess inventory carrying costs and stockouts during regional demand spikes.",
    aiIntervention: "Build BigQuery ML time-series forecasting model integrated with ERP inventory replenishment.",
    expectedBusinessOutcome: "Optimize safety stock levels and reduce holding cost by $1.98M annually.",
    targetMetric: "Inventory Turnover Ratio",
    targetImprovement: "25%",
    health: "Healthy",
    valueImpact: "$1.98M / yr",
    createdAt: "2025-11-01T08:00:00Z",
    updatedAt: "2026-07-28T09:15:00Z",
  },
  {
    id: "init_fraud_detect",
    name: "Real-Time Fraud Triage Engine",
    businessArea: "Finance & Risk Analytics",
    status: "ACTIVE",
    owner: "Marcus Vance (CTO)",
    executiveSponsor: "Sarah Jenkins (CFO)",
    projectLead: "David Miller",
    plannedBudget: "900000",
    currency: "USD",
    plannedStartDate: "2026-01-15",
    problemStatement: "Legacy rule-based fraud detection generated 68% false positive rate requiring manual analyst review.",
    aiIntervention: "Deploy real-time streaming XGBoost + Graph Neural Network anomaly score service in under 50ms latency.",
    expectedBusinessOutcome: "Identify high-risk transactions instantly and cut false positives by half.",
    targetMetric: "False Positive Reduction",
    targetImprovement: "50%",
    health: "Healthy",
    valueImpact: "$2.45M / yr",
    createdAt: "2025-12-10T14:00:00Z",
    updatedAt: "2026-08-01T17:10:00Z",
  },
];

export function getStoredInitiatives(): InitiativeModel[] {
  if (typeof window === "undefined") return INITIAL_CANONICAL_INITIATIVES;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(INITIAL_CANONICAL_INITIATIVES));
      return INITIAL_CANONICAL_INITIATIVES;
    }
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) && parsed.length > 0 ? parsed : INITIAL_CANONICAL_INITIATIVES;
  } catch {
    return INITIAL_CANONICAL_INITIATIVES;
  }
}

export function saveStoredInitiatives(list: InitiativeModel[]): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(list));
  } catch (err) {
    console.error("Failed to save initiatives to storage:", err);
  }
}

export function getInitiativeById(id: string): InitiativeModel | undefined {
  const all = getStoredInitiatives();
  return all.find((item) => item.id === id);
}

export function createCanonicalInitiative(rawInput: {
  name: string;
  businessArea: string;
  owner?: string;
  executiveSponsor?: string;
  projectLead?: string;
  plannedBudget?: string;
  currency?: string;
  plannedStartDate?: string;
  problemStatement?: string;
  proposedIntervention?: string;
  expectedOutcome?: string;
  targetMetricName?: string;
  targetMetricValue?: string;
  status?: InitiativeStatus;
}): InitiativeModel {
  const id = `init_${Date.now()}`;
  const now = new Date().toISOString();

  const numBudget = Number(rawInput.plannedBudget || 0);
  const formattedBudget = numBudget > 0 ? numBudget.toString() : "500000";

  // Calculate estimated impact dynamically
  const valueImpact = rawInput.targetMetricValue
    ? `${rawInput.targetMetricValue} impact / yr`
    : numBudget > 0
    ? `$${(numBudget * 2.2 / 1000000).toFixed(2)}M / yr`
    : "$850K / yr";

  const newInitiative: InitiativeModel = {
    id,
    name: rawInput.name.trim(),
    businessArea: rawInput.businessArea || "Operations & Care",
    status: rawInput.status || "SUBMITTED", // Default to SUBMITTED upon wizard submission
    owner: rawInput.owner || "Sarah Jenkins (CFO)",
    executiveSponsor: rawInput.executiveSponsor || "Marcus Vance (CTO)",
    projectLead: rawInput.projectLead || "David Miller (PM)",
    plannedBudget: formattedBudget,
    currency: rawInput.currency || "USD",
    plannedStartDate: rawInput.plannedStartDate || new Date().toISOString().split("T")[0],
    problemStatement: rawInput.problemStatement || "Operational efficiency baseline defined.",
    aiIntervention: rawInput.proposedIntervention || "AI automation workflow deployment.",
    expectedBusinessOutcome: rawInput.expectedOutcome || "Target metric improvement.",
    targetMetric: rawInput.targetMetricName || "Resolution Velocity",
    targetImprovement: rawInput.targetMetricValue || "35%",
    health: "Healthy",
    valueImpact,
    createdAt: now,
    updatedAt: now,
  };

  const list = getStoredInitiatives();
  const updatedList = [newInitiative, ...list];
  saveStoredInitiatives(updatedList);
  return newInitiative;
}

export function updateCanonicalInitiative(
  id: string,
  updatedFields: Partial<InitiativeModel>
): InitiativeModel | undefined {
  const list = getStoredInitiatives();
  const idx = list.findIndex((item) => item.id === id);
  if (idx === -1) return undefined;

  const existing = list[idx];
  const now = new Date().toISOString();

  // If budget changed, recalculate valueImpact if not explicitly passed
  let updatedImpact = updatedFields.valueImpact || existing.valueImpact;
  if (updatedFields.plannedBudget && !updatedFields.valueImpact) {
    const num = Number(updatedFields.plannedBudget);
    if (num > 0) {
      updatedImpact = `$${(num * 2.2 / 1000000).toFixed(2)}M / yr`;
    }
  }

  const merged: InitiativeModel = {
    ...existing,
    ...updatedFields,
    valueImpact: updatedImpact,
    updatedAt: now,
  };

  list[idx] = merged;
  saveStoredInitiatives(list);
  return merged;
}

export function deleteCanonicalInitiative(id: string): boolean {
  const list = getStoredInitiatives();
  const filtered = list.filter((item) => item.id !== id);
  if (filtered.length === list.length) return false;
  saveStoredInitiatives(filtered);
  return true;
}
