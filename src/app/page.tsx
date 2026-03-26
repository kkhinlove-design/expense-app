import Link from "next/link";
import { PEOPLE } from "@/lib/people";

export default function Home() {
  return (
    <div className="max-w-md mx-auto px-4 py-20">
      <h1 className="text-2xl font-bold text-gray-900 text-center mb-2">
        업무추진비 관리
      </h1>
      <p className="text-sm text-gray-500 text-center mb-10">
        관리 대상을 선택하세요
      </p>
      <div className="space-y-4">
        {PEOPLE.map((person) => (
          <Link
            key={person.slug}
            href={`/${person.slug}`}
            className="block bg-white rounded-xl p-6 shadow-sm border border-gray-100 hover:border-blue-300 hover:shadow-md transition-all"
          >
            <div className="flex items-center justify-between">
              <div>
                <span className="text-lg font-semibold text-gray-900">
                  {person.name}
                </span>
                {person.title && (
                  <span className="ml-2 text-sm text-gray-500">
                    {person.title}
                  </span>
                )}
              </div>
              <svg
                className="w-5 h-5 text-gray-400"
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
          </Link>
        ))}
      </div>
    </div>
  );
}
