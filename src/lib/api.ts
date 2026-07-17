import { CoreApiClient } from '@storymee/api-client';

const getDefaultApiUrl = () => {
  const rawUrl = process.env.NEXT_PUBLIC_CORE_API_URL || 'https://dev-hub.storymee.com';
  return rawUrl.endsWith('/') ? rawUrl.slice(0, -1) : rawUrl;
};

export const getApiBaseUrl = () => {
  if (typeof window !== 'undefined') {
    const mode = localStorage.getItem('STORYMEE_HUB_CONNECTION_MODE');
    if (mode === 'vps' || mode === 'production') {
      return getDefaultApiUrl();
    }
    if (mode === 'local' || mode === 'development') {
      const customUrl = localStorage.getItem('STORYMEE_CUSTOM_API_URL');
      if (customUrl) return customUrl.endsWith('/') ? customUrl.slice(0, -1) : customUrl;
    }
    // Fallback default: Always use dev-hub
    return getDefaultApiUrl();
  }
  return getDefaultApiUrl();
};

export const getHubUrl = () => {
  const gatewayUrl = process.env.NEXT_PUBLIC_HUB_GATEWAY_URL;
  if (gatewayUrl) {
    return gatewayUrl;
  }
  const apiUrl = getApiBaseUrl();
  if (apiUrl.includes('dev-hub.storymee.com') || apiUrl.includes('storymee.com')) {
    return apiUrl;
  }
  if (apiUrl.includes('localhost:') || apiUrl.includes('127.0.0.1:')) {
    try {
      const url = new URL(apiUrl);
      url.port = '5100';
      return `${url.protocol}//${url.host}`;
    } catch (e) {
      return 'http://localhost:5100';
    }
  }
  if (typeof window !== 'undefined') {
    const hostname = window.location.hostname;
    if (hostname === 'localhost' || hostname === '127.0.0.1') {
      return 'https://dev-hub.storymee.com';
    }
  }
  return apiUrl.startsWith('https') ? 'https://dev-hub.storymee.com' : 'http://localhost:5100';
};

export const getHubWsUrl = (path: string = '') => {
  const hubUrl = getHubUrl();
  const wsProtocol = hubUrl.startsWith('https') ? 'wss:' : 'ws:';
  const cleanUrl = hubUrl.replace('https://', '').replace('http://', '');
  return `${wsProtocol}//${cleanUrl}${path}`;
};

export const API_BASE_URL = getDefaultApiUrl(); // Backwards compatibility for other files importing it static
export const HUB_API_KEY = ''; // Managed server-side via Middleware with client-side fallback

const apiClient = new CoreApiClient({
  baseURL: getApiBaseUrl(),
  headers: {
    'Authorization': `Bearer ${HUB_API_KEY}`
  }
});

/**
 * Standardized HTTP client helper for OMNI Core API.
 * Automatically injects authorization tokens and content type headers.
 * Safely handles multipart/form-data for image uploads.
 */
async function request<T>(path: string, options: RequestInit & { timeoutMs?: number } = {}): Promise<T> {
  const { timeoutMs = 8000, method = 'GET', body, headers } = options;
  
  const config = {
    timeout: timeoutMs,
    baseURL: getApiBaseUrl(), // allow dynamic updates from localStorage
    headers: {
      'Authorization': `Bearer ${HUB_API_KEY}`,
      ...(headers as Record<string, string> || {})
    }
  };

  let data = body;
  if (typeof body === 'string') {
    try { data = JSON.parse(body); } catch(e) {}
  }
  // Allow browser/axios to automatically set boundary for FormData by removing Content-Type if present
  if (data instanceof FormData && (config.headers as Record<string, string>)['Content-Type']) {
    delete (config.headers as Record<string, string>)['Content-Type'];
  }

  try {
    switch(method.toUpperCase()) {
      case 'POST':
        return await apiClient.post<T>(path, data, config);
      case 'PUT':
        return await apiClient.put<T>(path, data, config);
      case 'DELETE':
        return await apiClient.delete<T>(path, config);
      case 'PATCH':
        return await apiClient.patch<T>(path, data, config);
      case 'GET':
      default:
        return await apiClient.get<T>(path, config);
    }
  } catch (err: any) {
    if (err.code === 'ECONNABORTED' || err.message?.includes('timeout')) {
      throw new Error(`Kết nối tới API quá hạn (Timeout ${timeoutMs / 1000}s). Vui lòng kiểm tra lại kết nối mạng hoặc VPS backend.`);
    }
    // err is formatted by CoreApiClient interceptor: { message, status, data, code }
    throw new Error(err.data?.message || err.data?.error || err.message || `Request failed`);
  }
}

