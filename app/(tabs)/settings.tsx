import { useState, useEffect } from 'react';
import { 
  StyleSheet, 
  View, 
  Text, 
  TextInput, 
  Switch, 
  ScrollView, 
  Pressable, 
  Alert,
  useColorScheme
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Trash2, RefreshCw, Info } from 'lucide-react-native';
import Colors from '@/constants/Colors';
import { useAppSettings } from '@/hooks/useAppSettings';
import { useChatService } from '@/hooks/useChatService';

export default function SettingsScreen() {
  const colorScheme = useColorScheme();
  const { 
    apiKey, 
    setApiKey, 
    apiUrl, 
    setApiUrl, 
    streamingEnabled, 
    setStreamingEnabled,
    webSearchEnabled,
    setWebSearchEnabled
  } = useAppSettings();
  const { clearChatHistory } = useChatService();
  const [tempApiKey, setTempApiKey] = useState(apiKey);
  const [tempApiUrl, setTempApiUrl] = useState(apiUrl);

  useEffect(() => {
    setTempApiKey(apiKey);
    setTempApiUrl(apiUrl);
  }, [apiKey, apiUrl]);

  const handleSaveApiKey = () => {
    setApiKey(tempApiKey.trim());
  };

  const handleSaveApiUrl = () => {
    setApiUrl(tempApiUrl.trim());
  };

  const handleToggleStreaming = () => {
    setStreamingEnabled(!streamingEnabled);
  };

  const handleToggleWebSearch = () => {
    setWebSearchEnabled(!webSearchEnabled);
  };

  const handleClearHistory = () => {
    Alert.alert(
      'Clear Chat History',
      'Are you sure you want to clear all chat history? This action cannot be undone.',
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Clear',
          style: 'destructive',
          onPress: clearChatHistory,
        },
      ]
    );
  };

  const handleResetApiSettings = () => {
    Alert.alert(
      'Reset API Settings',
      'Are you sure you want to reset the API settings to default?',
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Reset',
          onPress: () => {
            setApiUrl('https://fast.typegpt.net/v1/chat/completions');
            setApiKey('sk-6Lb2f4Rfq3FRZadXtkMVn0gMKr28K7PTxhQ5lR1f9xQZjZcT');
            setTempApiUrl('https://fast.typegpt.net/v1/chat/completions');
            setTempApiKey('sk-6Lb2f4Rfq3FRZadXtkMVn0gMKr28K7PTxhQ5lR1f9xQZjZcT');
          },
        },
      ]
    );
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={[
        styles.header,
        { borderBottomColor: Colors[colorScheme ?? 'light'].border }
      ]}>
        <Text style={[
          styles.title,
          { color: Colors[colorScheme ?? 'light'].text }
        ]}>
          Settings
        </Text>
      </View>

      <ScrollView style={styles.scrollView}>
        <View style={[
          styles.section,
          { borderBottomColor: Colors[colorScheme ?? 'light'].border }
        ]}>
          <Text style={[
            styles.sectionTitle,
            { color: Colors[colorScheme ?? 'light'].text }
          ]}>
            API Configuration
          </Text>
          
          <View style={styles.formGroup}>
            <Text style={[
              styles.label,
              { color: Colors[colorScheme ?? 'light'].textSecondary }
            ]}>
              API URL
            </Text>
            <TextInput
              style={[
                styles.input,
                { 
                  backgroundColor: Colors[colorScheme ?? 'light'].inputBackground,
                  color: Colors[colorScheme ?? 'light'].text,
                  borderColor: Colors[colorScheme ?? 'light'].border,
                }
              ]}
              value={tempApiUrl}
              onChangeText={setTempApiUrl}
              placeholder="Enter API URL"
              placeholderTextColor={Colors[colorScheme ?? 'light'].textSecondary}
              autoCapitalize="none"
              autoCorrect={false}
            />
            <Pressable 
              style={[
                styles.saveButton,
                { backgroundColor: Colors[colorScheme ?? 'light'].tint }
              ]} 
              onPress={handleSaveApiUrl}
            >
              <Text style={styles.saveButtonText}>Save</Text>
            </Pressable>
          </View>

          <View style={styles.formGroup}>
            <Text style={[
              styles.label,
              { color: Colors[colorScheme ?? 'light'].textSecondary }
            ]}>
              API Key
            </Text>
            <TextInput
              style={[
                styles.input,
                { 
                  backgroundColor: Colors[colorScheme ?? 'light'].inputBackground,
                  color: Colors[colorScheme ?? 'light'].text,
                  borderColor: Colors[colorScheme ?? 'light'].border,
                }
              ]}
              value={tempApiKey}
              onChangeText={setTempApiKey}
              placeholder="Enter your API key"
              placeholderTextColor={Colors[colorScheme ?? 'light'].textSecondary}
              autoCapitalize="none"
              autoCorrect={false}
              secureTextEntry
            />
            <Pressable 
              style={[
                styles.saveButton,
                { backgroundColor: Colors[colorScheme ?? 'light'].tint }
              ]}
              onPress={handleSaveApiKey}
            >
              <Text style={styles.saveButtonText}>Save</Text>
            </Pressable>
          </View>

          <View style={styles.resetContainer}>
            <Pressable 
              style={styles.resetButton}
              onPress={handleResetApiSettings}
            >
              <RefreshCw size={16} color={Colors[colorScheme ?? 'light'].tint} />
              <Text style={[
                styles.resetButtonText,
                { color: Colors[colorScheme ?? 'light'].tint }
              ]}>
                Reset to Default
              </Text>
            </Pressable>
          </View>
        </View>

        <View style={[
          styles.section,
          { borderBottomColor: Colors[colorScheme ?? 'light'].border }
        ]}>
          <Text style={[
            styles.sectionTitle,
            { color: Colors[colorScheme ?? 'light'].text }
          ]}>
            Chat Settings
          </Text>

          <View style={styles.switchContainer}>
            <View>
              <Text style={[
                styles.switchLabel,
                { color: Colors[colorScheme ?? 'light'].text }
              ]}>
                Enable Streaming
              </Text>
              <Text style={[
                styles.switchDescription,
                { color: Colors[colorScheme ?? 'light'].textSecondary }
              ]}>
                Show AI responses as they are generated
              </Text>
            </View>
            <Switch
              value={streamingEnabled}
              onValueChange={handleToggleStreaming}
              trackColor={{ 
                false: '#767577', 
                true: Colors[colorScheme ?? 'light'].tintTransparent 
              }}
              thumbColor={
                streamingEnabled 
                  ? Colors[colorScheme ?? 'light'].tint 
                  : '#f4f3f4'
              }
            />
          </View>

          <View style={styles.switchContainer}>
            <View>
              <Text style={[
                styles.switchLabel,
                { color: Colors[colorScheme ?? 'light'].text }
              ]}>
                Enable Web Search
              </Text>
              <Text style={[
                styles.switchDescription,
                { color: Colors[colorScheme ?? 'light'].textSecondary }
              ]}>
                Allow AI to search the web for information
              </Text>
            </View>
            <Switch
              value={webSearchEnabled}
              onValueChange={handleToggleWebSearch}
              trackColor={{ 
                false: '#767577', 
                true: Colors[colorScheme ?? 'light'].tintTransparent 
              }}
              thumbColor={
                webSearchEnabled 
                  ? Colors[colorScheme ?? 'light'].tint 
                  : '#f4f3f4'
              }
            />
          </View>
        </View>

        <View style={[
          styles.section,
          { borderBottomColor: Colors[colorScheme ?? 'light'].border }
        ]}>
          <Text style={[
            styles.sectionTitle,
            { color: Colors[colorScheme ?? 'light'].text }
          ]}>
            Data Management
          </Text>

          <Pressable 
            style={[
              styles.dangerButton,
              { backgroundColor: colorScheme === 'dark' ? '#3A1C1C' : '#FEE2E2' }
            ]}
            onPress={handleClearHistory}
          >
            <Trash2 size={20} color="#DC2626" />
            <Text style={styles.dangerButtonText}>Clear Chat History</Text>
          </Pressable>
        </View>

        <View style={styles.section}>
          <View style={styles.infoContainer}>
            <Info size={20} color={Colors[colorScheme ?? 'light'].textSecondary} />
            <Text style={[
              styles.infoText,
              { color: Colors[colorScheme ?? 'light'].textSecondary }
            ]}>
              Keshav AI uses advanced language models to generate responses. Your API key is stored securely on your device.
            </Text>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
  },
  title: {
    fontSize: 20,
    fontFamily: 'Inter-Bold',
  },
  scrollView: {
    flex: 1,
  },
  section: {
    padding: 16,
    borderBottomWidth: 1,
  },
  sectionTitle: {
    fontSize: 18,
    fontFamily: 'Inter-Bold',
    marginBottom: 16,
  },
  formGroup: {
    marginBottom: 16,
  },
  label: {
    fontSize: 14,
    fontFamily: 'Inter-Medium',
    marginBottom: 8,
  },
  input: {
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 16,
    fontFamily: 'Inter-Regular',
    borderWidth: 1,
  },
  saveButton: {
    alignSelf: 'flex-end',
    paddingVertical: 8,
    paddingHorizontal: 16,
    marginTop: 8,
    borderRadius: 6,
  },
  saveButtonText: {
    color: 'white',
    fontSize: 14,
    fontFamily: 'Inter-Medium',
  },
  switchContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
  },
  switchLabel: {
    fontSize: 16,
    fontFamily: 'Inter-Medium',
  },
  switchDescription: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    marginTop: 4,
  },
  dangerButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 12,
    borderRadius: 8,
    marginTop: 8,
  },
  dangerButtonText: {
    color: '#DC2626',
    marginLeft: 8,
    fontSize: 16,
    fontFamily: 'Inter-Medium',
  },
  resetContainer: {
    alignItems: 'center',
    marginTop: 8,
  },
  resetButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 8,
  },
  resetButtonText: {
    marginLeft: 8,
    fontSize: 14,
    fontFamily: 'Inter-Medium',
  },
  infoContainer: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    padding: 8,
  },
  infoText: {
    flex: 1,
    marginLeft: 12,
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    lineHeight: 20,
  }
});