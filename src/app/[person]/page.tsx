"use client";

import { useState, useEffect, useMemo } from "react";
import { useParams, useRouter } from "next/navigation";
import { Expense, MONTHS } from "@/lib/types";
import {
  loadExpenses,
  addExpense,
  updateExpense,
  deleteExpense,
} from "@/lib/storage";
import { generateMultipleHwpx } from "@/lib/hwpx";
import { downloadTemplate, parseExcel } from "@/lib/excel";
import { getPerson } from "@/lib/people";
import { saveExpenses } from "@/lib/storage";
import BudgetBar from "@/components/BudgetBar";
import ExpenseForm from "@/components/ExpenseForm";
import ExpenseTable from "@/components/ExpenseTable";

export default function PersonPage() {
  const params = useParams();
  const router = useRouter();
  const person = getPerson(params.person as string);

  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<Expense | null>(null);
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth());
  const currentYear = new Date().getFullYear();

  useEffect(() => {
    if (!person) {
      router.replace("/");
      return;
    }
    setExpenses(loadExpenses(person.storageKey));
  }, [person, router]);

  if (!person) return null;

  const filteredExpenses = expenses
    .filter((e) => {
      const [y, m] = e.date.split("-");
      return parseInt(y) === currentYear && parseInt(m) === selectedMonth + 1;
    })
    .sort((a, b) => a.date.localeCompare(b.date));

  const yearExpenses = expenses.filter((e) =>
    e.date.startsWith(String(currentYear))
  );

  const handleAdd = (expense: Expense) => {
    setExpenses(addExpense(expense, person.storageKey));
    setShowForm(false);
  };

  const handleUpdate = (expense: Expense) => {
    setExpenses(updateExpense(expense.id, expense, person.storageKey));
    setEditing(null);
  };

  const handleDelete = (id: string) => {
    setExpenses(deleteExpense(id, person.storageKey));
  };

  const handleBulkDownload = async () => {
    if (filteredExpenses.length === 0) return;
    try {
      await generateMultipleHwpx(filteredExpenses);
    } catch (err) {
      alert("일괄 다운로드 실패: " + (err as Error).message);
    }
  };

  const handleExcelUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const parsed = await parseExcel(file);
      if (parsed.length === 0) {
        alert("가져올 데이터가 없습니다");
        return;
      }
      const merged = [...expenses, ...parsed];
      saveExpenses(merged, person.storageKey);
      setExpenses(merged);
      alert(`${parsed.length}건이 추가되었습니다`);
    } catch (err) {
      alert((err as Error).message);
    }
    e.target.value = "";
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      {/* 헤더 */}
      <div className="mb-8">
        <button
          onClick={() => router.push("/")}
          className="text-sm text-gray-500 hover:text-gray-700 mb-3 flex items-center gap-1"
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
              d="M15 19l-7-7 7-7"
            />
          </svg>
          목록으로
        </button>
        <h1 className="text-2xl font-bold text-gray-900">
          {person.name}{person.title ? ` ${person.title}` : ""} 업무추진비
        </h1>
        <p className="text-sm text-gray-500 mt-1">
          카드 사용내역 관리 및 서식 자동 생성
        </p>
      </div>

      {/* 예산 현황 */}
      <div className="mb-6">
        <BudgetBar expenses={yearExpenses} budget={person.budget} />
      </div>

      {/* 월 선택 */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex gap-1 overflow-x-auto pb-1">
          {MONTHS.map((label, i) => {
            const count = expenses.filter((e) => {
              const [y, m] = e.date.split("-");
              return parseInt(y) === currentYear && parseInt(m) === i + 1;
            }).length;
            return (
              <button
                key={i}
                onClick={() => setSelectedMonth(i)}
                className={`px-3 py-1.5 text-sm rounded-lg whitespace-nowrap transition-colors ${
                  selectedMonth === i
                    ? "bg-blue-600 text-white"
                    : "bg-white text-gray-600 hover:bg-gray-100 border border-gray-200"
                }`}
              >
                {label}
                {count > 0 && (
                  <span
                    className={`ml-1 text-xs ${
                      selectedMonth === i ? "text-blue-200" : "text-gray-400"
                    }`}
                  >
                    {count}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      <div className="flex flex-wrap gap-2 mb-4">
        <button
          onClick={() => {
            setShowForm(!showForm);
            setEditing(null);
          }}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 text-sm font-medium transition-colors"
        >
          + 내역 추가
        </button>
        {filteredExpenses.length > 0 && (
          <button
            onClick={handleBulkDownload}
            className="border border-blue-600 text-blue-600 px-4 py-2 rounded-lg hover:bg-blue-50 text-sm font-medium transition-colors"
          >
            한글 다운로드 ({filteredExpenses.length}건)
          </button>
        )}
        <button
          onClick={() => {
            const label = person.name + (person.title ? `_${person.title}` : "");
            downloadTemplate(`${label}_양식.xlsx`);
          }}
          className="border border-green-600 text-green-600 px-4 py-2 rounded-lg hover:bg-green-50 text-sm font-medium transition-colors"
        >
          엑셀 양식 다운로드
        </button>
        <label className="border border-orange-500 text-orange-500 px-4 py-2 rounded-lg hover:bg-orange-50 text-sm font-medium transition-colors cursor-pointer">
          엑셀 업로드
          <input
            type="file"
            accept=".xlsx,.xls"
            onChange={handleExcelUpload}
            className="hidden"
          />
        </label>
      </div>

      {/* 입력 폼 */}
      {(showForm || editing) && (
        <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100 mb-6">
          <h2 className="text-lg font-semibold mb-4">
            {editing ? "내역 수정" : "새 내역 등록"}
          </h2>
          <ExpenseForm
            initial={editing}
            onSubmit={editing ? handleUpdate : handleAdd}
            onCancel={() => {
              setShowForm(false);
              setEditing(null);
            }}
          />
        </div>
      )}

      {/* 테이블 */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
        <ExpenseTable
          expenses={filteredExpenses}
          onEdit={(e) => {
            setEditing(e);
            setShowForm(false);
          }}
          onDelete={handleDelete}
        />
      </div>
    </div>
  );
}
