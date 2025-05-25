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
import { Send, Menu, Plus, Trash2 } from 'lucide-react-native';
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

export default function ChatScreen() {
  const colorScheme = useColorScheme();
  const { width } = useWindowDimensions();
  const scrollViewRef = useRef<ScrollView>(null);
  const [message, setMessage] = useState('');
  const [sidebarVisible, setSidebarVisible] = useState(false);
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

  // Add keyboard event listeners
  useEffect(() => {
    const keyboardDidShowListener = Keyboard.addListener(
      'keyboardDidShow',
      () => {
        keyboardVisible.value = withTiming(1);
      }
    );
    const keyboardDidHideListener = Keyboard.addListener(
      'keyboardDidHide',
      () => {
        keyboardVisible.value = withTiming(0);
      }
    );

    return () => {
      keyboardDidHideListener.remove();
      keyboardDidShowListener.remove();
    };
  }, []);

  const animatedInputStyle = useAnimatedStyle(() => {
    return {
      height: interpolate(keyboardVisible.value, [0, 1], [50, 100]),
      minHeight: 50,
      maxHeight: 100,
    };
  });

  const handleChangeText = (text: string) => {
    setMessage(text);
    inputHeight.value = withTiming(Math.min(100, 50 + text.length * 0.5));
  };

  const handleUpload = async (file: any) => {
    if (!file) return;

    let prompt = '';
    if (file.type === 'image') {
      prompt = `[Analyzing image...]\n\nI'm sharing an image with you. Here's the base64-encoded image data:\n\ndata:image/jpeg;base64,${file.base64}\n\nPlease analyze this image and describe what you see in detail.`;
    } else {
      prompt = `[Analyzing document: ${file.name}]\n\nHere's the base64-encoded content of the document:\n\ndata:application/octet-stream;base64,${file.base64}\n\nPlease help me understand or analyze this document.`;
    }

    await sendMessage(prompt);
  };

  const handleSpeechResult = (text: string) => {
    setMessage(text);
  };

  const handleSendMessage = async () => {
    if (message.trim() === '' || isLoading) return;
    await sendMessage(message);
    setMessage('');
    inputHeight.value = withTiming(50);
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={90}
        style={styles.inputContainer}
      >
        <Animated.View 
          style={[
            styles.inputWrapper,
            { backgroundColor: Colors[colorScheme ?? 'light'].inputBackground },
            animatedInputStyle
          ]}
        >
          <View style={styles.inputActions}>
            <UploadButton onUpload={handleUpload} />
            <VoiceButton onSpeechResult={handleSpeechResult} />
          </View>

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

          <Pressable
            style={[
              styles.sendButton,
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
        </Animated.View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  inputContainer: {
    width: '100%',
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderTopWidth: 1,
    borderTopColor: '#e5e5e5',
  },
  input: {
    flex: 1,
    fontSize: 16,
    paddingHorizontal: 12,
  },
  inputActions: {
    flexDirection: 'row',
    gap: 8,
    paddingRight: 8,
  },
  sendButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 8,
  },
});