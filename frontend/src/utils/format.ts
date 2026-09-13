export type DistanceUnit = "mi" | "km";

const METRES_PER_MILE = 1609.34;
const METRES_PER_KM = 1000;

export function metresToMiles(metres: number): number {
  return metres / METRES_PER_MILE;
}

export function milesToMetres(miles: number): number {
  return miles * METRES_PER_MILE;
}

export function metresToKm(metres: number): number {
  return metres / METRES_PER_KM;
}

export function metresToUnit(metres: number, unit: DistanceUnit): number {
  return unit === "km" ? metresToKm(metres) : metresToMiles(metres);
}

export function formatDistance(miles: number, unit: DistanceUnit): string {
  const value = unit === "km" ? metresToKm(milesToMetres(miles)) : miles;
  return `${value.toFixed(2)} ${unit} away`;
}

export function formatDuration(minutes: number): string {
  return `~${Math.max(1, Math.round(minutes))} mins`;
}

export function formatBenchCount(count: number): string {
  return `${count} bench${count === 1 ? "" : "es"} nearby`;
}
