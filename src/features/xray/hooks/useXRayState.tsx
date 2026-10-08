"use client";

import React, { useState, useRef, useEffect, useMemo } from "react";
import { useGFlowExtension } from "@/hooks/useGFlowExtension";
import { 
  getXRayFeedback, 
  generateXRayPrompt, 
  generateAssetJob, 
  fetchCharacters, 
  createCharacter, 
  updateCharacter,
  deleteCharacter,
  fetchProjects,
  createProject,
  updateProject,
  deleteProject,
  analyzeStyle,
  fetchEpisodes,
  createEpisode,
  updateEpisode,
  deleteEpisode,
  fetchScenes,
  createScene,
  updateScene,
  deleteScene,
  fetchCustomTags,
  uploadImage,
  deleteAsset,
  updateAsset,
  fetchStoryboardAssets,
  fetchSettings,
  fetchVidtoryModels,
  fetchJobById,
  API_BASE_URL,
  getHubApiKey
} from "@/lib/api";

import { 
  INITIAL_DRAMA_ART_STYLES, 
  CHARACTER_TAGS, 
  LOCATION_TAGS, 
  PROP_TAGS, 
  compressImage 
} from "../constants/xrayConstants";

interface VariantImage {
  id: string;
  url: string;
  tags: string[];
}

