import type { AiProvider } from './types';
import { MockProvider } from './mockProvider';
import { GeminiProvider } from './geminiProvider';
import { getUserKey } from './userKey';
export * from './types';
export * from './userKey';
export function getAiProvider(): AiProvider {
  const key = getUserKey();
  return key ? new GeminiProvider(key, import.meta.env.VITE_GEMINI_MODEL || 'gemini-2.5-flash') : new MockProvider();
}
// Resolve provider per call so changing personal key takes effect without a page reload.
export const aiProvider: AiProvider = {
  get name() { return getAiProvider().name; },
  generateMaterialSet: (...args) => getAiProvider().generateMaterialSet(...args),
  composeGagnePlan: (...args) => getAiProvider().composeGagnePlan(...args),
  generateMaterial: (...args) => getAiProvider().generateMaterial(...args),
  recommendStrategies: (...args) => getAiProvider().recommendStrategies(...args),
  generateLessonPlan: (...args) => getAiProvider().generateLessonPlan(...args),
};
