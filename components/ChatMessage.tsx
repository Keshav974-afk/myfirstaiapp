import { StyleSheet, View, Text, Pressable, Platform } from 'react-native';
import { useColorScheme } from 'react-native';
import { Copy, CircleCheck as CheckCircle2, Volume2, Share2, Bookmark, CreditCard as Edit3 } from 'lucide-react-native';
import { useState, useEffect, useCallback } from 'react';
import * as Clipboard from 'expo-clipboard';
import * as Speech from 'expo-speech';
import * as Sharing from 'expo-sharing';
import Animated, { 
  FadeInDown, 
  useAnimatedStyle, 
  useSharedValue, 
  withSequence, 
  withTiming,
  SlideInUp,
  SlideOutDown
} from 'react-native-reanimated';
import Colors from '@/constants/Colors';
import { ImagePreview } from './ImagePreview';
import { MathBlock } from './MathBlock';

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

  // Match Snapzion workspace URLs - Fixed regex to properly escape special characters
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

function extractMathBlocks(text: string): { type: 'text' | 'math' | 'image', content: string, inline?: boolean }[] {
  const parts: { type: 'text' | 'math' | 'image', content: string, inline?: boolean }[] = [];
  let currentText = '';

  // Split the text by math delimiters
  const regex = /(\\\[.*?\\\]|\\\(.*?\\\)|\$\$.*?\$\$|\$.*?\$)/gs;
  const matches = text.split(regex);

  matches.forEach(part => {
    if (part.trim() === '') return;

    if (part.startsWith('\\[') && part.endsWith('\\]')) {
      // Display math
      if (currentText) {
        parts.push({ type: 'text', content: currentText });
        currentText = '';
      }
      parts.push({ 
        type: 'math', 
        content: part.slice(2, -2).trim(),
        inline: false
      });
    } else if (part.startsWith('\\(') && part.endsWith('\\)')) {
      // Inline math
      if (currentText) {
        parts.push({ type: 'text', content: currentText });
        currentText = '';
      }
      parts.push({ 
        type: 'math', 
        content: part.slice(2, -2).trim(),
        inline: true
      });
    } else if (part.startsWith('$$') && part.endsWith('$$')) {
      // Display math (alternative syntax)
      if (currentText) {
        parts.push({ type: 'text', content: currentText });
        currentText = '';
      }
      parts.push({ 
        type: 'math', 
        content: part.slice(2, -2).trim(),
        inline: false
      });
    } else if (part.startsWith('$') && part.endsWith('$')) {
      // Inline math (alternative syntax)
      if (currentText) {
        parts.push({ type: 'text', content: currentText });
        currentText = '';
      }
      parts.push({ 
        type: 'math', 
        content: part.slice(1, -1).trim(),
        inline: true
      });
    } else {
      currentText += part;
    }
  });

  if (currentText) {
    parts.push({ type: 'text', content: currentText });
  }

  // Process images in text parts
  const processedParts: typeof parts = [];
  parts.forEach(part => {
    if (part.type === 'text') {
      const imageUrl = extractImageUrl(part.content);
      if (imageUrl) {
        const textParts = part.content.split(new RegExp(`(${imageUrl})`));
        textParts.forEach(textPart => {
          if (textPart === imageUrl) {
            processedParts.push({ type: 'image', content: imageUrl });
          } else if (textPart.trim()) {
            processedParts.push({ type: 'text', content: formatMessage(textPart) });
          }
        });
      } else {
        processedParts.push({ type: 'text', content: formatMessage(part.content) });
      }
    } else {
      processedParts.push(part);
    }
  });

  return processedParts;
}

export function ChatMessage({ message, isUser, animate = false, onEdit }: ChatMessageProps) {
  const colorScheme = useColorScheme();
  const [copied, setCopied] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isBookmarked, setIsBookmarked] = useState(false);
  const [showActions, setShowActions] = useState(false);
  const scale = useSharedValue(1);

  const handleClickOutside = useCallback((event: any) => {
    const target = event.target as HTMLElement;
    if (!target.closest('.message-actions') && !target.closest('.message-bubble')) {
      setShowActions(false);
    }
  }, []);

  useEffect(() => {
    if (Platform.OS === 'web' && showActions) {
      document.addEventListener('click', handleClickOutside);
      document.addEventListener('touchstart', handleClickOutside);
      return () => {
        document.removeEventListener('click', handleClickOutside);
        document.removeEventListener('touchstart', handleClickOutside);
      };
    }
  }, [showActions, handleClickOutside]);

  const handleCopy = async () => {
    await Clipboard.setStringAsync(message);
    setCopied(true);
    setShowActions(false);
    
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
        onDone: () => {
          setIsSpeaking(false);
          setShowActions(false);
        },
        onError: () => {
          setIsSpeaking(false);
          setShowActions(false);
        },
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
    setShowActions(false);
  };

  const handleBookmark = () => {
    setIsBookmarked(!isBookmarked);
    setShowActions(false);
    // TODO: Implement bookmark storage
  };

  const handleEdit = () => {
    if (onEdit) {
      onEdit(message);
      setShowActions(false);
    }
  };

  const animatedStyle = useAnimatedStyle(() => {
    return {
      transform: [{ scale: scale.value }],
    };
  });

  const parts = extractMathBlocks(message);

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
              {parts.map((part, index) => {
                if (part.type === 'text') {
                  return (
                    <Text 
                      key={index}
                      style={[
                        styles.messageText,
                        isUser 
                          ? { color: Colors[colorScheme ?? 'light'].userBubbleText } 
                          : { color: Colors[colorScheme ?? 'light'].aiBubbleText }
                      ]}
                    >
                      {part.content}
                    </Text>
                  );
                } else if (part.type === 'math') {
                  return (
                    <MathBlock 
                      key={index}
                      formula={part.content}
                      inline={part.inline}
                    />
                  );
                } else if (part.type === 'image') {
                  return (
                    <ImagePreview 
                      key={index}
                      imageUrl={part.content}
                    />
                  );
                }
              })}
            </View>
          </View>
        </Pressable>
        
        {showActions && (
          <Animated.View 
            entering={SlideInUp.duration(200).springify()}
            exiting={SlideOutDown.duration(150)}
            style={[
              styles.actionButtonsContainer,
              { backgroundColor: Colors[colorScheme ?? 'light'].cardBackground }
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
                  onPress={handleEdit}
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
    ...(Platform.OS === 'ios' ? {
      shadowColor: Colors.light.cardShadow,
      shadowOffset: {
        width: 0,
        height: 1,
      },
      shadowOpacity: 0.15,
      shadowRadius: 2,
    } : {
      elevation: 2,
    }),
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
    borderWidth: 1,
    borderColor: Colors.light.cardBorder,
    ...(Platform.OS === 'ios' ? {
      shadowColor: Colors.light.cardShadow,
      shadowOffset: {
        width: 0,
        height: 2,
      },
      shadowOpacity: 0.15,
      shadowRadius: 3.84,
    } : {
      elevation: 5,
    }),
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

export { ChatMessage }