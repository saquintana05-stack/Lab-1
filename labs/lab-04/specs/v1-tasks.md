# v1 Tasks

The build plan for [spec.md](spec.md), split into tasks of 10 to 30 minutes. Each task names the story and
acceptance criterion it satisfies.

| ID | Criterion |
|---|---|
| **S1-AC1** | Clicking "Add expense" records the date and amount and shows the expense's category |
| **S2-AC1** | An expense that fits is saved, subtracted, and the new remaining budget is shown |
| **S2-AC2** | An expense larger than what's left isn't saved and shows "Enter an amount under budget" (200 ok, 201 not) |
| **S2-AC3** | The budget shows in red when nothing is left |

## Phase 1: Setup
| # | Task | Story / AC | Est. | Status |
|---|---|---|---|---|
| 1 | Scaffold Next.js in `app/` (TS, Tailwind, App Router, ESLint), remove the starter content, check dev and build | Groundwork | 15m | ✅ |
| 2 | Add Vitest + React Testing Library, `npm test`, a placeholder test | Groundwork | 20m | ✅ |

## Phase 2: Expense and budget logic
| # | Task | Story / AC | Est. | Status |
|---|---|---|---|---|
| 3 | Data types: `Expense`, `Category`, `BudgetSettings` | S1-AC1, S2 | 10m | ✅ |
| 4 | `createExpense` checks date, amount (cents) and category, with tests | S1-AC1 | 20m | ✅ |
| 5 | `groupByMonth` + totals per category, with tests | S1, S1-AC1 | 20m | ✅ |
| 6 | `remainingBudget`, `checkBudget`, `isOverBudget` with the 200/201 tests | S2-AC1, S2-AC2, S2-AC3 | 25m | ✅ |
| 7 | Formatting helpers (money, month, today in local time), with tests | S1-AC1, S2-AC1 | 15m | ✅ |

## Phase 3: Saving data and app state
| # | Task | Story / AC | Est. | Status |
|---|---|---|---|---|
| 8 | Storage module (`localStorage`, ignores bad data, memory fallback), with tests | S1-AC1, S2-AC1 | 25m | ✅ |
| 9 | `useExpenseTracker` hook: load, add (check input → budget → save), delete, set budget | S1-AC1, S2-AC1, S2-AC2 | 30m | ✅ |

## Phase 4: Main screen (Mockup A)
| # | Task | Story / AC | Est. | Status |
|---|---|---|---|---|
| 10 | Page layout, works at 375px, light and dark mode | Groundwork | 20m | ✅ |
| 11 | Set-budget form with checking | S2 | 20m | ✅ |
| 12 | Budget summary: "left" amount, progress bar, days left, red at $0 or less | S2-AC1, S2-AC3 | 25m | ✅ |
| 13 | Add Expense form with an error under each field | S1-AC1 | 30m | ✅ |
| 14 | Submit: success message with new budget / over-budget error that keeps the input | S1-AC1, S2-AC1, S2-AC2 | 20m | ✅ |
| 15 | Spending-by-category bars for this month | S1-AC1, S1 | 20m | ✅ |
| 16 | Recent expenses with category label + delete | S1-AC1 | 20m | ✅ |
| 17 | Month summary cards, red when over | S1, S2-AC3 | 20m | ✅ |
| 18 | Empty states | S1, S2 | 10m | ✅ |

## Phase 5: Testing and shipping
| # | Task | Story / AC | Est. | Status |
|---|---|---|---|---|
| 19 | Screen-level tests for every acceptance criterion | S1-AC1, S2-AC1, S2-AC2, S2-AC3 | 30m | ✅ (44 tests pass) |
| 20 | Accessibility + phone check in a real browser | S1-AC1, S2-AC2 | 20m | ✅ |
| 21 | Deploy to Vercel (root directory `app`) | Groundwork | 20m | ⏳ needs `vercel login` |
| 22 | Update spec, write `app/README.md` | Groundwork | 10m | ✅ |
