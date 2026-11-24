import { isOverBudget } from "@/lib/budget";
import type { MonthSummary } from "@/lib/expenses";
import { formatMoney, formatMonth } from "@/lib/format";

/** S1 (per month) and S2-AC3 (months with nothing left show red). */
export function MonthCards({ months, budgetCents }: { months: MonthSummary[]; budgetCents: number | null }) {
  if (months.length === 0) return null;
  return (
    <section aria-labelledby="months-heading">
      <h2 id="months-heading" className="mb-3 text-base font-semibold">
        By month
      </h2>
      <ul className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {months.map((m) => {
          const left = budgetCents === null ? null : budgetCents - m.totalCents;
          const over = isOverBudget(left);
          return (
            <li
              key={m.month}
              data-over={over}
              className={`rounded-xl border bg-surface px-4 py-3 text-sm ${over ? "border-err" : "border-line"}`}
            >
              <span className="text-muted">{formatMonth(m.month)}</span>
              <strong className={`block text-lg tabular-nums ${over ? "text-err" : ""}`}>
                {formatMoney(m.totalCents)}
              </strong>
              {left !== null && budgetCents !== null && (
                <span className={over ? "font-medium text-err" : "text-muted"}>
                  {left < 0
                    ? `over by ${formatMoney(-left)}`
                    : left === 0
                      ? `used all ${formatMoney(budgetCents)}`
                      : `of ${formatMoney(budgetCents)}`}
                </span>
              )}
            </li>
          );
        })}
      </ul>
    </section>
  );
}
