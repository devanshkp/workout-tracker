import ButtonPrimary from "@/components/Button";
import { getGlobalStyles } from "@/constants/GlobalStyles";
import { Typography } from "@/constants/Typography";
import { useThemeColors } from "@/hooks/useThemeColors";
import Ionicons from "@expo/vector-icons/Ionicons";
import { useRouter } from "expo-router";
import React, { useState } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import {
  GestureHandlerRootView,
  ScrollView,
} from "react-native-gesture-handler";
import { useSafeAreaInsets } from "react-native-safe-area-context";

type SetType = "warmup" | "normal" | "failure" | "dropset";

interface Set {
  id: string;
  type: SetType;
  setNumber: number; // 0 for non-numbered sets, sequential for numbered sets
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
  restTime: number; // seconds
}

// Function to calculate set numbers based on the rules
const calculateSetNumbers = (sets: Set[]): Set[] => {
  let normalSetCounter = 0;
  return sets.map((set) => {
    if (set.type === "warmup" || set.type === "dropset") {
      return { ...set, setNumber: 0 }; // 0 indicates no numbering
    } else {
      normalSetCounter++;
      return { ...set, setNumber: normalSetCounter };
    }
  });
};

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
      sets: calculateSetNumbers([
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
          type: "normal",
          setNumber: 1,
          weight: 25,
          reps: 8,
          completed: false,
          previous: "25kg x 2",
        },
        {
          id: "3",
          type: "failure",
          setNumber: 2,
          weight: 30,
          reps: 6,
          completed: false,
          previous: "30kg x 6",
        },
        {
          id: "4",
          type: "normal",
          setNumber: 3,
          weight: 25,
          reps: 8,
          completed: false,
          previous: "25kg x 8",
        },
        {
          id: "5",
          type: "dropset",
          setNumber: 0,
          weight: 20,
          reps: 12,
          completed: false,
          previous: "20kg x 12",
        },
        {
          id: "6",
          type: "normal",
          setNumber: 4,
          weight: 25,
          reps: 8,
          completed: false,
          previous: "25kg x 8",
        },
      ]),
      notes: "",
      restTime: 180, // 3 minutes
    },
    {
      id: "2",
      name: "Squats",
      isOpen: false,
      isNotesView: false,
      sets: calculateSetNumbers([
        {
          id: "1",
          type: "normal",
          setNumber: 1,
          weight: 80,
          reps: 10,
          completed: false,
        },
      ]),
      notes: "",
      restTime: 120,
    },
    {
      id: "3",
      name: "Deadlifts",
      isOpen: false,
      isNotesView: false,
      sets: calculateSetNumbers([
        {
          id: "1",
          type: "normal",
          setNumber: 1,
          weight: 100,
          reps: 8,
          completed: false,
        },
      ]),
      notes: "",
      restTime: 180,
    },
  ]);

  const [selectedSet, setSelectedSet] = useState<{
    exerciseId: string;
    setId: string;
    type: SetType;
  } | null>(null);
  const [showSetTypeModal, setShowSetTypeModal] = useState(false);

  // Function to update set type and recalculate numbering
  const updateSetType = (
    exerciseId: string,
    setId: string,
    newType: SetType
  ) => {
    setExercises((prev) =>
      prev.map((ex) => {
        if (ex.id === exerciseId) {
          const updatedSets = ex.sets.map((set) =>
            set.id === setId ? { ...set, type: newType } : set
          );
          return { ...ex, sets: calculateSetNumbers(updatedSets) };
        }
        return ex;
      })
    );
  };

  // Function to add a new set (defaults to normal type)
  const addSet = (exerciseId: string) => {
    setExercises((prev) =>
      prev.map((ex) => {
        if (ex.id === exerciseId) {
          const newSet: Set = {
            id: Date.now().toString(), // Simple ID generation
            type: "normal",
            setNumber: 0, // Will be calculated
            weight: 0,
            reps: 0,
            completed: false,
          };
          const updatedSets = [...ex.sets, newSet];
          return { ...ex, sets: calculateSetNumbers(updatedSets) };
        }
        return ex;
      })
    );
  };

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
            onSetTypeChange={(setId, newType) =>
              updateSetType(exercise.id, setId, newType)
            }
            onAddSet={() => addSet(exercise.id)}
            onSetPress={(setId, type) => {
              setSelectedSet({
                exerciseId: exercise.id,
                setId,
                type,
              });
              setShowSetTypeModal(true);
            }}
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

      {/* Set Type Selection Modal */}
      {showSetTypeModal && selectedSet && (
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Change Set Type</Text>

            <View style={styles.modalOptions}>
              {(["warmup", "normal", "failure", "dropset"] as SetType[]).map(
                (type) => (
                  <Pressable
                    key={type}
                    style={[
                      styles.modalOption,
                      selectedSet.type === type && styles.modalOptionSelected,
                    ]}
                    onPress={() => {
                      updateSetType(
                        selectedSet.exerciseId,
                        selectedSet.setId,
                        type
                      );
                      setShowSetTypeModal(false);
                      setSelectedSet(null);
                    }}
                  >
                    <Text
                      style={[
                        styles.modalOptionText,
                        selectedSet.type === type &&
                          styles.modalOptionTextSelected,
                      ]}
                    >
                      {type === "warmup"
                        ? "Warmup (W)"
                        : type === "normal"
                        ? "Normal (1,2,3...)"
                        : type === "failure"
                        ? "Failure (F)"
                        : "Drop Set (D)"}
                    </Text>
                    {selectedSet.type === type && (
                      <Ionicons
                        name="checkmark"
                        size={20}
                        color={colors.accent}
                      />
                    )}
                  </Pressable>
                )
              )}
            </View>

            <View style={styles.modalButtons}>
              <Pressable
                style={styles.modalButton}
                onPress={() => {
                  setShowSetTypeModal(false);
                  setSelectedSet(null);
                }}
              >
                <Text style={styles.modalButtonText}>Cancel</Text>
              </Pressable>
            </View>
          </View>
        </View>
      )}

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
  onSetTypeChange: (setId: string, newType: SetType) => void;
  onAddSet: () => void;
  onSetPress: (setId: string, type: SetType) => void;
  colors: any;
  top: number;
}

