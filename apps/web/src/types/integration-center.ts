/**
 * Strongly Typed Interfaces for Enterprise Integrations & Connected Ecosystem
 */

export type ConnectorId =
  | "power_bi"
  | "fabric"
  | "slack"
  | "teams"
  | "jira"
  | "devops"
  | "github"
  | "salesforce"
  | "snowflake"
  | "servicenow"
  | "webhook"
  | "rest_api";

export type ConnectorCategory =
  | "Analytics & BI"
  | "Collaboration"
  | "Project & DevOps"
  | "CRM & Enterprise"
  | "Cloud Data Warehouse"
  | "Developer APIs";

export type ConnectorStatus = "CONNECTED" | "DISCONNECTED" | "WARNING" | "SYNCING" | "EXPIRED";

export interface ConnectorDefinition {
  id: ConnectorId;
  name: string;
  category: ConnectorCategory;
  description: string;
  status: ConnectorStatus;
  lastSync: string;
  syncHealth: number; // 0-100%
  version: string;
  provider: string;
  recordsSynced: number;
}

export interface WebhookDefinition {
  id: string;
  name: string;
  endpointUrl: string;
  secretKey: string;
  direction: "INCOMING" | "OUTGOING";
  status: "ACTIVE" | "PAUSED" | "FAILING";
  lastTriggered: string;
  deliveriesCount: number;
  failureCount: number;
}

export interface ApiKeyDefinition {
  id: string;
  name: string;
  keyPrefix: string;
  scopes: string[];
  rateLimitPerMin: number;
  lastUsed: string;
  status: "ACTIVE" | "REVOKED";
}

export interface SyncLogEntry {
  id: string;
  connectorId: ConnectorId;
  connectorName: string;
  syncType: "FULL" | "INCREMENTAL" | "MANUAL";
  recordsProcessed: number;
  durationMs: number;
  status: "SUCCESS" | "WARNING" | "FAILED";
  timestamp: string;
  errorMessage?: string;
}

export interface FieldMappingRule {
  id: string;
  externalField: string;
  internalField: string;
  transformation: "DIRECT" | "UPPERCASE" | "PARSED_DATE" | "CURRENCY_CONVERT";
}
