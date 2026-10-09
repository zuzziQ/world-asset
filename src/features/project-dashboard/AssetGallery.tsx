"use client";

import React, { useState, useEffect, useMemo } from "react";
import { User, MapPin, Box, Loader2, Award, Image as ImageIcon, X } from "lucide-react";
import { fetchCharacterVariants, updateCharacter, syncProjectToLetta } from "@/lib/api";
import { resolveImageUrl } from "@/lib/imageUrl";

interface AssetGalleryProps {
  selectedProjectId: string;
  dbAssetsList: any[];
  setDbAssetsList: React.Dispatch<React.SetStateAction<any[]>>;
  isHorizontal?: boolean;
}

export default function AssetGallery({
  selectedProjectId,
  dbAssetsList,
  setDbAssetsList,
  isHorizontal = false
}: AssetGalleryProps) {
  // Variants Gallery states
  const [assetTab, setAssetTab] = useState<"character" | "location" | "prop">("character");
  const [selectedAssetId, setSelectedAssetId] = useState<string>("");
  const [variants, setVariants] = useState<any[]>([]);
  const [isLoadingVariants, setIsLoadingVariants] = useState(false);
  const [isSettingMaster, setIsSettingMaster] = useState(false);
  const [lightboxUrl, setLightboxUrl] = useState<string | null>(null);

  // Filter project assets for variants view
  const projectAssets = useMemo(() => {
    return dbAssetsList.filter(a => 
      (a.projectId === selectedProjectId || a.universeId === selectedProjectId) &&
      (a.entityType || "character") === assetTab
    );
  }, [dbAssetsList, selectedProjectId, assetTab]);

  // Set default asset when asset tab or project changes
  useEffect(() => {
    if (projectAssets.length > 0) {
      setSelectedAssetId(projectAssets[0].id);
    } else {
      setSelectedAssetId("");
      setVariants([]);
    }
  }, [projectAssets, assetTab]);

  // Load variants when selected asset changes
  useEffect(() => {
    if (selectedAssetId) {
      loadVariants(selectedAssetId);
    } else {
      setVariants([]);
    }
  }, [selectedAssetId]);

  const loadVariants = async (assetId: string) => {
    setIsLoadingVariants(true);
    try {
      const data = await fetchCharacterVariants(assetId);
      setVariants(data || []);
    } catch (e) {
      console.error("Failed to load variants:", e);
    } finally {
      setIsLoadingVariants(false);
    }
  };

  // Set as Master Reference & Letta Sync
  const handleSetAsMaster = async (imageUrl: string) => {
    if (!selectedAssetId) return;
    setIsSettingMaster(true);
    try {
      const asset = dbAssetsList.find(a => a.id === selectedAssetId);
      if (!asset) return;
      
      console.log(`[Gallery] Updating character rootImageUrl for ${asset.name}...`);
      const updated = await updateCharacter(selectedAssetId, {
        rootImageUrl: imageUrl
      });
      
      // Update local db assets state
      setDbAssetsList(prev => prev.map(a => a.id === selectedAssetId ? updated : a));
      
      console.log(`[Letta Sync] Synchronizing project memories...`);
      await syncProjectToLetta(selectedProjectId);
      
      alert("🎉 Đã thiết lập ảnh làm Master Reference & đồng bộ ký ức DNA mới lên Letta thành công!");
    } catch (e: any) {
      alert("Lỗi thiết lập Master Reference: " + e.message);
    } finally {
      setIsSettingMaster(false);
    }
  };

  const selectedAsset = useMemo(() => {
    return projectAssets.find(a => a.id === selectedAssetId) || null;
  }, [projectAssets, selectedAssetId]);

  return (
    <div className={`border border-white/5 rounded-3xl p-5 bg-white/[0.01] backdrop-blur-md shadow-2xl flex flex-col font-sans overflow-hidden ${
      isHorizontal ? "h-full w-full justify-between gap-3" : "h-full min-h-[500px] space-y-5"
    }`}>
      
      {/* HEADER SECTION */}
      <div className={`flex items-center justify-between border-b border-white/5 pb-2 shrink-0 ${
        isHorizontal ? "flex-row gap-4" : "flex-col md:flex-row gap-3"
      }`}>
        <div className="flex items-center gap-2">
          <ImageIcon className="w-4 h-4 text-purple-400 shrink-0" />
          <div>
            <h2 className="text-xs font-black uppercase tracking-widest text-neutral-300">
              Variants Gallery
            </h2>
            {!isHorizontal && (
              <p className="text-[9px] text-neutral-500 mt-0.5">Quản lý biến thể ảnh và thiết lập Master Reference Image cho nhân vật, bối cảnh, đạo cụ</p>
            )}
          </div>
        </div>

        {/* Tab switchers */}
        <div className="flex items-center gap-1 bg-black/40 p-0.5 rounded-lg border border-white/5 max-w-[240px]">
          {[
            { id: 'character', label: 'Char', icon: User },
            { id: 'location', label: 'Loc', icon: MapPin },
            { id: 'prop', label: 'Prop', icon: Box }
          ].map(tab => {
            const Icon = tab.icon;
            const isActive = assetTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setAssetTab(tab.id as any)}
                className={`flex items-center gap-1 px-2.5 py-1 rounded-md text-[8px] font-black uppercase transition cursor-pointer ${
                  isActive 
                    ? 'bg-purple-600 text-white font-extrabold shadow shadow-purple-500/10' 
                    : 'text-neutral-500 hover:text-neutral-300 hover:bg-white/5'
                }`}
              >
                <Icon className="w-3 h-3" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* HORIZONTAL MODE */}
      {isHorizontal ? (
        <div className="flex-1 min-h-0 flex gap-4 overflow-hidden items-stretch">
          {/* Cột trái: Asset Selector List (cuộn dọc trong khung nhỏ hoặc flex ngang) */}
          <div className="w-[28%] shrink-0 border-r border-white/5 pr-3 flex flex-col gap-2 overflow-hidden">
            <span className="text-[8px] font-black uppercase text-neutral-500 tracking-wider block shrink-0">Danh sách ({projectAssets.length})</span>
            <div className="flex-1 overflow-y-auto custom-scrollbar space-y-1.5 pr-1">
              {projectAssets.length === 0 ? (
                <div className="text-center py-8 text-[9px] text-neutral-600 italic">Chưa có asset nào.</div>
              ) : (
                projectAssets.map(asset => (
                  <div
                    key={asset.id}
                    onClick={() => setSelectedAssetId(asset.id)}
                    className={`p-2 rounded-xl border transition cursor-pointer flex items-center gap-2.5 ${
                      selectedAssetId === asset.id
                        ? "bg-purple-950/20 border-purple-500/50 text-purple-300 shadow shadow-purple-500/5"
                        : "bg-black/30 border-white/5 hover:bg-white/[0.01] text-neutral-400 hover:text-neutral-200"
                    }`}
                  >
                    <div className="w-7 h-7 rounded-full overflow-hidden bg-neutral-950 flex items-center justify-center shrink-0 border border-white/5">
                      {asset.rootImageUrl ? (
                        <img 
                          src={resolveImageUrl(asset.rootImageUrl, assetTab)} 
                          className="w-full h-full object-cover" 
                          onError={(e) => {
                            (e.target as HTMLImageElement).src = "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=600&auto=format&fit=crop&q=80";
                          }}
                        />
                      ) : (
                        assetTab === 'character' ? <User className="w-3.5 h-3.5 text-neutral-600" /> :
                        assetTab === 'location' ? <MapPin className="w-3.5 h-3.5 text-neutral-600" /> :
                        <Box className="w-3.5 h-3.5 text-neutral-600" />
                      )}
                    </div>
                    <span className="font-bold text-[10px] truncate">{asset.name}</span>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Cột phải: Detail & Variants Row (Cuộn ngang) */}
          <div className="flex-1 min-h-0 flex flex-col justify-between overflow-hidden">
            {selectedAsset ? (
              <div className="flex-1 min-h-0 flex gap-4 items-stretch overflow-hidden">
                {/* Asset master info */}
                <div className="w-[32%] shrink-0 flex flex-col justify-between bg-black/20 border border-white/5 rounded-2xl p-3 overflow-hidden">
                  <div className="space-y-1.5 min-h-0 flex flex-col">
                    <span className="text-[8px] font-black uppercase text-purple-400 tracking-wider">Asset đã chọn</span>
                    <h3 className="text-xs font-black text-white truncate">{selectedAsset.name}</h3>
                    {selectedAsset.description ? (
                      <p className="text-[8.5px] text-neutral-500 line-clamp-3 leading-relaxed overflow-y-auto custom-scrollbar pr-0.5">{selectedAsset.description}</p>
                    ) : (
                      <p className="text-[8.5px] text-neutral-650 italic">Không có mô tả DNA</p>
                    )}
                  </div>
                  
                  {/* Master Ref Preview */}
                  <div className="mt-2 flex items-center gap-2 bg-neutral-950 border border-white/5 p-1.5 rounded-xl">
                    <div className="w-10 h-10 bg-black border border-white/5 rounded-lg overflow-hidden shrink-0">
                      {selectedAsset.rootImageUrl ? (
                        <img 
                          src={resolveImageUrl(selectedAsset.rootImageUrl, assetTab)} 
                          className="w-full h-full object-cover" 
                          onError={(e) => {
                            (e.target as HTMLImageElement).src = "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=600&auto=format&fit=crop&q=80";
                          }}
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-[7px] text-neutral-650 uppercase font-black">Ref Image</div>
                      )}
                    </div>
                    <div className="min-w-0">
                      <span className="text-[7.5px] font-black text-neutral-500 uppercase tracking-widest block">Master Reference</span>
                      <span className="text-[8.5px] text-emerald-400 font-bold block truncate font-mono">Đã đồng bộ Letta</span>
                    </div>
                  </div>
                </div>

                {/* Variants Horizontal List */}
                <div className="flex-1 min-h-0 flex flex-col justify-between overflow-hidden">
                  <div className="flex justify-between items-center border-b border-white/[0.02] pb-1 shrink-0">
                    <span className="text-[8.5px] font-black uppercase text-neutral-500 tracking-wider">Biến thể ảnh ({variants.length})</span>
                    {isLoadingVariants && <Loader2 className="w-3 h-3 animate-spin text-purple-500" />}
                  </div>

                  <div className="flex-1 min-h-0 flex items-center overflow-x-auto gap-3 py-2 pr-1 custom-scrollbar">
                    {isLoadingVariants ? (
                      <div className="w-full text-center py-8 shrink-0">
                        <Loader2 className="w-6 h-6 mx-auto text-purple-500 animate-spin mb-1" />
                        <span className="text-[8px] text-neutral-550 uppercase tracking-widest font-bold font-mono">Đang tải...</span>
                      </div>
                    ) : variants.length === 0 ? (
                      <div className="w-full text-center py-8 text-[9px] text-neutral-600 italic shrink-0">Chưa có variant nào.</div>
                    ) : (
                      variants.map((v, index) => {
                        const rawUrl = v.driveUrl || v.url;
                        const resolvedUrl = resolveImageUrl(rawUrl);
                        const isCurrentMaster = selectedAsset.rootImageUrl === rawUrl || selectedAsset.rootImageUrl === resolvedUrl;
                        return (
                          <div 
                            key={index} 
                            className="h-[105px] w-[105px] shrink-0 bg-neutral-950 border border-white/5 rounded-xl overflow-hidden relative group shadow-md cursor-pointer flex flex-col"
                          >
                            <img 
                              src={resolvedUrl} 
                              className="w-full h-full object-cover" 
                              onClick={() => setLightboxUrl(resolvedUrl)} 
                              title="Click phóng to" 
                              onError={(e) => {
                                (e.target as HTMLImageElement).src = "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=600&auto=format&fit=crop&q=80";
                              }}
                            />
                            <div className="absolute inset-x-0 bottom-0 bg-black/85 p-1 flex justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                              {isCurrentMaster ? (
                                <span className="text-[7px] text-emerald-400 font-black uppercase flex items-center gap-0.5">
                                  <Award className="w-2.5 h-2.5" /> Active
                                </span>
                              ) : (
                                <button
                                  onClick={() => handleSetAsMaster(rawUrl)}
                                  disabled={isSettingMaster}
                                  className="bg-purple-600 text-white text-[7px] font-black uppercase px-1.5 py-0.5 rounded cursor-pointer transition hover:bg-purple-500"
                                >
                                  {isSettingMaster ? "..." : "Master"}
                                </button>
                              )}
                            </div>
                          </div>
                        );
                      })
                    )}
                  </div>
                </div>
              </div>
            ) : (
              <div className="flex-1 flex flex-col items-center justify-center text-center p-8 bg-black/10 border border-dashed border-white/5 rounded-2xl text-neutral-650 italic text-[10px]">
                Vui lòng chọn một Asset bên trái để hiển thị thông số và biến thể.
              </div>
            )}
          </div>
        </div>
      ) : (
        /* VERTICAL MODE (ORIGINAL) */
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 animate-in fade-in duration-200 flex-1 min-h-0 overflow-y-auto">
          {/* Left selector */}
          <div className="lg:col-span-4 space-y-4">
            <div className="flex flex-col gap-2.5 max-h-[350px] pr-1 custom-scrollbar overflow-y-auto">
              {projectAssets.length === 0 ? (
                <div className="text-center py-10 text-[10px] text-neutral-600 italic">Chưa có asset nào.</div>
              ) : (
                projectAssets.map(asset => (
                  <div
                    key={asset.id}
                    onClick={() => setSelectedAssetId(asset.id)}
                    className={`p-3 rounded-2xl border transition cursor-pointer flex items-center gap-3 ${
                      selectedAssetId === asset.id
                        ? "bg-purple-950/20 border-purple-500/50 text-purple-300"
                        : "bg-black/40 border-white/5 hover:bg-white/[0.02] text-neutral-355"
                    }`}
                  >
                    <div className="w-9 h-9 rounded-full overflow-hidden bg-neutral-950 flex items-center justify-center shrink-0 border border-white/5">
                      {asset.rootImageUrl ? (
                        <img 
                          src={resolveImageUrl(asset.rootImageUrl, assetTab)} 
                          className="w-full h-full object-cover" 
                          onError={(e) => {
                            (e.target as HTMLImageElement).src = "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=600&auto=format&fit=crop&q=80";
                          }}
                        />
                      ) : (
                        assetTab === 'character' ? <User className="w-4 h-4 text-neutral-600" /> :
                        assetTab === 'location' ? <MapPin className="w-4 h-4 text-neutral-600" /> :
                        <Box className="w-4 h-4 text-neutral-600" />
                      )}
                    </div>
                    <span className="font-bold text-xs truncate">{asset.name}</span>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Right gallery grid */}
          <div className="lg:col-span-8 space-y-4">
            {selectedAssetId ? (
              <div className="space-y-4">
                <div className="flex justify-between items-center border-b border-white/5 pb-2">
                  <span className="text-[10px] font-black uppercase text-purple-400 tracking-wider">
                    Các biến thể Variant ảnh của: {selectedAsset?.name}
                  </span>
                  {isLoadingVariants && <Loader2 className="w-3.5 h-3.5 animate-spin text-purple-500" />}
                </div>

                {isLoadingVariants ? (
                  <div className="py-20 text-center">
                    <Loader2 className="w-8 h-8 mx-auto text-purple-500 animate-spin mb-2" />
                    <p className="text-[10px] text-neutral-500 uppercase tracking-widest font-bold">Đang tải variants...</p>
                  </div>
                ) : variants.length === 0 ? (
                  <div className="py-20 text-center border border-dashed border-white/5 rounded-2xl bg-black/20 text-neutral-500 text-xs italic">
                    Asset này chưa có ảnh Variant nào. Hãy vào Visual DNA Editor để sinh variants.
                  </div>
                ) : (
                  <div className="grid grid-cols-3 gap-4 max-h-[380px] overflow-y-auto custom-scrollbar pr-1">
                    {variants.map((v, index) => {
                      const rawUrl = v.driveUrl || v.url;
                      const resolvedUrl = resolveImageUrl(rawUrl);
                      const isCurrentMaster = selectedAsset?.rootImageUrl === rawUrl || selectedAsset?.rootImageUrl === resolvedUrl;
                      
                      return (
                        <div 
                          key={index} 
                          className="aspect-square bg-neutral-950 border border-white/5 rounded-2xl overflow-hidden relative group shadow-lg cursor-pointer animate-in fade-in duration-200"
                        >
                          <img 
                            src={resolvedUrl} 
                            className="w-full h-full object-cover" 
                            onClick={() => setLightboxUrl(resolvedUrl)} 
                            title="Click để phóng to" 
                            onError={(e) => {
                              (e.target as HTMLImageElement).src = "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=600&auto=format&fit=crop&q=80";
                            }}
                          />
                          
                          {/* Overlay Controls */}
                          <div className="absolute bottom-0 inset-x-0 bg-gradient-to-t from-black via-black/80 to-transparent opacity-0 group-hover:opacity-100 transition-all duration-200 p-3 pt-6 flex flex-col gap-2">
                            <span className="text-[8px] font-black uppercase text-neutral-400 tracking-widest">Variant #{index + 1}</span>
                            
                            {isCurrentMaster ? (
                              <span className="bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-[8px] font-black uppercase py-1 px-2 rounded-lg flex items-center justify-center gap-1">
                                <Award className="w-3.5 h-3.5" /> Current Master
                              </span>
                            ) : (
                              <button
                                onClick={() => handleSetAsMaster(rawUrl)}
                                disabled={isSettingMaster}
                                className="w-full py-1.5 bg-purple-600 hover:bg-purple-500 disabled:opacity-50 text-white rounded-lg text-[8.5px] font-black uppercase transition flex items-center justify-center gap-1 cursor-pointer"
                              >
                                {isSettingMaster ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Award className="w-3.5 h-3.5" />}
                                Set as Master Ref
                              </button>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            ) : (
              <div className="border border-dashed border-white/5 rounded-3xl p-12 text-center text-neutral-500 text-xs italic flex flex-col items-center justify-center gap-3 bg-black/10 h-[300px]">
                <ImageIcon className="w-10 h-10 text-neutral-700 animate-pulse" />
                <p>Vui lòng chọn một Asset ở cột bên trái để hiển thị và thiết lập Master Reference Image.</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Lightbox Modal */}
      {lightboxUrl && (
        <div 
          className="fixed inset-0 bg-black/90 backdrop-blur-xl z-[9999] flex items-center justify-center p-4 animate-in fade-in duration-200"
          onClick={() => setLightboxUrl(null)}
        >
          <button 
            className="absolute top-6 right-6 p-2.5 rounded-full bg-white/5 hover:bg-white/10 text-neutral-400 hover:text-white transition cursor-pointer"
            onClick={() => setLightboxUrl(null)}
          >
            <X className="w-6 h-6" />
          </button>
          <div className="max-w-4xl max-h-[85vh] overflow-hidden rounded-2xl border border-white/10 shadow-2xl relative">
            <img src={lightboxUrl} className="w-full h-full object-contain" alt="Phóng to" />
          </div>
        </div>
      )}
    </div>
  );
}
