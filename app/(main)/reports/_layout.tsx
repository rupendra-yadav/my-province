// app/(main)/reports/_layout.tsx
// Nested Stack inside the Reports tab — the ONLY Reports entry point in the
// app. Admins and residents share this same tab and route tree; screens
// that show individual resident/payment data (resident-payment-list,
// resident/[id], unpaid-residents) are admin-gated inside each screen
// (see the Redirect guard in those files) rather than living in a
// separate (admin) route tree.
import { Stack } from 'expo-router';
import { useTheme } from '../../../context/ThemeContext';

export default function ReportsTabLayout() {
  const { colors } = useTheme();
  return (
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
  );
}
