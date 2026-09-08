import { useState } from "react";
import { Pressable, ScrollView, StyleSheet, Text, TextInput, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import Icon from "@react-native-vector-icons/ionicons";

import { radius, spacing, useTheme } from "@/src/theme";
import { useApp } from "@/src/context/AppContext";
import { useToast } from "@/src/components/Toast";

export default function BudgetConfigScreen() {
  const insets = useSafeAreaInsets();
  const { colors } = useTheme();
  const { state, updateBudget } = useApp();
  const toast = useToast();
  const router = useRouter();

  const [needs, setNeeds] = useState(String(state.budget.needsPct));
  const [wants, setWants] = useState(String(state.budget.wantsPct));
  const [savings, setSavings] = useState(String(state.budget.savingsPct));

  const n = parseInt(needs, 10) || 0;
  const w = parseInt(wants, 10) || 0;
  const s = parseInt(savings, 10) || 0;
  const total = n + w + s;
  const valid = total === 100;

  const presets = [
    { label: "50/30/20", n: 50, w: 30, s: 20 },
    { label: "60/20/20", n: 60, w: 20, s: 20 },
    { label: "70/20/10", n: 70, w: 20, s: 10 },
    { label: "40/30/30", n: 40, w: 30, s: 30 },
  ];

  const applyPreset = (p: { n: number; w: number; s: number }) => {
    setNeeds(String(p.n));
    setWants(String(p.w));
    setSavings(String(p.s));
  };

  const onSave = () => {
    if (!valid) {
      toast.show("Los porcentajes deben sumar 100", "warning");
      return;
    }
    updateBudget({ needsPct: n, wantsPct: w, savingsPct: s });
    toast.show("💗 Presupuesto actualizado", "success");
    router.back();
  };

  return (
    <View style={{ flex: 1, backgroundColor: colors.surface }}>
      <View style={[styles.header, { paddingTop: insets.top + spacing.sm }]}>
        <Pressable testID="close-budget" onPress={() => router.back()} hitSlop={12}>
          <Icon name="chevron-back" size={26} color={colors.onSurface} />
        </Pressable>
        <Text style={[styles.title, { color: colors.onSurface }]}>Presupuesto</Text>
        <View style={{ width: 32 }} />
      </View>

      <ScrollView contentContainerStyle={{ padding: spacing.lg, gap: spacing.lg }}>
        <Text style={{ color: colors.muted, fontSize: 13 }}>
          Ajusta cómo distribuir tus ingresos entre Necesidades, Gustos y Ahorro. La suma debe ser 100%.
        </Text>

        {/* Presets */}
        <View>
          <Text style={[styles.fieldLabel, { color: colors.muted }]}>Presets</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: spacing.sm }}>
            {presets.map((p) => (
              <Pressable
                key={p.label}
                testID={`preset-${p.label}`}
                onPress={() => applyPreset(p)}
                style={[styles.preset, { backgroundColor: colors.surfaceSecondary, borderColor: colors.border }]}
              >
                <Text style={{ color: colors.onSurfaceSecondary, fontWeight: "700" }}>{p.label}</Text>
              </Pressable>
            ))}
          </ScrollView>
        </View>

        {/* Fields */}
        <Field label="Necesidades 🏠" value={needs} onChange={setNeeds} testID="needs-input" />
        <Field label="Gustos 🌸" value={wants} onChange={setWants} testID="wants-input" />
        <Field label="Ahorro 💖" value={savings} onChange={setSavings} testID="savings-input" />

        <View
          style={[
            styles.totalBox,
            {
              backgroundColor: valid ? colors.surfaceTertiary : "#FFECEC",
              borderColor: valid ? colors.brandPrimary : colors.error,
            },
          ]}
        >
          <Text style={{ color: valid ? colors.brandPrimary : colors.error, fontWeight: "800", fontSize: 16 }}>
            Total: {total}%
          </Text>
          {!valid && (
            <Text style={{ color: colors.error, fontSize: 12, marginTop: 2 }}>Debe sumar 100</Text>
          )}
        </View>

        <Pressable
          testID="save-budget-btn"
          onPress={onSave}
          style={({ pressed }) => [
            styles.cta,
            { backgroundColor: valid ? colors.brandPrimary : colors.surfaceTertiary, opacity: pressed ? 0.85 : 1 },
          ]}
        >
          <Text style={{ color: valid ? colors.onBrandPrimary : colors.muted, fontWeight: "800", fontSize: 16 }}>
            Guardar
          </Text>
        </Pressable>
      </ScrollView>
    </View>
  );
}

function Field({
  label,
  value,
  onChange,
  testID,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  testID?: string;
}) {
  const { colors } = useTheme();
  return (
    <View>
      <Text style={[styles.fieldLabel, { color: colors.muted }]}>{label}</Text>
      <View
        style={[
          styles.pctField,
          { backgroundColor: colors.surfaceSecondary, borderColor: colors.border },
        ]}
      >
        <TextInput
          testID={testID}
          value={value}
          onChangeText={(t) => onChange(t.replace(/[^\d]/g, ""))}
          keyboardType="number-pad"
          maxLength={3}
          style={{ flex: 1, fontSize: 20, fontWeight: "700", color: colors.onSurfaceSecondary }}
        />
        <Text style={{ color: colors.muted, fontSize: 18, fontWeight: "700" }}>%</Text>
      </View>
    </View>
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
  preset: {
    paddingHorizontal: spacing.lg,
    height: 40,
    borderRadius: radius.pill,
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
  },
  pctField: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
    paddingHorizontal: spacing.md,
    height: 56,
    borderRadius: radius.md,
    borderWidth: StyleSheet.hairlineWidth,
  },
  totalBox: {
    padding: spacing.md,
    borderRadius: radius.md,
    alignItems: "center",
    borderWidth: 1,
  },
  cta: {
    height: 56,
    borderRadius: radius.pill,
    alignItems: "center",
    justifyContent: "center",
  },
});
