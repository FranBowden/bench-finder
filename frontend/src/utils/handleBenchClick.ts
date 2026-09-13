import { type BenchWithDirection, type Coordinate } from "@shared/types";
import { fetchDirection } from "../api/fetchDirection";

export const handleBenchClick = async (
  sortedIndex: number,
  benches: BenchWithDirection[],
  userLocation: Coordinate | null,
  setBenchesWithDirection: React.Dispatch<
    React.SetStateAction<BenchWithDirection[]>
  >,
  setSelectedBenchIndex: React.Dispatch<React.SetStateAction<number | null>>,
  setSelectedRoute: React.Dispatch<React.SetStateAction<GeoJSON.Feature | null>>
) => {
  if (!userLocation) return;

  const bench = benches[sortedIndex];
  if (!bench?.lat || !bench?.lng) return;

  //update selected bench index for highlighting
  setSelectedBenchIndex(sortedIndex);

  try {
    const dir = await fetchDirection(
      userLocation,
      { lat: bench.lat, lng: bench.lng },
      true
    );

    //attach the route geometry only — the list intentionally keeps
    //showing its straight-line estimate rather than swapping in the real
    //routed figures, so the number never jumps around after a click
    setBenchesWithDirection((prev) =>
      prev.map((b, i) => (i === sortedIndex ? { ...b, geojson: dir.geojson } : b))
    );

    setSelectedRoute(dir.geojson ?? null);
  } catch (err) {
    console.error(`Failed to fetch directions for bench ${bench.id}:`, err);
  }
};
