"use client";

import React from "react";
import { 
  Film, Sparkles, UploadCloud, Loader2, Play,
  User, MapPin, Camera, Box, Layers, Grid, Save, Trash2, X, Edit3, Eye, Database, Plus
} from "lucide-react";

import { useXRayState } from "../hooks/useXRayState";
import { XRaySidebar } from "./XRaySidebar";
import { TunnelTerminal } from "./TunnelTerminal";
import { XRayDnaDecoder } from "./XRayDnaDecoder";
import { XRayVariantBoard } from "./XRayVariantBoard";
import { API_BASE_URL } from "@/lib/api";
import { CHARACTER_TAGS, LOCATION_TAGS, PROP_TAGS, normalizeImageUrl } from "../constants/xrayConstants";

export default function XRayWorkspace() {
  const state = useXRayState();

  const renderStoryboardGallery = () => {
    if (!state.selectedEpisodeId) {
      return (
        <div className="py-16 border border-dashed border-white/5 rounded-3xl text-center bg-black/10 text-neutral-600 text-[10px] italic space-y-2">
          <Database className="w-10 h-10 mx-auto text-neutral-800 animate-pulse" />
          <p>Sếp vui lòng chọn một Tập phim từ Sidebar để hiển thị Kho ảnh Storyboard!</p>
        </div>
      );
    }

    return (
      <div className="bg-white/[0.01] border border-white/5 rounded-3xl p-6 shadow-2xl backdrop-blur-md space-y-6 flex flex-col h-full min-h-[500px]">
        <div className="flex justify-between items-center border-b border-white/5 pb-3 shrink-0">
          <div className="space-y-1">
            <span className="text-[9px] font-black uppercase tracking-widest text-purple-400 flex items-center gap-1.5 font-mono">
              <Film className="w-3.5 h-3.5 animate-pulse" /> Episode Storyboard Gallery (Kho ảnh Phân Cảnh)
            </span>
            <h3 className="text-xs font-bold text-white">🎬 {state.selectedEpisode?.title}</h3>
          </div>
          <span className="text-[9px] bg-purple-500/10 text-purple-400 px-3 py-1 rounded font-black border border-purple-500/10 font-mono">
            {state.storyboardAssets.length} Renders
          </span>
        </div>

        {state.isLoadingStoryboardAssets ? (
          <div className="py-20 text-center space-y-3 flex-1 flex flex-col justify-center">
            <Loader2 className="w-8 h-8 mx-auto text-purple-500 animate-spin" />
            <p className="text-[10px] font-bold text-neutral-500 uppercase tracking-widest font-mono">Đang tải kho ảnh Storyboard...</p>
          </div>
        ) : state.storyboardAssets.length === 0 ? (
          <div className="py-20 text-center space-y-4 border border-dashed border-white/5 rounded-2xl bg-black/20 flex-1 flex flex-col justify-center">
            <Sparkles className="w-10 h-10 mx-auto text-neutral-700 animate-pulse" />
            <p className="text-[10px] font-bold text-neutral-500 uppercase tracking-widest max-w-sm mx-auto leading-relaxed">
              Kịch bản chưa có ảnh Storyboard được sinh. Hãy ấn vào nút "Sparkles" bên cạnh mỗi Phân cảnh ở cột trái để bắt đầu sinh ảnh Storyboard AI!
            </p>
          </div>
        ) : (
          <div className="space-y-6 overflow-y-auto pr-1 flex-1 custom-scrollbar max-h-[70vh]">
            {state.scenesList.map((scn, index) => {
              const sceneRenders = state.storyboardAssets.filter(a => a.sceneId === scn.id);
              return (
                <div key={scn.id} className="space-y-3 bg-black/20 border border-white/5 p-4 rounded-2xl transition hover:border-white/10">
                  <div className="flex justify-between items-center border-b border-white/5 pb-2">
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-black uppercase text-purple-400 font-mono">Cảnh {scn.sceneNumber || (index + 1)}:</span>
                      <span className="text-[10px] font-bold text-white">{scn.title}</span>
                    </div>
                    <span className="text-[8px] bg-neutral-900 border border-white/5 text-neutral-400 px-2 py-0.5 rounded font-black font-mono">
                      {sceneRenders.length} Renders
                    </span>
                  </div>

                  {scn.prompt && (
                    <p className="text-[9px] text-neutral-500 italic truncate max-w-2xl" title={scn.prompt}>
                      Prompt: {scn.prompt}
                    </p>
                  )}

                  {sceneRenders.length === 0 ? (
                    <div className="py-4 text-center border border-dashed border-white/5 rounded-xl bg-black/10 text-neutral-600 text-[9px] italic">
                      Chưa có ảnh/video nào được sinh cho cảnh này.
                    </div>
                  ) : (
                    <div className="grid grid-cols-4 gap-2.5">
                      {sceneRenders.map((asset) => (
                        <div
                          key={asset.id}
                          onClick={() => state.setSelectedStoryboardAsset(asset)}
                          className="aspect-square rounded-xl overflow-hidden bg-neutral-950 border border-white/5 hover:border-purple-500/50 hover:scale-105 transition cursor-pointer relative group"
                        >
                          {asset.assetType === 'video' ? (
                            <div className="w-full h-full relative">
                              <video src={asset.driveUrl} className="w-full h-full object-cover" muted playsInline loop />
                              <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                                <Play className="w-5 h-5 text-white filter drop-shadow-md" />
                              </div>
                            </div>
                          ) : (
                            <img src={asset.driveUrl} className="w-full h-full object-cover" />
                          )}
                          <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-all duration-200 flex flex-col justify-end p-2">
                            <span className="text-[8px] font-black uppercase text-purple-400 truncate font-mono">Xem chi tiết</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="flex h-screen bg-[#040406] text-neutral-200 overflow-hidden font-sans select-none">
      
      {/* 1. SIDEBAR (PROJECT & EPISODE MANAGER) */}
      <XRaySidebar 
        projectsList={state.projectsList}
        selectedProjectId={state.selectedProjectId}
        onProjectChange={state.handleUniverseChange}
        activeProject={state.activeProject}
        projectStyleUrl={state.projectStyleUrl}
        setProjectStyleUrl={state.setProjectStyleUrl}
        projectStylePrompt={state.projectStylePrompt}
        setProjectStylePrompt={state.setProjectStylePrompt}
        isAnalyzingProjectStyle={state.isAnalyzingProjectStyle}
        onAnalyzeProjectStyle={state.handleAnalyzeProjectStyle}
        isSavingProject={state.isSavingProject}
        onSaveProjectStyle={state.handleSaveProjectStyle}
        isCreatingProject={state.isCreatingProject}
        setIsCreatingProject={state.setIsCreatingProject}
        newProjectName={state.newProjectName}
        setNewProjectName={state.setNewProjectName}
        onCreateProjectQuick={state.handleCreateUniverseQuick}
        onUpdateProject={state.handleUpdateUniverse}
        API_BASE_URL={API_BASE_URL}
        dbAssetsList={state.dbAssetsList}
        selectedAssetId={state.selectedAssetId}
        onSelectAsset={(assetId, entityType) => {
          state.setAssetType(entityType as any);
          state.handleSelectAssetFromDb(assetId);
        }}
      />

      {/* 2. MAIN WORKSPACE */}
      <div className="flex-1 flex flex-col relative overflow-hidden bg-[#030303] z-10 animate-in fade-in duration-500">
        
        {/* Glow Ambient lights */}
        <div className="absolute top-0 right-1/4 w-[500px] h-[500px] bg-purple-650/5 rounded-full blur-[120px] pointer-events-none" />
        <div className="absolute bottom-0 left-1/4 w-[500px] h-[500px] bg-red-655/5 rounded-full blur-[150px] pointer-events-none" />

        {/* Top Header bar */}
        <header className="h-14 border-b border-white/5 px-6 flex items-center justify-between backdrop-blur-md bg-black/20 shrink-0 relative z-20">
          <div className="flex items-center gap-2">
            <span className="font-mono text-xs font-black tracking-widest text-purple-500 bg-purple-500/10 px-2.5 py-1 rounded">UNIFIED BUILDER</span>
            <span className="text-neutral-500">/</span>
            <span className="text-sm font-black text-neutral-300 uppercase tracking-widest">Universal Asset X-Ray Studio</span>
          </div>

          <div className="flex items-center gap-3">
            <span className="text-[10px] bg-neutral-900 text-neutral-500 px-2.5 py-1 rounded font-black uppercase border border-white/5 font-mono tracking-wider">
              Asset & DNA Manager v4.0
            </span>
          </div>
        </header>

        {/* Workspace Layout Content - 3 Column Layout (Palette -> DNA Editor -> Variant Board) */}
        <div className="flex-1 flex gap-6 p-6 overflow-hidden h-full relative z-10">
          
          {/* CỘT 1 (Palette - w-[28%]): Lưới Grid chọn Asset nhỏ gọn kèm Type Switcher */}
          <div className="w-[28%] shrink-0 flex flex-col gap-4 overflow-hidden h-full bg-[#09090e]/60 border border-white/5 rounded-3xl p-5 shadow-2xl backdrop-blur-md relative justify-start">
            <div className="flex justify-between items-center border-b border-white/5 pb-2 shrink-0">
              <span className="text-[10px] font-black uppercase tracking-widest text-purple-400 flex items-center gap-1.5 font-mono">
                <Database className="w-4 h-4" /> Asset Palette
              </span>
              
              <button 
                onClick={() => state.setIsQuickCreateOpen(!state.isQuickCreateOpen)}
                className="text-[8px] bg-purple-950/40 hover:bg-purple-600 border border-purple-500/20 px-2 py-1 rounded-lg text-purple-400 hover:text-white font-black uppercase transition shrink-0 active:scale-95 cursor-pointer flex items-center gap-1"
              >
                <Plus className="w-2.5 h-2.5" /> Thêm mới
              </button>
            </div>

            {/* Type Switcher */}
            <div className="flex items-center bg-black/40 p-0.5 rounded-xl border border-white/5 shrink-0 w-full">
              {["character", "location", "prop", "style"].map((t) => (
                <button
                  key={t}
                  onClick={() => state.handleAssetTypeSwitch(t as any)}
                  className={`flex-1 py-1 rounded-lg text-[9px] font-black uppercase transition-all cursor-pointer text-center ${
                    state.assetType === t ? "bg-purple-600 text-white shadow font-extrabold" : "text-neutral-500 hover:text-neutral-350"
                  }`}
                >
                  {t}
                </button>
              ))}
            </div>

            {/* Form Quick Create if open */}
            {state.isQuickCreateOpen && (
              <div className="space-y-1.5 p-3.5 bg-black/40 rounded-2xl border border-white/5 animate-in slide-in-from-top-2 duration-200 shrink-0">
                <label className="text-[8px] font-black uppercase tracking-widest text-neutral-500 block">Tên {state.assetType.toUpperCase()} mới</label>
                <div className="flex items-center gap-1.5">
                  <input
                    type="text"
                    value={state.quickCreateName}
                    onChange={(e) => state.setQuickCreateName(e.target.value)}
                    placeholder={`Ví dụ: Paco, Bếp...`}
                    className="flex-1 bg-black border border-white/10 rounded-lg px-2.5 py-1.5 text-xs text-neutral-305 outline-none focus:border-purple-500/40 font-bold"
                  />
                  <button
                    onClick={state.handleQuickCreateAsset}
                    disabled={state.isCreatingAsset || !state.quickCreateName.trim()}
                    className="bg-purple-600 hover:bg-purple-500 text-white px-3 py-1.5 rounded-lg text-[9px] font-black uppercase transition shrink-0 cursor-pointer"
                  >
                    Tạo
                  </button>
                </div>
              </div>
            )}

            {/* Lưới Grid Asset cuộn dọc độc lập */}
            <div className="flex-1 overflow-y-auto custom-scrollbar pr-1 pt-1">
              <div className="grid grid-cols-3 gap-2.5">
                {state.isLoadingAssets ? (
                  Array.from({ length: 6 }).map((_, i) => (
                    <div key={`sk-${i}`} className="p-2 rounded-2xl border border-white/5 bg-black/40 flex flex-col items-center justify-between h-[84px] animate-pulse">
                      <div className="w-9 h-9 rounded-full bg-white/10 shrink-0 mb-1"></div>
                      <div className="w-12 h-2 rounded-full bg-white/10"></div>
                    </div>
                  ))
                ) : (
                  state.filteredDbAssetsList.map((asset) => {
                    const isSelected = state.selectedAssetId === asset.id;
                    return (
                      <div
                        key={asset.id}
                        onClick={() => state.handleSelectAssetFromDb(asset.id)}
                        className={`p-2 rounded-2xl border transition cursor-pointer flex flex-col items-center text-center justify-between h-[84px] group relative ${
                          isSelected 
                            ? "bg-purple-600/25 border-purple-500/50 shadow shadow-purple-500/10 font-bold animate-pulse" 
                            : "bg-black/40 border-white/5 hover:border-white/10 hover:bg-black/60"
                        }`}
                      >
                        {/* Premium Delete Overlay Icon */}
                        <button
                          onClick={(e) => {
                            e.preventDefault();
                            state.handleDeleteAsset(e, asset.id);
                          }}
                          className="absolute top-1 right-1 p-0.5 bg-red-955/80 hover:bg-red-650 border border-red-500/30 hover:border-red-500 text-red-400 hover:text-white rounded-md opacity-0 group-hover:opacity-100 transition-all shadow-md z-20"
                          title={`Xóa tài nguyên ${state.assetType}`}
                        >
                          <Trash2 className="w-2.5 h-2.5" />
                        </button>

                        <div className="w-9 h-9 rounded-full bg-neutral-900 border border-white/5 overflow-hidden flex items-center justify-center shrink-0 mb-1">
                          {asset.rootImageUrl ? (
                            <img src={normalizeImageUrl(asset.rootImageUrl)} className="w-full h-full object-cover" />
                          ) : (
                            state.assetType === 'character' ? <User className="w-4 h-4 text-neutral-600" /> :
                            state.assetType === 'location' ? <MapPin className="w-4 h-4 text-neutral-600" /> :
                            state.assetType === 'prop' ? <Box className="w-4 h-4 text-neutral-600" /> :
                            <Camera className="w-4 h-4 text-neutral-600" />
                          )}
                        </div>
                        <span className="text-[9px] font-bold text-neutral-300 group-hover:text-purple-300 truncate max-w-[70px]">
                          {asset.name}
                        </span>
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          </div>

          {/* CỘT 2 (Asset DNA Designer - w-[36%]): Quản lý DNA của Asset được chọn */}
          <div className="w-[36%] shrink-0 flex flex-col gap-4 overflow-hidden h-full bg-[#09090e]/60 border border-white/5 rounded-3xl p-5 shadow-2xl backdrop-blur-md relative justify-start">
            {state.selectedAssetId ? (
              <>
                {/* Header Designer */}
                <div className="flex justify-between items-center border-b border-white/5 pb-2 shrink-0">
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-purple-500 animate-pulse" />
                    <span className="text-[10px] font-black uppercase text-purple-400 tracking-wider font-mono">
                      DNA Designer: <strong className="text-white font-black font-sans ml-1">{state.dbAssetsList.find(a => a.id === state.selectedAssetId)?.name}</strong>
                    </span>
                  </div>
                  <button
                    onClick={() => state.setSelectedAssetId("")}
                    className="text-[8px] font-black uppercase tracking-widest text-neutral-400 hover:text-white bg-white/5 hover:bg-neutral-800 border border-white/5 px-2 py-1 rounded transition duration-200 cursor-pointer"
                  >
                    ✕ Close
                  </button>
                </div>

                {/* Cuộn dọc độc lập chứa form DNA */}
                <div className="flex-1 overflow-y-auto custom-scrollbar pr-1 space-y-4">
                  {/* 1. ROOT ANCHOR IMAGE & BRIEF DESCRIPTOR */}
                  <div className="bg-black/30 border border-white/5 rounded-2xl p-4 space-y-4">
                    {/* Left Column: Root Image */}
                    <div className="space-y-3">
                      <div className="flex items-center justify-between border-b border-white/5 pb-2">
                        <span className="text-[9px] font-black uppercase tracking-widest text-purple-400 flex items-center gap-1.5 font-mono">
                          <Layers className="w-3.5 h-3.5" /> Root Image (Ảnh neo gốc)
                        </span>
                        <span className="text-[7.5px] bg-purple-500/10 text-purple-400 px-2 py-0.5 rounded font-black border border-purple-500/10">Anchor Image</span>
                      </div>
                      
                      <div className="flex gap-3.5 items-center">
                        <div className="w-20 h-20 rounded-2xl bg-black border border-white/5 relative overflow-hidden flex items-center justify-center shrink-0 group">
                          {state.rootImageUrl ? (
                            <>
                              <img 
                                src={normalizeImageUrl(state.rootImageUrl)} 
                                className="w-full h-full object-cover cursor-zoom-in" 
                                onClick={() => state.setZoomImageUrl(normalizeImageUrl(state.rootImageUrl))}
                                title="Click to zoom image"
                              />
                              <div 
                                onClick={() => state.setZoomImageUrl(normalizeImageUrl(state.rootImageUrl))}
                                className="absolute top-0 inset-x-0 h-1/2 bg-black/40 opacity-0 group-hover:opacity-100 transition flex items-center justify-center cursor-zoom-in text-white"
                              >
                                <Eye className="w-3.5 h-3.5" />
                              </div>
                              
                              <label className="absolute bottom-0 inset-x-0 h-1/2 bg-black/85 opacity-0 group-hover:opacity-100 transition duration-300 flex flex-col items-center justify-center cursor-pointer text-white border-t border-white/10">
                                <UploadCloud className="w-3 h-3 text-purple-500" />
                                <span className="text-[6.5px] font-black uppercase tracking-wider">Upload</span>
                                <input type="file" accept="image/*" onChange={state.handleImageFileChange} className="hidden" />
                              </label>
                            </>
                          ) : (
                            <>
                              <UploadCloud className="w-5 h-5 text-neutral-600" />
                              <label className="absolute inset-0 bg-black/70 opacity-0 group-hover:opacity-100 transition duration-300 flex flex-col items-center justify-center gap-0.5 cursor-pointer text-white">
                                <UploadCloud className="w-4 h-4 text-purple-500" />
                                <span className="text-[7.5px] font-black uppercase">Upload</span>
                                <input type="file" accept="image/*" onChange={state.handleImageFileChange} className="hidden" />
                              </label>
                            </>
                          )}
                        </div>
                        
                        <div className="flex-1 space-y-2">
                          <div className="space-y-1">
                            <label className="text-[7.5px] font-black text-neutral-500 uppercase tracking-widest">URL ảnh neo gốc</label>
                            <input 
                              type="text" 
                              value={state.rootImageUrl}
                              onChange={(e) => state.setRootImageUrl(e.target.value)}
                              placeholder="Dán URL ảnh..."
                              className="w-full bg-black/60 border border-white/10 rounded-lg px-2.5 py-1 text-[9px] text-neutral-400 outline-none font-mono"
                            />
                          </div>

                          <div className="flex gap-1.5">
                            <button 
                              onClick={() => state.fileInputRef.current?.click()}
                              className="bg-white/5 hover:bg-white/10 border border-white/10 text-neutral-300 rounded-lg px-2 py-1 text-[9px] font-bold transition flex items-center justify-center gap-1 cursor-pointer"
                            >
                              <UploadCloud className="w-3 h-3" /> Upload File
                            </button>
                            <input type="file" ref={state.fileInputRef} accept="image/*" onChange={state.handleImageFileChange} className="hidden" />
                            
                            {!state.rootImageUrl && (
                              <button 
                                onClick={state.handleGenerateRootImage}
                                disabled={state.isGeneratingRootImage}
                                className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white px-2 py-1 rounded-lg text-[9px] font-bold transition flex items-center justify-center gap-1 active:scale-95 cursor-pointer"
                              >
                                {state.isGeneratingRootImage ? <Loader2 className="w-3 h-3 animate-spin" /> : <Sparkles className="w-3 h-3" />}
                                Sinh ảnh
                              </button>
                            )}

                            <button 
                              onClick={state.handleRunXRay}
                              disabled={state.isAnalyzing || !state.rootImageUrl}
                              className="bg-purple-600 hover:bg-purple-500 disabled:opacity-50 text-white py-1 px-2 rounded-lg text-[9px] font-black uppercase transition flex items-center justify-center gap-1 shadow-lg active:scale-95 cursor-pointer"
                            >
                              {state.isAnalyzing ? <Loader2 className="w-3 h-3 animate-spin" /> : <Sparkles className="w-3 h-3" />}
                              Dịch DNA
                            </button>
                          </div>
                        </div>
                      </div>
                      
                      {/* Biệt danh / Aliases */}
                      <div className="space-y-1">
                        <label className="text-[7.5px] font-black uppercase tracking-widest text-neutral-500 block">
                          Biệt danh / Aliases (ngăn cách bằng dấu phẩy)
                        </label>
                        <input
                          type="text"
                          value={state.aliases || ""}
                          onChange={(e) => state.setAliases(e.target.value)}
                          placeholder="Ví dụ: Mom, Mẹ, me"
                          className="w-full bg-black/60 border border-white/10 rounded-lg px-2.5 py-1.5 text-[9px] text-neutral-300 outline-none focus:border-purple-500/50 transition font-bold"
                        />
                      </div>
                    </div>

                    {/* Right Column: Media ID & Brief */}
                    <div className="space-y-3 pt-2 border-t border-white/5">
                      <div className="grid grid-cols-1 gap-2.5">
                        <div className="space-y-1">
                          <label className="text-[7.5px] font-black uppercase tracking-widest text-neutral-500 font-mono">Google Labs Media ID (mediaId)</label>
                          <input
                            type="text"
                            value={state.rootMediaId}
                            onChange={(e) => state.setRootMediaId(e.target.value)}
                            placeholder="Dán Media ID..."
                            className="w-full bg-black/60 border border-white/10 rounded-lg px-2.5 py-1 text-[9px] text-neutral-300 outline-none focus:border-purple-500/50 transition font-mono font-bold"
                          />
                        </div>
                        
                        <div className="space-y-1">
                          <label className="text-[7.5px] font-black uppercase tracking-widest text-neutral-500">Mô tả / Character Bible</label>
                          <textarea
                            value={state.brief}
                            onChange={(e) => state.setBrief(e.target.value)}
                            placeholder="Mô tả tóm tắt hoặc dán đoạn Character Bible..."
                            className="w-full bg-black/60 border border-white/10 rounded-lg px-2.5 py-1.5 text-[9px] text-neutral-300 outline-none font-medium h-[120px] resize-none custom-scrollbar"
                          />
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* 2. MASTER PROMPT DESIGNER & STYLE DNA DECIDER */}
                  <div className="bg-black/30 border border-white/5 rounded-2xl p-4 space-y-4">
                    <div className="flex justify-between items-center border-b border-white/5 pb-2">
                      <span className="text-[9px] font-black uppercase tracking-widest text-purple-400 font-mono">Master Prompt Thiết Kế & DNA</span>
                      <button
                        onClick={() => state.handleSyncToAssetDb()}
                        disabled={state.isSavingToDb}
                        className="bg-purple-950/40 border border-purple-500/20 hover:bg-purple-600 text-purple-400 hover:text-white px-3 py-1 rounded text-[8px] font-black uppercase transition flex items-center gap-1 shrink-0 active:scale-95 cursor-pointer font-bold"
                      >
                        {state.isSavingToDb ? <Loader2 className="w-2.5 h-2.5 animate-spin" /> : <Save className="w-2.5 h-2.5" />}
                        Lưu thay đổi
                      </button>
                    </div>

                    <div className="space-y-3.5">
                      <div className="space-y-1">
                        <label className="text-[8px] font-black uppercase tracking-widest text-neutral-500">Master Prompt Thiết Kế</label>
                        <textarea
                          value={state.masterDesignPrompt}
                          onChange={(e) => state.setMasterDesignPrompt(e.target.value)}
                          placeholder="Prompt thiết kế chi tiết..."
                          className="w-full bg-black/40 border border-white/5 rounded-xl p-2.5 text-[11px] text-neutral-300 resize-none min-h-[80px] outline-none font-mono"
                        />
                      </div>
                    </div>

                    {/* 6 Dimensions Decoded Style DNA */}
                    <XRayDnaDecoder
                      hasAnalyzed={state.hasAnalyzed}
                      assetType={state.assetType}
                      visualStyle={state.visualStyle}
                      composition={state.composition}
                      attitude={state.attitude}
                      colors={state.colors}
                      lighting={state.lighting}
                      camera={state.camera}
                      renderBoldText={state.renderBoldText}
                    />
                  </div>
                </div>
              </>
            ) : (
              <div className="py-20 text-center space-y-4 border border-dashed border-white/5 rounded-3xl bg-black/20 flex-1 flex flex-col justify-center animate-pulse">
                <Sparkles className="w-10 h-10 mx-auto text-neutral-700" />
                <p className="text-[10px] font-bold text-neutral-500 uppercase tracking-widest max-w-xs mx-auto leading-relaxed">
                  Sếp vui lòng chọn một DNA Asset từ Palette bên trái để bắt đầu thiết kế & chỉnh sửa DNA tính cách!
                </p>
              </div>
            )}
          </div>

          {/* CỘT 3 (Variant Board & Studio - w-[36%]): Album variants và bộ sinh variant */}
          <div className="w-[36%] shrink-0 flex flex-col gap-4 overflow-hidden h-full bg-[#09090e]/60 border border-white/5 rounded-3xl p-5 shadow-2xl backdrop-blur-md relative justify-start">
            {state.selectedAssetId ? (
              <div className="flex-1 overflow-y-auto custom-scrollbar pr-1">
                <XRayVariantBoard
                  variantImages={state.variantImages}
                  activeVariantId={state.activeVariantId}
                  setActiveVariantId={state.setActiveVariantId}
                  activeSelectedVariant={state.activeSelectedVariant}
                  setZoomImageUrl={state.setZoomImageUrl}
                  setShowVariantGenModal={state.setShowVariantGenModal}
                  updateAsset={state.updateAsset}
                  deleteAsset={state.deleteAsset}
                  setVariantImages={state.setVariantImages}
                  handleSplitGrid={state.handleSplitGrid}
                  isSplittingGrid={state.isSplittingGrid}
                  onSetAsRoot={state.handleSetVariantAsRoot}
                />
              </div>
            ) : (
              <div className="py-20 text-center space-y-4 border border-dashed border-white/5 rounded-3xl bg-black/20 flex-1 flex flex-col justify-center animate-pulse">
                <Grid className="w-10 h-10 mx-auto text-neutral-700" />
                <p className="text-[10px] font-bold text-neutral-500 uppercase tracking-widest max-w-xs mx-auto leading-relaxed">
                  Album Variants trống. Hãy chọn DNA Asset để quản lý và tạo biến thể hình ảnh!
                </p>
              </div>
            )}
          </div>

        </div>

      </div>

      {/* ========================================== */}
      {/* 4. SCENE FORM CREATING / EDITING MODAL */}
      {/* ========================================== */}
      {state.showSceneModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-md z-50 flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="bg-[#0c0c0e] border border-white/5 rounded-3xl p-6 w-full max-w-md space-y-4 shadow-2xl relative">
            <button 
              onClick={() => state.setShowSceneModal(false)}
              className="absolute top-4 right-4 p-1.5 rounded-full bg-white/5 hover:bg-white/10 text-neutral-400 hover:text-white transition cursor-pointer z-30"
            >
              <X className="w-4.5 h-4.5" />
            </button>

            <h3 className="text-base font-black text-white uppercase tracking-widest flex items-center gap-2 border-b border-white/5 pb-3">
              <Layers className="w-4 h-4 text-purple-500" /> {state.editingSceneId ? "Sửa phân cảnh" : "Thêm phân cảnh mới"}
            </h3>

            <form onSubmit={state.handleSaveScene} className="space-y-4 pt-1">
              <div className="space-y-1.5">
                <label className="text-[9px] font-black uppercase tracking-widest text-neutral-500">Tên phân cảnh *</label>
                <input
                  type="text"
                  required
                  value={state.sceneTitle}
                  onChange={(e) => state.setSceneTitle(e.target.value)}
                  placeholder="Ví dụ: Bé Mai dắt tay bạn đi dạo..."
                  className="w-full bg-black border border-white/10 rounded-xl px-3.5 py-2 text-xs text-neutral-300 outline-none focus:border-purple-500/50 transition font-bold"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-[9px] font-black uppercase tracking-widest text-neutral-500">Mô tả phân cảnh</label>
                <textarea
                  value={state.sceneDesc}
                  onChange={(e) => state.setSceneDesc(e.target.value)}
                  placeholder="Mô tả phân cảnh..."
                  className="w-full bg-black border border-white/10 rounded-xl px-3.5 py-2 text-xs text-neutral-300 outline-none resize-none h-16 focus:border-purple-500/50 transition font-medium"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-[9px] font-black uppercase tracking-widest text-neutral-500">Prompt vẽ Concept (AI)</label>
                <textarea
                  value={state.scenePrompt}
                  onChange={(e) => state.setScenePrompt(e.target.value)}
                  placeholder="Prompt vẽ Concept..."
                  className="w-full bg-black border border-white/10 rounded-xl px-3.5 py-2 text-xs text-neutral-300 outline-none resize-none h-16 focus:border-purple-500/50 transition font-mono leading-relaxed"
                />
              </div>

              <div className="space-y-2 border-t border-white/5 pt-3">
                <label className="text-[9px] font-black uppercase tracking-widest text-neutral-500 block">Ảnh vẽ Concept (ImageUrl)</label>
                <div className="flex gap-3">
                  <div className="w-16 h-16 rounded-xl bg-black border border-white/10 overflow-hidden flex items-center justify-center shrink-0 group relative">
                    {state.sceneImageUrl ? (
                      <img src={state.sceneImageUrl} className="w-full h-full object-cover" />
                    ) : (
                      <Layers className="w-5 h-5 text-neutral-600" />
                    )}
                    <label className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition flex items-center justify-center cursor-pointer">
                      <UploadCloud className="w-4 h-4 text-white" />
                      <input 
                        type="file" 
                        accept="image/*" 
                        className="hidden" 
                        onChange={state.handleSceneImageUpload}
                      />
                    </label>
                  </div>

                  <div className="flex-1 flex flex-col justify-between">
                    <input 
                      type="text" 
                      value={state.sceneImageUrl}
                      onChange={(e) => state.setSceneImageUrl(e.target.value)}
                      placeholder="Dán URL ảnh vẽ cảnh..."
                      className="w-full bg-black border border-white/10 rounded-lg px-2.5 py-1 text-[9px] text-neutral-400 outline-none font-mono"
                    />
                  </div>
                </div>
              </div>

              <button
                type="submit"
                className="w-full bg-purple-600 hover:bg-purple-500 text-white py-2.5 rounded-2xl text-xs font-black uppercase tracking-widest transition flex items-center justify-center gap-1.5 shadow active:scale-95 cursor-pointer"
              >
                <Save className="w-4 h-4" /> Lưu phân cảnh
              </button>
            </form>
          </div>
        </div>
      )}

      {/* ========================================== */}
      {/* 🎬 PRESTIGE STORYBOARD DETAIL INSPECTOR MODAL */}
      {/* ========================================== */}
      {state.selectedStoryboardAsset && (() => {
        const matchedScene = state.scenesList.find(s => s.id === state.selectedStoryboardAsset.sceneId);
        
        const presentCharacters = state.dbAssetsList.filter(c => {
          if (!matchedScene) return false;
          const nameLower = c.name.toLowerCase();
          const descLower = (matchedScene.prompt || matchedScene.description || "").toLowerCase();
          const titleLower = matchedScene.title.toLowerCase();
          return descLower.includes(nameLower) || titleLower.includes(nameLower) || (matchedScene.tags && matchedScene.tags.some((t: string) => t.toLowerCase() === nameLower));
        });

        return (
          <div className="fixed inset-0 bg-black/85 backdrop-blur-xl z-50 flex items-center justify-center p-4 md:p-8 animate-in fade-in duration-300">
            <div className="bg-[#0b0b0d]/90 border border-white/10 rounded-[32px] w-full max-w-5xl shadow-2xl relative overflow-hidden flex flex-col md:grid md:grid-cols-12 max-h-[90vh]">
              
              <button 
                onClick={() => state.setSelectedStoryboardAsset(null)}
                className="absolute top-4 right-4 p-2 rounded-full bg-white/5 hover:bg-white/10 text-neutral-400 hover:text-white transition cursor-pointer z-30"
              >
                <X className="w-5 h-5" />
              </button>

              <div className="md:col-span-7 bg-black/80 flex items-center justify-center relative p-6 border-r border-white/5 min-h-[350px] md:min-h-[500px]">
                <div className="absolute top-4 left-4 z-20">
                  <span className="text-[9px] bg-purple-600/25 border border-purple-500/30 text-purple-400 px-3 py-1 rounded-full font-black uppercase font-mono tracking-widest">
                    {state.selectedStoryboardAsset.assetType === 'video' ? "Video Output" : "Storyboard Frame"}
                  </span>
                </div>

                <div className="w-full h-full rounded-2xl overflow-hidden relative flex items-center justify-center">
                  {state.selectedStoryboardAsset.assetType === 'video' ? (
                    <video 
                      src={state.selectedStoryboardAsset.driveUrl} 
                      className="w-full h-full max-h-[70vh] object-contain rounded-2xl" 
                      controls 
                      autoPlay 
                      loop 
                    />
                  ) : (
                    <img 
                      src={state.selectedStoryboardAsset.driveUrl} 
                      className="w-full h-full max-h-[70vh] object-contain rounded-2xl" 
                      alt="Storyboard Stage" 
                    />
                  )}
                </div>
              </div>

              <div className="md:col-span-5 p-6 flex flex-col justify-between overflow-y-auto custom-scrollbar bg-black/20">
                <div className="space-y-6">
                  
                  <div className="space-y-2 border-b border-white/5 pb-4">
                    <span className="text-[9px] font-black uppercase tracking-widest text-purple-400 font-mono">
                      Universal Storyboard Metadata
                    </span>
                    <h3 className="text-sm font-black text-white leading-tight">
                      🎬 Cảnh {matchedScene?.sceneNumber || "Concept"}: {matchedScene?.title || "Storyboard Concept Frame"}
                    </h3>
                    
                    <div className="flex flex-wrap gap-1.5 pt-1">
                      <span className="text-[8px] bg-neutral-900 border border-white/5 text-neutral-400 px-2.5 py-0.5 rounded font-black font-mono">
                        PROJ: {state.activeProject?.name || "Ecosystem"}
                      </span>
                      <span className="text-[8px] bg-neutral-900 border border-white/5 text-neutral-400 px-2.5 py-0.5 rounded font-black font-mono">
                        EP: {state.selectedEpisode?.title}
                      </span>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-[8px] font-black uppercase tracking-widest text-neutral-500 font-mono block">
                      Vàn bản Prompt / Concept Script
                    </label>
                    <div className="bg-black/40 border border-white/5 rounded-2xl p-4 text-[10.5px] text-neutral-300 font-mono leading-relaxed max-h-32 overflow-y-auto custom-scrollbar">
                      {matchedScene?.prompt || matchedScene?.description || "Chưa có prompt thiết lập."}
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-[8px] font-black uppercase tracking-widest text-neutral-500 font-mono block">
                      Dàn diễn viên xuất hiện (Present Cast)
                    </label>
                    {presentCharacters.length === 0 ? (
                      <p className="text-[9px] text-neutral-600 italic">
                        Không tự động nhận diện được nhân vật nào trong phân cảnh này.
                      </p>
                    ) : (
                      <div className="flex flex-wrap gap-2">
                        {presentCharacters.map(char => (
                          <div 
                            key={char.id} 
                            className="flex items-center gap-1.5 bg-purple-950/20 border border-purple-500/10 px-2.5 py-1 rounded-xl"
                          >
                            <div className="w-5 h-5 rounded-full overflow-hidden border border-white/5 bg-neutral-900 shrink-0">
                              {char.rootImageUrl ? (
                                <img src={normalizeImageUrl(char.rootImageUrl)} className="w-full h-full object-cover" />
                              ) : (
                                <User className="w-2.5 h-2.5 text-neutral-500" />
                              )}
                            </div>
                            <span className="text-[9px] font-bold text-neutral-300">{char.name}</span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  <div className="space-y-2">
                    <label className="text-[8px] font-black uppercase tracking-widest text-neutral-500 font-mono block">
                      Technical Spec & Asset ID
                    </label>
                    <div className="space-y-1 text-[9px] text-neutral-500 font-mono">
                      <p><strong className="text-neutral-600">Asset UUID:</strong> {state.selectedStoryboardAsset.id}</p>
                      <p><strong className="text-neutral-600">Created At:</strong> {new Date(state.selectedStoryboardAsset.createdAt).toLocaleString()}</p>
                      <p><strong className="text-neutral-600">Storage URL:</strong> <a href={state.selectedStoryboardAsset.driveUrl} target="_blank" rel="noreferrer" className="text-purple-400 underline hover:text-purple-300">MinIO Direct Path</a></p>
                    </div>
                  </div>

                </div>

                <div className="pt-6 border-t border-white/5 flex gap-2">
                  <button 
                    onClick={() => {
                      navigator.clipboard.writeText(state.selectedStoryboardAsset.driveUrl);
                      alert("📋 Đã sao chép liên kết ảnh vào Clipboard!");
                    }}
                    className="flex-1 bg-white/5 hover:bg-white/10 border border-white/10 text-neutral-300 py-2 rounded-xl text-[10px] font-bold transition flex items-center justify-center gap-1 cursor-pointer"
                  >
                    Sao chép liên kết
                  </button>

                  <button 
                    onClick={async (e) => {
                      e.stopPropagation();
                      if (!window.confirm("Sếp có muốn xóa ảnh Storyboard này khỏi thư viện không?")) return;
                      try {
                        await state.deleteAsset(state.selectedStoryboardAsset.id);
                        state.setStoryboardAssets(state.storyboardAssets.filter(a => a.id !== state.selectedStoryboardAsset.id));
                        state.setSelectedStoryboardAsset(null);
                      } catch (err) {
                        alert("Lỗi khi xóa tài nguyên.");
                      }
                    }}
                    className="bg-red-950/40 hover:bg-red-600 border border-red-500/20 hover:border-red-500 text-red-400 hover:text-white px-4 py-2 rounded-xl text-[10px] font-bold transition flex items-center justify-center gap-1 cursor-pointer"
                  >
                    <Trash2 className="w-3.5 h-3.5" /> Xóa Frame
                  </button>
                </div>

              </div>

            </div>
          </div>
        );
      })()}

      {/* ========================================== */}
      {/* 🔍 LIGHTBOX / IMAGE ZOOM MODAL */}
      {/* ========================================== */}
      {state.zoomImageUrl && (
        <div 
          className="fixed inset-0 bg-black/95 z-[9999] flex items-center justify-center p-4 cursor-zoom-out animate-in fade-in duration-200"
          onClick={() => state.setZoomImageUrl(null)}
        >
          <button 
            onClick={() => state.setZoomImageUrl(null)}
            className="absolute top-6 right-6 p-2.5 rounded-full bg-white/5 hover:bg-white/10 text-neutral-400 hover:text-white transition cursor-pointer"
          >
            <X className="w-6 h-6" />
          </button>
          <div className="max-w-5xl max-h-[85vh] overflow-hidden rounded-3xl border border-white/10 shadow-2xl relative" onClick={(e) => e.stopPropagation()}>
            <img src={state.zoomImageUrl} className="max-w-full max-h-[85vh] object-contain rounded-2xl" />
          </div>
        </div>
      )}

      {/* Variant Generator Modal */}
      {state.showVariantGenModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-md z-50 flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="bg-[#0c0c0e] border border-white/5 rounded-3xl p-6 w-full max-w-xl space-y-4 shadow-2xl relative">
            <button 
              onClick={() => state.setShowVariantGenModal(false)}
              className="absolute top-4 right-4 p-1.5 rounded-full bg-white/5 hover:bg-white/10 text-neutral-400 hover:text-white transition cursor-pointer z-30"
            >
              <X className="w-4.5 h-4.5" />
            </button>

            <h3 className="text-base font-black text-white uppercase tracking-widest flex items-center gap-2 border-b border-white/5 pb-3 font-mono">
              <Sparkles className="w-4.5 h-4.5 text-purple-500" /> Tạo ảnh biến thể mới (Add Variant)
            </h3>

            {/* Selector Tab Generator Console */}
            <div className="flex bg-black/40 p-1 rounded-2xl border border-white/5">
              <button
                onClick={() => state.setVariantConsoleTab("ai")}
                className={`flex-1 py-2 rounded-xl text-[10px] font-black uppercase transition cursor-pointer ${
                  state.variantConsoleTab === "ai" ? 'bg-purple-600 text-white font-extrabold' : 'text-neutral-500 hover:text-neutral-300'
                }`}
              >
                🤖 Sinh ảnh tự động (AI)
              </button>
              <button
                onClick={() => state.setVariantConsoleTab("manual")}
                className={`flex-1 py-2 rounded-xl text-[10px] font-black uppercase transition cursor-pointer ${
                  state.variantConsoleTab === "manual" ? 'bg-purple-600 text-white font-extrabold' : 'text-neutral-500 hover:text-neutral-300'
                }`}
              >
                📤 Tải lên biến thể thủ công (Manual)
              </button>
            </div>

            {/* Tab AI Console */}
            {state.variantConsoleTab === "ai" ? (
              <div className="space-y-4 pt-1">
                {/* 1. Selector Image Generation model */}
                <div className="grid grid-cols-2 gap-4">
                  {state.gatewayType === 'sdk' && state.vidtoryModels.filter(m => m.type === 'image').length > 0 && (
                    <div className="space-y-1">
                      <label className="text-[7.5px] font-black text-neutral-500 uppercase tracking-widest">Model vẽ (Image)</label>
                      <select
                        value={state.selectedImageModel}
                        onChange={(e) => state.setSelectedImageModel(e.target.value)}
                        className="w-full bg-black border border-white/10 rounded-lg px-3 py-1.5 text-xs text-neutral-300 outline-none focus:border-purple-500/50 transition font-bold"
                      >
                        {state.vidtoryModels.filter(m => m.type === 'image').map(m => (
                          <option key={m.id} value={m.id}>{m.name}</option>
                        ))}
                      </select>
                    </div>
                  )}

                  {/* Layout selector (1x1, 2x2, 3x3) */}
                  {state.assetType !== "character" && (
                    <div className="space-y-1">
                      <label className="text-[7.5px] font-black text-neutral-500 uppercase tracking-widest">Chế độ Lưới (Grid Mode)</label>
                      <select
                        value={state.generationGridMode}
                        onChange={(e) => state.setGenerationGridMode(e.target.value as any)}
                        className="w-full bg-black border border-white/10 rounded-lg px-3 py-1.5 text-xs text-neutral-300 outline-none focus:border-purple-500/50 transition font-bold"
                      >
                        <option value="1x1">1x1: Ảnh đơn (Single Frame)</option>
                        <option value="2x1">2x1: Lưới 2 ảnh ngang (2 Variants - Panorama)</option>
                        <option value="3x1">3x1: Lưới 3 ảnh ngang (3 Variants - Panorama)</option>
                        <option value="4x1">4x1: Lưới 4 ảnh ngang (4 Variants - Panorama)</option>
                        <option value="2x2">2x2: Lưới 4 ảnh (4 Variants)</option>
                        <option value="3x3">3x3: Lưới 9 ảnh (9 Variants)</option>
                      </select>
                    </div>
                  )}
                </div>

                {/* 2. Text Area Context Input */}
                <div className="space-y-1">
                  <label className="text-[7.5px] font-black text-neutral-500 uppercase tracking-widest">Ngữ cảnh mới của kịch bản (Context)</label>
                  <textarea
                    value={state.customContext}
                    onChange={(e) => state.setCustomContext(e.target.value)}
                    placeholder="Bổ sung bối cảnh / hành động / biểu cảm riêng cho biến thể này (Ví dụ: đang khóc ngoài trời mưa, cười tươi ở công viên...)"
                    className="w-full bg-black/60 border border-white/10 rounded-xl px-3 py-2 text-xs text-neutral-300 outline-none resize-none h-16 focus:border-purple-500/40 transition custom-scrollbar font-medium placeholder-neutral-600"
                  />
                </div>

                {/* 3. Advanced Tags Collapsible Switch */}
                <div className="border-t border-white/5 pt-2">
                  <button
                    type="button"
                    onClick={() => state.setIsAdvancedTagsOpen(!state.isAdvancedTagsOpen)}
                    className="w-full text-left py-1 text-[8px] font-black uppercase tracking-widest text-neutral-500 hover:text-neutral-300 transition flex items-center justify-between"
                  >
                    <span>{state.isAdvancedTagsOpen ? "▼ Ẩn các thuộc tính nâng cao" : "▶ Chọn thêm thuộc tính nhanh (Cảm xúc, Hành động, Góc máy...)"}</span>
                    <span className="text-[7.5px] bg-purple-950 border border-purple-500/20 px-1.5 py-0.2 rounded text-purple-400 font-bold">
                      {state.selectedTags.length} active
                    </span>
                  </button>

                  {state.isAdvancedTagsOpen && (
                    <div className="space-y-4 pt-3 animate-in slide-in-from-top-1 duration-200 bg-black/20 p-3 rounded-xl border border-white/5 mt-2">
                      {state.assetType === "character" && (
                        <>
                          <div className="space-y-1.5">
                            <span className="text-[8px] font-black uppercase tracking-widest text-neutral-500 block">🎭 Thần thái cảm xúc</span>
                            <div className="flex flex-wrap gap-1">
                              {CHARACTER_TAGS.emotion.map(emo => {
                                const isSelected = state.selectedTags.includes(emo.id);
                                return (
                                  <button
                                    key={emo.id}
                                    onClick={() => state.handleTagToggle(emo.id)}
                                    className={`px-2 py-1 rounded-lg border text-[8px] font-bold transition flex items-center gap-1 cursor-pointer ${
                                      isSelected 
                                        ? "bg-purple-600/20 border-purple-500 text-purple-400" 
                                        : "bg-black border-white/5 text-neutral-500 hover:border-white/10"
                                    }`}
                                  >
                                    <span>{emo.emoji}</span>
                                    <span>{emo.label}</span>
                                  </button>
                                );
                              })}
                            </div>
                          </div>

                          <div className="space-y-1.5">
                            <span className="text-[8px] font-black uppercase tracking-widest text-neutral-500 block">🏃 Hành động / Tư thế</span>
                            <div className="flex flex-wrap gap-1">
                              {CHARACTER_TAGS.action.map(act => {
                                const isSelected = state.selectedTags.includes(act.id);
                                return (
                                  <button
                                    key={act.id}
                                    onClick={() => state.handleTagToggle(act.id)}
                                    className={`px-2 py-1 rounded-lg border text-[8px] font-bold transition flex items-center gap-1 cursor-pointer ${
                                      isSelected 
                                        ? "bg-purple-600/20 border-purple-500 text-purple-400" 
                                        : "bg-black border-white/5 text-neutral-500 hover:border-white/10"
                                    }`}
                                  >
                                    <span>{act.emoji}</span>
                                    <span>{act.label}</span>
                                  </button>
                                );
                              })}
                            </div>
                          </div>
                        </>
                      )}
                      
                      {state.dbCustomTags.filter(t => t.assetType === state.assetType || !t.assetType).length > 0 && (
                        <div className="space-y-1.5 border-t border-white/5 pt-2">
                          <span className="text-[8px] font-black uppercase tracking-widest text-purple-400 block">🏷️ Custom Tags</span>
                          <div className="flex flex-wrap gap-1">
                            {state.dbCustomTags.filter(t => t.assetType === state.assetType || !t.assetType).map(tag => {
                              const isSelected = state.selectedTags.includes(tag.id);
                              return (
                                <button
                                  key={tag.id}
                                  onClick={() => state.handleTagToggle(tag.id)}
                                  className={`px-2 py-1 rounded-lg border text-[8px] font-bold transition flex items-center gap-1 cursor-pointer ${
                                    isSelected 
                                      ? "bg-purple-600/20 border-purple-500 text-purple-400" 
                                      : "bg-black border-white/5 text-neutral-500 hover:border-white/10"
                                  }`}
                                >
                                  <span>🏷️</span>
                                  <span>{tag.label}</span>
                                </button>
                              );
                            })}
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>

                {/* 4. Compiled prompt preview */}
                <div className="space-y-1 bg-black/40 border border-white/5 p-3 rounded-xl">
                  <span className="text-[8px] font-black uppercase text-neutral-500 tracking-wider">Compiled Prompt preview</span>
                  <p className="text-[10px] font-mono text-neutral-300 leading-normal max-h-16 overflow-y-auto custom-scrollbar">{state.prompt}</p>
                </div>

                <button
                  onClick={state.handleGenerateImage}
                  disabled={state.isGeneratingImage || !state.prompt}
                  className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 text-white py-2.5 rounded-2xl text-xs font-black uppercase tracking-widest transition flex items-center justify-center gap-1.5 shadow active:scale-95 cursor-pointer"
                >
                  {state.isGeneratingImage ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      {state.genState === "sending" && "Đang gửi..."}
                      {state.genState === "queued" && "Đang xếp hàng..."}
                      {state.genState === "generating" && "Đang vẽ..."}
                    </>
                  ) : (
                    <>
                      <Play className="w-4 h-4 fill-white" /> Khởi Chạy Google Labs Sinh Biến Thể
                    </>
                  )}
                </button>
              </div>
            ) : (
              <div className="space-y-4 pt-1">
                {/* Drag & Drop Upload manual area */}
                <div className="space-y-1.5">
                  <label className="text-[9px] font-black uppercase tracking-widest text-neutral-500">Tệp ảnh biến thể</label>
                  <div 
                    onClick={() => state.variantFileInputRef.current?.click()}
                    className="border border-dashed border-white/10 hover:border-purple-500/50 rounded-2xl p-6 transition flex flex-col items-center justify-center gap-3 cursor-pointer bg-black/20 hover:bg-purple-950/5 group relative overflow-hidden min-h-[160px]"
                  >
                    {state.manualVariantFile ? (
                      <div className="flex flex-col items-center gap-2 w-full h-full justify-center">
                        <div className="relative w-28 h-28 rounded-xl overflow-hidden border border-white/10 shadow-lg group-hover:scale-105 transition-transform duration-200">
                          <img 
                            src={URL.createObjectURL(state.manualVariantFile)} 
                            alt="Manual variant preview" 
                            className="w-full h-full object-cover" 
                          />
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              state.setManualVariantFile(null);
                            }}
                            className="absolute top-1 right-1 p-1 rounded-full bg-black/60 hover:bg-black text-neutral-300 hover:text-white transition cursor-pointer"
                          >
                            <X className="w-3.5 h-3.5" />
                          </button>
                        </div>
                        <span className="text-[10px] text-neutral-400 font-medium truncate max-w-[200px]">
                          {state.manualVariantFile.name}
                        </span>
                      </div>
                    ) : (
                      <>
                        <div className="p-3 rounded-full bg-white/5 group-hover:bg-purple-950/20 group-hover:text-purple-400 text-neutral-400 transition-colors">
                          <UploadCloud className="w-6 h-6" />
                        </div>
                        <div className="text-center">
                          <p className="text-xs font-bold text-neutral-300">Nhấp vào đây để chọn ảnh</p>
                          <p className="text-[10px] text-neutral-500 mt-1">Hỗ trợ PNG, JPG, WEBP</p>
                        </div>
                      </>
                    )}
                  </div>
                </div>

                {/* Input Manual Tag ID */}
                <div className="space-y-1.5">
                  <label className="text-[9px] font-black uppercase tracking-widest text-neutral-500">Nhãn định dạng (Tag ID)</label>
                  <input
                    type="text"
                    value={state.manualVariantTag}
                    onChange={(e) => state.setManualVariantTag(e.target.value)}
                    placeholder="Ví dụ: angry, smile, action_run..."
                    className="w-full bg-black border border-white/10 rounded-xl px-3 py-2.5 text-xs text-neutral-300 outline-none focus:border-purple-500/50 transition font-mono"
                  />
                  <p className="text-[8.5px] text-neutral-500 leading-normal">
                    Nhãn này dùng để phân biệt các biến thể. Nếu để trống, hệ thống sẽ tự sinh ID.
                  </p>
                </div>

                {/* Upload Button */}
                <button
                  onClick={state.handleUploadManualVariant}
                  disabled={state.isUploadingManualVariant || !state.manualVariantFile}
                  className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 text-white py-2.5 rounded-2xl text-xs font-black uppercase tracking-widest transition flex items-center justify-center gap-1.5 shadow active:scale-95 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
                >
                  {state.isUploadingManualVariant ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Đang tải lên & lưu vào Album...
                    </>
                  ) : (
                    <>
                      <UploadCloud className="w-4 h-4" /> Tải lên & Lưu vào Album
                    </>
                  )}
                </button>
              </div>
            )}

            <input
              type="file"
              ref={state.variantFileInputRef}
              onChange={state.handleSelectManualVariantFile}
              accept="image/*"
              className="hidden"
            />
          </div>
        </div>
      )}

      {/* TUNNEL LOGS TERMINAL */}
      <TunnelTerminal 
        isOpen={state.showTunnelTerminal} 
        onClose={() => state.setShowTunnelTerminal(false)} 
        logs={state.tunnelLogs} 
      />
    </div>
  );
}