export async function fetchProjects() {
  return request<any>('/internal/v1/asset/world/projects', { cache: 'no-store' });
}

export async function updateProject(id: string, data: { name?: string, description?: string, masterStyleUrl?: string, stylePrompt?: string, negativePrompt?: string }) {
  return request<any>(`/internal/v1/asset/world/projects/${id}`, {
    method: 'PUT',
    body: JSON.stringify(data)
  });
}

export async function consolidateProjectStyle(projectId: string) {
  return request<any>(`/internal/v1/asset/world/projects/${projectId}/consolidate-style`, {
    method: 'POST'
  });
}

export async function syncProjectToLetta(projectId: string) {
  return request<any>(`/internal/v1/asset/world/projects/${projectId}/sync-letta`, {
    method: 'POST',
    timeoutMs: 30000 // 30s timeout cho Letta Sync
  });
}

export async function createProject(data: { name: string, description?: string, masterStyleUrl?: string, stylePrompt?: string }) {
  return request<any>('/internal/v1/asset/world/projects', {
    method: 'POST',
    body: JSON.stringify(data)
  });
}

export async function deleteProject(id: string) {
  return request<any>(`/internal/v1/asset/world/projects/${id}`, {
    method: 'DELETE'
  });
}

export async function analyzeStyle(imageUrl: string) {
  const data = await request<any>('/internal/v1/asset/world/analyze-style', {
    method: 'POST',
    body: JSON.stringify({ imageUrl }),
    timeoutMs: 30000 // 30s timeout cho phân tích style
  });
  return data.data || data;
}

export async function fetchCharacters(projectId?: string) {
  const path = projectId 
    ? `/internal/v1/asset/world/characters?projectId=${projectId}`
    : `/internal/v1/asset/world/characters`;
  return request<any>(path, { cache: 'no-store' });
}

export async function createCharacter(data: { name: string, slug: string, projectId?: string, universeId?: string, description?: string, rootImageUrl?: string, styleGuide?: any, entityType?: string, generateStyleGuideFromText?: boolean }) {
  return request<any>('/internal/v1/asset/world/characters', {
    method: 'POST',
    body: JSON.stringify(data)
  });
}

export async function updateCharacter(id: string, data: { name?: string, slug?: string, description?: string, rootImageUrl?: string, styleGuide?: any }) {
  return request<any>(`/internal/v1/asset/world/characters/${id}`, {
    method: 'PUT',
    body: JSON.stringify(data)
  });
}

export async function fetchCharacterVariants(characterId: string) {
  return request<any>(`/internal/v1/asset/world/characters/${characterId}/variants`, {
    cache: 'no-store'
  });
}

export async function generateCharacterVariant(characterId: string, promptModifier: string) {
  return request<any>(`/internal/v1/asset/world/characters/${characterId}/generate-variant`, {
    method: 'POST',
    body: JSON.stringify({ promptModifier }),
    timeoutMs: 40000 // 40s timeout cho sinh variant
  });
}

export async function uploadImage(file: File) {
  const formData = new FormData();
  formData.append('file', file);

  return request<any>('/internal/v1/asset/world/upload', {
    method: 'POST',
    body: formData
  });
}

export async function getPromptByTagId(tagId: string) {
  return request<any>(`/internal/v1/asset/world/prompts?tagId=${tagId}`, { cache: 'no-store' });
}

