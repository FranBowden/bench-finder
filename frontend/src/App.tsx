import React, { useState } from "react";
import Map from "./features/benches/components/map";
import type { Bench } from "../../shared/types/bench";
import { ListSection } from "./features/benches/components/List";
import HeaderComponent from "./features/benches/components/header";

const App: React.FC = () => {
  const [userLocation, setUserLocation] = useState<{
    lat: number;
    lng: number;
  } | null>(null);
  const [allBenches, setAllBenches] = useState<Bench[]>([]);
  const [selectedBenchIndex, setSelectedBenchIndex] = useState<number | null>(
    null
  );

  return (
    <div className="overflow-y-auto scrollbar-hide">
      <HeaderComponent></HeaderComponent>

      <div className="flex h-screen overflow-y-auto scrollbar-hide">
        <ListSection
          allBenches={allBenches}
          userLocation={userLocation}
          selectedBenchIndex={selectedBenchIndex}
          setSelectedBenchIndex={setSelectedBenchIndex}
        />
        <Map
          setUserLocation={setUserLocation}
          userLocation={userLocation}
          selectedBenchIndex={selectedBenchIndex}
          allBenches={allBenches}
          setAllBenches={setAllBenches}
        />
      </div>
    </div>
  );
};

export default App;
