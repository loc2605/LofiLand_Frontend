// app/index.tsx

import { Redirect } from 'expo-router';

const isAuthenticated = false; 

export default function Index() {
  if (isAuthenticated) {
    return <Redirect href="/(app)/home" />; 
  } else {
    return <Redirect href="/(auth)/login" />;
  }
}