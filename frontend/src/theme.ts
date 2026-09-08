// PinkBudget — Design tokens (Light + Dark)
// Colors mirror /app/design_guidelines.json exactly.

import { useMemo } from "react";
import { Appearance, StyleSheet, useColorScheme } from "react-native";

export type ColorScheme = "light" | "dark";

const light = {
  surface: "#FFF9FA",
  onSurface: "#2D1B22",
  surfaceSecondary: "#FFFFFF",
  onSurfaceSecondary: "#2D1B22",
  surfaceTertiary: "#FCE4EC",
  onSurfaceTertiary: "#880E4F",
  surfaceInverse: "#2D1B22",
  onSurfaceInverse: "#FFF9FA",
  muted: "#8D7A80",

  brand: "#E91E63",
  onBrand: "#FFFFFF",
  brandPrimary: "#D81B60",
  onBrandPrimary: "#FFFFFF",
  brandSecondary: "#CE93D8",
  onBrandSecondary: "#2D1B22",
  brandTertiary: "#F8BBD0",
  onBrandTertiary: "#880E4F",

  success: "#66BB6A",
  onSuccess: "#FFFFFF",
  warning: "#FFA726",
  onWarning: "#FFFFFF",
  error: "#EC407A",
  onError: "#FFFFFF",
  info: "#AB47BC",
  onInfo: "#FFFFFF",

  border: "#F4E9EB",
  borderStrong: "#F06292",
  divider: "#F4E9EB",
};

export type ThemeColors = typeof light;

const dark: ThemeColors = {
  surface: "#1D1418",
  onSurface: "#FFF9FA",
  surfaceSecondary: "#2A1E24",
  onSurfaceSecondary: "#FFF9FA",
  surfaceTertiary: "#3E2933",
  onSurfaceTertiary: "#F48FB1",
  surfaceInverse: "#FFF9FA",
  onSurfaceInverse: "#1D1418",
  muted: "#A8949A",

  brand: "#F48FB1",
  onBrand: "#1D1418",
  brandPrimary: "#F48FB1",
  onBrandPrimary: "#1D1418",
  brandSecondary: "#CE93D8",
  onBrandSecondary: "#1D1418",
  brandTertiary: "#3E2933",
  onBrandTertiary: "#F48FB1",

  success: "#81C784",
  onSuccess: "#0F2A11",
  warning: "#FFB74D",
  onWarning: "#3A2500",
  error: "#F48FB1",
  onError: "#3A0018",
  info: "#CE93D8",
  onInfo: "#2A0F35",

  border: "#3E2933",
  borderStrong: "#F06292",
  divider: "#3E2933",
};

export const spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  "2xl": 32,
  "3xl": 48,
} as const;

export const radius = {
  sm: 6,
  md: 12,
  lg: 20,
  pill: 999,
} as const;

export const font = {
  display: "Fraunces_400Regular",
  body: "Manrope_400Regular",
  bodyMedium: "Manrope_500Medium",
  bodySemi: "Manrope_600SemiBold",
  bodyBold: "Manrope_700Bold",
} as const;

export const defaultScheme = "light" satisfies ColorScheme;

export const themes: { light: ThemeColors; dark?: ThemeColors } = { light, dark };

// External override (used by ThemeProvider to force a manual theme).
let overrideScheme: ColorScheme | null = null;
const listeners = new Set<() => void>();

export function setColorScheme(scheme: ColorScheme | null) {
  overrideScheme = scheme;
  listeners.forEach((fn) => fn());
  Appearance.setColorScheme?.(scheme);
}

export function getOverrideScheme(): ColorScheme | null {
  return overrideScheme;
}

export function subscribeToScheme(cb: () => void) {
  listeners.add(cb);
  return () => listeners.delete(cb);
}

setColorScheme?.(null);

export function useTheme(): { scheme: ColorScheme; colors: ThemeColors } {
  const system = useColorScheme();
  const active: ColorScheme =
    overrideScheme && themes[overrideScheme]
      ? overrideScheme
      : system && themes[system]
        ? system
        : defaultScheme;
  return { scheme: active, colors: themes[active] ?? themes.light };
}

export function makeStyles<
  T extends StyleSheet.NamedStyles<T> | StyleSheet.NamedStyles<any>,
>(factory: (colors: ThemeColors) => T & StyleSheet.NamedStyles<any>): () => T {
  return function useStyles(): T {
    const { colors } = useTheme();
    return useMemo(() => StyleSheet.create(factory(colors)), [colors]);
  };
}
