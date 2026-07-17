export * from "./models";
export * from "./cameraOptimizer";
export * from "./cutPlanner";
export * from "./shotStructure";
export * from "./audioPlanner";

import { CinematicShot } from "./models";
import { assignCameraAngles } from "./cameraOptimizer";
import { planCuts } from "./cutPlanner";
import { planShotStructures } from "./shotStructure";
import { planAudioForScene } from "./audioPlanner";

/**
 * Main Deterministic Engine Pipeline
 * Converts raw shots or beats into fully planned cinematic shots.
 */
export function runCinematicPipeline(rawShots: CinematicShot[]): { 
  optimizedShots: CinematicShot[], 
  warnings: string[],
  glueNotes: string[] 
} {
  // Step 0: Normalize character_refs to strings to fix camera intersection & templating bugs
  for (const shot of rawShots) {
    if (shot.character_refs) {
      shot.character_refs = shot.character_refs.map((c: any) => {
        if (!c) return "";
        if (typeof c === "string") return c;
        return c.scriptName || c.name || "";
      }).filter(Boolean);
    }
  }

  // Step 1: Plan cuts and discontinuity risk (inject glue shots)
  const { optimizedShots, glueNotes } = planCuts(rawShots);
  
  // Step 2: Assign camera angles and check 30/180 degree rules
  const warnings = assignCameraAngles(optimizedShots, "A");
  
  // Step 3: Map 3-part prompt structure [ENTRY, CORE, EXIT]
  planShotStructures(optimizedShots);

  // Step 4: Write back to UI-expected fallback properties and plan audio
  // Group optimizedShots by scene_id to generate scene-level audio plans
  const sceneShotsMap: Record<string, CinematicShot[]> = {};
  for (const shot of optimizedShots) {
    const sId = shot.scene_id || "SC01";
    if (!sceneShotsMap[sId]) sceneShotsMap[sId] = [];
    sceneShotsMap[sId].push(shot);
  }

  for (const [sceneId, sceneShots] of Object.entries(sceneShotsMap)) {
    const firstShot = sceneShots[0];
    const location = firstShot.scene_ref || firstShot.bối_cảnh || "bối cảnh";
    
    // Check if the script contains mood clues, fallback to neutral
    const mood = firstShot.action_description?.toLowerCase().includes("căng thẳng") ? "suspense" : "neutral";
    const audioPlan = planAudioForScene(sceneId, sceneShots, mood, location);

    for (const shot of sceneShots) {
      // Set angle string for UI and prompt builder
      if (shot.camera_angle) {
        shot.angle = `${shot.camera_angle.height}-Level (Bearing: ${shot.camera_angle.bearing}°, Side: ${shot.camera_angle.side})`;
      } else {
        shot.angle = shot.angle || "Eye-Level";
      }

      // Set cameraMovement string
      if (shot.camera_movement) {
        shot.cameraMovement = shot.camera_movement;
      }

      // Sync duration
      if (shot.duration_target) {
        shot.duration = shot.duration_target;
      }

      // Plan audio cues for this shot
      const shotCues = audioPlan.cues.filter(c => c.shot_id === shot.id);
      
      // Also add scene-wide cues (ambient & score) to the first shot of the scene
      if (shot.id === firstShot.id) {
        const sceneWideCues = audioPlan.cues.filter(c => c.layer === "score" || c.layer === "ambient");
        shotCues.push(...sceneWideCues);
      }

      // Attach audio plan info to the shot
      (shot as any).audioCues = shotCues;
      (shot as any).audioPlanSummary = `Score: ${mood}, Ambient: ${location}`;

      // Build structured prompt for visual/hình_ảnh if not already set, ensuring character names are present
      if (shot.structure) {
        const pGrid = (shot as any).panelGrid;
        if (pGrid && pGrid !== '1x1' && pGrid !== 'auto') {
          const activeCharStr = shot.character_refs && shot.character_refs.length > 0 ? shot.character_refs.join(", ") : "";
          const weather = (shot as any).weather || "";
          const lighting = (shot as any).lighting || "";
          
          shot.visual = buildVisualPromptForGrid(
            pGrid,
            shot.action_description || "",
            location,
            weather,
            lighting,
            shot.shot_type || shot.kind || "action",
            shot.angle || "Eye-Level",
            activeCharStr
          );
          (shot as any).hình_ảnh = shot.visual;
        } else {
          const entry = shot.structure.entry;
          const core = shot.structure.core || shot.action_description;
          const exit = shot.structure.exit;
          const cameraDesc = `Cinematic ${shot.angle} shot, ${shot.framing || "Medium Close-up"}, camera movement: ${shot.cameraMovement || "Static"}`;
          
          const visualPrompt = `[CAMERA] ${cameraDesc}. [ENTRY] ${entry}. [CORE] ${core}. [EXIT] ${exit}.`;
          shot.visual = visualPrompt;
          (shot as any).hình_ảnh = visualPrompt;
        }
      }
    }
  }
  
  return { optimizedShots, warnings, glueNotes };
}

