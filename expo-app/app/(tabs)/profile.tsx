import ButtonPrimary from "@/components/Button";
import { getGlobalStyles } from "@/constants/GlobalStyles";
import { useThemeColors } from "@/hooks/useThemeColors";
import { useWorkoutDraft } from "@/store/useWorkoutDraft";
import { useBottomTabBarHeight } from "@react-navigation/bottom-tabs";
import { useRouter } from "expo-router";
import { useSQLiteContext } from "expo-sqlite";
import React from "react";
import { Alert, Text, View } from "react-native";

export default function ProfileScreen() {
  const tabBarHeight = useBottomTabBarHeight();
  const { colors } = useThemeColors();
  const GlobalStyles = React.useMemo(() => getGlobalStyles(colors), [colors]);
  const router = useRouter();
  const db = useSQLiteContext();
  const { cancelDraft } = useWorkoutDraft();

  const handleOpenDbInspector = () => {
    router.push("/dev/db-inspector");
  };

  async function resetDatabase() {
    try {
      // Clear Zustand store first
      cancelDraft();

      // Drop all tables and recreate with current schema
      await db.withTransactionAsync(async () => {
        // Drop all tables
        await db.execAsync(`
          DROP TABLE IF EXISTS workout_set;
          DROP TABLE IF EXISTS workout_exercise;
          DROP TABLE IF EXISTS workout;
          DROP TABLE IF EXISTS exercise;
        `);

        // Reset user_version to 0 to trigger migrations
        await db.execAsync(`PRAGMA user_version = 0;`);
      });

      console.log(
        "Database reset successfully - schema will be recreated on next app start."
      );

      Alert.alert(
        "Success",
        "Database has been reset. Please restart the app to recreate the schema with any recent changes."
      );
    } catch (error) {
      console.error(`Error resetting database:`, error);
      Alert.alert("Error", `Failed to reset database: ${error}`);
    }
  }

  const handleDeleteDatabase = () => {
    Alert.alert(
      "Reset Database",
      "This will drop all tables and reset the schema. All data will be lost. Are you sure?",
      [
        {
          text: "Cancel",
          style: "cancel",
        },
        {
          style: "destructive",
          text: "Reset",
          onPress: resetDatabase,
        },
      ]
    );
  };

  return (
    <View
      style={[GlobalStyles.screenContainer, { paddingBottom: tabBarHeight }]}
    >
      <Text style={{ color: colors.textPrimary, marginBottom: 20 }}>
        Profile.
      </Text>

      <ButtonPrimary
        text="Open DB Inspector"
        onPress={handleOpenDbInspector}
        iconName="search"
        style={{ marginBottom: 16 }}
      />
      <ButtonPrimary
        text="Reset Database"
        onPress={handleDeleteDatabase}
        iconName="refresh"
        style={{ marginBottom: 16 }}
      />
    </View>
  );
}
