import ExerciseDrawer from "@/components/ExerciseDrawer";
import { StatsPill } from "@/components/StatsPill";
import { Typography } from "@/constants/Typography";
import { ExerciseRow } from "@/data/repo/exercises";
import { useActiveWorkout } from "@/hooks/useActiveWorkout";
import { useWorkoutDraft } from "@/store/useWorkoutDraft";
import Ionicons from "@expo/vector-icons/Ionicons";
import { useFocusEffect, useRouter } from "expo-router";
import React, { useCallback, useRef, useState } from "react";
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
    start,
    finish,
    cancel,
    draft,
    addExercise,
    updateSet,
    removeSet,
    stats,
    durationSec,
  } = useActiveWorkout();
  const { addSet: addSetToStore } = useWorkoutDraft();
  const router = useRouter();

  const { top } = useSafeAreaInsets();
  const { colors } = useThemeColors();
  const styles = React.useMemo(() => createStyles(colors, top), [colors, top]);
  const GlobalStyles = React.useMemo(() => getGlobalStyles(colors), [colors]);

  const [selectedSet, setSelectedSet] = useState<{
    exerciseId: string;
    setId: string;
    type: SetType;
  } | null>(null);
  const [showSetTypeModal, setShowSetTypeModal] = useState(false);
  const [showTimerModal, setShowTimerModal] = useState(false);
  const [showExerciseDrawer, setShowExerciseDrawer] = useState(false);
  const [exerciseUIState, setExerciseUIState] = useState<
    Record<string, { isOpen: boolean; isNotesView: boolean }>
  >({});
  const hasRunRef = useRef(false);

  // Convert draft exercises to UI format
  const exercises: Exercise[] = React.useMemo(() => {
    if (!draft) return [];

    return draft.exercises.map((draftEx) => {
      const uiState = exerciseUIState[draftEx.id] || {
        isOpen: true,
        isNotesView: false,
      };
      const sets: Set[] = draftEx.sets.map((draftSet) => ({
        id: draftSet.id,
        type: draftSet.type,
        setNumber: 0, // Will be calculated
        weight: draftSet.weight,
        reps: draftSet.reps,
        completed: draftSet.completed,
      }));

      return {
        id: draftEx.id,
        name: draftEx.name || "Unknown Exercise",
        isOpen: uiState.isOpen,
        isNotesView: uiState.isNotesView,
        sets: calculateSetNumbers(sets),
        notes: draftEx.notes,
        restTime: draftEx.restTime,
        unit: draftEx.unit,
      };
    });
  }, [draft, exerciseUIState]);

  // Initialize or resume workout
  useFocusEffect(
    useCallback(() => {
      if (!hasRunRef.current && !draft) {
        startWorkout();
        hasRunRef.current = true;
      }
      return () => {
        console.log("Cleanup focus effect");
        hasRunRef.current = false;
      };
    }, [])
  );

  const startWorkout = async () => {
    try {
      await start();
    } catch (error) {
      console.error("Error starting workout:", error);
      Alert.alert("Error", "Failed to start workout");
    }
  };

  // Function to add a new exercise
  const handleAddExercise = (exerciseData: ExerciseRow) => {
    addExercise({
      id: exerciseData.id,
      name: exerciseData.name,
      unit: exerciseData.unit,
    });
  };

  // Function to update set type
  const updateSetType = (
    exerciseId: string,
    setId: string,
    newType: SetType
  ) => {
    const exercise = draft?.exercises.find((ex) => ex.id === exerciseId);
    const set = exercise?.sets.find((s) => s.id === setId);
    if (!set) return;

    updateSet(exerciseId, setId, { type: newType });
  };

  // Function to add a new set (defaults to normal type)
  const handleAddSet = async (exerciseId: string) => {
    try {
      addSetToStore(exerciseId, {
        type: "normal",
        weight: 0,
        reps: 0,
        completed: false,
      });
    } catch (error) {
      console.error("Error adding set:", error);
      Alert.alert("Error", "Failed to add set");
    }
  };

  // Function to save a set
  const saveSet = async (
    exerciseId: string,
    setId: string,
    weight: number,
    reps: number
  ) => {
    try {
      updateSet(exerciseId, setId, { weight, reps, completed: true });
    } catch (error) {
      console.error("Error saving set:", error);
      Alert.alert("Error", "Failed to save set");
    }
  };

  // Function to remove a set
  const handleRemoveSet = (exerciseId: string, setId: string) => {
    removeSet(exerciseId, setId);
  };

  const toggleExercise = (exerciseId: string) => {
    setExerciseUIState((prev) => ({
      ...prev,
      [exerciseId]: {
        isOpen: !(prev[exerciseId]?.isOpen ?? true),
        isNotesView: prev[exerciseId]?.isNotesView ?? false,
      },
    }));
  };

  const toggleSetCompleted = (exerciseId: string, setId: string) => {
    const exercise = draft?.exercises.find((ex) => ex.id === exerciseId);
    const set = exercise?.sets.find((s) => s.id === setId);
    if (!set) return;

    updateSet(exerciseId, setId, { completed: !set.completed });
  };

  const handleSwipe = (exerciseId: string, translationX: number) => {
    // Toggle notes view based on swipe direction
    const threshold = 50; // minimum swipe distance
    if (Math.abs(translationX) > threshold) {
      setExerciseUIState((prev) => ({
        ...prev,
        [exerciseId]: {
          isOpen: prev[exerciseId]?.isOpen ?? true,
          isNotesView: !(prev[exerciseId]?.isNotesView ?? false),
        },
      }));
    }
  };

  const handleSetValueChange = (
    exerciseId: string,
    setId: string,
    field: "weight" | "reps",
    value: number
  ) => {
    updateSet(exerciseId, setId, { [field]: value });
  };

  const handleEndWorkout = async () => {
    if (!draft) return;

    if (draft.exercises.length === 0) {
      Alert.alert(
        "Cancel Workout",
        "Are you sure you want to cancel this workout?",
        [
          { text: "No", style: "cancel" },
          {
            text: "Yes",
            style: "destructive",
            onPress: async () => {
              try {
                await cancel();
                hasRunRef.current = false; // Reset the flag before navigating
                router.back();
              } catch (error) {
                console.error("Error cancelling workout:", error);
                Alert.alert("Error", "Failed to cancel workout");
              }
            },
          },
        ]
      );
      return;
    }

    Alert.alert("End Workout", "Are you sure you want to end this workout?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "End",
        style: "destructive",
        onPress: async () => {
          try {
            const finishedId = await finish();
            console.log("Workout finished:", finishedId);
            hasRunRef.current = false;
            router.back();
          } catch (error) {
            console.error("Error ending workout:", error);
            Alert.alert("Error", "Failed to end workout");
          }
        },
      },
    ]);
  };

  if (!draft) {
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
          totalSets={stats.totalSets}
          totalVolume={stats.totalVolumeKg}
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
            onAddSet={() => handleAddSet(exercise.id)}
            onSetPress={(setId, type) => {
              setSelectedSet({
                exerciseId: exercise.id,
                setId,
                type,
              });
              setShowSetTypeModal(true);
            }}
            onSetValueChange={(setId, field, value) =>
              handleSetValueChange(exercise.id, setId, field, value)
            }
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
