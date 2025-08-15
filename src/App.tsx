import React, { useState } from "react";
import Map from "./map";
import { type Bench } from "./fetchBenches";
import { ListSection } from "./List";
import HeaderComponent from "./header";


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


       <div className="flex h-screen">

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
