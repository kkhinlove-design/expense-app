"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { PEOPLE } from "@/lib/people";
import { supabase } from "@/lib/supabase";

interface PersonSummary {
  slug: string;
  name: string;
  title: string;
  budget: number;
  spent: number;
  count: number;
}

export default function Home() {
  const [summaries, setSummaries] = useState<PersonSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const currentYear = new Date().getFullYear();

  useEffect(() => {
    async function fetchSummaries() {
      const results: PersonSummary[] = [];

      for (const person of PEOPLE) {
        const { data } = await supabase
          .from("expenses")
          .select("amount")
          .eq("person_slug", person.slug)
          .gte("date", `${currentYear}-01-01`)
          .lte("date", `${currentYear}-12-31`);

        const spent = (data || []).reduce((sum, row) => sum + row.amount, 0);
        results.push({
          slug: person.slug,
          name: person.name,
          title: person.title,
          budget: person.budget,
          spent,
          count: data?.length || 0,
        });
      }

      setSummaries(results);
      setLoading(false);
    }

    fetchSummaries();
  }, [currentYear]);

  const totalBudget = summaries.reduce((s, p) => s + p.budget, 0);
  const totalSpent = summaries.reduce((s, p) => s + p.spent, 0);

  return (
    <div className="max-w-2xl mx-auto px-4 py-10">
      <h1 className="text-2xl font-bold text-gray-900 text-center mb-1">
        업무추진비 관리
      </h1>
      <p className="text-sm text-gray-500 text-center mb-8">
        {currentYear}년 집행 현황
      </p>

      {loading ? (
        <div className="text-center text-gray-400 py-12">불러오는 중...</div>
      ) : (
        <>
          {/* 전체 요약 */}
          <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100 mb-6">
            <div className="flex justify-between items-baseline mb-3">
              <span className="text-sm font-medium text-gray-500">전체 예산</span>
              <span className="text-sm text-gray-400">
                {totalSpent.toLocaleString()} / {totalBudget.toLocaleString()}원
              </span>
            </div>
            <div className="w-full bg-gray-100 rounded-full h-3 mb-2">
              <div
                className={`h-3 rounded-full transition-all duration-500 ${
                  totalBudget > 0 && (totalSpent / totalBudget) * 100 > 90
                    ? "bg-red-500"
                    : (totalSpent / totalBudget) * 100 > 70
                    ? "bg-yellow-500"
                    : "bg-blue-500"
                }`}
                style={{
                  width: `${Math.min((totalSpent / totalBudget) * 100, 100)}%`,
                }}
              />
            </div>
            <div className="text-right text-xs text-gray-400">
              {totalBudget > 0
                ? ((totalSpent / totalBudget) * 100).toFixed(1)
                : "0.0"}
              % 집행
            </div>
          </div>

          {/* 개별 현황 + 진입 버튼 */}
          <div className="space-y-3">
            {summaries.map((s) => {
              const percent =
                s.budget > 0
                  ? Math.min((s.spent / s.budget) * 100, 100)
                  : 0;
              const barColor =
                percent > 90
                  ? "bg-red-500"
                  : percent > 70
                  ? "bg-yellow-500"
                  : "bg-blue-500";

              return (
                <Link
                  key={s.slug}
                  href={`/${s.slug}`}
                  className="block bg-white rounded-xl p-5 shadow-sm border border-gray-100 hover:border-blue-300 hover:shadow-md transition-all"
                >
                  <div className="flex items-center justify-between mb-3">
                    <div>
                      <span className="font-semibold text-gray-900">
                        {s.name}
                      </span>
                      {s.title && (
                        <span className="ml-2 text-sm text-gray-500">
                          {s.title}
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-gray-400">
                        {s.count}건
                      </span>
                      <svg
                        className="w-4 h-4 text-gray-400"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M9 5l7 7-7 7"
                        />
                      </svg>
                    </div>
                  </div>
                  <div className="w-full bg-gray-100 rounded-full h-2.5 mb-2">
                    <div
                      className={`h-2.5 rounded-full transition-all duration-500 ${barColor}`}
                      style={{ width: `${percent}%` }}
                    />
                  </div>
                  <div className="flex justify-between text-xs text-gray-400">
                    <span>
                      {s.spent.toLocaleString()} / {s.budget.toLocaleString()}원
                    </span>
                    <span>{percent.toFixed(1)}%</span>
                  </div>
                </Link>
              );
            })}
          </div>
        </>
      )}
    </div>
  );
}
