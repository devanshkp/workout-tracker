import ButtonPrimary from "@/components/Button";
import { Typography } from "@/constants/Typography";
import { useThemeColors } from "@/hooks/useThemeColors";
import Ionicons from "@expo/vector-icons/Ionicons";
import { useBottomTabBarHeight } from "@react-navigation/bottom-tabs";
import React from "react";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";

type Routine = {
  id: string;
  title: string;
  exercises: number;
  durationMins: number;
  lastDone: string;
};

const ROUTINES: Routine[] = [
  {
    id: "upper-a",
    title: "Upper Body A",
    exercises: 7,
    durationMins: 60,
    lastDone: "2 days ago",
  },
  {
    id: "lower-a",
    title: "Lower Body A",
    exercises: 5,
    durationMins: 52,
    lastDone: "1 days ago",
  },
  {
    id: "upper-b",
    title: "Upper Body B",
    exercises: 6,
    durationMins: 57,
    lastDone: "6 days ago",
  },
];

export default function Index() {
  const tabBarHeight = useBottomTabBarHeight();
  const { colors, accent } = useThemeColors();
  const styles = React.useMemo(
    () => createStyles(colors, accent),
    [colors, accent]
  );

  return (
    <ScrollView
      style={{ backgroundColor: colors.bgPrimary }}
      contentContainerStyle={[
        styles.container,
        { paddingBottom: tabBarHeight },
      ]}
      showsVerticalScrollIndicator={false}
    >
      {/* Week strip */}
      <View style={styles.weekStrip}>
        {WEEK_ITEMS.map((item) => (
          <View key={item.label} style={styles.weekItem}>
            <Text style={styles.weekDay}>{item.day}</Text>
            <View
              style={item.isToday ? styles.dateCircleActive : styles.dateCircle}
            >
              <Text
                style={item.isToday ? styles.dateTextActive : styles.dateText}
              >
                {item.label}
              </Text>
            </View>
            {item.hasDot ? (
              <View style={styles.dot} />
            ) : (
              <View style={{ height: 6 }} />
            )}
          </View>
        ))}
      </View>

      {/* Quick start */}
      <Text style={[styles.sectionTitle, { marginTop: 8 }]}>Quick start</Text>
      <View style={styles.quickRow}>
        <ButtonPrimary
          text="Start workout"
          textColor={colors.bgPrimary}
          buttonColor={colors.textPrimary}
          activeButtonColor={colors.textPrimary}
          activeTextColor={colors.bgPrimary}
          textStyle={Typography.button}
          style={{ flex: 1 }}
        />
        <ButtonPrimary
          text="History"
          buttonColor={colors.bgSecondary}
          iconName="time-outline"
          style={{ flex: 1 }}
        />
      </View>

      {/* Help banner */}
      <Pressable accessibilityRole="button" style={styles.helpBanner}>
        <Text style={styles.helpBannerText}>📚 How to log a workout</Text>
      </Pressable>

      {/* My Routines */}
      <View style={styles.sectionHeaderRow}>
        <Text style={styles.sectionTitle}>My Routines</Text>
        <Pressable accessibilityRole="button" style={styles.addRow}>
          <Ionicons name="add" size={18} color={accent} />
          <Text style={styles.addText}>Add</Text>
        </Pressable>
      </View>

      <View style={{ height: 20 }} />
      {ROUTINES.map((routine) => (
        <Pressable key={routine.id} style={styles.routineCard}>
          <Text style={styles.routineTitle}>{routine.title}</Text>
          <View style={styles.routineMetaRow}>
            <Text style={styles.routineMetaText}>
              {routine.exercises} exercises ~{routine.durationMins} mins
            </Text>
            <View style={styles.lastDoneRow}>
              <Ionicons
                name="hourglass-outline"
                size={14}
                color={colors.textSubtle}
                style={{ marginRight: 4 }}
              />
              <Text style={styles.lastDoneText}>{routine.lastDone}</Text>
            </View>
          </View>
        </Pressable>
      ))}
    </ScrollView>
  );
}

const WEEK_ITEMS = [
  { day: "FRI", label: "25", hasDot: false, isToday: false },
  { day: "SAT", label: "26", hasDot: false, isToday: false },
  { day: "SUN", label: "27", hasDot: false, isToday: false },
  { day: "MON", label: "28", hasDot: false, isToday: false },
  { day: "TUE", label: "29", hasDot: true, isToday: false },
  { day: "WED", label: "30", hasDot: false, isToday: false },
  { day: "THU", label: "31", hasDot: false, isToday: true },
] as const;

const createStyles = (colors: any, accent: string) =>
  StyleSheet.create({
    container: {
      backgroundColor: colors.bgPrimary,
      paddingTop: 16,
      paddingHorizontal: 12,
    },
    weekStrip: {
      flexDirection: "row",
      alignItems: "flex-start",
      justifyContent: "space-between",
      paddingVertical: 8,
      borderBottomWidth: 1,
      borderBottomColor: colors.border,
      marginBottom: 16,
    },
    weekItem: {
      alignItems: "center",
      width: 44,
    },
    weekDay: {
      ...Typography.bodyMini,
      color: colors.textSubtle,
      marginBottom: 6,
    },
    dateCircle: {
      height: 32,
      width: 32,
      borderRadius: 20,
      alignItems: "center",
      justifyContent: "center",
    },
    dateCircleActive: {
      height: 32,
      width: 32,
      borderRadius: 20,
      backgroundColor: accent,
      alignItems: "center",
      justifyContent: "center",
    },
    dateText: {
      ...Typography.bodyTertiary,
      fontWeight: "bold",
      color: colors.textPrimary,
    },
    dateTextActive: {
      ...Typography.bodyTertiary,
      color: colors.bgPrimary,
    },
    dot: {
      marginTop: 1,
      marginBottom: 6,
      height: 6,
      width: 6,
      borderRadius: 3,
      backgroundColor: accent,
    },
    sectionHeaderRow: {
      marginTop: 24,
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
    },
    sectionTitle: {
      ...Typography.h2,
      paddingHorizontal: 4,
      color: colors.textPrimary,
    },
    quickRow: {
      marginTop: 20,
      flexDirection: "row",
      alignItems: "center",
      gap: 12,
    },
    helpBanner: {
      marginTop: 12,
      backgroundColor: accent,
      height: 56,
      borderRadius: 16,
      alignItems: "center",
      justifyContent: "center",
      paddingHorizontal: 16,
    },
    helpBannerText: {
      ...Typography.button,
      color: colors.bgPrimary,
    },
    addRow: {
      flexDirection: "row",
      alignItems: "center",
      gap: 4,
      paddingHorizontal: 4,
    },
    addText: {
      ...Typography.bodySecondary,
      fontWeight: "500",
      color: accent,
    },
    routineCard: {
      backgroundColor: colors.bgSecondary,
      borderRadius: 16,
      padding: 16,
      borderWidth: 1,
      borderColor: colors.border,
      marginBottom: 12,
    },
    routineTitle: {
      ...Typography.h2,
      color: colors.textPrimary,
    },
    routineMetaRow: {
      marginTop: 8,
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
    },
    routineMetaText: {
      ...Typography.bodySecondary,
      color: colors.textSubtle,
    },
    lastDoneRow: {
      flexDirection: "row",
      alignItems: "center",
      gap: 2,
    },
    lastDoneText: {
      ...Typography.bodyTertiary,
      color: colors.textSubtle,
    },
  });
