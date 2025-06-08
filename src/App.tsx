import React, { useState } from 'react';
import Map from './map';
import { type Bench } from './fetchBenches';
import { ListSection } from './List';

const App: React.FC = () => {
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [closestBenches, setClosestBenches] = useState<Bench[]>([]);
  const [selectedBenchIndex, setSelectedBenchIndex] = useState<number | null>(null);

  return (
    <div>
<h1 className="text-center font-bold text-[30px]">Bench Finder</h1>
<ListSection
  benches={closestBenches}
  userLocation={userLocation}
  selectedBenchIndex={selectedBenchIndex}
  onSelectBench={setSelectedBenchIndex}
/>      <Map setClosestBenches={setClosestBenches} setUserLocation={setUserLocation} selectedBenchIndex={selectedBenchIndex}/>
    </div>
  );
};

export default App
