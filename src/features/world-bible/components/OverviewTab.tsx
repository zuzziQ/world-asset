"use client";

import React, { useMemo } from "react";
import { Film, Users, Play, HelpCircle, ArrowRight, Sparkles, BookOpen, Clapperboard, Award } from "lucide-react";
import { WorldBible } from "../schema";

interface OverviewTabProps {
  bible: WorldBible;
  projectName: string;
  dbAssetsList: any[];
  onSwitchTab: (tabId: string) => void;
}

export default function OverviewTab({ bible, projectName, dbAssetsList, onSwitchTab }: OverviewTabProps) {
  // Lấy ra danh sách nhân vật
  const characters = bible.peerGroup?.characters || [];

  // So khớp ảnh của nhân vật từ dbAssetsList dựa trên tên
  const castList = useMemo(() => {
    return characters.map(char => {
      const asset = dbAssetsList.find(a => 
        (a.entityType === "character" || !a.entityType) && 
        a.name?.toLowerCase().trim() === char.name?.toLowerCase().trim()
      );
      return {
        ...char,
        imageUrl: asset?.rootImageUrl || null
      };
    });
  }, [characters, dbAssetsList]);

  return (
    <div className="space-y-6 animate-in fade-in duration-200 font-sans max-w-full overflow-hidden">
      {/* 1. CINEMATIC HERO BANNER */}
      <div className="relative bg-gradient-to-r from-purple-950/40 via-neutral-900/60 to-black/40 border border-white/5 rounded-2xl p-5 overflow-hidden shadow-xl">
        <div className="absolute -right-10 -bottom-10 w-40 h-40 bg-purple-500/10 rounded-full blur-3xl pointer-events-none" />
        
        <div className="space-y-2">
          <div className="flex items-center gap-1.5 text-purple-400 font-mono text-[8px] font-black uppercase tracking-widest">
            <Film className="w-3.5 h-3.5" /> Cinematic Pitch Deck
          </div>
          
          <h2 className="text-lg font-black uppercase text-white tracking-wide">
            Thế Giới Phim: <span className="bg-gradient-to-r from-purple-400 via-pink-400 to-amber-400 bg-clip-text text-transparent">{projectName}</span>
          </h2>
          
          {bible.coreIdentity?.tagline && (
            <p className="text-xs text-amber-350 italic font-bold leading-relaxed">
              &ldquo;{bible.coreIdentity.tagline}&rdquo;
            </p>
          )}

          {bible.coreIdentity?.coreIpDescription && (
            <p className="text-[10px] text-neutral-400 leading-relaxed max-w-xl font-medium mt-1">
              {bible.coreIdentity.coreIpDescription}
            </p>
          )}
        </div>
      </div>

      {/* 2. DÀN CAST NHÂN VẬT (THE CAST) */}
      <div className="space-y-3">
        <h3 className="text-xs font-black text-purple-400 uppercase tracking-widest flex items-center gap-1.5 border-b border-white/5 pb-1.5">
          <Users className="w-4 h-4 text-purple-400" /> Dàn Cast Diễn Viên (The Cast - {castList.length})
        </h3>

        {castList.length === 0 ? (
          <div className="text-center py-6 text-[9px] text-neutral-600 italic border border-dashed border-white/5 rounded-xl bg-black/10">
            Chưa thiết lập dàn Cast nhân vật. Hãy chọn tab Peers để thêm!
          </div>
        ) : (
          <div className="flex gap-4 overflow-x-auto py-1 pr-1 custom-scrollbar w-full items-stretch">
            {castList.map((char, index) => (
              <div 
                key={index} 
                className="w-40 shrink-0 bg-black/30 border border-white/5 p-3 rounded-xl flex flex-col justify-between hover:border-purple-500/20 transition group"
              >
                <div className="space-y-2">
                  {/* Ảnh đại diện nhân vật */}
                  <div className="aspect-square bg-neutral-950 border border-white/5 rounded-lg overflow-hidden flex items-center justify-center relative">
                    {char.imageUrl ? (
                      <img src={char.imageUrl} className="w-full h-full object-cover" alt={char.name} />
                    ) : (
                      <div className="text-[24px] select-none text-neutral-750 font-black">
                        👤
                      </div>
                    )}
                    <span className="absolute bottom-1.5 right-1.5 bg-black/75 border border-white/10 px-1.5 py-0.5 rounded text-[7.5px] font-black text-amber-500 font-mono">
                      CAST #{index + 1}
                    </span>
                  </div>

                  <div className="space-y-0.5">
                    <h4 className="font-black text-[11px] text-white truncate">{char.name}</h4>
                    {char.role && (
                      <p className="text-[8.5px] text-purple-300 font-mono truncate">{char.role}</p>
                    )}
                  </div>
                </div>

                <div className="mt-2.5 pt-2 border-t border-white/[0.03] space-y-1">
                  {char.attitude && (
                    <p className="text-[8px] text-neutral-400 line-clamp-2 leading-relaxed">
                      <span className="font-black text-neutral-500">Thái độ:</span> {char.attitude}
                    </p>
                  )}
                  {char.signatureProp && (
                    <p className="text-[8px] text-neutral-400 truncate">
                      <span className="font-black text-neutral-500">Đạo cụ:</span> {char.signatureProp}
                    </p>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* 3. TƯ DUY SẢN XUẤT & WORKFLOW (PIPELINE) */}
      <div className="space-y-3 bg-black/20 border border-white/5 p-4 rounded-xl">
        <h3 className="text-xs font-black text-amber-400 uppercase tracking-widest flex items-center gap-1.5 border-b border-white/5 pb-1.5">
          <Sparkles className="w-4 h-4 text-amber-400 animate-pulse" /> Quy Trình & Tư Duy Sản Xuất (Pipeline)
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-4 gap-3 text-[9px]">
          {[
            { 
              step: "B1", 
              name: "Cấu Trúc Thế Giới", 
              desc: "Định nghĩa triết lý cốt lõi (Identity), nghịch lý (Paradox), dàn Cast chính và quy tắc ngôn ngữ trên World Bible.",
              icon: BookOpen,
              color: "text-purple-400",
              tab: "identity"
            },
            { 
              step: "B2", 
              name: "Soạn Thảo Kịch Bản", 
              desc: "Viết kịch bản chi tiết, phân cảnh (Episodes & Scenes) ở cột giữa để làm chất liệu đầu vào cho AI.",
              icon: Film,
              color: "text-blue-400",
              tab: "identity"
            },
            { 
              step: "B3", 
              name: "Sinh Storyboard", 
              desc: "Gọi Flow Architect Engine để phân rã kịch bản chữ thành các khung hình vẽ visual chi tiết.",
              icon: Clapperboard,
              color: "text-pink-400",
              tab: "identity"
            },
            { 
              step: "B4", 
              name: "Đồng Bộ DNA Asset", 
              desc: "Lựa chọn các ảnh đẹp làm Master Reference để đồng bộ Letta Memory, đảm bảo tính nhất quán visual.",
              icon: Award,
              color: "text-amber-400",
              tab: "identity"
            }
          ].map((item, idx) => {
            const Icon = item.icon;
            return (
              <div key={idx} className="bg-neutral-950/60 border border-white/5 p-3 rounded-xl relative space-y-1.5">
                <span className="absolute top-2.5 right-2.5 text-[8px] font-black text-neutral-600 font-mono">{item.step}</span>
                <div className="flex items-center gap-1.5">
                  <Icon className={`w-3.5 h-3.5 ${item.color}`} />
                  <span className="font-black text-white">{item.name}</span>
                </div>
                <p className="text-[8.5px] text-neutral-500 leading-relaxed font-semibold">{item.desc}</p>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
