import React, { useRef, useEffect, useState } from "react";
import mapboxgl from "mapbox-gl";
import { fetchBenches, getClosestBenches, type Bench } from "./fetchBenches"; // Ensure both are exported

mapboxgl.accessToken = import.meta.env.VITE_MAPBOX_API;

type MapProps = {
  setClosestBenches: (benches: Bench[]) => void;
  setUserLocation: (loc: { lat: number; lng: number }) => void;
  selectedBenchIndex: number | null;
};

const Map: React.FC<MapProps> = ({ setClosestBenches, setUserLocation, selectedBenchIndex }) => {


  const mapContainer = useRef<HTMLDivElement | null>(null);
  const map = useRef<mapboxgl.Map | null>(null);

   const [allBenches, setAllBenches] = useState<Bench[]>([]);


  if (!mapboxgl.supported()) {
    return <div>Your browser does not support WebGL</div>;
  }

  useEffect(() => {
    if (map.current || !mapContainer.current) return;

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const userLng = position.coords.longitude;
        const userLat = position.coords.latitude;
        setUserLocation({ lat: userLat, lng: userLng });

        const allBenches = await fetchBenches(userLat, userLng);
        setAllBenches(allBenches);

        const closest = getClosestBenches(userLat, userLng, allBenches);
        setClosestBenches(closest);

        map.current = new mapboxgl.Map({
          container: mapContainer.current!,
          style: "mapbox://styles/mapbox/streets-v11",
          center: [userLng, userLat],
          zoom: 14,
        });

        const geolocateControl = new mapboxgl.GeolocateControl({
          positionOptions: { enableHighAccuracy: true },
          trackUserLocation: true,
          showUserHeading: true,
        });

        map.current.addControl(geolocateControl);

        map.current.on("load", () => {
          geolocateControl.trigger();

          allBenches.forEach(({ lat, lng }) => {
            new mapboxgl.Marker().setLngLat([lng, lat]).addTo(map.current!);
          });
        });
      },
      (error) => {
        console.error("Geolocation error:", error);
      }
    );

    return () => {
      map.current?.remove();
      map.current = null;
    };
  }, []);

useEffect(() => {
  if (!map.current || selectedBenchIndex === null) return;
  const bench = allBenches[selectedBenchIndex];
  if (!bench) return;

  map.current.flyTo({
    center: [bench.lng, bench.lat],
    zoom: 24, 
    essential: true,
  });
}, [selectedBenchIndex]);
  return <div ref={mapContainer} style={{ width: "100vw", height: "90vh" }} />;
};

export default Map;
