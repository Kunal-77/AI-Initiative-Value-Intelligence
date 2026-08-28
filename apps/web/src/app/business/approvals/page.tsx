"use client";

import React, { useState, useEffect } from "react";
import { useAuth } from "@clerk/nextjs";
import dynamic from "@/compat/dynamic";
import {
  AppHeader,
  GovernanceDashboard,
  SkeletonMetricsRow,
  UnifiedLifecycleBar,
  CrossModuleNav,
  SkeletonTable,
  SkeletonCard,
  SkeletonTimeline,
  LazyViewport,
} from "@/components/ui";

const ApprovalQueue = dynamic(
  () => import("@/components/workflow/ApprovalQueue").then(mod => mod.ApprovalQueue),
  { loading: () => <SkeletonTable rows={4} /> }
);
const TaskManagementCard = dynamic(
  () => import("@/components/workflow/TaskManagementCard").then(mod => mod.TaskManagementCard),
  { loading: () => <SkeletonCard /> }
);
const CommentThread = dynamic(
  () => import("@/components/workflow/CommentThread").then(mod => mod.CommentThread),
  { loading: () => <SkeletonCard /> }
);
const AuditLogStream = dynamic(
  () => import("@/components/workflow/AuditLogStream").then(mod => mod.AuditLogStream),
  { loading: () => <SkeletonTimeline /> }
);
const ApprovalDetailModal = dynamic(
  () => import("@/components/workflow/ApprovalDetailModal").then(mod => mod.ApprovalDetailModal),
  { ssr: false }
);

import {
  getApprovalsQueue,
  getWorkflowTasks,
  getWorkflowComments,
  getWorkflowAuditLogs,
  getGovernanceMetrics,
  executeApprovalAction,
  addWorkflowComment,
} from "@/services/workflow/workflowService";
import {
  ApprovalItem,
  WorkflowTask,
  WorkflowComment,
  WorkflowAuditLog,
  GovernanceMetrics,
  ApprovalAction,
} from "@/types/workflow";

export default function BusinessApprovalsPage() {
  const { orgId, getToken } = useAuth();

  const [approvals, setApprovals] = useState<ApprovalItem[]>([]);
  const [tasks, setTasks] = useState<WorkflowTask[]>([]);
  const [comments, setComments] = useState<WorkflowComment[]>([]);
  const [auditLogs, setAuditLogs] = useState<WorkflowAuditLog[]>([]);
  const [metrics, setMetrics] = useState<GovernanceMetrics | null>(null);
  const [selectedApproval, setSelectedApproval] = useState<ApprovalItem | null>(null);
  const [loading, setLoading] = useState(true);

  const loadData = async () => {
    const token = await getToken();
    if (!token) return;
    setLoading(true);
    try {
      const [appRes, taskRes, metRes] = await Promise.all([
        getApprovalsQueue(token),
        getWorkflowTasks(token),
        getGovernanceMetrics(token),
      ]);
      setApprovals(appRes);
      setTasks(taskRes);
      setMetrics(metRes);
      
      // If we have approvals and none is selected, default to the first one for comments/logs
      if (appRes.length > 0 && !selectedApproval) {
        setSelectedApproval(appRes[0]);
      }
    } catch (err) {
      console.error("Workflow fetch failed:", err);
    } finally {
      setLoading(false);
    }
  };

  const loadCommentsAndLogs = async (approvalId: string) => {
    const token = await getToken();
    if (!token) return;
    try {
      const [cmtRes, audRes] = await Promise.all([
        getWorkflowComments(token, approvalId),
        getWorkflowAuditLogs(token, approvalId),
      ]);
      setComments(cmtRes);
      setAuditLogs(audRes);
    } catch (err) {
      console.error("Failed to load comments/logs for approval:", approvalId, err);
    }
  };

  useEffect(() => {
    if (orgId) {
      loadData();
    }
  }, [orgId]);

  useEffect(() => {
    if (selectedApproval?.id) {
      loadCommentsAndLogs(selectedApproval.id);
    }
  }, [selectedApproval?.id]);

  const handleAction = async (item: ApprovalItem, action: ApprovalAction, reason?: string) => {
    const token = await getToken();
    if (!token) return;
    try {
      const updated = await executeApprovalAction(token, item, action, reason);
      setApprovals((prev) => prev.map((a) => (a.id === updated.id ? updated : a)));
      setSelectedApproval(updated);
      
      const [metRes, audRes] = await Promise.all([
        getGovernanceMetrics(token),
        getWorkflowAuditLogs(token, item.id)
      ]);
      setMetrics(metRes);
      setAuditLogs(audRes);
    } catch (err) {
      console.error("Failed to execute action:", err);
    }
  };

  const handleAddComment = async (text: string) => {
    const approvalId = selectedApproval?.id || (approvals.length > 0 ? approvals[0].id : null);
    if (!approvalId) return;
    const token = await getToken();
    if (!token) return;
    try {
      const newCmt = await addWorkflowComment(token, approvalId, text);
      setComments((prev) => [...prev, newCmt]);
      const audRes = await getWorkflowAuditLogs(token, approvalId);
      setAuditLogs(audRes);
    } catch (err) {
      console.error("Failed to add comment:", err);
    }
  };

  if (!orgId) {
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
    <div className="min-h-screen bg-background text-foreground flex flex-col font-sans transition-colors animate-page-entrance">
      <AppHeader badge="Governance Approval Center" />

      <main className="flex-1 max-w-[1536px] w-full mx-auto px-4 sm:px-6 py-8 space-y-8">
        {/* Phase 7: Unified Lifecycle Navigation Bar */}
        <UnifiedLifecycleBar activeStep="governance" />

        {/* Phase 7: Contextual Cross-Module Navigation */}
        <CrossModuleNav />

        {/* 1. Governance Throughput & SLA Metrics Bar */}
        <GovernanceDashboard metrics={metrics} loading={loading} />

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
            <LazyViewport name="Governance SLA Task Manager" placeholder={<SkeletonCard />} minHeight="250px">
              {() => <TaskManagementCard tasks={tasks} />}
            </LazyViewport>
          </div>
 
          <div className="lg:col-span-4 space-y-6">
            {/* Discussion Thread */}
            <LazyViewport name="Interactive Comment Threads" placeholder={<SkeletonCard />} minHeight="300px">
              {() => <CommentThread comments={comments} onAddComment={handleAddComment} />}
            </LazyViewport>
 
            {/* Workflow Audit Trail */}
            <LazyViewport name="Cryptographic Audit Logs Trail" placeholder={<SkeletonTimeline />} minHeight="350px">
              {() => <AuditLogStream auditLogs={auditLogs} />}
            </LazyViewport>
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
