import { describe, it, expect } from "vitest";
import {
  formatDate,
  formatDateOnly,
  formatTimeOnly,
} from "../utils/dateFormatter";

describe("formatDate", () => {
  it("devuelve cadena vacía si dateStr es falsy", () => {
    expect(formatDate("")).toBe("");
    expect(formatDate(null)).toBe("");
    expect(formatDate(undefined)).toBe("");
  });

  it("formatea una fecha sin hora", () => {
    const result = formatDate("2026-01-15");
    expect(result).toBe("15 ENE 2026");
  });

  it("formatea una fecha con hora", () => {
    const result = formatDate("2026-03-20", "14:30:00");
    expect(result).toBe("20 MAR 2026 · 14:30h");
  });

  it("trunca la hora a HH:MM", () => {
    const result = formatDate("2026-06-01", "09:05:59");
    expect(result).toContain("09:05h");
  });

  it("maneja diferentes meses en español", () => {
    const months = [
      ["2026-01-01", "ENE"],
      ["2026-02-01", "FEB"],
      ["2026-03-01", "MAR"],
      ["2026-04-01", "ABR"],
      ["2026-05-01", "MAY"],
      ["2026-06-01", "JUN"],
      ["2026-07-01", "JUL"],
      ["2026-08-01", "AGO"],
      ["2026-09-01", "SEPT"],
      ["2026-10-01", "OCT"],
      ["2026-11-01", "NOV"],
      ["2026-12-01", "DIC"],
    ];
    months.forEach(([date, abbr]) => {
      expect(formatDate(date)).toContain(abbr);
    });
  });
});

describe("formatDateOnly", () => {
  it("devuelve cadena vacía si dateStr es falsy", () => {
    expect(formatDateOnly("")).toBe("");
    expect(formatDateOnly(null)).toBe("");
  });

  it("formatea correctamente la fecha sin hora", () => {
    const result = formatDateOnly("2026-07-04");
    expect(result).toBe("04 JUL 2026");
  });
});

describe("formatTimeOnly", () => {
  it("devuelve cadena vacía si timeStr es falsy", () => {
    expect(formatTimeOnly("")).toBe("");
    expect(formatTimeOnly(null)).toBe("");
    expect(formatTimeOnly(undefined)).toBe("");
  });

  it("devuelve HH:MMh para una hora válida", () => {
    expect(formatTimeOnly("18:45:00")).toBe("18:45h");
  });

  it("funciona con hora sin segundos", () => {
    expect(formatTimeOnly("09:30")).toBe("09:30h");
  });
});
