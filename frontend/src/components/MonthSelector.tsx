import { useEffect, useMemo, useRef } from "react";
import { FlatList, Pressable, StyleSheet, Text } from "react-native";
import * as Haptics from "expo-haptics";

import { radius, spacing, useTheme } from "@/src/theme";
import {
  labelForMonth,
  monthKey,
  parseMonthKey,
  shortLabelForMonth,
  type MonthKey,
} from "@/src/utils/date";

type Props = {
  months: MonthKey[]; // sorted ascending
  selected: MonthKey;
  onChange: (m: MonthKey) => void;
};

const ITEM_WIDTH = 128; // 120 min + 8 gap

export function MonthSelector({ months, selected, onChange }: Props) {
  const { colors } = useTheme();
  const listRef = useRef<FlatList<MonthKey>>(null);

  const selectedIdx = useMemo(
    () => Math.max(0, months.indexOf(selected)),
    [months, selected],
  );

  useEffect(() => {
    // Scroll the selected chip into view. Use scrollToOffset (works on web + native)
    // and center the chip roughly by offsetting for the leading padding.
    const t = setTimeout(() => {
      const offset = Math.max(0, selectedIdx * ITEM_WIDTH - 60);
      listRef.current?.scrollToOffset({ offset, animated: true });
    }, 80);
    return () => clearTimeout(t);
  }, [selectedIdx]);

  return (
    <FlatList
      ref={listRef}
      testID="month-selector"
      data={months}
      keyExtractor={(k) => k}
      horizontal
      showsHorizontalScrollIndicator={false}
      style={styles.list}
      contentContainerStyle={styles.content}
      getItemLayout={(_, index) => ({ length: ITEM_WIDTH, offset: ITEM_WIDTH * index, index })}
      onScrollToIndexFailed={() => {}}
      renderItem={({ item }) => {
        const isSelected = item === selected;
        const { year, month0 } = parseMonthKey(item);
        return (
          <Pressable
            testID={`month-chip-${item}`}
            onPress={() => {
              if (item !== selected) {
                Haptics.selectionAsync();
                onChange(item);
              }
            }}
            style={[
              styles.chip,
              {
                backgroundColor: isSelected ? colors.brandPrimary : colors.surfaceSecondary,
                borderColor: isSelected ? colors.brandPrimary : colors.border,
              },
            ]}
          >
            <Text
              style={{
                color: isSelected ? colors.onBrandPrimary : colors.onSurfaceSecondary,
                fontWeight: "700",
                fontSize: 14,
              }}
            >
              {shortLabelForMonth(year, month0)}
            </Text>
          </Pressable>
        );
      }}
    />
  );
}

export function fullMonthLabel(m: MonthKey): string {
  const { year, month0 } = parseMonthKey(m);
  return labelForMonth(year, month0);
}

export { monthKey };

const styles = StyleSheet.create({
  list: { flexGrow: 0, height: 56 },
  content: {
    paddingHorizontal: spacing.lg,
    gap: spacing.sm,
    alignItems: "center",
  },
  chip: {
    height: 36,
    minWidth: 120,
    borderRadius: radius.pill,
    paddingHorizontal: spacing.lg,
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
  },
});
