"use client";

import { useState, useEffect, useRef } from "react";
import { useGFlowExtension } from "@/hooks/useGFlowExtension";
import { 
  createCharacter, 
  updateCharacter, 
  generateAssetJob, 
  fetchCharacters, 
  extractCharactersWithAI,
  fetchCharacterVariants,
  generateCharacterVariant,
  generateText,
  resolvePrompt,
  checkConsistency,
  getApiBaseUrl,
  getHubApiKey
} from "@/lib/api";
import { monitorJob } from "../utils/monitorJob";
import { 
  getCleanDnaPrompt, 
  removeDuplicateStylePrompt,
  getAssetStyleGuide
} from "../utils/helpers";
import { useShotStore } from "../store/shotStore";
import { runCinematicPipeline } from "@/lib/cinematic-engine";
import { generateExpandedShots } from "../utils/generateExpandedShots";

// Local Toast Fallback
const toast = {
  success: (msg: string) => console.log(`[Success] ${msg}`),
  error: (msg: string) => alert(`[Error] ${msg}`),
  info: (msg: string) => console.log(`[Info] ${msg}`),
};

interface AssetOperationsProps {
  selectedProjectId: string;
  selectedEpisodeId: string;
  scriptText: string;
  projectsList: any[];
  getCombinedNegativePrompt: () => string;
  environmentStyle: string;
  parsedData: any | null;
  setParsedData: React.Dispatch<React.SetStateAction<any>>;
  projectAssets: any[];
  setProjectAssets: React.Dispatch<React.SetStateAction<any[]>>;
  aiProvider: string;
  universeVisualPreset: string;
  ensureGFlowProjectForEpisode: (episodeId: string) => Promise<string | null>;
}

