import { useMemo, useState } from "react";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { Image } from "expo-image";
import { LinearGradient } from "expo-linear-gradient";

import { radius, spacing, useTheme } from "@/src/theme";
import { useApp } from "@/src/context/AppContext";
import {
  buildSmartTips,
  selectMonthSummary,
} from "@/src/context/selectors";
import { formatCOP } from "@/src/utils/currency";
import { BudgetCard } from "@/src/components/BudgetCard";
import { MonthSelector, fullMonthLabel } from "@/src/components/MonthSelector";
import { PWAInstallBanner } from "@/src/components/PWAInstallBanner";
import { currentMonthKey, generateMonthRange, parseMonthKey, type MonthKey } from "@/src/utils/date";

const HERO_BG =
  "https://images.unsplash.com/photo-1657624332868-2159deacefa9?crop=entropy&cs=srgb&fm=jpg&ixid=M3w4NjA1MDV8MHwxfHNlYXJjaHwyfHxhYnN0cmFjdCUyMHNvZnQlMjBwaW5rJTIwcm9zZSUyMGdvbGQlMjBncmFkaWVudCUyMHRleHR1cmV8ZW58MHx8fHwxNzg4ODk3NTE4fDA&ixlib=rb-4.1.0&q=85";

export default function Dashboard() {
  const insets = useSafeAreaInsets();
  const { colors } = useTheme();
  const { state } = useApp();
  const router = useRouter();

  const [month, setMonth] = useState<MonthKey>(currentMonthKey());

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
  const summary = useMemo(
    () => selectMonthSummary(state, year, month0),
    [state, year, month0],
  );
  const tips = useMemo(() => buildSmartTips(summary), [summary]);

  const greeting = state.profile.name ? `Hola, ${state.profile.name} 💗` : "Hola, hermosa 💗";

  return (
    <View style={[styles.container, { backgroundColor: colors.surface }]}>
      <ScrollView
        contentContainerStyle={{ paddingTop: insets.top + spacing.md, paddingBottom: spacing["3xl"] }}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={{ paddingHorizontal: spacing.lg, marginBottom: spacing.md }}>
          <Text style={[styles.greeting, { color: colors.muted }]}>{greeting}</Text>
          <Text style={[styles.title, { color: colors.onSurface }]}>
            {fullMonthLabel(month)}
          </Text>
        </View>

        {/* Month Selector */}
        <MonthSelector months={months} selected={month} onChange={setMonth} />

        {/* PWA install prompt (only shows on iPhone Safari) */}
        <PWAInstallBanner />

        {/* Hero balance card */}
        <View style={{ paddingHorizontal: spacing.lg, marginTop: spacing.md }}>
          <View style={[styles.hero, { backgroundColor: colors.brandTertiary }]}>
            <Image source={{ uri: HERO_BG }} style={StyleSheet.absoluteFill} contentFit="cover" />
            <LinearGradient
              colors={["rgba(255,249,250,0)", "rgba(45,27,34,0.55)"]}
              style={StyleSheet.absoluteFill}
            />
            <View style={styles.heroContent}>
              <Text style={styles.heroLabel}>Disponible este mes</Text>
              <Text testID="dashboard-balance" style={styles.heroAmount}>
                {formatCOP(summary.balance)}
              </Text>
              <View style={styles.heroRow}>
                <View style={styles.heroStat}>
                  <Text style={styles.heroStatLabel}>Ingresos</Text>
                  <Text testID="dashboard-income" style={styles.heroStatValue}>
                    {formatCOP(summary.incomeTotal)}
                  </Text>
                </View>
                <View style={styles.heroStat}>
                  <Text style={styles.heroStatLabel}>Gastos</Text>
                  <Text testID="dashboard-expense" style={styles.heroStatValue}>
                    {formatCOP(summary.expenseTotal)}
                  </Text>
                </View>
              </View>
            </View>
          </View>
        </View>

        {/* Budget cards 50/30/20 */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={[styles.sectionTitle, { color: colors.onSurface }]}>
              Método {state.budget.needsPct}/{state.budget.wantsPct}/{state.budget.savingsPct}
            </Text>
            <Pressable
              testID="edit-budget-btn"
              onPress={() => router.push("/budget-config")}
              hitSlop={8}
            >
              <Text style={{ color: colors.brandPrimary, fontWeight: "700", fontSize: 13 }}>
                Ajustar
              </Text>
            </Pressable>
          </View>
          <View style={{ gap: spacing.md }}>
            <BudgetCard
              testID="budget-card-needs"
              emoji="🏠"
              label="Necesidades"
              budget={summary.budget.needs}
              spent={summary.spent.needs}
            />
            <BudgetCard
              testID="budget-card-wants"
              emoji="🌸"
              label="Gustos"
              budget={summary.budget.wants}
              spent={summary.spent.wants}
            />
            <BudgetCard
              testID="budget-card-savings"
              emoji="💖"
              label="Ahorro"
              budget={summary.budget.savings}
              spent={summary.savedInGoalsThisMonth}
            />
          </View>
        </View>

        {/* Smart tips */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.onSurface, marginBottom: spacing.md }]}>
            Consejos
          </Text>
          <View style={{ gap: spacing.sm }}>
            {tips.map((tip, i) => (
              <View
                key={i}
                style={[
                  styles.tip,
                  { backgroundColor: colors.surfaceSecondary, borderColor: colors.border },
                ]}
              >
                <Text style={{ color: colors.onSurfaceSecondary, fontSize: 14, lineHeight: 20 }}>
                  {tip}
                </Text>
              </View>
            ))}
          </View>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  greeting: { fontSize: 13, fontWeight: "600" },
  title: { fontSize: 26, fontWeight: "800", marginTop: 2 },
  hero: {
    borderRadius: radius.lg,
    overflow: "hidden",
    minHeight: 180,
  },
  heroContent: {
    padding: spacing.xl,
    minHeight: 180,
    justifyContent: "flex-end",
  },
  heroLabel: { color: "#FFF9FA", fontSize: 13, fontWeight: "600", opacity: 0.9 },
  heroAmount: { color: "#FFF9FA", fontSize: 36, fontWeight: "800", marginTop: 4 },
  heroRow: { flexDirection: "row", marginTop: spacing.lg, gap: spacing.lg },
  heroStat: { flex: 1 },
  heroStatLabel: { color: "#FFF9FA", opacity: 0.85, fontSize: 12, fontWeight: "600" },
  heroStatValue: { color: "#FFF9FA", fontSize: 16, fontWeight: "700", marginTop: 2 },
  section: {
    marginTop: spacing.xl,
    paddingHorizontal: spacing.lg,
  },
  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: spacing.md,
  },
  sectionTitle: { fontSize: 18, fontWeight: "800" },
  tip: {
    padding: spacing.md,
    borderRadius: radius.md,
    borderWidth: StyleSheet.hairlineWidth,
  },
});
