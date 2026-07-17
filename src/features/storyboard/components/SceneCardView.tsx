import React from 'react';
import { Loader2, Check, Compass, AlertTriangle, AlertCircle, Save, Sparkles, Sliders, Layers } from 'lucide-react';

export const SceneCardView = ({
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
    <div className="grid grid-cols-1 gap-6">
                {parsedData.scenes.map((s: any, idx: number) => {
                  const isCalibrating = calibratingSceneId === s.id;
                  const calib = calibrations[s.id];
                  const prevScene = idx > 0 ? parsedData.scenes[idx - 1] : null;
                  const prevCalib = prevScene ? calibrations[prevScene.id] : null;
                  const transitionAnalysis = calculateTransitionRisk(prevScene, s, prevCalib, calib);
                  const sceneChars = getSceneCharacters(s);
                  const prevSceneChars = prevScene ? getSceneCharacters(prevScene) : [];
                  const hasSharedChars = sceneChars.some((c: string) => prevSceneChars.includes(c));
                  const qcViolations = checkCinematographyViolations(prevCalib, calib, hasSharedChars);

                  return (
                    <div key={s.id} className="bg-slate-950 border border-slate-900 rounded-3xl p-5 relative overflow-hidden space-y-4">
                      {/* Top Header line */}
                      <div className="flex items-center justify-between border-b border-slate-900/80 pb-3">
                        <div className="flex items-center gap-2">
                          <span className="text-[10px] font-extrabold text-purple-400 bg-purple-950/40 border border-purple-500/20 px-2 py-0.5 rounded-full uppercase">Scene {s.sceneNumber}</span>
                          <h4 className="text-xs font-black text-slate-200 tracking-wide">{s.title}</h4>
                        </div>
                        
                        <div className="flex items-center gap-2">
                          {calib && (
                            <span className="inline-flex items-center gap-1 text-[9px] font-bold text-emerald-400 bg-emerald-950/30 px-2.5 py-0.5 rounded-full border border-emerald-900/50">
                              <Check className="w-3 h-3" /> Ready
                            </span>
                          )}
                          <button
                            onClick={() => handleCalibrateScene(s)}
                            disabled={isCalibrating}
                            className="px-3 py-1.5 rounded-xl text-[9px] font-extrabold uppercase tracking-wider bg-purple-600 hover:bg-purple-500 disabled:bg-slate-900 text-white shadow-md active:scale-95 transition-all inline-flex items-center gap-1"
                          >
                            {isCalibrating ? (
                              <>
                                <Loader2 className="w-3 h-3 animate-spin" />
                                <span>Calibrating...</span>
                              </>
                            ) : (
                              <>
                                <Compass className="w-3 h-3" />
                                <span>{calib ? "Recalibrate" : "Run Calibration"}</span>
                              </>
                            )}
                          </button>
                        </div>
                      </div>

                      {/* Content split grid */}
                      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
                        {/* Script segment */}
                        <div className="lg:col-span-4 space-y-1 bg-slate-950/60 p-3.5 rounded-2xl border border-slate-900/40">
                          <span className="text-[9px] font-extrabold text-slate-500 uppercase tracking-widest block mb-1">Source Screenplay Segment</span>
                          <p className="text-[11px] text-slate-400 leading-relaxed font-sans select-all">{s.scriptContent || s.description}</p>
                        </div>

                        {/* Interactive parameters side */}
                        <div className="lg:col-span-8 space-y-4">
                          {isCalibrating ? (
                            <div className="bg-[#0b0e1e]/60 border border-slate-900 rounded-2xl p-6 text-center space-y-3">
                              <Loader2 className="w-6 h-6 animate-spin text-purple-400 mx-auto" />
                              <div className="text-xs font-bold text-purple-300">{calibratingStatus}</div>
                              
                              <div className="flex items-center gap-1">
                                {[0,1,2,3,4].map((stepIdx) => (
                                  <div 
                                    key={stepIdx} 
                                    className={`h-1 flex-1 rounded-full ${calibrationStep >= stepIdx ? "bg-purple-500" : "bg-slate-900"}`}
                                  />
                                ))}
                              </div>
                            </div>
                          ) : calib ? (
                            <div className="mt-0 space-y-4 font-sans">
                              {/* Cinematic Meta Grid */}
                              <div className="grid grid-cols-1 md:grid-cols-4 gap-3 text-[11px]">
                                <div>
                                  <label className="block text-[9px] text-slate-500 font-extrabold uppercase tracking-wider mb-1">Virtual Camera Rig</label>
                                  <select 
                                    value={calib.virtualCameraRig?.focalLength || "50mm Cinematic Standard"}
                                    onChange={(e) => handleUpdateCalibrationField(s.id, "virtualCameraRig", "focalLength", e.target.value)}
                                    className="w-full bg-slate-950 border border-slate-900 rounded-lg px-2 py-1.5 text-slate-300 outline-none text-[10px]"
                                  >
                                    <option value="24mm Wide-Angle Establishing">24mm Wide-Angle Establishing</option>
                                    <option value="35mm Street-Style Reality">35mm Street-Style Reality</option>
                                    <option value="50mm Cinematic Standard">50mm Cinematic Standard</option>
                                    <option value="85mm Portrait Close-up">85mm Portrait Close-up</option>
                                    <option value="135mm Telephoto Compression">135mm Telephoto Compression</option>
                                  </select>
                                </div>

                                <div>
                                  <label className="block text-[9px] text-slate-500 font-extrabold uppercase tracking-wider mb-1">Visual Tone LUT</label>
                                  <select 
                                    value={calib.virtualCameraRig?.visualToneLUT || "Neutral Standard"}
                                    onChange={(e) => handleUpdateCalibrationField(s.id, "virtualCameraRig", "visualToneLUT", e.target.value)}
                                    className="w-full bg-slate-950 border border-slate-900 rounded-lg px-2 py-1.5 text-slate-300 outline-none text-[10px]"
                                  >
                                    <option value="Neutral Standard">Neutral Standard</option>
                                    <option value="Warm Nostalgic Amber">Warm Nostalgic Amber</option>
                                    <option value="Cool Cyberpunk Neon">Cool Cyberpunk Neon</option>
                                    <option value="High-Contrast Neo-Noir">High-Contrast Neo-Noir</option>
                                    <option value="Desaturated Gritty War">Desaturated Gritty War</option>
                                  </select>
                                </div>

                                <div>
                                  <label className="block text-[9px] text-slate-500 font-extrabold uppercase tracking-wider mb-1">Luminance Intensity</label>
                                  <input 
                                    type="number"
                                    min={0}
                                    max={100}
                                    value={calib.virtualCameraRig?.luminanceIntensity ?? 65}
                                    onChange={(e) => handleUpdateCalibrationField(s.id, "virtualCameraRig", "luminanceIntensity", parseInt(e.target.value) || 0)}
                                    className="w-full bg-slate-950 border border-slate-900 rounded-lg px-2 py-1 text-slate-300 outline-none text-[10px]"
                                  />
                                </div>

                                <div>
                                  <label className="block text-[9px] text-slate-500 font-extrabold uppercase tracking-wider mb-1">Pacing Modifier</label>
                                  <select 
                                    value={calib.virtualCameraRig?.pacingModifier || "Standard 1.0x"}
                                    onChange={(e) => handleUpdateCalibrationField(s.id, "virtualCameraRig", "pacingModifier", e.target.value)}
                                    className="w-full bg-slate-950 border border-slate-900 rounded-lg px-2 py-1.5 text-slate-300 outline-none text-[10px]"
                                  >
                                    <option value="Slow-Burn Suspense 0.7x">Slow-Burn Suspense 0.7x</option>
                                    <option value="Standard 1.0x">Standard 1.0x</option>
                                    <option value="Fast Action Cut 1.5x">Fast Action Cut 1.5x</option>
                                    <option value="High-Speed Pulse 2.0x">High-Speed Pulse 2.0x</option>
                                  </select>
                                </div>
                              </div>

                              {/* Anchor Linkings (Character & Location QC) */}
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="p-3 bg-slate-950/60 border border-slate-900 rounded-xl space-y-2">
                                  <span className="text-[10px] font-extrabold text-slate-400 block uppercase tracking-wider">Cast Continuity Anchor Check</span>
                                  <div className="space-y-1.5">
                                    {getSceneCharacters(s).map((cName: string) => {
                                      const linkedAssetId = characterMappings[cName];
                                      const matchedAsset = projectAssets.find((a: any) => a.id === linkedAssetId);
                                      
                                      return (
                                        <div key={cName} className="flex items-center justify-between text-[10px] bg-slate-900/40 p-1.5 rounded border border-slate-900">
                                          <span className="font-bold text-slate-300">{cName}</span>
                                          {matchedAsset ? (
                                            <span className="text-emerald-400 font-mono text-[9px] flex items-center gap-1">
                                              <Check className="w-2.5 h-2.5" /> Linked to {matchedAsset.name}
                                            </span>
                                          ) : (
                                            <div className="flex items-center gap-1.5">
                                              <span className="text-amber-500 font-bold text-[9px]">⚠️ DNA Missing</span>
                                              <button 
                                                onClick={() => handleExportNewAsset(cName, "character")}
                                                className="px-1.5 py-0.5 bg-purple-900 text-purple-100 rounded text-[8px] font-bold uppercase hover:bg-purple-800 transition-colors"
                                              >
                                                Export DNA
                                              </button>
                                            </div>
                                          )}
                                        </div>
                                      );
                                    })}
                                  </div>
                                </div>

                                <div className="p-3 bg-slate-950/60 border border-slate-900 rounded-xl space-y-2">
                                  <span className="text-[10px] font-extrabold text-slate-400 block uppercase tracking-wider">Environment Rig Anchor Check</span>
                                  <div className="space-y-1.5">
                                    {getSceneLocations(s).map((lName: string) => {
                                      const linkedAssetId = locationMappings[lName];
                                      const matchedAsset = projectAssets.find((a: any) => a.id === linkedAssetId);
                                      
                                      return (
                                        <div key={lName} className="flex items-center justify-between text-[10px] bg-slate-900/40 p-1.5 rounded border border-slate-900">
                                          <span className="font-bold text-slate-300">{lName}</span>
                                          {matchedAsset ? (
                                            <span className="text-emerald-400 font-mono text-[9px] flex items-center gap-1">
                                              <Check className="w-2.5 h-2.5" /> Linked to {matchedAsset.name}
                                            </span>
                                          ) : (
                                            <div className="flex items-center gap-1.5">
                                              <span className="text-amber-500 font-bold text-[9px]">⚠️ DNA Missing</span>
                                              <button 
                                                onClick={() => handleExportNewAsset(lName, "location")}
                                                className="px-1.5 py-0.5 bg-purple-900 text-purple-100 rounded text-[8px] font-bold uppercase hover:bg-purple-800 transition-colors"
                                              >
                                                Export DNA
                                              </button>
                                            </div>
                                          )}
                                        </div>
                                      );
                                    })}
                                  </div>
                                </div>
                              </div>

                              {/* Causal Flow Storyboard Integrity */}
                              <div className="bg-slate-950 p-4 border border-slate-900 rounded-2xl space-y-3">
                                <div className="flex items-center justify-between border-b border-slate-900/60 pb-1.5">
                                  <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider">Scene Causal Flow Rig</span>
                                  <span className="text-[9px] text-purple-400 font-bold uppercase">Transition Analysis</span>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-[10px]">
                                  <div className="space-y-1.5">
                                    <label className="block text-[9px] text-purple-400 font-extrabold uppercase">Causal Cause / Trigger</label>
                                    <textarea 
                                      value={calib.causalFlow?.cause || ""}
                                      onChange={(e) => handleUpdateCausalFlowField(s.id, "cause", e.target.value)}
                                      placeholder="Ex: Elena opens the box, finding a hidden drawer..."
                                      className="w-full bg-slate-900/60 border border-slate-900 rounded p-1.5 text-slate-300 text-[10px] outline-none h-14 resize-none leading-relaxed font-sans"
                                    />
                                  </div>
                                  <div className="space-y-1.5">
                                    <label className="block text-[9px] text-pink-400 font-extrabold uppercase">Causal Effect / Resolution</label>
                                    <textarea 
                                      value={calib.causalFlow?.effect || ""}
                                      onChange={(e) => handleUpdateCausalFlowField(s.id, "effect", e.target.value)}
                                      placeholder="Ex: The discovery leads Elena to run to the door..."
                                      className="w-full bg-slate-900/60 border border-slate-900 rounded p-1.5 text-slate-300 text-[10px] outline-none h-14 resize-none leading-relaxed font-sans"
                                    />
                                  </div>
                                </div>

                                {/* Quality violations & risk analysis */}
                                {qcViolations.length > 0 && (
                                  <div className="p-3 bg-rose-950/20 border border-rose-900/40 rounded-xl space-y-1.5">
                                    <span className="text-[9px] text-rose-400 font-black uppercase tracking-wider flex items-center gap-1">
                                      <AlertTriangle className="w-3.5 h-3.5 text-rose-400" /> Cinematic Continuity Alerts ({qcViolations.length})
                                    </span>
                                    <ul className="list-disc pl-4 text-[10px] text-rose-300/80 space-y-0.5">
                                      {qcViolations.map((v: string, idx: number) => (
                                        <li key={idx} className="leading-relaxed">{v}</li>
                                      ))}
                                    </ul>
                                  </div>
                                )}

                                <div className={`p-3 rounded-xl border flex gap-2 ${
                                  transitionAnalysis.risk >= 0.6 
                                    ? "bg-rose-950/20 border-rose-900/30 text-rose-300"
                                    : transitionAnalysis.risk >= 0.3
                                      ? "bg-amber-950/20 border-amber-900/30 text-amber-300"
                                      : "bg-emerald-950/20 border-emerald-900/30 text-emerald-300"
                                }`}>
                                  <AlertCircle className={`w-4 h-4 shrink-0 mt-0.5 ${
                                    transitionAnalysis.risk >= 0.6 
                                      ? "text-rose-400" 
                                      : transitionAnalysis.risk >= 0.3 
                                        ? "text-amber-400" 
                                        : "text-emerald-400"
                                  }`} />
                                  <div className="text-[10px] space-y-1">
                                    <span className="font-extrabold uppercase tracking-wider block">Transition Cohesion Risk (Score: {transitionAnalysis.risk})</span>
                                    <p className="opacity-95 leading-normal">{transitionAnalysis.reason}</p>
                                    
                                  </div>
                                </div>
                              </div>

                              {/* Save Rig Button */}
                              <div className="flex justify-end pt-2 border-t border-slate-900/40">
                                <button
                                  onClick={() => handleSaveCalibratedScene(s.id)}
                                  disabled={savingSceneId === s.id}
                                  className="flex items-center gap-1 px-4 py-2 bg-gradient-to-r from-emerald-600 to-teal-500 hover:from-emerald-500 hover:to-teal-400 text-white rounded-xl text-[10px] font-black uppercase tracking-wider shadow-lg shadow-emerald-600/10 active:scale-95 transition-all"
                                >
                                  {savingSceneId === s.id ? (
                                    <>
                                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                                      <span>Saving Rig...</span>
                                    </>
                                  ) : (
                                    <>
                                      <Save className="w-3.5 h-3.5" />
                                      <span>Save Scene Rig</span>
                                    </>
                                  )}
                                </button>
                              </div>
                            </div>
                          ) : (
                            <div className="h-full flex items-center justify-center p-6 bg-slate-950/20 border border-dashed border-slate-900 rounded-2xl min-h-[160px]">
                              <div className="text-center space-y-1">
                                <span className="text-[11px] text-slate-500 block italic">Scene has not been calibrated through the camera simulator.</span>
                                <span className="text-[10px] text-slate-600 block">Click "Run Calibration" on the top right to start.</span>
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
  );
};