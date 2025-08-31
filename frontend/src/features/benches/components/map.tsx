import React, { useRef, useEffect } from "react";
import mapboxgl from "mapbox-gl";
import type { Bench } from "../../../../../shared/types/bench";
import { fetchDirection } from "../../../api/fetchDirection";
import benchIcon from "../../../../assets/bench.png";

mapboxgl.accessToken = import.meta.env.VITE_MAPBOX_API_KEY;

type MapProps = {
  setUserLocation: (loc: { lat: number; lng: number }) => void;
  userLocation: { lat: number; lng: number } | null;
  selectedBenchIndex: number | null;
  allBenches: Bench[];
  setAllBenches: (benches: Bench[]) => void;
};

const Map: React.FC<MapProps> = ({
  setUserLocation,
  userLocation,
  selectedBenchIndex,
  allBenches,
  setAllBenches,
}) => {
  const mapContainer = useRef<HTMLDivElement | null>(null);
  const map = useRef<mapboxgl.Map | null>(null);

  if (!mapboxgl.supported()) {
    return <div>Your browser does not support WebGL</div>;
  }

  // Initialize map and fetch benches
  useEffect(() => {
    if (map.current || !mapContainer.current) return;

    const fallbackLat = 51.4015;
    const fallbackLng = -2.329177;

    const initializeMap = async (lat: number, lng: number) => {
      setUserLocation({ lat, lng });

      const res = await fetch(
        `http://localhost:3000/api/benches?lat=${lat}&lng=${lng}`
      );
      const benches: Bench[] = (await res.json()).filter(
        (b) => typeof b.lat === "number" && typeof b.lng === "number"
      );
      setAllBenches(benches);

      const mapInstance = new mapboxgl.Map({
        container: mapContainer.current!,
        style: "mapbox://styles/mapbox/streets-v11",
        center: [lng, lat],
        zoom: 14,
      });

      map.current = mapInstance;

      const geolocateControl = new mapboxgl.GeolocateControl({
        positionOptions: { enableHighAccuracy: true },
        trackUserLocation: true,
        showUserHeading: true,
      });

      mapInstance.addControl(geolocateControl);

      mapInstance.on("load", () => {
        geolocateControl.trigger();
      });
    };

    navigator.geolocation.getCurrentPosition(
      (pos) => initializeMap(pos.coords.latitude, pos.coords.longitude),
      () => initializeMap(fallbackLat, fallbackLng)
    );

    return () => {
      map.current?.remove();
      map.current = null;
    };
  }, []);

  // Create markers
  useEffect(() => {
    if (!map.current || !userLocation) return;

    let activeMarkers: mapboxgl.Marker[] = [];

    const createMarkers = async () => {
      const validBenches = allBenches.filter(
        (b) => typeof b.lat === "number" && typeof b.lng === "number"
      );

      const benchesWithDistance = await Promise.all(
        validBenches.map(async (bench) => {
          const distance = await fetchDirection(
            userLocation.lat,
            userLocation.lng,
            bench.lat,
            bench.lng
          );
          return { bench, distance };
        })
      );

      benchesWithDistance.forEach(({ bench }) => {
        const markerDiv = document.createElement("div");
        markerDiv.innerHTML = `<img src="${benchIcon}" width="50" alt="Bench" />`;

        const marker = new mapboxgl.Marker(markerDiv)
          .setLngLat([bench.lng, bench.lat])
          .addTo(map.current!);

        activeMarkers.push(marker);
      });
    };

    createMarkers();

    return () => activeMarkers.forEach((marker) => marker.remove());
  }, [allBenches, userLocation]);

  // Fly to selected bench
  useEffect(() => {
    if (!map.current || selectedBenchIndex === null) return;
    const bench = allBenches[selectedBenchIndex];
    if (!bench) return;

    map.current.flyTo({
      center: [bench.lng, bench.lat],
      zoom: 16,
      essential: true,
    });
  }, [selectedBenchIndex]);

  return <div ref={mapContainer} className="w-full h-full" />;
};

export default Map;
