// S2 (FR-2): monthly budget rules.
import { parseAmountToCents } from "./expenses";
import { formatMoney, formatMonth, monthKey } from "./format";
import type { Expense, MonthKey } from "./types";

export function spentInMonth(expenses: readonly Expense[], month: MonthKey): number {
  let sum = 0;
  for (const e of expenses) if (monthKey(e.date) === month) sum += e.amountCents;
  return sum;
}

/** Budget left in a month. Negative = over. null = no budget set. */
export function remainingBudget(
  budgetCents: number | null,
  expenses: readonly Expense[],
  month: MonthKey,
): number | null {
  if (budgetCents === null) return null;
  return budgetCents - spentInMonth(expenses, month);
}

/** S2-AC3: the budget is shown red once nothing is left. */
export function isOverBudget(remainingCents: number | null): boolean {
  return remainingCents !== null && remainingCents <= 0;
}

export type BudgetCheck =
  | { ok: true; remainingAfterCents: number | null }
  | { ok: false; remainingCents: number; message: string };

/**
 * S2-AC1 / S2-AC2: does this expense fit in what's left for its month?
 * An expense exactly equal to what's left is allowed (budget 200 → 200 ok, 201 rejected).
 */
export function checkBudget(
  expense: Pick<Expense, "date" | "amountCents">,
  budgetCents: number | null,
  expenses: readonly Expense[],
): BudgetCheck {
  const month = monthKey(expense.date);
  const left = remainingBudget(budgetCents, expenses, month);
  if (left === null) return { ok: true, remainingAfterCents: null };
  if (expense.amountCents <= left) return { ok: true, remainingAfterCents: left - expense.amountCents };
  const shown = Math.max(left, 0);
  return {
    ok: false,
    remainingCents: shown,
    message: `Enter an amount under budget. You have ${formatMoney(shown)} left for ${formatMonth(month)}.`,
  };
}

export type ParseBudgetResult = { ok: true; cents: number } | { ok: false; error: string };

/** Budget form input → cents. 0 is allowed. */
export function parseBudget(value: string): ParseBudgetResult {
  const cents = parseAmountToCents(value);
  if (cents === null) return { ok: false, error: "Enter a budget like 400 or 250.50." };
  return { ok: true, cents };
}
