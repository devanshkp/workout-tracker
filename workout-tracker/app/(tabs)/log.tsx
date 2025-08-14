import DumbbellSvg from "@/assets/icons/exercise-dumbbell.svg";
import Calendar from "@/components/Calendar";
import { getGlobalStyles } from "@/constants/GlobalStyles";
import { Typography } from "@/constants/Typography";
import { useThemeColors } from "@/hooks/useThemeColors";
import { Ionicons } from "@expo/vector-icons";
import { useBottomTabBarHeight } from "@react-navigation/bottom-tabs";
import Color from "color";
import React from "react";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";

type Workout = {
  id: string;
  title: string;
  exercises: number;
  duration: string;
  volume: number;
};

const WORKOUTS: Workout[] = [
  {
    id: "upper-a",
    title: "Upper Body A",
    exercises: 7,
    duration: "1:23:40",
    volume: 1245,
  },
  {
    id: "lower-a",
    title: "Lower Body A",
    exercises: 5,
    duration: "1:12:34",
    volume: 2217,
  },
];

export default function LogScreen() {
  const tabBarHeight = useBottomTabBarHeight();
  const { colors } = useThemeColors();
  const styles = React.useMemo(() => createStyles(colors), [colors]);
  const GlobalStyles = React.useMemo(() => getGlobalStyles(colors), [colors]);

  return (
    <ScrollView
      style={{ backgroundColor: colors.bgPrimary }}
      contentContainerStyle={[
        GlobalStyles.screenContainer,
        { paddingBottom: tabBarHeight, paddingTop: 28 },
      ]}
    >
      <Calendar style={{ alignSelf: "stretch" }} onDatePress={() => {}} />
      <View>
        <Text style={styles.sectionTitle}>Recent Workouts</Text>
        <View style={{ marginBottom: 20 }} />
        {WORKOUTS.map((workout) => (
          <Pressable
            key={workout.id}
            style={({ pressed }) => [
              styles.workoutCard,
              pressed && {
                backgroundColor: Color(colors.bgSecondary)
                  .darken(0.2)
                  .toString(),
                borderColor: Color(colors.bgSecondary).darken(0.2).toString(),
              },
            ]}
          >
            <Text style={styles.workoutTitle}>{workout.title}</Text>
            <View style={styles.workoutMetaRow}>
              <View style={styles.workoutStat}>
                <Ionicons
                  name="time-outline"
                  size={14}
                  color={colors.textSubtle}
                />
                <Text style={styles.workoutMetaText}>{workout.duration}</Text>
              </View>
              <View style={styles.workoutStat}>
                <DumbbellSvg width={16} height={16} fill={colors.textSubtle} />
                <Text style={styles.workoutMetaText}>
                  {workout.exercises} exercises
                </Text>
              </View>
              <View style={styles.workoutStat}>
                <Text
                  style={[
                    styles.workoutMetaText,
                    { color: colors.accent, fontWeight: "500" },
                  ]}
                >
                  {workout.volume} kg
                </Text>
              </View>
            </View>
          </Pressable>
        ))}
      </View>
    </ScrollView>
  );
}

const createStyles = (colors: any) =>
  StyleSheet.create({
    sectionTitle: {
      ...Typography.h2,
      paddingHorizontal: 4,
      color: colors.textPrimary,
      paddingTop: 28,
    },
    workoutCard: {
      backgroundColor: colors.bgSecondary,
      borderRadius: 16,
      padding: 16,
      borderWidth: 0.5,
      borderColor: colors.border,
      marginBottom: 16,
    },
    workoutTitle: {
      ...Typography.h2,
      color: colors.textPrimary,
    },
    workoutStat: {
      gap: 4,
      flexDirection: "row",
      alignItems: "center",
    },
    workoutMetaRow: {
      marginTop: 8,
      flexDirection: "row",
      gap: 12,
      alignItems: "center",
    },

    workoutMetaText: {
      ...Typography.bodyTertiary,
      color: colors.textSubtle,
    },
  });
