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
import { executeActionTransition, calculateGovernanceMetrics } from "../../lib/workflow/stateMachine";

export const MOCK_APPROVAL_ITEMS: ApprovalItem[] = [
  {
    id: "app_1",
    initiativeId: "init_cs_auto",
    initiativeName: "Customer Support Automation",
    businessArea: "Operations & Care",
    requestedBy: "David Miller (PM)",
    owner: "Sarah Jenkins (CFO)",
    currentStage: "EXECUTIVE_REVIEW",
    requestedBudget: 850000,
    expectedOutcome: "35% ticket resolution velocity deflection",
    aiConfidenceScore: 94,
    riskLevel: "Low",
    submittedDate: "2026-08-01",
    dueDate: "2026-08-06",
  },
  {
    id: "app_2",
    initiativeId: "init_dev_pilot",
    initiativeName: "AI Code Assistant Pilot",
    businessArea: "Software Engineering",
    requestedBy: "Alex Rivera (VP Eng)",
    owner: "Marcus Vance (CTO)",
    currentStage: "FINANCE_REVIEW",
    requestedBudget: 500000,
    expectedOutcome: "Developer code suggestion velocity uplift",
    aiConfidenceScore: 91,
    riskLevel: "Medium",
    submittedDate: "2026-08-02",
    dueDate: "2026-08-07",
  },
  {
    id: "app_3",
    initiativeId: "init_doc_proc",
    initiativeName: "Automated Document Processing",
    businessArea: "Legal & Compliance",
    requestedBy: "Elena Rostova (General Counsel)",
    owner: "Sarah Jenkins (CFO)",
    currentStage: "ARCHITECTURE_REVIEW",
    requestedBudget: 620000,
    expectedOutcome: "Legal contract processing turnaround reduction",
    aiConfidenceScore: 88,
    riskLevel: "Medium",
    submittedDate: "2026-08-03",
    dueDate: "2026-08-08",
  },
];

export const MOCK_TASKS: WorkflowTask[] = [
  {
    id: "task_1",
    approvalId: "app_1",
    taskTitle: "Executive Sign-off on $850k Capital Allocation",
    assignee: "Sarah Jenkins (CFO)",
    dueDate: "2026-08-06",
    priority: "High",
    status: "PENDING",
  },
  {
    id: "task_2",
    approvalId: "app_2",
    taskTitle: "Financial ROI Baseline Verification",
    assignee: "Finance Audit Team",
    dueDate: "2026-08-07",
    priority: "High",
    status: "IN_PROGRESS",
  },
  {
    id: "task_3",
    approvalId: "app_3",
    taskTitle: "SOC2 PII Data Masking Architecture Review",
    assignee: "Enterprise Architecture Board",
    dueDate: "2026-08-08",
    priority: "Medium",
    status: "PENDING",
  },
];

export const MOCK_COMMENTS: WorkflowComment[] = [
  {
    id: "cmt_1",
    approvalId: "app_1",
    author: "Value Intel AI Engine",
    role: "AI Engine",
    content: "Algorithmic analysis confirms 94% confidence score for $140k annual GPU cost reduction.",
    timestamp: "2026-08-04T10:30:00Z",
  },
  {
    id: "cmt_2",
    approvalId: "app_1",
    author: "Sarah Jenkins (CFO)",
    role: "Executive",
    content: "Reviewed baseline projections. Recommending approval pending final InfoSec confirmation.",
    timestamp: "2026-08-04T11:15:00Z",
  },
];

export const MOCK_AUDIT_LOGS: WorkflowAuditLog[] = [
  {
    id: "aud_1",
    approvalId: "app_1",
    actor: "David Miller (PM)",
    action: "STAGE_TRANSITION",
    previousStage: "DRAFT",
    newStage: "SUBMITTED",
    reason: "Submitted initiative registration wizard with full business case.",
    timestamp: "2026-08-01T09:00:00Z",
  },
  {
    id: "aud_2",
    approvalId: "app_1",
    actor: "Alex Rivera (VP Eng)",
    action: "APPROVE",
    previousStage: "SUBMITTED",
    newStage: "EXECUTIVE_REVIEW",
    reason: "Engineering review complete; architecture approved.",
    timestamp: "2026-08-03T14:30:00Z",
  },
];

export async function getApprovalsQueue(): Promise<ApprovalItem[]> {
  return MOCK_APPROVAL_ITEMS;
}

export async function getWorkflowTasks(): Promise<WorkflowTask[]> {
  return MOCK_TASKS;
}

export async function getWorkflowComments(approvalId: string): Promise<WorkflowComment[]> {
  return MOCK_COMMENTS.filter((c) => c.approvalId === approvalId);
}

export async function getWorkflowAuditLogs(approvalId: string): Promise<WorkflowAuditLog[]> {
  return MOCK_AUDIT_LOGS.filter((a) => a.approvalId === approvalId);
}

export async function getGovernanceMetrics(): Promise<GovernanceMetrics> {
  return calculateGovernanceMetrics(MOCK_APPROVAL_ITEMS);
}

export async function executeApprovalAction(
  item: ApprovalItem,
  action: ApprovalAction,
  reason?: string
): Promise<ApprovalItem> {
  const newStage = executeActionTransition(item.currentStage, action);
  return {
    ...item,
    currentStage: newStage,
  };
}
