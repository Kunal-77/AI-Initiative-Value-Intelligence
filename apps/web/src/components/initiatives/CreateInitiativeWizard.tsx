"use client";

import React, { useState } from "react";
import { Dialog, DialogHeader, DialogTitle, DialogDescription, DialogContent, DialogFooter, Button, Label, Input, Textarea, Select } from "../ui";
import { CheckCircle2, ArrowRight, ArrowLeft, Building2, DollarSign, Target, Users, ShieldCheck } from "lucide-react";

export interface CreateInitiativeFormData {
  name: string;
  businessArea: string;
  owner: string;
  problemStatement: string;
  proposedIntervention: string;
  expectedOutcome: string;
  plannedBudget: string;
  currency: string;
  targetMetricName: string;
  targetMetricValue: string;
  executiveSponsor: string;
  projectLead: string;
  plannedStartDate: string;
}

export interface CreateInitiativeWizardProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: CreateInitiativeFormData) => Promise<void>;
}

const INITIAL_FORM: CreateInitiativeFormData = {
  name: "",
  businessArea: "Operations & Care",
  owner: "Sarah Jenkins (CFO)",
  problemStatement: "",
  proposedIntervention: "",
  expectedOutcome: "",
  plannedBudget: "500000",
  currency: "USD",
  targetMetricName: "Ticket Resolution Velocity",
  targetMetricValue: "35%",
  executiveSponsor: "Marcus Vance (CTO)",
  projectLead: "David Miller (PM)",
  plannedStartDate: new Date().toISOString().split("T")[0],
};

const STEPS = [
  { id: 1, title: "Basic Information", icon: Building2 },
  { id: 2, title: "Business Objectives", icon: Target },
  { id: 3, title: "Financials", icon: DollarSign },
  { id: 4, title: "Success Metrics", icon: CheckCircle2 },
  { id: 5, title: "Stakeholders", icon: Users },
  { id: 6, title: "Review & Submit", icon: ShieldCheck },
];