export async function fetchVidtoryModels() {
  const FALLBACK_MODELS = [
    { id: 'gemini-3-flash-preview', name: 'Gemini 3 Flash Preview', type: 'prompt' },
    { id: 'gemini-2.5-flash', name: 'Gemini 2.5 Flash', type: 'prompt' },
    { id: 'gemini-1.5-pro', name: 'Gemini 1.5 Pro', type: 'prompt' },
    { id: 'gemini-3.1-flash-image-preview', name: 'Gemini 3.1 Flash Image Preview (1K Only)', type: 'image' },
    { id: 'imagen-3.0-generate-002', name: 'Imagen 3.0 Generate (1K Only)', type: 'image' },
    { id: 'flux-1.1-pro', name: 'Flux 1.1 Pro (1K Only)', type: 'image' },
    { id: 'veo-3.1-fast-generate-001', name: 'Veo 3.1 Fast Generate', type: 'video' },
    { id: 'luma-ray-2', name: 'Luma Ray 2', type: 'video' }
  ];
  return FALLBACK_MODELS;
}

export async function generatePrompt(basePrompt: string, emotion: string, angle: string) {
  console.log("[API.ts] Routing LLM (generatePrompt) through Hub Gateway...");
  const promptStr = `Rewrite this scene into a concise text-to-image prompt. Emotion: ${emotion}. Angle: ${angle}. Scene: ${basePrompt}`;
  const res = await request<any>('/internal/v1/media/prompt', {
    method: 'POST',
    body: JSON.stringify({
      prompt: promptStr,
      config: { jobType: "text", purpose: "generatePrompt" }
    })
  });
  return { generatedPrompt: res.data?.text  };
}

export async function generateText(prompt: string, modelId?: string) {
  console.log("[API.ts] Routing Text generation through Hub Gateway...");
  return request<any>('/internal/v1/media/prompt', {
    method: 'POST',
    body: JSON.stringify({
      prompt,
      config: { model_id: modelId, jobType: "text" }
    })
  });
}

export async function resolvePrompt(projectId: string, rawPrompt: string, characterNames?: string[]) {
  return request<any>('/internal/v1/asset/world/resolve-prompt', {
    method: 'POST',
    body: JSON.stringify({ projectId, rawPrompt, characterNames })
  });
}

export async function checkConsistency(projectId: string, prompt: string, characterNames: string[]) {
  return request<any>('/internal/v1/asset/world/check-consistency', {
    method: 'POST',
    body: JSON.stringify({ projectId, prompt, characterNames })
  });
}

export async function generateAssetJob(characterId: string, prompt: string, additionalParams?: Record<string, any>, signal?: AbortSignal) {
  // Bắt buộc dùng Hub Gateway (GFlow Extension) cho tác vụ Media
  console.log("[API.ts] Routing Media (generateAssetJob) through Hub Gateway to GFlow...");
  
  const payloadParams = {
    prompt,
    provider: additionalParams?.provider || 'gflow',
    ...additionalParams
  };

  try {
    const res = await request<any>('/internal/v1/media/generate/image', {
      method: 'POST',
      signal,
      body: JSON.stringify({
        ipId: characterId,
        inputParams: payloadParams
      })
    });
    if (res.error) throw new Error(res.error.message || "Hub Error");
    return res;
  } catch (err) {
    console.warn("[API.ts] Hub media generation failed. No fallback available since media is forced to GFlow:", err);
    throw err;
  }
}

/**
 * Gửi Custom Tag về Hub/LLM để chuẩn hóa (Normalize)
 * Trả về Cấu trúc cây (Hierarchical Tag)
 */
export async function normalizeTag(category: string, customInput: string) {
  return request<any>('/internal/v1/asset/world/tags/normalize', {
    method: "POST",
    body: JSON.stringify({ category, customInput })
  });
}

export async function fetchCustomTags() {
  const data = await request<any>('/internal/v1/asset/world/tags/custom', { cache: 'no-store' });
  if (Array.isArray(data)) {
    return data.map((t: any) => ({ ...t, id: t.tagId || t.id }));
  }
  return data;
}

export async function saveCustomTag(tag: { tagId: string, category: string, label: string, parentLabel?: string, assetType: string }) {
  return request<any>('/internal/v1/asset/world/tags/custom', {
    method: 'POST',
    body: JSON.stringify(tag)
  });
}

export async function deleteCustomTag(tagId: string) {
  return request<any>(`/internal/v1/asset/world/tags/custom/${tagId}`, {
    method: 'DELETE'
  });
}

