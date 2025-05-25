import { useState } from 'react';
import { StyleSheet, View, Text, Pressable } from 'react-native';
import { Mic, Volume2 } from 'lucide-react-native';
import * as Speech from 'expo-speech';
import { useColorScheme } from 'react-native';
import Colors from '@/constants/Colors';

interface VoiceButtonProps {
  onSpeechResult?: (text: string) => void;
  textToSpeak?: string;
}

export function VoiceButton({ onSpeechResult, textToSpeak }: VoiceButtonProps) {
  const colorScheme = useColorScheme();
  const [isListening, setIsListening] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);

  const startListening = async () => {
    try {
      setIsListening(true);
      // Implement speech-to-text functionality here
      // Since react-native-voice doesn't work on web, you'll need to
      // implement a web-specific solution or show a message for web users
    } catch (error) {
      console.error('Error starting speech recognition:', error);
    } finally {
      setIsListening(false);
    }
  };

  const speak = async () => {
    if (!textToSpeak) return;

    try {
      setIsSpeaking(true);
      await Speech.speak(textToSpeak, {
        language: 'en',
        onDone: () => setIsSpeaking(false),
        onError: () => setIsSpeaking(false),
      });
    } catch (error) {
      console.error('Error speaking text:', error);
      setIsSpeaking(false);
    }
  };

  return (
    <View style={styles.container}>
      <Pressable
        style={[
          styles.button,
          { backgroundColor: Colors[colorScheme ?? 'light'].tint },
          isListening && styles.activeButton
        ]}
        onPress={startListening}
      >
        <Mic size={20} color="#FFFFFF" />
        <Text style={styles.buttonText}>
          {isListening ? 'Listening...' : 'Voice'}
        </Text>
      </Pressable>

      {textToSpeak && (
        <Pressable
          style={[
            styles.button,
            { backgroundColor: Colors[colorScheme ?? 'light'].tint },
            isSpeaking && styles.activeButton
          ]}
          onPress={speak}
        >
          <Volume2 size={20} color="#FFFFFF" />
          <Text style={styles.buttonText}>
            {isSpeaking ? 'Speaking...' : 'Speak'}
          </Text>
        </Pressable>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    gap: 8,
    padding: 8,
  },
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 8,
    borderRadius: 8,
    gap: 4,
  },
  activeButton: {
    opacity: 0.7,
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontFamily: 'Inter-Medium',
  },
});