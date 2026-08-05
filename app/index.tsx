import { Redirect } from 'expo-router';
import { useEffect, useState } from 'react';
import { ActivityIndicator, View } from 'react-native';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { clearTokens, getAccessToken, getRefreshToken, saveTokens } from '../services/authStorage';
import { refreshAccessToken } from '../services/endpoints';

type Destination = 'checking' | 'dashboard' | 'login';

export default function IndexScreen() {
  const { colors } = useTheme();
  const { hydrateSession } = useAuth() as any;
  const [destination, setDestination] = useState<Destination>('checking');

  useEffect(() => {
    let cancelled = false;

    async function decide() {
      const [accessToken, refreshToken] = await Promise.all([getAccessToken(), getRefreshToken()]);
      console.log('[index] read from SecureStore:', {
        accessToken: accessToken ? `${accessToken.slice(0, 12)}...` : null,
        refreshToken: refreshToken ? `${refreshToken.slice(0, 12)}...` : null,
      });

      if (!accessToken) {
        console.log('[index] no access token -> login');
        if (!cancelled) setDestination('login');
        return;
      }

      // 1. Try the current access token.
      try {
        // console.log('[index] validating access token...');
        // const result = await validateToken();
        // console.log('[index] validateToken result:', result);
        // if (result.valid) {
        //   await hydrateSession?.({ accessToken, refreshToken, user: result.user });
        //   console.log('[index] session hydrated from valid access token -> dashboard');
          // if (!cancelled) 
            setDestination('dashboard');
          return;
        // }
      } catch (err) {
        console.log('[index] validateToken threw, falling back to refresh:', err);
      }

      // 2. Access token invalid/expired — try refresh token.
      if (refreshToken) {
        try {
          console.log('[index] attempting refresh...');
          const refreshed = await refreshAccessToken(refreshToken);
          console.log('[index] refresh succeeded:', {
            accessToken: refreshed.accessToken ? `${refreshed.accessToken.slice(0, 12)}...` : null,
            refreshToken: refreshed.refreshToken ? `${refreshed.refreshToken.slice(0, 12)}...` : null,
          });
          await saveTokens(refreshed.accessToken, refreshed.refreshToken ?? refreshToken);
          const [checkAccess, checkRefresh] = await Promise.all([getAccessToken(), getRefreshToken()]);
          console.log('[index] verified write-back to SecureStore:', {
            accessToken: checkAccess ? `${checkAccess.slice(0, 12)}...` : null,
            refreshToken: checkRefresh ? `${checkRefresh.slice(0, 12)}...` : null,
          });
          await hydrateSession?.({
            accessToken: refreshed.accessToken,
            refreshToken: refreshed.refreshToken ?? refreshToken,
            user: refreshed.user,
          });
          console.log('[index] session hydrated after refresh -> dashboard');
          if (!cancelled) setDestination('dashboard');
          return;
        } catch (err) {
          console.log('[index] refresh threw, falling back to login:', err);
        }
      } else {
        console.log('[index] no refresh token available');
      }

      // 3. Both failed, or no refresh token existed.
      console.log('[index] clearing tokens -> login');
      await clearTokens();
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
        <ActivityIndicator color={colors.textMuted} />
      </View>
    );
  }

  console.log('[index] redirecting to', destination);
  return <Redirect href={(destination === 'dashboard' ? '/(main)/dashboard' : '/(auth)/welcome') as any} />;
}