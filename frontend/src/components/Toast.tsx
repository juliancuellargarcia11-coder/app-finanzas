import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withTiming,
} from "react-native-reanimated";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import * as Haptics from "expo-haptics";

import { radius, spacing, useTheme } from "@/src/theme";

type ToastKind = "success" | "info" | "warning" | "error";
type ToastMsg = { id: number; text: string; kind: ToastKind };

type ToastCtx = {
  show: (text: string, kind?: ToastKind) => void;
};

const Ctx = createContext<ToastCtx | null>(null);

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [msg, setMsg] = useState<ToastMsg | null>(null);
  const counter = useRef(0);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const insets = useSafeAreaInsets();
  const { colors } = useTheme();

  const opacity = useSharedValue(0);
  const translateY = useSharedValue(-24);

  const show = useCallback<ToastCtx["show"]>((text, kind = "success") => {
    counter.current += 1;
    setMsg({ id: counter.current, text, kind });
    if (kind === "success") Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    else if (kind === "warning") Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
    else if (kind === "error") Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
  }, []);

  useEffect(() => {
    if (!msg) return;
    opacity.value = withTiming(1, { duration: 200 });
    translateY.value = withSpring(0, { damping: 14 });
    if (timer.current) clearTimeout(timer.current);
    timer.current = setTimeout(() => {
      opacity.value = withTiming(0, { duration: 220 });
      translateY.value = withTiming(-24, { duration: 220 });
      setTimeout(() => setMsg(null), 260);
    }, 2400);
    return () => {
      if (timer.current) clearTimeout(timer.current);
    };
  }, [msg, opacity, translateY]);

  const animStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
    transform: [{ translateY: translateY.value }],
  }));

  const bg =
    msg?.kind === "warning"
      ? colors.warning
      : msg?.kind === "error"
        ? colors.error
        : msg?.kind === "info"
          ? colors.info
          : colors.brandPrimary;
  const fg =
    msg?.kind === "warning"
      ? colors.onWarning
      : msg?.kind === "error"
        ? colors.onError
        : msg?.kind === "info"
          ? colors.onInfo
          : colors.onBrandPrimary;

  return (
    <Ctx.Provider value={{ show }}>
      {children}
      {msg && (
        <View
          pointerEvents="box-none"
          style={[styles.wrapper, { top: insets.top + spacing.md }]}
        >
          <Animated.View style={animStyle}>
            <Pressable
              testID="toast"
              onPress={() => setMsg(null)}
              style={[styles.toast, { backgroundColor: bg }]}
            >
              <Text style={[styles.text, { color: fg }]} numberOfLines={2}>
                {msg.text}
              </Text>
            </Pressable>
          </Animated.View>
        </View>
      )}
    </Ctx.Provider>
  );
}

export function useToast(): ToastCtx {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error("useToast must be used inside ToastProvider");
  return ctx;
}

const styles = StyleSheet.create({
  wrapper: {
    position: "absolute",
    left: spacing.lg,
    right: spacing.lg,
    alignItems: "center",
    zIndex: 9999,
  },
  toast: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    borderRadius: radius.pill,
    maxWidth: "100%",
    shadowColor: "#000",
    shadowOpacity: 0.15,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 6 },
    elevation: 6,
  },
  text: {
    fontSize: 15,
    fontWeight: "600",
    textAlign: "center",
  },
});
