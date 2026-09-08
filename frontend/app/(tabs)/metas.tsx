import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import Icon from "@react-native-vector-icons/ionicons";

import { radius, spacing, useTheme } from "@/src/theme";
import { useApp } from "@/src/context/AppContext";
import { GoalCard } from "@/src/components/GoalCard";
import { formatCOP } from "@/src/utils/currency";

export default function MetasScreen() {
  const insets = useSafeAreaInsets();
  const { colors } = useTheme();
  const { state } = useApp();
  const router = useRouter();

  const goals = state.goals;
  const totalTarget = goals.reduce((s, g) => s + g.targetAmount, 0);
  const totalSaved = goals.reduce((s, g) => s + g.savedAmount, 0);

  return (
    <View style={[styles.container, { backgroundColor: colors.surface }]}>
      <View style={{ paddingTop: insets.top + spacing.md, paddingHorizontal: spacing.lg }}>
        <View style={styles.headerRow}>
          <View>
            <Text style={[styles.title, { color: colors.onSurface }]}>Metas</Text>
            <Text style={[styles.subtitle, { color: colors.muted }]}>
              Tus sueños en camino
            </Text>
          </View>
          <Pressable
            testID="add-goal-btn"
            onPress={() => router.push("/add-goal")}
            style={[styles.addBtn, { backgroundColor: colors.brandPrimary }]}
          >
            <Icon name="add" size={22} color={colors.onBrandPrimary} />
          </Pressable>
        </View>

        {goals.length > 0 && (
          <View style={[styles.summary, { backgroundColor: colors.brandTertiary }]}>
            <View>
              <Text style={[styles.summaryLabel, { color: colors.onBrandTertiary }]}>
                Ahorrado total
              </Text>
              <Text style={[styles.summaryAmount, { color: colors.onBrandTertiary }]}>
                {formatCOP(totalSaved)}
              </Text>
              <Text style={[styles.summarySub, { color: colors.onBrandTertiary }]}>
                de {formatCOP(totalTarget)}
              </Text>
            </View>
            <Text style={{ fontSize: 40 }}>💖</Text>
          </View>
        )}
      </View>

      <ScrollView
        contentContainerStyle={{ padding: spacing.lg, paddingBottom: spacing["3xl"] }}
        showsVerticalScrollIndicator={false}
      >
        {goals.length === 0 ? (
          <View style={styles.empty}>
            <Text style={{ fontSize: 48 }}>✨</Text>
            <Text style={[styles.emptyTitle, { color: colors.onSurface }]}>
              ¿Qué sueño quieres cumplir?
            </Text>
            <Text style={[styles.emptyText, { color: colors.muted }]}>
              Crea tu primera meta de ahorro y visualiza tu progreso mes a mes.
            </Text>
            <Pressable
              testID="empty-add-goal-btn"
              onPress={() => router.push("/add-goal")}
              style={[styles.emptyBtn, { backgroundColor: colors.brandPrimary }]}
            >
              <Text style={{ color: colors.onBrandPrimary, fontWeight: "700" }}>
                Crear una meta
              </Text>
            </Pressable>
          </View>
        ) : (
          <View style={styles.grid}>
            {goals.map((g) => (
              <GoalCard
                key={g.id}
                goal={g}
                onPress={() => router.push(`/goal/${g.id}`)}
              />
            ))}
          </View>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  title: { fontSize: 26, fontWeight: "800" },
  subtitle: { fontSize: 13, fontWeight: "600", marginTop: 2 },
  addBtn: {
    width: 44,
    height: 44,
    borderRadius: radius.pill,
    alignItems: "center",
    justifyContent: "center",
  },
  summary: {
    marginTop: spacing.lg,
    padding: spacing.lg,
    borderRadius: radius.lg,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  summaryLabel: { fontSize: 12, fontWeight: "700" },
  summaryAmount: { fontSize: 24, fontWeight: "800", marginTop: 2 },
  summarySub: { fontSize: 12, fontWeight: "600", opacity: 0.8 },
  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: spacing.md,
  },
  empty: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: spacing["3xl"],
    gap: spacing.md,
  },
  emptyTitle: { fontSize: 18, fontWeight: "800", textAlign: "center" },
  emptyText: { fontSize: 13, textAlign: "center", paddingHorizontal: spacing.xl },
  emptyBtn: {
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.md,
    borderRadius: radius.pill,
    marginTop: spacing.sm,
  },
});
