// Data types for PinkBudget. Kept flat and DB-friendly for future Supabase/PG migration.

import type { PaymentMethodId } from "./data/categories";

export type ID = string;

export type TransactionType = "expense" | "income";

export type Expense = {
  id: ID;
  type: "expense";
  amount: number; // COP integer
  date: string; // ISO
  description: string;
  categoryId: string;
  paymentMethod: PaymentMethodId;
  notes?: string;
  month: number; // 0-11
  year: number;
  recurringId?: ID;
  createdAt: string;
};

export type Income = {
  id: ID;
  type: "income";
  amount: number;
  date: string;
  description: string;
  sourceId: string;
  notes?: string;
  month: number;
  year: number;
  recurringId?: ID;
  createdAt: string;
};

export type Transaction = Expense | Income;

export type Goal = {
  id: ID;
  name: string;
  emoji: string;
  targetAmount: number;
  savedAmount: number;
  targetDate?: string; // ISO date
  priority: "low" | "medium" | "high";
  color: string; // hex, from palette
  notes?: string;
  createdAt: string;
  history: GoalMovement[];
};

export type GoalMovement = {
  id: ID;
  amount: number; // positive = deposit, negative = withdrawal
  date: string;
  note?: string;
};

export type BudgetConfig = {
  needsPct: number; // e.g., 50
  wantsPct: number; // 30
  savingsPct: number; // 20
};

export type ThemePref = "light" | "dark" | "auto";

export type Profile = {
  name: string;
  currency: "COP";
  payday?: number; // day of month
  themePref: ThemePref;
  createdAt: string;
};

export type AppState = {
  profile: Profile;
  budget: BudgetConfig;
  transactions: Transaction[];
  goals: Goal[];
  version: number;
};
