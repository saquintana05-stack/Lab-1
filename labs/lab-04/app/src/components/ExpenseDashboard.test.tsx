import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it } from "vitest";
import { createMemoryStore } from "@/lib/storage";
import { createTracker } from "@/lib/tracker";
import type { Expense } from "@/lib/types";
import { ExpenseDashboard } from "./ExpenseDashboard";

const NOW = new Date(2026, 10, 23, 12, 0); // Mon Nov 23 2026, local time

function renderDashboard(opts: { budgetCents?: number | null; expenses?: Expense[] } = {}) {
  let n = 0;
  const store = createMemoryStore({
    expenses: opts.expenses,
    budget: { monthlyBudgetCents: opts.budgetCents ?? null },
  });
  const tracker = createTracker(store, { id: () => `id${++n}`, now: () => NOW });
  const user = userEvent.setup();
  render(<ExpenseDashboard tracker={tracker} now={NOW} />);
  return { user, store };
}

async function addExpense(
  user: ReturnType<typeof userEvent.setup>,
  { amount, category, note = "", date }: { amount: string; category: string; note?: string; date?: string },
) {
  await user.clear(screen.getByLabelText("Amount ($)"));
  await user.type(screen.getByLabelText("Amount ($)"), amount);
  if (date) {
    await user.clear(screen.getByLabelText("Date"));
    await user.type(screen.getByLabelText("Date"), date);
  }
  await user.selectOptions(screen.getByLabelText("Category"), category);
  if (note) await user.type(screen.getByLabelText("Note (optional)"), note);
  await user.click(screen.getByRole("button", { name: "Add expense" }));
}

const status = () => screen.getByRole("status");

describe("S1-AC1: clicking Add expense records the date and amount and shows the category", () => {
  it("records the expense and shows it with its category", async () => {
    const { user, store } = renderDashboard();
    expect(screen.getByLabelText("Date")).toHaveValue("2026-11-23");

    await addExpense(user, { amount: "31.20", category: "Transport", note: "Gas – Shell", date: "2026-11-22" });

    expect(status()).toHaveTextContent("Recorded $31.20 on Nov 22 under Transport.");
    expect(store.loadExpenses()).toMatchObject([{ date: "2026-11-22", amountCents: 3120, category: "Transport" }]);

    const row = screen.getByRole("row", { name: /Gas – Shell/ });
    expect(within(row).getByText("Transport")).toBeInTheDocument();
    expect(within(row).getByText("$31.20")).toBeInTheDocument();
    expect(within(row).getByText("Nov 22")).toBeInTheDocument();

    // Form resets for the next entry, but keeps the date.
    expect(screen.getByLabelText("Amount ($)")).toHaveValue("");
    expect(screen.getByLabelText("Category")).toHaveValue("");
    expect(screen.getByLabelText("Date")).toHaveValue("2026-11-22");
  });

  it("shows field errors and records nothing when input is missing", async () => {
    const { user, store } = renderDashboard();
    await user.click(screen.getByRole("button", { name: "Add expense" }));

    expect(screen.getByLabelText("Amount ($)")).toHaveAttribute("aria-invalid", "true");
    expect(screen.getByText(/Enter an amount greater than \$0/)).toBeInTheDocument();
    expect(screen.getByText("Choose a category.")).toBeInTheDocument();
    expect(store.loadExpenses()).toEqual([]);
  });

  it("shows the empty states before anything is added", () => {
    renderDashboard();
    expect(screen.getByText("No expenses yet. Add your first one above.")).toBeInTheDocument();
    expect(screen.getByText("No spending yet this month.")).toBeInTheDocument();
    expect(screen.getByText(/Set a monthly budget/)).toBeInTheDocument();
  });
});

describe("S2: monthly budget", () => {
  it("S2-AC1: subtracts the expense and shows the new remaining budget", async () => {
    const { user } = renderDashboard({ budgetCents: 40000 });
    expect(screen.getByTestId("budget-summary")).toHaveTextContent("$400.00");

    await addExpense(user, { amount: "12.50", category: "Food" });

    expect(status()).toHaveTextContent("New budget: $387.50 left.");
    expect(screen.getByTestId("budget-summary")).toHaveTextContent("$387.50");
    expect(screen.getByTestId("budget-summary")).toHaveTextContent("$12.50 spent of $400.00 budget");
  });

  it("S2-AC2: with a $200 budget, $201 is rejected and $200 is accepted", async () => {
    const { user, store } = renderDashboard({ budgetCents: 20000 });

    await addExpense(user, { amount: "201", category: "Food" });
    expect(status()).toHaveTextContent("Enter an amount under budget. You have $200.00 left for November 2026.");
    expect(store.loadExpenses()).toEqual([]);
    // The typed amount stays so the student can fix it.
    expect(screen.getByLabelText("Amount ($)")).toHaveValue("201");

    await addExpense(user, { amount: "200", category: "Food" });
    expect(status()).toHaveTextContent("Recorded $200.00 on Nov 23 under Food. New budget: $0.00 left.");
    expect(store.loadExpenses()).toHaveLength(1);
  });

  it("S2-AC3: the budget turns red when nothing is left", async () => {
    const { user } = renderDashboard({ budgetCents: 5000 });
    const summary = screen.getByTestId("budget-summary");
    expect(summary).toHaveAttribute("data-over", "false");

    await addExpense(user, { amount: "50", category: "School" });

    expect(summary).toHaveAttribute("data-over", "true");
    expect(summary).toHaveTextContent("Budget used up");
  });

  it("lets the student set and change the budget", async () => {
    const { user, store } = renderDashboard();
    await user.type(screen.getByLabelText("Monthly budget ($)"), "400");
    await user.click(screen.getByRole("button", { name: "Save budget" }));
    expect(store.loadBudget()).toEqual({ monthlyBudgetCents: 40000 });
    expect(screen.getByTestId("budget-summary")).toHaveTextContent("$400.00");

    await user.click(screen.getByRole("button", { name: "Change budget" }));
    const input = screen.getByLabelText("Monthly budget ($)");
    await user.clear(input);
    await user.type(input, "350");
    await user.click(screen.getByRole("button", { name: "Save budget" }));
    expect(store.loadBudget()).toEqual({ monthlyBudgetCents: 35000 });
  });

  it("shows past months that went over budget in red, and deleting frees up budget", async () => {
    const expenses: Expense[] = [
      { id: "s1", date: "2026-09-10", amountCents: 41230, category: "Housing", note: "", createdAt: "2026-09-10T00:00:00Z" },
      { id: "n1", date: "2026-11-02", amountCents: 1000, category: "Food", note: "Chipotle", createdAt: "2026-11-02T00:00:00Z" },
    ];
    const { user } = renderDashboard({ budgetCents: 40000, expenses });

    const sept = screen.getByText("September 2026").closest("li")!;
    expect(sept).toHaveAttribute("data-over", "true");
    expect(sept).toHaveTextContent("over by $12.30");

    expect(screen.getByTestId("budget-summary")).toHaveTextContent("$390.00");
    await user.click(screen.getByRole("button", { name: "Delete $10.00 Food expense from Nov 2" }));
    expect(screen.getByTestId("budget-summary")).toHaveTextContent("$400.00");
  });
});
