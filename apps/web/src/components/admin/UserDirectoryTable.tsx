"use client";

import React, { useState, useMemo } from "react";
import { Users, UserPlus, Filter, MoreVertical, ShieldCheck, Mail, AlertTriangle } from "lucide-react";
import { AdminUser, UserStatus } from "../../types/admin";
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell, Badge, Button, Input, Select, Dialog, DialogHeader, DialogTitle, DialogDescription, DialogContent, DialogFooter, Label } from "../ui";
import { filterUserDirectory } from "../../lib/admin/rbacEngine";

export interface UserDirectoryTableProps {
  users: AdminUser[];
  onInviteUser: (email: string, role: string, dept: string) => Promise<void>;
  onUpdateStatus: (userId: string, newStatus: UserStatus) => Promise<void>;
}

export function UserDirectoryTable({
  users,
  onInviteUser,
  onUpdateStatus,
}: UserDirectoryTableProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [roleFilter, setRoleFilter] = useState("ALL");
  const [statusFilter, setStatusFilter] = useState("ALL");

  const [showInviteModal, setShowInviteModal] = useState(false);
  const [inviteEmail, setInviteEmail] = useState("");
  const [inviteRole, setInviteRole] = useState("EXECUTIVE");
  const [inviteDept, setInviteDept] = useState("Operations");
  const [inviting, setInviting] = useState(false);

  const filtered = useMemo(() => {
    return filterUserDirectory(users, searchQuery, roleFilter, statusFilter);
  }, [users, searchQuery, roleFilter, statusFilter]);

  const handleInviteSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inviteEmail.trim()) return;

    setInviting(true);
    try {
      await onInviteUser(inviteEmail, inviteRole, inviteDept);
      setInviteEmail("");
      setShowInviteModal(false);
    } catch (err: any) {
      alert(err.message || "Failed to send invitation.");
    } finally {
      setInviting(false);
    }
  };

  return (
    <div className="rounded-xl border border-border/80 bg-card text-card-foreground shadow-sm overflow-hidden space-y-0">
      <div className="p-4 border-b border-border bg-secondary/30 space-y-3">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-lg bg-blue-500/10 border border-blue-500/20 text-blue-500 dark:text-blue-400">
              <Users className="w-4 h-4" />
            </div>
            <h3 className="text-sm font-bold text-foreground">Enterprise User Directory & Access Control</h3>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-secondary text-muted-foreground border border-border">
              {filtered.length} Users
            </span>
          </div>

          <Button onClick={() => setShowInviteModal(true)} variant="primary" className="text-xs h-8 py-1 px-3 shadow-lg shadow-blue-500/15">
            <UserPlus className="w-3.5 h-3.5 mr-1" /> Invite User
          </Button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-1">
          <Input
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by name, email, department..."
            className="text-xs h-8 py-1"
          />

          <Select
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value)}
            className="text-xs h-8 py-1"
          >
            <option value="ALL">All System Roles</option>
            <option value="SUPER_ADMIN">SUPER_ADMIN</option>
            <option value="EXECUTIVE">EXECUTIVE</option>
            <option value="PORTFOLIO_MANAGER">PORTFOLIO_MANAGER</option>
            <option value="FINANCE_MANAGER">FINANCE_MANAGER</option>
            <option value="AI_ANALYST">AI_ANALYST</option>
          </Select>

          <Select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="text-xs h-8 py-1"
          >
            <option value="ALL">All User Statuses</option>
            <option value="ACTIVE">ACTIVE</option>
            <option value="INVITED">INVITED</option>
            <option value="SUSPENDED">SUSPENDED</option>
            <option value="DEACTIVATED">DEACTIVATED</option>
          </Select>
        </div>
      </div>

      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow className="bg-secondary/20 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground border-b border-border">
              <TableHead className="py-3 px-4">User Name & Email</TableHead>
              <TableHead className="py-3 px-4">Department</TableHead>
              <TableHead className="py-3 px-4">System Role</TableHead>
              <TableHead className="py-3 px-4">Last Active</TableHead>
              <TableHead className="py-3 px-4 text-center">Status</TableHead>
              <TableHead className="py-3 px-4 text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody className="divide-y divide-border">
            {filtered.map((user) => (
              <TableRow key={user.id} className="hover:bg-blue-500/5 transition-colors text-xs">
                <TableCell className="py-3.5 px-4 font-semibold text-foreground flex items-center gap-2.5">
                  <div className="w-7 h-7 rounded-full bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center text-white font-bold text-[10px] shrink-0 shadow-2xs">
                    {user.avatarInitials || user.name.charAt(0)}
                  </div>
                  <div>
                    <span>{user.name}</span>
                    <span className="block text-[10px] text-muted-foreground font-normal">{user.email}</span>
                  </div>
                </TableCell>
                <TableCell className="py-3.5 px-4 text-muted-foreground">{user.department}</TableCell>
                <TableCell className="py-3.5 px-4 font-mono font-bold text-blue-500 dark:text-blue-400 text-[11px]">
                  {user.role}
                </TableCell>
                <TableCell className="py-3.5 px-4 text-muted-foreground font-mono text-[11px]">
                  {user.lastActive}
                </TableCell>
                <TableCell className="py-3.5 px-4 text-center">
                  <Badge variant={user.status === "ACTIVE" ? "ACTIVE" : user.status === "INVITED" ? "SUBMITTED" : "warning"}>
                    {user.status}
                  </Badge>
                </TableCell>
                <TableCell className="py-3.5 px-4 text-right">
                  <Select
                    value={user.status}
                    onChange={(e) => onUpdateStatus(user.id, e.target.value as UserStatus)}
                    className="text-[10px] h-7 py-0 px-1 w-28 font-semibold"
                  >
                    <option value="ACTIVE">ACTIVE</option>
                    <option value="SUSPENDED">SUSPEND</option>
                    <option value="DEACTIVATED">DEACTIVATE</option>
                  </Select>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {/* Invite User Modal */}
      <Dialog isOpen={showInviteModal} onClose={() => setShowInviteModal(false)} className="max-w-md w-full">
        <form onSubmit={handleInviteSubmit} className="contents">
          <DialogHeader>
            <DialogTitle className="text-base font-bold text-foreground">
              Invite Enterprise Team Member
            </DialogTitle>
            <DialogDescription className="text-xs text-muted-foreground">
              Send an invitation link with role-based workspace permissions.
            </DialogDescription>
          </DialogHeader>

          <DialogContent className="space-y-3 py-2 text-xs">
            <div>
              <Label required>Work Email Address</Label>
              <Input
                type="email"
                value={inviteEmail}
                onChange={(e) => setInviteEmail(e.target.value)}
                placeholder="colleague@company.com"
                required
                className="text-xs"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label>Assigned System Role</Label>
                <Select value={inviteRole} onChange={(e) => setInviteRole(e.target.value)} className="text-xs">
                  <option value="SUPER_ADMIN">Super Administrator</option>
                  <option value="EXECUTIVE">Executive Leader</option>
                  <option value="PORTFOLIO_MANAGER">Portfolio Manager</option>
                  <option value="FINANCE_MANAGER">Finance Manager</option>
                  <option value="AI_ANALYST">AI Value Analyst</option>
                  <option value="VIEWER">Read-Only Viewer</option>
                </Select>
              </div>

              <div>
                <Label>Department</Label>
                <Select value={inviteDept} onChange={(e) => setInviteDept(e.target.value)} className="text-xs">
                  <option value="Operations">Operations</option>
                  <option value="Software Engineering">Software Engineering</option>
                  <option value="Finance">Finance</option>
                  <option value="Legal">Legal & Compliance</option>
                </Select>
              </div>
            </div>
          </DialogContent>

          <DialogFooter>
            <Button type="button" onClick={() => setShowInviteModal(false)} variant="secondary" className="text-xs">
              Cancel
            </Button>
            <Button type="submit" loading={inviting} variant="primary" className="text-xs">
              Send Invitation
            </Button>
          </DialogFooter>
        </form>
      </Dialog>
    </div>
  );
}
