"use client";

import React, { useState, useMemo } from "react";
import {
  Receipt,
  Search,
  Filter,
  ArrowUpDown,
  Calendar,
  Layers,
  ChevronLeft,
  ChevronRight,
  Sparkles,
  DollarSign,
  Cpu,
  Tv,
  Music,
  Cloud,
} from "lucide-react";
import { BankTransaction } from "../../types/personal";
import { cn } from "../ui/cn";

export interface TransactionExplorerProps {
  transactions: BankTransaction[];
  loading?: boolean;
}

export function TransactionExplorer({ transactions, loading = false }: TransactionExplorerProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("ALL");
  const [selectedDateRange, setSelectedDateRange] = useState("ALL"); // ALL, 30D, 60D, 90D
  const [sortOrder, setSortOrder] = useState<"newest" | "oldest" | "highest" | "lowest">("newest");
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 8;

  // Filter & sort logic
  const filteredTransactions = useMemo(() => {
    let list = [...transactions];

    // Search filter
    if (searchTerm.trim()) {
      const q = searchTerm.toLowerCase();
      list = list.filter(
        (t) =>
          (t.normalizedMerchant && t.normalizedMerchant.toLowerCase().includes(q)) ||
          t.rawDescription.toLowerCase().includes(q)
      );
    }

    // Category filter
    if (selectedCategory !== "ALL") {
      list = list.filter((t) => {
        const desc = (t.normalizedMerchant || t.rawDescription).toLowerCase();
        if (selectedCategory === "AI_TOOL") {
          return desc.includes("openai") || desc.includes("chatgpt") || desc.includes("claude") || desc.includes("copilot");
        }
        if (selectedCategory === "CLOUD_SERVICE") {
          return desc.includes("aws") || desc.includes("gcp") || desc.includes("cloud") || desc.includes("azure");
        }
        if (selectedCategory === "ENTERTAINMENT") {
          return desc.includes("netflix") || desc.includes("prime") || desc.includes("youtube");
        }
        if (selectedCategory === "MUSIC") {
          return desc.includes("spotify") || desc.includes("music");
        }
        return true;
      });
    }

    // Date range filter
    if (selectedDateRange !== "ALL") {
      const now = new Date();
      let days = 30;
      if (selectedDateRange === "60D") days = 60;
      if (selectedDateRange === "90D") days = 90;

      const cutoff = new Date();
      cutoff.setDate(now.getDate() - days);

      list = list.filter((t) => new Date(t.transactionDate) >= cutoff);
    }

    // Sorting
    list.sort((a, b) => {
      if (sortOrder === "newest") {
        return new Date(b.transactionDate).getTime() - new Date(a.transactionDate).getTime();
      }
      if (sortOrder === "oldest") {
        return new Date(a.transactionDate).getTime() - new Date(b.transactionDate).getTime();
      }
      if (sortOrder === "highest") {
        return b.amount - a.amount;
      }
      if (sortOrder === "lowest") {
        return a.amount - b.amount;
      }
      return 0;
    });

    return list;
  }, [transactions, searchTerm, selectedCategory, selectedDateRange, sortOrder]);

  const totalPages = Math.ceil(filteredTransactions.length / pageSize) || 1;
  const paginatedTransactions = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filteredTransactions.slice(start, start + pageSize);
  }, [filteredTransactions, currentPage, pageSize]);

  return (
    <div className="rounded-xl border border-[#202630] bg-[#11151C] shadow-md overflow-hidden flex flex-col space-y-4 p-5 sm:p-6 transition-all">
      {/* Header Row */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 border-b border-[#202630] pb-4">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-lg bg-[#7DA7D9]/10 border border-[#7DA7D9]/20 text-[#7DA7D9]">
            <Receipt className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-[#F4F1EA]">Transaction Statement Explorer</h3>
            <p className="text-[11px] text-[#8F98A8]">
              Granular inspection of raw ingested financial statements with normalization tags
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-[#171C24] border border-[#202630] text-[#8F98A8]">
            {filteredTransactions.length} of {transactions.length} Records
          </span>
          <span className="text-[9px] font-mono font-bold text-[#C9A86A] bg-[#C9A86A]/10 border border-[#C9A86A]/25 px-2 py-0.5 rounded uppercase">
            Demo Feed
          </span>
        </div>
      </div>

      {/* Filter & Controls Bar */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        {/* Search */}
        <div className="relative">
          <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-[#8F98A8]" />
          <input
            type="text"
            placeholder="Search merchant or description..."
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              setCurrentPage(1);
            }}
            className="w-full text-xs h-9 pl-9 pr-3 bg-[#0B0D11] border border-[#202630] rounded-lg text-[#F4F1EA] placeholder:text-[#8F98A8]/60 focus:outline-none focus:border-[#7DA7D9]"
          />
        </div>

        {/* Category Filter */}
        <div className="relative">
          <select
            value={selectedCategory}
            onChange={(e) => {
              setSelectedCategory(e.target.value);
              setCurrentPage(1);
            }}
            className="w-full text-xs h-9 px-3 bg-[#0B0D11] border border-[#202630] rounded-lg text-[#F4F1EA] focus:outline-none focus:border-[#7DA7D9] cursor-pointer"
          >
            <option value="ALL">All Categories</option>
            <option value="AI_TOOL">AI & Productivity</option>
            <option value="CLOUD_SERVICE">Cloud Services</option>
            <option value="ENTERTAINMENT">Entertainment</option>
            <option value="MUSIC">Music</option>
          </select>
        </div>

        {/* Date Range Filter */}
        <div className="relative">
          <select
            value={selectedDateRange}
            onChange={(e) => {
              setSelectedDateRange(e.target.value);
              setCurrentPage(1);
            }}
            className="w-full text-xs h-9 px-3 bg-[#0B0D11] border border-[#202630] rounded-lg text-[#F4F1EA] focus:outline-none focus:border-[#7DA7D9] cursor-pointer"
          >
            <option value="ALL">All Statements (90 Days)</option>
            <option value="30D">Last 30 Days</option>
            <option value="60D">Last 60 Days</option>
            <option value="90D">Last 90 Days</option>
          </select>
        </div>

        {/* Sort Order */}
        <div className="relative">
          <select
            value={sortOrder}
            onChange={(e) => setSortOrder(e.target.value as any)}
            className="w-full text-xs h-9 px-3 bg-[#0B0D11] border border-[#202630] rounded-lg text-[#F4F1EA] focus:outline-none focus:border-[#7DA7D9] cursor-pointer"
          >
            <option value="newest">Sort: Newest Date</option>
            <option value="oldest">Sort: Oldest Date</option>
            <option value="highest">Sort: Highest Cost</option>
            <option value="lowest">Sort: Lowest Cost</option>
          </select>
        </div>
      </div>

      {/* Transactions Table / List */}
      <div className="border border-[#202630] rounded-xl overflow-hidden bg-[#0E1116]">
        {loading ? (
          <div className="p-8 space-y-3">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="h-8 bg-[#171C24] rounded animate-pulse" />
            ))}
          </div>
        ) : transactions.length === 0 ? (
          <div className="p-12 text-center flex flex-col items-center justify-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-[#171C24] border border-[#202630] flex items-center justify-center text-[#8F98A8]">
              <Receipt className="w-6 h-6" />
            </div>
            <div className="space-y-1">
              <h4 className="text-sm font-bold text-[#F4F1EA]">No Ingested Transactions</h4>
              <p className="text-xs text-[#8F98A8] max-w-sm">
                Sync your simulated connection above to ingest sample statement feeds and view raw transactions.
              </p>
            </div>
          </div>
        ) : paginatedTransactions.length === 0 ? (
          <div className="p-8 text-center text-xs text-[#8F98A8]">
            No transactions match your current search and filter criteria.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-[#202630] bg-[#11151C] text-[#8F98A8] uppercase font-mono text-[10px]">
                  <th className="p-3.5 font-semibold">Date</th>
                  <th className="p-3.5 font-semibold">Merchant / Description</th>
                  <th className="p-3.5 font-semibold">Normalized Merchant</th>
                  <th className="p-3.5 font-semibold">Type</th>
                  <th className="p-3.5 font-semibold">Source</th>
                  <th className="p-3.5 font-semibold text-right">Amount (USD)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#202630]">
                {paginatedTransactions.map((txn) => (
                  <tr key={txn.id} className="hover:bg-[#171C24]/50 transition-colors">
                    <td className="p-3.5 font-mono text-[11px] text-[#8F98A8] whitespace-nowrap">
                      {txn.transactionDate}
                    </td>

                    <td className="p-3.5 max-w-[220px]">
                      <span className="font-semibold text-[#F4F1EA] block truncate font-mono text-[11px]">
                        {txn.rawDescription}
                      </span>
                    </td>

                    <td className="p-3.5">
                      <span className="font-semibold text-[#7DA7D9] block text-xs">
                        {txn.normalizedMerchant || "General Debit"}
                      </span>
                    </td>

                    <td className="p-3.5">
                      <span className="px-2 py-0.5 rounded text-[9px] font-mono uppercase bg-[#171C24] text-[#D9DEE7] border border-[#202630]">
                        {txn.transactionType}
                      </span>
                    </td>

                    <td className="p-3.5">
                      <span className="px-2 py-0.5 rounded text-[9px] font-mono font-bold bg-[#C9A86A]/10 border border-[#C9A86A]/20 text-[#C9A86A]">
                        DEMO / SIMULATED
                      </span>
                    </td>

                    <td className="p-3.5 text-right font-mono font-bold text-[#F4F1EA] whitespace-nowrap">
                      ${txn.amount.toFixed(2)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Pagination Controls */}
      {filteredTransactions.length > pageSize && (
        <div className="flex items-center justify-between text-xs pt-1">
          <span className="text-[11px] text-[#8F98A8] font-mono">
            Page {currentPage} of {totalPages} ({filteredTransactions.length} total)
          </span>

          <div className="flex gap-2">
            <button
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              className="p-1.5 rounded-lg border border-[#202630] bg-[#171C24] text-[#F4F1EA] hover:border-[#7DA7D9]/40 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
              className="p-1.5 rounded-lg border border-[#202630] bg-[#171C24] text-[#F4F1EA] hover:border-[#7DA7D9]/40 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
