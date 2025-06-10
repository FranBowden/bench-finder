import { calculateDistanceMiles } from "./calculateDistance";
import type { Bench } from "./fetchBenches";

type Props = {
  benches: Bench[];
  userLocation: { lat: number; lng: number } | null;
  selectedBenchIndex: number | null;
  onSelectBench: (index: number) => void;
};

export function ListSection({ benches, userLocation, selectedBenchIndex, onSelectBench }: Props) {
     return (
    <section
      className="
        fixed top-12 left-4
        w-84 h-120
        p-4 bg-white shadow-md z-50 
        rounde
      "
    >
      <h2 className="text-black mb-2 font-semibold">Nearby Benches:</h2>
    <ul className="list-none text-blue-500 border border-gray-300">
  {benches.map((bench, idx) => {
    const distanceText = userLocation
      ? `${calculateDistanceMiles(
          userLocation.lat,
          userLocation.lng,
          bench.lat,
          bench.lng
        ).toFixed(1)} miles away`
      : "Distance unknown";

    return (
      <IndividualList
              key={idx}
              text={`Bench ${distanceText}`}
              isSelected={selectedBenchIndex === idx}
              onClick={() => onSelectBench(idx)}
            />
    );
  })}
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
    <li className={`border-b border-gray-300 last:border-none`}>
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
