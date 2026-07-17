"use client";

import React from "react";
import { 
  Clapperboard, Sparkles, Loader2, Save, Plus, Trash2, X, Settings
} from "lucide-react";
import { useStoryboardState } from "../hooks/useStoryboardState";
import { EmptyState } from "./EmptyState";
import { ScriptEditorPanel } from "./ScriptEditorPanel";
import { ScriptEvaluationPanel } from "./ScriptEvaluationPanel";
import AssetDnaPanel from "./AssetDnaPanel";
import { CalibrationSection } from "./CalibrationSection";
import { StyleCalibrationPanel } from "./StyleCalibrationPanel";

export default function StoryboardWorkspace() {
  const state = useStoryboardState();

  if (state.isLoadingProjects) {
    return (
      <div className="flex h-screen w-screen items-center justify-center bg-[#0d0e12] text-white">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="w-8 h-8 text-purple-500 animate-spin" />
          <p className="text-xs text-neutral-400">Đang tải cấu hình dự án...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-[#040406] text-neutral-200 overflow-hidden font-sans select-none">
      
      {/* 1. SIDEBAR: PROJECTS & EPISODES MANAGER */}
      <aside className="w-64 border-r border-white/5 bg-[#08080a] flex flex-col shrink-0">
        {/* Project Selection */}
        <div className="p-4 border-b border-white/5 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-black uppercase text-neutral-400 tracking-wider">Chọn dự án</span>
            <button 
              onClick={() => state.setShowProjectSettingsModal(true)}
              className="text-neutral-500 hover:text-white transition"
              title="Cấu hình Style & Negative Prompt"
            >
              <Settings className="w-4 h-4" />
            </button>
          </div>
          <select
            value={state.selectedProjectId}
            onChange={(e) => state.handleUniverseChange(e.target.value)}
            className="w-full bg-black border border-white/10 rounded-xl px-3 py-2 text-xs text-white outline-none focus:border-purple-500/50 transition font-bold"
          >
            {state.projectsList.map((p) => (
              <option key={p.id} value={p.id}>{p.name}</option>
            ))}
          </select>
        </div>

        {/* Episodes List */}
        <div className="flex-1 flex flex-col overflow-y-auto custom-scrollbar p-4 space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-black uppercase text-neutral-400 tracking-wider">Tập phim ({state.episodesList.length})</span>
            <button 
              onClick={() => state.setShowNewEpModal(true)}
              className="bg-purple-600 hover:bg-purple-500 text-white p-1 rounded transition border border-purple-500/20"
            >
              <Plus className="w-3 h-3" />
            </button>
          </div>

          {state.isLoadingEpisodes ? (
            <div className="py-10 text-center">
              <Loader2 className="w-5 h-5 text-neutral-500 animate-spin mx-auto" />
            </div>
          ) : state.episodesList.length === 0 ? (
            <div className="text-center py-10 text-[10px] text-neutral-600 italic">Chưa có tập phim nào</div>
          ) : (
            <div className="space-y-1.5">
              {state.episodesList.map((ep) => {
                const isActive = state.selectedEpisodeId === ep.id;
                return (
                  <div 
                    key={ep.id}
                    onClick={() => state.handleSelectEpisode(ep.id)}
                    className={`px-3 py-2.5 rounded-xl border transition cursor-pointer flex items-center justify-between group ${
                      isActive 
                        ? "bg-purple-600/20 border-purple-500/30 text-white font-bold" 
                        : "bg-black/20 border-white/5 text-neutral-400 hover:border-white/10 hover:text-white"
                    }`}
                  >
                    <span className="text-xs truncate flex-1 pr-2">🎬 {ep.title}</span>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        if (window.confirm(`Xóa tập phim ${ep.title}?`)) {
                          state.handleDeleteEpisode(ep.id);
                        }
                      }}
                      className="opacity-0 group-hover:opacity-100 text-neutral-500 hover:text-red-400 transition"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </aside>

      {/* 2. MAIN WORKSPACE */}
      <div className="flex-1 flex flex-col relative overflow-hidden bg-[#030303]">
        {/* Glowing lights */}
        <div className="absolute top-0 right-1/4 w-[500px] h-[500px] bg-purple-600/5 rounded-full blur-[120px] pointer-events-none" />
        <div className="absolute bottom-0 left-1/4 w-[500px] h-[500px] bg-red-600/5 rounded-full blur-[150px] pointer-events-none" />

        {/* Top Header */}
        <header className="h-14 border-b border-white/5 px-6 flex items-center justify-between backdrop-blur-md bg-black/20 shrink-0 z-20">
          <div className="flex items-center gap-2">
            <span className="font-mono text-xs font-black tracking-widest text-purple-500 bg-purple-500/10 px-2.5 py-1 rounded">STORYBOARD STUDIO</span>
            <span className="text-neutral-500">/</span>
            <span className="text-sm font-black text-neutral-300 uppercase tracking-widest">Drama & Shot Orchestrator</span>
          </div>

          {/* Tab Selection */}
          {state.selectedEpisodeId && (
            <div className="flex items-center bg-black/40 p-0.5 rounded-xl border border-white/5">
              {[
                { id: "evaluate", label: "Gợi ý & Phân tích" },
                { id: "dna", label: "Asset DNA" },
                { id: "calibration", label: "Cinematic Calibration" },
                { id: "style", label: "Cấu hình chung" }
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => state.setActiveRightTab(tab.id as any)}
                  className={`px-3 py-1.5 rounded-lg text-[10px] font-black uppercase transition-all cursor-pointer ${
                    state.activeRightTab === tab.id ? "bg-purple-600 text-white font-extrabold" : "text-neutral-500 hover:text-neutral-300"
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>
          )}
        </header>

        {/* Main Content Area */}
        <div className="flex-1 overflow-hidden relative z-10">
          {!state.selectedEpisodeId ? (
            <div className="h-full flex items-center justify-center">
              <EmptyState 
                icon={Clapperboard}
                title="Chưa chọn tập phim"
                description="Sếp vui lòng chọn hoặc khởi tạo một Tập phim từ Sidebar để bắt đầu soạn thảo kịch bản và sinh Storyboard nhé!"
              />
            </div>
          ) : (
            <div className="h-full grid grid-cols-1 lg:grid-cols-12 p-6 gap-6 overflow-hidden">
              
              {/* Left Column: Script Editor (5 cols) */}
              <div className="lg:col-span-5 h-full flex flex-col overflow-hidden">
                <ScriptEditorPanel
                  selectedEpisodeId={state.selectedEpisodeId}
                  scriptText={state.scriptText}
                  setScriptText={state.setScriptText}
                  editorMode={state.editorMode}
                  setEditorMode={state.setEditorMode}
                  rawPremise={state.rawPremise}
                  setRawPremise={state.setRawPremise}
                  isSavingScript={state.isSavingScript}
                  handleSaveScript={state.handleSaveScript}
                  isAnalyzing={state.isAnalyzing}
                  isEvaluating={state.isEvaluating}
                  handleUnifiedAnalyzeAndEvaluate={state.handleUnifiedAnalyzeAndEvaluate}
                  hasGeneratedOptions={state.hasGeneratedOptions}
                  isExtractingCharacters={state.isExtractingCharacters}
                  handleAISuggestOptions={state.handleAISuggestOptions}
                  scenarioCharacters={state.scenarioCharacters}
                  setScenarioCharacters={state.setScenarioCharacters}
                  projectAssets={state.projectAssets}
                  selectedEmotion={state.selectedEmotion}
                  setSelectedEmotion={state.setSelectedEmotion}
                  customEmotions={state.customEmotions}
                  setCustomEmotions={state.setCustomEmotions}
                  newEmotionInput={state.newEmotionInput}
                  setNewEmotionInput={state.setNewEmotionInput}
                  selectedTwist={state.selectedTwist}
                  setSelectedTwist={state.setSelectedTwist}
                  customTwists={state.customTwists}
                  setCustomTwists={state.setCustomTwists}
                  newTwistInput={state.newTwistInput}
                  setNewTwistInput={state.setNewTwistInput}
                  selectedVisual={state.selectedVisual}
                  setSelectedVisual={state.setSelectedVisual}
                  customVisuals={state.customVisuals}
                  setCustomVisuals={state.setCustomVisuals}
                  newVisualInput={state.newVisualInput}
                  setNewVisualInput={state.setNewVisualInput}
                  selectedRetention={state.selectedRetention}
                  setSelectedRetention={state.setSelectedRetention}
                  customRetentions={state.customRetentions}
                  setCustomRetentions={state.setCustomRetentions}
                  newRetentionInput={state.newRetentionInput}
                  setNewRetentionInput={state.setNewRetentionInput}
                  isCompilingCopilot={state.isCompilingCopilot}
                  handleCompileScreenplay={state.handleCompileScreenplay}
                  totalDuration={state.totalDuration}
                  setTotalDuration={state.setTotalDuration}
                  avgShotDuration={state.avgShotDuration}
                  setAvgShotDuration={state.setAvgShotDuration}
                  styleRegion={state.styleRegion}
                  setStyleRegion={state.setStyleRegion}
                  styleMedium={state.styleMedium}
                  setStyleMedium={state.setStyleMedium}
                  styleMood={state.styleMood}
                  setStyleMood={state.setStyleMood}
                  stylePeriod={state.stylePeriod}
                  setStylePeriod={state.setStylePeriod}
                  customStyleInstructions={state.customStyleInstructions}
                  setCustomStyleInstructions={state.setCustomStyleInstructions}
                  isSuggestingStyle={state.isSuggestingStyle}
                  handleAISuggestStyle={state.handleAISuggestStyle}
                  isConsolidatingStyle={state.isConsolidatingStyle}
                  handleSaveStyleConfig={state.handleSaveStyleConfig}
                  projectsList={state.projectsList}
                  selectedProjectId={state.selectedProjectId}
                  getDynamicOptions={state.getDynamicOptions}
                  handleEditChip={state.handleEditChip}
                />
              </div>

              {/* Right Column: Tab View (7 cols) */}
              <div className="lg:col-span-7 h-full flex flex-col overflow-hidden bg-white/[0.01] border border-white/5 rounded-3xl p-5 shadow-2xl backdrop-blur-md">
                <div className="flex-1 overflow-y-auto custom-scrollbar pr-1">
                  
                  {state.activeRightTab === "evaluate" && (
                    <ScriptEvaluationPanel
                      evaluation={state.evaluation}
                      parsedData={state.parsedData}
                      totalDuration={state.totalDuration}
                      avgShotDuration={state.avgShotDuration}
                      scriptText={state.scriptText}
                      characterMappings={state.characterMappings}
                      calibrations={state.calibrations}
                      expandedStrengths={state.expandedStrengths}
                      setExpandedStrengths={state.setExpandedStrengths}
                      expandedWeaknesses={state.expandedWeaknesses}
                      setExpandedWeaknesses={state.setExpandedWeaknesses}
                      expandedSuggestions={state.expandedSuggestions}
                      setExpandedSuggestions={state.setExpandedSuggestions}
                      getScoreBadge={(score: number) => {
                        if (score >= 90) return { rank: "Xuất Sắc", bg: "bg-emerald-950/40", text: "text-emerald-400", rating: "A+" };
                        if (score >= 80) return { rank: "Tốt", bg: "bg-blue-950/40", text: "text-blue-400", rating: "A" };
                        if (score >= 70) return { rank: "Khá", bg: "bg-purple-950/40", text: "text-purple-400", rating: "B" };
                        return { rank: "Cần Cải Thiện", bg: "bg-amber-950/40", text: "text-amber-400", rating: "C" };
                      }}
                    />
                  )}

                  {state.activeRightTab === "dna" && (
                    <AssetDnaPanel
                      parsedData={state.parsedData}
                      projectAssets={state.projectAssets}
                      characterMappings={state.characterMappings}
                      setCharacterMappings={state.setCharacterMappings}
                      locationMappings={state.locationMappings}
                      setLocationMappings={state.setLocationMappings}
                      propMappings={state.propMappings}
                      setPropMappings={state.setPropMappings}
                      draftAssets={state.draftAssets}
                      generatingAssets={state.generatingAssets}
                      handleAutoGenerateAsset={state.handleAutoGenerateAsset}
                      handleCancelDraftAsset={state.handleCancelDraftAsset}
                      handleConfirmDraftAsset={state.handleConfirmDraftAsset}
                      handleUpdateDraftDescription={state.handleUpdateDraftDescription}
                      handleRegenerateDraftAsset={state.handleRegenerateDraftAsset}
                      editingCharId={state.editingCharId}
                      setEditingCharId={state.setEditingCharId}
                      editingCharText={state.editingCharText}
                      setEditingCharText={state.setEditingCharText}
                      savingCharId={state.savingCharId}
                      handleSaveCharacterPrompt={state.handleSaveCharacterPrompt}
                      expandedCharIds={state.expandedCharIds}
                      setExpandedCharIds={state.setExpandedCharIds}
                      loadingVariants={state.loadingVariants}
                      assetVariants={state.assetVariants}
                      variantModifiers={state.variantModifiers}
                      setVariantModifiers={state.setVariantModifiers}
                      generatingVariantAssetId={state.generatingVariantAssetId}
                      variantErrors={state.variantErrors}
                      handleCreateVariant={state.handleCreateVariant}
                      handleSelectVariantAsPrimary={state.handleSelectVariantAsPrimary}
                      batchGenerating={state.batchGeneratingShots} // Reused batch state
                      batchProgressText={state.batchShotsProgress.text}
                      handleBatchGenerateDrafts={async () => {}} // Hook stub
                      handleConfirmAllDrafts={state.handleConfirmAllDrafts}
                      getCleanDnaPrompt={state.getCleanDnaPrompt}
                      environmentStyle={state.environmentStyle}
                      setEnvironmentStyle={state.setEnvironmentStyle}
                      getAssetStyleGuide={state.getAssetStyleGuide}
                      scriptText={state.scriptText}
                      setParsedData={state.setParsedData}
                    />
                  )}

                  {state.activeRightTab === "calibration" && (
                    <CalibrationSection
                      parsedData={state.parsedData}
                      pipelineStage={state.pipelineStage}
                      setPipelineStage={state.setPipelineStage}
                      calibratingSceneId={state.calibratingSceneId}
                      calibratingStatus={state.calibratingStatus}
                      calibrationStep={state.calibrationStep}
                      calibrations={state.calibrations}
                      handleCalibrateScene={state.handleCalibrateScene}
                      handleUpdateCalibrationField={state.handleUpdateCalibrationField}
                      characterMappings={state.characterMappings}
                      locationMappings={state.locationMappings}
                      propMappings={state.propMappings}
                      projectAssets={state.projectAssets}
                      handleExportNewAsset={state.handleExportNewAsset}
                      handleUpdateCausalFlowField={state.handleUpdateCausalFlowField}
                      handleSaveCalibratedScene={state.handleSaveCalibratedScene}
                      savingSceneId={state.savingSceneId}
                      batchGeneratingShots={state.batchGeneratingShots}
                      batchShotsProgress={state.batchShotsProgress}
                      handleGenerateAllStoryboardFrames={state.handleGenerateAllStoryboardFrames}
                      shotViewTab={state.shotViewTab}
                      setShotViewTab={state.setShotViewTab}
                      handleUpdateShotField={state.handleUpdateShotField}
                      getComputedShotPrompt={state.getComputedShotPrompt}
                      getDetectedAssetsForShot={state.getDetectedAssetsForShot}
                      generatingShots={state.generatingShots}
                      handleGenerateShotFrame={state.handleGenerateShotFrame}
                      runVerification={state.runVerification}
                      calculateTransitionRisk={state.calculateTransitionRisk}
                      checkCinematographyViolations={state.checkCinematographyViolations}
                      projectsList={state.projectsList}
                      selectedProjectId={state.selectedProjectId}
                      handleInsertGlueShot={state.handleInsertGlueShot}
                      handleScanCohesion={state.handleScanCohesion}
                      apiEndpoint={state.apiEndpoint}
                      handleUpdateApiEndpoint={state.handleUpdateApiEndpoint}
                      aiProvider={state.aiProvider}
                      handleUpdateAiProvider={state.handleUpdateAiProvider}
                      handleDeleteShot={state.handleDeleteShot}
                      handleAddShot={state.handleAddShot}
                      handleDecomposeShots={state.handleDecomposeShots}
                      getReferenceImagesForShot={state.getReferenceImagesForShot}
                      draftAssets={state.draftAssets}
                      storyboardAssets={state.storyboardAssets}
                    />
                  )}

                  {state.activeRightTab === "style" && (
                    <StyleCalibrationPanel
                      universeVisualPreset={state.universeVisualPreset}
                      setUniverseVisualPreset={state.setUniverseVisualPreset}
                      colorGrade={state.colorGrade}
                      setColorGrade={state.setColorGrade}
                      musicTheme={state.musicTheme}
                      setMusicTheme={state.setMusicTheme}
                      cinematicGrain={state.cinematicGrain}
                      setCinematicGrain={state.setCinematicGrain}
                      depthOfField={state.depthOfField}
                      setDepthOfField={state.setDepthOfField}
                      dialogueSpeed={state.dialogueSpeed}
                      setDialogueSpeed={state.setDialogueSpeed}
                      setStyleConsistencyScore={state.setStyleConsistencyScore}
                      isStandardizingStyle={state.isStandardizingStyle}
                      setIsStandardizingStyle={state.setIsStandardizingStyle}
                      styleRegion={state.styleRegion}
                      setStyleRegion={state.setStyleRegion}
                      styleMedium={state.styleMedium}
                      setStyleMedium={state.setStyleMedium}
                      styleMood={state.styleMood}
                      setStyleMood={state.setStyleMood}
                      stylePeriod={state.stylePeriod}
                      setStylePeriod={state.setStylePeriod}
                      customStyleInstructions={state.customStyleInstructions}
                      setCustomStyleInstructions={state.setCustomStyleInstructions}
                      isConsolidatingStyle={state.isConsolidatingStyle}
                      setIsConsolidatingStyle={state.setIsConsolidatingStyle}
                      selectedProjectId={state.selectedProjectId}
                      projectsList={state.projectsList}
                      setProjectsList={state.setProjectsList}
                      parsedData={state.parsedData}
                      setParsedData={state.setParsedData}
                      calibrations={state.calibrations}
                      setCalibrations={state.setCalibrations}
                      assetAllocations={state.assetAllocations}
                      characterMappings={state.characterMappings}
                      locationMappings={state.locationMappings}
                      propMappings={state.propMappings}
                      projectAssets={state.projectAssets}
                    />
                  )}

                </div>
              </div>

            </div>
          )}
        </div>
      </div>

      {/* 3. MODAL: CREATE EPISODE */}
      {state.showNewEpModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-md z-50 flex items-center justify-center p-4">
          <div className="bg-[#0c0c0e] border border-white/5 rounded-3xl p-6 w-full max-w-md space-y-4 shadow-2xl relative">
            <button 
              onClick={() => state.setShowNewEpModal(false)}
              className="absolute top-4 right-4 p-1 rounded-full bg-white/5 hover:bg-white/10 text-neutral-400 hover:text-white transition"
            >
              <X className="w-4 h-4" />
            </button>
            <h3 className="text-base font-black text-white uppercase tracking-widest flex items-center gap-2 border-b border-white/5 pb-3">
              <Clapperboard className="w-5 h-5 text-purple-500 animate-pulse" /> Thêm tập phim mới
            </h3>
            <div className="space-y-3 pt-1">
              <div className="space-y-1">
                <label className="text-[10px] font-black uppercase tracking-widest text-neutral-500">Tên tập phim *</label>
                <input
                  type="text"
                  value={state.newEpTitle}
                  onChange={(e) => state.setNewEpTitle(e.target.value)}
                  placeholder="Ví dụ: Tập 1: Sự khởi đầu..."
                  className="w-full bg-black border border-white/10 rounded-xl px-3 py-2 text-xs text-neutral-300 outline-none focus:border-purple-500/50 transition font-bold"
                />
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-black uppercase tracking-widest text-neutral-500">Loại tập phim</label>
                <select
                  value={state.newEpType}
                  onChange={(e) => state.setNewEpType(e.target.value)}
                  className="w-full bg-black border border-white/10 rounded-xl px-3 py-2 text-xs text-neutral-300 outline-none"
                >
                  <option value="normal">Bình thường</option>
                  <option value="climax">Cao trào (Climax)</option>
                  <option value="filler">Filler</option>
                </select>
              </div>
              <button
                onClick={async () => {
                  if (!state.newEpTitle.trim()) return;
                  await state.handleCreateEpisodeQuick(state.newEpTitle, state.newEpType);
                  state.setNewEpTitle("");
                  state.setShowNewEpModal(false);
                }}
                className="w-full bg-purple-600 hover:bg-purple-500 text-white py-2 rounded-xl text-xs font-black uppercase transition flex items-center justify-center gap-1.5"
              >
                Tạo tập phim
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 4. MODAL: PROJECT SETTINGS */}
      {state.showProjectSettingsModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-md z-50 flex items-center justify-center p-4">
          <div className="bg-[#0c0c0e] border border-white/5 rounded-3xl p-6 w-full max-w-lg space-y-4 shadow-2xl relative">
            <button 
              onClick={() => state.setShowProjectSettingsModal(false)}
              className="absolute top-4 right-4 p-1 rounded-full bg-white/5 hover:bg-white/10 text-neutral-400 hover:text-white transition"
            >
              <X className="w-4 h-4" />
            </button>
            <h3 className="text-base font-black text-white uppercase tracking-widest flex items-center gap-2 border-b border-white/5 pb-3">
              <Settings className="w-5 h-5 text-purple-500" /> Cấu hình dự án
            </h3>
            <div className="space-y-4 pt-1">
              <div className="space-y-1">
                <label className="text-[10px] font-black uppercase tracking-widest text-neutral-500">Style Prompt (Visual Style)</label>
                <textarea
                  value={state.projectSettingsForm.stylePrompt}
                  onChange={(e) => state.setProjectSettingsForm(prev => ({ ...prev, stylePrompt: e.target.value }))}
                  placeholder="Style prompt chung cho dự án..."
                  className="w-full bg-black border border-white/10 rounded-xl px-3 py-2 text-xs text-neutral-300 outline-none h-20 resize-none font-mono"
                />
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-black uppercase tracking-widest text-neutral-500">Negative Prompt</label>
                <textarea
                  value={state.projectSettingsForm.negativePrompt}
                  onChange={(e) => state.setProjectSettingsForm(prev => ({ ...prev, negativePrompt: e.target.value }))}
                  placeholder="Negative prompt..."
                  className="w-full bg-black border border-white/10 rounded-xl px-3 py-2 text-xs text-neutral-300 outline-none h-20 resize-none font-mono"
                />
              </div>
              <button
                onClick={state.handleSaveProjectSettings}
                disabled={state.isSavingProjectSettings}
                className="w-full bg-purple-600 hover:bg-purple-500 disabled:opacity-50 text-white py-2 rounded-xl text-xs font-black uppercase transition flex items-center justify-center gap-1.5"
              >
                {state.isSavingProjectSettings ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                Lưu cấu hình
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
