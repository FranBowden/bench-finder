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
