import { formatMoney } from "@/lib/format";
import type { Category } from "@/lib/types";
import { Card } from "./ui";

/** S1-AC1 (shows the category) and S1 (per month). */
export function CategoryBreakdown({ rows }: { rows: { category: Category; cents: number }[] }) {
  const max = rows[0]?.cents ?? 0;
  return (
    <Card title="Where it went this month">
      {rows.length === 0 ? (
        <p className="text-sm text-muted">No spending yet this month.</p>
      ) : (
        <ul className="space-y-2.5">
          {rows.map(({ category, cents }) => (
            <li key={category} className="grid grid-cols-[7rem_1fr_5rem] items-center gap-3 text-sm">
              <span>{category}</span>
              <span className="h-2 overflow-hidden rounded-full bg-track" aria-hidden="true">
                <span
                  className="block h-full rounded-full bg-accent"
                  style={{ width: `${Math.max(2, Math.round((cents / max) * 100))}%` }}
                />
              </span>
              <span className="text-right tabular-nums">{formatMoney(cents)}</span>
            </li>
          ))}
        </ul>
      )}
    </Card>
  );
}
