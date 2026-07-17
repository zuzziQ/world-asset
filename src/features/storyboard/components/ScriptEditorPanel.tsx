"use client";

import React from "react";
import { 
  Sparkles, Save, Loader2, Palette, Check, Flame, Compass, Camera, Gauge, X, Clock, Tv 
} from "lucide-react";
import { EmptyState } from "./EmptyState";

interface ScriptEditorPanelProps {
  selectedEpisodeId: string | null;
  scriptText: string;
  setScriptText: (text: string) => void;
  editorMode: "editor" | "copilot";
  setEditorMode: (mode: "editor" | "copilot") => void;
  rawPremise: string;
  setRawPremise: (premise: string) => void;
  isSavingScript: boolean;
  handleSaveScript: () => void;
  
  // AI Options Co-pilot props:
  hasGeneratedOptions: boolean;
  isExtractingCharacters: boolean;
  handleAISuggestOptions: () => void;
  scenarioCharacters: string[];
  setScenarioCharacters: React.Dispatch<React.SetStateAction<string[]>>;
  projectAssets: any[];
  
  selectedEmotion: string;
  setSelectedEmotion: (emotion: string) => void;
  customEmotions: string[];
  setCustomEmotions: (emotions: string[]) => void;
  newEmotionInput: string;
  setNewEmotionInput: (input: string) => void;

  selectedTwist: string;
  setSelectedTwist: (twist: string) => void;
  customTwists: string[];
  setCustomTwists: (twists: string[]) => void;
  newTwistInput: string;
  setNewTwistInput: (input: string) => void;

  selectedVisual: string;
  setSelectedVisual: (visual: string) => void;
  customVisuals: string[];
  setCustomVisuals: (visuals: string[]) => void;
  newVisualInput: string;
  setNewVisualInput: (input: string) => void;

  selectedRetention: string;
  setSelectedRetention: (retention: string) => void;
  customRetentions: string[];
  setCustomRetentions: (retentions: string[]) => void;
  newRetentionInput: string;
  setNewRetentionInput: (input: string) => void;

  isCompilingCopilot: boolean;
  handleCompileScreenplay: () => void;
  totalDuration: number;
  setTotalDuration: (dur: number) => void;
  avgShotDuration: number;
  setAvgShotDuration: (dur: number) => void;

  // Style DNA props:
  styleRegion: string;
  setStyleRegion: (region: string) => void;
  styleMedium: string;
  setStyleMedium: (medium: string) => void;
  styleMood: string;
  setStyleMood: (mood: string) => void;
  stylePeriod: string;
  setStylePeriod: (period: string) => void;
  customStyleInstructions: string;
  setCustomStyleInstructions: (instructions: string) => void;
  isSuggestingStyle: boolean;
  handleAISuggestStyle: () => void;
  isConsolidatingStyle: boolean;
  handleSaveStyleConfig: () => void;
  projectsList: any[];
  selectedProjectId: string | null;

  // Helpers
  getDynamicOptions: () => { emotions: string[]; twists: string[]; visuals: string[]; retentions: string[] };
  handleEditChip: (category: "emotions" | "twists" | "visuals" | "retentions", oldValue: string) => void;

  // Analysis / Evaluation hooks
  isAnalyzing?: boolean;
  isEvaluating?: boolean;
  handleUnifiedAnalyzeAndEvaluate?: () => void;
}

