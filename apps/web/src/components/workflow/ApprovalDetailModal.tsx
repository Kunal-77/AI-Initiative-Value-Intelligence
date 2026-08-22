"use client";

import React, { useState } from "react";
import { Dialog, DialogHeader, DialogTitle, DialogDescription, DialogContent, DialogFooter, Button, Badge, Textarea, Label } from "../ui";
import { ApprovalItem, ApprovalAction } from "../../types/workflow";
import { WorkflowTimeline } from "./WorkflowTimeline";
import { ShieldCheck, Check, X, RefreshCw, ArrowRight, UserPlus, CornerUpRight, MessageSquare } from "lucide-react";

export interface ApprovalDetailModalProps {
  isOpen: boolean;
  approval: ApprovalItem | null;
  onClose: () => void;
  onAction: (item: ApprovalItem, action: ApprovalAction, reason?: string) => Promise<void>;
}

export function ApprovalDetailModal({
  isOpen,
  approval,
  onClose,
  onAction,
}: ApprovalDetailModalProps) {
  const [commentText, setCommentText] = useState("");
  const [submitting, setSubmitting] = useState(false);

  if (!approval) return null;

  const handleExecuteAction = async (action: ApprovalAction) => {
    setSubmitting(true);
    try {
      await onAction(approval, action, commentText);
      setCommentText("");
      onClose();
    } catch (err: any) {
      alert(err.message || "Failed to execute workflow action.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Dialog isOpen={isOpen} onClose={onClose} className="max-w-3xl w-full">
      <DialogHeader>
        <div className="flex items-center justify-between">
          <Badge variant={approval.currentStage === "APPROVED" ? "ACTIVE" : "SUBMITTED"}>
            Stage: {approval.currentStage}
          </Badge>
          <span className="text-xs font-mono text-muted-foreground">Due: {approval.dueDate}</span>
        </div>

        <DialogTitle className="text-lg font-bold text-foreground mt-2">
          {approval.initiativeName}
        </DialogTitle>
        <DialogDescription className="text-xs text-muted-foreground">
          Requested by <strong className="text-foreground">{approval.requestedBy}</strong> • Business Area: <strong className="text-foreground">{approval.businessArea}</strong>
        </DialogDescription>
      </DialogHeader>

      <DialogContent className="space-y-4 py-3 max-h-[70vh] overflow-y-auto pr-1">
        {/* Governance Lifecycle Visual Timeline */}
        <WorkflowTimeline currentStage={approval.currentStage} />

        {/* Business Justification & Expected Outcome */}
        <div className="p-4 rounded-xl bg-secondary/30 border border-border/80 space-y-2 text-xs">
          <h4 className="font-bold text-foreground flex items-center gap-1.5">
            <ShieldCheck className="w-4 h-4 text-blue-500 dark:text-blue-400" /> Business Case Justification & Value Impact
          </h4>
          <p className="text-muted-foreground leading-relaxed">{approval.expectedOutcome}</p>
        </div>

        {/* Financial & AI Signal Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
          <div className="p-3 rounded-lg bg-secondary/20 border border-border/80 space-y-1">
            <span className="text-[10px] uppercase font-bold text-muted-foreground block">Requested Capital Spend</span>
            <span className="text-lg font-extrabold font-mono text-foreground">${(approval.requestedBudget / 1000).toFixed(0)}k USD</span>
          </div>
          <div className="p-3 rounded-lg bg-cyan-500/5 border border-cyan-500/25 space-y-1">
            <span className="text-[10px] uppercase font-bold text-cyan-500 dark:text-cyan-400 block">AI Confidence Score</span>
            <span className="text-lg font-extrabold font-mono text-cyan-500 dark:text-cyan-400">{approval.aiConfidenceScore}% Score</span>
          </div>
          <div className="p-3 rounded-lg bg-secondary/20 border border-border/80 space-y-1">
            <span className="text-[10px] uppercase font-bold text-muted-foreground block">Evaluated Risk Level</span>
            <span className="text-lg font-extrabold font-mono text-foreground">{approval.riskLevel} Risk</span>
          </div>
        </div>

        {/* Executive Action Note Input */}
        <div className="space-y-1">
          <Label className="text-xs">Executive Note / Decision Rationale</Label>
          <Textarea
            value={commentText}
            onChange={(e) => setCommentText(e.target.value)}
            placeholder="Add decision rationale or change instructions..."
            rows={2}
            className="text-xs"
          />
        </div>
      </DialogContent>

      <DialogFooter className="flex flex-wrap justify-between items-center gap-2 sm:justify-between">
        <div className="flex items-center gap-1">
          <Button
            onClick={() => handleExecuteAction("REQUEST_CHANGES")}
            variant="secondary"
            loading={submitting}
            className="text-xs h-8"
          >
            <RefreshCw className="w-3.5 h-3.5 mr-1" /> Request Changes
          </Button>
          <Button
            onClick={() => handleExecuteAction("ESCALATE")}
            variant="secondary"
            loading={submitting}
            className="text-xs h-8 text-amber-500"
          >
            <CornerUpRight className="w-3.5 h-3.5 mr-1" /> Escalate
          </Button>
        </div>

        <div className="flex items-center gap-2">
          <Button
            onClick={() => handleExecuteAction("REJECT")}
            variant="danger"
            loading={submitting}
            className="text-xs h-8"
          >
            <X className="w-3.5 h-3.5 mr-1" /> Reject
          </Button>
          <Button
            onClick={() => handleExecuteAction("APPROVE")}
            variant="primary"
            loading={submitting}
            className="text-xs h-8"
          >
            <Check className="w-3.5 h-3.5 mr-1" /> Approve Initiative
          </Button>
        </div>
      </DialogFooter>
    </Dialog>
  );
}
