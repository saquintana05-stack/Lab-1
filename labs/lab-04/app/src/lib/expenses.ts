// S1 (FR-1): recording expenses and grouping them per month.
import { monthKey } from "./format";
import { isCategory, type Category, type Expense, type MonthKey } from "./types";

export const NOTE_MAX = 80;
export const AMOUNT_MAX_CENTS = 100_000_000; // $1,000,000

export interface ExpenseInput {
  date: string;
  amount: string;
  category: string;
  note?: string;
}

export type ExpenseField = "date" | "amount" | "category" | "note";
export type FieldErrors = Partial<Record<ExpenseField, string>>;

export type CreateExpenseResult =
  | { ok: true; expense: Expense }
  | { ok: false; errors: FieldErrors };

export interface CreateDeps {
  id?: () => string;
  now?: () => Date;
}

/** True for a real calendar date written as YYYY-MM-DD (rejects 2026-02-30). */
export function isValidISODate(value: string): boolean {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;
  const [y, m, d] = value.split("-").map(Number);
  const dt = new Date(Date.UTC(y, m - 1, d));
  return dt.getUTCFullYear() === y && dt.getUTCMonth() === m - 1 && dt.getUTCDate() === d;
}

/** "12.5" → 1250. Returns null unless it's a positive amount with at most 2 decimals. */
export function parseAmountToCents(value: string): number | null {
  const trimmed = value.trim();
  if (!/^\d+(\.\d{1,2})?$/.test(trimmed)) return null;
  const [whole, frac = ""] = trimmed.split(".");
  const cents = Number(whole) * 100 + Number(frac.padEnd(2, "0"));
  return Number.isSafeInteger(cents) ? cents : null;
}

/** Check the form input and build an Expense (S1-AC1). */
export function createExpense(input: ExpenseInput, deps: CreateDeps = {}): CreateExpenseResult {
  const errors: FieldErrors = {};

  if (!isValidISODate(input.date)) errors.date = "Enter a valid date.";

  const cents = parseAmountToCents(input.amount);
  if (cents === null || cents <= 0) {
    errors.amount = "Enter an amount greater than $0, like 12.50.";
  } else if (cents > AMOUNT_MAX_CENTS) {
    errors.amount = "That amount is too large.";
  }

  if (!isCategory(input.category)) errors.category = "Choose a category.";

  const note = (input.note ?? "").trim();
  if (note.length > NOTE_MAX) errors.note = `Keep the note under ${NOTE_MAX} characters.`;

  if (Object.keys(errors).length > 0) return { ok: false, errors };

  const id = deps.id ?? (() => crypto.randomUUID());
  const now = deps.now ?? (() => new Date());

  return {
    ok: true,
    expense: {
      id: id(),
      date: input.date,
      amountCents: cents as number,
      category: input.category as Category,
      note,
      createdAt: now().toISOString(),
    },
  };
}

/** Newest first: by date, then by when it was entered. */
export function compareNewestFirst(a: Expense, b: Expense): number {
  return b.date.localeCompare(a.date) || b.createdAt.localeCompare(a.createdAt);
}

export interface MonthSummary {
  month: MonthKey;
  totalCents: number;
  byCategory: Partial<Record<Category, number>>;
  expenses: Expense[];
}

/** Group expenses per month, newest month first (S1). */
export function groupByMonth(expenses: readonly Expense[]): MonthSummary[] {
  const groups = new Map<MonthKey, MonthSummary>();
  for (const e of expenses) {
    const key = monthKey(e.date);
    let g = groups.get(key);
    if (!g) {
      g = { month: key, totalCents: 0, byCategory: {}, expenses: [] };
      groups.set(key, g);
    }
    g.totalCents += e.amountCents;
    g.byCategory[e.category] = (g.byCategory[e.category] ?? 0) + e.amountCents;
    g.expenses.push(e);
  }
  const result = [...groups.values()].sort((a, b) => b.month.localeCompare(a.month));
  for (const g of result) g.expenses.sort(compareNewestFirst);
  return result;
}

/** Spending per category for one month, biggest first. */
export function categoryBreakdown(
  expenses: readonly Expense[],
  month: MonthKey,
): { category: Category; cents: number }[] {
  const totals = new Map<Category, number>();
  for (const e of expenses) {
    if (monthKey(e.date) !== month) continue;
    totals.set(e.category, (totals.get(e.category) ?? 0) + e.amountCents);
  }
  return [...totals.entries()]
    .map(([category, cents]) => ({ category, cents }))
    .sort((a, b) => b.cents - a.cents);
}
