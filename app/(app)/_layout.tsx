import { Stack } from 'expo-router';
import { FollowProvider } from '../../context/FollowContext';

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
    </FollowProvider>
  );
}
