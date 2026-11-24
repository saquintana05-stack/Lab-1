import { describe, expect, it, vi } from "vitest";
import { createMemoryStore } from "./storage";
import { createTracker } from "./tracker";

function setup(budgetCents: number | null = null) {
  let n = 0;
  const store = createMemoryStore({ budget: { monthlyBudgetCents: budgetCents } });
  const tracker = createTracker(store, { id: () => `id${++n}`, now: () => new Date("2026-11-23T18:00:00Z") });
  return { store, tracker };
}

describe("tracker.addExpense", () => {
  it("S1-AC1: saves a valid expense with its category", () => {
    const { store, tracker } = setup();
    const r = tracker.addExpense({ date: "2026-11-22", amount: "31.20", category: "Transport", note: "Gas" });
    expect(r.ok).toBe(true);
    expect(store.loadExpenses()).toMatchObject([{ date: "2026-11-22", amountCents: 3120, category: "Transport" }]);
    expect(tracker.getState().expenses).toHaveLength(1);
  });

  it("returns field errors and saves nothing for bad input", () => {
    const { store, tracker } = setup();
    const r = tracker.addExpense({ date: "2026-11-22", amount: "", category: "" });
    expect(r).toMatchObject({ ok: false, fieldErrors: { amount: expect.any(String), category: expect.any(String) } });
    expect(store.loadExpenses()).toEqual([]);
  });

  it("S2-AC1 / S2-AC2: $200 budget allows $200, then rejects anything more", () => {
    const { store, tracker } = setup(20000);
    expect(tracker.addExpense({ date: "2026-11-01", amount: "201", category: "Food" })).toMatchObject({
      ok: false,
      budgetError: expect.stringContaining("Enter an amount under budget"),
    });
    expect(tracker.addExpense({ date: "2026-11-01", amount: "200", category: "Food" })).toMatchObject({
      ok: true,
      remainingAfterCents: 0,
    });
    expect(tracker.addExpense({ date: "2026-11-02", amount: "0.01", category: "Food" }).ok).toBe(false);
    expect(store.loadExpenses()).toHaveLength(1);
  });

  it("keeps expenses newest first and notifies subscribers", () => {
    const { tracker } = setup();
    const listener = vi.fn();
    tracker.subscribe(listener);
    tracker.addExpense({ date: "2026-11-01", amount: "1", category: "Food" });
    tracker.addExpense({ date: "2026-11-20", amount: "2", category: "Food" });
    tracker.addExpense({ date: "2026-11-10", amount: "3", category: "Food" });
    expect(tracker.getState().expenses.map((e) => e.date)).toEqual(["2026-11-20", "2026-11-10", "2026-11-01"]);
    expect(listener).toHaveBeenCalledTimes(3);
  });
});

describe("tracker.deleteExpense / setBudget", () => {
  it("deletes an expense, freeing up budget", () => {
    const { tracker } = setup(1000);
    const r = tracker.addExpense({ date: "2026-11-01", amount: "10", category: "Food" });
    if (!r.ok) throw new Error("expected ok");
    tracker.deleteExpense(r.expense.id);
    expect(tracker.getState().expenses).toEqual([]);
    expect(tracker.addExpense({ date: "2026-11-01", amount: "10", category: "Food" }).ok).toBe(true);
  });

  it("sets the budget and rejects bad input", () => {
    const { store, tracker } = setup();
    expect(tracker.setBudget("400")).toEqual({ ok: true, cents: 40000 });
    expect(store.loadBudget()).toEqual({ monthlyBudgetCents: 40000 });
    expect(tracker.setBudget("lots").ok).toBe(false);
    expect(tracker.getState().budgetCents).toBe(40000);
  });

  it("keeps the same state object when nothing changed (needed by useSyncExternalStore)", () => {
    const { tracker } = setup();
    expect(tracker.getState()).toBe(tracker.getState());
  });
});
