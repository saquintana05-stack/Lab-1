import { describe, expect, it } from "vitest";
import { daysLeftInMonth, formatMoney, formatMonth, formatShortDate, monthKey, todayISO } from "./format";

describe("format helpers", () => {
  it("formats cents as dollars", () => {
    expect(formatMoney(1250)).toBe("$12.50");
    expect(formatMoney(0)).toBe("$0.00");
    expect(formatMoney(-1230)).toBe("-$12.30");
    expect(formatMoney(123456)).toBe("$1,234.56");
  });

  it("formats months and dates", () => {
    expect(monthKey("2026-11-23")).toBe("2026-11");
    expect(formatMonth("2026-11")).toBe("November 2026");
    expect(formatShortDate("2026-11-02")).toBe("Nov 2");
  });

  it("uses local time for today", () => {
    expect(todayISO(new Date(2026, 0, 5, 23, 59))).toBe("2026-01-05");
  });

  it("counts days left including today", () => {
    expect(daysLeftInMonth(new Date(2026, 10, 23))).toBe(8);
    expect(daysLeftInMonth(new Date(2026, 10, 30))).toBe(1);
    expect(daysLeftInMonth(new Date(2028, 1, 1))).toBe(29);
  });
});
