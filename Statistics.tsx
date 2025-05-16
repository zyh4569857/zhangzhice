import React from 'react';
import { Chart as ChartJS, ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement } from 'chart.js';
import { Pie, Bar } from 'react-chartjs-2';
import { useApp } from '../context/AppContext';
import { Category } from '../types/types';

ChartJS.register(ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement);

const categoryLabels: Record<Category, string> = {
  food: '饮食',
  clothing: '服装',
  housing: '住房',
  transportation: '交通',
  education: '教育',
  entertainment: '娱乐',
  savings: '储蓄',
};

const colors = [
  '#FF6384',
  '#36A2EB',
  '#FFCE56',
  '#4BC0C0',
  '#9966FF',
  '#FF9F40',
  '#8AC249',
];

export function Statistics() {
  const { state } = useApp();
  const { budgets } = state.settings;

  // 计算每个类别的总支出
  const categoryExpenses = budgets.map(budget => {
    const spent = budget.amount - budget.remaining;
    return {
      category: budget.category,
      amount: spent,
    };
  });

  // 准备饼图数据
  const pieData = {
    labels: categoryExpenses.map(item => categoryLabels[item.category]),
    datasets: [
      {
        data: categoryExpenses.map(item => item.amount),
        backgroundColor: colors,
        borderColor: colors.map(color => color + '80'),
        borderWidth: 1,
      },
    ],
  };

  // 准备柱状图数据
  const barData = {
    labels: categoryExpenses.map(item => categoryLabels[item.category]),
    datasets: [
      {
        label: '预算',
        data: budgets.map(budget => budget.amount),
        backgroundColor: colors.map(color => color + '40'),
        borderColor: colors,
        borderWidth: 1,
      },
      {
        label: '实际支出',
        data: categoryExpenses.map(item => item.amount),
        backgroundColor: colors,
        borderColor: colors,
        borderWidth: 1,
      },
    ],
  };

  const barOptions = {
    responsive: true,
    scales: {
      y: {
        beginAtZero: true,
      },
    },
  };

  return (
    <div className="p-6 bg-white rounded-lg shadow-md">
      <h2 className="text-2xl font-bold mb-6">统计分析</h2>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <h3 className="text-lg font-semibold mb-4">支出分布</h3>
          <div className="h-64">
            <Pie data={pieData} />
          </div>
        </div>

        <div>
          <h3 className="text-lg font-semibold mb-4">预算vs实际支出</h3>
          <div className="h-64">
            <Bar data={barData} options={barOptions} />
          </div>
        </div>
      </div>

      <div className="mt-6">
        <h3 className="text-lg font-semibold mb-4">支出明细</h3>
        <div className="space-y-2">
          {categoryExpenses.map((item, index) => (
            <div key={item.category} className="flex items-center justify-between p-2 bg-gray-50 rounded">
              <div className="flex items-center">
                <div
                  className="w-3 h-3 rounded-full mr-2"
                  style={{ backgroundColor: colors[index] }}
                />
                <span>{categoryLabels[item.category]}</span>
              </div>
              <span className="font-medium">¥{item.amount.toFixed(2)}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
} 