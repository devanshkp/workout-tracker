import { migrateDbIfNeeded } from "@/data/db";
import { seedExercisesIfEmpty } from "@/data/seed/seedCatalog";
import { Stack } from "expo-router";
import { SQLiteProvider } from "expo-sqlite";
import { Suspense } from "react";
import { ActivityIndicator, View } from "react-native";
import { GestureHandlerRootView } from "react-native-gesture-handler";

function Fallback() {
  return (
    <View style={{ flex: 1, alignItems: "center", justifyContent: "center" }}>
      <ActivityIndicator />
    </View>
  );
}

export default function RootLayout() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <Suspense fallback={<Fallback />}>
        <SQLiteProvider
          databaseName="workout.db"
          onInit={async () => {
            migrateDbIfNeeded();
            await seedExercisesIfEmpty();
          }}
          useSuspense
        >
          <Stack>
            <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
            <Stack.Screen
              name="workout-log/active"
              options={{ headerShown: false }}
            />
            <Stack.Screen
              name="workout-log/review"
              options={{ headerShown: false }}
            />
          </Stack>
        </SQLiteProvider>
      </Suspense>
    </GestureHandlerRootView>
  );
}
