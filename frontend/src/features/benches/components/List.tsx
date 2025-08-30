import { useEffect, useState } from "react";
<<<<<<< Updated upstream:src/List.tsx
import { getDirection } from "./CalculateDistance";
import type { Bench } from "./fetchBenches";
=======
import { getDirection } from "./calculateDistance";
>>>>>>> Stashed changes:frontend/src/features/benches/components/List.tsx
import { IoMdMenu } from "react-icons/io";
import { type Bench } from "../../../types/bench";
import { type Props } from "../../../types/props";

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
      benchesWithDistance.sort(
        (a, b) =>
          (a.distance ?? Number.POSITIVE_INFINITY) -
          (b.distance ?? Number.POSITIVE_INFINITY)
      );

      const top10 = benchesWithDistance.slice(0, 10);

      const benchesWithOriginalIndex: BenchWithIndex[] = top10.map(
        ({ bench, originalIndex }) => ({
          ...bench,
          originalIndex,
        })
      );

      setFilteredBenches(benchesWithOriginalIndex);
      setDistanceTexts(
        top10.map(({ distance }) =>
          distance !== undefined
            ? `${distance.toFixed(1)}mi away`
            : "Distance unknown"
        )
      );
    }

    fetchAndFilter();
  }, [allBenches, userLocation]);

  return (
    <main className="flex">
      <section
        className="
            
             w-full sm:w-96
            p-4 shadow-md

          "
      >
        <div className="flex items-center justify-between">
<<<<<<< Updated upstream:src/List.tsx
          <h2 className="text-black mb-2 text-2xl font-semibold">Nearby</h2>
=======
          <h2 className="text-black mb-2 ml-3 text-2xl font-semibold">
            Nearby
          </h2>
>>>>>>> Stashed changes:frontend/src/features/benches/components/List.tsx
          <IoMdMenu className="text-3xl text-blue-800" />
        </div>
        <ul className="list-none ">
          {filteredBenches.map((bench, index) => (
            <IndividualList
              key={index} // Use index for key to keep unique keys in this filtered list
              text={`Bench ${distanceTexts[index] ?? "Calculating..."}`}
              isSelected={selectedBenchIndex === bench.originalIndex}
              onClick={() => setSelectedBenchIndex(bench.originalIndex)}
<<<<<<< Updated upstream:src/List.tsx
=======
              imageUrl={bench.image && <img src={bench.image} alt="Bench" />}
>>>>>>> Stashed changes:frontend/src/features/benches/components/List.tsx
            />
          ))}
        </ul>
      </section>
    </main>
  );
}

type IndividualListProps = {
  text: string;
  isSelected: boolean;
  onClick: () => void;
};

function IndividualList({
  text,
  isSelected,
  onClick,
}: IndividualListProps) {
  return (
    <li className="border-b border-gray-100">
      <button
        onClick={onClick}
        className={`w-full flex items-center space-x-4 text-left p-4 hover:bg-zinc-200 hover:rounded-lg ${
          isSelected ? "bg-zinc-400 rounded-lg" : ""
        }`}
      >
<<<<<<< Updated upstream:src/List.tsx
        
=======
        {imageUrl && (
          <div className="flex-shrink-0 w-12 h-12 overflow-hidden rounded-md">
            <img src={imageUrl} alt="" className="object-cover w-full h-full" />
          </div>
        )}
>>>>>>> Stashed changes:frontend/src/features/benches/components/List.tsx
        <div>{text}</div>
      </button>
    </li>
  );
}
