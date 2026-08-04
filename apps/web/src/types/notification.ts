/**
 * Strongly Typed Interfaces for Enterprise Notification Center & Subscriptions
 */

export type NotificationType =
  | "AI_RECOMMENDATION"
  | "WORKFLOW"
  | "FINANCIAL"
  | "PORTFOLIO"
  | "SECURITY"
  | "ADMIN"
  | "MENTION"
  | "SYSTEM";

export type NotificationPriority = "HIGH" | "MEDIUM" | "LOW";

export interface NotificationItem {
  id: string;
  title: string;
  message: string;
  type: NotificationType;
  priority: NotificationPriority;
  read: boolean;
  pinned: boolean;
  archived: boolean;
  timestamp: string;
  actionHref?: string;
}

export interface NotificationPreference {
  channel: "IN_APP" | "EMAIL" | "SLACK" | "TEAMS" | "WEBHOOK";
  category: NotificationType;
  enabled: boolean;
  digestFrequency: "INSTANT" | "DAILY" | "WEEKLY" | "CRITICAL_ONLY";
}
