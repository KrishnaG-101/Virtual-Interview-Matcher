"use client";

import { StatsCard } from "@/components/dashboard/StatsCard";
import { 
  Users, 
  GitMerge, 
  CheckCircle2, 
  Clock, 
  BarChart3, 
  ArrowUpRight,
  TrendingUp,
  Activity,
  Zap,
  ShieldAlert
} from "lucide-react";
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer, 
  AreaChart, 
  Area 
} from "recharts";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { cn } from "@/lib/utils";

const chartData = [
  { name: "Mon", matches: 40, candidates: 24, intelligence: 85 },
  { name: "Tue", matches: 30, candidates: 13, intelligence: 88 },
  { name: "Wed", matches: 60, candidates: 98, intelligence: 92 },
  { name: "Thu", matches: 47, candidates: 39, intelligence: 90 },
  { name: "Fri", matches: 58, candidates: 48, intelligence: 94 },
  { name: "Sat", matches: 23, candidates: 38, intelligence: 91 },
  { name: "Sun", matches: 34, candidates: 43, intelligence: 89 },
];

export default function DashboardPage() {
  return (
    <div className="max-w-full space-y-8 animate-in fade-in slide-in-from-bottom-2 duration-1000 overflow-x-hidden no-scrollbar">
      <div className="flex items-end justify-between">
        <div className="flex flex-col gap-y-1">
          <p className="text-[9px] text-emerald-600 font-black uppercase tracking-[0.4em]">Current Status • Intelligence v2.4</p>
          <h1 className="text-3xl font-black tracking-tight text-slate-900 italic">
            Command Overview
          </h1>
        </div>
        <div className="hidden md:flex items-center gap-x-3 px-3.5 py-1.5 bg-emerald-50 rounded-xl border border-emerald-100">
          <div className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
          <span className="text-[9px] font-black uppercase tracking-widest text-emerald-700">All Systems Operational</span>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <StatsCard
          title="Total Candidates"
          value="1,284"
          description="Gross Monthly Processing"
          icon={Users}
          trend="+12.5%"
          trendType="up"
        />
        <StatsCard
          title="Expert Fleet"
          value="142"
          description="Available for Evaluation"
          icon={Activity}
          trend="+4.2%"
          trendType="up"
        />
        <StatsCard
          title="Confidence Score"
          value="94%"
          description="AI Predictive Accuracy"
          icon={Zap}
          trend="+2.1%"
          trendType="up"
        />
        <StatsCard
          title="Incident Queue"
          value="42"
          description="Manual Review Required"
          icon={ShieldAlert}
          trend="-2.4%"
          trendType="down"
        />
      </div>

      <div className="grid gap-8 lg:grid-cols-7">
        <Card className="lg:col-span-4 border-slate-200/60 bg-white shadow-sm rounded-2xl overflow-hidden">
          <CardHeader className="px-8 pt-8 flex flex-row items-start justify-between">
            <div className="space-y-1">
              <CardTitle className="text-xs font-black uppercase tracking-[0.2em] text-slate-400">Intelligence Velocity</CardTitle>
              <CardDescription className="text-xs font-bold text-slate-900/60 italic">Daily matching throughput across all sectors.</CardDescription>
            </div>
            <div className="flex items-center gap-x-2 bg-slate-50 px-3 py-1 rounded-full border border-slate-100">
               <TrendingUp className="h-3.5 w-3.5 text-emerald-500" />
               <span className="text-[9px] font-black uppercase tracking-widest text-slate-600">8.4% Up</span>
            </div>
          </CardHeader>
          <CardContent className="h-[320px] w-full px-6 pb-8 pt-2">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData}>
                <defs>
                  <linearGradient id="colorMatches" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#059669" stopOpacity={0.1}/>
                    <stop offset="95%" stopColor="#059669" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                <XAxis 
                  dataKey="name" 
                  stroke="#94a3b8" 
                  fontSize={11}
                  tickLine={false}
                  axisLine={false}
                  dy={15}
                  fontWeight="bold"
                />
                <YAxis 
                  stroke="#94a3b8" 
                  fontSize={11}
                  tickLine={false}
                  axisLine={false}
                  tickFormatter={(value) => `${value}`}
                  fontWeight="bold"
                />
                <Tooltip 
                  cursor={{ stroke: '#059669', strokeWidth: 1, strokeDasharray: '4 4' }}
                  contentStyle={{ backgroundColor: "#ffffff", border: "1px solid #e2e8f0", borderRadius: "16px", boxShadow: "0 10px 15px -3px rgb(0 0 0 / 0.1)" }}
                  itemStyle={{ color: "#064e3b", fontSize: "11px", textTransform: "uppercase", fontWeight: "bold", letterSpacing: "0.1em" }}
                />
                <Area 
                  type="monotone" 
                  dataKey="intelligence" 
                  stroke="#059669" 
                  strokeWidth={3}
                  fillOpacity={1} 
                  fill="url(#colorMatches)" 
                  animationDuration={2000}
                />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card className="lg:col-span-3 border-slate-200/60 bg-white shadow-sm rounded-2xl overflow-hidden">
          <CardHeader className="px-8 pt-8">
            <CardTitle className="text-xs font-black uppercase tracking-[0.2em] text-slate-400">Panel Distribution</CardTitle>
            <CardDescription className="text-xs font-bold text-slate-900/60 italic">Successful assignments by industry domain.</CardDescription>
          </CardHeader>
          <CardContent className="h-[320px] px-6 pb-8 pt-2">
             <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                <XAxis 
                  dataKey="name" 
                  stroke="#94a3b8" 
                  fontSize={11}
                  tickLine={false}
                  axisLine={false}
                  dy={15}
                  fontWeight="bold"
                />
                <YAxis 
                  stroke="#94a3b8" 
                  fontSize={11}
                  tickLine={false}
                  axisLine={false}
                  fontWeight="bold"
                />
                <Tooltip 
                  cursor={{ fill: '#f1f5f9' }}
                  contentStyle={{ backgroundColor: "#ffffff", border: "1px solid #e2e8f0", borderRadius: "16px", boxShadow: "0 10px 15px -3px rgb(0 0 0 / 0.1)" }}
                  itemStyle={{ color: "#064e3b", fontSize: "11px", textTransform: "uppercase", fontWeight: "bold" }}
                />
                <Bar 
                  dataKey="matches" 
                  fill="#059669" 
                  radius={[8, 8, 0, 0]} 
                  barSize={32}
                  animationDuration={1500}
                />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>
      
      <div className="grid gap-8 md:grid-cols-3 pt-4 pb-12">
        <HealthMetric 
           title="Infrastructure Pulse" 
           value="99.9%" 
           subtitle="Cluster 07 Accuracy Index" 
           color="bg-emerald-500"
           progress={99.9}
        />
        <HealthMetric 
           title="Parsing Efficiency" 
           value="88.4%" 
           subtitle="CV Semantics Verification" 
           color="bg-emerald-600"
           progress={88.4}
        />
        <HealthMetric 
           title="Human Override" 
           value="4.2%" 
           subtitle="Manual Intervention Rate" 
           color="bg-slate-900"
           progress={4.2}
        />
      </div>
    </div>
  );
}

