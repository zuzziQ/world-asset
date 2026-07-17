"use client";

import React from "react";
import {
  Loader2,
  Sparkles,
  CheckCircle2,
  User,
  Check,
  Trash2,
  RefreshCw,
  Settings,
  Save,
  MapPin,
  Camera,
  Sliders,
  Plus,
  Layers,
  X,
  Maximize2,
  ExternalLink,
} from "lucide-react";
import { EmptyState } from "./EmptyState";

export interface ProjectAsset {
  id: string;
  name: string;
  entityType?: string;
  rarity?: string;
  rootImageUrl?: string;
  description: string;
  projectId?: string;
  styleGuide?: {
    referenceImageUrl?: string;
    angles?: Array<{ title: string; url: string }>;
  };
}

export interface DraftAsset {
  description: string;
  rootImageUrl?: string;
  isGeneratingImage?: boolean;
}

export interface AssetVariant {
  id?: string;
  driveUrl: string;
  tags?: string[];
}

export interface ParsedScriptData {
  characters: Array<{ id: string; name: string }>;
  locations: Array<{ id: string; name: string }>;
  props?: Array<{ id: string; name: string }>;
  scenes?: any[];
  shots?: any[];
  episodeId?: string;
}

interface AssetDnaPanelProps {
  parsedData: ParsedScriptData | null;
  characterMappings: Record<string, string>;
  setCharacterMappings: React.Dispatch<React.SetStateAction<Record<string, string>>>;
  projectAssets: ProjectAsset[];
  generatingAssets: Record<string, boolean>;
  draftAssets: Record<string, DraftAsset>;
  handleCancelDraftAsset: (name: string) => void;
  handleUpdateDraftDescription: (name: string, value: string) => void;
  handleRegenerateDraftAsset: (name: string, type: "character" | "location" | "prop") => void;
  handleConfirmDraftAsset: (name: string) => void;
  handleAutoGenerateAsset: (name: string, type: "character" | "location" | "prop") => void;
  getCleanDnaPrompt: (desc: string) => string;
  editingCharId: string | null;
  setEditingCharId: (id: string | null) => void;
  editingCharText: string;
  setEditingCharText: (text: string) => void;
  savingCharId: string | null;
  expandedCharIds: Record<string, boolean>;
  setExpandedCharIds: React.Dispatch<React.SetStateAction<Record<string, boolean>>>;
  handleSaveCharacterPrompt: (asset: ProjectAsset, prompt: string) => Promise<void> | void;
  loadingVariants: Record<string, boolean>;
  generatingVariantAssetId: string | null;
  handleSelectVariantAsPrimary: (assetId: string, url: string) => void;
  assetVariants: Record<string, AssetVariant[]>;
  variantModifiers: Record<string, string>;
  setVariantModifiers: React.Dispatch<React.SetStateAction<Record<string, string>>>;
  handleCreateVariant: (assetId: string) => void;
  variantErrors: Record<string, string>;
  environmentStyle: string;
  setEnvironmentStyle: (style: string) => void;
  locationMappings: Record<string, string>;
  setLocationMappings: React.Dispatch<React.SetStateAction<Record<string, string>>>;
  getAssetStyleGuide: (asset: ProjectAsset) => any;
  propMappings: Record<string, string>;
  setPropMappings: React.Dispatch<React.SetStateAction<Record<string, string>>>;
  handleBatchGenerateDrafts: () => void;
  batchGenerating: boolean;
  handleConfirmAllDrafts: () => void;
  batchProgressText: string;
  scriptText: string;
  setParsedData: React.Dispatch<React.SetStateAction<any>>;
}

