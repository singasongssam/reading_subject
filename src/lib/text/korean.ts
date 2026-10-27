/** 한글 처리 유틸리티: 초성 추출, 조사 선택 */

const CHOSEONG = ['ㄱ', 'ㄲ', 'ㄴ', 'ㄷ', 'ㄸ', 'ㄹ', 'ㅁ', 'ㅂ', 'ㅃ', 'ㅅ', 'ㅆ', 'ㅇ', 'ㅈ', 'ㅉ', 'ㅊ', 'ㅋ', 'ㅌ', 'ㅍ', 'ㅎ'];

/** '수요와 공급' → 'ㅅㅇㅇ ㄱㄱ' (한글 외 문자는 그대로) */
export function toChoseong(text: string): string {
  return Array.from(text)
    .map((ch) => {
      const code = ch.charCodeAt(0) - 0xac00;
      if (code < 0 || code > 11171) return ch;
      return CHOSEONG[Math.floor(code / 588)];
    })
    .join('');
}

function hasFinalConsonant(word: string): boolean {
  const trimmed = word.replace(/[\s)\]」』'"·.]+$/u, '');
  const last = trimmed.charCodeAt(trimmed.length - 1);
  if (Number.isNaN(last)) return false;
  if (last >= 0xac00 && last <= 0xd7a3) return (last - 0xac00) % 28 !== 0;
  // 영문/숫자: 받침 있는 것으로 간주되는 일부 끝 글자
  return /[013678lmnLMN]$/.test(trimmed);
}

/** 조사 자동 선택: josa('경제', '은/는') → '경제는' */
export function josa(word: string, pair: '은/는' | '이/가' | '을/를' | '과/와' | '으로/로' | '이다/다'): string {
  const fc = hasFinalConsonant(word);
  const [withF, withoutF] = pair.split('/');
  if (pair === '으로/로') {
    const last = word.charCodeAt(word.length - 1);
    const isRieul = last >= 0xac00 && (last - 0xac00) % 28 === 8;
    return word + (fc && !isRieul ? withF : withoutF);
  }
  return word + (fc ? withF : withoutF);
}

/** 문장 끝 마침표 제거 */
export function stripPeriod(s: string): string {
  return s.trim().replace(/[.。]+$/u, '');
}

/** 결정적 의사난수 (시드 기반) — 퀴즈 보기 섞기 등에 사용 */
export function seededRandom(seed: string): () => number {
  let h = 2166136261;
  for (let i = 0; i < seed.length; i++) {
    h ^= seed.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return () => {
    h += 0x6d2b79f5;
    let t = h;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export function shuffleWithSeed<T>(arr: T[], seed: string): T[] {
  const rnd = seededRandom(seed);
  const out = [...arr];
  for (let i = out.length - 1; i > 0; i--) {
    const j = Math.floor(rnd() * (i + 1));
    [out[i], out[j]] = [out[j], out[i]];
  }
  return out;
}