function HealthMetric({ title, value, subtitle, color, progress }: { title: string, value: string, subtitle: string, color: string, progress: number }) {
  return (
    <Card className="border-slate-200/60 bg-white shadow-sm rounded-2xl p-1.5">
      <CardHeader className="flex flex-row items-center justify-between pb-1.5 px-4 pt-4">
        <CardTitle className="text-[9px] uppercase tracking-[0.2em] text-slate-400 font-black">{title}</CardTitle>
        <div className="p-1.5 bg-slate-50 rounded-lg">
           <Activity className="h-3 w-3 text-slate-400" strokeWidth={2.5} />
        </div>
      </CardHeader>
      <CardContent className="space-y-4 px-4 pb-4">
        <div className="flex items-baseline gap-x-1.5">
          <div className="text-2xl font-black text-slate-900 italic">{value}</div>
          <p className="text-[9px] text-slate-400 uppercase tracking-widest font-black font-mono">NOMINAL</p>
        </div>
        <p className="text-[10px] text-slate-500 font-bold italic pr-3">{subtitle}</p>
        <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden mt-4 border border-slate-200/50 p-0.5">
           <div className={cn("h-full rounded-full transition-all duration-2000", color)} style={{ width: `${progress}%` }} />
        </div>
      </CardContent>
    </Card>
  );
}
