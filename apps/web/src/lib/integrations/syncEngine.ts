/**
 * Data Synchronization & Field Mapping Engine
 */

import { ConnectorDefinition, FieldMappingRule, SyncLogEntry } from "../../types/integration-center";

export function calculateIntegrationHealth(connectors: ConnectorDefinition[]): number {
  if (connectors.length === 0) return 100;
  const total = connectors.reduce((sum, c) => sum + c.syncHealth, 0);
  return Math.round(total / connectors.length);
}

export function transformFieldValue(value: any, transformation: FieldMappingRule["transformation"]): any {
  if (value === undefined || value === null) return value;
  switch (transformation) {
    case "UPPERCASE":
      return String(value).toUpperCase();
    case "PARSED_DATE":
      return new Date(value).toISOString();
    case "CURRENCY_CONVERT":
      return Number(value) * 1.0; // USD Base
    case "DIRECT":
    default:
      return value;
  }
}

export function mapExternalPayload(
  payload: Record<string, any>,
  rules: FieldMappingRule[]
): Record<string, any> {
  const result: Record<string, any> = {};
  rules.forEach((rule) => {
    if (payload[rule.externalField] !== undefined) {
      result[rule.internalField] = transformFieldValue(payload[rule.externalField], rule.transformation);
    }
  });
  return result;
}
