import { StyleSheet, View, Text, Animated } from 'react-native';
import { useNetworkStatus } from '@/hooks/useNetworkStatus';
import { useColorScheme } from 'react-native';
import Colors from '@/constants/Colors';
import { useEffect, useRef } from 'react';
import { Wifi, WifiOff } from 'lucide-react-native';

export function NetworkStatus() {
  const { isConnected } = useNetworkStatus();
  const colorScheme = useColorScheme();
  const slideAnim = useRef(new Animated.Value(-100)).current;

  useEffect(() => {
    Animated.spring(slideAnim, {
      toValue: isConnected ? -100 : 0,
      useNativeDriver: true,
    }).start();
  }, [isConnected]);

  if (isConnected) return null;

  return (
    <Animated.View
      style={[
        styles.container,
        {
          backgroundColor: Colors[colorScheme ?? 'light'].dangerBackground,
          transform: [{ translateY: slideAnim }],
        },
      ]}
    >
      <WifiOff size={20} color={Colors[colorScheme ?? 'light'].danger} />
      <Text
        style={[
          styles.text,
          { color: Colors[colorScheme ?? 'light'].danger },
        ]}
      >
        No internet connection
      </Text>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
    paddingHorizontal: 16,
    gap: 8,
    zIndex: 1000,
  },
  text: {
    fontSize: 14,
    fontFamily: 'Inter-Medium',
  },
});