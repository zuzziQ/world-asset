"use client";

import React, { useState } from "react";
import { Clapperboard, ListOrdered, Layers, Loader2, X } from "lucide-react";
import Link from "next/link";

interface StoryboardTimelineProps {
  selectedProjectId: string;
  selectedEpisode: any;
  storyboardAssets: any[];
  isLoadingStoryboard: boolean;
  getStoryboardFlowUrl: () => string;
}

export default function StoryboardTimeline({
  selectedProjectId,
  selectedEpisode,
  storyboardAssets,
  isLoadingStoryboard,
  getStoryboardFlowUrl
}: StoryboardTimelineProps) {
  const [selectedShotDetail, setSelectedShotDetail] = useState<{ shot: any, asset: any } | null>(null);

  if (!selectedEpisode) {
    return (
      <div className="border border-white/5 rounded-3xl p-6 text-center text-neutral-500 text-[10px] italic flex flex-col items-center justify-center gap-2.5 bg-black/10 min-h-[140px]">
        <Clapperboard className="w-8 h-8 text-neutral-700 animate-pulse" />
        <p>Vui lòng chọn một tập kịch bản ở trên để hiển thị Storyboard Timeline dưới đáy màn hình.</p>
      </div>
    );
  }

  const shots = selectedEpisode.meta?.shots || [];

  return (
    <div className="space-y-4 font-sans">
      {/* Header Timeline */}
      <div className="flex justify-between items-center border-b border-white/5 pb-2">
        <div className="flex items-center gap-2">
          <span className="text-xs font-black uppercase tracking-widest text-neutral-300 flex items-center gap-1.5 font-mono">
            <ListOrdered className="w-4 h-4 text-purple-400" /> Storyboard Timeline ({shots.length} Shots)
          </span>
          <span className="text-[8px] bg-purple-500/10 border border-purple-500/20 text-purple-400 font-mono px-2 py-0.5 rounded-full uppercase tracking-wider">
            Dải cuộn ngang đáy màn hình
          </span>
        </div>
        
        <div className="flex items-center gap-2">
          <Link
            href={`/tools/storyboard?projectId=${selectedProjectId}&episodeId=${selectedEpisode.id}`}
            className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 text-white px-3 py-1.5 rounded-xl text-[9px] font-black uppercase transition flex items-center gap-1 border border-purple-500/20 active:scale-95 cursor-pointer shadow shadow-purple-500/10"
          >
            <Clapperboard className="w-3 h-3 text-pink-300" /> Canvas Editor
          </Link>
          <a
            href={getStoryboardFlowUrl()}
            target="_blank"
            rel="noopener noreferrer"
            className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white px-3 py-1.5 rounded-xl text-[9px] font-black uppercase transition flex items-center gap-1 border border-indigo-500/20 active:scale-95"
          >
            🎬 Flow Architect Engine
          </a>
        </div>
      </div>

      {isLoadingStoryboard ? (
        <div className="flex items-center justify-center py-12 space-y-2 bg-black/20 rounded-2xl border border-white/5 min-h-[160px]">
          <div className="text-center">
            <Loader2 className="w-7 h-7 mx-auto text-purple-500 animate-spin mb-2" />
            <p className="text-[9px] text-neutral-500 font-bold uppercase tracking-wider font-mono">Đang tải storyboard assets...</p>
          </div>
        </div>
      ) : shots.length === 0 ? (
        <div className="border border-dashed border-white/5 rounded-2xl p-8 flex flex-col items-center justify-center gap-2 text-center bg-black/25 min-h-[160px]">
          <Layers className="w-8 h-8 text-neutral-700 animate-pulse" />
          <p className="text-[10px] text-neutral-500 font-medium">Chưa có shot nào được thiết lập cho kịch bản tập phim này.<br/>Sếp hãy nhấp vào Flow Architect Engine để phân rã và thiết kế visual storyboard!</p>
        </div>
      ) : (
        <div className="flex gap-4 overflow-x-auto py-2 pr-1 custom-scrollbar items-stretch min-h-[220px]">
          {shots
            .slice()
            .sort((a: any, b: any) => (a.shotNumber || 0) - (b.shotNumber || 0))
            .map((shot: any) => {
              // Lọc tìm render asset đầu tiên của shot này để làm ảnh preview
              const shotAsset = storyboardAssets.find(a => {
                const matchesScene = !shot.sceneNumber || a.sceneId === shot.sceneId || 
                  (Array.isArray(a.tags) && a.tags.some((t: string) => t.toLowerCase() === `scene ${shot.sceneNumber}`));
                const matchesShot = Array.isArray(a.tags) && a.tags.some((t: string) => 
                  t.toLowerCase() === `shot ${shot.shotNumber}` || 
                  t.toLowerCase() === String(shot.id).toLowerCase()
                );
                return matchesScene && matchesShot;
              }) || null;

              return (
                <div 
                  key={shot.id || shot.shotNumber} 
                  onClick={() => setSelectedShotDetail({ shot, asset: shotAsset })}
                  className="w-48 shrink-0 bg-[#09090e]/60 border border-white/[0.03] p-3.5 rounded-2xl flex flex-col justify-between hover:border-purple-500/30 hover:bg-white/[0.01] transition duration-200 cursor-pointer group shadow-lg"
                >
                  <div className="space-y-2">
                    <div className="flex justify-between items-center border-b border-white/[0.02] pb-1.5">
                      <span className="text-[10px] font-black text-white uppercase tracking-wider font-mono">
                        Shot {shot.shotNumber}
                      </span>
                      {shot.kind && (
                        <span className="text-[7.5px] font-black uppercase bg-neutral-900 border border-white/5 px-2 py-0.5 rounded text-amber-500 font-mono">
                          🎬 {shot.kind}
                        </span>
                      )}
                    </div>

                    {/* Preview container */}
                    <div className="aspect-video bg-neutral-950 border border-white/5 rounded-xl overflow-hidden relative flex items-center justify-center shadow-inner">
                      {shotAsset ? (
                        shotAsset.assetType === 'video' ? (
                          <video src={shotAsset.driveUrl || shotAsset.url} className="w-full h-full object-cover" muted playsInline loop autoPlay />
                        ) : (
                          <img src={shotAsset.driveUrl || shotAsset.url} className="w-full h-full object-cover" alt={`Shot ${shot.shotNumber}`} />
                        )
                      ) : (
                        <div className="text-[8px] text-neutral-600 font-bold uppercase tracking-wider italic text-center p-2">
                          Chưa vẽ Storyboard
                        </div>
                      )}
                      <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition duration-150 flex items-center justify-center text-[8px] text-purple-300 font-black uppercase tracking-widest">
                        Xem chi tiết
                      </div>
                    </div>
                  </div>

                  <div className="mt-3 space-y-1.5">
                    {shot.description ? (
                      <p className="text-[8.5px] text-neutral-400 line-clamp-2 leading-relaxed font-semibold">
                        {shot.description}
                      </p>
                    ) : (
                      <p className="text-[8.5px] text-neutral-655 italic line-clamp-2 leading-relaxed">
                        Chưa có kịch bản mô tả
                      </p>
                    )}
                    
                    {shot.camera && (
                      <span className="text-[7.5px] font-bold text-blue-400 font-mono block truncate" title={shot.camera}>
                        🎥 {shot.camera}
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
        </div>
      )}

      {/* Shot Detail Modal */}
      {selectedShotDetail && (
        <div 
          className="fixed inset-0 bg-black/85 backdrop-blur-md z-[9999] flex items-center justify-center p-4 overflow-y-auto animate-in fade-in duration-200"
          onClick={() => setSelectedShotDetail(null)}
        >
          <div 
            className="bg-[#0b0b10] border border-white/10 rounded-3xl w-full max-w-2xl overflow-hidden shadow-2xl flex flex-col md:flex-row items-stretch"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Cột trái: Ảnh minh họa phóng to */}
            <div className="md:w-1/2 bg-black flex items-center justify-center border-r border-white/5 relative min-h-[300px]">
              {selectedShotDetail.asset?.assetType === 'video' ? (
                <video 
                  src={selectedShotDetail.asset?.driveUrl || selectedShotDetail.asset?.url} 
                  className="w-full h-full object-contain" 
                  muted playsInline loop autoPlay 
                />
              ) : (
                <img 
                  src={selectedShotDetail.asset?.driveUrl || selectedShotDetail.asset?.url} 
                  className="w-full h-full object-contain" 
                  alt="Shot Render" 
                />
              )}
              <span className="absolute top-3 left-3 bg-purple-600/90 border border-purple-500/30 text-white font-mono text-[9px] font-black px-2 py-0.5 rounded-lg uppercase tracking-wider">
                Shot {selectedShotDetail.shot.shotNumber}
              </span>
            </div>

            {/* Cột phải: Thông số chi tiết */}
            <div className="md:w-1/2 p-6 flex flex-col justify-between space-y-4">
              <div className="space-y-3.5">
                <div className="flex justify-between items-start border-b border-white/5 pb-2.5">
                  <div>
                    <h4 className="text-xs font-black uppercase text-purple-400 tracking-wider">Thông Số Shot Chi Tiết</h4>
                    <p className="text-[8px] text-neutral-500 font-bold uppercase tracking-wider mt-0.5 font-mono">Flow Architect Meta</p>
                  </div>
                  <button 
                    onClick={() => setSelectedShotDetail(null)}
                    className="p-1 rounded-lg hover:bg-white/5 text-neutral-400 hover:text-white transition cursor-pointer"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>

                {/* Thông số kỹ thuật */}
                <div className="grid grid-cols-2 gap-2 text-[9px]">
                  <div className="bg-white/[0.02] border border-white/5 p-2 rounded-xl">
                    <span className="text-[7.5px] font-black text-neutral-500 uppercase tracking-widest block">🎬 Khung hình (Kind)</span>
                    <span className="text-amber-500 font-black font-mono mt-0.5 block">{selectedShotDetail.shot.kind || "N/A"}</span>
                  </div>
                  <div className="bg-white/[0.02] border border-white/5 p-2 rounded-xl">
                    <span className="text-[7.5px] font-black text-neutral-500 uppercase tracking-widest block">🎥 Góc máy (Camera)</span>
                    <span className="text-blue-400 font-bold font-mono mt-0.5 block truncate" title={selectedShotDetail.shot.camera}>{selectedShotDetail.shot.camera || "N/A"}</span>
                  </div>
                  <div className="bg-white/[0.02] border border-white/5 p-2 rounded-xl">
                    <span className="text-[7.5px] font-black text-neutral-500 uppercase tracking-widest block">⚡ Chuyển cảnh (Transition)</span>
                    <span className="text-pink-400 font-bold font-mono mt-0.5 block truncate" title={selectedShotDetail.shot.transition}>{selectedShotDetail.shot.transition || "N/A"}</span>
                  </div>
                  <div className="bg-white/[0.02] border border-white/5 p-2 rounded-xl">
                    <span className="text-[7.5px] font-black text-neutral-500 uppercase tracking-widest block">⏱️ Thời lượng</span>
                    <span className="text-neutral-350 font-bold font-mono mt-0.5 block">{selectedShotDetail.shot.duration || "N/A"}</span>
                  </div>
                </div>

                {/* Mô tả kịch bản */}
                {selectedShotDetail.shot.description && (
                  <div className="space-y-1">
                    <span className="text-[8px] font-black text-neutral-500 uppercase tracking-widest block">📝 Mô tả kịch bản</span>
                    <p className="text-[10px] text-neutral-300 leading-relaxed font-semibold bg-white/[0.01] border border-white/5 p-2.5 rounded-xl max-h-[80px] overflow-y-auto custom-scrollbar">
                      {selectedShotDetail.shot.description}
                    </p>
                  </div>
                )}

                {/* Visual Prompt */}
                {selectedShotDetail.shot.prompt && (
                  <div className="space-y-1">
                    <div className="flex justify-between items-center">
                      <span className="text-[8px] font-black text-neutral-500 uppercase tracking-widest block">🎨 Prompt vẽ Visual</span>
                      <button 
                        onClick={() => {
                          navigator.clipboard.writeText(selectedShotDetail.shot.prompt);
                          alert("Đã copy Prompt!");
                        }}
                        className="text-[7.5px] bg-purple-600/10 border border-purple-500/20 text-purple-400 font-bold px-1.5 py-0.5 rounded hover:bg-purple-600 hover:text-white transition cursor-pointer"
                      >
                        Copy
                      </button>
                    </div>
                    <p className="text-[9px] text-neutral-400 italic leading-relaxed font-sans bg-black border border-white/5 p-2 rounded-xl max-h-[85px] overflow-y-auto custom-scrollbar font-semibold">
                      {selectedShotDetail.shot.prompt}
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
