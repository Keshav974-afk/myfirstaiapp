import { useState, useEffect } from 'react';
import { StyleSheet, View, Pressable, Platform, Text, Animated } from 'react-native';
import { Mic } from 'lucide-react-native';
import { useColorScheme } from 'react-native';
import Colors from '@/constants/Colors';

// Only import Voice on native platforms
let Voice: any;
if (Platform.OS !== 'web') {
  Voice = require('react-native-voice').default;
}

interface VoiceButtonProps {
  onSpeechResult?: (text: string) => void;
}

interface SpeechResultsEvent {
  value?: string[];
}

interface SpeechErrorEvent {
  error?: {
    message?: string;
  };
}

export function VoiceButton({ onSpeechResult }: VoiceButtonProps) {
  const colorScheme = useColorScheme();
  const [isListening, setIsListening] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [fadeAnim] = useState(new Animated.Value(0));

  useEffect(() => {
    if (Platform.OS !== 'web') {
      Voice.onSpeechResults = (e: SpeechResultsEvent) => {
        if (e.value && e.value[0] && onSpeechResult) {
          onSpeechResult(e.value[0]);
        }
        setIsListening(false);
      };

      Voice.onSpeechError = (e: SpeechErrorEvent) => {
        let errorMessage = 'Speech recognition error. Try again.';
        if (e.error?.message) {
          if (e.error.message.includes('network')) {
            errorMessage = 'Network error. Check your connection.';
          } else if (e.error.message.includes('permission')) {
            errorMessage = 'Microphone access denied.';
          }
        }
        showError(errorMessage);
        setIsListening(false);
      };

      return () => {
        Voice.destroy().then(Voice.removeAllListeners);
      };
    }
  }, [onSpeechResult]);

  const showError = (message: string) => {
    setError(message);
    Animated.sequence([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }),
      Animated.delay(3000),
      Animated.timing(fadeAnim, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }),
    ]).start(() => setError(null));
  };

  const startListening = async () => {
    try {
      setIsListening(true);
      setError(null);

      if (Platform.OS === 'web') {
        // Web implementation using Web Speech API
        const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
        if (!SpeechRecognition) {
          throw new Error('Speech recognition not supported');
        }

        const recognition = new SpeechRecognition();
        recognition.continuous = false;
        recognition.interimResults = false;
        recognition.lang = 'en-US';

        recognition.onresult = (event: any) => {
          const text = event.results[0][0].transcript;
          if (onSpeechResult) {
            onSpeechResult(text);
          }
          setIsListening(false);
        };

        recognition.onerror = (event: any) => {
          switch (event.error) {
            case 'network':
              showError('Network error. Check your connection.');
              break;
            case 'no-speech':
              showError('No speech detected. Try again.');
              break;
            case 'not-allowed':
              showError('Microphone access denied.');
              break;
            case 'service-not-allowed':
              showError('Speech service not available.');
              break;
            default:
              showError('Speech recognition error. Try again.');
          }
          setIsListening(false);
        };

        recognition.onend = () => {
          setIsListening(false);
        };

        recognition.start();
      } else {
        // Mobile implementation using react-native-voice
        try {
          await Voice.start('en-US');
        } catch (e) {
          showError('Failed to start speech recognition');
          setIsListening(false);
        }
      }
    } catch (error) {
      console.error('Speech recognition error:', error);
      showError('Speech recognition not supported');
      setIsListening(false);
    }
  };

  const stopListening = async () => {
    if (Platform.OS !== 'web') {
      try {
        await Voice.stop();
      } catch (e) {
        console.error('Error stopping voice recognition:', e);
      }
    }
    setIsListening(false);
  };

  useEffect(() => {
    return () => {
      stopListening();
    };
  }, []);

  return (
    <View style={styles.container}>
      <Pressable
        style={[
          styles.button,
          { backgroundColor: Colors[colorScheme ?? 'light'].tint },
          isListening && styles.activeButton
        ]}
        onPress={isListening ? stopListening : startListening}
      >
        <Mic size={20} color="#FFFFFF" />
      </Pressable>

      {error && (
        <Animated.View 
          style={[
            styles.errorContainer,
            { 
              backgroundColor: Colors[colorScheme ?? 'light'].dangerBackground,
              opacity: fadeAnim 
            }
          ]}
        >
          <Text style={[
            styles.errorText,
            { color: Colors[colorScheme ?? 'light'].danger }
          ]}>
            {error}
          </Text>
        </Animated.View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'relative',
  },
  button: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
  },
  activeButton: {
    opacity: 0.7,
  },
  errorContainer: {
    position: 'absolute',
    bottom: 50,
    right: 0,
    padding: 8,
    borderRadius: 8,
    minWidth: 200,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  errorText: {
    fontSize: 14,
    fontFamily: 'Inter-Medium',
    textAlign: 'center',
  },
});