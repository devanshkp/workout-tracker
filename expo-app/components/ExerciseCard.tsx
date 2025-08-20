import { Typography } from "@/constants/Typography";
import Ionicons from "@expo/vector-icons/Ionicons";
import React, { useEffect, useRef } from "react";
import {
  Animated,
  Easing,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";
import ButtonPrimary from "./Button";

type SetType = "warmup" | "normal" | "failure" | "dropset";

interface Set {
  id: string;
  type: SetType;
  setNumber: number;
  weight: number;
  reps: number;
  completed: boolean;
  previous?: string;
}

interface Exercise {
  id: string;
  name: string;
  isOpen: boolean;
  isNotesView: boolean;
  sets: Set[];
  notes: string;
  restTime: number;
}

interface ExerciseCardProps {
  exercise: Exercise;
  onToggle: () => void;
  onSetToggle: (setId: string) => void;
  onSwipe: (translationX: number) => void;
  onSetTypeChange: (setId: string, newType: SetType) => void;
  onAddSet: () => void;
  onSetPress: (setId: string, type: SetType) => void;
  colors: any;
}

export default function ExerciseCard({
  exercise,
  onToggle,
  onSetToggle,
  onSwipe,
  onSetTypeChange,
  onAddSet,
  onSetPress,
  colors,
}: ExerciseCardProps) {
  const styles = createStyles(colors);

  // Animation values
  const fadeAnim = useRef(new Animated.Value(exercise.isOpen ? 1 : 0)).current;
  const slideAnim = useRef(
    new Animated.Value(exercise.isOpen ? 0 : -20)
  ).current;
  const iconRotateAnim = useRef(
    new Animated.Value(exercise.isOpen ? 1 : 0)
  ).current;

  useEffect(() => {
    const duration = 250;
    const easing = Easing.bezier(0.4, 0.0, 0.2, 1);

    if (exercise.isOpen) {
      // Opening animation
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: duration,
          easing,
          useNativeDriver: true,
        }),
        Animated.timing(slideAnim, {
          toValue: 0,
          duration: duration,
          easing,
          useNativeDriver: true,
        }),
        Animated.timing(iconRotateAnim, {
          toValue: 1,
          duration: duration,
          easing,
          useNativeDriver: true,
        }),
      ]).start();
    } else {
      // Closing animation
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 0,
          duration: duration,
          easing,
          useNativeDriver: true,
        }),
        Animated.timing(slideAnim, {
          toValue: -20,
          duration: duration,
          easing,
          useNativeDriver: true,
        }),
        Animated.timing(iconRotateAnim, {
          toValue: 0,
          duration: duration,
          easing,
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [exercise.isOpen]);

  const iconRotation = iconRotateAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ["0deg", "180deg"],
  });

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
        <Animated.View style={{ transform: [{ rotate: iconRotation }] }}>
          <Ionicons name="chevron-down" size={20} color={colors.textPrimary} />
        </Animated.View>
      </Pressable>

      {exercise.isOpen && (
        <Animated.View
          style={{
            opacity: fadeAnim,
            transform: [{ translateX: slideAnim }],
          }}
        >
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
                    <View style={styles.columnSet}>
                      <Pressable
                        hitSlop={styles.setHitSlop}
                        onPress={() => onSetPress(set.id, set.type)}
                      >
                        <Text
                          style={[
                            styles.setText,
                            set.type === "warmup" && { color: colors.warmup },
                            set.type === "failure" && { color: colors.warning },
                            set.type === "dropset" && { color: colors.dropset },
                          ]}
                        >
                          {set.type === "warmup"
                            ? "W"
                            : set.type === "failure"
                            ? "F"
                            : set.type === "dropset"
                            ? "D"
                            : set.setNumber}
                        </Text>
                      </Pressable>
                    </View>

                    <View style={styles.columnPrevious}>
                      <Text style={[styles.setText, styles.setTextPrevious]}>
                        {set.previous || "-"}
                      </Text>
                    </View>

                    <View style={styles.columnWeight}>
                      <Text style={styles.setText}>{set.weight}</Text>
                    </View>

                    <View style={styles.columnReps}>
                      <Text style={styles.setText}>{set.reps}</Text>
                    </View>

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
              onPress={onAddSet}
              borderActive={false}
            />
          )}
        </Animated.View>
      )}
    </View>
  );
}

const createStyles = (colors: any) =>
  StyleSheet.create({
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
      paddingVertical: 20,
    },
    exerciseTitle: {
      ...Typography.h2,
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
    columnCheckbox: { width: "9%", textAlign: "center" },
    setsContainer: {
      paddingBottom: 16,
    },
    setHeader: {
      flexDirection: "row",
      marginBottom: 12,
      paddingHorizontal: 16,
      width: "100%",
    },
    setHeaderText: {
      ...Typography.bodyTertiary,
      color: colors.textSubtle,
    },
    setDivider: {
      height: 1,
      backgroundColor: colors.border,
    },
    rowDivider: {
      height: 1,
      backgroundColor: colors.border,
    },
    setHitSlop: {
      left: 8,
      right: 8,
      top: 8,
      bottom: 8,
    },
    setText: {
      ...Typography.bodySecondary,
      fontWeight: "600",
      color: colors.textPrimary,
      textAlign: "center",
    },
    setTextPrevious: {
      color: colors.textSubtle,
      fontWeight: "400",
    },
    setRow: {
      flexDirection: "row",
      alignItems: "center",
      paddingHorizontal: 16,
      paddingVertical: 12,
      width: "100%",
    },
    setRowCompleted: {
      backgroundColor: colors.bgTertiary,
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
  });
