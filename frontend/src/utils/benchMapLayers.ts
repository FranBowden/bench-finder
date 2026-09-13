import mapboxgl from "mapbox-gl";
import type { BenchWithDirection } from "@shared/types";
import benchIcon from "../../assets/bench.png";

const BENCH_ICON_ID = "bench-icon";
const BENCH_SOURCE_ID = "benches";
const BENCH_LAYER_ID = "bench-points";
const SELECTED_SOURCE_ID = "selected-bench";
const SELECTED_LAYER_ID = "selected-bench-halo";
const ROUTE_SOURCE_ID = "route";
const ROUTE_LAYER_ID = "route";

// The HTML for the popup Mapbox shows when a bench marker on the map is
// clicked (desktop and mobile both use this — it's not phone-specific).
function buildPopupHtml(distanceText: string, durationText: string, tags: string[]) {
  return `
  <div style="text-align: left; font-family: 'Inter', system-ui, sans-serif; padding: 14px 16px; padding-top: 22px; min-width: 160px;">
    <div style="font-size: 0.95rem; font-weight: 600; color: #16201a; margin-bottom: 2px;">
      ${distanceText} walk
    </div>
    <div style="font-size: 1.1rem; font-weight: 700; color: #1a7a4c; margin-bottom: 8px;">
      ${durationText}
    </div>
    <div style="display: flex; flex-wrap: wrap; gap: 4px;">
      ${tags
        .map(
          (tag) =>
            `<span style="padding: 2px 8px; font-size: 0.7rem; font-weight: 600; background-color: #d9f0e0; color: #145c39; border-radius: 9999px;">
              ${tag}
            </span>`
        )
        .join("")}
    </div>
  </div>
`;
}

export function benchesToGeoJson(
  benches: BenchWithDirection[]
): GeoJSON.FeatureCollection<GeoJSON.Point> {
  return {
    type: "FeatureCollection",
    features: benches.map((bench, index) => ({
      type: "Feature",
      geometry: { type: "Point", coordinates: [bench.lng, bench.lat] },
      properties: {
        index,
        distanceText: bench.distanceText ?? "",
        durationText: bench.durationText ?? "",
        tags: JSON.stringify(Array.isArray(bench.tags) ? bench.tags : []),
      },
    })),
  };
}

export function selectedBenchGeoJson(
  bench: BenchWithDirection | undefined
): GeoJSON.FeatureCollection<GeoJSON.Point> {
  return {
    type: "FeatureCollection",
    features: bench
      ? [
          {
            type: "Feature",
            geometry: { type: "Point", coordinates: [bench.lng, bench.lat] },
            properties: {},
          },
        ]
      : [],
  };
}

// Loads the bench icon into the map's sprite once (idempotent) so it can be
// used by a symbol layer — this renders every bench via WebGL (fast even at
// hundreds of points) while still looking like the original bench icon,
// instead of one DOM <Marker> per bench.
export function ensureBenchIconLoaded(mapInstance: mapboxgl.Map): Promise<void> {
  if (mapInstance.hasImage(BENCH_ICON_ID)) return Promise.resolve();
  return new Promise((resolve) => {
    mapInstance.loadImage(benchIcon, (error, image) => {
      if (!error && image && !mapInstance.hasImage(BENCH_ICON_ID)) {
        mapInstance.addImage(BENCH_ICON_ID, image);
      }
      resolve();
    });
  });
}

// Sources/layers can only be added once the style has finished loading —
// run immediately if it already has, otherwise wait for it to.
export function runWhenStyleReady(mapInstance: mapboxgl.Map, fn: () => void) {
  if (mapInstance.isStyleLoaded()) {
    fn();
  } else {
    mapInstance.once("load", fn);
  }
}