export function useAssetOperations({
  selectedProjectId,
  selectedEpisodeId,
  scriptText,
  projectsList,
  getCombinedNegativePrompt,
  environmentStyle,
  parsedData,
  setParsedData,
  projectAssets,
  setProjectAssets,
  aiProvider,
  universeVisualPreset,
  ensureGFlowProjectForEpisode
}: AssetOperationsProps) {
  const { getGFlowToken } = useGFlowExtension();
  const jobAbortControllers = useRef<Record<string, AbortController>>({});

  const [isLoadingAssets, setIsLoadingAssets] = useState(false);
  const [characterMappings, setCharacterMappings] = useState<Record<string, string>>({}); 
  const [locationMappings, setLocationMappings] = useState<Record<string, string>>({}); 
  const [propMappings, setPropMappings] = useState<Record<string, string>>({}); 
  const [generatingAssets, setGeneratingAssets] = useState<Record<string, boolean>>({});
  const [failedAutoGenerations, setFailedAutoGenerations] = useState<Record<string, boolean>>({});
  const [draftAssets, setDraftAssets] = useState<Record<string, any>>({});
  
  // DNA Variants states
  const [loadingVariants, setLoadingVariants] = useState<Record<string, boolean>>({});
  const [assetVariants, setAssetVariants] = useState<Record<string, any[]>>({});
  const [variantModifiers, setVariantModifiers] = useState<Record<string, string>>({});
  const [generatingVariantAssetId, setGeneratingVariantAssetId] = useState<string | null>(null);
  const [variantErrors, setVariantErrors] = useState<Record<string, string>>({});

  // Shot-level Storyboard generation states
  const [generatingShots, setGeneratingShots] = useState<Record<string, boolean>>({});
  const [batchGeneratingShots, setBatchGeneratingShots] = useState(false);
  const [batchShotsProgress, setBatchShotsProgress] = useState({ current: 0, total: 0, text: "" });

  // Local states for editing character prompts inline:
  const [editingCharId, setEditingCharId] = useState<string | null>(null);
  const [editingCharText, setEditingCharText] = useState<string>("");
  const [editingCharStyleText, setEditingCharStyleText] = useState<string>("");
  const [expandedCharIds, setExpandedCharIds] = useState<Record<string, boolean>>({});
  const [savingCharId, setSavingCharId] = useState<string | null>(null);

  // Load draft assets from localStorage when episode changes
  useEffect(() => {
    if (selectedEpisodeId) {
      const saved = localStorage.getItem(`drama_studio_draftAssets_${selectedEpisodeId}`);
      if (saved) {
        try {
          setDraftAssets(JSON.parse(saved));
        } catch (e) {
          console.error("Failed to parse draft assets from localStorage:", e);
        }
      } else {
        setDraftAssets({});
      }
    } else {
      setDraftAssets({});
    }
  }, [selectedEpisodeId]);

  const loadDbAssets = async (projectId?: string) => {
    setIsLoadingAssets(true);
    try {
      const data = await fetchCharacters(projectId || undefined);
      setProjectAssets(data || []);
    } catch (e) {
      console.error("Error loading project assets:", e);
    } finally {
      setIsLoadingAssets(false);
    }
  };

  const cleanLocationDescriptionForPrompt = (desc: string) => {
    if (!desc) return "";
    let cleaned = getCleanDnaPrompt(desc);
    cleaned = cleaned.replace(/nhân vật|con người|characters|people|humans|worship|altar|bàn thờ|tổ tiên/gi, "");
    cleaned = cleaned.replace(/kilo|bruno|wolfie|chloe|mica|paco/gi, "");
    return cleaned.trim();
  };

  const generateImageForDraft = async (name: string, type: "character" | "location" | "prop", description: string) => {
    const localAbortCtrl = new AbortController();
    try {
      const activeProject = projectsList.find(p => p.id === selectedProjectId);
      const projectStyle = activeProject?.stylePrompt || "premium 3D family-animation style with soft anime-influenced facial appeal";
      const projectNegativePrompt = getCombinedNegativePrompt();

      const cleanedDesc = type === "location" ? cleanLocationDescriptionForPrompt(description) : description;
      const cleanDescForPrompt = removeDuplicateStylePrompt(cleanedDesc, projectStyle);
      const isNight = /night|tối|đêm|evening/i.test(description);
      const locationPrompt = isNight
        ? `Create a 2x2 storyboard panel image showing 4 different cinematic camera angles of the empty environment concept of ${name}. Layout: ${cleanDescForPrompt} (render ONLY the empty architectural environment setup, REMOVE all humans, characters, and people from this layout). Style: ${projectStyle}, matching environment style: ${environmentStyle}. Show night city view outside. Interior lighting must be bright neutral-white ceiling downlights, 4000K-5000K, crisp clean illumination, lively and luminous, not amber, not dim, not orange, no heavy shadows. 4 separate panels in a 2x2 grid layout. Empty scene. Strictly NO people. Strictly NO characters. Strictly NO altars. Strictly NO worship items/elements. No text.`
        : `Create a 2x2 storyboard panel image showing 4 different cinematic camera angles of the empty environment concept of ${name}. Layout: ${cleanDescForPrompt} (render ONLY the empty architectural environment setup, REMOVE all humans, characters, and people from this layout). Style: ${projectStyle}, matching environment style: ${environmentStyle}. Lighting: bright clean daylight, soft natural light from windows/balcony, balanced white daylight, airy, fresh, not yellow, not orange. 4 separate panels in a 2x2 grid layout. Empty scene. Strictly NO people. Strictly NO characters. Strictly NO altars. Strictly NO worship items/elements. No text.`;

      const genPrompt = type === "character"
        ? `Create a production-ready character sheet for ${name}. Identity: ${cleanDescForPrompt}. Style: ${projectStyle}. Include one large 3/4 hero pose, front/side/back views, 4 expressions. Clean ivory background.`
        : type === "location"
          ? locationPrompt
          : `Cinematic 3D concept art of prop item ${name}, ${cleanDescForPrompt}. Style: ${projectStyle}. Blank neutral background, highly detailed 3D asset render.`;

      console.log(`[generateImageForDraft] Enqueuing job for ${name} with prompt:`, genPrompt);

      if (jobAbortControllers.current[name]) {
        jobAbortControllers.current[name].abort();
      }
      jobAbortControllers.current[name] = localAbortCtrl;

      const jobRes = await generateAssetJob("00000000-0000-0000-0000-000000000000", genPrompt, {
        project_name: selectedProjectId || "default",
        provider: "auto",
        entityType: type,
        grid: "2x2",
        negative_prompt: projectNegativePrompt
      }, localAbortCtrl.signal);

      const jobId = jobRes.data?.job_id;
      if (!jobId) {
        throw new Error("Không thể khởi tạo Job ID tạo ảnh trên server.");
      }

      const finishedJob = await monitorJob(jobId, { signal: localAbortCtrl.signal });
      const generatedUrl = (finishedJob.outputUrls && finishedJob.outputUrls[0]) || finishedJob.output_url;

      if (!generatedUrl) {
        throw new Error("Không lấy được URL ảnh đã tạo.");
      }

      setDraftAssets(prev => {
        const existingDraft = prev[name] || { name, type, description, rootImageUrl: "", styleGuide: {} };
        const updated = {
          ...existingDraft,
          rootImageUrl: generatedUrl,
          isGeneratingImage: false,
          styleGuide: {
            ...existingDraft.styleGuide,
            angles: [
              { title: "Establishing View", prompt: genPrompt, url: generatedUrl }
            ]
          }
        };
        if (selectedEpisodeId) {
          const newDrafts = { ...prev, [name]: updated };
          localStorage.setItem(`drama_studio_draftAssets_${selectedEpisodeId}`, JSON.stringify(newDrafts));
        }
        return { ...prev, [name]: updated };
      });
    } catch (e: any) {
      if (e.name === 'AbortError' || e.message?.includes('aborted')) {
        console.log(`[generateImageForDraft] Job ${name} was aborted by user.`);
      } else {
        console.error(`Failed to generate image for draft ${name}:`, e);
      }
      setDraftAssets(prev => {
        const existingDraft = prev[name];
        if (!existingDraft) return prev;
        const updated = { ...existingDraft, isGeneratingImage: false };
        if (selectedEpisodeId) {
          const newDrafts = { ...prev, [name]: updated };
          localStorage.setItem(`drama_studio_draftAssets_${selectedEpisodeId}`, JSON.stringify(newDrafts));
        }
        return { ...prev, [name]: updated };
      });
    } finally {
      if (jobAbortControllers.current[name] === localAbortCtrl) {
        delete jobAbortControllers.current[name];
      }
    }
  };

  const handleCancelDraftAsset = (name: string) => {
    if (jobAbortControllers.current[name]) {
      jobAbortControllers.current[name].abort();
      delete jobAbortControllers.current[name];
    }
    
    setDraftAssets(prev => {
      const next = { ...prev };
      delete next[name];
      if (selectedEpisodeId) {
        localStorage.setItem(`drama_studio_draftAssets_${selectedEpisodeId}`, JSON.stringify(next));
      }
      return next;
    });
  };

  const handleUpdateDraftDescription = (name: string, newDesc: string) => {
    setDraftAssets(prev => {
      if (!prev[name]) return prev;
      const next = {
        ...prev,
        [name]: { ...prev[name], description: newDesc }
      };
      if (selectedEpisodeId) {
        localStorage.setItem(`drama_studio_draftAssets_${selectedEpisodeId}`, JSON.stringify(next));
      }
      return next;
    });
  };

  const handleRegenerateDraftAsset = async (name: string, type: "character" | "location" | "prop") => {
    const draft = draftAssets[name];
    if (!draft) return;

    setDraftAssets(prev => {
      if (!prev[name]) return prev;
      return {
        ...prev,
        [name]: { ...prev[name], isGeneratingImage: true }
      };
    });

    await generateImageForDraft(name, type, draft.description);
  };

  const handleAutoGenerateAsset = async (name: string, type: "character" | "location" | "prop") => {
    setGeneratingAssets(prev => ({ ...prev, [name]: true }));
    try {
      const lowerName = name.toLowerCase();
      const activeProject = projectsList.find(p => p.id === selectedProjectId);
      const projectStyle = activeProject?.stylePrompt || "premium 3D family-animation style with soft anime-influenced facial appeal";

      let description = "";
      let rootImageUrl = "";
      let styleGuide: any = {};
      let contextSentence = "";

      if (scriptText) {
        const sentences = scriptText.split(/[.\n]/);
        const matched = sentences.filter(s => s.toLowerCase().includes(lowerName)).map(s => s.trim()).filter(Boolean);
        if (matched.length > 0) {
          contextSentence = matched.slice(0, 3).join(". ") + ".";
        }
      }

      if (type === "character") {
        try {
          const prompt = `The target project visual style/aesthetic is: '${projectStyle}'. 
Analyze the character name '${name}' and the script context: '${contextSentence}'. 
Provide a concise, extremely detailed physical appearance description (features, clothes, vibe). ONLY English text, no markdown. Limit 40 words.`;
          const textRes = await generateText(prompt, "gemini-2.5-flash");
          if (textRes.data?.text) {
            description = textRes.data.text;
          }
        } catch (err) {
          console.warn("Failed to auto-generate draft character DNA, falling back to local template", err);
        }

        if (!description) {
          description = `${name}, portrait, detailed appearance from script context: "${contextSentence || "cinematic appearance"}". Style: ${projectStyle}`;
        }
        
        styleGuide = {
          stylePrompt: description,
          visualStyle: `Character ${name}`,
          composition: "Portrait",
          colors: "Natural",
          lighting: "Soft lighting",
          camera: "Close-up",
          attitude: "Neutral"
        };

        rootImageUrl = "https://images.unsplash.com/photo-1535268647977-a403b69fc756?w=400&auto=format&fit=crop&q=80";
        styleGuide.angles = [
          { title: "Front view portrait", url: rootImageUrl },
          { title: "Side view profile", url: rootImageUrl }
        ];
      } else if (type === "location") {
        try {
          const prompt = `The target project visual style/aesthetic is: '${projectStyle}'. 
The chosen background environment style is: '${environmentStyle}'.
Analyze the location name '${name}' and the script context: '${contextSentence}'. 
Provide a concise architectural/environmental description (lighting, mood, objects, colors). ONLY English text, no markdown. Limit 40 words.`;
          const textRes = await generateText(prompt, "gemini-2.5-flash");
          if (textRes.data?.text) {
            description = textRes.data.text;
          }
        } catch (err) {
          console.warn("Failed to auto-generate draft location DNA, falling back to local template", err);
        }

        if (!description) {
          description = `Wide view establishing shot of ${name}, environment details from script context: "${contextSentence || "establishing shot"}". Style: ${projectStyle}. Background environment style: ${environmentStyle}`;
        }
        
        styleGuide = {
          stylePrompt: description,
          visualStyle: `Location ${name} matching ${environmentStyle}`,
          composition: "Wide establishing shot",
          colors: "Natural",
          lighting: "Daylight",
          camera: "Wide angle lens",
          attitude: "Serene"
        };

        rootImageUrl = "https://images.unsplash.com/photo-1506744038136-46273834b3fb?w=400&auto=format&fit=crop&q=80";
        styleGuide.angles = [
          { title: "Wide view establishing shot", url: rootImageUrl }
        ];
      } else {
        try {
          const prompt = `The target project visual style/aesthetic is: '${projectStyle}'. 
Analyze the prop name '${name}' and the script context: '${contextSentence}'. 
Provide a concise physical prop description (material, shape, color, condition). ONLY English text, no markdown. Limit 40 words.`;
          const textRes = await generateText(prompt, "gemini-2.5-flash");
          if (textRes.data?.text) {
            description = textRes.data.text;
          }
        } catch (err) {
          console.warn("Failed to auto-generate draft prop DNA, falling back to local template", err);
        }

        if (!description) {
          description = `Close-up shot of prop item ${name}, detailed design from script context: "${contextSentence || "prop detail"}". Style: ${projectStyle}`;
        }
        
        styleGuide = {
          stylePrompt: description,
          visualStyle: `Prop ${name}`,
          composition: "Close-up",
          colors: "Natural",
          lighting: "Studio lighting",
          camera: "Macro lens",
          attitude: "Neutral"
        };

        rootImageUrl = "https://images.unsplash.com/photo-1578632767115-351597cf2477?w=400&auto=format&fit=crop&q=80";
        styleGuide.angles = [
          { title: "Flat illustration view", url: rootImageUrl }
        ];
      }

      const initialDraft = {
        name,
        type,
        description,
        rootImageUrl,
        styleGuide,
        isGeneratingImage: true
      };

      setDraftAssets(prev => {
        const next = { ...prev, [name]: initialDraft };
        if (selectedEpisodeId) {
          localStorage.setItem(`drama_studio_draftAssets_${selectedEpisodeId}`, JSON.stringify(next));
        }
        return next;
      });

      await generateImageForDraft(name, type, description);
    } catch (e: any) {
      console.error(`Error auto-generating asset ${name}:`, e);
      throw e;
    } finally {
      setGeneratingAssets(prev => ({ ...prev, [name]: false }));
    }
  };

  const confirmDraftAssetDirect = async (name: string, draft: any) => {
    if (!draft) return null;
    const lowerName = name.toLowerCase();
    const slug = lowerName.replace(/[^a-z0-9]+/g, "-");
    
    const newAsset = await createCharacter({
      name: draft.name,
      slug,
      projectId: selectedProjectId || undefined,
      description: draft.description,
      rootImageUrl: draft.rootImageUrl,
      styleGuide: draft.styleGuide,
      entityType: draft.type
    });

    if (newAsset && newAsset.rootImageUrl) {
      const assetType = draft.type;
      const brief = getCleanDnaPrompt(newAsset.description);
      
      getGFlowToken().catch(() => null).then(async (token) => {
        try {
          console.log(`[X-Ray Calibration] Running background DNA analysis for ${newAsset.name}...`);
          const xrayRes = await fetch("/api/xray/har-analyze", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              imageUrl: newAsset.rootImageUrl,
              brief: brief,
              assetType: assetType === "location" ? "location" : assetType === "character" ? "character" : "prop",
              accessToken: token || undefined
            })
          });

          if (xrayRes.ok) {
            const xrayData = await xrayRes.json();
            if (xrayData.success && xrayData.stylePrompt) {
              console.log(`[X-Ray Calibration] Calibrated DNA for ${newAsset.name}. Saving to DB...`);
              await updateCharacter(newAsset.id, { description: xrayData.stylePrompt });
              if (selectedProjectId) {
                const updatedAssets = await fetchCharacters(selectedProjectId);
                setProjectAssets(updatedAssets);
              }
            }
          }
        } catch (xrayErr) {
          console.error("[X-Ray Calibration] Background calibration failed:", xrayErr);
        }
      });
    }

    setDraftAssets(prev => {
      const next = { ...prev };
      delete next[name];
      if (selectedEpisodeId) {
        localStorage.setItem(`drama_studio_draftAssets_${selectedEpisodeId}`, JSON.stringify(next));
      }
      return next;
    });

    return { newAsset, type: draft.type };
  };

  const handleConfirmDraftAsset = async (name: string) => {
    const draft = draftAssets[name];
    if (!draft) return;
    try {
      setGeneratingAssets(prev => ({ ...prev, [name]: true }));
      const result = await confirmDraftAssetDirect(name, draft);
      if (result) {
        if (selectedProjectId) {
          const assets = await fetchCharacters(selectedProjectId);
          setProjectAssets(assets);
          
          if (result.type === "location") {
            setLocationMappings(prev => ({ ...prev, [name]: result.newAsset.id }));
          } else if (result.type === "character") {
            setCharacterMappings(prev => ({ ...prev, [name]: result.newAsset.id }));
          } else if (result.type === "prop") {
            setPropMappings(prev => ({ ...prev, [name]: result.newAsset.id }));
          }
        }
      }
    } catch (e: any) {
      console.error("Error confirming draft asset:", e);
      throw e;
    } finally {
      setGeneratingAssets(prev => ({ ...prev, [name]: false }));
    }
  };

  const handleSaveCharacterPrompt = async (asset: any, updatedPromptText: string) => {
    setSavingCharId(asset.id);
    try {
      let newDescription = updatedPromptText;
      if (asset.description && asset.description.trim().startsWith("{")) {
        try {
          const parsed = JSON.parse(asset.description);
          parsed.masterDesignPrompt = updatedPromptText;
          delete parsed.brief;
          newDescription = JSON.stringify(parsed);
        } catch (e) {}
      }
      
      await updateCharacter(asset.id, { description: newDescription });
      setProjectAssets(prev => prev.map(a => a.id === asset.id ? { ...a, description: newDescription } : a));
      setEditingCharId(null);
    } catch (e: any) {
      console.error("Error saving character prompt:", e);
      throw e;
    } finally {
      setSavingCharId(null);
    }
  };

  const generateImageForExistingAsset = async (assetId: string, name: string, type: "character" | "location" | "prop", description: string) => {
    try {
      const activeProject = projectsList.find(p => p.id === selectedProjectId);
      const projectStyle = activeProject?.stylePrompt || "premium 3D family-animation style with soft anime-influenced facial appeal";
      const projectNegativePrompt = getCombinedNegativePrompt();

      const cleanedDesc = type === "location" ? cleanLocationDescriptionForPrompt(description) : description;
      const cleanDescForPrompt = removeDuplicateStylePrompt(cleanedDesc, projectStyle);
      const isNight = /night|tối|đêm|evening/i.test(description);
      const locationPrompt = isNight
        ? `Create a 2x2 storyboard panel image showing 4 different cinematic camera angles of the empty environment concept of ${name}. Layout: ${cleanDescForPrompt} (render ONLY the empty architectural environment setup, REMOVE all humans, characters, and people from this layout). Style: ${projectStyle}, matching environment style: ${environmentStyle}. Show night city view outside. Interior lighting must be bright neutral-white ceiling downlights, 4000K-5000K, crisp clean illumination, lively and luminous, not amber, not dim, not orange, no heavy shadows. 4 separate panels in a 2x2 grid layout. Empty scene. Strictly NO people. Strictly NO characters. Strictly NO altars. Strictly NO worship items/elements. No text.`
        : `Create a 2x2 storyboard panel image showing 4 different cinematic camera angles of the empty environment concept of ${name}. Layout: ${cleanDescForPrompt} (render ONLY the empty architectural environment setup, REMOVE all humans, characters, and people from this layout). Style: ${projectStyle}, matching environment style: ${environmentStyle}. Lighting: bright clean daylight, soft natural light from windows/balcony, balanced white daylight, airy, fresh, not yellow, not orange. 4 separate panels in a 2x2 grid layout. Empty scene. Strictly NO people. Strictly NO characters. Strictly NO altars. Strictly NO worship items/elements. No text.`;

      const genPrompt = type === "character"
        ? `Create a production-ready character sheet for ${name}. Identity: ${cleanDescForPrompt}. Style: ${projectStyle}. Include one large 3/4 hero pose, front/side/back views, 4 expressions. Clean ivory background.`
        : type === "location"
          ? locationPrompt
          : `Cinematic 3D concept art of prop item ${name}, ${cleanDescForPrompt}. Style: ${projectStyle}. Blank neutral background, highly detailed 3D asset render.`;

      const jobRes = await generateAssetJob("00000000-0000-0000-0000-000000000000", genPrompt, {
        project_name: selectedProjectId || "default",
        provider: "auto",
        entityType: type,
        grid: "2x2",
        negative_prompt: projectNegativePrompt
      });

      const jobId = jobRes.data?.job_id;
      if (!jobId) {
        throw new Error("Không thể khởi tạo Job ID tạo ảnh trên server.");
      }

      const finishedJob = await monitorJob(jobId);
      const generatedUrl = (finishedJob.outputUrls && finishedJob.outputUrls[0]) || finishedJob.output_url;

      if (!generatedUrl) {
        throw new Error("Không lấy được URL ảnh đã tạo.");
      }

      const existingAsset = projectAssets.find(a => a.id === assetId);
      const existingStyleGuide = existingAsset?.styleGuide || {};

      const styleGuide = {
        ...existingStyleGuide,
        stylePrompt: projectStyle,
        angles: [
          { title: type === "location" ? "Wide view establishing shot" : type === "character" ? "Front view portrait" : "Flat illustration view", prompt: genPrompt, url: generatedUrl }
        ]
      };

      await updateCharacter(assetId, { rootImageUrl: generatedUrl, styleGuide });
      setProjectAssets(prev => prev.map(a => a.id === assetId ? { ...a, rootImageUrl: generatedUrl, styleGuide } : a));
    } catch (e: any) {
      console.error(`Failed to generate image for existing asset ${name}:`, e);
      throw e;
    }
  };

  const handleRegenerateExistingAsset = async (assetId: string, name: string, type: "character" | "location" | "prop", currentDescriptionText: string) => {
    setGeneratingAssets(prev => ({ ...prev, [name]: true }));
    try {
      await generateImageForExistingAsset(assetId, name, type, currentDescriptionText);
    } catch (e: any) {
      console.error(e);
      throw e;
    } finally {
      setGeneratingAssets(prev => ({ ...prev, [name]: false }));
    }
  };

  // Helper to run async tasks with concurrency limit
  const pLimit = async <T, U>(
    items: T[], 
    fn: (item: T, idx: number) => Promise<U>, 
    limit: number = 3
  ): Promise<U[]> => {
    const results: U[] = new Array(items.length);
    let index = 0;
    
    async function worker() {
      while (index < items.length) {
        const currentIndex = index++;
        try {
          results[currentIndex] = await fn(items[currentIndex], currentIndex);
        } catch (err) {
          console.error(`[pLimit] Error processing item at index ${currentIndex}:`, err);
        }
      }
    }
    
    const workers = [];
    const workerCount = Math.min(limit, items.length);
    for (let i = 0; i < workerCount; i++) {
      workers.push(worker());
    }
    
    await Promise.all(workers);
    return results;
  };

  const handleCreateVariant = async (characterId: string) => {
    const modifier = variantModifiers[characterId];
    if (!modifier) return;
    
    setGeneratingVariantAssetId(characterId);
    setVariantErrors(prev => ({ ...prev, [characterId]: "" }));
    try {
      const res = await generateCharacterVariant(characterId, modifier);
      const jobId = res.data?.jobId || res.data?.job_id;
      if (!jobId) throw new Error("No Job ID returned from variant generation.");
      
      const finishedJob = await monitorJob(jobId);
      const generatedUrl = (finishedJob.outputUrls && finishedJob.outputUrls[0]) || finishedJob.output_url;

      if (!generatedUrl) throw new Error("Không lấy được URL ảnh biến thể đã tạo.");
      
      let variantsList: any[] = [];
      let found = false;
      const maxRetries = 6;
      for (let attempt = 1; attempt <= maxRetries; attempt++) {
        try {
          const variantsRes = await fetchCharacterVariants(characterId);
          variantsList = Array.isArray(variantsRes) ? variantsRes : (variantsRes?.variants || []);
          if (variantsList.some((v: any) => v.jobId === jobId)) {
            found = true;
            break;
          }
        } catch (fetchErr) {
          console.warn(`[handleCreateVariant] Fetch attempt ${attempt} failed:`, fetchErr);
        }
        if (attempt < maxRetries) {
          await new Promise(resolve => setTimeout(resolve, 1000));
        }
      }

      if (!found) {
        console.log(`[handleCreateVariant] Job ${jobId} finished but asset not found in database yet. Using optimistic variant.`);
        const hasUrlAlready = variantsList.some((v: any) => v.driveUrl === generatedUrl || v.imageUrl === generatedUrl);
        if (!hasUrlAlready) {
          const optimisticVariant = {
            id: `optimistic-${jobId}`,
            tagId: `variant-${jobId}`,
            imageUrl: generatedUrl,
            driveUrl: generatedUrl,
            tags: [modifier],
            variantStatus: 'approved',
            jobId: jobId,
            createdAt: new Date().toISOString()
          };
          variantsList = [optimisticVariant, ...variantsList];
        }
      }

      setAssetVariants(prev => ({
        ...prev,
        [characterId]: variantsList
      }));
      
      setVariantModifiers(prev => ({ ...prev, [characterId]: "" }));
    } catch (err) {
      console.error("Failed to generate variant:", err);
      const detailedMsg = err instanceof Error ? err.message : "Failed to generate variant";
      setVariantErrors(prev => ({ ...prev, [characterId]: detailedMsg }));
    } finally {
      setGeneratingVariantAssetId(null);
    }
  };

  const handleSelectVariantAsPrimary = async (characterId: string, driveUrl: string) => {
    const originalAssets = [...projectAssets];
    
    setProjectAssets(prev => prev.map(asset => {
      if (asset.id === characterId) {
        const styleGuide = typeof asset.styleGuide === 'object' && asset.styleGuide !== null ? asset.styleGuide : {};
        let updatedAngles = (styleGuide as any).angles;
        if (Array.isArray(updatedAngles)) {
          updatedAngles = updatedAngles.map((ang: any) => {
            if (ang.url === asset.rootImageUrl || ang.url === (styleGuide as any).referenceImageUrl) {
              return { ...ang, url: driveUrl };
            }
            return ang;
          });
        }
        return { 
          ...asset, 
          styleGuide: { 
            ...styleGuide, 
            referenceImageUrl: driveUrl,
            ...(updatedAngles ? { angles: updatedAngles } : {})
          } 
        };
      }
      return asset;
    }));

    try {
      const asset = originalAssets.find(a => a.id === characterId);
      if (asset) {
        const styleGuide = typeof asset.styleGuide === 'object' && asset.styleGuide !== null ? asset.styleGuide : {};
        let updatedAngles = (styleGuide as any).angles;
        if (Array.isArray(updatedAngles)) {
          updatedAngles = updatedAngles.map((ang: any) => {
            if (ang.url === asset.rootImageUrl || ang.url === (styleGuide as any).referenceImageUrl) {
              return { ...ang, url: driveUrl };
            }
            return ang;
          });
        }
        await updateCharacter(characterId, { 
          styleGuide: { 
            ...styleGuide, 
            referenceImageUrl: driveUrl,
            ...(updatedAngles ? { angles: updatedAngles } : {})
          } 
        });
      }
    } catch (err) {
      console.error("Failed to update main variant:", err);
      setProjectAssets(originalAssets);
    }
  };

  const [batchGenerating, setBatchGenerating] = useState(false);
  const [batchProgressText, setBatchProgressText] = useState("");

  const handleBatchGenerateDrafts = async () => {
    if (!parsedData) return;
    setBatchGenerating(true);
    try {
      const chars = parsedData.characters.filter((c: any) => !characterMappings[c.name] && !draftAssets[c.name]);
      const locs = parsedData.locations.filter((l: any) => !locationMappings[l.name] && !draftAssets[l.name]);
      const props = ((parsedData as any).props || []).filter((p: any) => !propMappings[p.name] && !draftAssets[p.name]);
      
      const activeProject = projectsList.find(p => p.id === selectedProjectId);
      const projectStyle = activeProject?.stylePrompt || "3D stylized cartoon Pixar aesthetic, vibrant color palette, rich textures";

      const existingNoImageTasks: { id: string; name: string; type: "character" | "location" | "prop"; description: string }[] = [];

      parsedData.characters.forEach((c: any) => {
        const mappedId = characterMappings[c.name];
        if (mappedId) {
          const asset = projectAssets.find(a => a.id === mappedId);
          const hasNoRealImage = !asset || !asset.rootImageUrl || asset.rootImageUrl.includes("unsplash.com") || asset.rootImageUrl === "";
          if (hasNoRealImage) {
            existingNoImageTasks.push({
              id: mappedId,
              name: c.name,
              type: "character",
              description: asset?.description || c.description || `Nhân vật: ${c.name}`
            });
          }
        }
      });

      parsedData.locations.forEach((l: any) => {
        const mappedId = locationMappings[l.name];
        if (mappedId) {
          const asset = projectAssets.find(a => a.id === mappedId);
          const hasNoRealImage = !asset || !asset.rootImageUrl || asset.rootImageUrl.includes("unsplash.com") || asset.rootImageUrl === "";
          if (hasNoRealImage) {
            existingNoImageTasks.push({
              id: mappedId,
              name: l.name,
              type: "location",
              description: asset?.description || l.description || `Bối cảnh: ${l.name}`
            });
          }
        }
      });

      ((parsedData as any).props || []).forEach((p: any) => {
        const mappedId = propMappings[p.name];
        if (mappedId) {
          const asset = projectAssets.find(a => a.id === mappedId);
          const hasNoRealImage = !asset || !asset.rootImageUrl || asset.rootImageUrl.includes("unsplash.com") || asset.rootImageUrl === "";
          if (hasNoRealImage) {
            existingNoImageTasks.push({
              id: mappedId,
              name: p.name,
              type: "prop",
              description: asset?.description || p.description || `Đạo cụ: ${p.name}`
            });
          }
        }
      });

      const total = chars.length + locs.length + props.length + existingNoImageTasks.length;
      if (total === 0) {
        alert("Tất cả nhân vật, bối cảnh và đạo cụ đã có nháp hoặc đã được gắn DNA và có ảnh!");
        return;
      }

      const newDrafts = { ...draftAssets };
      const tasks: { name: string; type: "character" | "location" | "prop"; description: string }[] = [];

      for (const char of chars) {
        const lowerName = char.name.toLowerCase();
        let contextSentence = "";
        if (scriptText) {
          const sentences = scriptText.split(/[.\n]/);
          const matched = sentences.find(s => s.toLowerCase().includes(lowerName));
          if (matched) {
            contextSentence = matched.trim();
          }
        }
        
        let description = `Nhân vật: ${char.name}.`;
        if (contextSentence) {
          description += ` Ngữ cảnh phân cảnh kịch bản: "${contextSentence}".`;
        }
        let rootImageUrl = "https://images.unsplash.com/photo-1535268647977-a403b69fc756?w=400&auto=format&fit=crop&q=80";

        newDrafts[char.name] = {
          name: char.name,
          type: "character",
          description,
          rootImageUrl,
          styleGuide: {
            angles: [
              { title: "Front view portrait", url: rootImageUrl },
              { title: "Side view profile", url: rootImageUrl }
            ]
          },
          isGeneratingImage: true
        };

        tasks.push({ name: char.name, type: "character", description });
      }

      for (const loc of locs) {
        const lowerName = loc.name.toLowerCase();
        let contextSentence = "";
        if (scriptText) {
          const sentences = scriptText.split(/[.\n]/);
          const matched = sentences.find(s => s.toLowerCase().includes(lowerName));
          if (matched) {
            contextSentence = matched.trim();
          }
        }

        const description = `Bối cảnh: ${loc.name}.`;
        const rootImageUrl = "https://images.unsplash.com/photo-1506744038136-46273834b3fb?w=400&auto=format&fit=crop&q=80";

        newDrafts[loc.name] = {
          name: loc.name,
          type: "location",
          description,
          rootImageUrl,
          styleGuide: {
            angles: [
              { title: "Wide view establishing shot", url: rootImageUrl }
            ]
          },
          isGeneratingImage: true
        };

        tasks.push({ name: loc.name, type: "location", description });
      }

      for (const prop of props) {
        const lowerName = prop.name.toLowerCase();
        let contextSentence = "";
        if (scriptText) {
          const sentences = scriptText.split(/[.\n]/);
          const matched = sentences.find(s => s.toLowerCase().includes(lowerName));
          if (matched) {
            contextSentence = matched.trim();
          }
        }

        let description = `Đạo cụ: ${prop.name}.`;
        if (contextSentence) {
          description += ` Ngữ cảnh phân cảnh kịch bản: "${contextSentence}".`;
        }
        let rootImageUrl = "https://images.unsplash.com/photo-1578632767115-351597cf2477?w=400&auto=format&fit=crop&q=80";

        newDrafts[prop.name] = {
          name: prop.name,
          type: "prop",
          description,
          rootImageUrl,
          styleGuide: {
            angles: [
              { title: "Flat illustration view", url: rootImageUrl }
            ]
          },
          isGeneratingImage: true
        };

        tasks.push({ name: prop.name, type: "prop", description });
      }

      setDraftAssets(newDrafts);
      if (selectedEpisodeId) {
        localStorage.setItem(`drama_studio_draftAssets_${selectedEpisodeId}`, JSON.stringify(newDrafts));
      }

      const allTasks = [
        ...tasks.map(t => ({ ...t, kind: "draft" as const, id: "" })),
        ...existingNoImageTasks.map(t => ({ ...t, kind: "existing" as const }))
      ];

      let processed = 0;
      await pLimit(allTasks, async (task) => {
        processed++;
        setBatchProgressText(`Đang xử lý tạo ảnh (${processed}/${total}): ${task.name}...`);
        if (task.kind === "draft") {
          await generateImageForDraft(task.name, task.type, task.description);
        } else {
          await generateImageForExistingAsset(task.id, task.name, task.type, task.description);
        }
      }, 3);

      setBatchProgressText("");
    } catch (err) {
      console.error("Batch generation failed:", err);
    } finally {
      setBatchGenerating(false);
    }
  };

  const handleConfirmAllDrafts = async () => {
    const draftKeys = Object.keys(draftAssets);
    if (draftKeys.length === 0) {
      alert("Không có Asset nháp nào đang chờ duyệt!");
      return;
    }
    
    setBatchGenerating(true);
    setBatchProgressText(`Đang đồng bộ nạp ${draftKeys.length} Asset vào Monorepo...`);
    try {
      const savedResults = [];
      for (let i = 0; i < draftKeys.length; i++) {
        const key = draftKeys[i];
        setBatchProgressText(`Đang nạp (${i + 1}/${draftKeys.length}): ${key}...`);
        const result = await confirmDraftAssetDirect(key, draftAssets[key]);
        if (result) {
          savedResults.push({ newAsset: result.newAsset, name: key, type: result.type });
        }
      }

      if (selectedProjectId && savedResults.length > 0) {
        const assets = await fetchCharacters(selectedProjectId);
        setProjectAssets(assets);
        
        savedResults.forEach(res => {
          if (res.type === "location") {
            setLocationMappings(prev => ({ ...prev, [res.name]: res.newAsset.id }));
          } else if (res.type === "character") {
            setCharacterMappings(prev => ({ ...prev, [res.name]: res.newAsset.id }));
          } else if (res.type === "prop") {
            setPropMappings(prev => ({ ...prev, [res.name]: res.newAsset.id }));
          }
        });
      }
      setBatchProgressText("");
    } catch (e: any) {
      alert(`Lỗi nạp hàng loạt: ${e.message}`);
    } finally {
      setBatchGenerating(false);
    }
  };

  // Shot Operations
  const handleDecomposeShots = () => {
    if (parsedData?.scenes && parsedData.scenes.length > 0) {
      const charNames = parsedData.characters.map((c: any) => c.name);
      const totalDuration = 180;
      const avgShotDuration = 4;
      const newShots = generateExpandedShots(parsedData.scenes, charNames, totalDuration, avgShotDuration);
      setParsedData((prev: any) => {
        if (!prev) return null;
        if (prev.shots && prev.shots.length > 0) {
          const currentShots = prev.shots;
          const mergedShots = newShots.map((newSh: any) => {
            const existingSh = currentShots.find((s: any) => s.beat === newSh.beat);
            if (existingSh) {
              return {
                ...newSh,
                imageUrl: existingSh.imageUrl || newSh.imageUrl || "",
                variants: existingSh.variants || newSh.variants || []
              };
            }
            return newSh;
          });
          
          if (JSON.stringify(prev.shots) === JSON.stringify(mergedShots)) return prev;
          return {
            ...prev,
            shots: mergedShots
          };
        }
        return {
          ...prev,
          shots: newShots
        };
      });
      toast.success("Đã bóc tách toàn bộ Scene thành các Shot chi tiết.");
    }
  };

  const getDetectedAssetsForShot = (sh: any) => {
    if (!parsedData) return { chars: [], locs: [], props: [] };
    const textToSearch = `${sh.assetDnaRefs || ""} ${sh.diễn_tả || sh.description || ""} ${sh.mục_tiêu || sh.objective || ""} ${sh.hình_ảnh || sh.visual || ""}`;
    
    const chars = (parsedData.characters || []).filter((c: any) => textToSearch.includes(c.name)).map((c: any) => {
      const dbAsset = projectAssets.find(a => a.id === characterMappings[c.name]);
      return { scriptName: c.name, hasRef: !!dbAsset?.assetUrl, imageUrl: dbAsset?.assetUrl || null };
    });
    
    const locs = (parsedData.locations || []).filter((l: any) => textToSearch.includes(l.name)).map((l: any) => {
      const dbAsset = projectAssets.find(a => a.id === locationMappings[l.name]);
      return { scriptName: l.name, hasRef: !!dbAsset?.assetUrl, imageUrl: dbAsset?.assetUrl || null };
    });
    
    return { chars, locs, props: [] as any[] };
  };

  const getComputedShotPrompt = (sh: any) => {
    if (sh.structure && sh.structure.core) {
      return sh.structure.core;
    }
    return sh.hình_ảnh || sh.visual || sh.actionDescription || "";
  };

  const runVerification = (sh: any) => {
    const warnings: string[] = [];
    const promptLower = (sh.hình_ảnh || sh.visual || "").toLowerCase();
    
    const stylePreset = universeVisualPreset || "Pixar 3D Stylized";
    const styleTerms: string[] = [];
    if (stylePreset.toLowerCase().includes("pixar")) styleTerms.push("pixar", "3d", "stylized");
    if (stylePreset.toLowerCase().includes("anime")) styleTerms.push("anime", "ghibli", "cel-shaded");
    if (stylePreset.toLowerCase().includes("cyberpunk")) styleTerms.push("cyberpunk", "neon", "retro");
    if (stylePreset.toLowerCase().includes("comic")) styleTerms.push("comic", "sketch", "ink");
    
    const hasStyleAlignment = styleTerms.some(term => promptLower.includes(term));
    if (styleTerms.length > 0 && !hasStyleAlignment) {
      warnings.push(`Style Drift: Visual prompt should include style cues for "${stylePreset}" (e.g. ${styleTerms.join(", ")}).`);
    }
    
    const scene = parsedData?.scenes?.find((s: any) => s.sceneNumber === sh.sc || s.id === sh.sceneId || s.id === sh.sc);
    const sceneText = ((scene?.description || "") + " " + (scene?.title || "")).toLowerCase();
    
    const projectCharacters = projectAssets.filter((a: any) => a.entityType?.toLowerCase() === "character");
    projectCharacters.forEach((char: any) => {
      if (sceneText.includes(char.name.toLowerCase())) {
        if (!promptLower.includes(char.name.toLowerCase())) {
          warnings.push(`Identity Drift: Character "${char.name}" is present in the scene but missing from the shot visual prompt.`);
        } else {
          const desc = getCleanDnaPrompt(char.description || "").toLowerCase();
          const words = desc.split(/[\s,.-]+/).filter((w: string) => w.length > 3);
          let traits: string[] = [];
          if (char.name.toLowerCase().includes("kilo")) traits = ["trench coat", "fedora", "detective"];
          else if (char.name.toLowerCase().includes("elena") || char.name.toLowerCase().includes("chloe")) traits = ["teddy bear", "skirt", "glasses"];
          else if (char.name.toLowerCase().includes("bruno")) traits = ["leather vest", "bulldog", "muscular"];
          else {
            traits = words.slice(0, 2);
          }
          
          const missingTraits = traits.filter(t => !promptLower.includes(t));
          if (missingTraits.length > 0) {
            warnings.push(`DNA Drift: Character "${char.name}" is missing signature attributes in prompt: ${missingTraits.map(t => `"${t}"`).join(", ")}.`);
          }
        }
      }
    });
    
    return {
      score: Math.max(50, 100 - warnings.length * 15),
      warnings
    };
  };

  const getReferenceImagesForShot = (sh: any) => {
    const charUrls: string[] = [];
    const locUrls: string[] = [];
    const propUrls: string[] = [];
    
    const shotCharText = (sh.nhân_vật || sh.characters || "").toLowerCase();
    Object.entries(characterMappings).forEach(([scriptName, dbId]) => {
      if (shotCharText.includes(scriptName.toLowerCase())) {
        const dbAsset = projectAssets.find(a => a.id === dbId);
        if (dbAsset?.rootImageUrl) charUrls.push(dbAsset.rootImageUrl);
      }
    });

    const shotLocText = (sh.bối_cảnh || sh.location || "").toLowerCase();
    Object.entries(locationMappings).forEach(([scriptName, dbId]) => {
      if (shotLocText.includes(scriptName.toLowerCase())) {
        const dbAsset = projectAssets.find(a => a.id === dbId);
        if (dbAsset?.rootImageUrl) locUrls.push(dbAsset.rootImageUrl);
      }
    });

    const shotPropText = (sh.đạo_cụ || sh.props || "").toLowerCase();
    Object.entries(propMappings).forEach(([scriptName, dbId]) => {
      if (shotPropText.includes(scriptName.toLowerCase())) {
        const dbAsset = projectAssets.find(a => a.id === dbId);
        if (dbAsset?.rootImageUrl) propUrls.push(dbAsset.rootImageUrl);
      }
    });

    const finalRefs: string[] = [];
    const framing = (sh.cỡ_cảnh || sh.framing || "").toLowerCase();
    const isWide = framing.includes("wide") || framing.includes("toàn") || framing.includes("establishing");
    const isClose = framing.includes("close") || framing.includes("cận") || framing.includes("extreme");

    finalRefs.push(...charUrls.slice(0, 2));

    if (finalRefs.length < 2) {
      if (isWide && locUrls.length > 0) {
         finalRefs.push(locUrls[0]);
      } else if (isClose && propUrls.length > 0) {
         finalRefs.push(propUrls[0]);
      } else if (locUrls.length > 0) {
         finalRefs.push(locUrls[0]);
      }
    }

    return Array.from(new Set(finalRefs)).slice(0, 2);
  };

  const handleGenerateShotFrame = async (sh: any) => {
    if (!sh || !sh.beat) return;
    
    setGeneratingShots(prev => ({ ...prev, [sh.beat]: true }));
    try {
      const baseAction = getComputedShotPrompt(sh) || `Cinematic shot for beat ${sh.beat}, action: ${sh.diễn_tả || sh.description}`;
      const location = sh.bối_cảnh || sh.location || "the location";
      const characters = sh.nhân_vật || sh.characters || "the characters";
      
      const activeProject = projectsList.find(p => p.id === selectedProjectId);
      const projectStyle = activeProject?.stylePrompt || "premium 3D family-animation style with soft anime-influenced facial appeal";
      const projectNegativePrompt = getCombinedNegativePrompt();
      let prompt = `Create a scene inside ${location} with ${characters}. ${baseAction}. Style: ${projectStyle}. Stage the characters naturally in the room with correct contact shadows, matching light direction, and readable expressions. No text.`;
      
      // Integrate Letta RAG & Consistency Guardian
      const detectedAssets = getDetectedAssetsForShot(sh);
      const characterNames = (detectedAssets?.chars || []).map((c: any) => c.scriptName);

      try {
        console.log("[Letta RAG] Resolving prompt with memory...");
        const resolveRes = await resolvePrompt(selectedProjectId, prompt, characterNames);
        if (resolveRes.success && resolveRes.data?.resolvedPrompt) {
          prompt = resolveRes.data.resolvedPrompt;
          if (resolveRes.data.memoriesUsed > 0 || resolveRes.data.dbDNAUsed > 0) {
            console.log(`[Letta RAG] Enhanced prompt using ${resolveRes.data.memoriesUsed} memories and ${resolveRes.data.dbDNAUsed} DNA traits.`);
          }
        }
      } catch (err) {
        console.warn("[Letta RAG] Memory resolution failed, proceeding with original prompt:", err);
      }

      if (characterNames.length > 0) {
        try {
          console.log("[Consistency Guardian] Checking visual rules...");
          const consistencyRes = await checkConsistency(selectedProjectId, prompt, characterNames);
          if (consistencyRes.success) {
            const consistencyData = consistencyRes.data;
            if (consistencyData?.status === "VIOLATED") {
              const violation = consistencyData.violations?.[0] || 
                                consistencyData.violation || 
                                "Visual consistency rule violation detected.";
              console.warn("[Consistency Guardian] Violation detected:", violation);
              
              console.log("[Consistency Guardian] Refining prompt...");
              const hubKey = getHubApiKey();
              const refineHeaders: Record<string, string> = { "Content-Type": "application/json" };
              if (hubKey) refineHeaders["Authorization"] = `Bearer ${hubKey}`;
              const refineRes = await fetch(`${getApiBaseUrl()}/worker/v1/media/agent/refine-prompt`, {
                method: "POST",
                headers: refineHeaders,
                body: JSON.stringify({ prompt, violation })
              });
              if (refineRes.ok) {
                const refineData = await refineRes.json();
                const refined = refineData.refinedPrompt || refineData.data?.refinedPrompt;
                if (refined) {
                  prompt = refined;
                  console.log("[Consistency Guardian] Refined prompt:", prompt);
                }
              } else {
                throw new Error(`Visual consistency violation: ${violation}. Automatic refinement failed.`);
              }
            }
          }
        } catch (err) {
          console.error("[Consistency Guardian] Error check/refine:", err);
          // Re-throw if it's the violation error we generated
          if (err instanceof Error && err.message.includes("Visual consistency violation")) {
            throw err;
          }
        }
      }

      const gflowProjectId = await ensureGFlowProjectForEpisode(selectedEpisodeId) || `storymee-proj-${selectedEpisodeId}`;
      const refImageUrls = getReferenceImagesForShot(sh);

      const jobRes = await generateAssetJob("00000000-0000-0000-0000-000000000000", prompt, {
        project_name: selectedProjectId || "default",
        provider: aiProvider,
        aspect_ratio: "16:9",
        negative_prompt: projectNegativePrompt,
        projectId: gflowProjectId,
        reference_image_urls: refImageUrls.length > 0 ? refImageUrls : undefined
      });
      
      const jobId = jobRes.data?.job_id;
      if (!jobId) throw new Error("No job ID returned from server.");
      
      const finishedJob = await monitorJob(jobId);
      const imageUrl = (finishedJob.outputUrls && finishedJob.outputUrls[0]) || finishedJob.output_url;

      if (!imageUrl) throw new Error("Generation failed, image URL not returned");
      
      useShotStore.getState().setImage(sh.beat, imageUrl);
      useShotStore.getState().addVariant(sh.beat, imageUrl);
      useShotStore.getState().setGenerating(sh.beat, false);
      
    } catch (err) {
      console.error(`Failed to generate frame for shot ${sh.beat}:`, err);
      alert(err instanceof Error ? err.message : "Generation failed");
      useShotStore.getState().setGenerating(sh.beat, false);
    } finally {
      setGeneratingShots(prev => ({ ...prev, [sh.beat]: false }));
    }
  };

  const handleGenerateAllStoryboardFrames = async () => {
    if (!parsedData || !parsedData.shots || parsedData.shots.length === 0) return;
    
    let optimizedData = parsedData;
    if (parsedData.scenes) {
      const updatedScenes = parsedData.scenes.map((scene: any) => {
        if (!scene.shots || scene.shots.length === 0) return scene;
        const rawShots = scene.shots.map((sh: any) => ({
          id: sh.id || sh.beat || `shot-${Math.random()}`,
          scene_id: scene.id || scene.sceneNumber,
          shotNumber: sh.shotNumber || parseInt(sh.beat?.replace(/\D/g, "") || "1"),
          shot_type: sh.shotType || "ACTION",
          framing: sh.framing || "MEDIUM",
          duration_target: sh.duration || 4,
          camera_movement: sh.cameraMovement || "STATIC",
          action_description: sh.actionDescription || "",
          character_refs: getDetectedAssetsForShot(sh)?.chars || [],
          scene_ref: scene.location,
          ...sh
        }));

        const { optimizedShots, warnings, glueNotes } = runCinematicPipeline(rawShots);
        
        if (warnings.length > 0 || glueNotes.length > 0) {
          console.log(`Scene ${scene.sceneNumber} optimizations:`, { warnings, glueNotes });
          if (glueNotes.length > 0) toast.info(`Auto-Middleware: Đã chèn ${glueNotes.length} Glue Shot cho Scene ${scene.sceneNumber}`);
        }
        return { ...scene, shots: optimizedShots };
      });
      
      const flatShots = updatedScenes.flatMap((s: any) => s.shots);
      optimizedData = { ...parsedData, scenes: updatedScenes, shots: flatShots };
      setParsedData(optimizedData);
    }

    const finalShots = optimizedData.shots || [];
    setBatchGeneratingShots(true);
    setBatchShotsProgress({ current: 0, total: finalShots.length, text: "Starting batch generation..." });
    
    let completedCount = 0;
    const items = [...finalShots];
    const limit = 3;
    let index = 0;
    
    const executeGeneration = async (sh: any) => {
      try {
        setBatchShotsProgress(prev => ({
          ...prev,
          text: `Processing Shot ${sh.beat} (${completedCount + 1}/${items.length})...`
        }));
        
        const baseAction = getComputedShotPrompt(sh) || `Cinematic shot for beat ${sh.beat}, action: ${sh.diễn_tả || sh.description}`;
        const location = sh.bối_cảnh || sh.location || "the location";
        const characters = sh.nhân_vật || sh.characters || "the characters";
        
        const activeProject = projectsList.find(p => p.id === selectedProjectId);
        const projectStyle = activeProject?.stylePrompt || "premium 3D family-animation style with soft anime-influenced facial appeal";
        const projectNegativePrompt = getCombinedNegativePrompt();
        const prompt = `Create a scene inside ${location} with ${characters}. ${baseAction}. Style: ${projectStyle}. Stage the characters naturally in the room with correct contact shadows, matching light direction, and readable expressions. No text.`;

        const gflowProjectId = await ensureGFlowProjectForEpisode(selectedEpisodeId) || `storymee-proj-${selectedEpisodeId}`;
        const refImageUrls = getReferenceImagesForShot(sh);

        const jobRes = await generateAssetJob("00000000-0000-0000-0000-000000000000", prompt, {
          project_name: selectedProjectId || "default",
          provider: "auto",
          aspect_ratio: "16:9",
          negative_prompt: projectNegativePrompt,
          projectId: gflowProjectId,
          reference_image_urls: refImageUrls.length > 0 ? refImageUrls : undefined
        });
        
        const jobId = jobRes.data?.job_id;
        if (!jobId) throw new Error("No job ID returned");
        
        const finishedJob = await monitorJob(jobId);
        const imageUrl = (finishedJob.outputUrls && finishedJob.outputUrls[0]) || finishedJob.output_url;
        
        if (imageUrl) {
          setParsedData((prev: any) => {
            if (!prev) return null;
            const updatedShots = prev.shots.map((item: any) => {
              if (item.beat === sh.beat) {
                const currentVariants = item.variants || [];
                return {
                  ...item,
                  imageUrl: imageUrl,
                  variants: currentVariants.includes(imageUrl) ? currentVariants : [...currentVariants, imageUrl]
                };
              }
              return item;
            });
            return { ...prev, shots: updatedShots };
          });
        }
      } catch (err) {
        console.error(`Batch generation error for shot ${sh.beat}:`, err);
      } finally {
        completedCount++;
        setBatchShotsProgress(prev => ({
          ...prev,
          current: completedCount,
          text: `Processed ${completedCount}/${items.length} shots.`
        }));
      }
    };
    
    async function worker() {
      while (index < items.length) {
        const currentIndex = index++;
        await executeGeneration(items[currentIndex]);
      }
    }
    
    const workers = [];
    const workerCount = Math.min(limit, items.length);
    for (let i = 0; i < workerCount; i++) {
      workers.push(worker());
    }
    
    await Promise.all(workers);
    setBatchGeneratingShots(false);
  };

  const handleScanCohesion = () => {
    if (!parsedData || !parsedData.scenes) return;
    try {
      const updatedScenes = parsedData.scenes.map((scene: any) => {
        if (!scene.shots || scene.shots.length === 0) return scene;
        
        const rawShots = scene.shots.map((sh: any) => ({
          id: sh.id || sh.beat || `shot-${Math.random()}`,
          scene_id: scene.id || scene.sceneNumber,
          shotNumber: sh.shotNumber || parseInt(sh.beat?.replace(/\D/g, "") || "1"),
          shot_type: sh.shotType || "ACTION",
          framing: sh.framing || "MEDIUM",
          duration_target: sh.duration || 4,
          camera_movement: sh.cameraMovement || "STATIC",
          action_description: sh.actionDescription || "",
          character_refs: getDetectedAssetsForShot(sh)?.chars || [],
          scene_ref: scene.location,
          ...sh
        }));

        const { optimizedShots, warnings, glueNotes } = runCinematicPipeline(rawShots);
        
        if (warnings.length > 0 || glueNotes.length > 0) {
          console.log(`Scene ${scene.sceneNumber} optimizations:`, { warnings, glueNotes });
          if (glueNotes.length > 0) toast.info(`Scene ${scene.sceneNumber}: Inserted ${glueNotes.length} glue shots.`);
        }

        return {
          ...scene,
          shots: optimizedShots
        };
      });

      setParsedData((prev: any) => ({
        ...prev,
        scenes: updatedScenes,
        shots: updatedScenes.flatMap((s: any) => s.shots)
      }));
      toast.success("Cohesion Scan Complete: Pipeline optimized.");
    } catch (e: any) {
      console.error(e);
      toast.error("Failed to run cinematic pipeline.");
    }
  };

  const handleUpdateShotField = (beat: string, field: string, value: any) => {
    setParsedData((prev: any) => {
      if (!prev) return null;
      const currentShots = prev.shots || generateExpandedShots(prev.scenes, prev.characters.map((c: any) => c.name), 180, 4);
      const updatedShots = currentShots.map((sh: any) => {
        if (sh.beat === beat) {
          const targetField = field === "description" || field === "diễn_tả" ? "diễn_tả" : 
                             field === "objective" || field === "mục_tiêu" ? "mục_tiêu" :
                             field === "visual" || field === "hình_ảnh" ? "hình_ảnh" : field;
          return { 
            ...sh, 
            [targetField]: value,
            [field]: value
          };
        }
        return sh;
      });
      return { ...prev, shots: updatedShots };
    });
  };

  const handleDeleteShot = (beat: string) => {
    setParsedData((prev: any) => {
      if (!prev) return null;
      const updatedShots = (prev.shots || []).filter((sh: any) => sh.beat !== beat);
      return { ...prev, shots: updatedShots };
    });
  };

  const handleAddShot = (sceneCode: string) => {
    setParsedData((prev: any) => {
      if (!prev) return null;
      const currentShots = prev.shots || [];
      const sceneShots = currentShots.filter((sh: any) => sh.sc === sceneCode);
      const nextIdx = sceneShots.length + 1;
      const beat = `${sceneCode}_B${String(nextIdx).padStart(2, "0")}`;
      
      const newShot = {
        beat,
        shotNumber: nextIdx,
        sc: sceneCode,
        cameraMovement: "Static Tilt",
        angle: "Eye-Level",
        actionDescription: "Describe the new physical action here...",
        duration: 4,
        structure: {
          core: "A cinematic shot of characters in the scene."
        }
      };
      
      return { ...prev, shots: [...currentShots, newShot] };
    });
  };

  return {
    projectAssets,
    setProjectAssets,
    isLoadingAssets,
    setIsLoadingAssets,
    characterMappings,
    setCharacterMappings,
    locationMappings,
    setLocationMappings,
    propMappings,
    setPropMappings,
    generatingAssets,
    setGeneratingAssets,
    failedAutoGenerations,
    setFailedAutoGenerations,
    draftAssets,
    setDraftAssets,
    loadingVariants,
    setLoadingVariants,
    assetVariants,
    setAssetVariants,
    variantModifiers,
    setVariantModifiers,
    generatingVariantAssetId,
    setGeneratingVariantAssetId,
    variantErrors,
    setVariantErrors,
    generatingShots,
    setGeneratingShots,
    batchGeneratingShots,
    setBatchGeneratingShots,
    batchShotsProgress,
    setBatchShotsProgress,
    editingCharId,
    setEditingCharId,
    editingCharText,
    setEditingCharText,
    editingCharStyleText,
    setEditingCharStyleText,
    expandedCharIds,
    setExpandedCharIds,
    savingCharId,
    setSavingCharId,
    loadDbAssets,
    generateImageForDraft,
    handleCancelDraftAsset,
    handleUpdateDraftDescription,
    handleRegenerateDraftAsset,
    handleAutoGenerateAsset,
    confirmDraftAssetDirect,
    handleConfirmDraftAsset,
    handleSaveCharacterPrompt,
    generateImageForExistingAsset,
    handleRegenerateExistingAsset,
    handleCreateVariant,
    handleSelectVariantAsPrimary,
    batchGenerating,
    setBatchGenerating,
    batchProgressText,
    setBatchProgressText,
    handleBatchGenerateDrafts,
    handleConfirmAllDrafts,
    getAssetStyleGuide,
    handleDecomposeShots,
    getDetectedAssetsForShot,
    getComputedShotPrompt,
    runVerification,
    getReferenceImagesForShot,
    handleGenerateShotFrame,
    handleGenerateAllStoryboardFrames,
    handleScanCohesion,
    handleUpdateShotField,
    handleDeleteShot,
    handleAddShot
  };
}
