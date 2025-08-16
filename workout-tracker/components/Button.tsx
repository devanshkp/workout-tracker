import { useThemeColors } from "@/hooks/useThemeColors";
import Ionicons from "@expo/vector-icons/Ionicons";
import Color from "color";
import React from "react";
import {
  Pressable,
  StyleProp,
  StyleSheet,
  Text,
  TextStyle,
  View,
  ViewStyle,
} from "react-native";
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
  style?: StyleProp<ViewStyle>;
  textStyle?: StyleProp<TextStyle>;

  disabled?: boolean;
  borderActive?: boolean;
};

export default function ButtonPrimary({
  text,
  onPress,
  buttonColor,
  activeButtonColor,
  textColor,
  activeTextColor,
  iconName,
  iconSize = 18,
  style,
  textStyle,
  disabled = false,
  borderActive = true,
}: ButtonProps) {
  const { colors } = useThemeColors();
  const resolvedButtonColor = buttonColor ?? colors.bgSecondary;
  const resolvedTextColor = textColor ?? colors.textPrimary;
  const resolvedActiveButtonColor =
    activeButtonColor ?? Color(resolvedButtonColor).darken(0.25).toString();
  const resolvedActiveTextColor = activeTextColor ?? resolvedTextColor;

  return (
    <Pressable
      accessibilityRole="button"
      disabled={disabled}
      onPress={onPress}
      style={({ pressed }) => [
        styles.button,
        {
          backgroundColor: pressed
            ? resolvedActiveButtonColor
            : resolvedButtonColor,
          opacity: disabled ? 0.6 : 1,
          borderColor: pressed
            ? resolvedActiveButtonColor
            : !borderActive
            ? resolvedButtonColor
            : colors.border,
          borderWidth: 0.5,
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
              color={pressed ? resolvedActiveTextColor : resolvedTextColor}
              style={styles.icon}
            />
          ) : null}
          <Text
            style={[
              styles.text,
              { color: pressed ? resolvedActiveTextColor : resolvedTextColor },
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
