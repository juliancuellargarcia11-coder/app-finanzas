// Selectors and derived calculations for a given month.

import type { AppState, Expense, Income, Transaction } from "@/src/types";
import { findExpenseCategory } from "@/src/data/categories";

export function selectMonthTransactions(
  state: AppState,
  year: number,
  month0: number,
): Transaction[] {
  return state.transactions
    .filter((t) => t.year === year && t.month === month0)
    .sort((a, b) => (a.date < b.date ? 1 : -1));
}

export function selectMonthExpenses(
  state: AppState,
  year: number,
  month0: number,
): Expense[] {
  return selectMonthTransactions(state, year, month0).filter(
    (t): t is Expense => t.type === "expense",
  );
}

export function selectMonthIncomes(
  state: AppState,
  year: number,
  month0: number,
): Income[] {
  return selectMonthTransactions(state, year, month0).filter(
    (t): t is Income => t.type === "income",
  );
}

export function totalOf(txs: { amount: number }[]): number {
  return txs.reduce((s, t) => s + t.amount, 0);
}

export type MonthSummary = {
  incomeTotal: number;
  expenseTotal: number;
  balance: number; // income - expense
  budget: { needs: number; wants: number; savings: number };
  spent: { needs: number; wants: number; savings: number };
  savedInGoalsThisMonth: number;
};

export function selectMonthSummary(
  state: AppState,
  year: number,
  month0: number,
): MonthSummary {
  const incomes = selectMonthIncomes(state, year, month0);
  const expenses = selectMonthExpenses(state, year, month0);

  const incomeTotal = totalOf(incomes);
  const expenseTotal = totalOf(expenses);

  const budget = {
    needs: (incomeTotal * state.budget.needsPct) / 100,
    wants: (incomeTotal * state.budget.wantsPct) / 100,
    savings: (incomeTotal * state.budget.savingsPct) / 100,
  };

  const spent = { needs: 0, wants: 0, savings: 0 };
  expenses.forEach((e) => {
    const cat = findExpenseCategory(e.categoryId);
    if (cat.group === "needs") spent.needs += e.amount;
    else if (cat.group === "wants") spent.wants += e.amount;
    else spent.savings += e.amount;
  });

  // Money moved into goals this month = income to savings, computed from deposits
  const savedInGoalsThisMonth = state.goals.reduce((sum, g) => {
    return (
      sum +
      g.history
        .filter((h) => {
          const d = new Date(h.date);
          return (
            d.getFullYear() === year && d.getMonth() === month0 && h.amount > 0
          );
        })
        .reduce((s, h) => s + h.amount, 0)
    );
  }, 0);

  return {
    incomeTotal,
    expenseTotal,
    balance: incomeTotal - expenseTotal,
    budget,
    spent,
    savedInGoalsThisMonth,
  };
}

export function selectSpendingByCategory(
  state: AppState,
  year: number,
  month0: number,
): { categoryId: string; total: number }[] {
  const map = new Map<string, number>();
  selectMonthExpenses(state, year, month0).forEach((e) => {
    map.set(e.categoryId, (map.get(e.categoryId) ?? 0) + e.amount);
  });
  return Array.from(map.entries())
    .map(([categoryId, total]) => ({ categoryId, total }))
    .sort((a, b) => b.total - a.total);
}

export function selectAvailableMonths(state: AppState): { year: number; month0: number }[] {
  const set = new Set<string>();
  state.transactions.forEach((t) => set.add(`${t.year}-${t.month}`));
  return Array.from(set)
    .map((k) => {
      const [y, m] = k.split("-").map(Number);
      return { year: y, month0: m };
    })
    .sort((a, b) => (a.year !== b.year ? a.year - b.year : a.month0 - b.month0));
}

// Simple contextual tips based on the current month's data.
export function buildSmartTips(summary: MonthSummary): string[] {
  const tips: string[] = [];
  const { budget, spent, incomeTotal } = summary;

  if (incomeTotal === 0) {
    tips.push("💗 Añade tu primer ingreso del mes para empezar.");
    return tips;
  }

  if (spent.needs > budget.needs && budget.needs > 0) {
    tips.push("⚠️ Te pasaste del presupuesto de Necesidades.");
  } else if (budget.needs > 0 && spent.needs / budget.needs < 0.8) {
    tips.push("💗 Vas muy bien con Necesidades este mes.");
  }

  if (spent.wants > budget.wants && budget.wants > 0) {
    tips.push("💅 Has gastado demasiado en Gustos este mes.");
  }

  if (summary.savedInGoalsThisMonth >= budget.savings && budget.savings > 0) {
    tips.push("🎯 Ya alcanzaste tu objetivo de ahorro mensual.");
  } else if (budget.savings > 0) {
    const falta = budget.savings - summary.savedInGoalsThisMonth;
    if (falta > 0) tips.push(`💖 Te faltan por ahorrar ${Math.round(falta).toLocaleString("es-CO")} este mes.`);
  }

  if (tips.length === 0) tips.push("✨ ¡Sigue así, estás en camino!");
  return tips;
}
