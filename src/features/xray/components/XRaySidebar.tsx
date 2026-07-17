import React from "react";
import { 
  Sparkles, X, Plus, ArrowLeft, Trash2,
  Folder, Database, User, MapPin, Box, Paintbrush, Activity, Clapperboard
} from "lucide-react";
import Link from "next/link";

interface Project {
  id: string;
  name: string;
  stylePrompt: string;
  masterStyleUrl: string;
  description?: string;
}

interface XRaySidebarProps {
  projectsList: Project[];
  selectedProjectId: string;
  onProjectChange: (id: string) => void;
  activeProject: Project | null;
  projectStyleUrl: string;
  setProjectStyleUrl: (url: string) => void;
  projectStylePrompt: string;
  setProjectStylePrompt: (prompt: string) => void;
  isAnalyzingProjectStyle: boolean;
  onAnalyzeProjectStyle: () => void;
  isSavingProject: boolean;
  onSaveProjectStyle: () => void;
  isCreatingProject: boolean;
  setIsCreatingProject: (val: boolean) => void;
  newProjectName: string;
  setNewProjectName: (name: string) => void;
  onCreateProjectQuick: () => void;
  onUpdateProject?: (id: string, payload: any) => Promise<void>;
  API_BASE_URL: string;
  
  // Dynamic Asset Linking Props
  dbAssetsList?: any[];
  selectedAssetId?: string;
  onSelectAsset?: (assetId: string, entityType: "character" | "location" | "prop" | "style") => void;
}

