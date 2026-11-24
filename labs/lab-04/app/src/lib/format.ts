import type { ISODate, MonthKey } from "./types";

const money = new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" });

/** 1250 → "$12.50", -230 → "-$2.30" */
export function formatMoney(cents: number): string {
  return money.format(cents / 100);
}

/** "2026-11-23" → "2026-11" */
export function monthKey(date: ISODate): MonthKey {
  return date.slice(0, 7);
}

/** "2026-11" → "November 2026" */
export function formatMonth(key: MonthKey): string {
  const [y, m] = key.split("-").map(Number);
  return new Date(y, m - 1, 1).toLocaleString("en-US", { month: "long", year: "numeric" });
}

/** "2026-11-22" → "Nov 22" */
export function formatShortDate(date: ISODate): string {
  const [y, m, d] = date.split("-").map(Number);
  return new Date(y, m - 1, d).toLocaleString("en-US", { month: "short", day: "numeric" });
}

/** Today's date in the user's local time zone, as "YYYY-MM-DD". */
export function todayISO(now: Date = new Date()): ISODate {
  const y = now.getFullYear();
  const m = String(now.getMonth() + 1).padStart(2, "0");
  const d = String(now.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

/** Days left in the month, counting today. Nov 23 → 8. */
export function daysLeftInMonth(now: Date = new Date()): number {
  const lastDay = new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate();
  return lastDay - now.getDate() + 1;
}
