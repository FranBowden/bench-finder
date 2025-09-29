import { useState, useEffect, useMemo } from "react";
import { debounce } from "lodash";

interface IncreaseRangeProps {
  amount: number;
  onAmountChange: (newAmount: number) => void;
}

export const IncreaseRange = ({
  amount,
  onAmountChange,
}: IncreaseRangeProps) => {
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

  const milesRadius = localAmount / 1609.34;

  return (
    <div className="w-full sm:w-80 p-6.5 pt-3 pb-0">
      <p className="text-lg font-medium text-gray-700">
        Search Radius: {milesRadius.toFixed(1)} mi
      </p>
      <p className="text-xs text-gray-500 mt-1 mb-2">
        Finds benches within a circular area. Actual walking distances may be
        longer
      </p>
      <input
        className="w-64 h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
        type="range"
        min="300"
        max="2000"
        value={localAmount}
        onChange={handleChange}
      />
    </div>
  );
};
