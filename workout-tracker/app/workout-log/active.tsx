import Ionicons from "@expo/vector-icons/Ionicons";
import { useRouter } from "expo-router";
import React, { useState } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import {
  GestureHandlerRootView,
  ScrollView,
} from "react-native-gesture-handler";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import ButtonPrimary from "../../components/Button";
import ExerciseCard from "../../components/ExerciseCard";
import GeneralTimer from "../../components/GeneralTimer";
import SetTypeModal from "../../components/SetTypeModal";
import { getGlobalStyles } from "../../constants/GlobalStyles";
import { useThemeColors } from "../../hooks/useThemeColors";

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
  const [showTimerModal, setShowTimerModal] = useState(false);

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

  // Function to remove a set
  const removeSet = (exerciseId: string, setId: string) => {
    setExercises((prev) =>
      prev.map((ex) => {
        if (ex.id === exerciseId) {
          const updatedSets = ex.sets.filter((set) => set.id !== setId);
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
            <Pressable onPress={() => setShowTimerModal(true)}>
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
          borderActive={false}
        />
      </ScrollView>

      {/* Set Type Selection Modal */}
      <SetTypeModal
        visible={showSetTypeModal}
        selectedSet={selectedSet}
        onClose={() => {
          setShowSetTypeModal(false);
          setSelectedSet(null);
        }}
        onSetTypeChange={updateSetType}
        onRemoveSet={() => {
          if (selectedSet) {
            removeSet(selectedSet.exerciseId, selectedSet.setId);
            setShowSetTypeModal(false);
            setSelectedSet(null);
          }
        }}
        colors={colors}
      />

      {/* Timer Modal */}
      {showTimerModal && (
        <GeneralTimer
          onClose={() => setShowTimerModal(false)}
          onSettings={() => {
            // Handle timer settings
            console.log("Timer settings pressed");
          }}
          onStart={(duration) => {
            console.log(`Timer started with duration: ${duration} seconds`);
            setShowTimerModal(false);
            // You can add logic here to start the actual timer
          }}
          initialDuration={180} // 3 minutes default
          presets={[
            { id: "1", duration: 90, label: "1:30" },
            { id: "2", duration: 180, label: "3:00" },
            { id: "3", duration: 300, label: "5:00" },
            { id: "4", duration: 600, label: "10:00" },
          ]}
        />
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
