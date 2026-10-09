"use client";

import React, { useState, useEffect, useMemo } from "react";
import { User, Loader2, Save, UploadCloud, Image as ImageIcon, Check, AlertTriangle, FileText, Sparkles } from "lucide-react";
import { useProjectStore } from "@/lib/projectStore";
import { resolveImageUrl } from "@/lib/imageUrl";
import { 
  fetchCharacterVariants, updateCharacter, createCharacter, 
  uploadImage, syncProjectToLetta 
} from "@/lib/api";
import { WorldBible } from "@/features/world-bible/schema";

function removeVietnameseTones(str: string): string {
  if (!str) return "";
  str = str.replace(/à|á|ạ|ả|ã|â|ầ|ấ|ậ|ẩ|ẫ|ă|ằ|ắ|ặ|ẳ|ẵ/g,"a"); 
  str = str.replace(/è|é|ẹ|ẻ|ẽ|ê|ề|ế|ệ|ể|ễ/g,"e"); 
  str = str.replace(/ì|í|ị|ỉ|ĩ/g,"i"); 
  str = str.replace(/ò|ó|ọ|ỏ|õ|ô|ồ|ố|ộ|ổ|ỗ|ơ|ờ|ớ|ợ|ở|ỡ/g,"o"); 
  str = str.replace(/ù|ú|ụ|ủ|ũ|ư|ừ|ứ|ự|ử|ữ/g,"u"); 
  str = str.replace(/ỳ|ý|ỵ|ỷ|ỹ/g,"y"); 
  str = str.replace(/đ/g,"d");
  str = str.replace(/À|Á|Ạ|Ả|Ã|Â|Ầ|Ấ|Ậ|Ẩ|Ẫ|Ă|Ằ|Ắ|Ặ|Ẳ|Ẵ/g, "A");
  str = str.replace(/È|É|Ẹ|Ẻ|Ẽ|Ê|Ề|Ế|Ệ|Ể|Ễ/g, "E");
  str = str.replace(/Ì|Í|Ị|Ỉ|Ĩ/g, "I");
  str = str.replace(/Ò|Ó|Ọ|Ỏ|Õ|Ô|Ồ|Ố|Ộ|Ổ|Ỗ|Ơ|Ờ|Ớ|Ợ|Ở|Ỡ/g, "O");
  str = str.replace(/Ù|Ú|Ụ|Ủ|Ũ|Ư|Ừ|Ứ|Ự|Ử|Ữ/g, "U");
  str = str.replace(/Ỳ|Ý|Ỵ|Ỷ|Ỹ/g, "Y");
  str = str.replace(/Đ/g, "D");
  return str;
}

function slugify(text: string): string {
  if (!text) return "";
  return removeVietnameseTones(text)
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_]+/g, '_')
    .replace(/^-+|-+$/g, '');
}

interface CharacterProfileStudioProps {
  selectedProjectId: string;
  characterName: string;
  bible: WorldBible | null;
  dbAssetsList: any[];
  setDbAssetsList: React.Dispatch<React.SetStateAction<any[]>>;
  loadData: (id?: string) => Promise<void>;
  onLightboxOpen: (url: string) => void;
  
  episodes: any[];
  onOpenScriptModal: (ep: any) => void;
}

