import ButtonPrimary from "@/components/Button";
import { getGlobalStyles } from "@/constants/GlobalStyles";
import { Typography } from "@/constants/Typography";
import { useThemeColors } from "@/hooks/useThemeColors";
import Ionicons from "@expo/vector-icons/Ionicons";
import { useRouter } from "expo-router";
import React, { useState } from "react";
import { Dimensions, Pressable, StyleSheet, Text, View } from "react-native";
import {
  GestureHandlerRootView,
  ScrollView,
} from "react-native-gesture-handler";
import { useSafeAreaInsets } from "react-native-safe-area-context";

const { width: screenWidth } = Dimensions.get("window");

interface Exercise {
  id: string;
  name: string;
  isOpen: boolean;
  isNotesView: boolean;
  sets: Array<{
    id: string;
    type: "warmup" | "working";
    setNumber: number;
    weight: number;
    reps: number;
    completed: boolean;
    previous?: string;
  }>;
  notes: string;
  restTime: number; // seconds
}

export default function ActiveWorkoutScreen() {
  const { top } = useSafeAreaInsets();

  const { colors } = useThemeColors();
  const styles = React.useMemo(() => createStyles(colors, top), [colors, top]);
  const GlobalStyles = React.useMemo(() => getGlobalStyles(colors), [colors]);
  const router = useRouter();

  const [exercises, setExercises] = useState<Exercise[]>([
    {
      id: "1",
      name: "Incline Bench Press (Dumbbell)",
      isOpen: true,
      isNotesView: false,
      sets: [
        {
          id: "1",
          type: "warmup",
          setNumber: 0,
          weight: 25,
          reps: 8,
          completed: true,
          previous: "25kg x 2",
        },
        {
          id: "2",
          type: "working",
          setNumber: 1,
          weight: 25,
          reps: 8,
          completed: false,
          previous: "25kg x 2",
        },
      ],
      notes: "",
      restTime: 180, // 3 minutes
    },
    {
      id: "2",
      name: "Squats",
      isOpen: false,
      isNotesView: false,
      sets: [
        {
          id: "1",
          type: "working",
          setNumber: 1,
          weight: 80,
          reps: 10,
          completed: false,
        },
      ],
      notes: "",
      restTime: 120,
    },
    {
      id: "3",
      name: "Deadlifts",
      isOpen: false,
      isNotesView: false,
      sets: [
        {
          id: "1",
          type: "working",
          setNumber: 1,
          weight: 100,
          reps: 8,
          completed: false,
        },
      ],
      notes: "",
      restTime: 180,
    },
  ]);

  const [restTimer, setRestTimer] = useState(112);

  const toggleExercise = (exerciseId: string) => {
    setExercises((prev) =>
      prev.map((ex) =>
        ex.id === exerciseId
          ? { ...ex, isOpen: !ex.isOpen, isNotesView: false }
          : ex
      )
    );
  };

  const toggleSetCompleted = (exerciseId: string, setId: string) => {
    setExercises((prev) =>
      prev.map((ex) =>
        ex.id === exerciseId
          ? {
              ...ex,
              sets: ex.sets.map((set) =>
                set.id === setId ? { ...set, completed: !set.completed } : set
              ),
            }
          : ex
      )
    );
  };

  const handleSwipe = (exerciseId: string, translationX: number) => {
    if (Math.abs(translationX) > 50) {
      setExercises((prev) =>
        prev.map((ex) =>
          ex.id === exerciseId ? { ...ex, isNotesView: translationX < 0 } : ex
        )
      );
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  const calculateWorkoutStats = () => {
    const totalExercises = exercises.length;
    const totalSets = exercises.reduce((sum, ex) => sum + ex.sets.length, 0);
    const totalVolume = exercises.reduce(
      (sum, ex) =>
        sum +
        ex.sets.reduce((setSum, set) => setSum + set.weight * set.reps, 0),
      0
    );
    return { totalExercises, totalSets, totalVolume };
  };

  const stats = calculateWorkoutStats();

  return (
    <GestureHandlerRootView
      style={{ flex: 1, backgroundColor: colors.bgPrimary }}
    >
      {/* Navigation Bar */}
      <View style={styles.navBackgroundContainer}>
        <View style={styles.navContent}>
          <View style={styles.leftContainer}>
            <Pressable onPress={router.back}>
              {({ pressed }) => (
                <Ionicons
                  name="arrow-back"
                  size={24}
                  color={pressed ? colors.textSubtle : colors.textPrimary}
                />
              )}
            </Pressable>
          </View>
          <View style={styles.centerContainer}>
            <Pressable>
              {({ pressed }) => (
                <Ionicons
                  name="time-outline"
                  size={24}
                  color={pressed ? colors.textSubtle : colors.textPrimary}
                />
              )}
            </Pressable>
          </View>
          <View style={styles.rightContainer}>
            <Pressable style={[styles.endButton]}>
              <Text style={styles.endButtonText}>End</Text>
            </Pressable>
          </View>
        </View>
      </View>
      <ScrollView
        style={{ backgroundColor: colors.bgPrimary }}
        contentContainerStyle={[GlobalStyles.screenContainer, styles.container]}
        showsVerticalScrollIndicator={false}
      >
        {/* Workout Summary */}
        <View style={styles.summaryCard}>
          <View style={styles.summaryItem}>
            <Text style={styles.summaryLabel}>Duration</Text>
            <Text style={styles.summaryValue}>24:52</Text>
          </View>
          <View style={styles.summaryItem}>
            <Text style={styles.summaryLabel}>Exercises</Text>
            <Text style={styles.summaryValue}>{stats.totalExercises}</Text>
          </View>
          <View style={styles.summaryItem}>
            <Text style={styles.summaryLabel}>Sets</Text>
            <Text style={styles.summaryValue}>{stats.totalSets}</Text>
          </View>
          <View style={styles.summaryItem}>
            <Text style={styles.summaryLabel}>Volume</Text>
            <Text style={styles.summaryValue}>
              {stats.totalVolume.toLocaleString()}kg
            </Text>
          </View>
        </View>

        {/* Exercise Cards */}
        {exercises.map((exercise) => (
          <ExerciseCard
            key={exercise.id}
            exercise={exercise}
            onToggle={() => toggleExercise(exercise.id)}
            onSetToggle={(setId) => toggleSetCompleted(exercise.id, setId)}
            onSwipe={(translationX) => handleSwipe(exercise.id, translationX)}
            colors={colors}
            top={top}
          />
        ))}

        {/* Add Exercise Button */}
        <ButtonPrimary
          text="Add Exercise"
          iconName="add"
          buttonColor={colors.accent}
        />
      </ScrollView>

      {/* Bottom Timer Controls */}
      {/* <View style={styles.timerContainer}>
        <Pressable style={styles.timerButton}>
          <Text style={styles.timerButtonText}>-15</Text>
        </Pressable>
        <View style={styles.timerDisplay}>
          <Text style={styles.timerText}>{formatTime(restTimer)}</Text>
        </View>
        <Pressable style={styles.timerButton}>
          <Text style={styles.timerButtonText}>+15</Text>
        </Pressable>
        <Pressable style={styles.skipButton}>
          <Text style={styles.skipButtonText}>Skip</Text>
        </Pressable>
      </View> */}
    </GestureHandlerRootView>
  );
}

interface ExerciseCardProps {
  exercise: Exercise;
  onToggle: () => void;
  onSetToggle: (setId: string) => void;
  onSwipe: (translationX: number) => void;
  colors: any;
  top: number;
}

function ExerciseCard({
  exercise,
  onToggle,
  onSetToggle,
  onSwipe,
  colors,
  top,
}: ExerciseCardProps) {
  const styles = createStyles(colors, top);

  return (
    <View style={[styles.exerciseCard]}>
      {/* Header */}
      <Pressable style={styles.exerciseHeader} onPress={onToggle}>
        <Text
          style={[
            styles.exerciseTitle,
            exercise.isOpen
              ? styles.exerciseTitleOpen
              : styles.exerciseTitleClosed,
          ]}
        >
          {exercise.name}
        </Text>
        <Ionicons
          name={exercise.isOpen ? "ellipsis-vertical" : "chevron-down"}
          size={20}
          color={colors.textPrimary}
        />
      </Pressable>

      {exercise.isOpen && (
        <>
          {/* Rest Timer */}
          {!exercise.isNotesView && (
            <View style={styles.restTimer}>
              <Ionicons name="time-outline" size={16} color={colors.accent} />
              <Text style={styles.restTimerText}>
                Rest: {Math.floor(exercise.restTime / 60)}:
                {(exercise.restTime % 60).toString().padStart(2, "0")}
              </Text>
            </View>
          )}

          {/* Sets Table */}
          {!exercise.isNotesView && (
            <View style={styles.setsContainer}>
              <View style={styles.setHeader}>
                <Text style={[styles.setHeaderText, styles.columnSet]}>
                  SET
                </Text>
                <Text style={[styles.setHeaderText, styles.columnPrevious]}>
                  PREVIOUS
                </Text>
                <Text style={[styles.setHeaderText, styles.columnWeight]}>
                  KG
                </Text>
                <Text style={[styles.setHeaderText, styles.columnReps]}>
                  REPS
                </Text>
                <View style={styles.columnCheckbox} />
              </View>
              <View style={styles.setDivider} />
              {exercise.sets.map((set, index) => (
                <React.Fragment key={set.id}>
                  <View
                    style={[
                      styles.setRow,
                      set.completed && styles.setRowCompleted,
                    ]}
                  >
                    <Text
                      style={[
                        styles.setText,
                        styles.columnSet,
                        set.type === "warmup" && { color: colors.warmup },
                      ]}
                    >
                      {set.type === "warmup" ? "W" : set.setNumber}
                    </Text>

                    <Text
                      style={[
                        styles.setText,
                        styles.setTextPrevious,
                        styles.columnPrevious,
                      ]}
                    >
                      {set.previous || "-"}
                    </Text>

                    <Text style={[styles.setText, styles.columnWeight]}>
                      {set.weight}
                    </Text>

                    <Text style={[styles.setText, styles.columnReps]}>
                      {set.reps}
                    </Text>

                    <View style={styles.columnCheckbox}>
                      <Pressable
                        style={[
                          styles.checkbox,
                          set.completed && styles.checkboxCompleted,
                        ]}
                        onPress={() => onSetToggle(set.id)}
                      >
                        {set.completed && (
                          <Ionicons
                            name="checkmark"
                            size={20}
                            color={colors.bgPrimary}
                          />
                        )}
                      </Pressable>
                    </View>
                  </View>
                  {index < exercise.sets.length - 1 && (
                    <View style={styles.rowDivider} />
                  )}
                </React.Fragment>
              ))}
            </View>
          )}

          {/* Notes Section */}
          {exercise.isNotesView && (
            <View style={styles.notesContainer}>
              <Text style={styles.notesPlaceholder}>Add notes here...</Text>
            </View>
          )}

          {/* Add Set Button */}
          {!exercise.isNotesView && (
            <ButtonPrimary
              text="Add Set"
              iconName="add"
              buttonColor={colors.bgTertiary}
              style={{ margin: 12, marginTop: 0 }}
            />
          )}
        </>
      )}
    </View>
  );
}

const createStyles = (colors: any, top: number) =>
  StyleSheet.create({
    container: {
      paddingBottom: 100, // Space for timer controls
    },
    navBackgroundContainer: {
      backgroundColor: colors.bgSecondary,
      justifyContent: "flex-end",
      paddingTop: top,
      borderBottomWidth: 0.5,
      borderColor: colors.border,
    },
    navContent: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      paddingHorizontal: 16,
      paddingVertical: 8,
      borderRadius: 8,
    },
    leftContainer: {
      flex: 1,
      alignItems: "flex-start",
    },
    centerContainer: {
      flex: 1,
      alignItems: "center",
    },
    rightContainer: {
      flex: 1,
      alignItems: "flex-end",
    },

    endButton: {
      backgroundColor: colors.warning,
      paddingHorizontal: 12,
      paddingVertical: 8,
      borderRadius: 8,
    },
    endButtonText: {
      color: colors.textPrimary,
      fontSize: 16,
      fontWeight: "500",
    },
    summaryCard: {
      backgroundColor: colors.bgSecondary,
      borderRadius: 4,
      padding: 16,
      marginBottom: 20,
      flexDirection: "row",
      justifyContent: "space-between",
    },
    summaryItem: {
      alignItems: "flex-start",
      flex: 1,
    },
    summaryLabel: {
      color: colors.textSubtle,
      fontSize: 12,
      marginBottom: 4,
      textAlign: "left",
    },
    summaryValue: {
      color: colors.textPrimary,
      fontSize: 20,
      fontWeight: "700",
      textAlign: "left",
    },
    exerciseCard: {
      backgroundColor: colors.bgSecondary,
      borderRadius: 12,
      marginBottom: 16,
      overflow: "hidden",
    },
    exerciseHeader: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      padding: 16,
    },
    exerciseTitle: {
      ...Typography.body,
      flex: 1,
    },
    exerciseTitleOpen: {
      color: colors.textPrimary,
      fontWeight: "600",
    },
    exerciseTitleClosed: {
      color: colors.textSubtle,
      fontWeight: "400",
    },
    restTimer: {
      flexDirection: "row",
      alignItems: "center",
      paddingHorizontal: 16,
      paddingBottom: 24,
    },
    restTimerText: {
      ...Typography.body,
      color: colors.accent,
      marginLeft: 6,
    },
    columnSet: { width: "10%", textAlign: "center" },
    columnPrevious: { width: "40%", textAlign: "center" },
    columnWeight: { width: "15%", textAlign: "center" },
    columnReps: { width: "25%", textAlign: "center" },
    columnCheckbox: { width: "8%", textAlign: "center" },
    setsContainer: {
      paddingBottom: 16,
    },
    setHeader: {
      flexDirection: "row",
      marginBottom: 8,
      paddingHorizontal: 12,
    },
    setHeaderText: {
      ...Typography.bodyTertiary,
      color: colors.textSubtle,
    },
    checkboxHeader: {
      width: 20,
    },
    setDivider: {
      height: 1,
      backgroundColor: colors.border,
    },
    rowDivider: {
      height: 1,
      backgroundColor: colors.border,
    },
    setText: {
      ...Typography.bodySecondary,
      fontWeight: "600",
      color: colors.textPrimary,
    },
    setTextPrevious: {
      color: colors.textSubtle,
      fontWeight: "400",
    },
    setRow: {
      flexDirection: "row",
      alignItems: "center",
      paddingHorizontal: 12,
      paddingVertical: 12,
    },
    setRowCompleted: {
      backgroundColor: colors.bgTertiary,
    },
    setNumber: {
      color: colors.textPrimary,
      fontSize: 14,
      flex: 1,
    },
    warmupSet: {
      color: colors.warmup,
    },
    setPrevious: {
      color: colors.textPrimary,
      fontSize: 14,
      flex: 1,
    },
    setWeight: {
      color: colors.textPrimary,
      fontSize: 14,
      flex: 1,
    },
    setReps: {
      color: colors.textPrimary,
      fontSize: 14,
      flex: 1,
    },
    checkbox: {
      width: 24,
      height: 24,
      borderWidth: 1,
      borderColor: colors.textSubtle,
      borderRadius: 4,
      alignItems: "center",
      justifyContent: "center",
      alignSelf: "flex-end",
    },
    checkboxCompleted: {
      backgroundColor: colors.textSubtle,
    },
    notesContainer: {
      paddingHorizontal: 16,
      paddingBottom: 16,
      minHeight: 60,
    },
    notesPlaceholder: {
      color: colors.textSubtle,
      fontSize: 14,
    },
    addSetButton: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center",
      backgroundColor: colors.bgTertiary,
      padding: 12,
      marginHorizontal: 16,
      marginBottom: 16,
      borderRadius: 8,
    },
    addSetText: {
      color: colors.textPrimary,
      fontSize: 14,
      fontWeight: "500",
      marginLeft: 8,
    },
    addExerciseButton: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center",
      backgroundColor: "#00BCD4",
      padding: 16,
      borderRadius: 12,
      marginTop: 8,
    },
    addExerciseText: {
      color: colors.textPrimary,
      fontSize: 16,
      fontWeight: "600",
      marginLeft: 8,
    },
    timerContainer: {
      position: "absolute",
      bottom: 0,
      left: 0,
      right: 0,
      backgroundColor: colors.bgSecondary,
      flexDirection: "row",
      alignItems: "center",
      padding: 16,
      borderTopWidth: 1,
      borderTopColor: colors.border,
    },
    timerButton: {
      padding: 8,
    },
    timerButtonText: {
      color: colors.textPrimary,
      fontSize: 14,
    },
    timerDisplay: {
      flex: 1,
      alignItems: "center",
    },
    timerText: {
      color: colors.textPrimary,
      fontSize: 24,
      fontWeight: "600",
    },
    skipButton: {
      backgroundColor: "#00BCD4",
      paddingHorizontal: 16,
      paddingVertical: 8,
      borderRadius: 8,
    },
    skipButtonText: {
      color: colors.textPrimary,
      fontSize: 14,
      fontWeight: "600",
    },
  });
