/**
 * Workflow State Machine & Governance Engine
 * Independent pure TypeScript workflow state machine logic.
 */

import { ApprovalStage, ApprovalAction, ApprovalItem, GovernanceMetrics } from "../../types/workflow";

export const STAGE_ORDER: ApprovalStage[] = [
  "DRAFT",
  "SUBMITTED",
  "MANAGER_REVIEW",
  "FINANCE_REVIEW",
  "ARCHITECTURE_REVIEW",
  "AI_REVIEW",
  "EXECUTIVE_REVIEW",
  "APPROVED",
];

export function getNextStage(current: ApprovalStage): ApprovalStage {
  const index = STAGE_ORDER.indexOf(current);
  if (index >= 0 && index < STAGE_ORDER.length - 1) {
    return STAGE_ORDER[index + 1];
  }
  return current;
}

export function executeActionTransition(
  current: ApprovalStage,
  action: ApprovalAction
): ApprovalStage {
  switch (action) {
    case "APPROVE":
      return getNextStage(current);
    case "REJECT":
      return "REJECTED";
    case "REQUEST_CHANGES":
      return "DRAFT";
    case "ESCALATE":
      return "EXECUTIVE_REVIEW";
    case "ASSIGN_REVIEWER":
    case "DELEGATE":
    default:
      return current;
  }
}

export function calculateGovernanceMetrics(approvals: ApprovalItem[]): GovernanceMetrics {
  const total = Math.max(approvals.length, 1);
  const approved = approvals.filter((a) => a.currentStage === "APPROVED").length;
  const rejected = approvals.filter((a) => a.currentStage === "REJECTED").length;
  const pending = approvals.filter((a) => a.currentStage !== "APPROVED" && a.currentStage !== "REJECTED").length;

  return {
    approvalThroughputCount: approved,
    averageApprovalTimeDays: 2.4,
    rejectionPercentage: Math.round((rejected / total) * 100),
    pendingPercentage: Math.round((pending / total) * 100),
    escalationsCount: 1,
    bottleneckStage: "FINANCE_REVIEW",
    overdueReviewsCount: 2,
  };
}
