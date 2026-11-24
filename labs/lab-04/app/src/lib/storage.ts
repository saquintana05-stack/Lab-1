// v1 keeps data in the browser. Everything else talks to this interface only,
// so Lab 6 can swap in a database without touching the screens.
import { isValidISODate } from "./expenses";
import { isCategory, type BudgetSettings, type Expense } from "./types";

export interface ExpenseStore {
  loadExpenses(): Expense[];
  saveExpenses(expenses: readonly Expense[]): void;
  loadBudget(): BudgetSettings;
  saveBudget(settings: BudgetSettings): void;
}

export const EXPENSES_KEY = "expense-tracker:v1:expenses";
export const BUDGET_KEY = "expense-tracker:v1:budget";

export function isExpense(value: unknown): value is Expense {
  if (typeof value !== "object" || value === null) return false;
  const e = value as Record<string, unknown>;
  return (
    typeof e.id === "string" &&
    typeof e.date === "string" &&
    isValidISODate(e.date) &&
    Number.isSafeInteger(e.amountCents) &&
    (e.amountCents as number) > 0 &&
    isCategory(e.category) &&
    typeof e.note === "string" &&
    typeof e.createdAt === "string"
  );
}

function safeStorage(): Storage | null {
  try {
    const s = window.localStorage;
    const probe = "__expense-tracker-probe__";
    s.setItem(probe, "1");
    s.removeItem(probe);
    return s;
  } catch {
    return null;
  }
}

/** In-memory store: used when localStorage is blocked, and in tests. */
export function createMemoryStore(initial?: { expenses?: Expense[]; budget?: BudgetSettings }): ExpenseStore {
  let expenses = [...(initial?.expenses ?? [])];
  let budget: BudgetSettings = initial?.budget ?? { monthlyBudgetCents: null };
  return {
    loadExpenses: () => [...expenses],
    saveExpenses: (next) => void (expenses = [...next]),
    loadBudget: () => ({ ...budget }),
    saveBudget: (next) => void (budget = { ...next }),
  };
}

/** localStorage-backed store. Ignores bad saved data; falls back to memory if storage is blocked. */
export function createLocalStore(storage: Storage | null = safeStorage()): ExpenseStore {
  if (!storage) return createMemoryStore();

  const read = (key: string): unknown => {
    try {
      const raw = storage.getItem(key);
      return raw === null ? null : JSON.parse(raw);
    } catch {
      return null;
    }
  };
  const write = (key: string, value: unknown) => {
    try {
      storage.setItem(key, JSON.stringify(value));
    } catch {
      // Storage full or blocked mid-session: keep working in memory.
    }
  };

  return {
    loadExpenses() {
      const data = read(EXPENSES_KEY);
      return Array.isArray(data) ? data.filter(isExpense) : [];
    },
    saveExpenses: (expenses) => write(EXPENSES_KEY, expenses),
    loadBudget() {
      const data = read(BUDGET_KEY) as Partial<BudgetSettings> | null;
      const cents = data?.monthlyBudgetCents;
      return {
        monthlyBudgetCents: Number.isSafeInteger(cents) && (cents as number) >= 0 ? (cents as number) : null,
      };
    },
    saveBudget: (settings) => write(BUDGET_KEY, settings),
  };
}
