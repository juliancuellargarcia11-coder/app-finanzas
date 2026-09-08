// Small dismissible banner that teaches iPhone Safari users how to install
// the PWA (Share → Add to Home Screen). No-op on native Expo Go and on
// browsers where the app is already running standalone.

import { useEffect, useState } from "react";
import { Platform, Pressable, StyleSheet, Text, View } from "react-native";
import Icon from "@react-native-vector-icons/ionicons";

import { radius, spacing, useTheme } from "@/src/theme";
import { storage } from "@/src/utils/storage";

const DISMISS_KEY = "pinkbudget:pwaInstallDismissed";

function isIOSSafariBrowser(): boolean {
  if (Platform.OS !== "web") return false;
  if (typeof navigator === "undefined" || typeof window === "undefined") return false;
  const ua = navigator.userAgent || "";
  const isIOS = /iPad|iPhone|iPod/.test(ua);
  const isStandalone =
    (window.matchMedia && window.matchMedia("(display-mode: standalone)").matches) ||
    // @ts-ignore iOS Safari legacy prop
    (window.navigator && window.navigator.standalone === true);
  const isSafari = /Safari/.test(ua) && !/CriOS|FxiOS|EdgiOS/.test(ua);
  return isIOS && isSafari && !isStandalone;
}

export function PWAInstallBanner() {
  const { colors } = useTheme();
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (!isIOSSafariBrowser()) return;
    (async () => {
      const dismissed = await storage.getItem<boolean>(DISMISS_KEY, false);
      if (!dismissed) setVisible(true);
    })();
  }, []);

  if (!visible) return null;

  const onDismiss = () => {
    storage.setItem(DISMISS_KEY, true);
    setVisible(false);
  };

  return (
    <View
      testID="pwa-install-banner"
      style={[
        styles.wrap,
        { backgroundColor: colors.brandPrimary, shadowColor: colors.brandPrimary },
      ]}
    >
      <Text style={{ fontSize: 22 }}>📲</Text>
      <View style={{ flex: 1 }}>
        <Text style={[styles.title, { color: colors.onBrandPrimary }]}>
          Instala PinkBudget en tu iPhone
        </Text>
        <Text style={[styles.body, { color: colors.onBrandPrimary }]}>
          Toca <Text style={{ fontWeight: "800" }}>Compartir</Text> ⬆️ y luego{" "}
          <Text style={{ fontWeight: "800" }}>Añadir a pantalla de inicio</Text>.
        </Text>
      </View>
      <Pressable testID="pwa-install-dismiss" onPress={onDismiss} hitSlop={12}>
        <Icon name="close" size={20} color={colors.onBrandPrimary} />
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.md,
    marginHorizontal: spacing.lg,
    marginTop: spacing.md,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
    borderRadius: radius.lg,
    shadowOpacity: 0.25,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 6 },
  },
  title: { fontSize: 14, fontWeight: "800" },
  body: { fontSize: 12, marginTop: 2, opacity: 0.95 },
});
