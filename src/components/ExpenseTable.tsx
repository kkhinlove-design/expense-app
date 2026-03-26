"use client";

import { Expense } from "@/lib/types";
import { generateHwpx } from "@/lib/hwpx";

interface Props {
  expenses: Expense[];
  onEdit: (expense: Expense) => void;
  onDelete: (id: string) => void;
}

export default function ExpenseTable({ expenses, onEdit, onDelete }: Props) {
  if (expenses.length === 0) {
    return (
      <div className="text-center py-16">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gray-100 mb-4">
          <span className="text-3xl">📋</span>
        </div>
        <p className="text-gray-400 font-medium">등록된 내역이 없습니다</p>
        <p className="text-xs text-gray-300 mt-1">위의 &quot;내역 추가&quot; 버튼으로 시작하세요</p>
      </div>
    );
  }

  const handleDownload = async (expense: Expense) => {
    try {
      await generateHwpx(expense);
    } catch (err) {
      alert("HWPX 생성 실패: " + (err as Error).message);
    }
  };

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b-2 border-indigo-100">
            <th className="text-left py-3 px-3 font-semibold text-indigo-400 text-xs uppercase tracking-wider">일자</th>
            <th className="text-left py-3 px-3 font-semibold text-indigo-400 text-xs uppercase tracking-wider">장소</th>
            <th className="text-left py-3 px-3 font-semibold text-indigo-400 text-xs uppercase tracking-wider hidden sm:table-cell">
              집행목적
            </th>
            <th className="text-left py-3 px-3 font-semibold text-indigo-400 text-xs uppercase tracking-wider hidden md:table-cell">
              집행대상
            </th>
            <th className="text-right py-3 px-3 font-semibold text-indigo-400 text-xs uppercase tracking-wider">금액</th>
            <th className="text-center py-3 px-3 font-semibold text-indigo-400 text-xs uppercase tracking-wider w-32">
              관리
            </th>
          </tr>
        </thead>
        <tbody>
          {expenses.map((expense, idx) => (
            <tr
              key={expense.id}
              className="border-b border-gray-100/50 hover:bg-indigo-50/50 transition-all duration-200 animate-slide-in"
              style={{ animationDelay: `${idx * 0.05}s` }}
            >
              <td className="py-3.5 px-3 text-gray-600 whitespace-nowrap font-medium">
                {expense.date}
              </td>
              <td className="py-3.5 px-3 text-gray-900 font-semibold whitespace-nowrap">
                {expense.place}
              </td>
              <td className="py-3.5 px-3 text-gray-600 hidden sm:table-cell whitespace-nowrap">
                {expense.purpose}
              </td>
              <td className="py-3.5 px-3 text-gray-600 hidden md:table-cell whitespace-nowrap">
                {expense.target}
              </td>
              <td className="py-3.5 px-3 text-right text-gray-900 font-bold whitespace-nowrap">
                {expense.amount.toLocaleString()}
                <span className="text-gray-400 font-normal">원</span>
              </td>
              <td className="py-3.5 px-3">
                <div className="flex justify-center gap-1">
                  <button
                    onClick={() => handleDownload(expense)}
                    className="p-2 text-indigo-500 hover:bg-indigo-100 rounded-lg transition-all duration-200 hover:scale-110"
                    title="HWPX 다운로드"
                  >
                    <svg
                      className="w-4 h-4"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"
                      />
                    </svg>
                  </button>
                  <button
                    onClick={() => onEdit(expense)}
                    className="p-2 text-gray-400 hover:text-amber-500 hover:bg-amber-50 rounded-lg transition-all duration-200 hover:scale-110"
                    title="수정"
                  >
                    <svg
                      className="w-4 h-4"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                      />
                    </svg>
                  </button>
                  <button
                    onClick={() => {
                      if (confirm("삭제하시겠습니까?")) onDelete(expense.id);
                    }}
                    className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all duration-200 hover:scale-110"
                    title="삭제"
                  >
                    <svg
                      className="w-4 h-4"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                      />
                    </svg>
                  </button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
        <tfoot>
          <tr className="border-t-2 border-indigo-100">
            <td
              colSpan={4}
              className="py-4 px-3 text-right font-semibold text-gray-600"
            >
              소계
            </td>
            <td className="py-4 px-3 text-right font-extrabold text-sm bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent whitespace-nowrap">
              {expenses.reduce((s, e) => s + e.amount, 0).toLocaleString()}원
            </td>
            <td />
          </tr>
        </tfoot>
      </table>
    </div>
  );
}
