import { getGlobalStyles } from "@/constants/GlobalStyles";
import { useThemeColors } from "@/hooks/useThemeColors";
import { useBottomTabBarHeight } from "@react-navigation/bottom-tabs";
import React from "react";
import { Text, View } from "react-native";

export default function Index() {
  const tabBarHeight = useBottomTabBarHeight();
  const { colors } = useThemeColors();
  const GlobalStyles = React.useMemo(() => getGlobalStyles(colors), [colors]);

  return (
    <View
      style={[GlobalStyles.screenContainer, { paddingBottom: tabBarHeight }]}
    >
      <Text style={{ color: colors.textPrimary }}>Log.</Text>
    </View>
  );
}
