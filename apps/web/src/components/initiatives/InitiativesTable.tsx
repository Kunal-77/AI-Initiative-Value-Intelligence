"use client";

import React, { useState, useMemo } from "react";
import Link from "@/compat/link";
import { FolderKanban, ArrowUpRight, Edit3, Trash2, ArrowUpDown, ChevronLeft, ChevronRight, Filter, Sparkles } from "lucide-react";
import { Badge, Table, TableHeader, TableBody, TableRow, TableHead, TableCell, SkeletonTable, EmptyState, ErrorBanner, Button, Input, Select } from "../ui";
import { InitiativeModel } from "../../lib/initiativeStore";

export interface InitiativesTableProps {
  initiatives: InitiativeModel[];
  loading?: boolean;
  error?: string | null;
  onEdit?: (item: InitiativeModel) => void;
  onDelete?: (item: InitiativeModel) => void;
  onNewInitiative?: () => void;
}

export function InitiativesTable({
  initiatives,
  loading = false,
  error = null,
  onEdit,
  onDelete,
  onNewInitiative,
}: InitiativesTableProps) {
  // Search & Filter State
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [businessAreaFilter, setBusinessAreaFilter] = useState("ALL");
  const [sortField, setSortField] = useState<"name" | "valueImpact" | "status" | "plannedBudget">("name");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("asc");
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 6;

  // Filter & Sort Logic
  const filteredInitiatives = useMemo(() => {
    return initiatives
      .filter((item) => {
        const matchesSearch =
          !searchQuery ||
          item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          item.businessArea.toLowerCase().includes(searchQuery.toLowerCase()) ||
          item.owner.toLowerCase().includes(searchQuery.toLowerCase()) ||
          item.expectedBusinessOutcome.toLowerCase().includes(searchQuery.toLowerCase());

        const matchesStatus = statusFilter === "ALL" || item.status === statusFilter;
        const matchesArea = businessAreaFilter === "ALL" || item.businessArea === businessAreaFilter;

        return matchesSearch && matchesStatus && matchesArea;
      })
      .sort((a, b) => {
        if (sortField === "plannedBudget") {
          const numA = Number(a.plannedBudget) || 0;
          const numB = Number(b.plannedBudget) || 0;
          return sortOrder === "asc" ? numA - numB : numB - numA;
        }

        const valA = a[sortField] || "";
        const valB = b[sortField] || "";
        if (sortOrder === "asc") return valA.localeCompare(valB);
        return valB.localeCompare(valA);
      });
  }, [initiatives, searchQuery, statusFilter, businessAreaFilter, sortField, sortOrder]);

  // Pagination Logic
  const totalPages = Math.ceil(filteredInitiatives.length / pageSize) || 1;
  const paginatedData = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filteredInitiatives.slice(start, start + pageSize);
  }, [filteredInitiatives, currentPage]);

  const toggleSort = (field: "name" | "valueImpact" | "status" | "plannedBudget") => {
    if (sortField === field) {
      setSortOrder((prev) => (prev === "asc" ? "desc" : "asc"));
    } else {
      setSortField(field);
      setSortOrder("asc");
    }
  };

  if (loading) return <SkeletonTable rows={5} />;
  if (error) return <ErrorBanner message={`Failed to load initiatives: ${error}`} variant="red" />;

  return (
    <div className="rounded-2xl border border-border/80 bg-card text-card-foreground shadow-lg overflow-hidden space-y-0 bento-card motion-reveal">
      {/* Top Filter Bar */}
      <div className="p-5 border-b border-[#202630] bg-[#11151C] space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-[#7DA7D9]/10 border border-[#7DA7D9]/25 text-[#7DA7D9] shadow-xs">
              <FolderKanban className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-[#F4F1EA] flex items-center gap-2">
                Initiative Management Directory
                <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-[#7DA7D9]/15 text-[#7DA7D9] border border-[#7DA7D9]/30">
                  {filteredInitiatives.length} Registered
                </span>
              </h3>
              <p className="text-xs text-[#8F98A8]">
                Central ledger of all strategic initiatives, capital allocation, and business impacts.
              </p>
            </div>
          </div>

          <Button onClick={onNewInitiative} variant="primary" className="text-xs h-9 py-1.5 px-4 font-semibold shadow-xs bg-[#7DA7D9] text-[#0B0D11] hover:bg-[#A5C3E8]">
            + New Initiative
          </Button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3 pt-1">
          <Input
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              setCurrentPage(1);
            }}
            placeholder="Search by name, area, or owner..."
            className="text-xs py-1.5 h-9 bg-[#171C24] border-[#202630] focus:border-[#7DA7D9]/50 text-[#F4F1EA]"
          />

          <div className="flex items-center gap-1.5">
            <Filter className="w-3.5 h-3.5 text-[#8F98A8] shrink-0" />
            <Select
              value={statusFilter}
              onChange={(e) => {
                setStatusFilter(e.target.value);
                setCurrentPage(1);
              }}
              className="text-xs py-1.5 h-9 bg-[#171C24] border-[#202630] focus:border-[#7DA7D9]/50 text-[#F4F1EA]"
            >
              <option value="ALL">All Statuses</option>
              <option value="DRAFT">DRAFT</option>
              <option value="SUBMITTED">SUBMITTED</option>
              <option value="ACTIVE">ACTIVE</option>
              <option value="COMPLETED">COMPLETED</option>
              <option value="ABANDONED">ABANDONED</option>
            </Select>
          </div>

          <Select
            value={businessAreaFilter}
            onChange={(e) => {
              setBusinessAreaFilter(e.target.value);
              setCurrentPage(1);
            }}
            className="text-xs py-1.5 h-9 bg-[#171C24] border-[#202630] focus:border-[#7DA7D9]/50 text-[#F4F1EA]"
          >
            <option value="ALL">All Business Areas</option>
            <option value="Operations & Care">Operations & Care</option>
            <option value="Software Engineering">Software Engineering</option>
            <option value="Legal & Compliance">Legal & Compliance</option>
            <option value="Finance & Risk Analytics">Finance & Risk Analytics</option>
            <option value="Logistics & Supply Chain">Logistics & Supply Chain</option>
          </Select>

          <div className="flex items-center justify-end text-xs text-[#8F98A8] gap-2 font-mono">
            <span>Sort:</span>
            <button
              type="button"
              onClick={() => toggleSort("name")}
              className={`font-semibold flex items-center gap-1 hover:text-[#7DA7D9] transition-colors cursor-pointer ${sortField === "name" ? "text-[#7DA7D9] font-bold" : "text-[#8F98A8]"
                }`}
            >
              Name <ArrowUpDown className="w-3 h-3" />
            </button>
            <button
              type="button"
              onClick={() => toggleSort("plannedBudget")}
              className={`font-semibold flex items-center gap-1 hover:text-[#7DA7D9] transition-colors cursor-pointer ${sortField === "plannedBudget" ? "text-[#7DA7D9] font-bold" : "text-[#8F98A8]"
                }`}
            >
              Budget <ArrowUpDown className="w-3 h-3" />
            </button>
          </div>
        </div>
      </div>

      {/* Main Ledger Table */}
      {paginatedData.length === 0 ? (
        <EmptyState
          title="No Initiatives Match Criteria"
          description="Try clearing search filters or create a new initiative."
          actionText="Create Initiative →"
          onActionClick={onNewInitiative}
          variant="card"
        />
      ) : (
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="bg-[#171C24] text-[10px] font-semibold uppercase tracking-wider text-[#8F98A8] border-b border-[#202630] font-mono">
                <TableHead className="py-3 px-4">Initiative Name</TableHead>
                <TableHead className="py-3 px-4">Business Area</TableHead>
                <TableHead className="py-3 px-4">Owner</TableHead>
                <TableHead className="py-3 px-4">Status</TableHead>
                <TableHead className="py-3 px-4">Planned Budget</TableHead>
                <TableHead className="py-3 px-4">Value Impact</TableHead>
                <TableHead className="py-3 px-4 text-center">Health</TableHead>
                <TableHead className="py-3 px-4 text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody className="divide-y divide-[#202630]">
              {paginatedData.map((item) => {
                const formattedBudget = `$${Number(item.plannedBudget || 0).toLocaleString()} ${item.currency || "USD"}`;

                let healthColor = "bg-emerald-500/10 text-emerald-400 border-emerald-500/30";
                if (item.health === "Risk") healthColor = "bg-rose-500/10 text-rose-400 border-rose-500/30";
                if (item.health === "Review") healthColor = "bg-amber-500/10 text-amber-400 border-amber-500/30";

                return (
                  <TableRow key={item.id} className="hover:bg-[#7DA7D9]/5 transition-colors group">
                    <TableCell className="py-3.5 px-4 font-semibold text-[#F4F1EA]">
                      <Link href={`/business/initiatives/${item.id}`} className="hover:text-[#7DA7D9] transition-colors flex items-center gap-1.5 font-sans">
                        {item.name}
                      </Link>
                    </TableCell>
                    <TableCell className="py-3.5 px-4 text-[#8F98A8] text-xs">{item.businessArea}</TableCell>
                    <TableCell className="py-3.5 px-4 text-[#8F98A8] text-xs">{item.owner}</TableCell>
                    <TableCell className="py-3.5 px-4">
                      <Badge variant={item.status as any} className="font-mono text-[10px] tracking-wider">{item.status}</Badge>
                    </TableCell>
                    <TableCell className="py-3.5 px-4 font-mono font-semibold text-[#F4F1EA] text-xs">
                      {formattedBudget}
                    </TableCell>
                    <TableCell className="py-3.5 px-4 font-mono font-semibold text-[#F4F1EA] text-xs">
                      {item.valueImpact}
                    </TableCell>
                    <TableCell className="py-3.5 px-4 text-center">
                      <span className={`inline-flex items-center gap-1 text-[10px] font-semibold font-mono px-2 py-0.5 rounded-full border ${healthColor}`}>
                        {item.health || "Healthy"}
                      </span>
                    </TableCell>
                    <TableCell className="py-3.5 px-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Link
                          href={`/business/initiatives/${item.id}`}
                          className="p-1.5 rounded-lg text-[#8F98A8] hover:text-[#7DA7D9] hover:bg-[#171C24] transition-colors"
                          title="View Details"
                        >
                          <ArrowUpRight className="w-4 h-4" />
                        </Link>
                        {onEdit && (
                          <button
                            type="button"
                            onClick={() => onEdit(item)}
                            className="p-1.5 rounded-lg text-[#8F98A8] hover:text-[#F4F1EA] hover:bg-[#171C24] transition-colors cursor-pointer"
                            title="Edit Initiative"
                          >
                            <Edit3 className="w-4 h-4" />
                          </button>
                        )}
                        {onDelete && (
                          <button
                            type="button"
                            onClick={() => onDelete(item)}
                            className="p-1.5 rounded-lg text-[#8F98A8] hover:text-rose-400 hover:bg-[#171C24] transition-colors cursor-pointer"
                            title="Delete Initiative"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </div>
      )}

      {/* Pagination Footer */}
      <div className="p-4 border-t border-border/70 bg-secondary/20 flex items-center justify-between text-xs text-muted-foreground font-mono">
        <span>
          Showing Page {currentPage} of {totalPages} ({filteredInitiatives.length} total)
        </span>
        <div className="flex items-center gap-2">
          <Button
            onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
            disabled={currentPage === 1}
            variant="secondary"
            className="h-8 px-2.5 text-xs"
          >
            <ChevronLeft className="w-3.5 h-3.5 mr-0.5" /> Prev
          </Button>
          <Button
            onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
            disabled={currentPage === totalPages}
            variant="secondary"
            className="h-8 px-2.5 text-xs"
          >
            Next <ChevronRight className="w-3.5 h-3.5 ml-0.5" />
          </Button>
        </div>
      </div>
    </div>
  );
}
