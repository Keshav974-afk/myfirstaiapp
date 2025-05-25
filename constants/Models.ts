import { AIModel } from '@/types/app';

const createModel = (
  id: string,
  name: string,
  description?: string,
  maxTokens: number = 4096,
  color?: string
): AIModel => ({
  id,
  name,
  description,
  maxTokens,
  color
});

// OpenAI Models
const OPENAI_MODELS = [
  createModel(
    'gpt-4-turbo-preview',
    'GPT-4 Turbo',
    'Latest GPT-4 model with enhanced capabilities',
    128000,
    '#8B5CF6'
  ),
  createModel(
    'gpt-4-0125-preview',
    'GPT-4 Preview',
    'Preview version of GPT-4 with latest improvements',
    128000,
    '#7C3AED'
  ),
  createModel(
    'gpt-4',
    'GPT-4',
    'Highly capable model for complex tasks',
    8192,
    '#6D28D9'
  ),
  createModel(
    'gpt-3.5-turbo',
    'GPT-3.5 Turbo',
    'Fast and cost-effective for most tasks',
    4096,
    '#10B981'
  ),
];

// Anthropic Models
const ANTHROPIC_MODELS = [
  createModel(
    'anthropic/claude-3.5-sonnet',
    'Claude 3.5 Sonnet',
    'Balanced performance for complex tasks',
    200000,
    '#EC4899'
  ),
  createModel(
    'anthropic/claude-3-opus',
    'Claude 3 Opus',
    'Most capable Claude model for complex tasks',
    200000,
    '#DB2777'
  ),
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
    'gemini-1.5-pro-latest',
    'Gemini 1.5 Pro',
    'Latest Gemini model with enhanced capabilities',
    1000000,
    '#6366F1'
  ),
  createModel(
    'gemini-1.5-pro',
    'Gemini 1.5 Pro',
    'Advanced reasoning and analysis capabilities',
    1000000,
    '#4F46E5'
  ),
  createModel(
    'gemini-pro',
    'Gemini Pro',
    'Balanced model for general tasks',
    32768,
    '#4338CA'
  ),
  createModel(
    'google/gemma-1.1-7b-it',
    'Gemma 7B',
    'Efficient open model for general tasks',
    8192,
    '#0EA5E9'
  ),
  createModel(
    '@cf/google/gemma-2b-it-lora',
    'Gemma 2B',
    'Lightweight model for quick responses',
    4096,
    '#38BDF8'
  ),
];

// Meta Models
const META_MODELS = [
  createModel(
    'meta-llama/Llama-3.3-70b-instruct',
    'Llama 3.3 70B',
    'Latest Llama model with enhanced capabilities',
    4096,
    '#F59E0B'
  ),
  createModel(
    'meta-llama/Llama-3.1-70B-Instruct',
    'Llama 3.1 70B',
    'Advanced instruction-following capabilities',
    4096,
    '#FBBF24'
  ),
  createModel(
    'meta-llama/Llama-3.1-8B-Instruct',
    'Llama 3.1 8B',
    'Efficient model for general tasks',
    4096,
    '#FCD34D'
  ),
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
    'mistralai/Mixtral-8x7B-Instruct-v0.1',
    'Mixtral 8x7B',
    'Powerful mixture-of-experts model',
    32768,
    '#14B8A6'
  ),
  createModel(
    'mistralai/Mistral-7B-Instruct-v0.3',
    'Mistral 7B v0.3',
    'Latest version with improved instruction following',
    8192,
    '#0D9488'
  ),
  createModel(
    'mistralai/Mistral-7B-Instruct-v0.2',
    'Mistral 7B v0.2',
    'Stable version with good performance',
    8192,
    '#0F766E'
  ),
];

// Qwen Models
const QWEN_MODELS = [
  createModel(
    'qwen2.5-72b-instruct',
    'Qwen 2.5 72B',
    'Large-scale multilingual model',
    8192,
    '#0891B2'
  ),
  createModel(
    'qwen2.5-14b-instruct-1m',
    'Qwen 2.5 14B',
    'Balanced model with 1M context',
    8192,
    '#0E7490'
  ),
  createModel(
    '@cf/qwen/qwen1.5-14b-chat-awq',
    'Qwen 1.5 14B',
    'Balanced model with AWQ optimization',
    8192,
    '#155E75'
  ),
];

