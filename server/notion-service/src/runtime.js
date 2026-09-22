import axios from 'axios';
import { validateOrigin, validatePostId } from './markdown/renderBlog.js';

export function resolveRuntimeConfig(env = {}) {
  const mode = env.SSR_MODE || 'production';
  if (!['production', 'development', 'editorial'].includes(mode)) throw new Error('Unknown SSR_MODE');
  const editorial = mode === 'editorial';
  const port = Number(env.PORT || (editorial ? 3100 : 3000));
  if (!Number.isInteger(port) || port < 1 || port > 65535) throw new Error('Invalid PORT');
  return {
    editorial, port,
    host: editorial ? '127.0.0.1' : undefined,
    springBase: validateOrigin(env.SPRING_BASE || (editorial ? 'http://127.0.0.1:8100' : 'http://backend-spring-app:8100'), editorial),
    siteOrigin: env.SITE_ORIGIN ? validateOrigin(env.SITE_ORIGIN) : '',
    notionApiKey: env.NOTION_API_KEY,
  };
}
export function createSpringClient(config) {
  return axios.create({
    baseURL: validateOrigin(config.springBase, config.editorial), timeout: 8000,
    proxy: false, maxRedirects: 0, maxContentLength: 4 * 1024 * 1024,
  });
}
export async function fetchBlogPost(client, id) {
  return (await client.get(`/api/posts/${validatePostId(id)}`)).data;
}
