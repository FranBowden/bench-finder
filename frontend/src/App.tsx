import React, { useEffect, useState } from "react";
import Map from "./components/map";
import { ListSection } from "./components/List";
import type { BenchWithDirection } from "../../shared/types/BenchWithDirection";
import { fetchDirection } from "./api/fetchDirection";
import { fetchBenches } from "./api/fetchBenches";
import { handleBenchClick } from "./utils/handleBenchClick";
import AlertComponent from "./components/alert";
import HeaderComponent from "./components/header";
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

  useEffect(() => {
    if (!userLocation) return;

    const fetchData = async () => {
      const benches = await fetchBenches(userLocation);
      setBenchesWithDirection(benches); // now works fine
    };
    fetchData();
  }, [userLocation]);

  return (
    <div className="flex flex-col h-screen overflow-y-auto scrollbar-hide">
      <HeaderComponent></HeaderComponent>
      <AlertComponent />
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
            onBenchClick={onBenchClick}
          />
        </div>
      </div>
    </div>
  );
};

export default App;
