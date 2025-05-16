import React, { createContext, useContext, useReducer, ReactNode } from 'react';
import { Budget, Expense, UserSettings, Category } from '../types/types';

interface AppState {
  settings: UserSettings;
  expenses: Expense[];
  currentMonth: string;
}

type Action =
  | { type: 'SET_SETTINGS'; payload: UserSettings }
  | { type: 'ADD_EXPENSE'; payload: Expense }
  | { type: 'UPDATE_BUDGET'; payload: Budget }
  | { type: 'SET_CURRENT_MONTH'; payload: string };

const initialState: AppState = {
  settings: {
    monthlyIncome: 0,
    budgets: [
      { category: 'food', percentage: 30, amount: 0, remaining: 0 },
      { category: 'clothing', percentage: 10, amount: 0, remaining: 0 },
      { category: 'housing', percentage: 30, amount: 0, remaining: 0 },
      { category: 'transportation', percentage: 10, amount: 0, remaining: 0 },
      { category: 'education', percentage: 10, amount: 0, remaining: 0 },
      { category: 'entertainment', percentage: 5, amount: 0, remaining: 0 },
      { category: 'savings', percentage: 5, amount: 0, remaining: 0 },
    ],
  },
  expenses: [],
  currentMonth: new Date().toISOString().slice(0, 7),
};

const AppContext = createContext<{
  state: AppState;
  dispatch: React.Dispatch<Action>;
} | null>(null);

function appReducer(state: AppState, action: Action): AppState {
  switch (action.type) {
    case 'SET_SETTINGS':
      return {
        ...state,
        settings: action.payload,
      };
    case 'ADD_EXPENSE':
      return {
        ...state,
        expenses: [...state.expenses, action.payload],
        settings: {
          ...state.settings,
          budgets: state.settings.budgets.map(budget =>
            budget.category === action.payload.category
              ? { ...budget, remaining: budget.remaining - action.payload.amount }
              : budget
          ),
        },
      };
    case 'UPDATE_BUDGET':
      return {
        ...state,
        settings: {
          ...state.settings,
          budgets: state.settings.budgets.map(budget =>
            budget.category === action.payload.category ? action.payload : budget
          ),
        },
      };
    case 'SET_CURRENT_MONTH':
      return {
        ...state,
        currentMonth: action.payload,
      };
    default:
      return state;
  }
}

export function AppProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(appReducer, initialState);

  return (
    <AppContext.Provider value={{ state, dispatch }}>
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
} 