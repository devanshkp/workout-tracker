import { Typography } from "@/constants/Typography";
import { useThemeColors } from "@/hooks/useThemeColors";
import { Ionicons } from "@expo/vector-icons";
import React, { useState } from "react";
import { Dimensions, Pressable, StyleSheet, Text, View } from "react-native";
import ButtonPrimary from "./Button";

interface TimerPreset {
  id: string;
  duration: number; // in seconds
  label: string;
}

interface GeneralTimerProps {
  onClose?: () => void;
  onSettings?: () => void;
  onStart?: (duration: number) => void;
  initialDuration?: number; // in seconds
  presets?: TimerPreset[];
}

const { width: screenWidth } = Dimensions.get("window");
const DIAL_SIZE = Math.min(screenWidth * 0.7, 280);

export default function GeneralTimer({
  onClose,
  onSettings,
  onStart,
  initialDuration = 150, // 2:30 default
  presets = [
    { id: "1", duration: 90, label: "1:30" },
    { id: "2", duration: 145, label: "2:25" },
    { id: "3", duration: 210, label: "3:30" },
    { id: "4", duration: 125, label: "2:05" },
  ],
}: GeneralTimerProps) {
  const { colors } = useThemeColors();
  const styles = createStyles(colors);

  const [currentDuration, setCurrentDuration] = useState(initialDuration);
  const [isPresetView, setIsPresetView] = useState(false);
  const [selectedPreset, setSelectedPreset] = useState<TimerPreset | null>(
    null
  );

  const formatTime = (seconds: number): string => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, "0")}`;
  };

  const handlePresetSelect = (preset: TimerPreset) => {
    setSelectedPreset(preset);
    setCurrentDuration(preset.duration);
    setIsPresetView(false);
  };

  const handleStart = () => {
    onStart?.(currentDuration);
  };

  return (
    <View style={styles.modalOverlay}>
      <View style={styles.modalContent}>
        <View style={styles.header}>
          <Pressable
            onPress={isPresetView ? () => setIsPresetView(false) : onClose}
            style={styles.headerButton}
          >
            <Ionicons
              name={isPresetView ? "arrow-back" : "close"}
              size={24}
              color={colors.textSubtle}
            />
          </Pressable>
          <Text style={styles.headerTitle}>
            {isPresetView ? "Frequently-Used Times" : "Timer"}
          </Text>
          <View style={styles.headerButton} />
        </View>

        <View style={styles.content}>
          {!isPresetView ? (
            <View style={styles.dialContainer}>
              <Pressable
                onPress={() => setIsPresetView(true)}
                style={styles.dial}
              >
                <View style={styles.dialCircle}>
                  <Text style={styles.dialTime}>
                    {formatTime(currentDuration)}
                  </Text>
                </View>
              </Pressable>

              <View style={styles.buttonContainer}>
                <ButtonPrimary
                  text="Start"
                  buttonColor={colors.accent}
                  borderActive={false}
                  onPress={handleStart}
                />
              </View>
            </View>
          ) : (
            <View style={styles.presetContainer}>
              <View>
                <View style={styles.presetGrid}>
                  {presets.map((preset) => (
                    <Pressable
                      key={preset.id}
                      style={[
                        styles.presetButton,
                        selectedPreset?.id === preset.id &&
                          styles.presetButtonSelected,
                      ]}
                      onPress={() => handlePresetSelect(preset)}
                    >
                      <Text
                        style={[
                          styles.presetButtonText,
                          selectedPreset?.id === preset.id &&
                            styles.presetButtonTextSelected,
                        ]}
                      >
                        {preset.label}
                      </Text>
                    </Pressable>
                  ))}
                </View>
                <Pressable style={[styles.presetButton, { width: "100%" }]}>
                  <Ionicons name="add" size={24} color={colors.textPrimary} />
                </Pressable>
              </View>

              <Text style={styles.presetHint}>
                Long press the duration to change
              </Text>
            </View>
          )}
        </View>
      </View>
    </View>
  );
}

const createStyles = (colors: any) =>
  StyleSheet.create({
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
      width: "90%",
      maxWidth: 400,
      minHeight: 460, // Ensure consistent height
      padding: 12,
      backgroundColor: colors.bgSecondary,
      borderRadius: 12,
    },
    header: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      paddingBottom: 20,
    },
    headerButton: {
      width: 40,
      height: 40,
      alignItems: "center",
      justifyContent: "center",
    },
    headerTitle: {
      ...Typography.body,
      fontWeight: "500",
      color: colors.textPrimary,
      flex: 1,
      textAlign: "center",
    },
    content: {
      flex: 1,
      alignItems: "center",
      justifyContent: "space-between",
    },
    dialContainer: {
      flex: 1,
      width: "100%",
      justifyContent: "space-between",
      alignItems: "center",
    },
    dial: {
      alignItems: "center",
      justifyContent: "center",
      marginBottom: 24,
    },
    dialCircle: {
      width: DIAL_SIZE,
      height: DIAL_SIZE,
      borderRadius: DIAL_SIZE / 2,
      borderWidth: 4,
      borderColor: colors.border,
      alignItems: "center",
      justifyContent: "center",
      backgroundColor: colors.bgSecondary,
    },
    dialTime: {
      fontSize: 52,
      fontWeight: "500",
      color: colors.textPrimary,
    },
    buttonContainer: {
      width: "100%",
      padding: 4,
    },
    presetContainer: {
      width: "100%",
      flex: 1,
      justifyContent: "space-between",
      paddingBottom: 12,
    },
    presetGrid: {
      flexDirection: "row",
      flexWrap: "wrap",
      justifyContent: "space-between",
    },
    presetButton: {
      width: "48%",
      height: 44,
      backgroundColor: colors.bgTertiary,
      borderRadius: 12,
      alignItems: "center",
      justifyContent: "center",
      marginBottom: 12,
    },
    presetButtonSelected: {
      backgroundColor: colors.accent,
    },
    presetButtonText: {
      ...Typography.body,
      fontWeight: "500",
      color: colors.textPrimary,
    },
    presetButtonTextSelected: {
      color: colors.textPrimary,
    },
    presetHint: {
      ...Typography.bodyTertiary,
      textAlign: "center",
      color: colors.textSubtle,
    },
  });
