import { processGuide } from './defect-guide.mjs';
import { defaultGeminiModel, normalizeGeminiKey, requestObservation, validateGeminiKey } from './gemini-api.mjs';

export const isLocalGemini = location.protocol === 'http:' && location.hostname === 'localhost';
let browserKey;

function connectionStatus() {
  return { configured: Boolean(browserKey), model: browserKey ? defaultGeminiModel : '' };
}

async function requestLocal(path, options) {
  const response = await fetch(path, { ...options, cache: 'no-store', credentials: 'omit', redirect: 'error' });
  const data = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(data.error || '로컬 검사 서버에 연결하지 못했습니다.');
  return data;
}

function updateLocalKey(method, key) {
  return requestLocal('/api/gemini/key', {
    method,
    headers: { 'Content-Type': 'application/json' },
    body: method === 'POST' ? JSON.stringify({ key }) : undefined,
    signal: AbortSignal.timeout(15000),
  });
}

export async function connectGeminiKey(value) {
  if (isLocalGemini) return updateLocalKey('POST', value);
  if (location.protocol !== 'https:') throw new Error('HTTPS 공개 홈페이지 또는 로컬 검사 화면에서 연결하세요.');
  const key = normalizeGeminiKey(value);
  await validateGeminiKey(key);
  browserKey = key;
  return connectionStatus();
}

export async function clearGeminiKey() {
  if (isLocalGemini) return updateLocalKey('DELETE');
  browserKey = undefined;
  return connectionStatus();
}

export async function geminiStatus() {
  if (!isLocalGemini) return connectionStatus();
  return requestLocal('/api/gemini/status', { signal: AbortSignal.timeout(5000) });
}

export async function geminiAnalysis(image, process) {
  if (isLocalGemini) {
    return requestLocal('/api/gemini/analyze', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ image, process }),
      signal: AbortSignal.timeout(35000),
    });
  }
  if (!browserKey) throw new Error('AI 연결 설정에서 Gemini API 키를 연결하세요.');
  const guide = processGuide(process);
  if (!guide) throw new Error('제조 공정을 선택하세요.');
  const dataUrl = typeof image === 'string' && image.match(/^data:(image\/(?:jpeg|png|webp));base64,([A-Za-z0-9+/]+={0,2})$/);
  if (!dataUrl || dataUrl[2].length % 4) throw new Error('JPG, PNG 또는 WEBP 사진을 선택하세요.');
  if (dataUrl[2].length > 6 * 1024 * 1024) throw new Error('이미지가 너무 큽니다. 더 작은 사진을 사용하세요.');
  return requestObservation(guide, { mimeType: dataUrl[1], data: dataUrl[2] }, browserKey);
}
