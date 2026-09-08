// Colombian Peso formatting: dots as thousand separators, no decimals.
// e.g., 4000000 -> "$4.000.000"

export function formatCOP(amount: number, withSign = false): string {
  const abs = Math.round(Math.abs(amount));
  const withDots = abs
    .toString()
    .replace(/\B(?=(\d{3})+(?!\d))/g, ".");
  const sign = withSign ? (amount >= 0 ? "+" : "-") : amount < 0 ? "-" : "";
  return `${sign}$${withDots}`;
}

export function formatCOPCompact(amount: number): string {
  const abs = Math.abs(amount);
  if (abs >= 1_000_000) {
    const v = amount / 1_000_000;
    return `$${v.toFixed(v >= 10 ? 0 : 1)}M`;
  }
  if (abs >= 1_000) {
    const v = amount / 1_000;
    return `$${v.toFixed(v >= 10 ? 0 : 1)}k`;
  }
  return formatCOP(amount);
}

export function parseAmount(input: string): number {
  const cleaned = input.replace(/[^\d]/g, "");
  return cleaned ? parseInt(cleaned, 10) : 0;
}

export function formatAmountInput(input: string): string {
  const n = parseAmount(input);
  if (!n) return "";
  return n.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".");
}
