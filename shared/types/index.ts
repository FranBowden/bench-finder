export interface Bench {
  id: number;
  lat: number;
  lng: number;
  tags?: Record<string, string>;
}

export type Coordinate = {
  lat: number;
  lng: number;
};

export type DirectionResult = {
  distanceMiles: number;
  durationMinutes: number;
  geojson?: {
    type: "Feature";
    properties: {};
    geometry: {
      type: "LineString";
      coordinates: [number, number][];
    };
  };
};

export type BenchWithDirection = Bench & {
  originalIndex: number;
  distanceText?: string;
  durationText?: string;
  distanceMiles?: number;
  durationMinutes?: number;
  geojson?: DirectionResult["geojson"];
};
