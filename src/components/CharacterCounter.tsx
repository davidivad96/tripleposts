import { useMemo } from "react";

type CharacterCounterProps = {
  count: number;
  limit: number;
};

const CharacterCounter: React.FC<CharacterCounterProps> = ({
  count,
  limit,
}) => {
  const percentage = useMemo(() => (count / limit) * 100, [count, limit]);
  const remainingChars = limit - count;
  const showRemaining = remainingChars <= 20;
  const isOverLimit = count > limit;

  // Calculate circle properties
  const radius = 16;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (percentage / 100) * circumference;

  // Determine color based on count
  const getColor = () => {
    if (isOverLimit) return "text-red-500 dark:text-red-400";
    if (remainingChars <= 20) return "text-yellow-500 dark:text-yellow-400";
    return "text-blue-500 dark:text-blue-400";
  };

  return (
    <div className="relative w-[36px] h-[36px]">
      <svg className="transform -rotate-90 w-[36px] h-[36px]">
        <circle
          cx="18"
          cy="18"
          r={radius}
          stroke="currentColor"
          strokeWidth="2"
          fill="none"
          className="text-gray-200 dark:text-gray-700"
        />
        <circle
          cx="18"
          cy="18"
          r={radius}
          stroke="currentColor"
          strokeWidth="2"
          fill="none"
          className={getColor()}
          strokeDasharray={circumference}
          strokeDashoffset={isOverLimit ? 0 : strokeDashoffset}
          strokeLinecap="round"
        />
      </svg>
      {showRemaining && (
        <span
          className={`absolute inset-0 flex items-center justify-center text-sm font-medium ${getColor()}`}
        >
          {remainingChars}
        </span>
      )}
    </div>
  );
};

export default CharacterCounter;
