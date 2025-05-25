import { AIModel } from '@/types/app';

const createModel = (
  id: string,
  name: string,
  description?: string,
  maxTokens: number = 4096,
  color?: string,
  available: boolean = true
): AIModel => ({
  id,
  name,
  description,
  maxTokens,
  color,
  available
});

// OpenAI Models
const OPENAI_MODELS = [
  createModel(
    'gpt-3.5-turbo',
    'GPT-3.5 Turbo',
    'Fast and cost-effective for most tasks',
    4096,
    '#10B981'
  ),
  createModel(
    'gpt-4',
    'GPT-4',
    'Highly capable model for complex tasks',
    8192,
    '#6D28D9'
  ),
];

// Anthropic Models
const ANTHROPIC_MODELS = [
  createModel(
    'anthropic/claude-3-sonnet',
    'Claude 3 Sonnet',
    'Fast and efficient for most tasks',
    200000,
    '#BE185D'
  ),
];

// Google Models
const GOOGLE_MODELS = [
  createModel(
    'gemini-pro',
    'Gemini Pro',
    'Balanced model for general tasks',
    32768,
    '#4338CA'
  ),
];

// Meta Models
const META_MODELS = [
  createModel(
    '@cf/meta/llama-2-7b-chat-int8',
    'Llama 2 7B',
    'Efficient quantized chat model',
    4096,
    '#FBBF24'
  ),
];

// Mistral Models
const MISTRAL_MODELS = [
  createModel(
    'mistralai/Mistral-7B-Instruct-v0.2',
    'Mistral 7B v0.2',
    'Stable version with good performance',
    8192,
    '#0F766E'
  ),
];

// Combine all models
export const AVAILABLE_MODELS: AIModel[] = [
  ...OPENAI_MODELS,
  ...ANTHROPIC_MODELS,
  ...GOOGLE_MODELS,
  ...META_MODELS,
  ...MISTRAL_MODELS,
];

// Set default model to GPT-3.5 Turbo
export const DEFAULT_MODEL: AIModel = AVAILABLE_MODELS[0];