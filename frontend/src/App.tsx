import { useEffect, useState } from "react";
import { BenchMap } from "./components/BenchMap";
import { BenchList } from "./components/BenchList";
import { MobileBottomSheet } from "./components/MobileBottomSheet";
import type { BenchWithDirection } from "@shared/types/BenchWithDirection";
import { fetchBenches } from "./api/fetchBenches";
import { ApiError } from "./api/apiClient";
import { handleBenchClick } from "./utils/handleBenchClick";
import { formatBenchCount, milesToMetres } from "./utils/format";
import { Header } from "./components/Header";
import { RadiusSlider } from "./components/RadiusSlider";
import type { Place } from "@shared/types/place";

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
  const [maxFetchedRadius, setMaxFetchedRadius] = useState<number>(0);
  const [cachedLocation, setCachedLocation] = useState<{
    lat: number;
    lng: number;
  } | null>(null);
  const [radius, setRadius] = useState<number>(400);
  const [loading, setLoading] = useState(false);
  const [benchesError, setBenchesError] = useState<string | null>(null);
  const [selectedPlace, setSelectedPlace] = useState<Place | null>(null);

  const handlePlaceSelect = (place: Place) => {
    setSelectedPlace(place);
    setUserLocation({ lat: place.lat, lng: place.lng });
  };

  //fetch benches when userLocation / radius changes if needed to
  useEffect(() => {
    if (!userLocation) return;

    // The cache is only valid for the location it was fetched for — a
    // location change (search, or the map's own geolocate button) must
    // always refetch, regardless of how the radius compares to before.
    const locationChanged =
      !cachedLocation ||
      cachedLocation.lat !== userLocation.lat ||
      cachedLocation.lng !== userLocation.lng;

    if (!locationChanged && radius <= maxFetchedRadius) return;

    const fetchData = async () => {
      setLoading(true);
      setBenchesError(null);
      try {
        const benches = await fetchBenches(userLocation, radius);
        setCachedBenches(benches);
        setMaxFetchedRadius(radius);
        setCachedLocation(userLocation);
      } catch (err) {
        console.error("Failed to fetch benches:", err);
        setBenchesError(
          err instanceof ApiError && err.status === 429
            ? "Too many requests right now — please wait a moment and try again."
            : "Couldn't load benches right now. Please try again shortly."
        );
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [userLocation, radius, maxFetchedRadius, cachedLocation]);

  //filter visible benches from cache based on current radius
  useEffect(() => {
    const filtered = cachedBenches.filter((b) => {
      const distanceMeters = milesToMetres(b.distanceMiles ?? 0);
      return distanceMeters <= radius;
    });
    setBenchesWithDirection(filtered);
  }, [cachedBenches, radius]);

  // Only show the loading skeleton when there's nothing to show yet — a
  // radius increase that's fetching a wider result set still has the
  // previous (smaller-radius) results to display in the meantime, so the
  // list shouldn't blank out and reappear on every radius change. Same
  // logic for a failed fetch: if there's already real data on screen (from
  // an earlier successful fetch), keep showing it rather than replacing it
  // with an error — only surface the error when there's nothing else to show.
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

  return (
    <div className="flex flex-col h-dvh overflow-hidden bg-[var(--color-bg)]">
      <Header onPlaceSelect={handlePlaceSelect} />
      <div className="flex flex-col md:flex-row flex-1 min-h-0">
        {/* Map section */}
        <div className="order-1 md:order-2 flex-1 min-h-[55vh] md:min-h-0 relative">
          <BenchMap
            selectedPlace={selectedPlace}
            setUserLocation={setUserLocation}
            selectedBenchIndex={selectedBenchIndex}
            benchesWithDirection={benchesWithDirection}
            selectedRoute={selectedRoute}
            loading={showLoadingSkeleton}
            onBenchClick={onBenchClick}
          />
        </div>

        {/* List section — a draggable/tappable bottom sheet on mobile,
            a fixed static sidebar on desktop. Only one ever mounts, so the
            (potentially large) bench list isn't rendered twice. */}
        {isMobile ? (
          <div className="order-2 -mt-5 relative z-10">
            <MobileBottomSheet summaryLabel={formatBenchCount(benchesWithDirection.length)}>
              {radiusSlider}
              {benchList}
            </MobileBottomSheet>
          </div>
        ) : (
          <div className="order-1 flex flex-col w-[380px] lg:w-[420px] shrink-0 bg-[var(--color-surface)] border-r border-[var(--color-border)] h-full overflow-hidden">
            {radiusSlider}
            <div className="overflow-y-auto scrollbar-thin flex-1">{benchList}</div>
          </div>
        )}
      </div>
    </div>
  );
};

export default App;
