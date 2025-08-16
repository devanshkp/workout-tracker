import { Typography } from "@/constants/Typography";
import Ionicons from "@expo/vector-icons/Ionicons";
import React from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import ButtonPrimary from "./Button";

type SetType = "warmup" | "normal" | "failure" | "dropset";

interface SetTypeModalProps {
  visible: boolean;
  selectedSet: {
    exerciseId: string;
    setId: string;
    type: SetType;
  } | null;
  onClose: () => void;
  onSetTypeChange: (
    exerciseId: string,
    setId: string,
    newType: SetType
  ) => void;
  onRemoveSet: () => void;
  colors: any;
}

export default function SetTypeModal({
  visible,
  selectedSet,
  onClose,
  onSetTypeChange,
  onRemoveSet,
  colors,
}: SetTypeModalProps) {
  if (!visible || !selectedSet) return null;

  const handleSetTypeChange = (newType: SetType) => {
    onSetTypeChange(selectedSet.exerciseId, selectedSet.setId, newType);
    onClose();
  };

  return (
    <View style={styles.modalOverlay}>
      <View
        style={[styles.modalContent, { backgroundColor: colors.bgSecondary }]}
      >
        <View style={styles.nav}>
          <Pressable onPress={onClose}>
            <Ionicons
              name="close-outline"
              size={24}
              color={colors.textSubtle}
            />
          </Pressable>
          <Text style={[styles.header, { color: colors.textPrimary }]}>
            Change Set Type
          </Text>
          <Ionicons
            name="settings-outline"
            size={20}
            color={colors.textSubtle}
          />
        </View>

        <View style={styles.optionsContainer}>
          {(["warmup", "normal", "failure", "dropset"] as SetType[]).map(
            (type) => (
              <Pressable
                key={type}
                style={[
                  styles.option,
                  selectedSet.type === type && [
                    styles.optionSelected,
                    {
                      backgroundColor: colors.bgTertiary,
                      borderColor: colors.accent,
                    },
                  ],
                ]}
                onPress={() => handleSetTypeChange(type)}
              >
                <Text
                  style={[
                    styles.optionText,
                    { color: colors.textPrimary },
                    selectedSet.type === type && [
                      styles.optionTextSelected,
                      { color: colors.accent },
                    ],
                  ]}
                >
                  {type === "warmup"
                    ? "Warmup"
                    : type === "normal"
                    ? "Normal"
                    : type === "failure"
                    ? "Failure"
                    : "Drop Set"}
                </Text>
                {selectedSet.type === type && (
                  <Ionicons name="checkmark" size={20} color={colors.accent} />
                )}
              </Pressable>
            )
          )}
        </View>

        <View style={styles.buttons}>
          <ButtonPrimary
            text="Remove Set"
            borderActive={false}
            buttonColor={colors.bgTertiary}
            textColor={colors.warning}
            onPress={onRemoveSet}
            style={{ height: 44, width: "100%" }}
          />
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
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
    borderRadius: 12,
    padding: 20,
    width: "85%",
    alignItems: "center",
  },
  nav: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    width: "100%",
    marginBottom: 32,
  },
  header: {
    ...Typography.body,
    fontWeight: "500",
    textAlign: "center",
  },
  optionsContainer: {
    width: "100%",
    marginBottom: 20,
  },
  option: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    marginBottom: 8,
  },
  optionSelected: {
    borderColor: "transparent",
    borderWidth: 1,
  },
  optionText: {
    ...Typography.body,
  },
  optionTextSelected: {
    fontWeight: "500",
  },
  buttons: {
    width: "100%",
    flexDirection: "row",
    justifyContent: "space-around",
  },
});
