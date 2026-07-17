import { EvaluationResult } from "../types";

export const UNIVERSAL_NEGATIVE_PROMPT = "avoid photorealistic human skin, avoid horror lighting, avoid dark moody room, avoid heavy yellow/orange color cast, avoid cluttered messy apartment, avoid sharp realistic bird beak, avoid realistic feathers, avoid tiny eyes for Mica, avoid adult-like child proportions, avoid inconsistent scale, avoid overly complex clothing, avoid distorted hands, avoid extra fingers, avoid crooked architecture, avoid fisheye distortion, avoid unreadable silhouette, avoid random text, avoid watermark, avoid logos, avoid copying existing copyrighted characters";

export const getCleanDnaPrompt = (description: string) => {
  if (!description) return "";
  const trimmed = description.trim();
  if (trimmed.startsWith("{") && trimmed.endsWith("}")) {
    try {
      const parsed = JSON.parse(trimmed);
      if (parsed.masterDesignPrompt) {
        return parsed.masterDesignPrompt;
      }
      
      // Compile 6-dimension fields if present
      const dimensions = [];
      if (parsed.visualStyle) dimensions.push(`Visual Style: ${parsed.visualStyle}`);
      if (parsed.composition) dimensions.push(`Composition: ${parsed.composition}`);
      if (parsed.colors) dimensions.push(`Colors: ${parsed.colors}`);
      if (parsed.lighting) dimensions.push(`Lighting: ${parsed.lighting}`);
      if (parsed.camera) dimensions.push(`Camera: ${parsed.camera}`);
      if (parsed.attitude) dimensions.push(`Attitude: ${parsed.attitude}`);
      
      if (dimensions.length > 0) {
        return dimensions.join(". ");
      }

      if (parsed.brief) {
        return parsed.brief;
      }
    } catch (e) {
      // ignore
    }
  }
  return description;
};

export const getAssetStyleGuide = (asset: any) => {
  if (!asset || !asset.styleGuide) return null;
  if (typeof asset.styleGuide === "string") {
    try {
      return JSON.parse(asset.styleGuide);
    } catch (e) {
      return null;
    }
  }
  return asset.styleGuide;
};

export const mapEvaluationResult = (raw: any): EvaluationResult => {
  if (!raw) return {
    overallScore: 0,
    subScores: { drama: 0, characterArc: 0, pacing: 0, visualViability: 0 },
    strengths: [],
    weaknesses: [],
    suggestions: [],
    retentionHacks: { hookSuggestions: [], visualRetentionCues: [], pacingAndMusicBeats: [] }
  };

  const drama = raw.subScores?.drama ?? raw.dramaScore ?? raw.drama ?? 0;
  const characterArc = raw.subScores?.characterArc ?? raw.characterArcScore ?? raw.characterArc ?? 0;
  const pacing = raw.subScores?.pacing ?? raw.pacingScore ?? raw.pacing ?? 0;
  const visualViability = raw.subScores?.visualViability ?? raw.visualViabilityScore ?? raw.visualViability ?? 0;

  let hookSuggestions: string[] = [];
  let visualRetentionCues: string[] = [];
  let pacingAndMusicBeats: string[] = [];

  if (Array.isArray(raw.retentionHacks)) {
    raw.retentionHacks.forEach((item: any) => {
      const str = String(item);
      const lower = str.toLowerCase();
      if (lower.includes("hook") || lower.includes("mở đầu") || lower.includes("giây")) {
        hookSuggestions.push(str);
      } else if (lower.includes("thị giác") || lower.includes("hình ảnh") || lower.includes("nhìn") || lower.includes("mắt")) {
        visualRetentionCues.push(str);
      } else {
        pacingAndMusicBeats.push(str);
      }
    });
    if (hookSuggestions.length === 0 && raw.retentionHacks.length > 0) {
      hookSuggestions = [String(raw.retentionHacks[0])];
      if (raw.retentionHacks.length > 1) {
        visualRetentionCues = [String(raw.retentionHacks[1])];
      }
      if (raw.retentionHacks.length > 2) {
        pacingAndMusicBeats = raw.retentionHacks.slice(2).map(String);
      }
    }
  } else if (raw.retentionHacks && typeof raw.retentionHacks === "object") {
    hookSuggestions = raw.retentionHacks.hookSuggestions || [];
    visualRetentionCues = raw.retentionHacks.visualRetentionCues || [];
    pacingAndMusicBeats = raw.retentionHacks.pacingAndMusicBeats || [];
  }

  return {
    overallScore: raw.overallScore ?? raw.totalScore ?? raw.score ?? 0,
    subScores: {
      drama,
      characterArc,
      pacing,
      visualViability
    },
    strengths: raw.strengths || [],
    weaknesses: raw.weaknesses || [],
    suggestions: raw.suggestions || [],
    retentionHacks: {
      hookSuggestions,
      visualRetentionCues,
      pacingAndMusicBeats
    },
    skipEditSegments: raw.skipEditSegments || []
  };
};

export const removeDuplicateStylePrompt = (prompt: string, projectStyle: string): string => {
  if (!prompt) return "";
  if (!projectStyle) return prompt;

  const cleanPrompt = prompt.trim();
  const cleanStyle = projectStyle.trim();

  // If the prompt already has the style suffix or contains the style verbatim, return prompt
  if (cleanPrompt.toLowerCase().includes(cleanStyle.toLowerCase())) {
    return cleanPrompt;
  }

  // If the projectStyle is like "DreamWorks-inspired stylized 3D..."
  // and prompt contains "DreamWorks-inspired", don't append it or clean up
  const firstFewWords = cleanStyle.split(/[,\s]+/).slice(0, 3).join(" ");
  if (firstFewWords && cleanPrompt.toLowerCase().includes(firstFewWords.toLowerCase())) {
    return cleanPrompt;
  }

  // Remove trailing "Style:" or "StyleGuide:" from prompt if any
  let normalized = cleanPrompt;
  const styleKeywords = ["style:", "style guide:", "visual style:"];
  for (const kw of styleKeywords) {
    const idx = normalized.toLowerCase().lastIndexOf(kw);
    if (idx !== -1 && idx > normalized.length - kw.length - 150) { // style is near the end
      normalized = normalized.substring(0, idx).trim();
    }
  }

  // Strip trailing punctuation
  normalized = normalized.replace(/[,.;\s]+$/, "");

  return `${normalized}. Style: ${cleanStyle}`;
};
