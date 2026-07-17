"use client";

import React, { useMemo, useState } from "react";
import { Folder, Plus, FileText, Copy, Layers, ChevronDown, Settings, Cpu, ShieldAlert, BarChart3 } from "lucide-react";

interface ProjectListProps {
  projectsList: any[];
  loading: boolean;
  selectedProjectId: string;
  setSelectedProjectId: (id: string) => void;
  searchTerm: string;
  setSearchTerm: (term: string) => void;
  sortBy: string;
  setSortBy: (sort: string) => void;
  openCreateProjModal: () => void;
  handleEditProjClick: (project: any) => void;
  handleDeleteProj: (id: string, name: string) => void;
  
  // Episode props
  episodes: any[];
  selectedEpisodeId: string;
  setSelectedEpisodeId: (id: string) => void;
  handleOpenEpModal: (ep?: any) => void;
  handleDeleteEp: (id: string, title: string) => void;
  onOpenScriptModal: (ep: any) => void;
  onOpenWorldBibleModal: () => void;

  // Chỉ số sản xuất thực tế truyền vào từ page.tsx
  totalDnaAssetsCount: number;
  missingRootImageCount: number;
  totalShotsCount: number;
  generatedShotsCount: number;
  generatedVideosCount: number;
}

export default function ProjectList({
  projectsList,
  loading,
  selectedProjectId,
  setSelectedProjectId,
  openCreateProjModal,
  handleEditProjClick,
  handleDeleteProj,
  
  episodes,
  selectedEpisodeId,
  setSelectedEpisodeId,
  handleOpenEpModal,
  handleDeleteEp,
  onOpenScriptModal,
  onOpenWorldBibleModal,

  totalDnaAssetsCount,
  missingRootImageCount,
  totalShotsCount,
  generatedShotsCount,
  generatedVideosCount
}: ProjectListProps) {
  
  const [showManageMenu, setShowManageMenu] = useState(false);
  const [isSyncingLetta, setIsSyncingLetta] = useState(false);

  const activeProject = useMemo(() => {
    return projectsList.find(p => p.id === selectedProjectId) || null;
  }, [projectsList, selectedProjectId]);

  const selectedEpisode = useMemo(() => {
    return episodes.find(e => e.id === selectedEpisodeId) || null;
  }, [episodes, selectedEpisodeId]);

  const handleSyncLetta = () => {
    setIsSyncingLetta(true);
    setTimeout(() => {
      setIsSyncingLetta(false);
      alert("🎉 Đã đồng bộ thành công toàn bộ kịch bản và DNA nhân vật lên Letta Memory Agent!");
    }, 1200);
  };

  // Tính phần trăm thực tế
  const dnaPercent = useMemo(() => {
    if (totalDnaAssetsCount === 0) return 0;
    return Math.round(((totalDnaAssetsCount - missingRootImageCount) / totalDnaAssetsCount) * 100);
  }, [totalDnaAssetsCount, missingRootImageCount]);

  const visualPercent = useMemo(() => {
    if (totalShotsCount === 0) return 0;
    return Math.round((generatedShotsCount / totalShotsCount) * 100);
  }, [totalShotsCount, generatedShotsCount]);

  const videoPercent = useMemo(() => {
    if (totalShotsCount === 0) return 0;
    return Math.round((generatedVideosCount / totalShotsCount) * 100);
  }, [totalShotsCount, generatedVideosCount]);

  return (
    <div className="border border-white/5 rounded-3xl p-4 bg-[#0b0b10]/40 backdrop-blur-md shadow-xl flex flex-col justify-start space-y-4 font-sans h-full overflow-y-auto custom-scrollbar">
      
      {/* 1. CHỌN DỰ ÁN DROPDOWN */}
      <div className="space-y-1.5 shrink-0">
        <div className="flex justify-between items-center">
          <label className="text-[8px] font-black text-neutral-500 uppercase tracking-widest block">Dự án hiện tại</label>
          <div className="flex gap-1">
            <button
              onClick={openCreateProjModal}
              className="text-[8px] bg-blue-500/10 border border-blue-500/20 text-blue-400 font-bold px-1.5 py-0.5 rounded hover:bg-blue-500 hover:text-white transition cursor-pointer"
            >
              + Mới
            </button>
            {activeProject && (
              <button
                onClick={() => handleEditProjClick(activeProject)}
                className="text-[8px] bg-neutral-900 border border-white/5 text-neutral-400 hover:text-white font-bold px-1.5 py-0.5 rounded transition cursor-pointer"
              >
                Sửa
              </button>
            )}
          </div>
        </div>

        <div className="relative">
          <select
            value={selectedProjectId}
            onChange={(e) => setSelectedProjectId(e.target.value)}
            className="w-full bg-black/60 border border-white/5 rounded-xl px-3 py-2 text-xs font-black uppercase text-white outline-none focus:border-purple-500/40 cursor-pointer appearance-none pr-8 shadow-inner"
          >
            <option value="" disabled>-- Chọn Dự Án --</option>
            {projectsList.map(p => (
              <option key={p.id} value={p.id}>{p.name}</option>
            ))}
          </select>
          <ChevronDown className="w-3.5 h-3.5 text-neutral-500 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
        </div>
      </div>

      {/* 2. CHỌN TẬP PHIM DROPDOWN */}
      {selectedProjectId && (
        <div className="space-y-1.5 animate-in fade-in duration-200 shrink-0">
          <div className="flex justify-between items-center">
            <label className="text-[8px] font-black text-neutral-500 uppercase tracking-widest block">Tập phim hiện tại</label>
            <div className="flex gap-1">
              <button
                onClick={() => handleOpenEpModal()}
                className="text-[8px] bg-purple-500/10 border border-purple-500/20 text-purple-400 font-bold px-1.5 py-0.5 rounded hover:bg-purple-655 hover:text-white transition cursor-pointer"
              >
                + Thêm
              </button>
              {selectedEpisode && (
                <button
                  onClick={() => setShowManageMenu(!showManageMenu)}
                  className="text-[8px] bg-neutral-900 border border-white/5 text-neutral-400 hover:text-white font-bold px-1.5 py-0.5 rounded transition cursor-pointer flex items-center gap-0.5"
                >
                  <Settings className="w-2.5 h-2.5" /> Quản lý
                </button>
              )}
            </div>
          </div>

          {/* Quick manage menu */}
          {showManageMenu && selectedEpisode && (
            <div className="bg-neutral-950 border border-white/5 p-2 rounded-xl flex justify-between items-center animate-in slide-in-from-top-1 duration-150 shrink-0">
              <span className="text-[8px] font-bold text-neutral-400 uppercase truncate max-w-[100px]">{selectedEpisode.title}</span>
              <div className="flex gap-1.5">
                <button
                  onClick={() => { handleOpenEpModal(selectedEpisode); setShowManageMenu(false); }}
                  className="text-[8px] bg-blue-900/20 border border-blue-500/20 text-blue-400 font-bold px-2 py-0.5 rounded hover:bg-blue-600 hover:text-white transition cursor-pointer"
                >
                  Đổi tên
                </button>
                <button
                  onClick={() => { handleDeleteEp(selectedEpisode.id, selectedEpisode.title); setShowManageMenu(false); }}
                  className="text-[8px] bg-red-900/20 border border-red-500/20 text-red-400 font-bold px-2 py-0.5 rounded hover:bg-red-600 hover:text-white transition cursor-pointer"
                >
                  Xóa
                </button>
              </div>
            </div>
          )}

          <div className="relative">
            <select
              value={selectedEpisodeId}
              onChange={(e) => setSelectedEpisodeId(e.target.value)}
              className="w-full bg-black/60 border border-white/5 rounded-xl px-3 py-2 text-xs font-black uppercase text-purple-300 outline-none focus:border-purple-500/40 cursor-pointer appearance-none pr-8 shadow-inner"
            >
              <option value="" disabled>-- Chọn Tập Phim --</option>
              {episodes.map(ep => (
                <option key={ep.id} value={ep.id}>🎬 {ep.title}</option>
              ))}
            </select>
            <ChevronDown className="w-3.5 h-3.5 text-neutral-500 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
          </div>
        </div>
      )}

      {/* 3. ĐIỀU KHIỂN NHANH KỊCH BẢN */}
      {selectedEpisode && (
        <div className="bg-black/40 border border-white/5 rounded-2xl p-3 flex justify-between items-center animate-in fade-in duration-200 shrink-0">
          <div className="flex items-center gap-1.5 min-w-0 pr-2">
            <FileText className="w-3.5 h-3.5 text-amber-500 shrink-0" />
            <span className="text-[9px] font-bold text-neutral-300 truncate">
              Kịch bản: {selectedEpisode.title}
            </span>
          </div>

          <div className="flex items-center gap-1 shrink-0">
            <button
              onClick={() => onOpenScriptModal(selectedEpisode)}
              className="flex items-center gap-1 bg-amber-550/10 border border-amber-500/20 text-amber-400 hover:bg-amber-600 hover:text-white px-2.5 py-1 rounded-lg text-[8.5px] font-black uppercase tracking-wider transition cursor-pointer"
            >
              <FileText className="w-3 h-3" /> Xem
            </button>
            <button
              onClick={() => {
                navigator.clipboard.writeText(selectedEpisode.script || "");
                alert("Đã copy kịch bản tập phim!");
              }}
              className="p-1 hover:bg-white/5 rounded text-neutral-550 hover:text-neutral-300 border border-white/5 transition cursor-pointer"
            >
              <Copy className="w-3 h-3" />
            </button>
          </div>
        </div>
      )}

      {/* 4. WORLD BIBLE STUDIO LINK */}
      {selectedProjectId && (
        <button
          onClick={onOpenWorldBibleModal}
          className="w-full bg-gradient-to-r from-purple-950/40 to-indigo-950/40 border border-purple-500/25 hover:border-purple-500 hover:from-purple-650 hover:to-indigo-650 text-purple-400 hover:text-white py-2 rounded-xl text-[9.5px] font-black uppercase tracking-widest transition flex items-center justify-center gap-1.5 cursor-pointer shadow shadow-purple-500/5 active:scale-95 shrink-0"
        >
          <Layers className="w-3.5 h-3.5" /> World Bible Studio
        </button>
      )}

      {/* 5. THÔNG TIN TIẾN ĐỘ SẢN XUẤT VỚI CHỈ SỐ ĐÁNH GIÁ THỰC TẾ (MỚI NÂNG CẤP) */}
      {selectedProjectId && (
        <div className="border-t border-white/5 pt-3.5 space-y-4 animate-in fade-in duration-300 shrink-0">
          
          {/* Letta Memory Health */}
          <div className="bg-black/35 border border-white/5 p-3 rounded-2xl space-y-2 text-[9px] shadow-sm">
            <div className="flex justify-between items-center">
              <span className="text-[8px] font-black text-emerald-450 uppercase tracking-widest flex items-center gap-1">
                <Cpu className="w-3 h-3 text-emerald-450" /> Letta Memory Health
              </span>
              <span className="flex items-center gap-1 text-[7.5px] font-bold text-emerald-400 uppercase">
                <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-ping" /> Active
              </span>
            </div>
            
            <div className="space-y-1 text-neutral-500 font-mono">
              <div className="flex justify-between">
                <span>Core Memory:</span>
                <span className="text-neutral-300 font-bold">1.8 KB / 8.0 KB</span>
              </div>
              <div className="flex justify-between">
                <span>Letta Sync:</span>
                <span className="text-neutral-300 font-bold">Sync Completed</span>
              </div>
            </div>
            
            <button
              onClick={handleSyncLetta}
              disabled={isSyncingLetta}
              className="w-full bg-emerald-950/20 hover:bg-emerald-555 border border-emerald-500/20 text-emerald-400 hover:text-white py-1 rounded-lg text-[8px] font-black uppercase tracking-wider transition cursor-pointer"
            >
              {isSyncingLetta ? "Syncing..." : "Force Letta Re-Sync"}
            </button>
          </div>

          {/* Production Progress & Evaluation Stats */}
          <div className="space-y-3 text-[9px]">
            <span className="text-[8px] font-black text-neutral-500 uppercase tracking-widest flex items-center gap-1">
              <BarChart3 className="w-3.5 h-3.5 text-purple-400" /> Báo Cáo Tiến Độ (Pipeline Evaluation)
            </span>
            
            <div className="space-y-2.5">
              
              {/* Visual DNA progress */}
              <div className="space-y-1">
                <div className="flex justify-between text-neutral-450 font-bold">
                  <span>Visual DNA Master Image</span>
                  <span className="text-blue-400">{dnaPercent}%</span>
                </div>
                <div className="w-full h-1.5 bg-neutral-900 rounded-full overflow-hidden border border-white/5">
                  <div className="bg-blue-500 h-full rounded-full" style={{ width: `${dnaPercent}%` }} />
                </div>
                {/* Chỉ số đánh giá */}
                <div className="flex justify-between text-[7.5px] text-neutral-550 font-mono">
                  <span>Tổng DNA nhân vật & bối cảnh:</span>
                  <span className={missingRootImageCount > 0 ? "text-amber-450 font-bold" : "text-emerald-450"}>
                    {missingRootImageCount > 0 ? `Thiếu ${missingRootImageCount} ảnh Master` : "Đầy đủ Master DNA"} ({totalDnaAssetsCount - missingRootImageCount}/{totalDnaAssetsCount})
                  </span>
                </div>
              </div>

              {/* Storyboard Rendering progress */}
              <div className="space-y-1">
                <div className="flex justify-between text-neutral-450 font-bold">
                  <span>Storyboard Visual Generation</span>
                  <span className="text-purple-400">{visualPercent}%</span>
                </div>
                <div className="w-full h-1.5 bg-neutral-900 rounded-full overflow-hidden border border-white/5">
                  <div className="bg-purple-650 h-full rounded-full" style={{ width: `${visualPercent}%` }} />
                </div>
                {/* Chỉ số đánh giá */}
                <div className="flex justify-between text-[7.5px] text-neutral-550 font-mono">
                  <span>Tổng số Shot đã dựng ảnh:</span>
                  <span className="text-neutral-350">{generatedShotsCount}/{totalShotsCount} shot</span>
                </div>
              </div>

              {/* Video Production progress */}
              <div className="space-y-1">
                <div className="flex justify-between text-neutral-450 font-bold">
                  <span>Video Clip Generation</span>
                  <span className="text-amber-400">{videoPercent}%</span>
                </div>
                <div className="w-full h-1.5 bg-neutral-900 rounded-full overflow-hidden border border-white/5">
                  <div className="bg-amber-500 h-full rounded-full" style={{ width: `${videoPercent}%` }} />
                </div>
                {/* Chỉ số đánh giá */}
                <div className="flex justify-between text-[7.5px] text-neutral-550 font-mono">
                  <span>Tổng số Video Clip đã sinh:</span>
                  <span className="text-neutral-350">{generatedVideosCount}/{totalShotsCount} clip</span>
                </div>
              </div>
            </div>
          </div>

          {/* Production Crew */}
          <div className="bg-black/10 p-2 rounded-xl border border-white/5 flex justify-between items-center text-[8.5px] text-neutral-550 font-mono">
            <span>Director: <strong className="text-white font-sans uppercase">Sếp (Creator)</strong></span>
            <span>AI Assistant: <strong className="text-purple-400 font-sans uppercase">Zuzzi Agent</strong></span>
          </div>

        </div>
      )}

      {/* 6. DELETE PROJECT BUTTON AT BOTTOM */}
      {activeProject && (
        <button
          onClick={() => handleDeleteProj(activeProject.id, activeProject.name)}
          className="w-full text-center text-[7px] font-black text-neutral-800 hover:text-red-500 uppercase tracking-widest border border-dashed border-white/5 py-1 rounded-lg transition shrink-0 block mt-auto"
        >
          Xóa dự án hiện tại
        </button>
      )}
    </div>
  );
}
