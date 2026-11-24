"use client";

import { useMemo, useState } from "react";
import { useExpenseTracker } from "@/hooks/useExpenseTracker";
import { spentInMonth } from "@/lib/budget";
import { categoryBreakdown, groupByMonth } from "@/lib/expenses";
import { daysLeftInMonth, monthKey, todayISO } from "@/lib/format";
import type { Tracker, TrackerState } from "@/lib/tracker";
import { AddExpenseForm } from "./AddExpenseForm";
import { BudgetSummary } from "./BudgetSummary";
import { CategoryBreakdown } from "./CategoryBreakdown";
import { MonthCards } from "./MonthCards";
import { RecentExpenses } from "./RecentExpenses";

interface Props {
  /** For tests: inject a tracker and a fixed "now". */
  tracker?: Tracker;
  now?: Date;
}

/** Main screen, laid out after design/mockups/mockup-a-budget-dashboard.html. */
export function ExpenseDashboard({ tracker, now }: Props) {
  const data = useExpenseTracker(tracker);

  return (
    <main className="mx-auto w-full max-w-5xl px-4 pt-6 pb-12">
      <h1 className="mb-5 text-2xl font-bold">Student Expense Tracker</h1>
      {data ? (
        <LoadedDashboard data={data} fixedNow={now} />
      ) : (
        <p className="text-muted" aria-busy="true">
          Loading your expenses…
        </p>
      )}
    </main>
  );
}

/**
 * Only rendered in the browser, once saved data is read. Reading the clock here
 * (not during server prerendering) keeps "today" in the student's own time zone.
 */
function LoadedDashboard({ data, fixedNow }: { data: TrackerState & { actions: Tracker }; fixedNow?: Date }) {
  const [now] = useState(() => fixedNow ?? new Date());
  const today = todayISO(now);
  const month = monthKey(today);
  const { expenses, budgetCents, actions } = data;

  const months = useMemo(() => groupByMonth(expenses), [expenses]);
  const breakdown = useMemo(() => categoryBreakdown(expenses, month), [expenses, month]);

  return (
    <div className="space-y-5">
      <section className="grid gap-6 rounded-2xl border border-line bg-surface p-5 md:grid-cols-[1.3fr_1fr] md:p-6">
        <BudgetSummary
          month={month}
          budgetCents={budgetCents}
          spentCents={spentInMonth(expenses, month)}
          daysLeft={daysLeftInMonth(now)}
          onSetBudget={actions.setBudget}
        />
        <div className="border-t border-line pt-5 md:border-t-0 md:border-l md:pt-0 md:pl-6">
          <AddExpenseForm today={today} onAdd={actions.addExpense} />
        </div>
      </section>

      <div className="grid gap-5 md:grid-cols-[1fr_1.4fr]">
        <CategoryBreakdown rows={breakdown} />
        <RecentExpenses expenses={expenses} onDelete={actions.deleteExpense} />
      </div>

      <MonthCards months={months} budgetCents={budgetCents} />
    </div>
  );
}
