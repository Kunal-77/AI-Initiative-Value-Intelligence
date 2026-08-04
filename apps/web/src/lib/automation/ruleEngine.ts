/**
 * Pure TypeScript Automation Rule Engine
 * Consumes events from the shared Phase 7 Enterprise Event Bus.
 */

import { globalEventBus } from "../integration/eventBus";
import { PlatformEvent } from "../../types/integration";
import { NotificationItem } from "../../types/notification";

export type AutomationTrigger =
  | "ON_INITIATIVE_CREATED"
  | "ON_BUDGET_EXCEEDS_THRESHOLD"
  | "ON_RECOMMENDATION_GENERATED"
  | "ON_APPROVAL_COMPLETED"
  | "ON_SECURITY_ALERT";

export interface AutomationRuleCondition {
  field: string;
  operator: "GREATER_THAN" | "LESS_THAN" | "EQUALS" | "CONTAINS";
  value: any;
}

export interface AutomationRuleAction {
  actionType: "CREATE_NOTIFICATION" | "ASSIGN_TASK" | "UPDATE_STATUS" | "WEBHOOK_TRIGGER";
  targetPayload: any;
}

export interface AutomationRule {
  id: string;
  name: string;
  description: string;
  trigger: AutomationTrigger;
  conditions: AutomationRuleCondition[];
  actions: AutomationRuleAction[];
  enabled: boolean;
}

export class AutomationRuleEngine {
  private rules: AutomationRule[] = [];
  private generatedNotifications: NotificationItem[] = [];

  constructor() {
    this.registerDefaultRules();
    this.listenToSharedEventBus();
  }

  private registerDefaultRules() {
    this.rules = [
      {
        id: "rule_budget_alert",
        name: "High Capital Spend Governance Alert",
        description: "If requested budget exceeds $500,000, automatically trigger Executive Review Task and notify CFO.",
        trigger: "ON_INITIATIVE_CREATED",
        conditions: [{ field: "requestedBudget", operator: "GREATER_THAN", value: 500000 }],
        actions: [
          {
            actionType: "CREATE_NOTIFICATION",
            targetPayload: {
              title: "High Capital Spend Initiative Created",
              type: "WORKFLOW",
              priority: "HIGH",
            },
          },
        ],
        enabled: true,
      },
      {
        id: "rule_ai_signal",
        name: "High Confidence AI Signal Notification",
        description: "If AI Studio recommendation generates confidence >= 90%, send high-priority decision notification.",
        trigger: "ON_RECOMMENDATION_GENERATED",
        conditions: [{ field: "confidenceScore", operator: "GREATER_THAN", value: 89 }],
        actions: [
          {
            actionType: "CREATE_NOTIFICATION",
            targetPayload: {
              title: "High Confidence AI Signal Ready",
              type: "AI_RECOMMENDATION",
              priority: "HIGH",
            },
          },
        ],
        enabled: true,
      },
    ];
  }

  private listenToSharedEventBus() {
    globalEventBus.subscribe("*", (event: PlatformEvent) => {
      this.evaluateEvent(event);
    });
  }

  public evaluateEvent(event: PlatformEvent) {
    this.rules.forEach((rule) => {
      if (!rule.enabled) return;

      // Evaluate trigger
      const matchesTrigger =
        (event.eventType === "INITIATIVE_CREATED" && rule.trigger === "ON_INITIATIVE_CREATED") ||
        (event.eventType === "RECOMMENDATION_GENERATED" && rule.trigger === "ON_RECOMMENDATION_GENERATED");

      if (matchesTrigger) {
        // Execute Actions
        rule.actions.forEach((act) => {
          if (act.actionType === "CREATE_NOTIFICATION") {
            const notif: NotificationItem = {
              id: `notif_auto_${Date.now()}`,
              title: act.targetPayload.title,
              message: `${event.entityName} triggered automated workflow policy: ${rule.name}`,
              type: act.targetPayload.type,
              priority: act.targetPayload.priority,
              read: false,
              pinned: false,
              archived: false,
              timestamp: new Date().toISOString(),
              actionHref: "/business/approvals",
            };
            this.generatedNotifications.unshift(notif);
          }
        });
      }
    });
  }

  public getRules(): AutomationRule[] {
    return this.rules;
  }

  public getGeneratedNotifications(): NotificationItem[] {
    return this.generatedNotifications;
  }

  public toggleRule(ruleId: string): void {
    const r = this.rules.find((item) => item.id === ruleId);
    if (r) r.enabled = !r.enabled;
  }
}

export const defaultAutomationEngine = new AutomationRuleEngine();
