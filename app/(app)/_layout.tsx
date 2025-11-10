// app/(app)/_layout.tsx
import { Slot } from "expo-router";
import { View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import BottomTabBar from "../../components/BottomTabBar";

export default function AppGroupLayout() {
  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: "#121212" }}>
      <View style={{ flex: 1}}>
        <Slot /> 
      </View>
      <BottomTabBar />
    </SafeAreaView>
  );
}
