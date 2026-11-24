// UI wiring for the expense tracker.
(function () {
  const {
    CATEGORIES, createExpense, groupByMonth, monthKey, remainingBudget, isOverBudget,
    checkBudget, parseBudget, formatMoney, formatMonth,
  } = window.Expenses;
  const STORAGE_KEY = "student-expenses";
  const BUDGET_KEY = "student-budget";

  const budgetForm = document.getElementById("budget-form");
  const budgetInput = document.getElementById("budget");
  const budgetStatus = document.getElementById("budget-status");

  const form = document.getElementById("expense-form");
  const dateInput = document.getElementById("date");
  const amountInput = document.getElementById("amount");
  const categorySelect = document.getElementById("category");
  const noteInput = document.getElementById("note");
  const message = document.getElementById("message");
  const monthsEl = document.getElementById("months");

  let expenses = load();
  let budgetCents = loadBudget();
  if (budgetCents !== null) budgetInput.value = (budgetCents / 100).toFixed(2);

  budgetForm.addEventListener("submit", (event) => {
    event.preventDefault();
    const parsed = parseBudget(budgetInput.value);
    if (parsed === null) {
      showMessage("Budget must be a number 0 or greater.", "error");
      return;
    }
    budgetCents = parsed;
    try { localStorage.setItem(BUDGET_KEY, String(budgetCents)); } catch { /* ignore */ }
    render();
    showMessage(`Monthly budget set to ${formatMoney(budgetCents)}.`, "success");
  });

  // Populate categories and default date to today.
  for (const c of CATEGORIES) {
    const opt = document.createElement("option");
    opt.value = c;
    opt.textContent = c;
    categorySelect.appendChild(opt);
  }
  dateInput.value = todayISO();

  form.addEventListener("submit", (event) => {
    event.preventDefault();
    const result = createExpense({
      date: dateInput.value,
      amount: amountInput.value,
      category: categorySelect.value,
      note: noteInput.value,
    });

    if (!result.ok) {
      showMessage(result.errors.join(" "), "error");
      return;
    }

    const e = result.expense;
    const budgetError = checkBudget(e, budgetCents, expenses);
    if (budgetError) {
      showMessage(budgetError, "error");
      amountInput.focus();
      return;
    }

    expenses.push(e);
    save();
    render();
    const left = remainingBudget(budgetCents, expenses, monthKey(e.date));
    const budgetNote = left === null ? "" : ` New budget for ${formatMonth(monthKey(e.date))}: ${formatMoney(left)} left.`;
    showMessage(`Recorded ${formatMoney(e.amountCents)} on ${e.date} under ${e.category}.${budgetNote}`, "success");

    amountInput.value = "";
    noteInput.value = "";
    amountInput.focus();
  });

  monthsEl.addEventListener("click", (event) => {
    const btn = event.target.closest("button[data-delete]");
    if (!btn) return;
    expenses = expenses.filter((e) => e.id !== btn.dataset.delete);
    save();
    render();
  });

  function renderBudget() {
    const month = monthKey(todayISO());
    const left = remainingBudget(budgetCents, expenses, month);
    if (left === null) {
      budgetStatus.textContent = "No budget set. Set one to track what's left each month.";
      budgetStatus.className = "budget-status";
      return;
    }
    const over = isOverBudget(left);
    budgetStatus.className = `budget-status${over ? " over" : ""}`;
    budgetStatus.innerHTML = over
      ? `${formatMonth(month)}: <strong>${left < 0 ? `Over budget by ${formatMoney(-left)}` : "Budget used up ($0.00 left)"}</strong> of ${formatMoney(budgetCents)}`
      : `${formatMonth(month)}: <strong>${formatMoney(left)}</strong> left of ${formatMoney(budgetCents)}`;
  }

  function render() {
    renderBudget();
    monthsEl.innerHTML = "";
    const groups = groupByMonth(expenses);
    if (!groups.length) {
      monthsEl.innerHTML = '<p class="empty">No expenses yet. Add your first one above.</p>';
      return;
    }
    for (const g of groups) {
      const section = document.createElement("section");
      section.className = "month";

      const breakdown = Object.entries(g.byCategory)
        .sort((a, b) => b[1] - a[1])
        .map(([cat, cents]) => `<span class="chip">${cat}: ${formatMoney(cents)}</span>`)
        .join("");

      const rows = g.expenses
        .map(
          (e) => `<tr>
            <td>${e.date}</td>
            <td><span class="chip">${e.category}</span></td>
            <td>${escapeHtml(e.note)}</td>
            <td class="num">${formatMoney(e.amountCents)}</td>
            <td><button type="button" class="link" data-delete="${e.id}" aria-label="Delete expense">✕</button></td>
          </tr>`
        )
        .join("");

      const left = remainingBudget(budgetCents, expenses, g.month);
      const leftHtml = left === null
        ? ""
        : `<span class="left${isOverBudget(left) ? " over" : ""}">${formatMoney(left)} left</span>`;

      section.innerHTML = `
        <header>
          <h3>${formatMonth(g.month)}</h3>
          <span><strong>${formatMoney(g.totalCents)}</strong>${leftHtml}</span>
        </header>
        <div class="chips">${breakdown}</div>
        <table>
          <thead><tr><th>Date</th><th>Category</th><th>Note</th><th class="num">Amount</th><th></th></tr></thead>
          <tbody>${rows}</tbody>
        </table>`;
      monthsEl.appendChild(section);
    }
  }

  function showMessage(text, kind) {
    message.textContent = text;
    message.className = `message ${kind}`;
  }

  function load() {
    try {
      return JSON.parse(localStorage.getItem(STORAGE_KEY)) || [];
    } catch {
      return [];
    }
  }

  function loadBudget() {
    try {
      const raw = localStorage.getItem(BUDGET_KEY);
      return raw === null ? null : parseBudget(Number(raw) / 100);
    } catch {
      return null;
    }
  }

  function save() {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(expenses));
    } catch {
      /* storage unavailable; keep in memory */
    }
  }

  function todayISO() {
    const d = new Date();
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
  }

  function escapeHtml(s) {
    return s.replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]);
  }

  render();
})();
