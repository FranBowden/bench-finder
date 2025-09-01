import React, { useEffect, useState } from "react";
import Map from "./features/benches/components/map";
import { ListSection } from "./features/benches/components/List";
import type { Bench } from "../../shared/types/bench";
import type { BenchWithDirection } from "../../shared/types/BenchWithDirection";
import { fetchDirection } from "./api/fetchDirection";

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

  // Fetch benches and calculate distance/duration on load
  useEffect(() => {
    if (!userLocation) return;

    const fetchBenches = async () => {
      try {
        const res = await fetch(
          `http://localhost:3000/api/benches?lat=${userLocation.lat}&lng=${userLocation.lng}`
        );
        const benchesData: Bench[] = (await res.json()).filter(
          (b) => typeof b.lat === "number" && typeof b.lng === "number"
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
    console.log(bench);
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
    <div className="flex h-screen overflow-y-auto">
      <ListSection
        benchesWithDirection={benchesWithDirection}
        selectedBenchIndex={selectedBenchIndex}
        setSelectedBenchIndex={handleBenchClick} // pass sorted index
      />
      <Map
        setUserLocation={setUserLocation}
        userLocation={userLocation}
        selectedBenchIndex={selectedBenchIndex}
        benchesWithDirection={benchesWithDirection}
        selectedRoute={selectedRoute}
      />
    </div>
  );
};

export default App;
