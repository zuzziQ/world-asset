"use client";

import React from "react";
import { BookOpen } from "lucide-react";
import WorldBibleMatrix from "@/features/world-bible/components/WorldBibleMatrix";

interface ProjectControlCenterProps {
  selectedProjectId: string;
  projectsList: any[];
  setProjectsList: React.Dispatch<React.SetStateAction<any[]>>;
  dbAssetsList: any[];
  setDbAssetsList: React.Dispatch<React.SetStateAction<any[]>>;
  loadData: (id?: string) => Promise<void>;
}

export default function ProjectControlCenter({
  selectedProjectId,
}: ProjectControlCenterProps) {
  return (
    <div className="border border-white/5 rounded-3xl p-6 bg-white/[0.01] backdrop-blur-md shadow-2xl flex flex-col h-full min-h-[400px] space-y-5 font-sans">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-3 border-b border-white/5 pb-3">
        <div>
          <h2 className="text-xs font-black uppercase tracking-widest text-neutral-300 flex items-center gap-2">
            <BookOpen className="w-4 h-4 text-purple-400" /> World Bible Matrix
          </h2>
          <p className="text-[10px] text-neutral-500 mt-0.5">Xây dựng ma trận thế giới, quy tắc kể chuyện và cốt truyện cốt lõi</p>
        </div>
      </div>

      {/* World Bible Content */}
      <div className="flex-1 w-full overflow-hidden flex flex-col">
        {selectedProjectId ? (
          <div className="flex-1 overflow-hidden">
            <WorldBibleMatrix projectId={selectedProjectId} hideHeader={true} />
          </div>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center text-center p-8 bg-black/10 border border-dashed border-white/5 rounded-3xl space-y-3 min-h-[300px]">
            <BookOpen className="w-12 h-12 text-neutral-700 animate-pulse" />
            <h3 className="text-xs font-black text-neutral-300 uppercase tracking-widest">Chưa chọn dự án</h3>
            <p className="text-[10px] text-neutral-500 mt-1 max-w-xs">Sếp vui lòng chọn một dự án ở cột bên trái để hiển thị World Bible Matrix.</p>
          </div>
        )}
      </div>
    </div>
  );
}
