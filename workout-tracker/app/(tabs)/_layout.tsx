import { Colors } from "@/constants/Colors";
import { Ionicons } from "@expo/vector-icons";
import { BlurView } from "expo-blur";
import { Tabs } from "expo-router";
import { StyleSheet, View } from "react-native";

export default function TabsLayout() {
  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: Colors.accent,
        tabBarInactiveTintColor: Colors.dark.textSubtle,

        tabBarBackground: () => (
          <View style={{ flex: 1 }}>
            <View
              style={[
                StyleSheet.absoluteFill,
                { backgroundColor: Colors.dark.bgNavbar, opacity: 0.85 },
              ]}
            />
            <BlurView intensity={100} style={StyleSheet.absoluteFill} />
          </View>
        ),
        tabBarStyle: {
          position: "absolute",
          elevation: 0,
          shadowColor: "transparent",
          borderTopWidth: 0.5,
          borderTopColor: Colors.dark.navBarBorder,
        },
        headerStyle: {
          backgroundColor: Colors.dark.bgNavbar,
          elevation: 0,
          shadowColor: "transparent",
          borderBottomWidth: 0.5,
          borderBottomColor: Colors.dark.border,
        },
        headerTintColor: Colors.dark.textPrimary,
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
