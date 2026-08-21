// app/_layout.tsx
import { Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { StatusBar } from 'expo-status-bar';
import { AuthProvider } from '../context/AuthContext';
import { ExpensesProvider } from '../context/ExpensesContext';
import { PaymentsProvider } from '../context/PaymentsContext';
import { RequestsProvider } from '../context/RequestsContext';
import { ThemeProvider, useTheme } from '../context/ThemeContext';
SplashScreen.preventAutoHideAsync();

function RootStack() {
  const { isDark, colors } = useTheme();
  return (
    <>
      <StatusBar style={isDark ? 'light' : 'dark'} />
      <Stack
        initialRouteName="index"
        screenOptions={{
          headerShown: false,
          contentStyle: { backgroundColor: colors.background },
          animation: 'slide_from_right',
        }}
      >
        <Stack.Screen name="index" />
        <Stack.Screen name="(auth)" />
        <Stack.Screen name="(main)" />
        <Stack.Screen name="(admin)" />
      </Stack>
    </>
  );
}

export default function RootLayout() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <RequestsProvider>
          <PaymentsProvider>
            <ExpensesProvider>
              <RootStack />
            </ExpensesProvider>
          </PaymentsProvider>
        </RequestsProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}