"use client";

import { useState } from "react";
import { Expense } from "@/lib/types";

interface Props {
  onSubmit: (expense: Expense) => void;
  onCancel?: () => void;
  initial?: Expense | null;
}

export default function ExpenseForm({ onSubmit, onCancel, initial }: Props) {
  const [date, setDate] = useState(initial?.date || "");
  const [place, setPlace] = useState(initial?.place || "");
  const [purpose, setPurpose] = useState(initial?.purpose || "");
  const [target, setTarget] = useState(initial?.target || "");
  const [amount, setAmount] = useState(initial?.amount?.toString() || "");
  const [memo, setMemo] = useState(initial?.memo || "");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({
      id: initial?.id || crypto.randomUUID(),
      date,
      place,
      purpose,
      target,
      amount: parseInt(amount) || 0,
      memo: memo || undefined,
      createdAt: initial?.createdAt || new Date().toISOString(),
    });
    if (!initial) {
      setDate("");
      setPlace("");
      setPurpose("");
      setTarget("");
      setAmount("");
      setMemo("");
    }
  };

  const inputClass =
    "w-full px-4 py-2.5 bg-white/60 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/40 focus:border-indigo-400 transition-all duration-200 placeholder:text-gray-300";
  const labelClass = "block text-sm font-semibold text-gray-600 mb-1.5";

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className={labelClass}>일자</label>
          <input
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            className={inputClass}
            required
          />
        </div>
        <div>
          <label className={labelClass}>금액 (원)</label>
          <input
            type="number"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            placeholder="50,000"
            className={inputClass}
            required
          />
        </div>
      </div>
      <div>
        <label className={labelClass}>장소</label>
        <input
          type="text"
          value={place}
          onChange={(e) => setPlace(e.target.value)}
          placeholder="한식당 가온"
          className={inputClass}
          required
        />
      </div>
      <div>
        <label className={labelClass}>집행목적</label>
        <input
          type="text"
          value={purpose}
          onChange={(e) => setPurpose(e.target.value)}
          placeholder="유관기관 업무협의"
          className={inputClass}
          required
        />
      </div>
      <div>
        <label className={labelClass}>집행대상</label>
        <input
          type="text"
          value={target}
          onChange={(e) => setTarget(e.target.value)}
          placeholder="○○과장 외 2명"
          className={inputClass}
          required
        />
      </div>
      <div>
        <label className={labelClass}>메모 (선택)</label>
        <input
          type="text"
          value={memo}
          onChange={(e) => setMemo(e.target.value)}
          placeholder="비고사항"
          className={inputClass}
        />
      </div>
      <div className="flex gap-2 pt-3">
        <button
          type="submit"
          className="flex-1 bg-gradient-to-r from-indigo-500 to-purple-600 text-white py-3 px-4 rounded-xl hover:shadow-lg hover:shadow-indigo-500/25 hover:-translate-y-0.5 font-semibold transition-all duration-200"
        >
          {initial ? "수정" : "등록"}
        </button>
        {onCancel && (
          <button
            type="button"
            onClick={onCancel}
            className="px-6 py-3 glass-card rounded-xl hover:bg-white/90 hover:shadow-md font-medium transition-all duration-200"
          >
            취소
          </button>
        )}
      </div>
    </form>
  );
}
