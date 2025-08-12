import { Colors } from "@/constants/Colors";
import { useColorScheme } from "react-native";

export type ThemeColors = typeof Colors.dark & {
  accent: string;
  warmup: string;
  warning: string;
};

export function useThemeColors(): {
  colors: ThemeColors;
  scheme: "light" | "dark" | null | undefined;
} {
  const scheme = useColorScheme();
  const baseColors = scheme === "light" ? Colors.light : Colors.dark;

  return {
    colors: {
      ...baseColors,
      accent: Colors.accent,
      warmup: Colors.warmup,
      warning: Colors.warning,
    },
    scheme,
  };
}
