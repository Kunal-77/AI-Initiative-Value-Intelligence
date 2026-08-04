"use client";

import React, { useState, useEffect } from "react";
import { useAuth } from "@clerk/nextjs";
import {
  AppHeader,
  GovernanceDashboard,
  ApprovalQueue,
  ApprovalDetailModal,
  TaskManagementCard,
  CommentThread,
  AuditLogStream,
  SkeletonMetricsRow,
  UnifiedLifecycleBar,
  CrossModuleNav,
} from "../../../components/ui";
import {
  getApprovalsQueue,
  getWorkflowTasks,
  getWorkflowComments,
  getWorkflowAuditLogs,
  getGovernanceMetrics,
  executeApprovalAction,
} from "../../../services/workflow/workflowService";
import {
  ApprovalItem,
  WorkflowTask,
  WorkflowComment,
  WorkflowAuditLog,
  GovernanceMetrics,
  ApprovalAction,
} from "../../../types/workflow";

export default function BusinessApprovalsPage() {
  const { orgId } = useAuth();

  const [approvals, setApprovals] = useState<ApprovalItem[]>([]);
  const [tasks, setTasks] = useState<WorkflowTask[]>([]);
  const [comments, setComments] = useState<WorkflowComment[]>([]);
  const [auditLogs, setAuditLogs] = useState<WorkflowAuditLog[]>([]);
  const [metrics, setMetrics] = useState<GovernanceMetrics | null>(null);
  const [selectedApproval, setSelectedApproval] = useState<ApprovalItem | null>(null);
  const [loading, setLoading] = useState(true);

  const loadData = async () => {
    setLoading(true);
    try {
      const [appRes, taskRes, cmtRes, audRes, metRes] = await Promise.all([
        getApprovalsQueue(),
        getWorkflowTasks(),
        getWorkflowComments("app_1"),
        getWorkflowAuditLogs("app_1"),
        getGovernanceMetrics(),
      ]);
      setApprovals(appRes);
      setTasks(taskRes);
      setComments(cmtRes);
      setAuditLogs(audRes);
      setMetrics(metRes);
    } catch (err) {
      console.error("Workflow fetch failed:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (orgId) {
      loadData();
    }
  }, [orgId]);

  const handleAction = async (item: ApprovalItem, action: ApprovalAction, reason?: string) => {
    const updated = await executeApprovalAction(item, action, reason);
    setApprovals((prev) => prev.map((a) => (a.id === updated.id ? updated : a)));

    // Append audit log
    setAuditLogs((prev) => [
      {
        id: `aud_${Date.now()}`,
        approvalId: item.id,
        actor: "Executive Approver (Active Session)",
        action,
        previousStage: item.currentStage,
        newStage: updated.currentStage,
        reason: reason || `Executed ${action} action`,
        timestamp: new Date().toISOString(),
      },
      ...prev,
    ]);
  };

  const handleAddComment = (text: string) => {
    const newCmt: WorkflowComment = {
      id: `cmt_${Date.now()}`,
      approvalId: selectedApproval?.id || "app_1",
      author: "Executive Approver",
      role: "Executive",
      content: text,
      timestamp: new Date().toISOString(),
    };
    setComments((prev) => [...prev, newCmt]);
  };

  if (!orgId || loading || !metrics) {
    return (
      <div className="min-h-screen bg-background text-foreground flex flex-col font-sans">
        <AppHeader badge="Governance Approval Center" />
        <main className="flex-1 max-w-[1536px] w-full mx-auto px-4 sm:px-6 py-8 space-y-6">
          <SkeletonMetricsRow />
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col font-sans transition-colors">
      <AppHeader badge="Governance Approval Center" />

      <main className="flex-1 max-w-[1536px] w-full mx-auto px-4 sm:px-6 py-8 space-y-8">
        {/* Phase 7: Unified Lifecycle Navigation Bar */}
        <UnifiedLifecycleBar activeStep="governance" />

        {/* Phase 7: Contextual Cross-Module Navigation */}
        <CrossModuleNav />

        {/* 1. Governance Throughput & SLA Metrics Bar */}
        <GovernanceDashboard metrics={metrics} />

        {/* 2. Main Grid: Queue & Tasks (Left 8) | Comments & Audit Logs (Right 4) */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          <div className="lg:col-span-8 space-y-6">
            {/* Executive Governance & Approval Queue */}
            <ApprovalQueue
              approvals={approvals}
              loading={loading}
              onSelectApproval={(item) => setSelectedApproval(item)}
            />

            {/* Workflow Task & SLA Management */}
            <TaskManagementCard tasks={tasks} />
          </div>

          <div className="lg:col-span-4 space-y-6">
            {/* Discussion Thread */}
            <CommentThread comments={comments} onAddComment={handleAddComment} />

            {/* Workflow Audit Trail */}
            <AuditLogStream auditLogs={auditLogs} />
          </div>
        </div>
      </main>

      {/* Decision Action Modal */}
      <ApprovalDetailModal
        isOpen={!!selectedApproval}
        approval={selectedApproval}
        onClose={() => setSelectedApproval(null)}
        onAction={handleAction}
      />
    </div>
  );
}
