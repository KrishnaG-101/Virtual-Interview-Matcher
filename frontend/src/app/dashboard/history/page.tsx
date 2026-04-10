"use client";

import { useMemo, useState } from "react";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { 
  Search, 
  Download, 
  ChevronRight,
  ShieldAlert,
  History,
  FileText,
  Calendar
} from "lucide-react";
import { useAssignmentHistory } from "@/hooks/useAssignmentHistory";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import { format } from "date-fns";

export default function HistoryPage() {
  const { data: logs, isLoading } = useAssignmentHistory();
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");

  const filteredLogs = useMemo(() => {
    return logs?.filter(log => {
      const matchesSearch = log.candidate_name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                           log.expert_name.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesStatus = statusFilter === "all" || log.status === statusFilter;
      return matchesSearch && matchesStatus;
    });
  }, [logs, searchTerm, statusFilter]);

  const exportToCSV = () => {
    if (!filteredLogs) return;
    
    const headers = ["ID", "Candidate", "Expert", "Score", "Status", "Assigned By", "Override Reason", "Date", "Domain"];
    const rows = filteredLogs.map(log => [
      log.id,
      log.candidate_name,
      log.expert_name,
      `${(log.total_score * 100).toFixed(1)}%`,
      log.status,
      log.assigned_by || "N/A",
      log.override_reason || "",
      format(new Date(log.created_at), "yyyy-MM-dd HH:mm"),
      log.domain
    ]);

    const csvContent = [headers, ...rows].map(e => e.join(",")).join("\n");
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    link.setAttribute("href", url);
    link.setAttribute("download", `hgm_07_audit_log_${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = "hidden";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const getStatusIndicator = (status: string) => {
    switch (status) {
      case "approved": return "bg-emerald-500";
      case "overridden": return "bg-amber-500";
      case "declined": return "bg-rose-500";
      default: return "bg-slate-400";
    }
  };

  return (
    <div className="max-w-full space-y-12 animate-in fade-in slide-in-from-bottom-4 duration-1000 no-scrollbar">
      {/* Header Section - De-squeezed */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-y-4">
        <div className="space-y-1">
          <p className="text-[9px] text-emerald-600 font-black uppercase tracking-[0.4em]">Governance & Compliance Protocols</p>
          <h1 className="text-3xl font-black tracking-tight text-slate-900 italic">Assignment History</h1>
        </div>
        
        <div className="flex items-center gap-x-3">
           <Button 
            onClick={exportToCSV}
            variant="outline" 
            className="border-slate-200 bg-white hover:bg-slate-50 text-[9px] font-black uppercase tracking-widest text-slate-600 h-10 rounded-xl px-6 shadow-sm transition-all active:scale-95"
          >
            <Download className="h-3.5 w-3.5 mr-2" strokeWidth={2.5} />
            Export Protocol Ledger
          </Button>
        </div>
      </div>

      {/* Filter Section - Spacing Refined */}
      <div className="flex flex-col xl:flex-row items-center justify-between gap-6 pb-6 border-b border-slate-100 no-scrollbar">
        <div className="flex items-center gap-x-6 overflow-x-auto w-full xl:w-auto pb-4 xl:pb-0 no-scrollbar">
           {["all", "approved", "overridden", "declined"].map((s) => (
             <button
               key={s}
               onClick={() => setStatusFilter(s)}
               className={cn(
                 "text-[9px] font-black uppercase tracking-[0.3em] transition-all pb-3 -mb-[28px] border-b-2 whitespace-nowrap",
                 statusFilter === s ? "border-emerald-600 text-emerald-600" : "border-transparent text-slate-400 hover:text-slate-500"
               )}
             >
               {s} Results
             </button>
           ))}
        </div>

        <div className="flex flex-col md:flex-row items-center gap-3 w-full xl:w-auto">
          <div className="relative flex-1 xl:w-72">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-300" strokeWidth={2.5} />
            <Input 
              placeholder="Query Audit Vault..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="h-10 pl-10 rounded-lg border-slate-200 bg-slate-50/50 focus-visible:ring-emerald-500/10 focus-visible:border-emerald-500/50 text-[11px] font-bold placeholder:text-slate-300 italic"
            />
          </div>
          <Button variant="ghost" className="text-[9px] font-black uppercase tracking-widest text-slate-400 hover:bg-slate-50 h-10 px-5 rounded-lg">
            <Calendar className="h-3.5 w-3.5 mr-2" strokeWidth={2} />
            Temporal Scope
          </Button>
        </div>
      </div>

      {/* Results Container - Scrollbar Hidden */}
      <div className="bg-white rounded-2xl border border-slate-200/60 shadow-sm overflow-hidden">
        <div className="overflow-x-auto no-scrollbar">
          <Table>
            <TableHeader className="bg-slate-50/20">
              <TableRow className="border-slate-100/50 hover:bg-transparent">
                <TableHead className="text-[9px] font-black uppercase tracking-widest text-slate-400 py-6 px-8">Intelligence Detail</TableHead>
                <TableHead className="text-[9px] font-black uppercase tracking-widest text-slate-400">Industry Vector</TableHead>
                <TableHead className="text-[9px] font-black uppercase tracking-widest text-slate-400 text-center">Confidence</TableHead>
                <TableHead className="text-[9px] font-black uppercase tracking-widest text-slate-400">Status</TableHead>
                <TableHead className="text-[9px] font-black uppercase tracking-widest text-slate-400">Timestamp</TableHead>
                <TableHead className="text-[9px] font-black uppercase tracking-widest text-slate-400 text-right px-8">Entry</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody className="no-scrollbar">
              {isLoading ? (
                Array.from({ length: 10 }).map((_, i) => (
                  <TableRow key={i} className="border-slate-100">
                    <TableCell colSpan={6} className="py-12 px-12">
                      <Skeleton className="h-12 w-full bg-slate-50 rounded-2xl" />
                    </TableCell>
                  </TableRow>
                ))
              ) : filteredLogs?.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="py-40 text-center">
                     <div className="flex flex-col items-center gap-y-4 opacity-20">
                        <FileText className="h-16 w-16" strokeWidth={1} />
                        <p className="text-sm font-black uppercase tracking-[0.4em] italic">No Records Identified</p>
                     </div>
                  </TableCell>
                </TableRow>
              ) : (
                filteredLogs?.map((log) => (
                  <TableRow key={log.id} className="border-slate-100/50 hover:bg-emerald-50/5 transition-colors group">
                    <TableCell className="py-6 px-8">
                      <div className="space-y-3">
                        <div className="flex items-center gap-x-3">
                          <div className="flex flex-col">
                            <span className="text-[8px] text-slate-400 font-bold uppercase tracking-widest mb-0.5">Subject</span>
                            <span className="text-sm font-black text-slate-700 tracking-tight italic">{log.candidate_name}</span>
                          </div>
                          <div className="h-5 w-[1px] bg-slate-100 rotate-[20deg] mx-1.5" />
                          <div className="flex flex-col">
                            <span className="text-[8px] text-slate-400 font-bold uppercase tracking-widest mb-0.5">Authority</span>
                            <span className="text-sm font-black text-slate-700 tracking-tight italic">{log.expert_name}</span>
                          </div>
                        </div>
                        {log.status === "overridden" && log.override_reason && (
                           <div className="p-3 bg-amber-50/20 border border-amber-100/30 rounded-xl max-w-lg">
                              <p className="text-[11px] text-amber-800 font-bold italic line-clamp-2 leading-tight">
                                "{log.override_reason}"
                              </p>
                           </div>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" className="text-[8px] font-black uppercase tracking-widest text-emerald-800 border-emerald-100 bg-emerald-50/30 px-2.5 py-0.5 rounded-lg">
                        {log.domain}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-center">
                       <div className="flex flex-col items-center gap-y-1">
                         <span className="text-sm font-black text-slate-700 italic tabular-nums">{(log.total_score * 100).toFixed(1)}%</span>
                         <div className="w-8 h-1 bg-slate-100 rounded-full overflow-hidden">
                           <div className={cn("h-full rounded-full transition-all duration-1000", getStatusIndicator(log.status))} style={{ width: `${log.total_score * 100}%` }} />
                         </div>
                       </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-x-2.5 px-3 py-1.5 bg-slate-50/30 rounded-full border border-slate-100/50 w-fit">
                         <div className={cn("h-1.5 w-1.5 rounded-full", getStatusIndicator(log.status))} />
                         <span className="text-[8px] text-slate-500 font-black uppercase tracking-widest">{log.status}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-col gap-y-0">
                        <span className="text-[11px] font-black text-slate-700 tracking-tight tabular-nums">{format(new Date(log.created_at), "dd MMM yyyy")}</span>
                        <span className="text-[8px] text-slate-400 font-bold uppercase tracking-widest">{format(new Date(log.created_at), "HH:mm")}</span>
                      </div>
                    </TableCell>
                    <TableCell className="text-right px-8">
                       <Button size="icon" variant="ghost" className="h-8 w-8 text-slate-300 hover:text-emerald-600 hover:bg-emerald-50 rounded-lg transition-all">
                          <ChevronRight className="h-4 w-4" strokeWidth={2.5} />
                       </Button>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </div>
    </div>
  );
}
