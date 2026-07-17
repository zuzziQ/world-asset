// Tính toán rủi ro đứt gãy điểm nối (Discontinuity Risk) chuyển dịch từ Python.
// Đánh giá rủi ro ghép nối giữa 2 clip sinh độc lập (nhân dạng, ánh sáng, góc quay).

export interface ShotLike {
  sc?: string;
  scene_id?: string;
  nhân_vật?: string;
  characters?: string;
  framing?: string;
  kind?: string;
  shot_type?: string;
  cameraAngle?: {
    bearing: number;
    height: string;
    side: string;
  };
  cut_in?: string;
  is_glue?: boolean;
  beat?: string;
  shot_id?: string;
  bối_cảnh?: string;
  location?: string;
}

const MIN_ANGLE_DELTA = 30;

// Các độ giảm rủi ro theo kỹ thuật cắt dựng
const TECHNIQUE_MITIGATION: Record<string, number> = {
  "cut on action": 0.15,
  "cut-on-action": 0.15,
  "reaction shot": 0.20,
  "reaction": 0.20,
  "cutaway": 0.25,
  "match cut": 0.10,
  "j-cut": 0.10,
  "l-cut": 0.10,
  "dissolve": 0.15,
  "fade": 0.15,
  "smash cut": 0.0,
  "hard cut": 0.0,
};

export const getBaseTransitionRisk = (prev: ShotLike, cur: ShotLike): number => {
  const prevScene = prev.sc || prev.scene_id || "";
  const curScene = cur.sc || cur.scene_id || "";

  if (prevScene !== curScene) {
    return 0.15; // Đổi scene -> rủi ro thấp
  }

  let risk = 0.20; // Rủi ro nền khi ghép 2 clip tạo độc lập

  // 1. Kiểm tra trùng nhân vật
  const prevChars = (prev.nhân_vật || prev.characters || "")
    .split(",")
    .map((s) => s.trim().toLowerCase())
    .filter(Boolean);
  const curChars = (cur.nhân_vật || cur.characters || "")
    .split(",")
    .map((s) => s.trim().toLowerCase())
    .filter(Boolean);

  const hasSharedChar = prevChars.some((c) => curChars.includes(c));
  if (hasSharedChar) {
    risk += 0.30;
  }

  // 2. Trùng cỡ cảnh (framing)
  const prevFraming = prev.framing || "";
  const curFraming = cur.framing || "";
  if (prevFraming && curFraming && prevFraming.toLowerCase() === curFraming.toLowerCase()) {
    risk += 0.25;
  }

  // 3. Phân tích góc máy cameraAngle (bearing/side)
  if (prev.cameraAngle && cur.cameraAngle) {
    if (prev.cameraAngle.side === cur.cameraAngle.side) {
      if (Math.abs(prev.cameraAngle.bearing - cur.cameraAngle.bearing) < MIN_ANGLE_DELTA) {
        risk += 0.25; // Lỗi jump cut do xoay máy dưới 30 độ
      }
    } else {
      risk += 0.20; // Lỗi 180 độ
    }
  }

  // 4. Trùng loại shot rộng/tĩnh
  const prevKind = (prev.kind || prev.shot_type || "").toLowerCase();
  const curKind = (cur.kind || cur.shot_type || "").toLowerCase();
  if (prevKind === curKind && (curKind === "establishing" || curKind === "climax")) {
    risk += 0.10;
  }

  return Math.max(0.0, Math.min(1.0, risk));
};

export const getTransitionRisk = (prev: ShotLike, cur: ShotLike): number => {
  let risk = getBaseTransitionRisk(prev, cur);

  // Giảm rủi ro nếu có Glue shot chen ở giữa
  if (cur.is_glue || prev.is_glue) {
    risk -= 0.30;
  }

  // Giảm rủi ro dựa trên kỹ thuật cắt
  const cutIn = (cur.cut_in || "").toLowerCase();
  if (cutIn) {
    const mitigation = TECHNIQUE_MITIGATION[cutIn] || 0.0;
    risk -= mitigation;
  }

  return Math.max(0.0, Math.min(1.0, risk));
};
