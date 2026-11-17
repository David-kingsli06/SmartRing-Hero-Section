export const TOTAL_FRAMES = 190;
export const FRAME_WIDTH = 1216;
export const FRAME_HEIGHT = 684;

/**
 * Generates the frame URL for a given zero-indexed frame.
 * Format: /frames/frame_000.webp ... /frames/frame_189.webp
 */
export function getFramePath(index: number): string {
  const clamped = Math.max(0, Math.min(TOTAL_FRAMES - 1, Math.round(index)));
  const padded = clamped.toString().padStart(3, "0");
  return `/frames/frame_${padded}.webp`;
}

/**
 * Maps scroll progress p (0 to 1) to a frame index (0 to 189).
 * Features define generous reading holds where the frame is paused
 * on the sensor pod, giving ample scroll runway for the typography.
 * Outside holds, the frame index interpolates smoothly.
 */
export function mapProgressToFrame(p: number): number {
  const clampedP = Math.max(0, Math.min(1, p));
  const maxFrame = TOTAL_FRAMES - 1;

  // 3 Distinct Reading Holds:
  // Hold 1 (Sleep): 0.30 to 0.38
  // Hold 2 (Heart Rate): 0.44 to 0.52
  // Hold 3 (Recovery): 0.58 to 0.66
  const holds = [
    { pCenter: 0.34, start: 0.30, end: 0.38 },
    { pCenter: 0.48, start: 0.44, end: 0.52 },
    { pCenter: 0.62, start: 0.58, end: 0.66 },
  ];

  for (const hold of holds) {
    if (clampedP >= hold.start && clampedP <= hold.end) {
      return Math.round(hold.pCenter * maxFrame);
    }
  }

  // Linear progression adjusted around holds to keep full rotation continuous
  return Math.round(clampedP * maxFrame);
}
