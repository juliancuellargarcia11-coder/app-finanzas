import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";

import { storage } from "@/src/utils/storage";
import type {
  AppState,
  BudgetConfig,
  Expense,
  Goal,
  GoalMovement,
  Income,
  Profile,
  ThemePref,
  Transaction,
} from "@/src/types";
import { setColorScheme } from "@/src/theme";

const STORAGE_KEY = "pinkbudget:v1";
const STATE_VERSION = 1;

function makeId(): string {
  return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 9)}`;
}

const defaultProfile: Profile = {
  name: "",
  currency: "COP",
  themePref: "auto",
  createdAt: new Date().toISOString(),
};

const defaultBudget: BudgetConfig = {
  needsPct: 50,
  wantsPct: 30,
  savingsPct: 20,
};

const defaultState: AppState = {
  profile: defaultProfile,
  budget: defaultBudget,
  transactions: [],
  goals: [],
  version: STATE_VERSION,
};

type Ctx = {
  state: AppState;
  hydrated: boolean;
  // profile
  updateProfile: (patch: Partial<Profile>) => void;
  setThemePref: (t: ThemePref) => void;
  // budget
  updateBudget: (b: BudgetConfig) => void;
  // transactions
  addExpense: (
    input: Omit<Expense, "id" | "type" | "month" | "year" | "createdAt">,
  ) => Expense;
  addIncome: (
    input: Omit<Income, "id" | "type" | "month" | "year" | "createdAt">,
  ) => Income;
  updateTransaction: (id: string, patch: Partial<Transaction>) => void;
  deleteTransaction: (id: string) => void;
  // goals
  addGoal: (
    g: Omit<Goal, "id" | "createdAt" | "savedAmount" | "history">,
  ) => Goal;
  updateGoal: (id: string, patch: Partial<Goal>) => void;
  deleteGoal: (id: string) => void;
  depositGoal: (id: string, amount: number, note?: string) => void;
  withdrawGoal: (id: string, amount: number, note?: string) => void;
  // utilities
  resetAll: () => void;
  exportJSON: () => string;
  importJSON: (data: string) => boolean;
};

const AppContext = createContext<Ctx | null>(null);

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<AppState>(defaultState);
  const [hydrated, setHydrated] = useState(false);

  // Hydrate
  useEffect(() => {
    let cancelled = false;
    (async () => {
      const raw = await storage.getItem<AppState | null>(STORAGE_KEY, null);
      if (!cancelled) {
        if (raw && raw.version === STATE_VERSION) {
          setState({ ...defaultState, ...raw });
          if (raw.profile?.themePref) applyThemePref(raw.profile.themePref);
        }
        setHydrated(true);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  // Persist on change (after hydration)
  useEffect(() => {
    if (!hydrated) return;
    storage.setItem(STORAGE_KEY, state);
  }, [state, hydrated]);

  const updateProfile = useCallback((patch: Partial<Profile>) => {
    setState((s) => ({ ...s, profile: { ...s.profile, ...patch } }));
  }, []);

  const setThemePref = useCallback((t: ThemePref) => {
    applyThemePref(t);
    setState((s) => ({ ...s, profile: { ...s.profile, themePref: t } }));
  }, []);

  const updateBudget = useCallback((b: BudgetConfig) => {
    setState((s) => ({ ...s, budget: b }));
  }, []);

  const addExpense: Ctx["addExpense"] = useCallback((input) => {
    const d = new Date(input.date);
    const exp: Expense = {
      id: makeId(),
      type: "expense",
      ...input,
      month: d.getMonth(),
      year: d.getFullYear(),
      createdAt: new Date().toISOString(),
    };
    setState((s) => ({ ...s, transactions: [exp, ...s.transactions] }));
    return exp;
  }, []);

  const addIncome: Ctx["addIncome"] = useCallback((input) => {
    const d = new Date(input.date);
    const inc: Income = {
      id: makeId(),
      type: "income",
      ...input,
      month: d.getMonth(),
      year: d.getFullYear(),
      createdAt: new Date().toISOString(),
    };
    setState((s) => ({ ...s, transactions: [inc, ...s.transactions] }));
    return inc;
  }, []);

  const updateTransaction: Ctx["updateTransaction"] = useCallback(
    (id, patch) => {
      setState((s) => ({
        ...s,
        transactions: s.transactions.map((t) => {
          if (t.id !== id) return t;
          const merged = { ...t, ...patch } as Transaction;
          if (patch.date) {
            const d = new Date(patch.date as string);
            merged.month = d.getMonth();
            merged.year = d.getFullYear();
          }
          return merged;
        }),
      }));
    },
    [],
  );

  const deleteTransaction = useCallback((id: string) => {
    setState((s) => ({
      ...s,
      transactions: s.transactions.filter((t) => t.id !== id),
    }));
  }, []);

  const addGoal: Ctx["addGoal"] = useCallback((g) => {
    const goal: Goal = {
      id: makeId(),
      savedAmount: 0,
      history: [],
      createdAt: new Date().toISOString(),
      ...g,
    };
    setState((s) => ({ ...s, goals: [goal, ...s.goals] }));
    return goal;
  }, []);

  const updateGoal: Ctx["updateGoal"] = useCallback((id, patch) => {
    setState((s) => ({
      ...s,
      goals: s.goals.map((g) => (g.id === id ? { ...g, ...patch } : g)),
    }));
  }, []);

  const deleteGoal = useCallback((id: string) => {
    setState((s) => ({ ...s, goals: s.goals.filter((g) => g.id !== id) }));
  }, []);

  const depositGoal: Ctx["depositGoal"] = useCallback((id, amount, note) => {
    const mv: GoalMovement = {
      id: makeId(),
      amount: Math.abs(amount),
      date: new Date().toISOString(),
      note,
    };
    setState((s) => ({
      ...s,
      goals: s.goals.map((g) =>
        g.id === id
          ? {
              ...g,
              savedAmount: g.savedAmount + Math.abs(amount),
              history: [mv, ...g.history],
            }
          : g,
      ),
    }));
  }, []);

  const withdrawGoal: Ctx["withdrawGoal"] = useCallback((id, amount, note) => {
    const mv: GoalMovement = {
      id: makeId(),
      amount: -Math.abs(amount),
      date: new Date().toISOString(),
      note,
    };
    setState((s) => ({
      ...s,
      goals: s.goals.map((g) =>
        g.id === id
          ? {
              ...g,
              savedAmount: Math.max(0, g.savedAmount - Math.abs(amount)),
              history: [mv, ...g.history],
            }
          : g,
      ),
    }));
  }, []);

  const resetAll = useCallback(() => {
    setState(defaultState);
  }, []);

  const exportJSON = useCallback(() => JSON.stringify(state, null, 2), [state]);

  const importJSON = useCallback((raw: string) => {
    try {
      const parsed = JSON.parse(raw) as AppState;
      if (!parsed || typeof parsed !== "object") return false;
      setState({ ...defaultState, ...parsed, version: STATE_VERSION });
      return true;
    } catch {
      return false;
    }
  }, []);

  const value = useMemo<Ctx>(
    () => ({
      state,
      hydrated,
      updateProfile,
      setThemePref,
      updateBudget,
      addExpense,
      addIncome,
      updateTransaction,
      deleteTransaction,
      addGoal,
      updateGoal,
      deleteGoal,
      depositGoal,
      withdrawGoal,
      resetAll,
      exportJSON,
      importJSON,
    }),
    [
      state,
      hydrated,
      updateProfile,
      setThemePref,
      updateBudget,
      addExpense,
      addIncome,
      updateTransaction,
      deleteTransaction,
      addGoal,
      updateGoal,
      deleteGoal,
      depositGoal,
      withdrawGoal,
      resetAll,
      exportJSON,
      importJSON,
    ],
  );

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export function useApp(): Ctx {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error("useApp must be used inside AppProvider");
  return ctx;
}

function applyThemePref(t: ThemePref) {
  if (t === "auto") setColorScheme(null);
  else setColorScheme(t);
}
