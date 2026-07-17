import React from 'react';
import { Loader2, Check, AlertTriangle, AlertCircle, Save, Sparkles } from 'lucide-react';

export const SceneTableView = ({
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
    /* Causal Flow Table View Mode (Totally Interactive!) */
              <div className="overflow-x-auto border border-slate-900 rounded-2xl bg-slate-950/40 backdrop-blur-md shadow-2xl">
                <table className="w-full text-left border-collapse text-[11px] font-sans">
                  <thead>
                    <tr className="border-b border-slate-900 text-slate-500 font-extrabold uppercase tracking-wider text-[9px] bg-slate-950/80">
                      <th className="py-3.5 px-4">Scene & Title</th>
                      <th className="py-3.5 px-4 w-[20%]">Script Segment</th>
                      <th className="py-3.5 px-4 w-[18%]">Camera & LUT Rig (Editable)</th>
                      <th className="py-3.5 px-4">Cast continuity</th>
                      <th className="py-3.5 px-4">Environment link</th>
                      <th className="py-3.5 px-4 w-[28%]">Causal Flow Analysis (Editable)</th>
                      <th className="py-3.5 px-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-900/40 text-slate-300">
                    {parsedData.scenes.map((s: any, idx: number) => {
                      const prevScene = idx > 0 ? parsedData.scenes[idx - 1] : null;
                      const isCalibrating = calibratingSceneId === s.id;
                      const calib = calibrations[s.id];
                      
                      const prevCalib = prevScene ? calibrations[prevScene.id] : null;
                      const transitionAnalysis = calculateTransitionRisk(prevScene, s, prevCalib, calib);
                      
                      const sceneChars = getSceneCharacters(s);
                      const prevSceneChars = prevScene ? getSceneCharacters(prevScene) : [];
                      const hasSharedChars = sceneChars.some((c: string) => prevSceneChars.includes(c));
                      const qcViolations = checkCinematographyViolations(prevCalib, calib, hasSharedChars);

                      return (
                        <tr key={s.id} className="hover:bg-slate-950/20 transition-all align-top group">
                          {/* Column 1: Scene & Title */}
                          <td className="py-4 px-4 font-sans space-y-1 align-top">
                            <span className="inline-flex items-center px-2 py-0.5 rounded text-[9px] font-extrabold text-purple-400 bg-purple-950/40 border border-purple-500/20 uppercase">
                              Scene {s.sceneNumber}
                            </span>
                            <div className="font-extrabold text-slate-200 mt-1 max-w-[120px] truncate" title={s.title}>{s.title}</div>
                          </td>

                          {/* Column 2: Script Segment */}
                          <td className="py-4 px-4 align-top">
                            <p className="text-slate-400 leading-relaxed font-sans text-[10px] line-clamp-3 select-all bg-slate-950/50 p-2 rounded-xl border border-slate-900/30 group-hover:line-clamp-none transition-all duration-300 cursor-pointer">
                              {s.scriptContent || s.description}
                            </p>
                          </td>

                          {/* Column 3: LUT Rig (Editable!) */}
                          <td className="py-4 px-4 align-top font-sans space-y-2">
                            {calib ? (
                              <div className="space-y-1.5 text-[10px]">

                                <div>
                                  <label className="block text-[8px] text-slate-500 font-extrabold uppercase mb-0.5">Visual LUT</label>
                                  <select 
                                    value={calib.virtualCameraRig?.visualToneLUT || "Neutral Standard"}
                                    onChange={(e) => handleUpdateCalibrationField(s.id, "virtualCameraRig", "visualToneLUT", e.target.value)}
                                    className="w-full bg-slate-950 border border-slate-900 rounded px-1 py-0.5 text-slate-300 outline-none text-[9px] font-semibold"
                                  >
                                    <option value="Neutral Standard">Neutral</option>
                                    <option value="Warm Nostalgic Amber">Warm Amber</option>
                                    <option value="Cool Cyberpunk Neon">Cyber Neon</option>
                                    <option value="High-Contrast Neo-Noir">Neo-Noir</option>
                                    <option value="Desaturated Gritty War">Gritty War</option>
                                  </select>
                                </div>

                                <div className="flex gap-1.5 items-center">
                                  <div className="flex items-center gap-0.5">
                                    <span className="text-[8px] text-slate-600 font-extrabold">B:</span>
                                    <input 
                                      type="number"
                                      min={0}
                                      max={100}
                                      value={calib.virtualCameraRig?.luminanceIntensity ?? 65}
                                      onChange={(e) => handleUpdateCalibrationField(s.id, "virtualCameraRig", "luminanceIntensity", parseInt(e.target.value) || 0)}
                                      className="w-8 bg-slate-950 border border-slate-900 rounded px-0.5 py-0.5 text-slate-300 text-[9px] font-mono text-center outline-none"
                                    />
                                    <span className="text-[8px] text-slate-600 font-bold">%</span>
                                  </div>
                                  <select 
                                    value={calib.virtualCameraRig?.pacingModifier || "Standard 1.0x"}
                                    onChange={(e) => handleUpdateCalibrationField(s.id, "virtualCameraRig", "pacingModifier", e.target.value)}
                                    className="flex-1 bg-slate-950 border border-slate-900 rounded px-0.5 py-0.5 text-slate-400 text-[8px] outline-none"
                                  >
                                    <option value="Slow-Burn Suspense 0.7x">Slow 0.7x</option>
                                    <option value="Standard 1.0x">Std 1.0x</option>
                                    <option value="Fast Action Cut 1.5x">Fast 1.5x</option>
                                    <option value="High-Speed Pulse 2.0x">Pulse 2.0x</option>
                                  </select>
                                </div>
                              </div>
                            ) : (
                              <span className="text-[10px] text-slate-600 font-bold block italic uppercase">Not calibrated</span>
                            )}
                          </td>

                          {/* Column 4: Cast Continuity Check */}
                          <td className="py-4 px-4 align-top font-sans space-y-1.5">
                            {getSceneCharacters(s).map((cName: string) => {
                              const linkedId = characterMappings[cName];
                              const hasDna = !!projectAssets.find((a: any) => a.id === linkedId);

                              return (
                                <div key={cName} className="flex items-center gap-1">
                                  <span className={`w-1.5 h-1.5 rounded-full ${hasDna ? "bg-emerald-500" : "bg-amber-500 animate-pulse"}`} />
                                  <span className={`text-[10px] ${hasDna ? "text-slate-300 font-bold" : "text-slate-500 font-semibold"}`} title={hasDna ? "DNA Connected" : "DNA Missing"}>
                                    {cName}
                                  </span>
                                </div>
                              );
                            })}
                          </td>

                          {/* Column 5: Environment Link */}
                          <td className="py-4 px-4 align-top font-sans space-y-1.5">
                            {getSceneLocations(s).map((lName: string) => {
                              const linkedId = locationMappings[lName];
                              const hasDna = !!projectAssets.find((a: any) => a.id === linkedId);

                              return (
                                <div key={lName} className="flex items-center gap-1">
                                  <span className={`w-1.5 h-1.5 rounded-full ${hasDna ? "bg-emerald-500" : "bg-amber-500 animate-pulse"}`} />
                                  <span className={`text-[10px] ${hasDna ? "text-slate-300 font-bold" : "text-slate-500 font-semibold"}`} title={hasDna ? "DNA Connected" : "DNA Missing"}>
                                    {lName}
                                  </span>
                                </div>
                              );
                            })}
                          </td>

                          {/* Column 6: Causal Flow Analysis (Editable!) */}
                          <td className="py-4 px-4 align-top font-sans">
                            {calib ? (
                              <div className="space-y-2 text-[10px]">
                                {/* Cause & Effect Details */}
                                <div className="space-y-1.5 bg-slate-950 p-2 rounded-lg border border-slate-900">
                                  <div>
                                    <span className="text-[8px] text-purple-400 font-bold uppercase tracking-wider block mb-0.5">Cause / Trigger</span>
                                    <textarea
                                      value={calib.causalFlow?.cause || ""}
                                      onChange={(e) => handleUpdateCausalFlowField(s.id, "cause", e.target.value)}
                                      placeholder="Ex: Characters enter, spotting the target..."
                                      className="w-full bg-slate-900/60 border border-slate-900 rounded p-1 text-slate-300 text-[9px] outline-none font-mono h-11 resize-y leading-normal"
                                    />
                                  </div>
                                  <div className="border-t border-slate-900/60 pt-1.5 mt-1.5">
                                    <span className="text-[8px] text-pink-400 font-bold uppercase tracking-wider block mb-0.5">Effect / Resolution</span>
                                    <textarea
                                      value={calib.causalFlow?.effect || ""}
                                      onChange={(e) => handleUpdateCausalFlowField(s.id, "effect", e.target.value)}
                                      placeholder="Ex: Elena triggers the alarm..."
                                      className="w-full bg-slate-900/60 border border-slate-900 rounded p-1 text-slate-300 text-[9px] outline-none font-mono h-11 resize-y leading-normal"
                                    />
                                  </div>
                                </div>

                                {/* Real-time Cinematic Quality Control Alerts */}
                                {qcViolations.length > 0 && (
                                  <div className="p-2 bg-rose-950/20 border border-rose-900/30 rounded-lg space-y-1">
                                    <span className="text-[8px] text-rose-400 font-black uppercase tracking-wider flex items-center gap-1">
                                      <AlertTriangle className="w-3 h-3 text-rose-400 shrink-0" /> Cinematic Violation ({qcViolations.length})
                                    </span>
                                    <ul className="list-disc pl-3 text-[9px] text-rose-300/80 space-y-0.5">
                                      {qcViolations.map((v: string, idx: number) => (
                                        <li key={idx} className="leading-snug">{v}</li>
                                      ))}
                                    </ul>
                                  </div>
                                )}

                                {/* Causal Risk Analysis Badge */}
                                <div className={`p-2 rounded-lg border flex items-start gap-1.5 ${
                                  transitionAnalysis.risk >= 0.6 
                                    ? "bg-rose-950/20 border-rose-900/30 text-rose-300"
                                    : transitionAnalysis.risk >= 0.3
                                      ? "bg-amber-950/20 border-amber-900/30 text-amber-300"
                                      : "bg-emerald-950/20 border-emerald-900/30 text-emerald-300"
                                }`}>
                                  <AlertCircle className={`w-3.5 h-3.5 shrink-0 mt-0.5 ${
                                    transitionAnalysis.risk >= 0.6 
                                      ? "text-rose-400" 
                                      : transitionAnalysis.risk >= 0.3 
                                        ? "text-amber-400" 
                                        : "text-emerald-400"
                                  }`} />
                                  <div>
                                    <span className="text-[9px] font-extrabold uppercase tracking-wider block">Transition Linkage Risk</span>
                                    <p className="text-[9px] opacity-90 mt-0.5 leading-snug">{transitionAnalysis.reason}</p>
                                    
                                  </div>
                                </div>
                              </div>
                            ) : (
                              <div className="h-full flex items-center justify-center py-4 text-slate-500 italic text-[11px]">
                                Chưa đánh giá.
                              </div>
                            )}
                          </td>

                          {/* Column 7: Actions */}
                          <td className="py-4 px-4 align-top text-right space-y-2 font-sans">
                            {isCalibrating ? (
                              <div className="space-y-1 text-center py-2">
                                <Loader2 className="w-4 h-4 animate-spin text-purple-500 mx-auto" />
                                <span className="text-[9px] text-purple-400 block truncate max-w-[120px]">{calibratingStatus}</span>
                              </div>
                            ) : calib ? (
                              <div className="flex flex-col gap-1.5 items-end">
                                <span className="inline-flex items-center gap-1 text-[9px] font-bold text-emerald-400 bg-emerald-950/30 px-2 py-0.5 rounded-full border border-emerald-900/50">
                                  <Check className="w-3 h-3" /> Ready
                                </span>
                                <button
                                  onClick={() => handleCalibrateScene(s)}
                                  className="text-[10px] text-purple-400 hover:text-purple-300 underline font-semibold active:scale-95 transition-all block"
                                >
                                  Re-calibrate
                                </button>
                                <button
                                  onClick={() => handleSaveCalibratedScene(s.id)}
                                  disabled={savingSceneId === s.id}
                                  className="flex items-center justify-center gap-1 px-3 py-1.5 w-full bg-gradient-to-r from-emerald-600 to-teal-500 hover:from-emerald-500 hover:to-teal-400 text-slate-100 rounded-lg text-[10px] font-bold shadow-lg shadow-emerald-500/10 active:scale-95 transition-all"
                                >
                                  {savingSceneId === s.id ? (
                                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                                  ) : (
                                    <>
                                      <Save className="w-3.5 h-3.5" /> Save Rig
                                    </>
                                  )}
                                </button>
                              </div>
                            ) : (
                              <button
                                onClick={() => handleCalibrateScene(s)}
                                className="flex items-center justify-center gap-1.5 px-3 py-1.5 w-full bg-gradient-to-r from-purple-600 to-pink-500 hover:from-purple-500 hover:to-pink-400 text-white rounded-lg text-[10px] font-bold shadow-md shadow-purple-500/20 active:scale-95 transition-all"
                              >
                                <Sparkles className="w-3 h-3 animate-pulse" /> Calibrate
                              </button>
                            )}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
  );
};
