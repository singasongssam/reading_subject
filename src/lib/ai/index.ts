import { AiProvider } from './types';
import { MockProvider } from './mockProvider';
import { GeminiProvider } from './geminiProvider';

export * from './types';
export * from './mockProvider';
export * from './geminiProvider';

// VITE_AI_MODE 환경변수 분기: mock 또는 gemini
const aiMode = import.meta.env.VITE_AI_MODE || 'mock';
const geminiKey = import.meta.env.VITE_GEMINI_API_KEY || '';

export function getAiProvider(): AiProvider {
  if (aiMode === 'gemini' && geminiKey) {
    return new GeminiProvider(geminiKey, import.meta.env.VITE_GEMINI_MODEL || 'gemini-2.0-flash');
  }
  return new MockProvider();
}

export const aiProvider = getAiProvider();
