/**
 * Canonical Initiative Model & Real FastAPI REST Persistence Store
 * Single source of truth for Initiative Management (FastAPI -> PostgreSQL)
 */

import { API_BASE } from "./apiConfig";

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

export const INITIAL_CANONICAL_INITIATIVES: InitiativeModel[] = [
  {
    id: "init_cs_auto",
    name: "Customer Support Automation",
    businessArea: "Operations & Care",
    status: "ACTIVE",
    owner: "",
    executiveSponsor: "",
    projectLead: "",
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
  }
];

export function mapInitiativeResponseToModel(init: any, latestInvestment?: any): InitiativeModel {
  const budgetAmount = latestInvestment ? latestInvestment.total_planned_amount.toString() : "0";
  const currency = latestInvestment ? latestInvestment.currency : "USD";
  const numBudget = Number(budgetAmount);

  // Calculate estimated impact dynamically
  const valueImpact = numBudget > 0
    ? `$${(numBudget * 2.2 / 1000000).toFixed(2)}M / yr`
    : "";

  return {
    id: init.id,
    name: init.name,
    businessArea: init.business_area || "",
    status: (init.lifecycle_state === "ABANDONED" ? "CANCELLED" : init.lifecycle_state) as InitiativeStatus,
    owner: init.owner || "",
    executiveSponsor: init.executive_sponsor || "",
    projectLead: init.project_lead || "",
    plannedBudget: budgetAmount,
    currency: currency,
    plannedStartDate: init.planned_start_date || "",
    problemStatement: init.problem_statement || "",
    aiIntervention: init.proposed_intervention || "",
    expectedBusinessOutcome: init.expected_business_outcome || "",
    targetMetric: init.target_metric_name || "",
    targetImprovement: init.target_metric_value || "",
    health: "Healthy",
    valueImpact,
    createdAt: init.created_at,
    updatedAt: init.updated_at,
  };
}

export async function getStoredInitiatives(token: string): Promise<InitiativeModel[]> {
  const res = await fetch(`${API_BASE}/api/v1/initiatives`, {
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
  });
  if (!res.ok) {
    throw new Error(`Failed to fetch initiatives: ${res.statusText}`);
  }
  const data = await res.json();
  if (!Array.isArray(data)) return [];

  const mapped = await Promise.all(
    data.map(async (init: any) => {
      try {
        const investRes = await fetch(`${API_BASE}/api/v1/initiatives/${init.id}/investments/latest`, {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        });
        if (investRes.ok) {
          const investData = await investRes.json();
          return mapInitiativeResponseToModel(init, investData);
        }
      } catch (err) {
        console.error(`Error fetching investment for initiative ${init.id}:`, err);
      }
      return mapInitiativeResponseToModel(init, null);
    })
  );
  return mapped;
}

export async function getInitiativeById(token: string, id: string): Promise<InitiativeModel | undefined> {
  const res = await fetch(`${API_BASE}/api/v1/initiatives/${id}`, {
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
  });
  if (!res.ok) {
    if (res.status === 404) return undefined;
    throw new Error(`Failed to fetch initiative details: ${res.statusText}`);
  }
  const init = await res.json();

  let latestInvestment = null;
  try {
    const investRes = await fetch(`${API_BASE}/api/v1/initiatives/${id}/investments/latest`, {
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    });
    if (investRes.ok) {
      latestInvestment = await investRes.json();
    }
  } catch (err) {
    console.error("Error fetching investment details:", err);
  }

  return mapInitiativeResponseToModel(init, latestInvestment);
}

export async function createCanonicalInitiative(
  token: string,
  rawInput: {
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
  }
): Promise<InitiativeModel> {
  const payload = {
    name: rawInput.name.trim(),
    business_area: rawInput.businessArea || "",
    problem_statement: rawInput.problemStatement || "",
    proposed_intervention: rawInput.proposedIntervention || "",
    expected_business_outcome: rawInput.expectedOutcome || "",
    planned_start_date: rawInput.plannedStartDate || new Date().toISOString().split("T")[0],
    owner: rawInput.owner || "",
    executive_sponsor: rawInput.executiveSponsor || "",
    project_lead: rawInput.projectLead || "",
    target_metric_name: rawInput.targetMetricName || "",
    target_metric_value: rawInput.targetMetricValue || "",
  };

  const res = await fetch(`${API_BASE}/api/v1/initiatives`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });

  if (!res.ok) {
    const errData = await res.json().catch(() => ({}));
    throw new Error(errData?.detail || `Failed to create initiative: ${res.statusText}`);
  }

  const newInit = await res.json();
  const id = newInit.id;

  const numBudget = Number(rawInput.plannedBudget || 0);
  let latestInvestment = null;
  if (numBudget > 0) {
    const costPayload = {
      category: "OTHER",
      value_type: "PLANNED",
      amount: numBudget,
      currency: rawInput.currency || "USD",
      recurrence: "ONE_TIME",
      source_reference: "Initial Allocation",
      assumption_note: "Initial planned budget from registration wizard",
    };

    const costRes = await fetch(`${API_BASE}/api/v1/initiatives/${id}/investments/cost-items`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(costPayload),
    });

    if (costRes.ok) {
      try {
        const investRes = await fetch(`${API_BASE}/api/v1/initiatives/${id}/investments/latest`, {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        });
        if (investRes.ok) {
          latestInvestment = await investRes.json();
        }
      } catch (err) {
        console.error("Error fetching latest investment:", err);
      }
    } else {
      const errData = await costRes.json().catch(() => ({}));
      console.error("Failed to add cost item:", errData?.detail || costRes.statusText);
    }
  }

  return mapInitiativeResponseToModel(newInit, latestInvestment);
}

