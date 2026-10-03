import { cubicBezier } from "motion";

export const MAX_SHUTTER_BANDS = 15;
export const SHUTTER_SCRUB_MS = 100;
export const clampProgress = (value: number) => Math.max(0, Math.min(1, value));

// Ease both ends of each band's growth instead of opening at peak speed.
const easeShutter = cubicBezier(.42, 0, .58, 1);
export const shutterCoverage = (time: number) =>
  easeShutter(clampProgress(time / .5));
