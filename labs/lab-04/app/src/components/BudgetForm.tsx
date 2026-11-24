"use client";

import { useId, useState, type FormEvent } from "react";
import type { SetBudgetResult } from "@/lib/tracker";
import { FieldError, buttonClass, inputClass } from "./ui";

interface Props {
  initialCents: number | null;
  onSave(input: string): SetBudgetResult;
  onDone?(): void;
}

/** Set the monthly budget (needed before S2-AC1..3 apply). */
export function BudgetForm({ initialCents, onSave, onDone }: Props) {
  const id = useId();
  const [value, setValue] = useState(initialCents === null ? "" : (initialCents / 100).toFixed(2));
  const [error, setError] = useState<string>();

  function submit(event: FormEvent) {
    event.preventDefault();
    const result = onSave(value);
    if (!result.ok) {
      setError(result.error);
      return;
    }
    setError(undefined);
    onDone?.();
  }

  return (
    <form onSubmit={submit} noValidate className="flex flex-wrap items-start gap-2">
      <div className="min-w-0 flex-1">
        <label htmlFor={`${id}-budget`} className="mb-1 block text-sm text-muted">
          Monthly budget ($)
        </label>
        <input
          id={`${id}-budget`}
          inputMode="decimal"
          autoComplete="off"
          placeholder="400.00"
          value={value}
          onChange={(e) => setValue(e.target.value)}
          aria-invalid={error ? true : undefined}
          aria-describedby={error ? `${id}-error` : undefined}
          className={inputClass}
        />
        <FieldError id={`${id}-error`} message={error} />
      </div>
      <button type="submit" className={`${buttonClass} mt-6`}>
        Save budget
      </button>
    </form>
  );
}