export function useXRayState() {
  const { getGFlowToken } = useGFlowExtension();
  const [universalNegativePrompt, setUniversalNegativePrompt] = useState("avoid photorealistic human skin, avoid horror lighting, avoid dark moody room, avoid heavy yellow/orange color cast, avoid cluttered messy apartment, avoid sharp realistic bird beak, avoid realistic feathers, avoid tiny eyes for Mica, avoid adult-like child proportions, avoid inconsistent scale, avoid overly complex clothing, avoid distorted hands, avoid extra fingers, avoid crooked architecture, avoid fisheye distortion, avoid unreadable silhouette, avoid random text, avoid watermark, avoid logos, avoid copying existing copyrighted characters");
  const [assetType, setAssetType] = useState<"character" | "location" | "prop" | "style">("character");
  
  // Database Integration States
  const [dbAssetsList, setDbAssetsList] = useState<any[]>([]);
  const [selectedAssetId, setSelectedAssetId] = useState<string>("");
  const [isLoadingAssets, setIsLoadingAssets] = useState(false);
  const [quickCreateName, setQuickCreateName] = useState("");
  const [isCreatingAsset, setIsCreatingAsset] = useState(false);
  const [isSavingToDb, setIsSavingToDb] = useState(false);

  // Next-Gen Episodes & Scenes Hierarchy States
  const [episodesList, setEpisodesList] = useState<any[]>([]);
  const [selectedEpisodeId, setSelectedEpisodeId] = useState<string>("");
  const [isLoadingEpisodes, setIsLoadingEpisodes] = useState(false);
  const [scriptText, setScriptText] = useState("");
  const [isSavingScript, setIsSavingScript] = useState(false);
  
  const [scenesList, setScenesList] = useState<any[]>([]);
  const [selectedSceneId, setSelectedSceneId] = useState<string>("");
  const [isLoadingScenes, setIsLoadingScenes] = useState(false);

  // Storyboard Output Album / Scene Renders States
  const [storyboardAssets, setStoryboardAssets] = useState<any[]>([]);
  const [isLoadingStoryboardAssets, setIsLoadingStoryboardAssets] = useState(false);
  const [selectedStoryboardAsset, setSelectedStoryboardAsset] = useState<any | null>(null);

  // Scene CRUD Form states
  const [showSceneModal, setShowSceneModal] = useState(false);
  const [sceneTitle, setSceneTitle] = useState("");
  const [sceneDesc, setSceneDesc] = useState("");
  const [scenePrompt, setScenePrompt] = useState("");
  const [sceneImageUrl, setSceneImageUrl] = useState("");
  const [editingSceneId, setEditingSceneId] = useState<string | null>(null);
  const [isSceneUploading, setIsSceneUploading] = useState(false);

  // Custom Art Styles List
  const [customArtStyles, setCustomArtStyles] = useState<any[]>([]);
  const [newStyleNameInput, setNewStyleNameInput] = useState("");
  const [newStylePromptInput, setNewStylePromptInput] = useState("");

  // Variant generator popup modal state
  const [showVariantGenModal, setShowVariantGenModal] = useState(false);

  // Active / Selected Variant states
  const [variantImages, setVariantImages] = useState<VariantImage[]>([]);
  const [activeVariantId, setActiveVariantId] = useState<string>("");

  // Grid Mode State for Generation
  const [generationGridMode, setGenerationGridMode] = useState<"1x1" | "2x1" | "3x1" | "4x1" | "2x2" | "3x3">("1x1");
  const [isSplittingGrid, setIsSplittingGrid] = useState(false);

  // Premium Render Style States
  const [selectedStyleCategory, setSelectedStyleCategory] = useState<"3d" | "2d" | "real" | "stop_motion">("3d");
  const [selectedArtStyleId, setSelectedArtStyleId] = useState<string>("3d_american");
  const [detectedStyleName, setDetectedStyleName] = useState<string>("");
  const [isNewCustomStyleDetected, setIsNewCustomStyleDetected] = useState(false);

  // Core Description Brief
  const [brief, setBrief] = useState("");
  const [aliases, setAliases] = useState("");

  // Vidtory SDK Models States
  const [vidtoryModels, setVidtoryModels] = useState<any[]>([]);
  const [selectedImageModel, setSelectedImageModel] = useState<string>("flux-schnell");
  const [selectedPromptModel, setSelectedPromptModel] = useState<string>("gemini-2.5-flash");
  const [selectedVideoModel, setSelectedVideoModel] = useState<string>("");
  const [gatewayType, setGatewayType] = useState<string>("hub");

  // Root anchor image
  const [rootImageUrl, setRootImageUrl] = useState<string>("");

  // AI analysis results
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [masterDesignPrompt, setMasterDesignPrompt] = useState("");
  const [coreIdentityTraits, setCoreIdentityTraits] = useState("");
  const [stylePrompt, setStylePrompt] = useState("");
  const [hasAnalyzed, setHasAnalyzed] = useState(false);

  // 6 Custom Art Style DNA Categories (Style Writer)
  const [visualStyle, setVisualStyle] = useState("");
  const [composition, setComposition] = useState("");
  const [attitude, setAttitude] = useState("");
  const [colors, setColors] = useState("");
  const [lighting, setLighting] = useState("");
  const [camera, setCamera] = useState("");

  // Variant contextual tags and prompts
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [customContext, setCustomContext] = useState("");
  const [prompt, setPrompt] = useState("");
  const [isGeneratingImage, setIsGeneratingImage] = useState(false);
  const [isGeneratingRootImage, setIsGeneratingRootImage] = useState(false);
  const [genState, setGenState] = useState<"idle" | "sending" | "queued" | "generating" | "done" | "failed">("idle");
  const [variantConsoleTab, setVariantConsoleTab] = useState<"ai" | "manual">("ai");
  const [manualVariantFile, setManualVariantFile] = useState<File | null>(null);
  const [manualVariantTag, setManualVariantTag] = useState("");
  const [isUploadingManualVariant, setIsUploadingManualVariant] = useState(false);

  // UI Minimalism States
  const [activeTab, setActiveTab] = useState<"blueprint" | "style">("blueprint");
  const [syncToUniverseStyle, setSyncToUniverseStyle] = useState(true);
  const [isAdvancedTagsOpen, setIsAdvancedTagsOpen] = useState(false);
  const [rootMediaId, setRootMediaId] = useState("");
  
  // Google Flow Tunnel Terminal Logs
  const [tunnelLogs, setTunnelLogs] = useState<string[]>([]);
  const [showTunnelTerminal, setShowTunnelTerminal] = useState(false);
  const [dbCustomTags, setDbCustomTags] = useState<any[]>([]);
  const [zoomImageUrl, setZoomImageUrl] = useState<string | null>(null);
  
  // Smart Collapsible Accordion States
  const [isQuickCreateOpen, setIsQuickCreateOpen] = useState(false);
  const [projectsList, setProjectsList] = useState<any[]>([]);
  const [selectedProjectId, setSelectedProjectId] = useState<string>("");
  const [projectStyleUrl, setProjectStyleUrl] = useState<string>("");
  const [projectStylePrompt, setProjectStylePrompt] = useState<string>("");
  const [isAnalyzingProjectStyle, setIsAnalyzingProjectStyle] = useState(false);
  const [isSavingProject, setIsSavingProject] = useState(false);
  const [isCreatingProject, setIsCreatingProject] = useState(false);
  const [newProjectName, setNewProjectName] = useState("");

  const activeProject = useMemo(() => {
    return projectsList.find(p => p.id === selectedProjectId) || null;
  }, [projectsList, selectedProjectId]);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const variantFileInputRef = useRef<HTMLInputElement>(null);

  // Parse Style DNA helper
  const parseStyleSummary = (markdownText: string) => {
    const result = {
      visualStyle: "",
      composition: "",
      attitude: "",
      colors: "",
      lighting: "",
      camera: ""
    };
    if (!markdownText) return result;

    const sections = [
      { key: "visualStyle", patterns: [/Visual Style/i, /## Visual Style/i, /Proportions/i, /## Proportions/i, /Architecture & Layout/i, /## Architecture & Layout/i, /Shapes & Form/i, /## Shapes & Form/i] },
      { key: "composition", patterns: [/Composition/i, /## Composition/i, /Face & Eyes/i, /## Face & Eyes/i, /Face/i, /Materials & Textures/i, /## Materials & Textures/i, /Materials & Finish/i, /## Materials & Finish/i] },
      { key: "attitude", patterns: [/Attitude/i, /## Attitude/i, /Hair Style/i, /## Hair Style/i, /Hair/i, /Colors & Palette/i, /## Colors & Palette/i, /Functional Details/i, /## Functional Details/i] },
      { key: "colors", patterns: [/Colors/i, /## Colors/i, /Outfit & Colors/i, /## Outfit & Colors/i, /Outfit/i, /Lighting & Shadows/i, /## Lighting & Shadows/i, /Colors & Wear/i, /## Colors & Wear/i] },
      { key: "lighting", patterns: [/Lighting/i, /## Lighting/i, /Silhouette & Shapes/i, /## Silhouette & Shapes/i, /Silhouette/i, /Atmosphere & Mood/i, /## Atmosphere & Mood/i, /Scale & Proportions/i, /## Scale & Proportions/i] },
      { key: "camera", patterns: [/Camera/i, /## Camera/i, /Do's & Dont's/i, /## Do's & Dont's/i, /Dos and Donts/i] }
    ];

    const lines = markdownText.split("\n");
    let currentKey: string | null = null;
    let currentContent: string[] = [];

    for (const line of lines) {
      const trimmed = line.trim();
      if (!trimmed) continue;

      let matched = false;
      for (const sec of sections) {
        const isHeader = trimmed.startsWith("##") || trimmed.startsWith("**") || (trimmed.endsWith(":") && sec.patterns.some(p => p.test(trimmed)));
        if (isHeader && sec.patterns.some(p => p.test(trimmed))) {
          if (currentKey) {
            (result as any)[currentKey] = currentContent.join(" ").trim();
          }
          currentKey = sec.key;
          currentContent = [];
          matched = true;
          break;
        }
      }

      if (!matched) {
        if (currentKey) {
          const cleanLine = trimmed.replace(/^-\s*/, "").replace(/^:\s*/, "");
          currentContent.push(cleanLine);
        }
      }
    }

    if (currentKey) {
      (result as any)[currentKey] = currentContent.join(" ").trim();
    }

    return result;
  };

  const renderBoldText = (text: string) => {
    if (!text) return null;
    const parts = text.split(/\*\*([^*]+)\*\*/g);
    return parts.map((part, idx) => {
      if (idx % 2 === 1) {
        return <strong key={idx} className="text-purple-400 font-black tracking-wide text-[11px] bg-purple-950/20 px-1 rounded">{part}</strong>;
      }
      return <span key={idx} className="text-neutral-300 text-[11px] leading-relaxed">{part}</span>;
    });
  };

  // Load custom styles from localStorage
  useEffect(() => {
    const saved = localStorage.getItem("storymee_custom_art_styles");
    if (saved) {
      try {
        setCustomArtStyles(JSON.parse(saved));
      } catch (e) {
        console.error(e);
      }
    }
  }, []);

  // Load custom tags from database on mount
  useEffect(() => {
    fetchCustomTags()
      .then((tags) => {
        if (Array.isArray(tags)) {
          setDbCustomTags(tags);
        }
      })
      .catch((err) => console.error("Error fetching custom tags:", err));
  }, []);

  const allArtStyles = useMemo(() => {
    return [...INITIAL_DRAMA_ART_STYLES, ...customArtStyles];
  }, [customArtStyles]);

  // Filtered db assets matched precisely with current entityType and active Project
  const filteredDbAssetsList = useMemo(() => {
    if (!selectedProjectId) return [];
    return dbAssetsList.filter(a => {
      if ((a.entityType || "character") !== assetType) return false;
      return a.universeId === selectedProjectId || a.projectId === selectedProjectId;
    });
  }, [dbAssetsList, assetType, selectedProjectId]);

  const applySelectedAssetDetails = (selectedAsset: any) => {
    if (!selectedAsset) {
      setBrief("");
      setAliases("");
      setMasterDesignPrompt("");
      setCoreIdentityTraits("");
      setStylePrompt("");
      setVisualStyle("");
      setComposition("");
      setAttitude("");
      setColors("");
      setLighting("");
      setCamera("");
      setRootImageUrl("");
      setRootMediaId("");
      setVariantImages([]);
      setHasAnalyzed(false);
      return;
    }

    let descText = selectedAsset.description || "";
    let parsedJson: any = null;
    try {
      if (descText.trim().startsWith("{") && descText.trim().endsWith("}")) {
        parsedJson = JSON.parse(descText);
      }
    } catch (e) {}

    if (parsedJson) {
      setBrief(parsedJson.brief || "");
      setMasterDesignPrompt(parsedJson.masterDesignPrompt || "");
      setCoreIdentityTraits(parsedJson.coreIdentityTraits || "");
      setStylePrompt(parsedJson.stylePrompt || "");
      setVisualStyle(parsedJson.visualStyle || "");
      setComposition(parsedJson.composition || "");
      setAttitude(parsedJson.attitude || "");
      setColors(parsedJson.colors || "");
      setLighting(parsedJson.lighting || "");
      setCamera(parsedJson.camera || "");
      setHasAnalyzed(true);
    } else {
      setBrief(descText);
      setMasterDesignPrompt(descText);
      setCoreIdentityTraits("");
      setStylePrompt("");

      const hasMarkdownHeaders = descText.includes("##") || descText.includes("**");
      if (hasMarkdownHeaders) {
        const parsed = parseStyleSummary(descText);
        setVisualStyle(parsed.visualStyle);
        setComposition(parsed.composition);
        setAttitude(parsed.attitude);
        setColors(parsed.colors);
        setLighting(parsed.lighting);
        setCamera(parsed.camera);
        setHasAnalyzed(true);
      } else {
        setVisualStyle("");
        setComposition("");
        setAttitude("");
        setColors("");
        setLighting("");
        setCamera("");
        setHasAnalyzed(!!descText);
      }
    }

    const savedStyleName = selectedAsset.styleGuide?.styleName || "";
    const savedStylePrompt = selectedAsset.styleGuide?.stylePrompt || selectedAsset.styleGuide?.token || "";

    if (savedStyleName || savedStylePrompt) {
      setStylePrompt(savedStylePrompt);
      setDetectedStyleName(savedStyleName);

      const matchedStyle = allArtStyles.find(s => 
        (savedStyleName && s.name.toLowerCase() === savedStyleName.toLowerCase()) || 
        (savedStylePrompt && s.token.toLowerCase().trim() === savedStylePrompt.toLowerCase().trim())
      );

      if (matchedStyle) {
        setSelectedArtStyleId(matchedStyle.id);
        setDetectedStyleName(matchedStyle.name);
        setIsNewCustomStyleDetected(false);
        const cat = matchedStyle.category || "3d";
        setSelectedStyleCategory(cat as any);
      } else {
        setIsNewCustomStyleDetected(true);
        setDetectedStyleName(savedStyleName);
        setNewStyleNameInput(savedStyleName);
        setNewStylePromptInput(savedStylePrompt);
      }
    } else {
      setIsNewCustomStyleDetected(false);
      setDetectedStyleName("");
    }

    setRootImageUrl(selectedAsset.rootImageUrl || "");
    const savedRootMediaId = selectedAsset.styleGuide?.rootMediaId || selectedAsset.styleGuide?.gflowMediaId || "";
    setRootMediaId(savedRootMediaId);
    setAliases(selectedAsset.styleGuide?.aliases || selectedAsset.aliases || "");

    // Load Variant Album
    fetchVariantGallery(selectedAsset.id);
  };

  const selectedEpisode = useMemo(() => {
    return episodesList.find(e => e.id === selectedEpisodeId) || null;
  }, [episodesList, selectedEpisodeId]);

  const loadEpisodesList = async (projId: string, targetEpId?: string) => {
    setIsLoadingEpisodes(true);
    try {
      const data = await fetchEpisodes(projId);
      setEpisodesList(data || []);
      if (data && data.length > 0) {
        const epToSelect = targetEpId || data[0].id;
        handleSelectEpisode(epToSelect, data);
      } else {
        setSelectedEpisodeId("");
        setScriptText("");
        setScenesList([]);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setIsLoadingEpisodes(false);
    }
  };

  const handleSelectEpisode = async (epId: string, customList?: any[]) => {
    setSelectedEpisodeId(epId);
    const list = customList || episodesList;
    const ep = list.find((e: any) => e.id === epId);
    if (ep) {
      setScriptText(ep.script || "");
      loadScenesList(epId);
    }
  };

  const loadScenesList = async (epId: string) => {
    setIsLoadingScenes(true);
    try {
      const data = await fetchScenes(epId);
      setScenesList(data || []);
    } catch (e) {
      console.error(e);
    } finally {
      setIsLoadingScenes(false);
    }
  };

  const handleSaveScript = async () => {
    if (!selectedEpisodeId) return;
    setIsSavingScript(true);
    try {
      const updated = await updateEpisode({ id: selectedEpisodeId, script: scriptText });
      setEpisodesList(prev => prev.map(ep => ep.id === selectedEpisodeId ? updated : ep));
      alert("🎉 Đã lưu kịch bản tập phim thành công!");
    } catch (e) {
      console.error(e);
      alert("Lỗi lưu kịch bản.");
    } finally {
      setIsSavingScript(false);
    }
  };

  const handleCreateEpisodeQuick = async (title: string, type: string) => {
    if (!selectedProjectId) return;
    try {
      const newEp = await createEpisode({
        projectId: selectedProjectId,
        universeId: selectedProjectId,
        title,
        episodeType: type,
        script: ""
      });
      setEpisodesList(prev => [...prev, newEp]);
      handleSelectEpisode(newEp.id, [...episodesList, newEp]);
    } catch (e) {
      console.error(e);
    }
  };

  const handleDeleteEpisode = async (id: string) => {
    try {
      await deleteEpisode(id);
      const remaining = episodesList.filter(ep => ep.id !== id);
      setEpisodesList(remaining);
      if (selectedEpisodeId === id) {
        if (remaining.length > 0) {
          handleSelectEpisode(remaining[0].id, remaining);
        } else {
          setSelectedEpisodeId("");
          setScenesList([]);
        }
      }
    } catch (e: any) {
      console.error(e);
      alert("Lỗi khi xóa tập phim: " + e.message);
    }
  };

  // Sync / Save Brief & Master Prompt to DB
  const handleSyncToAssetDb = async (overrideData?: {
    brief?: string;
    masterDesignPrompt?: string;
    coreIdentityTraits?: string;
    stylePrompt?: string;
    visualStyle?: string;
    composition?: string;
    attitude?: string;
    colors?: string;
    lighting?: string;
    camera?: string;
    detectedStyleName?: string;
    aliases?: string;
  }) => {
    if (!selectedAssetId) return;
    setIsSavingToDb(true);
    try {
      const dbPayload = {
        brief: overrideData?.brief !== undefined ? overrideData.brief : brief,
        masterDesignPrompt: overrideData?.masterDesignPrompt !== undefined ? overrideData.masterDesignPrompt : masterDesignPrompt,
        coreIdentityTraits: overrideData?.coreIdentityTraits !== undefined ? overrideData.coreIdentityTraits : coreIdentityTraits,
        stylePrompt: overrideData?.stylePrompt !== undefined ? overrideData.stylePrompt : stylePrompt,
        visualStyle: overrideData?.visualStyle !== undefined ? overrideData.visualStyle : visualStyle,
        composition: overrideData?.composition !== undefined ? overrideData.composition : composition,
        attitude: overrideData?.attitude !== undefined ? overrideData.attitude : attitude,
        colors: overrideData?.colors !== undefined ? overrideData.colors : colors,
        lighting: overrideData?.lighting !== undefined ? overrideData.lighting : lighting,
        camera: overrideData?.camera !== undefined ? overrideData.camera : camera
      };
      
      const payloadString = JSON.stringify(dbPayload);
      
      const currentAsset = dbAssetsList.find(a => a.id === selectedAssetId);
      const styleGuideObj = currentAsset?.styleGuide || {};
      
      const targetStyleName = overrideData?.detectedStyleName !== undefined ? overrideData.detectedStyleName : (detectedStyleName || styleGuideObj.styleName);
      const targetStylePrompt = overrideData?.stylePrompt !== undefined ? overrideData.stylePrompt : (stylePrompt || styleGuideObj.stylePrompt);
      const targetAliases = overrideData?.aliases !== undefined ? overrideData.aliases : aliases;

      const nextStyleGuide = {
        ...styleGuideObj,
        styleName: targetStyleName,
        stylePrompt: targetStylePrompt,
        rootMediaId: rootMediaId || styleGuideObj.rootMediaId,
        gflowMediaId: rootMediaId || styleGuideObj.gflowMediaId || styleGuideObj.rootMediaId,
        aliases: targetAliases
      };

      const updated = await updateCharacter(selectedAssetId, {
        name: currentAsset?.name,
        slug: currentAsset?.slug,
        description: payloadString,
        rootImageUrl,
        ...({ styleGuide: nextStyleGuide } as any)
      });

      setDbAssetsList(prev => prev.map(a => a.id === selectedAssetId ? updated : a));
      alert("🎉 Đã đồng bộ Master Prompt, DNA & Media ID vào Database thành công!");
    } catch (err) {
      console.error(err);
      alert("Thất bại khi đồng bộ dữ liệu về Database.");
    } finally {
      setIsSavingToDb(false);
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
    } catch (e) {
      console.error("Failed to load storyboard assets:", e);
    } finally {
      setIsLoadingStoryboardAssets(false);
    }
  };

  useEffect(() => {
    if (selectedEpisodeId) {
      loadStoryboardAssets(selectedEpisodeId);
    } else {
      setStoryboardAssets([]);
    }
  }, [selectedEpisodeId]);

  // Init loads
  useEffect(() => {
    loadProjectsList();
    
    const loadVidtorySettingsAndModels = async () => {
      try {
        const settings = await fetchSettings().catch(() => ({}));
        const currentGatewayType = settings.gatewayType || "hub";
        setGatewayType(currentGatewayType);
        if (settings?.universalNegativePrompt) {
          setUniversalNegativePrompt(settings.universalNegativePrompt);
        }
        
        const models = await fetchVidtoryModels().catch(() => []);
        setVidtoryModels(models || []);
        
        if (models && models.length > 0) {
          const imgModel = models.find((m: any) => m.type === 'image');
          if (imgModel) setSelectedImageModel(imgModel.id);
          
          const txtModel = models.find((m: any) => m.type === 'prompt');
          if (txtModel) setSelectedPromptModel(txtModel.id);
          
          const vidModel = models.find((m: any) => m.type === 'video');
          if (vidModel) setSelectedVideoModel(vidModel.id);
        }
      } catch (e) {
        console.warn("Failed to load Vidtory models:", e);
      }
    };
    loadVidtorySettingsAndModels();
  }, []);

  const loadDbAssets = async (projectId?: string) => {
    setIsLoadingAssets(true);
    try {
      const data = await fetchCharacters(projectId || undefined);
      setDbAssetsList(data || []);
    } catch (e) {
      console.error(e);
    } finally {
      setIsLoadingAssets(false);
    }
  };

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

  const loadProjectsList = async () => {
    try {
      const data = await fetchProjects();
      setProjectsList(data || []);
      
      const query = new URLSearchParams(window.location.search);
      const qProjId = query.get("projectId");
      const qAssetId = query.get("assetId");

      if (data && data.length > 0) {
        const nextId = qProjId || data[0].id;
        setSelectedProjectId(nextId);
        setProjectStyleUrl(data[0].masterStyleUrl || "");
        setProjectStylePrompt(data[0].stylePrompt || "");
        
        const assets = await fetchCharacters(nextId).catch(() => []);
        setDbAssetsList(assets || []);
        
        await loadEpisodesList(nextId);
        
        if (qAssetId && assets.length > 0) {
          const targetAsset = assets.find((a: any) => a.id === qAssetId);
          if (targetAsset) {
            setSelectedAssetId(qAssetId);
            setAssetType(targetAsset.entityType || "character");
            applySelectedAssetDetails(targetAsset);
          }
        }
      }
    } catch (e) {
      console.error(e);
    }
  };

  // Sync selection when query params change
  useEffect(() => {
    if (dbAssetsList.length > 0 && selectedProjectId) {
      const query = new URLSearchParams(window.location.search);
      const qAssetId = query.get("assetId");
      
      if (qAssetId && qAssetId !== selectedAssetId) {
        const targetAsset = dbAssetsList.find(a => a.id === qAssetId);
        if (targetAsset) {
          setSelectedAssetId(qAssetId);
          setAssetType(targetAsset.entityType || "character");
          applySelectedAssetDetails(targetAsset);
        }
      }
    }
  }, [dbAssetsList, selectedProjectId]);

  const handleUniverseChange = (id: string) => {
    setSelectedProjectId(id);
    setSelectedAssetId("");
    applySelectedAssetDetails(null);
    setVariantImages([]);
    const p = projectsList.find(x => x.id === id);
    if (p) {
      setProjectStyleUrl(p.masterStyleUrl || "");
      setProjectStylePrompt(p.stylePrompt || "");
    }
    loadDbAssets(id);
    loadEpisodesList(id);
    updateUrlParams(id, "");
  };

  const handleSelectAssetFromDb = (assetId: string) => {
    setSelectedAssetId(assetId);
    const asset = dbAssetsList.find(a => a.id === assetId);
    if (asset) {
      applySelectedAssetDetails(asset);
    } else {
      applySelectedAssetDetails(null);
    }
    updateUrlParams(selectedProjectId, assetId);
  };

  const handleQuickCreateAsset = async () => {
    if (!quickCreateName.trim() || !selectedProjectId) return;
    setIsCreatingAsset(true);
    try {
      const slug = quickCreateName.toLowerCase().replace(/\s+/g, '-');
      const created = await createCharacter({
        name: quickCreateName.trim(),
        slug,
        projectId: selectedProjectId,
        universeId: selectedProjectId,
        entityType: assetType,
        description: "",
        rootImageUrl: ""
      });
      alert(`🎉 Đã khởi tạo nhanh Asset ${assetType.toUpperCase()} "${quickCreateName}"!`);
      setQuickCreateName("");
      setIsQuickCreateOpen(false);
      setDbAssetsList(prev => [...prev, created]);
      handleSelectAssetFromDb(created.id);
    } catch (e: any) {
      alert("Lỗi tạo nhanh: " + e.message);
    } finally {
      setIsCreatingAsset(false);
    }
  };

  const handleDeleteAsset = async (e: React.MouseEvent, assetId: string) => {
    e.stopPropagation();
    if (!window.confirm(`⚠️ Bạn có chắc chắn muốn xóa tài nguyên ${assetType.toUpperCase()} này khỏi Database?`)) return;
    try {
      await deleteCharacter(assetId);
      setDbAssetsList(prev => prev.filter(a => a.id !== assetId));
      if (selectedAssetId === assetId) {
        applySelectedAssetDetails(null);
        setSelectedAssetId("");
      }
    } catch (err: any) {
      alert("Xóa tài nguyên thất bại: " + err.message);
    }
  };

  const handleImageFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const base64 = await new Promise<string>((resolve) => {
        const r = new FileReader();
        r.onload = () => resolve(r.result as string);
        r.readAsDataURL(file);
      });
      const compressedBase64 = await compressImage(base64);
      
      const resBlob = await fetch(compressedBase64).then(r => r.blob());
      const compressedFile = new File([resBlob], file.name, { type: "image/jpeg" });
      
      const res = await uploadImage(compressedFile);
      setRootImageUrl(res.url);
      if (selectedAssetId) {
        const currentAsset = dbAssetsList.find(a => a.id === selectedAssetId);
        const styleGuideObj = currentAsset?.styleGuide || {};
        const updated = await updateCharacter(selectedAssetId, {
          name: currentAsset?.name,
          slug: currentAsset?.slug,
          rootImageUrl: res.url,
          ...({ styleGuide: styleGuideObj } as any)
        });
        setDbAssetsList(prev => prev.map(a => a.id === selectedAssetId ? updated : a));
      }
    } catch (err) {
      alert("Lỗi upload ảnh!");
    }
  };

  const handleAssetTypeSwitch = (type: "character" | "location" | "prop" | "style") => {
    setAssetType(type);
    setSelectedAssetId("");
    applySelectedAssetDetails(null);
    updateUrlParams(selectedProjectId, "");
  };

  const fetchVariantGallery = async (characterId: string) => {
    try {
      const res = await fetch(`${API_BASE_URL}/internal/v1/asset/world/characters/${characterId}/variants`);
      if (res.ok) {
        const list = await res.json();
        setVariantImages(list.map((item: any) => ({
          id: item.id,
          url: item.driveUrl || item.imageUrl,
          tags: item.tags || []
        })));
        if (list.length > 0) {
          setActiveVariantId(list[0].id);
        }
      }
    } catch (e) {
      console.warn("Failed to fetch variant images:", e);
    }
  };

  const handleGenerateImage = async () => {
    if (!prompt.trim() || !selectedAssetId) {
      alert("Vui lòng nhập prompt!");
      return;
    }
    setIsGeneratingImage(true);
    setGenState("sending");
    try {
      const params: any = {
        gridMode: generationGridMode,
        aspect_ratio: assetType === "location" ? "16:9" : "1:1",
        aspectRatio: assetType === "location" ? "16:9" : "1:1",
        model_id: selectedImageModel || undefined,
        provider: gatewayType === 'sdk' ? 'vidtory-sdk' : undefined
      };
      if (syncToUniverseStyle && activeProject?.stylePrompt) {
        params.stylePrompt = activeProject.stylePrompt;
      }
      
      const variantNegatives = "text, words, letters, font, watermark, signature, character sheet, multi-angle view, multi-view, split screen, collage, 2x2 panel, 3x3 panel, panel layout, grid, layout, multiple views";
      params.negative_prompt = activeProject?.negativePrompt 
        ? `${activeProject.negativePrompt}, ${universalNegativePrompt}, ${variantNegatives}`
        : `${universalNegativePrompt}, ${variantNegatives}`;
      
      const job = await generateAssetJob(selectedAssetId, prompt, params);
      setGenState("queued");
      
      let done = false;
      let count = 0;
      const jobId = job.data?.job_id || job.data?.id || job.id;
      
      while (!done && count < 100) {
        await new Promise(r => setTimeout(r, 2000));
        count++;
        let info;
        try {
          info = await fetchJobById(jobId);
        } catch (e) {
          continue;
        }
        const currentJob = info.data || info;
        
        if (currentJob.status === "processing") {
          setGenState("generating");
        } else if (currentJob.status === "done") {
          done = true;
          setGenState("done");
          alert("🎉 Đã sinh variant mới thành công!");
          fetchVariantGallery(selectedAssetId);
          setShowVariantGenModal(false);
        } else if (currentJob.status === "failed") {
          done = true;
          setGenState("failed");
          alert("Lỗi khi sinh ảnh: " + currentJob.errorMessage);
        }
      }
    } catch (err: any) {
      alert("Lỗi sinh variant: " + err.message);
    } finally {
      setIsGeneratingImage(false);
    }
  };

  const handleGenerateRootImage = async () => {
    if (!selectedAssetId) return;
    const currentAsset = dbAssetsList.find(a => a.id === selectedAssetId);
    if (!currentAsset) return;

    const promptSource = masterDesignPrompt?.trim() || brief?.trim() || currentAsset.name || "";
    if (!promptSource) {
      alert("Vui lòng nhập Mô tả / Character Bible hoặc Master Prompt trước khi sinh ảnh gốc!");
      return;
    }

    setIsGeneratingRootImage(true);
    try {
      const params: any = {
        gridMode: "1x1",
        aspect_ratio: assetType === "location" ? "16:9" : "1:1",
        aspectRatio: assetType === "location" ? "16:9" : "1:1",
        model_id: selectedImageModel || undefined,
        provider: gatewayType === 'sdk' ? 'vidtory-sdk' : undefined
      };
      
      if (syncToUniverseStyle && activeProject?.stylePrompt) {
        params.stylePrompt = activeProject.stylePrompt;
      }
      
      let negatives = "";
      if (assetType === "character") {
        negatives = "text, words, letters, font, watermark, signature, split screen, collage, 2x2 panel, 3x3 panel, panel layout, grid, layout, multiple views, distorted anatomy, bad hands";
      } else if (assetType === "location") {
        negatives = "text, words, letters, font, watermark, signature, character, people, human, person, character sheet, multi-angle view, multi-view, split screen, collage, 2x2 panel, 3x3 panel, panel layout, grid, layout, multiple views";
      } else {
        negatives = "text, words, letters, font, watermark, signature, character, people, human, person, character sheet, multi-angle view, multi-view, split screen, collage, 2x2 panel, 3x3 panel, panel layout, grid, layout, multiple views";
      }

      params.negative_prompt = activeProject?.negativePrompt 
        ? `${activeProject.negativePrompt}, ${universalNegativePrompt}, ${negatives}`
        : `${universalNegativePrompt}, ${negatives}`;

      let finalPrompt = promptSource;
      let styleStr = activeProject?.stylePrompt || "";
      if (stylePrompt && stylePrompt !== styleStr) {
        styleStr += ", " + stylePrompt;
      }
      if (styleStr) {
        finalPrompt += `, ${styleStr}`;
      }

      if (assetType === "character") {
        finalPrompt += ", character turnaround design sheet, showing front view, side view, and back view on a clean, solid white background";
      } else if (assetType === "location") {
        finalPrompt += ", single view, clean wide panorama establishing shot concept art, empty environment, no characters, no people";
      } else {
        finalPrompt += ", single view, isolated prop concept art on solid neutral background";
      }

      const job = await generateAssetJob(selectedAssetId, finalPrompt, params);
      
      let done = false;
      let count = 0;
      const jobId = job.data?.job_id || job.data?.id || job.id;
      
      while (!done && count < 100) {
        await new Promise(r => setTimeout(r, 2000));
        count++;
        let info;
        try {
          info = await fetchJobById(jobId);
        } catch (e) {
          continue;
        }
        const currentJob = info.data || info;
        
        if (currentJob.status === "done") {
          done = true;
          const genUrl = (currentJob.outputUrls && currentJob.outputUrls.length > 0)
            ? currentJob.outputUrls[0]
            : (currentJob.result?.url || currentJob.result?.imageUrl || currentJob.result?.image_url);
          if (genUrl) {
            setRootImageUrl(genUrl);
            
            const styleGuideObj = currentAsset.styleGuide || {};
            const updated = await updateCharacter(selectedAssetId, {
              name: currentAsset.name,
              slug: currentAsset.slug,
              rootImageUrl: genUrl,
              ...({ styleGuide: styleGuideObj } as any)
            });
            setDbAssetsList(prev => prev.map(a => a.id === selectedAssetId ? updated : a));
            
            alert("🎉 Đã sinh ảnh neo gốc thành công và lưu vào Database!");
          } else {
            alert("Không tìm thấy link ảnh neo gốc trả về từ kết quả sinh!");
          }
        } else if (currentJob.status === "failed") {
          done = true;
          alert("Lỗi khi sinh ảnh neo gốc: " + currentJob.errorMessage);
        }
      }
    } catch (err: any) {
      alert("Lỗi sinh ảnh neo gốc: " + err.message);
    } finally {
      setIsGeneratingRootImage(false);
    }
  };

  const handleSetVariantAsRoot = async (url: string) => {
    if (!selectedAssetId) return;
    const currentAsset = dbAssetsList.find(a => a.id === selectedAssetId);
    if (!currentAsset) return;

    if (!window.confirm("Bạn có chắc chắn muốn đặt ảnh biến thể này làm ảnh neo gốc?")) return;

    try {
      setRootImageUrl(url);
      
      const styleGuideObj = currentAsset.styleGuide || {};
      const updated = await updateCharacter(selectedAssetId, {
        name: currentAsset.name,
        slug: currentAsset.slug,
        rootImageUrl: url,
        ...({ styleGuide: styleGuideObj } as any)
      });
      setDbAssetsList(prev => prev.map(a => a.id === selectedAssetId ? updated : a));
      alert("🎉 Đã đặt ảnh biến thể làm ảnh neo gốc thành công!");
    } catch (err: any) {
      alert("Lỗi đặt ảnh neo gốc: " + err.message);
    }
  };

  const handleSelectManualVariantFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setManualVariantFile(file);
    }
  };

  const handleUploadManualVariant = async () => {
    if (!manualVariantFile || !selectedAssetId) {
      alert("Vui lòng chọn file ảnh!");
      return;
    }
    setIsUploadingManualVariant(true);
    try {
      const uploadRes = await uploadImage(manualVariantFile);
      const s3Url = uploadRes.url;
      const tagId = manualVariantTag.trim() || `manual_${Date.now()}`;
      const syncHeaders: any = { 'Content-Type': 'application/json' };
      { const hubKey = getHubApiKey(); if (hubKey) syncHeaders['Authorization'] = `Bearer ${hubKey}`; }

      const syncRes = await fetch(`${API_BASE_URL}/internal/v1/asset/world/orchestrator/sync-variant`, {
        method: 'POST',
        headers: syncHeaders,
        body: JSON.stringify({
          characterId: selectedAssetId,
          tagId: tagId,
          driveUrl: s3Url
        })
      });

      if (!syncRes.ok) {
        throw new Error("Lỗi lưu variant vào Database");
      }

      alert("🎉 Tải lên biến thể thủ công thành công!");
      setManualVariantFile(null);
      setManualVariantTag("");
      fetchVariantGallery(selectedAssetId);
      setShowVariantGenModal(false);
    } catch (err: any) {
      alert("Lỗi tải lên biến thể: " + err.message);
    } finally {
      setIsUploadingManualVariant(false);
    }
  };

  const handleSplitGrid = async (gridType: "2x1" | "3x1" | "4x1" | "2x2" | "3x3") => {
    const activeVar = variantImages.find(v => v.id === activeVariantId);
    if (!activeVar) return;
    setIsSplittingGrid(true);
    try {
      const img = new Image();
      img.crossOrigin = "anonymous";
      img.src = activeVar.url;

      await new Promise((resolve, reject) => {
        img.onload = resolve;
        img.onerror = reject;
      });

      let cols = 1;
      let rows = 1;
      if (gridType === "2x1") { cols = 1; rows = 2; }
      else if (gridType === "3x1") { cols = 1; rows = 3; }
      else if (gridType === "4x1") { cols = 1; rows = 4; }
      else if (gridType === "2x2") { cols = 2; rows = 2; }
      else if (gridType === "3x3") { cols = 3; rows = 3; }

      const singleW = img.width / cols;
      const singleH = img.height / rows;

      const cropPromises: Promise<{ r: number; c: number; blob: Blob }>[] = [];

      for (let r = 0; r < rows; r++) {
        for (let c = 0; c < cols; c++) {
          const tempCanvas = document.createElement("canvas");
          tempCanvas.width = singleW;
          tempCanvas.height = singleH;
          const tempCtx = tempCanvas.getContext("2d");
          if (!tempCtx) throw new Error("Could not construct 2D context");

          tempCtx.drawImage(
            img,
            c * singleW, r * singleH, singleW, singleH,
            0, 0, singleW, singleH
          );

          const cropPromise = new Promise<{ r: number; c: number; blob: Blob }>((resolve, reject) => {
            tempCanvas.toBlob((blob) => {
              if (blob) {
                resolve({ r, c, blob });
              } else {
                reject(new Error(`Failed to extract grid crop at row ${r}, col ${c}`));
              }
            }, "image/jpeg", 0.85);
          });
          cropPromises.push(cropPromise);
        }
      }

      const crops = await Promise.all(cropPromises);

      const syncHeaders: any = { 'Content-Type': 'application/json' };
      { const hubKey = getHubApiKey(); if (hubKey) syncHeaders['Authorization'] = `Bearer ${hubKey}`; }

      const uploadAndSyncPromises = crops.map(async ({ r, c, blob }) => {
        const fileToUpload = new File([blob], `crop_${r}_${c}_${Date.now()}.jpg`, { type: "image/jpeg" });
        const uploadRes = await uploadImage(fileToUpload);
        const s3Url = uploadRes.url;

        const syncRes = await fetch(`${API_BASE_URL}/internal/v1/asset/world/orchestrator/sync-variant`, {
          method: 'POST',
          headers: syncHeaders,
          body: JSON.stringify({
            characterId: selectedAssetId,
            tagId: `VAR_CROP_${gridType}_${r}_${c}_${Date.now()}`,
            driveUrl: s3Url
          })
        });

        if (!syncRes.ok) {
          throw new Error(`Failed to sync variant at row ${r}, col ${c}`);
        }
      });

      await Promise.all(uploadAndSyncPromises);

      alert(`Đã cắt ảnh Grid thành công thành ${crops.length} ảnh biến thể đơn lẻ và lưu vào Album!`);
      fetchVariantGallery(selectedAssetId);
    } catch (err: any) {
      alert("Lỗi cắt Grid, hãy chắc chắn ảnh cho phép Cross-Origin!");
    } finally {
      setIsSplittingGrid(false);
    }
  };

  const [generatingSceneId, setGeneratingSceneId] = useState<string | null>(null);

  const handleGenerateSceneImage = async (scn: any) => {
    if (!scn.prompt && !scn.description) {
      alert("Phân cảnh chưa có prompt hoặc mô tả để sinh ảnh!");
      return;
    }
    setGeneratingSceneId(scn.id);
    try {
      const targetPrompt = scn.prompt || scn.description;
      const job = await generateAssetJob(scn.id, targetPrompt, { 
        entityType: 'scene', 
        gridMode: '1x1',
        stylePrompt: activeProject?.stylePrompt || "",
        negative_prompt: activeProject?.negativePrompt 
          ? `${activeProject.negativePrompt}, ${universalNegativePrompt}`
          : universalNegativePrompt,
        model_id: selectedImageModel || undefined,
        provider: gatewayType === 'sdk' ? 'vidtory-sdk' : undefined
      });
      
      let done = false;
      let count = 0;
      const jobId = job.data?.job_id || job.data?.id || job.id;
      
      while (!done && count < 100) {
        await new Promise(r => setTimeout(r, 2000));
        count++;
        let info;
        try {
          info = await fetchJobById(jobId);
        } catch (e) {
          continue;
        }
        const currentJob = info.data || info;
        
        if (currentJob.status === "done") {
          done = true;
          const genUrl = (currentJob.outputUrls && currentJob.outputUrls.length > 0)
            ? currentJob.outputUrls[0]
            : (currentJob.result?.url || currentJob.result?.imageUrl || currentJob.result?.image_url);
          if (genUrl) {
            const updated = await updateScene({ id: scn.id, imageUrl: genUrl });
            setScenesList(prev => prev.map(s => s.id === scn.id ? updated : s));
            loadStoryboardAssets(selectedEpisodeId);
            alert("🎉 Đã sinh ảnh Storyboard thành công!");
          } else {
            alert("Không tìm thấy link ảnh trả về từ kết quả sinh!");
          }
        } else if (currentJob.status === "failed") {
          done = true;
          alert("Lỗi khi sinh ảnh Scene: " + currentJob.errorMessage);
        }
      }
    } catch (err: any) {
      alert("Lỗi sinh ảnh Scene: " + err.message);
    } finally {
      setGeneratingSceneId(null);
    }
  };

  const handleRunXRay = async () => {
    if (!rootImageUrl) {
      alert("Vui lòng tải ảnh neo gốc lên trước!");
      return;
    }
    if (!selectedAssetId) {
      alert("Vui lòng chọn hoặc tạo nhanh một Asset!");
      return;
    }

    setIsAnalyzing(true);
    setTunnelLogs([]);
    setShowTunnelTerminal(true);

    try {
      setTunnelLogs(prev => [...prev, '[System] Khởi động động cơ phân tích Style DNA của Google Flow...']);
      setTunnelLogs(prev => [...prev, '[System] Đang trích xuất thông tin cốt lõi (Wardrobe & Psychology) của nhân vật...']);
      
      const feedbackRes = await getXRayFeedback(rootImageUrl, brief, undefined, assetType, selectedPromptModel).catch(() => {
        return { wardrobe: "", psychology: "", suggestedStyleName: "" };
      });

      const promptExtracted = feedbackRes.wardrobe || "";
      const traitsExtracted = feedbackRes.psychology || "";
      
      if (promptExtracted) {
        setMasterDesignPrompt(promptExtracted);
      }
      if (traitsExtracted) {
        setCoreIdentityTraits(traitsExtracted);
      }

      setTunnelLogs(prev => [...prev, '[Extension] Đang kết nối & kiểm tra GFlow Extension để lấy OAuth Token...']);
      const extensionToken = await getGFlowToken();

      if (extensionToken) {
        setTunnelLogs(prev => [...prev, '[Extension] Đã lấy thành công Google Labs OAuth Token đang hoạt động.']);
        setTunnelLogs(prev => [...prev, '[Secure Tunnel] Thiết lập cổng kết nối bảo mật qua Google Labs...']);
      } else {
        setTunnelLogs(prev => [...prev, '[Extension] Không tìm thấy Extension hoặc chưa đăng nhập. Sử dụng luồng Direct API...']);
        setTunnelLogs(prev => [...prev, '[Core LLM] Kích hoạt phân tích trực tiếp qua Google Labs Ultra (via Hub)...']);
      }
      
      const analyzeRes = await fetch('/api/xray/har-analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          imageUrl: rootImageUrl,
          brief: brief,
          assetType: assetType,
          accessToken: extensionToken,
          model: selectedPromptModel || undefined
        })
      });

      if (!analyzeRes.ok) {
        let errorMsg = "Phân tích qua Core LLM thất bại";
        try {
          const errData = await analyzeRes.json();
          errorMsg = errData.error || errData.message || errorMsg;
        } catch (e) {}
        throw new Error(errorMsg);
      }

      const analyzeData = await analyzeRes.json();
      if (!analyzeData.success) throw new Error(analyzeData.error || "Phân tích thất bại");

      const stylePromptResult = analyzeData.stylePrompt || "";
      
      if (analyzeData.logs && Array.isArray(analyzeData.logs)) {
        for (const logItem of analyzeData.logs) {
          setTunnelLogs(prev => {
            if (prev.includes(logItem)) return prev;
            return [...prev, logItem];
          });
          await new Promise(r => setTimeout(r, 150));
        }
      }

      let parsedVisualStyle = "";
      let parsedComposition = "";
      let parsedAttitude = "";
      let parsedColors = "";
      let parsedLighting = "";
      let parsedCamera = "";

      let computedStylePrompt = "";
      if (stylePromptResult) {
        const parsed = parseStyleSummary(stylePromptResult);
        parsedVisualStyle = parsed.visualStyle;
        parsedComposition = parsed.composition;
        parsedAttitude = parsed.attitude;
        parsedColors = parsed.colors;
        parsedLighting = parsed.lighting;
        parsedCamera = parsed.camera;

        setVisualStyle(parsed.visualStyle);
        setComposition(parsed.composition);
        setAttitude(parsed.attitude);
        setColors(parsed.colors);
        setLighting(parsed.lighting);
        setCamera(parsed.camera);
        computedStylePrompt = `${parsed.visualStyle ? parsed.visualStyle + ", " : ""}${parsed.colors ? parsed.colors + ", " : ""}${parsed.lighting ? parsed.lighting : ""}`;
      } else {
        computedStylePrompt = `${promptExtracted.substring(0, 150)}... fine art render, volumetric lighting`;
      }
      
      setStylePrompt(computedStylePrompt);
      setHasAnalyzed(true);
      const styleNameResult = feedbackRes.suggestedStyleName || detectedStyleName;
      if (feedbackRes.suggestedStyleName) {
        setDetectedStyleName(feedbackRes.suggestedStyleName);
      }

      await new Promise(resolve => setTimeout(resolve, 800));
      setShowTunnelTerminal(false);
      
      await handleSyncToAssetDb({
        brief,
        masterDesignPrompt: promptExtracted || masterDesignPrompt,
        coreIdentityTraits: traitsExtracted || coreIdentityTraits,
        stylePrompt: computedStylePrompt,
        visualStyle: parsedVisualStyle,
        composition: parsedComposition,
        attitude: parsedAttitude,
        colors: parsedColors,
        lighting: parsedLighting,
        camera: parsedCamera,
        detectedStyleName: styleNameResult
      });
    } catch (err: any) {
      console.error("X-Ray scan error:", err);
      setTunnelLogs(prev => [
        ...prev,
        `❌ [Lỗi] Quá trình quét X-Ray thất bại: ${err.message}`,
        `💡 [Hướng dẫn kiểm tra]:`,
        `  1. Với luồng Extension: Hãy cài đặt & bật GFlow Extension, ghim extension và Đăng nhập tài khoản Google Labs.`,
        `  2. Với luồng Direct API: Hãy đảm bảo Hub Gateway (Cổng 5100) hoặc Backend Core API đang chạy.`,
        `  3. Kiểm tra mạng internet, cấu hình VPN hoặc xem chi tiết logs tại tab Network DevTools.`
      ]);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleAddNewArtStyle = () => {
    if (!newStyleNameInput.trim() || !newStylePromptInput.trim()) return;
    const newId = `custom_style_${Date.now()}`;
    const newStyle = {
      id: newId,
      name: newStyleNameInput.trim(),
      token: newStylePromptInput.trim(),
      category: selectedStyleCategory
    };
    const nextStyles = [...customArtStyles, newStyle];
    setCustomArtStyles(nextStyles);
    localStorage.setItem("storymee_custom_art_styles", JSON.stringify(nextStyles));
    setSelectedArtStyleId(newId);
    setDetectedStyleName(newStyle.name);
    setIsNewCustomStyleDetected(false);
    alert("🎨 Đã đăng ký phong cách mới vào Thư viện Style thành công!");
  };

  const handleAnalyzeProjectStyle = async () => {
    if (!projectStyleUrl) return;
    setIsAnalyzingProjectStyle(true);
    try {
      const res = await analyzeStyle(projectStyleUrl);
      setProjectStylePrompt(res.stylePrompt);
      alert("🎨 Phân tích style dự án thành công!");
    } catch (e: any) {
      alert("Lỗi: " + e.message);
    } finally {
      setIsAnalyzingProjectStyle(false);
    }
  };

  const handleSaveProjectStyle = async () => {
    if (!selectedProjectId) return;
    setIsSavingProject(true);
    try {
      await updateProject(selectedProjectId, {
        masterStyleUrl: projectStyleUrl,
        stylePrompt: projectStylePrompt
      });
      alert("Đã lưu Master Style dự án thành công!");
    } catch (e) {
      alert("Lỗi khi lưu!");
    } finally {
      setIsSavingProject(false);
    }
  };

  const handleCreateUniverseQuick = async () => {
    if (!newProjectName.trim()) return;
    try {
      const created = await createProject({ name: newProjectName.trim() });
      setProjectsList(prev => [...prev, created]);
      setSelectedProjectId(created.id);
      setIsCreatingProject(false);
      setNewProjectName("");
      alert("Đã tạo dự án mới!");
      loadEpisodesList(created.id);
    } catch (e) {
      alert("Lỗi khi tạo!");
    }
  };

  const handleUpdateUniverse = async (id: string, payload: any) => {
    try {
      const res = await updateProject(id, payload);
      setProjectsList(prev => prev.map(p => p.id === id ? { ...p, ...res } : p));
    } catch (e) {
      console.error(e);
    }
  };

  const handleTagToggle = (tagId: string) => {
    const updated = selectedTags.includes(tagId)
      ? selectedTags.filter(t => t !== tagId)
      : [...selectedTags, tagId];
    setSelectedTags(updated);
  };

  // Auto-tagging based on custom context input
  useEffect(() => {
    if (!customContext.trim()) return;
    const lower = customContext.toLowerCase();
    
    const keywordMap: Record<string, string[]> = {
      emo_hap: ["happy", "vui vẻ", "vui sướng"],
      emo_smi: ["smile", "mỉm cười", "cười nhẹ"],
      emo_lau: ["laugh", "cười lớn", "cười ha ha", "cười to"],
      emo_sad: ["sad", "buồn", "somber", "ủ rũ"],
      emo_ang: ["angry", "giận", "tức giận", "đập bàn", "phẫn nộ"],
      emo_det: ["determined", "quyết tâm", "kiên định"],
      emo_smk: ["smirk", "nham hiểm", "cười đểu", "ranh mãnh"],
      emo_cry: ["cry", "khóc", "lệ"],
      emo_shk: ["shock", "sốc", "kinh ngạc", "bàng hoàng"],
      emo_sur: ["surprise", "ngạc nhiên"],
      emo_cnf: ["confuse", "bối rối", "phân vân"],
      
      act_run: ["run", "chạy", "đuổi theo"],
      act_wlk: ["walk", "đi bộ", "dạo"],
      act_cmbt: ["combat", "đánh nhau", "chiến đấu", "martial arts", "stance"],
      act_cast: ["cast", "phép", "magic", "niệm chú"],
      act_fly: ["fly", "bay"],
      act_slp: ["sleep", "ngủ"],
      act_sit: ["sit", "ngồi"],
      act_jmp: ["jump", "nhảy"],
      
      cam_ecu: ["extreme close-up", "cận cảnh mặt"],
      cam_cu: ["close-up", "cận cảnh", "portrait", "chân dung"],
      cam_med: ["medium shot", "bán thân"],
      cam_fb: ["full body", "toàn thân", "toe to head"],
      cam_wid: ["wide angle", "góc rộng", "scenic"],
      cam_low: ["low angle", "góc thấp", "dưới lên"],
      cam_high: ["high angle", "góc cao", "trên xuống"]
    };

    const newTags = [...selectedTags];
    let changed = false;

    Object.entries(keywordMap).forEach(([tagId, keywords]) => {
      const matches = keywords.some(keyword => lower.includes(keyword));
      if (matches && !newTags.includes(tagId)) {
        newTags.push(tagId);
        changed = true;
      }
    });

    dbCustomTags.forEach(tag => {
      const tagLabelLower = tag.label?.toLowerCase();
      if (tagLabelLower && lower.includes(tagLabelLower) && !newTags.includes(tag.id)) {
        newTags.push(tag.id);
        changed = true;
      }
    });

    if (changed) {
      setSelectedTags(newTags);
    }
  }, [customContext, dbCustomTags]);

  // Compile variant generator dynamic prompt preview
  useEffect(() => {
    let styleStr = activeProject?.stylePrompt || "";
    if (stylePrompt && stylePrompt !== styleStr) styleStr += ", " + stylePrompt;
    
    const tagsStr = selectedTags.map(t => {
      const c = [
        ...CHARACTER_TAGS.emotion, 
        ...CHARACTER_TAGS.action, 
        ...CHARACTER_TAGS.camera, 
        ...LOCATION_TAGS.camera, 
        ...PROP_TAGS.perspective,
        ...dbCustomTags
      ].find(x => x.id === t);
      return c ? c.label : "";
    }).filter(Boolean).join(", ");

    let corePrompt = masterDesignPrompt || brief;
    
    if (corePrompt) {
      const forbiddenTerms = [
        /character turnaround/gi,
        /turnaround sheet/gi,
        /turnaround/gi,
        /model sheet/gi,
        /character sheet/gi,
        /multiple views/gi,
        /multi-view/gi,
        /orthographic/gi,
        /front, side, back/gi,
        /front view, side view, back view/gi,
        /turnaround appeal/gi
      ];
      for (const term of forbiddenTerms) {
        corePrompt = corePrompt.replace(term, "");
      }
      corePrompt = corePrompt.replace(/\s*,\s*,/g, ",").replace(/,\s*,/g, ",").trim();
    }

    let finalPrompt = corePrompt;
    if (customContext.trim()) finalPrompt += `, ${customContext.trim()}`;
    if (tagsStr) finalPrompt += `, ${tagsStr}`;
    if (styleStr) finalPrompt += `, ${styleStr}`;

    if (generationGridMode === "2x1") {
      finalPrompt += ", 2x1 panel vertical grid layout, 2 panorama views stacked vertically, split screen, 2 panels, clean layout, no text labels";
    } else if (generationGridMode === "3x1") {
      finalPrompt += ", 3x1 panel vertical grid layout, 3 panorama views stacked vertically, split screen, 3 panels, clean layout, no text labels";
    } else if (generationGridMode === "4x1") {
      finalPrompt += ", 4x1 panel vertical grid layout, 4 panorama views stacked vertically, split screen, 4 panels, clean layout, no text labels";
    } else if (generationGridMode === "2x2") {
      finalPrompt += ", 2x2 panel grid layout, split screen, 4 panels, clean layout, no text labels";
    } else if (generationGridMode === "3x3") {
      finalPrompt += ", 3x3 panel grid layout, split screen, 9 panels, clean layout, no text labels";
    } else {
      finalPrompt += ", single view, single character portrait shot, one single character pose, no character sheet, no split screen, no grids";
    }

    setPrompt(finalPrompt);
  }, [selectedTags, customContext, masterDesignPrompt, brief, stylePrompt, activeProject, generationGridMode, dbCustomTags]);

  useEffect(() => {
    if (assetType === "character" && generationGridMode !== "1x1") {
      setGenerationGridMode("1x1");
    }
  }, [assetType, generationGridMode]);

  const activeSelectedVariant = useMemo(() => {
    return variantImages.find(v => v.id === activeVariantId) || null;
  }, [variantImages, activeVariantId]);

  const handleSelectAssetGridClick = (asset: any) => {
    setAssetType(asset.entityType || "character");
    handleSelectAssetFromDb(asset.id);
    
    const el = document.getElementById("asset-designer-section");
    if (el) el.scrollIntoView({ behavior: "smooth" });
  };

  const handleOpenSceneModal = (scene: any = null) => {
    if (scene) {
      setEditingSceneId(scene.id);
      setSceneTitle(scene.title);
      setSceneDesc(scene.description || "");
      setScenePrompt(scene.prompt || "");
      setSceneImageUrl(scene.imageUrl || "");
    } else {
      setEditingSceneId(null);
      setSceneTitle("");
      setSceneDesc("");
      setScenePrompt("");
      setSceneImageUrl("");
    }
    setShowSceneModal(true);
  };

  const handleSaveScene = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedEpisodeId || !sceneTitle.trim()) return;
    try {
      if (editingSceneId) {
        const updated = await updateScene({
          id: editingSceneId,
          title: sceneTitle,
          description: sceneDesc,
          prompt: scenePrompt,
          imageUrl: sceneImageUrl
        });
        setScenesList(scenesList.map(s => s.id === editingSceneId ? updated : s));
      } else {
        const created = await createScene({
          episodeId: selectedEpisodeId,
          title: sceneTitle,
          description: sceneDesc,
          prompt: scenePrompt,
          imageUrl: sceneImageUrl
        });
        setScenesList([...scenesList, created]);
      }
      setShowSceneModal(false);
    } catch (err) {
      console.error(err);
    }
  };

  const handleDeleteScn = async (id: string) => {
    if (!window.confirm("Sếp có muốn xóa phân cảnh này không?")) return;
    try {
      await deleteScene(id);
      setScenesList(scenesList.filter(s => s.id !== id));
    } catch (e) {
      console.error(e);
    }
  };

  const handleSceneImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setIsSceneUploading(true);
    try {
      const res = await uploadImage(file);
      setSceneImageUrl(res.url);
    } catch (err) {
      console.error(err);
    } finally {
      setIsSceneUploading(false);
    }
  };

  return {
    universalNegativePrompt, setUniversalNegativePrompt,
    assetType, setAssetType,
    dbAssetsList, setDbAssetsList,
    selectedAssetId, setSelectedAssetId,
    isLoadingAssets, setIsLoadingAssets,
    quickCreateName, setQuickCreateName,
    isCreatingAsset, setIsCreatingAsset,
    isSavingToDb, setIsSavingToDb,
    episodesList, setEpisodesList,
    selectedEpisodeId, setSelectedEpisodeId,
    isLoadingEpisodes, setIsLoadingEpisodes,
    scriptText, setScriptText,
    isSavingScript, setIsSavingScript,
    scenesList, setScenesList,
    selectedSceneId, setSelectedSceneId,
    isLoadingScenes, setIsLoadingScenes,
    storyboardAssets, setStoryboardAssets,
    isLoadingStoryboardAssets, setIsLoadingStoryboardAssets,
    selectedStoryboardAsset, setSelectedStoryboardAsset,
    showSceneModal, setShowSceneModal,
    sceneTitle, setSceneTitle,
    sceneDesc, setSceneDesc,
    scenePrompt, setScenePrompt,
    sceneImageUrl, setSceneImageUrl,
    editingSceneId, setEditingSceneId,
    isSceneUploading, setIsSceneUploading,
    customArtStyles, setCustomArtStyles,
    newStyleNameInput, setNewStyleNameInput,
    newStylePromptInput, setNewStylePromptInput,
    showVariantGenModal, setShowVariantGenModal,
    variantImages, setVariantImages,
    activeVariantId, setActiveVariantId,
    generationGridMode, setGenerationGridMode,
    isSplittingGrid, setIsSplittingGrid,
    selectedStyleCategory, setSelectedStyleCategory,
    selectedArtStyleId, setSelectedArtStyleId,
    detectedStyleName, setDetectedStyleName,
    isNewCustomStyleDetected, setIsNewCustomStyleDetected,
    brief, setBrief,
    vidtoryModels, setVidtoryModels,
    selectedImageModel, setSelectedImageModel,
    selectedPromptModel, setSelectedPromptModel,
    selectedVideoModel, setSelectedVideoModel,
    gatewayType, setGatewayType,
    rootImageUrl, setRootImageUrl,
    isAnalyzing, setIsAnalyzing,
    masterDesignPrompt, setMasterDesignPrompt,
    coreIdentityTraits, setCoreIdentityTraits,
    stylePrompt, setStylePrompt,
    hasAnalyzed, setHasAnalyzed,
    visualStyle, setVisualStyle,
    composition, setComposition,
    attitude, setAttitude,
    colors, setColors,
    lighting, setLighting,
    camera, setCamera,
    selectedTags, setSelectedTags,
    customContext, setCustomContext,
    prompt, setPrompt,
    isGeneratingImage, setIsGeneratingImage,
    isGeneratingRootImage, setIsGeneratingRootImage,
    genState, setGenState,
    variantConsoleTab, setVariantConsoleTab,
    manualVariantFile, setManualVariantFile,
    manualVariantTag, setManualVariantTag,
    isUploadingManualVariant, setIsUploadingManualVariant,
    activeTab, setActiveTab,
    syncToUniverseStyle, setSyncToUniverseStyle,
    isAdvancedTagsOpen, setIsAdvancedTagsOpen,
    rootMediaId, setRootMediaId,
    aliases, setAliases,
    tunnelLogs, setTunnelLogs,
    showTunnelTerminal, setShowTunnelTerminal,
    dbCustomTags, setDbCustomTags,
    zoomImageUrl, setZoomImageUrl,
    isQuickCreateOpen, setIsQuickCreateOpen,
    projectsList, setProjectsList,
    selectedProjectId, setSelectedProjectId,
    projectStyleUrl, setProjectStyleUrl,
    projectStylePrompt, setProjectStylePrompt,
    isAnalyzingProjectStyle, setIsAnalyzingProjectStyle,
    isSavingProject, setIsSavingProject,
    isCreatingProject, setIsCreatingProject,
    newProjectName, setNewProjectName,
    activeProject,
    fileInputRef, variantFileInputRef,
    renderBoldText,
    handleUniverseChange,
    handleSelectAssetFromDb,
    handleQuickCreateAsset,
    handleDeleteAsset,
    handleImageFileChange,
    handleAssetTypeSwitch,
    fetchVariantGallery,
    handleGenerateImage,
    handleGenerateRootImage,
    handleSetVariantAsRoot,
    handleSelectManualVariantFile,
    handleUploadManualVariant,
    handleSplitGrid,
    handleGenerateSceneImage,
    generatingSceneId, setGeneratingSceneId,
    handleRunXRay,
    handleAddNewArtStyle,
    handleAnalyzeProjectStyle,
    handleSaveProjectStyle,
    handleCreateUniverseQuick,
    handleUpdateUniverse,
    handleTagToggle,
    handleOpenSceneModal,
    handleSaveScene,
    handleDeleteScn,
    handleSceneImageUpload,
    handleSelectEpisode,
    handleCreateEpisodeQuick,
    handleDeleteEpisode,
    handleSaveScript,
    handleSyncToAssetDb,
    updateAsset,
    deleteAsset,
    loadEpisodesList,
    loadStoryboardAssets,
    loadDbAssets,
    loadScenesList,
    selectedEpisode,
    filteredDbAssetsList,
    activeSelectedVariant,
    handleSelectAssetGridClick
  };
}
