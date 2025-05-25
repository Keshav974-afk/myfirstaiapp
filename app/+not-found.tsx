import { Link, Stack } from 'expo-router';
import { StyleSheet, Text, View, Image, Pressable } from 'react-native';
import { Chrome as Home } from 'lucide-react-native';
import { useColorScheme } from 'react-native';
import Colors from '@/constants/Colors';

export default function NotFoundScreen() {
  const colorScheme = useColorScheme();

  return (
    <View style={styles.container}>
      <Stack.Screen options={{ headerShown: false }} />
      
      <Image 
        source={{ uri: 'https://images.pexels.com/photos/4439425/pexels-photo-4439425.jpeg' }}
        style={styles.image}
      />
      
      <Text style={[
        styles.title,
        { color: Colors[colorScheme ?? 'light'].text }
      ]}>
        Page Not Found
      </Text>
      
      <Text style={[
        styles.description,
        { color: Colors[colorScheme ?? 'light'].textSecondary }
      ]}>
        The page you're looking for doesn't exist or has been moved.
      </Text>

      <Link href="/" asChild>
        <Pressable style={[
          styles.button,
          { backgroundColor: Colors[colorScheme ?? 'light'].tint }
        ]}>
          <Home size={20} color="#FFFFFF" />
          <Text style={styles.buttonText}>Go to Home</Text>
        </Pressable>
      </Link>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  image: {
    width: 240,
    height: 240,
    borderRadius: 120,
    marginBottom: 32,
  },
  title: {
    fontSize: 24,
    fontFamily: 'Inter-Bold',
    marginBottom: 12,
    textAlign: 'center',
  },
  description: {
    fontSize: 16,
    fontFamily: 'Inter-Regular',
    textAlign: 'center',
    marginBottom: 32,
    maxWidth: 300,
  },
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 12,
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontFamily: 'Inter-Medium',
    marginLeft: 8,
  },
});