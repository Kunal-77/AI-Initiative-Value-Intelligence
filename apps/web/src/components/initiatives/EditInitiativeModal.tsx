"use client";

import React, { useState, useEffect } from "react";
import { Dialog, DialogHeader, DialogTitle, DialogDescription, DialogContent, DialogFooter, Button, Label, Input, Textarea, Select } from "../ui";
import { InitiativeModel, InitiativeStatus, InitiativeHealth } from "../../lib/initiativeStore";
import { AlertTriangle } from "lucide-react";

export interface EditInitiativeModalProps {
  isOpen: boolean;
  initiative: InitiativeModel | null;
  onClose: () => void;
  onSave: (updated: Partial<InitiativeModel>) => Promise<void>;
}

export function EditInitiativeModal({
  isOpen,
  initiative,
  onClose,
  onSave,
}: EditInitiativeModalProps) {
  const [name, setName] = useState("");
  const [businessArea, setBusinessArea] = useState("");
  const [owner, setOwner] = useState("");
  const [executiveSponsor, setExecutiveSponsor] = useState("");
  const [projectLead, setProjectLead] = useState("");
  const [plannedBudget, setPlannedBudget] = useState("");
  const [currency, setCurrency] = useState("USD");
  const [status, setStatus] = useState<InitiativeStatus>("SUBMITTED");
  const [health, setHealth] = useState<InitiativeHealth>("Healthy");
  const [problemStatement, setProblemStatement] = useState("");
  const [aiIntervention, setAiIntervention] = useState("");
  const [expectedBusinessOutcome, setExpectedBusinessOutcome] = useState("");
  const [targetMetric, setTargetMetric] = useState("");
  const [targetImprovement, setTargetImprovement] = useState("");

  const [isDirty, setIsDirty] = useState(false);
  const [showUnsavedWarning, setShowUnsavedWarning] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (initiative) {
      setName(initiative.name || "");
      setBusinessArea(initiative.businessArea || "Operations & Care");
      setOwner(initiative.owner || "");
      setExecutiveSponsor(initiative.executiveSponsor || "");
      setProjectLead(initiative.projectLead || "");
      setPlannedBudget(initiative.plannedBudget || "");
      setCurrency(initiative.currency || "USD");
      setStatus(initiative.status || "SUBMITTED");
      setHealth(initiative.health || "Healthy");
      setProblemStatement(initiative.problemStatement || "");
      setAiIntervention(initiative.aiIntervention || "");
      setExpectedBusinessOutcome(initiative.expectedBusinessOutcome || "");
      setTargetMetric(initiative.targetMetric || "");
      setTargetImprovement(initiative.targetImprovement || "");
      setIsDirty(false);
      setShowUnsavedWarning(false);
    }
  }, [initiative, isOpen]);

  const handleChange = (setter: (v: any) => void, val: any) => {
    setter(val);
    setIsDirty(true);
  };

  const handleClose = () => {
    if (isDirty) {
      setShowUnsavedWarning(true);
    } else {
      onClose();
    }
  };

  const confirmClose = () => {
    setShowUnsavedWarning(false);
    setIsDirty(false);
    onClose();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    setSubmitting(true);
    try {
      await onSave({
        name,
        businessArea,
        owner,
        executiveSponsor,
        projectLead,
        plannedBudget,
        currency,
        status,
        health,
        problemStatement,
        aiIntervention,
        expectedBusinessOutcome,
        targetMetric,
        targetImprovement,
      });
      setIsDirty(false);
      onClose();
    } catch (err: any) {
      alert(err.message || "Failed to update initiative.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <>
      <Dialog isOpen={isOpen && !showUnsavedWarning} onClose={handleClose} className="max-w-2xl w-full">
        <form onSubmit={handleSubmit} className="contents">
          <DialogHeader>
            <DialogTitle className="text-base font-bold text-foreground">
              Edit Initiative — {initiative?.name}
            </DialogTitle>
            <DialogDescription className="text-xs text-muted-foreground">
              Update strategic scope, ownership, target metrics, or status.
            </DialogDescription>
          </DialogHeader>

          <DialogContent className="space-y-4 py-3 max-h-[70vh] overflow-y-auto pr-1">
            <div className="flex flex-col gap-1">
              <Label required>Initiative Name</Label>
              <Input
                value={name}
                onChange={(e) => handleChange(setName, e.target.value)}
                required
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex flex-col gap-1">
                <Label>Business Area</Label>
                <Select
                  value={businessArea}
                  onChange={(e) => handleChange(setBusinessArea, e.target.value)}
                >
                  <option value="Operations & Care">Operations & Care</option>
                  <option value="Software Engineering">Software Engineering</option>
                  <option value="Finance & Risk Analytics">Finance & Risk Analytics</option>
                  <option value="Legal & Compliance">Legal & Compliance</option>
                  <option value="Logistics & Supply Chain">Logistics & Supply Chain</option>
                </Select>
              </div>

              <div className="flex flex-col gap-1">
                <Label>Primary Owner</Label>
                <Input
                  value={owner}
                  onChange={(e) => handleChange(setOwner, e.target.value)}
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex flex-col gap-1">
                <Label>Executive Sponsor</Label>
                <Input
                  value={executiveSponsor}
                  onChange={(e) => handleChange(setExecutiveSponsor, e.target.value)}
                />
              </div>

              <div className="flex flex-col gap-1">
                <Label>Project Lead</Label>
                <Input
                  value={projectLead}
                  onChange={(e) => handleChange(setProjectLead, e.target.value)}
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="flex flex-col gap-1 md:col-span-2">
                <Label>Planned Budget</Label>
                <Input
                  type="number"
                  value={plannedBudget}
                  onChange={(e) => handleChange(setPlannedBudget, e.target.value)}
                />
              </div>

              <div className="flex flex-col gap-1">
                <Label>Currency</Label>
                <Select
                  value={currency}
                  onChange={(e) => handleChange(setCurrency, e.target.value)}
                >
                  <option value="USD">USD ($)</option>
                  <option value="EUR">EUR (€)</option>
                  <option value="GBP">GBP (£)</option>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex flex-col gap-1">
                <Label>Lifecycle Status</Label>
                <Select
                  value={status}
                  onChange={(e) => handleChange(setStatus, e.target.value as any)}
                >
                  <option value="DRAFT">DRAFT</option>
                  <option value="SUBMITTED">SUBMITTED</option>
                  <option value="ACTIVE">ACTIVE</option>
                  <option value="PAUSED">PAUSED</option>
                  <option value="COMPLETED">COMPLETED</option>
                  <option value="CANCELLED">CANCELLED</option>
                  <option value="ARCHIVED">ARCHIVED</option>
                </Select>
              </div>

              <div className="flex flex-col gap-1">
                <Label>Portfolio Health</Label>
                <Select
                  value={health}
                  onChange={(e) => handleChange(setHealth, e.target.value as any)}
                >
                  <option value="Healthy">Healthy</option>
                  <option value="Risk">Risk</option>
                  <option value="Review">Review</option>
                </Select>
              </div>
            </div>

            <div className="flex flex-col gap-1">
              <Label>Problem Statement</Label>
              <Textarea
                value={problemStatement}
                onChange={(e) => handleChange(setProblemStatement, e.target.value)}
                rows={2}
              />
            </div>

            <div className="flex flex-col gap-1">
              <Label>AI Intervention</Label>
              <Textarea
                value={aiIntervention}
                onChange={(e) => handleChange(setAiIntervention, e.target.value)}
                rows={2}
              />
            </div>

            <div className="flex flex-col gap-1">
              <Label>Expected Business Outcome</Label>
              <Input
                value={expectedBusinessOutcome}
                onChange={(e) => handleChange(setExpectedBusinessOutcome, e.target.value)}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex flex-col gap-1">
                <Label>Target Metric Name</Label>
                <Input
                  value={targetMetric}
                  onChange={(e) => handleChange(setTargetMetric, e.target.value)}
                />
              </div>

              <div className="flex flex-col gap-1">
                <Label>Target Value Improvement</Label>
                <Input
                  value={targetImprovement}
                  onChange={(e) => handleChange(setTargetImprovement, e.target.value)}
                />
              </div>
            </div>
          </DialogContent>

          <DialogFooter>
            <Button
              type="button"
              onClick={handleClose}
              variant="secondary"
              className="text-xs"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              loading={submitting}
              loadingText="Saving..."
              variant="primary"
              className="text-xs"
            >
              Save Changes
            </Button>
          </DialogFooter>
        </form>
      </Dialog>

      {/* Unsaved Changes Confirmation Modal */}
      <Dialog isOpen={showUnsavedWarning} onClose={() => setShowUnsavedWarning(false)} className="max-w-md text-center">
        <DialogHeader>
          <DialogTitle className="text-amber-500 flex items-center justify-center gap-2">
            <AlertTriangle className="w-5 h-5" />
            Unsaved Changes
          </DialogTitle>
          <DialogDescription className="text-xs text-muted-foreground mt-2">
            You have unsaved changes to this initiative. Are you sure you want to discard them?
          </DialogDescription>
        </DialogHeader>

        <DialogFooter className="justify-center gap-3">
          <Button
            onClick={() => setShowUnsavedWarning(false)}
            variant="secondary"
            className="text-xs"
          >
            Keep Editing
          </Button>
          <Button
            onClick={confirmClose}
            variant="danger"
            className="text-xs"
          >
            Discard Changes
          </Button>
        </DialogFooter>
      </Dialog>
    </>
  );
}
