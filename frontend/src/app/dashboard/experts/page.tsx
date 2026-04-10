"use client";

import { useState } from "react";
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
  Plus, 
  MoreHorizontal, 
  Edit2, 
  UserMinus, 
  UserPlus,
  ShieldCheck,
  CheckCircle2,
  XCircle,
  ChevronDown
} from "lucide-react";
import { useExperts } from "@/hooks/useExperts";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogFooter,
  DialogDescription
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Expert } from "@/types";

export default function ExpertPoolPage() {
  const { data: experts, isLoading } = useExperts();
  const [searchTerm, setSearchTerm] = useState("");
  const [domainFilter, setDomainFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [isAddExpertOpen, setIsAddExpertOpen] = useState(false);
  const [editingExpert, setEditingExpert] = useState<Expert | null>(null);

  const filteredExperts = experts?.filter(e => {
    const matchesSearch = e.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                         e.skills.some(s => s.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesDomain = domainFilter === "all" || e.domain === domainFilter;
    const matchesStatus = statusFilter === "all" || (statusFilter === "active" ? e.is_active : !e.is_active);
    return matchesSearch && matchesDomain && matchesStatus;
  });

  const domains = Array.from(new Set(experts?.map(e => e.domain) || []));

  const handleDeactivate = (id: string, name: string) => {
    toast.success(`Access revoked for ${name}.`);
  };

  const handleActivate = (id: string, name: string) => {
    toast.success(`Access restored for ${name}.`);
  };

  return (
    <div className="max-w-full space-y-8 animate-in fade-in slide-in-from-bottom-2 duration-1000 overflow-x-hidden no-scrollbar">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-y-4">
        <div className="flex flex-col gap-y-1">
          <p className="text-[9px] text-emerald-600 font-black uppercase tracking-[0.4em]">Expert Intelligence Pool</p>
          <h1 className="text-3xl font-black tracking-tight text-slate-900 italic">
            Authority Directory
          </h1>
        </div>
        
        <div className="flex items-center gap-x-3">
           <div className="relative group w-full md:w-64">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400 group-focus-within:text-emerald-500 transition-colors" />
            <input 
              placeholder="Search by name or skill..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-white border border-slate-200 h-10 pl-10 pr-4 rounded-xl text-xs font-bold focus:outline-none focus:ring-2 focus:ring-emerald-500/10 focus:border-emerald-500 transition-all shadow-sm"
            />
          </div>
          <Button 
            onClick={() => setIsAddExpertOpen(true)}
            className="h-10 px-6 rounded-xl bg-slate-900 text-white text-[10px] font-black uppercase tracking-widest hover:bg-slate-800 transition-all shadow-lg shadow-slate-900/10"
          >
            <Plus className="h-3.5 w-3.5 mr-2" strokeWidth={3} />
            Induct Expert
          </Button>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="px-8 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
           <div className="flex items-center gap-x-8 overflow-x-auto no-scrollbar">
             <div className="flex items-center gap-x-3">
                <span className="text-[9px] font-black uppercase tracking-widest text-slate-400">Sector:</span>
                <Select value={domainFilter} onValueChange={(val) => val && setDomainFilter(val)}>
                  <SelectTrigger className="h-7 border-none bg-transparent p-0 text-[10px] font-black uppercase tracking-widest text-emerald-600 focus:ring-0 w-[140px]">
                    <SelectValue placeholder="All Clusters" />
                  </SelectTrigger>
                  <SelectContent className="bg-white border-slate-200">
                    <SelectItem value="all" className="text-[10px] uppercase font-black tracking-widest">All Clusters</SelectItem>
                    {domains.map(d => (
                      <SelectItem key={d} value={d} className="text-[10px] uppercase font-black tracking-widest">{d}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
             </div>
             <div className="h-4 w-[1px] bg-slate-200" />
             <div className="flex items-center gap-x-3">
                <span className="text-[9px] font-black uppercase tracking-widest text-slate-400">Status:</span>
                <Select value={statusFilter} onValueChange={(val) => val && setStatusFilter(val)}>
                  <SelectTrigger className="h-7 border-none bg-transparent p-0 text-[10px] font-black uppercase tracking-widest text-emerald-600 focus:ring-0 w-[120px]">
                    <SelectValue placeholder="Any Status" />
                  </SelectTrigger>
                  <SelectContent className="bg-white border-slate-200">
                    <SelectItem value="all" className="text-[10px] uppercase font-black tracking-widest">Any Status</SelectItem>
                    <SelectItem value="active" className="text-[10px] uppercase font-black tracking-widest">Active</SelectItem>
                    <SelectItem value="inactive" className="text-[10px] uppercase font-black tracking-widest">Inactive</SelectItem>
                  </SelectContent>
                </Select>
             </div>
           </div>
           <div className="hidden md:block text-[9px] font-black uppercase tracking-widest text-slate-300">
             Total Authorities: {filteredExperts?.length || 0}
           </div>
        </div>

        <div className="overflow-x-auto no-scrollbar">
          <Table>
            <TableHeader className="bg-slate-50/30">
              <TableRow className="border-slate-100 hover:bg-transparent">
                <TableHead className="text-[9px] font-black uppercase tracking-widest text-slate-400 py-6 px-10">Expert Authority</TableHead>
                <TableHead className="text-[9px] font-black uppercase tracking-widest text-slate-400">Designation</TableHead>
                <TableHead className="text-[9px] font-black uppercase tracking-widest text-slate-400">Industry Vector</TableHead>
                <TableHead className="text-[9px] font-black uppercase tracking-widest text-slate-400">Expertise</TableHead>
                <TableHead className="text-[9px] font-black uppercase tracking-widest text-slate-400 text-center">Protocol Status</TableHead>
                <TableHead className="text-[9px] font-black uppercase tracking-widest text-slate-400 text-right px-10">Entry</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <TableRow key={i} className="border-slate-100">
                    <TableCell colSpan={6} className="py-10 px-10">
                       <Skeleton className="h-12 w-full bg-slate-50 rounded-xl" />
                    </TableCell>
                  </TableRow>
                ))
              ) : filteredExperts?.map((expert) => (
                <TableRow key={expert.id} className="border-slate-100/60 hover:bg-slate-50/50 transition-colors group">
                  <TableCell className="py-5 px-10">
                    <div className="flex items-center gap-x-3">
                       <div className="h-10 w-10 bg-emerald-50 rounded-xl flex items-center justify-center text-emerald-600 font-black text-xs border border-emerald-100 group-hover:bg-emerald-600 group-hover:text-white transition-all">
                          {expert.name.substring(0, 2).toUpperCase()}
                       </div>
                       <div className="flex flex-col">
                          <span className="text-sm font-black text-slate-800 italic uppercase tracking-tight">{expert.name}</span>
                          <span className="text-[8px] text-slate-400 font-black tracking-widest uppercase mt-0.5">ID: {expert.id.toUpperCase()}</span>
                       </div>
                    </div>
                  </TableCell>
                  <TableCell className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">
                    {expert.designation}
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline" className="text-[8px] font-black uppercase tracking-widest text-emerald-700 bg-emerald-50/30 border-emerald-100">
                      {expert.domain}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex flex-wrap gap-1.5 max-w-[200px]">
                      {expert.skills.slice(0, 3).map(skill => (
                        <span key={skill} className="px-2 py-0.5 bg-slate-50 text-[8px] text-slate-400 font-black uppercase tracking-widest rounded-md border border-slate-100">
                          {skill}
                        </span>
                      ))}
                      {expert.skills.length > 3 && (
                        <span className="text-[8px] text-slate-300 font-black uppercase tracking-widest ml-1">+{expert.skills.length - 3}</span>
                      )}
                    </div>
                  </TableCell>
                  <TableCell className="text-center">
                     <div className={cn(
                       "inline-flex items-center gap-x-2 px-3 py-1.5 rounded-full border text-[8px] font-black uppercase tracking-widest",
                       expert.is_active ? "bg-emerald-50 border-emerald-100 text-emerald-600" : "bg-rose-50 border-rose-100 text-rose-600"
                     )}>
                        <div className={cn("h-1.5 w-1.5 rounded-full", expert.is_active ? "bg-emerald-500" : "bg-rose-500")} />
                        {expert.is_active ? "Live" : "Revoked"}
                     </div>
                  </TableCell>
                  <TableCell className="text-right px-10">
                    <div className="flex items-center justify-end gap-x-2">
                       <Button 
                        size="icon" 
                        variant="ghost" 
                        onClick={() => setEditingExpert(expert)}
                        className="h-8 w-8 rounded-lg text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 transition-all"
                       >
                          <Edit2 className="h-3.5 w-3.5" />
                       </Button>
                       {expert.is_active ? (
                         <Button 
                          onClick={() => handleDeactivate(expert.id, expert.name)}
                          size="icon" 
                          variant="ghost" 
                          className="h-8 w-8 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-all"
                         >
                            <UserMinus className="h-3.5 w-3.5" strokeWidth={2.5} />
                         </Button>
                       ) : (
                         <Button 
                          onClick={() => handleActivate(expert.id, expert.name)}
                          size="icon" 
                          variant="ghost" 
                          className="h-8 w-8 rounded-lg text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 transition-all"
                         >
                            <UserPlus className="h-3.5 w-3.5" strokeWidth={2.5} />
                         </Button>
                       )}
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </div>

      <Dialog open={isAddExpertOpen} onOpenChange={setIsAddExpertOpen}>
        <DialogContent className="bg-white border-none rounded-3xl max-w-xl shadow-2xl p-0 overflow-hidden">
          <div className="bg-slate-900 p-8 border-b border-white/5">
            <div className="flex items-center gap-x-5">
              <div className="h-12 w-12 bg-white/10 rounded-xl flex items-center justify-center border border-white/10 shadow-sm">
                 <ShieldCheck className="h-6 w-6 text-emerald-400" />
              </div>
              <div className="flex flex-col">
                <DialogTitle className="text-xl font-black italic text-white uppercase tracking-tight">Induct Authority</DialogTitle>
                <DialogDescription className="text-[9px] uppercase tracking-[0.2em] text-white/40 font-black mt-0.5">
                  Establishing a new expert evaluation profile in the intelligence core.
                </DialogDescription>
              </div>
            </div>
          </div>
          <div className="p-8 space-y-6">
             <div className="grid grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-[9px] font-black uppercase tracking-widest text-slate-400 ml-1">Full Legal Name</label>
                  <Input 
                    className="bg-slate-50 border-slate-200 rounded-xl h-11 text-xs font-bold italic" 
                    placeholder="Enter name..." 
                    defaultValue=""
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[9px] font-black uppercase tracking-widest text-slate-400 ml-1">Current Designation</label>
                  <Input 
                    className="bg-slate-50 border-slate-200 rounded-xl h-11 text-xs font-bold italic" 
                    placeholder="e.g. Senior Partner" 
                    defaultValue=""
                  />
                </div>
             </div>
             <div className="grid grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-[9px] font-black uppercase tracking-widest text-slate-400 ml-1">Cluster Domain</label>
                  <Input 
                    className="bg-slate-50 border-slate-200 rounded-xl h-11 text-xs font-bold italic" 
                    placeholder="e.g. Engineering" 
                    defaultValue=""
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[9px] font-black uppercase tracking-widest text-slate-400 ml-1">Years of Authority</label>
                  <Input 
                    type="number" 
                    className="bg-slate-50 border-slate-200 rounded-xl h-11 text-xs font-bold italic" 
                    placeholder="10" 
                    defaultValue=""
                  />
                </div>
             </div>
             <div className="space-y-2">
                <label className="text-[9px] font-black uppercase tracking-widest text-slate-400 ml-1">Intelligence Skills (Comma separated)</label>
                <Input 
                  className="bg-slate-50 border-slate-200 rounded-xl h-11 text-xs font-bold italic" 
                  placeholder="React, Node.js, AI Policy..." 
                  defaultValue=""
                />
             </div>
          </div>
          <DialogFooter className="p-8 pt-0 flex gap-x-3">
             <Button 
              variant="ghost" 
              onClick={() => setIsAddExpertOpen(false)}
              className="flex-1 h-11 rounded-xl text-[10px] font-black uppercase tracking-widest text-slate-400 border border-slate-100"
             >
                Abort Protocol
             </Button>
             <Button 
              className="flex-1 h-11 rounded-xl text-[10px] font-black uppercase tracking-widest bg-emerald-600 text-white shadow-xl shadow-emerald-500/20"
              onClick={() => {
                toast.success("Establishment protocol initiated.");
                setIsAddExpertOpen(false);
              }}
             >
                Commit Induction
             </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={!!editingExpert} onOpenChange={(open) => !open && setEditingExpert(null)}>
        <DialogContent className="bg-white border-none rounded-3xl max-w-xl shadow-2xl p-0 overflow-hidden">
          <div className="bg-slate-900 p-8 border-b border-white/5">
            <div className="flex items-center gap-x-5">
              <div className="h-12 w-12 bg-white/10 rounded-xl flex items-center justify-center border border-white/10 shadow-sm">
                 <Edit2 className="h-5 w-5 text-emerald-400" />
              </div>
              <div className="flex flex-col">
                <DialogTitle className="text-xl font-black italic text-white uppercase tracking-tight">Authority Modification</DialogTitle>
                <DialogDescription className="text-[9px] uppercase tracking-[0.2em] text-white/40 font-black mt-0.5">
                  Updating intelligence profile for {editingExpert?.name} (Audit Required).
                </DialogDescription>
              </div>
            </div>
          </div>
          <div className="p-8 space-y-6">
             {editingExpert && (
               <>
                 <div className="grid grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <label className="text-[9px] font-black uppercase tracking-widest text-slate-400 ml-1">Full Legal Name</label>
                      <Input 
                        className="bg-slate-50 border-slate-200 rounded-xl h-11 text-xs font-bold italic" 
                        key={`name-${editingExpert.id}`}
                        defaultValue={editingExpert.name} 
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-[9px] font-black uppercase tracking-widest text-slate-400 ml-1">Current Designation</label>
                      <Input 
                        className="bg-slate-50 border-slate-200 rounded-xl h-11 text-xs font-bold italic" 
                        key={`designation-${editingExpert.id}`}
                        defaultValue={editingExpert.designation} 
                      />
                    </div>
                 </div>
                 <div className="grid grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <label className="text-[9px] font-black uppercase tracking-widest text-slate-400 ml-1">Cluster Domain</label>
                      <Input 
                        className="bg-slate-50 border-slate-200 rounded-xl h-11 text-xs font-bold italic" 
                        key={`domain-${editingExpert.id}`}
                        defaultValue={editingExpert.domain} 
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-[9px] font-black uppercase tracking-widest text-slate-400 ml-1">Years of Authority</label>
                      <Input 
                        type="number" 
                        className="bg-slate-50 border-slate-200 rounded-xl h-11 text-xs font-bold italic" 
                        key={`years-${editingExpert.id}`}
                        defaultValue={editingExpert.experience_years} 
                      />
                    </div>
                 </div>
                 <div className="space-y-2">
                    <label className="text-[9px] font-black uppercase tracking-widest text-slate-400 ml-1">Intelligence Skills (Comma separated)</label>
                    <Input 
                      className="bg-slate-50 border-slate-200 rounded-xl h-11 text-xs font-bold italic" 
                      key={`skills-${editingExpert.id}`}
                      defaultValue={editingExpert.skills?.join(", ")} 
                    />
                 </div>
               </>
             )}
          </div>
          <DialogFooter className="p-8 pt-0 flex gap-x-3">
             <Button 
              variant="ghost" 
              onClick={() => setEditingExpert(null)}
              className="flex-1 h-11 rounded-xl text-[10px] font-black uppercase tracking-widest text-slate-400 border border-slate-100"
             >
                Abort Change
             </Button>
             <Button 
              className="flex-1 h-11 rounded-xl text-[10px] font-black uppercase tracking-widest bg-emerald-600 text-white shadow-xl shadow-emerald-500/20"
              onClick={() => {
                toast.success(`Intelligence profile for ${editingExpert?.name} finalized.`);
                setEditingExpert(null);
              }}
             >
                Apply Updates
             </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
