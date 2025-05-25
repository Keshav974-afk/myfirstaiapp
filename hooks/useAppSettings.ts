import { useState, useEffect, createContext, useContext, createElement } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { AIModel } from '@/types/app';
import { AVAILABLE_MODELS, DEFAULT_MODEL } from '@/constants/Models';

interface AppSettingsContextType {
  apiKey: string;
  setApiKey: (key: string) => void;
  apiUrl: string;
  setApiUrl: (url: string) => void;
  selectedModel: AIModel | null;
  setSelectedModel: (model: AIModel) => void;
  streamingEnabled: boolean;
  setStreamingEnabled: (enabled: boolean) => void;
  webSearchEnabled: boolean;
  setWebSearchEnabled: (enabled: boolean) => void;
}

const AppSettingsContext = createContext<AppSettingsContextType>({
  apiKey: '',
  setApiKey: () => {},
  apiUrl: '',
  setApiUrl: () => {},
  selectedModel: null,
  setSelectedModel: () => {},
  streamingEnabled: false,
  setStreamingEnabled: () => {},
  webSearchEnabled: true,
  setWebSearchEnabled: () => {},
});

export function AppSettingsProvider({ children }: { children: React.ReactNode }) {
  const [apiKey, setApiKey] = useState<string>('sk-6Lb2f4Rfq3FRZadXtkMVn0gMKr28K7PTxhQ5lR1f9xQZjZcT');
  const [apiUrl, setApiUrl] = useState<string>('https://fast.typegpt.net/v1/chat/completions');
  const [selectedModel, setSelectedModel] = useState<AIModel | null>(DEFAULT_MODEL);
  const [streamingEnabled, setStreamingEnabled] = useState<boolean>(true);
  const [webSearchEnabled, setWebSearchEnabled] = useState<boolean>(true);

  useEffect(() => {
    const loadSettings = async () => {
      try {
        const storedApiKey = await AsyncStorage.getItem('apiKey');
        const storedApiUrl = await AsyncStorage.getItem('apiUrl');
        const storedModelId = await AsyncStorage.getItem('selectedModelId');
        const storedStreamingEnabled = await AsyncStorage.getItem('streamingEnabled');
        const storedWebSearchEnabled = await AsyncStorage.getItem('webSearchEnabled');

        if (storedApiKey) setApiKey(storedApiKey);
        if (storedApiUrl) setApiUrl(storedApiUrl);
        
        if (storedModelId) {
          const model = AVAILABLE_MODELS.find(m => m.id === storedModelId);
          if (model) setSelectedModel(model);
        }
        
        if (storedStreamingEnabled !== null) {
          setStreamingEnabled(storedStreamingEnabled === 'true');
        }

        if (storedWebSearchEnabled !== null) {
          setWebSearchEnabled(storedWebSearchEnabled === 'true');
        }
      } catch (error) {
        console.error('Error loading settings:', error);
      }
    };

    loadSettings();
  }, []);

  const handleSetApiKey = async (key: string) => {
    setApiKey(key);
    await AsyncStorage.setItem('apiKey', key);
  };

  const handleSetApiUrl = async (url: string) => {
    setApiUrl(url);
    await AsyncStorage.setItem('apiUrl', url);
  };

  const handleSetSelectedModel = async (model: AIModel) => {
    setSelectedModel(model);
    await AsyncStorage.setItem('selectedModelId', model.id);
  };

  const handleSetStreamingEnabled = async (enabled: boolean) => {
    setStreamingEnabled(enabled);
    await AsyncStorage.setItem('streamingEnabled', String(enabled));
  };

  const handleSetWebSearchEnabled = async (enabled: boolean) => {
    setWebSearchEnabled(enabled);
    await AsyncStorage.setItem('webSearchEnabled', String(enabled));
  };

  const value = {
    apiKey,
    setApiKey: handleSetApiKey,
    apiUrl,
    setApiUrl: handleSetApiUrl,
    selectedModel,
    setSelectedModel: handleSetSelectedModel,
    streamingEnabled,
    setStreamingEnabled: handleSetStreamingEnabled,
    webSearchEnabled,
    setWebSearchEnabled: handleSetWebSearchEnabled,
  };

  return createElement(AppSettingsContext.Provider, { value }, children);
}

export const useAppSettings = () => useContext(AppSettingsContext);