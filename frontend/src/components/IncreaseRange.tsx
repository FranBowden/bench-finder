import { useState, useEffect } from "react";

interface IncreaseRangeProps {
  amount: number;
  onAmountChange: (newAmount: number) => void;
}

export const IncreaseRange = ({
  amount,
  onAmountChange,
}: IncreaseRangeProps) => {
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onAmountChange(Number(e.target.value));
    console.log(amount);
  };

  const [milesRadius, setMilesRadius] = useState<number>(amount / 1609);
  useEffect(() => {
    setMilesRadius(amount / 1609);
  }, [amount]);
  return (
    <div className="w-full sm:w-80 p-6.5 pt-3 pb-0  ">
      <p className=" text-lg font-medium text-gray-700">
        Search Radius: {milesRadius.toFixed(1)} mi
      </p>
      <p className="text-xs text-gray-500 mt-1 mb-2">
        Finds benches within a circular area. Actual walking distances may be
        longer
      </p>
      <input
        className="w-64 h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer "
        type="range"
        min="500"
        max="5000"
        value={amount}
        onChange={handleChange}
      />
    </div>
  );
};
