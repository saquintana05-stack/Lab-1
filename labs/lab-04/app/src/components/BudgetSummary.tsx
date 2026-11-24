"use client";

import { useState } from "react";
import { isOverBudget } from "@/lib/budget";
import { formatMoney, formatMonth } from "@/lib/format";
import type { SetBudgetResult } from "@/lib/tracker";
import { BudgetForm } from "./BudgetForm";

interface Props {
  month: string;
  budgetCents: number | null;
  spentCents: number;
  daysLeft: number;
  onSetBudget(input: string): SetBudgetResult;
}

/** S2-AC1 (what's left after each expense) and S2-AC3 (red when nothing is left). */
export function BudgetSummary({ month, budgetCents, spentCents, daysLeft, onSetBudget }: Props) {
  const [editing, setEditing] = useState(false);
  const label = `Left to spend · ${formatMonth(month)}`;

  if (budgetCents === null) {
    return (
      <div>
        <p className="text-xs font-medium tracking-wide text-muted uppercase">{label}</p>
        <p className="mt-1 mb-4 text-lg">
          Set a monthly budget to see how much you have left. You&apos;ve spent{" "}
          <strong>{formatMoney(spentCents)}</strong> so far this month.
        </p>
        <BudgetForm initialCents={null} onSave={onSetBudget} />
      </div>
    );
  }

  const left = budgetCents - spentCents;
  const over = isOverBudget(left);
  const pct = budgetCents === 0 ? 100 : Math.min(100, Math.round((spentCents / budgetCents) * 100));
  const perDay = left > 0 ? Math.floor(left / daysLeft) : 0;

  return (
    <div data-testid="budget-summary" data-over={over}>
      <p className="text-xs font-medium tracking-wide text-muted uppercase">{label}</p>
      <p
        className={`mt-1 text-5xl leading-tight font-bold tabular-nums ${over ? "text-err" : "text-ok"}`}
      >
        {formatMoney(Math.max(left, 0))}
        {over && <span className="sr-only"> left. You are out of budget.</span>}
      </p>
      {over && (
        <p className="mt-1 font-semibold text-err">
          {left < 0 ? `Over budget by ${formatMoney(-left)}` : "Budget used up"}
        </p>
      )}

      <div
        role="progressbar"
        aria-label="Budget used"
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuenow={pct}
        className="mt-4 mb-2 h-3.5 overflow-hidden rounded-full bg-track"
      >
        <div className={`h-full rounded-full ${over ? "bg-err" : "bg-accent"}`} style={{ width: `${pct}%` }} />
      </div>

      <p className="text-sm text-muted">
        {formatMoney(spentCents)} spent of {formatMoney(budgetCents)} budget · {daysLeft}{" "}
        {daysLeft === 1 ? "day" : "days"} left
        {perDay > 0 && (
          <>
            {" "}
            · about <strong className="text-text">{formatMoney(perDay)}/day</strong>
          </>
        )}
      </p>

      {editing ? (
        <div className="mt-4">
          <BudgetForm initialCents={budgetCents} onSave={onSetBudget} onDone={() => setEditing(false)} />
        </div>
      ) : (
        <button
          type="button"
          onClick={() => setEditing(true)}
          className="mt-3 text-sm text-accent underline-offset-2 hover:underline"
        >
          Change budget
        </button>
      )}
    </div>
  );
}
