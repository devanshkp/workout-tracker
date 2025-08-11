import ButtonPrimary from "@/components/Button";
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
      <ButtonPrimary
        text="Start Workout"
        textColor={Colors.dark.bgPrimary}
        buttonColor={Colors.dark.textPrimary}
      ></ButtonPrimary>
      <Text style={{ color: Colors.dark.textPrimary }}>Workout.</Text>
    </View>
  );
}
