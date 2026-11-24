# Student Expense Tracker (v1)

Record expenses, see them grouped by month, and stay inside a monthly budget.
Spec: [`../specs/spec.md`](../specs/spec.md) · Layout: [Mockup A](../design/mockups/mockup-a-budget-dashboard.html)

## Run it

```bash
npm install
npm run dev        # http://localhost:3000
```

## Check it

```bash
npm test           # Vitest: logic + full-screen tests (S1-AC1, S2-AC1..3)
npm run lint
npm run typecheck
npm run build
```

## Where things are

| Path | What it does | Story |
|---|---|---|
| `src/lib/types.ts` | Data model: `Expense`, `Category`, `BudgetSettings` | — |
| `src/lib/expenses.ts` | Check input, build an expense, group by month, totals per category | S1 |
| `src/lib/budget.ts` | What's left, the over-budget check (equal is allowed), red state | S2 |
| `src/lib/storage.ts` | `localStorage` store with memory fallback. **Swap this for the Lab 6 database.** | — |
| `src/lib/tracker.ts` | App state and actions (add, delete, set budget) | S1, S2 |
| `src/hooks/useExpenseTracker.ts` | Connects the tracker to React | — |
| `src/components/` | The main screen (Mockup A) | S1, S2 |

Data is stored only in this browser (`expense-tracker:v1:*` keys). Clearing site data erases it.

## Deploy

On Vercel, set the project's **Root Directory** to `app`. Then run `vercel` from this folder.
