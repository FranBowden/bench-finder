import React, { useRef, useEffect } from "react";
import mapboxgl from "mapbox-gl";
import ReactDOMServer from "react-dom/server";
import { getDirection } from "./calculateDistance"; // make sure filename matches
import type { Bench } from "../../../types/bench";
import benchIcon from "../../../../assets/bench.png";

declare global {
  interface ImportMeta {
    env: {
      VITE_MAPBOX_API: string;
      [key: string]: any;
    };
  }
}

mapboxgl.accessToken = import.meta.env.VITE_MAPBOX_API;

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

      // Fetch benches from backend
      const getBenches = async (lat: number, lng: number) => {
        const res = await fetch(
          `http://localhost:3000/api/benches?lat=${lat}&lng=${lng}`
        );
        return res.json();
      };
      const benches: Bench[] = await getBenches(lat, lng);
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

    const markers: mapboxgl.Marker[] = [];

    allBenches.forEach(async ({ lat, lng, id }) => {
      const distance = await getDirection(
        userLocation.lat,
        userLocation.lng,
        lat,
        lng
      );
      const distanceText =
        distance !== undefined
          ? `${distance.toFixed(1)} meters`
          : "Distance unavailable";

      const markerHtml = ReactDOMServer.renderToString(
        <img src={benchIcon} width={50} alt="Bench" />
      );

      const customMarker = document.createElement("div");
      customMarker.innerHTML = markerHtml;

      const marker = new mapboxgl.Marker(customMarker)
        .setLngLat([lng, lat])
        .setPopup(
          new mapboxgl.Popup({ offset: 25 }).setHTML(
            `<h3>Bench ${id}</h3><p>${distanceText}</p>`
          )
        )
        .addTo(map.current!);

      markers.push(marker);
    });

    return () => markers.forEach((marker) => marker.remove());
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
    console.log("SelectedBenchIndex:", selectedBenchIndex);
  }, [selectedBenchIndex]);

  return <div ref={mapContainer} className="w-full h-full" />;
};

export default Map;