const AssetDnaPanel: React.FC<AssetDnaPanelProps> = ({
  parsedData,
  characterMappings,
  setCharacterMappings,
  projectAssets,
  generatingAssets,
  draftAssets,
  handleCancelDraftAsset,
  handleUpdateDraftDescription,
  handleRegenerateDraftAsset,
  handleConfirmDraftAsset,
  handleAutoGenerateAsset,
  getCleanDnaPrompt,
  editingCharId,
  setEditingCharId,
  editingCharText,
  setEditingCharText,
  savingCharId,
  expandedCharIds,
  setExpandedCharIds,
  handleSaveCharacterPrompt,
  loadingVariants,
  generatingVariantAssetId,
  handleSelectVariantAsPrimary,
  assetVariants,
  variantModifiers,
  setVariantModifiers,
  handleCreateVariant,
  variantErrors,
  environmentStyle,
  setEnvironmentStyle,
  locationMappings,
  setLocationMappings,
  getAssetStyleGuide,
  propMappings,
  setPropMappings,
  handleBatchGenerateDrafts,
  batchGenerating,
  handleConfirmAllDrafts,
  batchProgressText,
  scriptText,
  setParsedData,
}) => {
  const [zoomImageUrl, setZoomImageUrl] = React.useState<string | null>(null);
  const [variantFeedbacks, setVariantFeedbacks] = React.useState<Record<string, string>>({});
  const [variantRefineStatus, setVariantRefineStatus] = React.useState<Record<string, string>>({});

  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setZoomImageUrl(null);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  if (!parsedData) {
    return (
      <EmptyState
        icon={Layers}
        title="Chưa có thông tin DNA Asset"
        description="Sếp vui lòng chạy Biên dịch kịch bản hoặc tải dữ liệu Demo để kích hoạt khóa DNA nhân vật & bối cảnh."
        className="py-12"
      />
    );
  }

  const unmappedChars = (parsedData.characters || []).filter((c: any) => !characterMappings[c.name]) || [];
  const unmappedLocs = (parsedData.locations || []).filter((l: any) => !locationMappings[l.name]) || [];
  const unmappedProps = (parsedData.props || []).filter((p: any) => !propMappings[p.name]) || [];
  const totalUnmapped = unmappedChars.length + unmappedLocs.length + unmappedProps.length;
  const hasDrafts = Object.keys(draftAssets).length > 0;

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      <div className="space-y-6">
        {/* Cast & Setting Grounding Board */}
        <div className="bg-slate-950/45 p-5 border border-slate-900 rounded-2xl">
          <div className="flex items-center justify-between mb-4 pb-2 border-b border-slate-900">
            <div>
              <h4 className="text-xs font-black tracking-widest text-slate-200 uppercase font-sans">
                🧬 BẢNG KHÓA DNA NHÂN VẬT & BỐI CẢNH
              </h4>
              <p className="text-[10px] text-slate-500 mt-0.5 font-sans">
                Cố định DNA nhân vật, bối cảnh & đạo cụ kịch bản với Asset Database
              </p>
            </div>
          </div>

          {/* Batch Draft Control & Staging Center */}
          {(totalUnmapped > 0 || hasDrafts) && (
            <div className="mb-5 p-4 rounded-xl bg-slate-900/50 border border-slate-800/80 font-sans space-y-3">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
                <div>
                  <span className="text-[10px] font-black text-amber-400 bg-amber-950/40 px-2 py-0.5 rounded border border-amber-500/20 font-mono uppercase tracking-wider">
                    Bảng Chờ Đồng Bộ Hàng Loạt
                  </span>
                  <h5 className="text-xs font-bold text-slate-200 mt-1">
                    Có <span className="text-amber-400 font-extrabold">{totalUnmapped}</span> tài nguyên chưa đồng bộ.
                    {hasDrafts && (
                      <span>
                        {" "}
                        Đang có <span className="text-purple-400 font-extrabold">{Object.keys(draftAssets).length}</span>{" "}
                        bản nháp chờ phê duyệt.
                      </span>
                    )}
                  </h5>
                  <p className="text-[10px] text-slate-500 leading-normal">
                    Thay vì tạo lẻ tẻ gây rác dữ liệu, đạo diễn có thể chạy tạo nháp toàn bộ, kiểm tra hình ảnh/mỹ thuật rồi
                    nhấn &quot;Duyệt & Đồng Bộ Tất Cả&quot; để nạp chính thức.
                  </p>
                </div>
                <div className="flex flex-wrap gap-2 shrink-0">
                  <button
                    type="button"
                    onClick={handleBatchGenerateDrafts}
                    disabled={batchGenerating}
                    className="py-1.5 px-3 bg-purple-600 hover:bg-purple-500 disabled:bg-slate-800 disabled:text-slate-600 text-white rounded-lg text-[10px] font-black uppercase tracking-wider transition-all shadow-md shadow-purple-600/10 active:scale-95 cursor-pointer flex items-center gap-1.5"
                  >
                    {batchGenerating ? (
                      <>
                        <Loader2 className="w-3.5 h-3.5 animate-spin" /> Đang xử lý...
                      </>
                    ) : (
                      <>
                        <Sparkles className="w-3.5 h-3.5" /> Tạo Nháp Toàn Bộ
                      </>
                    )}
                  </button>

                  <button
                    type="button"
                    onClick={handleConfirmAllDrafts}
                    disabled={batchGenerating || !hasDrafts}
                    className="py-1.5 px-3 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 disabled:from-slate-800 disabled:to-slate-900 disabled:text-slate-600 text-white rounded-lg text-[10px] font-black uppercase tracking-wider transition-all shadow-md shadow-emerald-500/10 active:scale-95 cursor-pointer flex items-center gap-1.5"
                  >
                    <CheckCircle2 className="w-3.5 h-3.5" /> Duyệt & Đồng Bộ Tất Cả
                  </button>
                </div>
              </div>

              {batchProgressText && (
                <div className="p-2 rounded bg-purple-950/20 border border-purple-500/15 text-[10px] text-purple-300 font-mono animate-pulse flex items-center gap-2">
                  <Loader2 className="w-3.5 h-3.5 animate-spin text-purple-400" />
                  {batchProgressText}
                </div>
              )}
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Character Mapping Board */}
            <div className="bg-[#0b0e1e]/60 border border-slate-900 rounded-xl p-4 font-sans">
              <div className="flex items-center gap-2 mb-3">
                <User className="w-4 h-4 text-purple-400" />
                <span className="text-xs font-bold text-slate-200">Liên kết DNA Nhân vật</span>
              </div>
              {parsedData.characters.length > 0 ? (
                <div className="space-y-3">
                  {parsedData.characters.map((char, index) => {
                    const mappedId = characterMappings[char.name] || "";
                    const matchedAsset = projectAssets.find((a) => a.id === mappedId);

                    return (
                      <div
                        key={char.id || index}
                        className="p-3 rounded-lg bg-slate-950/70 border border-slate-900/80 hover:border-purple-500/20 transition-all space-y-2"
                      >
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-bold text-purple-400">{char.name}</span>
                          {mappedId ? (
                            <span className="text-[9px] text-emerald-400 bg-emerald-950/40 px-1.5 py-0.5 rounded border border-emerald-500/20 flex items-center gap-1 font-mono">
                              <Check className="w-2.5 h-2.5" /> Đã Gắn DNA
                            </span>
                          ) : (
                            <span className="text-[9px] text-amber-400 bg-amber-950/40 px-1.5 py-0.5 rounded border border-amber-500/20 font-mono">
                              Chưa khóa
                            </span>
                          )}
                        </div>

                        {matchedAsset && (matchedAsset.styleGuide?.referenceImageUrl || matchedAsset.rootImageUrl) && (
                          <div
                            className="w-full h-36 rounded-lg overflow-hidden border border-purple-500/20 bg-slate-950 mt-1 relative group shrink-0 cursor-zoom-in"
                            title="Click để phóng to xem cho rõ"
                            onClick={() => setZoomImageUrl(matchedAsset.styleGuide?.referenceImageUrl || matchedAsset.rootImageUrl || null)}
                          >
                            <img
                              src={matchedAsset.styleGuide?.referenceImageUrl || matchedAsset.rootImageUrl}
                              alt={char.name}
                              className="w-full h-full object-contain transition-transform group-hover:scale-102"
                            />
                            <button
                              type="button"
                              className="absolute top-2 right-2 p-1.5 rounded-md bg-slate-900/80 hover:bg-purple-600/90 text-purple-300 hover:text-white border border-purple-500/30 opacity-0 group-hover:opacity-100 transition-opacity z-10"
                              onClick={(e) => {
                                e.stopPropagation();
                                setZoomImageUrl(matchedAsset.styleGuide?.referenceImageUrl || matchedAsset.rootImageUrl || null);
                              }}
                              title="Phóng to ảnh"
                            >
                              <Maximize2 className="w-3.5 h-3.5" />
                            </button>
                            <div className="absolute inset-x-0 bottom-0 bg-slate-950/80 p-1 text-[9px] font-bold text-center text-purple-300 group-hover:bg-slate-950 transition-colors">
                              Hình ảnh chân dung DNA (Xem full 🔍)
                            </div>
                          </div>
                        )}

                        <select
                          value={mappedId}
                          onChange={(e) =>
                            setCharacterMappings((prev) => ({ ...prev, [char.name]: e.target.value }))
                          }
                          className="w-full bg-slate-900 border border-slate-800 focus:border-purple-500/50 rounded-lg px-2 py-1 text-[11px] text-slate-300 outline-none transition-all font-sans"
                        >
                          <option value="">-- Chọn Nhân vật từ Asset Manager --</option>
                          {projectAssets
                            .filter((a) => a.entityType?.toLowerCase() === "character")
                            .map((a) => (
                              <option key={a.id} value={a.id}>
                                {a.name} ({a.rarity || "Standard Character"})
                              </option>
                            ))}
                        </select>

                        {!mappedId &&
                          (generatingAssets[char.name] ? (
                            <div className="w-full flex items-center justify-center gap-1.5 py-1.5 px-2 bg-purple-950/40 border border-purple-500/20 text-purple-400 rounded-lg text-[10px] font-medium font-sans animate-pulse">
                              <Loader2 className="w-3.5 h-3.5 animate-spin text-purple-400" />
                              Đang khởi tạo nhân vật...
                            </div>
                          ) : draftAssets[char.name] ? (
                            <div className="p-2.5 rounded-lg border border-purple-500/40 bg-purple-950/20 space-y-2 mt-1 font-sans">
                              <div className="flex items-center justify-between">
                                <span className="text-[10px] font-extrabold text-purple-300 tracking-wider font-mono">
                                  DRAFT / NHÁP CHỜ DUYỆT
                                </span>
                                <div className="flex items-center gap-1.5">
                                  <span className="text-[9px] text-amber-400 bg-amber-950/50 px-1.5 py-0.5 rounded border border-amber-500/20 animate-pulse font-mono font-bold">
                                    Chờ duyệt
                                  </span>
                                  <button
                                    type="button"
                                    onClick={(e) => { e.preventDefault(); e.stopPropagation(); handleCancelDraftAsset(char.name); }}
                                    className="p-1 text-rose-400 hover:text-rose-300 bg-rose-950/40 hover:bg-rose-900/40 rounded border border-rose-500/20 transition-all cursor-pointer"
                                    title="Hủy nháp & Hoàn tác"
                                  >
                                    <Trash2 className="w-3 h-3" />
                                  </button>
                                </div>
                              </div>
                              {(() => {
                                let imgUrl = draftAssets[char.name].rootImageUrl;
                                if (imgUrl && imgUrl.startsWith('["')) {
                                  try { imgUrl = JSON.parse(imgUrl)[0]; } catch (e) {}
                                }
                                return imgUrl ? (
                                  <div
                                    className="w-full h-36 rounded-lg overflow-hidden border border-purple-500/30 bg-slate-950 relative group cursor-zoom-in"
                                    title="Click để xem ảnh kích thước đầy đủ"
                                    onClick={() => window.open(imgUrl, "_blank")}
                                  >
                                    <img
                                      src={imgUrl}
                                      alt={char.name}
                                      className="w-full h-full object-contain transition-transform group-hover:scale-102"
                                    />
                                    <div className="absolute inset-x-0 bottom-0 bg-slate-950/80 p-1 text-[9px] font-bold text-center text-purple-300">
                                      Ảnh nháp (Xem full 🔍)
                                    </div>
                                  </div>
                                ) : null;
                              })()}
                              <textarea
                                value={draftAssets[char.name].description}
                                onChange={(e) => handleUpdateDraftDescription(char.name, e.target.value)}
                                className="w-full bg-[#0b0e1e]/60 p-2 rounded leading-relaxed border border-slate-900 focus:border-purple-500 text-[10px] text-slate-300 font-sans outline-none resize-none min-h-[48px]"
                                placeholder="Nhập mô tả / prompt cho nháp..."
                              />
                              <div className="flex items-center gap-2">
                                <button
                                  type="button"
                                  onClick={() => handleRegenerateDraftAsset(char.name, "character")}
                                  disabled={draftAssets[char.name].isGeneratingImage}
                                  className="flex-1 py-1.5 px-2 bg-purple-900/40 hover:bg-purple-800/40 border border-purple-500/30 text-purple-300 rounded-lg text-[10px] font-bold transition-all disabled:opacity-50 cursor-pointer flex items-center justify-center gap-1"
                                >
                                  <RefreshCw
                                    className={`w-3.5 h-3.5 ${draftAssets[char.name].isGeneratingImage ? "animate-spin" : ""}`}
                                  />
                                  {draftAssets[char.name].isGeneratingImage ? "Đang tạo..." : "Vẽ lại ảnh"}
                                </button>

                                <button
                                  type="button"
                                  onClick={() => handleConfirmDraftAsset(char.name)}
                                  className="flex-1 py-1.5 px-2 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 border border-emerald-500/30 text-white rounded-lg text-[10px] font-extrabold transition-all cursor-pointer flex items-center justify-center gap-1"
                                >
                                  <Check className="w-3.5 h-3.5" /> Xác Nhận
                                </button>
                              </div>
                            </div>
                          ) : (
                            <button
                              type="button"
                              onClick={() => handleAutoGenerateAsset(char.name, "character")}
                              className="w-full flex items-center justify-center gap-1.5 py-1 px-2 bg-purple-900/30 hover:bg-purple-600/40 border border-purple-500/30 text-purple-300 hover:text-white rounded-lg text-[10px] font-bold transition-all active:scale-95 cursor-pointer mt-1"
                            >
                              <Plus className="w-3 h-3" /> Tạo nhanh nhân vật [{char.name}]
                            </button>
                          ))}

                        {matchedAsset &&
                          (() => {
                            const cleanPrompt = getCleanDnaPrompt(matchedAsset.description);
                            const isEditing = editingCharId === matchedAsset.id;
                            const isExpanded = !!expandedCharIds[matchedAsset.id];

                            const maxChars = 100;
                            const isLong = cleanPrompt.length > maxChars;
                            const displayPrompt =
                              !isExpanded && isLong && !isEditing
                                ? cleanPrompt.slice(0, maxChars) + "..."
                                : cleanPrompt;

                            return (
                              <div className="mt-2 space-y-2 bg-[#0b0e1e]/40 p-2 rounded border border-slate-900/60 text-[11px] font-sans text-slate-300">
                                <div className="flex items-center justify-between text-[10px] font-bold text-slate-400 border-b border-slate-900/40 pb-1">
                                  <span>DNA Master Prompt</span>
                                  <div className="flex items-center gap-2">
                                    {!isEditing && (
                                      <button
                                        type="button"
                                        onClick={() => {
                                          setEditingCharId(matchedAsset.id);
                                          setEditingCharText(cleanPrompt);
                                        }}
                                        className="text-purple-400 hover:text-purple-300 transition-colors flex items-center gap-0.5"
                                      >
                                        <Settings className="w-3 h-3" /> Sửa
                                      </button>
                                    )}
                                    {isLong && !isEditing && (
                                      <button
                                        type="button"
                                        onClick={() =>
                                          setExpandedCharIds((prev) => ({
                                            ...prev,
                                            [matchedAsset.id]: !prev[matchedAsset.id],
                                          }))
                                        }
                                        className="text-slate-400 hover:text-slate-300 transition-colors"
                                      >
                                        {isExpanded ? "Thu gọn" : "Xem full"}
                                      </button>
                                    )}
                                  </div>
                                </div>

                                {isEditing ? (
                                  <div className="space-y-1.5">
                                    <textarea
                                      value={editingCharText}
                                      onChange={(e) => setEditingCharText(e.target.value)}
                                      className="w-full h-24 bg-slate-950 border border-slate-800 focus:border-purple-500/50 rounded p-1.5 text-[10px] text-slate-200 outline-none resize-none font-mono"
                                    />
                                    <div className="flex justify-end gap-1.5">
                                      <button
                                        type="button"
                                        onClick={() => setEditingCharId(null)}
                                        className="px-2 py-0.5 bg-slate-900 hover:bg-slate-800 text-slate-400 rounded text-[9px]"
                                      >
                                        Hủy
                                      </button>
                                      <button
                                        type="button"
                                        disabled={savingCharId === matchedAsset.id}
                                        onClick={() => handleSaveCharacterPrompt(matchedAsset, editingCharText)}
                                        className="px-2 py-0.5 bg-purple-600 hover:bg-purple-500 text-white rounded text-[9px] font-bold flex items-center gap-1"
                                      >
                                        {savingCharId === matchedAsset.id ? (
                                          <Loader2 className="w-2.5 h-2.5 animate-spin" />
                                        ) : (
                                          <Save className="w-2.5 h-2.5" />
                                        )}
                                        Lưu
                                      </button>
                                    </div>
                                  </div>
                                ) : (
                                  <p className="leading-relaxed italic whitespace-pre-wrap">
                                    {displayPrompt || "Chưa có prompt thiết kế Master."}
                                  </p>
                                )}
                              </div>
                            );
                          })()}

                        {matchedAsset && (
                          <div className="mt-3 border-t border-slate-900/60 pt-2 space-y-2 font-sans">
                            <div className="flex items-center justify-between">
                              <span className="text-[10px] font-bold text-purple-400">Album Biến Thể (Variants)</span>
                              {(loadingVariants[matchedAsset.id] || generatingVariantAssetId === matchedAsset.id) && (
                                <Loader2 className="w-3 h-3 animate-spin text-purple-500" />
                              )}
                            </div>

                            <div className="flex gap-1.5 overflow-x-auto pb-1 scrollbar-thin scrollbar-thumb-slate-800">
                              {matchedAsset.rootImageUrl && (
                                <div
                                  onClick={() => handleSelectVariantAsPrimary(matchedAsset.id, matchedAsset.rootImageUrl!)}
                                  className={`relative w-12 h-12 rounded border-2 cursor-pointer overflow-hidden shrink-0 group ${(matchedAsset.styleGuide?.referenceImageUrl || matchedAsset.rootImageUrl) === matchedAsset.rootImageUrl ? "border-purple-500" : "border-slate-880"}`}
                                  title="Ảnh gốc (Root)"
                                >
                                  <img src={matchedAsset.rootImageUrl} className="w-full h-full object-cover" />
                                  <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                                    <span className="text-[8px] bg-slate-800/80 text-white font-extrabold px-1 rounded">
                                      ROOT
                                    </span>
                                  </div>
                                </div>
                              )}

                              {assetVariants[matchedAsset.id]?.map((v, vIdx) => {
                                const currentRef = matchedAsset.styleGuide?.referenceImageUrl || matchedAsset.rootImageUrl;
                                const isMain = v.driveUrl === matchedAsset.rootImageUrl;
                                if (isMain) return null;
                                const isSelected = v.driveUrl === currentRef;
                                return (
                                  <div
                                    key={v.id || vIdx}
                                    onClick={() => handleSelectVariantAsPrimary(matchedAsset.id, v.driveUrl)}
                                    className={`relative w-12 h-12 rounded border cursor-pointer overflow-hidden shrink-0 group ${isSelected ? "border-purple-500 border-2" : "border-slate-800 hover:border-purple-500/50"}`}
                                    title={isSelected ? "Ảnh tham chiếu hiện tại" : "Click để chọn làm ảnh tham chiếu"}
                                  >
                                    <img
                                      src={v.driveUrl}
                                      className="w-full h-full object-cover transition-transform group-hover:scale-110"
                                    />
                                    {isSelected && (
                                      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                                        <span className="text-[8px] bg-purple-600 text-white font-extrabold px-1 rounded">
                                          REF
                                        </span>
                                      </div>
                                    )}
                                  </div>
                                );
                              })}

                              {(!assetVariants[matchedAsset.id] ||
                                assetVariants[matchedAsset.id].filter((v) => v.driveUrl !== matchedAsset.rootImageUrl)
                                  .length === 0) && <span className="text-[9px] text-slate-500 italic py-1">Chưa có biến thể phụ.</span>}
                            </div>

                            {(() => {
                              const currentRef = matchedAsset.styleGuide?.referenceImageUrl || matchedAsset.rootImageUrl;
                              const currentRefVariant = assetVariants[matchedAsset.id]?.find(v => v.driveUrl === currentRef);
                              const isRefSubVariant = currentRefVariant && currentRefVariant.driveUrl !== matchedAsset.rootImageUrl;
                              
                              if (!isRefSubVariant) return null;

                              return (
                                <div className="bg-slate-900/40 p-2 rounded border border-purple-500/20 space-y-1.5 mt-2 font-sans">
                                  <div className="flex items-center justify-between">
                                    <span className="text-[9px] text-purple-300 font-bold uppercase">💡 Tinh Chỉnh Biến Thể REF Hiện Tại</span>
                                    <button
                                      type="button"
                                      disabled={generatingVariantAssetId === matchedAsset.id}
                                      onClick={async () => {
                                        const feedback = variantFeedbacks[matchedAsset.id];
                                        if (!feedback || !feedback.trim()) {
                                          alert("Vui lòng nhập nhận xét tinh chỉnh!");
                                          return;
                                        }
                                        try {
                                          setVariantRefineStatus(prev => ({ ...prev, [matchedAsset.id]: "Refining..." }));
                                          
                                          // 1. Gấp Master Prompt + modifier cũ của variant làm originalPrompt
                                          const masterPrompt = getCleanDnaPrompt(matchedAsset.description);
                                          const originalPrompt = `${masterPrompt}. Variant details: ${currentRefVariant?.tags?.join(', ') || ""}`;
                                          
                                          // Gọi API refine-prompt qua helper trong src/lib/api.ts
                                          const { refinePromptWithAI } = await import("@/lib/api");
                                          const activeProjId = matchedAsset.projectId || "";
                                          
                                          const refined = await refinePromptWithAI(
                                            activeProjId,
                                            originalPrompt,
                                            feedback,
                                            'variant'
                                          );
                                          
                                          // Clear feedback và status
                                          setVariantFeedbacks(prev => ({ ...prev, [matchedAsset.id]: "" }));
                                          setVariantRefineStatus(prev => ({ ...prev, [matchedAsset.id]: "" }));
                                          
                                          // 2. Điền prompt tinh chỉnh mới vào variantModifiers và gọi tạo variant mới
                                          setVariantModifiers(prev => ({ ...prev, [matchedAsset.id]: refined }));
                                          
                                          setTimeout(() => {
                                            handleCreateVariant(matchedAsset.id);
                                          }, 100);
                                        } catch (err: any) {
                                          alert("Lỗi tinh chỉnh variant: " + err.message);
                                          setVariantRefineStatus(prev => ({ ...prev, [matchedAsset.id]: "" }));
                                        }
                                      }}
                                      className="px-2 py-0.5 bg-indigo-600/30 hover:bg-indigo-600 border border-indigo-500/30 text-indigo-300 hover:text-white rounded text-[9px] font-bold cursor-pointer transition-all flex items-center gap-1 shrink-0"
                                    >
                                      {generatingVariantAssetId === matchedAsset.id ? (
                                        <Loader2 className="w-2.5 h-2.5 animate-spin" />
                                      ) : (
                                        <Sparkles className="w-2.5 h-2.5" />
                                      )}
                                      Refine & Render
                                    </button>
                                  </div>
                                  <textarea
                                    value={variantFeedbacks[matchedAsset.id] || ""}
                                    onChange={(e) => setVariantFeedbacks(prev => ({ ...prev, [matchedAsset.id]: e.target.value }))}
                                    className="w-full bg-slate-950 border border-slate-900 focus:border-purple-500/50 rounded p-1.5 text-[10px] text-slate-300 outline-none placeholder:text-slate-600 resize-none h-11 leading-relaxed"
                                    placeholder="Ví dụ: Paco trông cần tức giận hơn và bối cảnh tối đi 50%..."
                                  />
                                  {variantRefineStatus[matchedAsset.id] && (
                                    <div className="text-[8px] text-purple-400 animate-pulse font-mono flex items-center gap-1">
                                      <Loader2 className="w-2.5 h-2.5 animate-spin text-purple-400" />
                                      {variantRefineStatus[matchedAsset.id]}
                                    </div>
                                  )}
                                </div>
                              );
                            })()}

                            <div className="space-y-1.5 pt-1">
                              <div className="flex gap-1">
                                <input
                                  type="text"
                                  placeholder="Mô tả biến thể (vd: vui vẻ, buồn...)"
                                  value={variantModifiers[matchedAsset.id] || ""}
                                  onChange={(e) =>
                                    setVariantModifiers((prev) => ({ ...prev, [matchedAsset.id]: e.target.value }))
                                  }
                                  className="flex-1 bg-slate-950 border border-slate-900 focus:border-purple-500/50 rounded px-1.5 py-0.5 text-[10px] text-slate-300 outline-none placeholder:text-slate-600 font-sans"
                                />
                                <button
                                  type="button"
                                  disabled={generatingVariantAssetId === matchedAsset.id}
                                  onClick={() => handleCreateVariant(matchedAsset.id)}
                                  className="px-2 py-0.5 bg-purple-900/60 hover:bg-purple-800/80 border border-purple-500/20 text-purple-300 hover:text-white rounded text-[10px] font-bold cursor-pointer transition-colors flex items-center gap-1 shrink-0 font-sans"
                                >
                                  {generatingVariantAssetId === matchedAsset.id ? (
                                    <Loader2 className="w-2.5 h-2.5 animate-spin" />
                                  ) : (
                                    <Sparkles className="w-2.5 h-2.5" />
                                  )}
                                  Tạo
                                </button>
                              </div>
                              {generatingVariantAssetId === matchedAsset.id && (
                                <div className="text-[8px] text-purple-400 animate-pulse font-mono flex items-center gap-1">
                                  <Loader2 className="w-2.5 h-2.5 animate-spin" />
                                  Hệ thống đang sinh ảnh grid 2x2 trong 1-2 phút...
                                </div>
                              )}
                              {variantErrors[matchedAsset.id] && (
                                <div className="text-[9px] text-red-400 font-mono bg-red-950/40 border border-red-500/20 rounded p-1.5 flex flex-col gap-1.5 mt-1">
                                  <div className="flex items-start gap-1">
                                    <span className="font-bold text-red-500 shrink-0">[Lỗi]:</span>
                                    <span className="break-all">{variantErrors[matchedAsset.id]}</span>
                                  </div>
                                  <button
                                    type="button"
                                    onClick={() => handleCreateVariant(matchedAsset.id)}
                                    className="self-end px-2 py-0.5 bg-red-900/50 hover:bg-red-800/70 text-red-200 hover:text-white rounded text-[9px] font-semibold cursor-pointer border border-red-500/30 transition-colors flex items-center gap-1 font-sans"
                                  >
                                    <RefreshCw className="w-2.5 h-2.5" />
                                    Thử lại (Retry)
                                  </button>
                                </div>
                              )}
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              ) : (
                <span className="text-[11px] text-neutral-500 italic">Chưa phát hiện nhân vật nào.</span>
              )}
            </div>

            {/* Location Mapping Board */}
            <div className="bg-[#0b0e1e]/60 border border-slate-900 rounded-xl p-4 font-sans">
              <div className="flex items-center justify-between gap-2 mb-3">
                <div className="flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-blue-400" />
                  <span className="text-xs font-bold text-slate-200">Liên kết DNA Bối cảnh</span>
                </div>
                <div className="flex items-center gap-1.5 bg-slate-950 px-2 py-0.5 rounded border border-slate-900">
                  <span className="text-[9px] text-slate-500 font-bold uppercase tracking-wider font-sans">
                    Aesthetic:
                  </span>
                  <select
                    value={environmentStyle}
                    onChange={(e) => setEnvironmentStyle(e.target.value)}
                    className="bg-transparent text-[10px] text-blue-400 outline-none border-none cursor-pointer font-sans"
                  >
                    <option value="Modern & Clean (Chung cư hiện đại, kính cường lực, tối giản)">
                      Chung Cư Hiện Đại
                    </option>
                    <option value="Classic Hanoi Retro (Nhà mái ngói cổ, ban công dây phơi, tường vàng hoài cổ)">
                      Hà Nội Hoài Cổ
                    </option>
                    <option value="Industrial Loft (Tường gạch thô, thép, cửa kính đen)">Industrial Loft</option>
                    <option value="Futuristic Sci-Fi (Ánh sáng neon, kim loại bóng bẩy)">Sci-Fi Futuristic</option>
                  </select>
                </div>
              </div>
              {parsedData.locations.length > 0 ? (
                <div className="space-y-3">
                  {parsedData.locations.map((loc, index) => {
                    const mappedId = locationMappings[loc.name] || "";
                    const matchedAsset = projectAssets.find((a) => a.id === mappedId);

                    return (
                      <div
                        key={loc.id || index}
                        className="p-3 rounded-lg bg-slate-950/70 border border-slate-900/80 hover:border-blue-500/20 transition-all space-y-2"
                      >
                        <div className="flex items-center justify-between font-sans">
                          <span className="text-xs font-bold text-blue-400">{loc.name}</span>
                          {mappedId ? (
                            <span className="text-[9px] text-emerald-400 bg-emerald-950/40 px-1.5 py-0.5 rounded border border-emerald-500/20 flex items-center gap-1 font-mono">
                              <Check className="w-2.5 h-2.5" /> Đã Gắn DNA
                            </span>
                          ) : (
                            <span className="text-[9px] text-amber-400 bg-amber-950/40 px-1.5 py-0.5 rounded border border-amber-500/20 font-mono">
                              Chưa khóa
                            </span>
                          )}
                        </div>

                        {matchedAsset && (matchedAsset.styleGuide?.referenceImageUrl || matchedAsset.rootImageUrl) && (
                          <div
                            className="w-full h-36 rounded-lg overflow-hidden border border-blue-500/20 bg-slate-950 mt-1 relative group shrink-0 cursor-zoom-in"
                            title="Click để phóng to xem cho rõ"
                            onClick={() => setZoomImageUrl(matchedAsset.styleGuide?.referenceImageUrl || matchedAsset.rootImageUrl || null)}
                          >
                            <img
                              src={matchedAsset.styleGuide?.referenceImageUrl || matchedAsset.rootImageUrl}
                              alt={loc.name}
                              className="w-full h-full object-contain transition-transform group-hover:scale-102"
                            />
                            <button
                              type="button"
                              className="absolute top-2 right-2 p-1.5 rounded-md bg-slate-900/80 hover:bg-blue-600/90 text-blue-300 hover:text-white border border-blue-500/30 opacity-0 group-hover:opacity-100 transition-opacity z-10"
                              onClick={(e) => {
                                e.stopPropagation();
                                setZoomImageUrl(matchedAsset.styleGuide?.referenceImageUrl || matchedAsset.rootImageUrl || null);
                              }}
                              title="Phóng to ảnh"
                            >
                              <Maximize2 className="w-3.5 h-3.5" />
                            </button>
                            <div className="absolute inset-x-0 bottom-0 bg-slate-950/80 p-1 text-[9px] font-bold text-center text-blue-300 group-hover:bg-slate-950 transition-colors">
                              Hình ảnh bối cảnh DNA (Xem full 🔍)
                            </div>
                          </div>
                        )}

                        {matchedAsset && (() => {
                          const sg = getAssetStyleGuide(matchedAsset);
                          const currentRef = matchedAsset.styleGuide?.referenceImageUrl || matchedAsset.rootImageUrl;
                          const rawAngles =
                            sg?.angles && Array.isArray(sg.angles) && sg.angles.length > 0
                              ? sg.angles
                              : [{ title: "Wide view establishing shot", url: currentRef }];
                          const angles = rawAngles.map((ang: any) => ({
                            ...ang,
                            url: (ang.url === matchedAsset.rootImageUrl && matchedAsset.styleGuide?.referenceImageUrl)
                              ? matchedAsset.styleGuide.referenceImageUrl
                              : ang.url
                          }));

                          const isRedundant = angles.length === 1 && angles[0].url === currentRef;
                          if (isRedundant) return null;

                          return (
                            <div className="mt-2 space-y-2 font-sans">
                              <span className="text-[9px] font-extrabold text-blue-400 uppercase tracking-widest block font-sans">
                                Góc Máy Bối Cảnh (Camera Grid)
                              </span>
                              <div className="grid grid-cols-2 gap-2">
                                {angles.map((ang: any, idx: number) => (
                                  <div
                                    key={idx}
                                    className="relative group/ang overflow-hidden rounded-lg border border-slate-800 bg-slate-900 shadow-inner aspect-video cursor-zoom-in"
                                    onClick={() => ang.url && setZoomImageUrl(ang.url || null)}
                                    title="Click để phóng to xem cho rõ"
                                  >
                                    {ang.url ? (
                                      <>
                                        <img
                                          src={ang.url}
                                          alt={ang.title || "Camera Angle"}
                                          className="w-full h-full object-cover transition-all group-hover/ang:scale-105 duration-300"
                                        />
                                        <button
                                          type="button"
                                          className="absolute top-1 right-1 p-1 rounded bg-slate-900/80 hover:bg-blue-600/90 text-blue-300 hover:text-white border border-blue-500/30 opacity-0 group-hover/ang:opacity-100 transition-opacity z-10"
                                          onClick={(e) => {
                                            e.stopPropagation();
                                            setZoomImageUrl(ang.url || null);
                                          }}
                                          title="Phóng to bối cảnh"
                                        >
                                          <Maximize2 className="w-2.5 h-2.5" />
                                        </button>
                                      </>
                                    ) : (
                                      <div className="w-full h-full flex flex-col items-center justify-center bg-slate-950/80 text-[8px] text-slate-500 font-mono gap-1">
                                        <Camera className="w-3.5 h-3.5 text-slate-700" />
                                        Chưa tạo ảnh
                                      </div>
                                    )}
                                    <div className="absolute bottom-1 left-1 right-1 bg-slate-950/80 backdrop-blur-[1.5px] px-1 py-0.5 rounded text-[7px] font-bold text-blue-300 font-mono text-center truncate">
                                      {idx + 1}. {ang.title?.toUpperCase() || `ANGLE ${idx + 1}`}
                                    </div>
                                  </div>
                                ))}
                              </div>
                            </div>
                          );
                        })()}

                        <select
                          value={mappedId}
                          onChange={(e) =>
                            setLocationMappings((prev) => ({ ...prev, [loc.name]: e.target.value }))
                          }
                          className="w-full bg-slate-900 border border-slate-800 focus:border-blue-500/50 rounded-lg px-2 py-1 text-[11px] text-slate-300 outline-none transition-all font-sans"
                        >
                          <option value="">-- Chọn Bối cảnh từ Asset Manager --</option>
                          {projectAssets
                            .filter(
                              (a) =>
                                a.entityType?.toLowerCase() === "location" ||
                                a.entityType?.toLowerCase() === "setting"
                            )
                            .map((a) => (
                              <option key={a.id} value={a.id}>
                                {a.name}
                              </option>
                            ))}
                        </select>

                        {!mappedId &&
                          (generatingAssets[loc.name] ? (
                            <div className="w-full flex items-center justify-center gap-1.5 py-1.5 px-2 bg-blue-950/40 border border-blue-500/20 text-blue-400 rounded-lg text-[10px] font-medium font-sans animate-pulse">
                              <Loader2 className="w-3.5 h-3.5 animate-spin text-blue-400" />
                              Đang thiết kế Camera Grid 2x2...
                            </div>
                          ) : draftAssets[loc.name] ? (
                            <div className="p-2.5 rounded-lg border border-blue-500/40 bg-blue-950/20 space-y-2 mt-1 font-sans">
                              <div className="flex items-center justify-between">
                                <span className="text-[10px] font-extrabold text-blue-300 tracking-wider font-mono">
                                  DRAFT / NHÁP CHỜ DUYỆT
                                </span>
                                <div className="flex items-center gap-1.5">
                                  <span className="text-[9px] text-amber-400 bg-amber-950/50 px-1.5 py-0.5 rounded border border-amber-500/20 animate-pulse font-mono font-bold">
                                    Chờ duyệt
                                  </span>
                                  <button
                                    type="button"
                                    onClick={(e) => { e.preventDefault(); e.stopPropagation(); handleCancelDraftAsset(loc.name); }}
                                    className="p-1 text-rose-400 hover:text-rose-300 bg-rose-950/40 hover:bg-rose-900/40 rounded border border-rose-500/20 transition-all cursor-pointer"
                                    title="Hủy nháp & Hoàn tác"
                                  >
                                    <Trash2 className="w-3 h-3" />
                                  </button>
                                </div>
                              </div>
                              {(() => {
                                let locImgUrl = draftAssets[loc.name].rootImageUrl;
                                if (locImgUrl && locImgUrl.startsWith('["')) {
                                  try { locImgUrl = JSON.parse(locImgUrl)[0]; } catch (e) {}
                                }
                                return locImgUrl ? (
                                  <div
                                    className="w-full h-36 rounded-lg overflow-hidden border border-blue-500/30 bg-slate-950 relative group cursor-zoom-in"
                                    title="Click để xem ảnh kích thước đầy đủ"
                                    onClick={() => window.open(locImgUrl, "_blank")}
                                  >
                                    <img
                                      src={locImgUrl}
                                      alt={loc.name}
                                      className="w-full h-full object-contain transition-transform group-hover:scale-102"
                                    />
                                    <div className="absolute inset-x-0 bottom-0 bg-slate-950/80 p-1 text-[9px] font-bold text-center text-blue-300">
                                      Ảnh nháp (Xem full 🔍)
                                    </div>
                                  </div>
                                ) : null;
                              })()}
                              <textarea
                                value={draftAssets[loc.name].description}
                                onChange={(e) => handleUpdateDraftDescription(loc.name, e.target.value)}
                                className="w-full bg-[#0b0e1e]/60 p-2 rounded leading-relaxed border border-slate-900 focus:border-blue-500 text-[10px] text-slate-300 font-sans outline-none resize-none min-h-[48px]"
                                placeholder="Nhập mô tả / prompt cho nháp..."
                              />
                              <div className="flex items-center gap-2">
                                <button
                                  type="button"
                                  onClick={() => handleRegenerateDraftAsset(loc.name, "location")}
                                  disabled={draftAssets[loc.name].isGeneratingImage}
                                  className="flex-1 py-1.5 px-2 bg-blue-900/40 hover:bg-blue-800/40 border border-blue-500/30 text-blue-300 rounded-lg text-[10px] font-bold transition-all disabled:opacity-50 cursor-pointer flex items-center justify-center gap-1"
                                >
                                  <RefreshCw
                                    className={`w-3.5 h-3.5 ${draftAssets[loc.name].isGeneratingImage ? "animate-spin" : ""}`}
                                  />
                                  {draftAssets[loc.name].isGeneratingImage ? "Đang tạo..." : "Vẽ lại ảnh"}
                                </button>

                                <button
                                  type="button"
                                  onClick={() => handleConfirmDraftAsset(loc.name)}
                                  className="flex-1 py-1.5 px-2 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 border border-emerald-500/30 text-white rounded-lg text-[10px] font-extrabold transition-all cursor-pointer flex items-center justify-center gap-1"
                                >
                                  <Check className="w-3.5 h-3.5" /> Xác Nhận
                                </button>
                              </div>
                            </div>
                          ) : (
                            <button
                              type="button"
                              onClick={() => handleAutoGenerateAsset(loc.name, "location")}
                              className="w-full flex items-center justify-center gap-1.5 py-1 px-2 bg-blue-900/30 hover:bg-blue-600/40 border border-blue-500/30 text-blue-300 hover:text-white rounded-lg text-[10px] font-bold transition-all active:scale-95 cursor-pointer mt-1 font-sans"
                            >
                              <Plus className="w-3 h-3" /> Tạo nhanh bối cảnh [{loc.name}]
                            </button>
                          ))}

                        {matchedAsset && (
                          <span className="text-[10px] text-slate-400 leading-relaxed block italic bg-[#0b0e1e]/40 p-1.5 rounded font-sans">
                            Hướng dẫn bối cảnh: {getCleanDnaPrompt(matchedAsset.description) || "Chưa có mô tả"}
                          </span>
                        )}

                        {matchedAsset && (
                          <div className="mt-3 border-t border-slate-900/60 pt-2 space-y-2 font-sans">
                            <div className="flex items-center justify-between">
                              <span className="text-[10px] font-bold text-blue-400">
                                Album Biến Thể Bối Cảnh (Variants)
                              </span>
                              {(loadingVariants[matchedAsset.id] || generatingVariantAssetId === matchedAsset.id) && (
                                <Loader2 className="w-3 h-3 animate-spin text-blue-500" />
                              )}
                            </div>

                            <div className="flex gap-1.5 overflow-x-auto pb-1 scrollbar-thin scrollbar-thumb-slate-800">
                              {matchedAsset.rootImageUrl && (
                                <div
                                  onClick={() => handleSelectVariantAsPrimary(matchedAsset.id, matchedAsset.rootImageUrl!)}
                                  className={`relative w-12 h-12 rounded border-2 cursor-pointer overflow-hidden shrink-0 group ${(matchedAsset.styleGuide?.referenceImageUrl || matchedAsset.rootImageUrl) === matchedAsset.rootImageUrl ? "border-blue-500" : "border-slate-880"}`}
                                  title="Ảnh gốc (Root)"
                                >
                                  <img src={matchedAsset.rootImageUrl} className="w-full h-full object-cover" />
                                  <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                                    <span className="text-[8px] bg-slate-800/80 text-white font-extrabold px-1 rounded">
                                      ROOT
                                    </span>
                                  </div>
                                </div>
                              )}

                              {assetVariants[matchedAsset.id]?.map((v, vIdx) => {
                                const currentRef = matchedAsset.styleGuide?.referenceImageUrl || matchedAsset.rootImageUrl;
                                const isMain = v.driveUrl === matchedAsset.rootImageUrl;
                                if (isMain) return null;
                                const isSelected = v.driveUrl === currentRef;
                                return (
                                  <div
                                    key={v.id || vIdx}
                                    onClick={() => handleSelectVariantAsPrimary(matchedAsset.id, v.driveUrl)}
                                    className={`relative w-12 h-12 rounded border cursor-pointer overflow-hidden shrink-0 group ${isSelected ? "border-blue-500 border-2" : "border-slate-850 hover:border-blue-500/50"}`}
                                    title={isSelected ? "Ảnh tham chiếu hiện tại" : "Click để chọn làm ảnh tham chiếu"}
                                  >
                                    <img
                                      src={v.driveUrl}
                                      className="w-full h-full object-cover transition-transform group-hover:scale-110"
                                    />
                                    {isSelected && (
                                      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                                        <span className="text-[8px] bg-blue-600 text-white font-extrabold px-1 rounded">
                                          REF
                                        </span>
                                      </div>
                                    )}
                                  </div>
                                );
                              })}

                              {(!assetVariants[matchedAsset.id] ||
                                assetVariants[matchedAsset.id].filter((v) => v.driveUrl !== matchedAsset.rootImageUrl)
                                  .length === 0) && <span className="text-[9px] text-slate-500 italic py-1">Chưa có biến thể phụ.</span>}
                            </div>

                            <div className="space-y-1.5 pt-1">
                              <div className="flex gap-1">
                                <input
                                  type="text"
                                  placeholder="Mô tả biến thể (vd: góc rộng hơn, ban đêm...)"
                                  value={variantModifiers[matchedAsset.id] || ""}
                                  onChange={(e) =>
                                    setVariantModifiers((prev) => ({ ...prev, [matchedAsset.id]: e.target.value }))
                                  }
                                  className="flex-1 bg-slate-950 border border-slate-900 focus:border-blue-500/50 rounded px-1.5 py-0.5 text-[10px] text-slate-300 outline-none placeholder:text-slate-600 font-sans"
                                />
                                <button
                                  type="button"
                                  disabled={generatingVariantAssetId === matchedAsset.id}
                                  onClick={() => handleCreateVariant(matchedAsset.id)}
                                  className="px-2 py-0.5 bg-blue-900/60 hover:bg-blue-800/80 border border-blue-500/20 text-blue-300 hover:text-white rounded text-[10px] font-bold cursor-pointer transition-colors flex items-center gap-1 shrink-0 font-sans"
                                >
                                  {generatingVariantAssetId === matchedAsset.id ? (
                                    <Loader2 className="w-2.5 h-2.5 animate-spin" />
                                  ) : (
                                    <Sparkles className="w-2.5 h-2.5" />
                                  )}
                                  Tạo
                                </button>
                              </div>
                              {generatingVariantAssetId === matchedAsset.id && (
                                <div className="text-[8px] text-blue-400 animate-pulse font-mono flex items-center gap-1">
                                  <Loader2 className="w-2.5 h-2.5 animate-spin" />
                                  Hệ thống đang sinh ảnh bối cảnh grid 2x2 trong 1-2 phút...
                                </div>
                              )}
                              {variantErrors[matchedAsset.id] && (
                                <div className="text-[9px] text-red-400 font-mono bg-red-950/40 border border-red-500/20 rounded p-1.5 flex flex-col gap-1.5 mt-1">
                                  <div className="flex items-start gap-1">
                                    <span className="font-bold text-red-500 shrink-0">[Lỗi]:</span>
                                    <span className="break-all">{variantErrors[matchedAsset.id]}</span>
                                  </div>
                                  <button
                                    type="button"
                                    onClick={() => handleCreateVariant(matchedAsset.id)}
                                    className="self-end px-2 py-0.5 bg-red-900/50 hover:bg-red-800/70 text-red-200 hover:text-white rounded text-[9px] font-semibold cursor-pointer border border-red-500/30 transition-colors flex items-center gap-1 font-sans"
                                  >
                                    <RefreshCw className="w-2.5 h-2.5" />
                                    Thử lại (Retry)
                                  </button>
                                </div>
                              )}
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              ) : (
                <span className="text-[11px] text-neutral-500 italic">Chưa phát hiện bối cảnh nào.</span>
              )}
            </div>

            {/* Prop & Item Linker */}
            <div className="bg-[#0b0e1e]/60 border border-slate-900 rounded-xl p-4 font-sans">
              <div className="flex items-center gap-2 mb-3">
                <Sliders className="w-4 h-4 text-amber-400" />
                <span className="text-xs font-bold text-slate-200">Liên kết DNA Đạo cụ</span>
              </div>
              {parsedData.props && parsedData.props.length > 0 ? (
                <div className="space-y-3">
                  {parsedData.props.map((prop, index) => {
                    const mappedId = propMappings[prop.name] || "";
                    const matchedAsset = projectAssets.find((a) => a.id === mappedId);

                    return (
                      <div
                        key={prop.id || index}
                        className="p-3 rounded-lg bg-slate-950/70 border border-slate-900/80 hover:border-amber-500/20 transition-all space-y-2"
                      >
                        <div className="flex items-center justify-between font-sans">
                          <span className="text-xs font-bold text-amber-400">{prop.name}</span>
                          {mappedId ? (
                            <span className="text-[9px] text-emerald-400 bg-emerald-950/40 px-1.5 py-0.5 rounded border border-emerald-500/20 flex items-center gap-1 font-mono">
                              <Check className="w-2.5 h-2.5" /> Đã Gắn DNA
                            </span>
                          ) : (
                            <span className="text-[9px] text-amber-400 bg-amber-950/40 px-1.5 py-0.5 rounded border border-amber-500/20 font-mono">
                              Chưa khóa
                            </span>
                          )}
                        </div>

                        {matchedAsset && (matchedAsset.styleGuide?.referenceImageUrl || matchedAsset.rootImageUrl) && (
                          <div
                            className="w-full h-36 rounded-lg overflow-hidden border border-amber-500/20 bg-slate-950 mt-1 relative group shrink-0 cursor-zoom-in"
                            title="Click để phóng to xem cho rõ"
                            onClick={() => setZoomImageUrl(matchedAsset.styleGuide?.referenceImageUrl || matchedAsset.rootImageUrl || null)}
                          >
                            <img
                              src={matchedAsset.styleGuide?.referenceImageUrl || matchedAsset.rootImageUrl}
                              alt={prop.name}
                              className="w-full h-full object-contain transition-transform group-hover:scale-102"
                            />
                            <button
                              type="button"
                              className="absolute top-2 right-2 p-1.5 rounded-md bg-slate-900/80 hover:bg-amber-600/90 text-amber-300 hover:text-white border border-amber-500/30 opacity-0 group-hover:opacity-100 transition-opacity z-10"
                              onClick={(e) => {
                                e.stopPropagation();
                                setZoomImageUrl(matchedAsset.styleGuide?.referenceImageUrl || matchedAsset.rootImageUrl || null);
                              }}
                              title="Phóng to ảnh"
                            >
                              <Maximize2 className="w-3.5 h-3.5" />
                            </button>
                            <div className="absolute inset-x-0 bottom-0 bg-slate-950/80 p-1 text-[9px] font-bold text-center text-amber-300 group-hover:bg-slate-950 transition-colors">
                              Hình ảnh đạo cụ DNA (Xem full 🔍)
                            </div>
                          </div>
                        )}

                        {matchedAsset && (() => {
                          const sg = getAssetStyleGuide(matchedAsset);
                          const currentRef = matchedAsset.styleGuide?.referenceImageUrl || matchedAsset.rootImageUrl;
                          const rawAngles =
                            sg?.angles && Array.isArray(sg.angles) && sg.angles.length > 0
                              ? sg.angles
                              : [{ title: "Flat illustration view", url: currentRef }];
                          const angles = rawAngles.map((ang: any) => ({
                            ...ang,
                            url: (ang.url === matchedAsset.rootImageUrl && matchedAsset.styleGuide?.referenceImageUrl)
                              ? matchedAsset.styleGuide.referenceImageUrl
                              : ang.url
                          }));

                          const isRedundant = angles.length === 1 && angles[0].url === currentRef;
                          if (isRedundant) return null;

                          return (
                            <div className="mt-2 space-y-2 font-sans">
                              <span className="text-[9px] font-extrabold text-amber-400 uppercase tracking-widest block">
                                Góc Máy Đạo Cụ (Camera Grid 2x2)
                              </span>
                              <div className="grid grid-cols-2 gap-2">
                                {angles.map((ang: any, idx: number) => (
                                  <div
                                    key={idx}
                                    className="relative group/ang overflow-hidden rounded-lg border border-slate-800 bg-slate-900 shadow-inner aspect-video cursor-zoom-in"
                                    onClick={() => ang.url && setZoomImageUrl(ang.url || null)}
                                    title="Click để phóng to xem cho rõ"
                                  >
                                    {ang.url ? (
                                      <>
                                        <img
                                          src={ang.url}
                                          alt={ang.title || "Camera Angle"}
                                          className="w-full h-full object-cover transition-all group-hover/ang:scale-105 duration-300"
                                        />
                                        <button
                                          type="button"
                                          className="absolute top-1 right-1 p-1 rounded bg-slate-900/80 hover:bg-amber-600/90 text-amber-300 hover:text-white border border-amber-500/30 opacity-0 group-hover/ang:opacity-100 transition-opacity z-10"
                                          onClick={(e) => {
                                            e.stopPropagation();
                                            setZoomImageUrl(ang.url || null);
                                          }}
                                          title="Phóng to đạo cụ"
                                        >
                                          <Maximize2 className="w-2.5 h-2.5" />
                                        </button>
                                      </>
                                    ) : (
                                      <div className="w-full h-full flex flex-col items-center justify-center bg-slate-950/80 text-[8px] text-slate-500 font-mono gap-1">
                                        <Camera className="w-3.5 h-3.5 text-slate-700" />
                                        Chưa tạo ảnh
                                      </div>
                                    )}
                                    <div className="absolute bottom-1 left-1 right-1 bg-slate-950/80 backdrop-blur-[1.5px] px-1 py-0.5 rounded text-[7px] font-bold text-amber-300 font-mono text-center truncate">
                                      {idx + 1}. {ang.title?.toUpperCase() || `ANGLE ${idx + 1}`}
                                    </div>
                                  </div>
                                ))}
                              </div>
                            </div>
                          );
                        })()}

                        <select
                          value={mappedId}
                          onChange={(e) => setPropMappings((prev) => ({ ...prev, [prop.name]: e.target.value }))}
                          className="w-full bg-slate-900 border border-slate-800 focus:border-amber-500/50 rounded-lg px-2 py-1 text-[11px] text-slate-300 outline-none transition-all font-sans"
                        >
                          <option value="">-- Chọn Đạo cụ từ Asset Manager --</option>
                          {projectAssets
                            .filter(
                              (a) =>
                                a.entityType?.toLowerCase() === "prop" ||
                                a.entityType?.toLowerCase() === "item" ||
                                a.entityType?.toLowerCase() === "weapon" ||
                                a.entityType?.toLowerCase() === "object"
                            )
                            .map((a) => (
                              <option key={a.id} value={a.id}>
                                {a.name}
                              </option>
                            ))}
                        </select>

                        {!mappedId &&
                          (generatingAssets[prop.name] ? (
                            <div className="w-full flex items-center justify-center gap-1.5 py-1.5 px-2 bg-amber-950/40 border border-amber-500/20 text-amber-400 rounded-lg text-[10px] font-medium font-sans animate-pulse">
                              <Loader2 className="w-3.5 h-3.5 animate-spin text-amber-400" />
                              Đang tạo đạo cụ...
                            </div>
                          ) : draftAssets[prop.name] ? (
                            <div className="p-2.5 rounded-lg border border-amber-500/40 bg-amber-950/20 space-y-2 mt-1 font-sans">
                              <div className="flex items-center justify-between">
                                <span className="text-[10px] font-extrabold text-amber-300 tracking-wider font-mono">
                                  DRAFT / NHÁP CHỜ DUYỆT
                                </span>
                                <div className="flex items-center gap-1.5">
                                  <span className="text-[9px] text-amber-400 bg-amber-950/50 px-1.5 py-0.5 rounded border border-amber-500/20 animate-pulse font-mono font-bold">
                                    Chờ duyệt
                                  </span>
                                  <button
                                    type="button"
                                    onClick={(e) => { e.preventDefault(); e.stopPropagation(); handleCancelDraftAsset(prop.name); }}
                                    className="p-1 text-rose-400 hover:text-rose-300 bg-rose-950/40 hover:bg-rose-900/40 rounded border border-rose-500/20 transition-all cursor-pointer"
                                    title="Hủy nháp & Hoàn tác"
                                  >
                                    <Trash2 className="w-3 h-3" />
                                  </button>
                                </div>
                              </div>
                              {(() => {
                                let propImgUrl = draftAssets[prop.name].rootImageUrl;
                                if (propImgUrl && propImgUrl.startsWith('["')) {
                                  try { propImgUrl = JSON.parse(propImgUrl)[0]; } catch (e) {}
                                }
                                return propImgUrl ? (
                                  <div
                                    className="w-full h-36 rounded-lg overflow-hidden border border-amber-500/30 bg-slate-950 relative group cursor-zoom-in"
                                    title="Click để xem ảnh kích thước đầy đủ"
                                    onClick={() => window.open(propImgUrl, "_blank")}
                                  >
                                    <img
                                      src={propImgUrl}
                                      alt={prop.name}
                                      className="w-full h-full object-contain transition-transform group-hover:scale-102"
                                    />
                                    <div className="absolute inset-x-0 bottom-0 bg-slate-950/80 p-1 text-[9px] font-bold text-center text-amber-300">
                                      Ảnh nháp (Xem full 🔍)
                                    </div>
                                  </div>
                                ) : null;
                              })()}
                              <textarea
                                value={draftAssets[prop.name].description}
                                onChange={(e) => handleUpdateDraftDescription(prop.name, e.target.value)}
                                className="w-full bg-[#0b0e1e]/60 p-2 rounded leading-relaxed border border-slate-900 focus:border-amber-500 text-[10px] text-slate-300 font-sans outline-none resize-none min-h-[48px]"
                                placeholder="Nhập mô tả / prompt cho nháp..."
                              />
                              <div className="flex items-center gap-2">
                                <button
                                  type="button"
                                  onClick={() => handleRegenerateDraftAsset(prop.name, "prop")}
                                  disabled={draftAssets[prop.name].isGeneratingImage}
                                  className="flex-1 py-1.5 px-2 bg-amber-900/40 hover:bg-amber-800/40 border border-amber-500/30 text-amber-300 rounded-lg text-[10px] font-bold transition-all disabled:opacity-50 cursor-pointer flex items-center justify-center gap-1"
                                >
                                  <RefreshCw
                                    className={`w-3.5 h-3.5 ${draftAssets[prop.name].isGeneratingImage ? "animate-spin" : ""}`}
                                  />
                                  {draftAssets[prop.name].isGeneratingImage ? "Đang tạo..." : "Vẽ lại ảnh"}
                                </button>

                                <button
                                  type="button"
                                  onClick={() => handleConfirmDraftAsset(prop.name)}
                                  className="flex-1 py-1.5 px-2 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 border border-emerald-500/30 text-white rounded-lg text-[10px] font-extrabold transition-all cursor-pointer flex items-center justify-center gap-1"
                                >
                                  <Check className="w-3.5 h-3.5" /> Xác Nhận
                                </button>
                              </div>
                            </div>
                          ) : (
                            <button
                              type="button"
                              onClick={() => handleAutoGenerateAsset(prop.name, "prop")}
                              className="w-full flex items-center justify-center gap-1.5 py-1 px-2 bg-amber-900/30 hover:bg-amber-600/40 border border-amber-500/30 text-purple-300 hover:text-white rounded-lg text-[10px] font-bold transition-all active:scale-95 cursor-pointer mt-1 font-sans"
                            >
                              <Plus className="w-3 h-3" /> Tạo nhanh đạo cụ [{prop.name}]
                            </button>
                          ))}

                        {matchedAsset && (
                          <span className="text-[10px] text-slate-400 leading-relaxed block italic bg-[#0b0e1e]/40 p-1.5 rounded font-sans">
                            Hướng dẫn đạo cụ: {getCleanDnaPrompt(matchedAsset.description) || "Chưa có mô tả"}
                          </span>
                        )}

                        {matchedAsset && (
                          <div className="mt-3 border-t border-slate-900/60 pt-2 space-y-2 font-sans">
                            <div className="flex items-center justify-between">
                              <span className="text-[10px] font-bold text-amber-400">
                                Album Biến Thể Đạo Cụ (Variants)
                              </span>
                              {(loadingVariants[matchedAsset.id] || generatingVariantAssetId === matchedAsset.id) && (
                                <Loader2 className="w-3 h-3 animate-spin text-amber-500" />
                              )}
                            </div>

                            <div className="flex gap-1.5 overflow-x-auto pb-1 scrollbar-thin scrollbar-thumb-slate-800">
                              {matchedAsset.rootImageUrl && (
                                <div
                                  onClick={() => handleSelectVariantAsPrimary(matchedAsset.id, matchedAsset.rootImageUrl!)}
                                  className={`relative w-12 h-12 rounded border-2 cursor-pointer overflow-hidden shrink-0 group ${(matchedAsset.styleGuide?.referenceImageUrl || matchedAsset.rootImageUrl) === matchedAsset.rootImageUrl ? "border-amber-500" : "border-slate-880"}`}
                                  title="Ảnh gốc (Root)"
                                >
                                  <img src={matchedAsset.rootImageUrl} className="w-full h-full object-cover" />
                                  <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                                    <span className="text-[8px] bg-slate-800/80 text-white font-extrabold px-1 rounded">
                                      ROOT
                                    </span>
                                  </div>
                                </div>
                              )}

                              {assetVariants[matchedAsset.id]?.map((v, vIdx) => {
                                const currentRef = matchedAsset.styleGuide?.referenceImageUrl || matchedAsset.rootImageUrl;
                                const isMain = v.driveUrl === matchedAsset.rootImageUrl;
                                if (isMain) return null;
                                const isSelected = v.driveUrl === currentRef;
                                return (
                                  <div
                                    key={v.id || vIdx}
                                    onClick={() => handleSelectVariantAsPrimary(matchedAsset.id, v.driveUrl)}
                                    className={`relative w-12 h-12 rounded border cursor-pointer overflow-hidden shrink-0 group ${isSelected ? "border-amber-500 border-2" : "border-slate-800 hover:border-amber-500/50"}`}
                                    title={isSelected ? "Ảnh tham chiếu hiện tại" : "Click để chọn làm ảnh tham chiếu"}
                                  >
                                    <img
                                      src={v.driveUrl}
                                      className="w-full h-full object-cover transition-transform group-hover:scale-110"
                                    />
                                    {isSelected && (
                                      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                                        <span className="text-[8px] bg-amber-600 text-white font-extrabold px-1 rounded">
                                          REF
                                        </span>
                                      </div>
                                    )}
                                  </div>
                                );
                              })}

                              {(!assetVariants[matchedAsset.id] ||
                                assetVariants[matchedAsset.id].filter((v) => v.driveUrl !== matchedAsset.rootImageUrl)
                                  .length === 0) && <span className="text-[9px] text-slate-500 italic py-1">Chưa có biến thể phụ.</span>}
                            </div>

                            <div className="space-y-1.5 pt-1">
                              <div className="flex gap-1">
                                <input
                                  type="text"
                                  placeholder="Mô tả biến thể (vd: góc nghiêng, ánh sáng tối...)"
                                  value={variantModifiers[matchedAsset.id] || ""}
                                  onChange={(e) =>
                                    setVariantModifiers((prev) => ({ ...prev, [matchedAsset.id]: e.target.value }))
                                  }
                                  className="flex-1 bg-slate-950 border border-slate-900 focus:border-amber-500/50 rounded px-1.5 py-0.5 text-[10px] text-slate-300 outline-none placeholder:text-slate-600 font-sans"
                                />
                                <button
                                  type="button"
                                  disabled={generatingVariantAssetId === matchedAsset.id}
                                  onClick={() => handleCreateVariant(matchedAsset.id)}
                                  className="px-2 py-0.5 bg-amber-900/60 hover:bg-amber-800/80 border border-amber-500/20 text-amber-300 hover:text-white rounded text-[10px] font-bold cursor-pointer transition-colors flex items-center gap-1 shrink-0 font-sans"
                                >
                                  {generatingVariantAssetId === matchedAsset.id ? (
                                    <Loader2 className="w-2.5 h-2.5 animate-spin" />
                                  ) : (
                                    <Sparkles className="w-2.5 h-2.5" />
                                  )}
                                  Tạo
                                </button>
                              </div>
                              {generatingVariantAssetId === matchedAsset.id && (
                                <div className="text-[8px] text-amber-400 animate-pulse font-mono flex items-center gap-1">
                                  <Loader2 className="w-2.5 h-2.5 animate-spin" />
                                  Hệ thống đang sinh ảnh đạo cụ grid 2x2 trong 1-2 phút...
                                </div>
                              )}
                              {variantErrors[matchedAsset.id] && (
                                <div className="text-[9px] text-red-400 font-mono bg-red-950/40 border border-red-500/20 rounded p-1.5 flex flex-col gap-1.5 mt-1">
                                  <div className="flex items-start gap-1">
                                    <span className="font-bold text-red-500 shrink-0">[Lỗi]:</span>
                                    <span className="break-all">{variantErrors[matchedAsset.id]}</span>
                                  </div>
                                  <button
                                    type="button"
                                    onClick={() => handleCreateVariant(matchedAsset.id)}
                                    className="self-end px-2 py-0.5 bg-red-900/50 hover:bg-red-800/70 text-red-200 hover:text-white rounded text-[9px] font-semibold cursor-pointer border border-red-500/30 transition-colors flex items-center gap-1 font-sans"
                                  >
                                    <RefreshCw className="w-2.5 h-2.5" />
                                    Thử lại (Retry)
                                  </button>
                                </div>
                              )}
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center p-4 bg-slate-950/40 border border-slate-900 rounded-lg text-center h-28">
                  <span className="text-[10px] text-neutral-500 italic block mb-2">Chưa nhận diện đạo cụ nào.</span>
                  <button
                    onClick={() => {
                      const words = scriptText.toLowerCase();
                      const candidates = ["la bàn", "robot", "phát minh", "bằng chứng", "gấu bông", "máy móc"];
                      const found = candidates.filter((c) => words.includes(c));
                      if (found.length > 0) {
                        setParsedData((prev: any) =>
                          prev
                            ? {
                                ...prev,
                                props: found.map((f, i) => ({
                                  id: `prop-${i}`,
                                  name: f.charAt(0).toUpperCase() + f.slice(1),
                                })),
                              }
                            : null
                        );
                      } else {
                        setParsedData((prev: any) =>
                          prev
                            ? {
                                ...prev,
                                props: [
                                  { id: "prop-1", name: "La bàn của Kilo" },
                                  { id: "prop-2", name: "Linh kiện robot" },
                                ],
                              }
                            : null
                        );
                      }
                    }}
                    className="text-[10px] text-purple-400 hover:text-purple-300 font-bold underline cursor-pointer font-sans"
                  >
                    ⚡ Trích xuất Đạo cụ
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Lightbox Modal */}
      {zoomImageUrl && (
        <div
          className="fixed inset-0 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4 z-[9999] animate-in fade-in zoom-in-95 duration-200"
          onClick={() => setZoomImageUrl(null)}
        >
          <div
            className="relative max-w-4xl max-h-[85vh] w-full flex flex-col items-center bg-slate-900 border border-slate-800 rounded-xl overflow-hidden shadow-2xl animate-in fade-in-50 duration-300"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header controls */}
            <div className="w-full flex items-center justify-between px-4 py-2.5 bg-slate-950/60 border-b border-slate-800/80">
              <span className="text-xs text-slate-400 font-mono select-none">
                Đang xem ảnh DNA tham chiếu
              </span>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => window.open(zoomImageUrl, "_blank")}
                  className="p-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-700 transition-colors flex items-center gap-1 text-[10px] font-bold"
                  title="Mở tab mới"
                >
                  <ExternalLink className="w-3 h-3" /> Mở tab mới
                </button>
                <button
                  type="button"
                  onClick={() => setZoomImageUrl(null)}
                  className="p-1 rounded bg-slate-800 hover:bg-red-900/60 text-slate-300 hover:text-red-400 border border-slate-700 hover:border-red-800/50 transition-colors"
                  title="Đóng (Esc)"
                >
                  <X className="w-3 h-3" />
                </button>
              </div>
            </div>
            {/* Image viewport */}
            <div className="w-full flex-1 flex items-center justify-center p-6 min-h-0 bg-slate-950/40">
              <img
                src={zoomImageUrl}
                alt="DNA Reference Zoom"
                className="max-w-full max-h-[70vh] object-contain rounded-lg border border-slate-800/40 shadow-lg select-none"
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AssetDnaPanel;
