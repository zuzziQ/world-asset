import { CinematicShot, CameraAngle, CameraHeight, ShotType } from "./models";

const MIN_ANGLE_DELTA = 30;
const ACTION_LINE_ARC = 170;
const STEP = 45;

const HEIGHT_BY_TYPE: Record<string, CameraHeight> = {
  [ShotType.CLIMAX]: CameraHeight.LOW,
  [ShotType.ESTABLISHING]: CameraHeight.HIGH,
  [ShotType.REACTION]: CameraHeight.EYE,
};

function heightFor(shot: CinematicShot): CameraHeight {
  return HEIGHT_BY_TYPE[shot.shot_type] || CameraHeight.EYE;
}

function clamp(b: number): number {
  return Math.max(0, Math.min(ACTION_LINE_ARC, b));
}

export function assignCameraAngles(shots: CinematicShot[], side: "A" | "B" = "A"): string[] {
  const warnings: string[] = [];
  let lastBearing = 20;
  let direction = 1; // 1 = increase, -1 = decrease
  let prevSubjects = new Set<string>();

  for (const shot of shots) {
    const subjects = new Set(shot.character_refs || []);
    let sharesSubject = false;
    
    // Check if there is intersection between subjects and prevSubjects
    for (const sub of subjects) {
      if (prevSubjects.has(sub)) {
        sharesSubject = true;
        break;
      }
    }

    let bearing = 0;

    if (sharesSubject) {
      bearing = lastBearing + STEP * direction;
      if (bearing > ACTION_LINE_ARC || bearing < 0) {
        direction *= -1;
        bearing = lastBearing + STEP * direction;
      }
      bearing = clamp(bearing);

      if (Math.abs(bearing - lastBearing) < MIN_ANGLE_DELTA) {
        let forced = clamp(lastBearing + MIN_ANGLE_DELTA * direction);
        if (Math.abs(forced - lastBearing) < MIN_ANGLE_DELTA) {
          forced = clamp(lastBearing - MIN_ANGLE_DELTA);
        }
        bearing = forced;
        if (Math.abs(bearing - lastBearing) < MIN_ANGLE_DELTA) {
          warnings.push(`${shot.id}: Cannot achieve 30° difference compared to previous shot (narrow arc).`);
        }
      }
    } else {
      bearing = lastBearing > 90 ? 20 : 130;
      direction = bearing < 90 ? 1 : -1;
    }

    shot.camera_angle = {
      bearing: Math.floor(bearing),
      height: heightFor(shot),
      side: side,
    };
    
    lastBearing = bearing;
    prevSubjects = subjects;
  }

  return warnings;
}
