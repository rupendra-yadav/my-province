import { Image } from 'expo-image';
import { Redirect } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { useEffect, useState } from 'react';
import { ActivityIndicator, View } from 'react-native';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { clearTokens, getAccessToken, getRefreshToken } from '../services/authStorage';
import { refreshAccessToken, SessionBundle, validateToken } from '../services/endpoints';

type Destination = 'checking' | 'dashboard' | 'pending' | 'register' | 'login';

// Same routing rule as verify-otp on the backend: rejected users go back
// through registration (they resubmit), not to a dedicated rejected screen.
function resolveDestination(bundle: SessionBundle): Destination {
  if (bundle.isAdmin) return 'dashboard';
  if (bundle.isRegistered && bundle.requestStatus === 'approved') return 'dashboard';
  if (bundle.isRegistered && bundle.requestStatus === 'pending') return 'pending';
  return 'register';
}

export default function IndexScreen() {
  const { colors } = useTheme();
  const { hydrateSession } = useAuth();
  const [destination, setDestination] = useState<Destination>('checking');

  useEffect(() => {
    let cancelled = false;

    async function decide() {
      const accessToken = await getAccessToken();

      if (!accessToken) {
        console.log('[index] no access token -> login');
        await SplashScreen.hideAsync();
        if (!cancelled) setDestination('login');
        return;
      }

      // 1. Try the current access token.
      try {
        const bundle = await validateToken();
        await hydrateSession(bundle);
        console.log('[index] validateToken ok ->', bundle);
        await SplashScreen.hideAsync();
        if (!cancelled) setDestination(resolveDestination(bundle));
        return;
      } catch (err) {
        console.log('[index] validateToken failed, falling back to refresh:', err);
      }

      // 2. Access token invalid/expired — try refresh token.
      const refreshToken = await getRefreshToken();
      if (refreshToken) {
        try {
          const refreshed = await refreshAccessToken(refreshToken);
          await hydrateSession(refreshed);
          console.log('[index] refresh ok ->', refreshed);
          await SplashScreen.hideAsync();
          if (!cancelled) setDestination(resolveDestination(refreshed));
          return;
        } catch (err) {
          console.log('[index] refresh failed:', err);
        }
      } else {
        console.log('[index] no refresh token available');
      }

      // 3. Both failed, or no refresh token existed.
      console.log('[index] clearing tokens -> login');
      await clearTokens();
      await SplashScreen.hideAsync();
      if (!cancelled) setDestination('login');
    }

    decide();
    return () => {
      cancelled = true;
    };
  }, []);

  if (destination === 'checking') {
    return (
      <View style={{ flex: 1, backgroundColor: colors.background, alignItems: 'center', justifyContent: 'center' }}>
        <Image
          source={require('../assets/images/splash-logo.png')}
          style={{ width: 220, height: 120 }}
          contentFit="contain"
        />
        <ActivityIndicator color={colors.textMuted} style={{ marginTop: 32 }} />
      </View>
    );
  }

  const routes: Record<Exclude<Destination, 'checking'>, string> = {
    dashboard: '/(main)/dashboard',
    pending: '/(auth)/pending', // ⚠️ confirm this matches your actual pending screen route
    register: '/(auth)/welcome',
    login: '/(auth)/welcome',
  };

  console.log('[index] redirecting to', destination);
  return <Redirect href={routes[destination] as any} />;
}