export function ScriptEditorPanel({
  selectedEpisodeId,
  scriptText,
  setScriptText,
  editorMode,
  setEditorMode,
  rawPremise,
  setRawPremise,
  isSavingScript,
  handleSaveScript,

  hasGeneratedOptions,
  isExtractingCharacters,
  handleAISuggestOptions,
  scenarioCharacters,
  setScenarioCharacters,
  projectAssets,

  selectedEmotion,
  setSelectedEmotion,
  customEmotions,
  setCustomEmotions,
  newEmotionInput,
  setNewEmotionInput,

  selectedTwist,
  setSelectedTwist,
  customTwists,
  setCustomTwists,
  newTwistInput,
  setNewTwistInput,

  selectedVisual,
  setSelectedVisual,
  customVisuals,
  setCustomVisuals,
  newVisualInput,
  setNewVisualInput,

  selectedRetention,
  setSelectedRetention,
  customRetentions,
  setCustomRetentions,
  newRetentionInput,
  setNewRetentionInput,

  isCompilingCopilot,
  handleCompileScreenplay,
  totalDuration,
  setTotalDuration,
  avgShotDuration,
  setAvgShotDuration,

  styleRegion,
  setStyleRegion,
  styleMedium,
  setStyleMedium,
  styleMood,
  setStyleMood,
  stylePeriod,
  setStylePeriod,
  customStyleInstructions,
  setCustomStyleInstructions,
  isSuggestingStyle,
  handleAISuggestStyle,
  isConsolidatingStyle,
  handleSaveStyleConfig,
  projectsList,
  selectedProjectId,

  getDynamicOptions,
  handleEditChip,

  isAnalyzing = false,
  isEvaluating = false,
  handleUnifiedAnalyzeAndEvaluate
}: ScriptEditorPanelProps) {

  const renderStyleDNAWizard = () => {
    return (
      <div className="mt-3 p-4 rounded-xl bg-slate-950/40 border border-slate-900 space-y-4">
        <div className="flex items-center justify-between border-b border-slate-900 pb-2">
          <h4 className="text-[10px] font-black tracking-widest text-slate-300 uppercase flex items-center gap-1.5 font-sans">
            <Palette className="w-3.5 h-3.5 text-purple-400" /> DNA MỸ THUẬT (STYLE DNA)
          </h4>
          <button
            type="button"
            onClick={handleAISuggestStyle}
            disabled={isSuggestingStyle || (!scriptText.trim() && !rawPremise.trim())}
            className="flex items-center gap-1 px-2 py-1 bg-purple-950/40 hover:bg-purple-900/50 border border-purple-500/20 rounded text-[9px] font-black text-purple-300 uppercase tracking-wider transition-all disabled:opacity-40"
          >
            {isSuggestingStyle ? (
              <>
                <Loader2 className="w-2.5 h-2.5 animate-spin" />
                Đang thiết kế...
              </>
            ) : (
              <>
                <Sparkles className="w-2.5 h-2.5 text-purple-400" />
                AI Tự Thiết Kế
              </>
            )}
          </button>
        </div>

        {/* Dynamic Prompt Builder replacing rigid dropdowns */}
        <div className="space-y-4">
          <div className="space-y-1.5 font-sans">
            <label className="text-[9px] text-slate-400 font-bold uppercase tracking-wider block">Master Aesthetic Prompt (Visual DNA)</label>
            <textarea
              value={customStyleInstructions}
              onChange={(e) => setCustomStyleInstructions(e.target.value)}
              placeholder="Ví dụ: Cinematic 3D render, moody atmosphere, neon lights..."
              className="w-full h-16 bg-slate-950/80 border border-slate-800 focus:border-purple-500/50 rounded-lg px-2.5 py-1.5 text-[11px] text-slate-200 outline-none transition-all resize-none shadow-inner"
            />
          </div>

          <div className="bg-slate-950/40 rounded-xl p-2.5 border border-slate-800/50 space-y-2">
            <h5 className="text-[8px] text-slate-500 font-bold uppercase tracking-widest border-b border-slate-800/50 pb-1 flex items-center gap-1">
              <Palette className="w-2.5 h-2.5" /> Inspiration Chips
            </h5>
            
            <div className="space-y-1.5">
              <div className="flex items-start gap-1.5">
                <span className="text-[8px] text-slate-500 uppercase tracking-wider w-12 shrink-0 mt-0.5">Medium:</span>
                <div className="flex flex-wrap gap-1">
                  {["Cinematic Photography", "3D Pixar Stylized", "Studio Ghibli", "Oil Painting", "Unreal Engine 5"].map(tag => (
                    <button type="button" key={tag} onClick={() => setCustomStyleInstructions(customStyleInstructions ? `${customStyleInstructions}, ${tag}` : tag)} className="px-1.5 py-0.5 rounded text-[9px] bg-slate-900 text-slate-300 hover:bg-purple-600 hover:text-white border border-slate-800 hover:border-purple-500 transition-all">
                      {tag}
                    </button>
                  ))}
                </div>
              </div>
              <div className="flex items-start gap-1.5">
                <span className="text-[8px] text-slate-500 uppercase tracking-wider w-12 shrink-0 mt-0.5">Lighting:</span>
                <div className="flex flex-wrap gap-1">
                  {["Chiaroscuro", "Neon Glow", "Volumetric God Rays", "Golden Hour", "Moody Cinematic"].map(tag => (
                    <button type="button" key={tag} onClick={() => setCustomStyleInstructions(customStyleInstructions ? `${customStyleInstructions}, ${tag}` : tag)} className="px-1.5 py-0.5 rounded text-[9px] bg-slate-900 text-slate-300 hover:bg-amber-600 hover:text-white border border-slate-800 hover:border-amber-500 transition-all">
                      {tag}
                    </button>
                  ))}
                </div>
              </div>
              <div className="flex items-start gap-1.5">
                <span className="text-[8px] text-slate-500 uppercase tracking-wider w-12 shrink-0 mt-0.5">Vibe:</span>
                <div className="flex flex-wrap gap-1">
                  {["Epic", "Melancholy", "Fast-paced Action", "Cyberpunk", "Ethereal", "Retro Nostalgic 90s", "Whimsical Fairytale", "Gritty Noir"].map(tag => (
                    <button type="button" key={tag} onClick={() => setCustomStyleInstructions(customStyleInstructions ? `${customStyleInstructions}, ${tag}` : tag)} className="px-1.5 py-0.5 rounded text-[9px] bg-slate-900 text-slate-300 hover:bg-emerald-600 hover:text-white border border-slate-800 hover:border-emerald-500 transition-all">
                      {tag}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="flex justify-between items-center pt-1">
          {(() => {
            const project = projectsList.find((p: any) => p.id === selectedProjectId);
            if (!project || !project.stylePrompt) return <div />;
            return (
              <div className="text-[9px] text-purple-400 max-w-[65%] truncate" title={project.stylePrompt}>
                ✨ DNA: {project.stylePrompt}
              </div>
            );
          })()}
          <button
            type="button"
            onClick={handleSaveStyleConfig}
            disabled={isConsolidatingStyle || !selectedProjectId}
            className="flex items-center gap-1 px-3 py-1 bg-purple-600 hover:bg-purple-500 text-white rounded text-[10px] font-bold shadow-lg shadow-purple-500/10 active:scale-95 transition-all disabled:opacity-40 shrink-0 ml-auto"
          >
            {isConsolidatingStyle ? (
              <>
                <Loader2 className="w-2.5 h-2.5 animate-spin" />
                Đang lưu...
              </>
            ) : (
              <>
                <Check className="w-3 h-3" />
                Lưu & Đồng bộ DNA
              </>
            )}
          </button>
        </div>
      </div>
    );
  };

  return (
    <div className="bg-slate-950/40 border border-slate-900 rounded-2xl p-5 flex flex-col h-full overflow-hidden">
      <div className="flex items-center justify-between border-b border-slate-900 pb-3 mb-4">
        <div className="flex items-center gap-3">
          <button
            onClick={() => setEditorMode("editor")}
            className={`text-xs font-black tracking-wider uppercase font-sans transition-all pb-1.5 border-b-2 ${
              editorMode === "editor"
                ? "text-purple-400 border-purple-500"
                : "text-slate-500 border-transparent hover:text-slate-300"
            }`}
          >
            ✍️ BẢN SỌAN KỊCH BẢN (SCRIPT EDITOR)
          </button>
          <span className="text-slate-800 text-[10px] font-bold">|</span>
          <button
            onClick={() => setEditorMode("copilot")}
            className={`text-xs font-black tracking-wider uppercase font-sans transition-all pb-1.5 border-b-2 flex items-center gap-1.5 ${
              editorMode === "copilot"
                ? "text-purple-400 border-purple-500"
                : "text-slate-500 border-transparent hover:text-slate-300"
            }`}
          >
            🤖 AI SCENARIO CO-PILOT
            <span className="animate-pulse bg-purple-500/15 border border-purple-500/30 text-[8px] text-purple-300 px-1 py-0.5 rounded scale-90">Beta</span>
          </button>
        </div>

        {editorMode === "editor" && selectedEpisodeId && (
          <div className="flex items-center gap-2">
            <button
              onClick={handleSaveScript}
              disabled={isSavingScript}
              className="flex items-center gap-1.5 py-1 px-3 bg-purple-900/40 border border-purple-500/20 hover:bg-purple-900/60 disabled:bg-slate-900 disabled:text-slate-600 text-purple-300 rounded-lg text-[10px] font-black uppercase tracking-wider transition-all active:scale-95 cursor-pointer"
            >
              {isSavingScript ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  Đang lưu...
                </>
              ) : (
                <>
                  <Save className="w-3.5 h-3.5" />
                  Lưu Kịch Bản
                </>
              )}
            </button>

            {handleUnifiedAnalyzeAndEvaluate && (
              <button
                onClick={handleUnifiedAnalyzeAndEvaluate}
                disabled={isAnalyzing || isEvaluating || !scriptText.trim()}
                className="flex items-center gap-1.5 py-1 px-3 bg-gradient-to-r from-pink-600 to-purple-600 hover:from-pink-500 hover:to-purple-500 disabled:from-slate-900 disabled:to-slate-900 disabled:text-slate-600 text-white rounded-lg text-[10px] font-black uppercase tracking-wider transition-all active:scale-95 cursor-pointer shadow-md shadow-pink-600/10"
              >
                {isAnalyzing || isEvaluating ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    Đang phân tích...
                  </>
                ) : (
                  <>
                    <Sparkles className="w-3.5 h-3.5 text-pink-100" />
                    Phân tích & Đánh giá (AI)
                  </>
                )}
              </button>
            )}
          </div>
        )}
      </div>

      {editorMode === "copilot" ? (
        <div className="flex-1 flex flex-col gap-4 overflow-y-auto custom-scrollbar pr-1">
          {/* Main Idea Input */}
          <div className="flex flex-col gap-1.5 font-sans">
            <label className="text-[10px] font-black tracking-widest text-slate-400 uppercase font-sans">1. Ý tưởng cốt lõi (Core Premise)</label>
            <textarea
              value={rawPremise}
              onChange={(e) => setRawPremise(e.target.value)}
              placeholder="Nhập ý tưởng ngắn gọn của tập phim. Ví dụ: 'Tom tình cờ nhặt được một viên đá năng lượng phát sáng kỳ lạ trong rừng, mở ra một cổng không gian dẫn tới hành tinh quái thú...'"
              className="w-full h-20 bg-slate-950/80 border border-slate-900 focus:border-purple-500/50 rounded-xl p-3 text-xs text-slate-200 outline-none transition-all resize-none placeholder-slate-600 leading-relaxed"
            />
          </div>

          {/* Movie Duration Configuration */}
          <div className="grid grid-cols-2 gap-3 p-3 bg-slate-950/20 border border-slate-900/60 rounded-xl font-sans">
            <div className="flex flex-col gap-1">
              <label className="text-[9px] font-black tracking-wider text-slate-400 uppercase flex items-center gap-1">
                <Clock className="w-3 h-3 text-purple-400" /> Tổng thời lượng (giây)
              </label>
              <input
                type="number"
                min={10}
                max={600}
                value={totalDuration}
                onChange={(e) => setTotalDuration(Math.max(10, parseInt(e.target.value) || 180))}
                className="w-full bg-slate-950/80 border border-slate-900 focus:border-purple-500/50 rounded-lg px-2.5 py-1 text-xs text-slate-200 outline-none transition-all shadow-inner"
              />
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-[9px] font-black tracking-wider text-slate-400 uppercase flex items-center gap-1">
                <Gauge className="w-3 h-3 text-purple-400" /> Shot trung bình (s)
              </label>
              <input
                type="number"
                min={2}
                max={15}
                value={avgShotDuration}
                onChange={(e) => setAvgShotDuration(Math.max(2, parseFloat(e.target.value) || 4))}
                className="w-full bg-slate-950/80 border border-slate-900 focus:border-purple-500/50 rounded-lg px-2.5 py-1 text-xs text-slate-200 outline-none transition-all shadow-inner"
              />
            </div>
          </div>

          {/* AIsuggest characters */}
          <div className="flex flex-col gap-2 p-4 bg-slate-950/30 border border-slate-900/80 rounded-xl font-sans">
            <div className="flex items-center justify-between">
              <label className="text-[10px] font-black tracking-widest text-slate-400 uppercase">Nhân vật tham gia phân cảnh</label>
              <button
                type="button"
                onClick={handleAISuggestOptions}
                disabled={isExtractingCharacters || !rawPremise.trim()}
                className="py-1 px-2.5 bg-purple-950/40 hover:bg-purple-900/50 border border-purple-500/20 text-purple-300 rounded text-[9px] font-black uppercase tracking-wider transition-all disabled:opacity-40 cursor-pointer flex items-center gap-1"
              >
                {isExtractingCharacters ? (
                  <>
                    <Loader2 className="w-2.5 h-2.5 animate-spin" />
                    AI gợi ý...
                  </>
                ) : (
                  <>
                    <Sparkles className="w-2.5 h-2.5 text-purple-400" />
                    AI suggestion
                  </>
                )}
              </button>
            </div>

            {scenarioCharacters.length === 0 ? (
              <p className="text-[10px] text-slate-500 italic">Nhập Premise và click 'AI Suggestion' để phân tích dàn cast của phân cảnh.</p>
            ) : (
              <div className="flex flex-wrap gap-1.5 max-h-32 overflow-y-auto pr-1">
                {scenarioCharacters.map((charName) => {
                  const matchedAsset = projectAssets.find(
                    (a: any) => a.entityType?.toLowerCase() === "character" && a.name.toLowerCase() === charName.toLowerCase()
                  );
                  return (
                    <div
                      key={charName}
                      className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold border transition-all ${
                        matchedAsset
                          ? "bg-purple-950/40 border-purple-500/30 text-purple-300"
                          : "bg-amber-950/30 border-amber-500/20 text-amber-400"
                      }`}
                    >
                      <span className="w-1.5 h-1.5 rounded-full bg-current" />
                      <span>{charName}</span>
                      {matchedAsset ? (
                        <span className="text-[9px] opacity-60 font-normal font-sans">
                          (Matched)
                        </span>
                      ) : (
                        <span className="text-[9px] opacity-70 font-normal font-sans text-amber-500">
                          (Wrong?)
                        </span>
                      )}
                      <button
                        type="button"
                        onClick={() => {
                          setScenarioCharacters(prev => prev.filter(c => c !== charName));
                        }}
                        className="text-slate-400 hover:text-red-400 transition-colors ml-1 p-0.5"
                        title="Loại bỏ nhân vật"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </div>
                  );
                })}
              </div>
            )}

            {/* Dropdown/Quick Add from Project Assets */}
            <div className="flex flex-col gap-1 pt-2 border-t border-slate-900/60 mt-1">
              <span className="text-[9px] text-slate-500 font-sans uppercase font-bold tracking-wider">Thêm/Đồng bộ nhân vật từ dự án:</span>
              <div className="flex flex-wrap gap-1">
                {projectAssets
                  .filter((a: any) => a.entityType?.toLowerCase() === "character")
                  .map((asset: any) => {
                    const isAdded = scenarioCharacters.some(c => c.toLowerCase() === asset.name.toLowerCase());
                    return (
                      <button
                        key={asset.id}
                        type="button"
                        onClick={() => {
                          if (isAdded) {
                            setScenarioCharacters(prev => prev.filter(c => c.toLowerCase() !== asset.name.toLowerCase()));
                          } else {
                            setScenarioCharacters(prev => [...prev, asset.name]);
                          }
                        }}
                        className={`px-2 py-0.5 rounded text-[9px] font-sans transition-colors border ${
                          isAdded 
                            ? "bg-purple-900/40 border-purple-500/30 text-purple-300 hover:bg-purple-900/60"
                            : "bg-slate-900 border-slate-800 text-slate-400 hover:bg-slate-800 hover:text-slate-200"
                        }`}
                      >
                        {isAdded ? `✓ ${asset.name}` : `+ ${asset.name}`}
                      </button>
                    );
                  })}
              </div>
            </div>
          </div>

          {renderStyleDNAWizard()}

          {/* Questions & Options */}
          {!hasGeneratedOptions ? (
            <EmptyState
              icon={Sparkles}
              title="Chưa kích hoạt Options cá nhân hóa"
              description="Sếp vui lòng điền ý tưởng cốt lõi và nhấn nút 'AI Generate Options' ở trên để tự động phân tích và tạo các tùy chọn kịch tính cá nhân hóa độc quyền nhé!"
              className="mt-2"
            />
          ) : (
            <div className="flex flex-col gap-3.5">
              {/* Q1: Emotion */}
              <div className="flex flex-col gap-1.5">
                <div className="flex items-center justify-between">
                  <label className="text-[11px] font-bold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
                    <Flame className="w-3.5 h-3.5 text-red-400" /> 2. Cảm xúc chủ đạo kịch tính (Emotion)
                  </label>
                  <span className="text-[9px] text-slate-500 italic">(Double-click chip to edit)</span>
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {getDynamicOptions().emotions.map((opt) => (
                    <button
                      key={opt}
                      onClick={() => setSelectedEmotion(opt)}
                      onDoubleClick={() => handleEditChip("emotions", opt)}
                      className={`px-2.5 py-1 rounded-lg text-[10px] font-medium border transition-all ${
                        selectedEmotion === opt
                          ? "bg-purple-600/20 border-purple-500 text-purple-300 shadow-md shadow-purple-500/10"
                          : "bg-slate-900 border-slate-850 text-slate-400 hover:text-slate-300"
                      }`}
                    >
                      {opt}
                    </button>
                  ))}
                </div>
                <div className="flex items-center gap-1.5 mt-1 bg-slate-950/40 rounded-lg p-1 border border-slate-900">
                  <input
                    type="text"
                    placeholder="Thêm cảm xúc tùy chỉnh..."
                    value={newEmotionInput}
                    onChange={(e) => setNewEmotionInput(e.target.value)}
                    className="flex-1 bg-transparent border-none text-[10px] text-slate-200 px-2 py-0.5 outline-none placeholder-slate-600 font-sans"
                  />
                  <button
                    onClick={() => {
                      if (!newEmotionInput.trim()) return;
                      setCustomEmotions([...(customEmotions.length > 0 ? customEmotions : getDynamicOptions().emotions), newEmotionInput.trim()]);
                      setSelectedEmotion(newEmotionInput.trim());
                      setNewEmotionInput("");
                    }}
                    className="px-2 py-0.5 bg-purple-600 text-white rounded text-[10px] font-extrabold cursor-pointer active:scale-95 transition-all"
                  >
                    +
                  </button>
                </div>
              </div>

              {/* Q2: Twist / Causality */}
              <div className="flex flex-col gap-1.5">
                <div className="flex items-center justify-between">
                  <label className="text-[11px] font-bold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
                    <Compass className="w-3.5 h-3.5 text-blue-400" /> 3. Nút thắt & Nhân quả (Causality)
                  </label>
                  <span className="text-[9px] text-slate-500 italic">(Double-click chip to edit)</span>
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {getDynamicOptions().twists.map((opt) => (
                    <button
                      key={opt}
                      onClick={() => setSelectedTwist(opt)}
                      onDoubleClick={() => handleEditChip("twists", opt)}
                      className={`px-2.5 py-1 rounded-lg text-[10px] font-medium border transition-all ${
                        selectedTwist === opt
                          ? "bg-purple-600/20 border-purple-500 text-purple-300 shadow-md shadow-purple-500/10"
                          : "bg-slate-900 border-slate-850 text-slate-400 hover:text-slate-300"
                      }`}
                    >
                      {opt}
                    </button>
                  ))}
                </div>
                <div className="flex items-center gap-1.5 mt-1 bg-slate-950/40 rounded-lg p-1 border border-slate-900">
                  <input
                    type="text"
                    placeholder="Thêm nút thắt tùy chỉnh..."
                    value={newTwistInput}
                    onChange={(e) => setNewTwistInput(e.target.value)}
                    className="flex-1 bg-transparent border-none text-[10px] text-slate-200 px-2 py-0.5 outline-none placeholder-slate-600 font-sans"
                  />
                  <button
                    onClick={() => {
                      if (!newTwistInput.trim()) return;
                      setCustomTwists([...(customTwists.length > 0 ? customTwists : getDynamicOptions().twists), newTwistInput.trim()]);
                      setSelectedTwist(newTwistInput.trim());
                      setNewTwistInput("");
                    }}
                    className="px-2 py-0.5 bg-purple-600 text-white rounded text-[10px] font-extrabold cursor-pointer active:scale-95 transition-all"
                  >
                    +
                  </button>
                </div>
              </div>

              {/* Q3: Visual Key */}
              <div className="flex flex-col gap-1.5">
                <div className="flex items-center justify-between">
                  <label className="text-[11px] font-bold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
                    <Camera className="w-3.5 h-3.5 text-pink-400" /> 4. Bối cảnh điện ảnh chủ đạo (Visual)
                  </label>
                  <span className="text-[9px] text-slate-500 italic">(Double-click chip to edit)</span>
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {getDynamicOptions().visuals.map((opt) => (
                    <button
                      key={opt}
                      onClick={() => setSelectedVisual(opt)}
                      onDoubleClick={() => handleEditChip("visuals", opt)}
                      className={`px-2.5 py-1 rounded-lg text-[10px] font-medium border transition-all ${
                        selectedVisual === opt
                          ? "bg-purple-600/20 border-purple-500 text-purple-300 shadow-md shadow-purple-500/10"
                          : "bg-slate-900 border-slate-850 text-slate-400 hover:text-slate-300"
                      }`}
                    >
                      {opt}
                    </button>
                  ))}
                </div>
                <div className="flex items-center gap-1.5 mt-1 bg-slate-950/40 rounded-lg p-1 border border-slate-900">
                  <input
                    type="text"
                    placeholder="Thêm bối cảnh tùy chỉnh..."
                    value={newVisualInput}
                    onChange={(e) => setNewVisualInput(e.target.value)}
                    className="flex-1 bg-transparent border-none text-[10px] text-slate-200 px-2 py-0.5 outline-none placeholder-slate-600 font-sans"
                  />
                  <button
                    onClick={() => {
                      if (!newVisualInput.trim()) return;
                      setCustomVisuals([...(customVisuals.length > 0 ? customVisuals : getDynamicOptions().visuals), newVisualInput.trim()]);
                      setSelectedVisual(newVisualInput.trim());
                      setNewVisualInput("");
                    }}
                    className="px-2 py-0.5 bg-purple-600 text-white rounded text-[10px] font-extrabold cursor-pointer active:scale-95 transition-all"
                  >
                    +
                  </button>
                </div>
              </div>

              {/* Q4: Retention Hook */}
              <div className="flex flex-col gap-1.5">
                <div className="flex items-center justify-between">
                  <label className="text-[11px] font-bold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
                    <Gauge className="w-3.5 h-3.5 text-yellow-400" /> 5. Giữ chân người xem 3s đầu (Retention)
                  </label>
                  <span className="text-[9px] text-slate-500 italic">(Double-click chip to edit)</span>
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {getDynamicOptions().retentions.map((opt) => (
                    <button
                      key={opt}
                      onClick={() => setSelectedRetention(opt)}
                      onDoubleClick={() => handleEditChip("retentions", opt)}
                      className={`px-2.5 py-1 rounded-lg text-[10px] font-medium border transition-all ${
                        selectedRetention === opt
                          ? "bg-purple-600/20 border-purple-500 text-purple-300 shadow-md shadow-purple-500/10"
                          : "bg-slate-900 border-slate-850 text-slate-400 hover:text-slate-300"
                      }`}
                    >
                      {opt}
                    </button>
                  ))}
                </div>
                <div className="flex items-center gap-1.5 mt-1 bg-slate-950/40 rounded-lg p-1 border border-slate-900">
                  <input
                    type="text"
                    placeholder="Thêm hook giữ chân..."
                    value={newRetentionInput}
                    onChange={(e) => setNewRetentionInput(e.target.value)}
                    className="flex-1 bg-transparent border-none text-[10px] text-slate-200 px-2 py-0.5 outline-none placeholder-slate-600 font-sans"
                  />
                  <button
                    onClick={() => {
                      if (!newRetentionInput.trim()) return;
                      setCustomRetentions([...(customRetentions.length > 0 ? customRetentions : getDynamicOptions().retentions), newRetentionInput.trim()]);
                      setSelectedRetention(newRetentionInput.trim());
                      setNewRetentionInput("");
                    }}
                    className="px-2 py-0.5 bg-purple-600 text-white rounded text-[10px] font-extrabold cursor-pointer active:scale-95 transition-all"
                  >
                    +
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Compile Button */}
          <button
            onClick={handleCompileScreenplay}
            disabled={isCompilingCopilot || !rawPremise.trim()}
            className="mt-2 flex items-center justify-center gap-2 py-3 bg-gradient-to-r from-purple-600 via-pink-600 to-pink-500 hover:from-purple-500 hover:to-pink-400 disabled:from-purple-900/40 disabled:to-pink-950/30 text-white rounded-xl text-xs font-bold shadow-lg shadow-purple-500/20 active:scale-98 transition-all border border-purple-500/30 font-sans"
          >
            {isCompilingCopilot ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin text-white" />
                Biên soạn & Cấu trúc kịch bản điện ảnh...
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4 text-purple-100" />
                ⚡ Biên soạn & Tạo Kịch Bản Chi Tiết
              </>
            )}
          </button>
        </div>
      ) : (
        <div className="flex-1 flex flex-col gap-4 overflow-y-auto custom-scrollbar pr-1">
          <textarea
            value={scriptText}
            onChange={(e) => setScriptText(e.target.value)}
            disabled={!selectedEpisodeId}
            placeholder={
              selectedEpisodeId 
                ? "Nhập kịch bản của bạn tại đây...\n\nVí dụ:\nCảnh 1. Trong rừng hoang vắng - Ban ngày\nHành động: Tom đang chạy trốn những quái thú đột biến gầm rú đằng sau.\nTom: (Thở hổn hển) Tôi không thể gục ngã tại đây được!\n\nSử dụng các nhãn kịch bản chuẩn (Cảnh 1, Hành động, Nhân vật, Lời thoại) để AI phân tích chính xác nhất."
                : "Vui lòng chọn hoặc khởi tạo một Tập phim để viết kịch bản..."
            }
            className="w-full min-h-[300px] flex-1 bg-slate-950/80 border border-slate-900 focus:border-purple-500/50 rounded-xl p-4 text-sm text-slate-200 font-mono outline-none resize-none focus:ring-1 focus:ring-purple-500/30 transition-all custom-scrollbar placeholder-neutral-500 leading-relaxed"
          />
          {renderStyleDNAWizard()}
        </div>
      )}
    </div>
  );
}
