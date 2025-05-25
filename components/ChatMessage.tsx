import { StyleSheet, View, Text, Pressable, Platform } from 'react-native';
import { useColorScheme } from 'react-native';
import { Copy, CircleCheck as CheckCircle2, Volume2, Share2, Bookmark, CreditCard as Edit3 } from 'lucide-react-native';
import { useState, useEffect } from 'react';
import * as Clipboard from 'expo-clipboard';
import * as Speech from 'expo-speech';
import * as Sharing from 'expo-sharing';
import Animated, { 
  FadeInDown, 
  useAnimatedStyle, 
  useSharedValue, 
  withSequence, 
  withTiming,
  FadeIn,
  FadeOut,
  SlideInUp,
  SlideOutDown
} from 'react-native-reanimated';
import Colors from '@/constants/Colors';
import { ImagePreview } from './ImagePreview';

interface ChatMessageProps {
  message: string;
  isUser: boolean;
  animate?: boolean;
  onEdit?: (message: string) => void;
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
  const workspaceMatch = text.match(/https:\/\/cdn\.snapzion\.com\/workspace-[a-f0-9-]+\/image\/[a-f0-9-]+(?:\.[a-z]+)?/i);
  if (workspaceMatch) {
    const url = workspaceMatch[0];
    return url.endsWith('.png') ? url : `${url}.png`;
  }

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

export function ChatMessage({ message, isUser, animate = false, onEdit }: ChatMessageProps) {
  const colorScheme = useColorScheme();
  const [copied, setCopied] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isBookmarked, setIsBookmarked] = useState(false);
  const [showActions, setShowActions] = useState(false);
  const scale = useSharedValue(1);

  // Add event listener for clicks outside the message
  useEffect(() => {
    if (!showActions) return;

    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      if (!target.closest('.message-actions') && !target.closest('.message-bubble')) {
        setShowActions(false);
      }
    };

    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, [showActions]);

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

  const handleShare = async () => {
    const formattedText = formatMessage(message);
    
    if (Platform.OS === 'web') {
      try {
        await navigator.share({
          text: formattedText,
        });
      } catch (error) {
        // Fallback for browsers that don't support Web Share API
        await Clipboard.setStringAsync(formattedText);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      }
    } else if (await Sharing.isAvailableAsync()) {
      try {
        await Sharing.shareAsync(formattedText);
      } catch (error) {
        console.log('Error sharing:', error);
      }
    }
  };

  const handleBookmark = () => {
    setIsBookmarked(!isBookmarked);
    // TODO: Implement bookmark storage
  };

  const animatedStyle = useAnimatedStyle(() => {
    return {
      transform: [{ scale: scale.value }],
    };
  });

  const imageUrl = extractImageUrl(message);
  const formattedMessage = formatMessage(message);

  return (
    <View style={[
      styles.wrapper,
      isUser ? styles.userWrapper : styles.aiWrapper
    ]}>
      <Animated.View 
        style={[
          styles.container,
          isUser ? styles.userContainer : styles.aiContainer,
          animate ? { entering: FadeInDown.duration(300).springify() } : {},
          animatedStyle
        ]}
      >
        <Pressable 
          style={styles.messageWrapper}
          onLongPress={() => setShowActions(true)}
          className="message-bubble"
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
        </Pressable>
        
        {showActions && (
          <Animated.View 
            entering={SlideInUp.duration(200).springify()}
            exiting={SlideOutDown.duration(150)}
            style={[
              styles.actionButtonsContainer,
              { backgroundColor: Colors[colorScheme ?? 'light'].background }
            ]}
            className="message-actions"
          >
            <View style={styles.actionButtons}>
              <Pressable 
                style={[
                  styles.actionButton,
                  copied && { backgroundColor: Colors[colorScheme ?? 'light'].tintTransparent }
                ]} 
                onPress={handleCopy}
              >
                {copied ? (
                  <CheckCircle2 size={16} color={Colors[colorScheme ?? 'light'].tint} />
                ) : (
                  <Copy size={16} color={Colors[colorScheme ?? 'light'].textSecondary} />
                )}
              </Pressable>

              <Pressable 
                style={[
                  styles.actionButton,
                  isSpeaking && { backgroundColor: Colors[colorScheme ?? 'light'].tintTransparent }
                ]}
                onPress={handleSpeak}
              >
                <Volume2 
                  size={16} 
                  color={isSpeaking ? Colors[colorScheme ?? 'light'].tint : Colors[colorScheme ?? 'light'].textSecondary} 
                />
              </Pressable>

              <Pressable 
                style={styles.actionButton}
                onPress={handleShare}
              >
                <Share2 
                  size={16} 
                  color={Colors[colorScheme ?? 'light'].textSecondary} 
                />
              </Pressable>

              <Pressable 
                style={[
                  styles.actionButton,
                  isBookmarked && { backgroundColor: Colors[colorScheme ?? 'light'].tintTransparent }
                ]}
                onPress={handleBookmark}
              >
                <Bookmark 
                  size={16}
                  color={isBookmarked ? Colors[colorScheme ?? 'light'].tint : Colors[colorScheme ?? 'light'].textSecondary}
                  fill={isBookmarked ? Colors[colorScheme ?? 'light'].tint : 'transparent'}
                />
              </Pressable>

              {isUser && onEdit && (
                <Pressable 
                  style={styles.actionButton}
                  onPress={() => {
                    setShowActions(false);
                    onEdit(message);
                  }}
                >
                  <Edit3 
                    size={16} 
                    color={Colors[colorScheme ?? 'light'].textSecondary} 
                  />
                </Pressable>
              )}
            </View>
          </Animated.View>
        )}
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    marginBottom: 32,
    position: 'relative',
    width: '100%',
    zIndex: 1,
  },
  userWrapper: {
    alignItems: 'flex-end',
  },
  aiWrapper: {
    alignItems: 'flex-start',
  },
  container: {
    maxWidth: '85%',
    position: 'relative',
  },
  messageWrapper: {
    position: 'relative',
    zIndex: 1,
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
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.15,
    shadowRadius: 2,
  },
  messageText: {
    fontSize: 16,
    fontFamily: 'Inter-Regular',
    lineHeight: 24,
  },
  actionButtonsContainer: {
    position: 'absolute',
    top: '100%',
    left: '50%',
    transform: [{ translateX: -100 }],
    marginTop: 8,
    borderRadius: 24,
    zIndex: 1000,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 3.84,
    elevation: 5,
  },
  actionButtons: {
    flexDirection: 'row',
    gap: 4,
    padding: 6,
    width: 200,
    justifyContent: 'space-around',
  },
  actionButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'transparent',
  },
});