export function XRaySidebar({
  projectsList = [],
  selectedProjectId,
  onProjectChange,
  activeProject,
  projectStyleUrl,
  setProjectStyleUrl,
  projectStylePrompt,
  setProjectStylePrompt,
  isAnalyzingProjectStyle,
  onAnalyzeProjectStyle,
  isSavingProject,
  onSaveProjectStyle,
  isCreatingProject,
  setIsCreatingProject,
  newProjectName,
  setNewProjectName,
  onCreateProjectQuick,
  onUpdateProject,
  API_BASE_URL,
  dbAssetsList = [],
  selectedAssetId = "",
  onSelectAsset
}: XRaySidebarProps) {
  const [projectName, setProjectName] = React.useState(() => {
    if (typeof window !== "undefined") {
      return localStorage.getItem("storymee_xray_project_name") || "World Asset - Bé Mai";
    }
    return "World Asset - Bé Mai";
  });

  const projectAssets = React.useMemo(() => {
    if (!activeProject || !dbAssetsList) return [];
    return dbAssetsList.filter((a: any) => {
      return a.universeId === activeProject.id || a.projectId === activeProject.id;
    });
  }, [activeProject, dbAssetsList]);

  return (
    <aside className="w-72 bg-[#060608] border-r border-white/5 flex flex-col justify-between shrink-0 h-full relative z-20 overflow-y-auto custom-scrollbar">
      <div className="p-5 space-y-6">
        
        {/* Brand Logo & Back to Hub */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-purple-600 via-pink-600 to-amber-500 flex items-center justify-center shadow-lg shadow-purple-600/10">
                <Sparkles className="w-4.5 h-4.5 text-white animate-pulse" />
              </div>
              <div>
                <h1 className="text-xs font-black tracking-widest text-white uppercase">STORYMEE</h1>
                <span className="text-[7px] font-black tracking-widest text-purple-400 bg-purple-500/10 px-1.5 py-0.5 rounded border border-purple-500/10 uppercase block mt-0.5 w-fit">
                  Project Hub
                </span>
              </div>
            </div>
            
            <Link 
              href="/" 
              className="text-[9px] font-bold text-neutral-400 hover:text-white transition flex items-center gap-1 bg-white/5 hover:bg-white/10 px-2 py-1 rounded-lg border border-white/5"
            >
              <ArrowLeft className="w-3 h-3" /> Back
            </Link>
          </div>
        </div>

        {/* 🌌 PROJECT SELECTION */}
        <div className="bg-purple-950/10 border border-purple-500/10 rounded-2xl p-4 space-y-4 shadow-md backdrop-blur-md">
          <div className="flex items-center justify-between border-b border-white/5 pb-2">
            <div className="flex flex-col gap-0.5">
              <span className="text-[9px] font-black uppercase tracking-widest text-purple-400 flex items-center gap-1">
                <Folder className="w-3 h-3" /> Dự án Đang Chọn
              </span>
              {activeProject?.stylePrompt && (
                <span className="text-[6.5px] font-black tracking-wider text-emerald-400 bg-emerald-500/10 px-1 py-0.2 rounded uppercase block w-fit border border-emerald-500/20">
                  ✨ Style Unified
                </span>
              )}
            </div>
            
            <button 
              onClick={() => setIsCreatingProject(!isCreatingProject)}
              className="text-[8px] font-black text-neutral-500 hover:text-purple-400 uppercase transition flex items-center gap-0.5 cursor-pointer"
            >
              {isCreatingProject ? <X className="w-2.5 h-2.5" /> : <Plus className="w-2.5 h-2.5" />}
              {isCreatingProject ? "Huỷ" : "Tạo"}
            </button>
          </div>

          {isCreatingProject ? (
            <div className="space-y-2 bg-black/40 p-2.5 rounded-xl border border-white/5 animate-in slide-in-from-top-1 duration-200">
              <div className="space-y-1">
                <label className="text-[8px] font-black uppercase tracking-widest text-neutral-500">Tên Dự Án Mới</label>
                <input 
                  type="text" 
                  value={newProjectName}
                  onChange={(e) => setNewProjectName(e.target.value)}
                  placeholder="Ví dụ: Cổ Tích Việt Nam, Cyberpunk..."
                  className="w-full bg-black border border-white/10 rounded-lg px-2.5 py-1.5 text-xs text-neutral-300 outline-none focus:border-purple-500/40 font-bold"
                />
              </div>
              <button 
                onClick={onCreateProjectQuick}
                disabled={!newProjectName.trim()}
                className="w-full bg-purple-600 hover:bg-purple-500 disabled:opacity-50 text-white py-1.5 rounded-lg text-[9px] font-bold uppercase transition cursor-pointer"
              >
                Tạo dự án
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              {/* Select active Project */}
              <div className="space-y-1">
                <select 
                  value={selectedProjectId}
                  onChange={(e) => onProjectChange(e.target.value)}
                  className="w-full bg-black border border-purple-500/20 rounded-xl px-3 py-2 text-xs text-neutral-200 outline-none focus:border-purple-500/50 transition cursor-pointer font-black"
                >
                  {projectsList.map(p => (
                    <option key={p.id} value={p.id}>{p.name}</option>
                  ))}
                </select>
              </div>

            </div>
          )}
        </div>

        {/* 📦 KHO TÀI NGUYÊN DỰ ÁN (PROJECT ASSETS SUMMARY) */}
        {activeProject && (
          <div className="bg-neutral-900/40 border border-white/5 rounded-2xl p-4 space-y-3.5 shadow-md backdrop-blur-md">
            <div className="flex items-center justify-between border-b border-white/5 pb-2">
              <span className="text-[9px] font-black uppercase tracking-widest text-neutral-400 flex items-center gap-1.5">
                <Database className="w-3.5 h-3.5 text-blue-400" /> Kho tài nguyên Project
              </span>
              <span className="text-[7.5px] bg-blue-500/10 border border-blue-500/20 px-2 py-0.5 rounded-md text-blue-400 font-black">
                {projectAssets.length} Assets
              </span>
            </div>

            {/* Grid Thống Kê */}
            <div className="grid grid-cols-2 gap-2">
              <div className="bg-black/40 p-2.5 rounded-xl border border-white/5 flex flex-col justify-between">
                <span className="text-[7px] font-black uppercase text-neutral-500 flex items-center gap-1">
                  <User className="w-2.5 h-2.5 text-amber-500" /> Nhân vật
                </span>
                <span className="text-sm font-black text-amber-400 font-mono mt-1">
                  {projectAssets.filter(a => (a.entityType || "character") === "character").length}
                </span>
              </div>
              <div className="bg-black/40 p-2.5 rounded-xl border border-white/5 flex flex-col justify-between">
                <span className="text-[7px] font-black uppercase text-neutral-500 flex items-center gap-1">
                  <MapPin className="w-2.5 h-2.5 text-emerald-500" /> Bối cảnh
                </span>
                <span className="text-sm font-black text-emerald-400 font-mono mt-1">
                  {projectAssets.filter(a => a.entityType === "location").length}
                </span>
              </div>
              <div className="bg-black/40 p-2.5 rounded-xl border border-white/5 flex flex-col justify-between">
                <span className="text-[7px] font-black uppercase text-neutral-500 flex items-center gap-1">
                  <Box className="w-2.5 h-2.5 text-blue-500" /> Đạo cụ
                </span>
                <span className="text-sm font-black text-blue-400 font-mono mt-1">
                  {projectAssets.filter(a => a.entityType === "prop").length}
                </span>
              </div>
              <div className="bg-black/40 p-2.5 rounded-xl border border-white/5 flex flex-col justify-between">
                <span className="text-[7px] font-black uppercase text-neutral-500 flex items-center gap-1">
                  <Paintbrush className="w-2.5 h-2.5 text-pink-500" /> Style guides
                </span>
                <span className="text-sm font-black text-pink-400 font-mono mt-1">
                  {projectAssets.filter(a => a.entityType === "style").length}
                </span>
              </div>
            </div>

            {/* Thống kê Tổng Quát */}
            <div className="space-y-1.5 bg-black/20 p-2 rounded-xl border border-white/5 text-[9px] text-neutral-400 leading-relaxed font-medium">
              <div className="flex justify-between items-center">
                <span>Trạng thái Master Style:</span>
                <span className={`font-bold ${activeProject.stylePrompt ? "text-emerald-400" : "text-amber-500"}`}>
                  {activeProject.stylePrompt ? "🟢 Đã thiết lập" : "🟡 Chưa có"}
                </span>
              </div>
            </div>
          </div>
        )}
      </div>

      <div className="p-4 border-t border-white/5 text-[9px] text-neutral-600 font-black tracking-widest flex items-center justify-between">
        <span>UNIFIED PIPELINE</span>
        <span className="text-purple-500 font-black">v4.0</span>
      </div>
    </aside>
  );
}
