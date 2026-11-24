# Add Expense Flow (with budget)

```mermaid
flowchart TD
  A[Student clicks "Add Expense"] --> B{Any amount?}
  B -- No --> C[Over set budget: Budget turns red]
  B --> Yes --> D[Expense is subtracted from budget]
  D --> E[Click Add Expense]
  E --> F[Enter amount]
  F --> G{Valid amount?}
  G -- No --> H[Error: Enter an amount under budget, i.e. if budget is 200 don't put expense of 201] --> F
  G -- Yes --> I[Save expense] --> J[New budget is shown after expense is added]
```

## Implementation notes
- The budget is a single monthly amount set by the student. Each month starts fresh.
- An expense is checked against what's left in the month of its date.
  An amount equal to what's left is allowed (budget 200 → 200 ok, 201 rejected).
- When nothing is left (or the budget is lowered below spending), the budget shows in red.
- With no budget set, expenses aren't limited.
- After saving, the confirmation message shows the new remaining budget.
