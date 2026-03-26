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

  const isWarning = percent > 70;
  const isDanger = percent > 90;

  return (
    <div className="glass-card rounded-2xl p-6 shadow-xl animate-pulse-glow">
      <div className="flex justify-between items-center mb-1">
        <h2 className="text-sm font-semibold text-gray-600 uppercase tracking-wider">연간 예산 현황</h2>
        <span className={`text-xs font-bold px-2.5 py-1 rounded-full ${
          isDanger
            ? "bg-red-100 text-red-700"
            : isWarning
            ? "bg-amber-100 text-amber-700"
            : "bg-indigo-100 text-indigo-700"
        }`}>
          {percent.toFixed(1)}% 집행
        </span>
      </div>

      <div className="flex items-baseline gap-3 mb-1">
        <div>
          <span className="text-xs text-gray-400 block">잔여 예산</span>
          <span className={`text-3xl font-extrabold ${
            isDanger ? "text-red-600" : isWarning ? "text-amber-600" : "text-gray-900"
          }`}>
            {remaining.toLocaleString()}
            <span className="text-base font-medium text-gray-400 ml-1">원</span>
          </span>
        </div>
      </div>

      <div className="text-sm text-gray-500 mb-4">
        {totalSpent.toLocaleString()} / {budget.toLocaleString()}원 사용
      </div>

      <div className="relative w-full h-4 bg-gray-100 rounded-full overflow-hidden">
        <div
          className={`h-full rounded-full transition-all duration-1000 ease-out ${
            isDanger
              ? "bg-gradient-to-r from-red-400 to-red-600"
              : isWarning
              ? "bg-gradient-to-r from-amber-400 to-orange-500"
              : "bg-gradient-to-r from-indigo-400 to-purple-500"
          }`}
          style={{ width: `${percent}%` }}
        />
        <div className="absolute inset-0 shimmer-bar rounded-full" />
      </div>

      <div className="flex justify-between mt-3 text-xs text-gray-400 font-medium">
        <span>사용 {expenses.length}건</span>
        <span>{new Date().getFullYear()}년</span>
      </div>
    </div>
  );
}
