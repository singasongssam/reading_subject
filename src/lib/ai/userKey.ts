const PREFIX = 'reading_subject_gemini:';
const ACTIVE = 'reading_subject_current_login';
export function setActiveAiUser(id: string | null) {
  try { if (id) sessionStorage.setItem(ACTIVE, id); else sessionStorage.removeItem(ACTIVE); } catch { /* storage unavailable */ }
}
export function getUserKey(id?: string): string {
  try { const user = id || sessionStorage.getItem(ACTIVE); return user ? sessionStorage.getItem(PREFIX + user) || '' : ''; } catch { return ''; }
}
export function setUserKey(id: string, key: string) {
  if (key.trim()) sessionStorage.setItem(PREFIX + id, key.trim());
  else sessionStorage.removeItem(PREFIX + id);
}
