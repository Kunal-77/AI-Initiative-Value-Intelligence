/**
 * Notification Center Service Layer
 * REST API client signatures for enterprise notifications & preferences.
 */

import { NotificationItem, NotificationPreference } from "../../types/notification";
import { defaultAutomationEngine } from "../../lib/automation/ruleEngine";

export const MOCK_NOTIFICATIONS: NotificationItem[] = [
  {
    id: "notif_1",
    title: "GPU Cluster Optimization Recommendation",
    message: "AI Studio generated +$140k/yr compute savings recommendation (94% Confidence).",
    type: "AI_RECOMMENDATION",
    priority: "HIGH",
    read: false,
    pinned: true,
    archived: false,
    timestamp: "10m ago",
    actionHref: "/business/ai-studio",
  },
  {
    id: "notif_2",
    title: "Executive Sign-off Required: Support Automation",
    message: "Approval stage transitioned to EXECUTIVE_REVIEW ($850k requested).",
    type: "WORKFLOW",
    priority: "HIGH",
    read: false,
    pinned: false,
    archived: false,
    timestamp: "1h ago",
    actionHref: "/business/approvals",
  },
  {
    id: "notif_3",
    title: "Q2 Benefits Realization Target Achieved",
    message: "Realized benefits reached 101.8% of expected target ($4.94M total).",
    type: "FINANCIAL",
    priority: "MEDIUM",
    read: true,
    pinned: false,
    archived: false,
    timestamp: "3h ago",
    actionHref: "/business/financials",
  },
  {
    id: "notif_4",
    title: "@Sarah Jenkins mentioned you in discussion",
    message: "'Please review the SOC2 data masking compliance requirement.'",
    type: "MENTION",
    priority: "MEDIUM",
    read: false,
    pinned: false,
    archived: false,
    timestamp: "5h ago",
    actionHref: "/business/approvals",
  },
];

export const MOCK_NOTIF_PREFERENCES: NotificationPreference[] = [
  { channel: "IN_APP", category: "AI_RECOMMENDATION", enabled: true, digestFrequency: "INSTANT" },
  { channel: "EMAIL", category: "WORKFLOW", enabled: true, digestFrequency: "INSTANT" },
  { channel: "SLACK", category: "FINANCIAL", enabled: true, digestFrequency: "DAILY" },
  { channel: "TEAMS", category: "SECURITY", enabled: true, digestFrequency: "CRITICAL_ONLY" },
];

export async function getNotifications(): Promise<NotificationItem[]> {
  const autoNotifs = defaultAutomationEngine.getGeneratedNotifications();
  return [...autoNotifs, ...MOCK_NOTIFICATIONS];
}

export async function getNotificationPreferences(): Promise<NotificationPreference[]> {
  return MOCK_NOTIF_PREFERENCES;
}

export async function markNotificationAsRead(id: string): Promise<void> {
  const target = MOCK_NOTIFICATIONS.find((n) => n.id === id);
  if (target) target.read = true;
}

export async function toggleNotificationPin(id: string): Promise<void> {
  const target = MOCK_NOTIFICATIONS.find((n) => n.id === id);
  if (target) target.pinned = !target.pinned;
}
