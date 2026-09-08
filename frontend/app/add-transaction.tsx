import { useState } from "react";
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
import { useRouter } from "expo-router";
import Icon from "@react-native-vector-icons/ionicons";
import * as Haptics from "expo-haptics";

import { radius, spacing, useTheme } from "@/src/theme";
import { useApp } from "@/src/context/AppContext";
import { useToast } from "@/src/components/Toast";
import {
  EXPENSE_CATEGORIES,
  INCOME_SOURCES,
  PAYMENT_METHODS,
  type PaymentMethodId,
} from "@/src/data/categories";
import { formatAmountInput, parseAmount, formatCOP } from "@/src/utils/currency";

type Mode = "expense" | "income";

export default function AddTransactionScreen() {
  const insets = useSafeAreaInsets();
  const { colors } = useTheme();
  const { addExpense, addIncome } = useApp();
  const toast = useToast();
  const router = useRouter();

  const [mode, setMode] = useState<Mode>("expense");
  const [amountStr, setAmountStr] = useState("");
  const [description, setDescription] = useState("");
  const [categoryId, setCategoryId] = useState(EXPENSE_CATEGORIES[0].id);
  const [sourceId, setSourceId] = useState(INCOME_SOURCES[0].id);
  const [payment, setPayment] = useState<PaymentMethodId>("efectivo");
  const [notes, setNotes] = useState("");

  const amount = parseAmount(amountStr);
  const canSave = amount > 0;

  const onSave = () => {
    if (!canSave) {
      toast.show("Escribe una cantidad válida", "warning");
      return;
    }
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    const now = new Date().toISOString();
    if (mode === "expense") {
      addExpense({
        amount,
        date: now,
        description: description.trim(),
        categoryId,
        paymentMethod: payment,
        notes: notes.trim() || undefined,
      });
      toast.show("💗 Gasto guardado", "success");
    } else {
      addIncome({
        amount,
        date: now,
        description: description.trim(),
        sourceId,
        notes: notes.trim() || undefined,
      });
      toast.show("💗 Ingreso registrado", "success");
    }
    router.back();
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      style={{ flex: 1, backgroundColor: colors.surface }}
    >
      <View style={[styles.header, { paddingTop: insets.top + spacing.sm }]}>
        <Pressable
          testID="close-add"
          onPress={() => router.back()}
          hitSlop={12}
          style={{ padding: spacing.xs }}
        >
          <Icon name="close" size={26} color={colors.onSurface} />
        </Pressable>
        <Text style={[styles.title, { color: colors.onSurface }]}>Nuevo movimiento</Text>
        <View style={{ width: 32 }} />
      </View>

      <ScrollView
        contentContainerStyle={{ padding: spacing.lg, paddingBottom: spacing["3xl"], gap: spacing.lg }}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        {/* Type toggle */}
        <View style={[styles.toggle, { backgroundColor: colors.surfaceTertiary }]}>
          {(["expense", "income"] as const).map((m) => {
            const active = mode === m;
            return (
              <Pressable
                key={m}
                testID={`toggle-${m}`}
                onPress={() => {
                  Haptics.selectionAsync();
                  setMode(m);
                }}
                style={[
                  styles.toggleItem,
                  active && { backgroundColor: colors.brandPrimary },
                ]}
              >
                <Text
                  style={{
                    color: active ? colors.onBrandPrimary : colors.onSurfaceTertiary,
                    fontWeight: "700",
                  }}
                >
                  {m === "expense" ? "Gasto" : "Ingreso"}
                </Text>
              </Pressable>
            );
          })}
        </View>

        {/* Amount */}
        <View style={styles.amountBox}>
          <Text style={[styles.amountLabel, { color: colors.muted }]}>Cantidad</Text>
          <View style={styles.amountRow}>
            <Text style={[styles.amountSign, { color: colors.onSurface }]}>$</Text>
            <TextInput
              testID="amount-input"
              value={formatAmountInput(amountStr)}
              onChangeText={setAmountStr}
              keyboardType="number-pad"
              placeholder="0"
              placeholderTextColor={colors.muted}
              style={[styles.amountInput, { color: colors.onSurface }]}
            />
          </View>
          {amount > 0 && (
            <Text style={[styles.amountPreview, { color: colors.brandPrimary }]}>
              {formatCOP(amount)}
            </Text>
          )}
        </View>

        {/* Description */}
        <View>
          <Text style={[styles.fieldLabel, { color: colors.muted }]}>Descripción</Text>
          <TextInput
            testID="description-input"
            value={description}
            onChangeText={setDescription}
            placeholder={mode === "expense" ? "Ej. Almuerzo con amigas" : "Ej. Salario Septiembre"}
            placeholderTextColor={colors.muted}
            style={[
              styles.textInput,
              { backgroundColor: colors.surfaceSecondary, borderColor: colors.border, color: colors.onSurfaceSecondary },
            ]}
          />
        </View>

        {/* Category / Source */}
        <View>
          <Text style={[styles.fieldLabel, { color: colors.muted }]}>
            {mode === "expense" ? "Categoría" : "Fuente"}
          </Text>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={{ gap: spacing.sm, paddingRight: spacing.md }}
          >
            {(mode === "expense" ? EXPENSE_CATEGORIES : INCOME_SOURCES).map((c) => {
              const active = mode === "expense" ? categoryId === c.id : sourceId === c.id;
              return (
                <Pressable
                  key={c.id}
                  testID={`cat-${c.id}`}
                  onPress={() =>
                    mode === "expense" ? setCategoryId(c.id) : setSourceId(c.id)
                  }
                  style={[
                    styles.catChip,
                    {
                      backgroundColor: active ? colors.brandPrimary : colors.surfaceSecondary,
                      borderColor: active ? colors.brandPrimary : colors.border,
                    },
                  ]}
                >
                  <Text style={{ fontSize: 16 }}>{c.emoji}</Text>
                  <Text
                    style={{
                      color: active ? colors.onBrandPrimary : colors.onSurfaceSecondary,
                      fontWeight: "700",
                      fontSize: 13,
                    }}
                  >
                    {c.name}
                  </Text>
                </Pressable>
              );
            })}
          </ScrollView>
        </View>

        {/* Payment method (expense only) */}
        {mode === "expense" && (
          <View>
            <Text style={[styles.fieldLabel, { color: colors.muted }]}>Método de pago</Text>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={{ gap: spacing.sm, paddingRight: spacing.md }}
            >
              {PAYMENT_METHODS.map((p) => {
                const active = payment === p.id;
                return (
                  <Pressable
                    key={p.id}
                    testID={`pay-${p.id}`}
                    onPress={() => setPayment(p.id)}
                    style={[
                      styles.catChip,
                      {
                        backgroundColor: active ? colors.brandPrimary : colors.surfaceSecondary,
                        borderColor: active ? colors.brandPrimary : colors.border,
                      },
                    ]}
                  >
                    <Text style={{ fontSize: 14 }}>{p.emoji}</Text>
                    <Text
                      style={{
                        color: active ? colors.onBrandPrimary : colors.onSurfaceSecondary,
                        fontWeight: "700",
                        fontSize: 13,
                      }}
                    >
                      {p.name}
                    </Text>
                  </Pressable>
                );
              })}
            </ScrollView>
          </View>
        )}

        {/* Notes */}
        <View>
          <Text style={[styles.fieldLabel, { color: colors.muted }]}>Notas (opcional)</Text>
          <TextInput
            testID="notes-input"
            value={notes}
            onChangeText={setNotes}
            multiline
            placeholder="Añade una nota"
            placeholderTextColor={colors.muted}
            style={[
              styles.textInput,
              {
                backgroundColor: colors.surfaceSecondary,
                borderColor: colors.border,
                color: colors.onSurfaceSecondary,
                minHeight: 80,
                paddingTop: spacing.md,
              },
            ]}
          />
        </View>
      </ScrollView>

      <View style={[styles.footer, { paddingBottom: insets.bottom + spacing.md, backgroundColor: colors.surface }]}>
        <Pressable
          testID="save-transaction-btn"
          onPress={onSave}
          style={({ pressed }) => [
            styles.cta,
            {
              backgroundColor: canSave ? colors.brandPrimary : colors.surfaceTertiary,
              opacity: pressed ? 0.85 : 1,
            },
          ]}
        >
          <Text
            style={{
              color: canSave ? colors.onBrandPrimary : colors.muted,
              fontWeight: "800",
              fontSize: 16,
            }}
          >
            Guardar {mode === "expense" ? "gasto" : "ingreso"}
          </Text>
        </Pressable>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.md,
  },
  title: { fontSize: 18, fontWeight: "800" },
  toggle: {
    flexDirection: "row",
    padding: 4,
    borderRadius: radius.pill,
  },
  toggleItem: {
    flex: 1,
    height: 44,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: radius.pill,
  },
  amountBox: { alignItems: "center", gap: 4 },
  amountLabel: { fontSize: 12, fontWeight: "700", letterSpacing: 0.5 },
  amountRow: { flexDirection: "row", alignItems: "flex-start", gap: 4 },
  amountSign: { fontSize: 28, fontWeight: "700", marginTop: 12 },
  amountInput: {
    fontSize: 52,
    fontWeight: "800",
    minWidth: 100,
    textAlign: "center",
    padding: 0,
  },
  amountPreview: { fontSize: 13, fontWeight: "700" },
  fieldLabel: { fontSize: 12, fontWeight: "700", letterSpacing: 0.5, marginBottom: spacing.sm },
  textInput: {
    borderRadius: radius.md,
    borderWidth: StyleSheet.hairlineWidth,
    paddingHorizontal: spacing.md,
    height: 56,
    fontSize: 15,
  },
  catChip: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    height: 40,
    paddingHorizontal: spacing.md,
    borderRadius: radius.pill,
    borderWidth: 1,
    flexShrink: 0,
  },
  footer: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.md,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: "transparent",
  },
  cta: {
    height: 56,
    borderRadius: radius.pill,
    alignItems: "center",
    justifyContent: "center",
  },
});
