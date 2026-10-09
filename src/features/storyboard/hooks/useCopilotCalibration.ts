"use client";

import React, { useState, useMemo } from "react";
import mockScreenplays from "../data/mockScreenplays.json";
import { createCharacter, updateCharacter, updateScene, fetchCharacters, updateProject, consolidateProjectStyle, generateText } from "@/lib/api";
import { generateAutoCalibration } from "../utils/calibrationHelpers";

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

interface CopilotCalibrationProps {
  projectAssets: any[];
  scriptText: string;
  selectedProjectId: string;
  parsedData: any;
  setParsedData: React.Dispatch<React.SetStateAction<any>>;
  setProjectAssets: React.Dispatch<React.SetStateAction<any[]>>;
  callCompileGroundedPrompt: (scene: any, calibrationData: any) => string;
  projectsList: any[];
  setProjectsList: React.Dispatch<React.SetStateAction<any[]>>;
  getGFlowToken: () => Promise<string | null>;
}

export function useCopilotCalibration({
  projectAssets,
  scriptText,
  selectedProjectId,
  parsedData,
  setParsedData,
  setProjectAssets,
  callCompileGroundedPrompt,
  projectsList,
  setProjectsList,
  getGFlowToken
}: CopilotCalibrationProps) {
  // Dynamic API Endpoint & Provider States (Client-side localized)
  const [apiEndpoint, setApiEndpoint] = useState<string>(() => {
    const raw = process.env.NEXT_PUBLIC_CORE_API_URL || "https://dev-hub.storymee.com";
    return raw.endsWith('/') ? `${raw.slice(0, -1)}/api` : `${raw}/api`;
  });
  const [aiProvider, setAiProvider] = useState<string>("gflow");

  // Interactive Co-Pilot States
  const [editorMode, setEditorMode] = useState<"editor" | "copilot">("editor");
  const [rawPremise, setRawPremise] = useState("");
  const [selectedEmotion, setSelectedEmotion] = useState("Căng thẳng, hồi hộp");
  const [selectedTwist, setSelectedTwist] = useState("Elena xuất hiện bất ngờ");
  const [selectedVisual, setSelectedVisual] = useState("Rừng sương mù âm u");
  const [selectedRetention, setSelectedRetention] = useState("Quái thú đột biến gầm rú");
  const [isCompilingCopilot, setIsCompilingCopilot] = useState(false);
  const [scenarioCharacters, setScenarioCharacters] = useState<string[]>([]);
  const [isExtractingCharacters, setIsExtractingCharacters] = useState(false);
  const [newScenarioCharInput, setNewScenarioCharInput] = useState("");
  const [hasGeneratedOptions, setHasGeneratedOptions] = useState(false);

  // Aesthetic style calibration board states
  const [universeVisualPreset, setUniverseVisualPreset] = useState("Pixar 3D Stylized");
  const [colorGrade, setColorGrade] = useState("Warm Whimsical");
  const [musicTheme, setMusicTheme] = useState("Lofi Detective Rain");
  const [cinematicGrain, setCinematicGrain] = useState(15);
  const [depthOfField, setDepthOfField] = useState(85);
  const [dialogueSpeed, setDialogueSpeed] = useState(1.0);
  const [styleConsistencyScore, setStyleConsistencyScore] = useState(96);
  const [isStandardizingStyle, setIsStandardizingStyle] = useState(false);
  const [environmentStyle, setEnvironmentStyle] = useState("Modern & Clean (Chung cư hiện đại, kính cường lực, tối giản)");
  
  // Style Definition Wizard States
  const [styleRegion, setStyleRegion] = useState("Đô thị Việt Nam hiện đại");
  const [styleMedium, setStyleMedium] = useState("Ảnh chụp điện ảnh thực tế");
  const [styleMood, setStyleMood] = useState("Hiện đại & Trong trẻo");
  const [stylePeriod, setStylePeriod] = useState("Thời đại hiện đại");
  const [customStyleInstructions, setCustomStyleInstructions] = useState("");
  const [isConsolidatingStyle, setIsConsolidatingStyle] = useState(false);
  const [isSuggestingStyle, setIsSuggestingStyle] = useState(false);

  // 5-Stage Cinematic Calibration state
  const [calibrations, setCalibrations] = useState<Record<string, any>>({});
  const [calibratingSceneId, setCalibratingSceneId] = useState<string | null>(null);
  const [calibrationStep, setCalibrationStep] = useState<number>(0);
  const [calibratingStatus, setCalibratingStatus] = useState<string>("");
  const [savingSceneId, setSavingSceneId] = useState<string | null>(null);

  // Custom Chip States
  const [customEmotions, setCustomEmotions] = useState<string[]>([]);
  const [customTwists, setCustomTwists] = useState<string[]>([]);
  const [customVisuals, setCustomVisuals] = useState<string[]>([]);
  const [customRetentions, setCustomRetentions] = useState<string[]>([]);

  const [newEmotionInput, setNewEmotionInput] = useState("");
  const [newTwistInput, setNewTwistInput] = useState("");
  const [newVisualInput, setNewVisualInput] = useState("");
  const [newRetentionInput, setNewRetentionInput] = useState("");

  const [assetAllocations, setAssetAllocations] = useState<Record<string, Record<string, "reuse" | "create">>>({}); // sceneId -> assetName -> "reuse"|"create"

  // Local storage initialization
  React.useEffect(() => {
    if (typeof window !== "undefined") {
      const defaultUrl = process.env.NEXT_PUBLIC_CORE_API_URL ? `${process.env.NEXT_PUBLIC_CORE_API_URL.replace(/\/$/, '')}/api` : "https://dev-hub.storymee.com/api";
      const savedEndpoint = localStorage.getItem("STORYMEE_CUSTOM_API_URL") || defaultUrl;
      const savedProvider = localStorage.getItem("STORYMEE_AI_PROVIDER") || "gflow";
      setApiEndpoint(savedEndpoint);
      setAiProvider(savedProvider);
    }
  }, []);

  const handleUpdateApiEndpoint = (newUrl: string) => {
    setApiEndpoint(newUrl);
    if (typeof window !== "undefined") {
      localStorage.setItem("STORYMEE_CUSTOM_API_URL", newUrl);
    }
  };

  const handleUpdateAiProvider = (newProvider: string) => {
    setAiProvider(newProvider);
    if (typeof window !== "undefined") {
      localStorage.setItem("STORYMEE_AI_PROVIDER", newProvider);
    }
  };

  const handleRemoveScenarioCharacter = (name: string) => {
    setScenarioCharacters(prev => prev.filter(c => c !== name));
  };

  const handleAddScenarioCharacter = (name: string) => {
    const trimmed = name.trim();
    if (!trimmed) return;
    if (scenarioCharacters.some(c => c.toLowerCase() === trimmed.toLowerCase())) return;
    setScenarioCharacters(prev => [...prev, trimmed]);
  };

  // Loophole conflict detector
  const premiseLoophole = useMemo(() => {
    if (!rawPremise) return null;
    const premiseLower = rawPremise.toLowerCase();
    
    const lp = mockScreenplays.loophole;
    const hasMissing = lp.triggers.missing.some(kw => premiseLower.includes(kw));
    const hasInvestigating = lp.triggers.investigate.some(kw => premiseLower.includes(kw));
    const hasKilo = lp.triggers.characters.some(kw => premiseLower.includes(kw));
    
    if (hasMissing && hasInvestigating && hasKilo) {
      return {
        title: lp.warning.title,
        message: lp.warning.description
      };
    }
    return null;
  }, [rawPremise]);

  const getDynamicOptions = () => {
    const characters = projectAssets.filter(a => a.entityType?.toLowerCase() === "character");
    const locations = projectAssets.filter(a => a.entityType?.toLowerCase() === "location" || a.entityType?.toLowerCase() === "setting" || a.entityType?.toLowerCase() === "scene");

    const hasKilo = characters.some(c => c.name.toLowerCase() === "kilo");
    const hasBruno = characters.some(c => c.name.toLowerCase() === "bruno");
    const hasWolfie = characters.some(c => c.name.toLowerCase() === "wolfie" || c.name.toLowerCase() === "wollfie");
    const hasChloe = characters.some(c => c.name.toLowerCase() === "chloe");

    const kiloName = characters.find(c => c.name.toLowerCase() === "kilo")?.name || "Kilo";
    const brunoName = characters.find(c => c.name.toLowerCase() === "bruno")?.name || "Bruno";
    const wolfieName = characters.find(c => c.name.toLowerCase() === "wolfie" || c.name.toLowerCase() === "wollfie")?.name || "Wolfie";
    const chloeName = characters.find(c => c.name.toLowerCase() === "chloe")?.name || "Chloe";

    const char1 = hasKilo ? kiloName : (characters[0]?.name || "Tom");
    const char2 = hasBruno ? brunoName : (characters[1]?.name || "Elena");
    const char3 = hasWolfie ? wolfieName : "Wolfie";
    const char4 = hasChloe ? chloeName : "Chloe";

    const loc1 = locations[0]?.name || "Rừng sương mù";

    const emotions = customEmotions.length > 0 ? customEmotions : (hasKilo 
      ? [
          "Căng thẳng, đấu trí kịch liệt",
          `U sầu hoang mang vì ${char1} mất tích`,
          `Quyết liệt hành động giải cứu của ${char2}`,
          "Vui nhộn, hóm hỉnh trẻ thơ",
          `Huyền bí kỳ lạ tại phòng thí nghiệm`
        ]
      : [
          "Căng thẳng, hồi hộp",
          "U sầu, cô độc",
          "Quyết liệt, hào hùng",
          "Kinh hoàng, ghê rợn",
          "Huyền bí, tò mò"
        ]);

    const twists = customTwists.length > 0 ? customTwists : (hasKilo 
      ? [
          `${char3} quấy phá bằng robot phát minh`,
          `${char2} và bé ${char4} tìm thấy bằng chứng phạm tội`,
          `${char1} đột ngột mất tích bí ẩn tại ${loc1}`,
          `Phát hiện dấu chân sói khổng lồ ở ${loc1}`,
          `${char2} giải mã câu đố mật bằng sức mạnh cơ bắp`
        ]
      : [
          `${char2} xuất hiện bất ngờ`,
          `${char1} phát hiện la bàn cổ`,
          `Sạt lở đất đá dữ dội tại ${loc1}`,
          `Quái thú đột biến phục kích ${char1}`,
          `Phát hiện dấu chân lạ ở ${loc1}`
        ]);

    const visuals = customVisuals.length > 0 ? customVisuals : (hasKilo
      ? [
          `Phòng thí nghiệm ngập tràn laser của ${char3}`,
          `Văn phòng thám tử ${char1} ngổn ngang manh mối`,
          `Hiện trường vụ mất tích bí ẩn tại ${loc1}`,
          `Khu phế tích cổ kính cạnh ${loc1}`,
          `Cảnh cuối ấm áp: hai thám tử trò chuyện cùng khán giả`
        ]
      : [
          `${loc1} sương mù bao phủ`,
          `Hang động thạch nhũ cổ gần ${loc1}`,
          `Trạm thí nghiệm đổ nát tại ${loc1}`,
          `Thung lũng ngập tràn sương ở ${loc1}`,
          `Khu phế tích cổ kính cạnh ${loc1}`
        ]);

    const retentions = customRetentions.length > 0 ? customRetentions : (hasKilo
      ? [
          `Robot của ${char3} bắn tia năng lượng sượt qua camera`,
          `Cận cảnh gương mặt mưu mô xảo quyệt của ${char3}`,
          `Tiếng gầm rú báo động vang dội từ phát minh`,
          `${char2} chỉ tay phán xét: 'Hung thủ chính là ngươi!'`,
          `Bé ${char4} ôm gấu bông khóc thút thít giữ chân khán giả`
        ]
      : [
          `Quái thú đột biến gầm rú săn đuổi ${char1}`,
          `Cận cảnh mắt ${char1} giãn nở hoảng loạn`,
          `Vật phẩm cổ của ${char2} rực sáng`,
          `Âm thanh bước chân dồn dập đuổi theo ${char1}`,
          `${char2} nạp đạn súng laser`
        ]);

    return { emotions, twists, visuals, retentions };
  };

  const handleEditChip = (category: "emotions" | "twists" | "visuals" | "retentions", oldVal: string) => {
    const newVal = window.prompt("Sếp ơi, nhập nội dung mới cho lựa chọn này:", oldVal);
    if (newVal === null) return;
    const trimmed = newVal.trim();
    if (!trimmed) return;
    
    if (category === "emotions") {
      const currentList = customEmotions.length > 0 ? [...customEmotions] : [...getDynamicOptions().emotions];
      const idx = currentList.indexOf(oldVal);
      if (idx !== -1) currentList[idx] = trimmed;
      else currentList.push(trimmed);
      setCustomEmotions(currentList);
      if (selectedEmotion === oldVal) setSelectedEmotion(trimmed);
    } else if (category === "twists") {
      const currentList = customTwists.length > 0 ? [...customTwists] : [...getDynamicOptions().twists];
      const idx = currentList.indexOf(oldVal);
      if (idx !== -1) currentList[idx] = trimmed;
      else currentList.push(trimmed);
      setCustomTwists(currentList);
      if (selectedTwist === oldVal) setSelectedTwist(trimmed);
    } else if (category === "visuals") {
      const currentList = customVisuals.length > 0 ? [...customVisuals] : [...getDynamicOptions().visuals];
      const idx = currentList.indexOf(oldVal);
      if (idx !== -1) currentList[idx] = trimmed;
      else currentList.push(trimmed);
      setCustomVisuals(currentList);
      if (selectedVisual === oldVal) setSelectedVisual(trimmed);
    } else if (category === "retentions") {
      const currentList = customRetentions.length > 0 ? [...customRetentions] : [...getDynamicOptions().retentions];
      const idx = currentList.indexOf(oldVal);
      if (idx !== -1) currentList[idx] = trimmed;
      else currentList.push(trimmed);
      setCustomRetentions(currentList);
      if (selectedRetention === oldVal) setSelectedRetention(trimmed);
    }
  };

  // Calibration Methods
  const handleCalibrateScene = async (scene: any) => {
    setCalibratingSceneId(scene.id);
    setCalibrationStep(1);
    setCalibratingStatus("Extracting Narrative Skeleton (Stage 1)...");
    
    await new Promise(resolve => setTimeout(resolve, 600));
    setCalibrationStep(2);
    setCalibratingStatus("Analyzing Emotional & Audio Beats (Stage 2)...");
    
    await new Promise(resolve => setTimeout(resolve, 600));
    setCalibrationStep(3);
    setCalibratingStatus("Rigging Virtual Cameras & Lighting Setup (Stage 3)...");
    
    await new Promise(resolve => setTimeout(resolve, 600));
    setCalibrationStep(4);
    setCalibratingStatus("Synthesizing Grounded Asset DNA Prompt (Stage 4)...");
    
    await new Promise(resolve => setTimeout(resolve, 600));
    setCalibrationStep(5);
    setCalibratingStatus("Injecting Motion Dynamics & Tail Interpolation (Stage 5)...");
    
    await new Promise(resolve => setTimeout(resolve, 500));
    
    const initialCalib = generateAutoCalibration(scene);
    const compiledPrompt = callCompileGroundedPrompt(scene, initialCalib);
    initialCalib.stage4.groundedPrompt = compiledPrompt;

    setCalibrations(prev => ({
      ...prev,
      [scene.id]: initialCalib
    }));
    setCalibratingSceneId(null);
  };

  const handleExportNewAsset = async (name: string, type: "character" | "location" | "prop") => {
    try {
      const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, "-");
      await createCharacter({
        name,
        slug,
        projectId: selectedProjectId || undefined,
        description: `Tạo từ Drama Studio AI Scenario Co-Pilot. Kiểu thực thể: ${type}.`,
        entityType: type
      });
      alert(`🎉 Đã xuất thành công thực thể [${name}] (${type}) lên cơ sở dữ liệu Workspace!`);
      if (selectedProjectId) {
        const assets = await fetchCharacters(selectedProjectId);
        setProjectAssets(assets);
      }
    } catch (e: any) {
      alert(`Lỗi khi xuất Asset: ${e.message}`);
    }
  };

  const handleUpdateCalibrationField = (sceneId: string, stage: string, field: string, value: any) => {
    setCalibrations(prev => {
      const current = prev[sceneId];
      if (!current) return prev;
      
      const updated = {
        ...current,
        [stage]: {
          ...current[stage],
          [field]: value
        }
      };
      
      const targetScene = parsedData?.scenes?.find((s: any) => s.id === sceneId);
      if (targetScene) {
        const recompiled = callCompileGroundedPrompt(targetScene, updated);
        updated.stage4.groundedPrompt = recompiled;
      }
      
      return {
        ...prev,
        [sceneId]: updated
      };
    });
  };

  const calculateTransitionRisk = (prevScene: any, currScene: any, prevCalib: any, currCalib: any) => {
    if (!prevScene || !currScene || !prevCalib || !currCalib) {
      return { risk: 0.1, reason: "Phân cảnh đầu tiên hoặc chưa hiệu chuẩn.", warnings: [] };
    }

    const prevPacing = prevCalib.virtualCameraRig?.pacingModifier || "Standard 1.0x";
    const currPacing = currCalib.virtualCameraRig?.pacingModifier || "Standard 1.0x";
    const prevLUT = prevCalib.virtualCameraRig?.visualToneLUT || "Neutral Standard";
    const currLUT = currCalib.virtualCameraRig?.visualToneLUT || "Neutral Standard";
    
    let risk = 0.1;
    let reason = "An toàn. Chuyển tiếp đồng điệu về nhịp độ và thị giác.";

    const isPacingJump = 
      (prevPacing.includes("0.7x") && currPacing.includes("2.0x")) ||
      (prevPacing.includes("2.0x") && currPacing.includes("0.7x"));

    const isToneJump = 
      (prevLUT.includes("Warm") && currLUT.includes("Cool")) ||
      (prevLUT.includes("Cool") && currLUT.includes("Warm"));

    if (isPacingJump && isToneJump) {
      risk = 0.7;
      reason = "CẢNH BÁO: Gãy nhịp độ (Pacing) và Tông màu (LUT) quá đột ngột. Cần bổ sung cảnh đệm (Establishing) hoặc dùng Smash Cut có chủ đích.";
    } else if (isPacingJump) {
      risk = 0.4;
      reason = "Lưu ý: Nhịp độ phim thay đổi gắt (vd: Đang rất chậm nhảy sang giật gân). Khán giả có thể bị sốc nhịp.";
    } else if (isToneJump) {
      risk = 0.3;
      reason = "Lưu ý: Tông màu thay đổi mạnh. Phù hợp nếu đổi bối cảnh, nhưng sẽ gãy continuity nếu cùng chung một bối cảnh.";
    }

    return {
      risk: Math.min(risk, 1.0),
      reason,
      warnings: []
    };
  };

  const checkCinematographyViolations = (prevCalib: any, currCalib: any, hasSharedChars: boolean) => {
    const warnings: string[] = [];
    if (!prevCalib || !currCalib || !hasSharedChars) return warnings;

    const prevBearing = prevCalib.stage1?.cameraBearing || "0° (Direct Front)";
    const currBearing = currCalib.stage1?.cameraBearing || "0° (Direct Front)";
    const prevAxis = prevCalib.stage1?.cameraAxisLine || "Line A";
    const currAxis = currCalib.stage1?.cameraAxisLine || "Line A";

    const prevAngleVal = parseInt(prevBearing) || 0;
    const currAngleVal = parseInt(currBearing) || 0;
    const angleDiff = Math.abs(prevAngleVal - currAngleVal);

    if (angleDiff < 30) {
      warnings.push(`⚠️ Vi phạm Luật 30°: Góc xoay camera đổi quá ít (${angleDiff}°). Hãy chỉnh Bearing lệch ít nhất 30° để tránh jump-cut.`);
    }

    if (prevAxis !== currAxis) {
      warnings.push(`⚠️ Vi phạm Luật 180°: Trục máy quay bị đảo từ ${prevAxis} sang ${currAxis}! Người xem sẽ bị mất định hướng trục phim.`);
    }

    return warnings;
  };

  const handleInsertGlueShot = (prevSceneId: string) => {
    if (!parsedData) return;
    const targetIndex = parsedData.scenes.findIndex((s: any) => s.id === prevSceneId);
    if (targetIndex === -1) return;

    const prevScene = parsedData.scenes[targetIndex];
    const glueId = `glue-${Date.now()}`;
    const glueScene = {
      id: glueId,
      sceneNumber: prevScene.sceneNumber + 1,
      title: "🎬 Glue Shot (Environment Cutaway)",
      description: "Cận cảnh chi tiết bối cảnh xung quanh thiết lập (không chứa nhân vật) nhằm ngắt mạch trôi mặt nhân vật AI, tạo độ chuyển tiếp tự nhiên cho mắt người xem.",
      prompt: "Cinematic ultra close-up of environment details, focusing on atmospheric textures and dust particles in volumetric warm light, photorealistic, extremely detailed, 8k.",
      tags: ["Glue-Shot", "Cutaway", "Continuity-Reset"]
    };

    const updatedScenes = [...parsedData.scenes];
    updatedScenes.splice(targetIndex + 1, 0, glueScene);

    const reindexedScenes = updatedScenes.map((s, idx) => ({
      ...s,
      sceneNumber: idx + 1
    }));

    setParsedData((prev: any) => prev ? { ...prev, scenes: reindexedScenes } : null);

    const initialCalib = generateAutoCalibration(glueScene);
    initialCalib.stage1.shotSize = "ECU - Extreme Close Up";
    initialCalib.stage1.cameraAngle = "Low Angle (Heroic/Tense)";
    initialCalib.stage1.cameraMovement = "Slow Pan (Revealing)";
    initialCalib.stage1.cameraBearing = "45° (Three-Quarter)";
    initialCalib.stage1.cameraAxisLine = "Line A";
    initialCalib.stage2.emotion = "Atmospheric";
    initialCalib.stage3.lightingStyle = "Golden Hour Warmth";
    initialCalib.stage3.focalLength = "85mm Portrait Lens";
    initialCalib.stage3.focusTransition = "Shallow Depth of Field";
    initialCalib.stage4.groundedPrompt = callCompileGroundedPrompt(glueScene, initialCalib);
    initialCalib.causalFlow = {
      cause: `Transition risk between Phân cảnh ${prevScene.sceneNumber} và cảnh tiếp theo quá cao`,
      effect: "Resets the AI face generation model consistency",
      dependency: "Glue Shot",
      transitionType: "Match Cut (Đồng điệu thị giác)",
      transitionJustification: "Chèn cảnh phụ bối cảnh để tạo khoảng nghỉ thị giác, tránh lỗi biến dạng mặt."
    };

    setCalibrations(prev => ({
      ...prev,
      [glueId]: initialCalib
    }));
  };

  const handleUpdateCausalFlowField = (sceneId: string, field: string, value: string) => {
    setCalibrations(prev => {
      const current = prev[sceneId];
      if (!current) return prev;
      return {
        ...prev,
        [sceneId]: {
          ...current,
          causalFlow: {
            ...(current.causalFlow || {
              cause: "Inciting Incident",
              effect: "Triggers next scene setup",
              dependency: "None",
              transitionType: "Standard Cut",
              transitionJustification: "Duy trì tính liền mạch."
            }),
            [field]: value
          }
        }
      };
    });
  };

  const handleSaveCalibratedScene = async (sceneId: string) => {
    const calib = calibrations[sceneId];
    if (!calib) return;
    setSavingSceneId(sceneId);
    try {
      const promptToSave = calib.stage4.groundedPrompt;
      
      const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(sceneId);
      if (!isUuid) {
        setParsedData((prev: any) => {
          if (!prev) return prev;
          return {
            ...prev,
            scenes: prev.scenes.map((s: any) => s.id === sceneId ? { ...s, prompt: promptToSave, meta: { calibration: calib } } : s)
          };
        });
        alert("Đã lưu Phân cảnh Điện ảnh và DNA Grounded Prompt thành công (Chế độ Demo)!");
        return;
      }

      await updateScene({
        id: sceneId,
        prompt: promptToSave,
        meta: { calibration: calib }
      });
      
      setParsedData((prev: any) => {
        if (!prev) return prev;
        return {
          ...prev,
          scenes: prev.scenes.map((s: any) => s.id === sceneId ? { ...s, prompt: promptToSave, meta: { calibration: calib } } : s)
        };
      });
      
      alert("Đã lưu Phân cảnh Điện ảnh và DNA Grounded Prompt lên cơ sở dữ liệu thành công!");
    } catch (e: any) {
      alert(`Lỗi khi lưu hiệu chuẩn: ${e.message}`);
    } finally {
      setSavingSceneId(null);
    }
  };

  const handleAISuggestStyle = async () => {
    const textToAnalyze = scriptText.trim() || rawPremise.trim();
    if (!textToAnalyze) return;
    setIsSuggestingStyle(true);
    try {
      const prompt = `Analyze this screenplay/script/premise and suggest the best matching style options from the list below.
Content: "${textToAnalyze.substring(0, 2500)}"
Output ONLY JSON: {"region": "...", "medium": "...", "mood": "...", "period": "...", "custom": "..."}`;

      const accessToken = await getGFlowToken().catch(() => null);
      const res = await generateText(prompt);
      if (res && res.data && res.data.text) {
        const parsed = safeParseJson(res.data.text);
        if (parsed.region) setStyleRegion(parsed.region);
        if (parsed.medium) setStyleMedium(parsed.medium);
        if (parsed.mood) setStyleMood(parsed.mood);
        if (parsed.period) setStylePeriod(parsed.period);
        if (parsed.custom) setCustomStyleInstructions(parsed.custom);
      }
    } catch (e) {
      console.error("Style suggest failed:", e);
    } finally {
      setIsSuggestingStyle(false);
    }
  };

  const handleSaveStyleConfig = async () => {
    if (!selectedProjectId) return;
    setIsConsolidatingStyle(true);
    try {
      const project = projectsList.find((p: any) => p.id === selectedProjectId);
      let currentMeta: any = {};
      if (project?.description && project.description.trim().startsWith("{")) {
        currentMeta = JSON.parse(project.description);
      }
      const updatedMeta = {
        ...currentMeta,
        styleAnswers: {
          region: styleRegion,
          medium: styleMedium,
          mood: styleMood,
          period: stylePeriod,
          custom: customStyleInstructions
        }
      };
      const updatedDesc = JSON.stringify(updatedMeta);
      await updateProject(selectedProjectId, { description: updatedDesc });
      setProjectsList((prev: any[]) => prev.map(p => p.id === selectedProjectId ? { ...p, description: updatedDesc } : p));
      
      const res = await consolidateProjectStyle(selectedProjectId);
      if (res && res.stylePrompt) {
        setProjectsList((prev: any[]) => prev.map(p => p.id === selectedProjectId ? { ...p, stylePrompt: res.stylePrompt } : p));
        alert("✅ [Master Style DNA] Đồng bộ phong cách thành công!");
      }
    } catch (err: any) {
      console.error(err);
      alert("⚠️ Lỗi khi lưu phong cách: " + err.message);
    } finally {
      setIsConsolidatingStyle(false);
    }
  };

  return {
    apiEndpoint,
    setApiEndpoint,
    aiProvider,
    setAiProvider,
    editorMode,
    setEditorMode,
    rawPremise,
    setRawPremise,
    selectedEmotion,
    setSelectedEmotion,
    selectedTwist,
    setSelectedTwist,
    selectedVisual,
    setSelectedVisual,
    selectedRetention,
    setSelectedRetention,
    isCompilingCopilot,
    setIsCompilingCopilot,
    scenarioCharacters,
    setScenarioCharacters,
    isExtractingCharacters,
    setIsExtractingCharacters,
    newScenarioCharInput,
    setNewScenarioCharInput,
    hasGeneratedOptions,
    setHasGeneratedOptions,
    universeVisualPreset,
    setUniverseVisualPreset,
    colorGrade,
    setColorGrade,
    musicTheme,
    setMusicTheme,
    cinematicGrain,
    setCinematicGrain,
    depthOfField,
    setDepthOfField,
    dialogueSpeed,
    setDialogueSpeed,
    styleConsistencyScore,
    setStyleConsistencyScore,
    isStandardizingStyle,
    setIsStandardizingStyle,
    environmentStyle,
    setEnvironmentStyle,
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
    isConsolidatingStyle,
    setIsConsolidatingStyle,
    isSuggestingStyle,
    setIsSuggestingStyle,
    calibrations,
    setCalibrations,
    calibratingSceneId,
    setCalibratingSceneId,
    calibrationStep,
    setCalibrationStep,
    calibratingStatus,
    setCalibratingStatus,
    savingSceneId,
    setSavingSceneId,
    customEmotions,
    setCustomEmotions,
    customTwists,
    setCustomTwists,
    customVisuals,
    setCustomVisuals,
    customRetentions,
    setCustomRetentions,
    newEmotionInput,
    setNewEmotionInput,
    newTwistInput,
    setNewTwistInput,
    newVisualInput,
    setNewVisualInput,
    newRetentionInput,
    setNewRetentionInput,
    assetAllocations,
    setAssetAllocations,
    premiseLoophole,
    handleUpdateApiEndpoint,
    handleUpdateAiProvider,
    handleRemoveScenarioCharacter,
    handleAddScenarioCharacter,
    getDynamicOptions,
    handleEditChip,
    handleCalibrateScene,
    handleExportNewAsset,
    handleUpdateCalibrationField,
    calculateTransitionRisk,
    checkCinematographyViolations,
    handleInsertGlueShot,
    handleUpdateCausalFlowField,
    handleSaveCalibratedScene,
    handleAISuggestStyle,
    handleSaveStyleConfig
  };
}
