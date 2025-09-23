import { type BenchWithDirection } from "../../../shared/types/BenchWithDirection";
import { fetchDirection } from "../api/fetchDirection";

export const handleBenchClick = async (
  sortedIndex: number,
  benches: BenchWithDirection[],
  userLocation: { lat: number; lng: number } | null,
  setBenchesWithDirection: React.Dispatch<
    React.SetStateAction<BenchWithDirection[]>
  >,
  setSelectedBenchIndex: React.Dispatch<React.SetStateAction<number | null>>,
  setSelectedRoute: React.Dispatch<React.SetStateAction<any>>
) => {
  if (!userLocation) return;

  const bench = benches[sortedIndex];
  if (!bench?.lat || !bench?.lng) return;

  //update selected bench index for highlighting
  setSelectedBenchIndex(sortedIndex);

  try {
    //fetch full diretions with geojson
    const dir = await fetchDirection(
      userLocation.lat,
      userLocation.lng,
      bench.lat,
      bench.lng,
      true //fetch geojson on click
    );

    if (!dir) return;

    //update the specific bench with geojson only
    setBenchesWithDirection((prev) =>
      prev.map((b, i) =>
        i === sortedIndex ? { ...b, geojson: dir.geojson } : b
      )
    );

    setSelectedRoute(dir.geojson ?? null);
  } catch (err) {
    console.error(`Failed to fetch directions for bench ${bench.id}:`, err);
  }
};
