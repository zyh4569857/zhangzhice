import React from 'react';

interface ProgressBarProps {
  current: number;
  total: number;
  category: string;
}

export function ProgressBar({ current, total, category }: ProgressBarProps) {
  const percentage = (current / total) * 100;
  
  const getColor = (percentage: number) => {
    if (percentage >= 90) return 'bg-red-500';
    if (percentage >= 80) return 'bg-yellow-500';
    return 'bg-green-500';
  };

  return (
    <div className="w-full">
      <div className="flex justify-between mb-1">
        <span className="text-sm font-medium text-gray-700">{category}</span>
        <span className="text-sm font-medium text-gray-700">
          {percentage.toFixed(1)}%
        </span>
      </div>
      <div className="w-full bg-gray-200 rounded-full h-2.5">
        <div
          className={`h-2.5 rounded-full ${getColor(percentage)}`}
          style={{ width: `${percentage}%` }}
        ></div>
      </div>
      <div className="flex justify-between mt-1">
        <span className="text-xs text-gray-500">已用: ¥{current}</span>
        <span className="text-xs text-gray-500">总额: ¥{total}</span>
      </div>
    </div>
  );
} 