export default function CharacterProfileStudio({
  selectedProjectId,
  characterName,
  bible,
  dbAssetsList,
  setDbAssetsList,
  loadData,
  onLightboxOpen,
  episodes,
  onOpenScriptModal
}: CharacterProfileStudioProps) {
  
  const [variants, setVariants] = useState<any[]>([]);
  const [isLoadingVariants, setIsLoadingVariants] = useState(false);
  const [isSavingAsset, setIsSavingAsset] = useState(false);
  const [isCreatingAsset, setIsCreatingAsset] = useState(false);
  const [isUploadingImage, setIsUploadingImage] = useState(false);

  // Form states
  const [assetDesc, setAssetDesc] = useState("");
  const [assetImgUrl, setAssetImgUrl] = useState("");

  // Tìm thông tin nhân vật trong World Bible
  const bibleChar = useMemo(() => {
    if (!bible?.peerGroup?.characters) return null;
    return bible.peerGroup.characters.find(
      c => c.name?.toLowerCase().trim() === characterName?.toLowerCase().trim()
    ) || null;
  }, [bible, characterName]);

  // Tìm asset thực tế trong DB
  const dbAsset = useMemo(() => {
    return dbAssetsList.find(a => 
      (a.projectId === selectedProjectId || a.universeId === selectedProjectId) &&
      (a.entityType === "character" || !a.entityType) &&
      a.name?.toLowerCase().trim() === characterName?.toLowerCase().trim()
    ) || null;
  }, [dbAssetsList, selectedProjectId, characterName]);

  // Lọc xem nhân vật xuất hiện ở những tập kịch bản nào
  const appearingEpisodes = useMemo(() => {
    if (!characterName || episodes.length === 0) return [];
    return episodes.filter(ep => {
      const inScript = ep.script?.toLowerCase().includes(characterName.toLowerCase().trim());
      const inShots = ep.meta?.shots?.some((shot: any) => 
        shot.description?.toLowerCase().includes(characterName.toLowerCase().trim()) ||
        shot.prompt?.toLowerCase().includes(characterName.toLowerCase().trim())
      );
      return inScript || inShots;
    });
  }, [episodes, characterName]);

  // Load values when asset changes
  useEffect(() => {
    if (dbAsset) {
      setAssetDesc(dbAsset.description || "");
      setAssetImgUrl(dbAsset.rootImageUrl || "");
      loadVariants(dbAsset.id);
    } else {
      setAssetDesc("");
      setAssetImgUrl("");
      setVariants([]);
    }
  }, [dbAsset, characterName]);

  const loadVariants = async (assetId: string) => {
    setIsLoadingVariants(true);
    try {
      const data = await fetchCharacterVariants(assetId);
      if (data && data.length > 0) {
        setVariants(data);
      } else if (dbAsset?.rootImageUrl) {
        setVariants([{ driveUrl: dbAsset.rootImageUrl, url: dbAsset.rootImageUrl }]);
      } else {
        setVariants([]);
      }
    } catch (e) {
      console.error("Failed to load variants:", e);
      if (dbAsset?.rootImageUrl) {
        setVariants([{ driveUrl: dbAsset.rootImageUrl, url: dbAsset.rootImageUrl }]);
      } else {
        setVariants([]);
      }
    } finally {
      setIsLoadingVariants(false);
    }
  };

  // Khởi tạo Asset trong DB cho nhân vật
  const handleCreateAsset = async () => {
    if (!characterName || !selectedProjectId) return;
    setIsCreatingAsset(true);
    try {
      const defaultDesc = bibleChar 
        ? `Nhân vật: ${bibleChar.name}. Vai trò: ${bibleChar.role || ""}. Thái độ: ${bibleChar.attitude || ""}. Điểm yếu: ${bibleChar.flaw || ""}. Đạo cụ: ${bibleChar.signatureProp || ""}.` 
        : `Nhân vật trong thế giới ${characterName}`;
      
      const newAsset = await createCharacter({
        projectId: selectedProjectId,
        name: characterName,
        slug: slugify(characterName),
        description: defaultDesc,
        entityType: "character",
        rootImageUrl: ""
      });
      
      setDbAssetsList(prev => [...prev, newAsset]);
      alert(`🎉 Đã khởi tạo DNA Asset cho nhân vật "${characterName}" thành công!`);
      await loadData(selectedProjectId);
    } catch (e: any) {
      alert("Lỗi khi khởi tạo Asset: " + e.message);
    } finally {
      setIsCreatingAsset(false);
    }
  };

  // Lưu thông tin DNA
  const handleSaveDna = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!dbAsset) return;
    setIsSavingAsset(true);
    try {
      const updated = await updateCharacter(dbAsset.id, {
        description: assetDesc,
        rootImageUrl: assetImgUrl
      });
      setDbAssetsList(prev => prev.map(a => a.id === dbAsset.id ? updated : a));
      alert("🎉 Đã lưu thông tin DNA của nhân vật thành công!");
    } catch (e: any) {
      alert("Lỗi khi lưu DNA: " + e.message);
    } finally {
      setIsSavingAsset(false);
    }
  };

  // Upload Master Image
  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setIsUploadingImage(true);
    try {
      const res = await uploadImage(file);
      setAssetImgUrl(res.url);
      if (dbAsset) {
        const updated = await updateCharacter(dbAsset.id, { rootImageUrl: res.url });
        setDbAssetsList(prev => prev.map(a => a.id === dbAsset.id ? updated : a));
        await syncProjectToLetta(selectedProjectId);
      }
      alert("🎉 Đã tải ảnh lên và đồng bộ Master Reference thành công!");
    } catch (err: any) {
      alert("Lỗi upload ảnh DNA: " + err.message);
    } finally {
      setIsUploadingImage(false);
    }
  };

  if (!characterName) {
    return (
      <div className="border border-white/5 rounded-3xl p-6 bg-white/[0.01] backdrop-blur-md shadow-2xl flex flex-col items-center justify-center text-center h-full min-h-[400px] text-neutral-500 text-xs italic space-y-3">
        <User className="w-12 h-12 text-neutral-700 animate-pulse" />
        <p>Vui lòng chọn một nhân vật Cast ở cột giữa để biên tập DNA, Variants và Master Reference Image.</p>
      </div>
    );
  }

  return (
    <div className="border border-white/5 rounded-3xl p-4 bg-[#0b0b10]/40 backdrop-blur-md shadow-2xl flex flex-col h-full space-y-3.5 font-sans overflow-hidden justify-start">
      
      {/* HEADER SECTION */}
      <div className="border-b border-white/5 pb-2 shrink-0">
        <span className="text-[8px] bg-purple-500/10 border border-purple-500/20 text-purple-400 font-mono px-2 py-0.5 rounded uppercase tracking-wider block w-fit">
          Character Studio
        </span>
        <h2 className="text-sm font-black text-white uppercase tracking-wide truncate mt-1">
          Nhân Vật Cast: <span className="text-purple-450">{characterName}</span>
        </h2>
        {bibleChar?.role && (
          <p className="text-[10px] text-neutral-455 font-bold truncate mt-0.5">{bibleChar.role}</p>
        )}
        {dbAsset?.coreIdentity?.tags && dbAsset.coreIdentity.tags.length > 0 && (
          <div className="flex flex-wrap gap-1.5 mt-2">
            {dbAsset.coreIdentity.tags.map((tag: string, i: number) => (
              <span key={i} className="text-[7.5px] bg-white/10 text-neutral-300 px-1.5 py-0.5 rounded border border-white/20 uppercase tracking-wider font-mono">
                {tag}
              </span>
            ))}
          </div>
        )}
      </div>

      {/* IF ASSET NOT YET CREATED IN DATABASE */}
      {!dbAsset ? (
        <div className="flex-1 flex flex-col items-center justify-center text-center p-6 bg-black/20 border border-dashed border-white/5 rounded-2xl space-y-4">
          <AlertTriangle className="w-10 h-10 text-amber-500 animate-pulse" />
          <div className="space-y-1">
            <h3 className="text-xs font-black text-white uppercase tracking-widest">Visual DNA Chưa Khởi Tạo</h3>
            <p className="text-[9.5px] text-neutral-500 max-w-xs leading-relaxed">
              Nhân vật &ldquo;{characterName}&rdquo; đã có kịch bản World Bible nhưng chưa có DNA Asset thực tế trong cơ sở dữ liệu tài sản.
            </p>
          </div>
          <div className="flex items-center gap-2 flex-wrap justify-center">
            <button
              onClick={handleCreateAsset}
              className="flex items-center gap-1.5 bg-purple-600 hover:bg-purple-500 text-white px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-wider transition active:scale-95 duration-200 cursor-pointer shadow shadow-purple-500/10"
            >
              Khởi Tạo DNA Asset
            </button>
            <button
              onClick={() => {
                useProjectStore.getState().fillDemoData();
              }}
              className="flex items-center gap-1.5 bg-gradient-to-r from-amber-500 via-pink-600 to-purple-600 hover:from-amber-400 hover:to-purple-500 text-white px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-wider transition active:scale-95 duration-200 cursor-pointer shadow-lg shadow-amber-500/20"
            >
              <Sparkles className="w-3.5 h-3.5" />
              Nạp Demo Portfolio
            </button>
          </div>
        </div>
      ) : (
        /* IF ASSET CREATED */
        <div className="flex-1 min-h-0 flex flex-col space-y-3.5 overflow-y-auto pr-1 custom-scrollbar">
          
          {/* Section 1: Master Reference Image & DNA Editor */}
          <div className="flex gap-4 items-stretch bg-black/20 p-4 border border-white/5 rounded-2xl shrink-0">
            <div className="w-[100px] shrink-0 flex flex-col justify-between items-center gap-2">
              <div className="w-full aspect-square bg-neutral-955 border border-white/5 rounded-xl overflow-hidden flex items-center justify-center relative group shadow-inner">
                {assetImgUrl ? (
                  <img 
                    src={resolveImageUrl(assetImgUrl)} 
                    className="w-full h-full object-cover" 
                    onError={(e) => {
                      e.currentTarget.style.display = 'none';
                    }}
                  />
                ) : (
                  <div className="text-[20px]">👤</div>
                )}
                
                {/* Upload overlay */}
                <label className="absolute inset-0 bg-black/70 opacity-0 group-hover:opacity-100 transition flex flex-col items-center justify-center cursor-pointer text-[7.5px] font-black uppercase text-white gap-1 text-center p-2">
                  <UploadCloud className="w-4 h-4 text-purple-400" />
                  Tải ảnh Ref
                  <input 
                    type="file" 
                    accept="image/*" 
                    className="hidden" 
                    onChange={handleImageUpload}
                    disabled={isUploadingImage}
                  />
                </label>
              </div>
              
              <span className="text-[8px] font-black text-neutral-500 uppercase tracking-wider text-center block">Master Reference</span>
            </div>

            {/* DNA details and Form */}
            <form onSubmit={handleSaveDna} className="flex-1 flex flex-col justify-between min-w-0 space-y-3">
              <div className="space-y-1">
                <label className="text-[7.5px] font-black text-neutral-500 uppercase tracking-widest block">Mô tả DNA gốc (Style & Ngoại hình)</label>
                <textarea
                  value={assetDesc}
                  onChange={(e) => setAssetDesc(e.target.value)}
                  placeholder="Mô tả chi tiết nét ngoại hình, trang phục, hoặc thuộc tính đặc trưng..."
                  className="w-full bg-black/60 border border-white/5 rounded-xl p-2.5 text-[9.5px] text-neutral-300 resize-none h-16 outline-none focus:border-purple-500/30 transition custom-scrollbar font-semibold"
                />
              </div>

              <div className="flex gap-2">
                <input
                  type="text"
                  value={assetImgUrl}
                  onChange={(e) => setAssetImgUrl(e.target.value)}
                  placeholder="Link hình ảnh URL..."
                  className="flex-1 min-w-0 bg-black/60 border border-white/5 rounded-lg px-2.5 py-1.5 text-[8.5px] text-neutral-400 outline-none font-mono"
                />
                <button
                  type="submit"
                  disabled={isSavingAsset}
                  className="px-3 bg-purple-650 hover:bg-purple-500 disabled:opacity-50 text-white rounded-lg text-[9px] font-black uppercase transition flex items-center justify-center gap-1 cursor-pointer"
                >
                  {isSavingAsset ? <Loader2 className="w-3 h-3 animate-spin" /> : <Save className="w-3 h-3" />}
                  Lưu
                </button>
              </div>
            </form>
          </div>

          {/* Section 2: Lịch sử xuất hiện kịch bản (Appearances) */}
          <div className="bg-black/10 border border-white/5 p-3 rounded-2xl space-y-2 text-[9px] shrink-0">
            <span className="text-[8px] font-black text-blue-405 uppercase tracking-wider block">Các Tập Xuất Hiện ({appearingEpisodes.length})</span>
            {appearingEpisodes.length === 0 ? (
              <p className="text-[8px] text-neutral-600 italic">Nhân vật chưa xuất hiện trong kịch bản tập nào.</p>
            ) : (
              <div className="flex flex-wrap gap-1.5 max-h-[70px] overflow-y-auto pr-0.5 custom-scrollbar">
                {appearingEpisodes.map((ep) => (
                  <button
                    key={ep.id}
                    onClick={() => onOpenScriptModal(ep)}
                    className="px-2.5 py-1 bg-blue-950/20 border border-blue-500/20 text-blue-400 hover:bg-blue-600 hover:text-white rounded-lg text-[8px] font-black uppercase transition cursor-pointer flex items-center gap-1"
                  >
                    <FileText className="w-3 h-3" /> {ep.title}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Section 3: World Bible attributes */}
          {bibleChar && (
            <div className="bg-black/10 border border-white/5 p-3 rounded-2xl space-y-2 text-[9px] shrink-0">
              <span className="text-[8px] font-black text-purple-400 uppercase tracking-wider block">Ma trận vai diễn (World Bible Peer Matrix)</span>
              
              <div className="grid grid-cols-2 gap-2 text-neutral-405 leading-normal font-semibold">
                {bibleChar.attitude && (
                  <div className="bg-white/[0.01] p-2 rounded-lg border border-white/[0.03]">
                    <span className="text-[7.5px] font-black text-neutral-500 uppercase tracking-widest block mb-0.5">Thái độ</span>
                    {bibleChar.attitude}
                  </div>
                )}
                {bibleChar.flaw && (
                  <div className="bg-white/[0.01] p-2 rounded-lg border border-white/[0.03]">
                    <span className="text-[7.5px] font-black text-neutral-500 uppercase tracking-widest block mb-0.5">Điểm yếu (Flaw)</span>
                    {bibleChar.flaw}
                  </div>
                )}
                {bibleChar.signatureProp && (
                  <div className="bg-white/[0.01] p-2 rounded-lg border border-white/[0.03]">
                    <span className="text-[7.5px] font-black text-neutral-500 uppercase tracking-widest block mb-0.5">Đạo cụ đặc trưng</span>
                    {bibleChar.signatureProp}
                  </div>
                )}
                {bibleChar.dynamic && (
                  <div className="bg-white/[0.01] p-2 rounded-lg border border-white/[0.03]">
                    <span className="text-[7.5px] font-black text-neutral-500 uppercase tracking-widest block mb-0.5">Quan hệ</span>
                    {bibleChar.dynamic}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Section 4: Variants Grid (Hiển thị dạng Grid, ảnh to, bỏ Set Master) */}
          <div className="space-y-2 flex-1 min-h-[180px] flex flex-col justify-start">
            <div className="flex justify-between items-center border-b border-white/[0.03] pb-1 shrink-0">
              <span className="text-[8.5px] font-black uppercase text-neutral-500 tracking-wider">Bộ sưu tập Variants ({variants.length})</span>
              {isLoadingVariants && <Loader2 className="w-3 h-3 animate-spin text-purple-500" />}
            </div>

            <div className="flex-1 overflow-y-auto pr-0.5 custom-scrollbar min-h-0">
              {isLoadingVariants ? (
                <div className="w-full text-center py-8">
                  <Loader2 className="w-5 h-5 mx-auto text-purple-500 animate-spin mb-1" />
                  <span className="text-[7.5px] text-neutral-550 uppercase tracking-widest font-bold font-mono">Đang tải...</span>
                </div>
              ) : variants.length === 0 ? (
                <div className="w-full text-center py-8 text-[9px] text-neutral-600 italic">Chưa có variant nào.</div>
              ) : (
                <div className="grid grid-cols-3 gap-3 pb-3">
                  {variants.map((v, index) => {
                    const rawUrl = v.driveUrl || v.url;
                    const resolvedUrl = resolveImageUrl(rawUrl);
                    const isCurrentMaster = dbAsset.rootImageUrl === rawUrl || dbAsset.rootImageUrl === resolvedUrl;
                    return (
                      <div 
                        key={index} 
                        onClick={() => onLightboxOpen(resolvedUrl)}
                        className={`aspect-square bg-neutral-950 border rounded-xl overflow-hidden relative group shadow-md cursor-pointer hover:border-purple-500/50 transition-all ${
                          isCurrentMaster ? "border-emerald-500/80 ring-2 ring-emerald-500/25" : "border-white/5"
                        }`}
                        title="Click để phóng to xem chi tiết"
                      >
                        <img 
                          src={resolvedUrl} 
                          className="w-full h-full object-cover animate-in fade-in hover:scale-105 transition duration-300"
                          onError={(e) => {
                            (e.target as HTMLImageElement).src = "https://images.unsplash.com/photo-1534447677768-be436bb09401?w=600&auto=format&fit=crop&q=80";
                          }} 
                        />
                        {isCurrentMaster && (
                          <div className="absolute top-1.5 right-1.5 bg-emerald-500/90 text-white rounded-full p-0.5 shadow">
                            <Check className="w-3 h-3" />
                          </div>
                        )}
                        <div className="absolute inset-0 bg-black/45 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                          <span className="text-[7.5px] text-white font-black bg-black/70 px-2 py-1 rounded-lg uppercase tracking-wider">Xem ảnh</span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>

        </div>
      )}
    </div>
  );
}
