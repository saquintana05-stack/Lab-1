import type { ReactNode } from "react";

export function Card({ title, children, className = "" }: { title?: string; children: ReactNode; className?: string }) {
  return (
    <section className={`rounded-2xl border border-line bg-surface p-5 ${className}`}>
      {title && <h2 className="mb-3 text-base font-semibold">{title}</h2>}
      {children}
    </section>
  );
}

export function CategoryChip({ children }: { children: ReactNode }) {
  return <span className="inline-block rounded-full bg-chip px-2 py-0.5 text-xs text-muted">{children}</span>;
}

export const inputClass =
  "w-full rounded-lg border border-line bg-bg px-3 py-2 text-text placeholder:text-muted/70 " +
  "focus:outline-2 focus:outline-offset-1 focus:outline-accent aria-[invalid=true]:border-err";

export const buttonClass =
  "rounded-lg bg-accent px-4 py-2.5 font-semibold text-on-accent hover:bg-accent-hover " +
  "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent";

export function FieldError({ id, message }: { id: string; message?: string }) {
  if (!message) return null;
  return (
    <p id={id} className="mt-1 text-sm text-err">
      {message}
    </p>
  );
}
