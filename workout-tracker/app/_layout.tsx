import { Ionicons } from "@expo/vector-icons";
import { Stack, Tabs } from "expo-router";
import { Colors } from "@/constants/Colors";

export default function RootLayout() {
  return (
    <Stack>
      <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
    </Stack>
  );
}
