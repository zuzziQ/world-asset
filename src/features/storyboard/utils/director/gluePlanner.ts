// Tự động lập kế hoạch kỹ thuật cắt và chèn Glue Shots chuyển dịch từ Python.
// Nhằm giảm chấn rủi ro jump-cut bằng cách chen các reaction/cutaway ngắn.

import { getBaseTransitionRisk, ShotLike } from "./riskEvaluator";

const HIGH_RISK_THRESHOLD = 0.6; // Ngưỡng rủi ro cao

const chooseNaturalTechnique = (prev: ShotLike, cur: ShotLike): string => {
  const prevScene = prev.sc || prev.scene_id || "";
  const curScene = cur.sc || cur.scene_id || "";

  if (prevScene !== curScene) {
    return "Dissolve";
  }

  const curKind = (cur.kind || cur.shot_type || "").toLowerCase();
  const prevKind = (prev.kind || prev.shot_type || "").toLowerCase();

  if (curKind === "reaction") {
    return "Reaction Shot";
  }
  if (curKind === "insert" || curKind === "cutaway") {
    return "Cutaway";
  }
  if (prevKind === "action" || curKind === "action") {
    return "Cut on Action";
  }
  if (curKind === "dialogue") {
    return "J-Cut";
  }
  return "Hard Cut";
};

const makeGlueShot = (cur: ShotLike, index: number): any => {
  const curScene = cur.sc || cur.scene_id || "SC01";
  const glueId = `${curScene}_GLUE${String(index).padStart(2, "0")}`;

  return {
    beat: glueId,
    shot_id: glueId,
    sc: curScene,
    scene_id: curScene,
    kind: "cutaway",
    shot_type: "Cutaway",
    framing: "Close-up",
    T: 4, // Thời lượng mặc định 4s cho cutaway
    duration_target: 4,
    cameraMovement: "Static",
    diễn_tả: "Cận cảnh chi tiết môi trường (lá rơi / bàn tay / vật thể) — tự động chèn để che điểm nối rủi ro cao.",
    description: "Cận cảnh chi tiết môi trường (lá rơi / bàn tay / vật thể) — tự động chèn để che điểm nối rủi ro cao.",
    mục_tiêu: "Che giấu sự đứt gãy nhân vật hoặc bối cảnh giữa hai shot sinh độc lập.",
    objective: "Che giấu sự đứt gãy nhân vật hoặc bối cảnh giữa hai shot sinh độc lập.",
    nhân_vật: "",
    characters: "",
    bối_cảnh: cur.bối_cảnh || cur.location || "bối cảnh",
    location: cur.bối_cảnh || cur.location || "bối cảnh",
    đạo_cụ: "chi tiết môi trường",
    props: "chi tiết môi trường",
    thoại: "",
    dialogue: "",
    cut_in: "Cut on Action",
    is_glue: true,
    notes: "Glue cutaway tự chèn: phá vỡ nối trực tiếp giữa 2 shot rủi ro cao",
    visual: `Close-up detail shot of environment details in ${cur.bối_cảnh || cur.location || "scene"}. Static camera, shallow depth of field. Pixar style.`,
  };
};

export const planCutsAndGlue = (shots: any[]): { shots: any[]; glueNotes: string[] } => {
  if (!shots || shots.length === 0) {
    return { shots: [], glueNotes: [] };
  }

  const result: any[] = [];
  const glueNotes: string[] = [];
  let glueCount = 0;

  // Shot đầu tiên luôn bắt đầu bằng Fade
  const firstShot = { ...shots[0] };
  firstShot.cut_in = firstShot.cut_in || "Fade";
  result.push(firstShot);

  for (let i = 1; i < shots.length; i++) {
    const cur = { ...shots[i] };
    const prev = result[result.length - 1];

    // Lựa chọn kỹ thuật cắt tự nhiên
    cur.cut_in = chooseNaturalTechnique(prev, cur);

    // Đánh giá rủi ro đứt gãy
    const risk = getBaseTransitionRisk(prev, cur);
    const naturalIsWeak = cur.cut_in === "Hard Cut" || cur.cut_in === "Cut on Action";

    if (risk >= HIGH_RISK_THRESHOLD && naturalIsWeak && !cur.is_glue) {
      glueCount++;
      const glue = makeGlueShot(cur, glueCount);
      result.push(glue);

      // Khi đã chèn glue ở giữa, shot cur tiếp sau sẽ cắt thẳng an toàn
      cur.cut_in = "Hard Cut";
      glueNotes.push(
        `Chèn ${glue.beat} giữa ${prev.beat || prev.shot_id || "prev"} → ${cur.beat || cur.shot_id || "cur"} (rủi ro thô ${risk.toFixed(2)} ≥ ${HIGH_RISK_THRESHOLD})`
      );
    }

    result.push(cur);
  }

  return { shots: result, glueNotes };
};
