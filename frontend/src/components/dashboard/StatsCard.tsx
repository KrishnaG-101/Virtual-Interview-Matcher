import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { LucideIcon } from "lucide-react";

interface StatsCardProps {
  title: string;
  value: string | number;
  description: string;
  icon: LucideIcon;
  trend?: string;
  trendType?: "up" | "down" | "neutral";
}

export function StatsCard({ title, value, description, icon: Icon, trend, trendType }: StatsCardProps) {
  return (
    <Card className="border-slate-200/60 bg-white hover:border-emerald-200 hover:shadow-lg hover:shadow-emerald-500/5 transition-all duration-300 rounded-2xl group">
      <CardContent className="p-6">
        <div className="flex items-center justify-between space-y-0 pb-4">
          <div className="p-2.5 bg-slate-50 rounded-xl group-hover:bg-emerald-50 transition-colors duration-300">
            <Icon className="h-4 w-4 text-slate-400 group-hover:text-emerald-500 transition-colors duration-300" strokeWidth={2.5} />
          </div>
          {trend && (
            <div className={cn(
              "text-[10px] font-black px-2.5 py-0.5 rounded-full border",
              trendType === "up" ? "bg-emerald-50 text-emerald-600 border-emerald-100" : trendType === "down" ? "bg-rose-50 text-rose-600 border-rose-100" : "bg-slate-50 text-slate-600 border-slate-100"
            )}>
              {trend}
            </div>
          )}
        </div>
        <div className="flex flex-col gap-y-0.5">
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{title}</p>
          <div className="text-2xl font-black text-slate-900 tracking-tight tabular-nums mt-0.5 italic">{value}</div>
          <div className="flex items-center mt-3">
            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">{description}</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
