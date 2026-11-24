// App state + actions. Framework-free so it can be tested directly;
// React reads it through useExpenseTracker (useSyncExternalStore).
import { checkBudget, parseBudget } from "./budget";
import { compareNewestFirst, createExpense, type CreateDeps, type ExpenseInput, type FieldErrors } from "./expenses";
import type { ExpenseStore } from "./storage";
import type { Expense } from "./types";

export interface TrackerState {
  expenses: readonly Expense[];
  budgetCents: number | null;
}

export type AddExpenseResult =
  | { ok: true; expense: Expense; remainingAfterCents: number | null }
  | { ok: false; fieldErrors: FieldErrors; budgetError?: undefined }
  | { ok: false; fieldErrors?: undefined; budgetError: string };

export type SetBudgetResult = { ok: true; cents: number } | { ok: false; error: string };

export interface Tracker {
  subscribe(listener: () => void): () => void;
  getState(): TrackerState;
  addExpense(input: ExpenseInput): AddExpenseResult;
  deleteExpense(id: string): void;
  setBudget(input: string): SetBudgetResult;
}

export function createTracker(store: ExpenseStore, deps: CreateDeps = {}): Tracker {
  let state: TrackerState | null = null;
  const listeners = new Set<() => void>();

  // Load lazily so nothing touches localStorage during server rendering.
  const current = (): TrackerState => {
    if (!state) {
      state = {
        expenses: store.loadExpenses().sort(compareNewestFirst),
        budgetCents: store.loadBudget().monthlyBudgetCents,
      };
    }
    return state;
  };

  const update = (next: TrackerState) => {
    state = next;
    listeners.forEach((l) => l());
  };

  return {
    subscribe(listener) {
      listeners.add(listener);
      return () => listeners.delete(listener);
    },

    getState: current,

    // S1-AC1, S2-AC1, S2-AC2: check the input, then the budget, then save.
    addExpense(input) {
      const created = createExpense(input, deps);
      if (!created.ok) return { ok: false, fieldErrors: created.errors };

      const s = current();
      const budget = checkBudget(created.expense, s.budgetCents, s.expenses);
      if (!budget.ok) return { ok: false, budgetError: budget.message };

      const expenses = [created.expense, ...s.expenses].sort(compareNewestFirst);
      store.saveExpenses(expenses);
      update({ ...s, expenses });
      return { ok: true, expense: created.expense, remainingAfterCents: budget.remainingAfterCents };
    },

    deleteExpense(id) {
      const s = current();
      const expenses = s.expenses.filter((e) => e.id !== id);
      if (expenses.length === s.expenses.length) return;
      store.saveExpenses(expenses);
      update({ ...s, expenses });
    },

    setBudget(input) {
      const parsed = parseBudget(input);
      if (!parsed.ok) return parsed;
      store.saveBudget({ monthlyBudgetCents: parsed.cents });
      update({ ...current(), budgetCents: parsed.cents });
      return parsed;
    },
  };
}
