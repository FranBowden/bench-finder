import React, { useState } from "react";
import Map from "./map";
import { type Bench } from "./fetchBenches";
import { ListSection } from "./List";

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
    <div>
      <div className=" shadow-md z-50 ">
        <h1 className="text-center font-bold text-[30px]">Bench Finder</h1>
      </div>
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
  );
};

export default App;
