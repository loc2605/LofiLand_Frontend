import { Stack } from 'expo-router';
import { FollowProvider } from '../../context/FollowContext';
import BottomTabBar from '../../components/BottomTabBar';

export default function AppGroupLayout() {
  return (
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
  );
}
