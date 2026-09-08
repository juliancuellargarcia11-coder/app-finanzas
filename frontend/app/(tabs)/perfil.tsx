import { useState } from "react";
import { Pressable, ScrollView, StyleSheet, Switch, Text, TextInput, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import Icon from "@react-native-vector-icons/ionicons";

import { radius, spacing, useTheme } from "@/src/theme";
import { useApp } from "@/src/context/AppContext";
import { useToast } from "@/src/components/Toast";
import type { ThemePref } from "@/src/types";

export default function PerfilScreen() {
  const insets = useSafeAreaInsets();
  const { colors } = useTheme();
  const { state, updateProfile, setThemePref, resetAll } = useApp();
  const toast = useToast();
  const router = useRouter();
  const [name, setName] = useState(state.profile.name);

  const initial = state.profile.name.trim().charAt(0).toUpperCase() || "💗";

  const onSaveName = () => {
    updateProfile({ name });
    toast.show("💗 Perfil actualizado", "success");
  };

  const themeOpts: { id: ThemePref; label: string; icon: string }[] = [
    { id: "light", label: "Claro", icon: "sunny-outline" },
    { id: "dark", label: "Oscuro", icon: "moon-outline" },
    { id: "auto", label: "Auto", icon: "phone-portrait-outline" },
  ];

  return (
    <View style={[styles.container, { backgroundColor: colors.surface }]}>
      <ScrollView
        contentContainerStyle={{ paddingTop: insets.top + spacing.md, paddingBottom: spacing["3xl"] }}
        showsVerticalScrollIndicator={false}
      >
        {/* Hero avatar */}
        <View style={{ alignItems: "center", paddingHorizontal: spacing.lg }}>
          <View style={[styles.avatar, { backgroundColor: colors.brandPrimary }]}>
            <Text style={[styles.avatarText, { color: colors.onBrandPrimary }]}>{initial}</Text>
          </View>
          <Text style={[styles.name, { color: colors.onSurface }]}>
            {state.profile.name || "Configura tu perfil"}
          </Text>
          <Text style={[styles.currency, { color: colors.muted }]}>
            Pesos colombianos (COP)
          </Text>
        </View>

        {/* Name field */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.muted }]}>TU NOMBRE</Text>
          <View
            style={[
              styles.field,
              { backgroundColor: colors.surfaceSecondary, borderColor: colors.border },
            ]}
          >
            <TextInput
              testID="profile-name-input"
              value={name}
              onChangeText={setName}
              onEndEditing={onSaveName}
              placeholder="Ej. Sofía"
              placeholderTextColor={colors.muted}
              style={{ fontSize: 16, color: colors.onSurfaceSecondary, flex: 1 }}
            />
            <Pressable
              testID="save-name-btn"
              onPress={onSaveName}
              style={[styles.saveBtn, { backgroundColor: colors.brandPrimary }]}
            >
              <Text style={{ color: colors.onBrandPrimary, fontWeight: "700", fontSize: 13 }}>
                Guardar
              </Text>
            </Pressable>
          </View>
        </View>

        {/* Theme */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.muted }]}>TEMA</Text>
          <View style={styles.themeRow}>
            {themeOpts.map((t) => {
              const active = state.profile.themePref === t.id;
              return (
                <Pressable
                  key={t.id}
                  testID={`theme-${t.id}`}
                  onPress={() => setThemePref(t.id)}
                  style={[
                    styles.themeChip,
                    {
                      backgroundColor: active ? colors.brandPrimary : colors.surfaceSecondary,
                      borderColor: active ? colors.brandPrimary : colors.border,
                    },
                  ]}
                >
                  <Icon
                    name={t.icon as any}
                    size={18}
                    color={active ? colors.onBrandPrimary : colors.onSurfaceSecondary}
                  />
                  <Text
                    style={{
                      color: active ? colors.onBrandPrimary : colors.onSurfaceSecondary,
                      fontWeight: "700",
                      fontSize: 13,
                    }}
                  >
                    {t.label}
                  </Text>
                </Pressable>
              );
            })}
          </View>
        </View>

        {/* Options */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.muted }]}>PRESUPUESTO</Text>
          <RowLink
            testID="budget-config-link"
            icon="pie-chart-outline"
            label={`Método ${state.budget.needsPct}/${state.budget.wantsPct}/${state.budget.savingsPct}`}
            hint="Ajusta los porcentajes"
            onPress={() => router.push("/budget-config")}
          />
        </View>

        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.muted }]}>DATOS</Text>
          <RowLink
            testID="reset-link"
            icon="trash-outline"
            label="Reiniciar toda la app"
            hint="Elimina ingresos, gastos y metas"
            danger
            onPress={() => {
              resetAll();
              toast.show("Datos reiniciados", "warning");
            }}
          />
        </View>

        <Text style={[styles.footer, { color: colors.muted }]}>PinkBudget 💗 v1.0</Text>
      </ScrollView>
    </View>
  );
}

