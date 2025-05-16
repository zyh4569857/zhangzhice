import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
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

export function BudgetSettings() {
  const { state, dispatch } = useApp();
  const [monthlyIncome, setMonthlyIncome] = useState(state.settings.monthlyIncome);

  const handleIncomeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newIncome = Number(e.target.value);
    setMonthlyIncome(newIncome);
    
    const updatedBudgets = state.settings.budgets.map(budget => ({
      ...budget,
      amount: (newIncome * budget.percentage) / 100,
      remaining: (newIncome * budget.percentage) / 100,
    }));

    dispatch({
      type: 'SET_SETTINGS',
      payload: {
        monthlyIncome: newIncome,
        budgets: updatedBudgets,
      },
    });
  };

  const handlePercentageChange = (category: Category, percentage: number) => {
    const updatedBudgets = state.settings.budgets.map(budget =>
      budget.category === category
        ? {
            ...budget,
            percentage,
            amount: (monthlyIncome * percentage) / 100,
            remaining: (monthlyIncome * percentage) / 100,
          }
        : budget
    );

    dispatch({
      type: 'SET_SETTINGS',
      payload: {
        monthlyIncome,
        budgets: updatedBudgets,
      },
    });
  };

  return (
    <div className="p-6 bg-white rounded-lg shadow-md">
      <h2 className="text-2xl font-bold mb-6">预算设置</h2>
      
      <div className="mb-6">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          月收入
        </label>
        <input
          type="number"
          value={monthlyIncome}
          onChange={handleIncomeChange}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          placeholder="请输入月收入"
        />
      </div>

      <div className="space-y-4">
        {state.settings.budgets.map(budget => (
          <div key={budget.category} className="flex items-center space-x-4">
            <label className="w-24 text-sm font-medium text-gray-700">
              {categoryLabels[budget.category]}
            </label>
            <input
              type="range"
              min="0"
              max="100"
              value={budget.percentage}
              onChange={(e) => handlePercentageChange(budget.category, Number(e.target.value))}
              className="flex-1"
            />
            <span className="w-16 text-sm text-gray-600">
              {budget.percentage}%
            </span>
            <span className="w-24 text-sm text-gray-600">
              ¥{budget.amount.toFixed(2)}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
} 