// Renders every bench as a single WebGL symbol layer. The source/layer are
// only created once (on the first call); later calls just update the data.
// Clicking a marker mirrors clicking it in the list: select it, fetch the
// real walking route, and draw it — same as Google Maps' "show me how to
// get there" on a pin tap.
export function renderBenchMarkers(
  mapInstance: mapboxgl.Map,
  geojsonData: GeoJSON.FeatureCollection<GeoJSON.Point>,
  onBenchClickRef: { current: (index: number) => void }
) {
  const existingSource = mapInstance.getSource(BENCH_SOURCE_ID) as
    | mapboxgl.GeoJSONSource
    | undefined;

  if (existingSource) {
    existingSource.setData(geojsonData);
    return;
  }

  mapInstance.addSource(BENCH_SOURCE_ID, { type: "geojson", data: geojsonData });

  mapInstance.addLayer({
    id: BENCH_LAYER_ID,
    type: "symbol",
    source: BENCH_SOURCE_ID,
    layout: {
      "icon-image": BENCH_ICON_ID,
      "icon-size": 0.1, // ~50px, matching the original marker size
      "icon-allow-overlap": true,
      "icon-ignore-placement": true,
    },
  });

  mapInstance.on("mouseenter", BENCH_LAYER_ID, () => {
    mapInstance.getCanvas().style.cursor = "pointer";
  });
  mapInstance.on("mouseleave", BENCH_LAYER_ID, () => {
    mapInstance.getCanvas().style.cursor = "";
  });

  mapInstance.on("click", BENCH_LAYER_ID, (e) => {
    const feature = e.features?.[0];
    if (!feature || feature.geometry.type !== "Point") return;

    const coords = feature.geometry.coordinates.slice() as [number, number];
    const props = feature.properties ?? {};
    const tags: string[] = props.tags ? JSON.parse(props.tags) : [];

    new mapboxgl.Popup({ offset: 28 })
      .setLngLat(coords)
      .setHTML(buildPopupHtml(props.distanceText ?? "", props.durationText ?? "", tags))
      .addTo(mapInstance);

    if (typeof props.index === "number") {
      onBenchClickRef.current(props.index);
    }
  });
}

// Highlights whichever bench is selected (from the list, or the map itself)
// with a halo ring beneath the icon. Source/layer are only created once.
export function renderSelectedHalo(
  mapInstance: mapboxgl.Map,
  data: GeoJSON.FeatureCollection<GeoJSON.Point>
) {
  const existingSource = mapInstance.getSource(SELECTED_SOURCE_ID) as
    | mapboxgl.GeoJSONSource
    | undefined;

  if (existingSource) {
    existingSource.setData(data);
    return;
  }

  mapInstance.addSource(SELECTED_SOURCE_ID, { type: "geojson", data });
  mapInstance.addLayer(
    {
      id: SELECTED_LAYER_ID,
      type: "circle",
      source: SELECTED_SOURCE_ID,
      paint: {
        "circle-radius": 22,
        "circle-color": "#145c39",
        "circle-opacity": 0.16,
        "circle-stroke-width": 2,
        "circle-stroke-color": "#145c39",
        "circle-stroke-opacity": 0.5,
      },
    },
    mapInstance.getLayer(BENCH_LAYER_ID) ? BENCH_LAYER_ID : undefined
  );
}

// Draws (or clears) the walking route to the selected bench.
export function renderRoute(mapInstance: mapboxgl.Map, route: GeoJSON.Feature | null) {
  if (mapInstance.getLayer(ROUTE_LAYER_ID)) {
    mapInstance.removeLayer(ROUTE_LAYER_ID);
    mapInstance.removeSource(ROUTE_SOURCE_ID);
  }

  if (!route) return;

  mapInstance.addSource(ROUTE_SOURCE_ID, { type: "geojson", data: route });
  mapInstance.addLayer({
    id: ROUTE_LAYER_ID,
    type: "line",
    source: ROUTE_SOURCE_ID,
    layout: {
      "line-join": "round",
      "line-cap": "round",
    },
    paint: {
      "line-color": "#1a7a4c",
      "line-width": 6,
      "line-dasharray": [0, 2],
    },
  });
}
