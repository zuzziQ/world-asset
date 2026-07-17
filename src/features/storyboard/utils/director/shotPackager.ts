// Cấu trúc hóa prompt (ENTRY/CORE/EXIT), lựa chọn image refs (Mode A/B/C) và đóng gói prompt.

export interface ShotStructure {
  entry: string;
  core: string;
  exit: string;
  exitType: string;
  entryDur: number;
  coreDur: number;
  exitDur: number;
}

const EMOTION_ALIAS: Record<string, string> = {
  vui: "happy",
  happy: "happy",
  buon: "sad",
  buôn: "sad",
  sad: "sad",
  gian: "angry",
  giận: "angry",
  angry: "angry",
  ngac_nhien: "surprise",
  "ngạc nhiên": "surprise",
  surprise: "surprise",
  so: "fear",
  sợ: "fear",
  fear: "fear",
  trung_tinh: "neutral",
  neutral: "neutral",
};

const normalizeEmotion = (emotion?: string): string => {
  if (!emotion) return "neutral";
  const key = emotion.trim().toLowerCase();
  return EMOTION_ALIAS[key] || "neutral";
};

const viewForBearing = (bearing: number): string => {
  if (bearing < 30) return "front";
  if (bearing < 75) return "3-4";
  if (bearing < 120) return "side";
  return "back";
};

const splitDurations = (d: number): { entry: number; core: number; exit: number } => {
  let entry = Math.max(1, Math.round(d * 0.18));
  let exit = Math.max(1, Math.round(d * 0.18));
  let core = d - entry - exit;

  if (core < 1) {
    core = 1;
    entry = Math.max(1, Math.floor((d - core) / 2));
    exit = Math.max(1, d - core - entry);
  }

  return { entry, core, exit };
};

const getExitType = (shot: any, nextShot?: any): { type: string; label: string } => {
  if (!nextShot) {
    return shot.kind === "climax"
      ? { type: "FADE", label: "mờ dần (kết chương/đổi cảnh)" }
      : { type: "ZOOM_OUT", label: "camera lùi/zoom out" };
  }

  const prevScene = shot.sc || shot.scene_id || "";
  const nextScene = nextShot.sc || nextShot.scene_id || "";
  if (prevScene !== nextScene) {
    return { type: "FADE", label: "mờ dần (kết chương/đổi cảnh)" };
  }

  const nextCut = (nextShot.cut_in || "").toLowerCase();
  if (nextCut === "cut on action" || nextCut === "cut-on-action") {
    return { type: "MID_ACTION", label: "dừng giữa cử động (phục vụ cut-on-action)" };
  }

  if (nextCut === "reaction shot" || nextCut === "reaction" || nextCut === "cutaway" || nextShot.is_glue) {
    return { type: "LOOK_OFF", label: "nhân vật nhìn ra ngoài khung (dẫn vào reaction/cutaway)" };
  }

  // Mặc định theo loại
  const kind = (shot.kind || "").toLowerCase();
  if (kind === "establishing" || kind === "reaction" || kind === "dialogue" || kind === "detail" || kind === "cutaway") {
    return { type: "HOLD", label: "giữ khung tĩnh / giữ biểu cảm" };
  }
  if (kind === "transition" || kind === "climax") {
    return { type: "ZOOM_OUT", label: "camera lùi/zoom out" };
  }

  return { type: "COMPLETE_ACTION", label: "hành động hoàn tất, nhân vật dừng/thả lỏng" };
};

export const planShotStructure = (shot: any, nextShot?: any): any => {
  const duration = Number(shot.T || shot.duration_target || 4);
  const { entry: entryDur, core: coreDur, exit: exitDur } = splitDurations(duration);

  const subjects = shot.nhân_vật || shot.characters || "khung cảnh";
  const kind = (shot.kind || "").toLowerCase();
  const framing = shot.framing || "Medium";

  let entryText = `Camera đã ở ${framing}, ${subjects} trong khung, bắt đầu hành động`;
  if (kind === "establishing") {
    entryText = `Khung cảnh hiện ra ở ${framing}, thiết lập không gian`;
  }

  let coreText = shot.description || shot.diễn_tả || "";
  if (shot.screen_direction) {
    const arrow = shot.screen_direction === "L2R" ? "trái→phải" : "phải→trái";
    coreText += ` (di chuyển ${arrow})`;
  }

  const exitInfo = getExitType(shot, nextShot);
  const exitText = `Kết thúc: ${exitInfo.label}`;

  const structure: ShotStructure = {
    entry: entryText,
    core: coreText,
    exit: exitText,
    exitType: exitInfo.type,
    entryDur,
    coreDur,
    exitDur,
  };

  return {
    ...shot,
    structure,
  };
};

