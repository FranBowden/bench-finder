import React, { useEffect, useState } from "react";
import Map from "./features/benches/components/map";
import { ListSection } from "./features/benches/components/List";
import type { Bench } from "../../shared/types/bench";
import type { BenchWithDirection } from "../../shared/types/BenchWithDirection";
import { fetchDirection } from "./api/fetchDirection";
import HeaderComponent from "./features/benches/components/header";

const App: React.FC = () => {
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
  const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3000";

  // Fetch benches and calculate distance/duration on load
  useEffect(() => {
    if (!userLocation) return;

    const fetchBenches = async () => {
      try {
        const res = await fetch(
          `${API_URL}/api/benches?lat=${userLocation.lat}&lng=${userLocation.lng}`
        );
        const benchesData: Bench[] = (await res.json()).filter(
          (b: Bench) => typeof b.lat === "number" && typeof b.lng === "number"
        );

        const benchesWithInfo: BenchWithDirection[] = await Promise.all(
          benchesData.map(async (b, idx) => {
            const dir = await fetchDirection(
              userLocation.lat,
              userLocation.lng,
              b.lat,
              b.lng
            );
            return {
              ...b,
              originalIndex: idx,
              distanceMiles: dir?.distanceMiles ?? NaN,
              durationMinutes: dir?.durationMinutes ?? NaN,
              distanceText:
                dir?.distanceMiles != null
                  ? `${dir.distanceMiles.toFixed(1)} mi away`
                  : "Distance unknown",
              durationText:
                dir?.durationMinutes != null
                  ? `${dir.durationMinutes.toFixed(0)} min`
                  : "Duration unknown",
              geojson: dir?.geojson,
            };
          })
        );

        benchesWithInfo.sort((a, b) => {
          const distA = a.distanceMiles ?? NaN;
          const distB = b.distanceMiles ?? NaN;

          if (isNaN(distA)) return 1;
          if (isNaN(distB)) return -1;

          return distA - distB;
        });

        setBenchesWithDirection(benchesWithInfo);
      } catch (err) {
        console.error("Failed to fetch benches:", err);
      }
    };

    fetchBenches();
  }, [userLocation]);

  // Handle click on a bench
  const handleBenchClick = async (sortedIndex: number) => {
    setSelectedBenchIndex(sortedIndex); // store sorted index
    const bench = benchesWithDirection[sortedIndex];

    if (!userLocation || !bench.lat || !bench.lng) return;

    // Fetch directions and set route
    const dir = await fetchDirection(
      userLocation.lat,
      userLocation.lng,
      bench.lat,
      bench.lng
    );
    setSelectedRoute(dir?.geojson ?? null);
  };

  return (
    <div className="flex flex-col h-screen overflow-y-auto scrollbar-hide">
      <HeaderComponent />

      <div className="flex flex-col md:flex-row h-screen overflow-hidden">
        {/* Map section */}
        <div className="flex-1 order-1 md:order-2">
          <Map
            setUserLocation={setUserLocation}
            selectedBenchIndex={selectedBenchIndex}
            benchesWithDirection={benchesWithDirection}
            selectedRoute={selectedRoute}
          />
        </div>

        {/* List section */}
        <div className="overflow-y-auto max-h-[40vh] md:max-h-[93vh] md:h-full order-2 md:order-1">
          <ListSection
            benchesWithDirection={benchesWithDirection}
            selectedBenchIndex={selectedBenchIndex}
            setSelectedBenchIndex={handleBenchClick}
          />
        </div>
      </div>
    </div>
  );
};

export default App;
