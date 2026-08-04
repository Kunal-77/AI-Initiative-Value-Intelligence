/**
 * Integration Center Service Layer
 * Interfaces mapping 1:1 to future FastAPI /api/v1/integrations REST endpoints.
 */

import {
  ConnectorDefinition,
  WebhookDefinition,
  ApiKeyDefinition,
  SyncLogEntry,
  FieldMappingRule,
  ConnectorId,
} from "../../types/integration-center";

export const MOCK_CONNECTORS: ConnectorDefinition[] = [
  {
    id: "power_bi",
    name: "Microsoft Power BI",
    category: "Analytics & BI",
    description: "Export live ROI metrics, executive dashboards, and dataset streams to Power BI workspaces.",
    status: "CONNECTED",
    lastSync: "10m ago",
    syncHealth: 98,
    version: "v2.4",
    provider: "Microsoft Corporation",
    recordsSynced: 14250,
  },
  {
    id: "fabric",
    name: "Microsoft Fabric",
    category: "Analytics & BI",
    description: "Direct Lakehouse Delta Parquet synchronization for enterprise portfolio telemetry.",
    status: "CONNECTED",
    lastSync: "25m ago",
    syncHealth: 95,
    version: "v1.1",
    provider: "Microsoft Corporation",
    recordsSynced: 84200,
  },
  {
    id: "slack",
    name: "Slack Enterprise Grid",
    category: "Collaboration",
    description: "Broadcast automated approval requests, decision notifications, and executive AI summaries.",
    status: "CONNECTED",
    lastSync: "1m ago",
    syncHealth: 100,
    version: "v3.0",
    provider: "Salesforce Inc.",
    recordsSynced: 3200,
  },
  {
    id: "teams",
    name: "Microsoft Teams",
    category: "Collaboration",
    description: "Send interactive Adaptive Cards for governance gate sign-offs directly inside Teams channels.",
    status: "CONNECTED",
    lastSync: "5m ago",
    syncHealth: 96,
    version: "v2.0",
    provider: "Microsoft Corporation",
    recordsSynced: 2890,
  },
  {
    id: "jira",
    name: "Jira Enterprise",
    category: "Project & DevOps",
    description: "Synchronize epic milestones, sprint velocity, and initiative task status bi-directionally.",
    status: "CONNECTED",
    lastSync: "15m ago",
    syncHealth: 92,
    version: "v8.2",
    provider: "Atlassian",
    recordsSynced: 12400,
  },
  {
    id: "snowflake",
    name: "Snowflake Data Cloud",
    category: "Cloud Data Warehouse",
    description: "Automated incremental loading of financial ledger entries and DCF valuation tables.",
    status: "CONNECTED",
    lastSync: "1h ago",
    syncHealth: 99,
    version: "v5.0",
    provider: "Snowflake Inc.",
    recordsSynced: 512000,
  },
  {
    id: "servicenow",
    name: "ServiceNow SPM",
    category: "CRM & Enterprise",
    description: "Enterprise Strategic Portfolio Management alignment, budget caps, and SLA escalation gates.",
    status: "WARNING",
    lastSync: "3h ago",
    syncHealth: 78,
    version: "v4.1",
    provider: "ServiceNow Inc.",
    recordsSynced: 6100,
  },
];

export const MOCK_WEBHOOKS: WebhookDefinition[] = [
  {
    id: "wh_1",
    name: "Production Webhook: Executive Approval Event",
    endpointUrl: "https://api.acme.com/v1/webhooks/approvals",
    secretKey: "whsec_live_9f8a3b2c1d0e",
    direction: "OUTGOING",
    status: "ACTIVE",
    lastTriggered: "10m ago",
    deliveriesCount: 142,
    failureCount: 0,
  },
  {
    id: "wh_2",
    name: "Incoming Webhook: Jira Sprint Completion",
    endpointUrl: "https://valueintel.acme.com/api/v1/webhooks/jira",
    secretKey: "whsec_in_4e5f6a7b8c9d",
    direction: "INCOMING",
    status: "ACTIVE",
    lastTriggered: "1h ago",
    deliveriesCount: 890,
    failureCount: 2,
  },
];

