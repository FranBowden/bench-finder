import React, { useRef, useEffect } from "react";
import mapboxgl from "mapbox-gl";
import { BenchWithDirection } from "../../../../../shared/types/BenchWithDirection";
import benchIcon from "../../../../assets/bench.png";

mapboxgl.accessToken = import.meta.env.VITE_MAPBOX_API_KEY;

type MapProps = {
  setUserLocation: (loc: { lat: number; lng: number }) => void;
  userLocation: { lat: number; lng: number } | null;
  selectedBenchIndex: number | null;
  benchesWithDirection: BenchWithDirection[];
  selectedRoute: GeoJSON.Feature | null;
};

const Map: React.FC<MapProps> = ({
  setUserLocation,
  userLocation,
  selectedBenchIndex,
  benchesWithDirection,
  selectedRoute,
}) => {
  const mapContainer = useRef<HTMLDivElement | null>(null);
  const map = useRef<mapboxgl.Map | null>(null);

  if (!mapboxgl.supported())
    return <div>Your browser does not support WebGL</div>;

  //Initialize map - mapbox
  useEffect(() => {
    if (map.current || !mapContainer.current) return;

    const fallbackLat = 51.4015;
    const fallbackLng = -2.329177;

    const initializeMap = (lat: number, lng: number) => {
      setUserLocation({ lat, lng });

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
      mapInstance.on("load", () => geolocateControl.trigger());
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

  //Create bench Markers
  useEffect(() => {
    if (!map.current) return;
    const activeMarkers: mapboxgl.Marker[] = [];

    benchesWithDirection.forEach((bench) => {
      const el = document.createElement("div");
      el.innerHTML = `<img src="${benchIcon}" width="50" />`;

      const popup = new mapboxgl.Popup({ offset: 25 }).setText(
        `Bench ${bench.originalIndex}: ${bench.distanceText}, ${bench.durationText}`
      );

      const marker = new mapboxgl.Marker(el)
        .setLngLat([bench.lng, bench.lat])
        .setPopup(popup)
        .addTo(map.current!);
      activeMarkers.push(marker);
    });

    return () => activeMarkers.forEach((m) => m.remove());
  }, [benchesWithDirection]);

  //Fly to the selected Bench
  useEffect(() => {
    if (!map.current || selectedBenchIndex === null) return;
    const bench = benchesWithDirection[selectedBenchIndex];
    if (!bench) return;

    map.current.flyTo({
      center: [bench.lng, bench.lat],
      zoom: 16,
      essential: true,
    });
  }, [selectedBenchIndex, benchesWithDirection]);

  //Draw route to selected Bench
  useEffect(() => {
    if (!map.current) return;

    if (map.current.getLayer("route")) {
      map.current.removeLayer("route");
      map.current.removeSource("route");
    }

    if (!selectedRoute) return;

    map.current.addSource("route", { type: "geojson", data: selectedRoute });
    map.current.addLayer({
      id: "route",
      type: "line",
      source: "route",
      layout: {
        "line-join": "round",
        "line-cap": "round",
      },
      paint: {
        "line-color": "rgba(27, 173, 27, 1)",
        "line-width": 10,
        "line-dasharray": [0, 2],
      },
    });
  }, [selectedRoute]);

  return <div ref={mapContainer} className="w-full h-full" />;
};

export default Map;
