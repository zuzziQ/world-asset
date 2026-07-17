"use client";
import React, { useState } from "react";
import { Grid, Sparkles, Eye, Check, Trash2 } from "lucide-react";

interface XRayVariantBoardProps {
  variantImages: any[];
  activeVariantId: string;
  setActiveVariantId: (id: string) => void;
  activeSelectedVariant: any;
  setZoomImageUrl: (url: string) => void;
  setShowVariantGenModal: (show: boolean) => void;
  updateAsset: (id: string, tags: string[]) => Promise<any>;
  deleteAsset: (id: string) => Promise<any>;
  setVariantImages: React.Dispatch<React.SetStateAction<any[]>>;
  handleSplitGrid: (mode: "2x1" | "3x1" | "4x1" | "2x2" | "3x3") => void;
  isSplittingGrid: boolean;
  onSetAsRoot: (url: string) => void;
}

export function XRayVariantBoard({
  variantImages,
  activeVariantId,
  setActiveVariantId,
  activeSelectedVariant,
  setZoomImageUrl,
  setShowVariantGenModal,
  updateAsset,
  deleteAsset,
  setVariantImages,
  handleSplitGrid,
  isSplittingGrid,
  onSetAsRoot,
}: XRayVariantBoardProps) {
  const [isBulkMode, setIsBulkMode] = useState(false);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [isDeletingBulk, setIsDeletingBulk] = useState(false);

  const toggleSelect = (id: string) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  };

  const handleBulkDelete = async () => {
    if (selectedIds.length === 0) return;
    if (
      !window.confirm(
        `⚠️ Sếp có chắc chắn muốn xóa vĩnh viễn ${selectedIds.length} variants đã chọn khỏi Database?`
      )
    )
      return;

    setIsDeletingBulk(true);
    try {
      // Filter out optimistic local-only IDs
      const realIds = selectedIds.filter((id) => !id.startsWith("optimistic-"));

      // Only invoke API delete for actual persistent records
      if (realIds.length > 0) {
        await Promise.all(realIds.map((id) => deleteAsset(id)));
      }
      
      // Update UI state for all selected IDs (both optimistic and real)
      setVariantImages((prev) =>
        prev.filter((v) => !selectedIds.includes(v.id))
      );

      // If active selected was deleted, clear it
      if (selectedIds.includes(activeVariantId)) {
        setActiveVariantId("");
      }

      alert(`🎉 Đã xóa thành công ${selectedIds.length} ảnh biến thể!`);
      setSelectedIds([]);
      setIsBulkMode(false);
    } catch (err: any) {
      alert("Lỗi khi xóa hàng loạt: " + err.message);
    } finally {
      setIsDeletingBulk(false);
    }
  };

  return (
    <div className="bg-[#0b0b0d] border border-white/5 rounded-3xl p-5 shadow-2xl backdrop-blur-md space-y-5">
      
      {/* HEADER CONTROL BAR */}
      <div className="flex justify-between items-center border-b border-white/5 pb-3">
        <div className="flex items-center gap-2">
          <span className="text-[10px] font-black uppercase tracking-widest text-purple-400 flex items-center gap-1.5 font-mono">
            <Grid className="w-4 h-4" /> Album Variants ({variantImages.length})
          </span>
        </div>

        <div className="flex items-center gap-2">
          {/* BULK OPERATION TOOLBAR */}
          {!isBulkMode ? (
            <>
              {variantImages.length > 0 && (
                <button
                  onClick={() => setIsBulkMode(true)}
                  className="bg-neutral-900 border border-white/5 hover:bg-neutral-800 text-neutral-400 hover:text-white px-3 py-1.5 rounded-lg text-[9px] font-black uppercase transition shrink-0 active:scale-95 cursor-pointer font-mono"
                >
                  Chọn nhiều
                </button>
              )}
              <button
                onClick={() => setShowVariantGenModal(true)}
                className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 text-white px-3 py-1.5 rounded-lg text-[9px] font-black uppercase transition shrink-0 active:scale-95 cursor-pointer flex items-center gap-1 font-mono"
              >
                <Sparkles className="w-3 h-3 animate-pulse" /> Sinh Variant mới (AI)
              </button>
            </>
          ) : (
            <div className="flex items-center gap-1.5 bg-black/40 p-1 rounded-xl border border-white/5 animate-in fade-in duration-200">
              <span className="text-[9px] font-mono text-purple-400 font-black uppercase px-2">
                Đã chọn: {selectedIds.length}
              </span>
              <button
                onClick={() => {
                  if (selectedIds.length === variantImages.length) {
                    setSelectedIds([]);
                  } else {
                    setSelectedIds(variantImages.map((v) => v.id));
                  }
                }}
                className="bg-neutral-900 border border-white/5 hover:bg-neutral-800 text-neutral-300 px-2.5 py-1 rounded-lg text-[8px] font-black uppercase transition cursor-pointer"
              >
                {selectedIds.length === variantImages.length ? "Bỏ chọn hết" : "Chọn tất cả"}
              </button>
              <button
                onClick={handleBulkDelete}
                disabled={selectedIds.length === 0 || isDeletingBulk}
                className="bg-red-650/80 hover:bg-red-650 border border-red-500/20 text-red-200 hover:text-white disabled:opacity-30 disabled:cursor-not-allowed px-2.5 py-1 rounded-lg text-[8px] font-black uppercase transition flex items-center gap-1 cursor-pointer"
              >
                <Trash2 className="w-2.5 h-2.5" />
                {isDeletingBulk ? "Đang xóa..." : "Xóa"}
              </button>
              <button
                onClick={() => {
                  setIsBulkMode(false);
                  setSelectedIds([]);
                }}
                className="bg-neutral-800 text-neutral-400 hover:text-white px-2.5 py-1 rounded-lg text-[8px] font-black uppercase transition cursor-pointer"
              >
                Hủy
              </button>
            </div>
          )}
        </div>
      </div>

      {/* ALBUM EMPTY STATE */}
      {variantImages.length === 0 ? (
        <div className="border border-dashed border-white/5 rounded-2xl py-12 text-center bg-black/20 text-neutral-600 text-[10px] italic space-y-2">
          <Sparkles className="w-6 h-6 mx-auto text-neutral-800 animate-pulse" />
          <p>Chưa có variant nào. Nhấp nút phía trên để bắt đầu sinh bằng AI!</p>
        </div>
      ) : (
        <div className="space-y-5">
          
          {/* GRID ALBUM THUMBNAILS - FLEXIBLE ASPECT SQUARE */}
          <div className="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-8 gap-3 animate-in fade-in duration-300">
            {variantImages.map((v) => {
              const isActive = activeVariantId === v.id;
              const isSelected = selectedIds.includes(v.id);
              return (
                <div
                  key={v.id}
                  onClick={() => {
                    if (isBulkMode) {
                      toggleSelect(v.id);
                    } else {
                      setActiveVariantId(v.id);
                    }
                  }}
                  className={`aspect-square w-full rounded-2xl overflow-hidden border transition cursor-pointer relative group/thumb ${
                    isBulkMode
                      ? isSelected
                        ? "border-purple-500 ring-2 ring-purple-500/30 scale-[0.96]"
                        : "border-white/5 opacity-50 hover:opacity-80 scale-95"
                      : isActive
                      ? "border-purple-500 ring-2 ring-purple-500/20 scale-105 shadow shadow-purple-500/20"
                      : "border-white/5 hover:border-white/10 hover:scale-102"
                  }`}
                >
                  <img src={v.url} className="w-full h-full object-cover" />
                  
                  {/* BULK SELECTION BADGE (CHECKBOX) */}
                  {isBulkMode && (
                    <div className="absolute top-1.5 left-1.5 z-20 w-5 h-5 rounded-full border border-white/20 flex items-center justify-center bg-black/70 shadow transition">
                      {isSelected && (
                        <Check className="w-3.5 h-3.5 text-purple-400 stroke-[4px]" />
                      )}
                    </div>
                  )}

                  {/* REGULAR HOVER ACTIONS */}
                  {!isBulkMode && (
                    <div className="absolute inset-0 bg-black/60 opacity-0 group-hover/thumb:opacity-100 transition duration-200 flex flex-col items-center justify-center gap-1.5 z-10">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setZoomImageUrl(v.url);
                        }}
                        className="bg-purple-650 hover:bg-purple-600 text-white text-[8px] font-black uppercase px-2.5 py-1 rounded-lg shadow-md transition active:scale-95 border border-purple-500/25"
                      >
                        Phóng to
                      </button>
                      <span className="text-[7.5px] text-neutral-400 font-black uppercase tracking-wider">Chọn</span>
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {/* ACTIVE SELECTED VARIANT DETAILS - PREMIUM LAYOUT */}
          {activeSelectedVariant && !isBulkMode && (
            <div className="bg-black/35 border border-white/5 rounded-2xl p-4 flex flex-col sm:flex-row gap-4 items-start relative group/detail animate-in slide-in-from-bottom-2 duration-300">
              
              {/* Left Column: Enlarged Preview Box with Click-to-Zoom */}
              <div 
                className="w-full sm:w-44 aspect-square sm:aspect-auto sm:h-44 rounded-xl overflow-hidden bg-neutral-950 border border-white/5 relative flex items-center justify-center shrink-0 group/zoom cursor-zoom-in group-hover/detail:border-white/15 transition"
                onClick={() => setZoomImageUrl(activeSelectedVariant.url)}
                title="Click để phóng to ảnh biến thể này"
              >
                <img src={activeSelectedVariant.url} className="w-full h-full object-cover transition duration-300 group-hover/zoom:scale-102" />
                <div className="absolute inset-0 bg-black/45 opacity-0 group-hover/zoom:opacity-100 transition duration-200 flex flex-col items-center justify-center gap-1">
                  <Eye className="w-6 h-6 text-white animate-pulse" />
                  <span className="text-[8px] font-black uppercase text-white bg-purple-600/80 px-2 py-0.5 rounded shadow">
                    Phóng to
                  </span>
                </div>
              </div>

              {/* Right Column: Variant Actions and Metadata */}
              <div className="flex-1 min-w-0 space-y-3.5 self-stretch flex flex-col justify-between">
                <div className="space-y-3">
                  <div className="flex justify-between items-center border-b border-white/5 pb-2">
                    <span className="text-[8.5px] font-black uppercase text-neutral-500 tracking-wider">Thông tin chi tiết Variant</span>
                    
                    {/* Actions Panel */}
                    <div className="flex flex-wrap gap-1.5 opacity-90 sm:opacity-0 sm:group-hover/detail:opacity-100 transition duration-200">
                      <button
                        onClick={async (e) => {
                          e.stopPropagation();
                          const newTag = window.prompt("Nhập tags mới (cách nhau bởi dấu phẩy):", activeSelectedVariant.tags?.join(", ") || "");
                          if (newTag !== null) {
                            const tagArray = newTag.split(",").map(t => t.trim()).filter(Boolean);
                            try {
                              await updateAsset(activeSelectedVariant.id, tagArray);
                              setVariantImages(prev => prev.map(v => v.id === activeSelectedVariant.id ? { ...v, tags: tagArray } : v));
                            } catch (err) {
                              alert("Lỗi khi sửa tag.");
                            }
                          }
                        }}
                        className="text-[7.5px] bg-green-600/15 border border-green-500/20 text-green-400 hover:text-white px-2 py-1 rounded font-black uppercase transition active:scale-95 cursor-pointer"
                        title="Chỉnh sửa tags"
                      >
                        Sửa Tag
                      </button>
                      <button
                        onClick={async (e) => {
                          e.stopPropagation();
                          const idToDelete = activeSelectedVariant.id;
                          
                          // If optimistic local draft, delete only in UI
                          if (idToDelete.startsWith("optimistic-")) {
                            setVariantImages(prev => prev.filter(v => v.id !== idToDelete));
                            if (activeVariantId === idToDelete) setActiveVariantId("");
                            return;
                          }

                          if (!window.confirm("⚠️ Sếp có chắc chắn muốn xóa variant này khỏi Database?")) return;
                          try {
                            await deleteAsset(idToDelete);
                            setVariantImages(prev => prev.filter(v => v.id !== idToDelete));
                            if (activeVariantId === idToDelete) setActiveVariantId("");
                          } catch(err) {
                            alert("Lỗi khi xóa variant");
                          }
                        }}
                        className="text-[7.5px] bg-red-650/15 border border-red-500/20 text-red-400 hover:text-white px-2 py-1 rounded font-black uppercase transition active:scale-95 cursor-pointer"
                        title="Xóa vĩnh viễn variant này"
                      >
                        Xóa
                      </button>
                      <button
                        onClick={(e) => { e.stopPropagation(); handleSplitGrid("2x1"); }}
                        disabled={isSplittingGrid}
                        className="text-[7.5px] bg-indigo-650/15 border border-indigo-500/20 text-indigo-400 hover:text-white px-2 py-1 rounded font-black uppercase transition active:scale-95 cursor-pointer disabled:opacity-35"
                        title="Cắt lưới 2x1 (ngang) thành các single variants"
                      >
                        Cắt 2x1
                      </button>
                      <button
                        onClick={(e) => { e.stopPropagation(); handleSplitGrid("3x1"); }}
                        disabled={isSplittingGrid}
                        className="text-[7.5px] bg-emerald-650/15 border border-emerald-500/20 text-emerald-400 hover:text-white px-2 py-1 rounded font-black uppercase transition active:scale-95 cursor-pointer disabled:opacity-35"
                        title="Cắt lưới 3x1 (ngang) thành các single variants"
                      >
                        Cắt 3x1
                      </button>
                      <button
                        onClick={(e) => { e.stopPropagation(); handleSplitGrid("4x1"); }}
                        disabled={isSplittingGrid}
                        className="text-[7.5px] bg-teal-650/15 border border-teal-500/20 text-teal-400 hover:text-white px-2 py-1 rounded font-black uppercase transition active:scale-95 cursor-pointer disabled:opacity-35"
                        title="Cắt lưới 4x1 (ngang) thành các single variants"
                      >
                        Cắt 4x1
                      </button>
                      <button
                        onClick={(e) => { e.stopPropagation(); handleSplitGrid("2x2"); }}
                        disabled={isSplittingGrid}
                        className="text-[7.5px] bg-blue-650/15 border border-blue-500/20 text-blue-400 hover:text-white px-2 py-1 rounded font-black uppercase transition active:scale-95 cursor-pointer disabled:opacity-35"
                        title="Cắt lưới 2x2 thành các single variants"
                      >
                        Cắt 2x2
                      </button>
                      <button
                        onClick={(e) => { e.stopPropagation(); handleSplitGrid("3x3"); }}
                        disabled={isSplittingGrid}
                        className="text-[7.5px] bg-pink-650/15 border border-pink-500/20 text-pink-400 hover:text-white px-2 py-1 rounded font-black uppercase transition active:scale-95 cursor-pointer disabled:opacity-35"
                        title="Cắt lưới 3x3 thành các single variants"
                      >
                        Cắt 3x3
                      </button>
                      <button
                        onClick={(e) => { e.stopPropagation(); onSetAsRoot(activeSelectedVariant.url); }}
                        className="text-[7.5px] bg-purple-650/15 border border-purple-500/20 text-purple-400 hover:text-white px-2 py-1 rounded font-black uppercase transition active:scale-95 cursor-pointer"
                        title="Đặt ảnh biến thể này làm ảnh neo gốc của Asset"
                      >
                        Đặt làm ảnh gốc
                      </button>
                    </div>
                  </div>

                  <div className="space-y-2 text-[10px] text-neutral-300">
                    <p className="flex items-center gap-1.5">
                      <strong className="text-neutral-500 w-12 shrink-0">Variant ID:</strong> 
                      <code className="font-mono text-purple-400 bg-black/40 px-2 py-0.5 rounded border border-white/5">{activeSelectedVariant.id}</code>
                    </p>
                    <div className="flex items-start gap-1.5">
                      <strong className="text-neutral-500 w-12 shrink-0 pt-0.5">Tags:</strong> 
                      <div className="flex flex-wrap gap-1">
                        {activeSelectedVariant.tags && activeSelectedVariant.tags.length > 0 ? (
                          activeSelectedVariant.tags.map((tag: string) => (
                            <span key={tag} className="text-[7.5px] bg-purple-950/40 border border-purple-500/15 text-purple-400 px-2 py-0.5 rounded-md font-mono font-bold">
                              {tag}
                            </span>
                          ))
                        ) : (
                          <span className="text-neutral-600 italic">Chưa gắn tags</span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
                
                <p className="text-[9px] text-neutral-600 italic font-mono uppercase tracking-wide">
                  💡 Tip: Nhấp đúp vào ảnh thu nhỏ hoặc nhấp vào ảnh to để xem phóng to chi tiết.
                </p>
              </div>

            </div>
          )}

        </div>
      )}
    </div>
  );
}
