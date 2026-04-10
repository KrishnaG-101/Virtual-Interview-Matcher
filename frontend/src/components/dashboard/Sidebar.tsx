"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { cn } from "@/lib/utils";
import { 
  LayoutDashboard, 
  Users, 
  GitMerge, 
  ClipboardList, 
  LogOut,
  ShieldCheck,
  Search,
  Bell,
  User,
  UserCheck
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";

interface Route {
  label: string;
  icon: any;
  href: string;
}

const routes: Route[] = [
  {
    label: "Overview",
    icon: LayoutDashboard,
    href: "/dashboard",
  },
  {
    label: "Candidates",
    icon: Users,
    href: "/dashboard/candidates",
  },
  {
    label: "Experts",
    icon: UserCheck,
    href: "/dashboard/experts",
  },
  {
    label: "Matches",
    icon: GitMerge,
    href: "/dashboard/matches",
  },
  {
    label: "History",
    icon: ClipboardList,
    href: "/dashboard/history",
  },
];

export function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();

  const onLogout = () => {
    // Clear cookie for session termination
    document.cookie = "token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT";
    router.push("/login");
  };

  return (
    <div className="flex flex-col h-full bg-[#064e3b] text-white shadow-2xl shadow-emerald-500/20 z-50">
      {/* Brand Header */}
      <div className="px-6 py-8 flex items-center gap-x-2.5">
        <div className="p-2 bg-emerald-400/10 rounded-xl border border-emerald-400/20 backdrop-blur-sm">
          <ShieldCheck className="h-6 w-6 text-emerald-400" strokeWidth={2.5} />
        </div>
        <div className="flex flex-col">
          <span className="font-black text-lg leading-none tracking-tight">HGM-07</span>
          <span className="text-[9px] text-emerald-400/60 uppercase tracking-[0.3em] mt-1 font-bold">Admin Portal</span>
        </div>
      </div>
      
      {/* Navigation */}
      <ScrollArea className="flex-1 px-4">
        <div className="space-y-1.5 pt-4">
          <p className="px-4 text-[9px] uppercase tracking-[0.4em] text-emerald-400/30 font-black mb-4">Core Operations</p>
          {routes.map((route) => {
            const isActive = pathname === route.href || (route.href !== "/dashboard" && pathname.startsWith(route.href));
            const Icon = route.icon;
            return (
              <Link
                key={route.href}
                href={route.href}
                className={cn(
                  "text-xs group flex px-4 py-3.5 w-full justify-start font-black cursor-pointer rounded-xl transition-all duration-300",
                  isActive 
                    ? "bg-white text-[#064e3b] shadow-lg shadow-emerald-950/40 translate-x-1" 
                    : "text-emerald-100/50 hover:text-white hover:bg-white/5"
                )}
              >
                <div className="flex items-center flex-1">
                  <Icon className={cn("h-4.5 w-4.5 mr-3 ease-in-out duration-300", isActive ? "text-[#064e3b]" : "text-emerald-400/40 group-hover:text-white")} strokeWidth={isActive ? 3 : 2} />
                  <span className="uppercase tracking-widest text-[10px]">{route.label}</span>
                </div>
              </Link>
            );
          })}
        </div>
      </ScrollArea>
      
      {/* Footer User Info */}
      <div className="mt-auto px-4 pb-8 pt-4 space-y-4">
        <div className="mx-1 p-4 bg-white/5 rounded-2xl border border-white/10 flex items-center gap-x-3 backdrop-blur-sm">
          <div className="h-9 w-9 bg-emerald-400 rounded-xl flex items-center justify-center text-[#064e3b] font-black shadow-lg shadow-emerald-400/20 text-xs">
            AD
          </div>
          <div className="flex flex-col overflow-hidden text-ellipsis">
            <p className="text-[11px] font-black leading-none uppercase tracking-wide">Administrator</p>
            <p className="text-[9px] text-emerald-400/50 transition truncate mt-1.5 font-bold">admin@hgm07.gov.in</p>
          </div>
        </div>

        <button 
          onClick={onLogout}
          className="w-full flex items-center px-5 py-3.5 text-emerald-100/40 hover:text-rose-400 hover:bg-rose-400/10 transition-all rounded-xl group"
        >
          <LogOut className="h-4.5 w-4.5 mr-3 text-emerald-400/20 group-hover:text-rose-400 transition-colors" strokeWidth={2.5} />
          <span className="font-black text-[9px] uppercase tracking-[0.3em]">Terminate Session</span>
        </button>
      </div>
    </div>
  );
}
