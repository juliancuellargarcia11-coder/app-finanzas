import { useMemo, useState } from "react";
import { Pressable, ScrollView, StyleSheet, Text, TextInput, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import Icon from "@react-native-vector-icons/ionicons";
import { useRouter } from "expo-router";

import { radius, spacing, useTheme } from "@/src/theme";
import { useApp } from "@/src/context/AppContext";
import { MonthSelector, fullMonthLabel } from "@/src/components/MonthSelector";
import { TransactionRow } from "@/src/components/TransactionRow";
import { formatCOP } from "@/src/utils/currency";
import {
  currentMonthKey,
  formatDayHeader,
  generateMonthRange,
  parseMonthKey,
  type MonthKey,
} from "@/src/utils/date";
import { selectMonthSummary, selectMonthTransactions } from "@/src/context/selectors";
import { useToast } from "@/src/components/Toast";

export default function MovimientosScreen() {
  const insets = useSafeAreaInsets();
  const { colors } = useTheme();
  const { state, deleteTransaction } = useApp();
  const toast = useToast();
  const router = useRouter();
  const [month, setMonth] = useState<MonthKey>(currentMonthKey());
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState<"all" | "income" | "expense">("all");

  const months = useMemo(() => {
    const earliest = state.transactions.reduce<MonthKey | undefined>((acc, t) => {
      const k = `${t.year}-${t.month}` as MonthKey;
      if (!acc) return k;
      const [ay, am] = acc.split("-").map(Number);
      if (t.year < ay || (t.year === ay && t.month < am)) return k;
      return acc;
    }, undefined);
    return generateMonthRange(earliest);
  }, [state.transactions]);

  const { year, month0 } = parseMonthKey(month);
  const summary = selectMonthSummary(state, year, month0);
  const txs = selectMonthTransactions(state, year, month0);

  const filtered = txs.filter((t) => {
    if (filter !== "all" && t.type !== filter) return false;
    if (!query.trim()) return true;
    const q = query.toLowerCase();
    return (
      t.description.toLowerCase().includes(q) ||
      (t.type === "expense" && t.categoryId.toLowerCase().includes(q)) ||
      (t.type === "income" && t.sourceId.toLowerCase().includes(q))
    );
  });

  // Group by day
  const groups = useMemo(() => {
    const map = new Map<string, typeof filtered>();
    filtered.forEach((t) => {
      const dayKey = t.date.slice(0, 10);
      const list = map.get(dayKey) ?? [];
      list.push(t);
      map.set(dayKey, list);
    });
    return Array.from(map.entries()).sort((a, b) => (a[0] < b[0] ? 1 : -1));
  }, [filtered]);

  return (
    <View style={[styles.container, { backgroundColor: colors.surface }]}>
      <View style={{ paddingTop: insets.top + spacing.md, paddingHorizontal: spacing.lg }}>
        <Text style={[styles.title, { color: colors.onSurface }]}>Movimientos</Text>
        <Text style={[styles.subtitle, { color: colors.muted }]}>{fullMonthLabel(month)}</Text>
      </View>

      <View style={{ marginTop: spacing.md }}>
        <MonthSelector months={months} selected={month} onChange={setMonth} />
      </View>

      {/* Summary strip */}
      <View style={styles.summaryRow}>
        <View style={[styles.summaryPill, { backgroundColor: colors.surfaceSecondary, borderColor: colors.border }]}>
          <Text style={{ color: colors.muted, fontSize: 11, fontWeight: "600" }}>Ingresos</Text>
          <Text style={{ color: colors.success, fontSize: 14, fontWeight: "800" }}>
            +{formatCOP(summary.incomeTotal)}
          </Text>
        </View>
        <View style={[styles.summaryPill, { backgroundColor: colors.surfaceSecondary, borderColor: colors.border }]}>
          <Text style={{ color: colors.muted, fontSize: 11, fontWeight: "600" }}>Gastos</Text>
          <Text style={{ color: colors.error, fontSize: 14, fontWeight: "800" }}>
            -{formatCOP(summary.expenseTotal)}
          </Text>
        </View>
      </View>

      {/* Search */}
      <View style={[styles.searchWrap, { backgroundColor: colors.surfaceSecondary, borderColor: colors.border }]}>
        <Icon name="search" size={18} color={colors.muted} />
        <TextInput
          testID="search-input"
          placeholder="Buscar movimiento"
          placeholderTextColor={colors.muted}
          value={query}
          onChangeText={setQuery}
          style={[styles.searchInput, { color: colors.onSurfaceSecondary }]}
        />
      </View>

      {/* Filter chips */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={{ flexGrow: 0, height: 48 }}
        contentContainerStyle={styles.filters}
      >
        {(["all", "income", "expense"] as const).map((f) => {
          const active = filter === f;
          const label = f === "all" ? "Todos" : f === "income" ? "Ingresos" : "Gastos";
          return (
            <Pressable
              key={f}
              testID={`filter-${f}`}
              onPress={() => setFilter(f)}
              style={[
                styles.filterChip,
                {
                  backgroundColor: active ? colors.brandPrimary : colors.surfaceSecondary,
                  borderColor: active ? colors.brandPrimary : colors.border,
                },
              ]}
            >
              <Text
                style={{
                  color: active ? colors.onBrandPrimary : colors.onSurfaceSecondary,
                  fontWeight: "700",
                  fontSize: 13,
                }}
              >
                {label}
              </Text>
            </Pressable>
          );
        })}
      </ScrollView>

      <ScrollView
        contentContainerStyle={{ padding: spacing.lg, paddingBottom: spacing["3xl"], gap: spacing.md }}
        showsVerticalScrollIndicator={false}
      >
        {groups.length === 0 ? (
          <View style={styles.empty}>
            <Text style={{ fontSize: 42 }}>🌸</Text>
            <Text style={[styles.emptyTitle, { color: colors.onSurface }]}>
              Sin movimientos aún
            </Text>
            <Text style={[styles.emptyText, { color: colors.muted }]}>
              Añade tu primer ingreso o gasto para {fullMonthLabel(month)}.
            </Text>
            <Pressable
              testID="empty-add-btn"
              onPress={() => router.push("/add-transaction")}
              style={[styles.emptyBtn, { backgroundColor: colors.brandPrimary }]}
            >
              <Text style={{ color: colors.onBrandPrimary, fontWeight: "700" }}>
                Añadir movimiento
              </Text>
            </Pressable>
          </View>
        ) : (
          groups.map(([day, list]) => (
            <View key={day} style={{ gap: spacing.sm }}>
              <Text style={[styles.dayHeader, { color: colors.muted }]}>
                {formatDayHeader(day)}
              </Text>
              {list.map((tx) => (
                <TransactionRow
                  key={tx.id}
                  tx={tx}
                  onPress={() => {
                    // Long press deletes; simple tap for now shows a toast with amount
                    toast.show(`${tx.description || "Movimiento"} — ${formatCOP(tx.amount)}`, "info");
                  }}
                />
              ))}
            </View>
          ))
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  title: { fontSize: 26, fontWeight: "800" },
  subtitle: { fontSize: 13, fontWeight: "600", marginTop: 2 },
  summaryRow: {
    flexDirection: "row",
    gap: spacing.sm,
    paddingHorizontal: spacing.lg,
    marginTop: spacing.sm,
  },
  summaryPill: {
    flex: 1,
    padding: spacing.md,
    borderRadius: radius.md,
    borderWidth: StyleSheet.hairlineWidth,
  },
  searchWrap: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
    marginHorizontal: spacing.lg,
    marginTop: spacing.md,
    paddingHorizontal: spacing.md,
    height: 44,
    borderRadius: radius.pill,
    borderWidth: StyleSheet.hairlineWidth,
  },
  searchInput: { flex: 1, fontSize: 15 },
  filters: {
    paddingHorizontal: spacing.lg,
    gap: spacing.sm,
    alignItems: "center",
  },
  filterChip: {
    height: 36,
    paddingHorizontal: spacing.lg,
    borderRadius: radius.pill,
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
  },
  dayHeader: { fontSize: 12, fontWeight: "700", textTransform: "uppercase", letterSpacing: 0.5 },
  empty: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: spacing["3xl"],
    gap: spacing.md,
  },
  emptyTitle: { fontSize: 18, fontWeight: "800" },
  emptyText: { fontSize: 13, textAlign: "center", paddingHorizontal: spacing.xl },
  emptyBtn: {
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.md,
    borderRadius: radius.pill,
    marginTop: spacing.sm,
  },
});
