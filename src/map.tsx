import React, { useRef, useEffect } from "react";
import mapboxgl from "mapbox-gl";
import { fetchBenches } from "./fetchBenches"; // Make sure it's exported as fetchBenches

mapboxgl.accessToken = import.meta.env.VITE_MAPBOX_API;

const Map: React.FC = () => {
  const mapContainer = useRef<HTMLDivElement | null>(null);
  const map = useRef<mapboxgl.Map | null>(null);
  if (!mapboxgl.supported()) {
    return <div>Your browser does not support WebGL</div>;
  }
  useEffect(() => {
    if (map.current || !mapContainer.current) return;

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const userLng = position.coords.longitude;
        const userLat = position.coords.latitude;

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
          fetchBenches(userLat, userLng).then((benches) => {
            benches.forEach(({ lat, lng }) => {
              new mapboxgl.Marker().setLngLat([lng, lat]).addTo(map.current!);
            });
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

  return <div ref={mapContainer} style={{ width: "100vw", height: "90vh" }} />;
};

export default Map;