function RowLink({
  icon,
  label,
  hint,
  onPress,
  danger,
  testID,
}: {
  icon: string;
  label: string;
  hint?: string;
  onPress: () => void;
  danger?: boolean;
  testID?: string;
}) {
  const { colors } = useTheme();
  return (
    <Pressable
      testID={testID}
      onPress={onPress}
      style={({ pressed }) => [
        styles.rowLink,
        {
          backgroundColor: colors.surfaceSecondary,
          borderColor: colors.border,
          opacity: pressed ? 0.7 : 1,
        },
      ]}
    >
      <View
        style={[
          styles.rowIcon,
          {
            backgroundColor: danger ? "#FCE4EC" : colors.surfaceTertiary,
          },
        ]}
      >
        <Icon name={icon as any} size={18} color={danger ? colors.error : colors.brandPrimary} />
      </View>
      <View style={{ flex: 1 }}>
        <Text style={{ color: danger ? colors.error : colors.onSurfaceSecondary, fontWeight: "700", fontSize: 15 }}>
          {label}
        </Text>
        {hint ? (
          <Text style={{ color: colors.muted, fontSize: 12, marginTop: 2 }}>{hint}</Text>
        ) : null}
      </View>
      <Icon name="chevron-forward" size={18} color={colors.muted} />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  avatar: {
    width: 92,
    height: 92,
    borderRadius: radius.pill,
    alignItems: "center",
    justifyContent: "center",
    marginTop: spacing.md,
  },
  avatarText: { fontSize: 40, fontWeight: "800" },
  name: { fontSize: 22, fontWeight: "800", marginTop: spacing.md },
  currency: { fontSize: 13, fontWeight: "600", marginTop: 4 },
  section: { paddingHorizontal: spacing.lg, marginTop: spacing.xl },
  sectionTitle: { fontSize: 11, fontWeight: "700", marginBottom: spacing.sm, letterSpacing: 0.6 },
  field: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
    paddingHorizontal: spacing.md,
    height: 56,
    borderRadius: radius.md,
    borderWidth: StyleSheet.hairlineWidth,
  },
  saveBtn: {
    paddingHorizontal: spacing.md,
    height: 36,
    borderRadius: radius.pill,
    alignItems: "center",
    justifyContent: "center",
  },
  themeRow: { flexDirection: "row", gap: spacing.sm },
  themeChip: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    height: 44,
    borderRadius: radius.pill,
    borderWidth: 1,
  },
  rowLink: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.md,
    padding: spacing.md,
    borderRadius: radius.md,
    borderWidth: StyleSheet.hairlineWidth,
  },
  rowIcon: {
    width: 36,
    height: 36,
    borderRadius: radius.pill,
    alignItems: "center",
    justifyContent: "center",
  },
  footer: {
    textAlign: "center",
    fontSize: 12,
    fontWeight: "600",
    marginTop: spacing["2xl"],
  },
});
