import { useEffect, useState } from "react";
import { getDirection } from "./CalculateDistance";
import { IoMdMenu } from "react-icons/io";
import type { Bench } from "../../../types/bench";
import type { Props } from "../../../types/props";

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
        const benchesWithIndex = allBenches.slice(0, 10).map((bench, idx) => ({
          ...bench,
          originalIndex: idx,
        }));
        setFilteredBenches(benchesWithIndex);
        setDistanceTexts(benchesWithIndex.map(() => "Distance unknown"));
        return;
      }

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
      <section className="w-full sm:w-96 p-4 shadow-md">
        <div className="flex items-center justify-between">
          <h2 className="text-black mb-2 ml-3 text-2xl font-semibold">
            Nearby
          </h2>
          <IoMdMenu className="text-3xl text-blue-800" />
        </div>
        <ul className="list-none">
          {filteredBenches.map((bench, index) => (
            <IndividualList
              key={bench.originalIndex}
              text={`Bench ${distanceTexts[index] ?? "Calculating..."}`}
              isSelected={selectedBenchIndex === bench.originalIndex}
              onClick={() => setSelectedBenchIndex(bench.originalIndex)}
              imageUrl={bench.image} // pass image URL as string
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
  imageUrl?: string;
};

function IndividualList({
  text,
  isSelected,
  onClick,
  imageUrl,
}: IndividualListProps) {
  return (
    <li className="border-b border-gray-100">
      <button
        onClick={onClick}
        className={`w-full flex items-center space-x-4 text-left p-4 hover:bg-zinc-200 hover:rounded-lg ${
          isSelected ? "bg-zinc-400 rounded-lg" : ""
        }`}
      >
        {imageUrl && (
          <div className="flex-shrink-0 w-12 h-12 overflow-hidden rounded-md">
            <img src={imageUrl} alt="" className="object-cover w-full h-full" />
          </div>
        )}
        <div>{text}</div>
      </button>
    </li>
  );
}
