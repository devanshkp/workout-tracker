import ExerciseDrawer from "@/components/ExerciseDrawer";
import { StatsPill } from "@/components/StatsPill";
import { Typography } from "@/constants/Typography";
import { gramsToUnit } from "@/data/db";
import { ExerciseRow, getExerciseById } from "@/data/repo/exercises";
import { useActiveWorkout } from "@/hooks/useActiveWorkout";
import Ionicons from "@expo/vector-icons/Ionicons";
import { randomUUID } from "expo-crypto";
import { useLocalSearchParams, useRouter } from "expo-router";
import React, { useCallback, useEffect, useState } from "react";
import { Alert, Pressable, StyleSheet, View } from "react-native";
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
const { autostart } = useLocalSearchParams<{ autostart?: string }>();

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
  unit: "kg" | "lb";
  exerciseData?: ExerciseRow;
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

const formatTime = (seconds: number): string => {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const secs = seconds % 60;

  if (hours > 0) {
    return `${hours}:${minutes.toString().padStart(2, "0")}:${secs
      .toString()
      .padStart(2, "0")}`;
  }
  return `${minutes}:${secs.toString().padStart(2, "0")}`;
};

export default function ActiveWorkoutScreen() {
  const {
    loading,
    workoutId,
    start,
    addSet: addSetToDb,
    finish,
    cancel,
    getSets,
    refreshTotals,
    durationSec,
  } = useActiveWorkout();
  const router = useRouter();

  const { top } = useSafeAreaInsets();
  const { colors } = useThemeColors();
  const styles = React.useMemo(() => createStyles(colors, top), [colors, top]);
  const GlobalStyles = React.useMemo(() => getGlobalStyles(colors), [colors]);

  const [exercises, setExercises] = useState<Exercise[]>([]);
  const [workoutStats, setWorkoutStats] = useState({
    totalSets: 0,
    totalVolume: 0,
    totalExercises: 0,
  });

  const [selectedSet, setSelectedSet] = useState<{
    exerciseId: string;
    setId: string;
    type: SetType;
  } | null>(null);
  const [showSetTypeModal, setShowSetTypeModal] = useState(false);
  const [showTimerModal, setShowTimerModal] = useState(false);
  const [showExerciseDrawer, setShowExerciseDrawer] = useState(false);

  // Initialize or resume workout
  useEffect(() => {
    if (!loading && !workoutId && autostart === "1") {
      // Only start a new workout if we explicitly navigate to this screen
      // without an existing workout (e.g., from the "Start workout" button)
      startWorkout();
    }
  }, [loading, workoutId]);

  const startWorkout = async () => {
    try {
      await start();
    } catch (error) {
      console.error("Error starting workout:", error);
      Alert.alert("Error", "Failed to start workout");
    }
  };

  const loadWorkoutData = useCallback(async () => {
    if (!workoutId) return;

    try {
      const sets = await getSets();
      const exerciseMap = new Map<string, Exercise>();

      // Group sets by exercise
      for (const set of sets) {
        const exerciseId = set.exercise_id;

        if (!exerciseMap.has(exerciseId)) {
          const exerciseData = await getExerciseById(exerciseId);
          if (!exerciseData) continue;

          exerciseMap.set(exerciseId, {
            id: exerciseId,
            name: exerciseData.name,
            isOpen: true,
            isNotesView: false,
            sets: [],
            notes: "",
            restTime: 180,
            unit: exerciseData.unit,
            exerciseData,
          });
        }

        const exercise = exerciseMap.get(exerciseId)!;
        const weight = gramsToUnit(exercise.unit, set.weight_g || 0);
        const reps = (set.reps_x10 || 0) / 10;

        exercise.sets.push({
          id: set.id,
          type: (set.set_type as SetType) || "normal",
          setNumber: set.set_index,
          weight,
          reps,
          completed: true, // Sets in DB are considered completed
        });
      }

      // Convert map to array and calculate set numbers
      const exerciseList = Array.from(exerciseMap.values()).map((ex) => ({
        ...ex,
        sets: calculateSetNumbers(ex.sets),
      }));

      // Only update exercises from database if this is initial load
      // Preserve UI-only exercises (those without sets in DB)
      setExercises((prev) => {
        const dbExerciseIds = new Set(exerciseList.map((ex) => ex.id));
        const uiOnlyExercises = prev.filter((ex) => !dbExerciseIds.has(ex.id));
        return [...exerciseList, ...uiOnlyExercises];
      });

      // Calculate stats
      const totalSets = sets.length;
      const totalExercises = exerciseMap.size;
      const totalVolume = sets.reduce((sum, set) => {
        const weight = set.weight_g || 0;
        const reps = (set.reps_x10 || 0) / 10;
        return sum + (weight / 1000) * reps; // Convert to kg
      }, 0);

      setWorkoutStats({ totalSets, totalExercises, totalVolume });
    } catch (error) {
      console.error("Error loading workout data:", error);
    }
  }, [workoutId, getSets]);

  // Load workout data when workoutId is available
  useEffect(() => {
    if (workoutId) {
      loadWorkoutData();
    }
  }, [workoutId, loadWorkoutData]);

  // Function to add a new exercise
  const handleAddExercise = (exerciseData: ExerciseRow) => {
    const newExercise: Exercise = {
      id: exerciseData.id,
      name: exerciseData.name,
      isOpen: true,
      isNotesView: false,
      sets: [],
      notes: "",
      restTime: 180,
      unit: exerciseData.unit,
      exerciseData,
    };

    setExercises((prev) => [...prev, newExercise]);
  };

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
  const addSet = async (exerciseId: string) => {
    const exercise = exercises.find((ex) => ex.id === exerciseId);
    if (!exercise || !workoutId) return;

    try {
      // Add a placeholder set to UI
      const newSet: Set = {
        id: randomUUID(), // Use proper UUID
        type: "normal",
        setNumber: 0, // Will be calculated
        weight: 0,
        reps: 0,
        completed: false,
      };

      setExercises((prev) =>
        prev.map((ex) => {
          if (ex.id === exerciseId) {
            const updatedSets = [...ex.sets, newSet];
            return { ...ex, sets: calculateSetNumbers(updatedSets) };
          }
          return ex;
        })
      );
    } catch (error) {
      console.error("Error adding set:", error);
      Alert.alert("Error", "Failed to add set");
    }
  };

  // Function to save a set to the database
  const saveSet = async (
    exerciseId: string,
    setId: string,
    weight: number,
    reps: number
  ) => {
    const exercise = exercises.find((ex) => ex.id === exerciseId);
    const set = exercise?.sets.find((s) => s.id === setId);
    if (!exercise || !set || !workoutId) return;

    try {
      await addSetToDb(exerciseId, reps, weight, exercise.unit, set.type);

      // Mark set as completed and refresh data
      setExercises((prev) =>
        prev.map((ex) =>
          ex.id === exerciseId
            ? {
                ...ex,
                sets: ex.sets.map((s) =>
                  s.id === setId ? { ...s, weight, reps, completed: true } : s
                ),
              }
            : ex
        )
      );

      // Refresh workout data to get updated stats
      await loadWorkoutData();
    } catch (error) {
      console.error("Error saving set:", error);
      Alert.alert("Error", "Failed to save set");
    }
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

  const handleEndWorkout = async () => {
    if (!workoutId) return;

    Alert.alert("End Workout", "Are you sure you want to end this workout?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "End",
        style: "destructive",
        onPress: async () => {
          try {
            const finishedId = await finish();
            console.log("Workout finished:", finishedId);
            router.back();
          } catch (error) {
            console.error("Error ending workout:", error);
            Alert.alert("Error", "Failed to end workout");
          }
        },
      },
    ]);
  };

  const handleCancelWorkout = async () => {
    if (!workoutId) return;

    Alert.alert(
      "Cancel Workout",
      "Are you sure you want to cancel this workout? All data will be lost.",
      [
        { text: "No", style: "cancel" },
        {
          text: "Yes, Cancel",
          style: "destructive",
          onPress: async () => {
            try {
              await cancel();
              router.back();
            } catch (error) {
              console.error("Error cancelling workout:", error);
              Alert.alert("Error", "Failed to cancel workout");
            }
          },
        },
      ]
    );
  };

  if (loading) {
    return (
      <View
        style={[
          styles.container,
          { justifyContent: "center", alignItems: "center" },
        ]}
      >
        {/* Add loading spinner here if needed */}
      </View>
    );
  }

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
            <ButtonPrimary
              text="End"
              buttonColor={colors.warning}
              style={styles.endButton}
              textStyle={styles.endButtonText}
              borderActive={false}
              onPress={handleEndWorkout}
            />
          </View>
        </View>
      </View>
      <ScrollView
        style={{ backgroundColor: colors.bgPrimary }}
        contentContainerStyle={[GlobalStyles.screenContainer, styles.container]}
        showsVerticalScrollIndicator={false}
      >
        <StatsPill
          timeText={formatTime(durationSec)}
          totalSets={workoutStats.totalSets}
          totalVolume={workoutStats.totalVolume}
          unit="kg"
        />

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
          />
        ))}

        {/* Add Exercise Button */}
        <ButtonPrimary
          text="Add Exercise"
          iconName="add"
          buttonColor={colors.accent}
          borderActive={false}
          onPress={() => setShowExerciseDrawer(true)}
        />
      </ScrollView>

      {/* Exercise Drawer */}
      <ExerciseDrawer
        visible={showExerciseDrawer}
        onClose={() => setShowExerciseDrawer(false)}
        onSelectExercise={handleAddExercise}
      />

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
      paddingHorizontal: 16,
      height: 32,
    },

    endButtonText: {
      ...Typography.bodySecondary,
      color: colors.textPrimary,
      fontWeight: "500",
    },
  });
