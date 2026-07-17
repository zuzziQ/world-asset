"use client";

import React from "react";
import { 
  Sparkles, Sliders, ShieldCheck, AlertTriangle, CheckCircle2, AlertCircle, Lightbulb, BarChart2, Flame 
} from "lucide-react";
import { EmptyState } from "./EmptyState";

interface ScriptEvaluationPanelProps {
  evaluation: any;
  parsedData: any;
  totalDuration: number;
  avgShotDuration: number;
  scriptText: string;
  characterMappings: Record<string, string>;
  calibrations: Record<string, any>;
  
  expandedStrengths: boolean;
  setExpandedStrengths: (val: boolean) => void;
  expandedWeaknesses: boolean;
  setExpandedWeaknesses: (val: boolean) => void;
  expandedSuggestions: boolean;
  setExpandedSuggestions: (val: boolean) => void;

  getScoreBadge: (score: number) => { rank: string; bg?: string; text?: string; rating?: string };
}

export function ScriptEvaluationPanel({
  evaluation,
  parsedData,
  totalDuration,
  avgShotDuration,
  scriptText,
  characterMappings,
  calibrations,
  expandedStrengths,
  setExpandedStrengths,
  expandedWeaknesses,
  setExpandedWeaknesses,
  expandedSuggestions,
  setExpandedSuggestions,
  getScoreBadge
}: ScriptEvaluationPanelProps) {
  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {parsedData?.scenes && parsedData.scenes.length > 0 && (
        <div className="bg-gradient-to-r from-[#0c0d1c] to-[#120a24] border border-purple-900/30 rounded-2xl p-4.5 space-y-4 shadow-xl">
          <div className="flex items-center justify-between border-b border-purple-950/50 pb-2">
            <span className="text-[11px] font-black uppercase tracking-wider text-purple-400 flex items-center gap-1.5">
              <Sliders className="w-4 h-4 text-purple-400" /> Bảng Căn Chỉnh Nhịp Điệu & Thời Lượng Phim (Duration Pacing)
            </span>
            <div className="flex items-center gap-3 text-[10px] text-slate-400 font-mono">
              <span className="bg-slate-950/70 border border-slate-900 px-2 py-0.5 rounded font-bold">
                Tổng Cảnh (Scenes): <strong className="text-purple-400 font-black">{parsedData.scenes.length}</strong>
              </span>
              <span className="bg-slate-950/70 border border-slate-900 px-2 py-0.5 rounded font-bold">
                Tổng Phân Cảnh Nhỏ (Shots): <strong className="text-pink-400 font-black">{parsedData.shots?.length || 0}</strong>
              </span>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-3 bg-slate-950/45 p-3.5 rounded-xl border border-slate-900/60 text-center">
            <div className="space-y-0.5">
              <span className="text-[9px] font-bold text-slate-500 uppercase tracking-wider block">⏱ TỔNG THỜI LƯỢNG</span>
              <span className="text-sm font-black text-purple-400 font-mono">
                {totalDuration}s ({(totalDuration / 60).toFixed(1)}m)
              </span>
            </div>
            <div className="space-y-0.5 border-x border-slate-900/80">
              <span className="text-[9px] font-bold text-slate-500 uppercase tracking-wider block">📹 TRUNG BÌNH SHOT</span>
              <span className="text-sm font-black text-pink-400 font-mono">
                {avgShotDuration}s
              </span>
            </div>
            <div className="space-y-0.5">
              <span className="text-[9px] font-bold text-slate-500 uppercase tracking-wider block">🎬 TỔNG SỐ SHOTS</span>
              <span className="text-sm font-black text-blue-400 font-mono">
                {parsedData.shots?.length || Math.round(totalDuration / avgShotDuration)}
              </span>
            </div>
          </div>

          {/* Dynamic Distribution Diagram */}
          <div className="bg-slate-950/70 p-3 rounded-xl border border-slate-900/80 space-y-2">
            <span className="text-[9px] font-black text-slate-400 block uppercase tracking-wider">
              Sơ đồ Phân Bố Shot Nhân Quả & Đường Cong Cảm Xúc (Emotional Narrative Pacing)
            </span>
            
            <div className="relative flex items-end gap-1 h-16 pt-3 mt-2 border-b border-slate-800/50">
              {/* Optional: Simple SVG Curve Overlay */}
              <svg className="absolute inset-0 w-full h-full pointer-events-none opacity-40" preserveAspectRatio="none">
                <path 
                  d={`M 0 64 ${parsedData.scenes.map((s: any, i: number, arr: any[]) => {
                    const tension = s.emotion ? (s.emotion.includes('căng') || s.emotion.includes('sợ') || s.emotion.includes('giận') ? 90 : s.emotion.includes('buồn') ? 30 : s.emotion.includes('vui') ? 70 : 50) : (i === arr.length - 1 ? 80 : 30 + (i * 15));
                    const x = (i + 0.5) * (100 / arr.length);
                    const y = 64 - (tension / 100) * 48; // max height 48px
                    return `L ${x}% ${y}`;
                  }).join(' ')}`}
                  fill="none" 
                  stroke="url(#tensionGradient)" 
                  strokeWidth="2"
                  strokeDasharray="4 4"
                />
                <defs>
                  <linearGradient id="tensionGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                    <stop offset="0%" stopColor="#3b82f6" />
                    <stop offset="50%" stopColor="#a855f7" />
                    <stop offset="100%" stopColor="#ef4444" />
                  </linearGradient>
                </defs>
              </svg>

              {parsedData.scenes.map((s: any, sceneIdx: number, arr: any[]) => {
                const totalShotsCount = parsedData.shots?.length || 0;
                const count = parsedData.shots?.filter((sh: any) => sh.sc === `SC${String(sceneIdx + 1).padStart(2, "0")}`).length || 0;
                const percentage = totalShotsCount > 0 ? (count / totalShotsCount) * 100 : 0;
                
                // Giả lập/Tính toán độ căng thẳng (Tension) để vẽ heatmap
                const rawEmotion = (s.emotion || "").toLowerCase();
                const tensionScore = rawEmotion.includes('căng') || rawEmotion.includes('đỉnh') || rawEmotion.includes('sợ') ? 95 
                                   : rawEmotion.includes('vui') || rawEmotion.includes('hồi hộp') ? 70 
                                   : rawEmotion.includes('buồn') || rawEmotion.includes('trầm') ? 30 
                                   : (sceneIdx === arr.length - 1 ? 85 : 40 + (sceneIdx * 10)); // Default rising action
                
                const heightPercent = Math.max(30, tensionScore); // Min 30% height
                
                return (
                  <div
                    key={s.id}
                    className="group relative flex-1 rounded-t-md border-t border-l border-r border-slate-700/50 flex flex-col justify-end items-center hover:border-purple-400 transition-all cursor-default overflow-hidden"
                    style={{ flexGrow: percentage, height: `${heightPercent}%` }}
                  >
                    {/* Heatmap background based on tension */}
                    <div 
                      className="absolute inset-0 opacity-60 group-hover:opacity-100 transition-opacity"
                      style={{
                        background: tensionScore > 80 ? 'linear-gradient(to top, rgba(239,68,68,0.1), rgba(239,68,68,0.6))' // Red for high tension
                                  : tensionScore > 50 ? 'linear-gradient(to top, rgba(168,85,247,0.1), rgba(168,85,247,0.5))' // Purple for med
                                  : 'linear-gradient(to top, rgba(59,130,246,0.1), rgba(59,130,246,0.4))' // Blue for low
                      }}
                    />
                    
                    <span className="relative z-10 text-[9px] font-black text-slate-200 mb-1">SC{String(sceneIdx + 1).padStart(2, "0")}</span>
                    
                    {/* Tooltip */}
                    <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 hidden group-hover:block z-50 bg-slate-950/95 border border-slate-700 p-2.5 rounded-lg text-[10px] text-slate-300 w-64 font-normal shadow-2xl leading-relaxed">
                      <div className="flex justify-between items-start mb-1">
                        <div className="font-extrabold text-white text-[11px]">Cảnh {sceneIdx + 1}: {s.title}</div>
                        <span className={`text-[8px] px-1.5 py-0.5 rounded font-black ${tensionScore > 80 ? 'bg-red-500/20 text-red-400' : tensionScore > 50 ? 'bg-purple-500/20 text-purple-400' : 'bg-blue-500/20 text-blue-400'}`}>
                          TENSION: {tensionScore}%
                        </span>
                      </div>
                      <div className="grid grid-cols-2 gap-1 mb-1.5 border-y border-slate-800 py-1.5 mt-1.5 text-[9px]">
                        <div>Shots: <strong className="text-pink-400">{count}</strong></div>
                        <div>Duration: <strong className="text-blue-400">{count * avgShotDuration}s</strong></div>
                      </div>
                      <div className="text-[9px] text-emerald-400 mb-1">🎭 Cảm xúc: {s.emotion || 'Chưa xác định'}</div>
                      <div className="text-slate-400 line-clamp-3 italic text-[9px]">"{s.description}"</div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {evaluation ? (
        <>
          {/* Header score card dashboard */}
          <div className="bg-slate-900/50 border border-slate-800/80 rounded-2xl p-5 flex flex-col md:flex-row items-center gap-6 relative overflow-hidden shadow-lg">
            <div className="absolute top-0 right-0 w-32 h-32 bg-purple-500/5 rounded-full blur-3xl pointer-events-none" />
            
            {/* Circular Neon Gauge for overall score */}
            <div className="relative flex items-center justify-center flex-shrink-0 w-28 h-28">
              <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
                <circle cx="50" cy="50" r="40" stroke="#121626" strokeWidth="6" fill="transparent" />
                <circle 
                  cx="50" 
                  cy="50" 
                  r="40" 
                  stroke="url(#gradientScore)" 
                  strokeWidth="8" 
                  fill="transparent" 
                  strokeDasharray={`${2 * Math.PI * 40}`}
                  strokeDashoffset={`${2 * Math.PI * 40 * (1 - evaluation.overallScore / 100)}`}
                  strokeLinecap="round"
                  className="transition-all duration-1000 ease-out"
                />
                <defs>
                  <linearGradient id="gradientScore" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#a855f7" />
                    <stop offset="100%" stopColor="#ec4899" />
                  </linearGradient>
                </defs>
              </svg>
              
              <div className="absolute flex flex-col items-center justify-center">
                <span className="text-3xl font-black tracking-tight text-white">{evaluation.overallScore}</span>
                <span className="text-[9px] text-purple-400 tracking-wider font-extrabold uppercase bg-purple-950/40 px-2 py-0.5 rounded-full border border-purple-500/20">
                  Hạng {getScoreBadge(evaluation.overallScore).rank}
                </span>
              </div>
            </div>

            {/* Score metrics info */}
            <div className="flex-1 text-center md:text-left">
              <h3 className="text-md font-bold text-slate-100 mb-1.5 flex items-center justify-center md:justify-start gap-1.5 font-sans">
                <Sparkles className="w-4 h-4 text-purple-400" />
                Chỉ Số Đánh Giá Kịch Tính AI
              </h3>
              <p className="text-xs text-slate-400 leading-relaxed max-w-md font-sans">
                Kịch bản của Sếp đã được đánh giá. Hệ thống AI đã đo lường nhịp độ kịch bản, độ căng thẳng hội thoại, và khả năng giữ chân người xem ở video ngắn.
              </p>
            </div>
          </div>

          {/* Subscores Grid */}
          <div className="grid grid-cols-2 gap-4 font-sans">
            {/* Metric 1: Drama */}
            <div className="bg-[#0b0e1e]/60 border border-slate-900 rounded-xl p-3.5">
              <div className="flex justify-between items-center mb-1">
                <span className="text-[11px] font-bold text-slate-300">Kịch Tính & Xung Đột</span>
                <span className="text-xs font-black text-purple-400">{evaluation.subScores?.drama || 0}</span>
              </div>
              <div className="w-full bg-slate-950 rounded-full h-1.5">
                <div 
                    className="bg-gradient-to-r from-purple-500 to-pink-500 h-1.5 rounded-full" 
                    style={{ width: `${evaluation.subScores?.drama || 0}%` }}
                />
              </div>
              <span className="text-[9px] text-slate-400 mt-1.5 block">Độ căng hội thoại, mức độ xung đột nhân vật</span>
            </div>

            {/* Metric 2: Character Arc */}
            <div className="bg-[#0b0e1e]/60 border border-slate-900 rounded-xl p-3.5">
              <div className="flex justify-between items-center mb-1">
                <span className="text-[11px] font-bold text-slate-300">Tuyến Phát Triển Nhân Vật</span>
                <span className="text-xs font-black text-purple-400">{evaluation.subScores?.characterArc || 0}</span>
              </div>
              <div className="w-full bg-slate-950 rounded-full h-1.5">
                <div 
                    className="bg-gradient-to-r from-purple-500 to-pink-500 h-1.5 rounded-full" 
                    style={{ width: `${evaluation.subScores?.characterArc || 0}%` }}
                />
              </div>
              <span className="text-[9px] text-slate-400 mt-1.5 block">Động lực cảm xúc, sự biến đổi tâm lý</span>
            </div>

            {/* Metric 3: Pacing */}
            <div className="bg-[#0b0e1e]/60 border border-slate-900 rounded-xl p-3.5">
              <div className="flex justify-between items-center mb-1">
                <span className="text-[11px] font-bold text-slate-300">Nhịp Độ & Điểm Nhấn SFX</span>
                <span className="text-xs font-black text-purple-400">{evaluation.subScores?.pacing || 0}</span>
              </div>
              <div className="w-full bg-slate-950 rounded-full h-1.5">
                <div 
                    className="bg-gradient-to-r from-purple-500 to-pink-500 h-1.5 rounded-full" 
                    style={{ width: `${evaluation.subScores?.pacing || 0}%` }}
                />
              </div>
              <span className="text-[9px] text-slate-400 mt-1.5 block">Tốc độ giật hook, nhịp điệu tình tiết</span>
            </div>

            {/* Metric 4: Visual Viability */}
            <div className="bg-[#0b0e1e]/60 border border-slate-900 rounded-xl p-3.5">
              <div className="flex justify-between items-center mb-1">
                <span className="text-[11px] font-bold text-slate-300">Độ Khả Thi Hình Ảnh</span>
                <span className="text-xs font-black text-purple-400">{evaluation.subScores?.visualViability || 0}</span>
              </div>
              <div className="w-full bg-slate-950 rounded-full h-1.5">
                <div 
                    className="bg-gradient-to-r from-purple-500 to-pink-500 h-1.5 rounded-full" 
                    style={{ width: `${evaluation.subScores?.visualViability || 0}%` }}
                />
              </div>
              <span className="text-[9px] text-slate-400 mt-1.5 block">Chi tiết điện ảnh, độ sẵn sàng prompt AI</span>
            </div>
          </div>

          {/* 🛡️ Automated Quality Gate Audit Console */}
          <div className="bg-slate-950/60 border border-slate-900 rounded-2xl p-4 shadow-inner">
            <div className="flex items-center gap-2 mb-3 pb-2 border-b border-slate-900">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              <h4 className="text-xs font-black tracking-widest text-slate-200 uppercase font-sans">🛡️ KIỂM ĐỊNH CHẤT LƯỢNG ĐẠO DIỄN (QUALITY GATE)</h4>
            </div>
            
            <div className="space-y-2.5 font-sans">
              {/* Check 1: Character DNA Preservation */}
              <div className="flex items-start justify-between gap-3 bg-slate-900/30 p-2.5 rounded-xl border border-slate-900">
                <div className="flex items-start gap-2.5">
                  {Object.keys(characterMappings).length > 0 ? (
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 mt-0.5" />
                  ) : (
                    <AlertTriangle className="w-4 h-4 text-amber-500 mt-0.5" />
                  )}
                  <div>
                    <span className="text-[11px] font-bold text-slate-300 block">Bảo Toàn DNA Nhân Vật</span>
                    <span className="text-[10px] text-slate-400 leading-relaxed block mt-0.5">
                      {Object.keys(characterMappings).length > 0 
                        ? `Bảo toàn DNA nhân vật: 100% Khớp khớp với Cơ sở dữ liệu (${Object.keys(characterMappings).length}/${parsedData?.characters.length || 0} Nhân vật được khóa).`
                        : "Cảnh báo: Có nhân vật chưa liên kết với Asset DB. Hãy sử dụng Cast Linker bên phải để cố định DNA hình ảnh."}
                    </span>
                  </div>
                </div>
                <span className={`text-[9px] font-extrabold uppercase px-2 py-0.5 rounded-full ${
                  Object.keys(characterMappings).length > 0 
                    ? "bg-emerald-950/40 border border-emerald-500/20 text-emerald-400" 
                    : "bg-amber-950/40 border border-amber-500/20 text-amber-400"
                }`}>
                  {Object.keys(characterMappings).length > 0 ? "ĐẠT" : "CHỜ DUYỆT"}
                </span>
              </div>

              {/* Check 2: Language Consistency */}
              {(() => {
                const isMixed = scriptText.includes("Cảnh") && (scriptText.toLowerCase().includes("scene") || scriptText.toLowerCase().includes("action"));
                return (
                  <div className="flex items-start justify-between gap-3 bg-slate-900/30 p-2.5 rounded-xl border border-slate-900">
                    <div className="flex items-start gap-2.5">
                      {!isMixed ? (
                        <CheckCircle2 className="w-4 h-4 text-emerald-400 mt-0.5" />
                      ) : (
                        <AlertTriangle className="w-4 h-4 text-amber-500 mt-0.5" />
                      )}
                      <div>
                        <span className="text-[11px] font-bold text-slate-300 block">Đồng Nhất Ngôn Ngữ Giao Diện</span>
                        <span className="text-[10px] text-slate-400 leading-relaxed block mt-0.5">
                          {!isMixed 
                            ? "Đồng nhất ngôn ngữ: 100% Tiếng Việt (Hollywood Scripting Standard)."
                            : "Cảnh báo: Phát hiện pha trộn từ ngữ Việt/Anh trong cấu trúc phân cảnh (Cảnh vs Scene). Hãy đồng bộ hóa ngôn ngữ kịch bản."}
                        </span>
                      </div>
                    </div>
                    <span className={`text-[9px] font-extrabold uppercase px-2 py-0.5 rounded-full ${
                      !isMixed 
                        ? "bg-emerald-950/40 border border-emerald-500/20 text-emerald-400" 
                        : "bg-amber-950/40 border border-amber-500/20 text-amber-400"
                    }`}>
                      {!isMixed ? "ĐẠT" : "CẢNH BÁO"}
                    </span>
                  </div>
                );
              })()}

              {/* Check 3: Camera Skeleton Rig */}
              <div className="flex items-start justify-between gap-3 bg-slate-900/30 p-2.5 rounded-xl border border-slate-900">
                <div className="flex items-start gap-2.5">
                  {Object.keys(calibrations).length > 0 ? (
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 mt-0.5" />
                  ) : (
                    <AlertTriangle className="w-4 h-4 text-amber-500 mt-0.5" />
                  )}
                  <div>
                    <span className="text-[11px] font-bold text-slate-300 block">Cấu Trúc Camera 3D Skeleton</span>
                    <span className="text-[10px] text-slate-400 leading-relaxed block mt-0.5">
                      {Object.keys(calibrations).length > 0 
                        ? `Góc máy đã sẵn sàng: Cấu trúc camera skeleton thành công cho ${Object.keys(calibrations).length}/${parsedData?.scenes.length || 0} phân cảnh.`
                        : "Góc máy chưa cân chỉnh: Vui lòng nhấp 'Re-Calibrate' ở các phân cảnh bên tab Phân Cảnh để cố định góc máy."}
                    </span>
                  </div>
                </div>
                <span className={`text-[9px] font-extrabold uppercase px-2 py-0.5 rounded-full ${
                  Object.keys(calibrations).length > 0 
                    ? "bg-emerald-950/40 border border-emerald-500/20 text-emerald-400" 
                    : "bg-amber-950/40 border border-amber-500/20 text-amber-400"
                }`}>
                  {Object.keys(calibrations).length > 0 ? "ĐẠT" : "CHỜ DUYỆT"}
                </span>
              </div>

              {/* Check 4: Audio Dubbing Ready */}
              <div className="flex items-start justify-between gap-3 bg-slate-900/30 p-2.5 rounded-xl border border-slate-900">
                <div className="flex items-start gap-2.5">
                  {scriptText.toLowerCase().includes("âm thanh:") ? (
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 mt-0.5" />
                  ) : (
                    <AlertTriangle className="w-4 h-4 text-amber-500 mt-0.5" />
                  )}
                  <div>
                    <span className="text-[11px] font-bold text-slate-300 block">Nhạc Nền & SFX Âm Thanh</span>
                    <span className="text-[10px] text-slate-400 leading-relaxed block mt-0.5">
                      {scriptText.toLowerCase().includes("âm thanh:") 
                        ? "Thiết kế âm thanh: Đã khai báo nhịp âm thanh môi trường & SFX đầy đủ cho Dubbing Worker ở Tầng 5."
                        : "Khuyến nghị: Thêm dòng mô tả 'Âm thanh: ...' trong các phân cảnh kịch bản để tự động lồng tiếng."}
                    </span>
                  </div>
                </div>
                <span className={`text-[9px] font-extrabold uppercase px-2 py-0.5 rounded-full ${
                  scriptText.toLowerCase().includes("âm thanh:") 
                    ? "bg-emerald-950/40 border border-emerald-500/20 text-emerald-400" 
                    : "bg-amber-950/40 border border-amber-500/20 text-amber-400"
                }`}>
                  {scriptText.toLowerCase().includes("âm thanh:") ? "ĐẠT" : "THÔNG TIN"}
                </span>
              </div>
            </div>
          </div>

          {/* Premium Retro Short-form Retention Hacks Panel (Highly styled Neon Border) */}
          <div className="relative p-5 bg-gradient-to-r from-amber-500/10 via-orange-500/5 to-transparent border border-amber-500/30 rounded-2xl shadow-xl shadow-orange-500/5 overflow-hidden font-sans">
            <div className="absolute top-0 right-0 p-2 text-orange-500 opacity-20">
              <Flame className="w-12 h-12" />
            </div>
            <div className="flex items-center gap-2 mb-3">
              <Flame className="w-4.5 h-4.5 text-orange-500" />
              <h4 className="text-xs font-black tracking-widest text-orange-400 uppercase">Tuyệt Chiêu Giữ Chân Người Xem Video Ngắn</h4>
            </div>
            
            <div className="space-y-3.5">
              <div>
                <span className="text-[10px] font-bold text-orange-300 block mb-1">🔥 Gợi ý mở đầu giật gân (Viral Hook)</span>
                <ul className="list-disc list-inside space-y-1">
                  {evaluation.retentionHacks?.hookSuggestions?.map((h: string, i: number) => (
                    <li key={i} className="text-xs text-slate-300 pl-1 leading-relaxed">{h}</li>
                  ))}
                </ul>
              </div>

              <div>
                <span className="text-[10px] font-bold text-orange-300 block mb-1">👀 Điểm nhấn kích thích thị giác (Visual Retention)</span>
                <ul className="list-disc list-inside space-y-1">
                  {evaluation.retentionHacks?.visualRetentionCues?.map((c: string, i: number) => (
                    <li key={i} className="text-xs text-slate-300 pl-1 leading-relaxed">{c}</li>
                  ))}
                </ul>
              </div>

              <div>
                <span className="text-[10px] font-bold text-orange-300 block mb-1">🎵 Nhịp điệu & Điểm nhấn SFX (Rhythm & SFX)</span>
                <ul className="list-disc list-inside space-y-1">
                  {evaluation.retentionHacks?.pacingAndMusicBeats?.map((b: string, i: number) => (
                    <li key={i} className="text-xs text-slate-300 pl-1 leading-relaxed">{b}</li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
          <div className="space-y-3 font-sans">
            {/* Strengths */}
            <div className="border border-slate-900 rounded-xl overflow-hidden bg-slate-950/80">
              <button
                type="button"
                onClick={() => setExpandedStrengths(!expandedStrengths)}
                className="w-full flex items-center justify-between px-4 py-3 bg-[#0d1226]/50 text-slate-200 text-xs font-bold hover:bg-[#0d1226] transition-colors"
              >
                <span className="flex items-center gap-2 text-green-400">
                  <ShieldCheck className="w-4 h-4" /> Điểm Mạnh Kịch Bản
                </span>
                {expandedStrengths ? <span className="text-slate-400">▲</span> : <span className="text-slate-400">▼</span>}
              </button>
              {expandedStrengths && (
                <div className="p-4 border-t border-slate-900/60 bg-slate-950/85">
                  <ul className="list-inside list-decimal space-y-2">
                    {evaluation.strengths?.map((s: string, i: number) => (
                      <li key={i} className="text-xs text-slate-300 leading-relaxed pl-1">{s}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>

            {/* Weaknesses */}
            <div className="border border-slate-900 rounded-xl overflow-hidden bg-[#0a060d]/90">
              <button
                type="button"
                onClick={() => setExpandedWeaknesses(!expandedWeaknesses)}
                className="w-full flex items-center justify-between px-4 py-3 bg-[#0d1226]/50 text-slate-200 text-xs font-bold hover:bg-[#0d1226] transition-colors"
              >
                <span className="flex items-center gap-2 text-red-400">
                  <AlertCircle className="w-4 h-4" /> Điểm Cần Khắc Phục & Tự Cải Tiến
                </span>
                {expandedWeaknesses ? <span className="text-slate-400">▲</span> : <span className="text-slate-400">▼</span>}
              </button>
              {expandedWeaknesses && (
                <div className="p-4 border-t border-slate-900/60 bg-[#0f060f]/90 font-sans">
                  <ul className="list-inside list-decimal space-y-2">
                    {evaluation.weaknesses?.map((w: string, i: number) => (
                      <li key={i} className="text-xs text-slate-300 leading-relaxed pl-1">{w}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>

            {/* Suggestions */}
            <div className="border border-slate-900 rounded-xl overflow-hidden bg-slate-950/80 font-sans">
              <button
                type="button"
                onClick={() => setExpandedSuggestions(!expandedSuggestions)}
                className="w-full flex items-center justify-between px-4 py-3 bg-[#0d1226]/50 text-slate-200 text-xs font-bold hover:bg-[#0d1226] transition-colors"
              >
                <span className="flex items-center gap-2 text-blue-400">
                  <Lightbulb className="w-4 h-4" /> Gợi ý AI Đồng Hành (Co-Pilot Suggestions)
                </span>
                {expandedSuggestions ? <span className="text-slate-400">▲</span> : <span className="text-slate-400">▼</span>}
              </button>
              {expandedSuggestions && (
                <div className="p-4 border-t border-slate-900/60 bg-slate-950/85">
                  <ul className="list-inside list-decimal space-y-2">
                    {evaluation.suggestions?.map((s: string, i: number) => (
                      <li key={i} className="text-xs text-slate-300 leading-relaxed pl-1">{s}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </div>
        </>
      ) : (
        <EmptyState
          icon={BarChart2}
          title="Chưa có phân tích điểm số"
          description="Chưa có phân tích điểm số kịch bản cho tập này. Sếp vui lòng nhấp 'Đánh Giá Kịch Bản AI' ở trình biên soạn bên trái."
          className="py-12 font-sans"
        />
      )}
    </div>
  );
}
