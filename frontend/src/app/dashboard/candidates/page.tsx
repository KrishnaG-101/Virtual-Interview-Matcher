"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
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
  Filter, 
  RefreshCw, 
  ChevronRight, 
  MoreHorizontal,
  Play,
  UserCheck,
  Zap
} from "lucide-react";
import { useCandidates } from "@/hooks/useCandidates";
import { useRunMatching } from "@/hooks/useRunMatching";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

export default function CandidateQueuePage() {
  const router = useRouter();
  const { data: candidates, isLoading } = useCandidates();
  const runMatching = useRunMatching();
  const [searchTerm, setSearchTerm] = useState("");
  const [filter, setFilter] = useState<string>("all");

  const filteredCandidates = candidates?.filter(c => {
    const matchesSearch = c.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                         c.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = filter === "all" || c.parse_status === filter;
    return matchesSearch && matchesFilter;
  });

  const handleRunMatching = (e: React.MouseEvent, id: string, name: string) => {
    e.stopPropagation();
    toast.promise(runMatching.mutateAsync(id), {
      loading: `Initializing Intelligence Pipeline for ${name}...`,
      success: `Vector analysis complete for ${name}.`,
      error: `Failed to initialize pipeline.`
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "done": return "bg-emerald-500";
      case "pending": return "bg-amber-500";
      case "failed": return "bg-rose-500";
      default: return "bg-slate-400";
    }
  };

  return (
    <div className="max-w-full space-y-12 animate-in fade-in slide-in-from-bottom-2 duration-1000 overflow-x-hidden no-scrollbar">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-y-4">
        <div className="flex flex-col gap-y-1">
          <p className="text-[9px] text-emerald-600 font-black uppercase tracking-[0.4em]">Resource Management</p>
          <h1 className="text-3xl font-black tracking-tight text-slate-900 italic">
            Candidate Queue
          </h1>
        </div>
        
        <div className="flex items-center gap-x-3">
           <div className="relative group w-full md:w-72">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400 group-focus-within:text-emerald-500 transition-colors" />
            <Input 
              placeholder="Search Intelligence Ledger..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="h-10 pl-10 rounded-xl border-slate-200 bg-white shadow-sm focus-visible:ring-emerald-500/20 focus-visible:border-emerald-500 text-xs font-bold placeholder:text-slate-300"
            />
          </div>
          <Button variant="outline" className="h-10 w-10 rounded-xl border-slate-200 bg-white p-0">
             <Filter className="h-3.5 w-3.5 text-slate-400" />
          </Button>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="px-8 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
           <div className="flex items-center gap-x-6 overflow-x-auto pb-1.5 md:pb-0 no-scrollbar scrollbar-hide">
             {["all", "pending", "done", "failed"].map((f) => (
               <button
                 key={f}
                 onClick={() => setFilter(f)}
                 className={cn(
                   "text-[9px] font-black uppercase tracking-[0.2em] transition-all pb-1.5 border-b-2 whitespace-nowrap",
                   filter === f ? "border-emerald-600 text-emerald-600" : "border-transparent text-slate-400 hover:text-slate-600"
                 )}
               >
                 {f} Records
               </button>
             ))}
           </div>
           <div className="hidden md:block text-[9px] font-black uppercase tracking-widest text-slate-300">
             Total Records: {filteredCandidates?.length || 0}
           </div>
        </div>

        <div className="overflow-x-auto no-scrollbar scrollbar-thin scrollbar-thumb-slate-200 scrollbar-track-transparent">
          <Table>
            <TableHeader className="bg-slate-50/30">
              <TableRow className="border-slate-100 hover:bg-transparent">
                <TableHead className="text-[10px] font-black uppercase tracking-widest text-slate-400 py-6 px-10">Subject Profile</TableHead>
                <TableHead className="text-[10px] font-black uppercase tracking-widest text-slate-400">Industry Sector</TableHead>
                <TableHead className="text-[10px] font-black uppercase tracking-widest text-slate-400 text-center">Seniority</TableHead>
                <TableHead className="text-[10px] font-black uppercase tracking-widest text-slate-400">Pipeline Status</TableHead>
                <TableHead className="text-[10px] font-black uppercase tracking-widest text-slate-400 text-right px-10">Operations</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                Array.from({ length: 6 }).map((_, i) => (
                  <TableRow key={i} className="border-slate-100">
                    <TableCell colSpan={5} className="py-10 px-10">
                      <div className="flex items-center gap-x-4">
                        <Skeleton className="h-12 w-12 rounded-2xl bg-slate-100" />
                        <div className="space-y-2">
                          <Skeleton className="h-4 w-48 bg-slate-100" />
                          <Skeleton className="h-3 w-32 bg-slate-100" />
                        </div>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              ) : filteredCandidates?.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="py-32 text-center">
                    <div className="flex flex-col items-center gap-y-4 opacity-20">
                       <UserCheck className="h-12 w-12" strokeWidth={1} />
                       <p className="text-sm font-black uppercase tracking-[0.4em]">No matching subjects located</p>
                    </div>
                  </TableCell>
                </TableRow>
              ) : (
                filteredCandidates?.map((candidate) => (
                  <TableRow 
                    key={candidate.id} 
                    onClick={() => router.push(`/dashboard/matches?candidateId=${candidate.id}`)}
                    className="border-slate-100 hover:bg-emerald-50/30 transition-all cursor-pointer group"
                  >
                    <TableCell className="py-5 px-8">
                      <div className="flex items-center gap-x-3">
                        <div className="h-10 w-10 rounded-xl bg-slate-50 flex items-center justify-center text-slate-300 font-black group-hover:bg-white group-hover:text-emerald-500 transition-colors border border-slate-100 text-xs">
                          {candidate.name.substring(0, 2).toUpperCase()}
                        </div>
                        <div className="flex flex-col gap-y-0.5">
                          <span className="text-base font-black text-slate-900 group-hover:text-emerald-700 transition-colors tracking-tight italic">
                            {candidate.name}
                          </span>
                          <span className="text-[9px] text-slate-400 font-bold uppercase tracking-widest">
                            {candidate.email}
                          </span>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="secondary" className="bg-slate-100 text-slate-600 border-none px-3 py-1 text-[10px] font-bold uppercase tracking-widest">
                        {candidate.domain}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-center font-bold text-slate-500 text-xs uppercase tracking-widest">
                       {candidate.experience_level}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-x-3 px-4 py-2 bg-white rounded-full border border-slate-100 w-fit">
                        <div className={cn("h-2 w-2 rounded-full", getStatusColor(candidate.parse_status))} />
                        <span className="text-[10px] text-slate-600 font-black uppercase tracking-widest">
                          {candidate.parse_status}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell className="text-right px-10">
                      <div className="flex items-center justify-end gap-x-4">
                        <Button
                          size="sm"
                          variant="link"
                          disabled={candidate.parse_status !== "done"}
                          onClick={(e) => handleRunMatching(e, candidate.id, candidate.name)}
                          className="h-10 text-[10px] font-black uppercase tracking-widest text-emerald-600 hover:text-emerald-700 px-4 group/btn"
                        >
                          <Zap className="h-3.5 w-3.5 mr-2 group-hover/btn:fill-emerald-600 transition-all" />
                          Run Intelligence
                        </Button>
                        <div className="h-10 w-10 flex items-center justify-center rounded-2xl bg-slate-50 border border-slate-100 group-hover:bg-emerald-500 group-hover:border-emerald-600 group-hover:text-white transition-all transform group-hover:translate-x-1">
                           <ChevronRight className="h-4 w-4" strokeWidth={3} />
                        </div>
                      </div>
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
