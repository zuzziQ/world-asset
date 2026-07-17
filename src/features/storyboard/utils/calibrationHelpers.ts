import { getCleanDnaPrompt, getAssetStyleGuide } from "./helpers";

export const generateAutoCalibration = (scene: any) => {
  const desc = scene.description.toLowerCase();
  
  // Heuristic shot size selection
  let shotSize = "MS - Medium Shot";
  if (desc.includes("nhìn xa") || desc.includes("toàn cảnh") || desc.includes("rừng") || desc.includes("bầu trời") || desc.includes("vô tận")) {
    shotSize = "WS - Wide Shot";
  } else if (desc.includes("khuôn mặt") || desc.includes("biểu cảm") || desc.includes("khóc") || desc.includes("thở") || desc.includes("mắt") || desc.includes("đăm đăm")) {
    shotSize = "CU - Close Up";
  } else if (desc.includes("chi tiết") || desc.includes("bàn tay") || desc.includes("vũ khí") || desc.includes("nhẫn") || desc.includes("chìa khóa")) {
    shotSize = "ECU - Extreme Close Up";
  }

  // Heuristic camera angle selection
  let cameraAngle = "Eye Level";
  if (desc.includes("sợ hãi") || desc.includes("chạy trốn") || desc.includes("dưới lên") || desc.includes("uy lực")) {
    cameraAngle = "Low Angle (Heroic/Tense)";
  } else if (desc.includes("nhìn xuống") || desc.includes("cô đơn") || desc.includes("yếu đuối")) {
    cameraAngle = "High Angle (Vulnerability)";
  } else if (desc.includes("đột biến") || desc.includes("quái vật") || desc.includes("điên loạn") || desc.includes("nguy hiểm")) {
    cameraAngle = "Dutch Angle (Chaos/Instability)";
  }

  // Heuristic camera movement selection
  let cameraMovement = "Dolly In (Focus)";
  if (desc.includes("chạy") || desc.includes("đuổi") || desc.includes("lao đi")) {
    cameraMovement = "Steadicam Follow (Dynamic Action)";
  } else if (desc.includes("quay chậm") || desc.includes("nhìn quanh") || desc.includes("lia")) {
    cameraMovement = "Slow Pan (Revealing)";
  } else if (desc.includes("bất ngờ") || desc.includes("giật mình") || desc.includes("thảng thốt")) {
    cameraMovement = "Dolly Zoom (Vertigo Effect)";
  }

  // Heuristic lighting selection
  let lightingStyle = "Rembrandt Lighting (Dramatic)";
  if (desc.includes("tối") || desc.includes("đêm") || desc.includes("bóng tối") || desc.includes("u ám")) {
    lightingStyle = "Chiaroscuro (High Contrast Low-Key)";
  } else if (desc.includes("rực rỡ") || desc.includes("nắng") || desc.includes("sáng") || desc.includes("bình minh")) {
    lightingStyle = "Golden Hour Warmth";
  } else if (desc.includes("kịch tính") || desc.includes("bí ẩn") || desc.includes("ngược sáng")) {
    lightingStyle = "Cinematic Silhouette";
  }

  // Heuristic lens & focus rig selection
  let focusTransition = "Shallow Depth of Field";
  if (desc.includes("chuyển") || desc.includes("nhìn sang") || desc.includes("tập trung vào")) {
    focusTransition = "Rack Focus";
  }

  let focalLength = "35mm Cine Lens";
  if (shotSize === "WS - Wide Shot") {
    focalLength = "14mm Ultra-wide Lens";
  } else if (shotSize === "CU - Close Up" || shotSize === "ECU - Extreme Close Up") {
    focalLength = "85mm Portrait Lens";
  }

  // Heuristic soundscape
  let ambientSound = "Distant wind, faint ominous drone";
  if (desc.includes("rừng")) {
    ambientSound = "Rừng hoang vắng, tiếng gió xào xạc qua cành cây khô";
  } else if (desc.includes("thành phố") || desc.includes("phố")) {
    ambientSound = "City ambience, distant sirens";
  } else if (desc.includes("quái vật") || desc.includes("kêu") || desc.includes("rú")) {
    ambientSound = "Quái thú gầm rú đằng xa, tiếng cây cối gãy đổ";
  }

  let sfxBeats = "None";
  if (desc.includes("chạy") || desc.includes("vấp")) {
    sfxBeats = "Tiếng bước chân gấp gáp dồn dập, nhịp tim đập mạnh";
  } else if (desc.includes("chém") || desc.includes("vũ khí") || desc.includes("đánh") || desc.includes("cháy")) {
    sfxBeats = "Metallic slash, heavy impact boom";
  } else if (desc.includes("khóc") || desc.includes("nói") || desc.includes("thì thầm")) {
    sfxBeats = "Violin swell, slow dramatic rise";
  }

  let cause = scene.sceneNumber === 1 
    ? `Mở đầu (Inciting Incident): Giới thiệu bối cảnh ${scene.locations?.[0] || 'chính'}.` 
    : `Tiếp nối hệ quả từ Phân cảnh ${scene.sceneNumber - 1}: Khởi đầu ${scene.title || "tình huống mới"}.`;

  let effect = `Mở ra diễn biến tiếp theo cho ${scene.characters?.[0] || 'nhân vật'}.`;
  if (scene.description) {
    const firstSentence = scene.description.split(/[.?!]/)[0];
    effect = `Dẫn dắt mạch truyện: ${firstSentence.substring(0, 80)}${firstSentence.length > 80 ? '...' : ''}`;
  }

  return {
    stage1: {
      shotSize,
      cameraAngle,
      cameraMovement,
      cameraBearing: "0° (Direct Front)",
      cameraAxisLine: "Line A",
      duration: "4.0s"
    },
    stage2: {
      visualDescription: scene.description,
      emotion: desc.includes("sợ") ? "Tense Fear" : desc.includes("vui") ? "Joyful" : desc.includes("giận") ? "Anger" : "Dramatic Focus",
      ambientSound,
      sfxBeats
    },
    stage3: {
      lightingStyle,
      colorTemp: desc.includes("tối") || desc.includes("đêm") ? "Cool Teal & Orange (6000K)" : "Golden Hour Warmth (2700K)",
      cameraRig: desc.includes("chạy") ? "Handheld Steadicam" : "Tripod Fixed",
      focalLength,
      focusTransition
    },
    stage4: {
      groundedPrompt: scene.prompt
    },
    stage5: {
      motionPrompt: "Slow cinematic panning, photorealistic movement, wind blowing, 60fps high quality",
      endFramePrompt: ""
    },
    causalFlow: {
      cause,
      effect,
      dependency: scene.tags ? scene.tags.join(", ") : "None",
      transitionType: desc.includes("bất ngờ") || desc.includes("chạy") ? "Smash Cut (Kịch tính đột ngột)" : desc.includes("nhìn sang") ? "Match Cut (Đồng điệu thị giác)" : "L-Cut (Âm thanh dẫn dắt)",
      transitionJustification: desc.includes("bất ngờ") ? "Tạo cú sốc đột ngột bằng hình ảnh cắt đứt hành động trước đó." : "Chuyển tiếp mượt mà để dẫn dắt mạch tâm lý nhân vật."
    }
  };
};

