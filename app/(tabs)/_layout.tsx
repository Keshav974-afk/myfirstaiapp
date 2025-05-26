import { Tabs } from 'expo-router';
import { useColorScheme, Platform } from 'react-native';
import { MessageSquare, Search, Library, Settings } from 'lucide-react-native';
import Colors from '@/constants/Colors';
import { useEffect } from 'react';
import NetInfo from '@react-native-community/netinfo';
import { useNetworkStatus } from '@/hooks/useNetworkStatus';

export default function TabLayout() {
  const colorScheme = useColorScheme();
  const { isConnected, setIsConnected } = useNetworkStatus();

  useEffect(() => {
    const unsubscribe = NetInfo.addEventListener(state => {
      setIsConnected(state.isConnected ?? false);
    });

    return () => unsubscribe();
  }, []);

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: Colors[colorScheme ?? 'light'].tint,
        tabBarStyle: {
          height: Platform.select({ ios: 65, android: 60 }),
          paddingBottom: Platform.select({ ios: 10, android: 6 }),
          borderTopWidth: Platform.OS === 'ios' ? 1 : 0,
          borderTopColor: Colors[colorScheme ?? 'light'].border,
          backgroundColor: Colors[colorScheme ?? 'light'].cardBackground,
          ...(Platform.OS === 'android' ? {
            elevation: 8,
            paddingTop: 4,
          } : {
            shadowColor: Colors[colorScheme ?? 'light'].cardShadow,
            shadowOffset: {
              width: 0,
              height: -2,
            },
            shadowOpacity: 0.1,
            shadowRadius: 3,
          }),
        },
        tabBarLabelStyle: {
          fontFamily: 'Inter-Medium',
          fontSize: 12,
          marginTop: Platform.OS === 'android' ? -2 : 2,
        },
        tabBarIconStyle: {
          marginTop: Platform.OS === 'android' ? 4 : 4,
        },
        headerShown: false,
      }}>
      <Tabs.Screen
        name="index"
        options={{
          title: 'Chat',
          tabBarIcon: ({ size, color }) => (
            <MessageSquare size={size} color={color} strokeWidth={2.2} />
          ),
        }}
      />
      <Tabs.Screen
        name="explore"
        options={{
          title: 'Explore',
          tabBarIcon: ({ size, color }) => (
            <Search size={size} color={color} strokeWidth={2.2} />
          ),
        }}
      />
      <Tabs.Screen
        name="library"
        options={{
          title: 'Library',
          tabBarIcon: ({ size, color }) => (
            <Library size={size} color={color} strokeWidth={2.2} />
          ),
        }}
      />
      <Tabs.Screen
        name="settings"
        options={{
          title: 'Settings',
          tabBarIcon: ({ size, color }) => (
            <Settings size={size} color={color} strokeWidth={2.2} />
          ),
        }}
      />
    </Tabs>
  );
}