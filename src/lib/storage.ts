"use client";

import { supabase } from "./supabase";
import { Expense } from "./types";

export async function loadExpenses(personSlug: string): Promise<Expense[]> {
  const { data, error } = await supabase
    .from("expenses")
    .select("*")
    .eq("person_slug", personSlug)
    .order("date", { ascending: true });

  if (error) throw error;

  return (data || []).map((row) => ({
    id: row.id,
    date: row.date,
    place: row.place,
    purpose: row.purpose,
    target: row.target,
    amount: row.amount,
    memo: row.memo || undefined,
    createdAt: row.created_at,
  }));
}

export async function addExpense(expense: Expense, personSlug: string): Promise<void> {
  const { error } = await supabase.from("expenses").insert({
    id: expense.id,
    person_slug: personSlug,
    date: expense.date,
    place: expense.place,
    purpose: expense.purpose,
    target: expense.target,
    amount: expense.amount,
    memo: expense.memo || null,
  });
  if (error) throw error;
}

export async function updateExpense(id: string, updated: Partial<Expense>): Promise<void> {
  const { error } = await supabase
    .from("expenses")
    .update({
      date: updated.date,
      place: updated.place,
      purpose: updated.purpose,
      target: updated.target,
      amount: updated.amount,
      memo: updated.memo || null,
    })
    .eq("id", id);
  if (error) throw error;
}

export async function deleteExpense(id: string): Promise<void> {
  const { error } = await supabase.from("expenses").delete().eq("id", id);
  if (error) throw error;
}

export async function addExpensesBulk(expenses: Expense[], personSlug: string): Promise<void> {
  const rows = expenses.map((e) => ({
    id: e.id,
    person_slug: personSlug,
    date: e.date,
    place: e.place,
    purpose: e.purpose,
    target: e.target,
    amount: e.amount,
    memo: e.memo || null,
  }));
  const { error } = await supabase.from("expenses").insert(rows);
  if (error) throw error;
}