export const compileGroundedPrompt = (
  scene: any,
  calibrationData: any,
  parsedData: any,
  assetAllocations: Record<string, Record<string, "reuse" | "create">>,
  characterMappings: Record<string, string>,
  locationMappings: Record<string, string>,
  propMappings: Record<string, string>,
  projectAssets: any[],
  projectsList: any[],
  selectedProjectId: string,
  universeVisualPreset: string,
  colorGrade: string,
  cinematicGrain: number,
  depthOfField: number
) => {
  let characterDNA = "";
  let locationDNA = "";
  let propDNA = "";

  // Parse characters in the scene and query DNA
  parsedData?.characters.forEach((scriptChar: any) => {
    if (scene.description.includes(scriptChar.name) || scene.title.includes(scriptChar.name)) {
      const allocation = assetAllocations[scene.id]?.[scriptChar.name] || "reuse";
      if (allocation === "create") {
        characterDNA += `${scriptChar.name} (creating new consistent character profile: ${scriptChar.name} custom details), `;
      } else {
        const mappedId = characterMappings[scriptChar.name];
        if (mappedId) {
          const dbAsset = projectAssets.find(a => a.id === mappedId);
          if (dbAsset) {
            characterDNA += `${scriptChar.name} (grounded appearance: ${getCleanDnaPrompt(dbAsset.description) || dbAsset.name}), `;
          }
        }
      }
    }
  });

  // Parse locations in the scene and query DNA
  parsedData?.locations.forEach((scriptLoc: any) => {
    if (scene.description.includes(scriptLoc.name) || scene.title.includes(scriptLoc.name)) {
      const allocation = assetAllocations[scene.id]?.[scriptLoc.name] || "reuse";
      if (allocation === "create") {
        locationDNA += `${scriptLoc.name} (creating new custom setting matching universe style), `;
      } else {
        const mappedId = locationMappings[scriptLoc.name];
        if (mappedId) {
          const dbAsset = projectAssets.find(a => a.id === mappedId);
          if (dbAsset) {
            const cleanDna = getCleanDnaPrompt(dbAsset.description);
            const styleGuide = getAssetStyleGuide(dbAsset);
            const stylePromptVal = styleGuide?.stylePrompt || "";
            const dnaParts = [];
            if (cleanDna) dnaParts.push(cleanDna);
            if (stylePromptVal) dnaParts.push(stylePromptVal);
            const combinedDna = dnaParts.join("; ");
            locationDNA += `${scriptLoc.name} environment (reusing matched asset layout: ${combinedDna || dbAsset.name}), `;
          }
        }
      }
    }
  });

  // Parse props in the scene
  const parsedProps = parsedData?.props || [];
  parsedProps.forEach((p: any) => {
    const isMentioned = scene.description.toLowerCase().includes(p.name.toLowerCase()) || 
                        scene.title.toLowerCase().includes(p.name.toLowerCase()) ||
                        (p.name.toLowerCase().includes("la bàn") && scene.description.toLowerCase().includes("la bàn")) ||
                        (p.name.toLowerCase().includes("cỗ máy") && scene.description.toLowerCase().includes("cỗ máy")) ||
                        (p.name.toLowerCase().includes("linh kiện") && scene.description.toLowerCase().includes("linh kiện"));
                        
    if (isMentioned) {
      const allocation = assetAllocations[scene.id]?.[p.name] || "reuse";
      if (allocation === "create") {
        propDNA += `${p.name} (creating new styled prop: ${p.name} custom outline), `;
      } else {
        const mappedId = propMappings[p.name];
        if (mappedId) {
          const dbAsset = projectAssets.find(a => a.id === mappedId);
          if (dbAsset) {
            propDNA += `${p.name} (grounded prop item appearance: ${getCleanDnaPrompt(dbAsset.description) || dbAsset.name}), `;
          }
        } else {
          propDNA += `${p.name} (unlinked visual prop), `;
        }
      }
    }
  });

  const currentProject = projectsList.find(p => p.id === selectedProjectId);
  const baseStylePrompt = currentProject?.stylePrompt || "hyper-realistic cinema, anamorphic lens, highly detailed, 8k resolution";
  
  // Mix with Aesthetic Style Calibration Board values dynamically
  const stylePrompt = `${universeVisualPreset} visual style, ${baseStylePrompt}, color grade: ${colorGrade}, cinematic grain: ${cinematicGrain}%, depth of field: ${depthOfField}mm`;

  const { shotSize, cameraAngle, cameraMovement, cameraBearing = "0° (Direct Front)", cameraAxisLine = "Line A" } = calibrationData.stage1;
  const { lightingStyle, colorTemp, focalLength } = calibrationData.stage3;

  let finalPrompt = `Cinematic shot, ${shotSize}, ${cameraAngle}, bearing ${cameraBearing.split(" (")[0]} on ${cameraAxisLine}, ${cameraMovement}. `;
  
  if (characterDNA) {
    finalPrompt += `Featuring: ${characterDNA}`;
  }
  if (locationDNA) {
    finalPrompt += `Set in: ${locationDNA}`;
  }
  if (propDNA) {
    finalPrompt += `With prop: ${propDNA}`;
  }

  finalPrompt += `Action: ${scene.description}. `;
  finalPrompt += `Lighting & Optics: ${lightingStyle}, color temperature ${colorTemp || colorGrade}, shot on ${focalLength || `${depthOfField}mm`}. `;
  finalPrompt += `Aesthetic Style: ${stylePrompt}.`;

  return finalPrompt;
};
