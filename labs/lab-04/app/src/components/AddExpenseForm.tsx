"use client";

import { useId, useState, type FormEvent } from "react";
import type { ExpenseInput, FieldErrors } from "@/lib/expenses";
import { NOTE_MAX } from "@/lib/expenses";
import { formatMoney, formatMonth, formatShortDate, monthKey } from "@/lib/format";
import type { AddExpenseResult } from "@/lib/tracker";
import { CATEGORIES } from "@/lib/types";
import { FieldError, buttonClass, inputClass } from "./ui";

interface Props {
  today: string;
  onAdd(input: ExpenseInput): AddExpenseResult;
}

type Message = { kind: "success" | "error"; text: string } | null;

/** S1-AC1 and S2-AC1 / S2-AC2. */
export function AddExpenseForm({ today, onAdd }: Props) {
  const id = useId();
  const [amount, setAmount] = useState("");
  const [date, setDate] = useState(today);
  const [category, setCategory] = useState("");
  const [note, setNote] = useState("");
  const [errors, setErrors] = useState<FieldErrors>({});
  const [message, setMessage] = useState<Message>(null);

  function submit(event: FormEvent) {
    event.preventDefault();
    const result = onAdd({ amount, date, category, note });

    if (!result.ok) {
      setErrors(result.fieldErrors ?? {});
      setMessage(result.budgetError ? { kind: "error", text: result.budgetError } : null);
      return;
    }

    const e = result.expense;
    let text = `Recorded ${formatMoney(e.amountCents)} on ${formatShortDate(e.date)} under ${e.category}.`;
    if (result.remainingAfterCents !== null) {
      const m = monthKey(e.date);
      const which = m === monthKey(today) ? "" : ` for ${formatMonth(m)}`;
      text += ` New budget${which}: ${formatMoney(result.remainingAfterCents)} left.`;
    }
    setMessage({ kind: "success", text });
    setErrors({});
    setAmount("");
    setCategory("");
    setNote("");
  }

  const field = (name: keyof FieldErrors) => ({
    id: `${id}-${name}`,
    "aria-invalid": errors[name] ? true : undefined,
    "aria-describedby": errors[name] ? `${id}-${name}-error` : undefined,
    className: inputClass,
  });

  return (
    <div>
      <h2 className="mb-3 text-base font-semibold">Add expense</h2>
      <form onSubmit={submit} noValidate className="grid grid-cols-2 gap-3">
        <div>
          <label htmlFor={`${id}-amount`} className="mb-1 block text-sm text-muted">
            Amount ($)
          </label>
          <input
            {...field("amount")}
            inputMode="decimal"
            autoComplete="off"
            placeholder="0.00"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
          />
          <FieldError id={`${id}-amount-error`} message={errors.amount} />
        </div>

        <div>
          <label htmlFor={`${id}-date`} className="mb-1 block text-sm text-muted">
            Date
          </label>
          <input {...field("date")} type="date" value={date} onChange={(e) => setDate(e.target.value)} />
          <FieldError id={`${id}-date-error`} message={errors.date} />
        </div>

        <div>
          <label htmlFor={`${id}-category`} className="mb-1 block text-sm text-muted">
            Category
          </label>
          <select {...field("category")} value={category} onChange={(e) => setCategory(e.target.value)}>
            <option value="">Choose…</option>
            {CATEGORIES.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
          <FieldError id={`${id}-category-error`} message={errors.category} />
        </div>

        <div>
          <label htmlFor={`${id}-note`} className="mb-1 block text-sm text-muted">
            Note (optional)
          </label>
          <input
            {...field("note")}
            maxLength={NOTE_MAX}
            placeholder="e.g. Gas – Shell"
            value={note}
            onChange={(e) => setNote(e.target.value)}
          />
          <FieldError id={`${id}-note-error`} message={errors.note} />
        </div>

        <button type="submit" className={`${buttonClass} col-span-2`}>
          Add expense
        </button>
      </form>

      <div aria-live="polite" role="status" className="mt-3 min-h-6">
        {message && (
          <p
            className={`rounded-lg px-3 py-2 text-sm ${
              message.kind === "success" ? "bg-ok-bg text-ok" : "bg-err-bg text-err"
            }`}
          >
            {message.kind === "success" ? "✓ " : ""}
            {message.text}
          </p>
        )}
      </div>
    </div>
  );
}