function ExerciseCard({
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
                      <Pressable onPress={() => onSetPress(set.id, set.type)}>
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
    columnSet: {
      flex: 1,
      alignItems: "center",
      justifyContent: "center",
      borderWidth: 1,
      borderColor: "red",
    },
    columnPrevious: {
      flex: 2,
      alignItems: "center",
      justifyContent: "center",
      borderWidth: 1,
      borderColor: "blue",
    },
    columnWeight: {
      flex: 1,
      alignItems: "center",
      justifyContent: "center",
      borderWidth: 1,
      borderColor: "green",
    },
    columnReps: {
      flex: 1,
      alignItems: "center",
      justifyContent: "center",
      borderWidth: 1,
      borderColor: "yellow",
    },
    columnCheckbox: {
      flex: 1,
      alignItems: "center",
      justifyContent: "center",
      borderWidth: 1,
      borderColor: "purple",
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
    modalOverlay: {
      position: "absolute",
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: "rgba(0,0,0,0.75)",
      justifyContent: "center",
      alignItems: "center",
      zIndex: 1000,
    },
    modalContent: {
      backgroundColor: colors.bgSecondary,
      borderRadius: 12,
      padding: 24,
      width: "80%",
      alignItems: "center",
    },
    modalTitle: {
      ...Typography.h2,
      color: colors.textPrimary,
      marginBottom: 20,
      textAlign: "center",
    },
    modalOptions: {
      width: "100%",
      marginBottom: 20,
    },
    modalOption: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      paddingVertical: 12,
      paddingHorizontal: 16,
      borderRadius: 8,
      marginBottom: 8,
    },
    modalOptionSelected: {
      backgroundColor: colors.bgTertiary,
      borderColor: colors.accent,
      borderWidth: 1,
    },
    modalOptionText: {
      ...Typography.body,
      color: colors.textPrimary,
    },
    modalOptionTextSelected: {
      color: colors.accent,
      fontWeight: "600",
    },
    modalButtons: {
      width: "100%",
      flexDirection: "row",
      justifyContent: "space-around",
    },
    modalButton: {
      flex: 1,
      paddingVertical: 12,
      borderRadius: 8,
      alignItems: "center",
    },
    modalButtonText: {
      color: colors.textPrimary,
      fontSize: 16,
      fontWeight: "600",
    },
  });
