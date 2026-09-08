import { Pressable, StyleSheet, Text, View } from "react-native";

import { radius, spacing, useTheme } from "@/src/theme";
import type { Transaction } from "@/src/types";
import { findExpenseCategory, findIncomeSource } from "@/src/data/categories";
import { formatCOP } from "@/src/utils/currency";
import { formatTime } from "@/src/utils/date";

type Props = {
  tx: Transaction;
  onPress?: () => void;
};

export function TransactionRow({ tx, onPress }: Props) {
  const { colors } = useTheme();
  const isIncome = tx.type === "income";
  const emoji = isIncome
    ? findIncomeSource(tx.sourceId).emoji
    : findExpenseCategory(tx.categoryId).emoji;
  const catLabel = isIncome
    ? findIncomeSource(tx.sourceId).name
    : findExpenseCategory(tx.categoryId).name;

  return (
    <Pressable
      testID={`tx-row-${tx.id}`}
      onPress={onPress}
      style={({ pressed }) => [
        styles.row,
        { backgroundColor: colors.surfaceSecondary, borderColor: colors.border, opacity: pressed ? 0.7 : 1 },
      ]}
    >
      <View style={[styles.emojiCircle, { backgroundColor: colors.brandTertiary }]}>
        <Text style={styles.emoji}>{emoji}</Text>
      </View>
      <View style={{ flex: 1 }}>
        <Text style={[styles.desc, { color: colors.onSurfaceSecondary }]} numberOfLines={1}>
          {tx.description || catLabel}
        </Text>
        <Text style={[styles.meta, { color: colors.muted }]} numberOfLines={1}>
          {catLabel} · {formatTime(tx.date)}
        </Text>
      </View>
      <Text
        style={[
          styles.amount,
          { color: isIncome ? colors.success : colors.onSurfaceSecondary },
        ]}
      >
        {isIncome ? "+" : "-"}
        {formatCOP(tx.amount)}
      </Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: "row",
    alignItems: "center",
    padding: spacing.md,
    gap: spacing.md,
    borderRadius: radius.lg,
    borderWidth: StyleSheet.hairlineWidth,
  },
  emojiCircle: {
    width: 44,
    height: 44,
    borderRadius: radius.pill,
    alignItems: "center",
    justifyContent: "center",
  },
  emoji: { fontSize: 22 },
  desc: { fontSize: 15, fontWeight: "600" },
  meta: { fontSize: 12, marginTop: 2 },
  amount: { fontSize: 15, fontWeight: "700" },
});
