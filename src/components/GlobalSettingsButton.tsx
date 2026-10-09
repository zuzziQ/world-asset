"use client";

import React, { useState, useEffect } from "react";
import { Settings, X, Check, Loader2, Globe, Key, HelpCircle, Cpu, Film, ImageIcon, RefreshCw, Sliders } from "lucide-react";
import { fetchSettings, updateSettings } from "@/lib/api";

export default function GlobalSettingsButton() {
  const [show, setShow] = useState(false);

  // Global Settings properties
  const [universalNegativePrompt, setUniversalNegativePrompt] = useState("");
  const [hubUrl, setHubUrl] = useState("");
  const [hubApiKey, setHubApiKey] = useState("");
  const [sdkUrl, setSdkUrl] = useState("");
  const [sdkApiKey, setSdkApiKey] = useState("");
  const [geminiApiKey, setGeminiApiKey] = useState("");
  const [activeProvider, setActiveProvider] = useState<"hub" | "sdk" | "google-native">("hub");
  
  // Connection Mode overrides
  const [hubConnectionMode, setHubConnectionMode] = useState<"production" | "development">("production");
  const [localIp, setLocalIp] = useState("192.168.1.10");
  const [customApiUrl, setCustomApiUrl] = useState("");

  // Decoupled provider state variables
  const [llmProvider, setLlmProvider] = useState<"hub" | "sdk" | "google-native">("hub");
  const [imageProvider, setImageProvider] = useState<"hub" | "sdk" | "google-native" | "dreamina">("hub");
  const [videoProvider, setVideoProvider] = useState<"hub" | "sdk" | "google-native" | "dreamina">("hub");

  // Model settings per provider
  const [hubLlmModel, setHubLlmModel] = useState("cliproxy-gpt");
  const [hubImageModel, setHubImageModel] = useState("auto");
  const [hubVideoModel, setHubVideoModel] = useState("auto");
  
  const [sdkLlmModel, setSdkLlmModel] = useState("gemini-3-flash-preview");
  const [sdkImageModel, setSdkImageModel] = useState("imagen-3");
  const [sdkVideoModel, setSdkVideoModel] = useState("veo-2");
  
  const [googleLlmModel, setGoogleLlmModel] = useState("gemini-2.5-flash");
  const [googleImageModel, setGoogleImageModel] = useState("imagen-3.0-generate-002");
  const [googleVideoModel, setGoogleVideoModel] = useState("veo-2.0-generate-001");

  const [dreaminaImageModel, setDreaminaImageModel] = useState("high_aes_general_v50");
  const [dreaminaVideoModel, setDreaminaVideoModel] = useState("dreamina_seedance_40");
  
  const [isSavingSettings, setIsSavingSettings] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // ZLProxy & Build Mode settings
  const [buildMode, setBuildMode] = useState<"1x1" | "consolidated">("1x1");
  const [zlproxyKey, setZlproxyKey] = useState("");
  const [useZlproxyForGflow, setUseZlproxyForGflow] = useState(false);
  const [useZlproxyForAIWorkers, setUseZlproxyForAIWorkers] = useState(true);
  const [disableWebpConversion, setDisableWebpConversion] = useState(false);

  // Sync calculated Hub Base URL and Custom Local API Override based on connection mode & local IP
  useEffect(() => {
    if (hubConnectionMode === "production") {
      setHubUrl((prev) => 
        prev && prev !== "" && !prev.includes("localhost") && !prev.includes("127.0.0.1") 
        ? prev 
        : (process.env.NEXT_PUBLIC_CORE_API_URL || "https://dev-hub.storymee.com")
      );
      setCustomApiUrl("");
    } else {
      setHubUrl(`http://${localIp}:5100`);
      setCustomApiUrl(`http://${localIp}:5100`);
    }
  }, [hubConnectionMode, localIp]);

  const loadGlobalSettings = async () => {
    setIsLoading(true);
    try {
      const settings = await fetchSettings();
      if (settings) {
        setUniversalNegativePrompt(settings.universalNegativePrompt || "");
        
        // Sync connection mode from localStorage
        if (typeof window !== "undefined") {
          let savedMode = localStorage.getItem("STORYMEE_HUB_CONNECTION_MODE") || "production";
          if (savedMode === "vps") savedMode = "production";
          if (savedMode === "local") savedMode = "development";
          
          const defaultCoreUrl = process.env.NEXT_PUBLIC_CORE_API_URL || "https://dev-hub.storymee.com";
          const savedIp = localStorage.getItem("STORYMEE_LOCAL_IP") || "192.168.1.10";
          setHubConnectionMode(savedMode as "production" | "development");
          setLocalIp(savedIp);

          const containsLocalhost = /localhost|127\.0\.0\.1|host\.docker\.internal/.test((settings.hubUrl || "").toLowerCase());
          const resolvedHubUrl = (savedMode === "development" || containsLocalhost)
            ? `http://${savedIp}:5100`
            : (settings.hubUrl || defaultCoreUrl);

          setHubUrl(resolvedHubUrl);
        } else {
          setHubUrl(settings.hubUrl || process.env.NEXT_PUBLIC_CORE_API_URL || "https://dev-hub.storymee.com");
        }

        const localStoredApiKey = typeof window !== "undefined" ? localStorage.getItem("STORYMEE_HUB_API_KEY") : "";
        setHubApiKey(settings.hubApiKey || localStoredApiKey || process.env.NEXT_PUBLIC_HUB_API_KEY || "");
        setSdkUrl(settings.sdkUrl || "");
        setSdkApiKey(settings.sdkApiKey || "");
        setGeminiApiKey(settings.geminiApiKey || "");
        setActiveProvider(settings.activeProvider || "hub");
        
        // Decoupled providers load
        setLlmProvider(settings.llmProvider || settings.activeProvider || "hub");
        setImageProvider(settings.imageProvider || settings.activeProvider || "hub");
        setVideoProvider(settings.videoProvider || settings.activeProvider || "hub");

        setHubLlmModel(settings.hubLlmModel || "cliproxy-gpt");
        setHubImageModel(settings.hubImageModel || "auto");
        setHubVideoModel(settings.hubVideoModel || "auto");
        
        setSdkLlmModel(settings.sdkLlmModel || "gemini-3-flash-preview");
        setSdkImageModel(settings.sdkImageModel || "imagen-3");
        setSdkVideoModel(settings.sdkVideoModel || "veo-2");
        
        setGoogleLlmModel(settings.googleLlmModel || "gemini-2.5-flash");
        setGoogleImageModel(settings.googleImageModel || "imagen-3.0-generate-002");
        setGoogleVideoModel(settings.googleVideoModel || "veo-2.0-generate-001");

        setDreaminaImageModel(settings.dreaminaImageModel || "high_aes_general_v50");
        setDreaminaVideoModel(settings.dreaminaVideoModel || "dreamina_seedance_40");

        // New fields
        setBuildMode(settings.buildMode || "1x1");
        setZlproxyKey(settings.zlproxyKey || "");
        setUseZlproxyForGflow(settings.useZlproxyForGflow !== undefined ? settings.useZlproxyForGflow : false);
        setUseZlproxyForAIWorkers(settings.useZlproxyForAIWorkers !== undefined ? settings.useZlproxyForAIWorkers : true);
        setDisableWebpConversion(settings.disableWebpConversion !== undefined ? settings.disableWebpConversion : false);
      }
    } catch (e) {
      console.error("Failed to load global settings:", e);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (show) {
      if (typeof window !== "undefined") {
        let savedMode = localStorage.getItem("STORYMEE_HUB_CONNECTION_MODE") || "production";
        if (savedMode === "vps") savedMode = "production";
        if (savedMode === "local") savedMode = "development";
        
        const savedIp = localStorage.getItem("STORYMEE_LOCAL_IP") || "192.168.1.10";
        setHubConnectionMode(savedMode as "production" | "development");
        setLocalIp(savedIp);
      }
      loadGlobalSettings();
    }
  }, [show]);

  const handleSave = async () => {
    setIsSavingSettings(true);
    try {
      const finalActiveProvider = llmProvider;
      await updateSettings({
        activeProvider: finalActiveProvider,
        llmProvider,
        imageProvider,
        videoProvider,
        hubUrl,
        hubApiKey,
        sdkUrl,
        sdkApiKey,
        geminiApiKey,
        hubLlmModel,
        hubImageModel,
        hubVideoModel,
        sdkLlmModel,
        sdkImageModel,
        sdkVideoModel,
        googleLlmModel,
        googleImageModel,
        googleVideoModel,
        dreaminaImageModel,
        dreaminaVideoModel,
        universalNegativePrompt,
        buildMode,
        zlproxyKey,
        useZlproxyForGflow,
        useZlproxyForAIWorkers,
        disableWebpConversion
      });

      // Write connection configurations to localStorage
      if (typeof window !== "undefined") {
        localStorage.setItem("STORYMEE_HUB_CONNECTION_MODE", hubConnectionMode);
        localStorage.setItem("STORYMEE_LOCAL_IP", localIp);
        localStorage.setItem("STORYMEE_HUB_API_KEY", hubApiKey);
        
        const finalCustomUrl = hubConnectionMode === 'production' ? '' : `http://${localIp}:5100`;
        if (finalCustomUrl) {
          localStorage.setItem('STORYMEE_CUSTOM_API_URL', finalCustomUrl);
        } else {
          localStorage.removeItem('STORYMEE_CUSTOM_API_URL');
        }
      }

      setActiveProvider(finalActiveProvider);
      alert("✅ Đã lưu cấu hình hệ thống thành công!");
      setShow(false);
    } catch (err) {
      console.error("Error saving settings:", err);
      alert("⚠️ Lỗi khi lưu cấu hình!");
    } finally {
      setIsSavingSettings(false);
    }
  };

  return (
    <>
      <button 
        onClick={() => setShow(true)} 
        className="flex items-center gap-2 hover:text-white transition-all duration-200 px-3.5 py-2 rounded-xl bg-slate-900/60 hover:bg-slate-800/80 text-slate-300 border border-slate-800/50 hover:border-slate-700/50 text-xs font-semibold shadow-sm"
      >
        <Settings className="w-3.5 h-3.5" />
        Global Settings
      </button>

      {show && (
        <div className="fixed inset-0 bg-slate-950/80 flex items-center justify-center p-4 z-[100] backdrop-blur-md text-left animate-in fade-in duration-200">
          <div className="bg-slate-950 border border-slate-800/80 p-6 rounded-3xl w-full max-w-lg shadow-2xl relative overflow-hidden font-sans flex flex-col max-h-[90vh]">
            <div className="absolute inset-0 bg-gradient-to-br from-purple-500/5 via-transparent to-pink-500/5 pointer-events-none" />
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-purple-500 via-pink-500 to-amber-500" />
            
            {/* Header */}
            <div className="flex items-center justify-between mb-4 relative z-10">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-purple-500/10 to-pink-500/10 border border-purple-500/20 flex items-center justify-center">
                  <Settings className="w-4 h-4 text-purple-400" />
                </div>
                <div>
                  <h3 className="text-md font-bold text-slate-100 font-sans">Global Settings</h3>
                  <p className="text-[10px] text-slate-400 mt-0.5">Cấu hình kết nối Hub và dịch vụ trí tuệ nhân tạo AI</p>
                </div>
              </div>
              <button 
                onClick={() => setShow(false)} 
                className="w-7 h-7 flex items-center justify-center rounded-lg bg-slate-900 border border-slate-800/60 text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Scroll Container */}
            <div className="flex-1 overflow-y-auto pr-1 space-y-4 relative z-10 max-h-[68vh] custom-scrollbar">
              {isLoading && (
                <div className="flex items-center justify-center gap-2 py-4 bg-slate-900/40 border border-slate-800/50 rounded-2xl">
                  <Loader2 className="w-4 h-4 text-purple-400 animate-spin" />
                  <span className="text-xs text-slate-400 font-sans">Syncing settings from OMNI Core...</span>
                </div>
              )}
              
              {/* PHẦN 1: STORYMEE HUB (KẾT NỐI CHÍNH) */}
              <div className="bg-slate-900/40 border border-slate-800/50 rounded-2xl p-4 space-y-3.5">
                <h4 className="text-[11px] font-bold text-blue-400 uppercase tracking-widest flex items-center gap-2">
                  <Globe className="w-3.5 h-3.5 text-blue-400" /> 1. Storymee Hub (Kết nối chính)
                </h4>

                {/* Connection Mode Selection Toggle */}
                <div className="space-y-1.5 border-b border-slate-800/60 pb-3">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Connection Mode</label>
                  <div className="grid grid-cols-2 gap-2 bg-slate-950 p-1 rounded-xl border border-slate-850">
                    <button
                      type="button"
                      onClick={() => setHubConnectionMode('production')}
                      className={`py-2 px-3 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer outline-none ${
                        hubConnectionMode === 'production'
                          ? 'bg-indigo-600 text-white shadow-md'
                          : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/50'
                      }`}
                    >
                      ☁️ VPS Production (Cloud)
                    </button>
                    <button
                      type="button"
                      onClick={() => setHubConnectionMode('development')}
                      className={`py-2 px-3 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer outline-none ${
                        hubConnectionMode === 'development'
                          ? 'bg-indigo-600 text-white shadow-md'
                          : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/50'
                      }`}
                    >
                      💻 Local Engine (storymee-pc)
                    </button>
                  </div>
                </div>

                {/* Local Engine IP Configuration */}
                {hubConnectionMode === 'development' && (
                  <div className="space-y-1.5 pt-1 animate-in slide-in-from-top-1 duration-150">
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                      Local Server / Ubuntu Domain / IP Address
                    </label>
                    <input
                      type="text"
                      value={localIp}
                      onChange={(e) => setLocalIp(e.target.value)}
                      placeholder="192.168.1.10"
                      className="w-full bg-slate-950 border border-slate-850 focus:border-blue-500/50 rounded-xl px-3 py-1.5 text-xs text-slate-200 outline-none transition-all font-mono"
                    />
                    <span className="text-[9px] text-slate-500 block leading-tight">
                      Nhập IP server chạy Hub Gateway (Mặc định Ubuntu LAN: 192.168.1.10).
                    </span>
                  </div>
                )}
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Custom Local API Override</label>
                    <input
                      type="text"
                      value={customApiUrl}
                      readOnly
                      placeholder="Tự động tính toán"
                      className="w-full bg-slate-950/60 border border-slate-850/50 text-slate-400 rounded-xl px-3 py-1.5 text-xs outline-none font-mono"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Hub Base URL</label>
                    <input
                      type="text"
                      value={hubUrl}
                      readOnly
                      placeholder="Tự động tính toán"
                      className="w-full bg-slate-950/60 border border-slate-850/50 text-slate-400 rounded-xl px-3 py-1.5 text-xs outline-none font-mono"
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Hub API Key</label>
                  <input
                    type="password"
                    value={hubApiKey}
                    onChange={(e) => setHubApiKey(e.target.value)}
                    placeholder="Nhập API Key kết nối Hub..."
                    className="w-full bg-slate-950 border border-slate-850 focus:border-blue-500/50 rounded-xl px-3 py-1.5 text-xs text-slate-200 outline-none transition-all font-mono"
                  />
                </div>
              </div>

              {/* PHẦN 2: ACTIVE PROVIDERS & CREDENTIALS */}
              <div className="bg-slate-900/40 border border-slate-800/50 rounded-2xl p-4 space-y-4">
                <h4 className="text-[11px] font-bold text-purple-400 uppercase tracking-widest flex items-center gap-2">
                  <Cpu className="w-3.5 h-3.5 text-purple-400" /> 2. Active AI Provider Gateways
                </h4>

                {/* LLM Provider Selector */}
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block flex items-center gap-1">
                    <Cpu className="w-3 h-3 text-purple-400" /> LLM Provider
                  </label>
                  <div className="grid grid-cols-3 gap-1 bg-slate-950 p-1 rounded-xl border border-slate-850">
                    {(["hub", "sdk", "google-native"] as const).map((prov) => (
                      <button
                        key={prov}
                        type="button"
                        onClick={() => setLlmProvider(prov)}
                        className={`py-1 px-2 rounded-lg text-[10px] font-bold transition-all uppercase tracking-wider cursor-pointer ${
                          llmProvider === prov 
                            ? "bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-md"
                            : "text-slate-400 hover:text-slate-200 hover:bg-slate-900/50"
                        }`}
                      >
                        {prov === "hub" ? "Hub" : prov === "sdk" ? "Vidtory SDK" : "Google"}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Image Provider Selector */}
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block flex items-center gap-1">
                    <ImageIcon className="w-3 h-3 text-blue-400" /> Image Provider
                  </label>
                  <div className="grid grid-cols-4 gap-1 bg-slate-950 p-1 rounded-xl border border-slate-850">
                    {(["hub", "sdk", "google-native", "dreamina"] as const).map((prov) => (
                      <button
                        key={prov}
                        type="button"
                        onClick={() => setImageProvider(prov)}
                        className={`py-1 px-1 rounded-lg text-[9px] font-bold transition-all uppercase tracking-wider cursor-pointer ${
                          imageProvider === prov 
                            ? "bg-gradient-to-r from-blue-600 to-cyan-600 text-white shadow-md"
                            : "text-slate-400 hover:text-slate-200 hover:bg-slate-900/50"
                        }`}
                      >
                        {prov === "hub" ? "Hub" : prov === "sdk" ? "Vidtory SDK" : prov === "google-native" ? "Google" : "Dreamina"}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Video Provider Selector */}
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block flex items-center gap-1">
                    <Film className="w-3 h-3 text-pink-400" /> Video Provider
                  </label>
                  <div className="grid grid-cols-4 gap-1 bg-slate-950 p-1 rounded-xl border border-slate-850">
                    {(["hub", "sdk", "google-native", "dreamina"] as const).map((prov) => (
                      <button
                        key={prov}
                        type="button"
                        onClick={() => setVideoProvider(prov)}
                        className={`py-1 px-1 rounded-lg text-[9px] font-bold transition-all uppercase tracking-wider cursor-pointer ${
                          videoProvider === prov 
                            ? "bg-gradient-to-r from-pink-600 to-rose-600 text-white shadow-md"
                            : "text-slate-400 hover:text-slate-200 hover:bg-slate-900/50"
                        }`}
                      >
                        {prov === "hub" ? "Hub" : prov === "sdk" ? "Vidtory SDK" : prov === "google-native" ? "Google" : "Dreamina"}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Dynamic Credential inputs */}
                {(llmProvider === "sdk" || imageProvider === "sdk" || videoProvider === "sdk") && (
                  <div className="space-y-3 pt-3 border-t border-slate-800/50 animate-in slide-in-from-top-1 duration-150">
                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">SDK Base URL</label>
                      <input
                        type="text"
                        value={sdkUrl}
                        onChange={(e) => setSdkUrl(e.target.value)}
                        placeholder="https://bapi.vidtory.net"
                        className="w-full bg-slate-950 border border-slate-850 focus:border-purple-500/50 rounded-xl px-3 py-1.5 text-xs text-slate-200 outline-none transition-all font-mono"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">SDK API Key</label>
                      <input
                        type="password"
                        value={sdkApiKey}
                        onChange={(e) => setSdkApiKey(e.target.value)}
                        placeholder="vidtory_..."
                        className="w-full bg-slate-950 border border-slate-850 focus:border-purple-500/50 rounded-xl px-3 py-1.5 text-xs text-slate-200 outline-none transition-all font-mono"
                      />
                    </div>
                  </div>
                )}

                {(llmProvider === "google-native" || imageProvider === "google-native" || videoProvider === "google-native") && (
                  <div className="space-y-1 pt-3 border-t border-slate-800/50 animate-in slide-in-from-top-1 duration-150">
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                      <Key className="w-3 h-3 text-amber-400" /> Google Native API Key
                    </label>
                    <input
                      type="password"
                      value={geminiApiKey}
                      onChange={(e) => setGeminiApiKey(e.target.value)}
                      placeholder="AIzaSy..."
                      className="w-full bg-slate-950 border border-slate-850 focus:border-purple-500/50 rounded-xl px-3 py-1.5 text-xs text-slate-200 outline-none transition-all font-mono placeholder-slate-700"
                    />
                  </div>
                )}
              </div>

              {/* PHẦN 3: LLM MODEL, IMAGE MODEL, VIDEO MODEL TƯƠNG ỨNG */}
              <div className="bg-slate-900/40 border border-slate-800/50 rounded-2xl p-4 space-y-3.5">
                <h4 className="text-[11px] font-bold text-pink-400 uppercase tracking-widest flex items-center gap-2">
                  <Settings className="w-3.5 h-3.5 text-pink-400" /> 3. Model Configurations
                </h4>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  
                  {/* Select LLM Model */}
                  <div className="space-y-1">
                    <label className="text-[9px] font-bold text-slate-400 uppercase tracking-wider block flex items-center gap-1"><Cpu className="w-2.5 h-2.5" /> LLM Model</label>
                    {llmProvider === "hub" && (
                      <select
                        value={hubLlmModel}
                        onChange={(e) => setHubLlmModel(e.target.value)}
                        className="w-full bg-slate-950 border border-slate-850 focus:border-purple-500/50 rounded-xl px-2 py-1.5 text-xs text-slate-200 outline-none cursor-pointer font-sans"
                      >
                        <option value="gpt-5.4-mini">GPT 5.4 Mini</option>
                      </select>
                    )}
                    {llmProvider === "sdk" && (
                      <select
                        value={sdkLlmModel}
                        onChange={(e) => setSdkLlmModel(e.target.value)}
                        className="w-full bg-slate-950 border border-slate-850 focus:border-purple-500/50 rounded-xl px-2 py-1.5 text-xs text-slate-200 outline-none cursor-pointer font-sans"
                      >
                        <option value="gemini-3-flash-preview">Gemini 3 Flash Preview</option>
                        <option value="gemini-1.5-flash">Gemini 1.5 Flash</option>
                        <option value="gemini-1.5-pro">Gemini 1.5 Pro</option>
                      </select>
                    )}
                    {llmProvider === "google-native" && (
                      <select
                        value={googleLlmModel}
                        onChange={(e) => setGoogleLlmModel(e.target.value)}
                        className="w-full bg-slate-950 border border-slate-850 focus:border-purple-500/50 rounded-xl px-2 py-1.5 text-xs text-slate-200 outline-none cursor-pointer font-sans"
                      >
                        <option value="gemini-2.5-flash">Gemini 2.5 Flash</option>
                        <option value="gemini-2.5-pro">Gemini 2.5 Pro</option>
                        <option value="gemini-1.5-pro">Gemini 1.5 Pro</option>
                        <option value="gemini-1.5-flash">Gemini 1.5 Flash</option>
                      </select>
                    )}
                  </div>

                  {/* Select Image Model */}
                  <div className="space-y-1">
                    <label className="text-[9px] font-bold text-slate-400 uppercase tracking-wider block flex items-center gap-1"><ImageIcon className="w-2.5 h-2.5" /> Image Model</label>
                    {imageProvider === "hub" && (
                      <select
                        value={hubImageModel}
                        onChange={(e) => setHubImageModel(e.target.value)}
                        className="w-full bg-slate-950 border border-slate-850 focus:border-purple-500/50 rounded-xl px-2 py-1.5 text-xs text-slate-200 outline-none cursor-pointer font-sans"
                      >
                        <option value="narwhal">Google Flow (Narwhal)</option>
                        <option value="banana2">IILabs (Banana2)</option>
                        <option value="omni-flash-3">Omni Flash 3</option>
                      </select>
                    )}
                    {imageProvider === "sdk" && (
                      <select
                        value={sdkImageModel}
                        onChange={(e) => setSdkImageModel(e.target.value)}
                        className="w-full bg-slate-950 border border-slate-850 focus:border-purple-500/50 rounded-xl px-2 py-1.5 text-xs text-slate-200 outline-none cursor-pointer font-sans"
                      >
                        <option value="imagen-3">Imagen 3</option>
                        <option value="flux-schnell">Flux Schnell</option>
                        <option value="flux-dev">Flux Dev</option>
                      </select>
                    )}
                    {imageProvider === "google-native" && (
                      <select
                        value={googleImageModel}
                        onChange={(e) => setGoogleImageModel(e.target.value)}
                        className="w-full bg-slate-950 border border-slate-850 focus:border-purple-500/50 rounded-xl px-2 py-1.5 text-xs text-slate-200 outline-none cursor-pointer font-sans"
                      >
                        <option value="imagen-3.0-generate-002">Imagen 3.0 Generate</option>
                        <option value="imagen-3.0-fast-002">Imagen 3.0 Fast</option>
                        <option value="imagen-3.0-fast-00">Imagen 3.0 Fast (00)</option>
                      </select>
                    )}
                    {imageProvider === "dreamina" && (
                      <select
                        value={dreaminaImageModel}
                        onChange={(e) => setDreaminaImageModel(e.target.value)}
                        className="w-full bg-slate-950 border border-slate-850 focus:border-purple-500/50 rounded-xl px-2 py-1.5 text-xs text-slate-200 outline-none cursor-pointer font-sans"
                      >
                        <option value="high_aes_gpt_v20">GPT Image 2 (New)</option>
                        <option value="high_aes_general_v50">Image 5.0 Lite</option>
                        <option value="high_aes_general_v47">Image 4.7 (New)</option>
                        <option value="high_aes_general_v46">Image 4.6</option>
                        <option value="high_aes_general_v45">Image 4.5</option>
                      </select>
                    )}
                  </div>

                  {/* Select Video Model */}
                  <div className="space-y-1">
                    <label className="text-[9px] font-bold text-slate-400 uppercase tracking-wider block flex items-center gap-1"><Film className="w-2.5 h-2.5" /> Video Model</label>
                    {videoProvider === "hub" && (
                      <select
                        value={hubVideoModel}
                        onChange={(e) => setHubVideoModel(e.target.value)}
                        className="w-full bg-slate-950 border border-slate-850 focus:border-purple-500/50 rounded-xl px-2 py-1.5 text-xs text-slate-200 outline-none cursor-pointer font-sans"
                      >
                        <option value="auto">Auto (Tự động)</option>
                        <option value="luma">Luma</option>
                        <option value="kling">Kling</option>
                        <option value="runway">Runway</option>
                        <option value="veo_3_1_lite_low_priority">Veo 3.1 (Low Priority)</option>
                      </select>
                    )}
                    {videoProvider === "sdk" && (
                      <select
                        value={sdkVideoModel}
                        onChange={(e) => setSdkVideoModel(e.target.value)}
                        className="w-full bg-slate-950 border border-slate-850 focus:border-purple-500/50 rounded-xl px-2 py-1.5 text-xs text-slate-200 outline-none cursor-pointer font-sans"
                      >
                        <option value="veo-3.1-fast-generate-001">Veo 3.1 Fast</option>
                        <option value="veo-2">Veo 2</option>
                        <option value="luma-dream-machine">Luma Dream Machine</option>
                      </select>
                    )}
                    {videoProvider === "google-native" && (
                      <select
                        value={googleVideoModel}
                        onChange={(e) => setGoogleVideoModel(e.target.value)}
                        className="w-full bg-slate-950 border border-slate-850 focus:border-purple-500/50 rounded-xl px-2 py-1.5 text-xs text-slate-200 outline-none cursor-pointer font-sans"
                      >
                        <option value="veo-2.0-generate-001">Veo 2.0 (SDK fallback)</option>
                      </select>
                    )}
                    {videoProvider === "dreamina" && (
                      <select
                        value={dreaminaVideoModel}
                        onChange={(e) => setDreaminaVideoModel(e.target.value)}
                        className="w-full bg-slate-950 border border-slate-850 focus:border-purple-500/50 rounded-xl px-2 py-1.5 text-xs text-slate-200 outline-none cursor-pointer font-sans"
                      >
                        <option value="dreamina_seedance_40_mini">Dreamina Seedance 2.0 Mini (New)</option>
                        <option value="dreamina_seedance_40">Dreamina Seedance 2.0 Fast (New)</option>
                        <option value="dreamina_seedance_40_pro">Dreamina Seedance 2.0 (New)</option>
                        <option value="dreamina_lib_sync_image_quick_1.5">Dreamina Seedance 1.5 Pro (New)</option>
                        <option value="dreamina_seedance_10">Dreamina Seedance 1.0</option>
                      </select>
                    )}
                  </div>

                </div>
              </div>

              {/* PHẦN 4: UNIVERSAL NEGATIVE PROMPT */}
              <div className="bg-slate-900/40 border border-slate-800/50 rounded-2xl p-4 space-y-2.5">
                <h4 className="text-[11px] font-bold text-red-400 uppercase tracking-widest flex items-center gap-2">
                  🚫 Universal Negative Prompt
                </h4>
                <p className="text-[10px] text-slate-400 leading-relaxed font-sans">
                  Negative prompt mặc định tự động áp dụng cho tất cả các tác vụ sinh ảnh/video.
                </p>
                <textarea
                  rows={2}
                  value={universalNegativePrompt}
                  onChange={(e) => setUniversalNegativePrompt(e.target.value)}
                  placeholder="Nhập negative prompt cấm kỵ (ví dụ: blurry, low quality, distorted...)"
                  className="w-full bg-slate-950 border border-slate-850 focus:border-blue-500/50 rounded-xl px-3 py-2 text-xs text-slate-200 outline-none transition-all resize-none placeholder-slate-700"
                />
              </div>

              {/* PHẦN 5: STORYBOARD CANVAS LAYOUT MODE */}
              <div className="bg-slate-900/40 border border-slate-800/50 rounded-2xl p-4 space-y-3">
                <h4 className="text-[11px] font-bold text-amber-400 uppercase tracking-widest flex items-center gap-2">
                  <Sliders className="w-3.5 h-3.5" /> 5. Storyboard Canvas Layout Mode
                </h4>
                <div className="space-y-2">
                  <div className="grid grid-cols-2 gap-2 bg-slate-950 p-1 rounded-xl border border-slate-850">
                    <button
                      type="button"
                      onClick={() => setBuildMode('1x1')}
                      className={`py-2.5 px-3 rounded-lg text-xs font-bold transition-all uppercase tracking-wider flex flex-col items-center justify-center gap-1 cursor-pointer outline-none ${
                        buildMode === '1x1'
                          ? 'bg-gradient-to-r from-amber-600 to-orange-600 text-white shadow shadow-orange-600/30'
                          : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/50'
                      }`}
                    >
                      <span className="text-[11px]">1x1 Node Column Mode</span>
                      <span className="text-[9px] font-normal lowercase text-slate-300">Từng shot đơn lẻ</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setBuildMode('consolidated')}
                      className={`py-2.5 px-3 rounded-lg text-xs font-bold transition-all uppercase tracking-wider flex flex-col items-center justify-center gap-1 cursor-pointer outline-none ${
                        buildMode === 'consolidated'
                          ? 'bg-gradient-to-r from-amber-600 to-orange-600 text-white shadow shadow-orange-600/30'
                          : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/50'
                      }`}
                    >
                      <span className="text-[11px]">Consolidated Master Board</span>
                      <span className="text-[9px] font-normal lowercase text-slate-300">Bảng cuộn duy nhất</span>
                    </button>
                  </div>
                </div>
              </div>

              {/* PHẦN 6: ZLPROXY NETWORK CONFIGURATION */}
              <div className="bg-slate-900/40 border border-slate-800/50 rounded-2xl p-4 space-y-3.5">
                <h4 className="text-[11px] font-bold text-cyan-400 uppercase tracking-widest flex items-center gap-2">
                  🌐 6. ZLProxy Network Configuration
                </h4>
                
                <div className="space-y-3">
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">ZLProxy API Key (Residential Proxy)</label>
                    <input
                      type="password"
                      value={zlproxyKey}
                      onChange={(e) => setZlproxyKey(e.target.value)}
                      placeholder="Nhập API Key ZLProxy để xoay residential IP..."
                      className="w-full bg-slate-950 border border-slate-850 focus:border-blue-500/50 rounded-xl px-3 py-1.5 text-xs text-slate-200 outline-none transition-all font-mono placeholder-slate-700"
                    />
                  </div>

                  <div className="flex flex-col gap-2 pt-2 border-t border-slate-850 font-sans">
                    <label className="flex items-start space-x-2.5 cursor-pointer select-none">
                      <input
                        type="checkbox"
                        checked={useZlproxyForGflow}
                        onChange={(e) => setUseZlproxyForGflow(e.target.checked)}
                        className="w-4 h-4 rounded border-slate-850 bg-slate-950 text-purple-600 focus:ring-purple-500/20 mt-0.5 cursor-pointer font-sans"
                      />
                      <div className="text-left font-sans">
                        <span className="text-xs font-semibold text-white block">Enable ZLProxy for GFlow Worker</span>
                        <span className="text-[9px] text-slate-500 block leading-tight">Dùng proxy cho Google Flow. Mặc định tắt để chạy IP gốc.</span>
                      </div>
                    </label>

                    <label className="flex items-start space-x-2.5 cursor-pointer select-none mt-1">
                      <input
                        type="checkbox"
                        checked={useZlproxyForAIWorkers}
                        onChange={(e) => setUseZlproxyForAIWorkers(e.target.checked)}
                        className="w-4 h-4 rounded border-slate-850 bg-slate-950 text-purple-600 focus:ring-purple-500/20 mt-0.5 cursor-pointer font-sans"
                      />
                      <div className="text-left font-sans">
                        <span className="text-xs font-semibold text-white block">Enable ZLProxy for AI Workers (Dreamina, Picsart, Topview)</span>
                        <span className="text-[9px] text-slate-500 block leading-tight">Dùng proxy cho automation tasks để tránh bot check / khóa tài khoản.</span>
                      </div>
                    </label>
                  </div>
                </div>
              </div>

              {/* PHẦN 7: IMAGE QUALITY & FORMAT SETTINGS */}
              <div className="bg-slate-900/40 border border-slate-800/50 rounded-2xl p-4 space-y-3.5">
                <h4 className="text-[11px] font-bold text-sky-400 uppercase tracking-widest flex items-center gap-2">
                  🖼️ 7. Image Quality & Format Settings
                </h4>
                
                <div className="flex flex-col gap-2 pt-2 border-t border-slate-850 font-sans">
                  <label className="flex items-start space-x-2.5 cursor-pointer select-none">
                    <input
                      type="checkbox"
                      checked={disableWebpConversion}
                      onChange={(e) => setDisableWebpConversion(e.target.checked)}
                      className="w-4 h-4 rounded border-slate-850 bg-slate-950 text-purple-600 focus:ring-purple-500/20 mt-0.5 cursor-pointer font-sans"
                    />
                    <div className="text-left font-sans">
                      <span className="text-xs font-semibold text-white block">Disable WebP Conversion (Keep Original Quality)</span>
                      <span className="text-[9px] text-slate-500 block leading-tight">Khi bật, lưu ảnh gốc dạng PNG/JPEG thay vì nén và chuyển đổi sang WebP.</span>
                    </div>
                  </label>
                </div>
              </div>

            </div>

            {/* Footer Actions */}
            <div className="flex justify-between items-center gap-3 mt-4 pt-3 border-t border-slate-900 relative z-10 font-sans">
              <button
                onClick={loadGlobalSettings}
                disabled={isLoading || isSavingSettings}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-800 text-[10px] text-slate-400 font-semibold hover:text-white hover:bg-slate-900 transition-colors cursor-pointer"
                title="Đồng bộ cấu hình từ VPS Backend"
              >
                <RefreshCw size={12} className={isLoading ? 'animate-spin' : ''} />
                SYNC FROM VPS
              </button>
              
              <div className="flex gap-2">
                <button
                  onClick={() => setShow(false)}
                  className="px-4 py-2 rounded-xl text-xs font-bold bg-slate-900 hover:bg-slate-850 border border-slate-800/80 text-slate-300 transition-colors cursor-pointer"
                  disabled={isSavingSettings}
                >
                  Hủy
                </button>
                <button
                  onClick={handleSave}
                  disabled={isSavingSettings || isLoading}
                  className="px-4 py-2 rounded-xl text-xs font-bold bg-gradient-to-r from-purple-600 to-pink-500 hover:from-purple-500 hover:to-pink-400 text-white shadow-lg shadow-purple-500/20 disabled:opacity-50 flex items-center gap-1.5 transition-all cursor-pointer"
                >
                  {isSavingSettings ? (
                    <>
                      <Loader2 className="w-3 animate-spin" />
                      Đang lưu...
                    </>
                  ) : (
                    <>
                      <Check className="w-3.5 h-3.5" />
                      Lưu cấu hình
                    </>
                  )}
                </button>
              </div>
            </div>

          </div>
        </div>
      )}
    </>
  );
}
