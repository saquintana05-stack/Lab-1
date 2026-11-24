"use client";

import { useState } from "react";
import { formatMoney, formatShortDate } from "@/lib/format";
import type { Expense } from "@/lib/types";
import { Card, CategoryChip } from "./ui";

const INITIAL = 8;

/** S1-AC1: each recorded expense with its date, amount and category. */
export function RecentExpenses({ expenses, onDelete }: { expenses: readonly Expense[]; onDelete(id: string): void }) {
  const [showAll, setShowAll] = useState(false);
  const shown = showAll ? expenses : expenses.slice(0, INITIAL);

  return (
    <Card title="Recent expenses">
      {expenses.length === 0 ? (
        <p className="text-sm text-muted">No expenses yet. Add your first one above.</p>
      ) : (
        <>
          <table className="w-full text-sm">
            <caption className="sr-only">Expenses, newest first</caption>
            <thead className="sr-only">
              <tr>
                <th scope="col">Date</th>
                <th scope="col">Note and category</th>
                <th scope="col">Amount</th>
                <th scope="col">Actions</th>
              </tr>
            </thead>
            <tbody>
              {shown.map((e) => (
                <tr key={e.id} className="border-t border-line">
                  <td className="py-2 pr-2 whitespace-nowrap text-muted">{formatShortDate(e.date)}</td>
                  <td className="py-2 pr-2 break-words">
                    <span className="flex flex-wrap items-center gap-x-2 gap-y-1">
                      {e.note && <span>{e.note}</span>}
                      <CategoryChip>{e.category}</CategoryChip>
                    </span>
                  </td>
                  <td className="py-2 pr-1 text-right whitespace-nowrap tabular-nums">{formatMoney(e.amountCents)}</td>
                  <td className="py-2 text-right">
                    <button
                      type="button"
                      onClick={() => onDelete(e.id)}
                      aria-label={`Delete ${formatMoney(e.amountCents)} ${e.category} expense from ${formatShortDate(e.date)}`}
                      className="rounded px-1.5 text-muted hover:text-err focus-visible:outline-2 focus-visible:outline-accent"
                    >
                      ✕
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {expenses.length > INITIAL && (
            <button
              type="button"
              onClick={() => setShowAll((v) => !v)}
              className="mt-3 text-sm text-accent underline-offset-2 hover:underline"
            >
              {showAll ? "Show fewer" : `Show all ${expenses.length}`}
            </button>
          )}
        </>
      )}
    </Card>
  );
}
