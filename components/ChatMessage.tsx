import { StyleSheet, View, Text, Pressable } from 'react-native';
import { useColorScheme } from 'react-native';
import { Copy, CircleCheck as CheckCircle2, Volume2 } from 'lucide-react-native';
import { useState } from 'react';
import * as Clipboard from 'expo-clipboard';
import * as Speech from 'expo-speech';
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
  // Match standard markdown images: ![alt](url)
  const markdownMatch = text.match(/!\[([^\]]*)\]\(([^)]+)\)/);
  if (markdownMatch) return markdownMatch[2];

  // Match alternative format: [!alt](url)
  const altMatch = text.match(/\[!([^\]]*)\]\(([^)]+)\)/);
  if (altMatch) return altMatch[2];

  // Match direct image URLs
  const urlMatch = text.match(/https?:\/\/[^\s<>)"]+?\.(?:jpg|jpeg|png|gif|webp)/i);
  if (urlMatch) return urlMatch[0];

  // Match Snapzion workspace URLs
  const workspaceMatch = text.match(/https:\/\/cdn\.snapzion\.com\/workspace-[a-f0-9-]+\/image\/[a-f0-9-]+\.[a-z]+/i);
  if (workspaceMatch) return workspaceMatch[0];

  return null;
}

function formatMessage(text: string): string {
  return text
    .replace(/!\[.*?\]\((.*?)\)/g, '') // Remove image markdown
    .replace(/\[!.*?\]\((.*?)\)/g, '') // Remove alternative image format
    .replace(/\*\*(.*?)\*\*/g, '$1')
    .replace(/\*(.*?)\*/g, '$1')
    .replace(/###\s*(.*?)(\n|$)/g, '$1')
    .replace(/^\s*[-*]\s+/gm, '• ')
    .trim();
}

export function ChatMessage({ message, isUser, animate = false }: ChatMessageProps) {
  const colorScheme = useColorScheme();
  const [copied, setCopied] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
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

  const handleSpeak = async () => {
    if (isSpeaking) {
      await Speech.stop();
      setIsSpeaking(false);
    } else {
      setIsSpeaking(true);
      await Speech.speak(formatMessage(message), {
        onDone: () => setIsSpeaking(false),
        onError: () => setIsSpeaking(false),
      });
    }
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
        <View style={styles.actionButtons}>
          <Pressable 
            style={[
              styles.actionButton,
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

          <Pressable 
            style={[
              styles.actionButton,
              { backgroundColor: Colors[colorScheme ?? 'light'].background }
            ]} 
            onPress={handleSpeak}
          >
            <Volume2 
              size={16} 
              color={isSpeaking ? Colors[colorScheme ?? 'light'].tint : Colors[colorScheme ?? 'light'].textSecondary} 
            />
          </Pressable>
        </View>
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
  actionButtons: {
    position: 'absolute',
    bottom: -8,
    right: 8,
    flexDirection: 'row',
    gap: 8,
  },
  actionButton: {
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