import { describe, expect, it } from "vitest";
import {
  categoryBreakdown,
  createExpense,
  groupByMonth,
  isValidISODate,
  parseAmountToCents,
} from "./expenses";
import { CATEGORIES, type Expense } from "./types";

const deps = { id: () => "id1", now: () => new Date("2026-11-23T18:00:00Z") };

function exp(id: string, date: string, amountCents: number, category: Expense["category"] = "Food"): Expense {
  return { id, date, amountCents, category, note: "", createdAt: `${date}T12:00:00.000Z` };
}

describe("createExpense (S1-AC1)", () => {
  it("records the date, amount and category", () => {
    const r = createExpense({ date: "2026-11-23", amount: "12.50", category: "Food", note: " lunch " }, deps);
    expect(r).toEqual({
      ok: true,
      expense: {
        id: "id1",
        date: "2026-11-23",
        amountCents: 1250,
        category: "Food",
        note: "lunch",
        createdAt: "2026-11-23T18:00:00.000Z",
      },
    });
  });

  it("accepts every category", () => {
    for (const category of CATEGORIES) {
      expect(createExpense({ date: "2026-01-01", amount: "1", category }, deps).ok).toBe(true);
    }
  });

  it("reports an error for each bad field", () => {
    const r = createExpense({ date: "", amount: "0", category: "Yachts", note: "x".repeat(81) }, deps);
    expect(r.ok).toBe(false);
    if (!r.ok) expect(Object.keys(r.errors).sort()).toEqual(["amount", "category", "date", "note"]);
  });

  it.each(["", "abc", "-5", "1.234", "0.00"])("rejects amount %j", (amount) => {
    const r = createExpense({ date: "2026-11-23", amount, category: "Food" }, deps);
    expect(r.ok).toBe(false);
  });
});

describe("parsing", () => {
  it("parses amounts into whole cents without float errors", () => {
    expect(parseAmountToCents("0.1")).toBe(10);
    expect(parseAmountToCents("19.99")).toBe(1999);
    expect(parseAmountToCents(" 7 ")).toBe(700);
    expect(parseAmountToCents("1.005")).toBeNull();
  });

  it("rejects impossible dates", () => {
    expect(isValidISODate("2026-02-28")).toBe(true);
    expect(isValidISODate("2026-02-30")).toBe(false);
    expect(isValidISODate("2026-13-01")).toBe(false);
    expect(isValidISODate("11/23/2026")).toBe(false);
  });
});

describe("groupByMonth (S1: per month)", () => {
  const list = [
    exp("a", "2026-10-05", 1000),
    exp("b", "2026-11-02", 500),
    exp("c", "2026-11-20", 2500, "School"),
    exp("d", "2026-11-21", 300),
  ];

  it("groups newest month first, with totals and a category breakdown", () => {
    const groups = groupByMonth(list);
    expect(groups.map((g) => g.month)).toEqual(["2026-11", "2026-10"]);
    expect(groups[0].totalCents).toBe(3300);
    expect(groups[0].byCategory).toEqual({ Food: 800, School: 2500 });
    expect(groups[0].expenses.map((e) => e.id)).toEqual(["d", "c", "b"]);
  });

  it("breaks one month down by category, biggest first", () => {
    expect(categoryBreakdown(list, "2026-11")).toEqual([
      { category: "School", cents: 2500 },
      { category: "Food", cents: 800 },
    ]);
    expect(categoryBreakdown(list, "2026-09")).toEqual([]);
  });
});
