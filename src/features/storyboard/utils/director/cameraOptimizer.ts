// Tối ưu góc máy — quy tắc 30° và 180° chuyển dịch từ Python.
// Đảm bảo camera của các shot cùng nằm trên một phía đường hành động (Side A/B)
// và hai shot liên tiếp có chung nhân vật chính có góc xoay máy chênh lệch ít nhất 30°.

export interface CameraAngle {
  bearing: number;
  height: string;
  side: string;
}

const MIN_ANGLE_DELTA = 30; // Quy tắc 30°
const ACTION_LINE_ARC = 170; // Quy tắc 180°: giới hạn góc máy xoay trong khoảng [0, 170]
const STEP = 45; // Bước xoay mặc định

const HEIGHT_BY_KIND: Record<string, string> = {
  establishing: "High Angle",
  climax: "Low Angle",
  reaction: "Eye-Level",
  dialogue: "Eye-Level",
};

const getCameraHeight = (kind: string): string => {
  return HEIGHT_BY_KIND[kind.toLowerCase()] || "Eye-Level";
};

const clamp = (bearing: number): number => {
  return Math.max(0, Math.min(ACTION_LINE_ARC, bearing));
};

export const assignCameraAngles = (shots: any[], side: string = "A"): { shots: any[]; warnings: string[] } => {
  const warnings: string[] = [];
  let lastBearing = 20;
  let direction = 1; // +1 xoay tăng, -1 xoay giảm
  let prevSubjects: string[] = [];

  const processedShots = shots.map((shot) => {
    // Trích xuất các nhân vật trong shot
    const subjects = shot.nhân_vật || shot.characters || "";
    const currentSubjectsList = subjects
      .split(",")
      .map((s: string) => s.trim().toLowerCase())
      .filter(Boolean);

    // Kiểm tra xem shot hiện tại có chia sẻ chủ thể với shot trước không
    const sharesSubject = currentSubjectsList.some((sub: string) =>
      prevSubjects.includes(sub)
    );

    let bearing = lastBearing;

    if (sharesSubject && currentSubjectsList.length > 0) {
      bearing = lastBearing + STEP * direction;
      if (bearing > ACTION_LINE_ARC || bearing < 0) {
        direction *= -1; // Chạm biên -> đảo chiều xoay
        bearing = lastBearing + STEP * direction;
      }
      bearing = clamp(bearing);

      if (Math.abs(bearing - lastBearing) < MIN_ANGLE_DELTA) {
        // Ép đủ 30 độ
        let forced = clamp(lastBearing + MIN_ANGLE_DELTA * direction);
        if (Math.abs(forced - lastBearing) < MIN_ANGLE_DELTA) {
          forced = clamp(lastBearing - MIN_ANGLE_DELTA);
        }
        bearing = forced;

        if (Math.abs(bearing - lastBearing) < MIN_ANGLE_DELTA) {
          warnings.push(
            `${shot.beat || shot.shot_id || "Shot"}: Không đạt góc xoay 30° so với shot trước (góc quá hẹp).`
          );
        }
      }
    } else {
      // Chủ thể mới: Nhảy sang nửa kia của cung máy để tạo khác biệt góc nhìn
      bearing = lastBearing > 90 ? 20 : 130;
      direction = bearing < 90 ? 1 : -1;
    }

    const cameraHeight = getCameraHeight(shot.kind || "");
    const cameraAngle: CameraAngle = {
      bearing: Math.round(bearing),
      height: cameraHeight,
      side,
    };

    lastBearing = bearing;
    prevSubjects = currentSubjectsList;

    // Cập nhật lại góc máy cho shot
    const bearingDesc = `${cameraAngle.height}, bearing ${cameraAngle.bearing}° (side ${cameraAngle.side})`;
    return {
      ...shot,
      cameraAngle,
      angle: bearingDesc, // Ghi đè mô tả góc máy hiển thị
    };
  });

  return { shots: processedShots, warnings };
};
