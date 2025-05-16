import React from 'react';
import { BudgetSettings } from '../components/BudgetSettings';
import { BudgetOverview } from '../components/BudgetOverview';
import { ExpenseForm } from '../components/ExpenseForm';
import { Statistics } from '../components/Statistics';

export function Home() {
  return (
    <div className="min-h-screen bg-gray-100">
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
          <h1 className="text-3xl font-bold text-gray-900">个人记账系统</h1>
        </div>
      </header>

      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="space-y-6">
            <BudgetSettings />
            <ExpenseForm />
          </div>
          <div className="space-y-6">
            <BudgetOverview />
            <Statistics />
          </div>
        </div>
      </main>
    </div>
  );
} 