export const buildPrompt = (shot: any, style?: string): string => {
  const ca = shot.cameraAngle;
  const angleText = ca ? `${ca.height}, bearing ${ca.bearing}° (side ${ca.side})` : (shot.angle || "Eye-Level");
  const lighting = shot.lighting || "ánh sáng ngày tự nhiên";

  const parts: string[] = [];

  const shotStyle = style || shot.style || "Pixar-style 3D animation";
  if (shotStyle) {
    parts.push(`[STYLE] ${shotStyle}.`);
  }

  if (shot.structure) {
    const st = shot.structure as ShotStructure;
    parts.push(`[ENTRY] ${st.entry} (~${st.entryDur}s).`);
    parts.push(`[CORE] ${st.core} (~${st.coreDur}s).`);
    parts.push(`[EXIT] ${st.exit} (~${st.exitDur}s).`);
  } else {
    parts.push(`[ACTION] ${shot.description || shot.diễn_tả}.`);
  }

  parts.push(
    `[CAMERA] ${shot.kind || "Action"}, ${shot.framing || "Medium"}, ` +
    `${shot.cameraMovement || "Static"}, ${angleText}.`
  );

  if (lighting) {
    parts.push(`[LIGHTING] ${lighting}.`);
  }

  parts.push(`[DURATION] ~${shot.T || 4}s. [FPS] 24. [ASPECT] 16:9.`);

  return parts.join(" ");
};

export const selectMode = (shot: any): string => {
  const hasChars = !!(shot.nhân_vật || shot.characters);
  const kind = (shot.kind || "").toLowerCase();

  if (!hasChars && ["insert", "detail", "cutaway", "transition"].includes(kind)) {
    return "A"; // Text-only
  }
  if (hasChars) {
    return "C"; // Full Control
  }
  return "B"; // Storyboard + Text
};

export const planShotRefs = (
  shot: any,
  charRefsLibrary?: Record<string, string[]>, // Map charName -> list of ref urls
  maxRefs: number = 5
): { imageRefs: string[]; warnings: string[] } => {
  const imageRefs: string[] = [];
  const warnings: string[] = [];

  const charStr = shot.nhân_vật || shot.characters || "";
  const charNames = charStr
    .split(",")
    .map((s: string) => s.trim())
    .filter(Boolean);

  if (charNames.length === 0) {
    // Không có nhân vật -> Lấy scene ref nếu có
    if (shot.location || shot.bối_cảnh) {
      // Giả lập lấy scene ref
      imageRefs.push(`scenes/${shot.location || shot.bối_cảnh}/ref.png`);
    }
    return { imageRefs, warnings };
  }

  const bearing = shot.cameraAngle ? shot.cameraAngle.bearing : 20;
  const view = viewForBearing(bearing);
  let budget = maxRefs;

  // Cận cảnh / reaction -> chỉ lấy 1 nhân vật chính
  const isTight = ["close-up", "extreme close-up", "cận cảnh"].includes((shot.framing || "").toLowerCase()) || shot.kind === "reaction";
  const focalChars = isTight ? charNames.slice(0, 1) : charNames.slice(0, 2);

  focalChars.forEach((cname: string) => {
    if (budget <= 0) return;

    const refs = charRefsLibrary ? charRefsLibrary[cname] : null;
    let path = "";
    let reason = "";

    if (isTight && shot.emotion) {
      const emotion = normalizeEmotion(shot.emotion);
      path = refs ? (refs.find(r => r.includes(`expr_${emotion}`)) || refs[0]) : `characters/${cname}/expr_${emotion}.png`;
      reason = `biểu cảm '${emotion}' (cận cảnh)`;
    } else {
      path = refs ? (refs.find(r => r.includes(view)) || refs[0]) : `characters/${cname}/${view}.png`;
      reason = `view '${view}' khớp bearing ${bearing}°`;
    }

    imageRefs.push(path);
    budget--;
  });

  const uncovered = charNames.filter((name: string) => !focalChars.includes(name));
  if (uncovered.length > 0) {
    warnings.push(
      `${shot.beat || shot.shot_id || "Shot"}: ${uncovered.join(", ")} không có ref riêng do giới hạn ngân sách refs.`
    );
  }

  // Thêm bối cảnh nếu còn ngân sách và không phải cảnh cận
  if (!isTight && budget > 0 && (shot.location || shot.bối_cảnh)) {
    imageRefs.push(`scenes/${shot.location || shot.bối_cảnh}/ref.png`);
    budget--;
  }

  return { imageRefs, warnings };
};
