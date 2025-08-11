import { Colors } from "@/constants/Colors";
import { GlobalStyles } from "@/constants/GlobalStyles";
import { useBottomTabBarHeight } from "@react-navigation/bottom-tabs";
import { Text, View } from "react-native";

export default function Index() {
  const tabBarHeight = useBottomTabBarHeight();

  return (
    <View
      style={[GlobalStyles.screenContainer, { paddingBottom: tabBarHeight }]}
    >
      <Text style={{ color: Colors.dark.textPrimary }}>Log.</Text>
    </View>
  );
}
