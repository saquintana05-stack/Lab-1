import { describe, expect, it } from "vitest";
import { checkBudget, isOverBudget, parseBudget, remainingBudget } from "./budget";
import type { Expense } from "./types";

const list: Expense[] = [
  { id: "a", date: "2026-11-02", amountCents: 5000, category: "Food", note: "", createdAt: "2026-11-02T00:00:00Z" },
  { id: "b", date: "2026-10-30", amountCents: 9900, category: "Food", note: "", createdAt: "2026-10-30T00:00:00Z" },
];

describe("remainingBudget (S2-AC1)", () => {
  it("subtracts only that month's expenses", () => {
    expect(remainingBudget(20000, list, "2026-11")).toBe(15000);
    expect(remainingBudget(20000, list, "2026-10")).toBe(10100);
    expect(remainingBudget(20000, list, "2026-12")).toBe(20000);
  });

  it("is null when no budget is set", () => {
    expect(remainingBudget(null, list, "2026-11")).toBeNull();
  });
});

describe("checkBudget (S2-AC1, S2-AC2)", () => {
  it("budget $200: $200 is allowed, $201 is rejected", () => {
    expect(checkBudget({ date: "2026-12-01", amountCents: 20000 }, 20000, list)).toEqual({
      ok: true,
      remainingAfterCents: 0,
    });
    const r = checkBudget({ date: "2026-12-01", amountCents: 20100 }, 20000, list);
    expect(r.ok).toBe(false);
    if (!r.ok) expect(r.message).toBe("Enter an amount under budget. You have $200.00 left for December 2026.");
  });

  it("checks against what's left, and returns the new remaining amount", () => {
    expect(checkBudget({ date: "2026-11-10", amountCents: 15000 }, 20000, list)).toEqual({
      ok: true,
      remainingAfterCents: 0,
    });
    expect(checkBudget({ date: "2026-11-10", amountCents: 1250 }, 20000, list)).toEqual({
      ok: true,
      remainingAfterCents: 13750,
    });
    expect(checkBudget({ date: "2026-11-10", amountCents: 15001 }, 20000, list).ok).toBe(false);
  });

  it("never shows a negative 'left' in the error", () => {
    const r = checkBudget({ date: "2026-11-10", amountCents: 100 }, 4000, list);
    expect(r.ok).toBe(false);
    if (!r.ok) expect(r.remainingCents).toBe(0);
  });

  it("does not limit anything when no budget is set", () => {
    expect(checkBudget({ date: "2026-11-10", amountCents: 99_999_999 }, null, list).ok).toBe(true);
  });
});

describe("isOverBudget (S2-AC3)", () => {
  it("is red at $0 or below", () => {
    expect(isOverBudget(1)).toBe(false);
    expect(isOverBudget(0)).toBe(true);
    expect(isOverBudget(-1)).toBe(true);
    expect(isOverBudget(null)).toBe(false);
  });
});

describe("parseBudget", () => {
  it("accepts 0 and normal amounts, rejects the rest", () => {
    expect(parseBudget("400")).toEqual({ ok: true, cents: 40000 });
    expect(parseBudget("250.5")).toEqual({ ok: true, cents: 25050 });
    expect(parseBudget("0")).toEqual({ ok: true, cents: 0 });
    expect(parseBudget("").ok).toBe(false);
    expect(parseBudget("-5").ok).toBe(false);
  });
});
