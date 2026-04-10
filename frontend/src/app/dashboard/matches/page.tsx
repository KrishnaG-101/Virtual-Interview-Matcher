"use client";

import { Suspense, useState, useMemo } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { useCandidate } from "@/hooks/useCandidate";
import { useMatches } from "@/hooks/useMatches";
import { useExperts } from "@/hooks/useExperts";
import { useApproveMatch } from "@/hooks/useApproveMatch";
import { useOverrideMatch } from "@/hooks/useOverrideMatch";
import { MatchCard } from "@/components/dashboard/MatchCard";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { 
  ArrowLeft, 
  ArrowUpRight, 
  AlertCircle,
  Link as LinkIcon,
  ChevronDown,
  Search,
  BrainCircuit,
  ShieldCheck,
  Zap,
  ChevronRight
} from "lucide-react";
import Link from "next/link";
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogFooter, 
  DialogHeader, 
  DialogTitle 
} from "@/components/ui/dialog";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { MatchScore } from "@/types";
import { cn } from "@/lib/utils";

function MatchReviewContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const candidateId = searchParams.get("candidateId");
  
  const { data: candidate, isLoading: cLoading } = useCandidate(candidateId);
  const { data: matches, isLoading: mLoading } = useMatches(candidateId);
  const { data: experts } = useExperts();
  
  const approveMatch = useApproveMatch();
  const overrideMatch = useOverrideMatch();

  const [confirmDialog, setConfirmDialog] = useState<{ open: boolean; match: MatchScore | null }>({ open: false, match: null });
  const [overrideDialog, setOverrideDialog] = useState<{ open: boolean; match: MatchScore | null }>({ open: false, match: null });
  
  const [overrideExpertId, setOverrideExpertId] = useState("");
  const [overrideReason, setOverrideReason] = useState("");

  const handleApprove = (match: MatchScore) => {
    setConfirmDialog({ open: true, match });
  };

  const onConfirmApprove = async () => {
    if (!confirmDialog.match) return;
    const expert = experts?.find(e => e.id === confirmDialog.match?.expert_id);
    
    toast.promise(approveMatch.mutateAsync(confirmDialog.match.id), {
      loading: "Establishing Command Protocol...",
      success: `Panel confirmed. ${expert?.name} assigned.`,
      error: "Protocol failed."
    });
    setConfirmDialog({ open: false, match: null });
  };

  const handleOverride = (match: MatchScore) => {
    setOverrideDialog({ open: true, match });
  };

  const onConfirmOverride = async () => {
    if (!overrideDialog.match || !overrideExpertId || overrideReason.length < 20) return;
    
    toast.promise(overrideMatch.mutateAsync({ 
      matchId: overrideDialog.match.id, 
      expertId: overrideExpertId, 
      reason: overrideReason 
    }), {
      loading: "Executing Terminal Override...",
      success: "Manual intervention logged successfully.",
      error: "Override failed."
    });
    
    setOverrideDialog({ open: false, match: null });
    setOverrideExpertId("");
    setOverrideReason("");
  };

  if (!candidateId) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-center space-y-8 animate-in fade-in duration-1000">
        <div className="h-24 w-24 rounded-3xl bg-white border border-slate-200 shadow-xl flex items-center justify-center mb-4">
          <ShieldCheck className="h-10 w-10 text-emerald-500" strokeWidth={1.5} />
        </div>
        <div className="space-y-4">
          <h2 className="text-3xl font-black text-slate-900 italic tracking-tight uppercase">Null Target Session</h2>
          <p className="text-xs text-slate-400 font-bold uppercase tracking-[0.4em]">No subject ID provided to intelligence core</p>
        </div>
        <Link href="/dashboard/candidates">
          <Button variant="outline" className="h-14 px-8 rounded-2xl bg-white border-slate-200 text-xs font-black uppercase tracking-widest text-[#064e3b] shadow-sm hover:shadow-md transition-all">
            Return to Command Center
          </Button>
        </Link>
      </div>
    );
  }

  const expertForMatch = (expertId: string) => experts?.find(e => e.id === expertId);

  return (
    <div className="max-w-full space-y-12 animate-in fade-in slide-in-from-bottom-2 duration-1000 overflow-x-hidden no-scrollbar">
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-12">
        <div className="space-y-4">
          <div className="flex items-center gap-x-6">
            <Link href="/dashboard/candidates">
              <Button size="icon" variant="outline" className="h-12 w-12 rounded-2xl bg-white border-slate-200 shadow-sm text-slate-400 hover:text-emerald-500 hover:border-emerald-200 transition-all">
                <ArrowLeft className="h-5 w-5" strokeWidth={2.5} />
              </Button>
            </Link>
            <div className="flex flex-col gap-y-1">
               <p className="text-[10px] text-emerald-600 font-black uppercase tracking-[0.4em]">Analytic Engine</p>
                <h1 className="text-3xl font-black tracking-tight text-slate-900 italic">Match Intelligence</h1>
            </div>
          </div>
        </div>

        {cLoading ? (
          <Skeleton className="h-16 w-72 bg-slate-100 rounded-2xl" />
        ) : (
          <div className="flex items-center gap-x-8 px-8 py-4 bg-white border border-slate-200 rounded-2xl shadow-sm italic group hover:shadow-md transition-shadow shrink-0">
             <div className="flex flex-col">
                <span className="text-[9px] text-slate-400 font-black uppercase tracking-widest">Subject Identifier</span>
                <span className="text-lg font-black text-slate-900">{candidate?.name}</span>
             </div>
             <div className="w-[1px] h-8 bg-slate-100 hidden sm:block" />
             <div className="hidden sm:flex flex-col">
                <span className="text-[9px] text-slate-400 font-black uppercase tracking-widest">Industry Cluster</span>
                <span className="text-[10px] font-black text-emerald-600 tracking-widest uppercase">{candidate?.domain}</span>
             </div>
          </div>
        )}
      </div>

      <div className="space-y-12">
        <div className="flex items-center gap-x-4 uppercase tracking-[0.4em] text-[11px] text-slate-400 font-black">
           <BrainCircuit className="h-4 w-4 text-emerald-500" strokeWidth={2.5} />
           Optimized Recommendations
        </div>
        
        {mLoading ? (
          <div className="space-y-12">
            <Skeleton className="h-[500px] w-full bg-slate-100 rounded-[2rem]" />
            <Skeleton className="h-[400px] w-full bg-slate-100 rounded-[2rem]" />
          </div>
        ) : matches && matches.length > 0 ? (
          <div className="grid grid-cols-1 gap-12 pb-12">
            {matches.map((match) => {
              const expert = expertForMatch(match.expert_id);
              if (!expert) return null;
              return (
                <MatchCard 
                  key={match.id} 
                  match={match} 
                  expert={expert} 
                  onApprove={handleApprove}
                  onOverride={handleOverride}
                />
              );
            })}
          </div>
        ) : (
           <div className="py-32 text-center border-2 border-dashed border-slate-200 rounded-[2rem] bg-slate-50/50">
              <Zap className="h-10 w-10 text-slate-200 mx-auto mb-4" />
              <p className="text-sm font-black uppercase tracking-[0.4em] text-slate-300 italic">Zero candidates located for this requirement set</p>
           </div>
        )}
      </div>

      {/* Dialogs remain same */}
      <Dialog open={confirmDialog.open} onOpenChange={(open) => !open && setConfirmDialog({ open: false, match: null })}>
        <DialogContent className="bg-white border-none rounded-3xl max-w-lg shadow-2xl p-0 overflow-hidden">
          <div className="bg-emerald-50/50 p-8 border-b border-emerald-100/50">
            <div className="flex items-center gap-x-5">
              <div className="h-12 w-12 bg-white rounded-xl flex items-center justify-center border border-emerald-200 shadow-sm shadow-emerald-500/10">
                 <ShieldCheck className="h-6 w-6 text-emerald-600" />
              </div>
              <div className="flex flex-col">
                <DialogTitle className="text-xl font-black italic text-slate-900 uppercase tracking-tight">Protocol Entry</DialogTitle>
                <DialogDescription className="text-[9px] uppercase tracking-[0.2em] text-emerald-700/60 font-black mt-0.5">
                  Establishing a formal evaluation assignment protocol.
                </DialogDescription>
              </div>
            </div>
          </div>
          <div className="p-8 py-10 text-center space-y-2.5">
            <div className="flex flex-col gap-y-1">
              <span className="text-[10px] text-slate-400 font-black uppercase tracking-widest">Confirmed Authority</span>
              <p className="text-xl font-black text-slate-900 italic tracking-tight">
                {expertForMatch(confirmDialog.match?.expert_id || '')?.name} 
              </p>
            </div>
            <div className="h-8 w-[1px] bg-slate-100 mx-auto" />
            <div className="flex flex-col gap-y-1">
              <span className="text-[10px] text-slate-400 font-black uppercase tracking-widest">Assigned Subject</span>
              <p className="text-sm font-bold text-slate-500 uppercase tracking-widest">
                {candidate?.name}
              </p>
            </div>
          </div>

          <DialogFooter className="flex flex-col sm:flex-row gap-3 p-8 pt-0">
            <Button 
               variant="ghost" 
               className="flex-1 text-[10px] font-black uppercase tracking-widest text-slate-400 hover:text-slate-900 border border-slate-200 h-11 rounded-xl transition-all"
               onClick={() => setConfirmDialog({ open: false, match: null })}
            >
              Abort Session
            </Button>
            <Button 
               className="flex-1 bg-emerald-600 text-white text-[10px] font-black uppercase tracking-widest h-11 rounded-xl shadow-lg shadow-emerald-500/20 active:scale-[0.98] transition-all"
               onClick={onConfirmApprove}
            >
              Commit Assignment
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={overrideDialog.open} onOpenChange={(open) => !open && setOverrideDialog({ open: false, match: null })}>
        <DialogContent className="bg-white border-none rounded-3xl max-w-xl shadow-2xl p-0 overflow-hidden">
          <div className="bg-rose-50/50 p-8 border-b border-rose-100/50">
            <div className="flex items-center gap-x-5">
              <div className="h-12 w-12 bg-white rounded-xl flex items-center justify-center border border-rose-200 shadow-sm shadow-rose-500/10">
                 <AlertCircle className="h-6 w-6 text-rose-600" />
              </div>
              <div className="flex flex-col">
                <DialogTitle className="text-xl font-black italic text-slate-900 uppercase tracking-tight">Manual Override Required</DialogTitle>
                <DialogDescription className="text-[9px] uppercase tracking-[0.2em] text-rose-700/60 font-black mt-0.5">
                  Intelligence System Bypass Protocol • Audit Logged: SYSLOG_741_MANUAL
                </DialogDescription>
              </div>
            </div>
          </div>
          
          <div className="p-8 space-y-6">
            <div className="space-y-2.5">
              <label className="text-[9px] font-black uppercase tracking-widest text-slate-400 ml-1">Assigned Expert Authority</label>
              <Select onValueChange={(val) => setOverrideExpertId(val || "")} value={overrideExpertId}>
                <SelectTrigger className="bg-slate-50 border-slate-200 text-slate-900 h-11 rounded-xl text-xs font-bold focus:ring-emerald-500/10 italic">
                  <SelectValue placeholder="Select high-level authority..." />
                </SelectTrigger>
                <SelectContent className="bg-white border-slate-200 text-slate-900 rounded-xl shadow-2xl overflow-hidden p-1">
                   {experts?.map(exp => (
                     <SelectItem 
                      key={exp.id} 
                      value={exp.id} 
                      className="text-[10px] font-black uppercase tracking-widest focus:bg-emerald-50 focus:text-emerald-700 cursor-pointer py-2.5 px-3 rounded-lg transition-colors"
                     >
                        <div className="flex flex-col">
                          <span>{exp.name}</span>
                          <span className="text-[8px] text-slate-400 mt-0.5 font-bold">{exp.designation}</span>
                        </div>
                     </SelectItem>
                   ))}
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2.5">
              <label className="text-[9px] font-black uppercase tracking-widest text-slate-400 ml-1">Intervention Justification</label>
              <Textarea 
                placeholder="Declare reasoning for manual system intervention (Minimum 20 characters)..." 
                value={overrideReason}
                onChange={(e) => setOverrideReason(e.target.value)}
                className="bg-slate-50 border-slate-200 text-slate-900 min-h-[120px] rounded-xl text-xs font-bold placeholder:text-slate-300 focus-visible:ring-emerald-500/10 p-4 italic resize-none leading-relaxed"
              />
              <div className="flex justify-between items-center px-1 pt-1">
                 <div className="flex items-center gap-x-2">
                    <div className={cn("h-1.5 w-1.5 rounded-full transition-all duration-500", overrideReason.length >= 20 ? "bg-emerald-500 shadow-lg shadow-emerald-500/40" : "bg-rose-500 shadow-lg shadow-rose-500/40")} />
                    <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest tabular-nums">
                      {overrideReason.length} / 20 Threshold
                    </span>
                 </div>
                 <p className="text-[8px] text-amber-600 font-black uppercase tracking-[0.1em] italic bg-amber-50 px-2 py-0.5 rounded-md border border-amber-100/50">
                    Flagged for High-Level Review
                 </p>
              </div>
            </div>
          </div>

          <DialogFooter className="flex flex-col sm:flex-row gap-3 p-8 pt-0">
            <Button 
               variant="ghost" 
               className="flex-1 text-[10px] font-black uppercase tracking-widest text-slate-400 hover:text-slate-900 border border-slate-200 h-11 rounded-xl transition-all"
               onClick={() => setOverrideDialog({ open: false, match: null })}
            >
              Abort Action
            </Button>
            <Button 
               className="flex-1 bg-slate-900 text-white text-[10px] font-black uppercase tracking-widest h-11 rounded-xl shadow-lg shadow-slate-950/20 active:scale-[0.98] transition-all disabled:opacity-50 disabled:cursor-not-allowed"
               disabled={!overrideExpertId || overrideReason.length < 20}
               onClick={onConfirmOverride}
            >
              Commit Intervention
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

export default function MatchReviewPage() {
  return (
    <Suspense fallback={<div className="h-screen w-full flex flex-col items-center justify-center gap-y-6 bg-background">
      <div className="h-10 w-10 border-4 border-emerald-500/20 border-t-emerald-500 rounded-full animate-spin" />
      <span className="text-[11px] font-black uppercase tracking-[0.6em] text-slate-300 italic animate-pulse">Initializing Analyst Environment</span>
    </div>}>
      <MatchReviewContent />
    </Suspense>
  );
}
