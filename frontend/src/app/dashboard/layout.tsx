import { Sidebar } from "@/components/dashboard/Sidebar";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="h-screen w-full relative flex bg-background overflow-hidden font-sans no-scrollbar">
      {/* Sidebar - Fixed on desktop */}
      <div className="hidden h-full md:flex md:w-72 md:flex-col md:fixed md:inset-y-0 z-[80] no-scrollbar">
        <Sidebar />
      </div>
      
      {/* Main Content Area */}
      <main className="md:pl-72 flex-1 flex flex-col h-screen overflow-y-auto no-scrollbar scroll-smooth">
        {/* Top Navigation Bar - Compact 80% Scale */}
        <header className="h-20 border-b border-slate-200/60 flex items-center px-10 bg-white/80 backdrop-blur-2xl sticky top-0 z-[70]">
          <div className="flex-1" />
          <div className="flex items-center gap-x-10">
            <div className="flex flex-col items-end gap-y-1">
              <span className="text-[9px] font-black uppercase tracking-[0.4em] text-emerald-600/60 leading-none">Security Node</span>
              <span className="text-xs font-black text-slate-900 uppercase tracking-widest whitespace-nowrap">HGM Intelligence Authority</span>
            </div>
            
            <div className="h-8 w-[1px] bg-slate-200/80" />
            
            <div className="flex items-center gap-x-5 group cursor-pointer transition-all">
              <div className="flex flex-col items-end gap-y-0.5">
                <span className="text-[9px] font-black uppercase tracking-[0.2em] text-slate-400">Session ID</span>
                <span className="text-[10px] font-black text-slate-900 font-mono tracking-tighter">SYSLOG_741_ADM</span>
              </div>
              <div className="h-11 w-11 rounded-2xl bg-gradient-to-tr from-emerald-600 to-teal-500 p-[1.5px] shadow-lg shadow-emerald-500/10 group-hover:shadow-emerald-500/20 transition-all transform group-hover:-translate-y-0.5">
                 <div className="h-full w-full bg-white rounded-[14px] flex items-center justify-center font-black text-emerald-700 text-xs italic">
                   AD
                 </div>
              </div>
            </div>
          </div>
        </header>

        {/* Page Content Container - Density Optimized */}
        <div className="p-8 md:p-12 w-full max-w-[1440px] mx-auto min-h-[calc(100vh-80px)] flex flex-col no-scrollbar">
          {children}
        </div>

        {/* Subtle Footer Spacing */}
        <div className="h-12 w-full flex-shrink-0" />
      </main>
    </div>
  );
}
