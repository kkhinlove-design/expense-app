export interface Person {
  slug: string;
  name: string;
  title: string;
  storageKey: string;
  budget: number;
}

export const PEOPLE: Person[] = [
  {
    slug: "kang",
    name: "강승구",
    title: "원장",
    storageKey: "expense-data-kang",
    budget: 20_000_000,
  },
  {
    slug: "ko",
    name: "고경환",
    title: "실장",
    storageKey: "expense-data-ko",
    budget: 8_000_000,
  },
  {
    slug: "etc",
    name: "기타운영비",
    title: "",
    storageKey: "expense-data-etc",
    budget: 8_400_000,
  },
];

export function getPerson(slug: string): Person | undefined {
  return PEOPLE.find((p) => p.slug === slug);
}
