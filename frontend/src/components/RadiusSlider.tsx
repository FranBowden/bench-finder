import { useState, useEffect, useMemo } from "react";
import { debounce } from "lodash";
import { FaMapMarkerAlt } from "react-icons/fa";
import { metresToUnit, type DistanceUnit } from "../utils/format";

interface RadiusSliderProps {
  amount: number;
  onAmountChange: (newAmount: number) => void;
  unit?: DistanceUnit;
}

interface RangeTrackStyle extends React.CSSProperties {
  "--range-progress"?: string;
}

export const MIN_METRES = 150;
export const MAX_METRES = 800;

export const RadiusSlider = ({ amount, onAmountChange, unit = "mi" }: RadiusSliderProps) => {
  const [localAmount, setLocalAmount] = useState<number>(amount);

  useEffect(() => {
    setLocalAmount(amount);
  }, [amount]);

  // Debounce the parent callback, not the local state update
  const debouncedChange = useMemo(
    () => debounce((value: number) => onAmountChange(value), 300),
    [onAmountChange]
  );

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = Number(e.target.value);
    setLocalAmount(value); // Update local state immediately (no lag!)
    debouncedChange(value); // Debounce the API call
  };

  const displayRadius = metresToUnit(localAmount, unit);
  const progress = ((localAmount - MIN_METRES) / (MAX_METRES - MIN_METRES)) * 100;

  return (
    <div className="px-5 sm:px-6 pt-5 pb-4 border-b border-[var(--color-border)]">
      <div className="flex items-center justify-between mb-1">
        <div className="flex items-center gap-1.5">
          <FaMapMarkerAlt className="text-[var(--color-primary)]" size={12} />
          <p className="text-sm font-semibold text-[var(--color-text)]">Search radius</p>
        </div>
        <p className="text-sm font-bold text-[var(--color-primary)]">
          {displayRadius.toFixed(1)} {unit}
        </p>
      </div>
      <p className="text-xs text-[var(--color-text-muted)] mb-3">
        Finds benches within a circular area. Actual walking distances may be longer.
      </p>
      <input
        className="range-themed w-full cursor-pointer"
        style={{ "--range-progress": `${progress}%` } as RangeTrackStyle}
        type="range"
        min={MIN_METRES}
        max={MAX_METRES}
        value={localAmount}
        onChange={handleChange}
        aria-label="Search radius"
      />
      <div className="flex justify-between text-[10px] text-[var(--color-text-muted)] mt-1.5 font-medium">
        <span>{metresToUnit(MIN_METRES, unit).toFixed(1)} {unit}</span>
        <span>{metresToUnit(MAX_METRES, unit).toFixed(1)} {unit}</span>
      </div>
    </div>
  );
};
