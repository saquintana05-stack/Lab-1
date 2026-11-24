import { describe, expect, it } from "vitest";
import { BUDGET_KEY, EXPENSES_KEY, createLocalStore, createMemoryStore } from "./storage";
import type { Expense } from "./types";

const e: Expense = {
  id: "a",
  date: "2026-11-02",
  amountCents: 4218,
  category: "Food",
  note: "Trader Joe's",
  createdAt: "2026-11-02T20:00:00.000Z",
};

describe("createLocalStore", () => {
  it("saves and loads expenses and the budget", () => {
    const store = createLocalStore(window.localStorage);
    store.saveExpenses([e]);
    store.saveBudget({ monthlyBudgetCents: 40000 });

    const again = createLocalStore(window.localStorage);
    expect(again.loadExpenses()).toEqual([e]);
    expect(again.loadBudget()).toEqual({ monthlyBudgetCents: 40000 });
  });

  it("starts empty when nothing is saved", () => {
    const store = createLocalStore(window.localStorage);
    expect(store.loadExpenses()).toEqual([]);
    expect(store.loadBudget()).toEqual({ monthlyBudgetCents: null });
  });

  it("ignores corrupt or invalid saved data", () => {
    window.localStorage.setItem(EXPENSES_KEY, JSON.stringify([e, { id: "bad", amountCents: -5 }, null]));
    window.localStorage.setItem(BUDGET_KEY, "{not json");
    const store = createLocalStore(window.localStorage);
    expect(store.loadExpenses()).toEqual([e]);
    expect(store.loadBudget()).toEqual({ monthlyBudgetCents: null });
  });

  it("falls back to memory when storage is unavailable", () => {
    const store = createLocalStore(null);
    store.saveExpenses([e]);
    expect(store.loadExpenses()).toEqual([e]);
  });
});

describe("createMemoryStore", () => {
  it("returns copies so callers can't change stored data by accident", () => {
    const store = createMemoryStore({ expenses: [e] });
    store.loadExpenses().pop();
    expect(store.loadExpenses()).toHaveLength(1);
  });
});
