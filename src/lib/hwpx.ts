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

// HWPX 셀 하나 생성
function makeCell(
  text: string,
  colAddr: number,
  rowAddr: number,
  width: number,
  height: number,
  opts?: { colSpan?: number; rowSpan?: number; fillRef?: number; charRef?: number; align?: string }
): string {
  const colSpan = opts?.colSpan ?? 1;
  const rowSpan = opts?.rowSpan ?? 1;
  const fillRef = opts?.fillRef ?? 5;
  const charRef = opts?.charRef ?? 7;
  const align = opts?.align ?? "LEFT";

  const paraPrIDRef = align === "RIGHT" ? "2" : align === "CENTER" ? "3" : "0";

  return `<hp:tc name="" header="0" hasMargin="0" protect="0" editable="0" dirty="0" borderFillIDRef="${fillRef}"><hp:subList id="" textDirection="HORIZONTAL" lineWrap="BREAK" vertAlign="CENTER" linkListIDRef="0" linkListNextIDRef="0" textWidth="0" textHeight="0" hasTextRef="0" hasNumRef="0"><hp:p id="0" paraPrIDRef="${paraPrIDRef}" styleIDRef="0" pageBreak="0" columnBreak="0" merged="0"><hp:run charPrIDRef="${charRef}"><hp:t>${escapeXml(text)}</hp:t></hp:run><hp:linesegarray><hp:lineseg textpos="0" vertpos="0" vertsize="1200" textheight="1200" baseline="1020" spacing="720" horzpos="0" horzsize="${width - 1020}" flags="393216"/></hp:linesegarray></hp:p></hp:subList><hp:cellAddr colAddr="${colAddr}" rowAddr="${rowAddr}"/><hp:cellSpan colSpan="${colSpan}" rowSpan="${rowSpan}"/><hp:cellSz width="${width}" height="${height}"/><hp:cellMargin left="340" right="340" top="113" bottom="113"/></hp:tc>`;
}

// 요약표 페이지 XML 생성
function buildSummaryPage(expenses: Expense[], year: string, month: number): string {
  const totalWidth = 49595;
  // 6열: 번호, 일자, 장소, 집행목적, 집행대상, 금액
  const colWidths = [3800, 7200, 10000, 10595, 10000, 8000];
  const rowHeight = 1800;
  const headerHeight = 2200;
  const titleHeight = 2800;

  const totalAmount = expenses.reduce((s, e) => s + e.amount, 0);
  const rowCnt = expenses.length + 3; // 제목행 + 헤더행 + 데이터행들 + 합계행

  // 제목 행 (6열 병합)
  const titleRow = `<hp:tr>${makeCell(
    `${year}년 ${month}월 업무추진비 집행 내역`,
    0, 0, totalWidth, titleHeight,
    { colSpan: 6, fillRef: 6, charRef: 8, align: "CENTER" }
  )}</hp:tr>`;

  // 헤더 행
  const headers = ["번호", "일자", "장소", "집행목적", "집행대상", "금액"];
  const headerRow = `<hp:tr>${headers.map((h, i) =>
    makeCell(h, i, 1, colWidths[i], headerHeight, { fillRef: 7, charRef: 7, align: "CENTER" })
  ).join("")}</hp:tr>`;

  // 데이터 행
  const dataRows = expenses.map((e, idx) => {
    const cells = [
      makeCell(String(idx + 1), 0, idx + 2, colWidths[0], rowHeight, { align: "CENTER" }),
      makeCell(formatDate(e.date), 1, idx + 2, colWidths[1], rowHeight, { align: "CENTER" }),
      makeCell(e.place, 2, idx + 2, colWidths[2], rowHeight),
      makeCell(e.purpose, 3, idx + 2, colWidths[3], rowHeight),
      makeCell(e.target, 4, idx + 2, colWidths[4], rowHeight),
      makeCell(e.amount.toLocaleString() + "원", 5, idx + 2, colWidths[5], rowHeight, { align: "RIGHT" }),
    ];
    return `<hp:tr>${cells.join("")}</hp:tr>`;
  });

  // 합계 행
  const totalRowIdx = expenses.length + 2;
  const totalRow = `<hp:tr>${makeCell(
    "합 계", 0, totalRowIdx, colWidths[0] + colWidths[1] + colWidths[2] + colWidths[3] + colWidths[4],
    headerHeight, { colSpan: 5, fillRef: 7, charRef: 8, align: "CENTER" }
  )}${makeCell(
    totalAmount.toLocaleString() + "원", 5, totalRowIdx, colWidths[5],
    headerHeight, { fillRef: 7, charRef: 8, align: "RIGHT" }
  )}</hp:tr>`;

  const tableHeight = titleHeight + headerHeight + (rowHeight * expenses.length) + headerHeight;

  const tbl = `<hp:tbl id="9999999" zOrder="0" numberingType="TABLE" textWrap="TOP_AND_BOTTOM" textFlow="BOTH_SIDES" lock="0" dropcapstyle="None" pageBreak="CELL" repeatHeader="1" rowCnt="${rowCnt}" colCnt="6" cellSpacing="0" borderFillIDRef="3" noAdjust="0"><hp:sz width="${totalWidth}" widthRelTo="ABSOLUTE" height="${tableHeight}" heightRelTo="ABSOLUTE" protect="0"/><hp:pos treatAsChar="1" affectLSpacing="0" flowWithText="1" allowOverlap="0" holdAnchorAndSO="0" vertRelTo="PARA" horzRelTo="PARA" vertAlign="TOP" horzAlign="LEFT" vertOffset="0" horzOffset="0"/><hp:outMargin left="283" right="283" top="283" bottom="283"/><hp:inMargin left="340" right="340" top="113" bottom="113"/>${titleRow}${headerRow}${dataRows.join("")}${totalRow}</hp:tbl>`;

  return `<hp:p id="9999999999" paraPrIDRef="1" styleIDRef="0" pageBreak="0" columnBreak="0" merged="0"><hp:run charPrIDRef="6">${tbl}<hp:t/></hp:run><hp:linesegarray><hp:lineseg textpos="0" vertpos="0" vertsize="${tableHeight + 566}" textheight="${tableHeight + 566}" baseline="${Math.round((tableHeight + 566) * 0.85)}" spacing="600" horzpos="0" horzsize="51024" flags="393216"/></hp:linesegarray></hp:p>`;
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

  const { year, month } = extractMonth(expenses[0].date);

  // 요약표 페이지 생성
  const summaryPage = buildSummaryPage(expenses, year, month);

  // 각 내역별로 <hp:p> 블록 생성 (모두 pageBreak 포함, 요약표 다음이므로)
  const pages = expenses.map((expense) => {
    let block = fillTemplate(pTemplate, expense);
    block = block.replace('pageBreak="0"', 'pageBreak="1"');
    return block;
  });

  // 원본 XML에서 <hp:p> 블록을 교체: 요약표 + 개별 내역
  const secOpen = originalXml.substring(0, originalXml.indexOf(pTemplate));
  const secClose = originalXml.substring(originalXml.indexOf(pTemplate) + pTemplate.length);
  const newXml = secOpen + summaryPage + pages.join("") + secClose;

  zip.file("Contents/section0.xml", newXml);

  const blob = await zip.generateAsync({ type: "blob" });
  saveAs(blob, `업무추진비_${year}년_${month}월.hwpx`);
}
