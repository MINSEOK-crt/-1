export const isLocalGemini = location.protocol === 'http:' && location.hostname === 'localhost';
let hostedConnection;

function request(path, options) {
  const origin = hostedConnection?.origin || '';
  const headers = hostedConnection
    ? { ...options.headers, Authorization: 'Bearer ' + hostedConnection.code }
    : options.headers;
  return fetch(origin + path, { ...options, headers, credentials: 'omit', redirect: 'error' });
}

async function readResponse(response) {
  const data = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(data.error || 'Gemini 서버에 연결하지 못했습니다.');
  return data;
}

async function updateLocalKey(method, key) {
  if (!isLocalGemini) throw new Error('내 PC의 검사 화면에서 API 키를 입력하세요.');
  const response = await request('/api/gemini/key', {
    method,
    headers: { 'Content-Type': 'application/json' },
    body: method === 'POST' ? JSON.stringify({ key }) : undefined,
    signal: AbortSignal.timeout(15000),
  });
  return readResponse(response);
}

export const setLocalGeminiKey = key => updateLocalKey('POST', key);
export const clearLocalGeminiKey = () => updateLocalKey('DELETE');

export async function geminiStatus() {
  if (!isLocalGemini && !hostedConnection) return { configured: false };
  const response = await request('/api/gemini/status', { signal: AbortSignal.timeout(5000) });
  return readResponse(response);
}

export async function connectGeminiServer(address, code) {
  let url;
  try { url = new URL(address); } catch { throw new Error('올바른 서버 주소를 입력하세요.'); }
  if (url.protocol !== 'https:' || url.username || url.password || url.pathname !== '/' || url.search || url.hash) {
    throw new Error('경로가 없는 HTTPS 서버 주소를 입력하세요.');
  }
  if (code.length < 24) throw new Error('서버의 연결 코드를 입력하세요.');
  hostedConnection = { origin: url.origin, code };
  try {
    const status = await geminiStatus();
    if (!status.configured) throw new Error('서버에 Gemini API 키를 설정하세요.');
    return status;
  } catch (error) {
    hostedConnection = undefined;
    throw error;
  }
}

export function disconnectGeminiServer() {
  hostedConnection = undefined;
}

export async function geminiAnalysis(image, process) {
  const response = await request('/api/gemini/analyze', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ image, process }),
    signal: AbortSignal.timeout(35000),
  });
  return readResponse(response);
}
