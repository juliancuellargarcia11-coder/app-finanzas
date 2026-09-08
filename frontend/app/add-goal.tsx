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
import { GOAL_ICONS } from "@/src/data/categories";
import { formatAmountInput, parseAmount, formatCOP } from "@/src/utils/currency";

export default function AddGoalScreen() {
  const insets = useSafeAreaInsets();
  const { colors } = useTheme();
  const { addGoal } = useApp();
  const toast = useToast();
  const router = useRouter();

  const [name, setName] = useState("");
  const [targetStr, setTargetStr] = useState("");
  const [emoji, setEmoji] = useState(GOAL_ICONS[0].emoji);
  const [priority, setPriority] = useState<"low" | "medium" | "high">("medium");
  const [notes, setNotes] = useState("");

  const target = parseAmount(targetStr);
  const canSave = name.trim().length > 0 && target > 0;

  const onSave = () => {
    if (!canSave) {
      toast.show("Añade nombre y monto de la meta", "warning");
      return;
    }
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    addGoal({
      name: name.trim(),
      emoji,
      targetAmount: target,
      priority,
      color: colors.brandPrimary,
      notes: notes.trim() || undefined,
    });
    toast.show("🎯 Meta creada", "success");
    router.back();
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      style={{ flex: 1, backgroundColor: colors.surface }}
    >
      <View style={[styles.header, { paddingTop: insets.top + spacing.sm }]}>
        <Pressable testID="close-add-goal" onPress={() => router.back()} hitSlop={12}>
          <Icon name="close" size={26} color={colors.onSurface} />
        </Pressable>
        <Text style={[styles.title, { color: colors.onSurface }]}>Nueva meta</Text>
        <View style={{ width: 32 }} />
      </View>

      <ScrollView
        contentContainerStyle={{ padding: spacing.lg, paddingBottom: spacing["3xl"], gap: spacing.lg }}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        {/* Emoji picker */}
        <View>
          <Text style={[styles.fieldLabel, { color: colors.muted }]}>Icono</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: spacing.sm }}>
            {GOAL_ICONS.map((g) => {
              const active = emoji === g.emoji;
              return (
                <Pressable
                  key={g.emoji}
                  testID={`goal-emoji-${g.emoji}`}
                  onPress={() => setEmoji(g.emoji)}
                  style={[
                    styles.emojiChip,
                    {
                      backgroundColor: active ? colors.brandPrimary : colors.surfaceSecondary,
                      borderColor: active ? colors.brandPrimary : colors.border,
                    },
                  ]}
                >
                  <Text style={{ fontSize: 22 }}>{g.emoji}</Text>
                </Pressable>
              );
            })}
          </ScrollView>
        </View>

        {/* Name */}
        <View>
          <Text style={[styles.fieldLabel, { color: colors.muted }]}>Nombre</Text>
          <TextInput
            testID="goal-name-input"
            value={name}
            onChangeText={setName}
            placeholder="Ej. Viaje a la playa"
            placeholderTextColor={colors.muted}
            style={[
              styles.textInput,
              { backgroundColor: colors.surfaceSecondary, borderColor: colors.border, color: colors.onSurfaceSecondary },
            ]}
          />
        </View>

        {/* Target */}
        <View>
          <Text style={[styles.fieldLabel, { color: colors.muted }]}>Objetivo</Text>
          <View
            style={[
              styles.amountField,
              { backgroundColor: colors.surfaceSecondary, borderColor: colors.border },
            ]}
          >
            <Text style={{ color: colors.onSurfaceSecondary, fontSize: 20, fontWeight: "700" }}>$</Text>
            <TextInput
              testID="goal-target-input"
              value={formatAmountInput(targetStr)}
              onChangeText={setTargetStr}
              keyboardType="number-pad"
              placeholder="0"
              placeholderTextColor={colors.muted}
              style={{ flex: 1, fontSize: 22, fontWeight: "700", color: colors.onSurfaceSecondary }}
            />
          </View>
          {target > 0 && (
            <Text style={{ color: colors.brandPrimary, fontSize: 13, fontWeight: "700", marginTop: spacing.xs }}>
              {formatCOP(target)}
            </Text>
          )}
        </View>

        {/* Priority */}
        <View>
          <Text style={[styles.fieldLabel, { color: colors.muted }]}>Prioridad</Text>
          <View style={{ flexDirection: "row", gap: spacing.sm }}>
            {(["low", "medium", "high"] as const).map((p) => {
              const active = priority === p;
              const label = p === "low" ? "Baja" : p === "medium" ? "Media" : "Alta";
              return (
                <Pressable
                  key={p}
                  testID={`priority-${p}`}
                  onPress={() => setPriority(p)}
                  style={[
                    styles.priorityChip,
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
          </View>
        </View>

        {/* Notes */}
        <View>
          <Text style={[styles.fieldLabel, { color: colors.muted }]}>Notas (opcional)</Text>
          <TextInput
            testID="goal-notes-input"
            value={notes}
            onChangeText={setNotes}
            multiline
            placeholder="¿Por qué es importante esta meta?"
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

      <View style={[styles.footer, { paddingBottom: insets.bottom + spacing.md }]}>
        <Pressable
          testID="save-goal-btn"
          onPress={onSave}
          style={({ pressed }) => [
            styles.cta,
            { backgroundColor: canSave ? colors.brandPrimary : colors.surfaceTertiary, opacity: pressed ? 0.85 : 1 },
          ]}
        >
          <Text
            style={{
              color: canSave ? colors.onBrandPrimary : colors.muted,
              fontWeight: "800",
              fontSize: 16,
            }}
          >
            Crear meta
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
  fieldLabel: { fontSize: 12, fontWeight: "700", letterSpacing: 0.5, marginBottom: spacing.sm },
  textInput: {
    borderRadius: radius.md,
    borderWidth: StyleSheet.hairlineWidth,
    paddingHorizontal: spacing.md,
    height: 56,
    fontSize: 15,
  },
  amountField: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
    paddingHorizontal: spacing.md,
    height: 56,
    borderRadius: radius.md,
    borderWidth: StyleSheet.hairlineWidth,
  },
  emojiChip: {
    width: 56,
    height: 56,
    borderRadius: radius.pill,
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
  },
  priorityChip: {
    flex: 1,
    height: 44,
    borderRadius: radius.pill,
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  footer: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.md,
  },
  cta: {
    height: 56,
    borderRadius: radius.pill,
    alignItems: "center",
    justifyContent: "center",
  },
});
