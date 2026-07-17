"use client";

import React, { useMemo } from "react";
import { Film, Users, MapPin, Gift, Bookmark } from "lucide-react";
import { WorldBible } from "@/features/world-bible/schema";

interface CinematicOverviewProps {
  bible: WorldBible | null;
  projectName: string;
  dbAssetsList: any[];
  selectedCharacterName: string;
  onSelectCharacter: (name: string) => void;
  onOpenWorldBibleModal: () => void;
  selectedEpisode: any | null;
}

export default function CinematicOverview({
  bible,
  projectName,
  dbAssetsList,
  selectedCharacterName,
  onSelectCharacter,
  onOpenWorldBibleModal,
  selectedEpisode
}: CinematicOverviewProps) {
  
  // 1. DÀN CAST ĐẦY ĐỦ (GỘP DB ASSETS CHARACTER VÀ WORLD BIBLE CHARACTERS)
  const dbCharacters = useMemo(() => {
    return dbAssetsList.filter(a => 
      a.entityType === "character"
    );
  }, [dbAssetsList]);

  const bibleCharacters = useMemo(() => {
    return bible?.peerGroup?.characters || [];
  }, [bible]);

  const fullCastList = useMemo(() => {
    const list: any[] = [];
    
    // Đưa các character thực tế trong DB vào trước (Mica, Bố, Mẹ...)
    dbCharacters.forEach(a => {
      let role = "Diễn viên chính";
      if (a.description) {
        const parts = a.description.split(".");
        const rolePart = parts.find((p: string) => p.toLowerCase().includes("vai trò:"));
        if (rolePart) role = rolePart.replace(/vai trò:/i, "").trim();
      }
      list.push({
        name: a.name,
        role: role,
        imageUrl: a.rootImageUrl || null,
        isCreated: true,
        assetId: a.id,
        tags: a.coreIdentity?.tags || []
      });
    });
    
    // Thêm các nhân vật định nghĩa trong World Bible mà chưa tạo asset trong DB (Bông, Cam, Tú, Mít...)
    bibleCharacters.forEach(bc => {
      const exists = list.some(item => item.name?.toLowerCase().trim() === bc.name?.toLowerCase().trim());
      if (!exists) {
        list.push({
          name: bc.name,
          role: bc.role || "Diễn viên phụ",
          imageUrl: null,
          isCreated: false,
          assetId: null,
          tags: []
        });
      }
    });
    
    return list;
  }, [dbCharacters, bibleCharacters]);

  // 2. DANH SÁCH BỐI CẢNH CHÍNH (LOCATIONS MOODBOARD)
  const locationsList = useMemo(() => {
    return dbAssetsList.filter(a => a.entityType === "location");
  }, [dbAssetsList]);

  // 3. DANH SÁCH ĐẠO CỤ CHÍNH (PROPS MOODBOARD)
  const propsList = useMemo(() => {
    return dbAssetsList.filter(a => a.entityType === "prop" || a.entityType === "item");
  }, [dbAssetsList]);

  // 4. TRÍCH XUẤT TÓM TẮT TẬP PHIM ĐANG CHỌN (LOGLINE)
  const episodeSummary = useMemo(() => {
    if (!selectedEpisode) return null;
    if (selectedEpisode.description) return selectedEpisode.description;
    
    // Nếu không có mô tả, lấy 2 dòng đầu kịch bản làm tóm tắt
    if (selectedEpisode.script) {
      const lines = selectedEpisode.script.split("\n").filter((l: string) => l.trim().length > 0);
      if (lines.length > 0) {
        return lines.slice(0, 2).join(" ");
      }
    }
    return "Chưa soạn thảo nội dung kịch bản cho tập phim này.";
  }, [selectedEpisode]);

  return (
    <div className="border border-white/5 rounded-3xl p-4 bg-white/[0.01] backdrop-blur-md flex flex-col h-full shadow-2xl justify-start space-y-4.5 font-sans overflow-y-auto custom-scrollbar">
      
      {/* 1. CINEMATIC PITCH BANNER (Căn lề trái hoàn toàn, tinh tế) */}
      <div className="relative bg-gradient-to-r from-purple-950/20 via-neutral-950/40 to-black/30 border border-white/5 p-3.5 rounded-2xl overflow-hidden shrink-0 flex flex-col items-start text-left shadow-md">
        <div className="absolute -left-10 -bottom-10 w-28 h-28 bg-purple-500/10 rounded-full blur-3xl pointer-events-none" />
        
        <div className="space-y-1 w-full">
          <div className="flex justify-between items-center w-full border-b border-white/5 pb-1.5 mb-1.5 shrink-0">
            <span className="flex items-center gap-1.5 text-purple-400 font-mono text-[8px] font-black uppercase tracking-widest">
              <Film className="w-3.5 h-3.5" /> Movie Pitch Deck
            </span>
            <button
              onClick={onOpenWorldBibleModal}
              className="bg-purple-655 hover:bg-purple-500 text-white border border-purple-500/30 px-3 py-1 rounded-lg text-[8.5px] font-black uppercase tracking-wider transition active:scale-95 cursor-pointer shadow shadow-purple-500/10"
            >
              📖 World Bible Studio
            </button>
          </div>
          
          <h2 className="text-sm font-black uppercase text-white tracking-wide">
            🎬 Phim: <span className="bg-gradient-to-r from-purple-400 via-pink-400 to-amber-400 bg-clip-text text-transparent">{projectName}</span>
          </h2>
          
          {bible?.coreIdentity?.tagline && (
            <p className="text-[9.5px] text-amber-355 italic font-bold leading-relaxed w-full line-clamp-1">
              &ldquo;{bible.coreIdentity.tagline}&rdquo;
            </p>
          )}

          {bible?.coreIdentity?.coreIpDescription && (
            <p className="text-[9px] text-neutral-450 leading-normal font-semibold w-full line-clamp-2 mt-0.5">
              {bible.coreIdentity.coreIpDescription}
            </p>
          )}
        </div>
      </div>

      {/* 2. TÓM TẮT TẬP PHIM ĐANG CHỌN (SELECTED EPISODE LOGLINE) */}
      {selectedEpisode && (
        <div className="bg-gradient-to-r from-purple-950/20 to-neutral-950/30 border border-purple-500/15 p-3 rounded-2xl shrink-0 space-y-1 animate-in fade-in duration-200">
          <span className="text-[8px] font-black text-amber-400 uppercase tracking-widest flex items-center gap-1">
            <Bookmark className="w-3 h-3 text-amber-455" /> Tóm tắt tập đang chọn ({selectedEpisode.title})
          </span>
          <p className="text-[9px] text-neutral-350 italic font-semibold leading-relaxed line-clamp-3">
            &ldquo;{episodeSummary}&rdquo;
          </p>
        </div>
      )}

      {/* 3. DÀN DIỄN VIÊN ĐẦY ĐỦ (CUỘN NGANG, CARD TO) */}
      <div className="flex flex-col space-y-2 shrink-0 border-t border-white/5 pt-3.5">
        <div className="flex justify-between items-center pb-0.5 shrink-0">
          <span className="text-[9px] font-black uppercase tracking-widest text-neutral-450 flex items-center gap-1.5">
            <Users className="w-3.5 h-3.5 text-purple-450" /> Dàn Cast Đầy Đủ Dự Án ({fullCastList.length})
          </span>
          <span className="text-[7.5px] text-neutral-550 font-mono">Cuộn ngang • Chọn nhân vật</span>
        </div>

        <div className="flex gap-3.5 overflow-x-auto py-1 pr-1 custom-scrollbar w-full items-stretch shrink-0">
          {fullCastList.map((char, index) => {
            const isSelected = selectedCharacterName?.toLowerCase().trim() === char.name?.toLowerCase().trim();
            return (
              <div
                key={index}
                onClick={() => onSelectCharacter(char.name)}
                className={`w-36 shrink-0 p-3 rounded-2xl border transition cursor-pointer flex flex-col justify-between group relative overflow-hidden shadow-md ${
                  isSelected
                    ? "bg-purple-900/20 border-purple-500/50 text-purple-300 shadow shadow-purple-500/5"
                    : "bg-black/35 border-white/5 hover:bg-white/[0.01] text-neutral-400 hover:text-neutral-200"
                }`}
              >
                <div className="space-y-2.5">
                  <div className="w-full aspect-square rounded-xl overflow-hidden bg-neutral-955 border border-white/5 relative flex items-center justify-center shadow-inner">
                    {char.imageUrl ? (
                      <img src={char.imageUrl} className="w-full h-full object-cover group-hover:scale-105 transition duration-300" alt={char.name} />
                    ) : (
                      <div className="text-[28px] select-none text-neutral-700">👤</div>
                    )}
                    {!char.isCreated && (
                      <span className="absolute top-1.5 right-1.5 bg-amber-500/10 border border-amber-500/20 text-amber-400 font-mono text-[6px] px-1 rounded-sm uppercase tracking-wider">
                        Draft
                      </span>
                    )}
                  </div>

                  <div className="space-y-0.5">
                    <span className="font-black text-[11px] text-white truncate block">{char.name}</span>
                    <p className="text-[8.5px] text-purple-355 font-mono truncate leading-normal">{char.role}</p>
                    {char.tags && char.tags.length > 0 && (
                      <div className="flex flex-wrap gap-1 mt-1">
                        {char.tags.map((tag: string, i: number) => (
                          <span key={i} className="text-[6.5px] bg-purple-500/20 text-purple-300 px-1 py-0.5 rounded border border-purple-500/30 uppercase tracking-wider">
                            {tag}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* 4. BỐI CẢNH CHÍNH & MOODBOARD (PHÓNG TO THÀNH CARD ĐỨNG GIỐNG CAST) */}
      <div className="flex flex-col space-y-2 border-t border-white/5 pt-3.5 shrink-0">
        <div className="flex justify-between items-center pb-0.5 shrink-0">
          <span className="text-[9px] font-black uppercase tracking-widest text-neutral-455 flex items-center gap-1.5">
            <MapPin className="w-3.5 h-3.5 text-blue-400" /> Bối Cảnh & Moodboard ({locationsList.length})
          </span>
          <span className="text-[7.5px] text-neutral-555 font-mono">Concept Locations</span>
        </div>

        <div className="flex gap-3.5 overflow-x-auto py-1 pr-1 custom-scrollbar w-full shrink-0 items-stretch">
          {locationsList.length === 0 ? (
            <div className="text-center py-10 text-[9.5px] text-neutral-600 italic border border-dashed border-white/5 rounded-2xl bg-black/10 w-full">
              Chưa có bối cảnh.
            </div>
          ) : (
            locationsList.map((loc, index) => (
              <div 
                key={index} 
                className="w-36 shrink-0 p-3 bg-black/35 border border-white/5 rounded-2xl flex flex-col justify-between group shadow-md"
              >
                <div className="space-y-2.5">
                  <div className="w-full aspect-square rounded-xl bg-neutral-955 border border-white/5 overflow-hidden flex items-center justify-center shrink-0 shadow-inner">
                    {loc.rootImageUrl ? (
                      <img src={loc.rootImageUrl} className="w-full h-full object-cover group-hover:scale-105 transition duration-350" alt={loc.name} />
                    ) : (
                      <MapPin className="w-7 h-7 text-neutral-750" />
                    )}
                  </div>
                  <div className="space-y-0.5">
                    <span className="text-[10.5px] font-black text-white truncate block">{loc.name}</span>
                    <span className="text-[7.5px] text-neutral-550 font-mono block truncate uppercase">{loc.slug || "Location"}</span>
                    {loc.coreIdentity?.tags && loc.coreIdentity.tags.length > 0 && (
                      <div className="flex flex-wrap gap-1 mt-1">
                        {loc.coreIdentity.tags.map((tag: string, i: number) => (
                          <span key={i} className="text-[6.5px] bg-blue-500/20 text-blue-300 px-1 py-0.5 rounded border border-blue-500/30 uppercase tracking-wider">
                            {tag}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* 5. ĐẠO CỤ CHÍNH & CONCEPT (PHÓNG TO THÀNH CARD ĐỨNG GIỐNG CAST) */}
      <div className="flex flex-col space-y-2 border-t border-white/5 pt-3.5 shrink-0">
        <div className="flex justify-between items-center pb-0.5 shrink-0">
          <span className="text-[9px] font-black uppercase tracking-widest text-neutral-455 flex items-center gap-1.5">
            <Gift className="w-3.5 h-3.5 text-amber-500" /> Đạo Cụ & Đồ Vật Concept ({propsList.length})
          </span>
          <span className="text-[7.5px] text-neutral-555 font-mono">Key Props</span>
        </div>

        <div className="flex gap-3.5 overflow-x-auto py-1 pr-1 custom-scrollbar w-full shrink-0 items-stretch">
          {propsList.length === 0 ? (
            <div className="text-center py-10 text-[9.5px] text-neutral-600 italic border border-dashed border-white/5 rounded-2xl bg-black/10 w-full">
              Chưa có đạo cụ.
            </div>
          ) : (
            propsList.map((prop, index) => (
              <div 
                key={index} 
                className="w-36 shrink-0 p-3 bg-black/35 border border-white/5 rounded-2xl flex flex-col justify-between group shadow-md"
              >
                <div className="space-y-2.5">
                  <div className="w-full aspect-square rounded-xl bg-neutral-955 border border-white/5 overflow-hidden flex items-center justify-center shrink-0 shadow-inner">
                    {prop.rootImageUrl ? (
                      <img src={prop.rootImageUrl} className="w-full h-full object-cover group-hover:scale-105 transition duration-350" alt={prop.name} />
                    ) : (
                      <Gift className="w-7 h-7 text-neutral-750" />
                    )}
                  </div>
                  <div className="space-y-0.5">
                    <span className="text-[10.5px] font-black text-white truncate block">{prop.name}</span>
                    <span className="text-[7.5px] text-neutral-550 font-mono block truncate uppercase">{prop.slug || "Prop"}</span>
                    {prop.coreIdentity?.tags && prop.coreIdentity.tags.length > 0 && (
                      <div className="flex flex-wrap gap-1 mt-1">
                        {prop.coreIdentity.tags.map((tag: string, i: number) => (
                          <span key={i} className="text-[6.5px] bg-amber-500/20 text-amber-300 px-1 py-0.5 rounded border border-amber-500/30 uppercase tracking-wider">
                            {tag}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
      
    </div>
  );
}
