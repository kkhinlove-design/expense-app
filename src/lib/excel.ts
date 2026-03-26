"use client";

import * as XLSX from "xlsx";
import { Expense } from "./types";

const HEADERS = ["일자", "장소", "집행목적", "집행대상", "금액", "메모"];

export function downloadExcel(expenses: Expense[], filename: string) {
  const data = expenses.map((e) => ({
    일자: e.date,
    장소: e.place,
    집행목적: e.purpose,
    집행대상: e.target,
    금액: e.amount,
    메모: e.memo || "",
  }));

  const ws = XLSX.utils.json_to_sheet(data, { header: HEADERS });

  // 열 너비 설정
  ws["!cols"] = [
    { wch: 12 },
    { wch: 20 },
    { wch: 25 },
    { wch: 20 },
    { wch: 12 },
    { wch: 20 },
  ];

  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, "업무추진비");
  XLSX.writeFile(wb, filename);
}

export function downloadTemplate(filename: string) {
  const ws = XLSX.utils.aoa_to_sheet([
    HEADERS,
    ["2026-03-26", "한식당 가온", "유관기관 업무협의", "○○과장 외 2명", 50000, ""],
  ]);

  ws["!cols"] = [
    { wch: 12 },
    { wch: 20 },
    { wch: 25 },
    { wch: 20 },
    { wch: 12 },
    { wch: 20 },
  ];

  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, "업무추진비");
  XLSX.writeFile(wb, filename);
}

export function parseExcel(file: File): Promise<Expense[]> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = new Uint8Array(e.target?.result as ArrayBuffer);
        const wb = XLSX.read(data, { type: "array" });
        const ws = wb.Sheets[wb.SheetNames[0]];
        const rows = XLSX.utils.sheet_to_json<Record<string, unknown>>(ws);

        const expenses: Expense[] = rows
          .filter((row) => row["일자"] && row["금액"])
          .map((row) => {
            let dateStr = String(row["일자"]);
            // Excel 날짜 숫자 처리
            if (/^\d{5}$/.test(dateStr)) {
              const d = XLSX.SSF.parse_date_code(Number(dateStr));
              dateStr = `${d.y}-${String(d.m).padStart(2, "0")}-${String(d.d).padStart(2, "0")}`;
            }
            // YYYY.MM.DD → YYYY-MM-DD
            dateStr = dateStr.replace(/\./g, "-");

            return {
              id: crypto.randomUUID(),
              date: dateStr,
              place: String(row["장소"] || ""),
              purpose: String(row["집행목적"] || ""),
              target: String(row["집행대상"] || ""),
              amount: Number(row["금액"]) || 0,
              memo: row["메모"] ? String(row["메모"]) : undefined,
              createdAt: new Date().toISOString(),
            };
          });

        resolve(expenses);
      } catch (err) {
        reject(new Error("엑셀 파일 파싱 실패: " + (err as Error).message));
      }
    };
    reader.onerror = () => reject(new Error("파일 읽기 실패"));
    reader.readAsArrayBuffer(file);
  });
}
