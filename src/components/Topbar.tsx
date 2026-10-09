"use client";

import React from "react";
import { usePathname } from "next/navigation";
import { useProjectStore, SHOWCASE_PROJECT_IDS } from "@/lib/projectStore";
import { FolderGit2, Loader2, User, Sparkles } from "lucide-react";

export default function Topbar() {
  const pathname = usePathname();
  const { projectsList, selectedProjectId, selectProject, fillDemoData, loading } = useProjectStore();

  const getPageTitle = (path: string) => {
    if (path === "/") return "Script & Scenes";
    if (path.startsWith("/tools/storyboard")) return "Storyboard Studio";
    if (path.startsWith("/world-bible")) return "World Bible & DNA";
    if (path.startsWith("/orchestrator")) return "Orchestrator";
    if (path.startsWith("/internal/v1/jobs")) return "Jobs Center";
    if (path.startsWith("/tools/xray")) return "Asset X-Ray";
    if (path.startsWith("/character/")) return "Character DNA Profile";
    return "Workspace Dashboard";
  };

  const handleDemoClick = async () => {
    // Cycle through showcase projects or default to Thám tử Kilo
    const showcaseList = [
      "33333333-3333-3333-3333-333333333333", // Thám tử Kilo
      "22222222-2222-2222-2222-222222222222", // Paco The parrot
      "11111111-1111-1111-1111-111111111111"  // Mèo Mía
    ];
    const currentIndex = showcaseList.indexOf(selectedProjectId);
    const nextIndex = currentIndex === -1 ? 0 : (currentIndex + 1) % showcaseList.length;
    await fillDemoData(showcaseList[nextIndex]);
  };

  return (
    <header className="h-16 border-b border-slate-800 bg-[#09090b]/80 backdrop-blur-md px-6 flex items-center justify-between sticky top-0 z-40 font-sans">
      {/* Title */}
      <div className="flex items-center gap-3">
        <h1 className="text-lg font-semibold text-white tracking-tight">
          {getPageTitle(pathname)}
        </h1>
      </div>

      {/* Center/Right Section */}
      <div className="flex items-center gap-4">
        {/* Nút Demo Portfolio dành cho người xem */}
        <button
          onClick={handleDemoClick}
          className="flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-purple-600 via-pink-600 to-amber-500 hover:from-purple-500 hover:to-amber-400 text-white text-xs font-bold shadow-lg shadow-purple-500/20 transition-all active:scale-95 cursor-pointer border border-white/10"
          title="Nhấn để nạp và chuyển nhanh giữa các dự án Showcase Portfolio (Thám tử Kilo, Paco, Mèo Mía)"
        >
          <Sparkles className="w-3.5 h-3.5 animate-pulse text-yellow-300" />
          <span>Demo Portfolio</span>
        </button>

        {/* Global Project Dropdown Selector */}
        <div className="flex items-center gap-2">
          <FolderGit2 className="w-4 h-4 text-slate-400" />
          <div className="relative">
            {loading && projectsList.length === 0 ? (
              <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-800 text-xs text-slate-400">
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                <span>Loading projects...</span>
              </div>
            ) : (
              <select
                value={selectedProjectId}
                onChange={(e) => selectProject(e.target.value)}
                className="bg-slate-950 border border-slate-800 hover:border-purple-500/50 text-xs font-semibold text-slate-200 rounded-xl px-3 py-2 outline-none transition-all cursor-pointer pr-8 appearance-none min-w-[220px]"
                style={{
                  backgroundImage: `url("data:image/svg+xml;charset=utf-8,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3E%3Cpath stroke='%2394a3b8' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='m6 8 4 4 4-4'/%3E%3C/svg%3E")`,
                  backgroundPosition: 'right 0.5rem center',
                  backgroundSize: '1.25rem 1.25rem',
                  backgroundRepeat: 'no-repeat'
                }}
              >
                {projectsList.length === 0 ? (
                  <option value="" disabled>No Projects Found</option>
                ) : (
                  projectsList.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.name}
                    </option>
                  ))
                )}
              </select>
            )}
          </div>
        </div>

        {/* User Profile */}
        <div className="flex items-center gap-3 border-l border-slate-850 pl-4">
          <div className="flex flex-col text-right">
            <span className="text-xs font-semibold text-slate-200">Admin</span>
            <span className="text-[10px] text-slate-500 font-medium">Workspace Owner</span>
          </div>
          <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-purple-500 to-pink-500 border border-slate-800 flex items-center justify-center text-white shadow-sm overflow-hidden">
            <User className="w-4 h-4 text-white" />
          </div>
        </div>
      </div>
    </header>
  );
}
