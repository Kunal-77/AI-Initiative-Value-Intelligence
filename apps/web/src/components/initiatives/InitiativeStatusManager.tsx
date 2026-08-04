"use client";

import React, { useState } from "react";
import { Badge, Button } from "../ui";
import { Check, ChevronDown } from "lucide-react";

export type InitiativeLifecycleState =
  | "DRAFT"
  | "SUBMITTED"
  | "ACTIVE"
  | "PAUSED"
  | "COMPLETED"
  | "CANCELLED"
  | "ARCHIVED";

export interface InitiativeStatusManagerProps {
  currentStatus: InitiativeLifecycleState;
  onStatusChange: (newStatus: InitiativeLifecycleState) => Promise<void>;
  disabled?: boolean;
}

const ALL_STATUSES: InitiativeLifecycleState[] = [
  "DRAFT",
  "SUBMITTED",
  "ACTIVE",
  "PAUSED",
  "COMPLETED",
  "CANCELLED",
  "ARCHIVED",
];

export function InitiativeStatusManager({
  currentStatus,
  onStatusChange,
  disabled = false,
}: InitiativeStatusManagerProps) {
  const [updating, setUpdating] = useState(false);

  const handleSelect = async (st: InitiativeLifecycleState) => {
    if (st === currentStatus || updating || disabled) return;
    setUpdating(true);
    try {
      await onStatusChange(st);
    } catch (err: any) {
      alert(err.message || "Failed to update status.");
    } finally {
      setUpdating(false);
    }
  };

  return (
    <div className="flex items-center gap-2 flex-wrap">
      <span className="text-xs font-semibold text-muted-foreground mr-1">Status:</span>
      <Badge variant={currentStatus as any}>{currentStatus}</Badge>

      <div className="flex items-center gap-1.5 ml-2">
        {ALL_STATUSES.filter((s) => s !== currentStatus).map((st) => (
          <Button
            key={st}
            type="button"
            onClick={() => handleSelect(st)}
            disabled={updating || disabled}
            variant="secondary"
            className="text-[10px] py-0.5 px-2 h-6"
          >
            Move to {st}
          </Button>
        ))}
      </div>
    </div>
  );
}
