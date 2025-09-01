import type { BenchWithDirection } from "../../../../../shared/types/BenchWithDirection";

type ListSectionProps = {
  benchesWithDirection: BenchWithDirection[];
  selectedBenchIndex: number | null;
  setSelectedBenchIndex: (sortedIndex: number) => void; // sorted index
};

export function ListSection({
  benchesWithDirection,
  selectedBenchIndex,
  setSelectedBenchIndex,
}: ListSectionProps) {
  return (
    <section className="w-full sm:w-80 p-4 shadow-md">
      <h2 className="text-zinc-400 mb-2 text-2xl font-semibold">Nearby</h2>
      <ul className="list-none">
        {benchesWithDirection.map((bench, sortedIndex) => (
          <li key={bench.originalIndex} className="border-b border-gray-100">
            <button
              onClick={() => setSelectedBenchIndex(sortedIndex)}
              className={`w-full flex items-center space-x-4 p-4 hover:bg-zinc-200 hover:rounded-lg ${
                selectedBenchIndex === sortedIndex
                  ? "bg-zinc-400 rounded-lg"
                  : ""
              }`}
            >
              <div className="text-zinc-700 font-medium">
                Original Index: {bench.originalIndex}
              </div>
              <div className="ml-auto text-lime-500 font-bold">
                {bench.distanceText}, {bench.durationText}
              </div>
            </button>
          </li>
        ))}
      </ul>
    </section>
  );
}
