"use client";

import React from "react";
import {
  Sliders,
  Sparkles,
  HelpCircle,
  Compass,
  RefreshCw,
  Save,
  Loader2,
  Check,
  Clock,
  Eye,
  AlertTriangle,
  AlertCircle,
  Trash2,
  Camera,
  Layers,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  Clapperboard,
} from "lucide-react";
import { EmptyState } from "./EmptyState";
import { ShotCard } from "./ShotCard";
import { ShotTableRow } from "./ShotTableRow";
import { VideoSequencePanel } from "./VideoSequencePanel";
import { SceneTableView } from './SceneTableView';
import { SceneCardView } from './SceneCardView';
import { ShotCardView } from './ShotCardView';


interface CalibrationSectionProps {
  parsedData: any;
  pipelineStage: "scene" | "shot" | "video";
  setPipelineStage: (stage: "scene" | "shot" | "video") => void;
  calibratingSceneId: string | null;
  calibratingStatus: string;
  calibrationStep: number;
  calibrations: Record<string, any>;
  handleCalibrateScene: (s: any) => void;
  handleUpdateCalibrationField: (sceneId: string, stage: string, field: string, value: any) => void;
  characterMappings: Record<string, string>;
  locationMappings: Record<string, string>;
  propMappings: Record<string, string>;
  projectAssets: any[];
  handleExportNewAsset: (name: string, type: any) => any;
  handleUpdateCausalFlowField: (sceneId: string, field: string, value: any) => void;
  handleSaveCalibratedScene: (sceneId: string) => Promise<void>;
  savingSceneId: string | null;
  batchGeneratingShots: boolean;
  batchShotsProgress: { current: number; total: number; text: string };
  handleGenerateAllStoryboardFrames: () => void;
  shotViewTab: "cards" | "table";
  setShotViewTab: (tab: "cards" | "table") => void;
  handleUpdateShotField: (beatId: string, field: string, value: any) => void;
  getComputedShotPrompt: (sh: any) => string;
  getDetectedAssetsForShot: (sh: any) => any;
  generatingShots: Record<string, boolean>;
  handleGenerateShotFrame: (sh: any) => void;
  runVerification: (sh: any) => any;
  calculateTransitionRisk: (prevScene: any, s: any, prevCalib: any, calib: any) => any;
  checkCinematographyViolations: (prevCalib: any, calib: any, hasSharedChars: boolean) => any;
  projectsList: any[];
  selectedProjectId: string;
  handleInsertGlueShot: (prevSceneId: string) => void;
  handleScanCohesion?: () => void;

  // New pipeline & shot props
  apiEndpoint: string;
  handleUpdateApiEndpoint: (url: string) => void;
  aiProvider: string;
  handleUpdateAiProvider: (provider: string) => void;
  handleDeleteShot: (beat: string) => void;
  handleAddShot: (sceneCode: string) => void;
  handleDecomposeShots: () => void;
  getReferenceImagesForShot: (sh: any) => string[];
  draftAssets: any;
  storyboardAssets?: any[];
}

