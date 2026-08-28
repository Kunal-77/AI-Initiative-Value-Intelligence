"use client";

import { useState, useEffect, useRef } from "react";
import { useAuth, useOrganization } from "@clerk/nextjs";
import dynamic from "@/compat/dynamic";
import {
  AppHeader,
  ExecutiveDashboard,
  InitiativesTable,
  SkeletonMetricsRow,
  CreateInitiativeFormData,
} from "@/components/ui";

const CreateInitiativeWizard = dynamic(
  () => import("@/components/initiatives/CreateInitiativeWizard").then(mod => mod.CreateInitiativeWizard),
  { ssr: false }
);
const EditInitiativeModal = dynamic(
  () => import("@/components/initiatives/EditInitiativeModal").then(mod => mod.EditInitiativeModal),
  { ssr: false }
);
const DeleteInitiativeDialog = dynamic(
  () => import("@/components/initiatives/DeleteInitiativeDialog").then(mod => mod.DeleteInitiativeDialog),
  { ssr: false }
);
import {
  InitiativeModel,
  getStoredInitiatives,
  createCanonicalInitiative,
  updateCanonicalInitiative,
  deleteCanonicalInitiative,
} from "@/lib/initiativeStore";

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
      const token = await getToken();
      if (!token) throw new Error("No session token available.");
      const stored = await getStoredInitiatives(token);
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
    try {
      const token = await getToken();
      if (!token) throw new Error("No session token available.");
      await createCanonicalInitiative(token, {
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
      fetchInitiatives();
    } catch (err: any) {
      alert(err.message || "Failed to create initiative.");
    }
  };

  const handleSaveEdit = async (updated: Partial<InitiativeModel>) => {
    if (!editingItem) return;
    try {
      const token = await getToken();
      if (!token) throw new Error("No session token available.");
      await updateCanonicalInitiative(token, editingItem.id, updated);
      fetchInitiatives();
    } catch (err: any) {
      alert(err.message || "Failed to save edits.");
    }
  };

  const handleConfirmDelete = async (id: string) => {
    try {
      const token = await getToken();
      if (!token) throw new Error("No session token available.");
      await deleteCanonicalInitiative(token, id);
      fetchInitiatives();
    } catch (err: any) {
      alert(err.message || "Failed to delete initiative.");
    }
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
    <div className="min-h-screen bg-background text-foreground flex flex-col font-sans transition-colors animate-page-entrance">
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
