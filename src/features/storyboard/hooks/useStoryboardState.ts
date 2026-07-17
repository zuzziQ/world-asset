import { useState, useEffect, useCallback, useRef } from "react";
import { useGFlowExtension } from "@/hooks/useGFlowExtension";
import { 
  updateProject, 
  updateEpisode,
  fetchCharacters, 
  extractCharactersWithAI,
  fetchStoryboardAssets,
  analyzeEpisodeScript,
  evaluateEpisodeScript,
  consolidateProjectStyle,
  fetchSettings,
  getApiBaseUrl,
  API_BASE_URL,
  HUB_API_KEY,
  generateText
} from "@/lib/api";
import { useProjectEpisodes } from "./useProjectEpisodes";
import { useAssetOperations } from "./useAssetOperations";
import { useCopilotCalibration } from "./useCopilotCalibration";
import { EvaluationResult } from "../types";
import { monitorJob } from "../utils/monitorJob";
import { 
  getCleanDnaPrompt, 
  mapEvaluationResult, 
  removeDuplicateStylePrompt 
} from "../utils/helpers";
import { generateExpandedShots } from "../utils/generateExpandedShots";
import { generateAutoCalibration, compileGroundedPrompt } from "../utils/calibrationHelpers";
import mockScreenplays from "../data/mockScreenplays.json";
import { suggestCharacters } from "../utils/suggestCharacters";

const safeParseJson = (data: any): any => {
  if (!data) return null;
  if (typeof data === 'object') return data;
  try {
    return JSON.parse(data);
  } catch (e) {
    const cleaned = String(data)
      .replace(/```json/gi, '')
      .replace(/```/gi, '')
      .trim();
    try {
      return JSON.parse(cleaned);
    } catch (err) {
      console.error("[safeParseJson] Error parsing JSON:", err);
      throw new Error(`Dữ liệu không đúng định dạng JSON: ${String(err)}`);
    }
  }
};

