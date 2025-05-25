import { useState, useEffect, useCallback } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Message, Chat, ChatHistory } from '@/types/app';
import { useAppSettings } from './useAppSettings';

export function useChatService() {
  const [chats, setChats] = useState<Chat[]>([]);
  const [activeChat, setActiveChat] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { apiKey, apiUrl, selectedModel, streamingEnabled } = useAppSettings();

  useEffect(() => {
    const loadChatHistory = async () => {
      try {
        const storedHistory = await AsyncStorage.getItem('chatHistory');
        if (storedHistory) {
          const history: ChatHistory = JSON.parse(storedHistory);
          setChats(history.chats || []);
          setActiveChat(history.activeChat || null);
        }
      } catch (error) {
        console.error('Error loading chat history:', error);
        setChats([]);
        setActiveChat(null);
      }
    };

    loadChatHistory();
  }, []);

  const saveChatHistory = useCallback(async (updatedChats: Chat[], updatedActiveChat: string | null) => {
    try {
      const historyToSave: ChatHistory = {
        chats: updatedChats || [],
        activeChat: updatedActiveChat
      };
      await AsyncStorage.setItem('chatHistory', JSON.stringify(historyToSave));
    } catch (error) {
      console.error('Error saving chat history:', error);
    }
  }, []);

  const createNewChat = useCallback(() => {
    const newChat: Chat = {
      id: Date.now().toString(),
      title: 'New Chat',
      messages: [],
      createdAt: Date.now(),
      model: selectedModel?.id || 'unknown'
    };
    
    const updatedChats = [newChat, ...(chats || [])];
    setChats(updatedChats);
    setActiveChat(newChat.id);
    saveChatHistory(updatedChats, newChat.id);
    return newChat.id;
  }, [chats, selectedModel, saveChatHistory]);

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
    saveChatHistory(updatedChats, activeChat);
  }, [chats, activeChat, saveChatHistory]);

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

        // Convert chunk to text and add to buffer
        const chunk = new TextDecoder().decode(value);
        buffer += chunk;

        // Process complete lines from buffer
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
                await saveChatHistory(updatedChatsWithStream, currentChatId);
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

  const sendMessage = useCallback(async (message: string, file?: any) => {
    if (!apiKey || !apiUrl || !selectedModel) {
      setError('API key, URL, or model not set. Please check your settings.');
      return;
    }

    setIsLoading(true);
    setError(null);

    let currentChatId = activeChat;
    if (!currentChatId) {
      currentChatId = createNewChat();
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
    await saveChatHistory(updatedChats, currentChatId);

    try {
      const formData = new FormData();
      
      // Add message data
      formData.append('model', selectedModel.id);
      formData.append('messages', JSON.stringify(updatedMessages.map(msg => ({ 
        role: msg.role, 
        content: msg.content 
      }))));
      formData.append('temperature', '0.7');
      formData.append('stream', String(streamingEnabled));

      // Add file if present
      if (file) {
        formData.append('file', {
          uri: file.uri,
          type: file.mimeType,
          name: file.name || 'file',
        });
      }

      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Content-Type': 'multipart/form-data',
        },
        body: formData,
      });

      if (!response.ok) {
        if (response.status === 400) {
          setError('Please wait, we have received too many requests. Try again later.');
          return;
        }
        const errorData = await response.json();
        throw new Error(errorData.error?.message || 'Failed to get response from AI');
      }

      if (streamingEnabled && response.body) {
        await processStreamingResponse(response, currentChatId, updatedMessages);
      } else {
        const data = await response.json();
        const assistantMessage: Message = {
          role: 'assistant',
          content: data.choices[0]?.message?.content || '',
        };
        
        const finalChats = chats.map(chat =>
          chat.id === currentChatId
            ? { ...chat, messages: [...updatedMessages, assistantMessage] }
            : chat
        );
        
        setChats(finalChats);
        await saveChatHistory(finalChats, currentChatId);
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
      await saveChatHistory(revertedChats, currentChatId);
    } finally {
      setIsLoading(false);
    }
  }, [apiKey, apiUrl, selectedModel, chats, activeChat, streamingEnabled, createNewChat, updateChatTitle, saveChatHistory]);

  const selectChat = useCallback((chatId: string) => {
    if (!chats?.some(chat => chat.id === chatId)) return;
    setActiveChat(chatId);
    saveChatHistory(chats, chatId);
  }, [chats, saveChatHistory]);

  const clearChatHistory = useCallback(async () => {
    setChats([]);
    setActiveChat(null);
    await AsyncStorage.setItem('chatHistory', JSON.stringify({ chats: [], activeChat: null }));
  }, []);

  const deleteChat = useCallback((chatId: string) => {
    if (!chats) return;
    
    const updatedChats = chats.filter(chat => chat.id !== chatId);
    const updatedActiveChat = activeChat === chatId 
      ? updatedChats.length > 0 ? updatedChats[0].id : null
      : activeChat;
    
    setChats(updatedChats);
    setActiveChat(updatedActiveChat);
    saveChatHistory(updatedChats, updatedActiveChat);
  }, [chats, activeChat, saveChatHistory]);

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
    deleteChat
  };
}