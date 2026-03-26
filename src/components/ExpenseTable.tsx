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
      <div className="text-center py-12 text-gray-400">
        등록된 내역이 없습니다
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
          <tr className="border-b border-gray-200">
            <th className="text-left py-3 px-3 font-medium text-gray-500">일자</th>
            <th className="text-left py-3 px-3 font-medium text-gray-500">장소</th>
            <th className="text-left py-3 px-3 font-medium text-gray-500 hidden sm:table-cell">
              집행목적
            </th>
            <th className="text-left py-3 px-3 font-medium text-gray-500 hidden md:table-cell">
              집행대상
            </th>
            <th className="text-right py-3 px-3 font-medium text-gray-500">금액</th>
            <th className="text-center py-3 px-3 font-medium text-gray-500 w-32">
              관리
            </th>
          </tr>
        </thead>
        <tbody>
          {expenses.map((expense) => (
            <tr
              key={expense.id}
              className="border-b border-gray-100 hover:bg-gray-50 transition-colors"
            >
              <td className="py-3 px-3 text-gray-700 whitespace-nowrap">
                {expense.date}
              </td>
              <td className="py-3 px-3 text-gray-900 font-medium whitespace-nowrap">
                {expense.place}
              </td>
              <td className="py-3 px-3 text-gray-600 hidden sm:table-cell whitespace-nowrap">
                {expense.purpose}
              </td>
              <td className="py-3 px-3 text-gray-600 hidden md:table-cell whitespace-nowrap">
                {expense.target}
              </td>
              <td className="py-3 px-3 text-right text-gray-900 whitespace-nowrap">
                {expense.amount.toLocaleString()}원
              </td>
              <td className="py-3 px-3">
                <div className="flex justify-center gap-1">
                  <button
                    onClick={() => handleDownload(expense)}
                    className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-md transition-colors"
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
                    className="p-1.5 text-gray-500 hover:bg-gray-100 rounded-md transition-colors"
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
                    className="p-1.5 text-red-500 hover:bg-red-50 rounded-md transition-colors"
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
          <tr className="border-t-2 border-gray-200">
            <td
              colSpan={4}
              className="py-3 px-3 text-right font-medium text-gray-700"
            >
              소계
            </td>
            <td className="py-3 px-3 text-right font-bold text-gray-900">
              {expenses.reduce((s, e) => s + e.amount, 0).toLocaleString()}원
            </td>
            <td />
          </tr>
        </tfoot>
      </table>
    </div>
  );
}