export async function updateCanonicalInitiative(
  token: string,
  id: string,
  updatedFields: Partial<InitiativeModel>
): Promise<InitiativeModel | undefined> {
  // 1. If status is updated, perform status transition
  if (updatedFields.status) {
    let targetState = updatedFields.status as string;
    if (targetState === "CANCELLED") {
      targetState = "ABANDONED";
    }
    const transitionRes = await fetch(
      `${API_BASE}/api/v1/initiatives/${id}/transition?target_state=${targetState}`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      }
    );
    if (!transitionRes.ok) {
      const errData = await transitionRes.json().catch(() => ({}));
      throw new Error(errData?.detail || `Failed to transition state: ${transitionRes.statusText}`);
    }
  }

  // 2. Perform PUT request for other fields
  const putPayload: any = {};
  if (updatedFields.name !== undefined) putPayload.name = updatedFields.name;
  if (updatedFields.businessArea !== undefined) putPayload.business_area = updatedFields.businessArea;
  if (updatedFields.problemStatement !== undefined) putPayload.problem_statement = updatedFields.problemStatement;
  if (updatedFields.aiIntervention !== undefined) putPayload.proposed_intervention = updatedFields.aiIntervention;
  if (updatedFields.expectedBusinessOutcome !== undefined) putPayload.expected_business_outcome = updatedFields.expectedBusinessOutcome;
  if (updatedFields.plannedStartDate !== undefined) putPayload.planned_start_date = updatedFields.plannedStartDate;
  if (updatedFields.owner !== undefined) putPayload.owner = updatedFields.owner;
  if (updatedFields.executiveSponsor !== undefined) putPayload.executive_sponsor = updatedFields.executiveSponsor;
  if (updatedFields.projectLead !== undefined) putPayload.project_lead = updatedFields.projectLead;
  if (updatedFields.targetMetric !== undefined) putPayload.target_metric_name = updatedFields.targetMetric;
  if (updatedFields.targetImprovement !== undefined) putPayload.target_metric_value = updatedFields.targetImprovement;

  if (Object.keys(putPayload).length > 0) {
    const putRes = await fetch(`${API_BASE}/api/v1/initiatives/${id}`, {
      method: "PUT",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(putPayload),
    });
    if (!putRes.ok) {
      const errData = await putRes.json().catch(() => ({}));
      throw new Error(errData?.detail || `Failed to update initiative: ${putRes.statusText}`);
    }
  }

  return getInitiativeById(token, id);
}

export async function deleteCanonicalInitiative(token: string, id: string): Promise<boolean> {
  const res = await fetch(`${API_BASE}/api/v1/initiatives/${id}`, {
    method: "DELETE",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
  });
  if (!res.ok) {
    const errData = await res.json().catch(() => ({}));
    throw new Error(errData?.detail || `Failed to delete initiative: ${res.statusText}`);
  }
  return true;
}

export async function addInvestmentCostItem(
  token: string,
  initiativeId: string,
  costItem: {
    category: string;
    value_type: string;
    amount: number;
    currency: string;
  }
): Promise<any> {
  const res = await fetch(`${API_BASE}/api/v1/initiatives/${initiativeId}/investments/cost-items`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      category: costItem.category,
      value_type: costItem.value_type,
      amount: costItem.amount,
      currency: costItem.currency,
      recurrence: "ONE_TIME",
    }),
  });
  if (!res.ok) {
    const errData = await res.json().catch(() => ({}));
    throw new Error(errData?.detail || `Failed to add cost item: ${res.statusText}`);
  }
  return res.json();
}
