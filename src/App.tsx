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
    <div className="overflow-y-auto scrollbar-hide ">
      
      <HeaderComponent></HeaderComponent>


<div className="flex flex-col md:flex-row h-screen ">

     
  <div className="h-1/2 md:flex-1 md:h-full">
     <Map
        setUserLocation={setUserLocation}
        userLocation={userLocation}
        selectedBenchIndex={selectedBenchIndex}
        allBenches={allBenches}
        setAllBenches={setAllBenches}
      />
      </div>
    

<div className="h-2/5 md:h-full md:basis-1/4 overflow-y-auto scrollbar-hide">
      <ListSection 
        allBenches={allBenches}
        userLocation={userLocation}
        selectedBenchIndex={selectedBenchIndex}
        setSelectedBenchIndex={setSelectedBenchIndex}
      />
      </div>
      </div>
    </div>
  );
};

export default App;
