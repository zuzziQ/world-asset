// Kế hoạch âm thanh 4 lớp (Pillar 4) chuyển dịch từ Python.
// Đảm bảo tạo kết nối liền mạch giữa các shot quay bằng âm thanh nền liên tục.

export interface AudioCue {
  layer: "score" | "ambient" | "sfx" | "voice";
  scene?: string;
  shot_id?: string;
  start?: number;
  end?: number;
  at?: number;
  mood?: string;
  source?: string;
  desc?: string;
  chars?: string[];
  lead_in?: number;
  note?: string;
  tool: string;
}

const AMBIENT_KEYWORDS: Record<string, string> = {
  forest: "tiếng chim hót, tiếng gió rì rào qua lá cây",
  rung: "tiếng chim hót, tiếng gió rì rào qua lá cây",
  hall: "tiếng vang tĩnh lặng của sảnh lớn, tiếng gió lùa qua khe cửa",
  house: "tiếng tích tắc đồng hồ nhè nhẹ trong phòng khách ấm cúng",
  phòng: "tiếng tích tắc đồng hồ nhè nhẹ trong phòng khách ấm cúng",
  phong: "tiếng tích tắc đồng hồ nhè nhẹ trong phòng khách ấm cúng",
  city: "tiếng rì rào đô thị xa xa, còi xe mờ nhạt",
  sea: "tiếng sóng biển vỗ rì rào, tiếng gió lộng",
};

const getAmbientSound = (location: string, timeOfDay: string = "morning"): string => {
  const env = location.toLowerCase();
  for (const [kw, amb] of Object.entries(AMBIENT_KEYWORDS)) {
    if (env.includes(kw)) return amb;
  }
  return `tiếng ambient nền bối cảnh tương ứng với thời điểm ${timeOfDay}`;
};

export const planAudioForScene = (sceneId: string, shots: any[], sceneMood: string = "neutral", location: string = "bối cảnh"): { sceneId: string; totalDuration: number; cues: AudioCue[] } => {
  const starts: Record<string, number> = {};
  let t = 0;

  shots.forEach((s) => {
    const shotId = s.beat || s.shot_id || "Shot";
    starts[shotId] = t;
    t += Number(s.T || s.duration_target || 4);
  });

  const total = t;
  const cues: AudioCue[] = [];

  // L1 — Score liên tục toàn scene
  cues.push({
    layer: "score",
    scene: sceneId,
    start: 0,
    end: total,
    mood: sceneMood,
    note: "nhạc nền chạy liên tục xuyên suốt toàn scene, không bị cắt theo shot",
    tool: "Suno/Udio",
  });

  // L2 — Ambient toàn scene
  cues.push({
    layer: "ambient",
    scene: sceneId,
    start: 0,
    end: total,
    source: getAmbientSound(location),
    note: "ambient môi trường chạy nền bối cảnh, crossfade ở ranh giới cảnh quay",
    tool: "ElevenLabs SFX",
  });

  // L3 & L4 — SFX và Voice cho từng shot
  shots.forEach((s) => {
    const shotId = s.beat || s.shot_id || "Shot";
    const st = starts[shotId];
    const dur = Number(s.T || s.duration_target || 4);
    const en = st + dur;

    const kind = (s.kind || "").toLowerCase();

    // L3 — SFX cho các shot hành động hoặc cận cảnh chi tiết
    if (["action", "climax", "detail", "cutaway"].includes(kind)) {
      const entryDur = s.structure?.entryDur || 0;
      const coreAt = st + entryDur;
      cues.push({
        layer: "sfx",
        shot_id: shotId,
        at: Number(coreAt.toFixed(1)),
        desc: `SFX diễn tả: ${s.description || s.diễn_tả || ""}`,
        tool: "SFX library/Foley",
      });
    }

    // L4 — Voice lồng tiếng đối thoại (hỗ trợ J-Cut tiếng vào trước hình)
    if (kind === "dialogue" && (s.thoại || s.dialogue)) {
      const lead = s.cut_in === "J-Cut" ? 1.0 : 0.0;
      const chars = (s.nhân_vật || s.characters || "")
        .split(",")
        .map((x: string) => x.trim())
        .filter(Boolean);

      cues.push({
        layer: "voice",
        shot_id: shotId,
        start: Number(Math.max(0.0, st - lead).toFixed(1)),
        end: Number(en.toFixed(1)),
        chars,
        lead_in: lead,
        note: lead > 0 ? "J-Cut: tiếng hội thoại đi trước hình ảnh 1 giây" : "",
        tool: "ElevenLabs/VA",
      });
    }
  });

  return { sceneId, totalDuration: total, cues };
};
