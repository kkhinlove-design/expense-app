"use client";

import { Expense } from "./types";

const DEFAULT_KEY = "expense-data";

export function loadExpenses(key = DEFAULT_KEY): Expense[] {
  if (typeof window === "undefined") return [];
  const raw = localStorage.getItem(key);
  if (!raw) return [];
  try {
    return JSON.parse(raw);
  } catch {
    return [];
  }
}

export function saveExpenses(expenses: Expense[], key = DEFAULT_KEY) {
  localStorage.setItem(key, JSON.stringify(expenses));
}

export function addExpense(expense: Expense, key = DEFAULT_KEY) {
  const list = loadExpenses(key);
  list.push(expense);
  saveExpenses(list, key);
  return list;
}

export function updateExpense(id: string, updated: Partial<Expense>, key = DEFAULT_KEY) {
  const list = loadExpenses(key);
  const idx = list.findIndex((e) => e.id === id);
  if (idx >= 0) {
    list[idx] = { ...list[idx], ...updated };
    saveExpenses(list, key);
  }
  return list;
}

export function deleteExpense(id: string, key = DEFAULT_KEY) {
  const list = loadExpenses(key).filter((e) => e.id !== id);
  saveExpenses(list, key);
  return list;
}
