import { useEffect, useRef, useState } from 'react';
import { 
  StyleSheet, 
  View, 
  Text, 
  ScrollView, 
  TextInput, 
  Pressable, 
  KeyboardAvoidingView, 
  Platform, 
  ActivityIndicator,
  Keyboard,
  useWindowDimensions,
  Image
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useColorScheme } from 'react-native';
import { Send, Menu, Plus, Trash2, Search } from 'lucide-react-native';
import Colors from '@/constants/Colors';
import { ChatMessage } from '@/components/ChatMessage';
import { ModelSelector } from '@/components/ModelSelector';
import { ChatList } from '@/components/ChatList';
import { UploadButton } from '@/components/UploadButton';
import { VoiceButton } from '@/components/VoiceButton';
import { useChatService } from '@/hooks/useChatService';
import { useAppSettings } from '@/hooks/useAppSettings';
import Animated, { 
  useAnimatedStyle, 
  useSharedValue, 
  withTiming, 
  interpolate,
  FadeIn,
  FadeOut,
  SlideInLeft,
  SlideOutLeft
} from 'react-native-reanimated';
import * as WebBrowser from 'expo-web-browser';

export default function ChatScreen() {
  const colorScheme = useColorScheme();
  const { width } = useWindowDimensions();
  const scrollViewRef = useRef<ScrollView>(null);
  const [message, setMessage] = useState('');
  const [sidebarVisible, setSidebarVisible] = useState(false);
  const [webSearchResults, setWebSearchResults] = useState<any[]>([]);
  const { 
    sendMessage, 
    chats, 
    activeChat,
    currentChat,
    isLoading, 
    error, 
    clearChatHistory,
    createNewChat,
    selectChat,
    deleteChat
  } = useChatService();
  const { selectedModel } = useAppSettings();
  const inputHeight = useSharedValue(50);
  const keyboardVisible = useSharedValue(0);

  useEffect(() => {
    const keyboardDidShowListener = Keyboard.addListener(
      'keyboardDidShow',
      () => {
        keyboardVisible.value = withTiming(1, { duration: 300 });
        setTimeout(() => scrollToBottom(), 100);
      }
    );
    const keyboardDidHideListener = Keyboard.addListener(
      'keyboardDidHide',
      () => {
        keyboardVisible.value = withTiming(0, { duration: 300 });
      }
    );

    return () => {
      keyboardDidHideListener.remove();
      keyboardDidShowListener.remove();
    };
  }, []);

  const scrollToBottom = () => {
    scrollViewRef.current?.scrollToEnd({ animated: true });
  };

  const handleSendMessage = () => {
    if (message.trim() === '') return;
    
    sendMessage(message.trim());
    setMessage('');
    
    setTimeout(() => scrollToBottom(), 100);
  };

  const handleUpload = async (file: any) => {
    // Handle file upload
    const fileInfo = `[Uploaded ${file.type}: ${file.name}]`;
    setMessage(prev => prev + '\n' + fileInfo);
  };

  const handleVoiceResult = (text: string) => {
    setMessage(prev => prev + ' ' + text);
  };

  const handleWebSearch = async () => {
    try {
      // Implement web search functionality
      const searchTerm = message.trim();
      if (!searchTerm) return;

      // This is a placeholder - implement actual web search API
      const results = [
        { title: 'Example Result 1', url: 'https://example.com/1' },
        { title: 'Example Result 2', url: 'https://example.com/2' },
      ];
      setWebSearchResults(results);
    } catch (error) {
      console.error('Web search error:', error);
    }
  };

  useEffect(() => {
    if (currentChat?.messages?.length > 0) {
      setTimeout(() => scrollToBottom(), 100);
    }
  }, [currentChat?.messages]);

  const handleChangeText = (text: string) => {
    setMessage(text);
    
    const numLines = text.split('\n').length;
    const newHeight = Math.min(150, Math.max(50, numLines * 24));
    inputHeight.value = withTiming(newHeight, { duration: 150 });
  };

  const handleNewChat = () => {
    createNewChat();
    setSidebarVisible(false);
  };

  const handleSelectChat = (chatId: string) => {
    selectChat(chatId);
    setSidebarVisible(false);
  };

  const animatedInputStyle = useAnimatedStyle(() => {
    return {
      height: inputHeight.value,
    };
  });

  const animatedScrollViewStyle = useAnimatedStyle(() => {
    const paddingBottom = interpolate(
      keyboardVisible.value,
      [0, 1],
      [20, 80]
    );
    
    return {
      paddingBottom,
    };
  });

  const isMobile = width < 768;

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={[
        styles.header,
        { borderBottomColor: Colors[colorScheme ?? 'light'].border }
      ]}>
        <View style={styles.headerLeft}>
          {isMobile && (
            <Pressable
              style={styles.menuButton}
              onPress={() => setSidebarVisible(!sidebarVisible)}
            >
              <Menu size={24} color={Colors[colorScheme ?? 'light'].text} />
            </Pressable>
          )}
          <View style={styles.headerTitleContainer}>
            <Image 
              source={{ uri: 'https://images.pexels.com/photos/8386440/pexels-photo-8386440.jpeg' }}
              style={styles.logo}
            />
            <Text style={[
              styles.title,
              { color: Colors[colorScheme ?? 'light'].text }
            ]}>
              Keshav AI
            </Text>
          </View>
        </View>
        <ModelSelector />
      </View>

      <View style={styles.contentContainer}>
        {(!isMobile || sidebarVisible) && (
          <Animated.View
            entering={isMobile ? SlideInLeft : FadeIn}
            exiting={isMobile ? SlideOutLeft : FadeOut}
            style={[
              styles.sidebar,
              {
                backgroundColor: Colors[colorScheme ?? 'light'].sidebarBackground,
                borderRightColor: Colors[colorScheme ?? 'light'].border,
              },
              isMobile && styles.mobileSidebar
            ]}
          >
            <Pressable
              style={[
                styles.newChatButton,
                { backgroundColor: Colors[colorScheme ?? 'light'].tint }
              ]}
              onPress={handleNewChat}
            >
              <Plus size={20} color="#FFFFFF" />
              <Text style={styles.newChatText}>New Chat</Text>
            </Pressable>

            <ChatList 
              chats={chats}
              activeChat={activeChat}
              onSelectChat={handleSelectChat}
              onDeleteChat={deleteChat}
            />

            {chats.length > 0 && (
              <Pressable
                style={[
                  styles.clearHistoryButton,
                  { backgroundColor: Colors[colorScheme ?? 'light'].dangerBackground }
                ]}
                onPress={clearChatHistory}
              >
                <Trash2 size={16} color={Colors[colorScheme ?? 'light'].danger} />
                <Text style={[
                  styles.clearHistoryText,
                  { color: Colors[colorScheme ?? 'light'].danger }
                ]}>
                  Clear History
                </Text>
              </Pressable>
            )}
          </Animated.View>
        )}

        <View style={[
          styles.mainContent,
          isMobile && sidebarVisible && styles.blurredContent
        ]}>
          {error ? (
            <View style={styles.errorContainer}>
              <Text style={styles.errorText}>
                Error: {error}. Please check your API key in settings.
              </Text>
            </View>
          ) : null}

          <Animated.ScrollView
            ref={scrollViewRef}
            style={styles.scrollView}
            contentContainerStyle={[
              styles.scrollViewContent,
              animatedScrollViewStyle
            ]}
            keyboardShouldPersistTaps="handled"
          >
            {!currentChat?.messages?.length ? (
              <View style={styles.emptyState}>
                <Image 
                  source={{ uri: 'https://images.pexels.com/photos/8386440/pexels-photo-8386440.jpeg' }}
                  style={styles.welcomeImage}
                />
                <Text style={[
                  styles.emptyStateTitle,
                  { color: Colors[colorScheme ?? 'light'].text }
                ]}>
                  Welcome to Keshav AI
                </Text>
                <Text style={[
                  styles.emptyStateText,
                  { color: Colors[colorScheme ?? 'light'].textSecondary }
                ]}>
                  Your personal AI assistant powered by advanced language models
                </Text>
              </View>
            ) : (
              currentChat.messages.map((chat, index) => (
                <ChatMessage
                  key={index}
                  message={chat.content}
                  isUser={chat.role === 'user'}
                  animate={index === currentChat.messages.length - 1}
                />
              ))
            )}
            
            {isLoading && (
              <View style={styles.loadingContainer}>
                <ActivityIndicator 
                  size="small" 
                  color={Colors[colorScheme ?? 'light'].tint} 
                />
                <Text style={[
                  styles.loadingText,
                  { color: Colors[colorScheme ?? 'light'].textSecondary }
                ]}>
                  Keshav is thinking...
                </Text>
              </View>
            )}

            {webSearchResults.length > 0 && (
              <View style={styles.searchResults}>
                <Text style={[
                  styles.searchResultsTitle,
                  { color: Colors[colorScheme ?? 'light'].text }
                ]}>
                  Web Search Results
                </Text>
                {webSearchResults.map((result, index) => (
                  <Pressable
                    key={index}
                    style={styles.searchResult}
                    onPress={() => WebBrowser.openBrowserAsync(result.url)}
                  >
                    <Text style={[
                      styles.searchResultText,
                      { color: Colors[colorScheme ?? 'light'].tint }
                    ]}>
                      {result.title}
                    </Text>
                  </Pressable>
                ))}
              </View>
            )}
          </Animated.ScrollView>

          <KeyboardAvoidingView
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            keyboardVerticalOffset={90}
            style={styles.inputContainer}
          >
            <View style={styles.actionButtonsContainer}>
              <UploadButton onUpload={handleUpload} />
              <VoiceButton 
                onSpeechResult={handleVoiceResult}
                textToSpeak={currentChat?.messages[currentChat.messages.length - 1]?.content}
              />
            </View>

            <Animated.View 
              style={[
                styles.inputWrapper,
                { backgroundColor: Colors[colorScheme ?? 'light'].inputBackground },
                animatedInputStyle
              ]}
            >
              <TextInput
                style={[
                  styles.input,
                  { color: Colors[colorScheme ?? 'light'].text }
                ]}
                placeholder="Ask Keshav anything..."
                placeholderTextColor={Colors[colorScheme ?? 'light'].textSecondary}
                value={message}
                onChangeText={handleChangeText}
                multiline
                maxLength={1000}
              />
              <View style={styles.inputButtons}>
                <Pressable
                  style={[
                    styles.actionButton,
                    { backgroundColor: Colors[colorScheme ?? 'light'].tint }
                  ]}
                  onPress={handleWebSearch}
                >
                  <Search size={20} color="#FFFFFF" />
                </Pressable>
                <Pressable
                  style={[
                    styles.actionButton,
                    {
                      backgroundColor: Colors[colorScheme ?? 'light'].tint,
                      opacity: message.trim() ? 1 : 0.5
                    }
                  ]}
                  onPress={handleSendMessage}
                  disabled={message.trim() === '' || isLoading}
                >
                  <Send size={20} color="#FFFFFF" />
                </Pressable>
              </View>
            </Animated.View>
          </KeyboardAvoidingView>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  contentContainer: {
    flex: 1,
    flexDirection: 'row',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  headerTitleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  logo: {
    width: 32,
    height: 32,
    borderRadius: 16,
    marginRight: 8,
  },
  menuButton: {
    marginRight: 12,
    padding: 4,
  },
  title: {
    fontSize: 20,
    fontFamily: 'Inter-Bold',
  },
  sidebar: {
    width: 280,
    borderRightWidth: 1,
    padding: 16,
  },
  mobileSidebar: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    left: 0,
    zIndex: 10,
  },
  newChatButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 12,
    borderRadius: 8,
    marginBottom: 16,
  },
  newChatText: {
    color: '#FFFFFF',
    marginLeft: 8,
    fontSize: 16,
    fontFamily: 'Inter-Medium',
  },
  clearHistoryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 12,
    borderRadius: 8,
    marginTop: 16,
  },
  clearHistoryText: {
    marginLeft: 8,
    fontSize: 14,
    fontFamily: 'Inter-Medium',
  },
  mainContent: {
    flex: 1,
  },
  blurredContent: {
    opacity: 0.3,
  },
  scrollView: {
    flex: 1,
  },
  scrollViewContent: {
    flexGrow: 1,
    paddingHorizontal: 16,
    paddingTop: 16,
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  welcomeImage: {
    width: 120,
    height: 120,
    borderRadius: 60,
    marginBottom: 24,
  },
  emptyStateTitle: {
    fontSize: 28,
    fontFamily: 'Inter-Bold',
    marginBottom: 12,
    textAlign: 'center',
  },
  emptyStateText: {
    fontSize: 16,
    fontFamily: 'Inter-Regular',
    textAlign: 'center',
    maxWidth: 400,
    lineHeight: 24,
  },
  actionButtonsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderTopWidth: 1,
    borderTopColor: 'rgba(0, 0, 0, 0.1)',
  },
  inputContainer: {
    borderTopWidth: 1,
    borderTopColor: 'rgba(0, 0, 0, 0.1)',
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 24,
    paddingHorizontal: 16,
    paddingVertical: 8,
    margin: 10,
  },
  input: {
    flex: 1,
    fontSize: 16,
    fontFamily: 'Inter-Regular',
    maxHeight: 120,
  },
  inputButtons: {
    flexDirection: 'row',
    gap: 8,
  },
  actionButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: 10,
  },
  loadingText: {
    marginLeft: 8,
    fontSize: 14,
    fontFamily: 'Inter-Regular',
  },
  errorContainer: {
    backgroundColor: '#FEE2E2',
    padding: 12,
    borderRadius: 8,
    margin: 16,
  },
  errorText: {
    color: '#B91C1C',
    fontSize: 14,
    fontFamily: 'Inter-Medium',
  },
  searchResults: {
    marginTop: 16,
    padding: 16,
    backgroundColor: 'rgba(0, 0, 0, 0.05)',
    borderRadius: 12,
  },
  searchResultsTitle: {
    fontSize: 16,
    fontFamily: 'Inter-Bold',
    marginBottom: 8,
  },
  searchResult: {
    paddingVertical: 8,
  },
  searchResultText: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
  },
});