export const CalibrationSection: React.FC<CalibrationSectionProps> = ({
  parsedData,
  pipelineStage,
  setPipelineStage,
  calibratingSceneId,
  calibratingStatus,
  calibrationStep,
  calibrations,
  handleCalibrateScene,
  handleUpdateCalibrationField,
  characterMappings,
  locationMappings,
  propMappings,
  projectAssets,
  handleExportNewAsset,
  handleUpdateCausalFlowField,
  handleSaveCalibratedScene,
  savingSceneId,
  batchGeneratingShots,
  batchShotsProgress,
  handleGenerateAllStoryboardFrames,
  shotViewTab,
  setShotViewTab,
  handleUpdateShotField,
  getComputedShotPrompt,
  getDetectedAssetsForShot,
  generatingShots,
  handleGenerateShotFrame,
  runVerification,
  calculateTransitionRisk,
  checkCinematographyViolations,
  projectsList,
  selectedProjectId,
  handleInsertGlueShot,
  handleScanCohesion,

  apiEndpoint,
  handleUpdateApiEndpoint,
  aiProvider,
  handleUpdateAiProvider,
  handleDeleteShot,
  handleAddShot,
  handleDecomposeShots,
  getReferenceImagesForShot,
  draftAssets,
  storyboardAssets
}) => {
  const [sceneCardView, setSceneCardView] = React.useState<"card" | "table">("table");
  const [zoomLevel, setZoomLevel] = React.useState<"sm" | "md" | "lg">("md");
  const [shotLayoutMode, setShotLayoutMode] = React.useState<"row" | "grid">("grid");

  const getSceneCharacters = (s: any) => {
    if (s.characters && Array.isArray(s.characters) && s.characters.length > 0) return s.characters;
    if (!parsedData?.characters) return [];
    return parsedData.characters
      .filter((c: any) => 
        s.tags?.some((t: string) => t.toLowerCase() === c.name.toLowerCase()) ||
        s.title?.toLowerCase().includes(c.name.toLowerCase()) || 
        s.description?.toLowerCase().includes(c.name.toLowerCase())
      )
      .map((c: any) => c.name);
  };

  const getSceneLocations = (s: any) => {
    if (s.locations && Array.isArray(s.locations) && s.locations.length > 0) return s.locations;
    if (!parsedData?.locations) return [];
    return parsedData.locations
      .filter((l: any) => 
        s.tags?.some((t: string) => t.toLowerCase() === l.name.toLowerCase()) ||
        s.title?.toLowerCase().includes(l.name.toLowerCase()) || 
        s.description?.toLowerCase().includes(l.name.toLowerCase())
      )
      .map((l: any) => l.name);
  };

  const PIPELINE_STEPS = [
    { id: "scene", label: "1. Cấu trúc Scene", desc: "Hiệu chỉnh Causal Flow & Macro Camera", icon: Sliders },
    { id: "shot", label: "2. Bóc tách Shot", desc: "Phân rã chi tiết & Micro-Direction", icon: Layers },
    { id: "video", label: "3. Video Sequence", desc: "Orchestrator & Render", icon: Clapperboard }
  ] as const;

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {parsedData ? (
        <div className="space-y-6">
          {/* Cinematic Pipeline Integration Panel */}
          <div className="bg-[#0b0e1e]/85 border border-slate-900 rounded-2xl p-4 space-y-3 relative overflow-hidden backdrop-blur-md shadow-xl">
            <div className="absolute right-0 top-0 w-32 h-32 bg-purple-500/5 rounded-full blur-2xl pointer-events-none" />
            <div className="flex items-center justify-between pb-2 border-b border-slate-900/60">
              <div className="flex items-center gap-2">
                <Sliders className="w-4 h-4 text-purple-400" />
                <span className="text-xs font-black uppercase tracking-wider text-slate-200">
                  Cinematic Pipeline Integration Configuration
                </span>
              </div>
              <span className="text-[8px] text-purple-300 font-extrabold uppercase bg-purple-950/40 px-2 py-0.5 rounded border border-purple-900/40">
                Active Client Pipeline
              </span>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* API Gateway Endpoint Selector */}
              <div className="space-y-1.5">
                <label className="block text-[9px] text-slate-500 font-extrabold uppercase tracking-wider">
                  API Gateway Endpoint (Dynamic API URL)
                </label>
                <div className="flex gap-1.5">
                  <select
                    value={["https://dev-hub.storymee.com/api", "http://localhost:5100/api"].includes(apiEndpoint) ? apiEndpoint : "custom"}
                    onChange={(e) => {
                      if (e.target.value !== "custom") {
                        handleUpdateApiEndpoint(e.target.value);
                      } else {
                        handleUpdateApiEndpoint("http://localhost:5100/api"); // Default template
                      }
                    }}
                    className="bg-slate-950 border border-slate-900 rounded-lg px-2 py-1.5 text-slate-300 outline-none text-[10px] flex-1 font-mono font-bold"
                  >
                    <option value="https://dev-hub.storymee.com/api">Production VPS Gateway</option>
                    <option value="http://localhost:5100/api">Local Gateway (Port 5100)</option>
                    <option value="custom">Custom Endpoint...</option>
                  </select>
                  
                  {/* Text input for custom endpoint */}
                  {!["https://dev-hub.storymee.com/api", "http://localhost:5100/api"].includes(apiEndpoint) && (
                    <input
                      type="text"
                      value={apiEndpoint}
                      onChange={(e) => handleUpdateApiEndpoint(e.target.value)}
                      placeholder="http://127.0.0.1:5100/api"
                      className="bg-slate-950 border border-slate-900 rounded-lg px-2.5 py-1 text-slate-300 outline-none text-[10px] font-mono flex-1 border-purple-900/50"
                    />
                  )}
                </div>
                <p className="text-[8px] text-slate-600 font-medium">
                  Overrides default Next.js server endpoint in client-side runtime. Saves automatically.
                </p>
              </div>

              {/* AI Image Provider Selector */}
              <div className="space-y-1.5">
                <label className="block text-[9px] text-slate-500 font-extrabold uppercase tracking-wider">
                  AI Image Provider Rig
                </label>
                <select
                  value={aiProvider}
                  onChange={(e) => handleUpdateAiProvider(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-900 rounded-lg px-2 py-1.5 text-slate-300 outline-none text-[10px] font-black uppercase tracking-wider"
                >
                  <option value="gflow">GFlow Extension (Chrome Background Automation)</option>
                  <option value="openai">OpenAI DALL-E 3 (Cloud API)</option>
                  <option value="picsart">Picsart Core Service (Cloud API)</option>
                  <option value="topview">TopView Automation Engine</option>
                </select>
                <p className="text-[8px] text-slate-600 font-medium">
                  Configures image rendering pipelines. GFlow routes actions through your browser.
                </p>
              </div>
            </div>
          </div>

          {/* Stepper Navigation */}
          <div className="flex items-center gap-2 p-1.5 bg-slate-950/80 border border-slate-900/60 rounded-xl">
            {PIPELINE_STEPS.map((step) => {
              const Icon = step.icon;
              const isActive = pipelineStage === step.id;
              return (
                <button
                  key={step.id}
                  onClick={() => setPipelineStage(step.id)}
                  className={`flex-1 flex flex-col items-center justify-center p-3 rounded-lg transition-all duration-300 ${
                    isActive 
                      ? "bg-purple-900/20 border border-purple-500/30 text-purple-400 shadow-[0_0_15px_rgba(168,85,247,0.15)]"
                      : "bg-transparent border border-transparent text-slate-500 hover:text-slate-300 hover:bg-slate-900/50"
                  }`}
                >
                  <Icon className={`w-5 h-5 mb-1.5 ${isActive ? "text-purple-400 animate-pulse" : "text-slate-600"}`} />
                  <span className="text-[11px] font-black uppercase tracking-widest">{step.label}</span>
                  <span className="text-[9px] mt-1 font-medium hidden md:block opacity-70">{step.desc}</span>
                </button>
              );
            })}
          </div>

          <div className="space-y-4">
            {pipelineStage === "scene" && (
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between border-b border-slate-900 pb-3 gap-2">
                <div>
                  <h4 className="text-xs font-black tracking-widest text-slate-400 uppercase">Interactive Cinematic Calibration Engine</h4>
                  <p className="text-[10px] text-slate-500 mt-0.5">Define camera mechanics and verify structural cause-and-effect transitions</p>
                </div>
                <div className="flex items-center gap-1.5 bg-slate-950/60 p-0.5 rounded-lg border border-slate-900 self-start sm:self-auto">
                  <button
                    onClick={() => setSceneCardView("card")}
                    className={`px-3 py-1 rounded-md text-[10px] font-black uppercase tracking-wider transition-all ${sceneCardView === "card" ? "bg-purple-600 text-white shadow-md shadow-purple-600/20" : "text-slate-400 hover:text-slate-200"}`}
                  >
                    Card View
                  </button>
                  <button
                    onClick={() => setSceneCardView("table")}
                    className={`px-3 py-1 rounded-md text-[10px] font-black uppercase tracking-wider transition-all ${sceneCardView === "table" ? "bg-purple-600 text-white shadow-md shadow-purple-600/20" : "text-slate-400 hover:text-slate-200"}`}
                  >
                    Causal Flow Table
                  </button>
                </div>
              </div>
            )}

            {/* Causal Flow Explainer Banner */}
            {pipelineStage === "scene" && (
              <div className="bg-[#0b0e1e]/80 border border-slate-900 rounded-2xl p-4 space-y-3 relative overflow-hidden backdrop-blur-md shadow-xl">
                <div className="absolute right-0 top-0 w-32 h-32 bg-purple-500/5 rounded-full blur-2xl pointer-events-none" />
                <div className="flex items-center gap-2 pb-2 border-b border-slate-900/60">
                  <HelpCircle className="w-4 h-4 text-purple-400" />
                  <span className="text-xs font-black uppercase tracking-wider text-slate-200">
                    Phân Biệt: Causal Flow (Nhân Quả Cảnh) vs. Shot List (Storyboard Chi Tiết)
                  </span>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-[11px] text-slate-400 leading-relaxed font-sans">
                  <div className="space-y-1.5 border-r border-slate-900/40 pr-4">
                    <div className="flex items-center gap-1.5 text-purple-400 font-bold">
                      <Sliders className="w-3.5 h-3.5" />
                      <span>Causal Flow (Tầm Vĩ Mô - Macro Director Blueprint)</span>
                    </div>
                    <p>
                      Là trung tâm **thiết lập cấu trúc phim**. Giúp Sếp cân chỉnh camera ảo (Focal length, Lighting), xác định chuyển tiếp âm thanh (Audio transition), tính liên kết nhân quả giữa các cảnh để giữ chân khán giả, và tự động kiểm tra lỗi trùng lặp/thiếu nhân vật (DNA Continuity & AI Drift QC).
                    </p>
                    <div className="text-[10px] text-pink-400 bg-pink-950/20 border border-pink-900/30 rounded px-2 py-1 mt-1 font-semibold">
                      💡 Thiết lập hiệu chuẩn tại đây sẽ trực tiếp kế thừa xuống các shot làm khung DNA chuẩn, giúp ngăn chặn trôi lệch phong cách (Style Drift).
                    </div>
                  </div>
                  <div className="space-y-1.5">
                    <div className="flex items-center gap-1.5 text-pink-400 font-bold">
                      <Layers className="w-3.5 h-3.5" />
                      <span>Shot List (Tầm Vi Mô - Detailed Frame Pipeline)</span>
                    </div>
                    <p>
                      Là các phân cảnh/khung hình cụ thể để gửi cho họa sĩ (hoặc AI generator) vẽ tranh. Mỗi cảnh (Scene) được chia thành 3 - 6 Shot tương ứng với sự tiến triển hành động nhỏ. Shot List kế thừa Virtual Camera Rig và LUT từ Causal Flow nhưng cho phép ghi đè chi tiết các hành động vật lý (Physical Action).
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Main view router */}
            {pipelineStage === "scene" && sceneCardView === "card" && (
              <SceneCardView 
                parsedData={parsedData}
                calibrations={calibrations}
                calibratingSceneId={calibratingSceneId}
                calibratingStatus={calibratingStatus}
                calibrationStep={calibrationStep}
                savingSceneId={savingSceneId}
                handleCalibrateScene={handleCalibrateScene}
                handleUpdateCalibrationField={handleUpdateCalibrationField}
                handleSaveCalibratedScene={handleSaveCalibratedScene}
                calculateTransitionRisk={calculateTransitionRisk}
                checkCinematographyViolations={checkCinematographyViolations}
                getSceneCharacters={getSceneCharacters}
                characterMappings={characterMappings}
                locationMappings={locationMappings}
                propMappings={propMappings}
                projectAssets={projectAssets}
                handleExportNewAsset={handleExportNewAsset}
                handleUpdateCausalFlowField={handleUpdateCausalFlowField}
                batchGeneratingShots={batchGeneratingShots}
                batchShotsProgress={batchShotsProgress}
                handleGenerateAllStoryboardFrames={handleGenerateAllStoryboardFrames}
                shotViewTab={shotViewTab}
                setShotViewTab={setShotViewTab}
                handleUpdateShotField={handleUpdateShotField}
                getComputedShotPrompt={getComputedShotPrompt}
                getDetectedAssetsForShot={getDetectedAssetsForShot}
                generatingShots={generatingShots}
                handleGenerateShotFrame={handleGenerateShotFrame}
                runVerification={runVerification}
                handleDeleteShot={handleDeleteShot}
                handleAddShot={handleAddShot}
                handleDecomposeShots={handleDecomposeShots}
                getReferenceImagesForShot={getReferenceImagesForShot}
                draftAssets={draftAssets}
                storyboardAssets={storyboardAssets}
                pipelineStage={pipelineStage}
                setShotLayoutMode={setShotLayoutMode}
                shotLayoutMode={shotLayoutMode}
                setZoomLevel={setZoomLevel}
                zoomLevel={zoomLevel}

              />
            )}
            {pipelineStage === "scene" && sceneCardView === "table" && (
<SceneTableView 
                parsedData={parsedData}
                calibrations={calibrations}
                calibratingSceneId={calibratingSceneId}
                calibratingStatus={calibratingStatus}
                savingSceneId={savingSceneId}
                handleCalibrateScene={handleCalibrateScene}
                handleUpdateCalibrationField={handleUpdateCalibrationField}
                handleSaveCalibratedScene={handleSaveCalibratedScene}
                handleUpdateCausalFlowField={handleUpdateCausalFlowField}
                calculateTransitionRisk={calculateTransitionRisk}
                checkCinematographyViolations={checkCinematographyViolations}
                getSceneCharacters={getSceneCharacters}
                characterMappings={characterMappings}
                locationMappings={locationMappings}
                propMappings={propMappings}
                projectAssets={projectAssets}
                handleExportNewAsset={handleExportNewAsset}
                batchGeneratingShots={batchGeneratingShots}
                batchShotsProgress={batchShotsProgress}
                handleGenerateAllStoryboardFrames={handleGenerateAllStoryboardFrames}
                shotViewTab={shotViewTab}
                setShotViewTab={setShotViewTab}
                handleUpdateShotField={handleUpdateShotField}
                getComputedShotPrompt={getComputedShotPrompt}
                getDetectedAssetsForShot={getDetectedAssetsForShot}
                generatingShots={generatingShots}
                handleGenerateShotFrame={handleGenerateShotFrame}
                runVerification={runVerification}
                handleDeleteShot={handleDeleteShot}
                handleAddShot={handleAddShot}
                handleDecomposeShots={handleDecomposeShots}
                getReferenceImagesForShot={getReferenceImagesForShot}
                draftAssets={draftAssets}
                storyboardAssets={storyboardAssets}
                pipelineStage={pipelineStage}
                setShotLayoutMode={setShotLayoutMode}
                shotLayoutMode={shotLayoutMode}
                setZoomLevel={setZoomLevel}
                zoomLevel={zoomLevel}

              />
            )}

            {pipelineStage === "shot" && (
              <ShotCardView
                parsedData={parsedData}
                calibrations={calibrations}
                calibratingSceneId={calibratingSceneId}
                calibratingStatus={calibratingStatus}
                calibrationStep={calibrationStep}
                savingSceneId={savingSceneId}
                handleCalibrateScene={handleCalibrateScene}
                handleUpdateCalibrationField={handleUpdateCalibrationField}
                handleSaveCalibratedScene={handleSaveCalibratedScene}
                calculateTransitionRisk={calculateTransitionRisk}
                checkCinematographyViolations={checkCinematographyViolations}
                getSceneCharacters={getSceneCharacters}
                characterMappings={characterMappings}
                locationMappings={locationMappings}
                projectAssets={projectAssets}
                getSceneLocations={getSceneLocations}
                handleExportNewAsset={handleExportNewAsset}
                propMappings={propMappings}
                handleUpdateCausalFlowField={handleUpdateCausalFlowField}
                batchGeneratingShots={batchGeneratingShots}
                batchShotsProgress={batchShotsProgress}
                handleGenerateAllStoryboardFrames={handleGenerateAllStoryboardFrames}
                shotViewTab={shotViewTab}
                setShotViewTab={setShotViewTab}
                handleUpdateShotField={handleUpdateShotField}
                getComputedShotPrompt={getComputedShotPrompt}
                getDetectedAssetsForShot={getDetectedAssetsForShot}
                generatingShots={generatingShots}
                handleGenerateShotFrame={handleGenerateShotFrame}
                runVerification={runVerification}
                handleDeleteShot={handleDeleteShot}
                handleAddShot={handleAddShot}
                handleDecomposeShots={handleDecomposeShots}
                getReferenceImagesForShot={getReferenceImagesForShot}
                draftAssets={draftAssets}
                storyboardAssets={storyboardAssets}
                pipelineStage={pipelineStage}
                setShotLayoutMode={setShotLayoutMode}
                shotLayoutMode={shotLayoutMode}
                setZoomLevel={setZoomLevel}
                zoomLevel={zoomLevel}
                ShotTableRow={ShotTableRow}
                ShotCard={ShotCard}
              />
            )}

            {pipelineStage === "video" && (
              <VideoSequencePanel 
                parsedData={parsedData} 
                projectsList={projectsList} 
                selectedProjectId={selectedProjectId} 
              />
            )}
          </div>
        </div>
      ) : (
        <EmptyState icon={Clapperboard} title="Chưa có dữ liệu liên kết kịch bản" description="Vui lòng phân tích kịch bản trước ở Tab 1." />
      )}
    </div>
  );
};