export function CreateInitiativeWizard({
  isOpen,
  onClose,
  onSubmit,
}: CreateInitiativeWizardProps) {
  const [currentStep, setCurrentStep] = useState(1);
  const [form, setForm] = useState<CreateInitiativeFormData>(INITIAL_FORM);
  const [submitting, setSubmitting] = useState(false);

  const updateField = (field: keyof CreateInitiativeFormData, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleNext = () => {
    if (currentStep === 1 && !form.name.trim()) {
      alert("Initiative Name is required.");
      return;
    }
    if (currentStep < 6) {
      setCurrentStep((prev) => prev + 1);
    }
  };

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep((prev) => prev - 1);
    }
  };

  const handleSubmit = async () => {
    setSubmitting(true);
    try {
      await onSubmit(form);
      setForm(INITIAL_FORM);
      setCurrentStep(1);
      onClose();
    } catch (err: any) {
      alert(err.message || "Failed to create initiative.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Dialog isOpen={isOpen} onClose={onClose} className="max-w-3xl w-full">
      <DialogHeader>
        <div className="flex items-center justify-between">
          <div>
            <DialogTitle className="text-base font-bold text-foreground">
              Define & Register New AI Initiative
            </DialogTitle>
            <DialogDescription className="text-xs text-muted-foreground">
              Step {currentStep} of 6 — {STEPS[currentStep - 1].title}
            </DialogDescription>
          </div>
          <span className="text-xs font-mono px-2 py-0.5 rounded bg-secondary text-muted-foreground border border-border">
            Phase 2 Enterprise Wizard
          </span>
        </div>

        {/* Step Indicator Bar */}
        <div className="grid grid-cols-6 gap-1 mt-4">
          {STEPS.map((step) => {
            const Icon = step.icon;
            const isActive = step.id === currentStep;
            const isDone = step.id < currentStep;

            return (
              <button
                key={step.id}
                type="button"
                onClick={() => isDone && setCurrentStep(step.id)}
                disabled={!isDone && !isActive}
                className={`flex flex-col items-center gap-1 p-2 rounded-lg text-center transition-all ${
                  isActive
                    ? "bg-accent/15 text-accent border border-accent/30 font-bold"
                    : isDone
                    ? "bg-secondary text-foreground hover:bg-secondary/80"
                    : "bg-secondary/20 text-muted-foreground opacity-50 cursor-not-allowed"
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span className="text-[10px] hidden sm:block truncate w-full">{step.title}</span>
              </button>
            );
          })}
        </div>
      </DialogHeader>

      <DialogContent className="py-4">
        {/* Step 1: Basic Information */}
        {currentStep === 1 && (
          <div className="space-y-4">
            <div className="flex flex-col gap-1">
              <Label required>Initiative Name</Label>
              <Input
                value={form.name}
                onChange={(e) => updateField("name", e.target.value)}
                placeholder="e.g. Customer Support AI Triage Engine"
                required
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex flex-col gap-1">
                <Label required>Business Area</Label>
                <Select
                  value={form.businessArea}
                  onChange={(e) => updateField("businessArea", e.target.value)}
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
                  value={form.owner}
                  onChange={(e) => updateField("owner", e.target.value)}
                  placeholder="e.g. Sarah Jenkins (CFO)"
                />
              </div>
            </div>

            <div className="flex flex-col gap-1">
              <Label>Planned Start Date</Label>
              <Input
                type="date"
                value={form.plannedStartDate}
                onChange={(e) => updateField("plannedStartDate", e.target.value)}
              />
            </div>
          </div>
        )}

        {/* Step 2: Business Objectives */}
        {currentStep === 2 && (
          <div className="space-y-4">
            <div className="flex flex-col gap-1">
              <Label>Problem Statement</Label>
              <Textarea
                value={form.problemStatement}
                onChange={(e) => updateField("problemStatement", e.target.value)}
                placeholder="What operational bottleneck or cost inefficiency does this solve?"
                rows={3}
              />
            </div>

            <div className="flex flex-col gap-1">
              <Label>Proposed AI Intervention</Label>
              <Textarea
                value={form.proposedIntervention}
                onChange={(e) => updateField("proposedIntervention", e.target.value)}
                placeholder="What AI architecture, fine-tuned model, or automation flow is being deployed?"
                rows={3}
              />
            </div>

            <div className="flex flex-col gap-1">
              <Label>Expected Business Outcome</Label>
              <Input
                value={form.expectedOutcome}
                onChange={(e) => updateField("expectedOutcome", e.target.value)}
                placeholder="e.g. Reduce Tier-1 support resolution latency by 35%"
              />
            </div>
          </div>
        )}

        {/* Step 3: Financial Information */}
        {currentStep === 3 && (
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex flex-col gap-1">
                <Label required>Planned Initial Budget</Label>
                <Input
                  type="number"
                  value={form.plannedBudget}
                  onChange={(e) => updateField("plannedBudget", e.target.value)}
                  placeholder="500000"
                />
              </div>

              <div className="flex flex-col gap-1">
                <Label>Currency</Label>
                <Select
                  value={form.currency}
                  onChange={(e) => updateField("currency", e.target.value)}
                >
                  <option value="USD">USD ($)</option>
                  <option value="EUR">EUR (€)</option>
                  <option value="GBP">GBP (£)</option>
                </Select>
              </div>
            </div>

            <div className="p-4 rounded-lg bg-accent/5 border border-accent/20 space-y-1">
              <p className="text-xs font-bold text-accent">Budget Utilization Note</p>
              <p className="text-[11px] text-muted-foreground">
                Planned budget includes GPU inference allocation (45%), LLM API licensing (30%), and engineering integration (25%).
              </p>
            </div>
          </div>
        )}

        {/* Step 4: Success Metrics */}
        {currentStep === 4 && (
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex flex-col gap-1">
                <Label>Primary Target Metric Name</Label>
                <Input
                  value={form.targetMetricName}
                  onChange={(e) => updateField("targetMetricName", e.target.value)}
                  placeholder="e.g. Ticket Resolution Velocity"
                />
              </div>

              <div className="flex flex-col gap-1">
                <Label>Target Value Improvement</Label>
                <Input
                  value={form.targetMetricValue}
                  onChange={(e) => updateField("targetMetricValue", e.target.value)}
                  placeholder="e.g. 35% reduction"
                />
              </div>
            </div>

            <p className="text-xs text-muted-foreground">
              Additional metrics and historical baselines can be attached after initiative registration in the Measurement Plan tab.
            </p>
          </div>
        )}

        {/* Step 5: Stakeholders */}
        {currentStep === 5 && (
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex flex-col gap-1">
                <Label>Executive Sponsor</Label>
                <Input
                  value={form.executiveSponsor}
                  onChange={(e) => updateField("executiveSponsor", e.target.value)}
                  placeholder="e.g. Marcus Vance (CTO)"
                />
              </div>

              <div className="flex flex-col gap-1">
                <Label>Project Lead</Label>
                <Input
                  value={form.projectLead}
                  onChange={(e) => updateField("projectLead", e.target.value)}
                  placeholder="e.g. David Miller (PM)"
                />
              </div>
            </div>
          </div>
        )}

        {/* Step 6: Review & Submit */}
        {currentStep === 6 && (
          <div className="space-y-4 bg-secondary/30 p-4 rounded-xl border border-border">
            <h4 className="text-sm font-bold text-foreground flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-emerald-500" />
              Summary Review
            </h4>

            <div className="grid grid-cols-2 gap-3 text-xs">
              <div>
                <span className="text-muted-foreground block">Initiative Name:</span>
                <span className="font-semibold text-foreground">{form.name || "Unspecified"}</span>
              </div>
              <div>
                <span className="text-muted-foreground block">Business Area:</span>
                <span className="font-semibold text-foreground">{form.businessArea}</span>
              </div>
              <div>
                <span className="text-muted-foreground block">Planned Budget:</span>
                <span className="font-mono font-semibold text-foreground">${Number(form.plannedBudget).toLocaleString()} {form.currency}</span>
              </div>
              <div>
                <span className="text-muted-foreground block">Target Metric:</span>
                <span className="font-semibold text-foreground">{form.targetMetricName} ({form.targetMetricValue})</span>
              </div>
              <div>
                <span className="text-muted-foreground block">Executive Sponsor:</span>
                <span className="font-semibold text-foreground">{form.executiveSponsor}</span>
              </div>
              <div>
                <span className="text-muted-foreground block">Project Lead:</span>
                <span className="font-semibold text-foreground">{form.projectLead}</span>
              </div>
            </div>
          </div>
        )}
      </DialogContent>

      <DialogFooter className="flex justify-between items-center sm:justify-between">
        <Button
          type="button"
          onClick={handleBack}
          disabled={currentStep === 1 || submitting}
          variant="secondary"
          className="text-xs"
        >
          <ArrowLeft className="w-3.5 h-3.5 mr-1" />
          Back
        </Button>

        <div className="flex gap-2">
          <Button
            type="button"
            onClick={onClose}
            variant="secondary"
            className="text-xs"
          >
            Cancel
          </Button>

          {currentStep < 6 ? (
            <Button
              type="button"
              onClick={handleNext}
              variant="primary"
              className="text-xs"
            >
              Next Step
              <ArrowRight className="w-3.5 h-3.5 ml-1" />
            </Button>
          ) : (
            <Button
              type="button"
              onClick={handleSubmit}
              loading={submitting}
              loadingText="Registering..."
              variant="primary"
              className="text-xs"
            >
              Confirm & Submit
            </Button>
          )}
        </div>
      </DialogFooter>
    </Dialog>
  );
}
