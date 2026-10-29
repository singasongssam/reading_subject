/** Gemini 요청: 네트워크/일시적 과부하만 재시도하고 응답 JSON을 검증합니다. */
export async function callGeminiJson<T>(apiKey: string, model: string, prompt: string, temperature: number): Promise<T> {
  const delays = [0, 1200];
  for (let attempt = 0; attempt < delays.length; attempt++) {
    if (delays[attempt]) await new Promise(resolve => setTimeout(resolve, delays[attempt]));
    try {
      const controller = new AbortController();
      const timer = setTimeout(() => controller.abort(), 65000);
      let response: Response;
      try {
        response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(model)}:generateContent`, {
          method: 'POST',
          signal: controller.signal,
          headers: { 'Content-Type': 'application/json', 'x-goog-api-key': apiKey },
          body: JSON.stringify({ contents: [{ role: 'user', parts: [{ text: prompt }] }], generationConfig: { responseMimeType: 'application/json', temperature } }),
        });
      } finally { clearTimeout(timer); }
      if (!response.ok) {
        const err = new Error(`Gemini HTTP ${response.status}`);
        if (![429, 500, 502, 503, 504].includes(response.status) || attempt === delays.length - 1) throw err;
        continue;
      }
      const body = await response.json();
      const value = body?.candidates?.[0]?.content?.parts?.map((p: {text?:string}) => p.text || '').join('') || '';
      if (!value) throw new Error('Gemini 응답 텍스트가 없습니다.');
      return JSON.parse(value) as T;
    } catch (error) {
      const temporary = error instanceof Error && (error.name === 'AbortError' || error.name === 'TypeError' || /HTTP 429|HTTP 50[0234]/.test(error.message));
      if (!temporary || attempt === delays.length - 1) throw error;
    }
  }
  throw new Error('Gemini 호출이 완료되지 않았습니다.');
}
