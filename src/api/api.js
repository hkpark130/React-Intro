import axios from 'axios';

const API_BASE = 'http://localhost:8100';

export const api = axios.create({
    baseURL: `${API_BASE}/api`,
    withCredentials: true
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

// 게시글 목록 가져오기 함수 수정 (검색 기능 추가)
export const fetchPosts = async (offset = 0, limit = 10, searchTerm = '') => {
  let url = `/posts?offset=${offset}&limit=${limit}`;
  
  if (searchTerm) {
    url += `&search=${encodeURIComponent(searchTerm)}`;
  }
  
  return await api.get(url);
};

export const fetchPost = id => api.get(`/posts/${id}`);
export const createPost = postData => api.post('/posts', postData);
export const deletePost = id => api.delete(`/posts/${id}`);

export const updatePost = (id, postData) => api.put(`/posts/${id}`, postData);
export const fetchComments = postId => api.get(`/posts/${postId}/comments`);
export const createComment = (postId, commentData) => api.post(`/posts/${postId}/comments`, commentData);

// 댓글 삭제 함수 추가
export const deleteComment = async (postId, commentId, password = null) => {
  const token = localStorage.getItem("accessToken");
  const headers = token ? { Authorization: `Bearer ${token}` } : {};
  
  let url = `/posts/${postId}/comments/${commentId}`;
  if (password) {
    url += `?password=${encodeURIComponent(password)}`;
  }
  
  return await api.delete(url, { headers });
};

// 댓글 수정 함수 추가
export const updateComment = async (postId, commentId, data) => {
  const token = localStorage.getItem("accessToken");
  const headers = token ? { Authorization: `Bearer ${token}` } : {};
  
  return await api.put(`/posts/${postId}/comments/${commentId}`, data, { headers });
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


