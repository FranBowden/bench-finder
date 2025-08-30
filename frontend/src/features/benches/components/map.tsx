import React, { useRef, useEffect } from "react";
import mapboxgl from "mapbox-gl";
<<<<<<< Updated upstream:src/map.tsx
import { fetchBenches, type Bench } from "./fetchBenches";
import ReactDOMServer from "react-dom/server";
import { getDirection } from "./CalculateDistance";
import bench from "./assets/bench.png";
=======
import ReactDOMServer from "react-dom/server";
import { getDirection } from "./calculateDistance";
import { type Bench } from "../../../types/bench.ts";
import benchIcon from "../../../../assets/bench.png";

declare global {
  interface ImportMeta {
    env: {
      VITE_MAPBOX_API: string;
      [key: string]: any;
    };
  }
}
>>>>>>> Stashed changes:frontend/src/features/benches/components/map.tsx

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

  useEffect(() => {
    if (map.current || !mapContainer.current) return;

    const fallbackLat = 51.4015;
    const fallbackLng = -2.329177;
    const initializeMap = async (lat: number, lng: number) => {
      setUserLocation({ lat, lng });

      //const benches = await fetchBenches(lat, lng);

      const getBenches = async (lat: number, lng: number) => {
        const res = await fetch(
          `http://localhost:3000/api/benches?lat=${lat}&lng=${lng}`
        );
        return res.json();
      };
      const benches = await getBenches(lat, lng);
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

  //Creates the markers on the map and changes colour if its been selected or not
  useEffect(() => {
    if (!map.current || !userLocation) return;

    const markers: mapboxgl.Marker[] = [];

    allBenches.forEach(async ({ lat, lng, id }) => {
<<<<<<< Updated upstream:src/map.tsx
      if(userLocation?.lat && userLocation?.lng) {

    
=======
>>>>>>> Stashed changes:frontend/src/features/benches/components/map.tsx
      const distance = await getDirection(
        userLocation.lat,
        userLocation.lng,
        lat,
        lng
      );
<<<<<<< Updated upstream:src/map.tsx
      
      const distanceText = `${distance.toFixed(1)} meters`;

   
=======
      const distanceText =
        distance !== undefined
          ? `${distance.toFixed(1)} meters`
          : "Distance unavailable";

>>>>>>> Stashed changes:frontend/src/features/benches/components/map.tsx
      const markerHtml = ReactDOMServer.renderToString(
        <img src={benchIcon} width={50} alt="Bench" />
        /*
        <FaMapMarkerAlt
          size={38}
          color={isSelected ? "#ef5151" : "#67d2fcff"}
          style={{ filter: "drop-shadow(1px 1px 2px rgba(69, 69, 69, 0.65))" }}
        />*/
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
      }
    });

    return () => markers.forEach((marker) => marker.remove());
  }, [allBenches, selectedBenchIndex]);

  //Moves to that marker when bench in list has been selected
  useEffect(() => {
    if (!map.current || selectedBenchIndex === null) return;
    const bench = allBenches[selectedBenchIndex];
    if (!bench) return;

    map.current.flyTo({
      center: [bench.lng, bench.lat],
      zoom: 16,
      essential: true,
    });
    console.log(" SelectedBenchIndex:" + selectedBenchIndex);
  }, [selectedBenchIndex]);

<<<<<<< Updated upstream:src/map.tsx
return <div ref={mapContainer} className="w-full h-full " />;

=======
  return <div ref={mapContainer} className="w-full h-full" />;
>>>>>>> Stashed changes:frontend/src/features/benches/components/map.tsx
};

export default Map;
