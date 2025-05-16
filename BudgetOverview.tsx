import React from 'react';
import { useApp } from '../context/AppContext';
import { ProgressBar } from './ProgressBar';
import { Category } from '../types/types';

const categoryLabels: Record<Category, string> = {
  food: '饮食',
  clothing: '服装',
  housing: '住房',
  transportation: '交通',
  education: '教育',
  entertainment: '娱乐',
  savings: '储蓄',
};

export function BudgetOverview() {
  const { state } = useApp();
  const { budgets } = state.settings;

  const totalBudget = budgets.reduce((sum, budget) => sum + budget.amount, 0);
  const totalSpent = budgets.reduce((sum, budget) => sum + (budget.amount - budget.remaining), 0);
  const totalRemaining = totalBudget - totalSpent;

  return (
    <div className="p-6 bg-white rounded-lg shadow-md">
      <h2 className="text-2xl font-bold mb-6">预算概览</h2>

      <div className="grid grid-cols-3 gap-4 mb-6">
        <div className="p-4 bg-blue-50 rounded-lg">
          <h3 className="text-sm font-medium text-gray-500">总预算</h3>
          <p className="text-2xl font-bold text-blue-600">¥{totalBudget.toFixed(2)}</p>
        </div>
        <div className="p-4 bg-green-50 rounded-lg">
          <h3 className="text-sm font-medium text-gray-500">已支出</h3>
          <p className="text-2xl font-bold text-green-600">¥{totalSpent.toFixed(2)}</p>
        </div>
        <div className="p-4 bg-purple-50 rounded-lg">
          <h3 className="text-sm font-medium text-gray-500">剩余预算</h3>
          <p className="text-2xl font-bold text-purple-600">¥{totalRemaining.toFixed(2)}</p>
        </div>
      </div>

      <div className="space-y-4">
        {budgets.map(budget => {
          const spent = budget.amount - budget.remaining;
          return (
            <div key={budget.category} className="space-y-2">
              <ProgressBar
                current={spent}
                total={budget.amount}
                category={categoryLabels[budget.category]}
              />
            </div>
          );
        })}
      </div>
    </div>
  );
} 