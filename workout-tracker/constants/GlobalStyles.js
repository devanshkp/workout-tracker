import { Colors } from "@/constants/Colors";
import { StyleSheet } from "react-native";

export const GlobalStyles = StyleSheet.create({
  screenContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: Colors.dark.bgPrimary,
  },
});
