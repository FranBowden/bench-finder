import React, { useRef, useEffect, useState } from "react";
import mapboxgl from "mapbox-gl";
import { fetchBenches, getClosestBenches, type Bench } from "./fetchBenches"; // Ensure both are exported
import { FaMapMarkerAlt } from "react-icons/fa";
import ReactDOMServer from "react-dom/server";

mapboxgl.accessToken = import.meta.env.VITE_MAPBOX_API;

type MapProps = {
  setClosestBenches: (benches: Bench[]) => void;
  setUserLocation: (loc: { lat: number; lng: number }) => void;
  selectedBenchIndex: number | null;
};

const Map: React.FC<MapProps> = ({
  setClosestBenches,
  setUserLocation,
  selectedBenchIndex,
}) => {
  const mapContainer = useRef<HTMLDivElement | null>(null);
  const map = useRef<mapboxgl.Map | null>(null);

  const [allBenches, setAllBenches] = useState<Bench[]>([]);
  
 
  if (!mapboxgl.supported()) {
    return <div>Your browser does not support WebGL</div>;
  }

  useEffect(() => {
  if (map.current || !mapContainer.current) return;

  const fallbackLat = 51.4015;
  const fallbackLng = -2.329177;
  const initializeMap = async (lat: number, lng: number) => {
    setUserLocation({ lat, lng });

    const benches = await fetchBenches(lat, lng);
    setAllBenches(benches);
    const closest = getClosestBenches(lat, lng, benches);
    setClosestBenches(closest);

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

useEffect(() => {
  if (!map.current) return;
  const markers: mapboxgl.Marker[] = [];

  allBenches.forEach(({ lat, lng }, index) => {
    const isSelected = index === selectedBenchIndex;
    const markerColor = isSelected ? "#ef5151" : "#3dceff";
    const markerHtml = ReactDOMServer.renderToString(
      <FaMapMarkerAlt
        size={38}
        color={markerColor}
        style={{ filter: "drop-shadow(1px 1px 2px rgba(69, 69, 69, 0.65))" }}
      />
    );
    const customMarker = document.createElement("div");
    customMarker.innerHTML = markerHtml;
    const marker = new mapboxgl.Marker(customMarker)
      .setLngLat([lng, lat])
      .addTo(map.current!);
    markers.push(marker);
  });

  return () => markers.forEach(marker => marker.remove());
}, [allBenches, selectedBenchIndex]);

  useEffect(() => {
    if (!map.current || selectedBenchIndex === null) return;
    const bench = allBenches[selectedBenchIndex];
    if (!bench) return;

    map.current.flyTo({
      center: [bench.lng, bench.lat],
      zoom: 16,
      essential: true,
    });
    console.log(" SelectedBenchIndex:" + selectedBenchIndex)

  }, [selectedBenchIndex]);


  return <div ref={mapContainer} style={{ width: "100vw", height: "90vh" }} />;
};

export default Map;
