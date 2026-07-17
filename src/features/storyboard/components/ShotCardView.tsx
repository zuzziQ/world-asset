import React from 'react';
import { Loader2, Camera, Check, Compass, AlertTriangle, AlertCircle, Save, Sparkles, Sliders, Layers } from 'lucide-react';

export const ShotCardView = ({
  parsedData, calibrations, calibratingSceneId, calibratingStatus, calibrationStep, savingSceneId,
  handleCalibrateScene, handleUpdateCalibrationField, handleSaveCalibratedScene, calculateTransitionRisk,
  checkCinematographyViolations, getSceneCharacters, characterMappings = {}, locationMappings = {}, projectAssets = [],
  getSceneLocations = () => [], handleExportNewAsset = () => {},
  propMappings, handleUpdateCausalFlowField, batchGeneratingShots, batchShotsProgress, handleGenerateAllStoryboardFrames,
  shotViewTab, setShotViewTab, handleUpdateShotField, getComputedShotPrompt, getDetectedAssetsForShot, generatingShots,
  handleGenerateShotFrame, runVerification, handleDeleteShot, handleAddShot, handleDecomposeShots, getReferenceImagesForShot,
  draftAssets, storyboardAssets, pipelineStage, setShotLayoutMode, shotLayoutMode, setZoomLevel, zoomLevel,
  ShotTableRow, ShotCard
}: any) => {
  return (
    <>
              <div className="space-y-6">
                {/* Analytic Dashboard for Shot Distribution */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  <div className="bg-slate-950 border border-slate-900 rounded-2xl p-4 text-center font-sans">
                    <span className="text-[9px] text-slate-500 font-bold block uppercase tracking-wider">Total Shot Count</span>
                    <div className="text-xl font-black text-slate-200 mt-1 font-mono">
                      {parsedData.shots?.length || 0}
                    </div>
                  </div>
                  <div className="bg-slate-950 border border-slate-900 rounded-2xl p-4 text-center font-sans">
                    <span className="text-[9px] text-slate-500 font-bold block uppercase tracking-wider">Pacing Profile</span>
                    <div className="text-[11px] font-black text-purple-400 mt-2 uppercase tracking-wide">
                      Moderate Cinematic
                    </div>
                  </div>
                  <div className="bg-slate-950 border border-slate-900 rounded-2xl p-4 text-center font-sans">
                    <span className="text-[9px] text-slate-500 font-bold block uppercase tracking-wider">Style Conformity</span>
                    <div className="text-xl font-black text-emerald-400 mt-1 font-mono">
                      100%
                    </div>
                  </div>
                  <div className="bg-slate-950 border border-slate-900 rounded-2xl p-4 text-center font-sans">
                    <span className="text-[9px] text-slate-500 font-bold block uppercase tracking-wider">Automation Status</span>
                    <div className="text-[10px] font-black text-slate-400 mt-2 uppercase">
                      Active API Link
                    </div>
                  </div>
                </div>

                {/* Batch Generation Control Panel */}
                <div className="bg-[#0b0e1e] border border-slate-900 rounded-3xl p-5 relative overflow-hidden flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div className="absolute top-0 right-0 w-24 h-24 bg-purple-500/5 rounded-full blur-2xl pointer-events-none" />
                  <div>
                    <h5 className="text-xs font-black uppercase tracking-wider text-slate-200 flex items-center gap-1.5">
                      <Sparkles className="w-4 h-4 text-purple-400" /> Storyboard Batch Automation Engine
                    </h5>
                    <p className="text-[10px] text-slate-400 mt-1 leading-relaxed max-w-xl">
                      Tự động hóa toàn bộ quá trình sinh hình ảnh cho tất cả các Shot. Tự động liên kết Master Style DNA của Project và các DNA đã phê duyệt của từng Nhân vật, Địa điểm, Đạo cụ.
                    </p>
                  </div>

                  <div className="flex items-center gap-2 self-start md:self-auto shrink-0">
                    <button
                      onClick={handleDecomposeShots}
                      className="px-5 py-3 rounded-2xl text-[10px] font-extrabold uppercase tracking-widest bg-slate-900 border border-slate-800 hover:bg-slate-800 text-slate-300 shadow-lg active:scale-95 transition-all flex items-center gap-2"
                    >
                      <Layers className="w-4 h-4 text-purple-400" />
                      <span>Bóc Tách Shots</span>
                    </button>

                    <button
                      onClick={handleGenerateAllStoryboardFrames}
                      disabled={batchGeneratingShots}
                      className="px-5 py-3 rounded-2xl text-[10px] font-extrabold uppercase tracking-widest bg-gradient-to-r from-purple-600 to-pink-500 hover:from-purple-500 hover:to-pink-400 text-white shadow-lg shadow-purple-500/20 active:scale-95 transition-all flex items-center gap-2"
                    >
                      {batchGeneratingShots ? (
                        <>
                          <Loader2 className="w-4 h-4 animate-spin" />
                          <span>Generating...</span>
                        </>
                      ) : (
                        <>
                          <Camera className="w-4 h-4 text-purple-200" />
                          <span>Generate All Frames</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>

                {batchGeneratingShots && (
                  <div className="p-4 bg-slate-900 border border-slate-800 rounded-2xl space-y-2">
                    <div className="flex items-center justify-between text-xs font-bold text-slate-300">
                      <span>Đang tiến hành tạo ảnh Storyboard hàng loạt...</span>
                      <span>{batchShotsProgress.current} / {batchShotsProgress.total}</span>
                    </div>
                    <div className="w-full bg-slate-950 h-2 rounded-full overflow-hidden">
                      <div 
                        className="bg-gradient-to-r from-purple-500 to-pink-500 h-2 transition-all duration-300"
                        style={{ width: `${(batchShotsProgress.current / (batchShotsProgress.total || 1)) * 100}%` }}
                      />
                    </div>
                    <p className="text-[10px] text-purple-400 italic">{batchShotsProgress.text}</p>
                  </div>
                )}

                {/* Shot List Panel Views */}
                <div className="space-y-4">
                  <div className="flex items-center justify-between border-b border-slate-900 pb-2">
                    <div className="flex items-center gap-3">
                      <span className="text-[10px] font-black uppercase tracking-wider text-slate-400">Detailed Shot Catalog</span>
                    </div>
                    <div className="flex items-center gap-3">
                      {shotViewTab === "cards" && (
                        <>
                          {/* Layout Mode Toggles */}
                          <div className="flex items-center gap-1 bg-slate-950 p-0.5 rounded-lg border border-slate-900">
                            <button
                              onClick={() => setShotLayoutMode("row")}
                              className={`px-2 py-0.5 rounded text-[8px] font-bold uppercase transition-all ${shotLayoutMode === "row" ? "bg-slate-900 text-purple-400" : "text-slate-500"}`}
                              title="Dàn hàng ngang (Cuộn ngang)"
                            >
                              Row
                            </button>
                            <button
                              onClick={() => setShotLayoutMode("grid")}
                              className={`px-2 py-0.5 rounded text-[8px] font-bold uppercase transition-all ${shotLayoutMode === "grid" ? "bg-slate-900 text-purple-400" : "text-slate-500"}`}
                              title="Dàn dạng lưới (Gọn gàng)"
                            >
                              Grid
                            </button>
                          </div>

                          {/* Zoom Level Toggles */}
                          <div className="flex items-center gap-1 bg-slate-950 p-0.5 rounded-lg border border-slate-900">
                            <button
                              onClick={() => setZoomLevel("sm")}
                              className={`px-1.5 py-0.5 rounded text-[8px] font-bold uppercase transition-all ${zoomLevel === "sm" ? "bg-slate-900 text-purple-400" : "text-slate-500"}`}
                            >
                              Small
                            </button>
                            <button
                              onClick={() => setZoomLevel("md")}
                              className={`px-1.5 py-0.5 rounded text-[8px] font-bold uppercase transition-all ${zoomLevel === "md" ? "bg-slate-900 text-purple-400" : "text-slate-500"}`}
                            >
                              Medium
                            </button>
                            <button
                              onClick={() => setZoomLevel("lg")}
                              className={`px-1.5 py-0.5 rounded text-[8px] font-bold uppercase transition-all ${zoomLevel === "lg" ? "bg-slate-900 text-purple-400" : "text-slate-500"}`}
                            >
                              Large
                            </button>
                          </div>
                        </>
                      )}
                      <div className="flex items-center gap-1 bg-slate-950 p-0.5 rounded-lg border border-slate-900">
                        <button
                          onClick={() => setShotViewTab("table")}
                          className={`px-2 py-1 rounded text-[9px] font-bold uppercase transition-all ${shotViewTab === "table" ? "bg-slate-900 text-purple-400" : "text-slate-500"}`}
                        >
                          Table
                        </button>
                        <button
                          onClick={() => setShotViewTab("cards")}
                          className={`px-2 py-1 rounded text-[9px] font-bold uppercase transition-all ${shotViewTab === "cards" ? "bg-slate-900 text-purple-400" : "text-slate-500"}`}
                        >
                          Cards
                        </button>
                      </div>
                    </div>
                  </div>

                  {shotViewTab === "table" ? (
                    <div className="overflow-x-auto bg-[#0a0c1a]/50 border border-slate-900 rounded-2xl">
                      <table className="w-full text-left border-collapse text-[11px] font-sans">
                        <thead>
                          <tr className="border-b border-slate-900 text-slate-500 font-extrabold uppercase tracking-wider text-[9px] bg-slate-950/50">
                            <th className="py-3 px-3">beat</th>
                            <th className="py-3 px-3">sc</th>
                            <th className="py-3 px-3">kind</th>
                            <th className="py-3 px-3">function</th>
                            <th className="py-3 px-3">T</th>
                            <th className="py-3 px-3 text-purple-400">📷 camera / angle</th>
                            <th className="py-3 px-3 text-slate-400">🎬 diễn tả</th>
                            <th className="py-3 px-3 text-amber-400">💬 thoại</th>
                            <th className="py-3 px-3 text-emerald-500/80">🎯 mục tiêu</th>
                            <th className="py-3 px-3 text-pink-400">🔗 causal link</th>
                            <th className="py-3 px-3 text-purple-400">Verified Refs</th>
                            <th className="py-3 px-3 text-indigo-400">🖼️ hình ảnh / prompt</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-900/40 text-slate-300">
                          {(parsedData.shots || []).map((sh: any) => {
                            const computedPrompt = getComputedShotPrompt(sh);
                            return (
                              <ShotTableRow 
                                key={sh.beat || sh.id}
                                sh={sh}
                                computedPrompt={computedPrompt}
                                isGenerating={generatingShots[sh.beat || sh.id]}
                                detected={getDetectedAssetsForShot(sh)}
                                handleGenerateShotFrame={handleGenerateShotFrame}
                                handleUpdateShotField={handleUpdateShotField}
                                handleDeleteShot={handleDeleteShot}
                                getReferenceImagesForShot={getReferenceImagesForShot}
                                projectAssets={projectAssets}
                                draftAssets={draftAssets}
                              />
                            );
                          })}
                        </tbody>
                      </table>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {parsedData.scenes.map((s: any, idx: number) => {
                        const scNumber = s.sceneNumber || (idx + 1);
                        const scCode = `SC${String(scNumber).replace(/[^0-9]/g, "").padStart(2, "0") || "01"}`;
                        const sceneShots = (parsedData.shots || []).filter((sh: any) => sh.sc === scCode);

                        return (
                          <div key={s.id} className="p-4 bg-[#0a0c1a]/50 border border-slate-900 rounded-2xl space-y-3">
                            <div className="flex items-center justify-between border-b border-slate-900/60 pb-2">
                              <div className="flex items-center gap-2">
                                <span className="text-[10px] font-extrabold text-purple-400 bg-purple-950/20 px-2 py-0.5 rounded border border-purple-500/10">Scene {s.sceneNumber}</span>
                                <span className="text-[10px] font-bold text-slate-300">{s.title}</span>
                              </div>
                              <div className="flex items-center gap-3">
                                <span className="text-[9px] text-slate-500 font-mono">{sceneShots.length} Shots</span>
                                <button
                                  onClick={() => handleAddShot(scCode)}
                                  className="px-2 py-1 bg-purple-950/30 hover:bg-purple-900/50 text-purple-300 border border-purple-900/40 rounded-lg text-[9px] font-extrabold uppercase tracking-wider transition-all active:scale-95 flex items-center gap-1"
                                >
                                  + Add Shot
                                </button>
                              </div>
                            </div>

                            {sceneShots.length === 0 ? (
                              <div className="p-4 text-slate-600 text-center text-[10px] italic">
                                No shots in this scene. Click "+ Add Shot" to create one.
                              </div>
                            ) : (
                              <div className={
                                shotLayoutMode === "row"
                                  ? "flex flex-row overflow-x-auto gap-4 py-2 scrollbar-thin scrollbar-thumb-purple-950 scrollbar-track-transparent"
                                  : zoomLevel === "sm"
                                    ? "grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 py-2"
                                    : zoomLevel === "lg"
                                      ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 gap-4 py-2"
                                      : "grid grid-cols-1 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 py-2"
                              }>
                                {sceneShots.map((sh: any) => {
                                  const isGenerating = generatingShots[sh.beat || sh.id];
                                  const computedPrompt = getComputedShotPrompt(sh);
                                  const detected = getDetectedAssetsForShot(sh);

                                  return (
                                    <div 
                                      key={sh.beat || sh.id} 
                                      className={
                                        shotLayoutMode === "row"
                                          ? `shrink-0 transition-all duration-300 ${
                                              zoomLevel === "sm" ? "w-64" : zoomLevel === "lg" ? "w-96" : "w-80"
                                            }`
                                          : "w-full transition-all duration-300"
                                      }
                                    >
                                      <ShotCard 
                                        shot={sh}
                                        isGenerating={isGenerating}
                                        computedPrompt={computedPrompt}
                                        detectedAssets={detected}
                                        handleGenerateShotFrame={handleGenerateShotFrame}
                                        handleUpdateShotField={handleUpdateShotField}
                                        handleDeleteShot={handleDeleteShot}
                                        getReferenceImagesForShot={getReferenceImagesForShot}
                                        projectAssets={projectAssets}
                                        draftAssets={draftAssets}
                                        storyboardAssets={storyboardAssets}
                                      />
                                    </div>
                                  );
                                })}
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              </div>
    </>
  );
};
