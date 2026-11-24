// Data model from specs/spec.md → "Data".

export const CATEGORIES = [
  "Food",
  "Transport",
  "Housing",
  "School",
  "Entertainment",
  "Health",
  "Other",
] as const;

export type Category = (typeof CATEGORIES)[number];

/** "YYYY-MM-DD" */
export type ISODate = string;

/** "YYYY-MM" */
export type MonthKey = string;

export interface Expense {
  id: string;
  /** The day the money was spent. */
  date: ISODate;
  /** Integer cents, always > 0. */
  amountCents: number;
  category: Category;
  /** Optional, at most 80 characters. */
  note: string;
  /** ISO timestamp of when it was entered. */
  createdAt: string;
}

export interface BudgetSettings {
  /** One amount that applies to every month. null = no budget set. */
  monthlyBudgetCents: number | null;
}

export function isCategory(value: unknown): value is Category {
  return typeof value === "string" && (CATEGORIES as readonly string[]).includes(value);
}
