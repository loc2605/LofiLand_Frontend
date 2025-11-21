import { Stack } from 'expo-router';
import { FollowProvider } from '../../context/FollowContext';
import BottomTabBar from '../../components/BottomTabBar';
import { SafeAreaProvider } from 'react-native-safe-area-context';

export default function AppGroupLayout() {
  return (
    <SafeAreaProvider>
    <FollowProvider>
      <Stack
        screenOptions={{
          headerShown: false,
        }}
      >
        <Stack.Screen name="home" />
      </Stack>
      <BottomTabBar />
    </FollowProvider>
    </SafeAreaProvider>
  );
}
