import { useEffect, useState } from "react";
import { getDirection } from "./calculateDistance";
import type { Bench } from "./fetchBenches";
import { IoMdMenu } from "react-icons/io";

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
    <main className="flex">
      <section
        className="
            h-[92vh]
             w-full sm:w-96
            p-4 shadow-md z-auto   overflow-y-auto     scrollbar scrollbar-thumb-white scrollbar-track-gray-200

          "
      >
        <div className="flex items-center justify-between">
          <h2 className="text-black mb-2 ml-3 text-2xl font-semibold">Nearby</h2>
          <IoMdMenu className="text-3xl text-blue-800" />
        </div>
        <ul className="list-none ">
          {filteredBenches.map((bench, index) => (
            <IndividualList
              key={index} // Use index for key to keep unique keys in this filtered list
              text={`Bench ${distanceTexts[index] ?? "Calculating..."}`}
              isSelected={selectedBenchIndex === bench.originalIndex}
              onClick={() => setSelectedBenchIndex(bench.originalIndex)}
              imageUrl={bench.image && <img src={bench.image} alt="Bench" />} />

           
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
  imageUrl: any;
};

function IndividualList({
  text,
  isSelected,
  onClick,
  imageUrl,
}: IndividualListProps) {
  return (
    <li className="border-b border-gray-100 last:border-none">
      <button
        onClick={onClick}
        className={`w-full flex items-center space-x-4 text-left p-4 hover:bg-zinc-200 hover:rounded-lg ${
          isSelected ? "bg-[#7dafed]" : ""
        }`}
      >
        <div className="flex-shrink-0 w-12 h-12 overflow-hidden rounded-md">
          <img src={imageUrl} alt="" className="object-cover w-full h-full" />
        </div>

        <div>{text}</div>
      </button>
    </li>
  );
}
