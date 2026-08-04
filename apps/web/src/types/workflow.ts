/**
 * Strongly Typed Interfaces for Workflow, Approvals & Governance Platform
 * Maps 1:1 with future FastAPI workflow & governance endpoints.
 */

export type ApprovalStage =
  | "DRAFT"
  | "SUBMITTED"
  | "MANAGER_REVIEW"
  | "FINANCE_REVIEW"
  | "ARCHITECTURE_REVIEW"
  | "AI_REVIEW"
  | "EXECUTIVE_REVIEW"
  | "APPROVED"
  | "REJECTED"
  | "CANCELLED"
  | "ARCHIVED";

export type ApprovalAction =
  | "APPROVE"
  | "REJECT"
  | "REQUEST_CHANGES"
  | "ASSIGN_REVIEWER"
  | "ESCALATE"
  | "DELEGATE";

export interface ApprovalItem {
  id: string;
  initiativeId: string;
  initiativeName: string;
  businessArea: string;
  requestedBy: string;
  owner: string;
  currentStage: ApprovalStage;
  requestedBudget: number;
  expectedOutcome: string;
  aiConfidenceScore: number;
  riskLevel: "Low" | "Medium" | "High";
  submittedDate: string;
  dueDate: string;
}

export interface WorkflowTask {
  id: string;
  approvalId: string;
  taskTitle: string;
  assignee: string;
  dueDate: string;
  priority: "High" | "Medium" | "Low";
  status: "PENDING" | "IN_PROGRESS" | "COMPLETED" | "OVERDUE";
  dependencies?: string[];
}

export interface WorkflowComment {
  id: string;
  approvalId: string;
  author: string;
  role: "Executive" | "Finance" | "Architecture" | "AI Engine" | "System";
  content: string;
  timestamp: string;
}

export interface WorkflowAuditLog {
  id: string;
  approvalId: string;
  actor: string;
  action: ApprovalAction | "STAGE_TRANSITION" | "COMMENT_ADDED";
  previousStage: ApprovalStage;
  newStage: ApprovalStage;
  reason?: string;
  timestamp: string;
}

export interface GovernanceMetrics {
  approvalThroughputCount: number;
  averageApprovalTimeDays: number;
  rejectionPercentage: number;
  pendingPercentage: number;
  escalationsCount: number;
  bottleneckStage: ApprovalStage;
  overdueReviewsCount: number;
}
