import { Ionicons } from '@expo/vector-icons';
import { Tabs } from 'expo-router';
import { Platform, Pressable, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '../../context/ThemeContext';

const TAB_ICONS: Record<string, keyof typeof Ionicons.glyphMap> = {
  dashboard: 'home-outline',
  payment: 'receipt-outline',
  profile: 'person-outline',
};

const TAB_LABELS: Record<string, string> = {
  dashboard: 'Dashboard',
  payment: 'Payments',
  profile: 'Profile',
};

function FloatingTabBar({ state, navigation }: any) {
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();

  return (
    <View
      style={{
        position: 'absolute',
        left: 20,
        right: 20,
        bottom: Math.max(insets.bottom, 12) + (Platform.OS === 'ios' ? 8 : 4),
      }}
    >
      <View
        style={{
          flexDirection: 'row',
          height: 64,
          borderRadius: 24,
          backgroundColor: colors.surface,
          borderWidth: 1,
          borderColor: colors.border,
          elevation: 8,
          shadowColor: '#000',
          shadowOffset: { width: 0, height: 4 },
          shadowOpacity: 0.12,
          shadowRadius: 12,
        }}
      >
        {state.routes.map((route: any, index: number) => {
          const focused = state.index === index;
          const iconName = TAB_ICONS[route.name] ?? 'ellipse-outline';
          const label = TAB_LABELS[route.name] ?? route.name;

          return (
            <Pressable
              key={route.key}
              onPress={() => {
                const event = navigation.emit({ type: 'tabPress', target: route.key, canPreventDefault: true });
                if (!focused && !event.defaultPrevented) navigation.navigate(route.name);
              }}
              style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}
            >
              <Ionicons name={iconName} size={22} color={focused ? colors.accent : colors.textMuted} />
              <Text
                style={{
                  fontSize: 11,
                  marginTop: 2,
                  color: focused ? colors.accent : colors.textMuted,
                  fontWeight: focused ? '500' : '400',
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
      <Tabs.Screen name="profile" />
    </Tabs>
  );
}