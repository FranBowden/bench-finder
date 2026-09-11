const METRES_PER_MILE = 1609.34;

export function metresToMiles(metres: number): number {
  return metres / METRES_PER_MILE;
}

export function milesToMetres(miles: number): number {
  return miles * METRES_PER_MILE;
}

export function formatBenchCount(count: number): string {
  return `${count} bench${count === 1 ? "" : "es"} nearby`;
}
