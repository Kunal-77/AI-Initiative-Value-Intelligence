"use client";

import { useState, useEffect, useRef } from "react";
import { useAuth, useOrganization } from "@clerk/nextjs";
import {
  AppHeader,
  ExecutiveDashboard,
  InitiativesTable,
  CreateInitiativeWizard,
  EditInitiativeModal,
  DeleteInitiativeDialog,
  SkeletonMetricsRow,
  CreateInitiativeFormData,
} from "../../../components/ui";
import {
  InitiativeModel,
  getStoredInitiatives,
  createCanonicalInitiative,
  updateCanonicalInitiative,
  deleteCanonicalInitiative,
} from "../../../lib/initiativeStore";

export default function BusinessInitiativesPage() {
  const { getToken, orgId } = useAuth();
  const { organization } = useOrganization();
  const isMountedRef = useRef(true);

  useEffect(() => {
    isMountedRef.current = true;
    return () => {
      isMountedRef.current = false;
    };
  }, []);

  const [initiatives, setInitiatives] = useState<InitiativeModel[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Modals & Dialog State
  const [showWizard, setShowWizard] = useState(false);
  const [editingItem, setEditingItem] = useState<InitiativeModel | null>(null);
  const [deletingItem, setDeletingItem] = useState<InitiativeModel | null>(null);

  const fetchInitiatives = async () => {
    if (!orgId) return;

    if (isMountedRef.current) setLoading(true);
    if (isMountedRef.current) setError(null);
    try {
      // Seed & load from canonical store
      const stored = getStoredInitiatives();
      if (!isMountedRef.current) return;
      setInitiatives(stored);
    } catch (err: any) {
      console.error(err);
      if (!isMountedRef.current) return;
      setError(err.message || "An error occurred fetching initiatives.");
    } finally {
      if (isMountedRef.current) {
        setLoading(false);
      }
    }
  };

  useEffect(() => {
    fetchInitiatives();
  }, [orgId]);

  const handleWizardSubmit = async (formData: CreateInitiativeFormData) => {
    // Create in canonical store with full payload & default SUBMITTED status
    createCanonicalInitiative({
      name: formData.name,
      businessArea: formData.businessArea,
      owner: formData.owner,
      executiveSponsor: formData.executiveSponsor,
      projectLead: formData.projectLead,
      plannedBudget: formData.plannedBudget,
      currency: formData.currency,
      plannedStartDate: formData.plannedStartDate,
      problemStatement: formData.problemStatement,
      proposedIntervention: formData.proposedIntervention,
      expectedOutcome: formData.expectedOutcome,
      targetMetricName: formData.targetMetricName,
      targetMetricValue: formData.targetMetricValue,
      status: "SUBMITTED",
    });

    // Refresh list from store
    fetchInitiatives();
  };

  const handleSaveEdit = async (updated: Partial<InitiativeModel>) => {
    if (!editingItem) return;
    updateCanonicalInitiative(editingItem.id, updated);
    fetchInitiatives();
  };

  const handleConfirmDelete = async (id: string) => {
    deleteCanonicalInitiative(id);
    fetchInitiatives();
  };

  if (!orgId) {
    return (
      <div className="min-h-screen bg-background text-foreground flex flex-col font-sans">
        <AppHeader badge="Executive Portfolio" />
        <main className="flex-1 max-w-[1536px] w-full mx-auto px-4 sm:px-6 py-8 space-y-6">
          <SkeletonMetricsRow />
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col font-sans transition-colors">
      <AppHeader badge="Executive Portfolio" />

      <main className="flex-1 max-w-[1536px] w-full mx-auto px-4 sm:px-6 py-8 space-y-8">
        {/* Executive Master Dashboard */}
        <ExecutiveDashboard
          orgName={organization?.name || "Executive Enterprise Workspace"}
          loading={loading}
          error={error}
          onNewInitiative={() => setShowWizard(true)}
          onRunAiStudio={() => alert("Launching AI Value Studio Decision Intelligence...")}
        />

        {/* Phase 2.1: Canonical Initiatives Directory & Data Table */}
        <InitiativesTable
          initiatives={initiatives}
          loading={loading}
          error={error}
          onNewInitiative={() => setShowWizard(true)}
          onEdit={(item) => setEditingItem(item)}
          onDelete={(item) => setDeletingItem(item)}
        />
      </main>

      {/* 6-Step Registration Wizard Modal */}
      <CreateInitiativeWizard
        isOpen={showWizard}
        onClose={() => setShowWizard(false)}
        onSubmit={handleWizardSubmit}
      />

      {/* Edit Initiative Modal */}
      <EditInitiativeModal
        isOpen={!!editingItem}
        initiative={editingItem}
        onClose={() => setEditingItem(null)}
        onSave={handleSaveEdit}
      />

      {/* Soft Delete Confirmation Modal */}
      <DeleteInitiativeDialog
        isOpen={!!deletingItem}
        initiative={deletingItem}
        onClose={() => setDeletingItem(null)}
        onConfirmDelete={handleConfirmDelete}
      />
    </div>
  );
}
