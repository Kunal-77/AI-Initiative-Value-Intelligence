"use client";

import React, { useState, useEffect } from "react";
import { useAuth } from "@clerk/nextjs";
import {
  AppHeader,
  IntegrationHealthBanner,
  ConnectorCatalogGrid,
  WebhookManagementCard,
  ApiKeyManagementCard,
  DataMappingTable,
  SyncLogsTable,
  UnifiedLifecycleBar,
  CrossModuleNav,
  SkeletonMetricsRow,
  LazyViewport,
  SkeletonCard,
  SkeletonTable,
} from "@/components/ui";
import {
  getConnectors,
  getWebhooks,
  getApiKeys,
  getSyncLogs,
  getFieldMappings,
  toggleConnectorConnection,
  triggerConnectorSync,
} from "@/services/integrations/integrationCenterService";
import {
  ConnectorDefinition,
  WebhookDefinition,
  ApiKeyDefinition,
  SyncLogEntry,
  FieldMappingRule,
  ConnectorId,
} from "@/types/integration-center";

export default function BusinessIntegrationsPage() {
  const { orgId } = useAuth();

  const [connectors, setConnectors] = useState<ConnectorDefinition[]>([]);
  const [webhooks, setWebhooks] = useState<WebhookDefinition[]>([]);
  const [apiKeys, setApiKeys] = useState<ApiKeyDefinition[]>([]);
  const [syncLogs, setSyncLogs] = useState<SyncLogEntry[]>([]);
  const [mappings, setMappings] = useState<FieldMappingRule[]>([]);
  const [loading, setLoading] = useState(true);

  const loadData = async () => {
    setLoading(true);
    try {
      const [cRes, wRes, kRes, lRes, mRes] = await Promise.all([
        getConnectors(),
        getWebhooks(),
        getApiKeys(),
        getSyncLogs(),
        getFieldMappings(),
      ]);
      setConnectors(cRes);
      setWebhooks(wRes);
      setApiKeys(kRes);
      setSyncLogs(lRes);
      setMappings(mRes);
    } catch (err) {
      console.error("Integrations fetch failed:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (orgId) {
      loadData();
    }
  }, [orgId]);

  const handleToggleConnect = async (id: ConnectorId) => {
    const updated = await toggleConnectorConnection(id);
    setConnectors((prev) => prev.map((c) => (c.id === id ? updated : c)));
  };

  const handleTriggerSync = async (id: ConnectorId) => {
    const newLog = await triggerConnectorSync(id);
    setSyncLogs((prev) => [newLog, ...prev]);
    setConnectors((prev) => [...prev]);
  };

  if (!orgId || loading) {
    return (
      <div className="min-h-screen bg-background text-foreground flex flex-col font-sans">
        <AppHeader badge="Integration Center" />
        <main className="flex-1 max-w-[1536px] w-full mx-auto px-4 sm:px-6 py-8 space-y-6">
          <SkeletonMetricsRow />
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col font-sans transition-colors animate-page-entrance">
      <AppHeader badge="Integration Center" />

      <main className="flex-1 max-w-[1536px] w-full mx-auto px-4 sm:px-6 py-8 space-y-8">
        {/* Phase 7: Unified Lifecycle Navigation Bar */}
        <UnifiedLifecycleBar activeStep="portfolio" />

        {/* Phase 7: Contextual Cross-Module Navigation */}
        <CrossModuleNav />

        {/* 1. Integration Health Scorecard Banner */}
        <IntegrationHealthBanner connectors={connectors} />

        {/* 2. Enterprise Connector Catalog Grid */}
        <ConnectorCatalogGrid
          connectors={connectors}
          onToggleConnect={handleToggleConnect}
          onTriggerSync={handleTriggerSync}
        />

        {/* 3. Main Grid: Webhooks & API Keys (Left 6 / Right 6) */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">
          <LazyViewport name="Webhook Endpoints Registry" placeholder={<SkeletonCard />} minHeight="250px">
            {() => <WebhookManagementCard webhooks={webhooks} />}
          </LazyViewport>
          <LazyViewport name="API Access Keys Vault" placeholder={<SkeletonCard />} minHeight="250px">
            {() => <ApiKeyManagementCard apiKeys={apiKeys} />}
          </LazyViewport>
        </div>
 
        {/* 4. Payload Field Mapping Table */}
        <LazyViewport name="Payload Field Mapper" placeholder={<SkeletonTable rows={4} />} minHeight="200px">
          {() => <DataMappingTable mappings={mappings} />}
        </LazyViewport>
 
        {/* 5. Synchronization Audit & Latency Logs */}
        <LazyViewport name="Connector Synchronizations Log" placeholder={<SkeletonTable rows={4} />} minHeight="200px">
          {() => <SyncLogsTable logs={syncLogs} />}
        </LazyViewport>
      </main>
    </div>
  );
}
