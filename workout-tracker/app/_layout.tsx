import { Ionicons } from "@expo/vector-icons";
import { Stack, Tabs } from "expo-router";
import { Colors } from "@/constants/Colors";

export default function RootLayout() {
  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: "#ffffff",
      }}
    >
      <Tabs.Screen
        name="log"
        options={{
          title: "Log Page",
          tabBarLabel: "Log",
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="home" color={color} size={size} />
          ),
        }}
      />
      <Tabs.Screen
        name="workout"
        options={{
          title: "Workout Page",
          tabBarLabel: "Workout",
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="home" color={color} size={size} />
          ),
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: "Profile Page",
          tabBarLabel: "Profile",
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="home" color={color} size={size} />
          ),
        }}
      />
    </Tabs>
  );
}
