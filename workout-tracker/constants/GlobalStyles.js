import { StyleSheet } from "react-native";

// Theme-aware global styles factory. Pass colors from useThemeColors().
export const getGlobalStyles = (colors) =>
  StyleSheet.create({
    screenContainer: {
      backgroundColor: colors.bgPrimary,
      paddingTop: 16,
      paddingHorizontal: 12,
    },
  });
