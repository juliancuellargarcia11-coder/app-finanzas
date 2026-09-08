import { StyleSheet, Text, View } from "react-native";

import { radius, spacing, useTheme } from "@/src/theme";
import { formatCOP } from "@/src/utils/currency";

type Props = {
  emoji: string;
  label: string;
  budget: number;
  spent: number;
  testID?: string;
};

export function BudgetCard({ emoji, label, budget, spent, testID }: Props) {
  const { colors } = useTheme();
  const pct = budget > 0 ? Math.min(1, spent / budget) : 0;
  const over = spent > budget && budget > 0;
  const available = Math.max(0, budget - spent);

  return (
    <View
      testID={testID}
      style={[styles.card, { backgroundColor: colors.surfaceSecondary, borderColor: colors.border }]}
    >
      <View style={styles.row}>
        <View style={[styles.emojiCircle, { backgroundColor: colors.brandTertiary }]}>
          <Text style={styles.emoji}>{emoji}</Text>
        </View>
        <View style={{ flex: 1 }}>
          <Text style={[styles.label, { color: colors.onSurfaceSecondary }]}>{label}</Text>
          <Text style={[styles.sub, { color: colors.muted }]}>
            {formatCOP(spent)} / {formatCOP(budget)}
          </Text>
        </View>
        <Text
          style={[
            styles.pct,
            { color: over ? colors.error : colors.brandPrimary },
          ]}
        >
          {Math.round(pct * 100)}%
        </Text>
      </View>
      <View style={[styles.barBg, { backgroundColor: colors.surfaceTertiary }]}>
        <View
          style={[
            styles.barFill,
            {
              width: `${Math.round(pct * 100)}%`,
              backgroundColor: over ? colors.error : colors.brandPrimary,
            },
          ]}
        />
      </View>
      <Text style={[styles.available, { color: colors.muted }]}>
        {over ? "Excedido" : `Disponible ${formatCOP(available)}`}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: radius.lg,
    padding: spacing.lg,
    borderWidth: StyleSheet.hairlineWidth,
    gap: spacing.md,
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.md,
  },
  emojiCircle: {
    width: 44,
    height: 44,
    borderRadius: radius.pill,
    alignItems: "center",
    justifyContent: "center",
  },
  emoji: { fontSize: 22 },
  label: { fontSize: 16, fontWeight: "700" },
  sub: { fontSize: 13, marginTop: 2 },
  pct: { fontSize: 18, fontWeight: "700" },
  barBg: {
    height: 8,
    borderRadius: radius.pill,
    overflow: "hidden",
  },
  barFill: {
    height: "100%",
    borderRadius: radius.pill,
  },
  available: { fontSize: 12 },
});
