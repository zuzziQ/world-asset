import React from "react";
import { Camera, Loader2, Eye, Trash2 } from "lucide-react";
import { useShotStore } from "../store/shotStore";

interface ShotTableRowProps {
  sh: any;
  isGenerating: boolean;
  computedPrompt: string;
  detected: { characters: string[]; locations: string[]; props: string[] };
  handleGenerateShotFrame: (sh: any) => void;
  handleUpdateShotField: (beatId: string, field: string, value: any) => void;
  handleDeleteShot: (beatId: string) => void;
  getReferenceImagesForShot: (sh: any) => string[];
  projectAssets: any[];
  draftAssets?: any;
}

export const ShotTableRow: React.FC<ShotTableRowProps> = ({
  sh,
  isGenerating,
  computedPrompt,
  detected,
  handleGenerateShotFrame,
  handleUpdateShotField,
  handleDeleteShot,
  getReferenceImagesForShot,
  projectAssets,
  draftAssets,
}) => {
  const storeImageUrl = useShotStore(state => state.images[sh.beat]);
  const storeIsGenerating = useShotStore(state => state.isGenerating[sh.beat]);
  const displayImageUrl = storeImageUrl || sh.imageUrl;
  const displayIsGenerating = storeIsGenerating || isGenerating;
  const refImages = getReferenceImagesForShot(sh);

  return (
    <tr className="hover:bg-slate-900/30 transition-colors border-b border-slate-900/40 text-[11px] font-sans">
      <td className="py-2 px-3 font-mono text-slate-500 whitespace-nowrap">
        <div className="flex flex-col gap-1">
          <span>{sh.beat}</span>
          {sh.is_glue && (
            <span className="px-1 py-0.5 rounded text-[7px] font-black tracking-wider uppercase bg-orange-950/40 text-orange-400 border border-orange-900/50 scale-90 origin-left">
              Glue
            </span>
          )}
        </div>
      </td>
      <td className="py-2 px-3 font-mono font-bold text-slate-300">{sh.sc}</td>
      <td className="py-2 px-3">
        <select
          value={sh.kind || "establishing"}
          onChange={(e) => handleUpdateShotField(sh.beat, "kind", e.target.value)}
          className="bg-slate-950 border border-slate-900 rounded p-1 text-emerald-400 outline-none font-bold text-[10px]"
        >
          <option value="establishing">Establishing</option>
          <option value="detail">Detail</option>
          <option value="action">Action</option>
          <option value="reaction">Reaction</option>
          <option value="dialogue">Dialogue</option>
          <option value="transition">Transition</option>
        </select>
      </td>
      <td className="py-2 px-3">
        <select
          value={sh.function || "setup"}
          onChange={(e) => handleUpdateShotField(sh.beat, "function", e.target.value)}
          className="bg-slate-950 border border-slate-900 rounded p-1 text-blue-400 outline-none font-semibold text-[10px]"
        >
          <option value="setup">Setup</option>
          <option value="inciting_incident">Inciting Incident</option>
          <option value="rising_action">Rising Action</option>
          <option value="climax">Climax</option>
          <option value="resolution">Resolution</option>
        </select>
      </td>
      <td className="py-2 px-3 font-mono font-bold text-amber-500">
        <input 
          type="number"
          min={1}
          max={60}
          value={sh.duration || sh.T || 4}
          onChange={(e) => handleUpdateShotField(sh.beat, "duration", parseInt(e.target.value) || 4)}
          className="w-12 bg-slate-950 border border-slate-900 rounded text-slate-300 text-[10px] font-bold text-center outline-none py-0.5"
        />
      </td>
      <td className="py-2 px-3 space-y-1">
        <select
          value={sh.cameraMovement || "Static Tilt"}
          onChange={(e) => handleUpdateShotField(sh.beat, "cameraMovement", e.target.value)}
          className="w-full bg-slate-950 border border-slate-900 rounded p-1 text-purple-400 outline-none font-bold text-[9px]"
        >
          <option value="Static Tilt">Static Tilt</option>
          <option value="Pan Left/Right">Pan</option>
          <option value="Zoom In/Out">Zoom</option>
          <option value="Dolly In/Out">Dolly</option>
          <option value="Tracking Shot">Track</option>
          <option value="Crane Up/Down">Crane</option>
        </select>
        <select
          value={sh.angle || "Eye-Level"}
          onChange={(e) => handleUpdateShotField(sh.beat, "angle", e.target.value)}
          className="w-full bg-slate-950 border border-slate-900 rounded p-1 text-slate-400 outline-none font-semibold text-[9px]"
        >
          <option value="Eye-Level">Eye-Level</option>
          <option value="High Angle">High Angle</option>
          <option value="Low Angle">Low Angle</option>
          <option value="Over the Shoulder">OTS</option>
          <option value="Dutch Angle">Dutch</option>
          <option value="Close-up">Close-up</option>
          <option value="Extreme Close-up">Extreme</option>
        </select>
      </td>
      <td className="py-2 px-3">
        <textarea
          value={sh.diễn_tả || sh.description || ""}
          onChange={(e) => handleUpdateShotField(sh.beat, "diễn_tả", e.target.value)}
          className="w-full min-w-[200px] h-14 bg-slate-950 border border-slate-900 rounded p-1.5 text-slate-300 text-[10px] outline-none resize-none leading-relaxed"
        />
      </td>
      <td className="py-2 px-3">
        <textarea
          value={sh.thoại || sh.dialogue || sh.dialog || ""}
          placeholder="Lời thoại (nếu có)..."
          onChange={(e) => handleUpdateShotField(sh.beat, "thoại", e.target.value)}
          className="w-full min-w-[150px] h-14 bg-slate-950 border border-slate-900 rounded p-1.5 text-amber-300/90 text-[10px] outline-none resize-none leading-relaxed"
        />
      </td>
      <td className="py-2 px-3">
        <textarea
          value={sh.mục_tiêu || sh.objective || ""}
          onChange={(e) => handleUpdateShotField(sh.beat, "mục_tiêu", e.target.value)}
          className="w-full min-w-[200px] h-14 bg-slate-950 border border-slate-900 rounded p-1.5 text-emerald-400/90 text-[10px] outline-none resize-none leading-relaxed"
        />
      </td>
      <td className="py-2 px-3">
        <textarea
          value={sh.causalLink || ""}
          placeholder="Chuyển tiếp/Kết nối..."
          onChange={(e) => handleUpdateShotField(sh.beat, "causalLink", e.target.value)}
          className="w-full min-w-[150px] h-14 bg-slate-950 border border-slate-900 rounded p-1.5 text-pink-400/90 text-[10px] outline-none resize-none leading-relaxed italic"
        />
      </td>
      <td className="py-2 px-3 min-w-[120px]">
        {refImages && refImages.length > 0 ? (
          <div className="flex gap-1.5 overflow-x-auto max-w-[150px] py-1">
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
                  className={`relative w-8 h-8 rounded border ${isChar ? 'border-purple-500/30' : isLoc ? 'border-blue-500/30' : 'border-slate-800'} overflow-hidden bg-slate-950 shrink-0 group/ref shadow-sm hover:scale-105 transition-transform duration-200`}
                  title={`${isChar ? '👤' : isLoc ? '📍' : '⚙️'} ${assetName}`}
                >
                  <img 
                    src={url} 
                    alt={assetName} 
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-slate-950/80 opacity-0 group-hover/ref:opacity-100 transition-opacity flex items-center justify-center">
                    <a 
                      href={url} 
                      target="_blank" 
                      rel="noreferrer" 
                      className="px-1 py-0.5 rounded bg-slate-900 border border-slate-700 text-[6px] text-slate-200 font-bold"
                    >
                      View
                    </a>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <span className="text-[8px] text-slate-600 font-bold uppercase tracking-wider">
            No Refs
          </span>
        )}
      </td>
      <td className="py-2 px-3">
        <div className="flex items-center gap-3 min-w-[320px]">
          {/* Output image & action button */}
          <div className="shrink-0 flex flex-col items-center gap-1.5">
            {displayImageUrl ? (
              <div className="relative w-20 aspect-video rounded border border-slate-800 overflow-hidden bg-slate-950 group/img shadow-md">
                <img src={displayImageUrl} alt="frame" className="w-full h-full object-cover" />
                <div className="absolute inset-0 bg-slate-950/85 opacity-0 group-hover/img:opacity-100 transition-opacity flex items-center justify-center gap-1">
                  <a href={displayImageUrl} target="_blank" rel="noreferrer" className="p-1 rounded bg-slate-900 border border-slate-800 text-slate-300 hover:text-white" title="View Full">
                    <Eye className="w-3 h-3" />
                  </a>
                  <button 
                    onClick={() => { 
                      if(confirm(`Bạn có chắc muốn xóa Shot ${sh.beat}?`)) {
                        handleDeleteShot(sh.beat);
                      } 
                    }} 
                    className="p-1 rounded bg-slate-900 border border-slate-800 text-rose-500 hover:bg-rose-950/30" 
                    title="Delete"
                  >
                    <Trash2 className="w-3 h-3" />
                  </button>
                </div>
              </div>
            ) : (
              <div className="w-20 aspect-video rounded border border-dashed border-slate-800 bg-slate-950/40 flex items-center justify-center text-[8px] text-slate-600 font-bold uppercase tracking-wider select-none">
                No Frame
              </div>
            )}
            
            {/* Generate button */}
            <button
              onClick={() => handleGenerateShotFrame(sh)}
              disabled={displayIsGenerating}
              className={`w-full py-1 px-2 rounded text-[8px] font-black uppercase tracking-wider transition-all flex items-center justify-center gap-1 shadow ${
                displayIsGenerating 
                  ? "bg-slate-900 text-slate-500 cursor-not-allowed" 
                  : "bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white active:scale-95"
              }`}
            >
              {displayIsGenerating ? (
                <>
                  <Loader2 className="w-2.5 h-2.5 animate-spin" />
                  <span>Running</span>
                </>
              ) : (
                <>
                  <Camera className="w-2.5 h-2.5" />
                  <span>{displayImageUrl ? "Regen" : "Gen"}</span>
                </>
              )}
            </button>
          </div>
          
          {/* Computed prompt */}
          <div className="flex-1 max-w-[220px]">
            <div className="text-[8px] font-extrabold uppercase text-indigo-500/80 mb-0.5 tracking-wider">AI Prompt</div>
            <div className="text-[9px] font-mono text-slate-400 line-clamp-3 hover:line-clamp-none transition-all leading-normal bg-slate-950/60 p-1.5 rounded border border-slate-900/60 shadow-inner">
              {computedPrompt}
            </div>
          </div>
        </div>
      </td>
    </tr>
  );
};
