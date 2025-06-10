import { useEffect, useState } from "react";
import { getDirection } from "./calculateDistance";
import type { Bench } from "./fetchBenches";

type Props = {
  allBenches: Bench[];
  userLocation: { lat: number; lng: number } | null;
  selectedBenchIndex: number | null;
  setSelectedBenchIndex: (index: number) => void;
};

type BenchWithIndex = Bench & { originalIndex: number };

export function ListSection({
  allBenches,
  userLocation,
  selectedBenchIndex,
  setSelectedBenchIndex,
}: Props) {
  const [filteredBenches, setFilteredBenches] = useState<BenchWithIndex[]>([]);
  const [distanceTexts, setDistanceTexts] = useState<string[]>([]);

  useEffect(() => {
    async function fetchAndFilter() {
      if (!userLocation) {
        // No location — show first 10 benches with unknown distance
        const benchesWithIndex = allBenches.slice(0, 10).map((bench, idx) => ({
          ...bench,
          originalIndex: idx,
        }));
        setFilteredBenches(benchesWithIndex);
        setDistanceTexts(benchesWithIndex.map(() => "Distance unknown"));
        return;
      }

      // Fetch distances for all benches
      const benchesWithDistance = await Promise.all(
        allBenches.map(async (bench, idx) => {
          const distance = await getDirection(
            userLocation.lat,
            userLocation.lng,
            bench.lat,
            bench.lng
          );
          return { bench, distance, originalIndex: idx };
        })
      );

      // Sort by distance ascending
      benchesWithDistance.sort((a, b) => a.distance - b.distance);

      // Take first 10 closest
      const top10 = benchesWithDistance.slice(0, 10);

      // Prepare filtered benches with originalIndex
      const benchesWithOriginalIndex: BenchWithIndex[] = top10.map(
        ({ bench, originalIndex }) => ({
          ...bench,
          originalIndex,
        })
      );

      setFilteredBenches(benchesWithOriginalIndex);
      setDistanceTexts(
        top10.map(({ distance }) => `${distance.toFixed(1)}m away`)
      );
    }

    fetchAndFilter();
  }, [allBenches, userLocation]);

  return (
    <section
      className="
        fixed top-12 left-4
        w-84 h-120
        p-4 bg-white shadow-md z-50 
        rounded-3xl
      "
    >
      <h2 className="text-black mb-2 font-semibold">Nearby Benches:</h2>
      <ul className="list-none border border-gray-300">
        {filteredBenches.map((bench, index) => (
          <IndividualList
            key={index} // Use index for key to keep unique keys in this filtered list
            text={`Bench ${distanceTexts[index] ?? "Calculating..."}`}
            isSelected={selectedBenchIndex === bench.originalIndex}
            onClick={() => setSelectedBenchIndex(bench.originalIndex)}
          />
        ))}
      </ul>
    </section>
  );
}

type IndividualListProps = {
  text: string;
  isSelected: boolean;
  onClick: () => void;
};

function IndividualList({ text, isSelected, onClick }: IndividualListProps) {
  return (
    <li className="border-b border-gray-300 last:border-none">
      <button
        onClick={onClick}
        className={`w-full text-left p-2 hover:bg-blue-200 ${
          isSelected ? "bg-red-300" : ""
        }`}
      >
        {text}
      </button>
    </li>
  );
}
