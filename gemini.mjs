import { processGuide } from './dist/defect-guide.mjs';
import { defaultGeminiModel, GeminiRequestError as RequestError, normalizeGeminiKey, validateGeminiKey, requestObservation } from './dist/gemini-api.mjs';
import { createHash, timingSafeEqual } from 'node:crypto';

const configuredKey = process.env.GEMINI_API_KEY?.trim();
const model = process.env.GEMINI_MODEL?.trim() || defaultGeminiModel;
const maxBody = 6 * 1024 * 1024;
const imagePattern = /^data:image\/(jpeg|png|webp);base64,([A-Za-z0-9+/]+={0,2})$/;
const pagesOrigin = 'https://minseok-crt.github.io';
const accessCode = process.env.AEROSCOPE_ACCESS_CODE?.trim();
const hash = value => createHash('sha256').update(value).digest();
let active = false;
let localApiKey = configuredKey;
let updatingKey = false;

function json(res, status, data) {
  res.writeHead(status, {
    'Content-Type': 'application/json; charset=utf-8',
    'Cache-Control': 'no-store',
    'X-Content-Type-Options': 'nosniff',
  });
  res.end(JSON.stringify(data));
}

async function readBody(req, limit = maxBody) {
  const chunks = [];
  let size = 0;
  for await (const chunk of req.iterator({ destroyOnReturn: false })) {
    size += chunk.length;
    if (size > limit) {
      req.resume();
      throw new RequestError(413, limit === maxBody ? '이미지가 너무 큽니다. 더 작은 사진을 사용하세요.' : '키 입력값이 너무 깁니다.');
    }
    chunks.push(chunk);
  }
  try {
    return JSON.parse(Buffer.concat(chunks).toString());
  } catch {
    throw new RequestError(400, '요청 형식이 올바르지 않습니다.');
  }
}

function inspectImage(input) {
  const image = typeof input === 'string' && input.match(imagePattern);
  if (!image || image[2].length % 4) throw new RequestError(400, 'JPG, PNG, WEBP 사진을 선택하세요.');
  const [, format, data] = image;
  const bytes = Buffer.from(data, 'base64');
  const signatures = {
    jpeg: () => bytes.subarray(0, 3).equals(Buffer.from([255, 216, 255])),
    png: () => bytes.subarray(0, 8).equals(Buffer.from('89504e470d0a1a0a', 'hex')),
    webp: () => bytes.toString('ascii', 0, 4) === 'RIFF' && bytes.toString('ascii', 8, 12) === 'WEBP',
  };
  if (!signatures[format]()) throw new RequestError(400, '사진 파일의 형식을 확인할 수 없습니다.');
  return { mimeType: 'image/' + format, data };
}

function connectionStatus(apiKey) {
  return { configured: Boolean(apiKey), model: apiKey ? model : '' };
}

async function updateLocalKey(req, res) {
  if (updatingKey || active) {
    json(res, 409, { error: '진행 중인 분석 또는 연결 확인이 끝난 뒤 다시 시도하세요.' });
    return;
  }
  if (req.method === 'DELETE') {
    localApiKey = undefined;
    json(res, 200, connectionStatus(localApiKey));
    return;
  }
  updatingKey = true;
  try {
    const body = await readBody(req, 2048);
    const key = normalizeGeminiKey(body?.key);
    await validateGeminiKey(key, model);
    localApiKey = key;
    json(res, 200, connectionStatus(localApiKey));
  } catch (error) {
    const message = error instanceof RequestError ? error.message : 'Gemini 연결 확인에 실패했습니다. 네트워크 상태를 확인하세요.';
    json(res, error instanceof RequestError ? error.status : 502, { error: message });
  } finally {
    updatingKey = false;
  }
}

export async function handleGemini(req, res, pathname, localOrigin, hosted) {
  if (hosted) {
    if (req.headers.origin !== pagesOrigin) {
      json(res, 403, { error: '외관검사 워크스페이스의 공개 검사 화면에서 연결하세요.' });
      return;
    }
    res.setHeader('Access-Control-Allow-Origin', pagesOrigin);
    res.setHeader('Vary', 'Origin');
    if (req.method === 'OPTIONS') {
      res.writeHead(204, {
        'Access-Control-Allow-Methods': 'GET, POST',
        'Access-Control-Allow-Headers': 'Authorization, Content-Type',
      });
      res.end();
      return;
    }
    if (!accessCode || accessCode.length < 24 ||
        !timingSafeEqual(hash(req.headers.authorization || ''), hash('Bearer ' + accessCode))) {
      json(res, 401, { error: '서버의 연결 코드를 확인하세요.' });
      return;
    }
  } else if (req.headers.host !== new URL(localOrigin).host) {
    json(res, 403, { error: '로컬 검사 화면에서 호출하세요.' });
    return;
  }
  const apiKey = hosted ? configuredKey : localApiKey;
  if (pathname === '/api/gemini/status' && req.method === 'GET') {
    json(res, 200, connectionStatus(apiKey));
    return;
  }
  if (!hosted && pathname === '/api/gemini/key' && ['POST', 'DELETE'].includes(req.method)) {
    if (req.headers.origin !== localOrigin || req.headers['content-type']?.split(';')[0] !== 'application/json') {
      json(res, 403, { error: '내 PC의 검사 화면에서만 키를 설정할 수 있습니다.' });
      return;
    }
    await updateLocalKey(req, res);
    return;
  }
  if (pathname !== '/api/gemini/analyze' || req.method !== 'POST') {
    json(res, 404, { error: '지원하지 않는 요청입니다.' });
    return;
  }
  if (req.headers.origin !== (hosted ? pagesOrigin : localOrigin) || req.headers['content-type']?.split(';')[0] !== 'application/json') {
    json(res, 403, { error: '연결된 검사 화면에서만 사진을 전송할 수 있습니다.' });
    return;
  }
  if (!apiKey || active) {
    json(res, apiKey ? 429 : 503, { error: apiKey ? '진행 중인 분석이 있습니다.' : 'Gemini API 키가 설정되지 않았습니다.' });
    return;
  }
  active = true;
  try {
    const body = await readBody(req);
    const guide = processGuide(body?.process);
    if (!guide) throw new RequestError(400, '제조 공정을 선택하세요.');
    json(res, 200, await requestObservation(guide, inspectImage(body.image), apiKey, model));
  } catch (error) {
    const message = error instanceof RequestError ? error.message : 'Gemini 연결이 지연되었거나 네트워크에 문제가 있습니다.';
    json(res, error.status || 502, { error: message });
  } finally {
    active = false;
  }
}
