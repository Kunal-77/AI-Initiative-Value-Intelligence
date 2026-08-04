"use client";

import React from "react";
import { CheckSquare, Clock, AlertTriangle } from "lucide-react";
import { WorkflowTask } from "../../types/workflow";
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell, Badge } from "../ui";

export interface TaskManagementCardProps {
  tasks: WorkflowTask[];
}

export function TaskManagementCard({ tasks }: TaskManagementCardProps) {
  return (
    <div className="rounded-xl border border-border bg-card text-card-foreground shadow-2xs overflow-hidden space-y-0">
      <div className="p-4 border-b border-border bg-secondary/30 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <CheckSquare className="w-4 h-4 text-accent" />
          <h3 className="text-sm font-bold text-foreground">Governance Task & SLA Management</h3>
        </div>
        <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-secondary text-muted-foreground border border-border">
          {tasks.length} Assigned Tasks
        </span>
      </div>

      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow className="bg-secondary/20 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground border-b border-border">
              <TableHead className="py-3 px-4">Task Description</TableHead>
              <TableHead className="py-3 px-4">Assignee</TableHead>
              <TableHead className="py-3 px-4">Due Date</TableHead>
              <TableHead className="py-3 px-4">Priority</TableHead>
              <TableHead className="py-3 px-4 text-right">Status</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody className="divide-y divide-border">
            {tasks.map((task) => (
              <TableRow key={task.id} className="hover:bg-secondary/40 transition-colors text-xs">
                <TableCell className="py-3.5 px-4 font-semibold text-foreground">
                  {task.taskTitle}
                </TableCell>
                <TableCell className="py-3.5 px-4 text-muted-foreground">{task.assignee}</TableCell>
                <TableCell className="py-3.5 px-4 font-mono text-muted-foreground">{task.dueDate}</TableCell>
                <TableCell className="py-3.5 px-4 font-semibold text-accent">{task.priority}</TableCell>
                <TableCell className="py-3.5 px-4 text-right">
                  <Badge variant={task.status === "COMPLETED" ? "ACTIVE" : task.status === "OVERDUE" ? "warning" : "SUBMITTED"}>
                    {task.status}
                  </Badge>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