export async function updateCustomTag(tagId: string, data: { category: string, label: string, parentLabel?: string }) {
  return request<any>(`/internal/v1/asset/world/tags/custom/${tagId}`, {
    method: 'PUT',
    body: JSON.stringify(data)
  });
}

export async function getXRayFeedback(imageUrl: string, brief: string, imageUrls?: string[], assetType?: string, model?: string) {
  const data = await request<any>('/internal/v1/asset/world/xray/feedback', {
    method: 'POST',
    body: JSON.stringify({ imageUrl, brief, imageUrls, assetType, model })
  });
  return data.data || data;
}

export async function generateXRayPrompt(brief: string, wardrobe: string, psychology: string, selectedOptions: any[], model?: string) {
  const data = await request<any>('/internal/v1/asset/world/xray/generate-prompt', {
    method: 'POST',
    body: JSON.stringify({ brief, wardrobe, psychology, selectedOptions, model })
  });
  return data.data || data;
}

export async function deleteCharacter(id: string) {
  return request<any>(`/internal/v1/asset/world/characters/${id}`, {
    method: 'DELETE'
  });
}

export async function deleteAsset(id: string) {
  return request<any>(`/internal/v1/asset/world/assets/${id}`, {
    method: 'DELETE'
  });
}

export async function updateAsset(id: string, tags: string[]) {
  return request<any>(`/internal/v1/asset/world/assets/${id}`, {
    method: 'PUT',
    body: JSON.stringify({ tags })
  });
}

// ==========================================
// Next-Gen Hierarchy & Production API Client (Local Router)
// ==========================================

export async function fetchEpisodes(projectId?: string) {
  const path = projectId 
    ? `/internal/v1/asset/world/episodes?projectId=${projectId}`
    : `/internal/v1/asset/world/episodes`;
  return request<any>(path, { cache: 'no-store' });
}

export async function createEpisode(data: { projectId?: string, universeId?: string, title: string, episodeType?: string, script?: string, tags?: string[], meta?: any }) {
  const body = { 
    ...data, 
    projectId: data.projectId || data.universeId,
    universeId: data.projectId || data.universeId 
  };
  return request<any>('/internal/v1/asset/world/episodes', {
    method: 'POST',
    body: JSON.stringify(body)
  });
}

export async function updateEpisode(data: { id: string, title?: string, episodeType?: string, script?: string, tags?: string[], meta?: any }) {
  const { id, ...body } = data;
  return request<any>(`/internal/v1/asset/world/episodes/${id}`, {
    method: 'PUT',
    body: JSON.stringify(body)
  });
}

export async function deleteEpisode(id: string) {
  return request<any>(`/internal/v1/asset/world/episodes/${id}`, {
    method: 'DELETE'
  });
}

export async function fetchScenes(episodeId: string) {
  return request<any>(`/internal/v1/asset/world/scenes?episodeId=${episodeId}`, { cache: 'no-store' });
}

export async function createScene(data: { episodeId: string, sceneNumber?: number, title: string, description?: string, prompt: string, imageUrl?: string, tags?: string[], meta?: any }) {
  return request<any>('/internal/v1/asset/world/scenes', {
    method: 'POST',
    body: JSON.stringify(data)
  });
}

export async function updateScene(data: { id: string, title?: string, description?: string, prompt?: string, imageUrl?: string, tags?: string[], meta?: any }) {
  const { id, ...body } = data;
  return request<any>(`/internal/v1/asset/world/scenes/${id}`, {
    method: 'PUT',
    body: JSON.stringify(body)
  });
}

export async function deleteScene(id: string) {
  return request<any>(`/internal/v1/asset/world/scenes/${id}`, {
    method: 'DELETE'
  });
}

export async function fetchStoryboardAssets(episodeId: string) {
  return request<any>(`/internal/v1/asset/world/episodes/${episodeId}/storyboard-assets`, { 
    cache: 'no-store',
    timeoutMs: 30000 // 30s timeout cho Storyboard Assets
  });
}

// ==========================================
// Unified Job Management API Client
// ==========================================

