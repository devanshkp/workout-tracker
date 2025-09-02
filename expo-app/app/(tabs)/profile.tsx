import ButtonPrimary from "@/components/Button";
import { getGlobalStyles } from "@/constants/GlobalStyles";
import { useThemeColors } from "@/hooks/useThemeColors";
import { useBottomTabBarHeight } from "@react-navigation/bottom-tabs";
import { useRouter } from "expo-router";
import React from "react";
import { Text, View } from "react-native";

export default function ProfileScreen() {
  const tabBarHeight = useBottomTabBarHeight();
  const { colors } = useThemeColors();
  const GlobalStyles = React.useMemo(() => getGlobalStyles(colors), [colors]);
  const router = useRouter();

  const handleOpenDbInspector = () => {
    router.push("/dev/db-inspector");
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
    </View>
  );
}
