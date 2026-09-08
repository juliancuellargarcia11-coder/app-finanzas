import { useState, useMemo } from "react";
import {
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useLocalSearchParams, useRouter } from "expo-router";
import Icon from "@react-native-vector-icons/ionicons";
import * as Haptics from "expo-haptics";

import { radius, spacing, useTheme } from "@/src/theme";
import { useApp } from "@/src/context/AppContext";
import { useToast } from "@/src/components/Toast";
import { formatCOP, formatAmountInput, parseAmount } from "@/src/utils/currency";
import { formatDateShort } from "@/src/utils/date";

export default function GoalDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const insets = useSafeAreaInsets();
  const { colors } = useTheme();
  const { state, depositGoal, withdrawGoal, deleteGoal } = useApp();
  const toast = useToast();
  const router = useRouter();

  const goal = state.goals.find((g) => g.id === id);
  const [showInput, setShowInput] = useState<"deposit" | "withdraw" | null>(null);
  const [amountStr, setAmountStr] = useState("");

  const pct = useMemo(
    () => (goal && goal.targetAmount > 0 ? Math.min(1, goal.savedAmount / goal.targetAmount) : 0),
    [goal],
  );

  if (!goal) {
    return (
      <View style={[styles.container, { backgroundColor: colors.surface, paddingTop: insets.top + spacing.md }]}>
        <Text style={{ color: colors.onSurface, textAlign: "center", marginTop: 100, fontSize: 16 }}>
          Meta no encontrada
        </Text>
        <Pressable onPress={() => router.back()} style={{ padding: spacing.lg, alignSelf: "center" }}>
          <Text style={{ color: colors.brandPrimary, fontWeight: "700" }}>Volver</Text>
        </Pressable>
      </View>
    );
  }

  const missing = Math.max(0, goal.targetAmount - goal.savedAmount);

  // Suggested monthly savings assuming 12-month target
  const targetDate = goal.targetDate ? new Date(goal.targetDate) : null;
  const monthsLeft = targetDate
    ? Math.max(
        1,
        (targetDate.getFullYear() - new Date().getFullYear()) * 12 +
          (targetDate.getMonth() - new Date().getMonth()),
      )
    : 12;
  const perMonth = missing > 0 ? Math.ceil(missing / monthsLeft) : 0;

  const applyAmount = () => {
    const amount = parseAmount(amountStr);
    if (!amount) {
      toast.show("Escribe una cantidad", "warning");
      return;
    }
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    if (showInput === "deposit") {
      depositGoal(goal.id, amount);
      toast.show(`💗 +${formatCOP(amount)} añadidos`, "success");
    } else if (showInput === "withdraw") {
      withdrawGoal(goal.id, amount);
      toast.show(`Retirado ${formatCOP(amount)}`, "info");
    }
    setShowInput(null);
    setAmountStr("");

    if (showInput === "deposit" && goal.savedAmount + amount >= goal.targetAmount) {
      setTimeout(() => toast.show("🎉 ¡Has conseguido tu meta!", "success"), 400);
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      style={{ flex: 1, backgroundColor: colors.surface }}
    >
      <View style={[styles.header, { paddingTop: insets.top + spacing.sm }]}>
        <Pressable testID="close-goal" onPress={() => router.back()} hitSlop={12}>
          <Icon name="chevron-back" size={26} color={colors.onSurface} />
        </Pressable>
        <Text style={[styles.title, { color: colors.onSurface }]}>Meta</Text>
        <Pressable
          testID="delete-goal-btn"
          onPress={() => {
            deleteGoal(goal.id);
            toast.show("Meta eliminada", "warning");
            router.back();
          }}
          hitSlop={12}
        >
          <Icon name="trash-outline" size={22} color={colors.error} />
        </Pressable>
      </View>

      <ScrollView contentContainerStyle={{ padding: spacing.lg, paddingBottom: spacing["3xl"], gap: spacing.lg }}>
        {/* Hero */}
        <View style={[styles.hero, { backgroundColor: colors.brandTertiary }]}>
          <Text style={{ fontSize: 56 }}>{goal.emoji}</Text>
          <Text style={[styles.goalName, { color: colors.onBrandTertiary }]}>{goal.name}</Text>
          <Text style={[styles.progress, { color: colors.onBrandTertiary }]}>
            {formatCOP(goal.savedAmount)}
          </Text>
          <Text style={{ color: colors.onBrandTertiary, opacity: 0.85, fontSize: 13 }}>
            de {formatCOP(goal.targetAmount)}
          </Text>
          <View style={[styles.barBg, { backgroundColor: "rgba(255,255,255,0.35)" }]}>
            <View
              style={[
                styles.barFill,
                { width: `${Math.round(pct * 100)}%`, backgroundColor: colors.brandPrimary },
              ]}
            />
          </View>
          <Text style={{ color: colors.onBrandTertiary, fontWeight: "700", marginTop: spacing.xs }}>
            {Math.round(pct * 100)}% completado
          </Text>
        </View>

        {/* Stats */}
        <View style={styles.statsRow}>
          <View style={[styles.statCard, { backgroundColor: colors.surfaceSecondary, borderColor: colors.border }]}>
            <Text style={[styles.statLabel, { color: colors.muted }]}>Falta</Text>
            <Text style={[styles.statValue, { color: colors.onSurfaceSecondary }]}>{formatCOP(missing)}</Text>
          </View>
          <View style={[styles.statCard, { backgroundColor: colors.surfaceSecondary, borderColor: colors.border }]}>
            <Text style={[styles.statLabel, { color: colors.muted }]}>Sugerido / mes</Text>
            <Text style={[styles.statValue, { color: colors.brandPrimary }]}>{formatCOP(perMonth)}</Text>
          </View>
        </View>

        {/* Actions */}
        <View style={{ flexDirection: "row", gap: spacing.sm }}>
          <Pressable
            testID="deposit-btn"
            onPress={() => setShowInput("deposit")}
            style={[styles.actionBtn, { backgroundColor: colors.brandPrimary }]}
          >
            <Icon name="add" size={18} color={colors.onBrandPrimary} />
            <Text style={{ color: colors.onBrandPrimary, fontWeight: "800" }}>Añadir ahorro</Text>
          </Pressable>
          <Pressable
            testID="withdraw-btn"
            onPress={() => setShowInput("withdraw")}
            style={[styles.actionBtn, { backgroundColor: colors.surfaceSecondary, borderColor: colors.border, borderWidth: 1 }]}
          >
            <Icon name="remove" size={18} color={colors.onSurfaceSecondary} />
            <Text style={{ color: colors.onSurfaceSecondary, fontWeight: "800" }}>Retirar</Text>
          </Pressable>
        </View>

        {showInput && (
          <View style={[styles.inputCard, { backgroundColor: colors.surfaceSecondary, borderColor: colors.border }]}>
            <Text style={[styles.fieldLabel, { color: colors.muted }]}>
              {showInput === "deposit" ? "Cantidad a añadir" : "Cantidad a retirar"}
            </Text>
            <View style={{ flexDirection: "row", alignItems: "center", gap: spacing.sm }}>
              <Text style={{ color: colors.onSurfaceSecondary, fontSize: 20, fontWeight: "700" }}>$</Text>
              <TextInput
                testID="goal-amount-input"
                value={formatAmountInput(amountStr)}
                onChangeText={setAmountStr}
                keyboardType="number-pad"
                placeholder="0"
                placeholderTextColor={colors.muted}
                autoFocus
                style={{ flex: 1, fontSize: 24, fontWeight: "700", color: colors.onSurfaceSecondary }}
              />
              <Pressable
                testID="apply-goal-amount"
                onPress={applyAmount}
                style={[styles.applyBtn, { backgroundColor: colors.brandPrimary }]}
              >
                <Text style={{ color: colors.onBrandPrimary, fontWeight: "700" }}>Aplicar</Text>
              </Pressable>
            </View>
          </View>
        )}

        {/* History */}
        {goal.history.length > 0 && (
          <View>
            <Text style={[styles.fieldLabel, { color: colors.muted }]}>Historial</Text>
            <View style={{ gap: spacing.sm }}>
              {goal.history.map((h) => (
                <View
                  key={h.id}
                  style={[
                    styles.historyRow,
                    { backgroundColor: colors.surfaceSecondary, borderColor: colors.border },
                  ]}
                >
                  <View style={{ flex: 1 }}>
                    <Text style={{ color: colors.onSurfaceSecondary, fontWeight: "700" }}>
                      {h.amount > 0 ? "Depósito" : "Retiro"}
                    </Text>
                    <Text style={{ color: colors.muted, fontSize: 12, marginTop: 2 }}>
                      {formatDateShort(h.date)}
                    </Text>
                  </View>
                  <Text
                    style={{
                      color: h.amount > 0 ? colors.success : colors.error,
                      fontWeight: "800",
                    }}
                  >
                    {h.amount > 0 ? "+" : "-"}
                    {formatCOP(Math.abs(h.amount))}
                  </Text>
                </View>
              ))}
            </View>
          </View>
        )}
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.md,
  },
  title: { fontSize: 18, fontWeight: "800" },
  hero: {
    alignItems: "center",
    borderRadius: radius.lg,
    padding: spacing.xl,
    gap: spacing.xs,
  },
  goalName: { fontSize: 22, fontWeight: "800", marginTop: spacing.sm },
  progress: { fontSize: 32, fontWeight: "800", marginTop: spacing.sm },
  barBg: { marginTop: spacing.md, height: 10, width: "100%", borderRadius: radius.pill, overflow: "hidden" },
  barFill: { height: "100%", borderRadius: radius.pill },
  statsRow: { flexDirection: "row", gap: spacing.sm },
  statCard: {
    flex: 1,
    padding: spacing.md,
    borderRadius: radius.md,
    borderWidth: StyleSheet.hairlineWidth,
    gap: 4,
  },
  statLabel: { fontSize: 12, fontWeight: "700" },
  statValue: { fontSize: 18, fontWeight: "800" },
  actionBtn: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    height: 52,
    borderRadius: radius.pill,
  },
  inputCard: {
    padding: spacing.md,
    borderRadius: radius.md,
    borderWidth: StyleSheet.hairlineWidth,
    gap: spacing.sm,
  },
  fieldLabel: { fontSize: 12, fontWeight: "700", letterSpacing: 0.5 },
  applyBtn: {
    paddingHorizontal: spacing.md,
    height: 40,
    borderRadius: radius.pill,
    alignItems: "center",
    justifyContent: "center",
  },
  historyRow: {
    flexDirection: "row",
    alignItems: "center",
    padding: spacing.md,
    borderRadius: radius.md,
    borderWidth: StyleSheet.hairlineWidth,
  },
});
