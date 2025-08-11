import Ionicons from "@expo/vector-icons/Ionicons";
import React from "react";
import {
  Pressable,
  StyleSheet,
  Text,
  TextStyle,
  View,
  ViewStyle,
} from "react-native";
import { Colors } from "../constants/Colors";
import { Typography } from "../constants/Typography";

type IoniconName = keyof typeof Ionicons.glyphMap;

export type ButtonProps = {
  text: string;
  onPress?: () => void;
  buttonColor?: string;
  activeButtonColor?: string;
  textColor?: string;
  activeTextColor?: string;
  iconName?: IoniconName;
  iconSize?: number;
  style?: ViewStyle;
  textStyle?: TextStyle;
  disabled?: boolean;
};

export default function ButtonPrimary({
  text,
  onPress,
  buttonColor = Colors.dark.bgSecondary,
  activeButtonColor,
  textColor = Colors.dark.textPrimary,
  activeTextColor,
  iconName,
  iconSize = 18,
  style,
  textStyle,
  disabled = false,
}: ButtonProps) {
  const resolvedActiveButtonColor = activeButtonColor ?? buttonColor;
  const resolvedActiveTextColor = activeTextColor ?? textColor;

  return (
    <Pressable
      accessibilityRole="button"
      disabled={disabled}
      onPress={onPress}
      style={({ pressed }) => [
        styles.button,
        {
          backgroundColor: pressed ? resolvedActiveButtonColor : buttonColor,
          opacity: disabled ? 0.6 : 1,
        },
        style,
      ]}
    >
      {({ pressed }) => (
        <View style={styles.contentRow}>
          {iconName ? (
            <Ionicons
              name={iconName}
              size={iconSize}
              color={pressed ? resolvedActiveTextColor : textColor}
              style={styles.icon}
            />
          ) : null}
          <Text
            style={[
              styles.text,
              { color: pressed ? resolvedActiveTextColor : textColor },
              textStyle,
            ]}
            numberOfLines={1}
          >
            {text}
          </Text>
        </View>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    height: 48,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 16,
  },
  contentRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },
  icon: {
    marginRight: 8,
  },
  text: {
    ...Typography.button,
  },
});