export async function fetchJobs(limit = 100) {
  const data = await request<{ data?: any[] }>(`/internal/v1/jobs?limit=${limit}`, { 
    cache: 'no-store',
    timeoutMs: 30000 // 30s timeout cho Jobs
  });
  return data.data || [];
}

export async function fetchJobById(id: string) {
  return request<any>(`/internal/v1/jobs/${id}`, {
    cache: 'no-store'
  });
}

export async function deleteJob(id: string) {
  return request<any>(`/internal/v1/jobs/${id}`, {
    method: 'DELETE'
  });
}

export async function clearAllJobs() {
  return request<any>('/internal/v1/jobs', {
    method: 'DELETE'
  });
}

// ==========================================
// Screenplay AI Director & Evaluator API
// ==========================================
export async function analyzeEpisodeScript(
  episodeId: string, 
  scriptText?: string, 
  accessToken?: string,
  options?: { totalDuration?: number; avgShotDuration?: number; existingAssets?: string }
) {
  try {
    const res = await request<any>(`/internal/v1/asset/world/episodes/${episodeId}/analyze`, {
      method: 'POST',
      body: JSON.stringify({ scriptText, accessToken, ...options })
    });
    if (res && (res.status === "error" || res.code === "HUB_ERROR" || res.error)) {
      throw new Error(res.message || res.error || "HUB_ERROR: Backend failed to analyze script");
    }
    return res;
  } catch (err: any) {
    console.error('[API.ts] Direct analyze failed:', err);
    throw err;
  }
}

export async function evaluateEpisodeScript(episodeId: string, scriptText?: string, accessToken?: string) {
  try {
    const res = await request<any>(`/internal/v1/asset/world/episodes/${episodeId}/evaluate`, {
      method: 'POST',
      body: JSON.stringify({ scriptText, accessToken })
    });
    if (res && (res.status === "error" || res.code === "HUB_ERROR" || res.error)) {
      throw new Error(res.message || res.error || "HUB_ERROR: Backend failed to evaluate script");
    }
    return res;
  } catch (err: any) {
    console.error('[API.ts] Direct evaluate failed:', err);
    throw err;
  }
}

export async function extractCharactersWithAI(premise: string, existingCharacters: string[]) {
  const prompt = `You are a professional Screenplay Parser. Analyze the following story premise and extract character names mentioned.
  Available characters in the project: ${existingCharacters.join(', ')}.
  
  Premise: "${premise}"
  
  Instructions:
  1. Identify all actual character names mentioned in the premise.
  2. Map them/favor the names from the available characters list if they match (case-insensitive).
  3. Correct common misspellings (e.g., "wollfie" -> "Wolfie", "chole" -> "Chloe", "killo" -> "Kilo").
  4. Output ONLY a valid JSON array of strings containing the unique character names (e.g. ["Kilo", "Bruno", "Wolfie", "Chloe"]). Do NOT include markdown formatting or additional explanation.`;

  let result: string[] = [];
  try {
    console.log("[API.ts] Routing LLM (extractCharactersWithAI) through Hub Gateway natively...");
    const res = await request<any>('/internal/v1/media/prompt', {
      method: 'POST',
      body: JSON.stringify({
        prompt: prompt,
        config: { jobType: "text", purpose: "extractCharactersWithAI" }
      })
    });

    const text = res.data?.text ;
    const cleanText = text.replace(/```json/g, '').replace(/```/g, '').trim();
    const arr = JSON.parse(cleanText);
    
    if (Array.isArray(arr)) {
      result = arr.map((s: any) => String(s).trim());
    } else {
      throw new Error("Invalid response format: expected a JSON array of character names.");
    }
  } catch (e: any) {
    console.error("[API.ts] LLM character extraction failed via Vidtory SDK:", e.message || e);
    throw e;
  }

  // Double check and correct common spelling errors & case alignment
  const corrections: Record<string, string> = {
    wollfie: "Wolfie",
    wolfie: "Wolfie",
    wolfi: "Wolfie",
    chole: "Chloe",
    chloe: "Chloe",
    cloe: "Chloe",
    killo: "Kilo",
    kilo: "Kilo",
    bruno: "Bruno"
  };

  const finalMapped: string[] = [];
  result.forEach(name => {
    const lower = name.toLowerCase();
    if (corrections[lower]) {
      finalMapped.push(corrections[lower]);
      return;
    }
    const dbMatch = existingCharacters.find(c => c.toLowerCase() === lower);
    if (dbMatch) {
      finalMapped.push(dbMatch);
      return;
    }
    // Strict filtering: Only allow if it's one of the core characters, otherwise discard to prevent unwanted entity injection
    const isCore = ["kilo", "bruno", "wolfie", "chloe"].includes(lower);
    if (isCore) {
      finalMapped.push(name.charAt(0).toUpperCase() + name.slice(1).toLowerCase());
    }
  });

  return Array.from(new Set(finalMapped));
}

