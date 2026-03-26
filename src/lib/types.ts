export interface Expense {
  id: string;
  date: string; // YYYY-MM-DD
  place: string;
  purpose: string;
  target: string;
  amount: number;
  memo?: string;
  createdAt: string;
}

export const ANNUAL_BUDGET = 8_000_000;

export const MONTHS = [
  "1월", "2월", "3월", "4월", "5월", "6월",
  "7월", "8월", "9월", "10월", "11월", "12월",
];
