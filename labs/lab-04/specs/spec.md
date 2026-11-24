# Student Expense Tracker v1, spec

## Intent
For college students who are living on a tight, fixed amount of money each month (loans,
part-time job, parents) and want to stop running out before the month ends. The job is simple:
record each expense with its date, amount and category, see spending grouped by month, and know
at any moment how much of the monthly budget is left, with the app refusing an expense that would
push the student past it. Background: [discovery/requirements.md](../discovery/requirements.md)
*(file not in the repo yet; see Open questions)*.

## Stories and acceptance criteria
Source: [specs/user-stories.md](user-stories.md).

### S1 (FR-1): Record an expense
As a **student**, I want **to keep track of expenses per month**
so that **I can track my spending and hopefully save money**.

- WHEN the student clicks "Add expense" on the Add Expense button THE SYSTEM SHALL record the
  date and amount and show the category it falls under.

### S2 (FR-2): Stay within a monthly budget *(drafted from [add-expense-flow.md](add-expense-flow.md), not yet in user-stories.md)*
As a **student**, I want **to set a monthly budget and see what's left after each expense**
so that **I don't spend more than I have**.

- WHEN the student adds an expense that fits within what's left this month THE SYSTEM SHALL save it,
  subtract it from the budget and show the new remaining budget.
- WHEN the student adds an expense larger than what's left THE SYSTEM SHALL not save it and SHALL show
  "Enter an amount under budget" (budget $200: $200 is allowed, $201 is rejected).
- WHEN nothing is left in this month's budget THE SYSTEM SHALL show the budget in red.

### S3
*Not written yet.* user-stories.md only contains S1.

## Screens and flow
- Flow: [design/flow.md](../design/flow.md) *(file not in the repo yet; the current flow lives in
  [specs/add-expense-flow.md](add-expense-flow.md))*.
- Chosen mockup: **proposed, not yet confirmed:**
  [Mockup A, budget-first dashboard](../design/mockups/mockup-a-budget-dashboard.html). It fits S2
  best because "how much is left" is the biggest thing on the screen.
- Main screen (one page): remaining budget for the current month with a progress bar, an Add Expense
  form (amount, date, category, optional note) next to it, spending by category, recent expenses, and
  one summary card per past month.
- Flow: enter the expense → click **Add expense** → check it → check it against the budget →
  either save it and show "Recorded $X under Category. New budget: $Y left", or show the error and
  keep the form filled in.

## Data
v1 keeps everything in the browser (`localStorage`). A real database comes in Lab 6.

**Expense**
| Field | Type | Notes |
|---|---|---|
| `id` | string | Generated on the client |
| `date` | string `YYYY-MM-DD` | The day the money was spent; its month is the first 7 characters |
| `amountCents` | integer > 0 | Stored in cents so totals don't pick up rounding errors |
| `category` | enum | Food, Transport, Housing, School, Entertainment, Health, Other |
| `note` | string, ≤ 80 chars | Optional |
| `createdAt` | ISO timestamp | When the expense was entered |

**Budget settings**
| Field | Type | Notes |
|---|---|---|
| `monthlyBudgetCents` | integer ≥ 0, or null | One amount that applies to every month; null means no budget is set |

Worked out on the fly, never stored: the total for each month, totals by category, and what's left
(`monthlyBudgetCents − that month's total`).

## Decisions already made
- Stack: Next.js (TypeScript) with Tailwind, deployed to Vercel.
- **Browser storage for v1**: no accounts or server needed yet. The storage code sits behind a small
  module so Lab 6 can swap in a database without touching the screens.
- **Money in integer cents**: avoids rounding errors like 0.1 + 0.2.
- **One budget amount for every month, starting fresh each month**: simplest model that matches
  the flowchart; leftover money doesn't carry over.
- **Over-budget expenses are blocked, not just warned about**: the flowchart sends an invalid amount
  back to "Enter amount" with an error.
- **An expense exactly equal to what's left is allowed**: matches the flowchart's "200 budget, not 201" example.
- **The student picks the category from a fixed list**: predictable and easy to test; it satisfies
  "show the category it falls under" by showing the chosen category in the confirmation and the list.
- **The budget logic is kept apart from the screens**: the rules (check the input, group by month,
  work out what's left, check the budget) live in `app/src/lib/` and are tested without a browser.
  They were ported from the plain JS prototype, now kept for reference in `prototype/`.
- **Main screen follows Mockup A** (`app/src/components/`). The open questions below used the defaults
  in this spec for v1.
- **Amounts are typed as text and checked by the app** (not `<input type="number">`), so "1e3" or
  "12.345" are rejected with a clear message instead of being silently changed by the browser.
- **"Today" is read in the student's browser, not on the server**, so dates use their own time zone.
  (Next.js 16 also refuses to build if the page reads the clock while prerendering.)
- **Tests**: Vitest + React Testing Library. Each acceptance criterion has a screen-level test in
  `app/src/components/ExpenseDashboard.test.tsx`.

## Considered and rejected
- **Mockup B (phone, one-line quick entry with a guessed category)**: fast to use, but guessing the
  category from text is fragile, and a small budget badge doesn't fit S2's focus on the budget.
- **Mockup C (calendar plus step-by-step pop-up)**: good for reviewing the month, but adding one
  expense takes three steps, which slows down the main task.
- **Warning instead of blocking when over budget**: rejected because the flowchart treats it as an error.
- **A different budget per month**: more flexible, but adds screens and data for little v1 value.
- **A database in v1**: deferred to Lab 6, as the assignment says.
- **Keeping the plain HTML/JS prototype as the product**: rejected in favour of the required Next.js stack.

## Out of scope for v1
*Proposed. requirements.md, which would hold the MVP scope, isn't in the repo yet.*
- Accounts, login, and syncing across devices
- Importing transactions from a bank or card
- Receipt photos
- Recurring expenses (rent, subscriptions)
- Editing an expense (v1 has add and delete only)
- Income tracking, savings goals, carrying unused budget into the next month
- Currencies other than USD
- Charts beyond the spending-by-category breakdown

## Open questions
1. `discovery/requirements.md` and `design/flow.md` don't exist yet. Do they need to be written, or
   do they live somewhere else?
2. Which mockup is final? A is proposed above.
3. What is S3? Should S2 above be added to user-stories.md as written?
4. The flowchart has a "Over set budget: budget turns red" branch, but over-budget expenses are blocked.
   Is "red" meant for "budget used up" (the current reading), or should students be able to go over with a warning?
5. If the student lowers the budget mid-month below what they've already spent, show it as over (red), or refuse the change?
6. Should past months use the budget that applied at the time, or the current one? (v1 stores only the current one.)
7. Should the category be suggested automatically from the note, which is another reading of S1's "show the category it falls under"?
