/**
 * Workflow & Governance Service Layer
 * Interface mapping cleanly to FastAPI workflow endpoints.
 */

import {
  ApprovalItem,
  WorkflowTask,
  WorkflowComment,
  WorkflowAuditLog,
  GovernanceMetrics,
  ApprovalAction,
} from "../../types/workflow";

import { API_BASE as BASE_URL } from "../../lib/apiConfig";

const API_BASE = `${BASE_URL}/api/v1`;

export async function getApprovalsQueue(token: string): Promise<ApprovalItem[]> {
  const res = await fetch(`${API_BASE}/approvals`, {
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
  });
  if (!res.ok) throw new Error("Failed to fetch approvals queue");
  const data = await res.json();
  return data.map((item: any) => ({
    id: item.id,
    initiativeId: item.initiative_id,
    initiativeName: item.initiative_name || "Initiative",
    businessArea: item.business_area || "N/A",
    requestedBy: item.requested_by,
    owner: item.owner,
    currentStage: item.current_stage,
    requestedBudget: item.requested_budget,
    expectedOutcome: item.expected_outcome,
    aiConfidenceScore: item.ai_confidence_score,
    riskLevel: item.risk_level,
    submittedDate: item.submitted_date,
    dueDate: item.due_date,
  }));
}

export async function getWorkflowTasks(token: string): Promise<WorkflowTask[]> {
  const res = await fetch(`${API_BASE}/approvals/tasks`, {
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
  });
  if (!res.ok) throw new Error("Failed to fetch workflow tasks");
  const data = await res.json();
  return data.map((item: any) => ({
    id: item.id,
    approvalId: item.approval_id,
    taskTitle: item.task_title,
    assignee: item.assignee,
    dueDate: item.due_date,
    priority: item.priority,
    status: item.status,
  }));
}

export async function getWorkflowComments(token: string, approvalId: string): Promise<WorkflowComment[]> {
  const res = await fetch(`${API_BASE}/approvals/${approvalId}/comments`, {
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
  });
  if (!res.ok) throw new Error("Failed to fetch workflow comments");
  const data = await res.json();
  return data.map((item: any) => ({
    id: item.id,
    approvalId: item.approval_id,
    author: item.author,
    role: item.role,
    content: item.content,
    timestamp: item.timestamp,
  }));
}

export async function addWorkflowComment(token: string, approvalId: string, content: string): Promise<WorkflowComment> {
  const res = await fetch(`${API_BASE}/approvals/${approvalId}/comments`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ content }),
  });
  if (!res.ok) throw new Error("Failed to add comment");
  const item = await res.json();
  return {
    id: item.id,
    approvalId: item.approval_id,
    author: item.author,
    role: item.role,
    content: item.content,
    timestamp: item.timestamp,
  };
}

export async function getWorkflowAuditLogs(token: string, approvalId: string): Promise<WorkflowAuditLog[]> {
  const res = await fetch(`${API_BASE}/approvals/${approvalId}/audit-logs`, {
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
  });
  if (!res.ok) throw new Error("Failed to fetch workflow audit logs");
  const data = await res.json();
  return data.map((item: any) => ({
    id: item.id,
    approvalId: item.approval_id,
    actor: item.actor,
    action: item.action,
    previousStage: item.previous_stage,
    newStage: item.new_stage,
    reason: item.reason,
    timestamp: item.timestamp,
  }));
}

export async function getGovernanceMetrics(token: string): Promise<GovernanceMetrics> {
  const res = await fetch(`${API_BASE}/approvals/metrics`, {
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
  });
  if (!res.ok) throw new Error("Failed to fetch governance metrics");
  return res.json();
}

export async function executeApprovalAction(
  token: string,
  item: ApprovalItem,
  action: ApprovalAction,
  reason?: string
): Promise<ApprovalItem> {
  const url = new URL(`${API_BASE}/approvals/${item.id}/action`);
  url.searchParams.append("action", action);
  if (reason) url.searchParams.append("reason", reason);
  
  const res = await fetch(url.toString(), {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
  });
  if (!res.ok) throw new Error("Failed to execute approval action");
  const data = await res.json();
  return {
    id: data.id,
    initiativeId: data.initiative_id,
    initiativeName: data.initiative_name || item.initiativeName,
    businessArea: data.business_area || item.businessArea,
    requestedBy: data.requested_by,
    owner: data.owner,
    currentStage: data.current_stage,
    requestedBudget: data.requested_budget,
    expectedOutcome: data.expected_outcome,
    aiConfidenceScore: data.ai_confidence_score,
    riskLevel: data.risk_level,
    submittedDate: data.submitted_date,
    dueDate: data.due_date,
  };
}
