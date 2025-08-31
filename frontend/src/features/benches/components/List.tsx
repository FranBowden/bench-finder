import { useEffect, useMemo, useState } from "react";
import { IoMdMenu } from "react-icons/io";
import type { Bench } from "../../../../../shared/types/bench";
import type { Props } from "../../../../../shared/types/props";
import { fetchDirection } from "../../../api/fetchDirection";

// Define a new type that includes the fetched data
type BenchWithDirection = Bench & {
  originalIndex: number;
  distanceText: string;
  durationText: string;
  distanceMiles: number;
  durationMinutes: number;
};

export function ListSection({
  allBenches,
  userLocation,
  selectedBenchIndex,
  setSelectedBenchIndex,
}: Props) {
  const [benchesWithDirection, setBenchesWithDirection] = useState<
    BenchWithDirection[]
  >([]);

  const benchesWithIndex = useMemo(
    () => allBenches.map((bench, idx) => ({ ...bench, originalIndex: idx })),
    [allBenches]
  );

  useEffect(() => {
    if (!userLocation) return;

    async function fetchAllDirections() {
      const directions = await Promise.all(
        benchesWithIndex.map(async (bench) => {
          const direction = await fetchDirection(
            userLocation.lat,
            userLocation.lng,
            bench.lat,
            bench.lng
          );
          return direction;
        })
      );

      console.log("Results from fetchDirection calls:", directions);

      const updatedBenches = benchesWithIndex.map((bench, index) => {
        const direction = directions[index];
        const distance = direction?.distanceMiles;
        const duration = direction?.durationMinutes;

        const numDistance = distance !== undefined ? distance : NaN;
        const distanceText = !isNaN(numDistance)
          ? `${numDistance.toFixed(1)} mi away`
          : "Distance unknown";

        const numDuration = duration !== undefined ? duration : NaN;
        const durationText = !isNaN(numDuration)
          ? `${numDuration.toFixed(0)} min`
          : "Duration unknown";

        return {
          ...bench,
          distanceText,
          durationText,
          distanceMiles: numDistance,
          durationMinutes: numDuration,
        };
      });

      updatedBenches.sort((a, b) => {
        if (isNaN(a.distanceMiles)) return 1;
        if (isNaN(b.distanceMiles)) return -1;
        return a.distanceMiles - b.distanceMiles;
      });

      setBenchesWithDirection(updatedBenches);
    }

    fetchAllDirections();
  }, [benchesWithIndex, userLocation]); // Re-run effect when benches or user location changes

  return (
    <main className="flex">
      <section className="w-full sm:w-85 p-4 shadow-md">
        <div className="flex items-center justify-between">
          <h2 className="text-zinc-400  mb-2 ml-3 text-2xl font-semibold">
            Nearby
          </h2>
          <IoMdMenu className="text-3xl text-zinc-400" />
        </div>
        <ul className="list-none">
          {benchesWithDirection.map((bench) => (
            <IndividualList
              key={bench.originalIndex}
              distance={bench.distanceText}
              duration={bench.durationText}
              isSelected={selectedBenchIndex === bench.originalIndex}
              onClick={() => setSelectedBenchIndex(bench.originalIndex)}
              imageUrl={bench.imageUrl}
            />
          ))}
        </ul>
      </section>
    </main>
  );
}

type IndividualListProps = {
  distance: string;
  duration: string;
  isSelected: boolean;
  onClick: () => void;
  imageUrl?: string;
};

function IndividualList({
  distance,
  duration,
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
        <div className="text-zinc-700 font-medium">{distance}</div>
        <div className="text-lime-500 font-bold ml-auto">{duration}</div>
      </button>
    </li>
  );
}
