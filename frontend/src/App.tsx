import { useEffect, useRef, useState } from "react";
import { BenchMap } from "./components/BenchMap";
import { BenchList } from "./components/BenchList";
import { MobileBottomSheet } from "./components/MobileBottomSheet";
import type { BenchWithDirection } from "@shared/types";
import { fetchBenches } from "./api/fetchBenches";
import { ApiError } from "./api/apiClient";
import { handleBenchClick } from "./utils/handleBenchClick";
import { formatBenchCount, milesToMetres } from "./utils/format";
import { Header } from "./components/Header";
import { RadiusSlider, MAX_METRES } from "./components/RadiusSlider";

const MOBILE_BREAKPOINT_QUERY = "(max-width: 767px)";

function useIsMobile() {
  const [isMobile, setIsMobile] = useState(
    () => typeof window !== "undefined" && window.matchMedia(MOBILE_BREAKPOINT_QUERY).matches
  );

  useEffect(() => {
    const mql = window.matchMedia(MOBILE_BREAKPOINT_QUERY);
    const handler = (e: MediaQueryListEvent) => setIsMobile(e.matches);
    mql.addEventListener("change", handler);
    return () => mql.removeEventListener("change", handler);
  }, []);

  return isMobile;
}

const App = () => {
  const isMobile = useIsMobile();

  const [userLocation, setUserLocation] = useState<{
    lat: number;
    lng: number;
  } | null>(null);

  const [benchesWithDirection, setBenchesWithDirection] = useState<
    BenchWithDirection[]
  >([]);

  const [selectedBenchIndex, setSelectedBenchIndex] = useState<number | null>(
    null
  );

  const [selectedRoute, setSelectedRoute] = useState<GeoJSON.Feature | null>(
    null
  );

  const onBenchClick = (index: number) => {
    handleBenchClick(
      index,
      benchesWithDirection,
      userLocation,
      setBenchesWithDirection,
      setSelectedBenchIndex,
      setSelectedRoute
    );
  };

  const [cachedBenches, setCachedBenches] = useState<BenchWithDirection[]>([]);
  const [radius, setRadius] = useState<number>(400);
  const [loading, setLoading] = useState(false);
  const [benchesError, setBenchesError] = useState<string | null>(null);
  const hasFetchedRef = useRef(false);
  const initialRadiusRef = useRef(radius);

  // Fetch at the current radius first, then silently prefetch out to MAX_METRES.
  useEffect(() => {
    if (!userLocation || hasFetchedRef.current) return;
    hasFetchedRef.current = true;

    const fetchInitialBenches = async () => {
      setLoading(true);
      setBenchesError(null);
      try {
        const benches = await fetchBenches(userLocation, initialRadiusRef.current);
        setCachedBenches(benches);
      } catch (err) {
        console.error("Failed to fetch benches:", err);
        setBenchesError(
          err instanceof ApiError && err.status === 429
            ? "Too many requests right now — please wait a moment and try again."
            : "Couldn't load benches right now. Please try again shortly."
        );
        return;
      } finally {
        setLoading(false);
      }

      if (initialRadiusRef.current < MAX_METRES) {
        fetchBenches(userLocation, MAX_METRES)
          .then(setCachedBenches)
          .catch((err) => console.error("Failed to prefetch wider bench radius:", err));
      }
    };

    fetchInitialBenches();
  }, [userLocation]);

  //filter visible benches from cache based on current radius
  useEffect(() => {
    const filtered = cachedBenches.filter((b) => {
      const distanceMeters = milesToMetres(b.distanceMiles ?? 0);
      return distanceMeters <= radius;
    });
    setBenchesWithDirection(filtered);
  }, [cachedBenches, radius]);

  const showLoadingSkeleton = loading && benchesWithDirection.length === 0;
  const showBenchesError = benchesError && benchesWithDirection.length === 0;

  const radiusSlider = <RadiusSlider amount={radius} onAmountChange={setRadius} />;
  const benchList = (
    <BenchList
      benchesWithDirection={benchesWithDirection}
      selectedBenchIndex={selectedBenchIndex}
      onBenchClick={onBenchClick}
      loading={showLoadingSkeleton}
      error={showBenchesError ? benchesError : null}
    />
  );
  const benchMap = (
    <BenchMap
      setUserLocation={setUserLocation}
      selectedBenchIndex={selectedBenchIndex}
      benchesWithDirection={benchesWithDirection}
      selectedRoute={selectedRoute}
      loading={showLoadingSkeleton}
      onBenchClick={onBenchClick}
    />
  );

  return (
    <div className="flex flex-col h-dvh overflow-hidden bg-[var(--color-bg)]">
      <Header />
      {isMobile ? (
        // Sheet floats over the full-bleed map instead of resizing it (avoids the drag-jitter from constant resize()).
        <div className="relative flex-1 min-h-0">
          <div className="absolute inset-0">{benchMap}</div>
          <div className="absolute inset-x-0 bottom-0">
            <MobileBottomSheet summaryLabel={formatBenchCount(benchesWithDirection.length)}>
              {radiusSlider}
              {benchList}
            </MobileBottomSheet>
          </div>
        </div>
      ) : (
        <div className="flex flex-row flex-1 min-h-0">
          <div className="flex flex-col w-[380px] lg:w-[420px] shrink-0 bg-[var(--color-surface)] border-r border-[var(--color-border)] h-full overflow-hidden">
            {radiusSlider}
            <div className="overflow-y-auto scrollbar-thin flex-1">{benchList}</div>
          </div>
          <div className="flex-1 relative">{benchMap}</div>
        </div>
      )}
    </div>
  );
};

export default App;
