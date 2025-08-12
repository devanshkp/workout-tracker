import { Typography } from "@/constants/Typography";
import { useThemeColors } from "@/hooks/useThemeColors";
import Ionicons from "@expo/vector-icons/Ionicons";
import React from "react";
import { Pressable, StyleSheet, Text, View, ViewStyle } from "react-native";
import { Gesture, GestureDetector } from "react-native-gesture-handler";
import Animated, {
  runOnJS,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from "react-native-reanimated";

type CalendarProps = {
  initialDate?: Date;
  selectedDate?: Date;
  onDatePress?: (date: Date) => void;
  style?: ViewStyle;
};

type GridItem =
  | { key: string; type: "spacer" }
  | { key: string; type: "day"; date: Date };

const WEEKDAY_LABELS = ["Mo", "Tu", "We", "Th", "Fr", "Sa", "Su"] as const;

function getDaysInMonth(year: number, monthIndex: number): number {
  // monthIndex is 0-based; passing 0 day to next month yields last day of current
  return new Date(year, monthIndex + 1, 0).getDate();
}

function addMonths(date: Date, delta: number): Date {
  return new Date(date.getFullYear(), date.getMonth() + delta, 1);
}

function areSameDay(a: Date | undefined, b: Date | undefined): boolean {
  if (!a || !b) return false;
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  );
}

export default function Calendar({
  initialDate,
  selectedDate: externallySelected,
  onDatePress,
  style,
}: CalendarProps) {
  const { colors } = useThemeColors();
  const styles = React.useMemo(() => createStyles(colors), [colors]);

  const today = React.useMemo(() => new Date(), []);
  const [visibleMonth, setVisibleMonth] = React.useState<Date>(() => {
    const base = initialDate ?? today;
    return new Date(base.getFullYear(), base.getMonth(), 1);
  });
  const [internalSelected, setInternalSelected] = React.useState<
    Date | undefined
  >(externallySelected);

  // Keep internalSelected in sync if controlled prop changes
  React.useEffect(() => {
    if (externallySelected) setInternalSelected(externallySelected);
  }, [externallySelected]);

  const year = visibleMonth.getFullYear();
  const monthIndex = visibleMonth.getMonth(); // 0-based

  const firstOfMonth = new Date(year, monthIndex, 1);
  // Convert JS Sunday-first getDay() to Monday-first index [0..6]
  const startDayIndex = (firstOfMonth.getDay() + 6) % 7;
  const daysInThisMonth = getDaysInMonth(year, monthIndex);

  // Build grid with spacers (no overflow dates displayed)
  const grid: GridItem[] = React.useMemo(() => {
    const items: GridItem[] = [];
    // Leading spacers so the 1st aligns under its weekday
    for (let i = 0; i < startDayIndex; i += 1) {
      items.push({ key: `lead-${i}`, type: "spacer" });
    }
    // Current month days
    for (let d = 1; d <= daysInThisMonth; d += 1) {
      const date = new Date(year, monthIndex, d);
      items.push({ key: `day-${date.toISOString()}`, type: "day", date });
    }
    // Trailing spacers to complete last row of 7
    const usedInLastRow = (startDayIndex + daysInThisMonth) % 7;
    const trailing = usedInLastRow === 0 ? 0 : 7 - usedInLastRow;
    for (let i = 0; i < trailing; i += 1) {
      items.push({ key: `trail-${i}`, type: "spacer" });
    }
    return items;
  }, [year, monthIndex, daysInThisMonth, startDayIndex]);

  const monthLabel = visibleMonth.toLocaleString(undefined, {
    month: "long",
    year: "numeric",
  });

  function handlePressDate(date: Date) {
    setInternalSelected(date);
    onDatePress?.(date);
  }

  // Swipe/slide animation state
  const translateX = useSharedValue(0);
  const [containerWidth, setContainerWidth] = React.useState(0);
  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: translateX.value }],
  }));

  const advanceMonth = React.useCallback((delta: number) => {
    setVisibleMonth((d) => addMonths(d, delta));
  }, []);

  const animateToMonth = React.useCallback(
    (delta: number) => {
      if (!containerWidth) {
        advanceMonth(delta);
        return;
      }
      const dir = delta; // +1 next (slide left), -1 prev (slide right)
      translateX.value = withTiming(
        -dir * containerWidth,
        { duration: 150 },
        (finished) => {
          if (finished) {
            runOnJS(advanceMonth)(delta);
            translateX.value = dir * containerWidth;
            translateX.value = withTiming(0, { duration: 150 });
          }
        }
      );
    },
    [advanceMonth, containerWidth, translateX]
  );

  const pan = React.useMemo(
    () =>
      Gesture.Pan()
        .onUpdate((e) => {
          translateX.value = e.translationX;
        })
        .onEnd((e) => {
          const threshold = Math.max(containerWidth * 0.05);
          if (e.translationX > threshold) {
            // swipe right → previous month
            translateX.value = withTiming(
              containerWidth,
              { duration: 120 },
              (finished) => {
                if (finished) {
                  runOnJS(advanceMonth)(-1);
                  translateX.value = -containerWidth;
                  translateX.value = withTiming(0, { duration: 150 });
                }
              }
            );
          } else if (e.translationX < -threshold) {
            // swipe left → next month
            translateX.value = withTiming(
              -containerWidth,
              { duration: 120 },
              (finished) => {
                if (finished) {
                  runOnJS(advanceMonth)(1);
                  translateX.value = containerWidth;
                  translateX.value = withTiming(0, { duration: 150 });
                }
              }
            );
          } else {
            translateX.value = withTiming(0, { duration: 150 });
          }
        }),
    [advanceMonth, containerWidth, translateX]
  );

  const isCurrentMonth =
    visibleMonth.getMonth() === today.getMonth() &&
    visibleMonth.getFullYear() === today.getFullYear();

  return (
    <GestureDetector gesture={pan}>
      <Animated.View
        style={[styles.container, style]}
        accessibilityRole="adjustable"
        accessibilityLabel="Calendar"
        onLayout={(e) => setContainerWidth(e.nativeEvent.layout.width)}
      >
        {/* Header */}
        <View style={styles.headerRow}>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Previous month"
            onPress={() => setVisibleMonth((d) => addMonths(d, -1))}
            style={styles.headerButton}
          >
            {({ pressed }) => (
              <Ionicons
                name="chevron-back"
                size={20}
                color={pressed ? colors.textPrimary : colors.textSubtle}
              />
            )}
          </Pressable>

          <Text
            style={[
              styles.monthLabel,
              isCurrentMonth && { color: colors.accent },
            ]}
          >
            {monthLabel}
          </Text>

          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Next month"
            onPress={() => setVisibleMonth((d) => addMonths(d, 1))}
            style={styles.headerButton}
          >
            {({ pressed }) => (
              <Ionicons
                name="chevron-forward"
                size={20}
                color={pressed ? colors.textPrimary : colors.textSubtle}
              />
            )}
          </Pressable>
        </View>

        {/* Weekday labels */}
        <View style={styles.weekdaysRow}>
          {WEEKDAY_LABELS.map((wd) => (
            <Text key={wd} style={styles.weekdayLabel}>
              {wd}
            </Text>
          ))}
        </View>

        {/* Grid */}
        <Animated.View style={[styles.grid, animatedStyle]}>
          {grid.map((item) => {
            if (item.type === "spacer") {
              return <View key={item.key} style={styles.cellSpacer} />;
            }
            const isToday = areSameDay(item.date, today);
            const isSelected = areSameDay(item.date, internalSelected);
            return (
              <Pressable
                key={item.key}
                accessibilityRole="button"
                onPress={() => handlePressDate(item.date)}
                style={({ pressed }) => [styles.cell]}
              >
                {({ pressed }) => (
                  <View style={styles.cellContainer}>
                    {/* Today's accent highlight only when nothing is selected */}
                    {isToday && (!internalSelected || isSelected) && (
                      <View
                        style={[
                          styles.highlightedCell,
                          { backgroundColor: colors.accent },
                        ]}
                      />
                    )}

                    {/* Pressed highlight (no selection yet). Avoid overriding today's accent unless something is selected */}
                    {pressed &&
                      !isSelected &&
                      (!isToday || !!internalSelected) && (
                        <View
                          style={[
                            styles.highlightedCell,
                            { backgroundColor: colors.bgTertiary },
                          ]}
                        />
                      )}

                    {/* Selected highlight */}
                    {isSelected && !isToday && (
                      <View
                        style={[
                          styles.highlightedCell,
                          { backgroundColor: colors.textPrimary },
                        ]}
                      />
                    )}

                    <Text
                      style={[
                        styles.cellLabel,
                        isSelected && !isToday && { color: colors.bgPrimary },
                        isToday &&
                          internalSelected &&
                          !isSelected && { color: colors.accent },
                      ]}
                    >
                      {item.date.getDate()}
                    </Text>
                  </View>
                )}
              </Pressable>
            );
          })}
        </Animated.View>
      </Animated.View>
    </GestureDetector>
  );
}

