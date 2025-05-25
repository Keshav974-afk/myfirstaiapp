import { useState, useEffect, useCallback } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Message, Chat, ChatHistory, GeneratedImage } from '@/types/app';
import { useAppSettings } from './useAppSettings';

export function useChatService() {
  const [chats, setChats] = useState<Chat[]>([]);
  const [activeChat, setActiveChat] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [generatedImages, setGeneratedImages] = useState<GeneratedImage[]>([]);
  const { apiKey, apiUrl, selectedModel, streamingEnabled } = useAppSettings();

  useEffect(() => {
    const loadData = async () => {
      try {
        const [storedHistory, storedImages] = await Promise.all([
          AsyncStorage.getItem('chatHistory'),
          AsyncStorage.getItem('generatedImages')
        ]);

        if (storedHistory) {
          const history: ChatHistory = JSON.parse(storedHistory);
          setChats(history.chats || []);
          setActiveChat(history.activeChat || null);
        }

        if (storedImages) {
          setGeneratedImages(JSON.parse(storedImages));
        }
      } catch (error) {
        console.error('Error loading data:', error);
        setChats([]);
        setActiveChat(null);
        setGeneratedImages([]);
      }
    };

    loadData();
  }, []);

  const saveData = useCallback(async (
    updatedChats: Chat[], 
    updatedActiveChat: string | null,
    updatedImages?: GeneratedImage[]
  ) => {
    try {
      const savePromises = [
        AsyncStorage.setItem('chatHistory', JSON.stringify({
          chats: updatedChats || [],
          activeChat: updatedActiveChat
        }))
      ];

      if (updatedImages) {
        savePromises.push(
          AsyncStorage.setItem('generatedImages', JSON.stringify(updatedImages))
        );
      }

      await Promise.all(savePromises);
    } catch (error) {
      console.error('Error saving data:', error);
    }
  }, []);

  const extractImageUrls = (content: string): string[] => {
    const matches = content.match(/!\[.*?\]\((.*?)\)/g) || [];
    return matches.map(match => match.match(/!\[.*?\]\((.*?)\)/)![1]);
  };

  const addGeneratedImage = useCallback((imageUrl: string) => {
    const newImage: GeneratedImage = {
      url: imageUrl,
      createdAt: Date.now()
    };
    
    setGeneratedImages(prev => {
      const updated = [newImage, ...prev];
      saveData(chats, activeChat, updated);
      return updated;
    });
  }, [chats, activeChat, saveData]);

  const processStreamingResponse = async (
    response: Response, 
    currentChatId: string, 
    updatedMessages: Message[]
  ) => {
    const reader = response.body?.getReader();
    if (!reader) return;

    let buffer = '';
    let fullResponse = '';

    try {
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = new TextDecoder().decode(value);
        buffer += chunk;

        let newlineIndex;
        while ((newlineIndex = buffer.indexOf('\n')) !== -1) {
          const line = buffer.slice(0, newlineIndex);
          buffer = buffer.slice(newlineIndex + 1);

          if (line.trim() === '' || line === 'data: [DONE]') continue;

          if (line.startsWith('data: ')) {
            try {
              const jsonData = JSON.parse(line.slice(5));
              const content = jsonData.choices?.[0]?.delta?.content || '';
              
              if (content) {
                fullResponse += content;
                
                const imageUrls = extractImageUrls(content);
                imageUrls.forEach(addGeneratedImage);

                const updatedChatsWithStream = chats.map(chat =>
                  chat.id === currentChatId
                    ? {
                        ...chat,
                        messages: [
                          ...updatedMessages,
                          { role: 'assistant', content: fullResponse }
                        ]
                      }
                    : chat
                );

                setChats(updatedChatsWithStream);
                await saveData(updatedChatsWithStream, currentChatId);
              }
            } catch (e) {
              console.warn('Error parsing streaming data:', e);
            }
          }
        }
      }
    } catch (error) {
      console.error('Error processing stream:', error);
      throw error;
    } finally {
      reader.releaseLock();
    }
  };

  const createNewChat = useCallback(() => {
    if (!selectedModel) {
      setError('Please select an AI model before starting a chat.');
      return null;
    }

    const newChat: Chat = {
      id: Date.now().toString(),
      title: 'New Chat',
      messages: [],
      createdAt: Date.now(),
      model: selectedModel.id
    };
    
    const updatedChats = [newChat, ...(chats || [])];
    setChats(updatedChats);
    setActiveChat(newChat.id);
    saveData(updatedChats, newChat.id);
    return newChat.id;
  }, [chats, selectedModel, saveData]);

  const updateChatTitle = useCallback((chatId: string, firstMessage: string) => {
    if (!chats) return;

    const updatedChats = chats.map(chat => {
      if (chat.id === chatId) {
        return {
          ...chat,
          title: firstMessage.length > 50 
            ? firstMessage.substring(0, 50) + '...'
            : firstMessage
        };
      }
      return chat;
    });
    setChats(updatedChats);
    saveData(updatedChats, activeChat);
  }, [chats, activeChat, saveData]);

  const sendMessage = useCallback(async (message: string, file?: any) => {
    if (!apiKey) {
      setError('API key not set. Please check your settings.');
      return;
    }
    if (!apiUrl) {
      setError('API URL not set. Please check your settings.');
      return;
    }
    if (!selectedModel) {
      setError('Please select an AI model before sending a message.');
      return;
    }

    setIsLoading(true);
    setError(null);

    let currentChatId = activeChat;
    if (!currentChatId) {
      currentChatId = createNewChat();
      if (!currentChatId) {
        setIsLoading(false);
        return;
      }
    }

    const currentChat = chats?.find(chat => chat.id === currentChatId);
    if (!currentChat) {
      setError('Chat not found');
      setIsLoading(false);
      return;
    }

    const userMessage: Message = { role: 'user', content: message };
    const updatedMessages = [...(currentChat.messages || []), userMessage];
    
    if (updatedMessages.length === 1) {
      updateChatTitle(currentChatId, message);
    }

    const updatedChats = chats.map(chat => 
      chat.id === currentChatId 
        ? { ...chat, messages: updatedMessages }
        : chat
    );

    setChats(updatedChats);
    await saveData(updatedChats, currentChatId);

    try {
      const requestBody = {
        model: selectedModel.id,
        messages: updatedMessages.map(msg => ({
          role: msg.role,
          content: msg.content
        })),
        temperature: 0.7,
        stream: streamingEnabled
      };

      if (file) {
        const formData = new FormData();
        formData.append('file', {
          uri: file.uri,
          type: file.mimeType,
          name: file.name || 'file',
        });
        Object.entries(requestBody).forEach(([key, value]) => {
          formData.append(key, typeof value === 'string' ? value : JSON.stringify(value));
        });

        const response = await fetch(apiUrl, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${apiKey}`,
            'Content-Type': 'multipart/form-data',
          },
          body: formData,
        });

        if (!response.ok) {
          throw new Error('Failed to upload file');
        }
      }

      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody),
      });

      if (!response.ok) {
        let errorMessage = 'Failed to communicate with AI service';
        
        try {
          const errorData = await response.json();
          if (errorData.error?.message) {
            if (errorData.error.message.includes('无可用渠道')) {
              errorMessage = `The selected model "${selectedModel.name}" is not available. Please try GPT-3.5 Turbo or another model.`;
            } else {
              errorMessage = errorData.error.message;
            }
          }
        } catch (e) {
          if (response.status === 400) {
            errorMessage = 'Invalid request. Please try again later.';
          } else if (response.status === 401) {
            errorMessage = 'Invalid API key. Please check your settings.';
          } else if (response.status === 403) {
            errorMessage = 'Access denied. Please check your API key permissions.';
          }
        }
        
        throw new Error(errorMessage);
      }

      if (streamingEnabled && response.body) {
        await processStreamingResponse(response, currentChatId, updatedMessages);
      } else {
        const data = await response.json();
        const assistantMessage: Message = {
          role: 'assistant',
          content: data.choices[0]?.message?.content || '',
        };
        
        const imageUrls = extractImageUrls(assistantMessage.content);
        imageUrls.forEach(addGeneratedImage);
        
        const finalChats = chats.map(chat =>
          chat.id === currentChatId
            ? { ...chat, messages: [...updatedMessages, assistantMessage] }
            : chat
        );
        
        setChats(finalChats);
        await saveData(finalChats, currentChatId);
      }
    } catch (err: any) {
      console.error('Error sending message:', err);
      setError(err.message || 'Failed to communicate with AI service');
      
      const revertedChats = chats.map(chat =>
        chat.id === currentChatId
          ? { ...chat, messages: currentChat.messages }
          : chat
      );
      setChats(revertedChats);
      await saveData(revertedChats, currentChatId);
    } finally {
      setIsLoading(false);
    }
  }, [apiKey, apiUrl, selectedModel, chats, activeChat, streamingEnabled, createNewChat, updateChatTitle, saveData, addGeneratedImage]);

  const selectChat = useCallback((chatId: string) => {
    if (!chats?.some(chat => chat.id === chatId)) return;
    setActiveChat(chatId);
    saveData(chats, chatId);
  }, [chats, saveData]);

  const clearChatHistory = useCallback(async () => {
    setChats([]);
    setActiveChat(null);
    setGeneratedImages([]);
    await Promise.all([
      AsyncStorage.setItem('chatHistory', JSON.stringify({ chats: [], activeChat: null })),
      AsyncStorage.setItem('generatedImages', JSON.stringify([]))
    ]);
  }, []);

  const deleteChat = useCallback((chatId: string) => {
    if (!chats) return;
    
    const updatedChats = chats.filter(chat => chat.id !== chatId);
    const updatedActiveChat = activeChat === chatId 
      ? updatedChats.length > 0 ? updatedChats[0].id : null
      : activeChat;
    
    setChats(updatedChats);
    setActiveChat(updatedActiveChat);
    saveData(updatedChats, updatedActiveChat);
  }, [chats, activeChat, saveData]);

  return {
    sendMessage,
    chats: chats || [],
    activeChat,
    currentChat: activeChat && chats ? chats.find(chat => chat.id === activeChat) : null,
    isLoading,
    error,
    clearChatHistory,
    createNewChat,
    selectChat,
    deleteChat,
    generatedImages
  };
}