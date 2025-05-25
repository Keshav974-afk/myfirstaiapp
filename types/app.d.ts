export interface Message {
  role: 'user' | 'assistant' | 'system';
  content: string;
}

export interface Chat {
  id: string;
  title: string;
  messages: Message[];
  createdAt: number;
  model: string;
}

export interface ChatHistory {
  chats: Chat[];
  activeChat: string | null;
}

export interface AIModel {
  id: string;
  name: string;
  description?: string;
  maxTokens?: number;
  color?: string;
}

export interface ChatResponse {
  id: string;
  object: string;
  created: number;
  model: string;
  choices: {
    index: number;
    message: {
      role: string;
      content: string;
    };
    finish_reason: string;
  }[];
  usage: {
    prompt_tokens: number;
    completion_tokens: number;
    total_tokens: number;
  };
}