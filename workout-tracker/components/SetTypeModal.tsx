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
        <View style={styles.modalNav}>
          <Pressable onPress={onClose}>
            <Ionicons
              name="close-outline"
              size={24}
              color={colors.textSubtle}
            />
          </Pressable>
          <Text style={[styles.modalTitle, { color: colors.textPrimary }]}>
            Change Set Type
          </Text>
          <Ionicons
            name="settings-outline"
            size={20}
            color={colors.textSubtle}
          />
        </View>

        <View style={styles.modalOptions}>
          {(["warmup", "normal", "failure", "dropset"] as SetType[]).map(
            (type) => (
              <Pressable
                key={type}
                style={[
                  styles.modalOption,
                  selectedSet.type === type && [
                    styles.modalOptionSelected,
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
                    styles.modalOptionText,
                    { color: colors.textPrimary },
                    selectedSet.type === type && [
                      styles.modalOptionTextSelected,
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

        <View style={styles.modalButtons}>
          <ButtonPrimary
            text="Remove Set"
            borderActive={false}
            buttonColor={colors.bgTertiary}
            textColor={colors.warning}
            onPress={onRemoveSet}
            style={{ height: 44 }}
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
    width: "80%",
    alignItems: "center",
  },
  modalNav: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    width: "100%",
    marginBottom: 20,
  },
  modalTitle: {
    ...Typography.bodySecondary,
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
    borderColor: "transparent",
    borderWidth: 1,
  },
  modalOptionText: {
    ...Typography.bodySecondary,
  },
  modalOptionTextSelected: {
    fontWeight: "600",
  },
  modalButtons: {
    width: "100%",
    flexDirection: "row",
    justifyContent: "space-around",
  },
});
