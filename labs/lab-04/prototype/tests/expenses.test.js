// S1 (FR-1) acceptance tests. Run with: node --test
const test = require("node:test");
const assert = require("node:assert/strict");
const { createExpense, groupByMonth, CATEGORIES } = require("../src/expenses.js");

const fixedId = () => "id1";

test("records date, amount, and category for a valid expense", () => {
  const r = createExpense({ date: "2026-11-23", amount: "12.50", category: "Food" }, fixedId);
  assert.equal(r.ok, true);
  assert.deepEqual(r.expense, { id: "id1", date: "2026-11-23", amountCents: 1250, category: "Food", note: "" });
});

test("rejects missing date, non-positive amount, and unknown category", () => {
  const r = createExpense({ date: "", amount: "0", category: "Yachts" });
  assert.equal(r.ok, false);
  assert.equal(r.errors.length, 3);
});

test("rejects an empty amount", () => {
  const r = createExpense({ date: "2026-11-23", amount: "", category: "Food" });
  assert.equal(r.ok, false);
});

test("every built-in category is accepted", () => {
  for (const c of CATEGORIES) {
    assert.equal(createExpense({ date: "2026-01-01", amount: 1, category: c }).ok, true);
  }
});

test("groups expenses per month with totals and category breakdown", () => {
  const exps = [
    { id: "a", date: "2026-10-05", amountCents: 1000, category: "Food" },
    { id: "b", date: "2026-11-02", amountCents: 500, category: "Food" },
    { id: "c", date: "2026-11-20", amountCents: 2500, category: "School" },
    { id: "d", date: "2026-11-21", amountCents: 300, category: "Food" },
  ];
  const groups = groupByMonth(exps);
  assert.deepEqual(groups.map((g) => g.month), ["2026-11", "2026-10"]);
  assert.equal(groups[0].totalCents, 3300);
  assert.deepEqual(groups[0].byCategory, { Food: 800, School: 2500 });
  assert.deepEqual(groups[0].expenses.map((e) => e.id), ["d", "c", "b"]);
});

// Add-expense budget flow (specs/add-expense-flow.md)
const { remainingBudget, isOverBudget, checkBudget, parseBudget } = require("../src/expenses.js");

const nov = [
  { id: "a", date: "2026-11-02", amountCents: 5000, category: "Food" },
  { id: "b", date: "2026-10-30", amountCents: 9900, category: "Food" },
];
const exp = (date, amountCents) => ({ id: "n", date, amountCents, category: "Food" });

test("expense is subtracted from that month's budget only", () => {
  assert.equal(remainingBudget(20000, nov, "2026-11"), 15000);
  assert.equal(remainingBudget(20000, nov, "2026-10"), 10100);
  assert.equal(remainingBudget(null, nov, "2026-11"), null);
});

test("budget 200: expense of 200 is allowed, 201 is rejected", () => {
  assert.equal(checkBudget(exp("2026-12-01", 20000), 20000, nov), null);
  assert.match(checkBudget(exp("2026-12-01", 20100), 20000, nov), /under your budget/);
});

test("rejects an expense larger than what is left this month", () => {
  assert.match(checkBudget(exp("2026-11-10", 15001), 20000, nov), /\$150\.00 left/);
  assert.equal(checkBudget(exp("2026-11-10", 15000), 20000, nov), null);
});

test("no budget set means no limit", () => {
  assert.equal(checkBudget(exp("2026-11-10", 999999), null, nov), null);
});

test("budget turns red when nothing is left", () => {
  assert.equal(isOverBudget(100), false);
  assert.equal(isOverBudget(0), true);
  assert.equal(isOverBudget(-1), true);
  assert.equal(isOverBudget(null), false);
});

test("parses budget input", () => {
  assert.equal(parseBudget("200"), 20000);
  assert.equal(parseBudget("0"), 0);
  assert.equal(parseBudget(""), null);
  assert.equal(parseBudget("-5"), null);
});