const createStyles = (colors: any) =>
  StyleSheet.create({
    container: {
      backgroundColor: colors.bgSecondary,
      borderRadius: 16,
      paddingHorizontal: 8,
      paddingTop: 10,
      paddingBottom: 12,
      borderWidth: 0.5,
      borderColor: colors.border,
    },
    headerRow: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      paddingHorizontal: 4,
      paddingBottom: 16,
    },
    headerButton: {
      padding: 8,
      borderRadius: 8,
    },
    monthLabel: {
      ...Typography.h2,
      color: colors.textPrimary,
    },
    weekdaysRow: {
      flexDirection: "row",
      paddingHorizontal: 4,
      paddingBottom: 12,
      borderBottomWidth: 1,
      borderBottomColor: colors.border,
    },
    weekdayLabel: {
      ...Typography.bodyTertiary,
      color: colors.textSubtle,
      width: `${100 / 7}%`,
      textAlign: "center",
    },
    grid: {
      flexDirection: "row",
      flexWrap: "wrap",
      alignItems: "center",
      paddingTop: 12,
    },
    cell: {
      width: `${100 / 7}%`,
      height: 40,
      borderRadius: 12,
      alignItems: "center",
      justifyContent: "center",
      marginVertical: 4,
    },
    cellSpacer: {
      width: `${100 / 7}%`,
      height: 40,
      marginVertical: 4,
    },
    cellSelected: {},
    cellLabel: {
      ...Typography.bodyTertiary,
      color: colors.textPrimary,
      fontWeight: "700",
    },
    cellLabelSelected: {
      color: colors.bgPrimary,
    },
    cellOutOfMonth: {
      color: colors.textSubtle,
      opacity: 0.5,
    },
    highlightedCell: {
      position: "absolute",
      height: 40,
      width: 40,
      borderRadius: 20,
    },
    cellContainer: {
      alignItems: "center",
      justifyContent: "center",
    },
  });
