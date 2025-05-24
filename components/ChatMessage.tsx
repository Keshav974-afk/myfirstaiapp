import { StyleSheet, View, Text, Pressable } from 'react-native';
import { useColorScheme } from 'react-native';
import { Copy, CircleCheck as CheckCircle2 } from 'lucide-react-native';
import { useState } from 'react';
import * as Clipboard from 'expo-clipboard';
import Animated, { 
  FadeInDown, 
  useAnimatedStyle, 
  useSharedValue, 
  withSequence, 
  withTiming 
} from 'react-native-reanimated';
import Colors from '@/constants/Colors';
import { ImagePreview } from './ImagePreview';

interface ChatMessageProps {
  message: string;
  isUser: boolean;
  animate?: boolean;
}

function extractImageUrl(text: string): string | null {
  const match = text.match(/!\[.*?\]\((.*?)\)/);
  return match ? match[1] : null;
}

function formatMessage(text: string): string {
  return text
    .replace(/!\[.*?\]\((.*?)\)/g, '') // Remove image markdown
    .replace(/\*\*(.*?)\*\*/g, '$1')
    .replace(/\*(.*?)\*/g, '$1')
    .replace(/###\s*(.*?)(\n|$)/g, '$1')
    .replace(/^\s*[-*]\s+/gm, '• ')
    .trim();
}

export function ChatMessage({ message, isUser, animate = false }: ChatMessageProps) {
  const colorScheme = useColorScheme();
  const [copied, setCopied] = useState(false);
  const scale = useSharedValue(1);

  const handleCopy = async () => {
    await Clipboard.setStringAsync(message);
    setCopied(true);
    
    scale.value = withSequence(
      withTiming(1.05, { duration: 100 }),
      withTiming(1, { duration: 100 })
    );
    
    setTimeout(() => {
      setCopied(false);
    }, 2000);
  };

  const animatedStyle = useAnimatedStyle(() => {
    return {
      transform: [{ scale: scale.value }],
    };
  });

  const imageUrl = extractImageUrl(message);
  const formattedMessage = formatMessage(message);

  return (
    <Animated.View 
      style={[
        styles.container,
        isUser ? styles.userContainer : styles.aiContainer,
        animate ? { entering: FadeInDown.duration(300).springify() } : {},
        animatedStyle
      ]}
    >
      <View style={[
        styles.bubble,
        isUser 
          ? { backgroundColor: Colors[colorScheme ?? 'light'].userBubble } 
          : { backgroundColor: Colors[colorScheme ?? 'light'].aiBubble }
      ]}>
        <View>
          {formattedMessage ? (
            <Text style={[
              styles.messageText,
              isUser 
                ? { color: Colors[colorScheme ?? 'light'].userBubbleText } 
                : { color: Colors[colorScheme ?? 'light'].aiBubbleText }
            ]}>
              {formattedMessage}
            </Text>
          ) : null}
          
          {imageUrl && (
            <ImagePreview imageUrl={imageUrl} />
          )}
        </View>
      </View>
      
      {!isUser && (
        <Pressable 
          style={[
            styles.copyButton,
            { backgroundColor: Colors[colorScheme ?? 'light'].background }
          ]} 
          onPress={handleCopy}
        >
          {copied ? (
            <CheckCircle2 size={16} color="#10B981" />
          ) : (
            <Copy size={16} color={Colors[colorScheme ?? 'light'].textSecondary} />
          )}
        </Pressable>
      )}
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: 12,
    maxWidth: '85%',
    position: 'relative',
  },
  userContainer: {
    alignSelf: 'flex-end',
  },
  aiContainer: {
    alignSelf: 'flex-start',
  },
  bubble: {
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  messageText: {
    fontSize: 16,
    fontFamily: 'Inter-Regular',
    lineHeight: 24,
  },
  copyButton: {
    position: 'absolute',
    bottom: -8,
    right: 8,
    borderRadius: 12,
    width: 24,
    height: 24,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 1.5,
    elevation: 2,
  },
});