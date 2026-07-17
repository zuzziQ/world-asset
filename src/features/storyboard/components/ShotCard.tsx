import React from "react";
import { Camera, Loader2, Eye, Trash2 } from "lucide-react";
import { useShotStore } from "../store/shotStore";

interface ShotCardProps {
  shot: any;
  isGenerating: boolean;
  computedPrompt: string;
  detectedAssets: { characters: string[]; locations: string[]; props: string[] };
  handleGenerateShotFrame: (sh: any) => void;
  handleUpdateShotField: (beatId: string, field: string, value: any) => void;
  handleDeleteShot: (beatId: string) => void;
  getReferenceImagesForShot: (sh: any) => string[];
  projectAssets: any[];
  draftAssets?: any;
  storyboardAssets?: any[];
}

export const ShotCard: React.FC<ShotCardProps> = ({
  shot,
  isGenerating,
  computedPrompt,
  detectedAssets,
  handleGenerateShotFrame,
  handleUpdateShotField,
  handleDeleteShot,
  getReferenceImagesForShot,
  projectAssets,
  draftAssets,
  storyboardAssets,
}) => {
  // Extract scene and shot number for variant filtering
  const sceneTag = `Scene ${shot.sceneNumber || shot.scene_number || 1}`;
  const shotTag = `Shot ${shot.shotNumber || 0}`;
  
  const allAssets = storyboardAssets || [];
  
  // Filter variants from DB assets
  const storyboardVariants = allAssets.filter((a: any) => 
    (a.assetType === 'storyboard' || a.assetType === 'image') && 
    a.tags && 
    a.tags.some((t: string) => t.toLowerCase() === sceneTag.toLowerCase()) && 
    a.tags.some((t: string) => t.toLowerCase() === shotTag.toLowerCase())
  );
  
  const videoVariants = allAssets.filter((a: any) => 
    a.assetType === 'video' && 
    a.tags && 
    a.tags.some((t: string) => t.toLowerCase() === sceneTag.toLowerCase()) && 
    a.tags.some((t: string) => t.toLowerCase() === shotTag.toLowerCase())
  );

  const storeImageUrl = useShotStore(state => state.images[shot.beat]);
  const storeIsGenerating = useShotStore(state => state.isGenerating[shot.beat]);
  
  // Display image and video fallback to the first matched variant from assets if not set in shot data
  const displayImageUrl = storeImageUrl || shot.imageUrl || shot.renderUrl || (storyboardVariants[0]?.driveUrl);
  const displayVideoUrl = shot.videoUrl || (videoVariants[0]?.driveUrl);
  
  const displayIsGenerating = storeIsGenerating || isGenerating;
  const refImages = getReferenceImagesForShot(shot);

  return (
    <div className={`bg-[#060814] border ${shot.is_glue ? 'border-orange-500/50 shadow-[0_0_15px_rgba(249,115,22,0.1)]' : 'border-slate-900'} rounded-2xl p-4 space-y-3 relative overflow-hidden flex flex-col justify-between group`}>
      {/* Top Header: Info and Duration */}
      <div className="space-y-2.5">
        <div className="flex items-center justify-between border-b border-slate-900 pb-1.5">
          <div className="flex items-center gap-2">
            <span className="text-[9px] font-extrabold text-slate-400 font-mono">Shot {shot.shotNumber}</span>
            {shot.is_glue ? (
              <span className="px-1.5 py-0.5 rounded text-[8px] font-black tracking-wider uppercase bg-orange-950/40 text-orange-400 border border-orange-900/50" title="Chèn để chống jump-cut">
                🤖 AI Injected
              </span>
            ) : null}
          </div>
          
          {/* Duration Input */}
          <div className="flex items-center gap-1">
            <input 
              type="number"
              min={1}
              max={60}
              value={shot.duration || 4}
              onChange={(e) => handleUpdateShotField(shot.beat, "duration", parseInt(e.target.value) || 4)}
              className="w-8 bg-slate-950 border border-slate-900 rounded text-slate-300 text-[9px] font-bold text-center outline-none py-0.5"
            />
            <span className="text-[9px] text-slate-500 font-mono">s</span>
          </div>
        </div>

        {/* Side-by-side Storyboard & Video Columns */}
        <div className="grid grid-cols-2 gap-4">
          {/* Left Column: Storyboard */}
          <div className="flex flex-col">
            <label className="block text-[8px] text-slate-500 font-extrabold uppercase mb-1">Storyboard</label>
            <div className="relative aspect-video rounded-xl border border-slate-900 overflow-hidden bg-slate-950 shadow-inner group/image">
              {displayImageUrl ? (
                <img 
                  src={displayImageUrl} 
                  alt={`Shot ${shot.shotNumber}`} 
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="absolute inset-0 flex items-center justify-center text-[8px] font-black text-slate-700 uppercase tracking-widest bg-slate-950/20">
                  No Frame
                </div>
              )}
              {displayImageUrl && (
                <div className="absolute inset-0 bg-slate-950/80 opacity-0 group-hover/image:opacity-100 transition-opacity flex items-center justify-center gap-1.5">
                  <a 
                    href={displayImageUrl} 
                    target="_blank" 
                    rel="noreferrer"
                    className="p-1 rounded bg-slate-900 border border-slate-800 hover:bg-slate-800 text-slate-300"
                    title="Xem ảnh lớn"
                  >
                    <Eye className="w-3.5 h-3.5" />
                  </a>
                </div>
              )}
            </div>

            {/* Storyboard Variants */}
            <div className="space-y-1 mt-2 text-left">
              <span className="text-[8px] text-slate-500 uppercase font-black tracking-wider block">Variants ({storyboardVariants.length})</span>
              {storyboardVariants.length === 0 ? (
                <div className="text-[7.5px] text-slate-600 italic">No variants</div>
              ) : (
                <div className="flex items-center gap-1 flex-wrap max-h-12 overflow-y-auto custom-scrollbar">
                  {storyboardVariants.map((v: any, vIdx: number) => {
                    const isSelected = v.driveUrl === displayImageUrl;
                    return (
                      <div 
                        key={v.id || vIdx}
                        onClick={() => {
                          handleUpdateShotField(shot.beat, 'imageUrl', v.driveUrl);
                          handleUpdateShotField(shot.beat, 'renderUrl', v.driveUrl);
                        }}
                        className={`w-10 aspect-video bg-slate-950 rounded overflow-hidden relative cursor-pointer border hover:scale-105 transition-all ${isSelected ? 'border-purple-500 ring-1 ring-purple-500/50 shadow-md' : 'border-slate-800 opacity-60 hover:opacity-100 hover:border-slate-700'}`}
                      >
                        <img src={v.driveUrl} className="w-full h-full object-cover" alt={`V${vIdx}`} />
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>

          {/* Right Column: Video */}
          <div className="flex flex-col">
            <label className="block text-[8px] text-slate-500 font-extrabold uppercase mb-1">Video</label>
            <div className="relative aspect-video rounded-xl border border-slate-900 overflow-hidden bg-slate-950 shadow-inner group/video">
              {displayVideoUrl ? (
                <video 
                  src={displayVideoUrl} 
                  controls 
                  className="w-full h-full object-contain"
                  muted
                  loop
                  playsInline
                />
              ) : (
                <div className="absolute inset-0 flex items-center justify-center text-[8px] font-black text-slate-700 uppercase tracking-widest bg-slate-950/20">
                  No Video
                </div>
              )}
            </div>

            {/* Video Variants */}
            <div className="space-y-1 mt-2 text-left">
              <span className="text-[8px] text-slate-500 uppercase font-black tracking-wider block">Variants ({videoVariants.length})</span>
              {videoVariants.length === 0 ? (
                <div className="text-[7.5px] text-slate-600 italic">No variants</div>
              ) : (
                <div className="flex items-center gap-1 flex-wrap max-h-12 overflow-y-auto custom-scrollbar">
                  {videoVariants.map((v: any, vIdx: number) => {
                    const isSelected = v.driveUrl === displayVideoUrl;
                    return (
                      <div 
                        key={v.id || vIdx}
                        onClick={() => handleUpdateShotField(shot.beat, 'videoUrl', v.driveUrl)}
                        className={`w-10 aspect-video bg-slate-950 rounded overflow-hidden relative cursor-pointer border hover:scale-105 transition-all ${isSelected ? 'border-indigo-500 ring-1 ring-indigo-500/50 shadow-md' : 'border-slate-800 opacity-60 hover:opacity-100 hover:border-slate-700'}`}
                      >
                        <video src={v.driveUrl} className="w-full h-full object-cover pointer-events-none" />
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Narrative & Shot Kind Block */}
        <div className="grid grid-cols-2 gap-2 py-1.5 border-b border-slate-900/60 text-[9px]">
          <div>
            <label className="block text-[8px] text-slate-500 font-extrabold uppercase mb-0.5">Shot Kind</label>
            <select
              value={shot.kind || "establishing"}
              onChange={(e) => handleUpdateShotField(shot.beat, "kind", e.target.value)}
              className="w-full bg-slate-950 border border-slate-900 rounded p-1 text-emerald-400 outline-none font-bold"
            >
              <option value="establishing">Establishing</option>
              <option value="detail">Detail</option>
              <option value="action">Action</option>
              <option value="reaction">Reaction</option>
              <option value="dialogue">Dialogue</option>
              <option value="transition">Transition</option>
            </select>
          </div>
          <div>
            <label className="block text-[8px] text-slate-500 font-extrabold uppercase mb-0.5">Narrative Function</label>
            <select
              value={shot.function || "setup"}
              onChange={(e) => handleUpdateShotField(shot.beat, "function", e.target.value)}
              className="w-full bg-slate-950 border border-slate-900 rounded p-1 text-blue-400 outline-none font-semibold"
            >
              <option value="setup">Setup</option>
              <option value="inciting_incident">Inciting Incident</option>
              <option value="rising_action">Rising Action</option>
              <option value="climax">Climax</option>
              <option value="resolution">Resolution</option>
            </select>
          </div>
        </div>

        {/* Camera Mechanics Edit Block */}
        <div className="grid grid-cols-2 gap-2 py-1.5 border-b border-slate-900/60 text-[9px]">
          <div>
            <label className="block text-[8px] text-slate-500 font-extrabold uppercase mb-0.5">Camera Movement</label>
            <select
              value={shot.cameraMovement || "Static Tilt"}
              onChange={(e) => handleUpdateShotField(shot.beat, "cameraMovement", e.target.value)}
              className="w-full bg-slate-950 border border-slate-900 rounded p-1 text-purple-400 outline-none font-bold"
            >
              <option value="Static Tilt">Static Tilt</option>
              <option value="Pan Left/Right">Pan</option>
              <option value="Zoom In/Out">Zoom</option>
              <option value="Dolly In/Out">Dolly</option>
              <option value="Tracking Shot">Track</option>
              <option value="Crane Up/Down">Crane</option>
            </select>
          </div>
          <div>
            <label className="block text-[8px] text-slate-500 font-extrabold uppercase mb-0.5">Camera Angle</label>
            <select
              value={shot.angle || "Eye-Level"}
              onChange={(e) => handleUpdateShotField(shot.beat, "angle", e.target.value)}
              className="w-full bg-slate-950 border border-slate-900 rounded p-1 text-slate-400 outline-none font-semibold"
            >
              <option value="Eye-Level">Eye-Level</option>
              <option value="High Angle">High Angle</option>
              <option value="Low Angle">Low Angle</option>
              <option value="Over the Shoulder">OTS</option>
              <option value="Dutch Angle">Dutch</option>
              <option value="Close-up">Close-up</option>
              <option value="Extreme Close-up">Extreme</option>
            </select>
          </div>
        </div>

        {/* Action Description (Editable) */}
        <div className="space-y-1.5">
          <div>
            <label className="block text-[8px] text-slate-500 font-extrabold uppercase tracking-wider mb-0.5">Physical Action</label>
            <textarea
              value={shot.actionDescription || ""}
              onChange={(e) => handleUpdateShotField(shot.beat, "actionDescription", e.target.value)}
              placeholder="Action script..."
              className="w-full bg-slate-950 border border-slate-900 rounded p-1 text-slate-300 text-[10px] outline-none h-11 resize-none leading-relaxed"
            ></textarea>
          </div>

          {/* Asset DNA Refs */}
          <div>
            <label className="block text-[8px] text-slate-500 font-extrabold uppercase tracking-wider mb-0.5" title="Yêu cầu cụ thể góc quay phụ hoặc đạo cụ (ví dụ: bầu trời, dàn phơi đồ,...)">Asset DNA Refs (Micro-locations/Props)</label>
            <input
              value={shot.assetDnaRefs || ""}
              onChange={(e) => handleUpdateShotField(shot.beat, "assetDnaRefs", e.target.value)}
              placeholder="Ví dụ: Bầu trời hoàng hôn, dàn phơi quần áo..."
              className="w-full bg-slate-950 border border-slate-900 rounded p-1 text-pink-400/80 text-[9px] outline-none"
            />
          </div>

          {/* Lời thoại (Dialogue) */}
          <div>
            <label className="block text-[8px] text-slate-500 font-extrabold uppercase tracking-wider mb-0.5">Lời thoại (Dialogue)</label>
            <textarea
              value={shot.thoại || shot.dialogue || shot.dialog || ""}
              onChange={(e) => handleUpdateShotField(shot.beat, "thoại", e.target.value)}
              placeholder="Thoại của nhân vật..."
              className="w-full bg-slate-950 border border-slate-900 rounded p-1 text-amber-300/80 text-[9px] outline-none h-11 resize-none leading-snug"
            ></textarea>
          </div>

          {/* Objective */}
          <div>
            <label className="block text-[8px] text-slate-500 font-extrabold uppercase tracking-wider mb-0.5">Mục tiêu (Objective)</label>
            <textarea
              value={shot.objective || shot.mục_tiêu || ""}
              onChange={(e) => handleUpdateShotField(shot.beat, "objective", e.target.value)}
              placeholder="Mục tiêu của shot này..."
              className="w-full bg-slate-950 border border-slate-900 rounded p-1 text-amber-400/80 text-[9px] outline-none h-11 resize-none leading-snug"
            ></textarea>
          </div>

          {/* AI prompt override */}
          <div>
            <label className="block text-[8px] text-slate-500 font-extrabold uppercase tracking-wider mb-0.5">Diễn tả (Description / Prompt)</label>
            <textarea
              value={shot.structure?.core || shot.diễn_tả || shot.description || ""}
              onChange={(e) => {
                if (shot.structure) {
                  handleUpdateShotField(shot.beat, "structure", { ...shot.structure, core: e.target.value });
                } else {
                  handleUpdateShotField(shot.beat, "diễn_tả", e.target.value);
                }
              }}
              placeholder="AI visual details..."
              className="w-full bg-slate-950 border border-slate-900 rounded p-1 text-slate-400 text-[9px] font-mono outline-none h-11 resize-none leading-snug"
            ></textarea>
          </div>

          {/* Reference Images Verification */}
          {refImages && refImages.length > 0 ? (
            <div className="space-y-1 bg-slate-950/40 p-2 rounded-xl border border-slate-900/60">
              <div className="flex items-center justify-between">
                <span className="text-[8px] text-slate-500 font-extrabold uppercase tracking-wider">
                  Verified Style Guide Refs ({refImages.length})
                </span>
                <span className="text-[7px] text-emerald-400 font-bold bg-emerald-950/40 px-1 py-0.5 rounded border border-emerald-900/30 uppercase tracking-widest">
                  Ready
                </span>
              </div>
              <div className="flex gap-2 overflow-x-auto py-1 scrollbar-thin scrollbar-thumb-slate-800">
                {refImages.map((url, idx) => {
                  const getAssetRefImageUrl = (dbAsset: any) => {
                    if (!dbAsset) return null;
                    if (dbAsset.styleGuide) {
                      let sg = dbAsset.styleGuide;
                      if (typeof sg === 'string') {
                        try { sg = JSON.parse(sg); } catch(e){}
                      }
                      if (sg && sg.referenceImageUrl) return sg.referenceImageUrl;
                    }
                    return dbAsset.rootImageUrl;
                  };
                  
                  const dbAsset = projectAssets.find(a => getAssetRefImageUrl(a) === url);
                  let isChar = dbAsset?.entityType?.toLowerCase() === "character";
                  let isLoc = dbAsset?.entityType?.toLowerCase() === "location" || dbAsset?.entityType?.toLowerCase() === "setting";
                  let assetName = dbAsset?.name;
                  
                  if (!dbAsset && draftAssets) {
                    const draftEntry = Object.entries(draftAssets).find(([name, d]: [string, any]) => d.rootImageUrl === url);
                    if (draftEntry) {
                      assetName = draftEntry[0];
                      const val = draftEntry[1] as any;
                      isChar = val.type === "character";
                      isLoc = val.type === "location";
                    }
                  }
                  if (!assetName) {
                    assetName = "Style Ref";
                  }
                  
                  return (
                    <div 
                      key={idx} 
                      className={`relative w-12 h-12 rounded-lg border ${isChar ? 'border-purple-500/30' : isLoc ? 'border-blue-500/30' : 'border-slate-800'} overflow-hidden bg-slate-950 shrink-0 group/ref shadow-md hover:scale-105 transition-transform duration-200`}
                    >
                      <img 
                        src={url} 
                        alt={assetName} 
                        className="w-full h-full object-cover"
                      />
                      {/* Name tooltip/badge */}
                      <div className="absolute inset-x-0 bottom-0 bg-slate-950/90 py-0.5 px-1 text-[7px] font-black text-center text-slate-300 truncate leading-none">
                        {isChar ? '👤' : isLoc ? '📍' : '⚙️'} {assetName}
                      </div>
                      {/* Full-view overlay on hover */}
                      <div className="absolute inset-0 bg-slate-950/80 opacity-0 group-hover/ref:opacity-100 transition-opacity flex items-center justify-center">
                        <a 
                          href={url} 
                          target="_blank" 
                          rel="noreferrer" 
                          className="px-1.5 py-0.5 rounded bg-slate-900 border border-slate-700 text-[7px] text-slate-200 font-bold hover:bg-slate-800"
                        >
                          View
                        </a>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ) : (
            <div className="bg-slate-950/20 p-2 rounded-xl border border-slate-950 text-center">
              <span className="text-[7.5px] text-slate-600 font-bold uppercase tracking-wider">
                ⚠️ No Style Refs Linked
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Footer tags and Actions */}
      <div className="pt-2 border-t border-slate-900 space-y-2 mt-2">
        {/* DNA badge checklist */}
        <div className="flex flex-wrap gap-1">
          {detectedAssets.characters.map((n: string) => (
            <span key={n} className="px-1 py-0.5 rounded bg-purple-950/20 text-purple-400 border border-purple-900/30 text-[8px] font-black truncate max-w-[60px]">👤 {n}</span>
          ))}
          {detectedAssets.locations.map((n: string) => (
            <span key={n} className="px-1 py-0.5 rounded bg-blue-950/20 text-blue-400 border border-blue-900/30 text-[8px] font-black truncate max-w-[60px]">📍 {n}</span>
          ))}
        </div>

        <div className="flex gap-2">
          {/* Delete action */}
          <button
            onClick={() => {
              if (confirm(`Bạn có chắc muốn xóa Shot ${shot.shotNumber}?`)) {
                handleDeleteShot(shot.beat);
              }
            }}
            className="p-1.5 border border-rose-950 hover:bg-rose-950/20 text-rose-500 rounded-lg transition-colors active:scale-95 flex items-center justify-center"
            title="Xóa Shot"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
          
          {/* Generate Frame action */}
          <button
            onClick={() => handleGenerateShotFrame(shot)}
            disabled={displayIsGenerating}
            className="flex-1 py-1.5 rounded-lg text-[9px] font-black uppercase tracking-wider bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white transition-all inline-flex items-center justify-center gap-1 shadow-md active:scale-95"
          >
            {displayIsGenerating ? (
              <>
                <Loader2 className="w-3 h-3 animate-spin" />
                <span>Running</span>
              </>
            ) : (
              <>
                <Camera className="w-3 h-3" />
                <span>{displayImageUrl ? "Regen" : "Gen Frame"}</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
