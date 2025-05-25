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
  useWindowDimensions,
  Image
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useColorScheme } from 'react-native';
import { Send, Menu, Plus, Trash2, Wand2, Globe2, Brain, Lightbulb, Mic, Settings2 } from 'lucide-react-native';
import Colors from '@/constants/Colors';
import { ChatMessage } from '@/components/ChatMessage';
import { ModelSelector } from '@/components/ModelSelector';
import { ChatList } from '@/components/ChatList';
import { useChatService } from '@/hooks/useChatService';
import { useAppSettings } from '@/hooks/useAppSettings';
import { VoiceButton } from '@/components/VoiceButton';
import { UploadButton } from '@/components/UploadButton';
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

const TOOLS = [
  { icon: Wand2, title: 'Create an image', description: 'Generate images from text' },
  { icon: Globe2, title: 'Search the web', description: 'Get real-time information' },
  { icon: Brain, title: 'Run deep research', description: 'In-depth analysis' },
  { icon: Lightbulb, title: 'Think for longer', description: 'Complex problem solving' },
];

export default function ChatScreen() {
  const colorScheme = useColorScheme();
  const { width } = useWindowDimensions();
  const scrollViewRef = useRef<ScrollView>(null);
  const [message, setMessage] = useState('');
  const [sidebarVisible, setSidebarVisible] = useState(false);
  const [showTools, setShowTools] = useState(false);
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

  const scrollToBottom = () => {
    scrollViewRef.current?.scrollToEnd({ animated: true });
  };

  const handleSendMessage = async () => {
    if (message.trim() === '' || isLoading || !selectedModel) return;
    await sendMessage(message);
    setMessage('');
    setShowTools(false);
    inputHeight.value = withTiming(50);
    setTimeout(() => scrollToBottom(), 100);
  };

  useEffect(() => {
    if (currentChat?.messages?.length > 0) {
      setTimeout(() => scrollToBottom(), 100);
    }
  }, [currentChat?.messages]);

  const handleChangeText = (text: string) => {
    setMessage(text);
    inputHeight.value = withTiming(Math.min(100, Math.max(50, text.split('\n').length * 24)));
  };

  const handleNewChat = () => {
    createNewChat();
    setSidebarVisible(false);
    setShowTools(true);
  };

  const handleSelectChat = (chatId: string) => {
    selectChat(chatId);
    setSidebarVisible(false);
    setShowTools(false);
  };

  const animatedInputStyle = useAnimatedStyle(() => ({
    height: inputHeight.value,
  }));

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
                Error: {error}
              </Text>
            </View>
          ) : null}

          <ScrollView
            ref={scrollViewRef}
            style={styles.scrollView}
            contentContainerStyle={styles.scrollViewContent}
            keyboardShouldPersistTaps="handled"
          >
            {!currentChat?.messages?.length ? (
              showTools ? (
                <View style={styles.toolsContainer}>
                  <Text style={[
                    styles.toolsTitle,
                    { color: Colors[colorScheme ?? 'light'].text }
                  ]}>
                    Tools
                  </Text>
                  <View style={styles.toolsGrid}>
                    {TOOLS.map((tool, index) => (
                      <Pressable
                        key={index}
                        style={[
                          styles.toolCard,
                          { backgroundColor: Colors[colorScheme ?? 'light'].inputBackground }
                        ]}
                      >
                        <tool.icon size={24} color={Colors[colorScheme ?? 'light'].tint} />
                        <Text style={[
                          styles.toolTitle,
                          { color: Colors[colorScheme ?? 'light'].text }
                        ]}>
                          {tool.title}
                        </Text>
                        <Text style={[
                          styles.toolDescription,
                          { color: Colors[colorScheme ?? 'light'].textSecondary }
                        ]}>
                          {tool.description}
                        </Text>
                      </Pressable>
                    ))}
                  </View>
                </View>
              ) : (
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
              )
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
          </ScrollView>

          <KeyboardAvoidingView
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
            style={styles.keyboardAvoidingView}
          >
            <Animated.View 
              style={[
                styles.inputWrapper,
                { backgroundColor: Colors[colorScheme ?? 'light'].inputBackground },
                animatedInputStyle
              ]}
            >
              <View style={styles.inputActions}>
                <Pressable
                  style={styles.plusButton}
                  onPress={() => setShowTools(!showTools)}
                >
                  <Plus 
                    size={24} 
                    color={Colors[colorScheme ?? 'light'].textSecondary} 
                  />
                </Pressable>
              </View>

              <TextInput
                style={[
                  styles.input,
                  { color: Colors[colorScheme ?? 'light'].text }
                ]}
                placeholder="Message Keshav..."
                placeholderTextColor={Colors[colorScheme ?? 'light'].textSecondary}
                value={message}
                onChangeText={handleChangeText}
                multiline
                maxLength={1000}
              />

              <View style={styles.inputActions}>
                <VoiceButton onSpeechResult={handleChangeText} />
                <Pressable
                  style={[
                    styles.sendButton,
                    {
                      backgroundColor: Colors[colorScheme ?? 'light'].tint,
                      opacity: message.trim() && !isLoading && selectedModel ? 1 : 0.5
                    }
                  ]}
                  onPress={handleSendMessage}
                  disabled={message.trim() === '' || isLoading || !selectedModel}
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
    display: 'flex',
    flexDirection: 'column',
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
    paddingBottom: 20,
  },
  toolsContainer: {
    flex: 1,
    padding: 16,
  },
  toolsTitle: {
    fontSize: 24,
    fontFamily: 'Inter-Bold',
    marginBottom: 24,
  },
  toolsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 16,
  },
  toolCard: {
    width: '48%',
    padding: 16,
    borderRadius: 12,
    marginBottom: 16,
  },
  toolTitle: {
    fontSize: 16,
    fontFamily: 'Inter-Medium',
    marginTop: 12,
    marginBottom: 4,
  },
  toolDescription: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
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
  keyboardAvoidingView: {
    width: '100%',
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderTopWidth: 1,
    borderTopColor: 'rgba(0, 0, 0, 0.1)',
  },
  input: {
    flex: 1,
    fontSize: 16,
    fontFamily: 'Inter-Regular',
    paddingHorizontal: 12,
    maxHeight: 100,
  },
  inputActions: {
    flexDirection: 'row',
    gap: 8,
    alignItems: 'center',
  },
  plusButton: {
    padding: 4,
  },
  sendButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
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
  }
});