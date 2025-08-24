import { Typography } from "@/constants/Typography";
import { useThemeColors } from "@/hooks/useThemeColors";
import { BlurView } from "expo-blur";
import React, { useEffect, useRef } from "react";
import { Animated, Platform, StyleSheet, Text, View } from "react-native";

type StatsPillProps = {
  timeText: string; // e.g. "24:52"
  totalSets: number; // e.g. 12
  totalVolume: number; // e.g. 2180
  unit?: "kg" | "lbs"; // default "kg"
};

export const StatsPill: React.FC<StatsPillProps> = ({
  timeText,
  totalSets,
  totalVolume,
  unit = "kg",
}) => {
  const pulse = useRef(new Animated.Value(0)).current;
  const { colors, scheme } = useThemeColors();
  const styles = React.useMemo(() => createStyles(colors), [colors]);

  useEffect(() => {
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(pulse, {
          toValue: 1,
          duration: 900,
          useNativeDriver: true,
        }),
        Animated.timing(pulse, {
          toValue: 0,
          duration: 900,
          useNativeDriver: true,
        }),
      ])
    );
    loop.start();
    return () => loop.stop();
  }, [pulse]);

  const scale = pulse.interpolate({
    inputRange: [0, 1],
    outputRange: [1, 1.35],
  });
  const opacity = pulse.interpolate({
    inputRange: [0, 1],
    outputRange: [1, 0.6],
  });

  return (
    <View style={styles.pill}>
      {/* Glass blur */}
      <BlurView
        intensity={Platform.select({ ios: 30, android: 20 })}
        tint={scheme ? "dark" : "light"}
        style={[StyleSheet.absoluteFillObject, { borderRadius: 50 }]}
      />

      {/* Content */}
      <View style={styles.row}>
        {/* dot + time */}
        <View style={styles.rowLeft}>
          <Animated.View
            style={[
              styles.dot,
              {
                backgroundColor: colors.accent,
                opacity,
                transform: [{ scale }],
                shadowColor: colors.accent,
              },
            ]}
          />
          <Text style={styles.timeText}>{timeText}</Text>
        </View>

        {/* stats */}
        <View style={styles.statsRow}>
          <View style={styles.statBlock}>
            <Text style={[styles.statNumber, { color: colors.textPrimary }]}>
              {totalSets}
            </Text>
            <Text style={[styles.statLabel, { color: colors.textSubtle }]}>
              sets
            </Text>
          </View>
          <View style={styles.statBlock}>
            <Text style={[styles.statNumber, { color: colors.textPrimary }]}>
              {formatVolume(totalVolume)}
            </Text>
            <Text style={[styles.statLabel, { color: colors.textSubtle }]}>
              {unit}
            </Text>
          </View>
        </View>
      </View>
    </View>
  );
};

const formatVolume = (n: number) => n.toLocaleString();

const createStyles = (colors: any) =>
  StyleSheet.create({
    pill: {
      borderRadius: 50,
      paddingHorizontal: 16,
      paddingVertical: 12,
      overflow: "hidden",
      marginBottom: 16,
      borderWidth: 1,
      borderColor: colors.border,
      backgroundColor: colors.bgSecondary,
    },

    row: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
    },
    rowLeft: {
      flexDirection: "row",
      alignItems: "center",
      marginLeft: 4,
      gap: 16,
    },
    dot: {
      width: 8,
      height: 8,
      borderRadius: 999,
      shadowOpacity: 0.8,
      shadowRadius: 3,
      shadowOffset: { width: 0, height: 0 },
      elevation: 2,
    },

    timeText: {
      fontSize: 24,
      fontWeight: "700",
      color: colors.accent,
    },

    statsRow: {
      flexDirection: "row",
      gap: 8,
    },
    statBlock: {
      alignItems: "center",
      justifyContent: "center",
      flexDirection: "row",
      backgroundColor: colors.bgTertiary,
      gap: 4,
      borderRadius: 24,
      paddingVertical: 8,
      paddingHorizontal: 12,
      borderWidth: 1,
      borderColor: colors.borderMore,
    },
    statNumber: {
      ...Typography.bodySecondary,
      fontWeight: "600",
    },
    statLabel: {
      ...Typography.bodyTertiary,
    },
  });