export const MOCK_API_KEYS: ApiKeyDefinition[] = [
  {
    id: "key_1",
    name: "Power BI Direct Lake Connector Key",
    keyPrefix: "vi_live_pbi_9a...",
    scopes: ["initiatives:read", "financials:read", "portfolio:read"],
    rateLimitPerMin: 1000,
    lastUsed: "2m ago",
    status: "ACTIVE",
  },
  {
    id: "key_2",
    name: "Zapier & Make Automation Token",
    keyPrefix: "vi_live_zap_3f...",
    scopes: ["workflow:approve", "notifications:write"],
    rateLimitPerMin: 300,
    lastUsed: "1h ago",
    status: "ACTIVE",
  },
];

export const MOCK_SYNC_LOGS: SyncLogEntry[] = [
  {
    id: "slog_1",
    connectorId: "power_bi",
    connectorName: "Microsoft Power BI",
    syncType: "INCREMENTAL",
    recordsProcessed: 420,
    durationMs: 340,
    status: "SUCCESS",
    timestamp: "2026-08-04T13:00:00Z",
  },
  {
    id: "slog_2",
    connectorId: "snowflake",
    connectorName: "Snowflake Data Cloud",
    syncType: "FULL",
    recordsProcessed: 12500,
    durationMs: 1420,
    status: "SUCCESS",
    timestamp: "2026-08-04T12:30:00Z",
  },
  {
    id: "slog_3",
    connectorId: "servicenow",
    connectorName: "ServiceNow SPM",
    syncType: "INCREMENTAL",
    recordsProcessed: 15,
    durationMs: 890,
    status: "WARNING",
    timestamp: "2026-08-04T11:45:00Z",
    errorMessage: "API Rate limit warning: 85% quota consumed.",
  },
];

export const MOCK_MAPPINGS: FieldMappingRule[] = [
  { id: "map_1", externalField: "project_name", internalField: "name", transformation: "DIRECT" },
  { id: "map_2", externalField: "budget_allocated", internalField: "plannedBudget", transformation: "CURRENCY_CONVERT" },
  { id: "map_3", externalField: "creation_date", internalField: "createdDate", transformation: "PARSED_DATE" },
];

export async function getConnectors(): Promise<ConnectorDefinition[]> {
  return MOCK_CONNECTORS;
}

export async function getWebhooks(): Promise<WebhookDefinition[]> {
  return MOCK_WEBHOOKS;
}

export async function getApiKeys(): Promise<ApiKeyDefinition[]> {
  return MOCK_API_KEYS;
}

export async function getSyncLogs(): Promise<SyncLogEntry[]> {
  return MOCK_SYNC_LOGS;
}

export async function getFieldMappings(): Promise<FieldMappingRule[]> {
  return MOCK_MAPPINGS;
}

export async function toggleConnectorConnection(id: ConnectorId): Promise<ConnectorDefinition> {
  const c = MOCK_CONNECTORS.find((item) => item.id === id);
  if (c) {
    c.status = c.status === "CONNECTED" ? "DISCONNECTED" : "CONNECTED";
    return c;
  }
  throw new Error("Connector not found");
}

export async function triggerConnectorSync(id: ConnectorId): Promise<SyncLogEntry> {
  const c = MOCK_CONNECTORS.find((item) => item.id === id);
  const newLog: SyncLogEntry = {
    id: `slog_${Date.now()}`,
    connectorId: id,
    connectorName: c?.name || id,
    syncType: "INCREMENTAL",
    recordsProcessed: Math.floor(Math.random() * 500) + 50,
    durationMs: Math.floor(Math.random() * 400) + 200,
    status: "SUCCESS",
    timestamp: new Date().toISOString(),
  };
  if (c) {
    c.lastSync = "Just now";
    c.recordsSynced += newLog.recordsProcessed;
  }
  MOCK_SYNC_LOGS.unshift(newLog);
  return newLog;
}
