import { useRef, useEffect } from "react";
import mapboxgl from "mapbox-gl";
import type { BenchWithDirection } from "@shared/types";
import { formatBenchCount } from "../utils/format";
import {
  benchesToGeoJson,
  ensureBenchIconLoaded,
  renderBenchMarkers,
  renderRoute,
  renderSelectedHalo,
  runWhenStyleReady,
  selectedBenchGeoJson,
} from "../utils/benchMapLayers";

mapboxgl.accessToken = import.meta.env.VITE_MAPBOX_API_KEY;

type BenchMapProps = {
  setUserLocation: (loc: { lat: number; lng: number }) => void;
  selectedBenchIndex: number | null;
  benchesWithDirection: BenchWithDirection[];
  selectedRoute: GeoJSON.Feature | null;
  loading?: boolean;
  onBenchClick: (index: number) => void;
};

export const BenchMap = ({
  setUserLocation,
  selectedBenchIndex,
  benchesWithDirection,
  selectedRoute,
  loading,
  onBenchClick,
}: BenchMapProps) => {
  const mapContainer = useRef<HTMLDivElement | null>(null);
  const map = useRef<mapboxgl.Map | null>(null);
  const isSupported = mapboxgl.supported();

  // Keep the click handler (registered once, below) able to see the latest
  // callback without needing to re-register the Mapbox event listener.
  const onBenchClickRef = useRef(onBenchClick);
  onBenchClickRef.current = onBenchClick;

  //Initialize map - mapbox
  useEffect(() => {
    if (!isSupported || map.current || !mapContainer.current) return;

    const fallbackLat = 51.50859;
    const fallbackLng = -0.16527;
    let resizeObserver: ResizeObserver | undefined;

    const initializeMap = (lat: number, lng: number) => {
      setUserLocation({ lat, lng });

      const mapInstance = new mapboxgl.Map({
        container: mapContainer.current!,
        style: "mapbox://styles/mapbox/streets-v11",
        center: [lng, lat],
        zoom: 14,
      });

      map.current = mapInstance;

      const geolocateControl = new mapboxgl.GeolocateControl({
        positionOptions: { enableHighAccuracy: true },
        trackUserLocation: true,
        showUserHeading: true,
      });

      mapInstance.addControl(geolocateControl);
      mapInstance.on("load", () => geolocateControl.trigger());

      // Re-centering via the control's own button (not just the initial
      // load) must also update userLocation, or the bench-fetch effect
      // never learns the user moved and keeps showing the old location's
      // benches.
      geolocateControl.on("geolocate", (position: GeolocationPosition) => {
        setUserLocation({
          lat: position.coords.latitude,
          lng: position.coords.longitude,
        });
      });

      // Keeps the canvas sized to its container 
      let resizeScheduled = false;
      resizeObserver = new ResizeObserver(() => {
        if (resizeScheduled) return;
        resizeScheduled = true;
        requestAnimationFrame(() => {
          mapInstance.resize();
          resizeScheduled = false;
        });
      });
      resizeObserver.observe(mapContainer.current!);
    };

    navigator.geolocation.getCurrentPosition(
      (pos) => initializeMap(pos.coords.latitude, pos.coords.longitude),
      () => initializeMap(fallbackLat, fallbackLng)
    );

    return () => {
      resizeObserver?.disconnect();
      map.current?.remove();
      map.current = null;
    };
  }, [isSupported, setUserLocation]);

  // Render bench markers
  useEffect(() => {
    const mapInstance = map.current;
    if (!mapInstance) return;

    const geojsonData = benchesToGeoJson(benchesWithDirection);

    runWhenStyleReady(mapInstance, async () => {
      await ensureBenchIconLoaded(mapInstance);
      renderBenchMarkers(mapInstance, geojsonData, onBenchClickRef);
    });
  }, [benchesWithDirection]);

  // Highlight the selected bench
  useEffect(() => {
    const mapInstance = map.current;
    if (!mapInstance) return;

    const bench =
      selectedBenchIndex !== null ? benchesWithDirection[selectedBenchIndex] : undefined;
    const data = selectedBenchGeoJson(bench);

    runWhenStyleReady(mapInstance, () => renderSelectedHalo(mapInstance, data));
  }, [selectedBenchIndex, benchesWithDirection]);

  //Fly to the selected Bench
  useEffect(() => {
    if (!map.current || selectedBenchIndex === null) return;
    const bench = benchesWithDirection[selectedBenchIndex];
    if (!bench) return;

    map.current.flyTo({
      center: [bench.lng, bench.lat],
      zoom: 16,
      essential: true,
    });
  }, [selectedBenchIndex, benchesWithDirection]);

  //Draw route to selected Bench
  useEffect(() => {
    if (!map.current) return;
    renderRoute(map.current, selectedRoute);
  }, [selectedRoute]);

  if (!isSupported) {
    return (
      <div className="w-full h-full flex items-center justify-center bg-[var(--color-bg)] text-[var(--color-text-muted)] text-sm p-6 text-center">
        Your browser does not support WebGL, so the map can't be shown here.
      </div>
    );
  }

  return (
    <div className="relative w-full h-full">
      <div ref={mapContainer} className="w-full h-full" />

      {!loading && (
        <div className="absolute top-4 left-4 z-10 flex items-center gap-2 bg-[var(--color-surface)]/95 backdrop-blur-sm border border-[var(--color-border)] rounded-full pl-3 pr-4 py-2 shadow-[var(--shadow-md)] text-sm font-semibold text-[var(--color-text)]">
          <span className="w-2 h-2 rounded-full bg-[var(--color-primary)]" />
          {formatBenchCount(benchesWithDirection.length)}
        </div>
      )}
    </div>
  );
};
