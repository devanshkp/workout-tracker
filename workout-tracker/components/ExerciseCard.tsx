import { Typography } from "@/constants/Typography";
import Ionicons from "@expo/vector-icons/Ionicons";
import React from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
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
  top: number;
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
                <View style={styles.columnSet}>
                  <Text style={styles.setHeaderText}>SET</Text>
                </View>
                <View style={styles.columnPrevious}>
                  <Text style={styles.setHeaderText}>PREVIOUS</Text>
                </View>
                <View style={styles.columnWeight}>
                  <Text style={styles.setHeaderText}>KG</Text>
                </View>
                <View style={styles.columnReps}>
                  <Text style={styles.setHeaderText}>REPS</Text>
                </View>
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
        </>
      )}
    </View>
  );
}

const createStyles = (colors: any, top: number) =>
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
    columnSet: {
      flex: 1,
      alignItems: "center",
      justifyContent: "center",
    },
    columnPrevious: {
      flex: 2,
      alignItems: "center",
      justifyContent: "center",
    },
    columnWeight: {
      flex: 1,
      alignItems: "center",
      justifyContent: "center",
    },
    columnReps: {
      flex: 1,
      alignItems: "center",
      justifyContent: "center",
    },
    columnCheckbox: {
      flex: 1,
      alignItems: "center",
      justifyContent: "center",
    },
    setsContainer: {
      paddingBottom: 16,
    },
    setHeader: {
      flexDirection: "row",
      marginBottom: 8,
      paddingHorizontal: 12,
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
      paddingHorizontal: 12,
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
