import React, { useEffect, useState } from "react";
import Map from "./components/map";
import { ListSection } from "./components/List";
import type { BenchWithDirection } from "../../shared/types/BenchWithDirection";
import { fetchBenches } from "./api/fetchBenches";
import { handleBenchClick } from "./utils/handleBenchClick";
import AlertComponent from "./components/alert";
import HeaderComponent from "./components/header";
import { IncreaseRange } from "./components/IncreaseRange";
import {Place} from '../../shared/types/place'

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

  const [cachedBenches, setCachedBenches] = useState<BenchWithDirection[]>([]);
  const [maxFetchedRadius, setMaxFetchedRadius] = useState<number>(0);
  const [radius, setRadius] = useState<number>(1000);
  const [loading, setLoading] = useState(false);
  const [selectedPlace, setSelectedPlace] = useState<Place | null>(null);

  //fetch benches when userLocation / radius changes if needed to
  useEffect(() => {
    if (!userLocation) return;

    const fetchData = async () => {
      //only fetch if we need a larger radius than cached
      if (radius > maxFetchedRadius) {
        setLoading(true);
        const benches = await fetchBenches(userLocation, radius);
        //   console.log("Benches received from backend:", benches);

        setCachedBenches(benches);
        setMaxFetchedRadius(radius);
        setLoading(false);
      }
    };

    fetchData();
  }, [userLocation, radius, maxFetchedRadius]);

  //filter visible benches from cache based on current radius
  useEffect(() => {
    const filtered = cachedBenches.filter((b) => {
      const distanceMeters = (b.distanceMiles ?? 0) * 1609.34;
      return distanceMeters <= radius;
    });
    setBenchesWithDirection(filtered);
  }, [cachedBenches, radius]);

  return (
    <div className="flex flex-col h-screen overflow-y-auto scrollbar-hide">
      <HeaderComponent
      onPlaceSelect={setSelectedPlace}
      radius={radius}
      setCachedBenches={setCachedBenches}
      ></HeaderComponent>
      <AlertComponent />
      <div className="flex flex-col md:flex-row h-screen overflow-hidden">
        {/* Map section */}
        <div className="flex-1 order-1 md:order-2">
          <Map
          selectedPlace={selectedPlace} 
            setUserLocation={setUserLocation}
            selectedBenchIndex={selectedBenchIndex}
            benchesWithDirection={benchesWithDirection}
            selectedRoute={selectedRoute}
          />
        </div>

        {/* List section  */}
        <div className="flex flex-col order-2 md:order-1">
          <IncreaseRange amount={radius} onAmountChange={setRadius} />
          <div className="overflow-y-auto max-h-[20vh] md:max-h-[90vh] md:h-full ">
            <ListSection
              benchesWithDirection={benchesWithDirection}
              selectedBenchIndex={selectedBenchIndex}
              onBenchClick={onBenchClick}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default App;
