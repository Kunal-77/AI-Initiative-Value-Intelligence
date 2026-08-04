/**
 * Strongly Typed Interfaces for Enterprise Integration Hub & Unified Workspace
 * Shared Event Models, Cross-Module Navigation, Global Search & Event Bus Architecture.
 */

export type EventType =
  | "INITIATIVE_CREATED"
  | "BUDGET_UPDATED"
  | "RECOMMENDATION_GENERATED"
  | "APPROVAL_COMPLETED"
  | "PORTFOLIO_UPDATED"
  | "BENEFIT_REALIZED"
  | "STAGE_TRANSITION";

export interface PlatformEvent<T = any> {
  id: string;
  eventType: EventType;
  entityId: string;
  entityName: string;
  entityType: "Initiative" | "Recommendation" | "Approval" | "FinancialRecord" | "Portfolio";
  actor: string;
  timestamp: string;
  payload?: T;
}

export interface CrossModuleLink {
  label: string;
  href: string;
  category: "Initiative" | "AI Studio" | "Financials" | "Portfolio" | "Governance";
  badge?: string;
}

export interface UnifiedTimelineEvent {
  id: string;
  timestamp: string;
  title: string;
  description: string;
  category: "AI" | "Financial" | "Workflow" | "Portfolio" | "System" | "User";
  actor: string;
  entityId?: string;
  entityName?: string;
  actionHref?: string;
}

export interface GlobalSearchResult {
  id: string;
  title: string;
  type: "Initiative" | "Recommendation" | "Expense" | "Approval" | "Report" | "Metric";
  subtitle: string;
  href: string;
  category: string;
}
