import Calendar from "@/components/Calendar";
import { getGlobalStyles } from "@/constants/GlobalStyles";
import { useThemeColors } from "@/hooks/useThemeColors";
import { useBottomTabBarHeight } from "@react-navigation/bottom-tabs";
import React from "react";
import { ScrollView } from "react-native";

export default function Index() {
  const tabBarHeight = useBottomTabBarHeight();
  const { colors } = useThemeColors();
  const GlobalStyles = React.useMemo(() => getGlobalStyles(colors), [colors]);

  return (
    <ScrollView
      style={{ backgroundColor: colors.bgPrimary }}
      contentContainerStyle={[
        GlobalStyles.screenContainer,
        { paddingBottom: tabBarHeight },
      ]}
    >
      <Calendar style={{ alignSelf: "stretch" }} onDatePress={() => {}} />
    </ScrollView>
  );
}