export async function fetchSettings() {
  let localSettings = {};
  if (typeof window !== 'undefined') {
    try {
      const stored = localStorage.getItem('STORYMEE_GLOBAL_SETTINGS');
      if (stored) {
        localSettings = JSON.parse(stored);
      }
    } catch (e) {}
  }
  
  try {
    const data = await request<any>('/internal/v1/asset/world/settings', { cache: 'no-store' });
    return { ...localSettings, ...(data.data || data) };
  } catch (err) {
    console.warn("Backend settings sync failed, using localStorage only.");
    return localSettings;
  }
}

export async function updateSettings(data: { 
  gatewayType?: string; 
  hubUrl?: string; 
  hubApiKey?: string; 
  sdkUrl?: string; 
  sdkApiKey?: string; 
  promptProvider?: string; 
  mediaProvider?: string; 
  universalNegativePrompt?: string;
  geminiApiKey?: string;
  activeProvider?: string;
  llmProvider?: string;
  imageProvider?: string;
  videoProvider?: string;
  hubLlmModel?: string;
  hubImageModel?: string;
  hubVideoModel?: string;
  sdkLlmModel?: string;
  sdkImageModel?: string;
  sdkVideoModel?: string;
  googleLlmModel?: string;
  googleImageModel?: string;
  googleVideoModel?: string;
  dreaminaImageModel?: string;
  dreaminaVideoModel?: string;
  buildMode?: string;
  zlproxyKey?: string;
  useZlproxyForGflow?: boolean;
  useZlproxyForAIWorkers?: boolean;
  disableWebpConversion?: boolean;
}) {
  if (typeof window !== 'undefined') {
    try {
      const existingStr = localStorage.getItem('STORYMEE_GLOBAL_SETTINGS');
      const existing = existingStr ? JSON.parse(existingStr) : {};
      const newData = { ...existing, ...data };
      localStorage.setItem('STORYMEE_GLOBAL_SETTINGS', JSON.stringify(newData));
    } catch (e) {
      console.warn("Could not save settings to localStorage", e);
    }
  }

  try {
    const result = await request<any>('/internal/v1/asset/world/settings', {
      method: 'POST',
      body: JSON.stringify(data)
    });
    return result.data || result;
  } catch (err) {
    console.warn("Backend settings update failed, falling back to localStorage only.", err);
    return data;
  }
}

export async function refinePromptWithAI(
  projectId: string,
  originalPrompt: string,
  feedback: string,
  type: 'storyboard' | 'video' | 'variant'
): Promise<string> {
  const res = await request<any>('/worker/v1/media/agent/refine-prompt', {
    method: 'POST',
    body: JSON.stringify({ projectId, originalPrompt, feedback, type })
  });
  return res.data?.refinedPrompt || originalPrompt;
}

export async function chatWithCopilot(
  projectId: string, 
  messages: any[], 
  worldBible?: any,
  scriptText?: string,
  scenes?: any[],
  shots?: any[],
  actionType?: string
) {
  return request<any>(`/internal/v1/asset/world/projects/${projectId}/chat-copilot`, {
    method: 'POST',
    body: JSON.stringify({ messages, worldBible, scriptText, scenes, shots, actionType }),
    timeoutMs: 60000
  });
}

export async function extractBible(projectId: string, chatHistory: any[]) {
  return request<any>(`/internal/v1/asset/world/projects/${projectId}/extract-bible`, {
    method: 'POST',
    body: JSON.stringify({ chatHistory }),
    timeoutMs: 60000
  });
}




