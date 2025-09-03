import React, { useEffect, useState } from "react";
import Map from "./features/benches/components/map";
import { ListSection } from "./features/benches/components/List";
import type { BenchWithDirection } from "../../shared/types/BenchWithDirection";
import { fetchDirection } from "./api/fetchDirection";
import HeaderComponent from "./features/benches/components/header";
import { fetchBenches } from "./api/fetchBenches";

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
    fetchBenches(userLocation, setBenchesWithDirection);
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
