import { Colors } from "@/constants/Colors";
import { useColorScheme } from "react-native";

export type ThemeColors = typeof Colors.dark;

export function useThemeColors(): {
  colors: ThemeColors;
  accent: string;
  warmup: string;
  warning: string;
  scheme: "light" | "dark" | null | undefined;
} {
  const scheme = useColorScheme();
  const colors: ThemeColors = scheme === "light" ? Colors.light : Colors.dark;

  return {
    colors,
    accent: Colors.accent,
    warmup: Colors.warmup,
    warning: Colors.warning,
    scheme,
  };
}
