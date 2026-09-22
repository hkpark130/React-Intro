export class NotionRequestError extends Error {
  constructor(status, message) { super(message); this.status = status; this.publicMessage = message; }
}

export function createAuthoringGate(config, springClient) {
  let active = 0;
  return async (req, res, next) => {
    const authorization = req.get('authorization') || '';
    if (!/^Bearer [A-Za-z0-9._~-]+$/.test(authorization) || authorization.length > 8192) {
      return res.status(401).json({ message: '블로그 관리자 로그인이 필요합니다.' });
    }
    if (active >= 2) return res.status(429).set('Retry-After', '2').json({ message: '가져오기가 진행 중입니다. 잠시 후 다시 시도해 주세요.' });
    active++;
    const controller = new AbortController();
    let released = false;
    const release = () => {
      if (released) return;
      released = true; active--;
      clearTimeout(timer);
      controller.abort();
    };
    const timer = setTimeout(() => {
      controller.abort();
      if (!res.headersSent) res.status(504).json({ message: '가져오기 시간이 초과되었습니다. 더 작은 페이지를 선택해 주세요.' });
    }, 30000);
    res.once('finish', release);
    res.once('close', release);
    try {
      const { data } = await springClient.get('/api/users/me', { headers: { Authorization: authorization }, signal: controller.signal });
      if (controller.signal.aborted) return;
      if (data?.role !== 'ADMIN') return res.status(403).json({ message: '블로그 관리자만 Notion을 가져올 수 있습니다.' });
      if (req.get('x-notion-api-key') || req.query.apiKey !== undefined || req.query.notionKey !== undefined || req.body?.apiKey !== undefined || req.body?.notionKey !== undefined) {
        return res.status(400).json({ message: 'Notion 키는 서버에서 관리합니다. 요청에 키를 포함하지 마세요.' });
      }
      if (!config.notionApiKey) return res.status(503).json({ message: '서버의 Notion 연결이 설정되지 않았습니다.' });
      req.notionContext = { signal: controller.signal, calls: 0, bytes: 0, maxCalls: 40, maxBytes: 4 * 1024 * 1024 };
      next();
    } catch (error) {
      if (res.headersSent || controller.signal.aborted) return;
      const status = [401, 403].includes(error.response?.status) ? 401 : 503;
      res.status(status).json({ message: status === 401 ? '로그인이 만료되었습니다. 다시 로그인해 주세요.' : '로그인 상태를 확인할 수 없습니다. 잠시 후 다시 시도해 주세요.' });
    }
  };
}

export function createNotionFetch(context, transport = globalThis.fetch) {
  return async (input, init = {}) => {
    const url = new URL(typeof input === 'string' ? input : input.url || input);
    if (url.origin !== 'https://api.notion.com' || !url.pathname.startsWith('/v1/')) throw new NotionRequestError(400, '허용되지 않은 Notion 요청입니다.');
    context.signal.throwIfAborted();
    if (++context.calls > context.maxCalls) throw new NotionRequestError(413, '페이지가 너무 큽니다. 하위 페이지를 나누어 가져와 주세요.');
    const response = await transport(url.toString(), { ...init, redirect: 'error', signal: context.signal });
    const chunks = [];
    const reader = response.body?.getReader();
    if (reader) {
      try {
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          context.bytes += value.byteLength;
          if (context.bytes > context.maxBytes) throw new NotionRequestError(413, '가져올 내용이 너무 큽니다. 페이지를 나누어 주세요.');
          chunks.push(value);
        }
      } catch (error) {
        await reader.cancel().catch(() => {});
        throw error;
      } finally { reader.releaseLock(); }
    }
    return new Response(chunks.length ? new Blob(chunks) : null, { status: response.status, statusText: response.statusText, headers: response.headers });
  };
}

export function createNotionClient(config, context, Client) {
  return new Client({
    auth: config.notionApiKey,
    notionVersion: '2025-09-03',
    timeoutMs: 15000,
    fetch: createNotionFetch(context),
    logger: () => {}, // SDK error bodies can contain private Notion content.
  });
}