export function useStoryboardState() {
  const { getGFlowToken } = useGFlowExtension();

  // 1. Projects & Episodes
  const pe = useProjectEpisodes();

  // Project Settings Modal States
  const [showProjectSettingsModal, setShowProjectSettingsModal] = useState(false);
  const [projectSettingsForm, setProjectSettingsForm] = useState({ stylePrompt: "", negativePrompt: "" });
  const [isSavingProjectSettings, setIsSavingProjectSettings] = useState(false);

  // AI results
  const [evaluation, setEvaluation] = useState<EvaluationResult | null>(null);
  const [parsedData, setParsedData] = useState<any | null>(null);
  const [totalDuration, setTotalDuration] = useState<number>(180);
  const [avgShotDuration, setAvgShotDuration] = useState<number>(4);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [isEvaluating, setIsEvaluating] = useState(false);

  // Accordion toggle states
  const [expandedStrengths, setExpandedStrengths] = useState(true);
  const [expandedWeaknesses, setExpandedWeaknesses] = useState(true);
  const [expandedSuggestions, setExpandedSuggestions] = useState(true);

  // Storyboard assets album
  const [storyboardAssets, setStoryboardAssets] = useState<any[]>([]);
  const [isLoadingStoryboardAssets, setIsLoadingStoryboardAssets] = useState(false);
  const [selectedStoryboardAsset, setSelectedStoryboardAsset] = useState<any | null>(null);

  // UI tabs
  const [activeRightTab, setActiveRightTab] = useState<"evaluate" | "dna" | "calibration" | "style">("evaluate");
  const [pipelineStage, setPipelineStage] = useState<"scene" | "shot" | "video">("scene");
  const [shotViewTab, setShotViewTab] = useState<"cards" | "table">("table");

  // Episode Creation Inline Form
  const [showNewEpModal, setShowNewEpModal] = useState(false);
  const [newEpTitle, setNewEpTitle] = useState("");
  const [newEpType, setNewEpType] = useState("normal");

  const [selectedAssetId, setSelectedAssetId] = useState<string>("");

  const getCombinedNegativePrompt = useCallback(() => {
    const activeProject = pe.projectsList.find(p => p.id === pe.selectedProjectId);
    const projNeg = activeProject?.negativePrompt;
    const univNeg: string = "";
    
    const partsA = projNeg ? projNeg.split(',').map((s: any) => s.trim()).filter(Boolean) : [];
    const partsB = univNeg ? univNeg.split(',').map((s: any) => s.trim()).filter(Boolean) : [];
    
    const unique = new Set<string>();
    const result: string[] = [];
    
    for (const part of [...partsA, ...partsB]) {
      const lower = part.toLowerCase();
      if (!unique.has(lower)) {
        unique.add(lower);
        result.push(part);
      }
    }
    return result.join(', ');
  }, [pe.projectsList, pe.selectedProjectId]);

  const getActiveExtensionId = useCallback(() => {
    if (typeof window === 'undefined') return null;
    const domId = document.documentElement.getAttribute("data-storymee-extension-id");
    if (domId) {
      localStorage.setItem('STORYMEE_EXT_ID', domId);
      return domId;
    }
    return localStorage.getItem('STORYMEE_EXT_ID');
  }, []);

  const ensureGFlowProjectForEpisode = async (episodeId: string) => {
    try {
      const activeEp = pe.episodesList.find(e => e.id === episodeId);
      const activeProj = pe.projectsList.find(p => p.id === pe.selectedProjectId);
      let gflowProjectId = activeEp?.meta?.gflowProjectId || activeProj?.meta?.gflowProjectId;

      if (!gflowProjectId) {
        const extId = getActiveExtensionId();
        if (extId && extId !== 'sk-extension-default' && (window as any).chrome?.runtime) {
          const projectName = `[StoryMee] - ${activeEp?.title || activeProj?.name || 'Untitled'}`;
          try {
             const response: any = await new Promise((resolve, reject) => {
               (window as any).chrome.runtime.sendMessage(extId, {
                 action: "CREATE_PROJECT",
                 payload: { projectName }
               }, (res: any) => {
                 if ((window as any).chrome.runtime.lastError) {
                   reject((window as any).chrome.runtime.lastError);
                 } else {
                   resolve(res);
                 }
               });
             });

             if (response?.projectId) {
               gflowProjectId = response.projectId;
               const updatedMeta = { ...(activeEp?.meta || {}), gflowProjectId };
               await updateEpisode({ id: episodeId, meta: updatedMeta });
               pe.setEpisodesList(prev => prev.map(e => e.id === episodeId ? { ...e, meta: updatedMeta } : e));
             }
          } catch (msgErr) {
            console.warn(`[GFlow] Lỗi extension:`, msgErr);
          }
        }
      }
      return gflowProjectId;
    } catch (e) {
      console.error("[GFlow] Lỗi tạo dự án:", e);
      return null;
    }
  };

  const [projectAssets, setProjectAssets] = useState<any[]>([]);
  const compilePromptRef = useRef<any>(null);

  // 2. Co-pilot & Calibration
  const cc = useCopilotCalibration({
    projectAssets,
    scriptText: pe.scriptText,
    selectedProjectId: pe.selectedProjectId,
    parsedData,
    setParsedData,
    setProjectAssets,
    projectsList: pe.projectsList,
    setProjectsList: pe.setProjectsList,
    getGFlowToken,
    callCompileGroundedPrompt: (scene, calib) => compilePromptRef.current?.(scene, calib)
  });

  // 3. Asset Operations
  const ao = useAssetOperations({
    selectedProjectId: pe.selectedProjectId,
    selectedEpisodeId: pe.selectedEpisodeId,
    scriptText: pe.scriptText,
    projectsList: pe.projectsList,
    getCombinedNegativePrompt,
    environmentStyle: cc.environmentStyle,
    parsedData,
    setParsedData,
    projectAssets,
    setProjectAssets,
    aiProvider: cc.aiProvider,
    universeVisualPreset: cc.universeVisualPreset,
    ensureGFlowProjectForEpisode
  });

  compilePromptRef.current = (scene: any, calibrationData: any) => {
    return compileGroundedPrompt(
      scene,
      calibrationData,
      parsedData,
      cc.assetAllocations,
      ao.characterMappings,
      ao.locationMappings,
      ao.propMappings,
      projectAssets,
      pe.projectsList,
      pe.selectedProjectId,
      cc.universeVisualPreset,
      cc.colorGrade,
      cc.cinematicGrain,
      cc.depthOfField
    );
  };

  const handleAISuggestOptions = async () => {
    if (!cc.rawPremise.trim()) {
      alert("Sếp ơi, nhập ý tưởng cốt lõi (Premise) trước khi tạo Options nhé!");
      return;
    }

    cc.setIsExtractingCharacters(true);
    const dbCharacters = projectAssets.filter(a => a.entityType?.toLowerCase() === "character").map(a => a.name);
    try {
      const finalNames = await suggestCharacters(cc.rawPremise, dbCharacters);
      cc.setScenarioCharacters(finalNames);
      cc.setHasGeneratedOptions(true);
    } catch (err) {
      console.error(err);
    } finally {
      cc.setIsExtractingCharacters(false);
    }
  };

  const loadStoryboardAssets = async (epId: string) => {
    if (!epId || epId === "undefined" || epId === "null") return;
    setIsLoadingStoryboardAssets(true);
    try {
      const data = await fetchStoryboardAssets(epId);
      if (data && data.assets) {
        const filtered = data.assets.filter((a: any) => a.sceneId !== null);
        setStoryboardAssets(filtered || []);
      }
      if (data && data.episode) {
        const ep = data.episode;
        const savedShots = ep.meta && typeof ep.meta === 'object' ? (ep.meta as any).shots || [] : [];
        setParsedData({
          scenes: ep.scenes || [],
          characters: data.characters || [],
          locations: data.locations || [],
          props: ep.meta?.parsedProps || [],
          shots: savedShots,
          episodeId: ep.id
        });
        
        if (ep.meta) {
          if (ep.meta.totalDuration) setTotalDuration(ep.meta.totalDuration);
          if (ep.meta.avgShotDuration) setAvgShotDuration(ep.meta.avgShotDuration);
        }
      }
    } catch (e) {
      console.error("Failed to load storyboard assets:", e);
    } finally {
      setIsLoadingStoryboardAssets(false);
    }
  };


  const autoMapEntitiesToAssets = (
    chars: any[],
    locs: any[],
    props: any[],
    assets: any[]
  ) => {
    const newCharMappings: Record<string, string> = { ...ao.characterMappings };
    const newLocMappings: Record<string, string> = { ...ao.locationMappings };
    const newPropMappings: Record<string, string> = { ...ao.propMappings };

    const getLevenshteinDistance = (a: string, b: string): number => {
      const tmp = [];
      let i, j;
      for (i = 0; i <= a.length; i++) tmp.push([i]);
      for (j = 1; j <= b.length; j++) tmp[0].push(j);
      for (i = 1; i <= a.length; i++) {
        for (j = 1; j <= b.length; j++) {
          tmp[i][j] = Math.min(
            tmp[i - 1][j] + 1,
            tmp[i][j - 1] + 1,
            tmp[i - 1][j - 1] + (a[i - 1].toLowerCase() === b[j - 1].toLowerCase() ? 0 : 1)
          );
        }
      }
      return tmp[a.length][b.length];
    };

    chars.forEach((c: any) => {
      if (newCharMappings[c.name]) return;
      const lowerName = c.name.toLowerCase();
      const match = assets.find(a => 
        a.entityType?.toLowerCase() === "character" && 
        (a.name.toLowerCase() === lowerName || lowerName.includes(a.name.toLowerCase()) || a.name.toLowerCase().includes(lowerName))
      );
      if (match) {
        newCharMappings[c.name] = match.id;
      }
    });

    locs.forEach((l: any) => {
      if (newLocMappings[l.name]) return;
      const lowerName = l.name.toLowerCase();
      const match = assets.find(a => 
        (a.entityType?.toLowerCase() === "location" || a.entityType?.toLowerCase() === "setting") && 
        (a.name.toLowerCase() === lowerName || lowerName.includes(a.name.toLowerCase()) || a.name.toLowerCase().includes(lowerName))
      );
      if (match) {
        newLocMappings[l.name] = match.id;
      }
    });

    ao.setCharacterMappings(newCharMappings);
    ao.setLocationMappings(newLocMappings);
  };

  const runFallbackTemplateScreenplay = () => {
    let activeCharNames = cc.scenarioCharacters;
    if (activeCharNames.length === 0) {
      activeCharNames = ["Mica", "Paco"];
    }

    const char1 = activeCharNames[0] || "Mica";
    const char2 = activeCharNames[1] || "Paco";
    let locationName = "Phòng khách";
    const sceneDuration = Math.round(totalDuration / 3);

    const scenesArray = [
      {
        id: "SC01",
        sceneNumber: 1,
        title: `INT. ${locationName.toUpperCase()} - BAN NGÀY`,
        description: `Khởi đầu kịch bản: ${cc.rawPremise}.`,
        nhân_vật: `${char1}, ${char2}`,
        bối_cảnh: locationName,
        duration: sceneDuration
      },
      {
        id: "SC02",
        sceneNumber: 2,
        title: `INT. ${locationName.toUpperCase()} - CHIỀU TÀ`,
        description: `Nút thắt và kịch tính xảy ra.`,
        nhân_vật: `${char1}, ${char2}`,
        bối_cảnh: locationName,
        duration: sceneDuration
      },
      {
        id: "SC03",
        sceneNumber: 3,
        title: `INT. ${locationName.toUpperCase()} - BAN ĐÊM`,
        description: `Giải quyết vấn đề và bài học cảnh kết.`,
        nhân_vật: `${char1}, ${char2}`,
        bối_cảnh: locationName,
        duration: totalDuration - (sceneDuration * 2)
      }
    ];

    const compiled = `Cảnh 1. INT. ${locationName.toUpperCase()} - BAN NGÀY
Hành động: ${char1} và ${char2} chuẩn bị cho chuyến phiêu lưu mới.
${char1}: (Hào hứng) Sẵn sàng chưa nào!

Cảnh 2. INT. ${locationName.toUpperCase()} - CHIỀU TÀ
Hành động: Xuất hiện nút thắt bất ngờ.
${char2}: (Lo lắng) Coi chừng kìa!

Cảnh 3. INT. ${locationName.toUpperCase()} - BAN ĐÊM
Hành động: Cả hai giải quyết êm đẹp thử thách và nở nụ cười.`;

    pe.setScriptText(compiled);
    cc.setEditorMode("editor");

    const initialShots = generateExpandedShots(scenesArray, activeCharNames, totalDuration, avgShotDuration, compiled);
    setParsedData({
      scenes: scenesArray,
      characters: activeCharNames.map((name, i) => ({ id: `char-${i}`, name })),
      locations: [{ id: "loc-1", name: locationName }],
      props: mockScreenplays.props,
      shots: initialShots,
      episodeId: pe.selectedEpisodeId
    });

    const defaultAllocations: Record<string, Record<string, "reuse" | "create">> = {};
    scenesArray.forEach(scene => {
      defaultAllocations[scene.id] = {
        [char1]: "reuse",
        [char2]: "reuse",
        [locationName]: "create"
      };
    });
    cc.setAssetAllocations(defaultAllocations);
    setActiveRightTab("calibration");
  };

  const handleCompileScreenplay = async () => {
    if (!cc.rawPremise.trim()) return;
    setIsAnalyzing(true);
    cc.setIsCompilingCopilot(true);

    try {
      const token = await getGFlowToken().catch(() => null);
      const prompt = `You are a professional movie screenwriter and director. 
Analyze the following user idea, duration requirements, character cast list, visual setting, emotion tone, dramatic twists, and hook to write a complete screenplay and break it down into sequential scenes.

[INPUT CONFIGURATION]
- Idea Premise: "${cc.rawPremise}"
- Participating Characters: ${cc.scenarioCharacters.join(", ") || "No character"}
- Visual Style / Location Context: "${cc.customStyleInstructions || cc.selectedVisual || "No setting"}"
- Emotional Tone: "${cc.selectedEmotion || "Neutral"}"
- Dramatic Twist: "${cc.selectedTwist || "None"}"
- Retention Hook: "${cc.selectedRetention || "None"}"
- Target Total Duration: ${totalDuration} seconds
- Target Average Shot Duration: ${avgShotDuration} seconds

[OUTPUT REQUIREMENTS]
1. Write a professional kịch bản in Vietnamese (rawScript). Use formatting:
Cảnh 1. INT. BỐI CẢNH - BAN NGÀY
Hành động: [Chi tiết hành động]
[Tên Nhân Vật]: [Lời thoại]

2. Sum of scene durations must equal ${totalDuration} seconds.
3. Output ONLY a valid JSON with keys: "rawScript", "characters", "locations", "scenes". Do NOT include markdown code blocks.`;

      const res = await generateText(prompt);
      if (!res || !res.data || !res.data.text) throw new Error("Empty AI result");
      const generated = res.data.text;
      const cleanJsonStr = generated.replace(/```json/g, '').replace(/```/g, '').trim();

      const parsedResponse = safeParseJson(cleanJsonStr);
      const compiled = parsedResponse.rawScript;
      const scenesArray = parsedResponse.scenes;
      const charactersList = parsedResponse.characters || [];
      const locationsList = parsedResponse.locations || [];
      const charNames = charactersList.map((c: any) => c.name);


      pe.setScriptText(compiled);
      cc.setEditorMode("editor");

      const initialShots = generateExpandedShots(scenesArray, charNames, totalDuration, avgShotDuration, compiled);
      setParsedData({
        scenes: scenesArray,
        characters: charactersList.map((c: any, i: number) => ({ id: c.id || `char-${i}`, name: c.name })),
        locations: locationsList.map((l: any, i: number) => ({ id: l.id || `loc-${i}`, name: l.name })),
        props: parsedResponse.props || mockScreenplays.props,
        shots: initialShots,
        episodeId: pe.selectedEpisodeId
      });

      const defaultAllocations: Record<string, Record<string, "reuse" | "create">> = {};
      scenesArray.forEach((scene: any) => {
        defaultAllocations[scene.id] = {};
        charNames.forEach((name: string) => {
          defaultAllocations[scene.id][name] = "reuse";
        });
        locationsList.forEach((loc: any) => {
          defaultAllocations[scene.id][loc.name] = "create";
        });
      });
      cc.setAssetAllocations(defaultAllocations);

      const mappings: Record<string, string> = {};
      charNames.forEach((name: string) => {
        const matched = ao.projectAssets.find(a => a.name.toLowerCase() === name.toLowerCase());
        if (matched) mappings[name] = matched.id;
      });
      ao.setCharacterMappings(mappings);
      setActiveRightTab("calibration");
    } catch (error) {
      console.warn("AI compile failed, running fallback...", error);
      runFallbackTemplateScreenplay();
    } finally {
      setIsAnalyzing(false);
      cc.setIsCompilingCopilot(false);
    }
  };


  const callCompileGroundedPrompt = (scene: any, calibrationData: any) => {
    return compileGroundedPrompt(
      scene,
      calibrationData,
      parsedData,
      cc.assetAllocations,
      ao.characterMappings,
      ao.locationMappings,
      ao.propMappings,
      ao.projectAssets,
      pe.projectsList,
      pe.selectedProjectId,
      cc.universeVisualPreset,
      cc.colorGrade,
      cc.cinematicGrain,
      cc.depthOfField
    );
  };

  const handleLoadDemoMode = () => {
    pe.setSelectedEpisodeId("demo-episode");
    const demoScript = `Cảnh 1. Ban công chung cư Hà Nội - Chiều tối giông bão
Hành động: Bầu trời Hà Nội xám xịt giông bão. Dây phơi quần áo rung lắc dữ dội.
Cảnh 2. Phòng khách căn hộ - Ban ngày ấm áp
Hành động: Phòng khách sàn gỗ ấm cúng. Bố đang chăm chú làm việc.`;

    pe.setScriptText(demoScript);
    const mockScenes = [
      { id: "demo-scene-1", sceneNumber: 1, title: "Cơn giông bão giăng kín thành phố", description: "Mây đen cuộn sóng trên bầu trời." },
      { id: "demo-scene-2", sceneNumber: 2, title: "Góc làm việc ấm cúng của Bố", description: "Bố làm việc đằng sau màn hình." }
    ];
    setParsedData({
      scenes: mockScenes,
      characters: [{ id: "char-1", name: "Mica" }, { id: "char-2", name: "Paco" }],
      locations: [{ id: "loc-1", name: "Ban công" }],
      props: mockScreenplays.props,
      shots: [],
      episodeId: "demo-episode"
    });
    setActiveRightTab("calibration");
  };

  const handleUnifiedAnalyzeAndEvaluate = async () => {
    if (!pe.selectedEpisodeId) return;
    setIsAnalyzing(true);
    setIsEvaluating(true);
    let analyzeError: any = null;
    let evaluateError: any = null;
    try {
      await ensureGFlowProjectForEpisode(pe.selectedEpisodeId);
      const token = await getGFlowToken().catch(() => undefined);
      const accessToken = token || undefined;
      const existingAssetsContext = ao.projectAssets.map((a: any) => 
        `- [${(a.entityType || 'ASSET').toUpperCase()}] ${a.name}: ${a.description || ''}`
      ).join("\n");

      const [responseAnalyze, responseEvaluate] = await Promise.all([
        analyzeEpisodeScript(pe.selectedEpisodeId, pe.scriptText, accessToken, { existingAssets: existingAssetsContext }).catch((err) => {
          analyzeError = err;
          return null;
        }),
        evaluateEpisodeScript(pe.selectedEpisodeId, pe.scriptText, accessToken).catch((err) => {
          evaluateError = err;
          return null;
        })
      ]);

      let analyzeResultData: any = null;
      let evaluateResultData: any = null;

      const monitorAnalyze = async () => {
        if (!responseAnalyze || responseAnalyze.status !== "success" || !responseAnalyze.data?.jobId) {
          throw analyzeError || new Error("Failed analyze");
        }
        const finishedJob = await monitorJob(responseAnalyze.data.jobId, { forceHttp: true, timeoutMs: 120000 });
        const outputJsonStr = finishedJob.outputUrls && finishedJob.outputUrls[0];
        if (!outputJsonStr) throw new Error("Empty analyze result");
        analyzeResultData = safeParseJson(outputJsonStr);
      };

      const monitorEvaluate = async () => {
        if (!responseEvaluate || responseEvaluate.status !== "success" || !responseEvaluate.data?.jobId) {
          throw evaluateError || new Error("Failed evaluate");
        }
        const finishedJob = await monitorJob(responseEvaluate.data.jobId, { forceHttp: true, timeoutMs: 120000 });
        const outputJsonStr = finishedJob.outputUrls && finishedJob.outputUrls[0];
        if (!outputJsonStr) throw new Error("Empty evaluate result");
        evaluateResultData = safeParseJson(outputJsonStr);
      };

      await Promise.all([
        monitorAnalyze().catch((err) => { analyzeError = err; }),
        monitorEvaluate().catch((err) => { evaluateError = err; })
      ]);

      if (analyzeResultData) {
        const dbCharacterNames = ao.projectAssets.filter(a => a.entityType?.toLowerCase() === "character").map(a => a.name.toLowerCase());
        const filteredCharacters = (analyzeResultData.characters || []).filter((c: any) => {
          const lowerName = c.name.toLowerCase();
          return dbCharacterNames.includes(lowerName) || ["wolfie", "chloe", "kilo", "bruno"].includes(lowerName);
        });

        const scenes = analyzeResultData.scenes || [];
        const initialCalibs: Record<string, any> = {};
        scenes.forEach((scene: any) => {
          const initialCalib = generateAutoCalibration(scene);
          initialCalib.stage4.groundedPrompt = callCompileGroundedPrompt(scene, initialCalib);
          initialCalibs[scene.id] = initialCalib;
        });
        cc.setCalibrations(prev => ({ ...prev, ...initialCalibs }));

        const parsedLocs = analyzeResultData.locations || [];
        const parsedProps = analyzeResultData.props || [];

        setParsedData({
          scenes,
          characters: filteredCharacters,
          locations: parsedLocs,
          props: parsedProps,
          episodeId: pe.selectedEpisodeId
        });

        autoMapEntitiesToAssets(filteredCharacters, parsedLocs, parsedProps, ao.projectAssets);
      }

      if (evaluateResultData) {
        setEvaluation(mapEvaluationResult(evaluateResultData));
      }
      setActiveRightTab("evaluate");
    } catch (e) {
      console.error(e);
      const confirmDemo = window.confirm("Không thể kết nối AI Engine. Chuyển sang Demo Mode?");
      if (confirmDemo) handleLoadDemoMode();
    } finally {
      setIsAnalyzing(false);
      setIsEvaluating(false);
    }
  };

  const handleUniverseChange = (projId: string) => {
    pe.setSelectedProjectId(projId);
    pe.setEpisodesList([]);
    pe.setSelectedEpisodeId("");
    pe.setScriptText("");
    setEvaluation(null);
    setParsedData(null);
    ao.setDraftAssets({});
    ao.loadDbAssets(projId);
    pe.loadEpisodesList(projId);
  };

  const handleSaveProjectSettings = async () => {
    if (!pe.selectedProjectId) return;
    setIsSavingProjectSettings(true);
    try {
      await updateProject(pe.selectedProjectId, {
        stylePrompt: projectSettingsForm.stylePrompt,
        negativePrompt: projectSettingsForm.negativePrompt
      });
      pe.setProjectsList((prev: any[]) => prev.map(p => 
        p.id === pe.selectedProjectId 
          ? { ...p, stylePrompt: projectSettingsForm.stylePrompt, negativePrompt: projectSettingsForm.negativePrompt } 
          : p
      ));
      setShowProjectSettingsModal(false);
    } catch (e) {
      console.error("Failed to save project settings:", e);
      alert("Failed to save project settings");
    } finally {
      setIsSavingProjectSettings(false);
    }
  };

  // Sync selection when query params change
  useEffect(() => {
    if (ao.projectAssets.length > 0 && pe.selectedProjectId) {
      const query = new URLSearchParams(window.location.search);
      const qAssetId = query.get("assetId");
      if (qAssetId && qAssetId !== selectedAssetId) {
        setSelectedAssetId(qAssetId);
      }
    }
  }, [ao.projectAssets, pe.selectedProjectId]);

  const updateUrlParams = (projId: string, assetId?: string) => {
    if (typeof window === "undefined") return;
    const url = new URL(window.location.href);
    if (projId) {
      url.searchParams.set("projectId", projId);
    } else {
      url.searchParams.delete("projectId");
    }
    if (assetId) {
      url.searchParams.set("assetId", assetId);
    } else {
      url.searchParams.delete("assetId");
    }
    window.history.replaceState({}, "", url.toString());
  };

  // Sync url params and load initial data
  const updateUrlParamsAndLoad = (projId: string, assetId?: string) => {
    updateUrlParams(projId, assetId);
  };

  // Sync projects and initial query sync
  useEffect(() => {
    const initLoad = async () => {
      await pe.loadProjectsList();
      const query = new URLSearchParams(window.location.search);
      const qAssetId = query.get("assetId");
      if (qAssetId) {
        setSelectedAssetId(qAssetId);
      }
    };
    initLoad();
  }, []);

  // Sync storyboard data when selected project changes globally
  useEffect(() => {
    if (pe.selectedProjectId) {
      // Update URL parameters
      updateUrlParams(pe.selectedProjectId);
      // Reload episodes and database assets for the new project
      pe.loadEpisodesList(pe.selectedProjectId);
      ao.loadDbAssets(pe.selectedProjectId);
    }
  }, [pe.selectedProjectId]);

  // Sync storyboard assets when episode changes
  useEffect(() => {
    if (pe.selectedEpisodeId) {
      loadStoryboardAssets(pe.selectedEpisodeId);
    } else {
      setStoryboardAssets([]);
    }
  }, [pe.selectedEpisodeId]);

  return {
    ...pe,
    ...cc,
    ...ao,
    selectedAssetId,
    setSelectedAssetId,
    showProjectSettingsModal,
    setShowProjectSettingsModal,
    projectSettingsForm,
    setProjectSettingsForm,
    isSavingProjectSettings,
    setIsSavingProjectSettings,
    evaluation,
    setEvaluation,
    parsedData,
    setParsedData,
    totalDuration,
    setTotalDuration,
    avgShotDuration,
    setAvgShotDuration,
    isAnalyzing,
    setIsAnalyzing,
    isEvaluating,
    setIsEvaluating,
    expandedStrengths,
    setExpandedStrengths,
    expandedWeaknesses,
    setExpandedWeaknesses,
    expandedSuggestions,
    setExpandedSuggestions,
    storyboardAssets,
    setStoryboardAssets,
    isLoadingStoryboardAssets,
    selectedStoryboardAsset,
    setSelectedStoryboardAsset,
    activeRightTab,
    setActiveRightTab,
    pipelineStage,
    setPipelineStage,
    shotViewTab,
    setShotViewTab,
    showNewEpModal,
    setShowNewEpModal,
    newEpTitle,
    setNewEpTitle,
    newEpType,
    setNewEpType,
    getCombinedNegativePrompt,
    handleUniverseChange,
    handleSaveProjectSettings,
    handleAISuggestOptions,
    loadStoryboardAssets,
    ensureGFlowProjectForEpisode,
    getCleanDnaPrompt,
    autoMapEntitiesToAssets,
    runFallbackTemplateScreenplay,
    handleCompileScreenplay,
    callCompileGroundedPrompt,
    handleLoadDemoMode,
    handleUnifiedAnalyzeAndEvaluate,
    updateUrlParamsAndLoad,
    API_BASE_URL
  };
}
