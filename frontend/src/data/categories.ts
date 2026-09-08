// Category definitions for expenses and income.
// group: budget group under 50/30/20 method.

export type BudgetGroup = "needs" | "wants" | "savings";

export type ExpenseCategory = {
  id: string;
  name: string;
  emoji: string;
  group: BudgetGroup;
};

export const EXPENSE_CATEGORIES: ExpenseCategory[] = [
  { id: "vivienda", name: "Vivienda", emoji: "🏠", group: "needs" },
  { id: "comida", name: "Comida", emoji: "🍔", group: "needs" },
  { id: "transporte", name: "Transporte", emoji: "🚗", group: "needs" },
  { id: "servicios", name: "Servicios", emoji: "💡", group: "needs" },
  { id: "salud", name: "Salud", emoji: "❤️", group: "needs" },
  { id: "educacion", name: "Educación", emoji: "🎓", group: "needs" },
  { id: "deudas", name: "Deudas", emoji: "💳", group: "needs" },
  { id: "compras", name: "Compras", emoji: "🛒", group: "wants" },
  { id: "belleza", name: "Belleza", emoji: "💅", group: "wants" },
  { id: "entretenimiento", name: "Entretenimiento", emoji: "🎮", group: "wants" },
  { id: "viajes", name: "Viajes", emoji: "✈️", group: "wants" },
  { id: "otros", name: "Otros", emoji: "🌸", group: "wants" },
];

export type IncomeSource = {
  id: string;
  name: string;
  emoji: string;
};

export const INCOME_SOURCES: IncomeSource[] = [
  { id: "salario", name: "Salario", emoji: "💼" },
  { id: "freelance", name: "Freelance", emoji: "💻" },
  { id: "extra", name: "Trabajo extra", emoji: "⭐" },
  { id: "regalo", name: "Regalo", emoji: "🎁" },
  { id: "inversion", name: "Inversión", emoji: "📈" },
  { id: "otro", name: "Otro", emoji: "🌸" },
];

export const PAYMENT_METHODS = [
  { id: "efectivo", name: "Efectivo", emoji: "💵" },
  { id: "debito", name: "Débito", emoji: "💳" },
  { id: "credito", name: "Crédito", emoji: "🏦" },
  { id: "transferencia", name: "Transferencia", emoji: "🔁" },
  { id: "nequi", name: "Nequi", emoji: "📱" },
  { id: "daviplata", name: "Daviplata", emoji: "📲" },
  { id: "otro", name: "Otro", emoji: "✨" },
] as const;

export type PaymentMethodId = (typeof PAYMENT_METHODS)[number]["id"];

export const GOAL_ICONS = [
  { emoji: "✈️", name: "Viaje" },
  { emoji: "📱", name: "iPhone" },
  { emoji: "🏠", name: "Casa" },
  { emoji: "🚗", name: "Coche" },
  { emoji: "🎓", name: "Estudios" },
  { emoji: "💍", name: "Boda" },
  { emoji: "💰", name: "Emergencia" },
  { emoji: "🎁", name: "Regalo" },
  { emoji: "👗", name: "Moda" },
  { emoji: "💄", name: "Belleza" },
  { emoji: "🏝️", name: "Playa" },
  { emoji: "🌸", name: "Otra" },
];

export function findExpenseCategory(id: string): ExpenseCategory {
  return (
    EXPENSE_CATEGORIES.find((c) => c.id === id) ??
    EXPENSE_CATEGORIES[EXPENSE_CATEGORIES.length - 1]
  );
}

export function findIncomeSource(id: string): IncomeSource {
  return INCOME_SOURCES.find((c) => c.id === id) ?? INCOME_SOURCES[INCOME_SOURCES.length - 1];
}

export function findPaymentMethod(id: string) {
  return PAYMENT_METHODS.find((c) => c.id === id) ?? PAYMENT_METHODS[0];
}
