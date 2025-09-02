import { ExerciseRow, searchExercises } from "@/data/repo/exercises";
import { useThemeColors } from "@/hooks/useThemeColors";
import Ionicons from "@expo/vector-icons/Ionicons";
import React, { useEffect, useState } from "react";
import {
  FlatList,
  Modal,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Typography } from "../constants/Typography";
import ButtonPrimary from "./Button";

interface ExerciseDrawerProps {
  visible: boolean;
  onClose: () => void;
  onSelectExercise: (exercise: ExerciseRow) => void;
}

export default function ExerciseDrawer({
  visible,
  onClose,
  onSelectExercise,
}: ExerciseDrawerProps) {
  const { colors } = useThemeColors();
  const { top, bottom } = useSafeAreaInsets();
  const [searchTerm, setSearchTerm] = useState("");
  const [exercises, setExercises] = useState<ExerciseRow[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (visible) {
      loadExercises("");
    }
  }, [visible]);

  const loadExercises = async (term: string) => {
    setLoading(true);
    try {
      const results = await searchExercises(term);
      setExercises(results);
    } catch (error) {
      console.error("Error loading exercises:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (text: string) => {
    setSearchTerm(text);
    loadExercises(text);
  };

  const handleSelectExercise = (exercise: ExerciseRow) => {
    onSelectExercise(exercise);
    onClose();
    setSearchTerm("");
  };

  const renderExercise = ({ item }: { item: ExerciseRow }) => (
    <Pressable
      style={[styles.exerciseItem, { borderBottomColor: colors.border }]}
      onPress={() => handleSelectExercise(item)}
    >
      {({ pressed }) => (
        <View style={[styles.exerciseContent, { opacity: pressed ? 0.7 : 1 }]}>
          <View style={styles.exerciseInfo}>
            <Text style={[styles.exerciseName, { color: colors.textPrimary }]}>
              {item.name}
            </Text>
            {item.muscle_group && (
              <Text
                style={[styles.exerciseDetail, { color: colors.textSubtle }]}
              >
                {item.muscle_group}
                {item.equipment && ` • ${item.equipment}`}
              </Text>
            )}
          </View>
          <View style={styles.exerciseUnit}>
            <Text style={[styles.unitText, { color: colors.textSubtle }]}>
              {item.unit.toUpperCase()}
            </Text>
            {item.is_bodyweight === 1 && (
              <Text
                style={[styles.bodyweightText, { color: colors.textSubtle }]}
              >
                BW
              </Text>
            )}
          </View>
        </View>
      )}
    </Pressable>
  );

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={onClose}
    >
      <View
        style={[
          styles.container,
          { backgroundColor: colors.bgPrimary, paddingTop: top },
        ]}
      >
        {/* Header */}
        <View style={[styles.header, { borderBottomColor: colors.border }]}>
          <ButtonPrimary
            text="Cancel"
            onPress={onClose}
            buttonColor="transparent"
            textColor={colors.textSubtle}
            style={styles.cancelButton}
          />
          <Text style={[styles.title, { color: colors.textPrimary }]}>
            Add Exercise
          </Text>
          <View style={styles.placeholder} />
        </View>

        {/* Search Bar */}
        <View
          style={[
            styles.searchContainer,
            { backgroundColor: colors.bgSecondary },
          ]}
        >
          <Ionicons
            name="search"
            size={20}
            color={colors.textSubtle}
            style={styles.searchIcon}
          />
          <TextInput
            style={[styles.searchInput, { color: colors.textPrimary }]}
            placeholder="Search exercises..."
            placeholderTextColor={colors.textSubtle}
            value={searchTerm}
            onChangeText={handleSearch}
            autoFocus
          />
          {searchTerm.length > 0 && (
            <Pressable onPress={() => handleSearch("")}>
              <Ionicons
                name="close-circle"
                size={20}
                color={colors.textSubtle}
              />
            </Pressable>
          )}
        </View>

        {/* Exercise List */}
        <FlatList
          data={exercises}
          renderItem={renderExercise}
          keyExtractor={(item) => item.id}
          style={styles.list}
          contentContainerStyle={{ paddingBottom: bottom }}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Text style={[styles.emptyText, { color: colors.textSubtle }]}>
                {loading ? "Loading..." : "No exercises found"}
              </Text>
            </View>
          }
        />
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 0.5,
  },
  cancelButton: {
    paddingHorizontal: 0,
    height: 32,
  },
  title: {
    ...Typography.h2,
    fontWeight: "600",
  },
  placeholder: {
    width: 60,
  },
  searchContainer: {
    flexDirection: "row",
    alignItems: "center",
    margin: 16,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    ...Typography.body,
    paddingVertical: 4,
  },
  list: {
    flex: 1,
  },
  exerciseItem: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 0.5,
  },
  exerciseContent: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  exerciseInfo: {
    flex: 1,
  },
  exerciseName: {
    ...Typography.body,
    fontWeight: "500",
    marginBottom: 2,
  },
  exerciseDetail: {
    ...Typography.bodyTertiary,
  },
  exerciseUnit: {
    alignItems: "flex-end",
  },
  unitText: {
    ...Typography.bodyTertiary,
    fontWeight: "600",
  },
  bodyweightText: {
    ...Typography.bodyMini,
    fontSize: 10,
    marginTop: 2,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingTop: 60,
  },
  emptyText: {
    ...Typography.body,
  },
});
