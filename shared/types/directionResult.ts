import type { LineString } from "geojson";

export type DirectionResult = {
  geojson?: {
    type: "Feature";
    properties: {};
    geometry: {
      type: "LineString";
      coordinates: [number, number][];
    };
  };
};
