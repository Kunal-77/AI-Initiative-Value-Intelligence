/**
 * Shared Event Bus & Unified Timeline Engine
 * Pure TypeScript event dispatcher and cross-module aggregator.
 */

import { PlatformEvent, UnifiedTimelineEvent, GlobalSearchResult } from "../../types/integration";

type EventListener = (event: PlatformEvent) => void;

class EnterpriseEventBus {
  private listeners: Map<string, EventListener[]> = new Map();
  private eventHistory: PlatformEvent[] = [];

  subscribe(eventType: string, listener: EventListener): () => void {
    if (!this.listeners.has(eventType)) {
      this.listeners.set(eventType, []);
    }
    this.listeners.get(eventType)!.push(listener);

    return () => {
      const list = this.listeners.get(eventType) || [];
      this.listeners.set(
        eventType,
        list.filter((l) => l !== listener)
      );
    };
  }

  publish(event: PlatformEvent): void {
    this.eventHistory.unshift(event);
    const list = this.listeners.get(event.eventType) || [];
    const wildcard = this.listeners.get("*") || [];
    [...list, ...wildcard].forEach((listener) => listener(event));
  }

  getHistory(): PlatformEvent[] {
    return this.eventHistory;
  }
}

export const globalEventBus = new EnterpriseEventBus();

export function aggregateUnifiedTimeline(
  events: PlatformEvent[]
): UnifiedTimelineEvent[] {
  return events.map((evt) => {
    let category: UnifiedTimelineEvent["category"] = "System";
    if (evt.eventType === "RECOMMENDATION_GENERATED") category = "AI";
    else if (evt.eventType === "BUDGET_UPDATED" || evt.eventType === "BENEFIT_REALIZED") category = "Financial";
    else if (evt.eventType === "APPROVAL_COMPLETED" || evt.eventType === "STAGE_TRANSITION") category = "Workflow";
    else if (evt.eventType === "PORTFOLIO_UPDATED") category = "Portfolio";
    else if (evt.eventType === "INITIATIVE_CREATED") category = "User";

    return {
      id: evt.id,
      timestamp: evt.timestamp,
      title: `${evt.eventType.replace("_", " ")} - ${evt.entityName}`,
      description: `Action triggered by ${evt.actor}`,
      category,
      actor: evt.actor,
      entityId: evt.entityId,
      entityName: evt.entityName,
      actionHref: getHrefForEntity(evt.entityType, evt.entityId),
    };
  });
}

export function getHrefForEntity(entityType: string, entityId: string): string {
  switch (entityType) {
    case "Initiative":
      return `/business/initiatives/${entityId}`;
    case "Recommendation":
      return `/business/ai-studio`;
    case "Approval":
      return `/business/approvals`;
    case "FinancialRecord":
      return `/business/financials`;
    case "Portfolio":
    default:
      return `/business/portfolio`;
  }
}

export function performGlobalSearch(
  query: string,
  searchIndex: GlobalSearchResult[]
): GlobalSearchResult[] {
  if (!query.trim()) return [];
  const q = query.toLowerCase().trim();
  return searchIndex.filter(
    (item) =>
      item.title.toLowerCase().includes(q) ||
      item.subtitle.toLowerCase().includes(q) ||
      item.type.toLowerCase().includes(q) ||
      item.category.toLowerCase().includes(q)
  );
}
