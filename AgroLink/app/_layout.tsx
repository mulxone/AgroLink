


import { Stack } from 'expo-router';

export default function RootLayout() {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      {/* Start with auth stack */}
      <Stack.Screen name="(auth)/login" />
      <Stack.Screen name="(tabs)/index" />
    </Stack>
  );
}
