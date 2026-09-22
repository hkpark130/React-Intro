import axios from 'axios';

const editorial = import.meta.env.MODE === 'editorial';
const API_BASE = editorial ? '' : import.meta.env.VITE_API_URL || '';

export const api = axios.create({
    baseURL: `${API_BASE}/api`,
    withCredentials: true
});

// Notion SSR API uses separate prefix (/notion) proxied by Nginx/Vite directly to SSR service
export const notionApi = axios.create({
  baseURL: '',
  withCredentials: true,
  timeout: 45000,
});

// Remove only the legacy Notion integration secret; blog login storage is separate.
const NOTION_KEY_STORAGE = 'notion.apiKey';
try { localStorage.removeItem(NOTION_KEY_STORAGE); } catch { /* Storage may be disabled. */ }

notionApi.interceptors.request.use(config => {
  if (editorial) throw new Error('로컬 편집 모드에서는 Notion 외부 조회를 사용하지 않습니다.');
  const token = localStorage.getItem('accessToken');
  if (!token) throw new Error('블로그에 로그인한 뒤 Notion을 가져올 수 있습니다.');
  config.headers.Authorization = `Bearer ${token}`;
  delete config.headers['x-notion-api-key'];
  return config;
});

api.interceptors.request.use(config => {
    const token = localStorage.getItem('accessToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    } else {
      // 비로그인 상태에서는 헤더 제거
      delete config.headers.Authorization;  
    }
    return config;
}, error => Promise.reject(error));

// access token은 30분이라 긴 글을 쓰는 동안 만료될 수 있다. 저장 요청이 401로 끝나면
// refresh 쿠키로 한 번 갱신한 뒤 같은 요청을 다시 보내, 작성 중인 내용을 지키게 한다.
const REFRESH_PATH = '/users/refresh';

api.interceptors.response.use(response => response, async error => {
  const request = error?.config;
  const unauthorized = error?.response?.status === 401;
  if (!unauthorized || !request || request._retriedAfterRefresh || request.url === REFRESH_PATH) {
    return Promise.reject(error);
  }

  const { refreshAccessToken } = await import('./auth');
  try {
    await refreshAccessToken();
  } catch {
    return Promise.reject(error);
  }

  request._retriedAfterRefresh = true;
  return api.request(request);
});

// 회원가입 함수 추가
export const register = async (userData) => {
  return await api.post('/users/register', userData);
};

// 게시글 목록 가져오기 함수 수정 (검색 기능, 카테고리 필터링 추가)
export const fetchPosts = async (offset = 0, limit = 10, searchTerm = '', categoryId = '') => {
  let url = `/posts?offset=${offset}&limit=${limit}`;
  
  if (searchTerm) {
    url += `&search=${encodeURIComponent(searchTerm)}`;
  }
  
  if (categoryId) {
    url += `&categoryId=${categoryId}`;
  }
  
  return await api.get(url);
};

export const fetchPost = id => api.get(`/posts/${id}`);
export const createPost = postData => api.post('/posts', postData);
export const deletePost = id => api.delete(`/posts/${id}`);

export const updatePost = (id, postData) => api.put(`/posts/${id}`, postData);
export const fetchComments = postId => api.get(`/posts/${postId}/comments`);
export const createComment = (postId, commentData) => api.post(`/posts/${postId}/comments`, commentData);

export const updateGuestComment = async (postId, commentId, data) => {
  return await api.put(`/posts/${postId}/comments/${commentId}/guest`, data);
};

export const updateUserComment = async (postId, commentId, data) => {
  return await api.put(`/posts/${postId}/comments/${commentId}`, data);
};

export const deleteGuestComment = async (postId, commentId, data) => {
  return await api.delete(`/posts/${postId}/comments/${commentId}/guest`, {data: data});
};

export const deleteUserComment = async (postId, commentId) => {
  return await api.delete(`/posts/${postId}/comments/${commentId}`);
};

// 댓글 비밀번호 확인
export const verifyCommentPassword = async (postId, commentId, password) => {
  return await api.post(`/posts/${postId}/comments/${commentId}/verify`, {
    password
  });
};

export const fetchCategories = () => api.get('/categories');
export const createCategory = categoryData => api.post('/categories', categoryData);
export const deleteCategory = id => api.delete(`/categories/${id}`);
export const updateCategory = (id, categoryData) => api.put(`/categories/${id}`, categoryData);

export const notionConvert = (data, options = {}) => notionApi.post('/notion/convert', data, options);
export const getNotionPageMeta = (pageId) => notionApi.get(`/notion/page/${pageId}`);

// Chat stays on this origin and does not use blog tokens or its refresh interceptor.
export const chatApi = axios.create({ baseURL: '/api', timeout: 65000, withCredentials: false });
export const sendChatMessage = (question, options = {}) => chatApi.post('/chat', { question }, options);
