import type { Bench } from "./bench";
import type { DirectionResult } from "./directionResult";

export type BenchWithDirection = Bench & {
  originalIndex: number;
  distanceText?: string;
  durationText?: string;
  distanceMiles?: number;
  durationMinutes?: number;
  geojson?: DirectionResult["geojson"];
};
