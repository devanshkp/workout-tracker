import { StyleSheet } from "react-native";

// Theme-aware global styles factory. Pass colors from useThemeColors().
export const getGlobalStyles = (colors) =>
  StyleSheet.create({
    screenContainer: {
      flex: 1,
      justifyContent: "center",
      alignItems: "center",
      backgroundColor: colors.bgPrimary,
    },
  });
