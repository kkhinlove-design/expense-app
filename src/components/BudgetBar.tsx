"use client";

import { Expense, ANNUAL_BUDGET } from "@/lib/types";

interface Props {
  expenses: Expense[];
  budget?: number;
}

export default function BudgetBar({ expenses, budget = ANNUAL_BUDGET }: Props) {
  const totalSpent = expenses.reduce((sum, e) => sum + e.amount, 0);
  const remaining = budget - totalSpent;
  const percent = Math.min((totalSpent / budget) * 100, 100);

  const barColor =
    percent > 90 ? "bg-red-500" : percent > 70 ? "bg-yellow-500" : "bg-blue-500";

  return (
    <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100">
      <div className="flex justify-between items-baseline mb-3">
        <h2 className="text-sm font-medium text-gray-500">연간 예산 현황</h2>
        <span className="text-xs text-gray-400">
          {new Date().getFullYear()}년
        </span>
      </div>
      <div className="flex justify-between items-baseline mb-2">
        <span className="text-2xl font-bold text-gray-900">
          {remaining.toLocaleString()}원
        </span>
        <span className="text-sm text-gray-500">
          {totalSpent.toLocaleString()} / {budget.toLocaleString()}원
        </span>
      </div>
      <div className="w-full bg-gray-100 rounded-full h-3">
        <div
          className={`h-3 rounded-full transition-all duration-500 ${barColor}`}
          style={{ width: `${percent}%` }}
        />
      </div>
      <div className="flex justify-between mt-2 text-xs text-gray-400">
        <span>사용 {expenses.length}건</span>
        <span>{percent.toFixed(1)}% 집행</span>
      </div>
    </div>
  );
}
