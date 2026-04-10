"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ShieldCheck, ArrowRight, Lock, Mail, Terminal, Globe } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { toast } from "sonner";

export default function LoginPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({ email: "", password: "" });

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    // Simulated API call
    setTimeout(() => {
      // Set cookie for middleware access (expires in 1 day)
      document.cookie = "token=mock-jwt-token; path=/; max-age=86400; SameSite=Lax";
      
      toast.success("Welcome back, Administrator");
      router.push("/dashboard");
    }, 1500);
  };

  return (
    <div className="min-h-screen w-full flex bg-[#f8fafc] font-sans overflow-hidden">
      {/* Visual Section - Deep Emerald */}
      <div className="hidden lg:flex w-1/2 bg-[#064e3b] p-16 flex-col justify-between relative overflow-hidden">
        {/* Abstract Background Decoration */}
        <div className="absolute top-0 right-0 w-[800px] h-[800px] bg-emerald-400/10 rounded-full -translate-y-1/2 translate-x-1/2 blur-3xl" />
        <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-emerald-500/10 rounded-full translate-y-1/2 -translate-x-1/2 blur-3xl" />

        <div className="relative z-10 flex items-center gap-x-3">
          <div className="p-3 bg-white/10 rounded-2xl border border-white/20 backdrop-blur-sm">
            <ShieldCheck className="h-8 w-8 text-emerald-400" strokeWidth={2.5} />
          </div>
          <div>
             <h1 className="text-2xl font-black text-white leading-none">HGM-07</h1>
             <p className="text-emerald-400/60 text-xs font-bold uppercase tracking-[0.3em] mt-1">Intelligence Division</p>
          </div>
        </div>

        <div className="relative z-10 max-w-md">
           <h2 className="text-5xl font-black text-white leading-[1.1] mb-6 tracking-tight">
             Optimizing Evaluation <span className="text-emerald-400 font-normal italic font-serif">Intelligence.</span>
           </h2>
           <p className="text-emerald-100/60 text-lg font-bold leading-relaxed pr-8">
             Enterprise-grade matching for high-stakes assessment panels. Securing the future of departmental evaluation.
           </p>
        </div>

        <div className="relative z-10 flex items-center gap-x-8">
           <div className="flex flex-col">
              <span className="text-3xl font-black text-white tabular-nums">94%</span>
              <span className="text-[10px] text-emerald-400/60 uppercase font-black tracking-widest mt-1">Match Accuracy</span>
           </div>
           <div className="h-10 w-[1px] bg-white/10" />
           <div className="flex flex-col">
              <span className="text-3xl font-black text-white tabular-nums">420ms</span>
              <span className="text-[10px] text-emerald-400/60 uppercase font-black tracking-widest mt-1">Pipeline Latency</span>
           </div>
        </div>
      </div>

      {/* Form Section */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8 md:p-16">
        <div className="w-full max-w-md space-y-12">
          <div className="space-y-4">
            <h3 className="text-3xl font-black text-slate-900 tracking-tight">System Authentication</h3>
            <p className="text-slate-400 font-bold uppercase tracking-widest text-xs">Access the administrative dashboard</p>
          </div>

          <form onSubmit={handleLogin} className="space-y-6">
            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 ml-1">Work Email</label>
              <div className="relative group">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-300 group-focus-within:text-emerald-500 transition-colors" />
                <Input 
                  type="email" 
                  placeholder="admin@hgm07.gov.in" 
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="h-14 pl-12 rounded-2xl border-slate-200 bg-white shadow-sm focus-visible:ring-emerald-500/20 focus-visible:border-emerald-500 text-sm font-bold placeholder:text-slate-300 placeholder:font-normal"
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex justify-between items-center px-1">
                <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Security Phrase</label>
                <button type="button" className="text-[10px] font-black uppercase tracking-widest text-emerald-600 hover:text-emerald-700">Lost Key?</button>
              </div>
              <div className="relative group">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-300 group-focus-within:text-emerald-500 transition-colors" />
                <Input 
                  type="password" 
                  placeholder="••••••••••••" 
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  className="h-14 pl-12 rounded-2xl border-slate-200 bg-white shadow-sm focus-visible:ring-emerald-500/20 focus-visible:border-emerald-500 text-sm font-bold placeholder:text-slate-300"
                  required
                />
              </div>
            </div>

            <Button 
              type="submit" 
              disabled={loading}
              className="w-full h-14 bg-emerald-600 hover:bg-emerald-700 text-white font-black uppercase tracking-[0.2em] rounded-2xl shadow-xl shadow-emerald-500/20 transition-all active:scale-[0.98] group"
            >
              {loading ? (
                <div className="h-5 w-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <div className="flex items-center">
                  Establish Session
                  <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
                </div>
              )}
            </Button>
          </form>

          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t border-slate-200" />
            </div>
            <div className="relative flex justify-center text-[10px] uppercase font-black tracking-widest">
              <span className="bg-[#f8fafc] px-4 text-slate-400">Trusted Authentication Only</span>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <Button variant="outline" className="h-14 rounded-2xl border-slate-200 bg-white hover:bg-slate-50 transition-all active:scale-[0.98]">
              <Globe className="h-5 w-5 mr-3 text-slate-400" />
              <span className="text-xs font-black uppercase tracking-widest text-slate-600">Google SSY</span>
            </Button>
            <Button variant="outline" className="h-14 rounded-2xl border-slate-200 bg-white hover:bg-slate-50 transition-all active:scale-[0.98]">
               <Terminal className="h-5 w-5 mr-3 text-slate-400" />
               <span className="text-xs font-black uppercase tracking-widest text-slate-600">Git Vault</span>
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
