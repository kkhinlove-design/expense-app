"use client";

import { useState, useEffect, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import { Expense, MONTHS } from "@/lib/types";
import {
  loadExpenses,
  addExpense,
  updateExpense,
  deleteExpense,
  addExpensesBulk,
} from "@/lib/storage";
import { generateMultipleHwpx } from "@/lib/hwpx";
import { downloadTemplate, parseExcel } from "@/lib/excel";
import { getPerson } from "@/lib/people";
import BudgetBar from "@/components/BudgetBar";
import ExpenseForm from "@/components/ExpenseForm";
import ExpenseTable from "@/components/ExpenseTable";
import PinLock from "@/components/PinLock";

export default function PersonPage() {
  const params = useParams();
  const router = useRouter();
  const person = getPerson(params.person as string);

  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<Expense | null>(null);
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth());
  const [loading, setLoading] = useState(true);
  const currentYear = new Date().getFullYear();

  const fetchExpenses = useCallback(async () => {
    if (!person) return;
    try {
      const data = await loadExpenses(person.slug);
      setExpenses(data);
    } catch (err) {
      console.error("데이터 로드 실패:", err);
    } finally {
      setLoading(false);
    }
  }, [person]);

  useEffect(() => {
    if (!person) {
      router.replace("/");
      return;
    }
    fetchExpenses();
  }, [person, router, fetchExpenses]);

  if (!person) return null;

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="flex items-center gap-3 text-gray-400">
          <div className="w-5 h-5 border-2 border-indigo-400 border-t-transparent rounded-full animate-spin" />
          불러오는 중...
        </div>
      </div>
    );
  }

  const filteredExpenses = expenses
    .filter((e) => {
      const [y, m] = e.date.split("-");
      return parseInt(y) === currentYear && parseInt(m) === selectedMonth + 1;
    })
    .sort((a, b) => a.date.localeCompare(b.date));

  const yearExpenses = expenses.filter((e) =>
    e.date.startsWith(String(currentYear))
  );

  const handleAdd = async (expense: Expense) => {
    try {
      await addExpense(expense, person.slug);
      await fetchExpenses();
      setShowForm(false);
    } catch (err) {
      alert("등록 실패: " + (err as Error).message);
    }
  };

  const handleUpdate = async (expense: Expense) => {
    try {
      await updateExpense(expense.id, expense);
      await fetchExpenses();
      setEditing(null);
    } catch (err) {
      alert("수정 실패: " + (err as Error).message);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await deleteExpense(id);
      await fetchExpenses();
    } catch (err) {
      alert("삭제 실패: " + (err as Error).message);
    }
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
      await addExpensesBulk(parsed, person.slug);
      await fetchExpenses();
      alert(`${parsed.length}건이 추가되었습니다`);
    } catch (err) {
      alert((err as Error).message);
    }
    e.target.value = "";
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-8 animate-fade-in-up">
        <button
          onClick={() => router.push("/")}
          className="group text-sm text-gray-500 hover:text-indigo-600 mb-4 flex items-center gap-1.5 transition-colors"
        >
          <div className="w-7 h-7 rounded-full bg-white/80 group-hover:bg-indigo-100 shadow-sm flex items-center justify-center transition-all">
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
          </div>
          목록으로
        </button>
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 shadow-lg shadow-indigo-500/25 flex items-center justify-center">
            <span className="text-white text-lg font-bold">{person.name.charAt(0)}</span>
          </div>
          <div>
            <h1 className="text-2xl font-extrabold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
              {person.name}{person.title ? ` ${person.title}` : ""} 업무추진비
            </h1>
            <p className="text-sm text-gray-500 mt-0.5">
              카드 사용내역 관리 및 서식 자동 생성
            </p>
          </div>
        </div>
      </div>

      {/* Budget Bar */}
      <div className="mb-6 animate-fade-in-up-delay-1">
        <BudgetBar expenses={yearExpenses} budget={person.budget} />
      </div>

      {/* Month Selector */}
      <div className="flex items-center justify-between mb-5 animate-fade-in-up-delay-2">
        <div className="flex gap-1.5 overflow-x-auto pb-1">
          {MONTHS.map((label, i) => {
            const count = expenses.filter((e) => {
              const [y, m] = e.date.split("-");
              return parseInt(y) === currentYear && parseInt(m) === i + 1;
            }).length;
            return (
              <button
                key={i}
                onClick={() => setSelectedMonth(i)}
                className={`px-3 py-2 text-sm rounded-xl whitespace-nowrap transition-all duration-200 font-medium ${
                  selectedMonth === i
                    ? "bg-gradient-to-r from-indigo-500 to-purple-600 text-white shadow-md shadow-indigo-500/25 scale-105"
                    : "glass-card text-gray-600 hover:bg-white/90 hover:shadow-md"
                }`}
              >
                {label}
                {count > 0 && (
                  <span
                    className={`ml-1 text-xs ${
                      selectedMonth === i ? "text-indigo-200" : "text-gray-400"
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

      {/* Action Buttons */}
      <div className="flex flex-wrap gap-2 mb-5 animate-fade-in-up-delay-2">
        <button
          onClick={() => {
            setShowForm(!showForm);
            setEditing(null);
          }}
          className="bg-gradient-to-r from-indigo-500 to-purple-600 text-white px-5 py-2.5 rounded-xl hover:shadow-lg hover:shadow-indigo-500/25 hover:-translate-y-0.5 text-sm font-semibold transition-all duration-200"
        >
          + 내역 추가
        </button>
        {filteredExpenses.length > 0 && (
          <button
            onClick={handleBulkDownload}
            className="glass-card text-indigo-600 px-5 py-2.5 rounded-xl hover:shadow-lg hover:-translate-y-0.5 text-sm font-semibold transition-all duration-200 border-indigo-200"
          >
            한글 다운로드 ({filteredExpenses.length}건)
          </button>
        )}
        <button
          onClick={() => {
            const label = person.name + (person.title ? `_${person.title}` : "");
            downloadTemplate(`${label}_양식.xlsx`);
          }}
          className="glass-card text-emerald-600 px-5 py-2.5 rounded-xl hover:shadow-lg hover:-translate-y-0.5 text-sm font-semibold transition-all duration-200 border-emerald-200"
        >
          엑셀 양식 다운로드
        </button>
        <label className="glass-card text-orange-600 px-5 py-2.5 rounded-xl hover:shadow-lg hover:-translate-y-0.5 text-sm font-semibold transition-all duration-200 cursor-pointer border-orange-200">
          엑셀 업로드
          <input
            type="file"
            accept=".xlsx,.xls"
            onChange={handleExcelUpload}
            className="hidden"
          />
        </label>
      </div>

      {/* Form */}
      {(showForm || editing) && (
        <div className="glass-card rounded-2xl p-6 shadow-xl mb-6 animate-fade-in-up">
          <h2 className="text-lg font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent mb-5">
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

      {/* Table */}
      <div className="glass-card rounded-2xl shadow-xl p-5 animate-fade-in-up-delay-3">
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