export const buildVisualPromptForGrid = (
  grid: string,
  description: string,
  locName: string,
  weather: string,
  lighting: string,
  kind: string,
  angle: string,
  activeCharStr: string
): string => {
  const weatherStr = weather ? `, in ${weather} weather` : "";
  const lightStr = lighting ? `, under ${lighting} lighting` : "";
  
  if (!grid || grid === '1x1' || grid === 'auto') {
    const target = activeCharStr ? activeCharStr : "the scene";
    return `Cinematic ${kind} shot, ${angle} view, focusing on ${target}. ${description}${weatherStr}${lightStr}. Pixar-style 3D animation, soft volume lighting, expressive details.`;
  }

  const sentences = description.split(/(?<=[.!?])\s+/).filter(Boolean);
  
  const getSentence = (idx: number) => {
    if (sentences.length === 0) return description;
    return sentences[idx % sentences.length];
  };

  let panelPrompts: string[] = [];
  
  if (grid === '1x2') {
    panelPrompts.push(`Panel 1/2 (Left): [CAMERA] Establishing wide view of ${locName}${lightStr}. [CORE] ${getSentence(0)}. [STYLE] Pixar 3D.`);
    panelPrompts.push(`Panel 2/2 (Right): [CAMERA] Reverse medium angle. [CORE] ${getSentence(1) || 'Dynamic interaction/atmosphere detail'}. [STYLE] Pixar 3D.`);
  } else if (grid === '2x2') {
    panelPrompts.push(`Panel 1/4 (Top-Left): [CAMERA] Establishing wide angle of ${locName}${weatherStr}. [CORE] ${getSentence(0)}. [STYLE] Pixar 3D.`);
    panelPrompts.push(`Panel 2/4 (Top-Right): [CAMERA] Close-up detail focusing on the environment. [CORE] ${getSentence(1) || 'Detailed atmospheric movement'}. [STYLE] Pixar 3D.`);
    panelPrompts.push(`Panel 3/4 (Bottom-Left): [CAMERA] Medium dynamic angle showing contrast. [CORE] ${getSentence(2) || getSentence(0)}. [STYLE] Pixar 3D.`);
    panelPrompts.push(`Panel 4/4 (Bottom-Right): [CAMERA] High angle overview summarizing the climax. [CORE] ${getSentence(3) || getSentence(1) || 'Climactic atmosphere resolution'}. [STYLE] Pixar 3D.`);
  } else if (grid === '2x3') {
    panelPrompts.push(`Panel 1/6 (Top-Left): [CAMERA] Wide shot of ${locName}${weatherStr}. [CORE] ${getSentence(0)}.`);
    panelPrompts.push(`Panel 2/6 (Top-Center): [CAMERA] Medium camera tracking. [CORE] ${getSentence(1) || 'Atmospheric wind/rain details'}.`);
    panelPrompts.push(`Panel 3/6 (Top-Right): [CAMERA] Low angle detailed view. [CORE] ${getSentence(2) || getSentence(0)}.`);
    panelPrompts.push(`Panel 4/6 (Bottom-Left): [CAMERA] OTS perspective showing depth. [CORE] ${getSentence(3) || getSentence(1) || 'Dramatic lighting contrast'}.`);
    panelPrompts.push(`Panel 5/6 (Bottom-Center): [CAMERA] Extreme close-up on physical elements/props. [CORE] ${getSentence(4) || getSentence(2) || 'Tactile textures'}.`);
    panelPrompts.push(`Panel 6/6 (Bottom-Right): [CAMERA] Wide cinematic sweep fading out. [CORE] ${getSentence(5) || getSentence(0) || 'Atmosphere settling'}.`);
  } else if (grid === '3x3') {
    const positions = ["Top-Left", "Top-Center", "Top-Right", "Middle-Left", "Middle-Center", "Middle-Right", "Bottom-Left", "Bottom-Center", "Bottom-Right"];
    for (let i = 0; i < 9; i++) {
      panelPrompts.push(`Panel ${i+1}/9 (${positions[i]}): [CAMERA] Detailed storyboard angle ${i+1}. [CORE] ${getSentence(i)}.`);
    }
  } else {
    return `Storyboard ${grid} layout sheet featuring ${locName}. Description: ${description}${weatherStr}${lightStr}.`;
  }

  return `[STORYBOARD GRID ${grid}] ${panelPrompts.join("\n")}`;
};

