import express from 'express';
import { Client } from '@notionhq/client';
import { createNotionClient, NotionRequestError } from './authoring.js';
import { renderBlogContent, escapeHtml } from './markdown/renderBlog.js';

export function validateNotionId(value) {
  if (typeof value !== 'string' || !/^(?:[a-f0-9]{32}|[a-f0-9]{8}-(?:[a-f0-9]{4}-){3}[a-f0-9]{12})$/i.test(value)) {
    throw new NotionRequestError(400, '올바른 Notion 페이지 또는 데이터베이스 ID를 입력해 주세요.');
  }
  return value;
}

function metadata(page) {
  const titleProperty = Object.values(page.properties || {}).find(property => property?.type === 'title');
  return {
    id: page.id,
    title: titleProperty?.title?.map(part => part.plain_text || part.text?.content || '').join('') || '제목 없음',
    createdTime: page.created_time,
    lastEditedTime: page.last_edited_time,
    coverImage: page.cover?.external?.url || page.cover?.file?.url || null,
  };
}

function pageOptions(input = {}) {
  const pageSize = Number(input.pageSize || 10);
  if (!Number.isInteger(pageSize) || pageSize < 1 || pageSize > 20) throw new NotionRequestError(400, '한 번에 1~20개 페이지를 조회할 수 있습니다.');
  if (input.startCursor && (typeof input.startCursor !== 'string' || input.startCursor.length > 200)) throw new NotionRequestError(400, '다음 페이지 정보가 올바르지 않습니다.');
  return { page_size: pageSize, ...(input.startCursor ? { start_cursor: input.startCursor } : {}) };
}

async function converter(notion) {
  const { NotionToMarkdown } = await import('notion-to-md');
  const n2m = new NotionToMarkdown({ notionClient: notion, config: { convertImagesToBase64: false } });
  n2m.setCustomTransformer('bookmark', async block => {
    const url = block.bookmark?.url || '';
    const caption = (block.bookmark?.caption || []).map(part => part.plain_text || '').join('');
    return '<Bookmark url="' + escapeHtml(url) + '" description="' + escapeHtml(caption) + '" />';
  });
  // Keep native paragraph conversion: registering a custom transformer also
  // prevents notion-to-md from recursively converting that block's children.
  return n2m;
}

function convertedResult(n2m, blocks) {
  const markdown = n2m.toMarkdownString(blocks).parent || '';
  if (new TextEncoder().encode(markdown).byteLength > 1024 * 1024) throw new NotionRequestError(413, '변환된 글이 너무 큽니다. 페이지를 나누어 주세요.');
  return { markdown, html: renderBlogContent(markdown) };
}

export function createNotionRouter(config) {
  const router = express.Router();
  const route = handler => async (req, res) => {
    try { await handler(req, res); }
    catch (error) {
      if (res.headersSent || req.notionContext.signal.aborted) return;
      // Only known local validation messages leave the service.
      if (error instanceof NotionRequestError) return res.status(error.status).json({ message: error.publicMessage });
      const status = error.status === 404 ? 404 : error.status === 429 ? 429 : 502;
      res.status(status).json({ message: status === 404 ? '페이지를 찾을 수 없습니다. Notion 연결에 공유했는지 확인해 주세요.' : status === 429 ? 'Notion 요청 한도에 도달했습니다. 잠시 후 다시 시도해 주세요.' : 'Notion 내용을 가져오지 못했습니다. 연결 권한과 페이지를 확인해 주세요.' });
    }
  };
  const client = req => createNotionClient(config, req.notionContext, Client);

  async function queryDatabase(req, databaseId, input) {
    const notion = client(req);
    const database = await notion.databases.retrieve({ database_id: validateNotionId(databaseId) });
    const sources = (database.data_sources || []).map(source => ({ id: source.id, name: source.name || '데이터 원본' }));
    const options = pageOptions(input);
    const selected = input.dataSourceId ? validateNotionId(input.dataSourceId) : sources.length === 1 ? sources[0].id : '';
    if (!selected) return { results: [], has_more: false, next_cursor: null, dataSources: sources, requiresDataSource: true };
    if (!sources.some(source => source.id === selected)) throw new NotionRequestError(400, '이 데이터베이스의 데이터 원본을 선택해 주세요.');
    const result = await notion.request({ method: 'post', path: 'data_sources/' + selected + '/query', body: options });
    return { ...result, dataSources: sources, dataSourceId: selected };
  }

  router.post('/convert', route(async (req, res) => {
    const pageId = validateNotionId(req.body?.pageId);
    const n2m = await converter(client(req));
    res.json(convertedResult(n2m, await n2m.pageToMarkdown(pageId)));
  }));

  router.get('/page/:pageId', route(async (req, res) => {
    const page = await client(req).pages.retrieve({ page_id: validateNotionId(req.params.pageId) });
    res.json(metadata(page));
  }));

  router.get('/render-db/:databaseId', route(async (req, res) => {
    const response = await queryDatabase(req, req.params.databaseId, req.query);
    res.json({
      results: (response.results || []).map(metadata),
      hasMore: !!response.has_more,
      nextCursor: response.next_cursor || null,
      dataSources: response.dataSources,
      dataSourceId: response.dataSourceId,
      requiresDataSource: !!response.requiresDataSource,
    });
  }));

  router.post('/fetchPages', route(async (req, res) => {
    res.json(await queryDatabase(req, req.body?.databaseId, req.body || {}));
  }));

  router.post('/fetchPageBlocks', route(async (req, res) => {
    res.json(await client(req).blocks.children.list({ block_id: validateNotionId(req.body?.pageId), ...pageOptions(req.body) }));
  }));

  router.post('/blocksToHtml', route(async (req, res) => {
    const blocks = req.body?.blocks;
    if (!Array.isArray(blocks) || !blocks.length || blocks.length > 500) throw new NotionRequestError(400, '1~500개 블록을 지정해 주세요.');
    const n2m = await converter(client(req));
    res.json(convertedResult(n2m, await n2m.blocksToMarkdown(blocks)));
  }));

  router.get('/render/:pageId', route(async (req, res) => {
    const n2m = await converter(client(req));
    res.json(convertedResult(n2m, await n2m.pageToMarkdown(validateNotionId(req.params.pageId))));
  }));

  return router;
}
