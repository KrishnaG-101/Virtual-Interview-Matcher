"use client";

import { MatchScore, Expert } from "@/types";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { 
  CheckCircle2, 
  Terminal, 
  BrainCircuit, 
  ChevronRight,
  ChevronUp,
  ChevronDown,
  ShieldCheck,
  Star,
  Zap
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useEffect, useState } from "react";

interface MatchCardProps {
  match: MatchScore;
  expert: Expert;
  onApprove: (match: MatchScore) => void;
  onOverride: (match: MatchScore) => void;
}

export function MatchCard({ match, expert, onApprove, onOverride }: MatchCardProps) {
  const [mounted, setMounted] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const getScoreColor = (score: number) => {
    if (score >= 0.8) return "bg-emerald-500";
    if (score >= 0.6) return "bg-amber-500";
    return "bg-rose-500";
  };

  const isRank1 = match.rank === 1;

  return (
    <Card className={cn(
      "border-slate-200 bg-white overflow-hidden transition-all duration-500 rounded-3xl",
      isRank1 ? "ring-2 ring-emerald-500/10 shadow-2xl shadow-emerald-500/10" : "shadow-sm hover:shadow-md"
    )}>
      {isRank1 && (
        <div className="bg-emerald-500 text-white text-[10px] uppercase font-black tracking-[0.2em] py-1.5 px-4 text-center">
          Intelligence Recommendation #1
        </div>
      )}
      <CardContent className="p-8 md:p-12 space-y-12">
        <div className="flex flex-col md:flex-row items-start justify-between gap-8">
          <div className="flex gap-x-8">
            <div className={cn(
              "h-20 w-20 flex items-center justify-center text-2xl font-black border-2 rounded-2xl",
              isRank1 ? "bg-emerald-50 border-emerald-100 text-emerald-600" : "bg-slate-50 border-slate-100 text-slate-400"
            )}>
              {match.rank}
            </div>
            <div className="space-y-1.5 pt-1">
              <h3 className="text-2xl font-black text-slate-900 tracking-tight">{expert.name}</h3>
              <p className="text-sm text-slate-400 font-bold uppercase tracking-widest">{expert.designation}</p>
              <div className="flex flex-wrap gap-2 mt-4">
                {expert.skills.slice(0, 4).map(skill => (
                  <span key={skill} className="px-3 py-1 bg-slate-50 text-[10px] text-slate-500 font-bold uppercase tracking-widest rounded-full border border-slate-100">
                    {skill}
                  </span>
                ))}
              </div>
            </div>
          </div>
          
          <div className="flex flex-col items-start md:items-end gap-y-1.5 p-6 bg-emerald-50 rounded-2xl border border-emerald-100 min-w-[200px]">
             <div className="flex items-center gap-x-2 text-emerald-600 font-black italic">
                <Zap className="h-4 w-4 fill-emerald-600" />
                <span className="text-4xl tracking-tighter tabular-nums">
                  {(match.total_score * 100).toFixed(1)}%
                </span>
             </div>
             <p className="text-[10px] text-emerald-600/70 font-black uppercase tracking-[0.2em]">Match Confidence</p>
          </div>
        </div>

        <div className="space-y-4 pt-12 border-t border-slate-100">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-x-4 uppercase tracking-[0.4em] text-[10px] text-slate-400 font-black">
               <BrainCircuit className="h-4 w-4 text-emerald-500" strokeWidth={2.5} />
               Analytic Breakdown
            </div>
            <Button 
              variant="outline" 
              onClick={() => setIsExpanded(!isExpanded)}
              className="h-10 px-6 rounded-xl border-slate-200 text-[10px] font-black uppercase tracking-widest text-[#064e3b] hover:bg-emerald-50 transition-all flex items-center gap-x-2"
            >
              {isExpanded ? (
                <>Collapse Analysis <ChevronUp className="h-3 w-3" strokeWidth={3} /></>
              ) : (
                <>View Detailed Analysis <ChevronDown className="h-3 w-3" strokeWidth={3} /></>
              )}
            </Button>
          </div>

          <div className={cn(
            "grid grid-cols-1 lg:grid-cols-2 gap-12 py-8 overflow-hidden transition-all duration-700 ease-in-out",
            isExpanded ? "opacity-100 max-h-[1000px] translate-y-0" : "opacity-0 max-h-0 -translate-y-4 pointer-events-none"
          )}>
            <div className="space-y-8">
               <ScoreFactor 
                  label="Semantic Alignment" 
                  value={match.score_breakdown.semantic_similarity * 100} 
                  color={getScoreColor(match.score_breakdown.semantic_similarity)}
                  mounted={isExpanded}
               />
               <ScoreFactor 
                  label="Technical Skill Overlap" 
                  value={match.score_breakdown.skill_overlap * 100} 
                  color={getScoreColor(match.score_breakdown.skill_overlap)}
                  mounted={isExpanded}
                  delay={200}
               />
               <ScoreFactor 
                  label="Seniority Calibration" 
                  value={match.score_breakdown.experience_delta * 100} 
                  color={getScoreColor(match.score_breakdown.experience_delta)}
                  mounted={isExpanded}
                  delay={400}
               />
            </div>
            <div className="space-y-8 flex flex-col justify-between">
               <div className="space-y-8">
                  <ScoreFactor 
                      label="Domain Specificity" 
                      value={match.score_breakdown.domain_match * 100} 
                      color={getScoreColor(match.score_breakdown.domain_match)}
                      mounted={isExpanded}
                      delay={600}
                  />
                  <ScoreFactor 
                      label="Calendar Availability" 
                      value={match.score_breakdown.availability_score * 100} 
                      color={getScoreColor(match.score_breakdown.availability_score)}
                      mounted={isExpanded}
                      delay={800}
                  />
               </div>
               
               <div className="p-6 bg-slate-50 border border-slate-100 rounded-2xl relative overflow-hidden group">
                  <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                    <BrainCircuit className="h-12 w-12 text-slate-900" />
                  </div>
                  <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 mb-3">AI Reasoning Bridge</h4>
                  <p className="text-sm text-slate-600 leading-relaxed font-bold italic relative z-10">
                    {match.explanation}
                  </p>
               </div>
            </div>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row gap-4">
          {match.status === "suggested" ? (
            <>
              <Button 
                onClick={() => onApprove(match)}
                className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-black uppercase tracking-[0.2em] h-16 rounded-2xl shadow-lg shadow-emerald-500/20 transition-all active:scale-[0.98]"
              >
                Approve Recommendation
              </Button>
              <Button 
                variant="outline"
                onClick={() => onOverride(match)}
                className="flex-1 border-slate-200 bg-white hover:bg-slate-50 text-slate-600 text-xs font-black uppercase tracking-[0.2em] h-16 rounded-2xl transition-all active:scale-[0.98]"
              >
                Manual Intervention
              </Button>
            </>
          ) : (
            <div className={cn(
              "w-full flex items-center justify-between p-6 rounded-2xl border",
              match.status === "approved" ? "bg-emerald-50 border-emerald-100 text-emerald-700" : "bg-amber-50 border-amber-100 text-amber-700"
            )}>
              <div className="flex items-center gap-x-3">
                <ShieldCheck className="h-5 w-5" strokeWidth={2.5} />
                <span className="text-sm font-black uppercase tracking-widest">Protocol {match.status}</span>
              </div>
              <div className="text-[10px] font-bold opacity-60 uppercase tracking-widest">
                Identifier: {match.assigned_by || 'SYSLOG_AUTH'}
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

function ScoreFactor({ label, value, color, mounted, delay = 0 }: { 
  label: string; 
  value: number; 
  color: string;
  mounted: boolean;
  delay?: number;
}) {
  return (
    <div className="space-y-3">
       <div className="flex justify-between items-end px-1">
          <span className="text-[10px] text-slate-400 uppercase tracking-widest font-black">{label}</span>
          <span className="text-sm font-black text-slate-900 tabular-nums">{(value).toFixed(0)}%</span>
       </div>
       <div className="h-2.5 w-full bg-slate-100 rounded-full overflow-hidden p-0.5 border border-slate-200/50">
          <div 
             className={cn("h-full rounded-full transition-all duration-1000 ease-out shadow-sm", color)} 
             style={{ 
                width: mounted ? `${value}%` : '0%',
                transitionDelay: `${delay}ms`
             }} 
          />
       </div>
    </div>
  );
}
