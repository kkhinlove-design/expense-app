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

const CARD_GRADIENTS = [
  "from-indigo-500 to-purple-600",
  "from-pink-500 to-rose-600",
  "from-emerald-500 to-teal-600",
  "from-amber-500 to-orange-600",
];

const CARD_ICONS = ["👤", "👩‍💼", "👨‍💼", "📋"];

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
  const totalPercent = totalBudget > 0 ? (totalSpent / totalBudget) * 100 : 0;

  return (
    <div className="max-w-2xl mx-auto px-4 py-10">
      {/* Header */}
      <div className="text-center mb-10 animate-fade-in-up">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 shadow-lg shadow-indigo-500/30 mb-4">
          <span className="text-3xl">💰</span>
        </div>
        <h1 className="text-3xl font-extrabold bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">
          업무추진비 관리
        </h1>
        <p className="text-sm text-gray-500 mt-2 font-medium">
          {currentYear}년 집행 현황
        </p>
      </div>

      {loading ? (
        <div className="text-center py-16">
          <div className="inline-flex items-center gap-2 text-gray-400">
            <div className="w-5 h-5 border-2 border-indigo-400 border-t-transparent rounded-full animate-spin" />
            불러오는 중...
          </div>
        </div>
      ) : (
        <>
          {/* Total Summary Card */}
          <div className="glass-card rounded-2xl p-6 shadow-xl animate-fade-in-up-delay-1 animate-pulse-glow mb-8">
            <div className="flex justify-between items-center mb-1">
              <h2 className="text-sm font-semibold text-gray-600 uppercase tracking-wider">전체 예산</h2>
              <span className="text-xs font-medium px-2.5 py-1 rounded-full bg-indigo-100 text-indigo-700">
                {totalPercent.toFixed(1)}% 집행
              </span>
            </div>
            <div className="flex items-baseline gap-2 mb-4">
              <span className="text-3xl font-extrabold text-gray-900">
                {totalSpent.toLocaleString()}
              </span>
              <span className="text-sm text-gray-400">/ {totalBudget.toLocaleString()}원</span>
            </div>
            <div className="relative w-full h-4 bg-gray-100 rounded-full overflow-hidden">
              <div
                className={`h-full rounded-full transition-all duration-1000 ease-out ${
                  totalPercent > 90
                    ? "bg-gradient-to-r from-red-400 to-red-600"
                    : totalPercent > 70
                    ? "bg-gradient-to-r from-amber-400 to-orange-500"
                    : "bg-gradient-to-r from-indigo-400 to-purple-500"
                }`}
                style={{ width: `${Math.min(totalPercent, 100)}%` }}
              />
              <div className="absolute inset-0 shimmer-bar rounded-full" />
            </div>
          </div>

          {/* Person Cards */}
          <div className="grid gap-4">
            {summaries.map((s, idx) => {
              const percent =
                s.budget > 0
                  ? Math.min((s.spent / s.budget) * 100, 100)
                  : 0;
              const gradient = CARD_GRADIENTS[idx % CARD_GRADIENTS.length];
              const icon = CARD_ICONS[idx % CARD_ICONS.length];

              return (
                <Link
                  key={s.slug}
                  href={`/${s.slug}`}
                  className="group glass-card rounded-2xl p-5 shadow-lg hover:shadow-2xl hover:-translate-y-1 transition-all duration-300 animate-fade-in-up"
                  style={{ animationDelay: `${0.15 * (idx + 1)}s` }}
                >
                  <div className="flex items-center gap-4">
                    {/* Avatar */}
                    <div className={`flex-shrink-0 w-12 h-12 rounded-xl bg-gradient-to-br ${gradient} shadow-md flex items-center justify-center text-xl group-hover:scale-110 transition-transform duration-300`}>
                      {icon}
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-gray-900 text-lg">
                            {s.name}
                          </span>
                          {s.title && (
                            <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-gray-100 text-gray-500">
                              {s.title}
                            </span>
                          )}
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-medium text-gray-400">
                            {s.count}건
                          </span>
                          <div className="w-7 h-7 rounded-full bg-gray-100 group-hover:bg-indigo-100 flex items-center justify-center transition-colors">
                            <svg
                              className="w-4 h-4 text-gray-400 group-hover:text-indigo-500 transition-colors"
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
                      </div>

                      {/* Progress bar */}
                      <div className="relative w-full h-2.5 bg-gray-100 rounded-full overflow-hidden mb-1.5">
                        <div
                          className={`h-full rounded-full transition-all duration-700 ease-out bg-gradient-to-r ${
                            percent > 90
                              ? "from-red-400 to-red-500"
                              : percent > 70
                              ? "from-amber-400 to-orange-500"
                              : gradient.replace("from-", "from-").replace("to-", "to-")
                          }`}
                          style={{ width: `${percent}%` }}
                        />
                      </div>

                      <div className="flex justify-between text-xs">
                        <span className="text-gray-500 font-medium">
                          {s.spent.toLocaleString()} / {s.budget.toLocaleString()}원
                        </span>
                        <span className={`font-bold ${
                          percent > 90 ? "text-red-500" : percent > 70 ? "text-amber-500" : "text-indigo-500"
                        }`}>
                          {percent.toFixed(1)}%
                        </span>
                      </div>
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        </>
      )}

      {/* Footer */}
      <div className="text-center mt-12 text-xs text-gray-400 animate-fade-in-up-delay-3">
        업무추진비 카드 사용내역 관리 시스템
      </div>
    </div>
  );
}
