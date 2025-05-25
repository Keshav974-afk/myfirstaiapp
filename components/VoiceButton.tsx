import { useState, useEffect } from 'react';
import { StyleSheet, View, Pressable, Platform } from 'react-native';
import { Mic } from 'lucide-react-native';
import { useColorScheme } from 'react-native';
import Colors from '@/constants/Colors';

interface VoiceButtonProps {
  onSpeechResult?: (text: string) => void;
}

export function VoiceButton({ onSpeechResult }: VoiceButtonProps) {
  const colorScheme = useColorScheme();
  const [isListening, setIsListening] = useState(false);

  const startListening = async () => {
    if (Platform.OS === 'web') {
      try {
        setIsListening(true);
        const recognition = new (window.SpeechRecognition || window.webkitSpeechRecognition)();
        recognition.continuous = false;
        recognition.interimResults = false;

        recognition.onresult = (event) => {
          const text = event.results[0][0].transcript;
          if (onSpeechResult) {
            onSpeechResult(text);
          }
          setIsListening(false);
        };

        recognition.onerror = () => {
          setIsListening(false);
        };

        recognition.onend = () => {
          setIsListening(false);
        };

        recognition.start();
      } catch (error) {
        console.error('Speech recognition error:', error);
        setIsListening(false);
      }
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
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    gap: 8,
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
});