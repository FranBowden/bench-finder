import { useCallback, useEffect, useRef, useState } from "react";
import { BenchMap } from "./components/BenchMap";
import { BenchList } from "./components/BenchList";
import { MobileBottomSheet } from "./components/MobileBottomSheet";
import type { BenchWithDirection } from "@shared/types";
import { fetchBenches } from "./api/fetchBenches";
import { ApiError } from "./api/apiClient";
import { handleBenchClick } from "./utils/handleBenchClick";
import { formatBenchCount, milesToMetres, type DistanceUnit } from "./utils/format";
import { Header } from "./components/Header";
import { RadiusSlider, DEFAULT_MAX_METRES, EXTENDED_MAX_METRES } from "./components/RadiusSlider";

const MOBILE_BREAKPOINT_QUERY = "(max-width: 767px)";
const DISTANCE_UNIT_STORAGE_KEY = "bench-finder-distance-unit";

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

function useDistanceUnit() {
  const [unit, setUnit] = useState<DistanceUnit>(
    () => (localStorage.getItem(DISTANCE_UNIT_STORAGE_KEY) as DistanceUnit | null) ?? "mi"
  );

  const changeUnit = (next: DistanceUnit) => {
    setUnit(next);
    localStorage.setItem(DISTANCE_UNIT_STORAGE_KEY, next);
  };

  return [unit, changeUnit] as const;
}

const App = () => {
  const isMobile = useIsMobile();
  const [unit, setUnit] = useDistanceUnit();

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
  const [sliderMaxMetres, setSliderMaxMetres] = useState<number>(DEFAULT_MAX_METRES);
  const [maxFetchedRadius, setMaxFetchedRadius] = useState<number>(0);
  const [loading, setLoading] = useState(false);
  const [benchesError, setBenchesError] = useState<string | null>(null);
  const hasFetchedRef = useRef(false);
  const initialRadiusRef = useRef(radius);

  const fetchAndCache = useCallback(
    async (targetRadius: number) => {
      if (!userLocation) return;
      const benches = await fetchBenches(userLocation, targetRadius);
      setCachedBenches(benches);
      setMaxFetchedRadius(targetRadius);
    },
    [userLocation]
  );

  // Fetch at the current radius first, then silently prefetch out to the
  // slider's default max — this stays fast because that default max is small.
  useEffect(() => {
    if (!userLocation || hasFetchedRef.current) return;
    hasFetchedRef.current = true;

    const fetchInitialBenches = async () => {
      setLoading(true);
      setBenchesError(null);
      try {
        await fetchAndCache(initialRadiusRef.current);
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

      if (initialRadiusRef.current < DEFAULT_MAX_METRES) {
        fetchAndCache(DEFAULT_MAX_METRES).catch((err) =>
          console.error("Failed to prefetch wider bench radius:", err)
        );
      }
    };

    fetchInitialBenches();
  }, [userLocation, fetchAndCache]);

  //filter visible benches from cache based on current radius
  useEffect(() => {
    const filtered = cachedBenches.filter((b) => {
      const distanceMeters = milesToMetres(b.distanceMiles ?? 0);
      return distanceMeters <= radius;
    });
    setBenchesWithDirection(filtered);
  }, [cachedBenches, radius]);

  // Opt-in only: people in sparse/rural areas can widen the search well past
  // the default max, but nobody pays for that wider Overpass fetch unless
  // they explicitly ask for it via the empty-state button below.
  const canExtendSearch = sliderMaxMetres < EXTENDED_MAX_METRES;

  const extendSearch = async () => {
    setSliderMaxMetres(EXTENDED_MAX_METRES);
    setRadius(EXTENDED_MAX_METRES);

    if (maxFetchedRadius >= EXTENDED_MAX_METRES) return;

    setLoading(true);
    setBenchesError(null);
    try {
      await fetchAndCache(EXTENDED_MAX_METRES);
    } catch (err) {
      console.error("Failed to extend bench search:", err);
      setBenchesError(
        err instanceof ApiError && err.status === 429
          ? "Too many requests right now — please wait a moment and try again."
          : "Couldn't load benches right now. Please try again shortly."
      );
    } finally {
      setLoading(false);
    }
  };

  const showLoadingSkeleton = loading && benchesWithDirection.length === 0;
  const showBenchesError = benchesError && benchesWithDirection.length === 0;

  const radiusSlider = (
    <RadiusSlider amount={radius} onAmountChange={setRadius} unit={unit} maxMetres={sliderMaxMetres} />
  );
  const benchList = (
    <BenchList
      benchesWithDirection={benchesWithDirection}
      selectedBenchIndex={selectedBenchIndex}
      onBenchClick={onBenchClick}
      unit={unit}
      loading={showLoadingSkeleton}
      error={showBenchesError ? benchesError : null}
      canExtendSearch={canExtendSearch}
      onExtendSearch={extendSearch}
    />
  );
  const benchMap = (
    <BenchMap
      setUserLocation={setUserLocation}
      selectedBenchIndex={selectedBenchIndex}
      benchesWithDirection={benchesWithDirection}
      selectedRoute={selectedRoute}
      unit={unit}
      loading={showLoadingSkeleton}
      onBenchClick={onBenchClick}
    />
  );

  return (
    <div className="flex flex-col h-dvh overflow-hidden bg-[var(--color-bg)]">
      <Header unit={unit} onUnitChange={setUnit} />
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
