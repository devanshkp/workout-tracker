import { useThemeColors } from "@/hooks/useThemeColors";
import { Ionicons } from "@expo/vector-icons";
import { BlurView } from "expo-blur";
import { Tabs } from "expo-router";
import { Platform, StyleSheet, View } from "react-native";

export default function TabsLayout() {
  const { colors, accent } = useThemeColors();
  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: accent,
        tabBarInactiveTintColor: colors.textSubtle,

        tabBarBackground: () => (
          <View style={{ flex: 1 }}>
            <View
              style={[
                StyleSheet.absoluteFill,
                { backgroundColor: colors.bgSecondary, opacity: 0.85 },
              ]}
            />
            {Platform.OS === "ios" && (
              <BlurView
                intensity={100}
                experimentalBlurMethod="none"
                style={StyleSheet.absoluteFill}
              />
            )}
          </View>
        ),
        tabBarStyle: {
          position: "absolute",
          elevation: 0,
          shadowColor: "transparent",
          borderTopWidth: 0.5,
          borderColor: colors.navBarBorder,
          borderTopColor: colors.navBarBorder,
        },
        headerStyle: {
          backgroundColor: colors.bgSecondary,
          elevation: 0,
          shadowColor: "transparent",
          borderBottomWidth: 0.5,
          borderBottomColor: colors.border,
        },
        headerTintColor: colors.textPrimary,
        headerTitleStyle: {
          fontWeight: "normal",
        },
      }}
    >
      <Tabs.Screen
        name="log"
        options={{
          title: "Log",
          tabBarLabel: "Log",
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="calendar" color={color} size={size} />
          ),
        }}
      />
      <Tabs.Screen
        name="index"
        options={{
          title: "Workout",
          tabBarLabel: "Workout",
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="fitness" color={color} size={size} />
          ),
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: "Profile",
          tabBarLabel: "Profile",
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="person" color={color} size={size} />
          ),
        }}
      />
    </Tabs>
  );
}
