// app/(main)/reports/_layout.tsx
// Nested Stack inside the Reports tab — the ONLY Reports entry point in
// the app. Wrapped in ReportsProvider so index/collection-summary/
// house-type-analysis share one fetch of range-based data.
import { Stack } from 'expo-router';
import { ReportsProvider } from '../../../context/ReportsContext';
import { useTheme } from '../../../context/ThemeContext';

export default function ReportsTabLayout() {
  const { colors } = useTheme();
  return (
    <ReportsProvider>
      <Stack
        screenOptions={{
          headerShown: false,
          contentStyle: { backgroundColor: colors.background },
          animation: 'slide_from_right',
        }}
      >
        <Stack.Screen name="index" />
        <Stack.Screen name="collection-summary" />
        <Stack.Screen name="house-type-analysis" />
        <Stack.Screen name="collection-trend" />
        <Stack.Screen name="resident-payment-list" />
        <Stack.Screen name="resident/[id]" options={{ animation: 'slide_from_bottom' }} />
        <Stack.Screen name="unpaid-residents" />
      </Stack>
    </ReportsProvider>
  );
}
