"use client";

import JSZip from "jszip";
import { saveAs } from "file-saver";
import { Expense } from "./types";

let templateCache: ArrayBuffer | null = null;

async function getTemplate(): Promise<ArrayBuffer> {
  if (templateCache) return templateCache;
  const res = await fetch("/template.hwpx");
  if (!res.ok) throw new Error("템플릿 파일을 찾을 수 없습니다");
  templateCache = await res.arrayBuffer();
  return templateCache;
}

function escapeXml(str: string): string {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

function formatDate(dateStr: string): string {
  return dateStr.replace(/-/g, ".");
}

function extractMonth(dateStr: string): { year: string; month: number } {
  const [y, m] = dateStr.split("-");
  return { year: y, month: parseInt(m) };
}

function fillTemplate(xml: string, expense: Expense): string {
  const { year, month } = extractMonth(expense.date);
  const formattedDate = formatDate(expense.date);

  return xml
    .replace(/\d{4}년\s*\d{1,2}월/, `${year}년 ${month}월`)
    .replace(/\{\{일자\}\}/g, formattedDate)
    .replace(/\{\{장소\}\}/g, escapeXml(expense.place))
    .replace(/\{\{집행목적\}\}/g, escapeXml(expense.purpose))
    .replace(/\{\{집행대상\}\}/g, escapeXml(expense.target));
}

export async function generateHwpx(expense: Expense) {
  const template = await getTemplate();
  const zip = await JSZip.loadAsync(template);

  const sectionFile = zip.file("Contents/section0.xml");
  if (!sectionFile) throw new Error("section0.xml을 찾을 수 없습니다");

  let xml = await sectionFile.async("string");
  xml = fillTemplate(xml, expense);
  zip.file("Contents/section0.xml", xml);

  const prvFile = zip.file("Preview/PrvText.txt");
  if (prvFile) {
    let prv = await prvFile.async("string");
    const { year, month } = extractMonth(expense.date);
    prv = prv
      .replace(/\d{4}년\s*\d{1,2}월/, `${year}년 ${month}월`)
      .replace(/\{\{일자\}\}/, formatDate(expense.date))
      .replace(/\{\{장소\}\}/, expense.place)
      .replace(/\{\{집행목적\}\}/, expense.purpose)
      .replace(/\{\{집행대상\}\}/, expense.target);
    zip.file("Preview/PrvText.txt", prv);
  }

  const blob = await zip.generateAsync({ type: "blob" });
  const safePlace = expense.place.replace(/[\\/:*?"<>|]/g, "_").substring(0, 20);
  const filename = `업무추진비_${formatDate(expense.date)}_${safePlace}.hwpx`;
  saveAs(blob, filename);
}

export async function generateMultipleHwpx(expenses: Expense[]) {
  const template = await getTemplate();
  const zip = await JSZip.loadAsync(template);

  const sectionFile = zip.file("Contents/section0.xml");
  if (!sectionFile) throw new Error("section0.xml을 찾을 수 없습니다");

  const originalXml = await sectionFile.async("string");

  // <hp:p> 블록 추출 (테이블이 포함된 단락)
  const pMatch = originalXml.match(/<hp:p id="2757524817"[\s\S]*<\/hp:p>/);
  if (!pMatch) throw new Error("템플릿 파싱 실패");
  const pTemplate = pMatch[0];

  // 각 내역별로 <hp:p> 블록 생성
  const pages = expenses.map((expense, i) => {
    let block = fillTemplate(pTemplate, expense);
    // 두 번째 페이지부터 pageBreak 추가
    if (i > 0) {
      block = block.replace('pageBreak="0"', 'pageBreak="1"');
    }
    return block;
  });

  // 원본 XML에서 <hp:p> 블록을 교체
  const secOpen = originalXml.substring(0, originalXml.indexOf(pTemplate));
  const secClose = originalXml.substring(originalXml.indexOf(pTemplate) + pTemplate.length);
  const newXml = secOpen + pages.join("") + secClose;

  zip.file("Contents/section0.xml", newXml);

  const { year, month } = extractMonth(expenses[0].date);
  const blob = await zip.generateAsync({ type: "blob" });
  saveAs(blob, `업무추진비_${year}년_${month}월.hwpx`);
}
