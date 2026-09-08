import { Pressable, StyleSheet, Text, View } from "react-native";

import { radius, spacing, useTheme } from "@/src/theme";
import { formatCOP, formatCOPCompact } from "@/src/utils/currency";
import type { Goal } from "@/src/types";

type Props = {
  goal: Goal;
  onPress: () => void;
};

export function GoalCard({ goal, onPress }: Props) {
  const { colors } = useTheme();
  const pct =
    goal.targetAmount > 0
      ? Math.min(1, goal.savedAmount / goal.targetAmount)
      : 0;

  return (
    <Pressable
      testID={`goal-card-${goal.id}`}
      onPress={onPress}
      style={({ pressed }) => [
        styles.card,
        {
          backgroundColor: colors.surfaceSecondary,
          borderColor: colors.border,
          opacity: pressed ? 0.85 : 1,
        },
      ]}
    >
      <View style={[styles.emojiCircle, { backgroundColor: colors.brandTertiary }]}>
        <Text style={styles.emoji}>{goal.emoji}</Text>
      </View>
      <Text style={[styles.name, { color: colors.onSurfaceSecondary }]} numberOfLines={1}>
        {goal.name}
      </Text>
      <Text style={[styles.amount, { color: colors.brandPrimary }]}>
        {formatCOPCompact(goal.savedAmount)}
      </Text>
      <Text style={[styles.target, { color: colors.muted }]}>
        de {formatCOP(goal.targetAmount)}
      </Text>
      <View style={[styles.barBg, { backgroundColor: colors.surfaceTertiary }]}>
        <View
          style={[
            styles.barFill,
            { width: `${Math.round(pct * 100)}%`, backgroundColor: colors.brandPrimary },
          ]}
        />
      </View>
      <Text style={[styles.pct, { color: colors.muted }]}>
        {Math.round(pct * 100)}% completado
      </Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    flex: 1,
    borderRadius: radius.lg,
    padding: spacing.lg,
    borderWidth: StyleSheet.hairlineWidth,
    gap: 4,
    minHeight: 200,
  },
  emojiCircle: {
    width: 44,
    height: 44,
    borderRadius: radius.pill,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: spacing.sm,
  },
  emoji: { fontSize: 22 },
  name: { fontSize: 15, fontWeight: "700" },
  amount: { fontSize: 22, fontWeight: "800", marginTop: 4 },
  target: { fontSize: 12 },
  barBg: {
    marginTop: spacing.sm,
    height: 6,
    borderRadius: radius.pill,
    overflow: "hidden",
  },
  barFill: { height: "100%", borderRadius: radius.pill },
  pct: { fontSize: 11, marginTop: 4 },
});