// Microsoft Models
const MICROSOFT_MODELS = [
  createModel(
    'microsoft/phi-4',
    'Phi-4',
    'Latest Phi model with enhanced capabilities',
    4096,
    '#4F46E5'
  ),
  createModel(
    'microsoft/phi-3.5-mini-instruct',
    'Phi 3.5 Mini',
    'Compact model for quick responses',
    4096,
    '#4338CA'
  ),
  createModel(
    '@cf/microsoft/phi-2',
    'Phi-2',
    'Compact yet powerful model',
    4096,
    '#3730A3'
  ),
];

// DeepSeek Models
const DEEPSEEK_MODELS = [
  createModel(
    'deepseek-ai/DeepSeek-V3',
    'DeepSeek V3',
    'Advanced model for complex reasoning',
    8192,
    '#8B5CF6'
  ),
  createModel(
    'deepseek-ai/DeepSeek-R1',
    'DeepSeek R1',
    'Research-focused model',
    8192,
    '#7C3AED'
  ),
  createModel(
    '@cf/deepseek-ai/deepseek-math-7b-instruct',
    'DeepSeek Math 7B',
    'Specialized for mathematical tasks',
    8192,
    '#6D28D9'
  ),
];

// Yi Models
const YI_MODELS = [
  createModel(
    '01-ai/Yi-1.5-34B-Chat',
    'Yi 1.5 34B',
    'Large multilingual chat model',
    4096,
    '#D946EF'
  ),
  createModel(
    '01-ai/Yi-1.0-34B-Chat',
    'Yi 1.0 34B',
    'Stable multilingual model',
    4096,
    '#C026D3'
  ),
];

// X.AI Models
const XAI_MODELS = [
  createModel(
    'x-ai/grok-3-beta',
    'Grok 3 Beta',
    'Latest Grok model with enhanced capabilities',
    8192,
    '#EF4444'
  ),
  createModel(
    'x-ai/grok-2',
    'Grok 2',
    'Stable version with good performance',
    8192,
    '#DC2626'
  ),
];

// Claude Models
const CLAUDE_MODELS = [
  createModel(
    'Claude-sonnet-3.7',
    'Claude Sonnet 3.7',
    'Latest Claude model with improved capabilities',
    200000,
    '#F472B6'
  ),
  createModel(
    'c4ai-command-r-plus-08-2024',
    'C4AI Command R+',
    'Advanced command-focused model',
    32768,
    '#E879F9'
  ),
];

// Specialized Models
const SPECIALIZED_MODELS = [
  createModel(
    '@cf/defog/sqlcoder-7b-2',
    'SQLCoder 7B',
    'Specialized for SQL generation',
    8192,
    '#2563EB'
  ),
  createModel(
    'black-forest-labs/FLUX.1-pro',
    'FLUX.1 Pro',
    'Advanced model for professional use',
    8192,
    '#1D4ED8'
  ),
  createModel(
    'HelpingAI2.5-10B',
    'HelpingAI 2.5 10B',
    'Focused on helpful interactions',
    8192,
    '#7E22CE'
  ),
];

// Vision Models
const VISION_MODELS = [
  createModel(
    'gpt-4-vision-preview',
    'GPT-4 Vision',
    'Advanced vision-language model',
    128000,
    '#059669'
  ),
  createModel(
    'meta-llama/Llama-3.2-11B-Vision-Instruct',
    'Llama Vision 11B',
    'Efficient vision-language model',
    4096,
    '#047857'
  ),
];

// Special Models
const SPECIAL_MODELS = [
  createModel(
    'Image-Generator',
    'Image Generator',
    'Advanced model for image generation',
    4096,
    '#059669'
  ),
  createModel(
    'uncensored-r1',
    'Uncensored R1',
    'Unrestricted model for creative tasks',
    8192,
    '#DC2626'
  ),
];

// Combine all models
export const AVAILABLE_MODELS: AIModel[] = [
  ...OPENAI_MODELS,
  ...ANTHROPIC_MODELS,
  ...GOOGLE_MODELS,
  ...META_MODELS,
  ...MISTRAL_MODELS,
  ...QWEN_MODELS,
  ...MICROSOFT_MODELS,
  ...DEEPSEEK_MODELS,
  ...YI_MODELS,
  ...XAI_MODELS,
  ...CLAUDE_MODELS,
  ...SPECIALIZED_MODELS,
  ...VISION_MODELS,
  ...SPECIAL_MODELS,
];

// Set default model
export const DEFAULT_MODEL: AIModel = AVAILABLE_MODELS[0];