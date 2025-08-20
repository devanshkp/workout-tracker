import { getGlobalStyles } from "@/constants/GlobalStyles";
import { useThemeColors } from "@/hooks/useThemeColors";
import React from "react";
import { StyleSheet, Text } from "react-native";
import { ScrollView } from "react-native-gesture-handler";

export default function ReviewWorkouScreen() {
  const { colors } = useThemeColors();
  const styles = React.useMemo(() => createStyles(colors), [colors]);
  const GlobalStyles = React.useMemo(() => getGlobalStyles(colors), [colors]);

  return (
    <ScrollView
      style={{ backgroundColor: colors.bgPrimary }}
      contentContainerStyle={GlobalStyles.screenContainer}
      showsVerticalScrollIndicator={false}
    >
      <Text>active</Text>
    </ScrollView>
  );
}

const createStyles = (colors: any) => StyleSheet.create({});
