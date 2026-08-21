import { Ionicons } from '@expo/vector-icons';
import { getFocusedRouteNameFromRoute } from '@react-navigation/native';
import { Tabs } from 'expo-router';
import { useRef, useState } from 'react';
import { Animated, LayoutChangeEvent, Platform, Pressable, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '../../context/ThemeContext';

const TAB_ICONS: Record<string, keyof typeof Ionicons.glyphMap> = {
  dashboard: 'home-outline',
  payment: 'receipt-outline',
  expenses: 'cash-outline',
  reports: 'bar-chart-outline',
  profile: 'person-outline',
};

const TAB_ICONS_FILLED: Record<string, keyof typeof Ionicons.glyphMap> = {
  dashboard: 'home',
  payment: 'receipt',
  expenses: 'cash',
  reports: 'bar-chart',
  profile: 'person',
};

const TAB_LABELS: Record<string, string> = {
  dashboard: 'Home',
  payment: 'Payments',
  expenses: 'Expenses',
  reports: 'Reports',
  profile: 'Profile',
};

function FloatingTabBar({ state, navigation }: any) {
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();

  const focusedRoute = state.routes[state.index];
  const focusedRouteName = getFocusedRouteNameFromRoute(focusedRoute) ?? 'index';
  const hideTabBar = focusedRoute.name === 'reports' && focusedRouteName !== 'index';

  const [widths, setWidths] = useState<number[]>(state.routes.map(() => 0));
  const anim = useRef(new Animated.Value(state.index)).current;

  Animated.spring(anim, {
    toValue: state.index,
    useNativeDriver: true,
    speed: 18,
    bounciness: 6,
  }).start();

  if (hideTabBar) return null;

  const onTabLayout = (index: number) => (e: LayoutChangeEvent) => {
    const w = e.nativeEvent.layout.width;
    setWidths((prev) => {
      if (prev[index] === w) return prev;
      const next = [...prev];
      next[index] = w;
      return next;
    });
  };

  const offsets = widths.reduce<number[]>((acc, w, i) => {
    acc.push(i === 0 ? 0 : acc[i - 1] + widths[i - 1]);
    return acc;
  }, []);

  const translateX = anim.interpolate({
    inputRange: state.routes.map((_: any, i: number) => i),
    outputRange: offsets.map((o, i) => o + (widths[i] ?? 0) / 2 - 26),
  });

  return (
    <View
      style={{
        position: 'absolute',
        left: 16,
        right: 16,
        bottom: Math.max(insets.bottom, 12) + (Platform.OS === 'ios' ? 6 : 4),
        alignItems: 'center',
      }}
    >
      <View
        style={{
          flexDirection: 'row',
          height: 64,
          borderRadius: 32,
          backgroundColor: colors.surface,
          borderWidth: 1,
          borderColor: colors.border,
          paddingHorizontal: 6,
          shadowColor: '#000',
          shadowOffset: { width: 0, height: 8 },
          shadowOpacity: 0.14,
          shadowRadius: 20,
          elevation: 10,
        }}
      >
        {widths.every((w) => w > 0) && (
          <Animated.View
            pointerEvents="none"
            style={{
              position: 'absolute',
              top: 8,
              left: 6,
              width: 52,
              height: 48,
              borderRadius: 20,
              backgroundColor: colors.accentMuted,
              transform: [{ translateX }],
            }}
          />
        )}

        {state.routes.map((route: any, index: number) => {
          const focused = state.index === index;
          const iconName = focused
            ? TAB_ICONS_FILLED[route.name] ?? 'ellipse'
            : TAB_ICONS[route.name] ?? 'ellipse-outline';
          const label = TAB_LABELS[route.name] ?? route.name;

          return (
            <Pressable
              key={route.key}
              onLayout={onTabLayout(index)}
              onPress={() => {
                const event = navigation.emit({ type: 'tabPress', target: route.key, canPreventDefault: true });
                if (!focused && !event.defaultPrevented) navigation.navigate(route.name);
              }}
              style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}
              hitSlop={4}
            >
              <Ionicons name={iconName} size={22} color={focused ? colors.accent : colors.textMuted} />
              <Text
                numberOfLines={1}
                style={{
                  fontSize: 9.5,
                  marginTop: 3,
                  maxWidth: 60,
                  color: focused ? colors.accent : colors.textMuted,
                  fontWeight: focused ? '600' : '400',
                }}
              >
                {label}
              </Text>
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}

export default function MainLayout() {
  return (
    <Tabs screenOptions={{ headerShown: false }} tabBar={(props) => <FloatingTabBar {...props} />}>
      <Tabs.Screen name="dashboard" />
      <Tabs.Screen name="payment" />
      <Tabs.Screen name="expenses" />
      <Tabs.Screen name="reports" />
      <Tabs.Screen name="profile" />
    </Tabs>
  );
}