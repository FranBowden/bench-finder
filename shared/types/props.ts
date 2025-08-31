import { type Bench } from "./bench";

export type Props = {
  allBenches: Bench[];
  userLocation: { lat: number; lng: number } | null;
  selectedBenchIndex: number | null;
  setSelectedBenchIndex: (index: number) => void;
};
