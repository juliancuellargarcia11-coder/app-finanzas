// Month/year utilities and Spanish month labels.

export const MONTH_NAMES_ES = [
  "Enero",
  "Febrero",
  "Marzo",
  "Abril",
  "Mayo",
  "Junio",
  "Julio",
  "Agosto",
  "Septiembre",
  "Octubre",
  "Noviembre",
  "Diciembre",
];

export const MONTH_SHORT_ES = [
  "Ene",
  "Feb",
  "Mar",
  "Abr",
  "May",
  "Jun",
  "Jul",
  "Ago",
  "Sep",
  "Oct",
  "Nov",
  "Dic",
];

export const WEEKDAY_SHORT_ES = ["Dom", "Lun", "Mar", "Mié", "Jue", "Vie", "Sáb"];

export type MonthKey = `${number}-${number}`; // "2026-9"

export function monthKey(year: number, month0: number): MonthKey {
  return `${year}-${month0}` as MonthKey;
}

export function parseMonthKey(key: MonthKey): { year: number; month0: number } {
  const [y, m] = key.split("-").map(Number);
  return { year: y, month0: m };
}

export function currentMonthKey(): MonthKey {
  const d = new Date();
  return monthKey(d.getFullYear(), d.getMonth());
}

export function labelForMonth(year: number, month0: number): string {
  return `${MONTH_NAMES_ES[month0]} ${year}`;
}

export function shortLabelForMonth(year: number, month0: number): string {
  return `${MONTH_SHORT_ES[month0]} ${year}`;
}

export function dateToParts(iso: string): {
  year: number;
  month0: number;
  day: number;
  hour: number;
  minute: number;
} {
  const d = new Date(iso);
  return {
    year: d.getFullYear(),
    month0: d.getMonth(),
    day: d.getDate(),
    hour: d.getHours(),
    minute: d.getMinutes(),
  };
}

export function formatDateShort(iso: string): string {
  const d = new Date(iso);
  return `${d.getDate()} ${MONTH_SHORT_ES[d.getMonth()]} ${d.getFullYear()}`;
}

export function formatTime(iso: string): string {
  const d = new Date(iso);
  const h = d.getHours().toString().padStart(2, "0");
  const m = d.getMinutes().toString().padStart(2, "0");
  return `${h}:${m}`;
}

export function formatDayHeader(iso: string): string {
  const d = new Date(iso);
  const now = new Date();
  if (
    d.getFullYear() === now.getFullYear() &&
    d.getMonth() === now.getMonth() &&
    d.getDate() === now.getDate()
  ) {
    return "Hoy";
  }
  const y = new Date(now);
  y.setDate(now.getDate() - 1);
  if (
    d.getFullYear() === y.getFullYear() &&
    d.getMonth() === y.getMonth() &&
    d.getDate() === y.getDate()
  ) {
    return "Ayer";
  }
  return `${WEEKDAY_SHORT_ES[d.getDay()]}, ${d.getDate()} ${MONTH_SHORT_ES[d.getMonth()]}`;
}

// Generate a list of month keys from earliest transaction to current month + next 2 months.
export function generateMonthRange(earliest?: MonthKey): MonthKey[] {
  const now = new Date();
  const endYear = now.getFullYear();
  const endMonth = now.getMonth() + 2; // include next 2 months forward
  let startYear: number;
  let startMonth: number;
  if (earliest) {
    const { year, month0 } = parseMonthKey(earliest);
    startYear = Math.min(year, now.getFullYear() - 1);
    startMonth = year <= now.getFullYear() - 1 ? month0 : 0;
  } else {
    startYear = now.getFullYear();
    startMonth = Math.max(0, now.getMonth() - 5);
  }
  const out: MonthKey[] = [];
  let y = startYear;
  let m = startMonth;
  while (y < endYear || (y === endYear && m <= endMonth)) {
    out.push(monthKey(y, m));
    m += 1;
    if (m > 11) {
      m = 0;
      y += 1;
    }
  }
  return out;
}
