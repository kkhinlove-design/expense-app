export interface Person {
  slug: string;
  name: string;
  title: string;
  storageKey: string;
  budget: number;
  pin: string;
}

export const MASTER_PIN = "5774";

export const PEOPLE: Person[] = [
  {
    slug: "kang",
    name: "강승구",
    title: "원장",
    storageKey: "expense-data-kang",
    budget: 20_000_000,
    pin: "2800",
  },
  {
    slug: "ko",
    name: "고경환",
    title: "실장",
    storageKey: "expense-data-ko",
    budget: 8_000_000,
    pin: "5798",
  },
  {
    slug: "jo",
    name: "조윤정",
    title: "국장",
    storageKey: "expense-data-jo",
    budget: 6_000_000,
    pin: "2800",
  },
  {
    slug: "etc",
    name: "기타운영비",
    title: "",
    storageKey: "expense-data-etc",
    budget: 8_400_000,
    pin: "2800",
  },
];

export function getPerson(slug: string): Person | undefined {
  return PEOPLE.find((p) => p.slug === slug);
}
