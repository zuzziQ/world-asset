import { runCinematicPipeline } from "@/lib/cinematic-engine";

export const generateExpandedShots = (
  scenes: any[],
  charNames: string[],
  totalDuration: number = 180,
  avgShotDuration: number = 4,
  scriptText?: string
) => {
  if (!scenes || scenes.length === 0) return [];

  // Calculate number of shots based on duration inputs
  const totalShots = Math.max(scenes.length, Math.round(totalDuration / avgShotDuration));
  const avgDurationPerShot = Number((totalDuration / totalShots).toFixed(1));

  // Distribution logic for scenes
  const shotsPerScene = new Array(scenes.length).fill(0);
  let remainingShots = totalShots;
  for (let i = 0; i < scenes.length; i++) {
    shotsPerScene[i] = 1;
    remainingShots--;
  }
  if (remainingShots > 0) {
    const base = Math.floor(remainingShots / scenes.length);
    for (let i = 0; i < scenes.length; i++) {
      shotsPerScene[i] += base;
    }
    remainingShots = remainingShots % scenes.length;
    for (let i = 0; i < remainingShots; i++) {
      shotsPerScene[i] += 1;
    }
  }

  // Parse scriptText into a map of scene index / sceneNumber -> { dialogues: { character, action, line }[], actionLines: string[] }
  const parsedScenesMap: Record<string, { dialogues: any[], actionLines: string[] }> = {};
  if (scriptText) {
    // Split scriptText by "Cảnh [number]", "Scene [number]", or standard script heading (INT. / EXT. at start of line)
    const blocks = scriptText.split(/(?=Cảnh \d+|Scene \d+|^INT\.|^EXT\.|[\r\n]+(?:INT|EXT)\.)/gi);
    
    // Filter and prepare actual scene blocks
    const actualBlocks: string[] = [];
    blocks.forEach(block => {
      const trimmed = block.trim();
      if (!trimmed) return;
      if (trimmed.match(/^(?:Cảnh|Scene|INT\.|EXT\.)/i)) {
        actualBlocks.push(block);
      }
    });

    actualBlocks.forEach((block, blockIndex) => {
      const dialogues: any[] = [];
      const actionLines: string[] = [];
      const lines = block.split(/\r?\n/);
      
      for (let idx = 0; idx < lines.length; idx++) {
        const line = lines[idx];
        const cleanLine = line.trim();
        if (!cleanLine) continue;
        
        // Skip scene header
        if (cleanLine.match(/^(?:Cảnh|Scene|INT\.|EXT\.)/i)) continue;
        
        // Skip ACT headings and FADE IN / FADE OUT
        if (cleanLine.match(/^(?:ACT\s+[I|V|X]+|FADE\s+IN|FADE\s+OUT|FADE\s+TO)/i)) continue;

        // Check if it starts with "Hành động:"
        if (cleanLine.startsWith("Hành động:")) {
          const actionText = cleanLine.replace(/^Hành động:\s*/i, "").trim();
          if (actionText) actionLines.push(actionText);
          continue;
        }

        // 1. Check for Colon format: "Name: (Action) Dialogue" or "Name: Dialogue"
        const diagMatch = cleanLine.match(/^([^:]+):\s*(?:\(([^)]+)\))?\s*(.*)$/);
        if (diagMatch) {
          const charName = diagMatch[1].trim();
          const isChar = charNames.some(cn => cn.toLowerCase() === charName.toLowerCase()) || 
                         ["mica", "paco", "bố", "kilo", "bruno", "wolfie", "wollfie", "chloe", "elena", "bác bình", "bác chủ tiệm", "cam", "chú vẹt"].includes(charName.toLowerCase());
          if (isChar) {
            dialogues.push({
              character: charName,
              action: diagMatch[2] ? diagMatch[2].trim() : "",
              line: diagMatch[3] ? diagMatch[3].trim() : ""
            });
            continue;
          }
        }

        // 2. Check for Standard Screenplay format
        const isCharName = charNames.some(cn => cn.toLowerCase() === cleanLine.toLowerCase()) || 
                           ["mica", "paco", "bố", "kilo", "bruno", "wolfie", "wollfie", "chloe", "elena", "bác bình", "bác chủ tiệm", "cam", "chú vẹt"].includes(cleanLine.toLowerCase());
        
        if (isCharName && !cleanLine.includes(":") && cleanLine.length < 30) {
          // Look ahead to check parenthetical and/or dialogue text
          let nextLine = "";
          let lookAheadIdx = idx + 1;
          
          while (lookAheadIdx < lines.length && !nextLine) {
            const candidate = lines[lookAheadIdx].trim();
            if (candidate) {
              nextLine = candidate;
            } else {
              lookAheadIdx++;
            }
          }
          
          if (nextLine) {
            if (nextLine.startsWith("(")) {
              const paren = nextLine.replace(/[()]/g, "").trim();
              
              let nextNextLine = "";
              let lookAheadIdx2 = lookAheadIdx + 1;
              while (lookAheadIdx2 < lines.length && !nextNextLine) {
                const candidate = lines[lookAheadIdx2].trim();
                if (candidate) {
                  nextNextLine = candidate;
                } else {
                  lookAheadIdx2++;
                }
              }
              
              if (nextNextLine) {
                dialogues.push({
                  character: cleanLine,
                  action: paren,
                  line: nextNextLine
                });
                idx = lookAheadIdx2;
                continue;
              }
            } else {
              dialogues.push({
                character: cleanLine,
                action: "",
                line: nextLine
              });
              idx = lookAheadIdx;
              continue;
            }
          }
        }

        // 3. Otherwise, treat as action line
        if (!cleanLine.includes(":")) {
          actionLines.push(cleanLine);
        }
      }

      const matchNum = block.match(/(?:Cảnh|Scene)\s+(\d+)/i);
      if (matchNum) {
        const sceneNum = parseInt(matchNum[1]);
        parsedScenesMap[`num_${sceneNum}`] = { dialogues, actionLines };
      }
      
      parsedScenesMap[`idx_${blockIndex}`] = { dialogues, actionLines };
    });
  }

  const sampleBeats = (pool: any[], K: number, sceneCode: string) => {
    if (K <= 0) return [];
    const sampled: any[] = [];
    if (K === 1) {
      const idx = Math.min(pool.length - 1, 0); // Always start with establishing if K=1
      sampled.push({
        ...pool[idx],
        beat: `${sceneCode}_B01`,
        sc: sceneCode,
        T: avgShotDuration,
        shotNumber: 1
      });
    } else if (K === 2) {
      sampled.push({
        ...pool[0],
        beat: `${sceneCode}_B01`,
        sc: sceneCode,
        T: avgShotDuration,
        shotNumber: 1
      });
      sampled.push({
        ...pool[Math.min(pool.length - 1, pool.length > 2 ? 2 : 1)],
        beat: `${sceneCode}_B02`,
        sc: sceneCode,
        T: avgShotDuration,
        shotNumber: 2
      });
    } else {
      for (let j = 0; j < K; j++) {
        let index = 0;
        if (K > 1) {
          index = Math.min(pool.length - 1, Math.round((j / (K - 1)) * (pool.length - 1)));
        }
        const baseBeat = pool[index];
        sampled.push({
          ...baseBeat,
          beat: `${sceneCode}_B${String(j + 1).padStart(2, "0")}`,
          sc: sceneCode,
          T: avgShotDuration,
          shotNumber: j + 1
        });
      }
    }
    return sampled;
  };

  const result: any[] = [];
  scenes.forEach((s, i) => {
    const scNumber = s.sceneNumber || (i + 1);
    const scCode = `SC${String(scNumber).replace(/[^0-9]/g, "").padStart(2, "0") || "01"}`;
    const count = shotsPerScene[i];
    
    const desc = s.description || "";
    const title = s.title || "";
    
    // Retrieve dialogues and action lines parsed from scriptText
    const blockData = parsedScenesMap[`num_${scNumber}`] || parsedScenesMap[`idx_${i}`];
    const dialogues = blockData ? blockData.dialogues : [];
    
    // Build action lines: either from parser or split from scene description
    let actionLines = blockData ? blockData.actionLines : [];
    if (actionLines.length === 0) {
      // Split scene description by sentences
      actionLines = desc.split(/(?<=[.!?])\s+/).filter(Boolean);
    }
    
    // Find characters in the scene
    const sceneChars = charNames.filter(name => 
      desc.toLowerCase().includes(name.toLowerCase()) || 
      title.toLowerCase().includes(name.toLowerCase()) ||
      dialogues.some((d: any) => d.character.toLowerCase() === name.toLowerCase())
    );
    
    // Explicit character role assignment: no fallbacks to unmentioned characters!
    const primeChar = sceneChars[0] || "";
    const secondChar = sceneChars[1] || "";
    const locName = s.location || title || "không gian";

    // Build pool dynamically
    const pool: any[] = [];

    // Slot 1: Establishing Shot
    {
      const act = actionLines[0] || desc || "";
      const isChar = sceneChars.length > 0;
      const charStr = sceneChars.join(", ");
      const visualText = `Cinematic establishing shot, wide angle view of ${locName}${isChar ? ` featuring ${charStr}` : ""}. ${act}. Pixar-style 3D animation, soft volume lighting.`;

      pool.push({
        kind: "establishing",
        function: "setup",
        diễn_tả: `Cảnh toàn rộng (Establishing Shot) thiết lập bối cảnh tại ${locName}. ${act}`,
        description: `Cảnh toàn rộng (Establishing Shot) thiết lập bối cảnh tại ${locName}. ${act}`,
        mục_tiêu: `Định vị không gian bối cảnh ${locName} và thiết lập bầu không khí chung cho phân cảnh.`,
        objective: `Định vị không gian bối cảnh ${locName} và thiết lập bầu không khí chung cho phân cảnh.`,
        hình_ảnh: visualText,
        visual: visualText,
        assetDnaRefs: `Location Ref (${locName})`,
        causalLink: `Thiết lập bối cảnh nền trước khi tiến gần vào chi tiết của các nhân vật và hành động tiếp diễn.`,
        cameraMovement: "Static Tilt",
        angle: "High Angle",
        nhân_vật: charStr,
        characters: charStr,
        bối_cảnh: locName,
        location: locName,
        đạo_cụ: "",
        props: "",
        thoại: "",
        dialogue: ""
      });
    }

    // Slot 2: Detail Shot
    {
      const act = actionLines[1] || actionLines[0] || desc || "";
      const isChar = sceneChars.length > 0;
      const target = primeChar || "";
      const detailTarget = s.props && s.props.length > 0 ? s.props[0].name : "chi tiết bối cảnh";
      const visualText = `Close-up detail shot, shallow depth of field. Focus on ${isChar ? `${target}'s physical action / hand detail` : detailTarget}. ${act}. Vibrant textures, cinematic lighting.`;

      pool.push({
        kind: "detail",
        function: "setup",
        diễn_tả: `Cận cảnh (Close-Up) chi tiết: ${act}`,
        description: `Cận cảnh (Close-Up) chi tiết: ${act}`,
        mục_tiêu: `Lột tả chi tiết vật lý hoặc biểu cảm cụ thể, tăng tính chân thực và nhân quả cho phân đoạn.`,
        objective: `Lột tả chi tiết vật lý hoặc biểu cảm cụ thể, tăng tính chân thực và nhân quả cho phân đoạn.`,
        hình_ảnh: visualText,
        visual: visualText,
        assetDnaRefs: target ? `Character Ref (${target})` : `Prop Ref (${detailTarget})`,
        causalLink: `Làm nổi bật đạo cụ hoặc tiểu tiết vật lý để tạo cơ sở logic cho các hành động sau đó.`,
        cameraMovement: "Zoom In/Out",
        angle: "Close-up",
        nhân_vật: target,
        characters: target,
        bối_cảnh: locName,
        location: locName,
        đạo_cụ: detailTarget,
        props: detailTarget,
        thoại: "",
        dialogue: ""
      });
    }

    // Slot 3: Action Shot
    {
      const act = actionLines[2] || actionLines[0] || desc || "";
      const isChar = sceneChars.length > 0;
      const target = primeChar || "";
      let dialogStr = "";
      if (dialogues.length > 0) {
        const d = dialogues[0];
        dialogStr = `${d.character}: "${d.line}"`;
      }
      const visualText = `Cinematic medium shot, dynamic camera focusing on ${isChar ? target : "the action"}. ${act}. Pixar-Disney aesthetic, expressive look, clear shadows.`;

      pool.push({
        kind: "action",
        function: "inciting_incident",
        diễn_tả: `Trung cảnh (Medium Shot): Tập trung vào ${isChar ? target : "không gian"} thực hiện hành động chính: ${act}`,
        description: `Trung cảnh (Medium Shot): Tập trung vào ${isChar ? target : "không gian"} thực hiện hành động chính: ${act}`,
        mục_tiêu: `Thực hiện hành động chính kịch tính, đóng vai trò Causal Trigger kích hoạt toàn bộ diễn biến tiếp theo.`,
        objective: `Thực hiện hành động chính kịch tính, đóng vai trò Causal Trigger kích hoạt toàn bộ diễn biến tiếp theo.`,
        hình_ảnh: visualText,
        visual: visualText,
        assetDnaRefs: target ? `Character Ref (${target})` : `Location Ref (${locName})`,
        causalLink: `Hành động quyết đoán này trực tiếp châm ngòi phản ứng tâm lý hoặc hành động tiếp theo của nhân vật.`,
        cameraMovement: "Tracking Shot",
        angle: "Eye-Level",
        nhân_vật: target,
        characters: target,
        bối_cảnh: locName,
        location: locName,
        đạo_cụ: "",
        props: "",
        thoại: dialogStr,
        dialogue: dialogStr
      });
    }

    // Slot 4: Reaction Shot (Only generated as character reaction if secondChar is present)
    {
      const act = actionLines[3] || actionLines[1] || actionLines[0] || desc || "";
      const hasSecond = secondChar !== "";
      const target = hasSecond ? secondChar : (primeChar || "");
      const isChar = target !== "";
      
      let dialogStr = "";
      if (hasSecond && dialogues.length > 1) {
        const d = dialogues[1];
        dialogStr = `${d.character}: "${d.line}"`;
      } else if (dialogues.length > 0) {
        const d = dialogues[0];
        dialogStr = `${d.character}: "${d.line}"`;
      }

      const visualText = `Close-up shot of ${isChar ? target : "the scene"}, showing expressive reaction. ${act}. Soft rim lighting, detailed animated character model.`;

      pool.push({
        kind: "reaction",
        function: "rising_action",
        diễn_tả: `Cận cảnh (Close-Up) phản ứng biểu cảm của ${isChar ? target : "môi trường"}: ${act}`,
        description: `Cận cảnh (Close-Up) phản ứng biểu cảm của ${isChar ? target : "môi trường"}: ${act}`,
        mục_tiêu: `Lột tả Causal Effect trực tiếp trên biểu cảm và thái độ của nhân vật phản ứng.`,
        objective: `Lột tả Causal Effect trực tiếp trên biểu cảm và thái độ của nhân vật phản ứng.`,
        hình_ảnh: visualText,
        visual: visualText,
        assetDnaRefs: target ? `Character Ref (${target})` : `Location Ref (${locName})`,
        causalLink: `Phản ứng cảm xúc này làm gia tăng căng thẳng kịch tính, dẫn tới cuộc đối thoại trực diện.`,
        cameraMovement: "Pan Left/Right",
        angle: "Close-up",
        nhân_vật: target,
        characters: target,
        bối_cảnh: locName,
        location: locName,
        đạo_cụ: "",
        props: "",
        thoại: dialogStr,
        dialogue: dialogStr
      });
    }

    // Slot 5: Dialogue Shot
    {
      const act = actionLines[4] || actionLines[2] || actionLines[0] || desc || "";
      const hasTwo = primeChar !== "" && secondChar !== "";
      const target = primeChar || "";
      const other = secondChar || "";
      
      let dialogStr = "";
      if (dialogues.length > 2) {
        const d = dialogues[2];
        dialogStr = `${d.character}: "${d.line}"`;
      } else if (dialogues.length > 0) {
        const d = dialogues[dialogues.length - 1];
        dialogStr = `${d.character}: "${d.line}"`;
      }

      const charStr = hasTwo ? `${target} and ${other}` : (target ? target : "");
      const visualText = hasTwo
        ? `Over-the-shoulder reverse shot of ${target} speaking to ${other}. ${act}. Pixar toy-like tactile skin, beautiful expressions, warm rim lighting.`
        : `Medium shot focusing on ${target || "the environment"}. ${act}. Detailed character render, 3D style.`;

      pool.push({
        kind: "dialogue",
        function: "climax",
        diễn_tả: hasTwo
          ? `Trung cảnh qua vai (OTS Shot): Đối thoại trực tiếp giữa ${target} và ${other}. ${act}`
          : `Trung cảnh (Medium Shot): Tương tác thoại của ${target || "nhân vật"}. ${act}`,
        description: hasTwo
          ? `Trung cảnh qua vai (OTS Shot): Đối thoại trực tiếp giữa ${target} và ${other}. ${act}`
          : `Trung cảnh (Medium Shot): Tương tác thoại của ${target || "nhân vật"}. ${act}`,
        mục_tiêu: `Chốt hạ mâu thuẫn chính của phân cảnh thông qua những câu thoại và tương tác đắt giá.`,
        objective: `Chốt hạ mâu thuẫn chính của phân cảnh thông qua những câu thoại và tương tác đắt giá.`,
        hình_ảnh: visualText,
        visual: visualText,
        assetDnaRefs: hasTwo ? `Character Ref (${target}), Character Ref (${other})` : (target ? `Character Ref (${target})` : `Location Ref (${locName})`),
        causalLink: `Tương tác thoại giải quyết nút thắt hoặc tạo ra động cơ hành động mới trước khi chuyển sang cảnh tiếp theo.`,
        cameraMovement: "Static Tilt",
        angle: hasTwo ? "Over the Shoulder" : "Eye-Level",
        nhân_vật: charStr,
        characters: charStr,
        bối_cảnh: locName,
        location: locName,
        đạo_cụ: "",
        props: "",
        thoại: dialogStr,
        dialogue: dialogStr
      });
    }

    // Slot 6: Transition Shot
    {
      const act = actionLines[5] || actionLines[3] || actionLines[0] || desc || "";
      const isChar = sceneChars.length > 0;
      const charStr = sceneChars.join(", ");
      const visualText = `Transition wide-angle shot of ${isChar ? `characters ${charStr}` : "the landscape"}. ${act}. Beautiful lighting gradient fading out.`;

      pool.push({
        kind: "transition",
        function: "resolution",
        diễn_tả: `Trung cảnh góc rộng: ${isChar ? `Nhân vật ${charStr}` : "Cảnh vật"} chuyển tiếp. ${act}`,
        description: `Trung cảnh góc rộng: ${isChar ? `Nhân vật ${charStr}` : "Cảnh vật"} chuyển tiếp. ${act}`,
        mục_tiêu: `Giải tỏa áp lực cảnh hiện tại và bắc cầu liên kết nhân quả logic sang phân cảnh kế tiếp.`,
        objective: `Giải tỏa áp lực cảnh hiện tại và bắc cầu liên kết nhân quả logic sang phân cảnh kế tiếp.`,
        hình_ảnh: visualText,
        visual: visualText,
        assetDnaRefs: isChar ? `Character Ref (${charStr}), Location Ref (${locName})` : `Location Ref (${locName})`,
        causalLink: `Bắc cầu liên kết không gian và thời gian sang đầu phân cảnh kế tiếp.`,
        cameraMovement: "Crane Up/Down",
        angle: "High Angle",
        nhân_vật: charStr,
        characters: charStr,
        bối_cảnh: locName,
        location: locName,
        đạo_cụ: "",
        props: "",
        thoại: "",
        dialogue: ""
      });
    }

    const sampled = sampleBeats(pool, count, scCode);
    result.push(...sampled);
  });

  const rawShots = result.map((sh: any) => {
    const rawCharRefs = sh.characters ? sh.characters.split(/,\s*/).map((c: string) => c.trim()).filter(Boolean) : [];
    return {
      id: sh.id || sh.beat || `shot-${Math.random()}`,
      scene_id: sh.sc || sh.sceneId || "SC01",
      shotNumber: sh.shotNumber || parseInt(sh.beat?.replace(/\D/g, "") || "1"),
      shot_type: sh.kind?.toUpperCase() || "ACTION",
      framing: sh.angle?.toUpperCase() || "MEDIUM",
      duration_target: sh.duration || sh.T || 4,
      camera_movement: sh.cameraMovement?.toUpperCase() || "STATIC",
      action_description: sh.description || sh.diễn_tả || "",
      character_refs: rawCharRefs,
      scene_ref: sh.location || sh.bối_cảnh || "",
      ...sh
    };
  });

  const { optimizedShots } = runCinematicPipeline(rawShots);
  return optimizedShots;
};
