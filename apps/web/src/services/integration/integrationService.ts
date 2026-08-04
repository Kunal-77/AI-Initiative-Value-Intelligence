/**
 * Enterprise Integration Service Layer
 * Aggregates cross-module links, unified timeline logs, and global search indexes.
 */

import {
  PlatformEvent,
  UnifiedTimelineEvent,
  GlobalSearchResult,
  CrossModuleLink,
} from "../../types/integration";
import { aggregateUnifiedTimeline } from "../../lib/integration/eventBus";

export const MOCK_PLATFORM_EVENTS: PlatformEvent[] = [
  {
    id: "evt_1",
    eventType: "INITIATIVE_CREATED",
    entityId: "init_cs_auto",
    entityName: "Customer Support Automation",
    entityType: "Initiative",
    actor: "David Miller (PM)",
    timestamp: "2026-08-01T09:00:00Z",
  },
  {
    id: "evt_2",
    eventType: "RECOMMENDATION_GENERATED",
    entityId: "rec_gpu_opt",
    entityName: "Consolidate GPU Inference Clusters",
    entityType: "Recommendation",
    actor: "Value Intel AI Engine",
    timestamp: "2026-08-02T10:30:00Z",
  },
  {
    id: "evt_3",
    eventType: "BUDGET_UPDATED",
    entityId: "init_cs_auto",
    entityName: "Customer Support Automation",
    entityType: "FinancialRecord",
    actor: "Sarah Jenkins (CFO)",
    timestamp: "2026-08-02T14:15:00Z",
  },
  {
    id: "evt_4",
    eventType: "APPROVAL_COMPLETED",
    entityId: "app_1",
    entityName: "Customer Support Automation Approval",
    entityType: "Approval",
    actor: "Executive Review Board",
    timestamp: "2026-08-03T16:00:00Z",
  },
  {
    id: "evt_5",
    eventType: "BENEFIT_REALIZED",
    entityId: "ben_1",
    entityName: "Tier-1 Ticket Deflection Savings (+$1.48M)",
    entityType: "FinancialRecord",
    actor: "Sarah Jenkins (CFO)",
    timestamp: "2026-08-04T08:45:00Z",
  },
];

export const MOCK_SEARCH_INDEX: GlobalSearchResult[] = [
  {
    id: "srch_1",
    title: "Customer Support Automation",
    type: "Initiative",
    subtitle: "Operations & Care • $850k Budget • Active",
    href: "/business/initiatives/init_cs_auto",
    category: "Initiatives Directory",
  },
  {
    id: "srch_2",
    title: "Consolidate GPU Inference Clusters",
    type: "Recommendation",
    subtitle: "+$140k/yr Savings • 94% Confidence",
    href: "/business/ai-studio",
    category: "AI Value Studio",
  },
  {
    id: "srch_3",
    title: "NVIDIA A100 GPU Cloud Compute Cluster",
    type: "Expense",
    subtitle: "Cloud Compute • $265,000 Spend • Approved",
    href: "/business/financials",
    category: "Financial Ledger",
  },
  {
    id: "srch_4",
    title: "Customer Support Executive Sign-off",
    type: "Approval",
    subtitle: "Executive Review Stage • $850k Requested",
    href: "/business/approvals",
    category: "Governance Center",
  },
  {
    id: "srch_5",
    title: "Executive Board Briefing Report",
    type: "Report",
    subtitle: "Portfolio ROI & Strategic Alignment • PDF/PPT",
    href: "/business/portfolio",
    category: "Command Center",
  },
];

export async function getUnifiedTimelineEvents(): Promise<UnifiedTimelineEvent[]> {
  return aggregateUnifiedTimeline(MOCK_PLATFORM_EVENTS);
}

export async function getGlobalSearchIndex(): Promise<GlobalSearchResult[]> {
  return MOCK_SEARCH_INDEX;
}

export function getCrossModuleLinks(currentPath: string): CrossModuleLink[] {
  const links: CrossModuleLink[] = [
    { label: "Initiatives Directory", href: "/business/initiatives", category: "Initiative" },
    { label: "AI Value Studio", href: "/business/ai-studio", category: "AI Studio", badge: "AI" },
    { label: "Financial Metrics", href: "/business/financials", category: "Financials" },
    { label: "Command Center", href: "/business/portfolio", category: "Portfolio" },
    { label: "Approval Center", href: "/business/approvals", category: "Governance", badge: "Review" },
  ];
  return links.filter((link) => link.href !== currentPath);
}
