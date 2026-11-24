// Core expense logic (FR-1). Pure functions, usable in the browser and in Node tests.
(function (root) {
  const CATEGORIES = ["Food", "Transport", "Housing", "School", "Entertainment", "Health", "Other"];

  /**
   * Validate raw form input and build an expense record.
   * Returns { ok: true, expense } or { ok: false, errors: [...] }.
   */
  function createExpense({ date, amount, category, note = "" }, idFn = defaultId) {
    const errors = [];

    if (!/^\d{4}-\d{2}-\d{2}$/.test(String(date || "")) || isNaN(Date.parse(date))) {
      errors.push("Please enter a valid date.");
    }

    const value = Number(amount);
    if (amount === "" || amount === null || amount === undefined || !Number.isFinite(value) || value <= 0) {
      errors.push("Amount must be a number greater than 0.");
    }

    if (!CATEGORIES.includes(category)) {
      errors.push("Please choose a category.");
    }

    if (errors.length) return { ok: false, errors };

    return {
      ok: true,
      expense: {
        id: idFn(),
        date,
        amountCents: Math.round(value * 100),
        category,
        note: String(note).trim(),
      },
    };
  }

  /** "2026-11-23" -> "2026-11" */
  function monthKey(date) {
    return date.slice(0, 7);
  }

  /**
   * Group expenses by month, newest month first.
   * Returns [{ month, totalCents, byCategory: {cat: cents}, expenses: [...] }]
   */
  function groupByMonth(expenses) {
    const groups = new Map();
    for (const e of expenses) {
      const key = monthKey(e.date);
      if (!groups.has(key)) groups.set(key, { month: key, totalCents: 0, byCategory: {}, expenses: [] });
      const g = groups.get(key);
      g.totalCents += e.amountCents;
      g.byCategory[e.category] = (g.byCategory[e.category] || 0) + e.amountCents;
      g.expenses.push(e);
    }
    const result = [...groups.values()].sort((a, b) => b.month.localeCompare(a.month));
    for (const g of result) g.expenses.sort((a, b) => b.date.localeCompare(a.date));
    return result;
  }

  /** Total spent in a given month ("YYYY-MM"). */
  function spentInMonth(expenses, month) {
    return expenses.reduce((sum, e) => (monthKey(e.date) === month ? sum + e.amountCents : sum), 0);
  }

  /** Budget left for a month. Negative means over budget. Null when no budget is set. */
  function remainingBudget(budgetCents, expenses, month) {
    if (budgetCents === null || budgetCents === undefined) return null;
    return budgetCents - spentInMonth(expenses, month);
  }

  /** Budget is "red" once nothing is left (used up or over). */
  function isOverBudget(remainingCents) {
    return remainingCents !== null && remainingCents <= 0;
  }

  /**
   * Check a new expense against the monthly budget.
   * Returns null when it fits, otherwise an error message.
   * An expense equal to what's left is allowed (budget 200, expense 200 = ok; 201 = error).
   */
  function checkBudget(expense, budgetCents, expenses) {
    const left = remainingBudget(budgetCents, expenses, monthKey(expense.date));
    if (left === null || expense.amountCents <= left) return null;
    return `Enter an amount under your budget. You have ${formatMoney(Math.max(left, 0))} left for ${formatMonth(monthKey(expense.date))}.`;
  }

  /** Parse a budget from form input. Returns cents, or null if invalid. */
  function parseBudget(value) {
    const n = Number(value);
    if (value === "" || value === null || value === undefined || !Number.isFinite(n) || n < 0) return null;
    return Math.round(n * 100);
  }

  function formatMoney(cents) {
    return (cents / 100).toLocaleString("en-US", { style: "currency", currency: "USD" });
  }

  function formatMonth(key) {
    const [y, m] = key.split("-").map(Number);
    return new Date(y, m - 1, 1).toLocaleString("en-US", { month: "long", year: "numeric" });
  }

  function defaultId() {
    return Date.now().toString(36) + Math.random().toString(36).slice(2, 8);
  }

  const api = {
    CATEGORIES,
    createExpense,
    monthKey,
    groupByMonth,
    spentInMonth,
    remainingBudget,
    isOverBudget,
    checkBudget,
    parseBudget,
    formatMoney,
    formatMonth,
  };

  if (typeof module !== "undefined" && module.exports) module.exports = api;
  else root.Expenses = api;
})(typeof window !== "undefined" ? window : globalThis);
