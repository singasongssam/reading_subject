export interface GenerationPreferences { learnerProfile: string; lessonFocus: string; teachingApproach: string; extraInstructions: string }
export type GenerationStatus = 'idle' | 'rule' | 'ai' | 'fallback';
export const defaultPreferences: GenerationPreferences = { learnerProfile: '', lessonFocus: '', teachingApproach: '', extraInstructions: '' };
let preferences: GenerationPreferences = { ...defaultPreferences };
let status: GenerationStatus = 'idle';
let detail = '';
export function setGenerationPreferences(next: GenerationPreferences) { preferences = { ...next }; }
export function getGenerationPreferences(): GenerationPreferences { return { ...preferences }; }
export function reportGeneration(next: GenerationStatus, message: string) { status = next; detail = message; }
export function getGenerationResult() { return { status, detail }; }
